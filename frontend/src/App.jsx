import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Card from './components/card/card.component'
import './components/card/card.styles.css'
import logo from './assets/logo.png'
import sidebar from './assets/elevatorpitch.png'
import downloadIcon from './assets/download.png'
import deleteIcon from './assets/delete.png'
import copyIcon from './assets/copy.png'
import { Sidebar, SidebarBody, SidebarLink } from './components/ui/sidebar'
import { LayoutDashboard, Video, BarChart3, Settings, User, UserCircle, ChevronDown } from 'lucide-react'
import FileInput from './components/ui/file-input'
import { motion } from 'framer-motion'
import RecruiterView from './components/RecruiterView'
import { NotFound } from './components/ui/ghost-404-page'
import ElevatorPitchForm from './components/ui/elevator-pitch-form'

import { ProfileForm } from './components/ui/profile-form'
import Toaster from './components/ui/toast'
import FooterSection from './components/ui/footer'
import AuthModal from './components/ui/auth-modal'

const API_BASE = 'http://localhost:5001/api'

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(0)
  const [videos, setVideos] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard') // Track active page
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null) // Track which video's dropdown is open
  const [viewingVideo, setViewingVideo] = useState(null)
  const [showElevatorPitchForm, setShowElevatorPitchForm] = useState(false)
  const [selectedVideoAnalytics, setSelectedVideoAnalytics] = useState(null)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const toasterRef = useRef(null)

  // Check if we're on a recruiter route
  const isRecruiterRoute = location.pathname.startsWith('/api/videos/share/')

  // Show auth modal if not authenticated and trying to access dashboard
  const showAuthIfNeeded = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const fetchVideos = () => {
    fetch('http://localhost:5001/api/videos')
      .then((response) => response.json())
      .then((videos) => setVideos(videos))
      .catch((error) => console.error('Error fetching videos:', error))
  }

  useEffect(() => {
    // Check for existing authentication
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      // Show auth modal immediately if not authenticated
      setShowAuthModal(true);
    }
    
    fetchVideos()
    
    // Load admin profile on app start
    fetchProfile()
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    toasterRef.current?.show({
      title: 'Logged Out',
      message: 'You have been logged out successfully',
      variant: 'success',
      position: 'top-right',
      duration: 2000
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('[data-dropdown]')) {
        setActiveDropdown(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown])

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

  const downloadResumeWithButton = async (shareId) => {
    try {
      const link = document.createElement('a');
      link.href = `http://localhost:5001/api/videos/share/${shareId}/resume`;
      link.download = `${profile?.firstName}_${profile?.lastName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toasterRef.current?.show({
        title: 'Downloaded!',
        message: 'Resume with elevator pitch button downloaded',
        variant: 'success',
        position: 'top-right',
        duration: 2000
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      toasterRef.current?.show({
        title: 'Error',
        message: 'Failed to download resume',
        variant: 'error',
        position: 'top-right',
        duration: 3000
      });
    }
  }

  const deleteVideo = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove video from local state
        setVideos(videos.filter(video => video._id !== videoId));
        
        toasterRef.current?.show({
          title: 'Deleted!',
          message: 'Elevator pitch deleted successfully',
          variant: 'success',
          position: 'top-right',
          duration: 2000
        });
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toasterRef.current?.show({
        title: 'Error',
        message: 'Failed to delete elevator pitch',
        variant: 'error',
        position: 'top-right',
        duration: 3000
      });
    }
  }

  const fetchVideoAnalytics = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/videos/${videoId}/stats`);
      if (response.ok) {
        const analyticsData = await response.json();
        setSelectedVideoAnalytics(analyticsData);
        setShowAnalyticsModal(true);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toasterRef.current?.show({
        title: 'Error',
        message: 'Failed to load analytics data',
        variant: 'error',
        position: 'top-right',
        duration: 3000
      });
    }
  };

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
    <Routes>
      {/* Recruiter Route - No sidebar, clean layout */}
      <Route path="/api/videos/share/:shareId" element={<RecruiterView />} />
      
      {/* 404 Error Page - No sidebar, clean layout */}
      <Route path="/404" element={<NotFound />} />
      
      {/* Admin Routes - Full layout with sidebar */}
      <Route path="/" element={
        <div className="app-layout">
          <Toaster ref={toasterRef} defaultPosition="top-right" />
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <div className="flex items-center gap-2 py-4">
              <img src={sidebar} alt="Elevator Pitch Logo" className="h-8 w-8 flex-shrink-0" />
              <motion.span
                animate={{ 
                  opacity: sidebarOpen ? 1 : 0,
                  width: sidebarOpen ? "auto" : 0
                }}
                transition={{ duration: 0.2 }}
                className="text-white font-semibold text-lg whitespace-nowrap overflow-hidden"
              >
                Elevator Pitch
              </motion.span>
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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className='btn-grad'
              onClick={() => setShowElevatorPitchForm(true)}
            >
              New Pitch
            </button>
            <div data-dropdown style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6'
              }}>
                {profile?.profilePicture ? (
                  <img 
                    src={`http://localhost:5001${profile.profilePicture}`} 
                    alt="Profile" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                ) : (
                  <User className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  minWidth: '160px'
                }}>
                  <button
                    onClick={() => {
                      setActivePage('profile')
                      setDropdownOpen(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        handleLogout()
                        setDropdownOpen(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      
      {/* Show auth modal if not authenticated */}
      {!isAuthenticated && (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Conditional rendering based on active page - only show if authenticated */}
      {isAuthenticated && activePage === 'view-pitch' ? (
        <div className="view-pitch-container" style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f3eeee'
        }}>
          {/* Header Section */}
          <div style={{
            backgroundColor: '#453431',
            padding: '2rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setActivePage('dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '16px'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>
                {profile?.firstName?.toUpperCase()} {profile?.lastName?.toUpperCase()}
              </h1>
              <p style={{ 
                fontSize: '1.2rem', 
                margin: '0.5rem 0 0 0',
                opacity: 0.9
              }}>
                {profile?.firstName} {profile?.lastName} - Software Developer
              </p>
            </div>
            <div style={{ width: '200px' }}></div>
          </div>
          
          {/* Profile Section */}
          <div style={{
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #453431',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6'
            }}>
              {profile?.profilePicture ? (
                <img 
                  src={`http://localhost:5001${profile.profilePicture}`} 
                  alt="Profile" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <User className="h-12 w-12 text-gray-500" />
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                margin: '0 0 0.5rem 0',
                color: '#1f2937'
              }}>
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#6b7280',
                margin: 0
              }}>
                Software Developer
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{
                backgroundColor: '#453431',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a4a47'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#453431'}
              >
                📁 Portfolio
              </button>
              <button style={{
                backgroundColor: '#453431',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a4a47'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#453431'}
              >
                💼 LinkedIn
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            gap: '2rem', 
            padding: '2rem',
            overflow: 'hidden'
          }}>
            {/* Video Section */}
            <div style={{ 
              flex: '0 0 400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  margin: '0 0 1rem 0',
                  color: '#1f2937'
                }}>
                  Elevator Pitch
                </h3>
                {viewingVideo && (
                  <video 
                    controls 
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      backgroundColor: '#000'
                    }}
                  >
                    <source src={`http://localhost:5001${viewingVideo.videoUrl}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={{
                  backgroundColor: '#453431',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1,
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5a4a47'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#453431'}
                >
                  ▶️ Play Pitch
                </button>
                <button style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1,
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  📄 Download Resume
                </button>
              </div>
            </div>

            {/* Resume Preview Section */}
            <div style={{ 
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  margin: 0,
                  color: '#1f2937'
                }}>
                  Resume Preview
                </h3>
              </div>
              
              <div style={{ 
                flex: 1, 
                padding: '2rem',
                overflow: 'auto',
                backgroundColor: 'white'
              }}>
                {/* Resume Content */}
                <div style={{ 
                  maxWidth: '800px',
                  margin: '0 auto',
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1.6'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 'bold', 
                      margin: '0 0 1rem 0',
                      color: '#1f2937'
                    }}>
                      {profile?.firstName} {profile?.lastName}
                    </h1>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>📞 {profile?.phone || '+1 (555) 123-4567'}</span>
                      <span>|</span>
                      <span>✉️ {profile?.email || 'email@example.com'}</span>
                      <span>|</span>
                      <span>🌐 {profile?.portfolioUrl || 'portfolio.com'}</span>
                      <span>|</span>
                      <span>💼 {profile?.linkedInUrl || 'linkedin.com/in/profile'}</span>
                    </div>
                  </div>

                  <hr style={{ border: '1px solid #e5e7eb', margin: '2rem 0' }} />

                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      margin: '0 0 1rem 0',
                      color: '#1f2937',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Education
                    </h2>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '600', 
                            margin: '0 0 0.5rem 0',
                            color: '#1f2937'
                          }}>
                            University of Sheffield
                          </h3>
                          <p style={{ 
                            fontSize: '1rem', 
                            margin: '0 0 0.5rem 0',
                            color: '#374151'
                          }}>
                            Bachelor of Science in Computer Science
                          </p>
                          <p style={{ 
                            fontSize: '0.9rem', 
                            margin: 0,
                            color: '#6b7280'
                          }}>
                            Upper Second Class Degree. Modules: Java Programming, Software Development for Mobile Devices, Internet of Things, Machine Learning and AI, Devices and Networks.
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#6b7280' }}>
                          <p style={{ margin: '0 0 0.25rem 0' }}>Sheffield, England</p>
                          <p style={{ margin: 0 }}>September 2022 - June 2025</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '600', 
                            margin: '0 0 0.5rem 0',
                            color: '#1f2937'
                          }}>
                            INTO Manchester
                          </h3>
                          <p style={{ 
                            fontSize: '1rem', 
                            margin: '0 0 0.5rem 0',
                            color: '#374151'
                          }}>
                            NCUK International Foundation Year in Sciences and Engineering
                          </p>
                          <p style={{ 
                            fontSize: '0.9rem', 
                            margin: 0,
                            color: '#6b7280'
                          }}>
                            Grades: Engineering Mathematics A*, English for Academic Purposes A*, Physics A, Further Mathematics A*.
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#6b7280' }}>
                          <p style={{ margin: '0 0 0.25rem 0' }}>Manchester, England</p>
                          <p style={{ margin: 0 }}>September 2021 - June 2022</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: '1px solid #e5e7eb', margin: '2rem 0' }} />

                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      margin: '0 0 1rem 0',
                      color: '#1f2937',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Experience
                    </h2>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '600', 
                            margin: '0 0 0.5rem 0',
                            color: '#1f2937'
                          }}>
                            180 Degrees Consulting
                          </h3>
                          <p style={{ 
                            fontSize: '1rem', 
                            margin: '0 0 0.5rem 0',
                            color: '#374151'
                          }}>
                            Software Developer Intern
                          </p>
                          <p style={{ 
                            fontSize: '0.9rem', 
                            margin: 0,
                            color: '#6b7280'
                          }}>
                            Developed web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions. Implemented responsive designs and optimized application performance.
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#6b7280' }}>
                          <p style={{ margin: '0 0 0.25rem 0' }}>Sheffield, England</p>
                          <p style={{ margin: 0 }}>June 2023 - August 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activePage === 'profile' ? (
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
                />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1' }}>
              {/* Profile Picture Display Section */}
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
                </div>
              </div>

              {/* File Upload Section */}
              <div className="upload-section" style={{ 
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
                  Upload New Picture
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <FileInput
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                    maxSizeInMB={30}
                    onFileChange={async (files) => {
                      const file = files[0];
                      if (file) {
                        await uploadProfilePicture(file);
                      }
                    }}
                    allowMultiple={false}
                  />
                </div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'center',
                  margin: '1rem 0 0 0'
                }}>
                  JPG, PNG or GIF • Max size 30MB
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Dashboard - only show if authenticated */}
      {isAuthenticated && activePage !== 'view-pitch' && (
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
                    navigator.clipboard.writeText(`http://localhost:5173/api/videos/share/${video.shareId}`)
                    toasterRef.current?.show({
                      title: 'Copied!',
                      message: 'Pitch link copied to clipboard',
                      variant: 'success',
                      position: 'top-right',
                      duration: 2000
                    })
                  }}
                >
                      <img src={copyIcon} alt="Copy" className="w-10 h-6" />
                    </button>
                    <button 
                      className='action-btn insights-btn'
                      onClick={() => fetchVideoAnalytics(video._id)}
                    >
                      View Insights
                    </button>
                    <button 
                      className='action-btn view-btn'
                      onClick={() => {
                        if (video.shareId) {
                          navigate(`/api/videos/share/${video.shareId}`)
                        } else {
                          toasterRef.current?.show({
                            title: 'Error',
                            message: 'No share link available for this pitch',
                            variant: 'error',
                            position: 'top-right',
                            duration: 3000
                          });
                        }
                      }}
                    >
                      View Pitch
                    </button>
                    <div className="relative" data-dropdown>
                      <button 
                        className='action-btn more-btn'
                        onClick={() => setActiveDropdown(activeDropdown === video._id ? null : video._id)}
                      >
                        ⋯
                      </button>
                      
                      {activeDropdown === video._id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="py-1">
                            {video.shareId && (
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                style={{ backgroundColor: 'white' }}
                                onClick={() => {
                                  downloadResumeWithButton(video.shareId);
                                  setActiveDropdown(null);
                                }}
                              >
                                <img src={downloadIcon} alt="Download" className="w-4 h-4" />
                                Download Resume
                              </button>
                            )}
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              style={{ backgroundColor: 'white' }}
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this elevator pitch? This action cannot be undone.')) {
                                  deleteVideo(video._id);
                                  setActiveDropdown(null);
                                }
                              }}
                            >
                              <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                              Delete Pitch
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </>
      )}

      {/* Footer - always visible */}
      <FooterSection />
      
      {/* Elevator Pitch Form Modal */}
      {showElevatorPitchForm && (
        <ElevatorPitchForm 
          onClose={() => setShowElevatorPitchForm(false)}
          profile={profile}
          onUpdateProfile={updateProfile}
          onPitchCreated={fetchVideos}
        />
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedVideoAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Analytics: {selectedVideoAnalytics.title}
              </h2>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Overview Stats */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600 mb-1">Total Views</h3>
                <p className="text-2xl font-bold text-blue-900">{selectedVideoAnalytics.viewCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600 mb-1">Unique Viewers</h3>
                <p className="text-2xl font-bold text-green-900">{selectedVideoAnalytics.uniqueViewers}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600 mb-1">Completion Rate</h3>
                <p className="text-2xl font-bold text-purple-900">{selectedVideoAnalytics.completionRate.toFixed(1)}%</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600 mb-1">Avg Watch Time</h3>
                <p className="text-2xl font-bold text-orange-900">{selectedVideoAnalytics.avgWatchTime}s</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Engagement Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Resume Downloads</h3>
                <p className="text-xl font-bold text-gray-900">{selectedVideoAnalytics.totalResumeDownloads}</p>
                <p className="text-sm text-gray-500">{selectedVideoAnalytics.resumeDownloadRate}% of viewers</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Portfolio Clicks</h3>
                <p className="text-xl font-bold text-gray-900">{selectedVideoAnalytics.totalPortfolioClicks}</p>
                <p className="text-sm text-gray-500">{selectedVideoAnalytics.portfolioClickRate}% of viewers</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">LinkedIn Clicks</h3>
                <p className="text-xl font-bold text-gray-900">{selectedVideoAnalytics.totalLinkedinClicks}</p>
                <p className="text-sm text-gray-500">{selectedVideoAnalytics.linkedinClickRate}% of viewers</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">First Viewed</p>
                    <p className="font-medium">
                      {selectedVideoAnalytics.firstViewed 
                        ? new Date(selectedVideoAnalytics.firstViewed).toLocaleString()
                        : 'Not yet viewed'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Viewed</p>
                    <p className="font-medium">
                      {selectedVideoAnalytics.lastViewed 
                        ? new Date(selectedVideoAnalytics.lastViewed).toLocaleString()
                        : 'Not yet viewed'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Viewer Analytics */}
            {selectedVideoAnalytics.viewerAnalytics && selectedVideoAnalytics.viewerAnalytics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Individual Viewer Details</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Viewer ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Watch Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resume</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Portfolio</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">LinkedIn</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last View</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedVideoAnalytics.viewerAnalytics.map((viewer, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                              {viewer.viewerId.substring(0, 12)}...
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {viewer.watchTime}s
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                viewer.completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {viewer.completed ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                viewer.resumeDownloaded 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {viewer.resumeDownloaded ? 'Downloaded' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                viewer.portfolioClicked 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {viewer.portfolioClicked ? 'Clicked' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                viewer.linkedinClicked 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {viewer.linkedinClicked ? 'Clicked' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {new Date(viewer.lastView).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <Toaster ref={toasterRef} />
      </div>
    </div>
        } />
      
      {/* Fallback route for all unmatched paths */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
