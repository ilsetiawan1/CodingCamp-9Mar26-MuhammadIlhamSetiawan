// ===================================
// StorageService Class
// ===================================

class StorageService {
    constructor() {
        this.available = this.isAvailable();
        
        // Show warning if storage is unavailable
        if (!this.available) {
            this.showStorageWarning();
        }
    }
    
    /**
     * Checks if Local Storage is available
     * @returns {boolean} Availability status
     */
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
    
    /**
     * Retrieves and parses data from Local Storage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Value to return if key doesn't exist
     * @returns {*} Parsed data or defaultValue
     */
    get(key, defaultValue = null) {
        if (!this.available) {
            console.warn('Local Storage is not available');
            return defaultValue;
        }
        
        try {
            const item = localStorage.getItem(key);
            
            if (item === null) {
                return defaultValue;
            }
            
            // Try to parse as JSON, if it fails return as string
            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        } catch (error) {
            console.error(`Error reading from storage (key: ${key}):`, error);
            return defaultValue;
        }
    }
    
    /**
     * Serializes and stores data in Local Storage
     * @param {string} key - Storage key
     * @param {*} value - Data to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        if (!this.available) {
            console.warn('Local Storage is not available');
            return false;
        }
        
        try {
            // Serialize value to JSON if it's an object/array
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded. Please delete some items.');
                alert('Storage limit reached. Please delete some items to continue.');
            } else {
                console.error(`Error writing to storage (key: ${key}):`, error);
            }
            return false;
        }
    }
    
    /**
     * Removes data from Local Storage
     * @param {string} key - Storage key
     */
    remove(key) {
        if (!this.available) {
            console.warn('Local Storage is not available');
            return;
        }
        
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from storage (key: ${key}):`, error);
        }
    }
    
    /**
     * Shows warning banner when storage is unavailable
     */
    showStorageWarning() {
        const warningBanner = document.getElementById('storage-warning');
        if (warningBanner) {
            warningBanner.hidden = false;
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
        this.currentTheme = this.loadTheme();
        
        // Apply saved theme on initialization
        this.applyTheme(this.currentTheme);
        
        // Set up event listener
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggle());
        }
    }
    
    /**
     * Loads theme preference from storage
     * @returns {string} 'dark' or 'light'
     */
    loadTheme() {
        const savedTheme = this.storage.get('theme', 'dark');
        return savedTheme;
    }
    
    /**
     * Applies theme to the document
     * @param {string} theme - 'dark' or 'light'
     */
    applyTheme(theme) {
        const body = document.body;
        
        // Remove both theme classes first
        body.classList.remove('dark-theme', 'light-theme');
        
        // Add the selected theme class
        body.classList.add(`${theme}-theme`);
        
        // Update button icon if button exists
        if (this.themeToggleBtn) {
            this.updateThemeIcon(theme);
        }
        
        // Save to storage
        this.storage.set('theme', theme);
        
        this.currentTheme = theme;
    }
    
    /**
     * Updates the theme toggle button icon
     * @param {string} theme - 'dark' or 'light'
     */
    updateThemeIcon(theme) {
        const icon = this.themeToggleBtn.querySelector('i');
        
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fas fa-moon';
                this.themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
            } else {
                icon.className = 'fas fa-sun';
                this.themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    }
    
    /**
     * Toggles between light and dark themes
     */
    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    /**
     * Gets the current theme
     * @returns {string} Current theme ('dark' or 'light')
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// ===================================
// Initialize Services
// ===================================

// Create global storage service instance
const storageService = new StorageService();

// Create global theme manager instance
const themeManager = new ThemeManager(storageService);

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
        
        // Initialize name
        this.initializeName();
        
        // Start clock updates
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    
    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        
        if (this.clockElement) {
            this.clockElement.innerText = now.toLocaleTimeString();
        }
        
        if (this.dateElement) {
            this.dateElement.innerText = now.toDateString();
        }
        
        // Update greeting based on time
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
        
        this.todoInput = document.getElementById('todo-input');
        this.addTodoBtn = document.getElementById('add-todo');
        this.todoList = document.getElementById('todo-list');
        this.todoError = document.getElementById('todo-error');
        
        // Set up event listeners
        if (this.addTodoBtn) {
            this.addTodoBtn.onclick = () => this.createTask();
        }
        
        if (this.todoInput) {
            this.todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createTask();
                }
            });
        }
        
        // Initial render
        this.render();
    }
    
    /**
     * Creates new task if valid and not duplicate
     * @returns {boolean} Success status
     */
    createTask() {
        if (!this.todoInput) return false;
        
        const text = this.todoInput.value.trim();
        
        if (!text) {
            this.showError('Task cannot be empty');
            return false;
        }
        
        if (this.isDuplicate(text)) {
            this.showError('Task already exists!');
            return false;
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
        
        return true;
    }
    
    /**
     * Checks if task text already exists (case-insensitive)
     * @param {string} text - Task text to check
     * @param {string} excludeId - Task ID to exclude from check (for editing)
     * @returns {boolean} True if duplicate exists
     */
    isDuplicate(text, excludeId = null) {
        const lowerText = text.toLowerCase();
        return this.tasks.some(task => 
            task.id !== excludeId && task.text.toLowerCase() === lowerText
        );
    }
    
    /**
     * Toggles task completion status
     * @param {string} taskId - Task ID
     */
    toggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }
    
    /**
     * Updates task text
     * @param {string} taskId - Task ID
     * @returns {boolean} Success status
     */
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const newText = prompt("Edit your task:", task.text);
        
        if (newText === null || newText.trim() === "") {
            return false;
        }
        
        const trimmedText = newText.trim();
        
        if (this.isDuplicate(trimmedText, taskId)) {
            alert('A task with this text already exists!');
            return false;
        }
        
        task.text = trimmedText;
        this.saveTasks();
        this.render();
        
        return true;
    }
    
    /**
     * Deletes task
     * @param {string} taskId - Task ID
     */
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.render();
    }
    
    /**
     * Persists current tasks to storage
     */
    saveTasks() {
        this.storage.set('tasks', this.tasks);
    }
    
    /**
     * Displays error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.todoError) {
            this.todoError.textContent = message;
            setTimeout(() => this.clearError(), 3000);
        }
    }
    
    /**
     * Clears error message
     */
    clearError() {
        if (this.todoError) {
            this.todoError.textContent = '';
        }
    }
    
    /**
     * Renders task list
     */
    render() {
        if (!this.todoList) return;
        
        this.todoList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="todo-text ${task.completed ? 'done' : ''}" data-id="${task.id}">
                    ${task.text}
                </span>
                <div class="todo-btns">
                    <button data-id="${task.id}" data-action="edit" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-id="${task.id}" data-action="delete" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const textSpan = li.querySelector('.todo-text');
            textSpan.onclick = () => this.toggleComplete(task.id);
            
            const editBtn = li.querySelector('[data-action="edit"]');
            editBtn.onclick = () => this.editTask(task.id);
            
            const deleteBtn = li.querySelector('[data-action="delete"]');
            deleteBtn.onclick = () => this.deleteTask(task.id);
            
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

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const greetingComponent = new GreetingComponent(storageService);
    const focusTimer = new FocusTimerComponent();
    const taskManager = new TaskManagerComponent(storageService);
    const quickLinks = new QuickLinksComponent(storageService);
    
    console.log('Application initialized successfully');
    console.log('Current theme:', themeManager.getCurrentTheme());
    console.log('Storage available:', storageService.available);
});