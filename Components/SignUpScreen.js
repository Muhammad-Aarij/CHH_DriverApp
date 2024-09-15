import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Updated import
import { doc,setDoc } from 'firebase/firestore';
import ambulance from './Images/ambulance.png'; // Add image import like in the SignIn screen

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
        placeholderTextColor="#B0B0B0"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.textInput}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry
        autoCapitalize="none"
      />
      <TextInput
        style={styles.textInput}
        value={driverName}
        onChangeText={setDriverName}
        placeholder="Driver Name"
        placeholderTextColor="#B0B0B0"
      />
      <TextInput
        style={styles.textInput}
        value={make}
        onChangeText={setMake}
        placeholder="Vehicle Make"
        placeholderTextColor="#B0B0B0"
      />
      <TextInput
        style={styles.textInput}
        value={numberPlate}
        onChangeText={setNumberPlate}
        placeholder="Number Plate"
        placeholderTextColor="#B0B0B0"
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
  container: { flex: 1, backgroundColor: '#1F1E30', padding: 20 },
  headerImage: { width: '100%', height: 200, resizeMode: 'contain', marginTop: 20 },
  welcomeText: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  textInput: { backgroundColor: '#F0F0F0', borderRadius: 10, padding: 15, width: '100%', marginBottom: 20, color: '#1F1E30' },
  signInButton: { backgroundColor: '#FFFFFF', paddingVertical: 12, width: '60%', borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  signInButtonText: { color: '#1F1E30', fontWeight: 'bold', fontSize: 14 },
  forgotPasswordText: { color: '#FFFFFF', fontSize: 13, marginBottom: 30 },
});

export default SignUpScreen;
