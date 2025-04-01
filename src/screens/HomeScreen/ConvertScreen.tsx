import React from 'react';
import { View, Button, StyleSheet, Alert, Platform, TouchableOpacity, Image, Linking } from 'react-native';
import Video from 'react-native-video';
import { convertVideoToAudio } from '../../utils/MusicConvert';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { PermissionsAndroid } from 'react-native';
import { Screens } from '../../navigations/type';
import { realm,Music } from '../../data/realm';

type RootStackParamList = {
  HomeScreen: undefined;
  ConvertScreen: { videoUri: string };
};

type ConvertScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ConvertScreen'>;
type ConvertScreenRouteProp = RouteProp<RootStackParamList, 'ConvertScreen'>;

interface ConvertScreenProps {
  route: ConvertScreenRouteProp;
  navigation: ConvertScreenNavigationProp;
}

// Yêu cầu quyền truy cập bộ nhớ
async function requestStoragePermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 30) {
        // Android 11+ (API 30): Quản lý bộ nhớ ngoài
        
      } else {
        // Android 10 trở xuống: Đọc và ghi bộ nhớ ngoài
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        const granted =
          permissions[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
          permissions[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;

        if (granted) {
          console.log('Quyền READ/WRITE_EXTERNAL_STORAGE đã được cấp.');
          return true;
        } else {
          console.error('Quyền READ/WRITE_EXTERNAL_STORAGE bị từ chối.');
          Alert.alert(
            'Yêu cầu quyền',
            'Ứng dụng cần quyền truy cập bộ nhớ để thực hiện chuyển đổi. Vui lòng cấp quyền trong Cài đặt.',
            [
              { text: 'Huỷ', style: 'cancel' },
              { text: 'Đi tới Cài đặt', onPress: () => Linking.openSettings() },
            ],
          );
          return false;
        }
      }
    }
    return true; // iOS không yêu cầu quyền bộ nhớ ngoài
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền:', error);
    Alert.alert('Lỗi', 'Có lỗi xảy ra khi yêu cầu quyền.');
    return false;
  }
}

export default function ConvertScreen({ route, navigation }: ConvertScreenProps) {
  const { videoUri } = route.params;

  console.log('Đường dẫn video nhận được từ route:', videoUri);

  const handleConvertVideo = async () => {
    const permissionsGranted = await requestStoragePermissions();
    if (!permissionsGranted) return;
  
    try {
      console.log('Bắt đầu xử lý đường dẫn video...');
      const audio = await convertVideoToAudio(videoUri);
  
      if (audio) {
        console.log('Convert thành công:', audio);
        
        // Lưu vào Realm
        realm.write(() => {
          realm.create('Music', {
            id: new Date().getTime(), // Đảm bảo ID là number
            name: `Converted ${new Date().toLocaleTimeString()}`, // Đặt tên file
            uri: audio, // Lưu đường dẫn file mp3 sau khi convert
          });
        });
  
        Alert.alert('Thông báo', 'Convert thành công và đã lưu vào danh sách nhạc!');
        navigation.goBack();
      } else {
        console.error('Convert thất bại.');
        Alert.alert('Lỗi', 'Convert thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi trong quá trình convert:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình chuyển đổi.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate(Screens.HomeScreen);
          }
        }}
      >
        <Image style={styles.backIcon} source={require('../../assets/images/back.png')} />
      </TouchableOpacity>

      <View style={styles.videoContainer}>
        <Video source={{ uri: videoUri }} style={styles.video} resizeMode="contain" />
        <Button title="Convert Video to MP3" onPress={handleConvertVideo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  video: {
    width: '100%',
    height: 250,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    zIndex: 10,
    padding: 5,
  },
  backIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
