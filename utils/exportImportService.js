import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { getAllBirthdays, insertBirthday } from '../database/birthdayDB';
import { scheduleBirthdayNotification } from './notificationService';

// Export birthdays to CSV format
export const exportBirthdaysToCSV = async () => {
  try {
    // Get all birthdays from database
    const birthdays = await getAllBirthdays();
    
    if (birthdays.length === 0) {
      Alert.alert('No Data', 'No birthdays to export. Add some birthdays first!');
      return false;
    }

    // Create CSV header
    const csvHeader = 'Name,BirthDate,Note,NotificationTime\n';
    
    // Convert birthdays to CSV rows
    const csvRows = birthdays.map(birthday => {
      // Escape commas and quotes in data
      const escapeCsvField = (field) => {
        if (!field) return '';
        const fieldStr = String(field);
        if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
          return `"${fieldStr.replace(/"/g, '""')}"`;
        }
        return fieldStr;
      };
      
      return `${escapeCsvField(birthday.name)},${escapeCsvField(birthday.birthDate)},${escapeCsvField(birthday.note || '')},${escapeCsvField(birthday.notificationTime)}`;
    }).join('\n');
    
    // Combine header and rows
    const csvContent = csvHeader + csvRows;
    
    // Create filename with current date
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const fileName = `RemindDay_Birthdays_${currentDate}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    // Write CSV file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export RemindDay Birthdays',
        UTI: 'public.comma-separated-values-text',
      });
      
      console.log(`Exported ${birthdays.length} birthdays to CSV`);
      return true;
    } else {
      Alert.alert('Sharing not available', 'Unable to share the file on this device');
      return false;
    }
    
  } catch (error) {
    console.log('Error exporting CSV:', error);
    Alert.alert('Export Failed', 'Failed to export birthdays. Please try again.');
    return false;
  }
};

// Import birthdays from CSV file
export const importBirthdaysFromCSV = async () => {
  try {
    // Pick CSV file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/csv',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) {
      return false; // User canceled
    }
    
    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Parse CSV content
    const lines = fileContent.trim().split('\n');
    
    if (lines.length < 2) {
      Alert.alert('Invalid File', 'The CSV file appears to be empty or invalid.');
      return false;
    }
    
    // Validate header
    const header = lines[0].toLowerCase();
    if (!header.includes('name') || !header.includes('birthdate')) {
      Alert.alert('Invalid Format', 'The CSV file must contain Name and BirthDate columns.');
      return false;
    }
    
    // Parse each row
    const importedBirthdays = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i];
        if (!row.trim()) continue; // Skip empty rows
        
        // Simple CSV parsing (handles basic quoted fields)
        const fields = parseCSVRow(row);
        
        if (fields.length < 2) {
          errors.push(`Row ${i + 1}: Not enough columns`);
          continue;
        }
        
        const [name, birthDate, note = '', notificationTime = '09:00'] = fields;
        
        // Validate data
        if (!name.trim()) {
          errors.push(`Row ${i + 1}: Name is required`);
          continue;
        }
        
        if (!validateBirthDate(birthDate.trim())) {
          errors.push(`Row ${i + 1}: Invalid birth date format (should be MM-DD)`);
          continue;
        }
        
        if (!validateNotificationTime(notificationTime.trim())) {
          errors.push(`Row ${i + 1}: Invalid notification time format (should be HH:MM)`);
          continue;
        }
        
        importedBirthdays.push({
          name: name.trim(),
          birthDate: birthDate.trim(),
          note: note.trim(),
          notificationTime: notificationTime.trim() || '09:00',
        });
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    if (importedBirthdays.length === 0) {
      Alert.alert('Import Failed', 'No valid birthdays found in the file.\n\n' + errors.join('\n'));
      return false;
    }
    
    // Show confirmation dialog
    const confirmMessage = `Found ${importedBirthdays.length} valid birthdays to import.${errors.length > 0 ? `\n\n${errors.length} rows had errors and will be skipped.` : ''}\n\nProceed with import?`;
    
    return new Promise((resolve) => {
      Alert.alert(
        'Confirm Import',
        confirmMessage,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Import',
            onPress: async () => {
              const success = await performImport(importedBirthdays);
              resolve(success);
            },
          },
        ]
      );
    });
    
  } catch (error) {
    console.log('Error importing CSV:', error);
    Alert.alert('Import Failed', 'Failed to import birthdays. Please check the file format.');
    return false;
  }
};

// Perform the actual import
const performImport = async (birthdays) => {
  let successCount = 0;
  let errorCount = 0;
  
  for (const birthday of birthdays) {
    try {
      // Insert into database
      const birthdayId = await insertBirthday(
        birthday.name,
        birthday.birthDate,
        birthday.note,
        birthday.notificationTime
      );
      
      // Schedule notification
      const birthdayWithId = { ...birthday, id: birthdayId };
      await scheduleBirthdayNotification(birthdayWithId);
      
      successCount++;
    } catch (error) {
      console.log(`Error importing birthday ${birthday.name}:`, error);
      errorCount++;
    }
  }
  
  // Show result
  if (successCount > 0) {
    Alert.alert(
      'Import Complete',
      `Successfully imported ${successCount} birthdays.${errorCount > 0 ? `\n${errorCount} birthdays failed to import.` : ''}`
    );
    return true;
  } else {
    Alert.alert('Import Failed', 'Failed to import any birthdays.');
    return false;
  }
};

// Simple CSV row parser
const parseCSVRow = (row) => {
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  fields.push(current);
  
  return fields;
};

// Validate birth date format (MM-DD)
const validateBirthDate = (birthDate) => {
  const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  return regex.test(birthDate);
};

// Validate notification time format (HH:MM)
const validateNotificationTime = (time) => {
  const regex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};