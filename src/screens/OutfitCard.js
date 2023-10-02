import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import HeartIcon from './icons/heart-icon.png'; // Import your heart icon image
import CrossIcon from './icons/cross-icon.png'; // Import your cross icon image

const OutfitCard = ({ outfit, onLike, onDislike }) => {
  const topImage = outfit.items.find((item) => item.category_id === 1); // Assuming category_id 1 is for tops
  const bottomImage = outfit.items.find((item) => item.category_id === 2); // Assuming category_id 2 is for bottoms

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {topImage && (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: `data:image/png;base64,${topImage.image}` }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
        {bottomImage && (
          <View style={styles.imageWrapperBottom}>
            <Image
              source={{ uri: `data:image/png;base64,${bottomImage.image}` }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      <Text style={styles.description}>{outfit.description}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onDislike} style={[styles.button, styles.dislikeButton]}>
          <Image source={CrossIcon} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLike} style={[styles.button, styles.likeButton]}>
          <Image source={HeartIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  imageContainer: {
    flexDirection: 'column', // Display images vertically
    alignItems: 'center', // Center images horizontally
  },
  imageWrapper: {
    marginBottom: -16,
  },
  imageWrapperBottom: {
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  description: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    width: 56,
    height: 56,
    justifyContent: 'center',
  },
  likeButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.8)', // Red color for like
  },
  dislikeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black for dislike
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: 'white',
  },
});

export default OutfitCard;
