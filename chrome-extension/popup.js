// Popup script for Bulletin Chrome Extension
document.addEventListener('DOMContentLoaded', function() {
  const refreshBtn = document.getElementById('refresh-data');
  const classroomBtn = document.getElementById('open-classroom');
  const settingsBtn = document.getElementById('open-settings');

  // Load dashboard data
  loadDashboardData();

  refreshBtn.addEventListener('click', function() {
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;
    loadDashboardData();
    
    setTimeout(() => {
      refreshBtn.textContent = 'Refresh Data';
      refreshBtn.disabled = false;
    }, 2000);
  });

  classroomBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://classroom.google.com' });
  });

  settingsBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });
});

function loadDashboardData() {
  // Load classes
  chrome.runtime.sendMessage({ action: 'getAllCourses' }, function(response) {
    const classesList = document.getElementById('classes-list');
    
    if (response && response.success && response.data) {
      const courses = response.data.courses || [];
      
      if (courses.length === 0) {
        classesList.innerHTML = '<div class="no-data">No classes found</div>';
        return;
      }
      
      classesList.innerHTML = courses.map(course => `
        <div class="class-item">
          <div class="class-name">${course.name}</div>
          <div class="class-students">${course.enrollmentCode || 'No code'}</div>
        </div>
      `).join('');
    } else {
      classesList.innerHTML = '<div class="error">Failed to load classes</div>';
    }
  });

  // Load capacity overview
  chrome.runtime.sendMessage({ action: 'getCapacityOverview' }, function(response) {
    const capacityOverview = document.getElementById('capacity-overview');
    
    if (response && response.success && response.data) {
      const { totalStudents, highCapacity, mediumCapacity, lowCapacity } = response.data;
      
      capacityOverview.innerHTML = `
        <div class="capacity-stats">
          <div class="stat-item">
            <div class="stat-number">${totalStudents}</div>
            <div class="stat-label">Total Students</div>
          </div>
          <div class="stat-item capacity-high">
            <div class="stat-number">${highCapacity}</div>
            <div class="stat-label">High Capacity</div>
          </div>
          <div class="stat-item capacity-medium">
            <div class="stat-number">${mediumCapacity}</div>
            <div class="stat-label">Medium Capacity</div>
          </div>
          <div class="stat-item capacity-low">
            <div class="stat-number">${lowCapacity}</div>
            <div class="stat-label">Low Capacity</div>
          </div>
        </div>
      `;
    } else {
      capacityOverview.innerHTML = '<div class="error">Failed to load capacity data</div>';
    }
  });
}

function showNotification(message, type) {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 12px 16px;
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
    color: white;
    border-radius: 6px;
    font-size: 14px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);