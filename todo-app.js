// To-Do List App - Local Storage Functionality
class TodoApp {
    constructor() {
        this.todos = this.loadFromLocalStorage();
        this.taskInput = document.getElementById('taskInput');
        this.addTaskButton = document.getElementById('addTaskButton');
        this.taskList = document.getElementById('taskList');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';

        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        this.addTaskButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.render();
            });
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (text === '') {
            alert('Please enter a task');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleDateString()
        };

        this.todos.push(todo);
        this.saveToLocalStorage();
        this.taskInput.value = '';
        this.taskInput.focus();
        this.render();
    }

    deleteTask(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToLocalStorage();
        this.render();
    }

    toggleTask(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    editTask(id, newText) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveToLocalStorage();
            this.render();
        }
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveToLocalStorage();
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }

    render() {
        this.taskList.innerHTML = '';
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = this.currentFilter === 'all' 
                ? 'No tasks yet. Add one to get started!' 
                : `No ${this.currentFilter} tasks.`;
            this.taskList.appendChild(emptyMsg);
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `task-item ${todo.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => this.toggleTask(todo.id));

            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = todo.text;
            taskText.addEventListener('dblclick', () => this.handleEdit(todo.id, taskText));

            const dateSpan = document.createElement('span');
            dateSpan.className = 'task-date';
            dateSpan.textContent = `${todo.createdAt}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '✕';
            deleteBtn.addEventListener('click', () => this.deleteTask(todo.id));

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(dateSpan);
            li.appendChild(deleteBtn);

            this.taskList.appendChild(li);
        });

        document.getElementById('taskCount').textContent = this.todos.length;
        document.getElementById('completedCount').textContent = this.todos.filter(t => t.completed).length;
    }

    handleEdit(id, element) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const currentText = todo.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';

        element.replaceWith(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newText = input.value;
            this.editTask(id, newText);
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    exportToJSON() {
        const dataStr = JSON.stringify(this.todos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});