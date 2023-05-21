import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useLayoutEffect} from 'react';

import {Button, Input} from '@rneui/base';
import {ASYNC_STORAGE_USER_SUBSCRIBED_CHAT_CHANNELS_KEY} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddChatScreen = ({navigation}) => {
  const [input, setInput] = useState('');

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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add a new chat',
      headerBackTitle: 'Chats',
    });
  }, []);

  const createChat = () => {
    if (input == undefined || input == null || input == '') {
      alert('invalid input');
      return;
    }
    getData(ASYNC_STORAGE_USER_SUBSCRIBED_CHAT_CHANNELS_KEY)
      .then(data => {
        if (data == undefined) {
          let chats = [];
          chats.push(input);
          console.log(chats);
          storeData(
            JSON.stringify(chats),
            ASYNC_STORAGE_USER_SUBSCRIBED_CHAT_CHANNELS_KEY,
          );
        } else {
          let canBeCreated = true;
          getData(ASYNC_STORAGE_USER_SUBSCRIBED_CHAT_CHANNELS_KEY)
            .then(data => {
              let chats = JSON.parse(data);
              chats.forEach(chat => {
                if (chat == input) {
                  canBeCreated = false;
                }
              });
              if (canBeCreated) {
                chats.push(input);
                storeData(
                  JSON.stringify(chats),
                  ASYNC_STORAGE_USER_SUBSCRIBED_CHAT_CHANNELS_KEY,
                );
                navigation.pop();
              } else {
                alert('Chat with this name already exists');
              }
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log('error ', err));
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Enter a chat name"
        value={input}
        onChangeText={text => setInput(text)}
      />
      <Button onPress={createChat} title="Create a new Chat" />
    </View>
  );
};

export default AddChatScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 30,
    height: ' 100%',
  },
});
