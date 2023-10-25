import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, TextInput, Button, Alert, KeyboardAvoidingView } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

import { SelectList } from 'react-native-dropdown-select-list';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import hangarIcon from '../screens/icons/hangar-icon2.png';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

const ScanItemScreen = () => {
  const navigation = useNavigation();
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [image, setImage] = useState(null);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = React.useState("");
  const [tags, setTags] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);

  const [forceSet, forceUpdate] = useState(false);
  const [items, setItems] = useState([]);

  // *****
  const [selected, setSelected] = React.useState("");


  // *****
  const getCategories = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    try {
      const response = await axios.get('https://vcloset.xyz/api/categories', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const cat = response.data.map((category) => ({
        key: category.id,
        value: category.title,
      }));
      setCategories(cat);


      const items = response.data.map((category) => ({
        label: category.title,
        value: category.id,
        // if Top is the title then color is red else black
        color: 'black',
      }));
      setItems(items);
    } catch (error) {
      // if error 401 
      if (error.response.status === 401) {
        navigation.navigate('Login');
      }
      console.error('Error getting categories:', error);
    }
  };

  // override setCategories 
  const setCategory2 = (value) => {
    // check if value is null

   

    if (value == null && forceSet == false) {

      setSelected(1);
      // change the RNPickerSelect value
      setCategory(1);
    } else {
      setSelected(value);
      setCategory(value);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        // Request camera permissions
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraPermission.status === 'granted');
  
        // Request media library permissions
        const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
  
        // Check and handle if any permissions were denied
        if (
          cameraPermission.status !== 'granted' ||
          mediaLibraryPermission.status !== 'granted'
        ) {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
  
        // Fetch categories
        getCategories();

        // clear
        forceUpdate(true);
        setImage(null);
        setCategory('');
        setSelected(null);
        setTags('');
        setName('');
        forceUpdate(false);
      })();
    }, [])
  );



  useEffect(() => {
    (async () => {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === 'granted');

      // Request media library permissions
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');

      // Check and handle if any permissions were denied
      if (
        cameraPermission.status !== 'granted' ||
        mediaLibraryPermission.status !== 'granted'
      ) {
        alert('Sorry, we need camera roll permissions to make this work!');
      }

      // Fetch categories
      getCategories();
    })();
  }, []);

  const handleSelectImage = async () => {
    Alert.alert(
      'Select Image Source',
      'Choose the source of the image',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openImagePicker(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    let cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status === 'granted') {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      const uri = result.assets.map(x => x.uri).toString()

      if (!result.canceled) {
        setImage(uri);
      }
    } else {
      console.log('Camera permission not granted');
    }
  };

  const openImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });


    const uri = result.assets.map(x => x.uri).toString()

    if (!result.canceled) {
      setImage(uri);
    }
  };


  const handleAddItem = async () => {

    setLoading(true);
    const accessToken = await SecureStore.getItemAsync('accessToken');
    try {
      // convert image to base64
      const response = await fetch(image);
      const blob = await response.blob();
      const base64String = await blobToBase64(blob);


      const formData = new FormData();

      image_data = {
        "uri": image,
        "type": "image/jpeg",
        "name": "image.jpg"
      }
      formData.append('image', image_data);
      formData.append('category_id', parseInt(category));

      // const tagsArray = tags.split(',').map(tag => parseInt(tag));
      const array = []
      array.push(1);
      formData.append('tags', array);

      formData.append('description', 'Image -');
      formData.append('name', name);

      const response2 = await axios.post('https://vcloset.xyz/api/items', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigation.navigate('Item');
      // clear 
      forceUpdate(true);
      setImage(null);
      setCategory('');
      setSelected(null);
      setTags('');
      setName('');
      forceUpdate(false);
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
    }
  };



  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, width: '100%', height: '100%' }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}

    keyboardVerticalOffset={100}
    enabled>
    <ScrollView contentContainerStyle={{ flexGrow: 1}} ref={scrollRef}>
      <View style={styles.container}>
        {/* show an hangar icon  */}

        <Image source={hangarIcon} style={{ width: 200, height: 200, resizeMode: 'contain', padding:0, margin:0 }} />
        <Camera style={styles.camera} type={type} flashMode={flashMode} ref={cameraRef}>
          {/* Camera UI buttons are now icons */}

        </Camera>
        <TouchableOpacity style={styles.imagePicker} onPress={handleSelectImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (

            <Ionicons name="add-circle" size={50} color="black" />

          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Name" onChangeText={(text) => setName(text)} value={name} />

        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setCategory2(value)}
            items={items}
            placeholder={{ label: 'Select a category', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false} // android only
            Icon={() => {
              return <Ionicons name="chevron-down" size={24} color="gray" />;
            }}
            value={selected}

          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator />}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

};

const styles = StyleSheet.create({
  pickerContainer: {
    marginTop: 16,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  container: {
    alignItems: 'center',
    // justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: '#f9f9f9',  // Light neutral background
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 16,
    backgroundColor: '#white',  // Light neutral background
    borderRadius: 10,  // Rounded corners for the image
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,  // Subtle shadow for depth
    shadowRadius: 1.5,
  },
  imagePicker: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 10,  // Consistent rounded corners
    backgroundColor: '#f5f5f5',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  imagePickerText: {
    fontSize: 24,  // Slightly reduced size for the icon
    color: '#888888',  // Neutral color for the icon
  },
  input: {
    width: '90%',
    padding: 15,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  label: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  text: {
    marginBottom: 16,
  },
  list: {
    width: '100%',
    padding: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  addButton: {
    width: '70%',
    backgroundColor: '#4CAF50', // Attractive color
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    // paddingVertical: 12,
    paddingHorizontal: 10,

    color: 'black',
    paddingRight: 30, // to ensure the text is not cut off
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,

    color: 'black',
    paddingRight: 30, // to ensure the arrow icon is not cut off
  },
  iconContainer: {
    top: Platform.OS === 'ios' ? 4 : 8,
    right: 10,
  },
});


export default ScanItemScreen;
