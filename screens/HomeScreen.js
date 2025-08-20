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
import { Colors } from '../constants/Colors';
import {
    createTable,
    getAllBirthdays,
    getTodaysBirthdays
} from '../database/birthdayDB';
import { requestNotificationPermissions } from '../utils/notificationService';

const HomeScreen = ({ navigation }) => {
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
      <View style={styles.todaysBanner}>
        <View style={styles.bannerHeader}>
          <Ionicons name="gift" size={24} color={Colors.warning} />
          <Text style={styles.bannerTitle}>🎉 Today's Birthdays!</Text>
          <Ionicons name="gift" size={24} color={Colors.warning} />
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
      <Ionicons name="calendar-outline" size={80} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No Birthdays Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first birthday reminder by tapping the + button below
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="gift-outline" size={50} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading birthdays...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RemindDay</Text>
        <TouchableOpacity 
          onPress={navigateToSettings}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Today's birthdays banner */}
      {renderTodaysBanner()}

      {/* Upcoming birthdays list */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
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
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={upcomingBirthdays.length === 0 ? styles.emptyListContainer : null}
        />
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
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
  
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  settingsButton: {
    padding: 8,
  },
  
  todaysBanner: {
    backgroundColor: Colors.todayBanner,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
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
    color: Colors.textPrimary,
    marginHorizontal: 8,
  },
  
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default HomeScreen;