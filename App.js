import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemScreen from './src/screens/ItemScreen';
import ScanItemScreen from './src/screens/ScanItemScreen';
import GenerateOutfitScreen from './src/screens/GenerateOutfitScreen';
import ViewItemScreen from './src/screens/ViewItemScreen';
import OutfitScreen from './src/screens/OutfitScreen';
import ViewOutfitScreen from './src/screens/ViewOutfitScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { createDrawerNavigator } from '@react-navigation/drawer';
import UserProfile from './src/screens/UserProfile';
import OutfitMatchingScreen from './src/screens/OutfitsMatchingScreen';

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

const Logout = ({navigation}) => {

  const logout = async () => {
    const session_ID = await SecureStore.getItemAsync('sessionId')
    if (!session_ID) {
      return
    }
    try {
      const response = await axios.post(
        'https://vcloset.xyz/logout?session_id=' + session_ID,
      )
      console.log('Logout response:', response.data)
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('sessionId')
      await SecureStore.deleteItemAsync('closet_id')
      navigation.navigate('Login')

    } catch (error) {
      console.error('Error logging out:', error.response.data)
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('sessionId')
      await SecureStore.deleteItemAsync('closet_id')
      navigation.navigate('Login')

    }

  }

  useEffect(() => {
    logout()
  }
  , [])
  return null;
}


const App = () => {
  const [accessToken, setAccessToken] = useState('')
  const [sessionID, setSessionID] = useState('')
  const [tokenExpiry, setTokenExpiry] = useState(0)

  async function getSessionID() {
    setSessionID(await SecureStore.getItemAsync('sessionId'))
  }

  const checkTokenExpiry = () => {
    const currentTime = Date.now() / 1000 // Convert to seconds
    if (tokenExpiry - currentTime < 300) {
      if (sessionID !== '') {
        renewAccessToken()
      } else {
        getSessionID()
      }
    }
  }

  const renewAccessToken = async () => {
    const params = new URLSearchParams()
    params.append('session_id', sessionID)

    try {
      let url = 'https://vcloset.xyz/refresh-token'
      let combined = url + '?' + params

      const response = await axios.post(
        combined,
        {},
        {
          // Pass an empty object as the second argument
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = response.data
      if (data.access_token) {
        setAccessToken(data.access_token)
        await SecureStore.setItemAsync('accessToken', data.access_token)
        setTokenExpiry(Date.now() / 1000 + 1800) // 30 minutes
        console.log('Access token renewed')
      }
    } catch (error) {
      console.error('Error renewing token:', error)
      // Logout user
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('sessionId')
      setAccessToken('')
      setSessionID('')
    }
  }

  useEffect(() => {
    checkTokenExpiry()
    // getClosetID()
    const tokenRenewalInterval = setInterval(checkTokenExpiry, 60000) // Check every minute
    return () => clearInterval(tokenRenewalInterval)
  }, [])

  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='SignUp' component={SignUpScreen} />
        <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
        <Stack.Screen name='ViewItem' component={ViewItemScreen} />
        <Stack.Screen name='ViewOutfit' component={ViewOutfitScreen} />
        <Stack.Screen
          name='HomeLogin'
          options={{
            headerShown: false, // Hide the header for the Home screen
          }}>
          {() => (
            <Drawer.Navigator initialRouteName="Home">
              {/* logout  */}
              <Drawer.Screen name="Logout" component={Logout} />
              <Drawer.Screen name="User" component={UserProfile} />
              <Drawer.Screen name="Home" component={HomeScreen} />
              <Drawer.Screen name="Item" component={ItemScreen} />
              <Drawer.Screen name="ScanItem" component={ScanItemScreen} />
              <Drawer.Screen name="Outfits Matching" component={OutfitMatchingScreen} />
              <Drawer.Screen
                name='GenerateOutfit'
                component={GenerateOutfitScreen}
              />

              <Drawer.Screen name='Outfit' component={OutfitScreen} />
            </Drawer.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
