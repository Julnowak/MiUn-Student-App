from django.core.exceptions import ValidationError
from rest_framework import serializers

# from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model

from mainApp.models import Building, Notification, Source, Field, MaturaSubject, News, Course, Group, FieldByYear, \
    Event, Round, EmailVerification, Post, Comment, Attachment

UserModel = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = '__all__'

    def create(self, validated_data):
        user_obj = UserModel.objects.create_user(email=validated_data['email'],
                                                 password=validated_data['password'],
                                                 username=validated_data['username'])
        user_obj.username = validated_data['username']
        user_obj.save()
        return user_obj


class UserLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField()

    def check_user(self, validated_data):
        user = authenticate(username=validated_data['email'], password=validated_data['password'])
        if not user:
            raise ValidationError('User not found.')
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = '__all__'


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'
        depth = 1


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = '__all__'
        depth = 1


class MaturaSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaturaSubject
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        depth = 1


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'
        depth = 1


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']
        depth = 1


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(source='user', read_only=True)
    images = AttachmentSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()  # Changed to SerializerMethodField
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    userLiked = serializers.SerializerMethodField()
    userDisliked = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'group', 'title', 'author', 'content',
            'images', 'timestamp', 'comments', 'likes_count',
            'dislikes_count', 'userLiked', 'userDisliked'
        ]
        depth = 2

    def get_comments(self, obj):
        # Only include visible comments
        comments = obj.comment_set.filter(visible=True)  # Note: use comment_set instead of comments
        return CommentSerializer(comments, many=True, context=self.context).data

    def get_likes_count(self, obj):
        return obj.likes.filter(value=True).count()  # Changed to likepost_set

    def get_dislikes_count(self, obj):
        return obj.likes.filter(value=False).count()  # Changed to likepost_set

    def get_userLiked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user, value=True).count() > 0
        return False

    def get_userDisliked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user, value=False).count() > 0
        return False


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'
        depth = 2


class FieldSerializer(serializers.ModelSerializer):

    class Meta:
        model = Field
        fields = '__all__'
        depth = 2


class FieldByYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldByYear
        fields = '__all__'
        depth = 1


class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = '__all__'
        depth = 1


class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerification
        fields = ['email', 'verification_type']


class VerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)