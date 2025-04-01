import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { realm, Music } from '../../data/realm';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { pickAudioFile, pickVideo } from '../../utils/musicUtils';
import { Screens } from '../../navigations/type';
import TrackPlayer from 'react-native-track-player';

export default function HomeScreen() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const musicObjects = realm.objects<Music>('Music');
    setMusicList([...musicObjects]);

    const listener = () => setMusicList([...musicObjects]);
    musicObjects.addListener(listener);

    return () => musicObjects.removeListener(listener);
  }, []);

  const handleAddMusic = async () => {
    const music = await pickAudioFile();
    if (!music) return;

    realm.write(() => {
      realm.create('Music', {
        id: music.id.toString(),
        name: music.name,
        uri: music.uri,
      });
    });

    await TrackPlayer.add({
      id: music.id.toString(),
      url: music.uri,
      title: music.name,
    });
  };

  const handlePickVideo = async () => {
    const videoUri = await pickVideo();
    if (videoUri) {
      navigation.navigate('ConvertScreen', { videoUri });
    }
  };

  const handleNavigateToDetail = (music: Music) => {
    navigation.navigate(Screens.DetailScreen, { music });
  };

  const deleteMusic = (musicId: number) => {
    realm.write(() => {
      const musicToDelete = realm.objects<Music>('Music').filtered(`id == $0`, musicId)[0];
      if (musicToDelete) {
        realm.delete(musicToDelete);
      }
    });
  
    // Cập nhật danh sách từ Realm ngay sau khi xóa
    const updatedMusicList = realm.objects<Music>('Music');
    setMusicList([...updatedMusicList]);
  };
  useFocusEffect(
    React.useCallback(() => {
      const musicObjects = realm.objects<Music>('Music');
      setMusicList([...musicObjects]);
    }, [])
  );
  return (
    <View style={styles.container}>

      <Button title="Thêm nhạc từ file" onPress={handleAddMusic} />
      <Button title="Chọn video để convert" onPress={handlePickVideo} />

      <FlatList
        data={musicList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const translateX = new Animated.Value(0);

          const panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) =>
              Math.abs(gestureState.dx) > 10,
            onPanResponderMove: (_, gesture) => {
              translateX.setValue(gesture.dx);
            },
            onPanResponderRelease: (_, gesture) => {
              if (gesture.dx < -100) {
                Animated.timing(translateX, {
                  toValue: -100,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              } else {
                Animated.timing(translateX, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              }
            },
          });

          return (
            <View style={styles.row}>
              <Animated.View
                {...panResponder.panHandlers}
                style={[styles.item, { transform: [{ translateX }] }]}
              >
                <TouchableOpacity onPress={() => handleNavigateToDetail(item)}>
                  <Text style={styles.text}>{item.name}</Text>
                  <Text style={styles.audioPath}>🎵 {item.uri}</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[styles.deleteButton, { opacity: translateX.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [1, 0],
                }),
              }]}>
                <TouchableOpacity onPress={() => deleteMusic(item.id)}>
                  <Image
                    source={require('../../assets/images/trash.png')}
                    style={styles.trashIcon}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  text: { fontSize: 16, fontWeight: 'bold' },
  audioPath: { fontSize: 14, color: 'blue', textDecorationLine: 'underline' },
  deleteButton: {
    width: 60,
    height: '100%',
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    position: 'absolute',
    right: 0,
  },
  trashIcon: { width: 24, height: 24, tintColor: 'white' },
});
