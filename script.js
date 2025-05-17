const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const themeToggle = document.getElementById('theme-toggle');
const toast = document.getElementById('toast');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Load theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(savedTheme);

// Load tasks
window.onload = () => {
    renderTasks();
};

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Show toast
function showToast(msg) {
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
}

// Add task
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;
    const task = {
        id: Date.now(),
        title,
        desc: descInput.value,
        status: 'pending',
    };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    form.reset();
    showToast('✅ Task Created');
});

// Render tasks
function renderTasks(filter = 'all') {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';
    tasks.forEach((task) => {
        if (filter !== 'all' && task.status !== filter) return;
        const li = document.createElement('li');
        li.className = 'task';
        li.draggable = true;
        li.innerHTML = `
      <strong>${task.title}</strong><br/>
      <small>${task.desc}</small><br/>
      <button onclick="editTask(${task.id})">✏️</button>
      <button onclick="deleteTask(${task.id})">🗑️</button>
    `;
        li.addEventListener('dragstart', () => li.classList.add('dragging'));
        li.addEventListener('dragend', () => li.classList.remove('dragging'));

        if (task.status === 'pending') {
            pendingList.appendChild(li);
        } else {
            completedList.appendChild(li);
        }
    });
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    showToast('🗑️ Task Deleted');
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newTitle = prompt("Edit Title", task.title);
    const newDesc = prompt("Edit Description", task.desc);
    if (newTitle !== null) task.title = newTitle;
    if (newDesc !== null) task.desc = newDesc;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    showToast('✏️ Task Updated');
}

// Drag & drop
document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        list.appendChild(dragging);
    });

    list.addEventListener('drop', () => {
        const newStatus = list.dataset.status;
        const dragging = document.querySelector('.dragging');
        const title = dragging.querySelector('strong').innerText;
        const task = tasks.find(t => t.title === title);
        task.status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        showToast(newStatus === 'completed' ? '🔄 Task Moved to Completed' : '🔄 Task Moved to Incomplete');
    });
});

// Filter
document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        renderTasks(filter);
    });
});
