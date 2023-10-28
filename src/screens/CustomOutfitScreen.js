import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Animated,
  Image,
  Modal,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import SnackBar from './components/SnackBar';
import * as Animatable from 'react-native-animatable';
import CustomAnimatedLoading from './components/CustomAnimatedLoading';
import ImagesLoading from './components/ImagesLoading';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons
import { Dimensions } from 'react-native';
// focus effect
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SCREEN_WIDTH = Dimensions.get('window').width;

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

const CustomOutfitScreen = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);

  const [selectedTop, setSelectedTop] = useState(0);
  const [selectedBottom, setSelectedBottom] = useState(0);

  const [topsCount, setTopsCount] = useState(0);
  const [bottomsCount, setBottomsCount] = useState(0);

  const fadeIn = useRef(new Animated.Value(0)).current;

  const topScrollViewRef = useRef(null);
  const bottomScrollViewRef = useRef(null);

  const [topOffset, setTopOffset] = useState(null);
  const [bottomOffset, setBottomOffset] = useState(null);

  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

  const [isModalVisible, setModalVisible] = useState(false);

  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');

  const hideSnackBar = () => {
    setSnackBarVisible(false);
  };


  const prevTop = () => {
    if (topScrollViewRef) {

      if (topIndex > 0) {
        setTopIndex(topIndex - 1);

        let newOffset = topOffset - SCREEN_WIDTH + 100;
        topScrollViewRef.current.scrollTo({ x: newOffset, animated: true });
      }


    }
  }

  const nextTop = () => {

    if (topScrollViewRef) {

      if (topIndex < topsCount) {

        let newOffset = topOffset + SCREEN_WIDTH - 100;

        topScrollViewRef.current.scrollTo({ x: newOffset, animated: true });
        setTopIndex(topIndex + 1);

      }

    }

  }

  const prevBottom = () => {

    if (bottomScrollViewRef) {
      if (bottomIndex > 0) {
        setBottomIndex(bottomIndex - 1);
        let newOffset = bottomOffset - SCREEN_WIDTH + 100;
        bottomScrollViewRef.current.scrollTo({ x: newOffset, animated: true });
      }
    }

  }

  const nextBottom = () => {
    if (bottomScrollViewRef) {
      if (bottomIndex < bottomsCount) {
        setBottomIndex(bottomIndex + 1);
        let newOffset = bottomOffset + SCREEN_WIDTH - 100;
        bottomScrollViewRef.current.scrollTo({ x: newOffset, animated: true });
      }
    }
  }


  useEffect(() => {
    fetchItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    setLoading(true);

    console.log('fetching items');
    const accessToken = await SecureStore.getItemAsync('accessToken');

    try {
      // const response = await axios.get('https://vcloset.xyz/api/items', {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // });

      const items2 = await AsyncStorage.getItem('items');
      const response = JSON.parse(items2);
      

      // setItems(response.data);
      // setTops(response.data.filter(item => item.category.title === 'Tops'));
      // setBottoms(response.data.filter(item => item.category.title === 'Bottoms'));

      setItems(response);
      setTops(response.filter(item => item.category.title === 'Tops'));
      setBottoms(response.filter(item => item.category.title === 'Bottoms'));

      const bottoms = response.filter(
        (x) => x.category.title === 'Bottoms'
      );
      const tops = response.filter((x) => x.category.title === 'Tops');

      setTopsCount(tops.length);
      setBottomsCount(bottoms.length);
      setSelectedBottom(bottoms[0]);
      setSelectedTop(tops[0]);


      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching items:', error);
    }
  };

  const openModel = () => {
    setModalVisible(true);
    setSelectedTop(tops[topIndex]);
    setSelectedBottom(bottoms[bottomIndex]);
  };

  const handleSaveOutfit = async () => {


    console.log('saving outfit');

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
        items: [selectedTop.id, selectedBottom.id],
        description: description,
        tags: [2],
        saved: true,
        liked: true,
      };
      console.log(requestBody);
      const response = await axios.post(
        'https://vcloset.xyz/api/outfits',
        requestBody,
        axiosConfig
      );
      console.log(response);
      if (response.status === 200) {
        isModalVisible(false);
        setSnackBarMessage('Outfit Saved!');
        setSnackBarVisible(true);
      }
    } catch (error) {
      
      console.log(error);
    }


  };


  const decodeBase64Image = (base64Data) => {
    return `data:image/png;base64,` + base64Data;
  };





  return (
    <View style={styles.container}>
     { !loading && 
     <>
      <Animatable.View animation='fadeIn' duration={1000}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={openModel}
        >
          <FontAwesome name="save" size={24} color="white" />
        </TouchableOpacity>
      </Animatable.View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>

        <TouchableOpacity onPress={prevTop}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <ScrollView
          scrollEnabled={false}
          ref={topScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          onScroll={(e) => {
            setTopOffset(e.nativeEvent.contentOffset.x);


          }}
        >
          {tops.map((item) => (
            <Image key={item.id} source={{ uri: decodeBase64Image(item.image.blob) }} style={styles.image} />
          ))}
        </ScrollView>
        <TouchableOpacity onPress={nextTop}>
          <FontAwesome name="arrow-right" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {/* <Text style={styles.subHeading}>Select a Bottom</Text> */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={prevBottom}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <ScrollView
          ref={bottomScrollViewRef}
          scrollEnabled={false}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}

          onScroll={(e) => {
            setBottomOffset(e.nativeEvent.contentOffset.x);
          }}
        >
          {bottoms.map((item) => (
            <Image key={item.id} source={{ uri: decodeBase64Image(item.image.blob) }} style={styles.image} />
          ))}
        </ScrollView>
        <TouchableOpacity onPress={nextBottom}>
          <FontAwesome name="arrow-right" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} backdropOpacity={0.5} animationType="slide" style={styles.modalContainer} transparent={true}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Description:</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Type the description of the outfit here"
            value={description}
            onChangeText={(description) => setDescription(description)}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSaveOutfit}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SnackBar  visible={snackBarVisible}
        message={snackBarMessage}
        onDismiss={hideSnackBar} />
        </>
      }
      {loading && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ImagesLoading />
      </View>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    // screen width
    width: SCREEN_WIDTH - 100,

    height: SCREEN_WIDTH - 100,
    // marginRight: 10,
    resizeMode: 'contain',
  },
  placeholder: {
    width: 300,
    height: 300,
    marginRight: 10,
    backgroundColor: 'red', // as per your design
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionInput: {
    marginTop: 20,
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 300,
    zIndex: 1
  },
  saveButton: {
    backgroundColor: colors.buttonBackground,
    borderRadius: 30,
    padding: 10,
    width: 42,
    top: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    height: 100,
    width: '80%',
    margin: 0,

  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 10,
    padding: 10,
  },
  modalButtonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default CustomOutfitScreen;
