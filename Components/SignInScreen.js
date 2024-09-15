import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Firebase auth import
import ambulance from './Images/ambulance.png'; // Import the ambulance image

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to the home screen or desired page after successful sign-in
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login failed', error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
      <Image source={ambulance} style={styles.headerImage} />
      <Text style={styles.welcomeText}>Welcome Back!</Text>
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
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signUpText: { color: '#FFFFFF', fontSize: 14 },
  signUpLink: { color: '#81b0ff', fontSize: 14, marginLeft: 5 },
});

export default SignInScreen;
