// screens/BirthdayDetailScreen.js
// This screen shows detailed information about a specific birthday

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../constants/ThemeContext';
import { deleteBirthday } from '../database/birthdayDB';
import { formatBirthDate, getDaysUntilBirthday } from '../utils/notificationService';

const BirthdayDetailScreen = ({ navigation, route }) => {
  const { birthday } = route.params;
  const { theme, isDarkMode } = useTheme();
  const [deleting, setDeleting] = useState(false);
  
  const daysUntil = getDaysUntilBirthday(birthday.birthDate);
  const isToday = daysUntil === 0;

  // Handle delete birthday
  const handleDelete = () => {
    Alert.alert(
      'Delete Birthday',
      `Are you sure you want to delete ${birthday.name}'s birthday reminder?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteBirthday(birthday.id);
      Alert.alert(
        'Deleted',
        'Birthday reminder has been deleted',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log('Error deleting birthday:', error);
      Alert.alert('Error', 'Failed to delete birthday');
    } finally {
      setDeleting(false);
    }
  };

  // Handle edit birthday
  const handleEdit = () => {
    navigation.navigate('EditBirthday', { birthday });
  };

  // Handle send WhatsApp message
  const sendWhatsApp = () => {
    const message = `🎉 Happy Birthday ${birthday.name}! Hope you have a wonderful day! 🎂`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('WhatsApp not installed', 'WhatsApp is not installed on this device');
        }
      })
      .catch((err) => console.error('WhatsApp error:', err));
  };

  // Handle send SMS
  const sendSMS = () => {
    const message = `🎉 Happy Birthday ${birthday.name}! Hope you have a wonderful day! 🎂`;
    const url = `sms:?body=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('SMS not available', 'SMS is not available on this device');
        }
      })
      .catch((err) => console.error('SMS error:', err));
  };

  // Get status message and color
  const getStatusInfo = () => {
    if (isToday) {
      return {
        message: '🎉 Today is the birthday!',
        color: theme.warning,
        icon: 'gift',
      };
    } else if (daysUntil === 1) {
      return {
        message: '🗓️ Tomorrow is the birthday!',
        color: theme.primary,
        icon: 'time',
      };
    } else if (daysUntil <= 7) {
      return {
        message: `📅 ${daysUntil} days until birthday`,
        color: theme.primary,
        icon: 'calendar',
      };
    } else {
      return {
        message: `📅 ${daysUntil} days until birthday`,
        color: theme.textSecondary,
        icon: 'calendar-outline',
      };
    }
  };

  const statusInfo = getStatusInfo();

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
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Birthday Details</Text>
        <TouchableOpacity 
          onPress={handleEdit}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Main Card */}
        <View style={[
          styles.mainCard, 
          { backgroundColor: theme.cardBg, shadowColor: theme.shadow },
          isToday && { 
            borderColor: theme.warning,
            backgroundColor: theme.todayBanner 
          }
        ]}>
          
          {/* Name and Status */}
          <View style={styles.nameSection}>
            <Text style={[styles.name, { color: theme.textPrimary }]}>{birthday.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon} size={16} color="white" />
              <Text style={styles.statusText}>{statusInfo.message}</Text>
            </View>
          </View>

          {/* Birth Date */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={theme.primary} />
              <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>Birth Date</Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
              {formatBirthDate(birthday.birthDate)}
            </Text>
          </View>

          {/* Notification Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="notifications" size={20} color={theme.primary} />
              <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>Notification Time</Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
              {new Date(`2024-01-01T${birthday.notificationTime}:00`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Text>
          </View>

          {/* Note */}
          {birthday.note && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>Note</Text>
              </View>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>{birthday.note}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isToday && (
          <View style={styles.actionSection}>
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Send Birthday Wishes</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: theme.cardBg,
                shadowColor: theme.shadow 
              }]}
              onPress={sendWhatsApp}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Send WhatsApp Message</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: theme.cardBg,
                shadowColor: theme.shadow 
              }]}
              onPress={sendSMS}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble" size={24} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Send SMS</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={[
              styles.deleteButton, 
              { 
                backgroundColor: theme.cardBg,
                borderColor: theme.error 
              },
              deleting && styles.deleteButtonDisabled
            ]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
            <Text style={[styles.deleteButtonText, { color: theme.error }]}>
              {deleting ? 'Deleting...' : 'Delete Birthday'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  
  editButton: {
    padding: 8,
  },
  
  scrollView: {
    flex: 1,
  },
  
  mainCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  nameSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  infoSection: {
    marginBottom: 20,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  
  infoValue: {
    fontSize: 18,
    marginLeft: 32,
  },
  
  noteText: {
    fontSize: 16,
    marginLeft: 32,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  actionSection: {
    margin: 16,
    marginTop: 8,
  },
  
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  
  actionButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 16,
  },
  
  dangerSection: {
    margin: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  
  deleteButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BirthdayDetailScreen;