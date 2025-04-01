import { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, PermissionsAndroid } from 'react-native';
import TrackPlayer, { Capability } from 'react-native-track-player';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Screens, RootStackParamList } from '../../navigations/type';

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
        title: "Quyền truy cập nhạc",
        message: "Ứng dụng cần quyền để phát nhạc từ bộ nhớ.",
        buttonNeutral: "Hỏi lại sau",
        buttonNegative: "Từ chối",
        buttonPositive: "Đồng ý",
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
    console.log("🚀 Đang khởi tạo TrackPlayer...");
    
    const isSetup = await TrackPlayer.isServiceRunning();
    if (!isSetup) {
      await TrackPlayer.setupPlayer();
      console.log("✅ TrackPlayer đã sẵn sàng!");
    } else {
      console.log("🔄 TrackPlayer đã được khởi tạo trước đó.");
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
    console.error("❌ Lỗi khi khởi tạo TrackPlayer:", error);
  }
}


export default function DetailScreen({ route, navigation }: Props) {
  const { music } = route.params;

  useEffect(() => {
    setupPlayer();
  }, []);

  const playMusic = async () => {
    console.log("🔄 Bắt đầu phát nhạc...");
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      console.log("🚫 Không có quyền truy cập nhạc.");
      return;
    }

    try {
      await TrackPlayer.reset();
      console.log("✅ Đã reset TrackPlayer");

      await TrackPlayer.add({
        id: music.id.toString(),
        url: music.uri,
        title: music.name,
      });

      console.log("🎵 Đã thêm bài hát:", music.name);
      console.log("📜 Hàng đợi:", await TrackPlayer.getQueue());

      await TrackPlayer.play();
      console.log("▶️ Nhạc đang phát...");

      const state = await TrackPlayer.getState();
      console.log("📊 Trạng thái TrackPlayer:", state);
    } catch (error) {
      console.error("❌ Lỗi khi phát nhạc:", error);
    }
  };
  const stopMusic = async () => {
    await TrackPlayer.stop();
    console.log("🔴 Dừng phát nhạc");
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

      <Text style={styles.title}>{music.name}</Text>
      <Text style={styles.audioPath}>🎵 {music.uri}</Text>
      <View style={styles.btn}>
        <TouchableOpacity
          style={styles.buttonPlay}
          onPress={playMusic} 
        >
          <Text style={styles.buttonText}>Phát nhạc</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonStop, styles.marginTop]} 
          onPress={stopMusic}
        >
          <Text style={styles.buttonText}>Dừng nhạc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  audioPath: { fontSize: 14, color: 'blue', textDecorationLine: 'underline', marginBottom: 20 },
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
  button: {
    backgroundColor: '#78C93C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  marginTop: {
    marginTop: 20, // Cách nút "Dừng nhạc" cách xa nút "Phát nhạc"
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btn:{
    flexDirection: 'row',  // Đặt các nút nằm ngang
    justifyContent: 'center',  // Căn giữa các nút theo chiều ngang
    alignItems: 'center',  // Căn giữa các nút theo chiều dọc
    padding: 20,
  },
  buttonPlay:{
    backgroundColor: '#78C93C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonStop:{
    backgroundColor: '#78C93C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft:20,
    marginBottom:20,
  }
});
