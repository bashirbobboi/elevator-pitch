import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const RecruiterView = () => {
  const { shareId } = useParams();
  const [video, setVideo] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        style={{ backgroundColor: '#f1efe0' }}
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

          {/* Profile Info - Right Side */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {profile?.firstName?.toUpperCase()} {profile?.lastName?.toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <span>💼</span>
                  <span className="text-sm font-medium">{profile?.firstName} {profile?.lastName} - Software Developer</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button 
                className="bg-green-400 hover:bg-green-500 text-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors"
              >
                <span>▶</span>
                Play Elevator Pitch
              </button>
              <button 
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors"
              >
                <span>⬇</span>
                Download Resume
              </button>
            </div>

            {/* Links */}
            <div className="flex gap-4">
              {profile?.portfolioUrl && (
                <a 
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span>🌐</span>
                  Portfolio
                </a>
              )}
              {profile?.linkedInUrl && (
                <a 
                  href={profile.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span>💼</span>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the page - blank for now */}
      <div className="min-h-[60vh] w-full bg-white">
        {/* This will be where the video content goes later */}
        <div className="flex items-center justify-center h-full py-20">
          <p className="text-gray-500">Video content will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterView;
