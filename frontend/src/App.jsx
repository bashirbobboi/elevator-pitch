import { useState, useEffect } from 'react'
import './App.css'
import Card from './components/card/card.component'
import './components/card/card.styles.css'

import { TbClipboardCopy } from 'react-icons/tb'

const API_BASE = 'http://localhost:5001/api'

function App() {
  const [count, setCount] = useState(0)
  const [videos, setVideos] = useState([])
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5001/api/videos')
      .then((response) => response.json())
      .then((videos) => setVideos(videos))
  }, [videos]);

  useEffect((videoId) => {
    fetch(`http://localhost:5001/api/videos/${videoId}/stats`)
      .then((response) => response.json())
      .then((analytics) => setAnalytics(analytics))
  }, []);

  const mostViewedVideo = videos.reduce((max, video) => 
    video.viewCount > max.viewCount ? video : max, 
    videos[0] || {}
  );

  const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);

  

  return (
    <>
    <div>
      <h1 >Hello World</h1>
      <div className='dashboard-container'>
        <h2 className='text-black'>Dashboard</h2>
        <div className='cards-grid'>
          <Card>
            <h3>Total Pitches</h3>
            <p>{videos.length}</p>
          </Card>

          <Card>
            <h3>Total Views</h3>
            <p>{totalViews}</p>
          </Card>

          <Card>
            <h3>Most Viewed Pitch</h3>
            <p>{mostViewedVideo.title}</p>

          </Card>
        </div>
      </div>

      <div className='videos-container'>
        <h2 className='text-black'>Videos</h2>
        <div className='videos-block'>
          {videos.map((video) => (
            <Card key={video._id}>
              <h3>{video.title}</h3>
              <p>Views: {video.viewCount}</p>
              <p>Viewers: {video.uniqueViewers.length}</p>
              <p>Last Viewed: {video.lastViewed}</p>
              <p>Created: {video.createdAt}</p>
              <p>Link: {API_BASE}/videos/share/{video.shareId}</p>
              <button onClick={() => {
                navigator.clipboard.writeText(`${API_BASE}/videos/share/${video.shareId}`)
                alert('Link copied to clipboard')
              }}>
                <TbClipboardCopy />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default App
