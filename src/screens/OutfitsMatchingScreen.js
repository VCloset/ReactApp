import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import axios from 'axios';
import OutfitCard from './OutfitCard';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import ImagesLoading from './components/ImagesLoading';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

const colors = {
  backgroundStart: '#FFF5E1',
  backgroundEnd: '#FFDDC1',
  primaryText: '#333333',
  inputBackground: '#FFFFFF',
  inputBorder: '#FFC857',
  buttonBackground: '#FF5733',
  buttonText: '#FFFFFF',
  errorText: '#FF6B6B',
  cardBackground: '#FFAB79',
};

const OutfitMatchingScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchOutfits();
    }, [])
  );

  const handleRefresh = () => {
    console.log('Refreshing outfits...');
    setLoading(true); // Set loading to true to show loading indicator
    setOutfits([]); // Clear outfits
    fetchOutfits(); // Fetch outfits again
  };

  const translateX = useRef(new Animated.Value(0)).current;
  const panGestureRef = useRef(null);

  const rotate = translateX.interpolate({
    inputRange: [-windowWidth / 2, 0, windowWidth / 2],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  const fetchOutfits = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      setAccessToken(accessToken);
      const response = await axios.get('https://vcloset.xyz/api/outfits?skip=0&limit=100', {
        headers: {
          Authorization: 'Bearer ' + accessToken,
          accept: 'application/json',
        },
      });

      // Filter outfits where saved is false, liked is false, and tags is "3" as a string
      const savedOutfits = response.data.filter(
        (outfit) => outfit.saved === false && outfit.liked === false && outfit.tags === "{3}"
      );

      // Sort the items in each outfit by category_id
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
      console.error('Error fetching outfits:', error.response ? error.response.data : error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // refetch outfits when the screen is focused
    fetchOutfits();
  }, []);

  const handleLike = async () => {
    if (currentIndex < outfits.length) {
      const outfitId = outfits[currentIndex].id;
      try {
        await axios.put(
          `https://vcloset.xyz/api/outfits/like/${outfitId}`,
          {},
          {
            headers: {
              Authorization: 'Bearer ' + accessToken,
              accept: 'application/json',
            },
          }
        );

        await axios.put(
          `https://vcloset.xyz/api/outfits/save/${outfitId}`,
          {},
          {
            headers: {
              Authorization: 'Bearer ' + accessToken,
              accept: 'application/json',
            },
          }
        );

        // You can trigger a swipe animation here
        panGestureRef.current.setNativeProps({
          gestureEnabled: false,
        });
        setCurrentIndex(currentIndex + 1);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDislike = async () => {
    if (currentIndex < outfits.length) {
      const outfitId = outfits[currentIndex].id;
      try {
        await axios.put(
          `https://vcloset.xyz/api/outfits/unlike/${outfitId}`,
          {},
          {
            headers: {
              Authorization: 'Bearer ' + accessToken,
              accept: 'application/json',
            },
          }
        );
        // You can trigger a swipe animation here
        panGestureRef.current.setNativeProps({
          gestureEnabled: false,
        });
        setCurrentIndex(currentIndex + 1);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        // Swiped right, like
        handleLike();
      } else if (nativeEvent.translationX < -50) {
        // Swiped left, dislike
        handleDislike();
      }
      // Reset the translateX value
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300, // You can adjust the animation duration as needed
        useNativeDriver: false,
      }).start(() => {});
    }
  };

  
  return (
    <View style={styles.container}>
      
      {loading ? (
        <ImagesLoading />
      ) : outfits.length > 0 && currentIndex < outfits.length ? (
        <PanGestureHandler
          ref={panGestureRef}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={currentIndex < outfits.length}
        >
          <Animated.View
            style={[
              styles.swipeContainer,
              {
                transform: [{ translateX: translateX }, { rotate: rotate }],
              },
            ]}
          >
            <OutfitCard outfit={outfits[currentIndex]} onLike={handleLike} onDislike={handleDislike} />
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        {/* Use the refresh icon */}
        <AntDesign name="reload1" size={24} color="white" />
      </TouchableOpacity>
        <Text style={styles.text}>No more fashionable outfits left!</Text>
        
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeContainer: {
    width: windowWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    position: 'absolute',
    top: 40, // Adjust the top position as needed
    right: 20, // Adjust the right position as needed
    backgroundColor: colors.buttonBackground,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
});

export default OutfitMatchingScreen;