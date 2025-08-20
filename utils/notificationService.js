// utils/notificationService.js
// This file handles local push notifications for birthday reminders

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permission to send notifications
export const requestNotificationPermissions = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Permission to send notifications was denied!');
      return false;
    }
    
    console.log('Notification permissions granted');
    return true;
  } else {
    alert('Must use physical device for Push Notifications');
    return false;
  }
};

// Schedule a local notification for a birthday
export const scheduleBirthdayNotification = async (birthday) => {
  try {
    // Parse the notification time (HH:MM format)
    const [hours, minutes] = birthday.notificationTime.split(':').map(Number);
    
    // Parse the birth date (MM-DD format)
    const [month, day] = birthday.birthDate.split('-').map(Number);
    
    // Create notification trigger for the birthday
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Create trigger date for this year's birthday
    let triggerDate = new Date(currentYear, month - 1, day, hours, minutes, 0);
    
    // If the birthday has already passed this year, schedule for next year
    if (triggerDate <= now) {
      triggerDate.setFullYear(currentYear + 1);
    }
    
    // Schedule the notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Birthday Reminder!',
        body: `Today is ${birthday.name}'s birthday! Don't forget to wish them!`,
        sound: 'default',
        data: { birthdayId: birthday.id },
      },
      trigger: {
        date: triggerDate,
        repeats: true, // Repeat every year
      },
    });
    
    console.log(`Notification scheduled for ${birthday.name} with ID: ${identifier}`);
    console.log(`Trigger date: ${triggerDate.toLocaleString()}`);
    
    return identifier;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
};

// Cancel a specific birthday notification
export const cancelBirthdayNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.log('Error cancelling notification:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.log('Error cancelling all notifications:', error);
  }
};

// Get all scheduled notifications (for debugging)
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.log('Error getting scheduled notifications:', error);
    return [];
  }
};

// Format date for display (MM-DD to readable format)
export const formatBirthDate = (birthDate) => {
  const [month, day] = birthDate.split('-').map(Number);
  const date = new Date(2024, month - 1, day); // Use any year for formatting
  
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
};

// Calculate days until next birthday
export const getDaysUntilBirthday = (birthDate) => {
  const [month, day] = birthDate.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  
  let birthdayThisYear = new Date(currentYear, month - 1, day);
  
  // If birthday has passed this year, calculate for next year
  if (birthdayThisYear < now) {
    birthdayThisYear.setFullYear(currentYear + 1);
  }
  
  const timeDiff = birthdayThisYear.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};