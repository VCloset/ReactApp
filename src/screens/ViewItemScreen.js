import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const ViewItemScreen = ({ route }) => {
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemDescription, setEditedItemDescription] = useState('');

  // Function to fetch item details from the API based on item_id
  const fetchItemDetails = async () => {
    const access_token = await SecureStore.getItemAsync('accessToken');
    try {
      const item_id = route.params.item_id; // Get item_id from route params

      // Replace with your API endpoint
      const response = await axios.get(`https://vcloset.xyz/api/items/${item_id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + access_token,
        },
      });

      setItem(response.data);
      setEditedItemName(response.data.name);
      setEditedItemDescription(response.data.description);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching item details:', error);
      setIsLoading(false);
    }
  };

  const decodeBase64Image = (base64Data) => {
    return `data:image/png;base64,` + base64Data;
  };

  useEffect(() => {
    fetchItemDetails(); // Fetch item details when the component mounts
  }, []);

  const handleEditPress = () => {
    setIsEditing(!isEditing);
  };

  const handleSavePress = async () => {

    if (editedItemName.trim === '' || !editedItemName) {
      alert('Please enter a name for the item.');
      return;
    }

    if (editedItemDescription.trim === '' || !editedItemDescription) {
      alert('Please enter a description for the item.');
      return;
    }

    try {
      const access_token = await SecureStore.getItemAsync('accessToken');
      const item_id = route.params.item_id;
      const array = []
      array.push(parseInt(item.tags))
      const response = await axios.put(
        `https://vcloset.xyz/api/items/${item_id}`,
        {
          name: editedItemName, // Use the edited item name
          description: editedItemDescription,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + access_token,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Handle successful response here, if needed
      console.log('Item updated successfully:', response.data);
      
      item.name = editedItemName;
      item.description = editedItemDescription;
  
    } catch (error) {
      console.error('Error saving item:', error.response.data);
      // Handle error here
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : item ? (
        <View style={styles.itemContainer}>
        {/* try if not */}
          <Image source={{ uri: decodeBase64Image(item.image.blob) }} style={styles.itemImage} />
          {isEditing ? (
            <TextInput
              style={styles.itemNameInput}
              value={editedItemName}
              onChangeText={(text) => setEditedItemName(text)}
            />
          ) : (
            <Text style={styles.itemName}>Name: {item.name}</Text>
          )}
          <Text style={styles.itemDescription}>Category: {item.category.title}</Text>
          {/* edit description */}
          {isEditing ? (
            <View>
            <TextInput
              style={styles.itemDescriptionInput}
              value={editedItemDescription}
              onChangeText={(text) => setEditedItemDescription(text)}
            />
            </View>
          ) : (
            <Text style={styles.itemDescription}>Description: {item.description}</Text>
          )
          }
          {/* <Text style={styles.itemDescription}>Description: {item.description}</Text> */}
          {isEditing ? (
            <View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={() => {setIsEditing(false)}}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            </View>
          ) : (

            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Text>Error loading item details.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 2,
  },
  itemImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  itemNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  itemDescription: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
  },
  itemDescriptionInput: {
    fontSize: 16,
    marginTop: 10,
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ViewItemScreen;
