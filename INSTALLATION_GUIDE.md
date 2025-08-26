# Bulletin Chrome Extension - Installation Guide

## For Testers

Thank you for testing the Bulletin Chrome Extension! Follow these steps to install and test.

### Prerequisites
- Google Chrome browser
- Google account with teacher access to Google Classroom
- Must be added as a test user in the OAuth configuration

### Installation Steps

1. **Download the Extension**
   - Extract all files to a folder called `bulletin-extension`

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" ON (top right corner)
   - Click "Load unpacked"
   - Select the `bulletin-extension` folder
   - Extension should appear in your extensions list

3. **Test the Extension**
   - Go to [classroom.google.com](https://classroom.google.com)
   - Sign in with your Google account
   - Navigate to any class you teach
   - Click "Create" → "Assignment"
   - The Bulletin panel should appear on the right side

### What to Test

#### ✅ **Panel Appearance**
- [ ] Panel appears automatically when creating assignments
- [ ] Shows student names from your actual class
- [ ] Displays 4-day capacity view
- [ ] Color-coded indicators (green/yellow/red)

#### ✅ **Functionality**
- [ ] Click extension icon to see dashboard
- [ ] Dropdown arrows show student workload details
- [ ] Due date selection changes view
- [ ] Panel can be closed with X button

#### ✅ **Data Accuracy**
- [ ] Shows real students from your classes
- [ ] Capacity indicators make sense
- [ ] Dashboard shows your actual classes

### Troubleshooting

**Panel doesn't appear:**
- Make sure you're creating an assignment (not just viewing a class)
- Check that you're signed in as a teacher
- Try refreshing the page

**Authentication errors:**
- You must be added as a test user in the OAuth configuration
- Contact the developer if you get permission errors

**No student data:**
- Extension may fall back to demo data if API calls fail
- This is normal during testing phase

### Feedback

Please report:
- Any bugs or errors you encounter
- UI/UX suggestions
- Missing features
- Performance issues

### Support

If you encounter issues:
1. Press F12 → Console tab
2. Look for "Bulletin:" messages
3. Screenshot any errors
4. Send feedback with details

---

**Bulletin** - Helping teachers schedule smarter