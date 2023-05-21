import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AddChatScreen from './screens/AddChatScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createNativeStackNavigator();

const globalScreenOptions = {
  headerStyle: {backgroundColor: '#2C6BED'},
  headerTitleStyle: {color: 'white'},
  headerTintColor: 'white',
  headerTitleAlign: 'center',
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={globalScreenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add-Chat" component={AddChatScreen} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          initialParams={{
            chatName: 'test12',
            user: {
              userId: 'e02fbc88-b887-4b47-a701-1b43ef4d5ca3',
              userName: 'Me',
              name: 'Me',
              password: 'U2FsdGVkX1/9eSTW0Sw99uKSk6Wvv+5Fm1daCpRju6c=',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
