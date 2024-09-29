import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Updated import
import { doc,setDoc } from 'firebase/firestore';
import ambulance from './Images/driver.png'; // Add image import like in the SignIn screen

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [driverName, setDriverName] = useState('');
  const [make, setMake] = useState('');
  const [numberPlate, setNumberPlate] = useState('');

  const handleSignUp = async () => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Define the ambulance data from user input
      const ambulanceData = {
        driverName,
        location: ["33.13131", "73.111"], // Default location, you can modify as needed
        make,
        numberPlate,
        status: "free",
        patientlocation: ["0", "0"],
        patientName: "null",
        
      };

      // Add the ambulance data to Firestore
      await setDoc(doc(db, 'ambulances', user.uid), ambulanceData);

      // Navigate to AssignedRideScreen on success
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert("Sign Up failed", error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
      <Image source={ambulance} style={styles.headerImage} />
      <Text style={styles.welcomeText}>Sign Up as Driver</Text>
      <TextInput
        style={styles.textInput}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#45b2dc"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.textInput}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#45b2dc"
        secureTextEntry
        autoCapitalize="none"
      />
      <TextInput
        style={styles.textInput}
        value={driverName}
        onChangeText={setDriverName}
        placeholder="Driver Name"
        placeholderTextColor="#45b2dc"
      />
      <TextInput
        style={styles.textInput}
        value={make}
        onChangeText={setMake}
        placeholder="Vehicle Make"
        placeholderTextColor="#45b2dc"
      />
      <TextInput
        style={styles.textInput}
        value={numberPlate}
        onChangeText={setNumberPlate}
        placeholder="Number Plate"
        placeholderTextColor="#45b2dc"
      />
      <TouchableOpacity style={styles.signInButton} onPress={handleSignUp}>
        <Text style={styles.signInButtonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignInScreen')}>
        <Text style={styles.forgotPasswordText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#45b2dc', padding: 20 },
  headerImage: { width: '100%', height: 180, resizeMode: 'contain', marginTop: 20 },
  welcomeText: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginVertical: 20, textAlign: 'center',fontFamily: "sans-serif-condensed",},
  textInput: { backgroundColor: '#F0F0F0', borderRadius: 10, padding: 15, width: '100%', marginBottom: 20, color: '#1F1E30',shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3, },
  signInButton: { backgroundColor: '#1e446b', paddingVertical: 12, width: '60%', borderRadius: 10, alignItems: 'center', marginBottom: 20,shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3, },
  signInButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, },
  forgotPasswordText: { color: '#FFFFFF', fontSize: 13, marginBottom: 30 },
});

export default SignUpScreen;
