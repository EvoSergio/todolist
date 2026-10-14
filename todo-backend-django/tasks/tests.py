import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Task

@pytest.mark.django_db
class TestTodoAPI:

    def setup_method(self):
        self.client = APIClient()

    def test_register_user(self):
        response = self.client.post('/api/register/', {
            'username': 'nuevo_usuario',
            'password': 'password123'
        })
        assert response.status_code == 201
        assert User.objects.filter(username='nuevo_usuario').exists()

    def test_jwt_login_and_task_access(self):
        user = User.objects.create_user(username='taskuser', password='password123')
        
        Task.objects.create(title='Tarea de prueba', user=user, status='Incomplete')

        token_response = self.client.post('/api/token/', {
            'username': 'taskuser',
            'password': 'password123'
        })
        assert token_response.status_code == 200
        access_token = token_response.json().get('access')
        assert access_token is not None

        unauthorized_response = self.client.get('/api/tasks/')
        assert unauthorized_response.status_code == 401

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        authorized_response = self.client.get('/api/tasks/')
        
        assert authorized_response.status_code == 200
        data = authorized_response.json()
        assert len(data) == 1
        assert data[0]['title'] == 'Tarea de prueba' 