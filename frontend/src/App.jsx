import { useState, useEffect } from 'react'
import './App.css'
import Card from './components/card/card.component'
import './components/card/card.styles.css'

function App() {
  const [count, setCount] = useState(0)
  const [videos, setVideos] = useState([])

  useEffect(() => {
    fetch('http://localhost:5001/api/videos')
      .then((response) => response.json())
      .then((videos) => setVideos(videos))
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

    </div>
    </>
  )
}

export default App
