import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList, Screens} from './type';
import RootBottomNavigation from './RootBottomNavigation';
import DetailScreen from '../screens/DetailScreen/DetailScreen';
import ConvertScreen from '../screens/HomeScreen/ConvertScreen';


const RootStackNavigation = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <Stack.Navigator
    screenOptions={{
        headerShown:false
    }}
    >
      <Stack.Screen name={Screens.RootBottomNavigation} component={RootBottomNavigation}/>
    
      <Stack.Screen name={Screens.ConvertScreen} component={ConvertScreen} />
      <Stack.Screen name={Screens.DetailScreen} component={DetailScreen} />

    </Stack.Navigator>
  );
};

export default RootStackNavigation;