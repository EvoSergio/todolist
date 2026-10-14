import { useState, useEffect } from 'react';
import { MdDelete, MdEdit, MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';
import Auth from './components/Auth';

const API_URL = 'http://127.0.0.1:8000/api/tasks/';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Incomplete');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    const currentToken = localStorage.getItem('token');
    try {
      const res = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      if (!res.ok) throw new Error('No autorizado');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error('Error al cargar las tareas');
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setCurrentTask(task);
      setTitle(task.title || '');
      setStatus(task.status || 'Incomplete');
    } else {
      setCurrentTask(null);
      setTitle('');
      setStatus('Incomplete');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Por favor ingresa un título');
      return;
    }

    const currentToken = localStorage.getItem('token');
    try {
      if (currentTask) {
        // Actualizar tarea existente
        const res = await fetch(`${API_URL}${currentTask.id}/`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          body: JSON.stringify({ title, status }),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setTasks(tasks.map((t) => (t.id === currentTask.id ? updated : t)));
        toast.success('Tarea actualizada');
      } else {
        // Crear nueva tarea
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          body: JSON.stringify({ title, status }),
        });
        if (!res.ok) throw new Error();
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        toast.success('Tarea agregada');
      }
      setIsModalOpen(false);
      setTitle('');
      setStatus('Incomplete');
    } catch (error) {
      toast.error('Error al guardar la tarea');
    }
  };

  const handleDelete = async (id) => {
    const currentToken = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}${id}/`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      if (!res.ok) throw new Error();
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success('Tarea eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const toggleStatus = async (task) => {
    const currentToken = localStorage.getItem('token');
    const newStatus = task.status === 'Complete' ? 'Incomplete' : 'Complete';
    try {
      const res = await fetch(`${API_URL}${task.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ 
          title: task.title, 
          status: newStatus 
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'COMPLETE') return t.status === 'Complete';
    if (filter === 'INCOMPLETE') return t.status === 'Incomplete';
    return true;
  });

  if (!token) {
    return <Auth onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  return (
    <div className="app-container">
      <Toaster position="bottom-right" />
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="title">TODO LIST</h1>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </header>

      <div className="header-actions">
        <button className="btn-primary" onClick={() => openModal()}>
          Add Task
        </button>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">ALL</option>
          <option value="INCOMPLETE">Incomplete</option>
          <option value="COMPLETE">Complete</option>
        </select>
      </div>

      <div className="task-list">
        <AnimatePresence>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="task-item"
              >
                <div className="task-details">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={task.status === 'Complete'}
                    onChange={() => toggleStatus(task)}
                  />
                  <div className="task-text">
                    <p className={task.status === 'Complete' ? 'completed' : ''}>
                      {task.title}
                    </p>
                    <span>
                      {task.created_at
                        ? new Date(task.created_at).toLocaleString()
                        : ''}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="icon-btn" onClick={() => handleDelete(task.id)}>
                    <MdDelete size={18} />
                  </button>
                  <button className="icon-btn" onClick={() => openModal(task)}>
                    <MdEdit size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#a0a0a0' }}>
              No hay tareas guardadas
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-content"
            >
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <MdClose size={20} />
              </button>
              <h2>{currentTask ? 'Update Task' : 'Add Task'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Incomplete">Incomplete</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    {currentTask ? 'Update Task' : 'Add Task'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}