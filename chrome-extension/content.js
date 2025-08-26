// Content script for injecting Bulletin capacity panel
class BulletinCapacityPanel {
  constructor() {
    this.panel = null;
    this.toggleButton = null;
    this.isVisible = false;
    this.capacityData = [];
    this.currentCourseId = this.extractCourseId();
    this.buttonPosition = { x: 20, y: 100 }; // Default position
    console.log('Bulletin: Initializing with course ID:', this.currentCourseId);
    this.init();
  }

  async init() {
    console.log('Bulletin: Checking if assignment page...');
    if (this.isAssignmentPage()) {
      console.log('Bulletin: On assignment page, loading data...');
      await this.loadCapacityData();
      this.createPanel();
      this.createToggleButton();
      this.attachToPage();
    } else {
      console.log('Bulletin: Not on assignment page');
    }
  }

  isAssignmentPage() {
    const url = window.location.href;
    const isClassroom = url.includes('classroom.google.com');
    const isInClass = url.includes('/c/');
    
    console.log('Bulletin: URL check -', { isClassroom, isInClass, url });
    
    // Simple check - if we're in a class, show the panel
    // This ensures it appears when creating assignments
    return isClassroom && isInClass;
  }

  extractCourseId() {
    const match = window.location.href.match(/\/c\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  async loadCapacityData() {
    return new Promise((resolve) => {
      console.log('Bulletin: Loading capacity data for course:', this.currentCourseId);
      
      chrome.runtime.sendMessage({ 
        action: 'getStudentCapacity',
        courseId: this.currentCourseId 
      }, (response) => {
        console.log('Bulletin: Received capacity data:', response);
        
        if (response && response.success) {
          this.capacityData = response.data;
          console.log('Bulletin: Loaded', this.capacityData.length, 'students');
        } else {
          console.error('Bulletin: Failed to load capacity data:', response?.error);
          this.capacityData = [];
        }
        resolve();
      });
    });
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = 'bulletin-capacity-panel';
    this.panel.innerHTML = this.generatePanelHTML();
    
    // Add event listeners
    this.attachEventListeners();
  }

  createToggleButton() {
    this.toggleButton = document.createElement('div');
    this.toggleButton.id = 'bulletin-toggle-button';
    this.toggleButton.innerHTML = `
      <img src="${chrome.runtime.getURL('logo.svg')}" alt="Bulletin Logo" class="bulletin-toggle-logo" />
    `;
    
    // Position the button
    this.toggleButton.style.left = `${this.buttonPosition.x}px`;
    this.toggleButton.style.top = `${this.buttonPosition.y}px`;
    
    // Make it draggable
    this.makeButtonDraggable();
    
    // Add click handler
    this.toggleButton.addEventListener('click', () => {
      this.showPanel();
      this.hideToggleButton();
    });
    
    // Initially hide the button since panel starts visible
    this.toggleButton.style.display = 'none';
  }

  makeButtonDraggable() {
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    this.toggleButton.addEventListener('mousedown', (e) => {
      // Don't start drag if clicking on the logo (for opening)
      if (e.target.closest('.bulletin-toggle-logo')) {
        return;
      }
      
      isDragging = true;
      const rect = this.toggleButton.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      
      this.toggleButton.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep button within viewport bounds
      const maxX = window.innerWidth - this.toggleButton.offsetWidth;
      const maxY = window.innerHeight - this.toggleButton.offsetHeight;
      
      this.buttonPosition.x = Math.max(0, Math.min(newX, maxX));
      this.buttonPosition.y = Math.max(0, Math.min(newY, maxY));
      
      this.toggleButton.style.left = `${this.buttonPosition.x}px`;
      this.toggleButton.style.top = `${this.buttonPosition.y}px`;
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.toggleButton.style.cursor = 'pointer';
      }
    });
  }

  generatePanelHTML() {
    if (this.capacityData.length === 0) {
      return this.generateLoadingHTML();
    }

    const today = new Date();
    const dates = [];
    
    // Show next 4 days
    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        date: date.toISOString().split('T')[0]
      });
    }

    return `
      <div class="bulletin-panel">
        <div class="bulletin-header">
          <div class="bulletin-logo">
            <img src="${chrome.runtime.getURL('logo.svg')}" width="32" height="32" alt="Bulletin Logo" />
          </div>
          <button class="bulletin-close" id="bulletin-close">×</button>
        </div>
        
        <div class="bulletin-calendar-header">
          <div class="bulletin-name-header">
            <span>Name</span>
          </div>
          ${dates.map(date => `
            <div class="bulletin-date-column ${date.isSelected ? 'selected' : ''}">
              <div class="bulletin-date-month">${date.month}</div>
              <div class="bulletin-date-number">${date.day}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="bulletin-students-container">
          ${this.capacityData.map(student => `
            <div class="bulletin-student-row">
              <div class="bulletin-student-name-cell">
                <span class="bulletin-student-name">${student.name || 'Unknown Student'}</span>
              </div>
              ${dates.map(date => {
                const dayData = student.weeklyCapacity.find(day => day.date === date.date) || 
                               { capacity: 'high', workloadCount: 0 };
                return `
                  <div class="bulletin-capacity-cell">
                    <div class="bulletin-capacity-indicator capacity-${dayData.capacity}" 
                         data-student-id="${student.id}" 
                         data-date="${date.date}">
                      <span class="bulletin-workload-count">${dayData.workloadCount || 0}</span>
                      <button class="bulletin-dropdown-btn" data-student="${student.name}" data-date="${date.date}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  generateLoadingHTML() {
    return `
      <div class="bulletin-panel">
        <div class="bulletin-header">
          <div class="bulletin-logo">
            <img src="${chrome.runtime.getURL('logo.svg')}" width="20" height="20" alt="Bulletin Logo" />
            <span>bulletin</span>
          </div>
          <button class="bulletin-close" id="bulletin-close">×</button>
        </div>
        
        <div class="bulletin-loading">
          <div class="bulletin-loading-spinner"></div>
          <p>Loading student capacity data...</p>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Close button
    const closeBtn = this.panel.querySelector('#bulletin-close');
    closeBtn?.addEventListener('click', () => this.hidePanel());

    // Dropdown buttons
    const dropdownBtns = this.panel.querySelectorAll('.bulletin-dropdown-btn');
    dropdownBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentName = btn.dataset.student;
        const date = btn.dataset.date;
        this.showWorkloadDetails(studentName, date, btn);
      });
    });
  }

  showWorkloadDetails(studentName, date, buttonElement) {
    // Check if this specific student dropdown is already open
    const dropdownId = `bulletin-dropdown-${studentName.replace(/\s+/g, '-')}-${date}`;
    const existingDropdown = document.getElementById(dropdownId);
    if (existingDropdown) {
      // If already open, bring it to front and return
      existingDropdown.style.zIndex = this.getHighestZIndex() + 1;
      this.highlightDropdown(existingDropdown);
      return;
    }

    // Create new dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'bulletin-workload-dropdown';
    dropdown.id = dropdownId;
    dropdown.innerHTML = `
      <div class="bulletin-dropdown-header">
        <span class="bulletin-dropdown-date">${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span class="bulletin-dropdown-student">${studentName}</span>
        <button class="bulletin-dropdown-close">×</button>
      </div>
      
      <div class="bulletin-student-section">
        <div class="bulletin-capacity-indicator capacity-medium">
          <span class="bulletin-workload-count">3</span>
        </div>
        <span class="bulletin-student-name-large">${studentName}</span>
      </div>

      <div class="bulletin-workload-details">
        <div class="bulletin-workload-category">
          <h4>Tests</h4>
          <div class="bulletin-workload-item">
            <div class="bulletin-item-indicator" style="background-color: #8b5cf6;"></div>
            <div class="bulletin-item-content">
              <h5>Math Quiz</h5>
              <p>Algebra problems covering chapters 4-5</p>
            </div>
          </div>
        </div>

        <div class="bulletin-workload-category">
          <h4>Homework</h4>
          <div class="bulletin-workload-item">
            <div class="bulletin-item-indicator" style="background-color: #22c55e;"></div>
            <div class="bulletin-item-content">
              <h5>Reading Assignment</h5>
              <p>Chapter 8 reading with questions</p>
            </div>
          </div>
          <div class="bulletin-workload-item">
            <div class="bulletin-item-indicator" style="background-color: #f59e0b;"></div>
            <div class="bulletin-item-content">
              <h5>Science Lab Report</h5>
              <p>Complete lab report from Tuesday's experiment</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Smart positioning with offset for multiple dropdowns
    const rect = buttonElement.getBoundingClientRect();
    const existingDropdowns = document.querySelectorAll('.bulletin-workload-dropdown');
    const offset = existingDropdowns.length * 30; // Cascade effect
    
    const dropdownWidth = 350;
    const dropdownHeight = 400; // Approximate height
    
    let left = rect.left - dropdownWidth + rect.width + offset;
    let top = rect.bottom + 5 + offset;
    
    // Adjust horizontal position if going off-screen
    if (left < 10) {
      left = rect.right + 5; // Show to the right instead
    }
    if (left + dropdownWidth > window.innerWidth - 10) {
      left = window.innerWidth - dropdownWidth - 10;
    }
    
    // Adjust vertical position if going off-screen
    if (top + dropdownHeight > window.innerHeight - 10) {
      top = rect.top - dropdownHeight - 5; // Show above instead
    }
    if (top < 10) {
      top = 10; // Keep some margin from top
    }
    
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
    dropdown.style.zIndex = this.getHighestZIndex() + 1;

    document.body.appendChild(dropdown);

    // Make dropdown draggable and resizable
    this.makeDropdownDraggable(dropdown);
    this.makeDropdownResizable(dropdown);
    
    // Add close functionality
    const closeBtn = dropdown.querySelector('.bulletin-dropdown-close');
    closeBtn.addEventListener('click', () => dropdown.remove());

    // Add click to focus functionality
    dropdown.addEventListener('mousedown', () => {
      dropdown.style.zIndex = this.getHighestZIndex() + 1;
    });
    
    // Highlight the new dropdown briefly
    this.highlightDropdown(dropdown);
  }

  makeDropdownDraggable(dropdown) {
    const header = dropdown.querySelector('.bulletin-dropdown-header');
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    header.style.cursor = 'move';
    header.style.userSelect = 'none';
    
    header.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on close button
      if (e.target.closest('.bulletin-dropdown-close')) {
        return;
      }
      
      isDragging = true;
      const rect = dropdown.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      
      header.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep dropdown within viewport bounds
      const maxX = window.innerWidth - dropdown.offsetWidth;
      const maxY = window.innerHeight - dropdown.offsetHeight;
      
      const boundedX = Math.max(10, Math.min(newX, maxX - 10));
      const boundedY = Math.max(10, Math.min(newY, maxY - 10));
      
      dropdown.style.left = `${boundedX}px`;
      dropdown.style.top = `${boundedY}px`;
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'move';
      }
    });
  }

  makeDropdownResizable(dropdown) {
    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'bulletin-resize-handle';
    resizeHandle.innerHTML = '⋰';
    dropdown.appendChild(resizeHandle);
    
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(dropdown).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(dropdown).height, 10);
      
      resizeHandle.style.cursor = 'nw-resize';
      e.preventDefault();
      e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      
      // Set minimum and maximum sizes
      const minWidth = 300;
      const maxWidth = window.innerWidth - 40;
      const minHeight = 200;
      const maxHeight = window.innerHeight - 40;
      
      const boundedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      const boundedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      
      dropdown.style.width = `${boundedWidth}px`;
      dropdown.style.height = `${boundedHeight}px`;
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizeHandle.style.cursor = 'nw-resize';
      }
    });
  }

  getHighestZIndex() {
    const dropdowns = document.querySelectorAll('.bulletin-workload-dropdown');
    let highest = 10000;
    dropdowns.forEach(dropdown => {
      const zIndex = parseInt(dropdown.style.zIndex) || 10000;
      if (zIndex > highest) {
        highest = zIndex;
      }
    });
    return highest;
  }
  
  highlightDropdown(dropdown) {
    dropdown.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
    setTimeout(() => {
      dropdown.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2)';
    }, 1000);
  }

  attachToPage() {
    // Find the best place to attach the panel
    const targetElement = document.querySelector('.l-classroom-main') || 
                         document.querySelector('[role="main"]') || 
                         document.body;
    
    if (targetElement) {
      targetElement.appendChild(this.panel);
      document.body.appendChild(this.toggleButton);
      this.showPanel();
    }
  }

  showPanel() {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.isVisible = true;
      this.hideToggleButton();
      console.log('Bulletin: Panel is now visible');
    }
  }

  hidePanel() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
      this.showToggleButton();
    }
  }

  showToggleButton() {
    if (this.toggleButton) {
      this.toggleButton.style.display = 'flex';
    }
  }

  hideToggleButton() {
    if (this.toggleButton) {
      this.toggleButton.style.display = 'none';
    }
  }
}

// Initialize when page loads
function initializeBulletin() {
  console.log('Bulletin: Initializing...');
  // Try multiple times to ensure it loads
  setTimeout(() => {
    new BulletinCapacityPanel();
  }, 1000);
  
  // Try again after a longer delay in case page is still loading
  setTimeout(() => {
    if (!document.querySelector('#bulletin-capacity-panel')) {
      console.log('Bulletin: Panel not found, trying again...');
      new BulletinCapacityPanel();
    }
  }, 3000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBulletin);
} else {
  initializeBulletin();
}

// Handle navigation changes in single-page app
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('Bulletin: URL changed to:', url);
    
    // Check if we navigated to a class page
    if (url.includes('classroom.google.com') && url.includes('/c/')) {
      console.log('Bulletin: Navigated to class page, initializing...');
      setTimeout(() => {
        new BulletinCapacityPanel();
      }, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });