
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
    ConvertScreen = "ConvertScreen",
    LikeScreen ="LikeScreen",
}

export type RootBottomParamList = {
    [Screens.HomeScreen]: undefined;
    [Screens.DetailScreen]: undefined;
    [Screens.LikeScreen]: undefined;
    [Screens.SettingScreen]: undefined;
    [Screens.ListScreen]: undefined;
    [Screens.ConvertScreen]: undefined;

 
};

export type RootStackParamList = {
    [Screens.RootBottomNavigation]: NavigatorScreenParams<RootBottomParamList>;
    [Screens.DetailScreen]: { music: { id: number; uri: string; name: string } }; 
    HomeScreen:undefined;
    ListScreen:undefined;
    LikeScreen:undefined;
    ConvertScreen: { videoUri: string };
  };

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}


export type StackParamsType = NativeStackNavigationProp<RootStackParamList>;
