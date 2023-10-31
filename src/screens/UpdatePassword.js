import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRoute } from '@react-navigation/native';

const colors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  text: '#333333',
  border: '#E0E0E0',
};

function UpdatePassword({navigation}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userId = useRoute().params.userId;
  const passwordIsValid = () => {
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword);
    const hasThreeDigits = (newPassword.match(/\d/g) || []).length >= 3;

    return newPassword.length >= 8 && hasSpecialChar && hasThreeDigits;
  };

  const handleUpdatePassword = async () => {
    // ... (rest of your code)

    if (!passwordIsValid()) {
      Alert.alert("Invalid Password", "Please ensure your password is at least 8 characters, contains a special character, and has at least 3 digits.", [{ text: "OK" }]);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "The passwords you entered do not match. Please try again.", [{ text: "OK" }]);
      return;
    }

    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');

      // Replace 'user_id' with the actual user ID
      const user_id = userId;

      const updatedUserData = {

        hashed_password: newPassword, //  newPassword is the new hashed password
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
      <Text style={styles.title}>Update Password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
          placeholderTextColor={colors.border}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          placeholderTextColor={colors.border}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => { navigation.goBack() }}>
        <Text style={styles.backButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    height: 50,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default UpdatePassword;

