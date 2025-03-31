import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RootBottomParamList, Screens} from './type';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ListScreen from '../screens/ListScreen/ListScreen';
import SettingScreen from '../screens/SettingScreen/SettingScreen';
import {Image} from 'react-native';
import {Dimensions} from 'react-native';
const {width} = Dimensions.get('window');
const isTablet = width >= 768;
const RootBottomNavigation = () => {
  const Tab = createBottomTabNavigator<RootBottomParamList>();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarStyle: {backgroundColor: '#fff', paddingTop: 5},
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: 75,
          height: 75,
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: 5,
        },
        tabBarIcon: ({focused}) => {
          let imageSource;

          if (route.name === Screens.HomeScreen) {
            imageSource = require('../assets/images/home.png');
          } else if (route.name === Screens.ListScreen) {
            imageSource = require('../assets/images/list.png');
          } else if (route.name === Screens.SettingScreen) {
            imageSource = require('../assets/images/setting.png');
          }

          return (
            <Image
              source={imageSource}
              style={{
                width: isTablet ? 24 * 1.5 : 24,
                height: isTablet ? 24 * 1.5 : 24,
                tintColor: focused ? '#008000' : '#558B71',
                opacity: focused ? 1 : 0.16,
              }}
            />
          );
        },
      })}>
      <Tab.Screen
        name={Screens.HomeScreen}
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name={Screens.ListScreen}
        component={ListScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name={Screens.SettingScreen}
        component={SettingScreen}
        options={{headerShown: false}}
      />
      
    </Tab.Navigator>
  );
};

export default RootBottomNavigation;