# Bulletin - Student Capacity Tracker

A Chrome extension that helps teachers schedule assignments based on student workload capacity across all classes in Google Classroom.

## Features

- **Visual Capacity Tracking**: See student workload capacity at a glance with color-coded indicators
  - 🟢 Green: High capacity (low workload)
  - 🟡 Yellow: Medium capacity (moderate workload) 
  - 🔴 Red: Low capacity (high workload)

- **Detailed Workload Breakdown**: Click on any student to see their assignments organized by type:
  - Tests and Exams
  - Essays and Papers
  - Projects
  - Homework

- **Cross-Class Integration**: View workload from all classes, not just your own
- **Smart Scheduling**: Make informed decisions about due dates based on student capacity
- **Real-time Updates**: Automatically refreshes data from Google Classroom

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Set up Google OAuth credentials (see Setup section)

## Setup

### Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Classroom API
4. Create OAuth 2.0 credentials:
   - Application type: Chrome Extension
   - Add your extension ID to authorized origins
5. Copy your Client ID and paste it in the extension settings

### Required Permissions

The extension requires these permissions:
- `classroom.courses.readonly`: Read course information
- `classroom.coursework.students.readonly`: Read assignments and student work
- `classroom.rosters.readonly`: Read class rosters

## Usage

1. Navigate to Google Classroom
2. Go to any class and start creating an assignment
3. The Bulletin panel will automatically appear on the right side
4. View student capacity for the upcoming week
5. Click the dropdown next to any student to see their detailed workload
6. Use this information to choose optimal due dates

## Development

### Project Structure

```
bulletin-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Content script for UI injection
├── content.css           # Styles for the capacity panel
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── options.html          # Settings page
├── options.js            # Settings functionality
└── icons/                # Extension icons
```

### Key Components

- **Background Script**: Handles Google Classroom API authentication and data fetching
- **Content Script**: Injects the capacity panel into Google Classroom pages
- **Popup**: Quick access to extension status and controls
- **Options Page**: Configuration for thresholds and API settings

### API Integration

The extension uses the Google Classroom API v1 with these endpoints:
- `/courses` - Get teacher's courses
- `/courses/{id}/students` - Get students in each course
- `/courses/{id}/courseWork` - Get assignments for each course

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with Google Classroom
5. Submit a pull request

## Privacy & Security

- All data is processed locally in the browser
- No student data is stored on external servers
- Uses official Google Classroom API with proper OAuth authentication
- Follows Chrome extension security best practices

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the Chrome extension console for errors
2. Verify Google Classroom API permissions
3. Test OAuth configuration in the settings page
4. Open an issue on GitHub with detailed information

---

**Bulletin** - Helping teachers schedule smarter, one assignment at a time.