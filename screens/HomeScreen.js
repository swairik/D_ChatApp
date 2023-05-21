import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ASYNC_STORAGE_USER_KEY,
  ASYNC_STORAGE_USER_SUBSCRIBED_CHAT_CHANNELS_KEY,
} from '../constants';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomListItem from '../components/CustomListItem';
import {useIsFocused} from '@react-navigation/native';

import Gun from 'gun/gun';

const HomeScreen = ({navigation}) => {
  const [currentUser, setCurrentUser] = useState();

  const db = Gun({
    peers: ['http://192.168.29.55:8800'],
    store: false,
  });

  const restartGun = () => {
    gun = Gun({
      peers: [peer],
      store: asyncStore,
    });
  };

  const storeData = async (value, key) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log('error', e);
    }
  };

  const getData = async key => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  const removeData = async key => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (exception) {
      return false;
    }
  };

  const signOut = () => {
    removeData(ASYNC_STORAGE_USER_KEY);
    navigation.replace('Login');
  };

  const isFocused = useIsFocused();

  const [subscribedChats, setSubscribedChats] = useState([]);

  useEffect(() => {
    getData(ASYNC_STORAGE_USER_KEY)
      .then(user => {
        setCurrentUser(user);
        getData(ASYNC_STORAGE_USER_SUBSCRIBED_CHAT_CHANNELS_KEY).then(
          chatData => {
            setSubscribedChats(JSON.parse(chatData));
            // console.log(subscribedChats);
          },
        );
      })
      .catch(e => console.log(e));
  }, [isFocused]);

  useLayoutEffect(() => {
    console.log(subscribedChats);
    navigation.setOptions({
      title: 'Chats',
      headerStyle: {backgroundColor: '#fff'},
      headerTitleStyle: {color: 'black'},
      headerTintColor: 'black',
      headerLeft: () => (
        <View style={{marginLeft: 5}}>
          <TouchableOpacity onPress={() => navigation.navigate('Add-Chat')}>
            <Text style={{color: 'black'}}>Add Chat</Text>
          </TouchableOpacity>
        </View>
      ),
      headerRight: () => (
        <View style={{marginRight: 5}}>
          {/* <Icon name="rowing" onPress={() => console.log('pressed button')} /> */}
          <TouchableOpacity onPress={signOut}>
            <Text style={{color: 'black'}}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  const enterChat = chatName => {
    console.log('entering ', chatName);
    console.log('currentUser from home ', currentUser);
    navigation.navigate('Chat', {
      chatName,
      currentUser,
    });
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {subscribedChats.map((chat, i) => (
          <CustomListItem key={i} chatName={chat} enterChat={enterChat} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: '100%',
});
