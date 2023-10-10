import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

import { SelectList } from 'react-native-dropdown-select-list';

import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';


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
    } catch (error) {
      console.error('Error getting categories:', error);
    }
  };

  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      const { status2 } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(status2 === 'granted');
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
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setImage(result.uri);
      }
    } else {
      console.log('Camera permission not granted');
    }
  };

  const openImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
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
      setImage(null);
      setCategory('');
      setTags('');
      setName('');
      
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
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} flashMode={flashMode} ref={cameraRef}>
        {/* Camera UI buttons */}
      </Camera>

      {image ? (
        <Image source={{ uri: image }} style={styles.previewImage} />
      ) : (
        <TouchableOpacity style={styles.imagePicker} onPress={handleSelectImage}>
          <Text style={styles.imagePickerText}>+</Text>
        </TouchableOpacity>
      )}

        {/* empty the fields on submit */}
      <TextInput style={styles.input} placeholder="Name" onChangeText={(text) => setName(text)} />
      {/* <TextInput style={styles.input} placeholder="Tags" onChangeText={(text) => setTags(text)} /> */}
      <SelectList
        style={styles.list}
        setSelected={(val) => setCategory(val)}
        data={categories}
        save="key"
        autosize={false}
      />


      {/* Add Item button */}
      <Button title="Add Item" onPress={handleAddItem} />
      {loading && <ActivityIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 0.5,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 16,
  },
  imagePicker: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  imagePickerText: {
    fontSize: 50,
    color: 'black',
  },
  input: {
    width: '100%',
    padding: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: 'white',
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
    position: "absolute",
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: 'white',
    height: 50,
    zIndex:999,
    // top: 40,
    marginTop: 40,
  }
});

export default ScanItemScreen;
