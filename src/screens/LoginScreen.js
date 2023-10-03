import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import axios from 'axios'
// import AsyncStorage from '../../node_modules/@react-native-community/async-storage';
import * as SecureStore from 'expo-secure-store'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native';
async function save(key, value) {
  await SecureStore.setItemAsync(key, value)
}

const LoginScreen = () => {
  const navigation = useNavigation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [closet_id, setCloset_id] = useState('')

  

  const getClosetID = async () => {
    const access_Token = await SecureStore.getItemAsync('accessToken')

    if (!access_Token) {
      return
    }
    try {
      const response = await axios.get('https://vcloset.xyz/api/closets', {
        headers: {
          Authorization: `Bearer ${access_Token}`,
        },
      })
      setCloset_id(response.data.id)
      await SecureStore.setItemAsync('closet_id', response.data.id.toString())
    } catch (error) {
      console.error('Error fetching closet id:', error.response.data)
    }
  }


  


  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    try {
      const response = await axios.post('https://vcloset.xyz/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { access_token } = response.data
      const { session_id } = response.data

      
      setAccessToken(access_token)
      setSessionId(session_id)
      await save('accessToken', access_token)
      await save('sessionId', session_id)
      getClosetID()
      navigation.navigate('HomeLogin')
    } catch (error) {
      console.log('error: ', error)
      setError('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const navigateForgotPassword = async () => {
    navigation.navigate('ForgotPassword')
  }

  return (
    <View style={styles.container}>
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
        <Text style={styles.buttonWhiteText}>
          {loading ? 'Loading...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* sign up page link */}
      <TouchableOpacity
        style={styles.whiteButton}
        onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      {/* Navigates to ForgotPasswordScreen */}
      <Text
        style={{ color: 'blue', marginTop: 10 }}
        onPress={navigateForgotPassword}>
        Forgot Password
      </Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {/* {accessToken ? (
        <View style={styles.accessTokenContainer}>
          <Text style={styles.accessTokenTitle}>Access Token:</Text>
          <Text style={styles.accessToken}>{accessToken}</Text>
        </View>
      ) : null}
      {sessionId ? (
        <View style={styles.accessTokenContainer}>

          <Text style={styles.accessTokenTitle}>Session ID:</Text>
          <Text style={styles.accessToken}>{sessionId}</Text>
        </View>
      ) : null} */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    // black color
    backgroundColor: '#000000',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  whiteButton: {
    // greyish white color
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    borderColor: '#000000',
    borderWidth: 1,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonWhiteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  accessTokenContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  accessTokenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  accessToken: {
    marginTop: 5,
  },
})

export default LoginScreen
