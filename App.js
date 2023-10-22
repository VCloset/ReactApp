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
import ShareHomeScreen from './src/screens/ShareHomeScreen'
import ViewSharedClosets from './src/screens/ViewSharedClosets'
import SharedClosetHomeScreen from './src/screens/SharedClosetHomeScreen'
import ShareGenerateOutfitScreen from './src/screens/ShareGenerateOutfitScreen'
import SharedOutfitScreen from './src/screens/SharedOutfitScreen'
import SharedItemsScreen from './src/screens/SharedItemsScreen'
import UpdatePassword from './src/screens/UpdatePassword'
import ManageSharedScreen from './src/screens/ManageSharedScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image } from 'react-native';

// import icons
// import wardrobeIcon from '../React-VC/src/screens/icons/wardrobe-icon.png'
// import shareClosetIcon from '../React-VC/src/screens/icons/share-closet-icon.png'
// import outfitIcon from '../React-VC/src/screens/icons/outfit-icon.png'
// for Karan only
import wardrobeIcon from '../VC/src/screens/icons/wardrobe-icon.png'
import shareClosetIcon from '../VC/src/screens/icons/share-closet-icon.png'
import outfitIcon from '../VC/src/screens/icons/outfit-icon.png'
import { BlurView } from 'expo-blur';
// import ant design icons
import { AntDesign } from '@expo/vector-icons';

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()
const Tab = createBottomTabNavigator()
const TopTab = createMaterialTopTabNavigator();


// Top Tabs for Outfit Section
function OutfitTopTabs() {
  return (
    <TopTab.Navigator initialRouteName="OutfitScreen" screenOptions={{ showIcon: true, showLabel: true, activeTintColor: '#FF6B6B', inactiveTintColor: '#748c94', labelStyle: { fontSize: 12, fontWeight: 'bold', paddingTop: 50 },
    tabBarStyle : {
      paddingTop: 50,
      },
     }}>
      <TopTab.Screen name="GenerateOutfit" component={GenerateOutfitScreen} options={{ title: 'Generate' }} headerShown={false} />
      <TopTab.Screen name="OutfitScreen" component={OutfitScreen} options={{ title: 'View' }} />
      <TopTab.Screen name="OutfitsMatching" component={OutfitMatchingScreen} options={{ title: 'Matching' }} />
    </TopTab.Navigator>
  );
}

// Top Tabs for My Collection Section
function MyCollectionTopTabs() {
  return (
    <TopTab.Navigator initialRouteName="ItemScreen" screenOptions={{ showIcon: true, showLabel: true, activeTintColor: '#FF6B6B', inactiveTintColor: '#748c94', labelStyle: { fontSize: 12, fontWeight: 'bold', paddingTop: 50 },
     tabBarStyle: {
      paddingTop: 50,
     },
     }}>
      <TopTab.Screen name="ItemScreen" component={ItemScreen} options={{ title: 'My Collection' }} headerShown={false} />
      <TopTab.Screen name="ScanItem" component={ScanItemScreen} options={{ title: 'Add Item' }} />
    </TopTab.Navigator>
  );
}

function ShareClosetTopTabs() {
  return (
    <TopTab.Navigator initialRouteName='Share Closet' screenOptions={{ showIcon: true, showLabel: true, activeTintColor: '#FF6B6B', inactiveTintColor: '#748c94', labelStyle: { fontSize: 12, fontWeight: 'bold', paddingTop: 50 },
      tabBarStyle: {
       paddingTop: 50,
      },
     }}>
      <TopTab.Screen name='Share Closet' component={ShareHomeScreen} options={{ title: 'Share' }} headerShown={false} />
      <TopTab.Screen name='Shared Closets' component={ViewSharedClosets} options={{ title: 'Browse' }} />
      <TopTab.Screen name='Manage Shared Closet' component={ManageSharedScreen} options={{ title: 'Manage' }} />
    </TopTab.Navigator>
  )
}


const Logout = ({ navigation }) => {
  const logout = async () => {
    const session_ID = await SecureStore.getItemAsync('sessionId')
    if (!session_ID) {
      return
    }
    try {
      const response = await axios.post(
        'https://vcloset.xyz/logout?session_id=' + session_ID
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
  }, [])
  return null
}

const App = () => {
  const [accessToken, setAccessToken] = useState('')
  const [sessionID, setSessionID] = useState('')
  const [tokenExpiry, setTokenExpiry] = useState(0)

  async function getSessionID() {
    setSessionID(await SecureStore.getItemAsync('sessionId'))
  }
  const Stack = createStackNavigator();



  const checkTokenExpiry = () => {
    const currentTime = Date.now() / 1000 // Convert to seconds
    if (tokenExpiry - currentTime < 300) {
      if (sessionID !== '' && !sessionID) {
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
      // Logout user
      // take the user back to the login screen
      navigation.navigate('Login')
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
      <Stack.Screen name="Logout" component={Logout} options={{ headerShown: false }} />
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* make the header background clear and the text 333333 */}
        <Stack.Screen
          name='SignUp'
          component={SignUpScreen}
          options={{
            title: '',
            headerStyle: { backgroundColor: 'transparent' },
            headerTransparent: true,
            headerTintColor: '#333333',
          }}
        />
        <Stack.Screen
          name='ForgotPassword'
          component={ForgotPasswordScreen}
          options={{
            title: '',
            headerStyle: { backgroundColor: 'transparent' },
            headerTransparent: true,
            headerTintColor: '#333333',
          }}
        />
        <Stack.Screen name='ViewItem' component={ViewItemScreen} />
        <Stack.Screen name='ViewOutfit' component={ViewOutfitScreen} />
        <Stack.Screen name='UpdatePassword' component={UpdatePassword} />
        <Stack.Screen
          name='Shared Closet Home'
          component={SharedClosetHomeScreen}
        />
        <Stack.Screen
          name='SharedGenerateOutfit'
          component={ShareGenerateOutfitScreen}
        />
        <Stack.Screen name='SharedOutfit' component={SharedOutfitScreen} />
        <Stack.Screen name='SharedItems' component={SharedItemsScreen} />
        <Stack.Screen
          name='HomeLogin'
          options={{
            headerShown: false, // Hide the header for the Home screen
          }}>
          {() => (

            <Tab.Navigator initialRouteName='Item' screenOptions={{
              tabBarStyle: {
                position: 'absolute',
                bottom: 25,
                left: 20,
                right: 20,
                elevation: 0,
                backgroundColor: '#f2f2f2',
                borderRadius: 15,
                height: 80,
              },
              tabBarActiveTintColor: '#FF6B6B',
              tabBarInactiveTintColor: '#748c94',
              tabBarBackground: () => (
                <BlurView tint="light" intensity={100} style={{ flex: 1 }} />
              ),
            }}>
              <Tab.Screen name='Outfits' component={OutfitTopTabs} 
              options={{ title: '', tabBarIcon: ({ focused }) => <Image source={outfitIcon} style={{ width:70, height: 70, top:20, tintColor: focused ? '#FF6B6B' : '#748c94' }} />, headerShown: false }} />
              <Tab.Screen name='Item' component={MyCollectionTopTabs}
                options={{ title: '', tabBarIcon: ({ focused }) => <Image source={wardrobeIcon} style={{ width: 60, height: 60, top:20, tintColor: focused ? '#FF6B6B' : '#748c94' }} />, headerShown: false }}
              />
              <Tab.Screen name='Share Closets' component={ShareClosetTopTabs} options={{ title: '', tabBarIcon: ({ focused }) => <Image source={shareClosetIcon} style={{ width: 60, height: 60,  top:15, tintColor: focused ? '#FF6B6B' : '#748c94' }} />, headerShown: false }} />
              <Tab.Screen name='User' component={UserProfile} options={{ title: '', tabBarIcon: ({ focused }) => <AntDesign name="user" size={50} color={focused ? '#FF6B6B' : '#748c94'} style={{ top:20,}} />, headerShown: false }} />

            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App


// <Drawer.Navigator initialRouteName='Item'>
//               {/* <Drawer.Screen name='Home' component={HomeScreen} options={{ title:'Home', headerStyle: { backgroundColor: 'transparent' }, headerTransparent: true, headerTintColor: '#333333' }} /> */}
//               <Drawer.Screen
//                 name='GenerateOutfit'
//                 component={GenerateOutfitScreen}
//                 options={{ title: 'Generate Outfit' }}
//               />
//               <Drawer.Screen
//                 name='Outfit'
//                 component={OutfitScreen}
//                 options={{ title: 'View Outfits' }}
//               />
//               <Drawer.Screen
//                 name='Item'
//                 component={ItemScreen}
//                 options={{
//                   title: 'My Collection',
//                   headerStyle: { backgroundColor: '#FF6B6B' },
//                   headerTintColor: 'white',
//                   headerTransparent: false,
//                 }}
//               />
//               <Drawer.Screen
//                 name='ScanItem'
//                 component={ScanItemScreen}
//                 options={{ title: 'Scan Item' }}
//               />

//               <Drawer.Screen
//                 name='Outfits Matching'
//                 component={OutfitMatchingScreen}
//                 options={{
//                   title: 'Outfits Matching',
//                   headerStyle: { backgroundColor: '#FF6B6B' },
//                   headerTintColor: 'white',
//                   headerTransparent: false,
//                 }}
//               />
//               <Drawer.Screen name='Share Closet' component={ShareHomeScreen} />
//               <Drawer.Screen
//                 name='Shared Closets'
//                 component={ViewSharedClosets}
//               />
//               <Drawer.Screen
//                 name='Manage Shared Closet'
//                 component={ManageSharedScreen}
//               />
//               <Drawer.Screen
//                 name='User'
//                 component={UserProfile}
//                 options={{ title: 'User Profile' }}
//               />
//               <Drawer.Screen name='Logout' component={Logout} />
//             </Drawer.Navigator>