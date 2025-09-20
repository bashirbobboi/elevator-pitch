"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ProfileForm({ profile, onSaveProfile, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    linkedInUrl: "",
    portfolioUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        location: profile.location || "",
        linkedInUrl: profile.linkedInUrl || "",
        portfolioUrl: profile.portfolioUrl || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      let result;
      if (profile) {
        result = await onUpdateProfile(formData);
      } else {
        result = await onSaveProfile(formData);
      }

      if (result.success) {
        setMessage("Profile saved successfully!");
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("An error occurred while saving the profile");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div 
      className="rounded-none md:rounded-2xl p-4 md:p-6 shadow-input bg-white dark:bg-black"
      style={{ 
        width: '100%', 
        maxWidth: '42rem', 
        minWidth: '32rem',
        height: 'fit-content'
      }}
    >
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Your Profile Details
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Add your personal information to customize your elevator pitch platform
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-3">
          <LabelInputContainer>
            <Label htmlFor="firstName">First name</Label>
            <Input 
              id="firstName" 
              placeholder="John" 
              type="text" 
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastName">Last name</Label>
            <Input 
              id="lastName" 
              placeholder="Doe" 
              type="text" 
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </LabelInputContainer>
        </div>
        
        <LabelInputContainer className="mb-3">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            placeholder="john.doe@example.com" 
            type="email" 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-3">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="San Francisco, CA" 
            type="text" 
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-3">
          <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
          <Input 
            id="linkedInUrl" 
            placeholder="https://linkedin.com/in/johndoe" 
            type="url" 
            value={formData.linkedInUrl}
            onChange={(e) => handleInputChange('linkedInUrl', e.target.value)}
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="portfolioUrl">Portfolio URL</Label>
          <Input 
            id="portfolioUrl" 
            placeholder="https://johndoe.dev" 
            type="url" 
            value={formData.portfolioUrl}
            onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
          />
        </LabelInputContainer>

        {message && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
            color: message.includes('Error') ? '#dc2626' : '#16a34a',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <button
          style={{
            backgroundColor: 'white',
            color: 'rgb(135,84,78)',
            border: '1px solid rgb(135,84,78)',
            borderRadius: '8px',
            height: '40px',
            width: '100%',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = '#e8e0d8';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = 'white';
            }
          }}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (profile ? 'Update Profile' : 'Save Profile')} →
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
