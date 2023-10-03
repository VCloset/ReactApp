import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import axios from 'axios';
import OutfitCard from './OutfitCard';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

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
      }).start(() => {
      });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
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
                transform: [{ translateX: translateX },
                {rotate : rotate},
                ],
              },
            ]}
          >
            <OutfitCard outfit={outfits[currentIndex]} onLike={handleLike} onDislike={handleDislike} />
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <Text styles = {styles.text}>No more outfits to show!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeContainer: {
    width: windowWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default OutfitMatchingScreen;
