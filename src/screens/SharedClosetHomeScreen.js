import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SharedClosetHomeScreen = () => {
  const navigation = useNavigation();

  const handleGenerateOutfit = () => {
    navigation.navigate('SharedGenerateOutfit'); // Replace with the actual screen name
  };

  const handleViewOutfit = () => {
    navigation.navigate('SharedOutfit');
  };
  

  const handleViewItems = () => {
    // navigation.navigate('Item'); // Replace with the actual screen name
  };

 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Shared Closet!</Text>
      <TouchableOpacity style={styles.button} onPress={handleGenerateOutfit}>
        <Text style={styles.buttonText}>Generate Outfit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleViewOutfit}>
        <Text style={styles.buttonText}>View Outfit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleViewItems}>
        <Text style={styles.buttonText}>View Items</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SharedClosetHomeScreen;
