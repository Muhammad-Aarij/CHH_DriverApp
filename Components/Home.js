import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'; // For updating driver location
import { db, auth } from '../firebaseConfig'; // Import Firebase config
import ambulanceImg from './Images/ambulance.png'; // Ambulance image
import Geolocation from '@react-native-community/geolocation'; // Geolocation package
import { useFocusEffect } from '@react-navigation/native';
import out from './Images/out.png'; // Sign out image
import { getAuth, signOut } from 'firebase/auth'; // For user authentication

const HomePage = ({ navigation }) => {
  const [driverData, setDriverData] = useState(null);
  const [status, setStatus] = useState(''); // Driver status
  const [showBanner, setShowBanner] = useState(false); // Show banner when status becomes 'busy'
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);

  // Function to update the driver's location in Firestore
  const updateDriverLocation = async (latitude, longitude) => {
    try {
      console.log("Latest location: " + latitude + ", " + longitude);
      const driverDocRef = doc(db, 'ambulances', auth.currentUser.uid); // Reference to driver's Firestore document
      await updateDoc(driverDocRef, {
        'driverLocation.latitude': latitude,
        'driverLocation.longitude': longitude,
      });
      console.log('Driver location updated in Firestore');
    } catch (error) {
      console.log('Error updating driver location:', error);
      Alert.alert('Error', 'Failed to update driver location.');
    }
  };

  // Function to get the current coordinates
  const getCoordinatesAndUpdate = () => {
    Geolocation.getCurrentPosition(
      (info) => {
        const latitude = info.coords.latitude;
        const longitude = info.coords.longitude;
        setLat(latitude);
        setLong(longitude);
        // Update Firestore with new location
        updateDriverLocation(latitude, longitude);
      },
      (error) => {
        console.log(error);
        Alert.alert('Error', 'Failed to get current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Handle screen focus to request location permission and subscribe to driver updates
  useFocusEffect(
    useCallback(() => {
      getCoordinatesAndUpdate(); // Fetch coordinates when screen is focused

      // Get driver's ambulance document based on the current user's UID
      const driverDocRef = doc(db, 'ambulances', auth.currentUser.uid);

      // Subscribe to real-time updates of driver status
      const unsubscribe = onSnapshot(driverDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setDriverData(data);
          setStatus(data.status);
          if (data.status === 'busy') {
            setShowBanner(true); // Show banner when the status is 'busy'
          } else {
            setShowBanner(false);
          }
        } else {
          Alert.alert('Error', 'Driver data not found');
        }
      });

      // Cleanup the subscription
      return () => unsubscribe();
    }, [])
  );

  const handleStartRide = () => {
    setShowBanner(false); // Hide the banner after clicking start
    navigation.navigate('AssignedRideScreen'); // Navigate to assigned ride page
  };

  if (!driverData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading driver details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ambulance Image Tile */}
      <View style={{ ...styles.tile, flex: 1, backgroundColor: "transparent" }}>
        <Image source={ambulanceImg} style={styles.ambulanceImage} />
        <Text style={{ ...styles.tileTitle, color: "white" }}>Ambulance Details</Text>
        <Text style={{ ...styles.tileContent, color: "white" }}>{driverData.make}</Text>
        <Text style={{ ...styles.tileContent, color: "white" }}>License: {driverData.numberPlate}</Text>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => {
          signOut(auth)
            .then(() => {
              console.log('User signed out successfully!');
              navigation.navigate('SignInScreen');
            })
            .catch((error) => {
              console.error('Sign-out error: ', error);
            });
        }}
      >
        <Image style={styles.signOutButtonText} source={out} />
      </TouchableOpacity>

      {/* Driver Name Tile */}
      <View style={styles.tile}>
        <Text style={styles.tileTitle}>Driver Name</Text>
        <Text style={styles.tileContent}>{driverData.driverName}</Text>
      </View>

      {/* Driver Location Tile */}
      <View style={styles.tile}>
        <Text style={styles.tileTitle}>Location</Text>
        <Text style={styles.tileContent}>Lat: {driverData.driverLocation.latitude}</Text>
        <Text style={styles.tileContent}>Lon: {driverData.driverLocation.longitude}</Text>
      </View>

      {/* Driver Status Tile */}
      <View style={styles.tile}>
        <Text style={styles.tileTitle}>Status</Text>
        <Text style={styles.tileContent}>{status}</Text>
      </View>

      {/* Banner for Ride Assignment */}
      {showBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Ride Assigned</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1F1E30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tile: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F1E30',
    marginBottom: 10,
  },
  tileContent: {
    fontSize: 16,
    color: '#1F1E30',
  },
  ambulanceImage: {
    width: '100%',
    height: 150,
    flex: 1,
    resizeMode: 'contain',
  },
  banner: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
  },
  bannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F1E30',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#1F1E30',
    padding: 15,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1E30',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  signOutButton: {
    // backgroundColor: '#FF0000',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    borderWidth:2,
    borderRadius:50,
    borderColor: "#FF0000",
  },
  signOutButtonText: {
    width:25,
    height:25,
  },
});

export default HomePage;
