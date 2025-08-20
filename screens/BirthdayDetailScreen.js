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

import { Colors } from '../constants/Colors';
import { deleteBirthday } from '../database/birthdayDB';
import { formatBirthDate, getDaysUntilBirthday } from '../utils/notificationService';

const BirthdayDetailScreen = ({ navigation, route }) => {
  const { birthday } = route.params;
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
        color: Colors.warning,
        icon: 'gift',
      };
    } else if (daysUntil === 1) {
      return {
        message: '🗓️ Tomorrow is the birthday!',
        color: Colors.primary,
        icon: 'time',
      };
    } else if (daysUntil <= 7) {
      return {
        message: `📅 ${daysUntil} days until birthday`,
        color: Colors.primary,
        icon: 'calendar',
      };
    } else {
      return {
        message: `📅 ${daysUntil} days until birthday`,
        color: Colors.textSecondary,
        icon: 'calendar-outline',
      };
    }
  };

  const statusInfo = getStatusInfo();

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
        <Text style={styles.headerTitle}>Birthday Details</Text>
        <TouchableOpacity 
          onPress={handleEdit}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Main Card */}
        <View style={[styles.mainCard, isToday && styles.todayCard]}>
          
          {/* Name and Status */}
          <View style={styles.nameSection}>
            <Text style={styles.name}>{birthday.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon} size={16} color="white" />
              <Text style={styles.statusText}>{statusInfo.message}</Text>
            </View>
          </View>

          {/* Birth Date */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Birth Date</Text>
            </View>
            <Text style={styles.infoValue}>
              {formatBirthDate(birthday.birthDate)}
            </Text>
          </View>

          {/* Notification Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="notifications" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Notification Time</Text>
            </View>
            <Text style={styles.infoValue}>
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
                <Ionicons name="document-text" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Note</Text>
              </View>
              <Text style={styles.noteText}>{birthday.note}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isToday && (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Send Birthday Wishes</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={sendWhatsApp}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.actionButtonText}>Send WhatsApp Message</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={sendSMS}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble" size={24} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Send SMS</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={styles.deleteButtonText}>
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
    backgroundColor: Colors.background,
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
  
  editButton: {
    padding: 8,
  },
  
  scrollView: {
    flex: 1,
  },
  
  mainCard: {
    backgroundColor: Colors.cardBg,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  todayCard: {
    borderWidth: 2,
    borderColor: Colors.warning,
    backgroundColor: Colors.todayBanner,
  },
  
  nameSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  
  infoValue: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginLeft: 32,
  },
  
  noteText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  
  actionButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: 16,
  },
  
  dangerSection: {
    margin: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  
  deleteButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  },
});

export default BirthdayDetailScreen;