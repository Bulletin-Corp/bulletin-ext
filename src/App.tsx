import React from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Bulletin Chrome Extension
        </h1>
        <p className="text-gray-600 mb-4">
          This is the development interface for the Bulletin Chrome Extension.
        </p>
        <p className="text-sm text-gray-500">
          The actual extension runs as a Chrome extension in Google Classroom.
        </p>
      </div>
    </div>
  )
}

export default App