import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Edit3, Save, X, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MessageBar } from '../common/MessageBar';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [originalData, setOriginalData] = useState(profileData);

  // Utility: Show temporary message
  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // Populate initial user data
  useEffect(() => {
    if (user) {
      const data = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      };
      setProfileData(data);
      setOriginalData(data);
    }
  }, [user]);

  // Save changes
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      showMessage('Profile updated successfully!', 'success');
      setOriginalData(profileData);
      setIsEditing(false);
    } catch (error: any) {
      showMessage('Failed to update profile: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Feedback Message */}
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">👤 My Profile</h1>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center"
          >
            <Edit3 size={16} className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center"
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <div className="flex items-center mt-2">
                <Shield size={16} className="mr-1" />
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user?.role === 'ADMIN' ? 'bg-purple-500 text-white' : 'bg-blue-700 text-blue-100'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="p-8 space-y-8">

          {/* Personal Information */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" /> First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData.firstName}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData.lastName}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h3>
            <div className="space-y-6">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" /> Email Address
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-600 font-medium">
                  {profileData.email}
                  <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="+254712345678"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData.phoneNumber || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" /> Address
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium min-h-[84px]">
                    {profileData.address || 'Not provided'}
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Account Information */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* User ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
                <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-mono">
                  #{user?.id}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Status</label>
                <div className="w-full px-4 py-3 bg-gray-50 rounded-lg">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user?.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.isEnabled ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
