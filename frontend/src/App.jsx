import { useState, useEffect } from 'react'
import './App.css'
import Card from './components/card/card.component'
import './components/card/card.styles.css'
import logo from './assets/logo.png'
import sidebar from './assets/elevatorpitch.png'
import { Sidebar, SidebarBody, SidebarLink } from './components/ui/sidebar'
import { LayoutDashboard, Video, BarChart3, Settings, User } from 'lucide-react'

import { TbClipboardCopy } from 'react-icons/tb'

const API_BASE = 'http://localhost:5001/api'

function App() {
  const [count, setCount] = useState(0)
  const [videos, setVideos] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // Sidebar navigation links
  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "#dashboard",
      icon: <LayoutDashboard className="text-white h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Videos",
      href: "#videos", 
      icon: <Video className="text-white h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Analytics",
      href: "#analytics",
      icon: <BarChart3 className="text-white h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Settings",
      href: "#settings",
      icon: <Settings className="text-white h-5 w-5 flex-shrink-0" />
    }
  ];

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <div className="flex items-center gap-2 py-4">
              <img src={sidebar} alt="Elevator Pitch Logo" className="h-8 w-8 flex-shrink-0" />
              {sidebarOpen }
            </div>
            
            {/* Navigation Links */}
            <div className="mt-4 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          
          {/* User Profile */}
          <div>
            <SidebarLink
              link={{
                label: "Admin User",
                href: "#profile",
                icon: <User className="text-white h-5 w-5 flex-shrink-0" />
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div 
        className="main-content"
        style={{
          marginLeft: sidebarOpen ? '300px' : '60px'
        }}
      >
        <header className="app-header">
          <img src={logo} alt="Elevator Pitch Logo" className="app-logo" />
        </header>
      <div className='dashboard-container'>
        <h2 className='text-black' style={{ fontSize: '30px', fontWeight: '600' }}>Dashboard</h2>
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
        <div className='videos-list'>
          {videos.map((video) => (
            <div key={video._id} className='video-entry'>
              <div className='video-info'>
                <div className='video-details'>
                  <h3 className='video-title'>{video.title}</h3>
                  <p className='video-stats'>Views: {video.viewCount} • Unique Viewers: {video.uniqueViewers.length}</p>
                </div>
              </div>
              <div className='video-actions'>
                <button 
                  className='action-btn copy-btn'
                  onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:5001/api/videos/share/${video.shareId}`)
                    alert('Pitch copied to clipboard!')
                  }}
                >
                  <TbClipboardCopy />
                </button>
                <button className='action-btn insights-btn'>
                  View Insights
                </button>
                <button 
                  className='action-btn view-btn'
                  onClick={() => {
                    window.open(`http://localhost:5001/api/videos/share/${video.shareId}`, '_blank')
                  }}
                >
                  View Pitch
                </button>
                <button className='action-btn more-btn'>
                  ⋯
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

export default App
