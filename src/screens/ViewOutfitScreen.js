import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native'; // Import Alert from react-native

const ViewOutfitScreen = ({ route }) => {
  const navigation = useNavigation();
  const { outfit } = route.params;
  const [isLiked, setIsLiked] = useState(outfit.liked);
  const handleLike = async () => {
    // get the access token
    const accessToken = await SecureStore.getItemAsync('accessToken');
    setIsLiked(true);
    try {
      const response = await axios.put(
        `https://vcloset.xyz/api/outfits/like/${outfit.id}`,
        {},
        {
          headers: {
            Authorization: 'Bearer ' + accessToken,
            accept: 'application/json',
          },
        }
      );
  
      // Handle the response as needed
      if (response.status === 200) {
        outfit.liked = true;
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      if (error.response.status === 401) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        navigation.navigate('Login');
      }
      console.error('Error liking outfit:', error.response);
      setIsLiked(false);
    }
  };
  
  const handleUnlike = async () => {
    // get the access token
    try {
      setIsLiked(false);
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await axios.put(
        `https://vcloset.xyz/api/outfits/unlike/${outfit.id}`,
        {},
        {
          headers: {
            Authorization: 'Bearer ' + accessToken,
            accept: 'application/json',
          },
        }
      );
  
      // Handle the response as needed
      if (response.status === 200) {
        outfit.liked = false;
        // refresh the view 
        // forceUpdate();
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error unliking outfit:', error.response);
      setIsLiked(true);
    }
  };
  

 const handleDelete = async () => {
  // Display a confirmation dialog
  Alert.alert(
    'Delete Outfit',
    'Are you sure you want to delete this outfit? This action cannot be undone.',
    [
      {
        text: 'Cancel',
        style: 'cancel', // Cancelling the action
      },
      {
        text: 'Delete',
        onPress: async () => {
          // User confirmed the delete action
          try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const response = await axios.delete( // Use DELETE method
              `https://vcloset.xyz/api/outfits/${outfit.id}`,
              {
                headers: {
                  Authorization: 'Bearer ' + accessToken,
                  accept: 'application/json',
                },
              }
            );

            // Handle the response as needed
            if (response.status === 200) {
              // Successfully deleted
              // You can navigate the user back to the previous screen or perform other actions
              navigation.navigate('Outfits');
            } else {
              console.error('Unexpected response status:', response.status);
              navigation.navigate('Outfits');
            }
          } catch (error) {
            console.error('Error deleting outfit:', error.response.data);
            navigation.navigate('Outfits');
          }
        },
      },
    ]
  );
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        {/* if outfit has liked as true then change the icon to a filled red heart icon*/}
        {isLiked === true ? (
          <TouchableOpacity style={styles.iconButton} onPress={handleUnlike}>
            <Ionicons name="heart" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
            <Ionicons name="heart-outline" size={24} color="red" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
          <AntDesign name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemContainer}>
        {outfit.items.map((item, index) => (
          <View key={item.id} style={styles.itemBox}>
            <Image
              source={{ uri: `data:image/png;base64,${item.image}` }}
              style={styles.itemImage}
              resizeMode="contain"
            />
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
        ))}
      </View>
      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionLabel}>Outfit Description:</Text>
        <Text style={styles.description}>{outfit.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  iconButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    marginLeft: 10,
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  itemBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
  },
});

export default ViewOutfitScreen;
