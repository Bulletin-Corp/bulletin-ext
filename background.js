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
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getCourses() {
    return this.makeAPICall('courses?teacherId=me&courseStates=ACTIVE');
  }

  async getStudents(courseId) {
    return this.makeAPICall(`courses/${courseId}/students`);
  }

  async getCourseWork(courseId) {
    return this.makeAPICall(`courses/${courseId}/courseWork`);
  }
}

const classroomAPI = new ClassroomAPI();

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStudentCapacity') {
    handleGetStudentCapacity()
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
});

async function handleGetStudentCapacity() {
  try {
    // Mock data for development - replace with actual API calls
    const mockData = generateMockCapacityData();
    return { success: true, data: mockData };
  } catch (error) {
    console.error('Error getting student capacity:', error);
    return { success: false, error: error.message };
  }
}

async function handleGetStudentWorkload(data) {
  try {
    const { studentId, date } = data;
    const mockWorkload = generateMockWorkloadData(studentId, date);
    return { success: true, data: mockWorkload };
  } catch (error) {
    console.error('Error getting student workload:', error);
    return { success: false, error: error.message };
  }
}

function generateMockCapacityData() {
  const students = [
    'Tony Stark', 'Kol Crooks', 'Fionn Reese', 'Franco Bradford',
    'Emma Watson', 'John Smith', 'Sarah Johnson', 'Mike Davis',
    'Lisa Anderson', 'David Wilson', 'Anna Brown', 'Chris Taylor'
  ];

  const today = new Date();
  const capacityData = [];

  students.forEach((name, index) => {
    const weeklyCapacity = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate random capacity levels
      const capacities = ['high', 'medium', 'low'];
      const weights = i < 3 ? [0.6, 0.3, 0.1] : [0.4, 0.4, 0.2]; // More load later in week
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
      id: `student_${index}`,
      name,
      weeklyCapacity
    });
  });

  return capacityData;
}

function generateMockWorkloadData(studentId, date) {
  const workloadTypes = {
    tests: [
      { title: 'Limits', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the...', color: 'purple' },
      { title: 'Kinetic Energy', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the...', color: 'orange' }
    ],
    essays: [
      { title: 'Hamlet Essay', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the...', color: 'red' }
    ],
    projects: [
      { title: 'Science Fair Project', description: 'Research and present findings on renewable energy sources', color: 'blue' }
    ],
    homework: [
      { title: 'Math Problems 1-20', description: 'Complete algebra problems from chapter 5', color: 'green' },
      { title: 'History Reading', description: 'Read chapter 12 and answer questions', color: 'yellow' }
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