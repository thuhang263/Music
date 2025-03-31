
import {NavigatorScreenParams} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';


export enum Screens {
    HomeScreen = 'HomeScreen',
    ListScreen = 'ListScreen',
    SearchScreen ='SearchScreen',
    DetailScreen = 'DetailScreen',
    TestScreen ='TestScreen',
    RootBottomNavigation = 'RootBottomNavigation',
    SettingScreen = "SettingScreen",
    
}

export type RootBottomParamList = {
    [Screens.HomeScreen]: undefined;
    [Screens.DetailScreen]: undefined;
    [Screens.SettingScreen]: undefined;
    [Screens.ListScreen]: undefined;
 
 
};

export type RootStackParamList = {
    [Screens.RootBottomNavigation]: NavigatorScreenParams<RootBottomParamList>;
    [Screens.DetailScreen]: { movieId: number };
    HomeScreen:undefined;
    ListScreen:undefined;
   
  };

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}


export type StackParamsType = NativeStackNavigationProp<RootStackParamList>;
