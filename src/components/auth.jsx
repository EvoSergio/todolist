import { useState } from 'react';
import { loginUser, registerUser } from '../services/auth';
import toast from 'react-hot-toast';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Petición de Login
        const data = await loginUser({
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem('token', data.access);
        toast.success('¡Bienvenido de nuevo!');
        onLoginSuccess(data.access);
      } else {
        // Petición de Registro
        await registerUser(formData);
        toast.success('¡Cuenta creada exitosamente! Ahora inicia sesión.');
        setIsLogin(true); // Cambiar a la pestaña de login
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Correo Electrónico (Opcional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}