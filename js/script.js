// ===================================
// StorageService Class
// ===================================
class StorageService {
    constructor() {
        this.available = this.isAvailable();
        if (!this.available) {
            this.showStorageWarning();
        }
    }
    
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        if (!this.available) return defaultValue;
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        } catch (error) {
            return defaultValue;
        }
    }
    
    set(key, value) {
        if (!this.available) return false;
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                alert('Storage limit reached!');
            }
            return false;
        }
    }
}

// ===================================
// ThemeManager Class
// ===================================
class ThemeManager {
    constructor(storage) {
        this.storage = storage;
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.currentTheme = this.storage.get('theme', 'dark');
        
        this.applyTheme(this.currentTheme);
        
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggle());
        }
    }
    
    applyTheme(theme) {
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(`${theme}-theme`);
        this.updateThemeIcon(theme);
        this.storage.set('theme', theme);
        this.currentTheme = theme;
    }
    
    updateThemeIcon(theme) {
        if (!this.themeToggleBtn) return;
        const icon = this.themeToggleBtn.querySelector('i') || this.themeToggleBtn;
        // Jika pakai ikon FontAwesome, kita update class-nya
        this.themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
}

// ===================================
// GreetingComponent Class
// ===================================
class GreetingComponent {
    constructor(storage) {
        this.storage = storage;
        this.clockElement = document.getElementById('clock');
        this.dateElement = document.getElementById('date');
        this.greetingElement = document.getElementById('greeting');
        this.nameElement = document.getElementById('display-name');
        
        this.initializeName();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    
    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        
        if (this.clockElement) this.clockElement.innerText = now.toLocaleTimeString();
        if (this.dateElement) this.dateElement.innerText = now.toDateString();
        
        let greetingText = "Good Night";
        if (hours < 12) greetingText = "Good Morning";
        else if (hours < 18) greetingText = "Good Afternoon";
        
        if (this.greetingElement && this.greetingElement.childNodes[0]) {
            this.greetingElement.childNodes[0].textContent = greetingText + ", ";
        }
    }
    
    initializeName() {
        if (this.nameElement) {
            this.nameElement.innerText = this.storage.get('userName', 'Ilham');
            this.nameElement.oninput = () => {
                this.storage.set('userName', this.nameElement.innerText);
            };
        }
    }
}

// ===================================
// FocusTimerComponent Class
// ===================================

class FocusTimerComponent {
    constructor() {
        this.timerDisplay = document.getElementById('timer');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.timerInterval = null;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        
        // Initialize display
        this.updateDisplay();
        
        // Set up event listeners
        if (this.startBtn) {
            this.startBtn.onclick = () => this.start();
        }
        if (this.stopBtn) {
            this.stopBtn.onclick = () => this.stop();
        }
        if (this.resetBtn) {
            this.resetBtn.onclick = () => this.reset();
        }
    }
    
    /**
     * Formats seconds as MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    /**
     * Updates display with current time remaining
     */
    updateDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.innerText = this.formatTime(this.timeLeft);
        }
    }
    
    /**
     * Starts or resumes countdown
     */
    start() {
        if (!this.timerInterval) {
            this.timerInterval = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                    this.updateDisplay();
                } else {
                    this.stop();
                    this.notifyComplete();
                }
            }, 1000);
        }
    }
    
    /**
     * Pauses countdown
     */
    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    /**
     * Resets timer to 25 minutes
     */
    reset() {
        this.stop();
        this.timeLeft = 25 * 60;
        this.updateDisplay();
    }
    
    /**
     * Triggers notification when timer completes
     */
    notifyComplete() {
        alert('Focus session complete! Time for a break.');
    }
}

// ===================================
// TaskManagerComponent Class
// ===================================
class TaskManagerComponent {
    constructor(storage) {
        this.storage = storage;
        this.tasks = this.storage.get('tasks', []);
        
        // Element Selectors
        this.todoInput = document.getElementById('todo-input');
        this.addTodoBtn = document.getElementById('add-todo');
        this.todoList = document.getElementById('todo-list');
        this.todoError = document.getElementById('todo-error'); // Pastikan ID ini ada di HTML
        
        // Event Listeners
        if (this.addTodoBtn) {
            this.addTodoBtn.onclick = () => this.createTask();
        }
        
        if (this.todoInput) {
            this.todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.createTask();
            });
        }
        
        this.render();
    }
    
    createTask() {
        if (!this.todoInput) return;
        
        const text = this.todoInput.value.trim();
        
        // 1. Validasi Kosong
        if (!text) {
            this.showError('Task cannot be empty');
            return;
        }
        
        // 2. Validasi Duplikat (Challenge)
        if (this.isDuplicate(text)) {
            this.showError('Task already exists!');
            return; // Berhenti di sini, jangan lanjut push data
        }
        
        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: Date.now()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.todoInput.value = '';
        this.clearError();
        this.render();
    }
    
    isDuplicate(text, excludeId = null) {
        const lowerText = text.toLowerCase();
        return this.tasks.some(task => 
            task.id !== excludeId && task.text.toLowerCase() === lowerText
        );
    }
    
    toggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newText = prompt("Edit your task:", task.text);
        if (newText === null) return;
        
        const trimmedText = newText.trim();
        if (!trimmedText) return;

        if (this.isDuplicate(trimmedText, taskId)) {
            alert('A task with this text already exists!');
            return;
        }
        
        task.text = trimmedText;
        this.saveTasks();
        this.render();
    }
    
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.render();
    }
    
    saveTasks() {
        this.storage.set('tasks', this.tasks);
    }
    
    showError(message) {
        if (this.todoError) {
            this.todoError.textContent = message;
            // Hilangkan pesan error otomatis setelah 3 detik
            setTimeout(() => this.clearError(), 3000);
        } else {
            // Fallback jika elemen HTML lupa dibuat
            alert(message);
        }
    }
    
    clearError() {
        if (this.todoError) this.todoError.textContent = '';
    }
    
    render() {
        if (!this.todoList) return;
        this.todoList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="todo-text ${task.completed ? 'done' : ''}">
                    ${task.text}
                </span>
                <div class="todo-btns">
                    <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // Klik teks untuk toggle done
            li.querySelector('.todo-text').onclick = () => this.toggleComplete(task.id);
            // Tombol edit
            li.querySelector('.edit-btn').onclick = () => this.editTask(task.id);
            // Tombol hapus
            li.querySelector('.delete-btn').onclick = () => this.deleteTask(task.id);
            
            this.todoList.appendChild(li);
        });
    }
}

// ===================================
// QuickLinksComponent Class
// ===================================

class QuickLinksComponent {
    constructor(storage) {
        this.storage = storage;
        this.links = this.storage.get('links', [{ name: 'Google', url: 'https://google.com' }]);
        
        this.linkNameInput = document.getElementById('link-name');
        this.linkUrlInput = document.getElementById('link-url');
        this.addLinkBtn = document.getElementById('add-link');
        this.linksContainer = document.getElementById('links-container');
        this.linkError = document.getElementById('link-error');
        
        // Set up event listeners
        if (this.addLinkBtn) {
            this.addLinkBtn.onclick = () => this.createLink();
        }
        
        // Initial render
        this.render();
    }
    
    /**
     * Creates new link
     * @returns {boolean} Success status
     */
    createLink() {
        if (!this.linkNameInput || !this.linkUrlInput) return false;
        
        const name = this.linkNameInput.value.trim();
        let url = this.linkUrlInput.value.trim();
        
        if (!name || !url) {
            this.showError('Both name and URL are required');
            return false;
        }
        
        // Normalize URL
        url = this.normalizeUrl(url);
        
        const link = {
            id: Date.now().toString(),
            name: name,
            url: url,
            createdAt: Date.now()
        };
        
        this.links.push(link);
        this.saveLinks();
        
        this.linkNameInput.value = '';
        this.linkUrlInput.value = '';
        this.clearError();
        this.render();
        
        return true;
    }
    
    /**
     * Validates and normalizes URL
     * @param {string} url - URL to validate
     * @returns {string} Normalized URL with protocol
     */
    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }
    
    /**
     * Deletes link
     * @param {string} linkId - Link ID
     */
    deleteLink(linkId) {
        this.links = this.links.filter(l => l.id !== linkId);
        this.saveLinks();
        this.render();
    }
    
    /**
     * Opens link in new tab
     * @param {string} url - URL to open
     */
    openLink(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    
    /**
     * Persists current links to storage
     */
    saveLinks() {
        this.storage.set('links', this.links);
    }
    
    /**
     * Displays error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.linkError) {
            this.linkError.textContent = message;
            setTimeout(() => this.clearError(), 3000);
        }
    }
    
    /**
     * Clears error message
     */
    clearError() {
        if (this.linkError) {
            this.linkError.textContent = '';
        }
    }
    
    /**
     * Renders links list
     */
    render() {
        if (!this.linksContainer) return;
        
        this.linksContainer.innerHTML = '';
        
        this.links.forEach(link => {
            const wrapper = document.createElement('div');
            wrapper.className = 'link-wrapper';
            
            wrapper.innerHTML = `
                <a href="${link.url}" class="quick-link" target="_blank" rel="noopener noreferrer">
                    ${link.name}
                </a>
                <button class="delete-link-btn" data-id="${link.id}" aria-label="Delete link">
                    &times;
                </button>
            `;
            
            // Add event listener for delete button
            const deleteBtn = wrapper.querySelector('.delete-link-btn');
            deleteBtn.onclick = () => this.deleteLink(link.id);
            
            this.linksContainer.appendChild(wrapper);
        });
    }
}

// ===================================
// Application Initialization
// ===================================

const storageService = new StorageService();

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi ThemeManager di sini agar selector button aman
    const themeManager = new ThemeManager(storageService);
    
    const greetingComponent = new GreetingComponent(storageService);
    const focusTimer = new FocusTimerComponent();
    const taskManager = new TaskManagerComponent(storageService);
    const quickLinks = new QuickLinksComponent(storageService);
    
    console.log('Dashboard Initialized with New HTML Structure');
});