import {StyleSheet, View, KeyboardAvoidingView} from 'react-native';
import React, {useState, useLayoutEffect} from 'react';
import {Button, Input, Text} from '@rneui/base';

import Gun from 'gun/gun';
import CryptoJS from 'react-native-crypto-js';

import AsyncStorage from '@react-native-async-storage/async-storage';

import uuid from 'uuid-random';

import {
  ASYNC_STORAGE_USER_KEY,
  PASSWORD_ENCRYPTION_KEY,
  USER_CHANNEL_NAME,
  USER_CHANNEL_USERS_ENCRYPTION_KEY,
} from '../constants';

const RegisterScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [userName, setuserName] = useState('');
  const [password, setPassword] = useState('');

  let [peer, setPeer] = useState('http://192.168.29.55:8800');

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

  const encryptData = (data, key) => {
    const stringData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, key).toString();
  };

  const decryptData = (data, key) => {
    const bytes = CryptoJS.AES.decrypt(data, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
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
        console.log(value);
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Back to Login',
    });
  }, [navigation]);

  const register = () => {
    const userId = uuid();
    let userData = {
      userId: userId,
      userName: userName,
      name: name,
      password: encryptData(password, PASSWORD_ENCRYPTION_KEY),
    };

    let encryptedUserData = encryptData(
      userData,
      USER_CHANNEL_USERS_ENCRYPTION_KEY,
    );

    let userAlreadyCreated = false;

    db.get(USER_CHANNEL_NAME)
      .map()
      .once(async (data, key) => {
        const decryptedUserData = decryptData(
          data,
          USER_CHANNEL_USERS_ENCRYPTION_KEY,
        );
        const currUser = {
          userId: decryptedUserData.userId,
          userName: decryptedUserData.userName,
          name: decryptedUserData.name,
          password: decryptedUserData.password,
        };
        if (
          currUser.userId === userId ||
          currUser.name === userName ||
          currUser.userName === userName
        ) {
          console.log('currUser : ', currUser);
          userAlreadyCreated = true;
        }
      });

    if (userAlreadyCreated) {
      alert('user with given credentials already created');
    } else {
      db.get(USER_CHANNEL_NAME)
        .get(new Date().toISOString())
        .put(encryptedUserData);
      storeData(JSON.stringify(userData), ASYNC_STORAGE_USER_KEY);
      navigation.popToTop();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text h3 style={{marginBottom: 50, color: 'black'}}>
        Create account
      </Text>

      <View style={styles.inputContainer}>
        <Input
          placeholder="Full Name"
          autofocus
          type="text"
          value={name}
          onChangeText={text => setName(text)}
        />
        <Input
          placeholder="Username"
          autofocus
          type="text"
          value={userName}
          onChangeText={text => setuserName(text)}
        />
        <Input
          placeholder="Password"
          autofocus
          secureTextEntry
          type="password"
          value={password}
          onChangeText={text => setPassword(text)}
        />
      </View>
      <Button
        containerStyle={styles.button}
        raised
        onPress={register}
        title="Register"
      />
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  inputContainer: {
    width: 300,
  },
  button: {
    width: 200,
    marginTop: 10,
  },
});
