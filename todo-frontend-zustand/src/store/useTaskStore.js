import { create } from 'zustand';

const API_URL = 'http://127.0.0.1:8000/api/tasks/';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const useTaskStore = create((set, get) => ({
  tasks: [],
  filter: 'ALL',
  isModalOpen: false,
  currentTask: null,

  setFilter: (filter) => set({ filter }),
  setModalOpen: (isOpen, task = null) => set({ isModalOpen: isOpen, currentTask: task }),

  fetchTasks: async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Error al consultar la API');
      const data = await response.json();
      set({ tasks: data });
    } catch (error) {
      console.error('Error al cargar tareas desde Django:', error);
    }
  },

  addTask: async (title, status) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, status }),
      });

      if (response.ok) {
        const newTask = await response.json();
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      } else {
        console.error('Django no aceptó la tarea:', await response.text());
      }
    } catch (error) {
      console.error('Error de red al agregar tarea:', error);
    }
  },

  updateTask: async (id, title, status) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, status }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        }));
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  },

  toggleTaskStatus: async (task) => {
    const newStatus = task.status === 'Complete' ? 'Incomplete' : 'Complete';
    try {
      const response = await fetch(`${API_URL}${task.id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...task, status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? updatedTask : t)),
        }));
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  },
}));