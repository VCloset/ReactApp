import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView, 
  ScrollView
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable'; // Import the Animatable library

// Define your color palette
const colors = {
  backgroundStart: '#FFF5E1',
  backgroundEnd: '#FFDDC1',
  primaryText: '#333333',
  inputBackground: '#FFFFFF',
  inputBorder: '#FFC857',
  buttonBackgroundStart: '#FFC857',
  buttonBackgroundEnd: '#FFA8A8',
  buttonText: '#FFFFFF',
  errorText: '#FF6B6B',
};

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+)(?=.*[0-9])(?=.*[a-z]).{8,}$/;
  return regex.test(password);
};



const handleSignUp = async () => {
  setLoading(true);
  setError('');

  try {
      if (!isValidEmail(username)) {
          setError('Please enter a valid email address.');
          return;
      }

      if (!isValidPassword(password)) {
          setError('Password should be at least 8 characters long, contain 1 uppercase letter, 1 special character, and 1 number.');
          return;
      }

      if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
      }

      if (!username || !firstName || !lastName || !password) {
          setError('Please fill in all fields.');
          return;
      }

      const json = {
          username: username,
          first_name: firstName,
          last_name: lastName,
          hashed_password: password,
      };

      const response = await axios.post('https://vcloset.xyz/signup', json);

      alert('Account created successfully! Please accept the verification email sent to your email address to activate your account. If you do not receive the email, please check your spam folder or sign up again.');
      navigation.navigate('Login');
  } catch (error) {
      setError('Sign-up failed. Please try again.');
  } finally {
      setLoading(false);
  }
};



  return (
    <KeyboardAvoidingView 
    style={{ flex: 1, width: '100%', height: '100%' }}
    behavior={Platform.OS === "ios" ? "padding" : "height"} 
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    enabled
  >
  <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%', margin: 0 }}>
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}>
      <Animatable.View animation="fadeIn" duration={1000} style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo2.png')}
          style={styles.logo}
        />
      </Animatable.View>
      <Animatable.View animation="fadeIn" duration={1000} delay={200} style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder='Email Address'
          autoCapitalize='none'
          value={username}
          onChangeText={(text) => setUsername(text.toLowerCase())}
        />
        <TextInput
          style={styles.input}
          placeholder='First Name'
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder='Last Name'
          value={lastName}
          onChangeText={(text) => setLastName(text)}
        />
        <TextInput
          style={styles.input}
          autoCapitalize='none'
          placeholder='Password'
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TextInput
          style={styles.input}
          autoCapitalize='none'
          placeholder='Confirm Password'
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={loading}>
          <LinearGradient
            colors={[colors.buttonBackgroundStart, colors.buttonBackgroundEnd]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}>
            <Text style={styles.buttonText}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </Animatable.View>
    </LinearGradient>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.primaryText,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: colors.inputBackground,
    color: colors.primaryText,
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
  buttonGradient: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.errorText,
    marginTop: 20,
    fontSize: 16,
  },
});

export default SignUpScreen;
