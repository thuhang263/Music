import React, { useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Platform, TouchableOpacity, Image } from 'react-native';
import Video from 'react-native-video';
import { pickAndConvertVideo } from '../../utils/musicUtils';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { PermissionsAndroid } from 'react-native'; // Import hàm yêu cầu quyền
import { Screens } from '../../navigations/type';

// Định nghĩa kiểu cho Stack Navigator
type RootStackParamList = {
  HomeScreen: undefined;
  ConvertScreen: { videoUri: string };
};

// Định nghĩa kiểu dữ liệu cho navigation và route
type ConvertScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ConvertScreen'>;
type ConvertScreenRouteProp = RouteProp<RootStackParamList, 'ConvertScreen'>;

// Định nghĩa props của ConvertScreen
interface ConvertScreenProps {
  route: ConvertScreenRouteProp;
  navigation: ConvertScreenNavigationProp;
}

async function requestStoragePermissions(): Promise<boolean> {
  try {
    // Kiểm tra nếu hệ điều hành là Android 10 (API 29) hoặc cao hơn
    if (Platform.OS === 'android' && Platform.Version >= 29) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Quyền truy cập bộ nhớ ngoài đã được cấp.');
        return true;
      } else {
        console.error('Quyền truy cập bộ nhớ ngoài bị từ chối.');
        Alert.alert('Thông báo', 'Quyền truy cập bộ nhớ ngoài bị từ chối.');
        return false;
      }
    } else {
      // Yêu cầu quyền trên các phiên bản Android thấp hơn
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      if (
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Quyền truy cập được cấp.');
        return true;
      } else {
        console.error('Quyền truy cập bị từ chối.');
        Alert.alert('Thông báo', 'Quyền truy cập bị từ chối. Không thể thực hiện chuyển đổi.');
        return false;
      }
    }
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
    const permissionsGranted = await requestStoragePermissions(); // Kiểm tra quyền trước khi xử lý
    if (!permissionsGranted) {
      console.error('Không có quyền truy cập file.');
      return; // Dừng nếu không có quyền
    }

    try {
      console.log('Bắt đầu quá trình chuyển đổi video sang audio...');
      const audio = await pickAndConvertVideo(videoUri); // Truyền videoUri vào hàm

      if (audio) {
        console.log('Convert thành công:', audio);
        Alert.alert('Thông báo', 'Convert thành công! Quay về màn hình chính.');
        navigation.goBack(); // Quay về màn Home sau khi convert xong
      } else {
        console.error('Convert thất bại. Vui lòng kiểm tra lại.');
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
    padding: 10 
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
    marginBottom: 20 
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
