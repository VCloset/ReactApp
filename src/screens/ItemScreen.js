import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import axios from 'axios'
// import AsyncStorage from '../../node_modules/@react-native-community/async-storage';
import * as SecureStore from 'expo-secure-store'
import { useNavigation } from '@react-navigation/native'

async function get(key) {
  return await SecureStore.getItemAsync(key)
}

const ItemScreen = () => {
  const handleScanItems = () => {
    // Navigate to the Scan Items page
    navigation.navigate('ScanItem') // Replace with the actual screen name
  }
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchItems()
  }, [])

  const decodeBase64Image = (base64Data) => {
    return `data:image/png;base64,` + base64Data
  }
  const fetchItems = async () => {
    // const accessToken = await AsyncStorage.getItem('accessToken');
    const accessToken = await get('accessToken')

    try {
      // use the access token
      const response = await axios.get('https://vcloset.xyz/api/items', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      setItems(response.data)

      const bottoms = response.data.filter(
        (x) => x.category.title === 'Bottoms'
      )
      const tops = response.data.filter((x) => x.category.title === 'Tops')

      if (bottoms.length >= 3 && tops.length >= 3) {
        await axios.get('https://vcloset.xyz/api/generateOutfitsAll', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        console.log('Success')
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        style={styles.itemImage}
        source={{ uri: decodeBase64Image(item.image.blob) }}
      />
      <Text style={styles.itemName}>{item.name}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items</Text>
      {/* if items are there */}
      {items && items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.itemList}
        />
      ) : (
        <View>
          <Text>No items found</Text>
          <TouchableOpacity style={styles.button} onPress={handleScanItems}>
            <Text style={styles.buttonText}>Scan Items</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemList: {
    flex: 1,
  },
  itemContainer: {
    width: '31%', // Each item takes up 33.33% of the container width
    margin: 5, // Adjust spacing as needed
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%', // Set a specific width for the image
    height: 120,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: -5,
    backgroundColor: '#000000',
    color: '#FFFFFF',
    opacity: 0.7,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    width: '100%',
    borderRadius: 5,
  },
})

export default ItemScreen
