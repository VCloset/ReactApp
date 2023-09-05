import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleGenerateOutfit = () => {
    // Navigate to the Generate Outfit page
    navigation.navigate('GenerateOutfit'); // Replace with the actual screen name
  };

  const handleViewOutfit = () => {
    // Navigate to the View Outfit page
    // navigation.navigate('ViewOutfit'); // Replace with the actual screen name
  };

  const handleViewItems = () => {
    // Navigate to the View Items page
    navigation.navigate('Item'); // Replace with the actual screen name
  };

  const handleScanItems = () => {
    // Navigate to the Scan Items page
    navigation.navigate('ScanItem'); // Replace with the actual screen name
  };

  // const handleTags = () => {
    // Navigate to the Tags page
    // navigation.navigate('Tag'); // Replace with the actual screen name
  // };
  return (
    
    <View style={styles.container}>

      <Text style={styles.title}>Home Screen</Text>
      <TouchableOpacity style={styles.button} onPress={handleGenerateOutfit}>
        <Text style={styles.buttonText}>Generate Outfit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleViewOutfit}>
        <Text style={styles.buttonText}>View Outfit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleViewItems}>
        <Text style={styles.buttonText}>View Items</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleScanItems}>
        <Text style={styles.buttonText}>Scan Items</Text>
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
    // black color
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

export default HomeScreen;
