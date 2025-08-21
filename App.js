import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import all screens
import AddBirthdayScreen from './screens/AddBirthdayScreen';
import BirthdayDetailScreen from './screens/BirthdayDetailScreen';
import EditBirthdayScreen from './screens/EditBirthdayScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import theme provider
import { ThemeProvider, useTheme } from './constants/ThemeContext';

// Create the stack navigator
const Stack = createStackNavigator();

// App content with theme support
const AppContent = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={theme.background} />
      
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
                backgroundColor: theme.background, // Use theme background
              },
            };
          },
        }}
      >
        {/* Home Screen - Main screen showing all birthdays */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'RemindDay',
          }}
        />
        
        {/* Add Birthday Screen - Form to add new birthdays */}
        <Stack.Screen 
          name="AddBirthday" 
          component={AddBirthdayScreen}
          options={{
            title: 'Add Birthday',
            presentation: 'modal', 
          }}
        />
        
        {/* Birthday Detail Screen - Shows details of a specific birthday */}
        <Stack.Screen 
          name="BirthdayDetail" 
          component={BirthdayDetailScreen}
          options={{
            title: 'Birthday Details',
          }}
        />
        
        {/* Edit Birthday Screen - Form to edit existing birthdays */}
        <Stack.Screen 
          name="EditBirthday" 
          component={EditBirthdayScreen}
          options={{
            title: 'Edit Birthday',
            presentation: 'modal', 
          }}
        />
        
        {/* Settings Screen - App settings and information */}
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
        
        {/* 
        Future screens can be added here:
        - ExportScreen (for exporting data)
        - ImportScreen (for importing data)
        - ThemeScreen (for theme settings)
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App component with theme provider
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}