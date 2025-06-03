import json
import os
import urllib.parse
from datetime import datetime, timezone
import random

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

# Create your views here.
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from mainApp.models import AppUser, Building, Notification, Source, Field, MaturaSubject, News, Course, Group, \
    FieldByYear, Event, Round, EmailVerification, Post
from mainApp.serializers import UserRegisterSerializer, UserSerializer, BuildingSerializer, NotificationSerializer, \
    SourceSerializer, FieldSerializer, MaturaSubjectSerializer, NewsSerializer, CourseSerializer, GroupSerializer, \
    FieldByYearSerializer, EventSerializer, RoundSerializer, EmailVerificationSerializer, VerifyCodeSerializer, \
    PostSerializer

from .utils import send_verification_email
from .calc_score.calc_score import calc_score_fun
import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response


UserModel = get_user_model()


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):

        if AppUser.objects.filter(username=request.data['username']).exists():
            return Response({"error": "Wybrana nazwa użytkownika już istnieje."}, status=status.HTTP_400_BAD_REQUEST)
        if AppUser.objects.filter(email=request.data['email']).exists():
            return Response({"error": "Istnieje już konto powiązane z tym adresem email."}, status=status.HTTP_400_BAD_REQUEST)
        if len(request.data['password']) < 8:
            return Response({"error": "Hasło powinno mieć minimum 8 znaków."}, status=status.HTTP_400_BAD_REQUEST)
        if request.data['password'] != request.data['passwordSecond']:
            return Response({"error": "Hasła nie są ze sobą zgodne."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(request.data)
            user.save()

            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = [permissions.AllowAny,]  # Allow any user to access this view

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        print(request.data)

        errors = {}

        # Ensure both fields are present
        if not email:
            return Response({"error": "Email jest wymagany.", "type": "email"}, status=status.HTTP_400_BAD_REQUEST)

        if not password:
            return Response({"error": "Hasło jest wymagane", "type": "password"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials", "type": "credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        user.is_online = True
        user.save()
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)


class UserLogout(APIView):
    def post(self, request):
        user = request.user
        user.is_online = False
        user.save()
        return Response(status=status.HTTP_200_OK)


class OneUserData(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        profile_picture = request.FILES.get('profile_picture')  # Use 'avatar' as the field name for the image
        if profile_picture:
            user.profile_picture = profile_picture  # Assuming 'avatar' is a field on your User model
            print(profile_picture)
            print(user.profile_picture)
            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'No avatar image provided'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        user = request.user
        user.email = request.data.get("email")
        user.name = request.data.get("name")
        user.username = request.data.get("username")
        user.telephone = request.data.get("phone")
        user.address = request.data.get("address")
        user.surname = request.data.get("surname")
        user.save()
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class BuildingsAllData(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        buildings = Building.objects.all()
        serializer = BuildingSerializer(buildings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BuildingAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request, building_name):
        decoded = urllib.parse.unquote(building_name.replace("_", " "))
        print(decoded)
        building = Building.objects.get(name=decoded)
        serializer = BuildingSerializer(building)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FieldsAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        fields = Field.objects.all().order_by("name").prefetch_related(
            'G1_subject',
            'G2_subject'
        )
        serializer = FieldSerializer(fields, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        courses = Course.objects.all().order_by("name")
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationsAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
        serializer = NotificationSerializer(notifications, many=True)
        num = len(notifications.filter(isRead=False))
        return Response({"notifications": serializer.data, "num": num}, status=status.HTTP_200_OK)

    def patch(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NotificationSerializer(
            notification,
            data={'isRead': True},
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()
        return Response(
            {"message": "Notification deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


class UserInviteAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        if 'query' in request.GET:
            users = AppUser.objects.filter(username=request.GET.get('query'))
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response( status=status.HTTP_200_OK)

    def post(self, request):
        print(request.data)
        group = Group.objects.get(id=request.data['group_id'])
        user = AppUser.objects.get(id=request.data['user_id'])
        Notification.objects.create(
            user=user, title=f"Zaproszenie do grupy {group.name}",
            message=f"Cześć {user.username}!\n"
                    f"Administrator zaprasza Cię do dołączenia do grupy {group.name}."
                    f"Zaproszenie będzie ważne przez następne 7 dni. Możesz potwierdzić lub "
                    f"odrzucić zaproszenie, wybierając jedną z odpowiedzi poniżej. Możesz również dołączyć ręcznie, wyszukując grupę poprzez wyszukiwarkę,"
                    f"i podając kod grupy: {group.code}.", type="GROUP INVITATION", group=group)

        return Response(status=status.HTTP_200_OK)



class SourceAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        sources_public = Source.objects.filter(availability="PUBLIC")
        user_groups = Group.objects.filter(members=request.user)
        group_members = AppUser.objects.filter(
            id__in=Group.objects.filter(
                id__in=user_groups.values_list('id', flat=True)
            ).values_list('members', flat=True)
        ).distinct()

        sources_restricted = Source.objects.filter(
            availability="RESTRICTED",
            added_by__in=group_members
        )

        sources_private = Source.objects.filter(availability="PRIVATE", added_by=request.user)

        combined_sources = (sources_public | sources_restricted | sources_private).distinct()

        print(request.query_params)
        name = request.query_params.get('name', None)
        field_id = request.query_params.get('kierunek', None)
        subject_id = request.query_params.get('przedmiot', None)
        tylko_moje = request.query_params.get('tylko_moje', None)
        zweryfikowane = request.query_params.get('zweryfikowane', None)
        ordering = request.query_params.get('ordering', '-date_added')

        if name:
            combined_sources = combined_sources.filter(title__icontains=name)
        if field_id:
            combined_sources = combined_sources.filter(field__id=field_id)
        if subject_id:
            combined_sources = combined_sources.filter(course__id=subject_id)
        if tylko_moje and tylko_moje.lower() == 'true':
            combined_sources = combined_sources.filter(added_by=request.user)
        if zweryfikowane and zweryfikowane.lower() == 'true':
            combined_sources = combined_sources.filter(verified=True)

        combined_sources = combined_sources.order_by(ordering)

        serializer = SourceSerializer(combined_sources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        print(request.data)

        if request.data['type'] == "PLIK":

            source = Source.objects.create(title=request.data['title'], description=request.data['description'], added_by=request.user,
                                           field_id=int(request.data['field']), course_id=int(request.data['subject']) if 'subject' in request.data and request.data['subject'] != '' else None,
                                           type=request.data['type'], availability=request.data['availability'], file=request.data['file'])
        else:
            source = Source.objects.create(title=request.data['title'], description=request.data['description'],
                                           added_by=request.user,
                                           field_id=int(request.data['field']),
                                           course_id=int(request.data['subject']) if 'subject' in request.data and
                                                                                     request.data[
                                                                                         'subject'] != '' else None,
                                           type=request.data['type'], availability=request.data['availability'],
                                           link=request.data['link'])

        return Response( status=status.HTTP_200_OK)


class MaturaSubjectsAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        sources = MaturaSubject.objects.all()
        serializer = MaturaSubjectSerializer(sources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EventAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        events = Event.objects.filter(user=request.user)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        events = Event.objects.filter(user=request.user)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EventAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        events = Event.objects.filter(user=request.user)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        events = Event.objects.filter(user=request.user)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)




class FieldByYearAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        toki = FieldByYear.objects.filter(students=request.user)
        serializer = FieldByYearSerializer(toki, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GroupAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        groups = Group.objects.all().order_by("-date_created")
        serializer = GroupSerializer(groups, many=True)

        user_groups = Group.objects.filter(members=request.user)
        myGroupsSerializer = GroupSerializer(user_groups, many=True)

        return Response({"allGroups": serializer.data, "myGroups": myGroupsSerializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        groups = Group.objects.all()
        userGroups = Group.objects.filter(members=request.user)

        if request.data['code'] and not request.data['isPublic']:
            group = Group.objects.create(name=request.data['name'],
                                         admin=request.user, isPublic=request.data['isPublic'],
                                         description=request.data['description'], limit=request.data['limit'],
                                         code=request.data['code'])
        else:
            group = Group.objects.create(name=request.data['name'],
                                         admin=request.user, isPublic=request.data['isPublic'],
                                         description=request.data['description'], limit=request.data['limit'])

        group.members.add(request.user)
        group.save()

        serializer = GroupSerializer(groups, many=True)
        groupSerializer = GroupSerializer(group)
        userGroupsSerializer = GroupSerializer(userGroups, many=True)
        return Response({"groups": serializer.data, "newGroup": groupSerializer.data, "userGroups": userGroupsSerializer.data }, status=status.HTTP_200_OK)

def str_to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() == 'true'
    return False


class OneGroupAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request, group_id):
        group = Group.objects.get(id=group_id)
        serializer = GroupSerializer(group)

        num = group.members.count()
        num_active = group.members.filter(is_online=True).count()

        user_serializer = UserSerializer(request.user)

        return Response({"group_data": serializer.data,
                              "user_data": user_serializer.data,
                              "user_active": num_active,
                              "member_count": num,
                              }, status=status.HTTP_200_OK)

    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)
        print(request.data)
        if "type" in request.data:

            n = Notification.objects.get(id=request.data['notification']["id"])
            if request.data['type'] == "notification":

                n.isAnswered = True
                n.save()
                if group.isPublic:
                    return Response(status=status.HTTP_200_OK)
                else:
                    group.members.add(request.user)
                    group.save()
                    return Response(status=status.HTTP_200_OK)
            elif request.data['type'] == "notification_refused":
                n.isAnswered = True
                n.save()
                return Response(status=status.HTTP_200_OK)

        if group.isPublic:
            return Response(status=status.HTTP_200_OK)
        else:
            if group.code == request.data['code']:
                group.members.add(request.user)
                group.save()
                return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

    def put(self, request, group_id):
        group = Group.objects.get(id=group_id)

        def str_to_bool(value):
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() == 'true'
            return False

        if 'rules' in request.data:
            group.rules = request.data['rules']
        if 'code' in request.data:
            group.code = request.data['code']
        if 'isPublic' in request.data:
            group.isPublic = str_to_bool(request.data['isPublic'])
        if 'limit' in request.data:
            group.limit = request.data['limit']
        if 'name' in request.data:
            group.name = request.data['name']
        if 'description' in request.data:
            group.description = request.data['description']
        if 'isArchived' in request.data:
            group.archived = str_to_bool(request.data['isArchived'])
        if 'avatar' in request.FILES:
            group.avatar = request.FILES.get('avatar')
        if 'coverImage' in request.FILES:
            group.coverImage = request.FILES.get('coverImage')

        group.save()
        return Response(status=status.HTTP_200_OK)

    def delete(self, request, group_id):
        group = Group.objects.get(id=group_id)
        print(request.data)
        if "type" in request.data:
            if request.data['type'] == 'member_delete':
                member = AppUser.objects.get(id=request.data['user_id'])
                group.members.remove(member)
                group.save()

                serializer = GroupSerializer(group)

                return Response(serializer.data, status=status.HTTP_200_OK)

        group.save()
        return Response(status=status.HTTP_200_OK)


def calculate_scores(data):
    current_year = datetime.now().year
    previous_year = current_year - 1

    # Pobierz ID przedmiotów z danych wejściowych
    subject_ids = [subject['id'] for subject in data['przedmioty']]
    results = data['wyniki']

    # Znajdź kierunki, które mają przynajmniej jeden przedmiot z G1 i G2 w wybranych przedmiotach
    fields = Field.objects.filter(
        (Q(G1_subject__id__in=subject_ids) | Q(G2_subject__id__in=subject_ids)),
        isActive=True
    ).distinct()

    final_results = []

    for field in fields:
        # Pobierz wszystkie przedmioty G1 i G2 (mogą być takie same)
        all_subjects = list(field.G1_subject.all()) + list(field.G2_subject.all())

        # Filtruj tylko przedmioty, dla których użytkownik podał wyniki
        available_subjects = [s for s in all_subjects if s.id in subject_ids]

        # Posortuj przedmioty według wyników (malejąco)
        available_subjects.sort(key=lambda x: results.get(str(x.id), 0), reverse=True)

        used_subjects = set()
        best_g1 = 0
        best_g2 = 0

        for subject in available_subjects:
            if subject.id in used_subjects:
                continue

            score = results.get(str(subject.id), 0)

            # Przypisz do G1 jeśli jeszcze nie ma wyniku
            if best_g1 == 0 and subject in field.G1_subject.all():
                best_g1 = score
                used_subjects.add(subject.id)
            # Lub przypisz do G2 jeśli jeszcze nie ma wyniku
            elif best_g2 == 0 and subject in field.G2_subject.all():
                best_g2 = score
                used_subjects.add(subject.id)

            # Przerwij jeśli mamy już oba wyniki
            if best_g1 > 0 and best_g2 > 0:
                break

        # Znajdź wynik z matematyki PD
        math_pd = next((subj for subj in data['przedmioty'] if subj['name'] == 'Matematyka' and subj['level'] == 'PD'),
                       None)
        math_score = results.get(str(math_pd['id']), 0) if math_pd else 0

        rounds = Round.objects.filter(
            field=field,
            year=f"{str(previous_year - 1)}/{str(previous_year)}"
        ).order_by('name')

        result_str = f" - {field.name} ({str(previous_year)}): "
        for i in range(len(rounds)):
            result_str += f"{rounds[i].name} - {rounds[i].min_threshold},"

        if best_g1 > 0 or best_g2 > 0:
            final_results.append({
                "field": field.name,
                "field_id": field.id,
                "field_description": field.description,
                "G1": best_g1,
                "G2": best_g2,
                "M": math_score,
                "progi": result_str
            })

    return final_results


class CalculationAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def post(self, request):

        if request.data.get('tryb') == "one":
            G1 = request.data.get('G1')
            G2 = request.data.get('G2')
            M = request.data.get('M')
            field = request.data.get('field')
            data = {"M": int(M), "G1": int(G1), "G2": int(G2), "formula": "2*M+3*G1+G2"}
            score = calc_score_fun(data)
            rounds = Round.objects.filter(field__id=field["id"])
            serializer = RoundSerializer(rounds, many=True)
            return Response({"score": score, "rounds": serializer.data}, status=status.HTTP_200_OK)
        else:
            wyn = calculate_scores(request.data)
            d = wyn.copy()
            num = 0
            for w in wyn:
                score = calc_score_fun({"M": int(w['M']), "G1": int(w['G1']), "G2": int(w['G2']), "formula": "2*M+3*G1+G2"})
                d[num]["score"] = score
                num += 1
            return Response(d,  status=status.HTTP_200_OK)


class ForumAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        # Pobierz grupy użytkownika
        my_groups = Group.objects.filter(members__id=request.user.id)
        serializer = GroupSerializer(my_groups, many=True)

        # Pobierz posty z grup użytkownika
        posts = Post.objects.filter(group__in=my_groups).order_by('-created_at')
        post_serializer = PostSerializer(posts, many=True)

        return Response({
            "groups": serializer.data,
            "posts": post_serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        group = Group.objects.get(id=request.data["group_id"])

        post = Post.objects.create(user=request.user, group=group,
                                   title=request.data["title"],
                                   content=request.data["content"])
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CalendarAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        events = Event.objects.filter(user__id=request.user.id)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        print(request.data)
        return Response( status=status.HTTP_200_OK)


class NewsAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        news= News.objects.all().order_by("-date_added")
        serializer = NewsSerializer(news, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, news_id):
        news = News.objects.get(pk=news_id)
        serializer = NewsSerializer(news)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VerificationAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:

            email = serializer.validated_data['email']
            verification_type = serializer.validated_data.get('verification_type', 'registration')

            # Remove previous unused codes for this email
            EmailVerification.objects.filter(
                email=email,
                is_verified=False,
                expires_at__lt=timezone.now()
            ).delete()

            code = '{:06d}'.format(random.randint(0, 999999))
            print(code)

            # Create new verification
            verification = EmailVerification.objects.create(
                user=request.user,
                email=email,
                verification_type=verification_type,
                verification_code=code,
            )

            print(verification.verification_code)
            # Send email
            self.send_verification_email(email, verification.verification_code)

            return Response(
                {
                    "status": "Verification code sent",
                    "email": email,
                    "expires_at": verification.expires_at
                },
                status=status.HTTP_200_OK
            )

    def send_verification_email(self, email, code):
        subject = "Twój kod weryfikacji do MiUn"
        context = {
            'code': code,
            'expiry_minutes': 15
        }

        html_message = render_to_string(
            'emails/verifiaction_email.html',
            context
        )

        try:
            # Render HTML email


            print(html_message)
            plain_message = strip_tags(html_message)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False
            )
        except Exception as e:
            # Log this error in production
            raise Exception(f"Failed to send verification email: {str(e)}")


class VerifyCodeView(APIView):
    def post(self, request):
        email = request.data['email']
        code = request.data['code']

        user = AppUser.objects.get(email=email)

        verification = EmailVerification.verify_code(email, code)

        if verification:
            user = user
            user.is_verified = True
            user.save()

            return Response(
                {'status': 'Email zweryfikowany pomyślnie'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Nieprawidłowy kod lub wygasł'},
            status=status.HTTP_400_BAD_REQUEST
        )


# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')


@api_view(['POST'])
def ask_gemini(request):
    user_prompt = request.data.get("prompt")
    results = request.data.get("results")

    print(results)

    if not user_prompt:
        return Response({"error": "No prompt provided."}, status=400)

    # Get data from DB (example: all products)
    products = Building.objects.all()
    items = []
    desc_field = []
    progi_items = []

    for result in results:
        items.append(f"-{result['field']} – {result['score']}/1000 punktów")
        desc_field.append(f"-{result['field']} – {result['field_description']}")
        progi_items.append(f"{result['progi']}")

    points_text = "\n".join(items)
    description_text = "\n".join(desc_field)
    progi_text = "\n".join(progi_items)


    full_prompt = f"""
    Na podstawie wyników maturalnych użytkownika przeliczono ile punktów uzyska on na dostępne na uczelni kierunki:
    
    {points_text}
    
    Opis kierunków:
    
    {description_text} 
    
    W zeszłym roku, progi na kierunki dla których liczono punktację wynosiły odpowiednio w każdej turze:
    {progi_text}
    
    Użytkownik opisał również swoje zainteresowania i predyspozycje:
    {user_prompt}
    
    Na podstawie wszystkich danych, uszereguj propozycje kierunków dla użytkownika w taki sposób, w jaki byś je zarekomendował, a następnie przedstaw krótko dlaczego uważasz, że odnajdzie się na pierwszym z wyznaczonych kierunków.
    Przy podawaniu decyzji weź pod uwagę, że użytkownik prawdopodobnie nie dostanie się na kierunek, jeśli nie spełnia progu punktowego z poprzednich lat (jeśli ma mniej niż 50 punktów od progu, prawdopodobnie się nie dostanie). 
    Przedstaw max. 6 propozycji kierunków i uzasadnij, czemu są twoim dalszym wyborem po pierwszym.
    Zwracaj się do użytkownika bezpośrednio, jakbyś rozmawiał z 19-latkiem/latką.
    """

    # print(full_prompt)
    try:
        response = model.generate_content(full_prompt)
        return Response({"response": response.text, "results": results})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
