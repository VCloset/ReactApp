


import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native';

const colors = {
  primary: '#007AFF',
  secondary: '#FF5733',
  background: '#f7f8fa',  // Slightly different background for a soft look
  text: '#333333',
  border: '#E0E0E0',
  editableBackground: '#FFFFFF'  // Pure white for editable fields for better focus
};

function UserProfile() {
  const [userData, setUserData] = useState({
    id: null,
    first_name: '',
    last_name: '',
    username: '',
    image: ''
  });

  const [initialUserData, setInitialUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState('');



  const fetchUserData = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const user_id = 3;

    try {
      const response = await axios.get(`https://vcloset.xyz/api/users/${user_id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUserData(response.data[0]);
      setInitialUserData(response.data[0]);

      try {
        if (!response.data[0].image.includes('data:image/png;base64,') && !response.data[0].image.includes('data:image/jpeg;base64,')) {
          response.data[0].image = `data:image/png;base64,${response.data[0].image}`;
        }
      } catch (error) {
        console.error('Error fetching user img:', error);
      }

      setSelectedImage(response.data[0].image);

    } catch (error) {
      if (error.response.status === 401) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        navigation.navigate('Login');
      }
      console.error('Error fetching user data:', error.response);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const updateUserDetails = async () => {
    try {
      setIsEditing(false);
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const user_id = userData.id;

      const updatedUserData = { ...userData, image: base64Image };

      const response = await axios.put(
        `https://vcloset.xyz/api/users/${user_id}`,
        updatedUserData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      if (error.response.status === 401) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        navigation.navigate('Login');
      }
      console.error('Error updating user details:', error.response.data);
    }
  };

  // update password
  const handleUpdatePassword = () => {
    navigation.navigate('UpdatePassword', { userId: userData.id });

  };

  const navigation = useNavigation();


  const cancelEditing = () => {
    setUserData(initialUserData);
    setIsEditing(false);
    setSelectedImage(userData.image);
  };

  const openImagePicker = () => {
    Alert.alert(
      'Choose an option',
      'Select an image from:',
      [
        {
          text: 'Camera',
          onPress: () => pickImageFromCamera(),
        },
        {
          text: 'Library',
          onPress: () => pickImageFromLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  const pickImageFromCamera = async () => {
    setIsEditing(true)
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    const uri = result.assets.map(x => x.uri).toString()
    if (!result.cancelled) {
      encodeImage(uri);
      setSelectedImage(base64Image);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('sessionId');
    navigation.navigate('Login');
  };

  const pickImageFromLibrary = async () => {
    setIsEditing(true)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Media Library permission is required to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    const uri = result.assets.map(x => x.uri).toString()
    if (!result.cancelled) {
      encodeImage(uri)
      console.log('base64Image', uri)

      setSelectedImage(base64Image);
    }
  };

  const encodeImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onload = () => {
      setBase64Image(reader.result);
    };

    reader.readAsDataURL(blob);
    return reader.result;
  };

  const deleteAccount = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    // alert the user to confirm the deletion
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?, this is irreversible',
      [
        {
          text: 'Yes',
          onPress: () => {
            // delete the account
            // get the user id
            const userId = userData.id;
            // delete the user
            // headers for authorization
           
            console.log('Access token:', accessToken);
            axios.delete(`https://vcloset.xyz/api/users/${userId}` 
            , {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
              .then((response) => {
                console.log('User deleted:', response.data);
                // delete the access token
                SecureStore.deleteItemAsync('accessToken');
                SecureStore.deleteItemAsync('sessionId');

                // navigate to the login screen
                navigation.navigate('Login');
              })
              .catch((error) => {
                Alert.alert(
                  'Error',
                  'There was an error deleting your account, please try again later. If the problem persists, please contact support at sandhukaran219@gmail.com.',
                  [
                    {
                      text: 'OK',
                      onPress: () => console.log('OK Pressed'),
                    },
                  ],
                  { cancelable: false }
                );
                console.error('Error deleting user:', error.response.data);
              });
          },
        },
        {
          text: 'No',
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  }

  // return (
  //   <SafeAreaView style={{ flex: 1 }}>
  //     <ScrollView style={styles.container}>
  //       <TouchableOpacity onPress={openImagePicker} style={styles.imageContainer}>
  //         {selectedImage ? (
  //           <Image
  //             source={{ uri: selectedImage }}
  //             style={styles.profileImage}
  //             resizeMode="cover"
  //           />
  //         ) : (
  //           <View style={styles.placeholderImage}>
  //             <FontAwesome name="camera" size={40} color={colors.primary} />
  //             <Text style={styles.placeholderText}>Tap to Add Profile Picture</Text>
  //           </View>
  //         )}
  //       </TouchableOpacity>
  //       <View style={styles.inputContainer}>
  //         <Text style={styles.label}>Username:</Text>
  //         <TextInput
  //           style={[styles.input, isEditing ? styles.editableInput : null]}
  //           placeholder="Username"
  //           value={userData.username}
  //           onChangeText={(text) => setUserData((prevState) => ({ ...prevState, username: text }))}
  //           editable={false}
  //         />
  //       </View>
  //       <View style={styles.inputContainer}>
  //         <Text style={styles.label}>First Name:</Text>
  //         <TextInput
  //           style={styles.input}
  //           placeholder="First Name"
  //           value={userData.first_name}
  //           onChangeText={(text) => setUserData((prevState) => ({ ...prevState, first_name: text }))}
  //           editable={isEditing}
  //         />
  //       </View>
  //       <View style={styles.inputContainer}>
  //         <Text style={styles.label}>Last Name:</Text>
  //         <TextInput
  //           style={styles.input}
  //           placeholder="Last Name"
  //           value={userData.last_name}
  //           onChangeText={(text) => setUserData((prevState) => ({ ...prevState, last_name: text }))}
  //           editable={isEditing}
  //         />
  //       </View>
  //       <View style={styles.buttonGroup}>
  //         {isEditing ? (
  //           <>
  //             <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={updateUserDetails}>
  //               <Text style={styles.buttonText}>Save</Text>
  //             </TouchableOpacity>
  //             <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelEditing}>
  //               <Text style={styles.buttonText}>Cancel</Text>
  //             </TouchableOpacity>
  //           </>
  //         ) : (
  //           <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
  //             <Text style={styles.buttonText}>Edit</Text>
  //           </TouchableOpacity>
  //         )}
  //       </View>
  //       <View style={styles.container}>
  //         <TouchableOpacity style={styles.smallButton} onPress={handleUpdatePassword}>
  //           <Text style={styles.smallButtonText}>Change Password</Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity
  //           style={[styles.button, styles.logoutButton]}
  //           onPress={handleLogout}>
  //           <Text style={styles.buttonText}>Logout</Text>
  //         </TouchableOpacity>
  //       </View>

  //       {/* DELETE ACCOUNT BUTTON */}

  //       <View style={styles.buttonContainer}>
  //         <TouchableOpacity style={[styles.button,styles.deleteButton]} onPress={deleteAccount}>
  //           <Text style={styles.smallButtonText}>Delete Account</Text>
  //         </TouchableOpacity>
  //       </View>

  //     </ScrollView>
  //   </SafeAreaView>

  // );

   return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={openImagePicker} style={styles.imageContainer}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <FontAwesome name="camera" size={40} color={colors.primary} />
              <Text style={styles.placeholderText}>Tap to Add Profile Picture</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Input Fields */}
        <View style={styles.inputGroup}>
          {renderInput("Username", userData.username, text => setUserData({ ...userData, username: text }), false)}
          {renderInput("First Name", userData.first_name, text => setUserData({ ...userData, first_name: text }), isEditing)}
          {renderInput("Last Name", userData.last_name, text => setUserData({ ...userData, last_name: text }), isEditing)}
        </View>
        
        {/* Buttons */}
        <View style={styles.buttonGroup}>
          {isEditing ? (
            <>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={updateUserDetails}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelEditing}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.smallButton} onPress={handleUpdatePassword}>
          <Text style={styles.smallButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        
        {/* DELETE ACCOUNT BUTTON */}
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={deleteAccount}>
          <Text style={styles.smallButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function renderInput(label, value, onChange, isEditable) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}:</Text>
      <TextInput
        style={[styles.input, isEditable && styles.editableInput]}
        placeholder={label}
        value={value}
        onChangeText={onChange}
        editable={isEditable}
      />
    </View>
  );
}





const styles = StyleSheet.create({

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,  // New style for better spacing
  },
  logoutButton: {
    marginTop: 20,  // New style for better spacing
    backgroundColor: '#FF6347',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,  // More padding for better spacing
  },
  buttonContainer: {
    marginTop: 20,
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120, // Reduced size for minimalism
    height: 120,
    borderRadius: 60, // Fully rounded edges
    borderWidth: 2, // New border for image
    borderColor: colors.border, // Using the new border color
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: colors.primary,
  },
  label: {
    fontSize: 14, // Smaller font size
    fontWeight: '600', // Slightly bold for better readability
    marginBottom: 8, // Space between label and input field
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 24, // Consistent spacing between elements
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border, // Using the new border color
    borderRadius: 10, // Increased for rounder corners
    padding: 12, // More padding inside the input
    color: colors.text, // Text color for the input
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24, // Consistent margin for cleaner UI
  },
  button: {
    // Universal styles for buttons
    borderRadius: 10,
    padding: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4, // Small margin for spacing between buttons
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6347',
    borderRadius: 5,
    paddingVertical: 10,
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8, // Consistent spacing between text and icon
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 10,
    flex: 1,
    marginRight: 5,
  },

  smallButton: {
    // For less important actions
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16, // Additional space from the other content
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  icon: {
    marginLeft: 8, // Add space to the right of the icon
  },
  editableInput: {
    backgroundColor: colors.editableBackground,
    borderColor: colors.primary,
    elevation: 3,  // Adding shadow for elevation (Android)
    shadowColor: "#000",  // (iOS)
    shadowOffset: { width: 0, height: 2 },  // (iOS)
    shadowOpacity: 0.1,  // (iOS)
    shadowRadius: 5  // (iOS)
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.secondary,
  },

  deleteButton: {
    marginTop: 20,
    backgroundColor: colors.secondary,
  },
});

export default UserProfile;
