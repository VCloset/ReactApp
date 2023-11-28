import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; // Import icons library
import { Alert } from 'react-native';
import ImagesLoading from './components/ImagesLoading';

// async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

async function get(key) {
  return await SecureStore.getItemAsync(key);
}

async function set(key, value) {
  return await SecureStore.setItemAsync(key, value);
}

const Header = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const LoadingIndicator = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#FF6B6B" />
    </View>
  );
};

const EmptyState = ({ message, buttonText, onPress }) => {
  return (
    <View style={styles.emptyContainer}>
      <Image source={require('../../assets/empty.png')} style={styles.emptyImage} />
      <Text style={styles.emptyText}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ItemScreen = () => {
  const navigation = useNavigation();
  const [fadeIn] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [topsCount, setTopsCount] = useState(0);
  const [bottomsCount, setBottomsCount] = useState(0);
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');


  useEffect(() => {
    fetchItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [])
  );


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
      return items;
    case 'Tops':
      return tops;
    case 'Bottoms':
      return bottoms;
    default:
      return items;
  }
};

  const handleScanItems = () => {
        // Navigate to the Scan Items page
        navigation.navigate('ScanItem'); // Replace with the actual screen name
      };
  const deleteItem = async (itemId) => {
    const accessToken = await get('accessToken');

    try {
      await axios.delete(`https://vcloset.xyz/api/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const decodeBase64Image = (base64Data) => {
    return `data:image/png;base64,` + base64Data;
  };

  const fetchItems = async () => {
    const accessToken = await get('accessToken');

    try {
      const response = await axios.get('https://vcloset.xyz/api/items', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setItems(response.data);
      setTops(response.data.filter(item => item.category.title === 'Tops'));
      setBottoms(response.data.filter(item => item.category.title === 'Bottoms'));

      const bottoms = response.data.filter(
        (x) => x.category.title === 'Bottoms'
      );
      const tops = response.data.filter((x) => x.category.title === 'Tops');

      setTopsCount(tops.length);
      setBottomsCount(bottoms.length);

      await set('topsCount', tops.length.toString());
      await set('bottomsCount', bottoms.length.toString());

      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      setLoading(false);

      // save items to async storage
      
      await AsyncStorage.setItem('items', JSON.stringify(response.data));


    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };


  
  const generateOutfits = async () => {
    const accessToken = await get('accessToken');

    try {
      await axios.get('https://vcloset.xyz/api/generateOutfitsAll', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
    //  pass
    
    }
  };
  

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
      ]}
    >
      <TouchableOpacity
        style={styles.deleteButton}
        activeOpacity={0.7}
        onPress={(e) => {
          e.stopPropagation();
          Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                onPress: async () => {
                  await deleteItem(item.id);
                },
                style: 'destructive',
              },
            ],
            { cancelable: false }
          );
        }}
      >
        <AntDesign name="delete" size={20} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
      
        onPress={() => {
          navigation.navigate('ViewItem', { item: item});
        }}
        style={{ width: '100%' }}
      >
        <Image
          style={styles.itemImage}
          source={{ uri: decodeBase64Image(item.image.blob) }}
          resizeMode="contain"
        />
        <Text style={styles.itemName}>{item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
       {renderFilterButtons()}
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
          message="Nothing hanging in here yet!"
          buttonText="Scan Items"
          onPress={handleScanItems}
        />
      )}
    </View>
  );
};

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
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
  },
  selectedFilter: {
    backgroundColor: '#E0E0E0',
  },
  filterText: {
    color: '#606060',
  },
  selectedFilterText: {
    color: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean background
    paddingHorizontal: 15, // Consistent spacing from the edges
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Adjusting for the platform
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
    paddingHorizontal: 30,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    tintColor: '#B0B0B0', 
  },
  emptyText: {
    fontSize: 18, // Slightly larger text
    color: '#A9A9A9', // Subtle text color
    textAlign: 'center', // Centered message
    marginBottom: 15, // Balanced spacing
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
    backgroundColor: '#F8F8F8', // Lighter container background
    // Removed alignItems and justifyContent to allow default stretching
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
    height: undefined, // Allowing the image to define its own aspect ratio
    aspectRatio: 1, // But if not, keeping a square aspect ratio
    borderRadius: 10, // Softening the edges
    marginBottom: 10, // Space between image and text
  },
  itemName: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#404040',
    fontWeight: 'bold',
  },
});

export default ItemScreen;