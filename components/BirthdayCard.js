// components/BirthdayCard.js
// This component displays individual birthday cards in the list

import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { formatBirthDate, getDaysUntilBirthday } from '../utils/notificationService';

const BirthdayCard = ({ birthday, onPress, isToday = false }) => {
  const { theme } = useTheme();
  const daysUntil = getDaysUntilBirthday(birthday.birthDate);
  
  // Choose appropriate icon and message
  let displayMessage = '';
  let iconName = 'gift-outline';
  let iconColor = theme.secondary;
  
  if (isToday) {
    displayMessage = '🎉 Today!';
    iconName = 'gift';
    iconColor = theme.warning;
  } else if (daysUntil === 1) {
    displayMessage = 'Tomorrow';
    iconName = 'time-outline';
    iconColor = theme.primary;
  } else if (daysUntil <= 7) {
    displayMessage = `In ${daysUntil} days`;
    iconName = 'calendar-outline';
    iconColor = theme.primary;
  } else {
    displayMessage = `In ${daysUntil} days`;
    iconName = 'calendar-outline';
    iconColor = theme.textSecondary;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: theme.cardBg, shadowColor: theme.shadow },
        isToday ? { 
          backgroundColor: theme.todayBanner, 
          borderLeftColor: theme.warning,
          borderColor: theme.warning 
        } : { 
          borderLeftColor: theme.primary 
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Left side - Birthday info */}
        <View style={styles.leftSection}>
          <Text style={[
            styles.name, 
            { color: theme.textPrimary },
            isToday && { fontWeight: '700' }
          ]} numberOfLines={1}>
            {birthday.name}
          </Text>
          <Text style={[
            styles.date, 
            { color: isToday ? theme.warning : theme.primary },
            isToday && { fontWeight: '600' }
          ]}>
            {formatBirthDate(birthday.birthDate)}
          </Text>
          {birthday.note && (
            <Text style={[
              styles.note, 
              { color: theme.textSecondary },
              isToday && { fontWeight: '500' }
            ]} numberOfLines={1}>
              {birthday.note}
            </Text>
          )}
        </View>
        
        {/* Right side - Days until and icon */}
        <View style={styles.rightSection}>
          <Ionicons 
            name={iconName} 
            size={24} 
            color={iconColor} 
            style={styles.icon}
          />
          <Text style={[styles.daysText, { color: iconColor }]}>
            {displayMessage}
          </Text>
        </View>
      </View>
      
      {/* Bottom border for visual separation */}
      {!isToday && <View style={[styles.bottomBorder, { backgroundColor: theme.border }]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  date: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  
  note: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  icon: {
    marginBottom: 4,
  },
  
  daysText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  bottomBorder: {
    height: 1,
    marginHorizontal: 16,
  },
});

export default BirthdayCard;