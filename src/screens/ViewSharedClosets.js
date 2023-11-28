import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const ViewSharedClosets = () => {
  const navigation = useNavigation();
  const [closets, setClosets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCloset, setSelectedCloset] = useState(null);

  useEffect(() => {
    getSharedClosets();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getSharedClosets();
    }, [])
  );




  const getSharedClosets = async () => {
    setLoading(true);
    setError(null);

    try {
      const access_token = await SecureStore.getItemAsync('accessToken');
      const response = await axios.get('https://vcloset.xyz/api/sharedClosets', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      setClosets(response.data);
      setLoading(false);
    } catch (err) {
      // logout user if token expires
      if (err.response.status === 401) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        navigation.navigate('Login');
      }
      setError(err.message);
      setLoading(false);
    }
  };

  const renderClosetItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleClosetSelect(item)}>
      <View style={styles.closetItem}>
        <Text style={styles.closetName}>{`${item.first_name}'s Closet`}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleClosetSelect = async (closet) => {
    await SecureStore.setItemAsync(
      'shared_closet_id',
      closet.closet_id.toString()
    )

    navigation.navigate('Shared Closet Home')
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : closets.length === 0 ? ( // if no closets
      <Text style={{ fontSize: 18, fontStyle: 'italic', color: 'navy', textAlign: 'center' }}>
  Regrettably, you have yet to be entrusted with any shared closets.
</Text>

      ) :
        (

          <FlatList
            data={closets}
            renderItem={renderClosetItem}
            keyExtractor={(item) => item.id.toString()}

          />
        )}

      <Modal visible={selectedCloset !== null} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{`${selectedCloset?.first_name}'s Closet`}</Text>
          {/* Add more details or actions here */}
          <TouchableOpacity onPress={() => setSelectedCloset(null)}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closetItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closetName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 16,
    color: 'blue',
  },
});

export default ViewSharedClosets;
