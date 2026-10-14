const API_URL = 'http://127.0.0.1:8000/api';

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Error al iniciar sesión');
  }
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.username?.[0] || 'Error al registrarse');
  }
  return data;
};