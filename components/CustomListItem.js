import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ListItem} from '@rneui/base';

const CustomListItem = ({chatName, enterChat}) => {
  return (
    <View>
      <ListItem onPress={() => enterChat(chatName)} bottomDivider>
        <ListItem.Content>
          <ListItem.Title style={{fontWeight: '800', fontSize: 25}}>
            {chatName}
          </ListItem.Title>
          {/* <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
            This is a test Subtitle
          </ListItem.Subtitle> */}
        </ListItem.Content>
      </ListItem>
    </View>
  );
};

export default CustomListItem;

const styles = StyleSheet.create({});
