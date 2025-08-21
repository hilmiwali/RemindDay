// screens/HomeScreen.js
// This is the main screen that shows all birthdays and today's celebrations

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BirthdayCard from '../components/BirthdayCard';
import { useTheme } from '../constants/ThemeContext';
import {
  createTable,
  getAllBirthdays,
  getTodaysBirthdays
} from '../database/birthdayDB';
import { requestNotificationPermissions } from '../utils/notificationService';

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [birthdays, setBirthdays] = useState([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize database and load data when screen loads
  useEffect(() => {
    initializeApp();
  }, []);

  // Refresh data when screen comes into focus (e.g., returning from Add screen)
  useFocusEffect(
    useCallback(() => {
      loadBirthdays();
    }, [])
  );

  const initializeApp = async () => {
    try {
      // Create database table if it doesn't exist
      await createTable();
      
      // Request notification permissions
      await requestNotificationPermissions();
      
      // Load birthdays
      await loadBirthdays();
      
    } catch (error) {
      console.log('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please restart.');
    } finally {
      setLoading(false);
    }
  };

  const loadBirthdays = async () => {
    try {
      // Load all birthdays
      const allBirthdays = await getAllBirthdays();
      setBirthdays(allBirthdays);
      
      // Load today's birthdays separately
      const todaysBds = await getTodaysBirthdays();
      setTodaysBirthdays(todaysBds);
      
      console.log(`Loaded ${allBirthdays.length} birthdays, ${todaysBds.length} today`);
      
    } catch (error) {
      console.log('Error loading birthdays:', error);
      Alert.alert('Error', 'Failed to load birthdays');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBirthdays();
    setRefreshing(false);
  };

  const navigateToBirthdayDetail = (birthday) => {
    navigation.navigate('BirthdayDetail', { birthday });
  };

  const navigateToAddBirthday = () => {
    navigation.navigate('AddBirthday');
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Filter out today's birthdays from the main list
  const upcomingBirthdays = birthdays.filter(birthday => 
    !todaysBirthdays.some(todayBd => todayBd.id === birthday.id)
  );

  const renderTodaysBanner = () => {
    if (todaysBirthdays.length === 0) return null;

    return (
      <View style={[
        styles.todaysBanner, 
        { 
          backgroundColor: theme.todayBanner, 
          borderColor: theme.warning 
        }
      ]}>
        <View style={styles.bannerHeader}>
          <Ionicons name="gift" size={24} color={theme.warning} />
          <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>🎉 Today's Birthdays!</Text>
          <Ionicons name="gift" size={24} color={theme.warning} />
        </View>
        
        {todaysBirthdays.map(birthday => (
          <BirthdayCard
            key={birthday.id}
            birthday={birthday}
            onPress={() => navigateToBirthdayDetail(birthday)}
            isToday={true}
          />
        ))}
      </View>
    );
  };

  const renderBirthdayCard = ({ item }) => (
    <BirthdayCard
      birthday={item}
      onPress={() => navigateToBirthdayDetail(item)}
      isToday={false}
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color={theme.textLight} />
      <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No Birthdays Yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textLight }]}>
        Add your first birthday reminder by tapping the + button below
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="gift-outline" size={50} color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading birthdays...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>RemindDay</Text>
        <TouchableOpacity 
          onPress={navigateToSettings}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Today's birthdays banner */}
      {renderTodaysBanner()}

      {/* Upcoming birthdays list */}
      <View style={styles.listContainer}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Upcoming Birthdays ({upcomingBirthdays.length})
        </Text>
        
        <FlatList
          data={upcomingBirthdays}
          renderItem={renderBirthdayCard}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={upcomingBirthdays.length === 0 ? styles.emptyListContainer : null}
        />
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={[styles.fab, { 
          backgroundColor: theme.primary,
          shadowColor: theme.shadow 
        }]} 
        onPress={navigateToAddBirthday}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  
  settingsButton: {
    padding: 8,
  },
  
  todaysBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default HomeScreen;