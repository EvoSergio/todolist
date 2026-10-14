import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import './Login.css'; // Importa el archivo CSS que acabamos de crear

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login, signup } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    if (isRegistering) {
      const result = await signup(username, password);
      if (result.success) {
        toast.success('¡Cuenta creada con éxito! Ahora inicia sesión.');
        setIsRegistering(false);
        setPassword('');
      } else {
        setErrorMessage(result.message);
      }
    } else {
      const result = await login(username, password);
      if (!result.success) {
        setErrorMessage(result.message);
      }
    }
  };

  return (
    <div className="login-screen-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <h2 className="login-title">
          {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label">Usuario</label>
            <input 
              type="text" 
              className="login-input"
              placeholder="Ingresa tu usuario" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Contraseña</label>
            <input 
              type="password" 
              className="login-input"
              placeholder="Ingresa tu contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {errorMessage && (
            <p className="login-error-message">
              {errorMessage}
            </p>
          )}

          <button type="submit" className="login-btn-submit">
            {isRegistering ? 'Registrarse' : 'Ingresar'}
          </button>
            
          <div className="login-footer">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            {' '}
            <button 
              type="button" 
              className="login-link"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage('');
              }}
            >
              {isRegistering ? 'Inicia sesión aquí' : 'Regístrate aquí'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}