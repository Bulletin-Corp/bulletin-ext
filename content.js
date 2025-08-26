// Content script for injecting Bulletin capacity panel
class BulletinCapacityPanel {
  constructor() {
    this.panel = null;
    this.isVisible = false;
    this.capacityData = [];
    this.init();
  }

  async init() {
    // Check if we're on an assignment creation/edit page
    if (this.isAssignmentPage()) {
      await this.loadCapacityData();
      this.createPanel();
      this.attachToPage();
    }
  }

  isAssignmentPage() {
    return window.location.href.includes('classroom.google.com') && 
           (window.location.href.includes('/c/') || document.querySelector('[data-test-id="assignment-form"]'));
  }

  async loadCapacityData() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getStudentCapacity' }, (response) => {
        if (response && response.success) {
          this.capacityData = response.data;
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

  generatePanelHTML() {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: date.getDate(),
        date: date.toISOString().split('T')[0]
      });
    }

    return `
      <div class="bulletin-panel">
        <div class="bulletin-header">
          <div class="bulletin-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#ef4444"/>
            </svg>
            <span>bulletin</span>
          </div>
          <button class="bulletin-close" id="bulletin-close">×</button>
        </div>
        
        <div class="bulletin-calendar-header">
          ${dates.map(date => `
            <div class="bulletin-date-column">
              <div class="bulletin-date-number">${date.day}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="bulletin-students-list">
          ${this.capacityData.map(student => `
            <div class="bulletin-student-row">
              ${student.weeklyCapacity.map((day, index) => `
                <div class="bulletin-student-cell">
                  <div class="bulletin-capacity-indicator capacity-${day.capacity}" 
                       data-student-id="${student.id}" 
                       data-date="${day.date}">
                    <span class="bulletin-workload-count">${day.workloadCount || 0}</span>
                    <span class="bulletin-student-name">${student.name}</span>
                    <button class="bulletin-dropdown-btn" data-student="${student.name}" data-date="${day.date}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
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
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.bulletin-workload-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    // Create new dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'bulletin-workload-dropdown';
    dropdown.innerHTML = `
      <div class="bulletin-dropdown-header">
        <span class="bulletin-dropdown-date">${new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
        <button class="bulletin-dropdown-close">×</button>
      </div>
      
      <div class="bulletin-student-section">
        <div class="bulletin-capacity-indicator capacity-low">
          <span class="bulletin-workload-count">8</span>
        </div>
        <span class="bulletin-student-name-large">${studentName}</span>
        <button class="bulletin-student-dropdown-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="bulletin-workload-details">
        <div class="bulletin-workload-category">
          <h4>Tests</h4>
          <div class="bulletin-workload-item">
            <div class="bulletin-item-indicator" style="background-color: #8b5cf6;"></div>
            <div class="bulletin-item-content">
              <h5>Limits</h5>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the...</p>
            </div>
          </div>
          <div class="bulletin-workload-item">
            <div class="bulletin-item-indicator" style="background-color: #f97316;"></div>
            <div class="bulletin-item-content">
              <h5>Kinetic Energy</h5>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the...</p>
            </div>
          </div>
        </div>

        <div class="bulletin-workload-category">
          <h4>Essays</h4>
          <div class="bulletin-workload-item">
            <div class="bulletin-item-indicator" style="background-color: #ef4444;"></div>
            <div class="bulletin-item-content">
              <h5>Hamlet Essay</h5>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Position dropdown
    const rect = buttonElement.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 5}px`;
    dropdown.style.left = `${rect.left - 200}px`;
    dropdown.style.zIndex = '10000';

    document.body.appendChild(dropdown);

    // Add close functionality
    const closeBtn = dropdown.querySelector('.bulletin-dropdown-close');
    closeBtn.addEventListener('click', () => dropdown.remove());

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target)) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 100);
  }

  attachToPage() {
    // Find the best place to attach the panel
    const targetElement = document.querySelector('.l-classroom-main') || 
                         document.querySelector('[role="main"]') || 
                         document.body;
    
    if (targetElement) {
      targetElement.appendChild(this.panel);
      this.showPanel();
    }
  }

  showPanel() {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.isVisible = true;
    }
  }

  hidePanel() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BulletinCapacityPanel();
  });
} else {
  new BulletinCapacityPanel();
}

// Handle navigation changes in single-page app
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      new BulletinCapacityPanel();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });