import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdDelete, MdEdit, MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api/tasks/';

// Peticiones HTTP
const fetchTasks = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
};

const addTaskApi = async (newTask) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask),
  });
  return res.json();
};

const updateTaskApi = async ({ id, ...taskData }) => {
  const res = await fetch(`${API_URL}${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  return res.json();
};

const deleteTaskApi = async (id) => {
  await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
};

function App() {
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Incomplete');

  // Query para obtener las tareas
  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  // Mutaciones para modificar datos e invalidar la cache
  const addMutation = useMutation({
    mutationFn: addTaskApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarea agregada con éxito');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTaskApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarea actualizada con éxito');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarea eliminada');
    },
  });

  const openModal = (task = null) => {
    if (task) {
      setCurrentTask(task);
      setTitle(task.title);
      setStatus(task.status);
    } else {
      setCurrentTask(null);
      setTitle('');
      setStatus('Incomplete');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Por favor ingresa un título');
      return;
    }

    if (currentTask) {
      updateMutation.mutate({ id: currentTask.id, title, status });
    } else {
      addMutation.mutate({ title, status });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (task) => {
    const newStatus = task.status === 'Complete' ? 'Incomplete' : 'Complete';
    updateMutation.mutate({ id: task.id, title: task.title, status: newStatus });
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'COMPLETE') return t.status === 'Complete';
    if (filter === 'INCOMPLETE') return t.status === 'Incomplete';
    return true;
  });

  if (isLoading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando tareas...</p>;
  if (isError) return <p style={{ textAlign: 'center', color: 'red' }}>Error al conectar con el servidor.</p>;

  return (
    <div className="app-container">
      <Toaster position="bottom-right" />
      <h1 className="title">TODO LIST (TanStack Query)</h1>

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
                    <span>{task.created_at ? new Date(task.created_at).toLocaleString() : ''}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="icon-btn" onClick={() => deleteMutation.mutate(task.id)}>
                    <MdDelete size={18} />
                  </button>
                  <button className="icon-btn" onClick={() => openModal(task)}>
                    <MdEdit size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#a0a0a0' }}>No hay tareas guardadas</p>
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
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
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

export default App;