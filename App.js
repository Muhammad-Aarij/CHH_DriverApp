import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Import Firebase auth

// Import screens
import AssignedRideScreen from './Components/AssignedRideScreen';
import RideHistoryScreen from './Components/RideHistoryScreen';
import SignInScreen from './Components/SignInScreen';
import SignUpScreen from './Components/SignUpScreen';
import { Text } from 'react-native';
import HomePage from './Components/Home';

// Create Stack Navigator
const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(false); // Track auth state
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // User is signed in
      } else {
        setUser(null); // User is signed out
      }
      setLoading(false); // Loading is done
    });
    return unsubscribe; // Clean up subscription on unmount
  }, []);

  if (loading) {
    return <Text>Loading...</Text>; // Optional: You can render a loading spinner here
  }

  return (
    <NavigationContainer >
    {/* <NavigationContainer initialState={"AssignedRideScreen"}> */}
      <Stack.Navigator
        initialRouteName={user ? "Home" : "SignInScreen"} // Automatically route based on auth status
        screenOptions={{
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#333',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >

        <Stack.Screen
          name="AssignedRideScreen"
          component={AssignedRideScreen}
          options={{ title: 'Assigned Ride', headerShown: false }}
        />
        <Stack.Screen
          name="RideHistoryScreen"
          component={RideHistoryScreen}
          options={{ title: 'Ride History' }}
        />
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{ title: 'Ride History', headerShown: false }}
        />

        <>
          <Stack.Screen
            name="SignInScreen"
            component={SignInScreen}
            options={{ title: 'Sign In', headerShown: false }}
          />
          <Stack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={{ title: 'Sign Up', headerShown: false }}
          />
        </>

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
