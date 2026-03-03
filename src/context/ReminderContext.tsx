import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ReminderChannel = 'IN_APP' | 'EMAIL' | 'SMS';
export type EventType = 'LECTURE' | 'EXAM' | 'INVIGILATION';

export interface ReminderRule {
  id: string;
  offsetMinutes: number; // Minutes before event
  channel: ReminderChannel;
  enabled: boolean;
}

export interface Event {
  id: string;
  type: EventType;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  participants: string[]; // User IDs
  venueId?: string;
  venueName?: string;
  courseId?: string;
  courseName?: string;
  classId?: string;
  className?: string;
  lecturerId?: string;
  lecturerName?: string;
  reminderRules: ReminderRule[];
}

export interface Notification {
  id: string;
  eventId: string;
  userId: string;
  title: string;
  message: string;
  type: EventType;
  channel: ReminderChannel;
  scheduledFor: Date;
  sentAt?: Date;
  read: boolean;
  eventData: Partial<Event>;
}

export interface ReminderPreferences {
  userId: string;
  lectureReminders: ReminderRule[];
  examReminders: ReminderRule[];
  invigilationReminders: ReminderRule[];
  enableInApp: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
}

interface ReminderContextType {
  events: Event[];
  notifications: Notification[];
  preferences: ReminderPreferences;
  addEvent: (event: Omit<Event, 'id' | 'reminderRules'>, customRules?: ReminderRule[]) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  updatePreferences: (prefs: Partial<ReminderPreferences>) => void;
  getDefaultRules: (eventType: EventType) => ReminderRule[];
  sendTestNotification: (userId: string, eventType: EventType) => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

// Default reminder rules
const DEFAULT_LECTURE_RULES: Omit<ReminderRule, 'id'>[] = [
  { offsetMinutes: 1440, channel: 'IN_APP', enabled: true }, // 24 hours
  { offsetMinutes: 60, channel: 'IN_APP', enabled: true },   // 1 hour
  { offsetMinutes: 1440, channel: 'EMAIL', enabled: true },  // 24 hours
];

const DEFAULT_EXAM_RULES: Omit<ReminderRule, 'id'>[] = [
  { offsetMinutes: 10080, channel: 'IN_APP', enabled: true }, // 7 days
  { offsetMinutes: 1440, channel: 'IN_APP', enabled: true },  // 24 hours
  { offsetMinutes: 60, channel: 'IN_APP', enabled: true },    // 1 hour (morning)
  { offsetMinutes: 10080, channel: 'EMAIL', enabled: true },  // 7 days
  { offsetMinutes: 1440, channel: 'EMAIL', enabled: true },   // 24 hours
];

const DEFAULT_INVIGILATION_RULES: Omit<ReminderRule, 'id'>[] = [
  { offsetMinutes: 2880, channel: 'IN_APP', enabled: true },  // 48 hours
  { offsetMinutes: 60, channel: 'IN_APP', enabled: true },    // 1 hour (morning)
  { offsetMinutes: 2880, channel: 'EMAIL', enabled: true },   // 48 hours
];

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    userId: 'current-user',
    lectureReminders: DEFAULT_LECTURE_RULES.map((r, i) => ({ ...r, id: `lec-${i}` })),
    examReminders: DEFAULT_EXAM_RULES.map((r, i) => ({ ...r, id: `exam-${i}` })),
    invigilationReminders: DEFAULT_INVIGILATION_RULES.map((r, i) => ({ ...r, id: `inv-${i}` })),
    enableInApp: true,
    enableEmail: true,
    enableSMS: false,
  });

  // Reminder engine - runs every minute to check for upcoming events
  useEffect(() => {
    const interval = setInterval(() => {
      processReminders();
    }, 60000); // Check every minute

    // Also run on mount
    processReminders();

    return () => clearInterval(interval);
  }, [events, notifications]);

  const processReminders = () => {
    const now = new Date();
    const currentUserId = preferences.userId;

    events.forEach(event => {
      // Parse event date and time
      const eventDateTime = new Date(`${event.date}T${event.startTime}`);

      event.reminderRules.forEach(rule => {
        if (!rule.enabled) return;

        // Calculate when reminder should be sent
        const reminderTime = new Date(eventDateTime.getTime() - rule.offsetMinutes * 60000);

        // Check if we should send this reminder now (within the last minute)
        const timeDiff = now.getTime() - reminderTime.getTime();
        if (timeDiff >= 0 && timeDiff < 60000) {
          // Check if notification already sent
          const alreadySent = notifications.some(n => 
            n.eventId === event.id && 
            n.channel === rule.channel &&
            Math.abs(new Date(n.scheduledFor).getTime() - reminderTime.getTime()) < 60000
          );

          if (!alreadySent) {
            // Send notification to each participant
            event.participants.forEach(participantId => {
              createNotification(event, participantId, rule, reminderTime);
            });
          }
        }
      });
    });
  };

  const createNotification = (
    event: Event,
    userId: string,
    rule: ReminderRule,
    scheduledFor: Date
  ) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      eventId: event.id,
      userId,
      title: getNotificationTitle(event),
      message: getNotificationMessage(event, rule.offsetMinutes),
      type: event.type,
      channel: rule.channel,
      scheduledFor,
      sentAt: new Date(),
      read: false,
      eventData: {
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        date: event.date,
        venueName: event.venueName,
        courseName: event.courseName,
        className: event.className,
      },
    };

    setNotifications(prev => [...prev, notification]);

    // Simulate sending based on channel
    if (rule.channel === 'EMAIL') {
      console.log(`📧 Email sent to user ${userId}:`, notification.message);
    } else if (rule.channel === 'SMS') {
      console.log(`📱 SMS sent to user ${userId}:`, notification.message);
    }
  };

  const getNotificationTitle = (event: Event): string => {
    switch (event.type) {
      case 'LECTURE':
        return `Upcoming Lecture: ${event.courseName}`;
      case 'EXAM':
        return `Upcoming Exam: ${event.courseName}`;
      case 'INVIGILATION':
        return `Invigilation Duty: ${event.courseName}`;
      default:
        return 'Upcoming Event';
    }
  };

  const getNotificationMessage = (event: Event, offsetMinutes: number): string => {
    const timeText = offsetMinutes >= 1440 
      ? `${Math.floor(offsetMinutes / 1440)} day${Math.floor(offsetMinutes / 1440) > 1 ? 's' : ''}`
      : offsetMinutes >= 60
      ? `${Math.floor(offsetMinutes / 60)} hour${Math.floor(offsetMinutes / 60) > 1 ? 's' : ''}`
      : `${offsetMinutes} minute${offsetMinutes > 1 ? 's' : ''}`;

    let message = '';
    switch (event.type) {
      case 'LECTURE':
        message = `You have a lecture in ${timeText}.\n${event.courseName} - ${event.className}\n`;
        break;
      case 'EXAM':
        message = `Your exam is in ${timeText}.\n${event.courseName}\n`;
        break;
      case 'INVIGILATION':
        message = `You have invigilation duty in ${timeText}.\n${event.courseName} - ${event.className}\n`;
        break;
    }

    message += `Time: ${event.startTime} - ${event.endTime}\n`;
    if (event.venueName) {
      message += `Venue: ${event.venueName}`;
    }

    return message;
  };

  const addEvent = (
    eventData: Omit<Event, 'id' | 'reminderRules'>,
    customRules?: ReminderRule[]
  ) => {
    const rules = customRules || getDefaultRules(eventData.type);
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
      reminderRules: rules,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, eventData: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...eventData } : e));
    
    // Update related notifications if event time changed
    if (eventData.date || eventData.startTime) {
      setNotifications(prev => 
        prev.filter(n => n.eventId !== id || n.sentAt !== undefined)
      );
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setNotifications(prev => prev.filter(n => n.eventId !== id));
  };

  const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.scheduledFor.getTime() - a.scheduledFor.getTime());
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const updatePreferences = (prefs: Partial<ReminderPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const getDefaultRules = (eventType: EventType): ReminderRule[] => {
    switch (eventType) {
      case 'LECTURE':
        return DEFAULT_LECTURE_RULES.map((r, i) => ({ ...r, id: `lec-${i}-${Date.now()}` }));
      case 'EXAM':
        return DEFAULT_EXAM_RULES.map((r, i) => ({ ...r, id: `exam-${i}-${Date.now()}` }));
      case 'INVIGILATION':
        return DEFAULT_INVIGILATION_RULES.map((r, i) => ({ ...r, id: `inv-${i}-${Date.now()}` }));
    }
  };

  const sendTestNotification = (userId: string, eventType: EventType) => {
    const testEvent: Event = {
      id: `test-${Date.now()}`,
      type: eventType,
      title: 'Test Event',
      startTime: '09:00',
      endTime: '11:00',
      date: new Date().toISOString().split('T')[0],
      participants: [userId],
      courseName: 'Sample Course',
      className: 'Sample Class',
      venueName: 'Sample Venue',
      reminderRules: [],
    };

    const testNotification: Notification = {
      id: `test-notif-${Date.now()}`,
      eventId: testEvent.id,
      userId,
      title: getNotificationTitle(testEvent),
      message: 'This is a test notification.',
      type: eventType,
      channel: 'IN_APP',
      scheduledFor: new Date(),
      sentAt: new Date(),
      read: false,
      eventData: {
        title: testEvent.title,
        courseName: testEvent.courseName,
        className: testEvent.className,
        venueName: testEvent.venueName,
      },
    };

    setNotifications(prev => [...prev, testNotification]);
  };

  return (
    <ReminderContext.Provider
      value={{
        events,
        notifications,
        preferences,
        addEvent,
        updateEvent,
        deleteEvent,
        getNotificationsForUser,
        markNotificationAsRead,
        updatePreferences,
        getDefaultRules,
        sendTestNotification,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within ReminderProvider');
  }
  return context;
};
