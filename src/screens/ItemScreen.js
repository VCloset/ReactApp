
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
// } from 'react-native';
// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';
// import { useNavigation } from '@react-navigation/native';
// import { useFocusEffect } from '@react-navigation/native';
// import { Alert } from 'react-native';

// async function get(key) {
//   return await SecureStore.getItemAsync(key);
// }

// async function set(key, value) {
//   return await SecureStore.setItemAsync(key, value);
// }

// const ItemScreen = () => {
//   const navigation = useNavigation();
//   const [fadeIn] = useState(new Animated.Value(0));

//   const handleScanItems = () => {
//     // Navigate to the Scan Items page
//     navigation.navigate('ScanItem'); // Replace with the actual screen name
//   };

//   const [loading, setLoading] = useState(true);
//   const [items, setItems] = useState([]);
//   const [topsCount, setTopsCount] = useState(0);
//   const [bottomsCount, setBottomsCount] = useState(0);

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchItems();
//     }, [])
//   );

//   useEffect(() => {
//     if (bottomsCount >= 3 && topsCount >= 3) {
//       // Call the API only when the conditions are met
//       generateOutfits();
//     }
//   }, [bottomsCount, topsCount]);

//   const deleteItem = async (itemId) => {
//     const accessToken = await get('accessToken');
  
//     try {
//       await axios.delete(`https://vcloset.xyz/api/items/${itemId}`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
  
//       // Refresh the list of items after deleting
//       fetchItems();
//     } catch (error) {
//       console.error('Error deleting item:', error);
//     }
//   };
  

//   const decodeBase64Image = (base64Data) => {
//     return `data:image/png;base64,` + base64Data;
//   };

//   const fetchItems = async () => {
//     const accessToken = await get('accessToken');

//     try {
//       const response = await axios.get('https://vcloset.xyz/api/items', {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });

//       setItems(response.data);

//       const bottoms = response.data.filter(
//         (x) => x.category.title === 'Bottoms'
//       );
//       const tops = response.data.filter((x) => x.category.title === 'Tops');

//       // Update the counts
//       setTopsCount(tops.length);
//       setBottomsCount(bottoms.length);

//       // Save the counts to memory
//       await set('topsCount', tops.length.toString());
//       await set('bottomsCount', bottoms.length.toString());

//       // Apply a fade-in animation
//       Animated.timing(fadeIn, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: false,
//       }).start();

//       setLoading(false); // Set loading to false once data is loaded
//     } catch (error) {
//       console.error('Error fetching items:', error);
//     }
//   };

//   const generateOutfits = async () => {
//     const accessToken = await get('accessToken');

//     try {
//       await axios.get('https://vcloset.xyz/api/generateOutfitsAll', {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       console.log('Success');
//     } catch (error) {
//       console.error('Error generating outfits:', error);
//     }
//   };

//   const renderItem = ({ item }) => (
//     <Animated.View
//       style={[
//         styles.itemContainer,
//         {
//           opacity: fadeIn, // Apply fade-in animation
//           transform: [
//             {
//               translateY: fadeIn.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [50, 0],
//               }),
//             },
//           ],
//         },
//       ]}
//     >
//       <TouchableOpacity
//       style={styles.editButton}
//       onPress={() => {
//         // Show a confirmation dialog
//         Alert.alert(
//           'Delete Item',
//           'Are you sure you want to delete this item?',
//           [
//             {
//               text: 'Cancel',
//               style: 'cancel',
//             },
//             {
//               text: 'Delete',
//               onPress: async () => {
//                 // Perform the delete operation
//                 await deleteItem(item.id);
//               },
//               style: 'destructive',
//             },
//           ],
//           { cancelable: false }
//         );
//       }}
//     >
//       <Text style={styles.editButtonText}>✖️</Text>
//     </TouchableOpacity>
//     <TouchableOpacity onPress={() => {
//         navigation.navigate('ViewItem', { item_id: item.id });
//       }}
//       // take full width
//       style={{width: '100%'}}
//       >
//       <Image
//         style={styles.itemImage}
//         source={{ uri: decodeBase64Image(item.image.blob) }}
//         resizeMode="contain"
//       />
//       <Text style={styles.itemName}>{item.name}</Text>
//       </TouchableOpacity>
//       {/* Edit Button */}
  
//     </Animated.View>
//   );

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <ActivityIndicator style={styles.loader} size="large" color="#FF6B6B" />
//       ) : items && items.length > 0 ? (
//         <FlatList
//           data={items}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id.toString()}
//           numColumns={3}
//           contentContainerStyle={styles.itemList}
//         />
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No items found</Text>
//           <TouchableOpacity style={styles.button} onPress={handleScanItems}>
//             <Text style={styles.buttonText}>Scan Items</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     backgroundColor: '#F7F3E8', // Light gray background color
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   itemList: {
//     flexGrow: 1,
//   },
//   itemContainer: {
//     flex: 1,
//     margin: 5,
//     borderRadius: 5,
//     backgroundColor: '#FFE4B5', // Moccasin item background color
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//   },
//   itemImage: {
//     width: '100%',
//     height: 160,
//     borderRadius: 5,
//   },
//   itemName: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 10,
//     color: '#333', // Dark gray text color
//     fontWeight: 'bold',
//   },
//   button: {
//     marginTop: 20,
//     backgroundColor: '#FF6B6B', // Coral button background color
//     padding: 15,
//     borderRadius: 25,
//   },
//   buttonText: {
//     color: '#FFF', // White text color
//     textAlign: 'center',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   imageContainer: {
//     // width: '100%',
//     // height: 160,
    
//   },
//   editButton : {
//     position: 'absolute',
//     top: 2,
//     right: 2,
//     backgroundColor: '#FF6B6B', // Coral button background color
//     padding: 2,
//     borderRadius: 30,
//     zIndex: 1,
//   },
// });

// export default ItemScreen;


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
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; // Import icons library
import { Alert } from 'react-native';
import ImagesLoading from './components/ImagesLoading';

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

  useEffect(() => {
    fetchItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [])
  );

  useEffect(() => {
    if (bottomsCount >= 3 && topsCount >= 3) {
      generateOutfits();
    }
  }, [bottomsCount, topsCount]);

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
      console.log('Success');
    } catch (error) {
      console.error('Error generating outfits:', error);
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
        onPress={() => {
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
          navigation.navigate('ViewItem', { item_id: item.id });
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
      {/* <Header title="My Collection" /> */}
      {loading ? (
        <View style={styles.loaderContainer}>
        <ImagesLoading />
        </View>
      ) : items && items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.itemList}
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
});

export default ItemScreen;
