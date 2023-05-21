import {KeyboardAvoidingView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';

import {Image} from '@rneui/themed';
import {Button, Input} from '@rneui/base';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ASYNC_STORAGE_USER_KEY,
  PASSWORD_ENCRYPTION_KEY,
  USER_CHANNEL_NAME,
  USER_CHANNEL_USERS_ENCRYPTION_KEY,
} from '../constants';

import {useIsFocused} from '@react-navigation/native';

import Gun from 'gun/gun';
import CryptoJS from 'react-native-crypto-js';

const LoginScreen = ({navigation}) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

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
        return value;
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    getData(ASYNC_STORAGE_USER_KEY).then(stringLoggedInUser => {
      if (stringLoggedInUser != undefined) {
        const loggedInUser = JSON.parse(stringLoggedInUser);
        const currUser = {
          userId: loggedInUser['userId'],
          userName: loggedInUser.userName,
          name: loggedInUser.name,
          password: loggedInUser.password,
        };
        if (currUser.userId == undefined) {
          console.log('undefined : ', currUser);
        } else {
          console.log('not undefined : ', currUser);
          navigation.replace('Home');
        }
      }
    });
  }, [isFocused]);

  const [loginAllowed, setLoginAllowed] = useState(false);

  const signIn = () => {
    let userData;
    db.get(USER_CHANNEL_NAME)
      .map()
      .once(async (data, key) => {
        const decryptedUserData = decryptData(
          data,
          USER_CHANNEL_USERS_ENCRYPTION_KEY,
        );
        // console.log('printing : data : ', data);
        const currUser = {
          userId: decryptedUserData.userId,
          userName: decryptedUserData.userName,
          name: decryptedUserData.name,
          password: decryptedUserData.password,
        };
        // console.log(currUser);
        if (
          currUser.userName === userName &&
          decryptData(currUser.password, PASSWORD_ENCRYPTION_KEY) === password
        ) {
          console.log('Logging in user : ', currUser);
          setLoginAllowed(true);
          userData = currUser;
        }
      });
    setTimeout(() => {
      if (loginAllowed) {
        storeData(JSON.stringify(userData), ASYNC_STORAGE_USER_KEY);
        navigation.replace('Home');
      } else {
        alert('Wrong credentials provided');
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Image
        source={{
          uri: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Logo_Signal..png',
        }}
        style={{width: 200, height: 200}}
      />
      <View style={styles.inputContainer}>
        <Input
          placeholder="User Name"
          autoFocus
          type="text"
          value={userName}
          onChangeText={text => setUserName(text)}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          type="password"
          value={password}
          onChangeText={text => setPassword(text)}
        />
      </View>
      <Button containerStyle={styles.button} onPress={signIn} title="Login" />
      <Button
        onPress={() => navigation.navigate('Register')}
        containerStyle={styles.button}
        type="outline"
        title="Register"
      />
      <View style={{height: 100}} />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
