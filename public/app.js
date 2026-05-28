const state = {
  mode: 'login',
  token: localStorage.getItem('todo-app-token') || '',
  user: JSON.parse(localStorage.getItem('todo-app-user') || 'null'),
  todos: [],
  filter: 'all',
  editingTodoId: null,
};

const elements = {
  authForm: document.getElementById('auth-form'),
  authMessage: document.getElementById('auth-message'),
  authSubmit: document.getElementById('auth-submit'),
  usernameField: document.getElementById('username-field'),
  usernameInput: document.getElementById('username'),
  emailInput: document.getElementById('email'),
  passwordInput: document.getElementById('password'),
  logoutButton: document.getElementById('logout-button'),
  welcomeTitle: document.getElementById('welcome-title'),
  welcomeSubtitle: document.getElementById('welcome-subtitle'),
  todoForm: document.getElementById('todo-form'),
  todoId: document.getElementById('todo-id'),
  todoTitle: document.getElementById('todo-title'),
  todoDescription: document.getElementById('todo-description'),
  todoPriority: document.getElementById('todo-priority'),
  todoDueDate: document.getElementById('todo-due-date'),
  todoSubmit: document.getElementById('todo-submit'),
  todoCancel: document.getElementById('todo-cancel'),
  todoMessage: document.getElementById('todo-message'),
  todoList: document.getElementById('todo-list'),
  todoEmpty: document.getElementById('todo-empty'),
  todoFilter: document.getElementById('todo-filter'),
  authTabs: Array.from(document.querySelectorAll('.tab-button')),
};

function setMessage(target, text, type = '') {
  target.textContent = text;
  target.className = `message${type ? ` ${type}` : ''}`;
}

function clearMessage(target) {
  setMessage(target, '');
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('todo-app-token', token);
  localStorage.setItem('todo-app-user', JSON.stringify(user));
}

function clearSession() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('todo-app-token');
  localStorage.removeItem('todo-app-user');
}

function setMode(mode) {
  state.mode = mode;
  elements.authTabs.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
  });

  const isRegister = mode === 'register';
  elements.usernameField.classList.toggle('hidden', !isRegister);
  elements.usernameInput.required = isRegister;
  elements.passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
  elements.authSubmit.textContent = isRegister ? 'Create account' : 'Login';
  clearMessage(elements.authMessage);
}

function updateWelcome() {
  if (state.user) {
    elements.welcomeTitle.textContent = `Welcome back, ${state.user.username}`;
    elements.welcomeSubtitle.textContent = 'Your todos are synced with the same API running behind this page.';
    elements.logoutButton.classList.remove('hidden');
  } else {
    elements.welcomeTitle.textContent = 'Sign in to view your todos';
    elements.welcomeSubtitle.textContent = 'Create an account or use your existing login to continue.';
    elements.logoutButton.classList.add('hidden');
  }
}

function resetTodoForm() {
  state.editingTodoId = null;
  elements.todoForm.reset();
  elements.todoPriority.value = 'medium';
  elements.todoId.value = '';
  elements.todoSubmit.textContent = 'Create todo';
  elements.todoCancel.classList.add('hidden');
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'No due date';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getFilteredTodos() {
  if (state.filter === 'active') {
    return state.todos.filter((todo) => !todo.completed);
  }

  if (state.filter === 'completed') {
    return state.todos.filter((todo) => todo.completed);
  }

  return state.todos;
}

function renderTodos() {
  const todos = getFilteredTodos();
  elements.todoList.innerHTML = '';

  const showEmpty = !state.token || todos.length === 0;
  elements.todoEmpty.classList.toggle('hidden', !showEmpty);

  if (!state.token) {
    elements.todoEmpty.querySelector('p').textContent = 'Log in to load your tasks, then create your first todo here.';
    return;
  }

  if (todos.length === 0) {
    elements.todoEmpty.querySelector('p').textContent = 'No todos match this filter yet. Create one or switch filters.';
    return;
  }

  todos.forEach((todo) => {
    const card = document.createElement('article');
    card.className = `todo-card${todo.completed ? ' completed' : ''}`;

    card.innerHTML = `
      <div class="todo-card-header">
        <h3>${escapeHtml(todo.title)}</h3>
        <span class="pill status">${todo.completed ? 'Completed' : 'In progress'}</span>
      </div>
      <p>${escapeHtml(todo.description || 'No description added.')}</p>
      <div class="todo-meta">
        <span class="pill priority-${todo.priority}">${capitalize(todo.priority)} priority</span>
        <span class="pill status">Due ${formatDate(todo.dueDate)}</span>
      </div>
      <div class="todo-actions">
        <button class="todo-action" data-action="toggle" data-id="${todo._id}" type="button">
          ${todo.completed ? 'Mark active' : 'Mark complete'}
        </button>
        <button class="todo-action secondary" data-action="edit" data-id="${todo._id}" type="button">Edit</button>
        <button class="todo-action secondary" data-action="delete" data-id="${todo._id}" type="button">Delete</button>
      </div>
    `;

    elements.todoList.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearMessage(elements.authMessage);

  const payload = {
    email: elements.emailInput.value.trim(),
    password: elements.passwordInput.value,
  };

  if (state.mode === 'register') {
    payload.username = elements.usernameInput.value.trim();
  }

  try {
    const endpoint = state.mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const result = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    saveSession(result.token, result.user);
    updateWelcome();
    setMessage(elements.authMessage, result.message, 'success');
    elements.authForm.reset();
    await loadTodos();
  } catch (error) {
    setMessage(elements.authMessage, error.message, 'error');
  }
}

async function loadTodos() {
  if (!state.token) {
    state.todos = [];
    renderTodos();
    return;
  }

  try {
    const query = state.filter === 'all' ? '' : `?completed=${state.filter === 'completed'}`;
    const result = await apiFetch(`/api/todos${query}`);
    state.todos = result.todos || [];
    renderTodos();
  } catch (error) {
    if (/token|unauthorized|invalid/i.test(error.message)) {
      clearSession();
      updateWelcome();
    }

    state.todos = [];
    renderTodos();
    setMessage(elements.todoMessage, error.message, 'error');
  }
}

async function handleTodoSubmit(event) {
  event.preventDefault();
  clearMessage(elements.todoMessage);

  if (!state.token) {
    setMessage(elements.todoMessage, 'Please log in before creating todos.', 'error');
    return;
  }

  const payload = {
    title: elements.todoTitle.value.trim(),
    description: elements.todoDescription.value.trim(),
    priority: elements.todoPriority.value,
  };

  if (elements.todoDueDate.value) {
    payload.dueDate = elements.todoDueDate.value;
  }

  try {
    const isEditing = Boolean(state.editingTodoId);
    const path = isEditing ? `/api/todos/${state.editingTodoId}` : '/api/todos';
    const method = isEditing ? 'PUT' : 'POST';

    const result = await apiFetch(path, {
      method,
      body: JSON.stringify(payload),
    });

    setMessage(elements.todoMessage, result.message, 'success');
    resetTodoForm();
    await loadTodos();
  } catch (error) {
    setMessage(elements.todoMessage, error.message, 'error');
  }
}

function beginEdit(todo) {
  state.editingTodoId = todo._id;
  elements.todoId.value = todo._id;
  elements.todoTitle.value = todo.title || '';
  elements.todoDescription.value = todo.description || '';
  elements.todoPriority.value = todo.priority || 'medium';
  elements.todoDueDate.value = todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 10) : '';
  elements.todoSubmit.textContent = 'Save changes';
  elements.todoCancel.classList.remove('hidden');
  clearMessage(elements.todoMessage);
  window.scrollTo({ top: elements.todoForm.offsetTop - 32, behavior: 'smooth' });
}

async function handleTodoAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  const todo = state.todos.find((item) => item._id === id);

  if (!todo) {
    return;
  }

  clearMessage(elements.todoMessage);

  try {
    if (action === 'edit') {
      beginEdit(todo);
      return;
    }

    if (action === 'toggle') {
      const result = await apiFetch(`/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !todo.completed }),
      });
      setMessage(elements.todoMessage, result.message, 'success');
    }

    if (action === 'delete') {
      const result = await apiFetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      setMessage(elements.todoMessage, result.message, 'success');
    }

    await loadTodos();
  } catch (error) {
    setMessage(elements.todoMessage, error.message, 'error');
  }
}

function handleLogout() {
  clearSession();
  resetTodoForm();
  clearMessage(elements.todoMessage);
  clearMessage(elements.authMessage);
  updateWelcome();
  renderTodos();
}

function bindEvents() {
  elements.authTabs.forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });

  elements.authForm.addEventListener('submit', handleAuthSubmit);
  elements.todoForm.addEventListener('submit', handleTodoSubmit);
  elements.todoCancel.addEventListener('click', resetTodoForm);
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.todoList.addEventListener('click', handleTodoAction);
  elements.todoFilter.addEventListener('change', async (event) => {
    state.filter = event.target.value;
    await loadTodos();
  });
}

async function initialize() {
  setMode('login');
  updateWelcome();
  bindEvents();
  renderTodos();

  if (state.token) {
    await loadTodos();
  }
}

initialize();
