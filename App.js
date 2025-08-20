// App.js
// Main application file that sets up navigation and app structure

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import all screens
import AddBirthdayScreen from './screens/AddBirthdayScreen';
import BirthdayDetailScreen from './screens/BirthdayDetailScreen';
import EditBirthdayScreen from './screens/EditBirthdayScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import colors
import { Colors } from './constants/Colors';

// Create the stack navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // We're creating custom headers in each screen
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
            presentation: 'modal', // Makes it slide up from bottom on iOS
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
            presentation: 'modal', // Makes it slide up from bottom on iOS
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
}