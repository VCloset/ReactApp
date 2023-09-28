import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import LoginScreen from './src/screens/LoginScreen'
import SignUpScreen from './src/screens/SignUpScreen'
import HomeScreen from './src/screens/HomeScreen' // Import the HomeScreen component
import ItemScreen from './src/screens/ItemScreen' // Import the ItemScreen component
import ScanItemScreen from './src/screens/ScanItemScreen' // Import the ScanItemScreen component
import GenerateOutfitScreen from './src/screens/GenerateOutfitScreen' // Import the GenerateOutfitScreen component
import ViewItemScreen from './src/screens/ViewItemScreen'
import OutfitScreen from './src/screens/OutfitScreen'
import * as SecureStore from 'expo-secure-store'
import { useState, useEffect } from 'react'
import axios from 'axios'
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen'
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator()

const App = () => {

  const [accessToken, setAccessToken] = useState('')
  // session ID is used to renew access token and is read only
  const [sessionID, setSessionID] = useState('')
  const [tokenExpiry, setTokenExpiry] = useState(0)

  const [closet_id, setCloset_id] = useState('')

  async function getSessionID() {
    setSessionID(await SecureStore.getItemAsync('sessionId'))
  }

  const checkTokenExpiry = () => {
    const currentTime = Date.now() / 1000 // Convert to seconds
    if (tokenExpiry - currentTime < 300) {
      if (sessionID != '') {
        renewAccessToken()
      } else {
        getSessionID()
      }
    }
  }
// {
//   "id": 1,
//   "owner_id": 1
// }
  const getClosetID = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken')
    try {
      const response = await axios.get('https://vcloset.xyz/api/closets', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      console.log('Closet id:', response.data.id)
      setCloset_id(response.data.id)
      await SecureStore.setItemAsync('closet_id', response.data.id.toString())

    } catch (error) {
      console.error('Error fetching closet id:', error.response.data)
    }
  }

  const renewAccessToken = async () => {
    // key is session_id and value is sessionID
    const params = new URLSearchParams()
    params.append('session_id', sessionID)

    try {
      let url = 'https://vcloset.xyz/refresh-token'
      let combined = url + '?' + params

      const response = await axios.post(combined, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = response.data
      if (data.access_token) {
        setAccessToken(data.access_token)
        await SecureStore.setItemAsync('accessToken', data.access_token)
        // 30 minutes
        setTokenExpiry(Date.now() / 1000 + 1800)
        console.log('Access token renewed')
      }
    } catch (error) {
      console.error('Error renewing token:', error)
      // logout user
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('sessionId')
      setAccessToken('')
      setSessionID('')
    }
  }

  useEffect(() => {
    checkTokenExpiry()
    getClosetID()
    const tokenRenewalInterval = setInterval(checkTokenExpiry, 60000) // Check every minute
    return () => clearInterval(tokenRenewalInterval)
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='SignUp' component={SignUpScreen} />
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Item' component={ItemScreen} />
        <Stack.Screen name='ScanItem' component={ScanItemScreen} />
        <Stack.Screen name='GenerateOutfit' component={GenerateOutfitScreen} />
        <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
        <Stack.Screen name='ViewItem' component={ViewItemScreen} />
        <Stack.Screen name='Outfit' component={OutfitScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
