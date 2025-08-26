// Popup script for Bulletin Chrome Extension
document.addEventListener('DOMContentLoaded', function() {
  const refreshBtn = document.getElementById('refresh-data');
  const settingsBtn = document.getElementById('open-settings');

  refreshBtn.addEventListener('click', function() {
    // Show loading state
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;

    // Send message to background script to refresh data
    chrome.runtime.sendMessage({ action: 'getStudentCapacity' }, function(response) {
      setTimeout(() => {
        refreshBtn.textContent = 'Refresh Student Data';
        refreshBtn.disabled = false;
        
        if (response && response.success) {
          showNotification('Data refreshed successfully!', 'success');
        } else {
          showNotification('Failed to refresh data', 'error');
        }
      }, 1000);
    });
  });

  settingsBtn.addEventListener('click', function() {
    // Open options page or settings
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });

  // Check current tab and show relevant information
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab.url.includes('classroom.google.com')) {
      updateStatus('On Google Classroom - Extension Ready', 'connected');
    } else {
      updateStatus('Navigate to Google Classroom to use', 'disconnected');
    }
  });
});

function updateStatus(message, status) {
  const statusItems = document.querySelectorAll('.status-item');
  if (statusItems.length > 1) {
    const extensionStatus = statusItems[1];
    const indicator = extensionStatus.querySelector('.status-indicator');
    const text = extensionStatus.querySelector('.status-text');
    
    indicator.className = `status-indicator ${status}`;
    text.textContent = message;
  }
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