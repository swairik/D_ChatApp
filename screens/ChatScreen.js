import {StyleSheet, Text, View, Keyboard} from 'react-native';
import React, {useLayoutEffect, useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';

import uuid from 'uuid-random';

import CryptoJS from 'react-native-crypto-js';

import {GiftedChat} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Gun from 'gun/gun';
import 'gun/lib/radix.js';
import 'gun/lib/radisk.js';
import 'gun/lib/store.js';
import Store from 'gun/lib/ras.js';

import {MESSAGE_ENCRYPTION_KEY} from '../constants';

const ChatScreen = ({navigation}) => {
  const route = useRoute();

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
  const [user, setUser] = useState();

  const [input, setInput] = useState();
  const [messages, setMessages] = useState([]);
  let initialMessages = [];

  let [peer, setPeer] = useState('http://gunjs.herokuapp.com/gun');

  const asyncStore = Store({AsyncStorage});

  const db = Gun({
    peers: ['http://gunjs.herokuapp.com/gun'],
    store: asyncStore,
  });

  const restartGun = () => {
    gun = Gun({
      peers: [peer],
      store: asyncStore,
    });
  };

  const encryptData = (data, key) => {
    const stringData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, key).toString();
  };

  const decryptData = (data, key) => {
    const bytes = CryptoJS.AES.decrypt(data, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  };

  useEffect(() => {
    setUser(route.params.currentUser);

    db.get(route.params.chatName)
      .map()
      .once(async (data, key) => {
        let currentMessage = {
          _id: data.message_id,
          createdAt: new Date(data.when),
          text: decryptData(data.message, MESSAGE_ENCRYPTION_KEY),
          user: {
            _id: data.user_id,
            name: data.user_name,
          },
        };

        initialMessages.push(currentMessage);
      });
    initialMessages.sort((a, b) => b.when - a.when);
    setMessages(initialMessages);
  }, []);

  db.get(route.params.chatName)
    .map()
    .on(async (data, key) => {
      let currentMessage = {
        _id: data.message_id,
        createdAt: new Date(data.when),
        text: data.message,
        user: {
          _id: data.user_id,
          name: data.user_name,
        },
      };

      initialMessages = [...initialMessages, currentMessage];
      initialMessages.sort((a, b) => a.when - b.when);
      setMessages(initialMessages);
    });

  const sendMessage = () => {
    if (input == null || input == undefined || input == '') {
      return;
    }
    Keyboard.dismiss();
    let message = {
      user_id: user.userId,
      user_name: user.userName,
      message: encryptData(input, MESSAGE_ENCRYPTION_KEY),
      message_id: uuid(),
      when: new Date().toISOString(),
    };
    db.get(route.params.chatName).get(new Date().toISOString()).put(message);
    setInput('');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chat',
      headerTitleAlign: 'left',
      headerTitle: () => (
        <View
          style={{flexDirection: 'row', alignItems: 'center', color: 'white'}}>
          <Text
            style={{
              color: 'white',
              marginLeft: 10,
              fontWeight: '700',
              fontSize: 20,
            }}>
            {route.params.chatName} Channel
          </Text>
        </View>
      ),
    });
  });

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => sendMessage(messages)}
      user={{
        _id: route.params.userId,
      }}
    />
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
