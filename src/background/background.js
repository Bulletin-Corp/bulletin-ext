// Background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Bulletin Extension installed');
});

// Listen for tab updates to inject content script dynamically
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('classroom.google.com/')) {
        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            // Content script might already be injected
            console.log('Content script injection attempt:', err.message);
        });
    }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStorageData') {
        chrome.storage.local.get(request.keys).then(sendResponse);
        return true; // Keep message channel open for async response
    }

    if (request.action === 'setStorageData') {
        chrome.storage.local.set(request.data).then(() => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// Context menu for quick access (optional)
chrome.contextMenus.create({
    id: 'bulletin-calendar',
    title: 'Add to Bulletin Calendar',
    contexts: ['selection'],
    documentUrlPatterns: ['*://classroom.google.com/*']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'bulletin-calendar' && info.selectionText) {
        // Send selected text to content script to add as event
        chrome.tabs.sendMessage(tab.id, {
            action: 'addEventFromSelection',
            text: info.selectionText
        });
    }
});
