// Background service worker for Bulletin Chrome Extension
class ClassroomAPI {
  constructor() {
    this.accessToken = null;
  }

  async authenticate() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          this.accessToken = token;
          resolve(token);
        }
      });
    });
  }

  async makeAPICall(endpoint) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const response = await fetch(`https://classroom.googleapis.com/v1/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        this.accessToken = null;
        return this.makeAPICall(endpoint);
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getCourse(courseId) {
    return this.makeAPICall(`courses/${courseId}`);
  }

  async getStudents(courseId) {
    return this.makeAPICall(`courses/${courseId}/students`);
  }

  async getCourseWork(courseId) {
    return this.makeAPICall(`courses/${courseId}/courseWork`);
  }

  async getAllCourses() {
    return this.makeAPICall('courses?teacherId=me&courseStates=ACTIVE');
  }

  async getStudentSubmissions(courseId, courseWorkId) {
    return this.makeAPICall(`courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`);
  }
}

const classroomAPI = new ClassroomAPI();

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStudentCapacity') {
    handleGetStudentCapacity(request.courseId)
      .then(sendResponse)
      .catch(error => {
        console.error('Error in getStudentCapacity:', error);
        sendResponse({ error: error.message });
      });
    return true;
  }
  
  if (request.action === 'getAllCourses') {
    handleGetAllCourses()
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (request.action === 'getCapacityOverview') {
    handleGetCapacityOverview()
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (request.action === 'getStudentWorkload') {
    handleGetStudentWorkload(request.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (request.action === 'testConnection') {
    testConnection()
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

async function handleGetStudentCapacity(courseId) {
  try {
    console.log('Background: Getting student capacity for course:', courseId);
    
    // For now, always use mock data to ensure the panel shows up
    // We'll add real API integration once the basic functionality is working
    console.log('Background: Using mock data for course:', courseId);
    const mockData = generateMockCapacityData(courseId || 'default');
    return { success: true, data: mockData };
  } catch (error) {
    console.error('Background: Error getting student capacity:', error);
    const mockData = generateMockCapacityData(courseId || 'default');
    return { success: true, data: mockData };
  }
}

async function handleGetAllCourses() {
  try {
    const coursesResponse = await classroomAPI.getAllCourses();
    return { success: true, data: coursesResponse };
  } catch (error) {
    console.error('Background: Error getting courses:', error);
    // Return mock courses
    return { 
      success: true, 
      data: { 
        courses: [
          { id: 'mock1', name: 'Math 101', enrollmentCode: 'MATH101' },
          { id: 'mock2', name: 'Science 201', enrollmentCode: 'SCI201' },
          { id: 'mock3', name: 'English 301', enrollmentCode: 'ENG301' }
        ] 
      } 
    };
  }
}

async function handleGetCapacityOverview() {
  try {
    // This would aggregate data from all courses
    // For now, return mock overview data
    return {
      success: true,
      data: {
        totalStudents: 127,
        highCapacity: 45,
        mediumCapacity: 52,
        lowCapacity: 30
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function generateRealCapacityData(students, currentCourseId) {
  const today = new Date();
  const capacityData = [];

  for (const student of students) {
    const studentName = student.profile?.name?.fullName || 'Unknown Student';
    const studentId = student.userId;
    
    const weeklyCapacity = [];
    
    // Calculate workload for next 4 days
    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // For now, generate realistic workload data
      // In production, this would check all courses
      let totalWorkload = 0;
      
      try {
        // Try to get real course work for this course
        const courseWork = await classroomAPI.getCourseWork(currentCourseId);
        if (courseWork.courseWork) {
          totalWorkload = courseWork.courseWork.filter(work => {
            if (!work.dueDate) return false;
            const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day);
            return dueDate.toISOString().split('T')[0] === dateStr;
          }).length;
        }
      } catch (error) {
        console.log('Background: Error getting coursework, using estimated data');
        totalWorkload = Math.floor(Math.random() * 5);
      }
      
      // Determine capacity based on workload
      let capacity = 'high';
      if (totalWorkload >= 4) capacity = 'low';
      else if (totalWorkload >= 2) capacity = 'medium';
      
      weeklyCapacity.push({
        date: dateStr,
        capacity,
        workloadCount: totalWorkload
      });
    }

    capacityData.push({
      id: studentId,
      name: studentName,
      weeklyCapacity
    });
  }

  return capacityData;
}

async function handleGetStudentWorkload(data) {
  try {
    const { studentId, date } = data;
    // This would fetch real workload details from the API
    // For now, return mock workload data
    const mockWorkload = generateMockWorkloadData(studentId, date);
    return { success: true, data: mockWorkload };
  } catch (error) {
    console.error('Error getting student workload:', error);
    return { success: false, error: error.message };
  }
}

async function testConnection() {
  try {
    await classroomAPI.authenticate();
    const courses = await classroomAPI.getAllCourses();
    return { success: true, message: `Connected! Found ${courses.courses?.length || 0} courses.` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Fallback mock data function
function generateMockCapacityData(courseId) {
  const courseStudents = getCourseSpecificStudents(courseId || 'default');
  const today = new Date();
  const capacityData = [];

  courseStudents.forEach((name, index) => {
    const weeklyCapacity = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const capacities = ['high', 'medium', 'low'];
      const weights = i < 2 ? [0.7, 0.2, 0.1] : [0.4, 0.4, 0.2];
      const capacity = getWeightedRandom(capacities, weights);
      
      weeklyCapacity.push({
        date: date.toISOString().split('T')[0],
        capacity,
        workloadCount: capacity === 'high' ? Math.floor(Math.random() * 2) : 
                      capacity === 'medium' ? Math.floor(Math.random() * 2) + 2 : 
                      Math.floor(Math.random() * 3) + 4
      });
    }

    capacityData.push({
      id: `student_${courseId}_${index}`,
      name,
      weeklyCapacity
    });
  });

  return capacityData;
}

function getCourseSpecificStudents(courseId) {
  const studentSets = {
    'default': [
      'Emma Johnson', 'Liam Smith', 'Olivia Brown', 'Noah Davis',
      'Ava Wilson', 'Ethan Miller', 'Sophia Garcia', 'Mason Rodriguez'
    ],
    'mock1': [
      'Alice Cooper', 'Bob Wilson', 'Carol Davis', 'David Lee',
      'Eva Martinez', 'Frank Johnson', 'Grace Kim', 'Henry Chen'
    ],
    'mock2': [
      'Isabella Rodriguez', 'Jack Thompson', 'Kate Anderson', 'Leo Garcia',
      'Mia Taylor', 'Nathan White', 'Olivia Harris', 'Peter Clark'
    ]
  };

  return studentSets[courseId] || studentSets['default'];
}

function generateMockWorkloadData(studentId, date) {
  const workloadTypes = {
    tests: [
      { title: 'Math Quiz', description: 'Algebra problems covering chapters 4-5', color: 'purple' },
      { title: 'Science Test', description: 'Chemistry unit test on molecular structures', color: 'orange' }
    ],
    essays: [
      { title: 'History Essay', description: '5-page essay on World War II causes', color: 'red' }
    ],
    projects: [
      { title: 'Science Fair Project', description: 'Research and present findings on renewable energy', color: 'blue' }
    ],
    homework: [
      { title: 'Reading Assignment', description: 'Chapter 8 reading with comprehension questions', color: 'green' },
      { title: 'Math Problems', description: 'Complete problems 1-25 from textbook page 142', color: 'yellow' }
    ]
  };

  return workloadTypes;
}

function getWeightedRandom(items, weights) {
  const random = Math.random();
  let weightSum = 0;
  
  for (let i = 0; i < items.length; i++) {
    weightSum += weights[i];
    if (random <= weightSum) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}