import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const RecruiterView = () => {
  const { shareId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/videos/share/${shareId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            viewerId: localStorage.getItem('viewerId') || generateViewerId()
          })
        });

        if (response.ok) {
          const videoData = await response.json();
          setVideo(videoData);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        setError('Failed to load video');
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchVideo();
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
      {/* Top 20% with solid background */}
      <div 
        className="h-[40vh] w-full flex items-center justify-center"
        style={{ backgroundColor: '#f1efe0' }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {video?.title || 'Elevator Pitch'}
          </h1>
          <p className="text-gray-600">
            Professional Introduction
          </p>
        </div>
      </div>

      {/* Rest of the page - blank for now */}
      <div className="h-[80vh] w-full bg-white">
        {/* This will be where the video content goes later */}
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Video content will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterView;
