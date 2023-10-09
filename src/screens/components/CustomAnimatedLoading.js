import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RandomReveal } from 'react-random-reveal';
import ImagesLoading from './ImagesLoading';
const CustomAnimatedLoading = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsPlaying(false);

      // Reset the animation after another 5 seconds
      setTimeout(() => {
        setIsPlaying(true);
      }, 5000);
    }, 5000);

    // Clean up the timeout when the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {isPlaying ? (
          <View>
          <Text style={styles.text}>
            {/* swap images in left to right motion */}
            <RandomReveal
              isPlaying={isPlaying}
              duration={5}
              characters="AI is thinking..."
            />
          </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CustomAnimatedLoading;
