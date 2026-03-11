# Technical Design Document

## Overview

The To-Do List Life Dashboard is a single-page web application built with vanilla JavaScript, HTML5, and CSS3. The application runs entirely in the browser with no backend dependencies, using the browser's Local Storage API for data persistence. The architecture follows a component-based pattern where each major feature (greeting, timer, tasks, links, theme) is encapsulated in its own module with clear responsibilities.

The application provides five core features:
1. Time-aware greeting display with customizable user name
2. 25-minute Pomodoro focus timer
3. Task management with CRUD operations and duplicate prevention
4. Quick links management for favorite websites
5. Light/dark theme switching with cyberpunk yellow accent

All data operations are synchronous and local, ensuring instant responsiveness and complete privacy. The design prioritizes simplicity, maintainability, and accessibility through semantic HTML5 structure and ARIA labels.

## Architecture

### System Architecture

The application follows a modular component architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│                  (Semantic HTML5)                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      app.js                             │
│              (Application Coordinator)                  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Greeting   │  │  FocusTimer  │  │ TaskManager  │
│  Component   │  │  Component   │  │  Component   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ QuickLinks   │  │    Theme     │  │   Storage    │
│  Component   │  │   Manager    │  │   Service    │
└──────────────┘  └──────────────┘  └──────────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │  Local Storage   │
                                  │   (Browser API)  │
                                  └──────────────────┘
```

### Component Responsibilities

**StorageService**: Centralized abstraction over Local Storage API
- Provides get/set/remove operations with error handling
- Handles JSON serialization/deserialization
- Manages quota exceeded errors
- Validates storage availability

**GreetingComponent**: Manages time display and personalized greeting
- Updates time display every minute
- Determines time period (morning/afternoon/evening)
- Handles custom name editing and persistence
- Formats date and time for display

**FocusTimerComponent**: Implements 25-minute Pomodoro timer
- Manages countdown state (running/paused/stopped)
- Updates display every second when active
- Provides start/stop/reset controls
- Triggers notification when timer completes

**TaskManagerComponent**: Handles all task operations
- Creates, reads, updates, deletes tasks
- Validates against duplicate tasks (case-insensitive)
- Manages task completion status
- Persists all changes to storage immediately

**QuickLinksComponent**: Manages favorite website links
- Creates and deletes links
- Validates and normalizes URLs
- Opens links in new tabs
- Persists all changes to storage immediately

**ThemeManager**: Controls light/dark mode switching
- Applies theme CSS classes to document
- Persists theme preference
- Provides toggle functionality
- Ensures color contrast requirements

### Data Flow

1. **Initialization**: App loads → StorageService retrieves data → Components render initial state
2. **User Action**: User interacts → Component handles event → Component updates state → Component persists to storage → Component updates UI
3. **Time Updates**: setInterval triggers → GreetingComponent updates time → Timer updates countdown (if running)

All data flows are synchronous and unidirectional, making the application predictable and easy to debug.

## Components and Interfaces

### StorageService

Provides centralized storage operations with error handling.

```javascript
class StorageService {
  /**
   * Retrieves and parses data from Local Storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Value to return if key doesn't exist
   * @returns {*} Parsed data or defaultValue
   */
  get(key, defaultValue)

  /**
   * Serializes and stores data in Local Storage
   * @param {string} key - Storage key
   * @param {*} value - Data to store
   * @returns {boolean} Success status
   */
  set(key, value)

  /**
   * Removes data from Local Storage
   * @param {string} key - Storage key
   */
  remove(key)

  /**
   * Checks if Local Storage is available
   * @returns {boolean} Availability status
   */
  isAvailable()
}
```

**Storage Keys**:
- `userName`: String - Custom user name for greeting
- `tasks`: Array<Task> - All tasks
- `quickLinks`: Array<Link> - All quick links
- `theme`: String - "light" or "dark"

### GreetingComponent

Manages time display and personalized greeting.

```javascript
class GreetingComponent {
  /**
   * Initializes component and starts time updates
   * @param {HTMLElement} container - DOM element to render into
   * @param {StorageService} storage - Storage service instance
   */
  constructor(container, storage)

  /**
   * Renders greeting with current time and date
   */
  render()

  /**
   * Updates time display (called every minute)
   */
  updateTime()

  /**
   * Determines greeting based on current hour
   * @returns {string} "Good Morning", "Good Afternoon", or "Good Evening"
   */
  getGreeting()

  /**
   * Enables inline editing of user name
   */
  enableNameEdit()

  /**
   * Saves edited name to storage
   * @param {string} name - New user name
   */
  saveName(name)
}
```

### FocusTimerComponent

Implements 25-minute Pomodoro timer.

```javascript
class FocusTimerComponent {
  /**
   * Initializes timer with 25 minutes (1500 seconds)
   * @param {HTMLElement} container - DOM element to render into
   */
  constructor(container)

  /**
   * Renders timer display and controls
   */
  render()

  /**
   * Starts or resumes countdown
   */
  start()

  /**
   * Pauses countdown
   */
  stop()

  /**
   * Resets timer to 25 minutes
   */
  reset()

  /**
   * Updates display with current time remaining
   */
  updateDisplay()

  /**
   * Formats seconds as MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds)

  /**
   * Triggers notification when timer completes
   */
  notifyComplete()
}
```

### TaskManagerComponent

Handles all task CRUD operations.

```javascript
class TaskManagerComponent {
  /**
   * Initializes task manager and loads tasks
   * @param {HTMLElement} container - DOM element to render into
   * @param {StorageService} storage - Storage service instance
   */
  constructor(container, storage)

  /**
   * Renders task list and input form
   */
  render()

  /**
   * Creates new task if valid and not duplicate
   * @param {string} text - Task text
   * @returns {boolean} Success status
   */
  createTask(text)

  /**
   * Checks if task text already exists (case-insensitive)
   * @param {string} text - Task text to check
   * @param {string} excludeId - Task ID to exclude from check (for editing)
   * @returns {boolean} True if duplicate exists
   */
  isDuplicate(text, excludeId)

  /**
   * Toggles task completion status
   * @param {string} taskId - Task ID
   */
  toggleComplete(taskId)

  /**
   * Updates task text
   * @param {string} taskId - Task ID
   * @param {string} newText - New task text
   * @returns {boolean} Success status
   */
  editTask(taskId, newText)

  /**
   * Deletes task
   * @param {string} taskId - Task ID
   */
  deleteTask(taskId)

  /**
   * Persists current tasks to storage
   */
  saveTasks()

  /**
   * Displays error message to user
   * @param {string} message - Error message
   */
  showError(message)
}
```

### QuickLinksComponent

Manages favorite website links.

```javascript
class QuickLinksComponent {
  /**
   * Initializes quick links manager and loads links
   * @param {HTMLElement} container - DOM element to render into
   * @param {StorageService} storage - Storage service instance
   */
  constructor(container, storage)

  /**
   * Renders links list and input form
   */
  render()

  /**
   * Creates new link
   * @param {string} name - Display name
   * @param {string} url - Website URL
   * @returns {boolean} Success status
   */
  createLink(name, url)

  /**
   * Validates and normalizes URL
   * @param {string} url - URL to validate
   * @returns {string} Normalized URL with protocol
   */
  normalizeUrl(url)

  /**
   * Deletes link
   * @param {string} linkId - Link ID
   */
  deleteLink(linkId)

  /**
   * Opens link in new tab
   * @param {string} url - URL to open
   */
  openLink(url)

  /**
   * Persists current links to storage
   */
  saveLinks()
}
```

### ThemeManager

Controls theme switching and persistence.

```javascript
class ThemeManager {
  /**
   * Initializes theme manager and applies saved theme
   * @param {StorageService} storage - Storage service instance
   */
  constructor(storage)

  /**
   * Applies theme to document
   * @param {string} theme - "light" or "dark"
   */
  applyTheme(theme)

  /**
   * Toggles between light and dark themes
   */
  toggle()

  /**
   * Gets current theme
   * @returns {string} Current theme ("light" or "dark")
   */
  getCurrentTheme()
}
```

## Data Models

### Task

Represents a to-do item with text and completion status.

```javascript
{
  id: string,          // Unique identifier (timestamp-based)
  text: string,        // Task description (trimmed, non-empty)
  completed: boolean,  // Completion status
  createdAt: number    // Creation timestamp (milliseconds)
}
```

**Validation Rules**:
- `text` must be non-empty after trimming
- `text` must be unique (case-insensitive comparison)
- `id` must be unique within the tasks array
- `completed` defaults to false for new tasks

### Link

Represents a quick access website link.

```javascript
{
  id: string,     // Unique identifier (timestamp-based)
  name: string,   // Display name (non-empty)
  url: string,    // Website URL (normalized with protocol)
  createdAt: number  // Creation timestamp (milliseconds)
}
```

**Validation Rules**:
- `name` must be non-empty after trimming
- `url` must be non-empty after trimming
- `url` must include protocol (http:// or https://)
- If protocol is missing, prepend "https://"
- `id` must be unique within the links array

### Theme Preference

Represents user's theme choice.

```javascript
{
  theme: "light" | "dark"  // Current theme selection
}
```

**Default**: "dark"

### User Name

Represents custom user name for greeting.

```javascript
{
  userName: string  // Custom name (defaults to "User")
}
```

**Default**: "User"


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

- Requirements 2.1, 2.2, 2.3 all test greeting logic and can be combined into one comprehensive property
- Requirements 3.3 and 3.4 both test name persistence and form a round-trip property
- Requirements 5.2 and 5.3 both test task creation and can be combined
- Requirements 6.1, 6.3, and 6.4 all test duplicate prevention and can be combined
- Requirements 7.2 and 7.4 both test completion toggling and form a round-trip property
- Requirements 8.3 and 8.4 test editing with duplicate validation, can be combined
- Requirements 10.1 and 10.4 both test task persistence and form a round-trip property
- Requirements 11.2 and 11.3 both test link creation and can be combined
- Requirements 11.6 and 13.1 test link deletion and persistence
- Requirements 12.3 and 12.4 both test URL normalization and can be combined
- Requirements 13.1 and 13.4 both test link persistence and form a round-trip property
- Requirements 14.4 and 14.5 both test theme persistence and form a round-trip property

### Property 1: Time Format Validation

*For any* Date object, formatting the time should produce a string in HH:MM format (two digits for hours, colon separator, two digits for minutes).

**Validates: Requirements 1.1**

### Property 2: Date Format Consistency

*For any* Date object, formatting the date should produce a consistent, readable string format.

**Validates: Requirements 1.2**

### Property 3: Greeting Time Period Mapping

*For any* hour of the day (0-23), the greeting function should return "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-17, and "Good Evening" for hours 18-4.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 4: User Name Persistence Round-Trip

*For any* non-empty string, saving it as the user name and then retrieving it from storage should return the same string.

**Validates: Requirements 3.3, 3.4**

### Property 5: Timer Format Validation

*For any* non-negative integer representing seconds, formatting it as MM:SS should produce a string with two digits for minutes, colon separator, and two digits for seconds.

**Validates: Requirements 4.2**

### Property 6: Timer Pause Preserves State

*For any* timer state with remaining time greater than zero, pausing the timer should preserve the exact remaining time value.

**Validates: Requirements 4.4**

### Property 7: Task Creation with Valid Input

*For any* non-empty, non-whitespace string that is not a duplicate, creating a task should result in a new task object with completed status set to false and the task appearing in storage.

**Validates: Requirements 5.2, 5.3**

### Property 8: Empty Task Rejection

*For any* string composed entirely of whitespace characters (including empty string), attempting to create a task should be rejected and no task should be created.

**Validates: Requirements 5.5**

### Property 9: Case-Insensitive Duplicate Prevention

*For any* existing task text and any string that matches it case-insensitively (after trimming whitespace), attempting to create a new task with that string should be rejected.

**Validates: Requirements 6.1, 6.3, 6.4**

### Property 10: Task Completion Toggle Round-Trip

*For any* task, toggling its completion status twice should return it to its original completion state.

**Validates: Requirements 7.2, 7.4**

### Property 11: Task Edit Persistence

*For any* existing task and any valid new text (non-empty, non-duplicate), editing the task text and then retrieving it from storage should reflect the new text.

**Validates: Requirements 8.3**

### Property 12: Task Edit Duplicate Validation

*For any* existing task being edited, if the new text matches another existing task case-insensitively (after trimming), the edit should be rejected and the original text should remain unchanged.

**Validates: Requirements 8.4, 8.5**

### Property 13: Task Deletion Removes from Storage

*For any* existing task, deleting it should result in that task no longer appearing in the tasks array retrieved from storage.

**Validates: Requirements 9.2**

### Property 14: Task Persistence Round-Trip

*For any* array of task objects, serializing to JSON, storing in Local Storage, then retrieving and deserializing should produce an equivalent array of tasks with all properties preserved.

**Validates: Requirements 10.1, 10.4**

### Property 15: Link Creation with Valid Input

*For any* non-empty name string and non-empty URL string, creating a link should result in a new link object appearing in storage with both properties preserved.

**Validates: Requirements 11.2, 11.3**

### Property 16: Link Deletion Removes from Storage

*For any* existing link, deleting it should result in that link no longer appearing in the links array retrieved from storage.

**Validates: Requirements 11.6**

### Property 17: URL Normalization Adds Protocol

*For any* URL string without a protocol prefix (http:// or https://), normalizing the URL should prepend "https://" to the string.

**Validates: Requirements 12.3, 12.4**

### Property 18: Link Persistence Round-Trip

*For any* array of link objects, serializing to JSON, storing in Local Storage, then retrieving and deserializing should produce an equivalent array of links with all properties preserved.

**Validates: Requirements 13.1, 13.4**

### Property 19: Theme Toggle Round-Trip

*For any* theme state ("light" or "dark"), toggling the theme twice should return to the original theme state.

**Validates: Requirements 14.3**

### Property 20: Theme Persistence Round-Trip

*For any* theme value ("light" or "dark"), saving it to storage and then retrieving it should return the same theme value.

**Validates: Requirements 14.4, 14.5**

## Error Handling

### Storage Errors

**Quota Exceeded**:
- Catch `QuotaExceededError` when writing to Local Storage
- Display user-friendly error message: "Storage limit reached. Please delete some items."
- Prevent data loss by maintaining in-memory state
- Log error to console for debugging

**Storage Unavailable**:
- Check `localStorage` availability on initialization
- Display warning banner if unavailable: "Local Storage is disabled. Your data will not be saved."
- Allow application to function with in-memory state only
- Gracefully degrade functionality

### Input Validation Errors

**Empty Task/Link**:
- Validate input is non-empty after trimming
- Display inline error message: "This field cannot be empty"
- Clear error message when user starts typing
- Prevent form submission

**Duplicate Task**:
- Perform case-insensitive comparison with existing tasks
- Display inline error message: "This task already exists"
- Highlight the existing duplicate task briefly
- Clear error message after 3 seconds

**Invalid URL**:
- Validate URL format (basic check for domain structure)
- Auto-correct by adding https:// if protocol missing
- Display warning if URL appears malformed: "Please check the URL format"
- Allow user to proceed with corrected URL

### Timer Errors

**Invalid State Transitions**:
- Prevent starting an already running timer (no-op)
- Prevent stopping an already stopped timer (no-op)
- Ensure reset works from any state
- Maintain consistent internal state

### Data Corruption

**Invalid JSON in Storage**:
- Wrap JSON.parse in try-catch blocks
- Log parsing errors to console
- Fall back to empty array/default values
- Display warning: "Saved data could not be loaded. Starting fresh."

**Missing Required Fields**:
- Validate task/link objects have required properties
- Filter out invalid objects during load
- Log validation errors to console
- Continue with valid objects only

## Testing Strategy

### Dual Testing Approach

The application will use both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Example: Default user name is "User"
- Example: Timer initializes to 25 minutes (1500 seconds)
- Example: Default theme is "dark"
- Edge case: Timer reaches 00:00 and stops
- Edge case: Storage quota exceeded error handling
- Edge case: Storage unavailable error handling
- Integration: Component initialization with storage service
- Integration: Theme application to DOM

**Property-Based Tests**: Verify universal properties across randomized inputs
- All 20 correctness properties defined above
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript property-based testing library)

**Test Configuration**:
```javascript
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // Test implementation
  }),
  { numRuns: 100 } // Minimum 100 iterations
);
```

**Test Tagging Format**:
```javascript
// Feature: todo-list-life-dashboard, Property 1: Time Format Validation
test('time formatting produces HH:MM format', () => {
  // Property test implementation
});
```

**Generator Strategy**:
- Use `fc.date()` for Date objects
- Use `fc.string()` with constraints for task/link text
- Use `fc.array()` for task/link collections
- Use `fc.constantFrom()` for theme values
- Use `fc.integer()` for timer seconds
- Use custom generators for URLs with/without protocols

### Test Organization

```
tests/
├── unit/
│   ├── storage.test.js
│   ├── greeting.test.js
│   ├── timer.test.js
│   ├── tasks.test.js
│   ├── links.test.js
│   └── theme.test.js
└── properties/
    ├── greeting.properties.test.js
    ├── timer.properties.test.js
    ├── tasks.properties.test.js
    ├── links.properties.test.js
    └── theme.properties.test.js
```

### Coverage Goals

- Unit test coverage: 80% minimum for all components
- Property test coverage: 100% of all correctness properties
- Integration test coverage: All component interactions with StorageService
- Edge case coverage: All error conditions and boundary values

### Testing Tools

- **Test Runner**: Jest or Vitest
- **Property Testing**: fast-check
- **DOM Testing**: jsdom or happy-dom
- **Assertions**: Built-in test runner assertions
- **Coverage**: Built-in coverage tools (c8 or Istanbul)

