import json
import urllib.parse

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model

# Create your views here.
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from mainApp.models import AppUser, Building, Notification, Source, Field, MaturaSubject, News, Course
from mainApp.serializers import UserRegisterSerializer, UserSerializer, BuildingSerializer, NotificationSerializer, \
    SourceSerializer, FieldSerializer, MaturaSubjectSerializer, NewsSerializer, CourseSerializer

from .utils import send_verification_email
from .calc_score.calc_score import calc_score_fun
import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response



UserModel = get_user_model()

class RequestVerification(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student_id = request.data.get('student_id')

        if not student_id or len(student_id) != 6 or not student_id.isdigit():
            return Response({"error": "Invalid student ID."}, status=status.HTTP_400_BAD_REQUEST)

        send_verification_email(request.user, student_id)
        return Response({"message": "Verification code sent."}, status=status.HTTP_200_OK)

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

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)


class UserLogout(APIView):
    def post(self, request):
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
        notifications = Notification.objects.filter(user=request.user)
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


class SourceAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        sources = Source.objects.all() ##########################
        serializer = SourceSerializer(sources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MaturaSubjectsAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        sources = MaturaSubject.objects.all()
        serializer = MaturaSubjectSerializer(sources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CalculationAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def post(self, request):
        G1 = request.data.get('G1')
        G2 = request.data.get('G2')
        M = request.data.get('M')
        data = {"M": int(M), "G1": int(G1), "G2": int(G2), "formula": "2*M+3*G1+G2"}
        score = calc_score_fun(data)
        print(score)
        return Response({"score": score}, status=status.HTTP_200_OK)


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



# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')


@api_view(['POST'])
def ask_gemini(request):
    user_prompt = request.data.get("prompt")

    if not user_prompt:
        return Response({"error": "No prompt provided."}, status=400)

    # Get data from DB (example: all products)
    products = Building.objects.all()
    context_data = "\n".join(
        [f"Nazwa: {p.name}, Funkcja: {p.function}, Adres: {p.address}" for p in products]
    )

    # Combine context and user prompt
    # full_prompt = f"""
    # Bazując na następujących danych opisujących budynki uczelni:
    #
    # {context_data}
    #
    # Odpowiedz na następujące pytanie użytkownika:
    # {user_prompt}
    # """

    full_prompt = f"""
    Użytkownik aplikował na trzy zupełnie różne kierunki studiów i uzyskał następujące wyniki punktowe w procesie rekrutacyjnym:

    -Informatyka stosowana – 87,5 punktów
    
    -Filologia klasyczna – 61,0 punktów
    
    -Inżynieria biomedyczna – 78,3 punktów
    
    -Automatyka i robotyka – 84,2 pkt

    -Psychologia – 76,0 pkt
    
    -Sztuki piękne – 62,3 pkt
    
    -Fizyka techniczna – 85,1 pkt
    
    -Pedagogika przedszkolna i wczesnoszkolna – 70,6 pkt
    
    -Muzykologia – 24,9 pkt
        
    Opis kierunków:
    
    -Informatyka stosowana:
    Kierunek skupia się na praktycznym wykorzystaniu narzędzi informatycznych w rozwiązywaniu rzeczywistych problemów. Obejmuje naukę programowania, algorytmiki, baz danych, systemów operacyjnych oraz nowoczesnych technologii webowych i mobilnych. Absolwenci często pracują jako programiści, analitycy danych czy specjaliści ds. IT.
    
    -Filologia klasyczna:
    Ten humanistyczny kierunek koncentruje się na językach starożytnych, takich jak łacina i greka, oraz literaturze i kulturze antycznej Grecji i Rzymu. Studenci uczą się tłumaczenia tekstów źródłowych i zgłębiają klasyczne dzieła filozoficzne i historyczne. Absolwenci znajdują zatrudnienie m.in. w edukacji, bibliotekach, wydawnictwach lub instytucjach kultury.
    
    -Inżynieria biomedyczna:
    Interdyscyplinarny kierunek łączący wiedzę z zakresu inżynierii, medycyny i biologii. Studenci uczą się projektowania nowoczesnych urządzeń medycznych, analizy sygnałów biologicznych oraz tworzenia systemów wspomagających diagnostykę i terapię. Po studiach mogą pracować w branży medtech, szpitalach, firmach farmaceutycznych lub instytutach badawczych.
    
    -Automatyka i robotyka: Tworzenie i programowanie systemów mechatronicznych.
    
    -Psychologia: Badanie ludzkiego zachowania, emocji i procesów poznawczych.
    
    -Sztuki piękne: Rozwijanie kreatywności poprzez malarstwo, rzeźbę i inne dziedziny sztuki.
    
    -Fizyka techniczna: Zastosowanie fizyki w nowoczesnych technologiach i badaniach.

    -Pedagogika: Przygotowanie do pracy z dziećmi w wieku przedszkolnym i wczesnoszkolnym.
    
    -Muzykologia: Badanie historii, teorii i kultury muzycznej.
    
    Użytkownik opisał również swoje zainteresowania i predyspozycje:
    {user_prompt}
    
    Na podstawie wszystkich danych, uszereguj propozycje kierunków dla użytkownika w taki sposób, w jaki byś je zarekomendował, a następnie przedstaw krótko dlaczego uważasz, że odnajdzie się na pierwszym z wyznaczonych kierunków.
    Przy podawaniu decyzji weź pod uwagę, że użytkownik prawdopodobnie nie dostanie się na kierunek, jeśli ma mniej niż 50 pkt. Zwracaj się do użytkownika bezpośrednio, jakbyś rozmawiał z 19-letnim kolegą.
    """

    try:
        response = model.generate_content(full_prompt)
        return Response({"response": response.text})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
