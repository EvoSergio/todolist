import { useEffect, useState } from 'react';
import { MdDelete, MdEdit, MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useTaskStore } from './store/useTaskStore';
import { useAuthStore } from './store/authStore';
import Login from "./components/Login";
import './App.css';

function App() {
  const { isAuthenticated, logout } = useAuthStore();
  
  const {
    tasks,
    filter,
    isModalOpen,
    currentTask,
    setFilter,
    setModalOpen,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useTaskStore();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Incomplete');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, fetchTasks]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const openModal = (task = null) => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
    } else {
      setTitle('');
      setStatus('Incomplete');
    }
    setModalOpen(true, task);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Por favor ingresa un título');
      return;
    }

    if (currentTask) {
      await updateTask(currentTask.id, title, status);
      toast.success('Tarea actualizada con éxito');
    } else {
      await addTask(title, status);
      toast.success('Tarea agregada con éxito');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    toast.success('Tarea eliminada');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'COMPLETE') return t.status === 'Complete';
    if (filter === 'INCOMPLETE') return t.status === 'Incomplete';
    return true;
  });

  return (
    <div className="app-container">
      <Toaster position="bottom-right" />
      
      {/* Barra superior con Cerrar Sesión */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="title" style={{ margin: 0 }}>TODO LIST (Zustand)</h1>
        <button 
          onClick={logout} 
          style={{ padding: '8px 14px', background: '#d73a49', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </div>

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
                    onChange={() => toggleTaskStatus(task)}
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-content"
            >
              <button className="close-btn" onClick={() => setModalOpen(false)}>
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
                    onClick={() => setModalOpen(false)}
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

export default App;