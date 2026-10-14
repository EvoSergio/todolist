from django.contrib.auth.models import User
from rest_framework import viewsets, generics, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated] # Exige que la petición lleve un token JWT válido

    def get_queryset(self):
        # Retorna únicamente las tareas del usuario que ha iniciado sesión
        return Task.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario logueado al crear la tarea
        serializer.save(user=self.request.user)



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    