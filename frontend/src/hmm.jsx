import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:5001/api'

function App() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [viewingVideo, setViewingVideo] = useState(null)
  const [videoData, setVideoData] = useState(null)

  // Load all videos on component mount
  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/videos`)
      const data = await response.json()
      setVideos(data)
      setMessage(`Loaded ${data.length} videos`)
    } catch (error) {
      setMessage(`Error loading videos: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const uploadVideo = async () => {
    if (!selectedFile || !videoTitle) {
      setMessage('Please select a file and enter a title')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('title', videoTitle)

      const response = await fetch(`${API_BASE}/videos/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`Video uploaded successfully! Share ID: ${data.shareId}`)
        setVideoTitle('')
        setSelectedFile(null)
        loadVideos() // Reload the list
      } else {
        setMessage(`Upload failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Upload error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/videos/${videoId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`Video deleted: ${data.deletedVideo.title}`)
        loadVideos() // Reload the list
      } else {
        setMessage(`Delete failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Delete error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getAnalytics = async (videoId) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/videos/${videoId}/stats`)
      const data = await response.json()
      if (response.ok) {
        setAnalytics(data)
        setMessage(`Analytics loaded for: ${data.title}`)
      } else {
        setMessage(`Analytics failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Analytics error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testShareLink = async (shareId) => {
    try {
      setLoading(true)
      const viewerId = `test-viewer-${Date.now()}`
      const response = await fetch(`${API_BASE}/videos/share/${shareId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ viewerId })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`Share link tested! Views: ${data.viewCount}, Unique: ${data.uniqueViewers}`)
        loadVideos() // Reload to see updated counts
      } else {
        setMessage(`Share test failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Share test error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getAllAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/videos/admin/all-stats`)
      const data = await response.json()
      if (response.ok) {
        setAnalytics({ allVideos: data })
        setMessage(`Loaded analytics for ${data.length} videos`)
      } else {
        setMessage(`All analytics failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`All analytics error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const viewVideo = async (video) => {
    setViewingVideo(video)
    setMessage(`Viewing: ${video.title}`)
    
    // Track the view by calling the share endpoint and get video data
    try {
      const viewerId = `admin-viewer-${Date.now()}`
      const response = await fetch(`${API_BASE}/videos/share/${video.shareId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ viewerId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setVideoData(data)
        setMessage(`Viewing: ${data.title} (Views: ${data.viewCount})`)
        // Reload videos to show updated view count
        loadVideos()
      }
    } catch (error) {
      console.log('View tracking failed:', error)
      // Fallback to direct video URL if share endpoint fails
      setVideoData(video)
    }
  }

  const closeVideoViewer = () => {
    setViewingVideo(null)
    setVideoData(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Backend Testing Interface</h1>
      
      {/* Status Message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          {message}
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Video Title:</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter video title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Video File:</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={uploadVideo}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      </div>

      {/* Video List */}
      <div className="mb-8 p-4 border rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Videos ({videos.length})</h2>
          <button
            onClick={loadVideos}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video._id} className="p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="text-sm text-gray-600">Share ID: {video.shareId}</p>
                  <p className="text-sm text-gray-600">Views: {video.viewCount} | Unique: {video.uniqueViewers?.length || 0}</p>
                  <p className="text-sm text-gray-600">Last Viewed: {video.lastViewed ? new Date(video.lastViewed).toLocaleString() : 'Never'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewVideo(video)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => getAnalytics(video._id)}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => testShareLink(video.shareId)}
                    className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                  >
                    Test Share
                  </button>
                  <button
                    onClick={() => deleteVideo(video._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-8 p-4 border rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <button
            onClick={getAllAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'All Analytics'}
          </button>
        </div>
        
        {analytics && (
          <div className="p-4 bg-gray-100 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(analytics, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* API Test Section */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
        <button
          onClick={async () => {
            try {
              const response = await fetch(`${API_BASE.replace('/api', '')}/api/test`)
              const data = await response.text()
              setMessage(`API Test: ${data}`)
            } catch (error) {
              setMessage(`API Test Failed: ${error.message}`)
            }
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Test API Connection
        </button>
      </div>

      {/* Video Viewer Modal */}
      {viewingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{videoData?.title || viewingVideo.title}</h3>
              <button
                onClick={closeVideoViewer}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Share ID: {videoData?.shareId || viewingVideo.shareId}</p>
              <p className="text-sm text-gray-600">Views: {videoData?.viewCount || viewingVideo.viewCount} | Unique: {videoData?.uniqueViewers || viewingVideo.uniqueViewers?.length || 0}</p>
            </div>

            <div className="relative">
              <video
                controls
                className="w-full max-h-96"
                src={`http://localhost:5001${videoData?.videoUrl || viewingVideo.videoUrl}`}
                onError={(e) => {
                  setMessage(`Error loading video: ${e.target.error?.message || 'Unknown error'}`)
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`http://localhost:5001/api/videos/share/${viewingVideo.shareId}`)
                  setMessage('Share link copied to clipboard!')
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Copy Share Link
              </button>
              <button
                onClick={() => testShareLink(viewingVideo.shareId)}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Test Share Link
              </button>
              <button
                onClick={() => {
                  window.open(`http://localhost:5001/api/videos/share/${viewingVideo.shareId}`, '_blank')
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Open Share Link
              </button>
              <button
                onClick={() => getAnalytics(viewingVideo._id)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
