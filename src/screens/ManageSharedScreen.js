import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import CustomAnimatedLoading from './components/CustomAnimatedLoading';
import { useFocusEffect } from '@react-navigation/native';
import ImagesLoading from './components/ImagesLoading';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';


const ManageSharedScreen = () => {
  const [closetAccess, setClosetAccess] = useState([]);
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      getSharedClosets();
    }, [])
  );

  // This method renders the swipeable action buttons
  const renderRightActions = (closetShareId) => {
    return (
      <RectButton
        style={styles.rightAction}
        onPress={() => handleRevokeAccess(closetShareId)}>
        <Text style={styles.actionText}>Revoke</Text>
      </RectButton>
    );
  };

  const getSharedClosets = async () => {
    const access_token = await SecureStore.getItemAsync('accessToken');

    try {
      const [closetResponse, usersResponse] = await Promise.all([
        axios.get('https://vcloset.xyz/api/closetShares', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }),
        axios.get('https://vcloset.xyz/api/users', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }),
      ]);

      setClosetAccess(closetResponse.data);
      setUsersWithAccess(usersResponse.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (closetShareId) => {
    const access_token = await SecureStore.getItemAsync('accessToken');

    try {
      await axios.get(`https://vcloset.xyz/api/revokeAccess/${closetShareId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      // Refresh the list after successful revocation
      getSharedClosets();
    } catch (error) {
      if (error.response.status === 401) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        navigation.navigate('Login');
      }
      console.error(error);
      Alert.alert('Error', 'Failed to revoke access.');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ImagesLoading />
        </View>
      ) : (
        <View>
          {closetAccess.length === 0 && (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.title}>No users have access to your closet</Text>
              <Text style={{ fontSize: 16, color: '#444' }}> Share your closet with others to give them access.</Text>
              <Button style={{ marginTop: 20, marginBottom: 20, width: 200, color: 'black' }}
                title="Share Your Closet" onPress={() => navigation.navigate('Share Closet')} />
            </View>
          )}
          {closetAccess.length > 0 && (

            < FlatList
              data={closetAccess}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const user = usersWithAccess.find((u) => u.id === item.user_id);

                return (
                  <Swipeable
                    renderRightActions={() => renderRightActions(item.id)} // Passing the closetShareId for the revoke action
                  >
                    <View style={styles.listItem}>
                      <Image
                        source={{ uri: user ? user.image : null }}
                        style={styles.userImage}
                      />
                      <Text style={styles.userName}>
                        {user ? user.first_name : 'Unknown User'}
                      </Text>
                    </View>
                  </Swipeable>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    top: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    color: '#444',
  },
  rightAction: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 25,
    marginVertical: 12,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
});

export default ManageSharedScreen;
