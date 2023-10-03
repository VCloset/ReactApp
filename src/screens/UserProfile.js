import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // You can import icons like this
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

function UserProfile() {
  const [userData, setUserData] = useState({
    id: null,
    first_name: '',
    last_name: '',
    username: '',
  });

  const [initialUserData, setInitialUserData] = useState({}); // Store initial user data
  const [isEditing, setIsEditing] = useState(false);

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
      setInitialUserData(response.data[0]); // Store initial user data
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

      const response = await axios.put(`https://vcloset.xyz/api/users/${user_id}`, userData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('User details updated:', response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user details:', error.response.data);
    }
  };

  

  const cancelEditing = () => {
    setUserData(initialUserData); // Restore initial user data
    setIsEditing(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profile</Text>
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit</Text>
            <FontAwesome name="pencil" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7', // Background color
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333', // Text color
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
    backgroundColor: '#007AFF', // Button background color
    borderRadius: 5,
    paddingVertical: 10,
    flex: 1,
    marginRight: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF', // Button background color
    borderRadius: 5,
    paddingVertical: 10,
    flex: 1,
    marginRight: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Button text color
    marginRight: 10,
  },
});

export default UserProfile;
