# Bulletin Extension

A Chrome extension that adds a calendar tab to Google Classroom pages with React-based components.

## Features

- 📅 Adds a calendar tab to Google Classroom navigation
- ⚛️ React-based calendar component with full interactivity
- 💾 Persistent event storage using Chrome storage API
- 🎯 Smart injection targeting Google Classroom pages
- 🔧 Comprehensive popup with extension controls
- 📤 Export functionality for calendar events

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `dist` folder

## Development

- `npm run dev` - Watch mode for development
- `npm run build` - Production build
- `npm run clean` - Clean dist folder

## Structure

```
src/
├── background/     # Service worker
├── content/        # Content script for injection
├── popup/          # Extension popup
└── components/     # React components
```

## Usage

1. Navigate to any Google Classroom class page
2. Look for the "📅 Calendar" tab in the navigation
3. Click to open the calendar overlay
4. Click any date to add events
5. Use the popup for additional controls

The extension automatically detects Google Classroom pages and injects the calendar functionality.
