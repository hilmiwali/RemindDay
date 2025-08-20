// screens/EditBirthdayScreen.js
// This screen allows users to edit existing birthdays

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors } from '../constants/Colors';
import { updateBirthday } from '../database/birthdayDB';
import { scheduleBirthdayNotification } from '../utils/notificationService';

const EditBirthdayScreen = ({ navigation, route }) => {
  const { birthday } = route.params;
  
  // Form state initialized with existing birthday data
  const [name, setName] = useState(birthday.name);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Convert MM-DD back to Date object
    const [month, day] = birthday.birthDate.split('-').map(Number);
    return new Date(2024, month - 1, day); // Use any year for editing
  });
  const [note, setNote] = useState(birthday.note || '');
  const [notificationTime, setNotificationTime] = useState(birthday.notificationTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Validation function
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }
    if (name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
      return false;
    }
    return true;
  };

  // Format date to MM-DD string
  const formatDateToString = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // Handle time picker change
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setNotificationTime(`${hours}:${minutes}`);
    }
  };

  // Convert time string to Date object for picker
  const getTimeFromString = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Update birthday in database
  const updateBirthdayData = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Format the birth date
      const birthDateString = formatDateToString(selectedDate);
      
      // Update in database
      const rowsAffected = await updateBirthday(
        birthday.id,
        name.trim(),
        birthDateString,
        note.trim(),
        notificationTime
      );

      if (rowsAffected > 0) {
        // Create updated birthday object for notification
        const updatedBirthday = {
          id: birthday.id,
          name: name.trim(),
          birthDate: birthDateString,
          note: note.trim(),
          notificationTime: notificationTime
        };

        // Schedule updated notification
        await scheduleBirthdayNotification(updatedBirthday);

        // Show success message
        Alert.alert(
          'Updated!', 
          `Birthday reminder for ${name} has been updated!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No changes were made to the birthday');
      }

    } catch (error) {
      console.log('Error updating birthday:', error);
      Alert.alert('Error', 'Failed to update birthday. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Birthday</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter person's name"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
              maxLength={50}
              autoFocus={true}
              returnKeyType="next"
            />
          </View>

          {/* Birth Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Birth Date *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Notification Time Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notification Time</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.dateText}>
                {getTimeFromString(notificationTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Choose when you'd like to be reminded
            </Text>
          </View>

          {/* Note Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.noteInput]}
              placeholder="Add a special note or memory..."
              placeholderTextColor={Colors.textLight}
              value={note}
              onChangeText={setNote}
              maxLength={200}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {note.length}/200 characters
            </Text>
          </View>

          {/* Update Button */}
          <TouchableOpacity 
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={updateBirthdayData}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <Text style={styles.updateButtonText}>Updating...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={20} color="white" />
                <Text style={styles.updateButtonText}>Update Birthday</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={getTimeFromString(notificationTime)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </KeyboardAvoidingView>
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
  
  placeholder: {
    width: 40,
  },
  
  scrollView: {
    flex: 1,
  },
  
  form: {
    padding: 20,
  },
  
  inputContainer: {
    marginBottom: 24,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  textInput: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  noteInput: {
    height: 80,
    paddingTop: 14,
  },
  
  dateButton: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  dateText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: 12,
  },
  
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  characterCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  
  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  updateButtonDisabled: {
    backgroundColor: Colors.textLight,
    elevation: 0,
    shadowOpacity: 0,
  },
  
  updateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default EditBirthdayScreen;