import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

// Define your new color palette
const colors = {
  backgroundStart: '#FFF5E1', // Light background color
  backgroundEnd: '#FFDDC1',   // Light background color (end)
  primaryText: '#333333',     // Dark text color
  inputBackground: '#FFFFFF', // White input background
  inputBorder: '#FFC857',     // Mustard border color
  buttonBackgroundStart: '#FFC857', // Mustard button background (start)
  buttonBackgroundEnd: '#FFA8A8',   // Mustard button background (end)
  buttonText: '#FFFFFF',      // White button text
  errorText: '#FF6B6B',       // Red error text
};

async function save(key, value) {
  await SecureStore.setItemAsync(key, value);
}

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [closet_id, setCloset_id] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post('https://vcloset.xyz/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { access_token } = response.data;
      const { session_id } = response.data;

      setAccessToken(access_token);
      setSessionId(session_id);
      await save('accessToken', access_token);
      await save('sessionId', session_id);
      getClosetID();
      navigation.navigate('HomeLogin');
    } catch (error) {
      console.log('error: ', error);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getClosetID = async () => {
    const access_Token = await SecureStore.getItemAsync('accessToken');

    if (!access_Token) {
      return;
    }
    try {
      const response = await axios.get('https://vcloset.xyz/api/closets', {
        headers: {
          Authorization: `Bearer ${access_Token}`,
        },
      });
      setCloset_id(response.data.id);
      await SecureStore.setItemAsync('closet_id', response.data.id.toString());
    } catch (error) {
      console.error('Error fetching closet id:', error.response.data);
    }
  };

  const navigateForgotPassword = async () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}>
      <Image
        source={require('../../assets/logo2.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder='Email Address'
        autoCapitalize='none'
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        autoCapitalize='none'
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}>
        <LinearGradient
          colors={[colors.buttonBackgroundStart, colors.buttonBackgroundEnd]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Login'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Sign up page link */}
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={() => navigation.navigate('SignUp')}>
        <LinearGradient
          colors={[colors.buttonBackgroundStart, colors.buttonBackgroundEnd]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </LinearGradient>
      </TouchableOpacity>
      {/* Navigates to ForgotPasswordScreen */}
      <Text
        style={styles.forgotPassword}
        onPress={navigateForgotPassword}>
        Forgot Password?
      </Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
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
  signUpButton: {
    width: '100%',
    marginTop: 10,
  },
  forgotPassword: {
    color: colors.primaryText,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
  },
});

export default LoginScreen;
