import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MdDelete, MdEdit, MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  setFilter,
} from './store';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.items);
  const filter = useSelector((state) => state.tasks.filter);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Incomplete');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

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
      dispatch(updateTask({ id: currentTask.id, title, status }));
      toast.success('Tarea actualizada con éxito');
    } else {
      dispatch(addTask({ title, status }));
      toast.success('Tarea agregada con éxito');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    dispatch(deleteTask(id));
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
      <h1 className="title">TODO LIST (Redux Toolkit)</h1>

      <div className="header-actions">
        <button className="btn-primary" onClick={() => openModal()}>
          Add Task
        </button>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => dispatch(setFilter(e.target.value))}
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
                    onChange={() => dispatch(toggleTaskStatus(task))}
                  />
                  <div className="task-text">
                    <p className={task.status === 'Complete' ? 'completed' : ''}>
                      {task.title}
                    </p>
                    <span>{task.created_at ? new Date(task.created_at).toLocaleString() : ''}</span>
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