
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRoute } from '@react-navigation/native';

function UpdatePassword({navigation}) {
  const [newPassword, setNewPassword] = useState('');
  const route = useRoute();
  const userId = route.params.userId;

  const handleUpdatePassword = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');

      // Replace 'user_id' with the actual user ID
      const user_id = userId;

      const updatedUserData = {
    
        hashed_password: newPassword, // Assuming newPassword is the new hashed password
      };

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
      // Handle success, display a message, or navigate back to the user profile page.
      Alert.alert(
        "Password Updated",
        "Your password has been updated",
        [
          { text: "OK", onPress: () => navigation.goBack() }
        ]
      );

    } catch (error) {
      console.error('Error updating password:', error.response.data);
      // Handle the error, display a message, or take appropriate action.
      Alert.alert(
        "Error Updating Password",
        "There was an error updating your password",
        [
          { text: "OK", onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>New Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={(text) => setNewPassword(text)}
        secureTextEntry={true} // To hide the password input
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>


      <Text style={styles.label}>Back to User Profile:</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to User Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default UpdatePassword;
