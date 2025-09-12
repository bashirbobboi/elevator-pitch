import { useState, useEffect, useRef } from 'react'
import './App.css'
import Card from './components/card/card.component'
import './components/card/card.styles.css'
import logo from './assets/logo.png'
import sidebar from './assets/elevatorpitch.png'
import { Sidebar, SidebarBody, SidebarLink } from './components/ui/sidebar'
import { LayoutDashboard, Video, BarChart3, Settings, User, UserCircle } from 'lucide-react'

import { TbClipboardCopy } from 'react-icons/tb'
import { ProfileForm } from './components/ui/profile-form'
import Toaster from './components/ui/toast'

const API_BASE = 'http://localhost:5001/api'

function App() {
  const [count, setCount] = useState(0)
  const [videos, setVideos] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard') // Track active page
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const toasterRef = useRef(null)

  useEffect(() => {
    fetch('http://localhost:5001/api/videos')
      .then((response) => response.json())
      .then((videos) => setVideos(videos))
      .catch((error) => console.error('Error fetching videos:', error))
    
    // Load admin profile on app start
    fetchProfile()
  }, []);

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

  // Profile functions
  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      const response = await fetch(`${API_BASE}/profile`)
      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  const saveProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })
      
      if (response.ok) {
        const savedProfile = await response.json()
        setProfile(savedProfile)
        return { success: true, data: savedProfile }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      return { success: false, error: 'Failed to save profile' }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })
      
      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        return { success: true, data: updatedProfile }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'Failed to update profile' }
    }
  }

  const uploadProfilePicture = async (file) => {
    try {
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const formData = new FormData()
      formData.append('profilePicture', file)

      console.log('FormData created, sending request to:', `${API_BASE}/profile/upload-picture`);

      const response = await fetch(`${API_BASE}/profile/upload-picture`, {
        method: 'POST',
        body: formData,
      })
      
      console.log('Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result);
        setProfile(prev => ({
          ...prev,
          profilePicture: result.profilePicture
        }))
        toasterRef.current?.show({
          title: 'Success',
          message: 'Profile picture uploaded successfully!',
          variant: 'success',
          position: 'top-right',
          duration: 3000
        })
        return { success: true, data: result }
      } else {
        const error = await response.json()
        console.error('Upload failed:', error);
        toasterRef.current?.show({
          title: 'Upload Failed',
          message: error.error || 'Failed to upload profile picture',
          variant: 'error',
          position: 'top-right',
          duration: 4000
        })
        return { success: false, error: error.error }
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toasterRef.current?.show({
        title: 'Upload Error',
        message: 'Failed to upload profile picture',
        variant: 'error',
        position: 'top-right',
        duration: 4000
      })
      return { success: false, error: 'Failed to upload profile picture' }
    }
  }

  // Sidebar navigation links
  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "#dashboard",
      page: "dashboard",
      icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Videos",
      href: "#videos", 
      page: "videos",
      icon: <Video className="h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Analytics",
      href: "#analytics",
      page: "analytics",
      icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Profile",
      href: "#profile",
      page: "profile",
      icon: <UserCircle className="h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Settings",
      href: "#settings",
      page: "settings",
      icon: <Settings className="h-5 w-5 flex-shrink-0" />
    }
  ];

  return (
    <div className="app-layout">
      <Toaster ref={toasterRef} defaultPosition="top-right" />
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
                <SidebarLink 
                  key={idx} 
                  link={link} 
                  isActive={activePage === link.page}
                  onClick={() => setActivePage(link.page)}
                />
              ))}
            </div>
          </div>
          
          {/* User Profile */}
          <div>
            <SidebarLink
              link={{
                label: "Admin User",
                href: "#profile",
                icon: <User className="h-5 w-5 flex-shrink-0" />
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
          <button className='action-btn insights-btn' style={{ marginLeft: 'auto', padding: '0.5rem 1rem' }}>
            New Pitch
          </button>
        </header>
      
      {/* Conditional rendering based on active page */}
      {activePage === 'profile' ? (
        <div className="profile-container" style={{ padding: '1rem', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
          <h2 className='text-black' style={{ fontSize: '24px', fontWeight: '600', marginBottom: '1rem' }}>Profile</h2>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', justifyContent: 'flex-start', height: 'calc(100% - 60px)' }}>
            <div style={{ flex: '0 0 auto', marginRight: '2rem' }}>
              {profileLoading ? (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <p>Loading profile...</p>
                </div>
              ) : (
                <ProfileForm 
                  profile={profile}
                  onSaveProfile={saveProfile}
                  onUpdateProfile={updateProfile}
                  onUploadPicture={uploadProfilePicture}
                />
              )}
            </div>
            <div className="profile-picture-section" style={{ 
              width: '100%',
              maxWidth: '42rem',
              minWidth: '32rem',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              height: 'fit-content'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Profile Picture
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {profileLoading ? (
                  <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Loading...</p>
                  </div>
                ) : (
                  <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    border: '2px dashed #d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden'
                  }}>
                    {profile?.profilePicture ? (
                      <img 
                        src={`http://localhost:5001${profile.profilePicture}`}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                    ) : (
                      <UserCircle size={48} color="#9ca3af" />
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      await uploadProfilePicture(file);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: profileLoading ? '#f9fafb' : 'white',
                    border: '1px solid rgb(135,84,78)',
                    borderRadius: '8px',
                    color: profileLoading ? '#9ca3af' : 'rgb(135,84,78)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: profileLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                    opacity: profileLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!profileLoading) {
                      e.target.style.backgroundColor = '#e8e0d8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!profileLoading) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {profileLoading ? 'Loading...' : (profile?.profilePicture ? 'Change Photo' : 'Upload Photo')}
                </label>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'center',
                  margin: 0
                }}>
                  JPG, PNG or GIF<br />
                  Max size 30MB
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
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
                    toasterRef.current?.show({
                      title: 'Copied!',
                      message: 'Pitch link copied to clipboard',
                      variant: 'success',
                      position: 'top-right',
                      duration: 2000
                    })
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
        </>
      )}
      </div>
    </div>
  )
}

export default App
