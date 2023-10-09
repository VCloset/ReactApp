import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import SnackBar from './components/SnackBar';
import * as Animatable from 'react-native-animatable';
import CustomAnimatedLoading from './components/CustomAnimatedLoading';
import ImagesLoading from './components/ImagesLoading';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons

const colors = {
  backgroundStart: '#FFF5E1',
  backgroundEnd: '#FFDDC1',
  primaryText: '#333333',
  inputBackground: '#FFFFFF',
  inputBorder: '#FFC857',
  buttonBackground: '#FF5733', // Changed button color
  buttonText: '#FFFFFF',
  errorText: '#FF6B6B',
  cardBackground: '#FFAB79', // Changed card background color
};

var newOutfit = {};

const GenerateOutfitScreen = () => {
  const [description, setDescription] = useState('');
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [topImage, setTopImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');

  const navigation = useNavigation();
  const scrollViewRef = useRef();

  useEffect(() => {
    resetComponentState();
  }, []);

  const resetComponentState = () => {
    setGeneratedOutfit(null);
    setTopImage(null);
    setBottomImage(null);
    setLoading(false);
    setSaved(false);
    setSnackBarVisible(false);
    setSnackBarMessage('');
  };

  const handleGenerateOutfit = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    resetComponentState();

    try {
      setLoading(true);
      let response;
      if (description) {
        const formData = new FormData();
        formData.append('desc', description);

        response = await axios.post(
          'https://vcloset.xyz/api/generateOutfitsWithDescription',
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else {
        response = await axios.get('https://vcloset.xyz/api/generateOutfits', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
      setGeneratedOutfit(response.data);
      const top = parseInt(response.data.top);

      const topResponse = await axios.get(
        `https://vcloset.xyz/api/items/${top}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setTopImage(topResponse.data.image.blob);

      const bottom = parseInt(response.data.bottom);

      const bottomResponse = await axios.get(
        `https://vcloset.xyz/api/items/${bottom}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setBottomImage(bottomResponse.data.image.blob);
      newOutfit = { ...response.data };

      // Scroll to the position where both top and bottom images are visible together
      scrollViewRef.current.scrollTo({
        x: 0,
        y: 0,
        animated: true,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error generating outfit:', error.response.data);
      showSnackBar('Error generating outfit');
    }
  };

  const handleSaveOutfit = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const closet_id = await SecureStore.getItemAsync('closet_id');

    const axiosConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const requestBody = {
        closet_id: closet_id,
        items: [newOutfit.top, newOutfit.bottom],
        description: newOutfit.description,
        tags: [1],
        saved: true,
        liked: true,
      };
      const response = await axios.post(
        'https://vcloset.xyz/api/outfits',
        requestBody,
        axiosConfig
      );
      if (response.status === 200) {
        setSaved(true);
        showSnackBar('Outfit Saved!');
      }
    } catch (error) {
      console.error('Error saving outfit:', error.response.data);
      showSnackBar('Error saving outfit');
    }
  };

  const showSnackBar = (message) => {
    setSnackBarMessage(message);
    setSnackBarVisible(true);
  };

  const hideSnackBar = () => {
    setSnackBarVisible(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: colors.backgroundEnd }}
      ref={scrollViewRef}
    >
      <Text style={styles.title}>Generate Outfit</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder='Enter outfit description (optional)'
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <Animatable.View
        animation='pulse'
        easing='ease-out'
        iterationCount='infinite'
      >
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateOutfit}
        >
          <Text style={styles.buttonText}>Generate</Text>
        </TouchableOpacity>
      </Animatable.View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ImagesLoading />
          <CustomAnimatedLoading />
        </View>
      )}
      
      {generatedOutfit && (
        <>
        <Animatable.View animation='fadeIn' duration={1000}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveOutfit}
            >
              <FontAwesome name="save" size={24} color="white" />
            </TouchableOpacity>
          </Animatable.View>
          <View style={styles.generatedOutfit}>
            <View style={styles.outfitCard}>
              {topImage && (
                <Image
                  source={{ uri: `data:image/png;base64,${topImage}` }}
                  style={styles.outfitImage}
                />
              )}
            </View>
            <View style={styles.outfitCard}>
              {bottomImage && (
                <Image
                  source={{ uri: `data:image/png;base64,${bottomImage}` }}
                  style={styles.outfitImage}
                />
              )}
            </View>
            <View style={styles.outfitCard}>
              <Text style={styles.outfitDescription}>
                {generatedOutfit.description}
              </Text>
            </View>
          </View>
        </>
      )}
      <SnackBar
        visible={snackBarVisible}
        message={snackBarMessage}
        onDismiss={hideSnackBar}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.primaryText,
  },
  descriptionInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: colors.inputBackground,
  },
  generateButton: {
    backgroundColor: colors.buttonBackground,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  // align to the left of the screen
  saveButton: {
    backgroundColor: colors.buttonBackground,
    borderRadius: 30,
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 140,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  generatedOutfit: {
    marginTop: 20,
    alignItems: 'center',
  },
  outfitCard: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: colors.cardBackground, // Set card background color
  },
  outfitText: {
    fontSize: 18,
    marginBottom: 10,
    color: colors.primaryText,
  },
  outfitImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  outfitDescription: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.primaryText,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 200,
  },
});

export default GenerateOutfitScreen;
