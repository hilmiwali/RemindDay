// screens/SettingsScreen.js
// This screen contains app settings and information

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors } from '../constants/Colors';
import { getAllBirthdays } from '../database/birthdayDB';
import { cancelAllNotifications, getScheduledNotifications } from '../utils/notificationService';

const SettingsScreen = ({ navigation }) => {
  const [birthdayCount, setBirthdayCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get birthday count
      const birthdays = await getAllBirthdays();
      setBirthdayCount(birthdays.length);

      // Get notification count
      const notifications = await getScheduledNotifications();
      setNotificationCount(notifications.length);

    } catch (error) {
      console.log('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will cancel all scheduled birthday notifications. You can reschedule them by editing each birthday.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearNotifications,
        },
      ]
    );
  };

  const clearNotifications = async () => {
    try {
      await cancelAllNotifications();
      setNotificationCount(0);
      Alert.alert('Success', 'All notifications have been cleared');
    } catch (error) {
      console.log('Error clearing notifications:', error);
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  const showAbout = () => {
    Alert.alert(
      'About RemindDay',
      'RemindDay v1.0\n\nA simple, offline birthday reminder app built with React Native and Expo.\n\nFeatures:\n• Offline storage with SQLite\n• Local push notifications\n• Clean, user-friendly interface\n• No internet required',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    rightComponent = null,
    danger = false 
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={danger ? Colors.error : Colors.primary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={Colors.textLight} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="settings-outline" size={50} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* App Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          {renderSettingItem({
            icon: 'people-outline',
            title: 'Total Birthdays',
            subtitle: `${birthdayCount} birthdays saved`,
            onPress: null,
            showArrow: false,
          })}
          
          {renderSettingItem({
            icon: 'notifications-outline',
            title: 'Scheduled Notifications',
            subtitle: `${notificationCount} notifications scheduled`,
            onPress: null,
            showArrow: false,
          })}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingItem({
            icon: 'notifications',
            title: 'Notifications Enabled',
            subtitle: notificationsEnabled ? 'Tap to disable' : 'Tap to enable',
            onPress: () => setNotificationsEnabled(!notificationsEnabled),
            showArrow: false,
            rightComponent: (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={notificationsEnabled ? Colors.cardBg : Colors.textLight}
              />
            ),
          })}
          
          {renderSettingItem({
            icon: 'trash-outline',
            title: 'Clear All Notifications',
            subtitle: 'Cancel all scheduled notifications',
            onPress: handleClearAllNotifications,
            danger: true,
          })}
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          {renderSettingItem({
            icon: 'information-circle-outline',
            title: 'About RemindDay',
            subtitle: 'Version 1.0 • Built with React Native',
            onPress: showAbout,
          })}
          
          {renderSettingItem({
            icon: 'shield-checkmark-outline',
            title: 'Privacy',
            subtitle: 'All data stored locally on your device',
            onPress: () => Alert.alert(
              'Privacy Information',
              'RemindDay stores all your birthday data locally on your device using SQLite. No data is sent to external servers or shared with third parties. Your information remains completely private and under your control.',
              [{ text: 'OK' }]
            ),
          })}
          
          {renderSettingItem({
            icon: 'help-circle-outline',
            title: 'How to Use',
            subtitle: 'Tips for getting the most out of RemindDay',
            onPress: () => Alert.alert(
              'How to Use RemindDay',
              '1. Tap the + button to add birthdays\n2. Set custom notification times for each person\n3. View upcoming birthdays on the home screen\n4. Tap on any birthday for details\n5. Send birthday wishes directly from the app\n\nTip: The app works completely offline!',
              [{ text: 'Got it!' }]
            ),
          })}
        </View>

        {/* Storage Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          {renderSettingItem({
            icon: 'server-outline',
            title: 'Storage Location',
            subtitle: 'SQLite database on device',
            onPress: null,
            showArrow: false,
          })}
          
          {renderSettingItem({
            icon: 'cloud-offline-outline',
            title: 'Offline Mode',
            subtitle: 'Works without internet connection',
            onPress: null,
            showArrow: false,
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for keeping track of special days
          </Text>
          <Text style={styles.footerSubtext}>
            No internet required • Privacy focused • Free forever
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },
  
  backButton: {
    padding: 8,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  placeholder: {
    width: 40,
  },
  
  scrollView: {
    flex: 1,
  },
  
  section: {
    marginBottom: 32,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  
  settingItem: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.upcomingBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  dangerIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  
  textContainer: {
    flex: 1,
  },
  
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  
  dangerText: {
    color: Colors.error,
  },
  
  settingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  
  footerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  footerSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default SettingsScreen;