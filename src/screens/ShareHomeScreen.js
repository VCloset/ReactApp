import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import SnackBar from './components/SnackBar';

const ShareHomeScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const access_token = await SecureStore.getItemAsync('accessToken');
      let response;

      if (searchQuery.trim()) {
        response = await axios.get(
          `https://vcloset.xyz/api/searchUser/${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
      } else {
        response = await axios.get('https://vcloset.xyz/api/users', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
      }

      // if image doesnt contain data:image/jpeg;base64,
      // add it before setting the image
      response.data.forEach((user) => {
        if (!user.image.includes('data:image/jpeg;base64,')) {
          user.image = `data:image/jpeg;base64,${user.image}`;
        }
      });

      setUsers(response.data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    // Make a post request with the message and other data
    try {
      const access_token = await SecureStore.getItemAsync('accessToken');
      const closet_id = await SecureStore.getItemAsync('closet_id');
      const closetShareData = {
        closet_id: parseInt(closet_id),
        user_id: selectedUser.id,
        permissions: 'EDIT', // Change as needed
        share_status: 'none',
          //date time now
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        message,
        revocation_reason: '',
        last_accessed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        share_type: '',
        user_role_in_closet: '',
      };

      const response = await axios.post(
        'https://vcloset.xyz/api/closetShares',
        closetShareData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Handle success
      console.log('Share request sent successfully:', response.data);

      // Close the modal and reset the state
      setModalVisible(false);
      setMessage('');
      setSelectedUser(null);
    } catch (err) {
      // Handle error
      console.error('Error sending share request:', err.message);
      // show the error to the user
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Recipient</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for a user"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        onKeyUp={getUsers}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={getUsers}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#000000" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleUserSelect(item)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.userImage}
            />
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
      <Modal visible={isModalVisible} backdropOpacity={0.5} animationType="slide" style={styles.modalContainer} transparent={true}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Send a Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message here"
            value={message}
            onChangeText={(text) => setMessage(text)}
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
              onPress={handleSubmit}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  userList: {
    marginTop: 20,
    width: '100%',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    height: 100,
    width: '80%',
    flex: 1,
    justifyContent: 'flex-end', // Align to the bottom
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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

export default ShareHomeScreen;
