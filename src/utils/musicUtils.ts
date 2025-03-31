import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import { realm, Music } from '../data/realm'; 

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

export const pickAndConvertVideo = async (): Promise<Music | null> => {
  try {
    const videoUri = await pickVideo();
    if (!videoUri) return null; // Nếu không có video, thoát luôn

    const audioPath = `${RNFS.DocumentDirectoryPath}/converted_audio.mp3`;
    const command = `-i ${videoUri} -q:a 0 -map a ${audioPath}`;
    await FFmpegKit.execute(command);

    realm.write(() => {
      const id = realm.objects<Music>('Music').length + 1;
      realm.create('Music', { id, name: 'Converted Audio', uri: `file://${audioPath}` });
    });

    return realm.objects<Music>('Music').sorted('id', true)[0]; // Lấy file vừa tạo
  } catch (error) {
    console.error('Lỗi khi convert video:', error);
    return null;
  }
};
