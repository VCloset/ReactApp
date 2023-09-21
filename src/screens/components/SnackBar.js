import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

const SnackBar = ({ visible, message, onDismiss }) => {
  if (!visible) return null

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    marginTop: 20,
  },
  message: {
    color: 'white',
    flex: 1,
  },
  dismissButton: {
    marginLeft: 10,
    padding: 5,
  },
  dismissText: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default SnackBar
