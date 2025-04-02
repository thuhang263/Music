import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, PermissionsAndroid } from 'react-native';
import TrackPlayer, { Capability, useProgress } from 'react-native-track-player';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Screens, RootStackParamList } from '../../navigations/type';
import Slider from '@react-native-community/slider';
import { realm, MusicStatus } from '../../data/realm';
import SleepTimer from '../../components/SleepTimer';
type DetailScreenRouteProp = RouteProp<RootStackParamList, Screens.DetailScreen>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, Screens.DetailScreen>;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

async function requestStoragePermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      {
        title: 'Quyền truy cập nhạc',
        message: 'Ứng dụng cần quyền để phát nhạc từ bộ nhớ.',
        buttonNeutral: 'Hỏi lại sau',
        buttonNegative: 'Từ chối',
        buttonPositive: 'Đồng ý',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
}

async function setupPlayer() {
  try {
    console.log('🚀 Đang khởi tạo TrackPlayer...');
    const isSetup = await TrackPlayer.isServiceRunning();
    if (!isSetup) {
      await TrackPlayer.setupPlayer();
      console.log('✅ TrackPlayer đã sẵn sàng!');
    }
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo TrackPlayer:', error);
  }
}

export default function DetailScreen({ route, navigation }: Props) {
  const { music } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const progress = useProgress();

  useEffect(() => {
    setupPlayer();
    checkFavorite();
  }, []);

  const playPauseMusic = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    try {
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.reset();
        await TrackPlayer.add({ id: music.id.toString(), url: music.uri, title: music.name });
        await TrackPlayer.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Lỗi khi phát nhạc:', error);
    }
  };

  const toggleFavorite = () => {
    realm.write(() => {
      let status = realm.objects('MusicStatus').filtered(`musicId == ${music.id}`)[0];
  
      if (status) {
        status.favorite = !status.favorite; // Cập nhật trạng thái yêu thích
      } else {
        realm.create('MusicStatus', { 
          id: new Date().getTime(), // Tạo ID duy nhất
          musicId: music.id, 
          listenedStatus: 'UnListened', 
          favorite: true 
        });
      }
    });
    setIsFavorite(!isFavorite);
  };

  const checkFavorite = () => {
    let status = realm.objects<MusicStatus>('MusicStatus').filtered(`musicId == ${music.id}`)[0];
    setIsFavorite(status ? Boolean(status.favorite) : false);
  };
  

  const setSleepTimer = (seconds: number) => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => TrackPlayer.stop(), seconds * 1000));
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image style={styles.backIcon} source={require('../../assets/images/back.png')} />
      </TouchableOpacity>
      <Text style={styles.title}>{music.name}</Text>
      <Text style={styles.audioPath}>🎵 {music.uri}</Text>
      <Slider
        style={{ width: '80%', height: 40 }}
        minimumValue={0}
        maximumValue={progress.duration}
        value={progress.position}
        minimumTrackTintColor='#1E90FF'
        maximumTrackTintColor='#D3D3D3'
        thumbTintColor='#1E90FF'
      />
      <View style={styles.btn}>
        <TouchableOpacity style={styles.controlButton} onPress={playPauseMusic}>
          <Image style={styles.controlIcon} source={isPlaying ? require('../../assets/images/play.png') : require('../../assets/images/stop.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={toggleFavorite}>
          <Image style={styles.controlIcon} source={isFavorite ? require('../../assets/images/fill.png') : require('../../assets/images/like.png')} />
        </TouchableOpacity>
      
      </View>
      <View style={styles.clock}>
      <SleepTimer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  audioPath: { fontSize: 14, color: 'blue', textDecorationLine: 'underline', marginBottom: 20 },
  backButton: { position: 'absolute', top: 30, left: 10, padding: 5 },
  backIcon: { width: 30, height: 30, resizeMode: 'contain' },
  controlButton: { backgroundColor: '#78C93C', padding: 15, borderRadius: 50, margin: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', marginTop: 30, },
  controlIcon: { width: 24, height: 24, resizeMode: 'contain' },
  clock:{marginTop:50,}
});
