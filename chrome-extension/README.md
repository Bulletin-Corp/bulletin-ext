# Bulletin - Student Capacity Tracker Chrome Extension

A Chrome extension that helps teachers schedule assignments based on student workload capacity across all classes in Google Classroom. Now with real Google Classroom API integration!

## Installation Steps

### 1. Load the Extension Files
1. Download all files in the `chrome-extension` folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `chrome-extension` folder
5. **Copy the Extension ID** that appears (you'll need this for OAuth setup)

### 2. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Classroom API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Classroom API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Chrome Extension" as application type
   - **Item ID**: Paste your Extension ID from step 1
5. Copy the generated Client ID

### 3. Configure the Extension
1. Open the `manifest.json` file
2. Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
3. Save the file and reload the extension in Chrome

### 4. Test the Extension
1. Go to [Google Classroom](https://classroom.google.com)
2. Navigate to any class and create a new assignment
3. The Bulletin capacity panel should appear on the right side
4. Click dropdown arrows next to student names to see detailed workload

## Features
- ✅ **Visual capacity indicators** (green/yellow/red)
- ✅ **Weekly view of student workload**
- ✅ **Detailed assignment breakdown by category**
- ✅ **Real Google Classroom Integration** - Fetches actual student and assignment data
- ✅ **Cross-Class Workload Analysis** - Shows student capacity across all their classes
- ✅ **Smart caching** - Reduces API calls with 5-minute cache
- ✅ **Fallback support** - Uses mock data if API fails
- ✅ **Clean, professional UI** matching your design specs

## Files Included
- `manifest.json` - Extension configuration
- `background.js` - Service worker for API calls
- `content.js` - UI injection into Google Classroom
- `content.css` - Styling with Bulletin branding
- `popup.html/js` - Extension popup interface
- `options.html/js` - Settings and configuration page

## API Integration Features
- **Real student data** from Google Classroom rosters
- **Actual assignment data** with due dates and descriptions
- **Cross-class workload calculation** for accurate capacity assessment
- **Assignment categorization** (tests, essays, projects, homework)
- **Smart caching system** to improve performance
- **Comprehensive error handling** with fallback to mock data

The extension uses real Google Classroom data to provide accurate student capacity insights across all their classes, helping teachers make informed scheduling decisions.