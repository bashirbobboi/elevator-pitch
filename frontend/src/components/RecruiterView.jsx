import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import linkedInLogo from '../assets/linkedIN.png';
import portfolioLogo from '../assets/portfolio.png';
import downloadGif from '../assets/download2.gif';
import playGif from '../assets/play.png';
import workLogo from '../assets/work.png';

const RecruiterView = () => {
  const { shareId } = useParams();
  const [video, setVideo] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showVideoModal) {
        setShowVideoModal(false);
      }
    };

    if (showVideoModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch video data
        const videoResponse = await fetch(`http://localhost:5001/api/videos/share/${shareId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            viewerId: localStorage.getItem('viewerId') || generateViewerId()
          })
        });

        if (!videoResponse.ok) {
          setError('Video not found');
          return;
        }

        const videoData = await videoResponse.json();
        setVideo(videoData);

        // Fetch profile data
        const profileResponse = await fetch('http://localhost:5001/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
        }

      } catch (err) {
        setError('Failed to load content');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchData();
    }
  }, [shareId]);

  const generateViewerId = () => {
    const viewerId = 'viewer_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('viewerId', viewerId);
    return viewerId;
  };

  const handleDownloadResume = () => {
    if (profile?.resume) {
      // Download original resume (without button) for recruiter view
      const link = document.createElement('a');
      link.href = `http://localhost:5001${profile.resume}`;
      link.download = `${profile.firstName}_${profile.lastName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        className="w-full px-8 py-12"
        style={{ backgroundColor: '#a2ab82' }}
      >
          <div className="max-w-6xl mx-auto flex items-center gap-12">
            {/* Profile Picture - Left Side */}
            <div className="flex-shrink-0">
              <div 
                className="rounded-full overflow-hidden border-4 border-white shadow-lg"
                style={{ width: '240px', height: '240px' }}
              >
                {profile?.profilePicture ? (
                  <img 
                    src={`http://localhost:5001${profile.profilePicture}`}
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
                    className="btn-grad text-white hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #485563 0%, #29323c 51%, #485563 100%)',
                      backgroundSize: '200% auto',
                      transition: '0.5s',
                      boxShadow: '0 0 20px #eee',
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
                    className="btn-grad text-white hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #0072B1 0%, #005A8B 51%, #0072B1 100%)',
                      backgroundSize: '200% auto',
                      transition: '0.5s',
                      boxShadow: '0 0 20px #eee',
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
                className="btn-grad px-6 py-4 font-semibold flex items-center justify-center gap-2 w-full"
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
                className="btn-grad text-white px-6 py-4 font-semibold flex items-center justify-center gap-2 w-full"
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

      {/* Resume Display Section */}
      <div className="min-h-[60vh] w-full px-8 py-12" style={{ backgroundColor: '#f4f4f2' }}>
        <div className="max-w-4xl mx-auto">
          {profile?.resume ? (
            <div className="w-full h-[130vh] border border-gray-300 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`http://localhost:5001${profile.resume}`}
                className="w-full h-full border-0"
                title="Resume PDF"
              />
            </div>
          ) : (
            <div className="w-full h-[70vh] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <span className="text-6xl text-gray-400 mb-4 block">📄</span>
                <p className="text-gray-500 text-lg">No resume available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && video && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.firstName} {profile?.lastName}'s Elevator Pitch
              </h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full">
              {video.videoUrl && !videoError && (
                <video
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[70vh] bg-black rounded-lg"
                  onLoadStart={() => setVideoError(false)}
                  onCanPlay={() => setVideoError(false)}
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    // Only set error after a delay to allow other sources to try
                    setTimeout(() => {
                      if (e.target.error) {
                        setVideoError(true);
                      }
                    }, 1000);
                  }}
                >
                  <source src={`http://localhost:5001${video.videoUrl}`} type="video/mp4" />
                  <source src={`http://localhost:5001${video.videoUrl}`} type="video/webm" />
                  <source src={`http://localhost:5001${video.videoUrl}`} type="video/mov" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {videoError && (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎥</div>
                    <p className="text-gray-600 mb-2">Unable to play video</p>
                    <p className="text-sm text-gray-500">The video format may not be supported by your browser.</p>
                    <button
                      onClick={() => {
                        setVideoError(false);
                        // Try to reload the video
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {video.title}
              </h3>
              
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowVideoModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterView;
