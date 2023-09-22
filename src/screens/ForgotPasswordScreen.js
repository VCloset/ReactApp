import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/core'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import axios from 'axios'

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [errorMessage, setError] = useState('')

  const handleSubmit = async () => {
    try {
      const queryParams = {
        username: email,
      }
      console.log(email)
      await axios.post(
        `https://vcloset.xyz/forgotPassword`,
        {},
        {
          params: queryParams,
        }
      )
      setSuccess(true)
      console.log('Password Reset Link Sent')
    } catch (error) {
      console.log('error', error)
      setError('Error Resetting Password')
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder='Email Address'
        autoCapitalize='none'
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonWhiteText}>Submit</Text>
      </TouchableOpacity>
      {success && (
        <Text style={{ color: 'blue', paddingTop: 10 }}>
          Reset Password Link Sent
        </Text>
      )}
      {errorMessage && (
        <Text style={{ color: 'red', paddingTop: 10 }}>
          Error Resetting Password
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonWhiteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default ForgotPasswordScreen
