import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import ImagesLoading from './components/ImagesLoading'

const EmptyState = ({ message, buttonText, onPress }) => {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../../assets/empty.png')}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyText}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  )
}

const SharedItemsScreen = () => {
  const [items, setItems] = useState([])
  const [tops, setTops] = useState([])
  const [fadeIn] = useState(new Animated.Value(0))
  const [loading, setLoading] = useState(true)
  const [bottoms, setBottoms] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('All')

  useEffect(() => {
    getItems()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      getItems()
    }, [])
  )

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {['All', 'Tops', 'Bottoms'].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter ? styles.selectedFilter : null,
          ]}
          onPress={() => setSelectedFilter(filter)}>
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter ? styles.selectedFilterText : null,
            ]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const filteredItems = () => {
    switch (selectedFilter) {
      case 'All':
        return items
      case 'Tops':
        return tops
      case 'Bottoms':
        return bottoms
      default:
        return items
    }
  }

  const decodeBase64Image = (base64Data) => {
    return `data:image/png;base64,` + base64Data
  }

  const getItems = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken')
    const closetId = await SecureStore.getItemAsync('shared_closet_id')

    const axiosConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }

    try {
      const response = await axios.get(
        `https://vcloset.xyz/api/items/closet/${closetId}`,
        axiosConfig
      )
      setItems(response.data)
      setTops(response.data.filter((top) => top.category.title === 'Tops'))
      setBottoms(
        response.data.filter((bottom) => bottom.category.title === 'Bottoms')
      )

      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start()
      setLoading(false)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }
  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity: fadeIn,
          transform: [
            {
              translateY: fadeIn.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}>
      <Image
        style={styles.itemImage}
        source={{ uri: decodeBase64Image(item.image.blob) }}
        resizeMode='contain'
      />
      <Text style={styles.itemName}>{item.name}</Text>
    </Animated.View>
  )
  return (
    <View style={styles.container}>
      {renderFilterButtons()}
      {/* <Header title="My Collection" /> */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ImagesLoading />
        </View>
      ) : items && items.length > 0 ? (
        <FlatList
          data={filteredItems()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.itemList}
          scrollEnabled={true}
        />
      ) : (
        <EmptyState
          message='Nothing hanging in here yet!'
          buttonText='Scan Items'
          onPress={handleScanItems}
        />
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 10,
  },
  selectedFilter: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    color: '#FF6B6B',
  },
  selectedFilterText: {
    color: '#FFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F3E8',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#FFE4B5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 5,
    zIndex: 2, // Higher than any other element
  },
  itemImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  itemName: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
    fontWeight: 'bold',
  },
})

export default SharedItemsScreen
