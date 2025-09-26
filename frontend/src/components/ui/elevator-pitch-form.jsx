"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import FileInput from "@/components/ui/file-input";

const steps = [
  { id: "title", title: "Title Your Pitch" },
  { id: "script", title: "Write Your Script" },
  { id: "resume", title: "Upload Resume" },
  { id: "video", title: "Record Pitch" },
  { id: "profile", title: "Confirm Details" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const ElevatorPitchForm = ({ onClose, profile, onUpdateProfile, onPitchCreated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    script: "",
    resume: null,
    video: null,
    profileData: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      linkedInUrl: profile?.linkedInUrl || "",
      portfolioUrl: profile?.portfolioUrl || "",
    }
  });

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef(null);
  const recordingTimeRef = useRef(null);

  // Teleprompter overlay states
  const [scrollY, setScrollY] = useState(0);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(1); // pixels per tick

  // Update profile data when profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        profileData: {
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          linkedInUrl: profile.linkedInUrl || "",
          portfolioUrl: profile.portfolioUrl || "",
        }
      }));
    }
  }, [profile]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateProfileData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      profileData: { ...prev.profileData, [field]: value }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Update profile if it was changed
      if (JSON.stringify(formData.profileData) !== JSON.stringify({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        linkedInUrl: profile?.linkedInUrl || "",
        portfolioUrl: profile?.portfolioUrl || "",
      })) {
        await onUpdateProfile(formData.profileData);
      }

      // The elevator pitch is already created when video was uploaded
      console.log("Elevator pitch created successfully:", formData);
      
      // Call the callback to reload the home page
      if (onPitchCreated) {
        onPitchCreated();
      }
      
      onClose();
    } catch (error) {
      console.error("Error creating elevator pitch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeUpload = async (files) => {
    const file = files[0];
    if (!file) return;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('resume', file);

      const response = await fetch('http://localhost:5001/api/profile/upload-resume', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resume uploaded successfully:', result);
        updateFormData("resume", file);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('video', file);
      uploadFormData.append('title', formData.title || 'Elevator Pitch Video');

      const response = await fetch('http://localhost:5001/api/videos/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Video uploaded successfully:', result);
        updateFormData("video", result);
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  };

  // Video recording functions
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });
      setStream(mediaStream);
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera and microphone. Please check permissions.');
    }
  };

  const startRecording = () => {
    if (!stream) return;

    // Check MediaRecorder support and choose best format
    let options = {};
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = { mimeType: 'video/webm;codecs=vp9' };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      options = { mimeType: 'video/webm;codecs=vp8' };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4' };
    }

    const recorder = new MediaRecorder(stream, options);

    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedBlob(blob);
      
      // Convert blob to file object and upload
      const file = new File([blob], `pitch-recording-${Date.now()}.webm`, {
        type: 'video/webm'
      });
      
      try {
        await handleVideoUpload(file);
      } catch (error) {
        console.error('Failed to upload recorded video:', error);
        // Still keep the file locally for potential retry
        updateFormData("video", file);
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    recordingTimeRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 90) { // 90 second limit
          stopRecording();
          return 90;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (recordingTimeRef.current) {
      clearInterval(recordingTimeRef.current);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setScrollY(0); // Reset teleprompter scroll
    updateFormData("video", null);
    if (recordingTimeRef.current) {
      clearInterval(recordingTimeRef.current);
    }
    
    // Restart camera stream if it was stopped
    if (!stream || !stream.active) {
      initializeCamera();
    } else if (videoRef.current) {
      // Ensure video element is connected to the stream
      videoRef.current.srcObject = stream;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingTimeRef.current) {
        clearInterval(recordingTimeRef.current);
      }
    };
  }, [stream]);

  // Teleprompter scrolling during recording
  useEffect(() => {
    if (isRecording && formData.script) {
      const interval = setInterval(() => {
        setScrollY(prev => prev + teleprompterSpeed);
      }, 50); // 50ms interval for smooth scrolling

      return () => clearInterval(interval);
    } else {
      // Reset to beginning when not recording
      setScrollY(0);
    }
  }, [isRecording, formData.script, teleprompterSpeed]);

  // Ensure video element shows live stream when switching back from recorded view
  useEffect(() => {
    if (!recordedBlob && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [recordedBlob, stream]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if step is valid for next button
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title.trim() !== "";
      case 1:
        return formData.script.trim() !== "";
      case 2:
        return formData.resume !== null;
      case 3:
        return formData.video !== null || recordedBlob !== null;
      case 4:
        return formData.profileData.firstName.trim() !== "" && 
               formData.profileData.lastName.trim() !== "";
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress indicator */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className={cn(
                    "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                    index < currentStep
                      ? "bg-blue-600"
                      : index === currentStep
                        ? "bg-blue-600 ring-4 ring-blue-600/20"
                        : "bg-gray-300",
                  )}
                  onClick={() => {
                    if (index <= currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                />
                <motion.span
                  className={cn(
                    "text-xs mt-1.5 text-white",
                    index === currentStep
                      ? "font-medium"
                      : "opacity-70",
                  )}
                >
                  {step.title}
                </motion.span>
              </motion.div>
            ))}
          </div>
          <div className="w-full bg-gray-300 h-1.5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border shadow-md rounded-3xl overflow-hidden">
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={contentVariants}
                >
                  {/* Step 1: Title Your Pitch */}
                  {currentStep === 0 && (
                    <>
                      <CardHeader>
                        <CardTitle>Title Your Elevator Pitch</CardTitle>
                        <CardDescription>
                          Give your elevator pitch a memorable title
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="title">Pitch Title</Label>
                          <Input
                            id="title"
                            placeholder="e.g. Mohammed Bobboi - Software Developer - Amazon"
                            value={formData.title}
                            onChange={(e) =>
                              updateFormData("title", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                          />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 2: Write Your Script */}
                  {currentStep === 1 && (
                    <>
                      <CardHeader>
                        <CardTitle>Write Your Script</CardTitle>
                        <CardDescription>
                          Write the script for your elevator pitch. This will be displayed in the teleprompter during recording.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="script">Pitch Script</Label>
                          <Textarea
                            id="script"
                            placeholder="Hi, I'm [Your Name]. I'm a [Your Role] with [X years] of experience in [Your Field]..."
                            value={formData.script}
                            onChange={(e) => updateFormData("script", e.target.value)}
                            className="min-h-[200px] transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                            rows={10}
                          />
                          <p className="text-sm text-gray-600">
                            💡 Tip: Keep it between 60-90 seconds when spoken aloud. Focus on who you are, what you do, and what value you bring.
                          </p>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 3: Upload Resume */}
                  {currentStep === 2 && (
                    <>
                      <CardHeader>
                        <CardTitle>Upload Your Resume</CardTitle>
                        <CardDescription>
                          Upload your resume as a PDF file
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <div className="flex justify-center">
                            <FileInput
                              accept="application/pdf"
                              maxSizeInMB={10}
                              onFileChange={handleResumeUpload}
                              allowMultiple={false}
                            />
                          </div>
                          {formData.resume && (
                            <p className="text-sm text-green-600 text-center">
                              ✓ Resume uploaded: {formData.resume.name}
                            </p>
                          )}
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 4: Record Pitch */}
                  {currentStep === 3 && (
                    <>
                      <CardHeader>
                        <CardTitle>Record Your Pitch</CardTitle>
                        <CardDescription>
                          Record a 90-second elevator pitch using your camera and microphone
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <motion.div variants={fadeInUp} className="space-y-4">
                          {/* Camera Preview with Teleprompter Overlay - Only show when not recorded */}
                          {!recordedBlob && (
                            <div className="relative w-full max-w-lg mx-auto">
                              <div className="video-wrapper relative">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  muted
                                  playsInline
                                  className="w-full h-80 bg-gray-900 rounded-lg object-cover"
                                  style={{ transform: 'scaleX(-1)' }} // Mirror effect
                                />
                                
                                {/* Recording indicator */}
                                {isRecording && (
                                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm z-20">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    REC {formatTime(recordingTime)} / 1:30
                                  </div>
                                )}

                                {/* Time remaining */}
                                {!isRecording && recordingTime > 0 && !recordedBlob && (
                                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20">
                                    Recorded: {formatTime(recordingTime)}
                                  </div>
                                )}

                                {/* Eye Level Guide Line */}
                                <div 
                                  className="absolute left-0 right-0 pointer-events-none z-20"
                                  style={{
                                    top: '40%',
                                    height: '1px',
                                    background: 'rgba(255, 255, 255, 0.6)',
                                    boxShadow: '0 0 2px rgba(0, 0, 0, 0.5)'
                                  }}
                                />

                                {/* Teleprompter Overlay */}
                                {formData.script && (
                                  <div 
                                    className="teleprompter-overlay absolute left-0 right-0 bg-black/70 text-white z-10 overflow-hidden"
                                    style={{
                                      top: '20%',
                                      height: '50%', // 70% - 20% = 50%
                                    }}
                                  >
                                    <div 
                                      className="teleprompter-content text-center px-4 py-2"
                                      style={{
                                        transform: `translateY(-${scrollY}px)`,
                                        transition: 'none'
                                      }}
                                    >
                                      {(() => {
                                        // Function to wrap text at 25 characters per line
                                        const wrapText = (text, maxLength = 25) => {
                                          if (!text) return ['\u00A0'];
                                          
                                          const words = text.split(' ');
                                          const lines = [];
                                          let currentLine = '';
                                          
                                          words.forEach(word => {
                                            // Check if adding this word would exceed the limit
                                            const testLine = currentLine ? `${currentLine} ${word}` : word;
                                            
                                            if (testLine.length <= maxLength) {
                                              currentLine = testLine;
                                            } else {
                                              // Start new line
                                              if (currentLine) {
                                                lines.push(currentLine);
                                              }
                                              currentLine = word;
                                            }
                                          });
                                          
                                          // Add the last line
                                          if (currentLine) {
                                            lines.push(currentLine);
                                          }
                                          
                                          return lines.length > 0 ? lines : ['\u00A0'];
                                        };
                                        
                                        // Process all lines from the script
                                        const allWrappedLines = [];
                                        formData.script.split('\n').forEach(originalLine => {
                                          const wrappedLines = wrapText(originalLine.trim());
                                          allWrappedLines.push(...wrappedLines);
                                          // Add extra spacing between original paragraphs
                                          if (originalLine.trim()) {
                                            allWrappedLines.push('\u00A0');
                                          }
                                        });
                                        
                                        return allWrappedLines.map((line, index) => (
                                          <p 
                                            key={index} 
                                            className="text-lg font-medium leading-relaxed mb-4"
                                            style={{ minHeight: '2rem' }}
                                          >
                                            {line}
                                          </p>
                                        ));
                                      })()}
                                      {/* Add extra space at the end */}
                                      <div style={{ height: '400px' }}></div>
                                    </div>
                                    
                                    {/* Gradient overlays for smooth fade */}
                                    <div 
                                      className="absolute top-0 left-0 right-0 pointer-events-none"
                                      style={{
                                        height: '20px',
                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
                                      }}
                                    />
                                    <div 
                                      className="absolute bottom-0 left-0 right-0 pointer-events-none"
                                      style={{
                                        height: '20px',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Teleprompter Speed Controls - Only show when not recorded */}
                          {formData.script && !recordedBlob && (
                            <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-700">Teleprompter Speed</div>
                              <div className="flex gap-2">
                                {[
                                  { speed: 0.5, label: 'Slow' },
                                  { speed: 1, label: 'Normal' },
                                  { speed: 1.5, label: 'Fast' },
                                  { speed: 2, label: 'Very Fast' }
                                ].map(({ speed, label }) => (
                                  <button
                                    key={speed}
                                    onClick={() => setTeleprompterSpeed(speed)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      teleprompterSpeed === speed
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500">
                                Text scrolls at {teleprompterSpeed}x speed during recording
                              </div>
                            </div>
                          )}

                          {/* Controls */}
                          <div className="flex flex-col items-center gap-4">
                            {!hasPermission && (
                              <Button
                                type="button"
                                onClick={initializeCamera}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Enable Camera & Microphone
                              </Button>
                            )}

                            {hasPermission && !recordedBlob && (
                              <div className="flex gap-3">
                                {!isRecording ? (
                                  <Button
                                    type="button"
                                    onClick={startRecording}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                                  >
                                    <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                                    Start Recording
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    onClick={stopRecording}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
                                  >
                                    <div className="w-3 h-3 bg-white mr-2"></div>
                                    Stop Recording
                                  </Button>
                                )}
                              </div>
                            )}

                            {recordedBlob && (
                              <div className="space-y-4">
                                {/* Video Preview */}
                                <div className="w-full max-w-lg mx-auto">
                                  <h3 className="text-lg font-semibold mb-3 text-center">Preview Your Recording</h3>
                                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                                    <video
                                      controls
                                      className="w-full h-80 object-cover"
                                      src={URL.createObjectURL(recordedBlob)}
                                    />
                                  </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-center gap-3">
                                  <div className="flex items-center gap-2 text-green-600">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      Recording Complete ({formatTime(recordingTime)})
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={resetRecording}
                                    variant="outline"
                                    className="px-6 py-2"
                                  >
                                    Record Again
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Instructions */}
                          {!recordedBlob ? (
                            <div className="text-center text-sm text-gray-600 space-y-2">
                              <p>📹 <strong>Tips for a great pitch:</strong></p>
                              <ul className="text-xs space-y-1">
                                <li>• Look directly at the camera</li>
                                <li>• Speak clearly and at a moderate pace</li>
                                <li>• Keep it concise - you have 90 seconds</li>
                                <li>• Mention your name, skills, and what you're looking for</li>
                              </ul>
                            </div>
                          ) : (
                            <div className="text-center text-sm text-gray-600 space-y-2">
                              <p>✅ <strong>Great job!</strong></p>
                              <p className="text-xs">
                                Review your recording above. If you're happy with it, click "Next" to continue.
                                <br />
                                If you'd like to try again, click "Record Again".
                              </p>
                            </div>
                          )}
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 5: Confirm Profile Details */}
                  {currentStep === 4 && (
                    <>
                      <CardHeader>
                        <CardTitle>Confirm Your Details</CardTitle>
                        <CardDescription>
                          Review and edit your profile information (changes will be saved for future pitches)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              placeholder="John"
                              value={formData.profileData.firstName}
                              onChange={(e) =>
                                updateProfileData("firstName", e.target.value)
                              }
                              className="transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                            />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              value={formData.profileData.lastName}
                              onChange={(e) =>
                                updateProfileData("lastName", e.target.value)
                              }
                              className="transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                            />
                          </motion.div>
                        </div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                          <Input
                            id="linkedInUrl"
                            placeholder="https://linkedin.com/in/johndoe"
                            value={formData.profileData.linkedInUrl}
                            onChange={(e) =>
                              updateProfileData("linkedInUrl", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                          <Input
                            id="portfolioUrl"
                            placeholder="https://johndoe.dev"
                            value={formData.profileData.portfolioUrl}
                            onChange={(e) =>
                              updateProfileData("portfolioUrl", e.target.value)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                          />
                        </motion.div>
                      </CardContent>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <CardFooter className="flex justify-between pt-6 pb-4">
                <div className="flex gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="transition-all duration-300 rounded-2xl"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                  </motion.div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    onClick={
                      currentStep === steps.length - 1 ? handleSubmit : nextStep
                    }
                    disabled={!isStepValid() || isSubmitting}
                    className={cn(
                      "flex items-center gap-1 transition-all duration-300 rounded-2xl",
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        {currentStep === steps.length - 1 ? "Create Pitch" : "Next"}
                        {currentStep === steps.length - 1 ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </div>
          </Card>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          className="mt-4 text-center text-sm text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </motion.div>
      </div>
    </div>
  );
};

export default ElevatorPitchForm;
