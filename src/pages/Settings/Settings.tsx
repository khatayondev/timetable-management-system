import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, Lock, Bell, Globe, Moon, Sun, Save, Mail, Phone, MapPin, Building } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+233 20 123 4567',
    department: 'Computer Science',
    office: 'Block A, Room 201',
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    timetableChanges: true,
    approvalRequests: true,
    systemUpdates: false,
    weeklyDigest: true,
  });

  // Preference settings
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timeFormat: '12h',
    dateFormat: 'DD/MM/YYYY',
    defaultView: 'week',
  });

  const handleSaveProfile = () => {
    // Save profile logic here
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (securityData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    // Change password logic here
    alert('Password changed successfully!');
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    alert('Notification preferences saved!');
  };

  const handleSavePreferences = () => {
    // Save preferences
    alert('Preferences saved!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#4F4F4F]">Settings</h1>
        <p className="text-[#828282] mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-2">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] text-white'
                      : 'text-[#828282] hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] text-white'
                      : 'text-[#828282] hover:bg-gray-50'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Security</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] text-white'
                      : 'text-[#828282] hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'preferences'
                      ? 'bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] text-white'
                      : 'text-[#828282] hover:bg-gray-50'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Preferences</span>
                </button>
              </nav>
            </CardBody>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-[#4F4F4F]">Profile Information</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#828282] w-5 h-5" />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#828282] w-5 h-5" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#828282] w-5 h-5" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Department
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#828282] w-5 h-5" />
                        <input
                          type="text"
                          value={profileData.department}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      Office Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#828282] w-5 h-5" />
                      <input
                        type="text"
                        value={profileData.office}
                        onChange={(e) => setProfileData({ ...profileData, office: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      onClick={handleSaveProfile}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-[#4F4F4F]">Security Settings</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      Password must be at least 8 characters long and contain a mix of letters and numbers.
                    </p>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      onClick={handleChangePassword}
                      icon={<Lock className="w-4 h-4" />}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-[#4F4F4F]">Notification Preferences</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-[#4F4F4F]">Email Notifications</h3>
                      <p className="text-sm text-[#828282]">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5B7EFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B7EFF]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-[#4F4F4F]">Timetable Changes</h3>
                      <p className="text-sm text-[#828282]">Get notified when timetables are updated</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.timetableChanges}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, timetableChanges: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5B7EFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B7EFF]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-[#4F4F4F]">Approval Requests</h3>
                      <p className="text-sm text-[#828282]">Notifications for pending approvals</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.approvalRequests}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, approvalRequests: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5B7EFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B7EFF]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-[#4F4F4F]">System Updates</h3>
                      <p className="text-sm text-[#828282]">Updates about system maintenance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.systemUpdates}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5B7EFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B7EFF]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-[#4F4F4F]">Weekly Digest</h3>
                      <p className="text-sm text-[#828282]">Weekly summary of activities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyDigest}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5B7EFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B7EFF]"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      onClick={handleSaveNotifications}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-[#4F4F4F]">Application Preferences</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          preferences.theme === 'light'
                            ? 'border-[#5B7EFF] bg-[#5B7EFF]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Sun className="w-6 h-6 mx-auto mb-2 text-[#5B7EFF]" />
                        <p className="text-sm font-medium">Light</p>
                      </button>
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          preferences.theme === 'dark'
                            ? 'border-[#5B7EFF] bg-[#5B7EFF]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Moon className="w-6 h-6 mx-auto mb-2 text-[#5B7EFF]" />
                        <p className="text-sm font-medium">Dark</p>
                      </button>
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'auto' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          preferences.theme === 'auto'
                            ? 'border-[#5B7EFF] bg-[#5B7EFF]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Globe className="w-6 h-6 mx-auto mb-2 text-[#5B7EFF]" />
                        <p className="text-sm font-medium">Auto</p>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Time Format
                      </label>
                      <select
                        value={preferences.timeFormat}
                        onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Date Format
                      </label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                        Default Calendar View
                      </label>
                      <select
                        value={preferences.defaultView}
                        onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      onClick={handleSavePreferences}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
