import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleGenerateOutfit = () => {
    navigation.navigate('GenerateOutfit'); // Replace with the actual screen name
  };

  const handleViewOutfit = () => {
    navigation.navigate('Outfit'); // Replace with the actual screen name
  };

  const handleViewItems = () => {
    navigation.navigate('Item'); // Replace with the actual screen name
  };

  const handleScanItems = () => {
    navigation.navigate('ScanItem'); // Replace with the actual screen name
  };

  const handleOutfitsMatching = () => {
    navigation.navigate("Outfits Matching"); // Replace with the actual screen name
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to V-Closet!</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleOutfitsMatching}>
        <Text style={styles.buttonText}>Outfits Matching</Text>
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

export default HomeScreen;
