import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
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
import CustomOutfitScreen from './src/screens/CustomOutfitScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image } from 'react-native';

import wardrobeIcon from './src/screens/icons/wardrobe-icon.png'
import shareClosetIcon from './src/screens/icons/share-closet-icon.png'
import outfitIcon from './src/screens/icons/outfit-icon.png'
import { BlurView } from 'expo-blur';
import { AntDesign } from '@expo/vector-icons';
import * as Keychain from 'react-native-keychain';
import ImagesLoading from './src/screens/components/ImagesLoading';


import { View } from 'react-native';

const Drawer = createDrawerNavigator()
const Tab = createBottomTabNavigator()
const TopTab = createMaterialTopTabNavigator();




// Top Tabs for Outfit Section
function OutfitTopTabs() {
  return (
    <TopTab.Navigator initialRouteName="OutfitScreen" screenOptions={{
      showIcon: true, showLabel: true, activeTintColor: '#FF6B6B', inactiveTintColor: '#748c94', labelStyle: { fontSize: 12, fontWeight: 'bold', paddingTop: 50 },
      tabBarStyle: {
        paddingTop: 50,
      },
    }}>
      <TopTab.Screen name="GenerateOutfit" component={GenerateOutfitScreen} options={{ title: 'Generate' }} headerShown={false} />
      <TopTab.Screen name="OutfitScreen" component={OutfitScreen} options={{ title: 'View' }} />
      <TopTab.Screen name="OutfitsMatching" component={OutfitMatchingScreen} options={{ title: 'Matching' }} />
      <TopTab.Screen name="CustomOutfit" component={CustomOutfitScreen} options={{ title: 'Custom' }} />
    </TopTab.Navigator>
  );
}

// Top Tabs for My Collection Section
function MyCollectionTopTabs() {
  return (
    <TopTab.Navigator initialRouteName="ItemScreen" screenOptions={{
      showIcon: true, showLabel: true, activeTintColor: '#FF6B6B', inactiveTintColor: '#748c94', labelStyle: { fontSize: 12, fontWeight: 'bold', paddingTop: 50 },
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
    <TopTab.Navigator initialRouteName='Share Closet' screenOptions={{
      showIcon: true, showLabel: true, activeTintColor: '#FF6B6B', inactiveTintColor: '#748c94', labelStyle: { fontSize: 12, fontWeight: 'bold', paddingTop: 50 },
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
      await Keychain.resetGenericPassword()
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('sessionId')
      await SecureStore.deleteItemAsync('closet_id')
      navigation.navigate('Login')
    } catch (error) {
      await Keychain.resetGenericPassword()
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
  const navigationRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);


  async function getSessionID() {

    setSessionID(await SecureStore.getItemAsync('sessionId'))
  }
  const Stack = createStackNavigator();




  const checkTokenExpiry = () => {
    const currentTime = Date.now() / 1000 // Convert to seconds
    if (tokenExpiry - currentTime < 300) {
      console.log('Access token is about to expire, renewing...')
      if (sessionID !== '' && !sessionID) {
        renewAccessToken()
      } else {
        getSessionID()
      }
    }
  }
// pass optional parameter (session_Id) to renewAccessToken 
  const renewAccessToken = async (savedSessionID = sessionID) => {
    const params = new URLSearchParams()
    if (savedSessionID) {
      params.append('session_id', savedSessionID)
    } else {
    params.append('session_id', sessionID)
    }

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
      console.error('Error renewing access token:', error.response.data)
      // Logout user
      // take the user back to the login screen
      navigationRef.current?.navigate('Login');
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('sessionId')
      await Keychain.resetGenericPassword()
      setAccessToken('')
      setSessionID('')
    }
  }
  

  if (isLoading) {
    // Show a loading indicator while checking for the session
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

        <ImagesLoading />
      </View>
    );
  }

  // first use effect 
  useEffect(() => {

    // This effect is for initial credentials check and setting the session ID
    const fetchCredentials = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          setSessionID(credentials.password);  // This updates the sessionID state
        }
      } catch (error) {
        await Keychain.resetGenericPassword();
        console.error('Could not retrieve credentials', error);
      }
    };

    setIsLoading(true);
    fetchCredentials().then(() => {
      // setIsLoading(false);  // This should probably be inside a finally block to ensure it runs
    });
    setIsLoading(false);

    checkTokenExpiry();
    const tokenRenewalInterval = setInterval(checkTokenExpiry, 60000); // Check every minute

    // Cleanup interval on component unmount
    return () => clearInterval(tokenRenewalInterval);
  }, []);  // Empty dependency array means this useEffect runs once when the component mounts


  // 2nd use effect
  useEffect(() => {
    // This effect handles navigation and depends on the sessionID state
    const checkSessionAndNavigate = () => {
      if (sessionID) {
        // Navigate to the home screen or dashboard as there's an active session

        renewAccessToken(sessionID);  // This renews the access token
        navigationRef.current?.navigate('HomeLogin');
      } else {
        // If not, we navigate to the login screen
        navigationRef.current?.navigate('Login');
      }
    };

    // If sessionID changes, we check and navigate. This ensures navigation logic
    // is executed right after sessionID is updated and not before.
    if (!isLoading) { // Only navigate if not loading, prevents unnecessary navigation attempts
      checkSessionAndNavigate();
    }
  }, [sessionID, isLoading, navigationRef]); 


  // useEffect(() => {
  //   const checkSessionAndNavigate = async () => {
  //     try {
  //       if (sessionID) {
  //         // Navigate to the home screen or dashboard as there's an active session
  //         navigationRef.current?.navigate('HomeLogin');
  //       } else {
  //         // If not, we navigate to the login screen
  //         navigationRef.current?.navigate('Login');
  //       }
  //     } catch (error) {
  //       // Handle errors e.g., navigating to an error screen or logging out the user
  //       console.error(error);
  //     }


  //   };


  //   (async () => {
  //     try {
  //       const credentials = await Keychain.getGenericPassword();
  //       if (credentials) {
  //         setSessionID(credentials.password);
  //       }
  //       console.log('Checked keychain', credentials.password);
  //     } catch (error) {
  //       console.error('Could not retrieve credentials', error);
  //     }
  //     checkSessionAndNavigate();
  //     setIsLoading(false);
  //   })();



  //   checkTokenExpiry()
  //   const tokenRenewalInterval = setInterval(checkTokenExpiry, 60000) // Check every minute
  //   // Call the function to initiate the process
  //   return () => clearInterval(tokenRenewalInterval)
  // }, []);



  // useEffect(() => {
  //   getKeychainSessionID()
  //   checkTokenExpiry()
  //   // getClosetID()
  //   const tokenRenewalInterval = setInterval(checkTokenExpiry, 60000) // Check every minute
  //   return () => clearInterval(tokenRenewalInterval)
  // }, [])

  return (
    <NavigationContainer ref={navigationRef}>
      {/* if session id is not null, then go to home screen, else go to login screen */}


      <Stack.Navigator {...this.props} initialRouteName={sessionID !== '' && !sessionID ? 'HomeLogin' : 'Login'}>
        <Stack.Screen name="Logout" component={Logout} options={{ headerShown: false }} />
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{ headerShown: false }}
        />
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
        <Stack.Screen name='ViewItem' options={{ title: "" }} component={ViewItemScreen} />
        <Stack.Screen name='ViewOutfit' options={{ title: "" }} component={ViewOutfitScreen} />
        <Stack.Screen name='UpdatePassword' options={{ title: "" }} component={UpdatePassword} />
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
            title: 'My Collections',
            headerShown: false, // Hide the header for the Home screen
          }}>
          {() => (

            <Tab.Navigator
              initialRouteName='Item'
              screenOptions={{
                tabBarStyle: {
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  elevation: 0,
                  backgroundColor: 'white', // Change background color
                  borderTopLeftRadius: 20, // Add rounded corners
                  borderTopRightRadius: 20,
                  height: 80,
                  paddingHorizontal: 20, // Add padding to the sides
                },
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: '#748c94',
              }}>
              <Tab.Screen
                name='Outfits'
                component={OutfitTopTabs}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={outfitIcon}
                      style={{
                        width: 50, // Adjust the size of the icon
                        height: 50,
                        tintColor: focused ? '#FF6B6B' : '#748c94',
                      }}
                    />
                  ),
                  headerShown: false,
                }}
              />

              <Tab.Screen
                name='Item'
                component={MyCollectionTopTabs}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={wardrobeIcon}
                      style={{
                        width: 40, // Adjust the size of the icon
                        height: 40,
                        tintColor: focused ? '#FF6B6B' : '#748c94',
                      }}
                    />
                  ),
                  headerShown: false,
                }}
              />

              <Tab.Screen
                name='Share Closets'
                component={ShareClosetTopTabs}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={shareClosetIcon}
                      style={{
                        width: 40, // Adjust the size of the icon
                        height: 40,
                        tintColor: focused ? '#FF6B6B' : '#748c94',
                      }}
                    />
                  ),
                  headerShown: false,
                }}
              />

              <Tab.Screen
                name='User'
                component={UserProfile}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <AntDesign
                      name="user"
                      size={40} // Adjust the size of the icon
                      color={focused ? '#FF6B6B' : '#748c94'}
                    />
                  ),
                  headerShown: false,
                }}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
