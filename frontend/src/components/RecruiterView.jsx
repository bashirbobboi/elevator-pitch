import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import linkedInLogo from '../assets/linkedIN.png';
import portfolioLogo from '../assets/portfolio.png';
import downloadGif from '../assets/download2.gif';
import playGif from '../assets/play.png';
import workLogo from '../assets/work.png';
import FooterSection from './ui/footer';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const API_SERVER = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001';

// Helper function to get the correct image URL (handles both local and Cloudinary URLs)
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL (Cloudinary), use it as-is
  if (imagePath.startsWith('http')) return imagePath;
  // If it's a local path, prepend API_SERVER
  return `${API_SERVER}${imagePath}`;
};

const RecruiterView = () => {
  const { shareId } = useParams();
  const [video, setVideo] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoPosition, setVideoPosition] = useState(() => {
    // Mobile-friendly initial positioning
    const isMobile = window.innerWidth < 768;
    return {
      x: isMobile ? 10 : window.innerWidth - 420,
      y: isMobile ? 100 : 250
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showVideoModal) {
        setShowVideoModal(false);
      }
    };

    if (showVideoModal) {
      document.addEventListener('keydown', handleEscape);
      // Only prevent scrolling on mobile (full-screen modal)
      // Allow scrolling on desktop where video is draggable
      const isMobile = window.innerWidth < 640; // sm breakpoint
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore scrolling when video modal is closed (only if it was disabled)
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [showVideoModal]);

  // Handle mouse events for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - videoPosition.x,
      y: e.clientY - videoPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setVideoPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    let isCancelled = false; // Prevent double execution in StrictMode
    
    const fetchData = async () => {
      if (isCancelled) return;
      
      try {
        setLoading(true);
        
        // Generate or get viewerId before making the request
        let viewerId = localStorage.getItem('viewerId');
        if (!viewerId) {
          viewerId = generateViewerId();
        }
        
        // Add a small delay to prevent rapid duplicate requests in StrictMode
        // This helps ensure localStorage is properly set before making the request
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isCancelled) return;
        
        // Fetch video data
        const videoResponse = await fetch(`${API_BASE}/videos/share/${shareId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ viewerId })
        });

        if (!videoResponse.ok) {
          if (!isCancelled) setError('Video not found');
          return;
        }

        const videoData = await videoResponse.json();
        if (!isCancelled) setVideo(videoData);

        // Fetch profile data
        const profileResponse = await fetch(`${API_BASE}/profile`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (!isCancelled) setProfile(profileData);
        }

      } catch (err) {
        if (!isCancelled) {
          setError('Failed to load content');
          console.error('Error fetching data:', err);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (shareId) {
      fetchData();
    }

    // Cleanup function to prevent double execution
    return () => {
      isCancelled = true;
    };
  }, [shareId]);

  // Auto-play video when page loads
  useEffect(() => {
    if (video && !loading && !error) {
      setShowVideoModal(true);
    }
  }, [video, loading, error]);

  const generateViewerId = () => {
    const viewerId = 'viewer_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('viewerId', viewerId);
    return viewerId;
  };

  const handleDownloadResume = async () => {
    if (profile?.resume) {
      // Track resume download
      await trackButtonClick('resume');
      
      // Download original resume (without button) for recruiter view
      const link = document.createElement('a');
      link.href = `${API_SERVER}${profile.resume}`;
      link.download = `${profile.firstName}_${profile.lastName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Track button clicks with debouncing to prevent duplicates
  const trackButtonClick = (() => {
    const clickedButtons = new Set();
    
    return async (buttonType) => {
      try {
        const viewerId = localStorage.getItem('viewerId');
        if (!viewerId || !shareId) return;

        // Prevent duplicate tracking for the same button within a short time
        const clickKey = `${buttonType}_${Date.now()}`;
        const recentClickKey = `${buttonType}_recent`;
        
        if (clickedButtons.has(recentClickKey)) return;
        
        clickedButtons.add(recentClickKey);
        
        // Remove the debounce after 1 second to allow legitimate re-clicks
        setTimeout(() => {
          clickedButtons.delete(recentClickKey);
        }, 1000);

        await fetch(`${API_BASE}/videos/share/${shareId}/track-click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ viewerId, buttonType })
        });
      } catch (error) {
        console.error('Error tracking button click:', error);
      }
    };
  })();

  // Track video watch progress
  const trackWatchProgress = async (currentTime, duration) => {
    try {
      const viewerId = localStorage.getItem('viewerId');
      if (!viewerId || !shareId) return;

      await fetch(`${API_BASE}/videos/share/${shareId}/track-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewerId, currentTime, duration })
      });
    } catch (error) {
      console.error('Error tracking watch progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading elevator pitch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h1>
          <p className="text-gray-600">The elevator pitch you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top section with profile layout */}
      <div 
        className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12"
        style={{ backgroundColor: '#a2ab82' }}
      >
          <div className="max-w-6xl mx-auto">
            {/* Mobile Layout - Stacked */}
            <div className="block lg:hidden">
              {/* Profile Picture - Centered on Mobile */}
              <div className="flex justify-center mb-6">
                <div 
                  className="rounded-full overflow-hidden border-4 border-white shadow-lg"
                  style={{ width: '160px', height: '160px' }}
                >
                  {profile?.profilePicture ? (
                    <img 
                      src={getImageUrl(profile.profilePicture)}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info - Centered */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {profile?.firstName?.toUpperCase()} {profile?.lastName?.toUpperCase()}
                </h1>
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                    <img src={workLogo} alt="Work" className="w-5 h-5" />
                    <span className="text-xs sm:text-sm font-medium">
                      {video?.title || `${profile?.firstName} ${profile?.lastName} - Software Developer`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Links - Centered on Mobile */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                {profile?.portfolioUrl && (
                  <a 
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackButtonClick('portfolio')}
                    onMouseDown={() => trackButtonClick('portfolio')}
                    onContextMenu={() => trackButtonClick('portfolio')}
                    className="text-white hover:text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #485563 0%, #29323c 51%, #485563 100%)',
                      backgroundSize: '200% auto',
                      transition: '0.5s',
                      borderRadius: '10px',
                    }}
                  >
                    <img src={portfolioLogo} alt="Portfolio" className="w-5 h-5" />
                    Portfolio
                  </a>
                )}
                {profile?.linkedInUrl && (
                  <a 
                    href={profile.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackButtonClick('linkedin')}
                    onMouseDown={() => trackButtonClick('linkedin')}
                    onContextMenu={() => trackButtonClick('linkedin')}
                    className="text-white hover:text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #0072B1 0%, #005A8B 51%, #0072B1 100%)',
                      backgroundSize: '200% auto',
                      transition: '0.5s',
                      borderRadius: '10px',
                    }}
                  >
                    <img src={linkedInLogo} alt="LinkedIn" className="w-5 h-5" />
                    LinkedIn
                  </a>
                )}
              </div>

              {/* Action Buttons - Full Width on Mobile */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setVideoError(false);
                    setShowVideoModal(true);
                  }}
                  className="px-6 py-4 font-semibold flex items-center justify-center gap-2 w-full text-sm sm:text-base"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #EFEFBB 0%, #D4D3DD 51%, #EFEFBB 100%)',
                    backgroundSize: '200% auto',
                    transition: '0.5s',
                    boxShadow: '0 0 20px #eee',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    color: 'black'
                  }}
                >
                  <img src={playGif} alt="Play" className="w-5 h-5" />
                  Play Elevator Pitch
                </button>
                <button 
                  onClick={handleDownloadResume}
                  className="text-white px-6 py-4 font-semibold flex items-center justify-center gap-2 w-full text-sm sm:text-base"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #16222A 0%, #3A6073 51%, #16222A 100%)',
                    backgroundSize: '200% auto',
                    transition: '0.5s',
                    boxShadow: '0 0 20px #eee',
                    borderRadius: '20px',
                    textTransform: 'uppercase'
                  }}
                >
                  <img src={downloadGif} alt="Download" className="w-5 h-5" />
                  Download Resume
                </button>
              </div>
            </div>

            {/* Desktop Layout - Side by Side */}
            <div className="hidden lg:flex items-center gap-12">
              {/* Profile Picture - Left Side */}
              <div className="flex-shrink-0">
                <div 
                  className="rounded-full overflow-hidden border-4 border-white shadow-lg"
                  style={{ width: '240px', height: '240px' }}
                >
                  {profile?.profilePicture ? (
                    <img 
                      src={getImageUrl(profile.profilePicture)}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info - Center */}
              <div className="flex-1">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {profile?.firstName?.toUpperCase()} {profile?.lastName?.toUpperCase()}
                  </h1>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <img src={workLogo} alt="Work" className="w-6 h-6" />
                      <span className="text-sm font-medium">{video?.title || `${profile?.firstName} ${profile?.lastName} - Software Developer`}</span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-4">
                  {profile?.portfolioUrl && (
                    <a 
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackButtonClick('portfolio')}
                      onMouseDown={() => trackButtonClick('portfolio')}
                      onContextMenu={() => trackButtonClick('portfolio')}
                      className="text-white hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      style={{
                        backgroundImage: 'linear-gradient(to right, #485563 0%, #29323c 51%, #485563 100%)',
                        backgroundSize: '200% auto',
                        transition: '0.5s',
                        borderRadius: '10px',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundPosition = 'right center';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundPosition = 'left center';
                      }}
                    >
                      <img 
                          src={portfolioLogo} 
                          alt="Portfolio" 
                          className="w-6 h-6"
                        />
                      Portfolio
                    </a>
                  )}
                  {profile?.linkedInUrl && (
                    <a 
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackButtonClick('linkedin')}
                      onMouseDown={() => trackButtonClick('linkedin')}
                      onContextMenu={() => trackButtonClick('linkedin')}
                      className="text-white hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      style={{
                        backgroundImage: 'linear-gradient(to right, #0072B1 0%, #005A8B 51%, #0072B1 100%)',
                        backgroundSize: '200% auto',
                        transition: '0.5s',
                        borderRadius: '10px',
              
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundPosition = 'right center';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundPosition = 'left center';
                      }}
                    >
                      <img 
                        src={linkedInLogo} 
                        alt="LinkedIn" 
                        className="w-6 h-6"
                      />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons - Right Side */}
              <div className="flex flex-col gap-4 w-80">
                <button 
                  onClick={() => {
                    setVideoError(false);
                    setShowVideoModal(true);
                  }}
                  className="px-6 py-4 font-semibold flex items-center justify-center gap-2 w-full"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #EFEFBB 0%, #D4D3DD 51%, #EFEFBB 100%)',
                    backgroundSize: '200% auto',
                    transition: '0.5s',
                    boxShadow: '0 0 20px #eee',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    color: 'black'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundPosition = 'right center';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundPosition = 'left center';
                  }}
                >
                  <img src={playGif} alt="Play" className="w-6 h-6" />
                  Play Elevator Pitch
                </button>
                <button 
                  onClick={handleDownloadResume}
                  className="text-white px-6 py-4 font-semibold flex items-center justify-center gap-2 w-full"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #16222A 0%, #3A6073 51%, #16222A 100%)',
                    backgroundSize: '200% auto',
                    transition: '0.5s',
                    boxShadow: '0 0 20px #eee',
                    borderRadius: '20px',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundPosition = 'right center';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundPosition = 'left center';
                  }}
                >
                  <img src={downloadGif} alt="Download" className="w-6 h-6" />
                  Download Resume
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Resume Display Section */}
      <div className="min-h-[60vh] w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12" style={{ backgroundColor: '#f4f4f2' }}>
        <div className="max-w-4xl mx-auto">
          {profile?.resume ? (
            <div className="w-full h-[80vh] sm:h-[100vh] lg:h-[130vh] border border-gray-300 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`${API_SERVER}${profile.resume}`}
                className="w-full h-full border-0"
                title="Resume PDF"
              />
            </div>
          ) : (
            <div className="w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl lg:text-6xl text-gray-400 mb-4 block">📄</span>
                <p className="text-gray-500 text-base sm:text-lg">No resume available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Video Player */}
      {showVideoModal && video && (
        <>
          {/* Mobile: Full-screen modal */}
          <div className="block sm:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
              <div className="w-full h-full flex flex-col">
                {/* Close button */}
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-lg"
                  >
                    ×
                  </button>
                </div>
                
                {/* Video container */}
                <div className="flex-1 flex items-center justify-center p-4">
                  {video.videoUrl && !videoError && (
                    <video
                      controls
                      autoPlay
                      muted
                      className="w-full h-auto max-h-full bg-black rounded-lg"
                      onLoadStart={() => setVideoError(false)}
                      onCanPlay={() => setVideoError(false)}
                      onTimeUpdate={(e) => {
                        const currentTime = e.target.currentTime;
                        const duration = e.target.duration;
                        if (duration && currentTime) {
                          if (Math.floor(currentTime) % 5 === 0) {
                            trackWatchProgress(currentTime, duration);
                          }
                        }
                      }}
                      onEnded={(e) => {
                        const duration = e.target.duration;
                        if (duration) {
                          trackWatchProgress(duration, duration);
                        }
                      }}
                      onError={(e) => {
                        console.error('Video playback error:', e);
                        setTimeout(() => {
                          if (e.target.error) {
                            setVideoError(true);
                          }
                        }, 1000);
                      }}
                    >
                      <source src={`${API_SERVER}${video.videoUrl}`} type="video/mp4" />
                      <source src={`${API_SERVER}${video.videoUrl}`} type="video/webm" />
                      <source src={`${API_SERVER}${video.videoUrl}`} type="video/mov" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {videoError && (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <div className="text-6xl mb-4">🎥</div>
                      <p className="text-gray-600 mb-4 text-lg">Unable to play video</p>
                      <button
                        onClick={() => setVideoError(false)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Draggable widget */}
          <div className="hidden sm:block">
            <div 
              className="fixed z-50"
              style={{
                left: `${videoPosition.x}px`,
                top: `${videoPosition.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
            >
              {video.videoUrl && !videoError && (
                <video
                  controls
                  autoPlay
                  muted
                  className="bg-black rounded-lg shadow-2xl"
                  style={{ 
                    width: window.innerWidth < 1024 ? '200px' : '240px', 
                    height: window.innerWidth < 1024 ? '250px' : '300px', 
                    objectFit: 'cover' 
                  }}
                  onLoadStart={() => setVideoError(false)}
                  onCanPlay={() => setVideoError(false)}
                  onTimeUpdate={(e) => {
                    const currentTime = e.target.currentTime;
                    const duration = e.target.duration;
                    if (duration && currentTime) {
                      if (Math.floor(currentTime) % 5 === 0) {
                        trackWatchProgress(currentTime, duration);
                      }
                    }
                  }}
                  onEnded={(e) => {
                    const duration = e.target.duration;
                    if (duration) {
                      trackWatchProgress(duration, duration);
                    }
                  }}
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    setTimeout(() => {
                      if (e.target.error) {
                        setVideoError(true);
                      }
                    }, 1000);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <source src={`${API_SERVER}${video.videoUrl}`} type="video/mp4" />
                  <source src={`${API_SERVER}${video.videoUrl}`} type="video/webm" />
                  <source src={`${API_SERVER}${video.videoUrl}`} type="video/mov" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {videoError && (
                <div 
                  className="bg-gray-100 rounded-lg shadow-2xl flex items-center justify-center" 
                  style={{ 
                    width: window.innerWidth < 1024 ? '200px' : '240px', 
                    height: window.innerWidth < 1024 ? '250px' : '300px' 
                  }}
                >
                  <div className="text-center p-4">
                    <div className="text-3xl mb-3">🎥</div>
                    <p className="text-gray-600 mb-3 text-sm">Unable to play video</p>
                    <button
                      onClick={() => setVideoError(false)}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              {/* Close button overlay */}
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute -top-2 -right-2 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg" 
                style={{ backgroundColor: 'rgb(0, 0, 0, 0.6)' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                ×
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default RecruiterView;
