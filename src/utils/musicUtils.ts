import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import { realm, Music } from '../data/realm'; 
import { Alert, PermissionsAndroid, Platform } from 'react-native';

export const saveToRealm = (name: string, uri: string) => {
  realm.write(() => {
    const id = realm.objects<Music>('Music').length + 1;
    realm.create('Music', { id, name, uri });
  });
};

export const pickAudioFile = async (): Promise<Music | null> => {
  try {
    const result = await DocumentPicker.pickSingle({ type: DocumentPicker.types.audio });
    realm.write(() => {
      const id = realm.objects<Music>('Music').length + 1;
      realm.create('Music', { id, name: result.name, uri: result.uri });
    });

    return realm.objects<Music>('Music').sorted('id', true)[0]; // Lấy item mới nhất
  } catch (error) {
    console.error('Lỗi chọn file:', error);
    return null;
  }
};
export const pickVideo = async (): Promise<string | null> => {
  try {
    const result = await launchImageLibrary({ mediaType: 'video' });
    if (!result.assets || result.assets.length === 0 || !result.assets[0].uri) {
      return null;
    }

    return result.assets[0].uri; // Trả về đường dẫn video
  } catch (error) {
    console.error('Lỗi khi chọn video:', error);
    return null;
  }
};

export const requestStoragePermissions = async (): Promise<boolean> => {
  try {
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
};

export const pickAndConvertVideo = async (videoUri: string): Promise<Music | null> => {
  try {
    if (!videoUri) {
      console.error('Đường dẫn video không hợp lệ:', videoUri);
      return null;
    }
    console.log('Đường dẫn video:', videoUri);

    // Kiểm tra quyền truy cập bộ nhớ
    const permissionsGranted = await requestStoragePermissions();
    if (!permissionsGranted) {
      console.error('Không có quyền truy cập bộ nhớ ngoài.');
      return null;
    }

    // Đường dẫn âm thanh MP3 đầu ra
    const audioPath = `${RNFS.DocumentDirectoryPath}/converted_audio.mp3`;

    // Nếu videoUri là content:// (trên Android), bạn có thể cần phải chuyển đổi nó
    const isContentUri = videoUri.startsWith('content://');
    const filePath = isContentUri ? await RNFS.copyAssetsFileIOS(videoUri, RNFS.DocumentDirectoryPath + '/temp_video.mp4', 0, 0) : videoUri;

    // Cấu hình lệnh FFmpeg để chuyển đổi video sang audio MP3
    const command = `-i "${filePath}" -vn -ar 44100 -ac 2 -b:a 192k -f mp3 "${audioPath}"`;
    console.log('Lệnh FFmpeg:', command);

    // Thực thi lệnh FFmpeg
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (returnCode === 0) {
      console.log('Convert video sang audio thành công. File audio tại:', audioPath);
      // Ghi dữ liệu vào Realm
      realm.write(() => {
        const id = realm.objects<Music>('Music').length + 1;
        realm.create('Music', { id, name: 'Converted Audio', uri: `file://${audioPath}` });
      });
      const newMusic = realm.objects<Music>('Music').sorted('id', true)[0];
      console.log('Đối tượng nhạc được tạo:', newMusic);
      return newMusic;
    } else {
      console.error('Lỗi khi thực thi FFmpeg, mã lỗi:', returnCode);
      return null;
    }
  } catch (error) {
    console.error('Lỗi xảy ra khi chuyển đổi video sang audio:', error);
    return null;
  }
};

