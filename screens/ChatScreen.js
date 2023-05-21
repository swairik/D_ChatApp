import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Input,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import React, {useLayoutEffect, useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';

import uuid from 'uuid-random';

import CryptoJS from 'react-native-crypto-js';

import {GiftedChat, InputToolbar} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Gun from 'gun/gun';
import 'gun/lib/radix.js';
import 'gun/lib/radisk.js';
import 'gun/lib/store.js';
import Store from 'gun/lib/ras.js';

import {ASYNC_STORAGE_USER_KEY, MESSAGE_ENCRYPTION_KEY} from '../constants';

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

  //   console.log('channel :', route.params.user);

  const [input, setInput] = useState();
  const [messages, setMessages] = useState([]);
  let initialMessages = [];

  let [peer, setPeer] = useState('http://192.168.29.55:8800');

  const asyncStore = Store({AsyncStorage});

  const db = Gun({
    peers: ['http://192.168.29.55:8800'],
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
        console.log('logging from once');
        // console.log(data);

        let currentMessage =
          // [
          {
            _id: data.message_id,
            createdAt: new Date(data.when),
            text: data.message,
            user: {
              _id: data.user_id,
              name: data.user_name,
            },
          };
        // ];

        // console.log('current : ', currentMessage);

        initialMessages.push(currentMessage);
        console.log(initialMessages);
        initialMessages.sort((a, b) => a.when - b.when);
        setMessages(initialMessages);

        // messages: GiftedChat.append(messages, currentMessage);
        // messages.push(currentMessage);
        // setMessages(currentMessage => {
        //   console.log(currentMessage);
        // });
        // initialMessages.push(currentMessage);
        // console.log('messages ', messages);

        // updateMessages(currentMessage);

        // gunMessages = await [...gunMessages, data];
        // console.log(gunMessages);
        // gunMessages.push(data);
        // console.log(data);

        // initialMessages = initialMessages.sort((a, b) => a.when - b.when);
      });
    // console.log('gun messages : ', initialMessages);
  }, []);

  db.get(route.params.chatName)
    .map()
    .on(async (data, key) => {
      console.log('logging from on listener');

      let currentMessage =
        // [
        {
          _id: data.message_id,
          createdAt: new Date(data.when),
          text: data.message,
          user: {
            _id: data.user_id,
            name: data.user_name,
          },
        };
      // ];

      console.log(currentMessage);

      initialMessages.push(currentMessage);
      console.log(initialMessages);
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
      //   message: encryptData(input, MESSAGE_ENCRYPTION_KEY),
      message: input,
      message_id: uuid(),
      when: new Date().toISOString(),
    };
    // console.log(message);
    db.get(route.params.chatName).get(new Date().toISOString()).put(message);
    setInput('');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chat',
      //   headerBackTitleVisible: false,
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
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <KeyboardAvoidingView
        style={styles.container}
        keyboardVerticalOffset={90}>
        <>
          <ScrollView>
            {initialMessages.map(message => {
              console.log('message : ', message);
              message.user._id === user.userId ? (
                <View style={styles.receiver}>
                  <Text style={styles.receiverText}>{message.text}</Text>
                </View>
              ) : (
                <View>
                  <View style={styles.sender}>
                    <Text style={styles.senderText}>{message.text}</Text>
                  </View>
                </View>
              );
              console.log('logging : ', message);
            })}
          </ScrollView>
          <View style={styles.footer}>
            <TextInput
              value={input}
              type="text"
              onChangeText={text => setInput(text)}
              onSubmitEditing={sendMessage}
              placeholder="Input a message"
              style={styles.textInput}
            />
            <TouchableOpacity onPress={sendMessage}>
              <Text style={{color: '#2B68E6'}}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {flex: 1},

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    color: 'black',
  },
  textInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    borderColor: 'transparent',
    backgroundColor: '#ECECEC',
    padding: 10,
    color: 'grey',
    borderRadius: 30,
  },
});
