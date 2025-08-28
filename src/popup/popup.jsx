import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import BulletinLogo from '../components/BulletinLogo.jsx';
import './popup.css';

const Popup = () => {
    const [currentTab, setCurrentTab] = useState(null);
    const [eventCount, setEventCount] = useState(0);
    const [extensionStatus, setExtensionStatus] = useState('Active');

    useEffect(() => {
        checkCurrentTab();
        loadEventCount();
    }, []);

    const checkCurrentTab = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            setCurrentTab(tab);
        } catch (error) {
            console.log('Could not get current tab');
        }
    };

    const loadEventCount = async () => {
        try {
            const result = await chrome.storage.local.get(['calendarEvents']);
            const events = result.calendarEvents || {};
            const totalEvents = Object.values(events).reduce((sum, dayEvents) => sum + dayEvents.length, 0);
            setEventCount(totalEvents);
        } catch (error) {
            console.log('Could not load event count');
        }
    };

    const isGoogleClassroom = currentTab?.url?.includes('classroom.google.com');

    const openClassroom = () => {
        chrome.tabs.create({ url: 'https://classroom.google.com' });
    };

    const toggleCalendar = async () => {
        if (isGoogleClassroom) {
            try {
                await chrome.tabs.sendMessage(currentTab.id, { action: 'toggleCalendar' });
            } catch (error) {
                console.log('Could not communicate with content script');
            }
        }
    };

    const clearAllEvents = async () => {
        if (confirm('Are you sure you want to clear all calendar events?')) {
            try {
                await chrome.storage.local.set({ calendarEvents: {} });
                setEventCount(0);
            } catch (error) {
                console.log('Could not clear events');
            }
        }
    };

    const exportEvents = async () => {
        try {
            const result = await chrome.storage.local.get(['calendarEvents']);
            const events = result.calendarEvents || {};
            const dataStr = JSON.stringify(events, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            await chrome.downloads.download({
                url: url,
                filename: 'bulletin-calendar-events.json'
            });
        } catch (error) {
            console.log('Could not export events');
        }
    };

    return (
        <div className="popup-container">
            <div className="header">
                <BulletinLogo width={32} height={53} />
                <h1>Bulletin</h1>
                <p>Student Capacity Tracker</p>
            </div>

            <div className="status-section">
                <div className="status-item">
                    <span className="status-label">Extension Status:</span>
                    <span className="status-value">{extensionStatus}</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Current Page:</span>
                    <span className="status-value">
                        {isGoogleClassroom ? 'Google Classroom' : 'Other'}
                    </span>
                </div>
                <div className="status-item">
                    <span className="status-label">Calendar Events:</span>
                    <span className="status-value">{eventCount}</span>
                </div>
            </div>

            {isGoogleClassroom ? (
                <button className="action-button" onClick={toggleCalendar}>
                    Toggle Calendar
                </button>
            ) : (
                <button className="action-button" onClick={openClassroom}>
                    Open Google Classroom
                </button>
            )}

            <button className="action-button secondary" onClick={clearAllEvents}>
                Clear All Events
            </button>

            <button className="action-button secondary" onClick={exportEvents}>
                Export Events
            </button>

            <div className="footer">
                Version 1.0.0 • Made for Google Classroom
            </div>
        </div>
    );
};

// Initialize React
document.addEventListener('DOMContentLoaded', () => {
    const root = ReactDOM.createRoot(document.getElementById('popup-root'));
    root.render(<Popup />);
});
