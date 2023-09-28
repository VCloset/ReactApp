import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, FlatList} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

const OutfitScreen = () => {
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    // Make a GET request to the API to fetch outfits with saved = true
    const fetchOutfits = async () => {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      try {
        const response = await axios.get('https://vcloset.xyz/api/outfits?skip=0&limit=100', {
          headers: {
            Authorization: 'Bearer ' + accessToken,
            accept: 'application/json',
          },
        });

        // Filter outfits with saved = true
        const savedOutfits = response.data.filter((outfit) => outfit.saved === true);
        // sort outfits items by category id 
        savedOutfits.map((outfit) => {
          outfit.items.sort((a, b) => a.category_id - b.category_id)
        })
        // Fetch and set images for each item in each outfit
        const outfitsWithImages = await Promise.all(
          savedOutfits.map(async (outfit) => {
            const itemsWithImages = await Promise.all(
              outfit.items.map(async (item) => {
                const imageResponse = await axios.get(`https://vcloset.xyz/api/items/${item.id}/image`, {
                  headers: {
                    Authorization: 'Bearer ' + accessToken,
                    accept: 'application/json',
                  },
                });
                return { ...item, image: imageResponse.data.image };
              })
            );
            return { ...outfit, items: itemsWithImages };
          })
        );

        setOutfits(outfitsWithImages);
      } catch (error) {
        console.error('Error fetching outfits:', error.response);
      }
    };

    fetchOutfits();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.outfitContainer}>
        <View style={styles.itemContainer}>
          {item.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Image
                source={{ uri: `data:image/png;base64,${item.image}` }}
                style={styles.itemImage}
                resizeMode="contain" // Use "contain" to zoom out and show the whole image
              />
              {/* <Text style={styles.itemName}>{item.name}</Text> */}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={outfits}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3} // Display 3 outfits in a row
    />
  );
};

const styles = StyleSheet.create({
  outfitContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  outfitDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'column', // Display items vertically
    alignItems: 'center', // Center items horizontally
  },
  item: {
    alignItems: 'center',
    // marginBottom: 16, // Add space between items
    marginBottom: -15,
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
  },
});

export default OutfitScreen;
