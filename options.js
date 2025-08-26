// Options page script for Bulletin Chrome Extension
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  attachEventListeners();
});

function loadSettings() {
  chrome.storage.sync.get([
    'autoRefresh',
    'notifications', 
    'includeWeekends',
    'highThreshold',
    'mediumThreshold', 
    'lowThreshold',
    'clientId'
  ], function(result) {
    // Set toggle switches
    setToggle('autoRefresh', result.autoRefresh !== false);
    setToggle('notifications', result.notifications !== false);
    setToggle('includeWeekends', result.includeWeekends === true);
    
    // Set threshold values
    document.getElementById('highThreshold').value = result.highThreshold || 1;
    document.getElementById('mediumThreshold').value = result.mediumThreshold || 3;
    document.getElementById('lowThreshold').value = result.lowThreshold || 5;
    
    // Set client ID
    document.getElementById('clientId').value = result.clientId || '';
  });
}

function attachEventListeners() {
  // Toggle switches
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });

  // Save settings button
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Test connection button
  document.getElementById('testConnection').addEventListener('click', testConnection);
}

function setToggle(settingName, isActive) {
  const toggle = document.querySelector(`[data-setting="${settingName}"]`);
  if (toggle) {
    if (isActive) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }
}

function saveSettings() {
  const settings = {
    autoRefresh: document.querySelector('[data-setting="autoRefresh"]').classList.contains('active'),
    notifications: document.querySelector('[data-setting="notifications"]').classList.contains('active'),
    includeWeekends: document.querySelector('[data-setting="includeWeekends"]').classList.contains('active'),
    highThreshold: parseInt(document.getElementById('highThreshold').value),
    mediumThreshold: parseInt(document.getElementById('mediumThreshold').value),
    lowThreshold: parseInt(document.getElementById('lowThreshold').value),
    clientId: document.getElementById('clientId').value
  };

  chrome.storage.sync.set(settings, function() {
    showSaveNotification();
    
    // Update manifest with new client ID if provided
    if (settings.clientId) {
      chrome.runtime.sendMessage({
        action: 'updateClientId',
        clientId: settings.clientId
      });
    }
  });
}

function testConnection() {
  const testBtn = document.getElementById('testConnection');
  const originalText = testBtn.textContent;
  
  testBtn.textContent = 'Testing...';
  testBtn.disabled = true;

  chrome.runtime.sendMessage({ action: 'testConnection' }, function(response) {
    setTimeout(() => {
      testBtn.textContent = originalText;
      testBtn.disabled = false;
      
      if (response && response.success) {
        showNotification('Connection successful!', 'success');
      } else {
        showNotification('Connection failed. Check your settings.', 'error');
      }
    }, 1500);
  });
}

function showSaveNotification() {
  const notification = document.getElementById('saveNotification');
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}