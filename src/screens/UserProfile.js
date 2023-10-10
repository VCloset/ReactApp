


import React, { useState, useEffect } from 'react';
import {
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


function UserProfile() {
  const [userData, setUserData] = useState({
    id: null,
    first_name: '',
    last_name: '',
    username: '',
    image: '',
    hashed_password: '', 
  });

  const [initialUserData, setInitialUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const updatePassword = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const user_id = userData.id;
    const updatedUserData = {
      id: user_id,
      username: userData.username,
      hashed_password: newPassword, // Assuming newPassword is the new hashed password
    };

    try {
      const response = await axios.put(
        `https://vcloset.xyz/api/users/${user_id}`,
        updatedUserData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Password updated:', response.data);
      // You can handle success or navigate to a different screen here if needed.
    } catch (error) {
      console.error('Error updating password:', error.response.data);
      // Handle the error, display a message, or take appropriate action.
    }
  };

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
      setSelectedImage(response.data[0].image);
    } catch (error) {
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

      console.log('User details updated:', response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user details:', error.response.data);
    }
  };
  
 // update password
  const handleUpdatePassword = () => {
   // take user to password update screen
   // navigate to password update screen
   navigation.navigate('UpdatePassword', { userId: userData.id });

  };

  const navigation = useNavigation();


  const cancelEditing = () => {
    setUserData(initialUserData);
    setIsEditing(false);
    setSelectedImage(null);
    setBase64Image('');
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
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.cancelled) {
      setSelectedImage(result.uri);
      encodeImage(result.uri);
    }
  };

  const pickImageFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Media Library permission is required to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.cancelled) {
      encodeImage(result.uri)
      setSelectedImage(base64Image);
    }
  };

  const encodeImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onload = () => {
      // remove prefix such as `data:image/jpg;base64,`
      setBase64Image(reader.result);
    };

    reader.readAsDataURL(blob);
    return reader.result;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={openImagePicker}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.profile}
              resizeMode="contain"
            />
          ) : (
            <Text>Select an image</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={userData.username}
          onChangeText={(text) => setUserData((prevState) => ({ ...prevState, username: text }))}
          editable={isEditing}
        />
      </View>
      <View style={styles.inputContainer}>
  <Text style={styles.label}>First Name:</Text>
  <TextInput
    style={styles.input}
    placeholder="First Name"
    value={userData.first_name}
    onChangeText={(text) => setUserData((prevState) => ({ ...prevState, first_name: text }))}
    editable={isEditing}
  />
</View>
<View style={styles.inputContainer}>
  <Text style={styles.label}>Last Name:</Text>
  <TextInput
    style={styles.input}
    placeholder="Last Name"
    value={userData.last_name}
    onChangeText={(text) => setUserData((prevState) => ({ ...prevState, last_name: text }))}
    editable={isEditing}
  />
</View>
<View style={styles.buttonContainer}>
  {isEditing ? (
    <>
      <TouchableOpacity style={styles.button} onPress={updateUserDetails}>
        <Text style={styles.buttonText}>Save</Text>
        <FontAwesome name="check-circle" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={cancelEditing}>
        <Text style={styles.buttonText}>Cancel</Text>
        <FontAwesome name="times-circle" size={24} color="#fff" />
      </TouchableOpacity>
    </>
  ) : (
    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
      <Text style={styles.buttonText}>Edit</Text>
      <FontAwesome name="pencil" size={24} color="#fff" />
    </TouchableOpacity>
  )}
</View>

  
        
<View style={styles.container}>
    

      <Text style={styles.label}>Need to Update Password?</Text> 
      <TouchableOpacity style={styles.smallButton} onPress={handleUpdatePassword}>
        <Text style={styles.smallButtonText}>Update Password</Text>  
        <FontAwesome name="key" size={18} color="#fff" />  
      </TouchableOpacity>
    </View>
      
       {/* <View style={styles.container}>
       {/* ... (existing code) */}
       {/* <View style={styles.inputContainer}>
         <Text style={styles.label}>New Password:</Text>
         <TextInput
           style={styles.input}
           placeholder="New Password"
           value={newPassword}
           onChangeText={(text) => setNewPassword(text)}
           secureTextEntry={true} // To hide the password input
           editable={isEditing}
         />
       </View> */} 
       {/* ... (existing code) */}
       {/* <View style={styles.buttonContainer}>
         {isEditing ? (
           <>
             <TouchableOpacity style={styles.button} onPress={updateUserDetails}>
               <Text style={styles.buttonText}>Save</Text>
               <FontAwesome name="check-circle" size={24} color="#fff" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.button} onPress={updatePassword}>
               <Text style={styles.buttonText}>Update Password</Text>
               <FontAwesome name="key" size={24} color="#fff" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.button} onPress={cancelEditing}>
               <Text style={styles.buttonText}>Cancel</Text>
               <FontAwesome name="times-circle" size={24} color="#fff" />
             </TouchableOpacity>
           </>
         ) : (
           <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
             <Text style={styles.buttonText}>Edit</Text>
             <FontAwesome name="pencil" size={24} color="#fff" />
           </TouchableOpacity>
         )}
        </View> */}
      </View>
    
  );
}
 
    



      const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          backgroundColor: '#F7F7F7',
        },
        profile: {
          width: '100%',
          height: 150,
          borderRadius: 50,
          marginBottom: 10,
          alignContent: 'center',
        },
        label: {
          fontSize: 16,
          marginBottom: 5,
          color: '#333',
        },
        inputContainer: {
          marginBottom: 15,
        },
        input: {
          fontSize: 16,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          padding: 10,
        },
        buttonContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 15,
        },
        editButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#007AFF',
          borderRadius: 5,
          paddingVertical: 10,
          flex: 1,
          marginRight: 5,
        },
        button: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#007AFF',
          borderRadius: 5,
          paddingVertical: 10,
          flex: 1,
          marginRight: 5,
        },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
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
      backgroundColor: 'blue',
      padding: 8, // Reduce the padding to make it smaller
      borderRadius: 4, // Make it less rounded
      alignItems: 'center',
      flexDirection: 'row', // To align the text and icon horizontally
      justifyContent: 'center', // To center the content
    },
    smallButtonText: {
      color: 'white',
      fontSize: 14, // Adjust the font size to make it smaller
      marginRight: 8, // Add space to the right of the text
    },
    icon: {
      marginLeft: 8, // Add space to the right of the icon
    },
  });
  
export default UserProfile;

