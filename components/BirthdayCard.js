// components/BirthdayCard.js
// This component displays individual birthday cards in the list

import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { formatBirthDate, getDaysUntilBirthday } from '../utils/notificationService';

const BirthdayCard = ({ birthday, onPress, isToday = false }) => {
  const daysUntil = getDaysUntilBirthday(birthday.birthDate);
  
  // Different styling for today's birthdays
  const cardStyle = isToday ? styles.todayCard : styles.regularCard;
  const textStyle = isToday ? styles.todayText : styles.regularText;
  
  // Choose appropriate icon and message
  let displayMessage = '';
  let iconName = 'gift-outline';
  let iconColor = Colors.secondary;
  
  if (isToday) {
    displayMessage = '🎉 Today!';
    iconName = 'gift';
    iconColor = Colors.warning;
  } else if (daysUntil === 1) {
    displayMessage = 'Tomorrow';
    iconName = 'time-outline';
    iconColor = Colors.primary;
  } else if (daysUntil <= 7) {
    displayMessage = `In ${daysUntil} days`;
    iconName = 'calendar-outline';
    iconColor = Colors.primary;
  } else {
    displayMessage = `In ${daysUntil} days`;
    iconName = 'calendar-outline';
    iconColor = Colors.textSecondary;
  }

  return (
    <TouchableOpacity 
      style={[styles.card, cardStyle]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Left side - Birthday info */}
        <View style={styles.leftSection}>
          <Text style={[styles.name, textStyle]} numberOfLines={1}>
            {birthday.name}
          </Text>
          <Text style={[styles.date, isToday ? styles.todayDate : styles.regularDate]}>
            {formatBirthDate(birthday.birthDate)}
          </Text>
          {birthday.note && (
            <Text style={[styles.note, isToday ? styles.todayNote : styles.regularNote]} numberOfLines={1}>
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
      {!isToday && <View style={styles.bottomBorder} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  regularCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  todayCard: {
    backgroundColor: Colors.todayBanner,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    borderWidth: 1,
    borderColor: Colors.warning,
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
  
  regularText: {
    color: Colors.textPrimary,
  },
  
  todayText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  
  date: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  
  regularDate: {
    color: Colors.primary,
  },
  
  todayDate: {
    color: Colors.warning,
    fontWeight: '600',
  },
  
  note: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  regularNote: {
    color: Colors.textSecondary,
  },
  
  todayNote: {
    color: Colors.textSecondary,
    fontWeight: '500',
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
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
});

export default BirthdayCard;