import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, SectionListComponent } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ambulanceImg from './Images/ambulance.png';
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';
import out from './Images/out.png';
import { getAuth, signOut } from 'firebase/auth';
import LottieView from 'lottie-react-native';
import LoaderModal from './LoaderModal';
import Toast from 'react-native-toast-message';

const HomePage = ({ navigation }) => {
  const [driverData, setDriverData] = useState(null);
  const [status, setStatus] = useState(''); // Driver status
  const [showBanner, setShowBanner] = useState(false); // Show banner when status becomes 'busy'
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = () => {
    Toast.show({
      type: 'info',
      text1: 'Ride Assigned !!!',
      // text2: 'Tap to update the app version',
      visibilityTime: 1500,
      position: 'top',
      topOffset: 10, // Adjust for bottom position
      autoHide: true,
      backgroundColor: "black",
    });
  };
  // Function to update the driver's location in Firestore
  const updateDriverLocation = async (latitude, longitude) => {
    if (latitude != null && longitude != null) {

      try {
        console.log("Latest location: " + latitude + ", " + longitude);
        const driverDocRef = doc(db, 'ambulances', auth.currentUser.uid);
        await updateDoc(driverDocRef, {
          'driverLocation.latitude': latitude,
          'driverLocation.longitude': longitude,
        });
        console.log('Driver location updated in Firestore');
      } catch (error) {
        console.log('Error updating driver location:', error);
        Alert.alert('Error', 'Failed to update driver location.');
      }
    }
    else {
      console.log('Error Updating driver location');
    }
  };

  // Function to get the current coordinates
  const getCoordinatesAndUpdate = () => {
    Geolocation.getCurrentPosition(
      (info) => {
        const latitude = info.coords.latitude;
        const longitude = info.coords.longitude;
        console.log("Info " + latitude, longitude);
        setLat(latitude);
        setLong(longitude);
      },
    );
  };

  // Handle screen focus to request location permission and subscribe to driver updates
  useFocusEffect(
    useCallback(() => {
      getCoordinatesAndUpdate(); // Fetch coordinates when screen is focused
      setLoading(true);
      // Get driver's ambulance document based on the current user's UID
      const driverDocRef = doc(db, 'ambulances', auth.currentUser.uid);

      const unsubscribe = onSnapshot(driverDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setDriverData(data);
          setStatus(data.status);
          if (data.status === 'busy') {
            showToast();
            setTimeout(async () => {
              setShowBanner(true); // Show banner when the status is 'busy'
            }, 1500);
          } else {
            setShowBanner(false);
          }
          updateDriverLocation(lat, long);
        } else {
          Alert.alert('Error', 'Driver data not found');
        }
      });

      setLoading(false);

      // Cleanup the subscription
      return () => unsubscribe();
    }, [])
  );

  const handleStartRide = () => {
    setShowBanner(false); // Hide the banner after clicking start
    navigation.navigate('AssignedRideScreen'); // Navigate to assigned ride page
  };

  return (
    <>
      {(!loading) && (!driverData) ?
        <LoaderModal />
        :
        <View style={styles.container}>
          {/* Ambulance Image Tile */}
          <View style={{ ...styles.tile, flex: 1, backgroundColor: "transparent", elevation: 0 }}>
            {/* <Image source={ambulanceImg} style={styles.ambulanceImage} /> */}

            <LottieView
              style={styles.ambulanceImage}
              source={require('./Images/car.json')}
              autoPlay
              loop={true}
            />
            <Text style={{ ...styles.tileTitle, color: "#0083fe" }}>Ambulance Details</Text>
            <Text style={{ ...styles.tileContent, color: "grey" }}>Ambulance Make :{driverData.make}</Text>
            <Text style={{ ...styles.tileContent, color: "grey" }}>Ambulance License : {driverData.numberPlate}</Text>
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

          <View style={{ flexDirection: "row", gap: 10, }}>

            {/* Driver Name Tile */}
            <View style={{ ...styles.tile, width: "50%" }}>
              <Text style={styles.tileTitle}>Driver Name</Text>
              <Text style={styles.tileContent}>{driverData.driverName}</Text>
            </View>

            {/* Driver Status Tile */}
            <View style={{ ...styles.tile, width: "35%" }}>
              <Text style={styles.tileTitle}>Status</Text>
              <Text style={styles.tileContent}>{status}</Text>
            </View>

          </ View>

          {/* Driver Location Tile */}
          <View style={styles.tile}>
            <Text style={styles.tileTitle}>Location</Text>
            <Text style={styles.tileContent}>Your Latitude : {lat}</Text>
            <Text style={styles.tileContent}>Your Longitude : {long}</Text>
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
      }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 30,
  },
  tile: {
    width: '90%',
    height: 150,
    backgroundColor: '#d7eef9',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: "center",
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  tileTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: "sans-serif-condensed",
    color: '#379cc3',
    marginBottom: 10,
  },
  tileContent: {
    fontSize: 16,
    color: '#1F1E30',
  },
  ambulanceImage: {
    width: '100%',
    // height: 140,
    flex: 1,
    resizeMode: 'contain',
  },
  banner: {
    position: 'absolute',
    flexDirection: "row",
    bottom: "5%",
    backgroundColor: '#0083fe',
    width: '95%',
    // height:300,
    justifyContent: "space-between",
    alignContent: "center",
    padding: 12,
    alignItems: 'center',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#d7eef9',
    padding: 8,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  startButtonText: {
    color: '#FFFFFF',
    color: "#0083fe",
    fontSize: 12,
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
    borderWidth: 2,
    borderRadius: 50,
    borderColor: "#FF0000",
    backgroundColor: "#FF0000",
  },
  signOutButtonText: {
    width: 25,
    height: 25,
  },
});

export default HomePage;
