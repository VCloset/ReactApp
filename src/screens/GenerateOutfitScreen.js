import React, { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'
import SnackBar from './components/SnackBar'

var newOutfit = {}

const GenerateOutfitScreen = () => {
  const [description, setDescription] = useState('')
  const [generatedOutfit, setGeneratedOutfit] = useState(null)
  const [topImage, setTopImage] = useState(null)
  const [bottomImage, setBottomImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const navigation = useNavigation()

  const handleGenerateOutfit = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken')
    try {
      setLoading(true)
      let response
      if (description) {
        const formData = new FormData()
        formData.append('desc', description)

        response = await axios.post(
          'https://vcloset.xyz/api/generateOutfitsWithDescription',
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        setLoading(false)
      } else {
        response = await axios.get('https://vcloset.xyz/api/generateOutfits', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        setLoading(false)
      }
      console.log('Generated outfit:', response.data)
      setGeneratedOutfit(response.data)
      const top = parseInt(response.data.top)
      // Fetch and set top image
      const topResponse = await axios.get(
        `https://vcloset.xyz/api/items/${top}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      setTopImage(topResponse.data.image.blob)

      const bottom = parseInt(response.data.bottom)
      // Fetch and set bottom image
      const bottomResponse = await axios.get(
        `https://vcloset.xyz/api/items/${bottom}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      setBottomImage(bottomResponse.data.image.blob)
      newOutfit = Object.assign(response.data)
    } catch (error) {
      console.error('Error generating outfit:', error.response.data)
    }
  }


  const handleSaveOutfit = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken')
    const closet_id = await SecureStore.getItemAsync('closet_id')
    
    const axiosConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
    try {
      const requestBody = {
        closet_id: closet_id,
        items: [newOutfit.top, newOutfit.bottom ],
        description: newOutfit.description,
        tags: [1],
        saved: true,
        liked: true,
      }
      console.log('Request body:', requestBody)

      const response = await axios.post(
        'https://vcloset.xyz/api/outfits',
        requestBody,
        axiosConfig
      )
      if (response.status === 200) {
        setSaved(true)
      }
    } catch (error) {
      console.error('Error saving outfit:', error.response.data)
    }
  }

  const handleDismissSnackBar = () => {
    setSaved(false)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} alwaysBounceVertical={false}>
        Generate Outfit
      </Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder='Enter outfit description (optional)'
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateOutfit}>
        <Text style={styles.buttonText}>Generate</Text>
      </TouchableOpacity>
      {loading && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      )}
      {generatedOutfit && (
        <>
          <View style={styles.generatedOutfit}>
            <Text style={styles.outfitText}>Top: {generatedOutfit.top}</Text>
            {topImage && (
              <Image
                source={{ uri: `data:image/png;base64,${topImage}` }}
                style={styles.outfitImage}
              />
            )}
            <Text style={styles.outfitText}>
              Bottom: {generatedOutfit.bottom}
            </Text>
            {bottomImage && (
              <Image
                source={{ uri: `data:image/png;base64,${bottomImage}` }}
                style={styles.outfitImage}
              />
            )}
            <Text style={styles.outfitDescription}>
              {generatedOutfit.description}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveOutfit}>
            <Text style={styles.buttonText}>Save Outfit</Text>
          </TouchableOpacity>
          <SnackBar
            visible={saved}
            message='Outfit Saved!'
            onDismiss={handleDismissSnackBar}
          />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  descriptionInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generatedOutfit: {
    marginTop: 20,
    alignItems: 'center',
  },
  outfitText: {
    fontSize: 18,
    marginBottom: 10,
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
  },
})

export default GenerateOutfitScreen
