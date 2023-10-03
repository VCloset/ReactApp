import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const OutfitScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchOutfits = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    try {
      const response = await axios.get('https://vcloset.xyz/api/outfits?skip=0&limit=100', {
        headers: {
          Authorization: 'Bearer ' + accessToken,
          accept: 'application/json',
        },
      });
      const savedOutfits = response.data.filter((outfit) => outfit.saved === true);

      // sort the items in each outfit by category_id
      savedOutfits.forEach((outfit) => {
        outfit.items.sort((a, b) => a.category_id - b.category_id);
      });

      const getItems = async (outfit) => {
        const itemsRes = await axios.get(`https://vcloset.xyz/api/items`, {
          headers: {
            Authorization: 'Bearer ' + accessToken,
            accept: 'application/json',
          },
        });
        return itemsRes.data;
      };
      const items = await getItems();

      const outfitsWithImages = await Promise.all(
        savedOutfits.map(async (outfit) => {
          const itemsWithImages = await Promise.all(
            outfit.items.map(async (item) => {
              const matchedItem = items.find((i) => i.id === item.id);
              return { ...matchedItem, image: matchedItem.image.blob };
            })
          );
          return { ...outfit, items: itemsWithImages };
        })
      );

      setOutfits(outfitsWithImages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outfits:', error.response);
      setLoading(false);
    }
  };
  
  useFocusEffect(
    React.useCallback(() => {
        fetchOutfits();
    }, [])
);


  useEffect(() => {
    

    fetchOutfits();
  }, []);

  const handleOutfitPress = (outfit) => {
    // Navigate to the "ViewOutfit" screen with the outfit ID as a route parameter
    navigation.navigate('ViewOutfit', { outfit: outfit });
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={()=>handleOutfitPress(item)}>
        <View style={styles.outfitContainer}>
          <View style={styles.itemContainer}>
            {item.items.map((item) => (
              <View key={item.id} style={styles.item}>
                <Image
                  source={{ uri: `data:image/png;base64,${item.image}` }}
                  style={styles.itemImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Check if there are no saved outfits
  if (outfits.length === 0) {
    return (
      <View style={styles.noOutfitsContainer}>
        <Text style={styles.noOutfitsText}>No saved outfits found.</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => navigation.navigate('GenerateOutfit')}
        >
          <Text style={styles.generateButtonText}>Generate Outfit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // 
    <FlatList
      data={outfits}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
    />
  );
};

const styles = StyleSheet.create({
  outfitContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: -5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOutfitsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOutfitsText: {
    fontSize: 18,
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default OutfitScreen;
