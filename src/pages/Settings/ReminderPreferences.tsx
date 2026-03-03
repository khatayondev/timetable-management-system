import React, { useState } from 'react';
import { useReminders, ReminderRule, EventType } from '../../context/ReminderContext';
import { Bell, Mail, Smartphone, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { Card, CardHeader, CardBody } from '../../components/common/Card';

const ReminderPreferences: React.FC = () => {
  const { preferences, updatePreferences, sendTestNotification } = useReminders();
  const [activeTab, setActiveTab] = useState<EventType>('LECTURE');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggleChannel = (channel: 'enableInApp' | 'enableEmail' | 'enableSMS') => {
    updatePreferences({ [channel]: !preferences[channel] });
  };

  const handleToggleRule = (eventType: EventType, ruleId: string) => {
    const rulesKey = `${eventType.toLowerCase()}Reminders` as 'lectureReminders' | 'examReminders' | 'invigilationReminders';
    const updatedRules = preferences[rulesKey].map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    updatePreferences({ [rulesKey]: updatedRules });
  };

  const handleAddRule = (eventType: EventType) => {
    const rulesKey = `${eventType.toLowerCase()}Reminders` as 'lectureReminders' | 'examReminders' | 'invigilationReminders';
    const newRule: ReminderRule = {
      id: `custom-${Date.now()}`,
      offsetMinutes: 120, // 2 hours default
      channel: 'IN_APP',
      enabled: true,
    };
    updatePreferences({ [rulesKey]: [...preferences[rulesKey], newRule] });
  };

  const handleRemoveRule = (eventType: EventType, ruleId: string) => {
    const rulesKey = `${eventType.toLowerCase()}Reminders` as 'lectureReminders' | 'examReminders' | 'invigilationReminders';
    const updatedRules = preferences[rulesKey].filter(rule => rule.id !== ruleId);
    updatePreferences({ [rulesKey]: updatedRules });
  };

  const handleUpdateRule = (eventType: EventType, ruleId: string, updates: Partial<ReminderRule>) => {
    const rulesKey = `${eventType.toLowerCase()}Reminders` as 'lectureReminders' | 'examReminders' | 'invigilationReminders';
    const updatedRules = preferences[rulesKey].map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    updatePreferences({ [rulesKey]: updatedRules });
  };

  const handleTestNotification = () => {
    sendTestNotification(preferences.userId, activeTab);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getRules = (eventType: EventType): ReminderRule[] => {
    switch (eventType) {
      case 'LECTURE':
        return preferences.lectureReminders;
      case 'EXAM':
        return preferences.examReminders;
      case 'INVIGILATION':
        return preferences.invigilationReminders;
    }
  };

  const formatOffset = (minutes: number): string => {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#4F4F4F]">Reminder Preferences</h1>
          <p className="text-[#828282] mt-1">Manage your notification settings and reminder schedules</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Test notification sent successfully!</span>
        </div>
      )}

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-[#4F4F4F]">Notification Channels</h3>
          <p className="text-sm text-[#828282] mt-1">Choose how you want to receive reminders</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* In-App */}
            <div
              onClick={() => handleToggleChannel('enableInApp')}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                preferences.enableInApp
                  ? 'border-[#5B7EFF] bg-[#E8EAF6]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Bell className={`w-8 h-8 ${preferences.enableInApp ? 'text-[#5B7EFF]' : 'text-gray-400'}`} />
                {preferences.enableInApp && (
                  <Check className="w-5 h-5 text-[#5B7EFF]" />
                )}
              </div>
              <h4 className="font-semibold text-[#4F4F4F] mb-1">In-App Notifications</h4>
              <p className="text-xs text-[#828282]">Get notified within the application</p>
            </div>

            {/* Email */}
            <div
              onClick={() => handleToggleChannel('enableEmail')}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                preferences.enableEmail
                  ? 'border-[#5B7EFF] bg-[#E8EAF6]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Mail className={`w-8 h-8 ${preferences.enableEmail ? 'text-[#5B7EFF]' : 'text-gray-400'}`} />
                {preferences.enableEmail && (
                  <Check className="w-5 h-5 text-[#5B7EFF]" />
                )}
              </div>
              <h4 className="font-semibold text-[#4F4F4F] mb-1">Email Notifications</h4>
              <p className="text-xs text-[#828282]">Receive reminders via email</p>
            </div>

            {/* SMS */}
            <div
              onClick={() => handleToggleChannel('enableSMS')}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                preferences.enableSMS
                  ? 'border-[#5B7EFF] bg-[#E8EAF6]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Smartphone className={`w-8 h-8 ${preferences.enableSMS ? 'text-[#5B7EFF]' : 'text-gray-400'}`} />
                {preferences.enableSMS && (
                  <Check className="w-5 h-5 text-[#5B7EFF]" />
                )}
              </div>
              <h4 className="font-semibold text-[#4F4F4F] mb-1">SMS Notifications</h4>
              <p className="text-xs text-[#828282]">Get text message alerts</p>
              <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Coming Soon
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reminder Rules */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-[#4F4F4F]">Reminder Schedule</h3>
          <p className="text-sm text-[#828282] mt-1">Configure when to receive reminders for different event types</p>
        </CardHeader>
        <CardBody>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {(['LECTURE', 'EXAM', 'INVIGILATION'] as EventType[]).map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === type
                    ? 'border-[#5B7EFF] text-[#5B7EFF]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {getRules(activeTab).map(rule => (
              <ReminderRuleCard
                key={rule.id}
                rule={rule}
                eventType={activeTab}
                onToggle={() => handleToggleRule(activeTab, rule.id)}
                onUpdate={(updates) => handleUpdateRule(activeTab, rule.id, updates)}
                onRemove={() => handleRemoveRule(activeTab, rule.id)}
              />
            ))}

            {/* Add Rule Button */}
            <button
              onClick={() => handleAddRule(activeTab)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#5B7EFF] hover:bg-[#F7F8FA] transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-[#5B7EFF]"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Custom Reminder</span>
            </button>
          </div>

          {/* Test Notification Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleTestNotification}
              icon={<Bell className="w-4 h-4" />}
            >
              Send Test Notification
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How Reminders Work</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Reminders are sent automatically based on your configured schedule</li>
            <li>You'll receive notifications through your enabled channels</li>
            <li>Reminders respect attendance type restrictions (REGULAR/WEEKEND)</li>
            <li>You can customize timing for each event type</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ReminderRuleCard: React.FC<{
  rule: ReminderRule;
  eventType: EventType;
  onToggle: () => void;
  onUpdate: (updates: Partial<ReminderRule>) => void;
  onRemove: () => void;
}> = ({ rule, eventType, onToggle, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editOffset, setEditOffset] = useState(rule.offsetMinutes);

  const handleSave = () => {
    onUpdate({ offsetMinutes: editOffset });
    setIsEditing(false);
  };

  const formatOffset = (minutes: number): string => {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className={`p-4 border rounded-xl transition-all ${
      rule.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Enable Toggle */}
          <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors ${
              rule.enabled ? 'bg-[#5B7EFF]' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              rule.enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>

          {/* Rule Details */}
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={editOffset}
                  onChange={(e) => setEditOffset(parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50"
                  min="1"
                />
                <span className="text-sm text-gray-600">minutes before</span>
                <Button size="sm" variant="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div>
                <p className={`font-medium ${rule.enabled ? 'text-[#4F4F4F]' : 'text-gray-400'}`}>
                  {formatOffset(rule.offsetMinutes)} before event
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  via {rule.channel.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>

          {/* Channel Selector */}
          {!isEditing && (
            <select
              value={rule.channel}
              onChange={(e) => onUpdate({ channel: e.target.value as any })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5B7EFF]/50"
              disabled={!rule.enabled}
            >
              <option value="IN_APP">In-App</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
            </select>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-[#5B7EFF] text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderPreferences;
