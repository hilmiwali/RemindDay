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

import { useTheme } from '../constants/ThemeContext';
import { getAllBirthdays } from '../database/birthdayDB';
import { exportBirthdaysToCSV, importBirthdaysFromCSV } from '../utils/exportImportService';
import { cancelAllNotifications, getScheduledNotifications } from '../utils/notificationService';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [birthdayCount, setBirthdayCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [exportingData, setExportingData] = useState(false);
  const [importingData, setImportingData] = useState(false);

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

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const success = await exportBirthdaysToCSV();
      if (success) {
        Alert.alert('Export Successful', 'Your birthday data has been exported successfully!');
      }
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setExportingData(false);
    }
  };

  const handleImportData = async () => {
    setImportingData(true);
    try {
      const success = await importBirthdaysFromCSV();
      if (success) {
        // Refresh data after successful import
        await loadData();
      }
    } catch (error) {
      console.log('Import error:', error);
      Alert.alert('Import Failed', 'Failed to import data. Please try again.');
    } finally {
      setImportingData(false);
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
      'RemindDay v1.0\n\nA simple, offline birthday reminder app built with React Native and Expo.\n\nFeatures:\n• Offline storage with SQLite\n• Local push notifications\n• Dark/Light theme\n• Export/Import functionality\n• Clean, user-friendly interface\n• No internet required',
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
    danger = false,
    disabled = false 
  }) => (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { backgroundColor: theme.cardBg },
        disabled && styles.disabledItem
      ]} 
      onPress={disabled ? null : onPress}
      activeOpacity={onPress && !disabled ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[
          styles.iconContainer, 
          danger && styles.dangerIconContainer,
          { backgroundColor: danger ? '#FEE2E2' : theme.upcomingBg }
        ]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={danger ? theme.error : theme.primary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.settingTitle, 
            { color: danger ? theme.error : theme.textPrimary },
            disabled && { color: theme.textLight }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && onPress && !disabled && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.textLight} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="settings-outline" size={50} color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* App Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Statistics</Text>
          
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

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Appearance</Text>
          
          {renderSettingItem({
            icon: isDarkMode ? 'moon' : 'sunny',
            title: 'Dark Mode',
            subtitle: isDarkMode ? 'Dark theme enabled' : 'Light theme enabled',
            onPress: toggleTheme,
            showArrow: false,
            rightComponent: (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDarkMode ? theme.cardBg : theme.textLight}
                ios_backgroundColor={theme.border}
              />
            ),
          })}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Data Management</Text>
          
          {renderSettingItem({
            icon: 'download-outline',
            title: 'Export Data',
            subtitle: 'Save birthdays to CSV file',
            onPress: handleExportData,
            disabled: exportingData || birthdayCount === 0,
            rightComponent: exportingData ? (
              <Text style={[styles.processingText, { color: theme.textSecondary }]}>Exporting...</Text>
            ) : null,
          })}
          
          {renderSettingItem({
            icon: 'cloud-upload-outline',
            title: 'Import Data',
            subtitle: 'Load birthdays from CSV file',
            onPress: handleImportData,
            disabled: importingData,
            rightComponent: importingData ? (
              <Text style={[styles.processingText, { color: theme.textSecondary }]}>Importing...</Text>
            ) : null,
          })}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notifications</Text>
          
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
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={notificationsEnabled ? theme.cardBg : theme.textLight}
                ios_backgroundColor={theme.border}
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
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>App Information</Text>
          
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
              '1. Tap the + button to add birthdays\n2. Set custom notification times for each person\n3. View upcoming birthdays on the home screen\n4. Tap on any birthday for details\n5. Export data for backup\n6. Toggle dark mode in settings\n\nTip: The app works completely offline!',
              [{ text: 'Got it!' }]
            ),
          })}
        </View>

        {/* Storage Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Storage</Text>
          
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
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Made with ❤️ for keeping track of special days
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.textLight }]}>
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
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  
  processingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  
  backButton: {
    padding: 8,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    marginHorizontal: 20,
    marginBottom: 12,
  },
  
  settingItem: {
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  disabledItem: {
    opacity: 0.5,
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
    marginBottom: 2,
  },
  
  settingSubtitle: {
    fontSize: 14,
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
    textAlign: 'center',
    marginBottom: 8,
  },
  
  footerSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SettingsScreen;