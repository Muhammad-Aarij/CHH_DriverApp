import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, Platform, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../firebaseConfig'; // Import Firebase
import { doc, updateDoc, onSnapshot,getDoc } from 'firebase/firestore';
import Geolocation from '@react-native-community/geolocation'; // Import the geolocation package
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // Permissions library
import { getDistance } from 'geolib'; // Library for calculating distance
import map from './Images/map.png';
import driverr from './Images/driver.png';
import doc1 from './Images/doc1.png';
import doc2 from './Images/doc2.png';
import doc3 from './Images/doc3.png';

const AssignedRideScreen = ({ navigation }) => {
  const [driver, setDriver] = useState(null); // Track driver location
  const [driverLocation, setDriverLocation] = useState(null); // Track driver location
  const [previousDriverLocation, setPreviousDriverLocation] = useState(null); // Track previous driver location
  const [patientLocation, setPatientLocation] = useState(null); // Patient location
  const [driverStatus, setDriverStatus] = useState('free'); // Track driver status
  const [distance, setDistance] = useState(null); // Track distance between driver and patient
  const [time, setTime] = useState(null); // Track time to reach patient
  const [loading, setLoading] = useState(true); // Add loading state
  const driverId = auth.currentUser.uid;

  // Function to request location permissions
  const requestLocationPermission = async () => {
    try {
      let permission;

      // Request location permissions for both Android and iOS
      if (Platform.OS === 'android') {
        permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      } else if (Platform.OS === 'ios') {
        permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }

      // Check permission result
      if (permission === RESULTS.GRANTED) {
        getLocation(); // Permission granted, get the location
      } else {
        Alert.alert('Permission denied', 'Location permission is required to continue.');
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  // Function to fetch current location and update the state
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLocation({ latitude, longitude });
      },
      (error) => {
        Alert.alert('Error', 'Unable to get location: ' + error.message);
        setLoading(false); // Stop loading if there's an error
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Fetch driver's status and patient's location from Firestore
  useEffect(() => {
    const driverDocRef = doc(db, 'ambulances', driverId);
    const unsubscribe = onSnapshot(driverDocRef, (doc) => {
      const data = doc.data();
      setDriver(data);
      setDriverStatus(data?.status || 'free');

      if (data?.status === 'busy') {
        const patientLoc = data?.patientLocation;
        if (patientLoc && patientLoc.latitude !== "0" && patientLoc.longitude !== "0") {
          setPatientLocation({
            latitude: parseFloat(patientLoc.latitude),
            longitude: parseFloat(patientLoc.longitude)
          });
          // console.log("Patient location"+patientLocation.longitude+" is"+patientLocation.latitude);
        } else {
          console.warn('Invalid patient location in Firestore');
        }
      }

      setLoading(false); // Set loading to false after fetching data
    });

    return () => unsubscribe();
  }, []);

  // Request location permission on component mount
  useEffect(() => {
    requestLocationPermission(); // Request location permissions
  }, []);

  // Calculate and update Firestore if distance change is greater than 3 meters
  useEffect(() => {
    if (driverLocation?.latitude && driverLocation?.longitude) {
      if (previousDriverLocation) {
        const distanceChanged = getDistance(
          previousDriverLocation,
          driverLocation
        );

        if (distanceChanged > 1) { // 3 meters threshold
          console.log('Updating Firestore with driver location:', driverLocation);
          updateDoc(doc(db, 'ambulances', driverId), {
            driverLocation: driverLocation,
          }).catch(() => Alert.alert('Error', 'Failed to update location in Firebase'));
        }
      } else {
        // Update Firestore if it's the first location update
        console.log('Updating Firestore with driver location:', driverLocation);
        updateDoc(doc(db, 'ambulances', driverId), {
          driverLocation: driverLocation,
        }).catch(() => Alert.alert('Error', 'Failed to update location in Firebase'));
      }

      // Update previousDriverLocation state
      setPreviousDriverLocation(driverLocation);
    }
  }, [driverLocation]);

  // Fetch current location every 3 seconds if the driver is busy
  useEffect(() => {
    if (driverStatus === 'busy') {
      const locationInterval = setInterval(() => {
        getLocation();
      }, 3000);

      return () => clearInterval(locationInterval); // Cleanup the interval
    }
  }, [driverStatus]);

  

  // Calculate distance and time
  useEffect(() => {
    if (driverLocation && patientLocation) {
      const distanceInKm = calculateDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        patientLocation.latitude,
        patientLocation.longitude
      );
      setDistance(distanceInKm);

      // Using 60 km/h as the average speed
      const estimatedTime = calculateTime(
        parseFloat(distanceInKm.split(' ')[0]), // Extract numeric value
        60
      );
      setTime(estimatedTime);
    }
  }, [driverLocation, patientLocation]);

  // Custom distance calculation formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c; // Distance in kilometers

    // Return distance in kilometers if greater than 1 km, otherwise in meters
    return distanceInKm > 1 ? distanceInKm.toFixed(1) + ' km' : (distanceInKm * 1000).toFixed(0) + ' meters';
  };

  // Custom time calculation function
  const calculateTime = (distance, averageSpeedKmph) => {
    const timeInMinutes = (distance / averageSpeedKmph) * 60; // Time in minutes

    // Convert to hours and minutes if time exceeds 60 minutes
    if (timeInMinutes > 60) {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = Math.round(timeInMinutes % 60);
      return `${hours} hr ${minutes} min`;
    } else {
      return `${Math.round(timeInMinutes)} min`;
    }
  };


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffcc00" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  const updateDriverStatus = async (status) => {
    try {
      const driverDocRef = doc(db, 'ambulances', driverId);
      const docSnapshot = await getDoc(driverDocRef);

      if (docSnapshot.exists()) {
        await updateDoc(driverDocRef, {
          status: status, // Set driver status to the passed parameter
          patientLocation: [0, 0], // Reset patient location to [0, 0]
        });
        console.log('SuccessDriver status updated to  and patient location reset.');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Driver not found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update driver data.' + error);
    }
  };




  const doctors = [
    { name: 'Dr. Hira Kanwal', specialty: 'Cardiologist', rating: 4.3, image: doc2 },
    { name: 'Dr. Ali Mughal', specialty: 'Cardiologist', rating: 4.1, image: doc1 },
    { name: 'Dr. Sameena Tahir', specialty: 'Cardiologist', rating: 4.0, image: doc3 },
  ];

  return (
    distance != null && (
      <ScrollView style={{ flex: 1 }}>
        {/* Map Image at the Top */}
        <Image
          source={map} // Replace with your map image URL
          style={{ width: '100%', height: 380 }}
          resizeMode="cover"
        />
        <TouchableOpacity style={{ position: 'absolute', top: 25, left: 20, zIndex: 1 }} onPress={() => {
          navigation.goBack();
        }}>
          <Text style={{ fontSize: 30, color: '#1F1E30' }}>←</Text>
        </TouchableOpacity>
        <View style={{ backgroundColor: "#1F1E30", borderTopLeftRadius: 30, borderTopRightRadius: 30, flex: 1, height: 500 }}>
          <View style={{ alignSelf: "center", width: '35%', height: 3, backgroundColor: '#FFFFFF', marginTop: 15, opacity: 0.8 }}></View>

          {/* Driving Info */}
          <View style={{ paddingVertical: 20, paddingBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontFamily: "sans-serif-light", color: '#FFFFFF' }}>Driving to your destination</Text>
            <Text style={{ fontSize: 30, fontFamily: "sans-serif-condensed", fontWeight: 'bold', color: '#FFFFFF' }}>
              {distance} <Text style={{ fontSize: 18, fontFamily: "sans-serif-light", color: '#FFFFFF' }}>way</Text>
            </Text>
            <Text style={{ marginTop: 10, fontSize: 14, fontFamily: "sans-serif-light", color: '#FFFFFF' }}>
              Arriving in {time}
            </Text>
          </View>

          {/* Driver Info */}
          <View style={styles.driverContainer}>
            <Image source={driverr} style={styles.driverImage} ></Image>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.driverName}</Text>
              <Text style={styles.hospitalName}>Shifa Hospital F10</Text>
              <View style={styles.ratingContainer}>
                {[...Array(3)].map((_, i) => (
                  <Text key={i} style={styles.star}>★</Text>
                ))}
                {[...Array(2)].map((_, i) => (
                  <Text key={i} style={styles.starEmpty}>★</Text>
                ))}
              </View>
            </View>
            <View style={styles.contactIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => {
                Alert.alert("Note", "Message service is unavailable")
              }}>
                <Text style={styles.icon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => { InitiateCall(phonenumber) }}>
                <Text style={styles.icon}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", paddingHorizontal: 20, marginVertical: 10, }}>

            <TouchableOpacity style={{ ...styles.btn, backgroundColor: "white" }} onPress={() => updateDriverStatus("free")}>
              <Text style={{ ...styles.btnText, color: "#1F1E30" }}>
                Complete
              </Text>
            </TouchableOpacity>
          </View>

          {/* Assigned Doctors List */}
          <View style={{ flex: 1 }}>

          </View>
        </View>
      </ScrollView>
    )
  );
};
const styles = StyleSheet.create({
  btn: {
    paddingVertical: 7,
    // paddingHorizontal:20,
    width: 180,
    borderWidth: 1.5,
    borderColor: "white",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontFamily: "sans-serif-medium",
    color: "white",
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 4,
  },
  driverImage: {
    width: 70,
    height: 70,
    borderRadius: 13,
    // borderWidth:2,
    objectFit: "contain",

  },
  driverInfo: {
    flex: 1,
    marginLeft: 10,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: "sans-serif-condensed",
    color: '#1F1E30',
  },
  hospitalName: {
    fontFamily: "sans-serif-condensed",
    fontSize: 14,
    color: '#1F1E30',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    color: '#feca57',
    fontSize: 16,
  },
  starEmpty: {
    color: '#dcdde1',
    fontSize: 16,
  },
  contactIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    // borderWidth:2,
    // borderRadius:50,
    // borderColor:"#1F1E30",
    marginLeft: 10,
    padding: 3,
  },
  icon: {
    fontSize: 20,
    color: '#1F1E30',
  },
})

export default AssignedRideScreen;
