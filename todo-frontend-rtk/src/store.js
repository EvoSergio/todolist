import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:8000/api/tasks/';

// Thunks Asíncronos
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetch(API_URL);
  return await response.json();
});

export const addTask = createAsyncThunk('tasks/addTask', async ({ title, status }) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, status }),
  });
  return await response.json();
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, title, status }) => {
  const response = await fetch(`${API_URL}${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, status }),
  });
  return await response.json();
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id) => {
  await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
  return id;
});

export const toggleTaskStatus = createAsyncThunk('tasks/toggleTaskStatus', async (task) => {
  const newStatus = task.status === 'Complete' ? 'Incomplete' : 'Complete';
  const response = await fetch(`${API_URL}${task.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...task, status: newStatus }),
  });
  return await response.json();
});

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    filter: 'ALL',
    status: 'idle',
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export const { setFilter } = taskSlice.actions;

export const store = configureStore({
  reducer: {
    tasks: taskSlice.reducer,
  },
});