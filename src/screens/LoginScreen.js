import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native';
import * as Keychain from 'react-native-keychain';

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


const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [closet_id, setCloset_id] = useState('');

  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  async function saveKeychain(key, value) {
    await Keychain.setGenericPassword(key, value);
  }
  const handleLogin = async () => {

    // ensure that the user has entered a username and password
    if (!username || !password) {
      setError('Please enter an email and a password.');
      return;
    }

    if (username.indexOf('@') === -1) {
      setError('Please enter a valid email address.');
      return
    }


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
      console.log('session_id: ', session_id);
      await saveKeychain('sessionId', session_id);
      getClosetID();
      navigation.navigate('HomeLogin');
    } catch (error) {
      console.log('error: ', error);
      setError(error.response.data.detail);
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

  const slideUp = () => {
    setIsWelcomeVisible(false);
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (

    <LinearGradient
      colors={['#FFF5E1', '#FFDDC1']}
      style={styles.mainContainer}>


      <Image
        source={require('../../assets/bg.png')}
        style={styles.background}
        resizeMode="cover"
      />
      <Image source={require('../../assets/white.png')} style={styles.overlay} resizeMode="cover" />

      <Animated.View style={[styles.welcomeContainer, { transform: [{ translateY: slideAnim.interpolate({ inputRange: [-1, 0], outputRange: [-100, 0] }) }] }]}>
        {isWelcomeVisible && (
          <>
            <Image
              source={require('../../assets/logo2.png')}
              style={styles.customLogo}
            />
            <Text style={styles.welcomeTitle}>Welcome to Vardrobe</Text>
            <TouchableOpacity style={styles.nextButton} onPress={slideUp}>
              <Text style={styles.nextButtonText}>NEXT</Text>
            </TouchableOpacity>
          </>
        )}

        {!isWelcomeVisible && (

            <ScrollView style={{ width: '100%' }}>
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
                  placeholder='Email'
                  autoCapitalize='none'
                  value={username}
                  onChangeText={(text) => setUsername(text.toLowerCase())}
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
            </ScrollView>
        )}
      </Animated.View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  // cover the whole screen
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    paddingBottom: 100,
    borderRadius: 30,
  },
  // ALIGN IT TO THE TOP OF THE SCREEN
  customLogo: {
    width: 200,
    height: 100,
    marginBottom: 20,
    position: 'absolute',
    bottom: 570,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  // align the welcome container to the bottom of the screen
  welcomeContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 20,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333333',
  },
  nextButton: {
    width: 200,
    height: 50,
    backgroundColor: '#FFC857',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
