import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

// Define your color palette
const colors = {
  backgroundStart: '#FFE6B3',
  backgroundEnd: '#FFC857',
  inputBackground: '#FFFFFF',
  inputBorder: '#333333',
  buttonBackgroundStart: '#186A80',
  buttonBackgroundEnd: '#6B7B8D',
  buttonText: '#FFFFFF',
  successText: 'blue',
  errorText: 'red',
};

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = {
        username: email,
      };
      await axios.post(`https://vcloset.xyz/forgotPassword`, {}, { params: queryParams });
      setSuccess(true);
      console.log('Password Reset Link Sent');
    } catch (error) {
      console.log('error', error);
      setError('Error Resetting Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}>
      <Animatable.Text animation="fadeIn" duration={1000} style={styles.title}>
        Forgot Password
      </Animatable.Text>
      <Animatable.View animation="fadeIn" duration={1000} delay={200} style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Email Address'
          autoCapitalize='none'
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}>
          <LinearGradient
            colors={[colors.buttonBackgroundStart, colors.buttonBackgroundEnd]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}>
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Submit'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {success && <Text style={[styles.messageText, { color: colors.successText }]}>Reset Password Link Sent</Text>}
        {errorMessage && <Text style={[styles.messageText, { color: colors.errorText }]}>Error Resetting Password</Text>}
      </Animatable.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.inputBorder,
  },
  inputContainer: {
    width: '80%',
    alignItems: 'center',
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
    color: colors.inputBorder,
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
  messageText: {
    paddingTop: 10,
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;
