import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Image, SafeAreaView, StatusBar } from 'react-native';
import { realm, Music, MusicStatus } from '../../data/realm';
import { useNavigation } from '@react-navigation/native';
import { Screens } from '../../navigations/type';

export default function ListScreen() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [favoriteStatus, setFavoriteStatus] = useState<{ [key: number]: boolean }>({});
  const navigation = useNavigation();

  useEffect(() => {
    const musicObjects = realm.objects<Music>('Music');
    setMusicList([...musicObjects]);

    // Lấy trạng thái yêu thích của từng bài nhạc
    const statusObjects = realm.objects<MusicStatus>('MusicStatus');
    const favStatusMap: { [key: number]: boolean } = {};
    statusObjects.forEach((status) => {
      favStatusMap[status.musicId] = status.favorite;
    });
    setFavoriteStatus(favStatusMap);

    // Lắng nghe thay đổi dữ liệu
    const listener = () => {
      setMusicList([...realm.objects<Music>('Music')]);
      const updatedStatusObjects = realm.objects<MusicStatus>('MusicStatus');
      const updatedFavStatusMap: { [key: number]: boolean } = {};
      updatedStatusObjects.forEach((status) => {
        updatedFavStatusMap[status.musicId] = status.favorite;
      });
      setFavoriteStatus(updatedFavStatusMap);
    };

    musicObjects.addListener(listener);
    statusObjects.addListener(listener);

    return () => {
      musicObjects.removeListener(listener);
      statusObjects.removeListener(listener);
    };
  }, []);

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
    setMusicList([...realm.objects<Music>('Music')]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.userName}>🎵PlayList</Text>
          <Image source={require('../../assets/images/image2.png')} style={styles.avatarImage} />
        </View>
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
        <View style={styles.list}>
          <FlatList
            data={musicList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const translateX = new Animated.Value(0);

              const panResponder = PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
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
                  <Animated.View {...panResponder.panHandlers} style={[styles.item, { transform: [{ translateX }] }]}>
                    <TouchableOpacity onPress={() => handleNavigateToDetail(item)} style={styles.musicInfo}>
                      <Text style={styles.text}>{item.name}</Text>
                      <Text style={styles.audioPath}>🎵 {item.uri}</Text>
                    </TouchableOpacity>
                    <Image
                      source={
                        favoriteStatus[item.id]
                          ? require('../../assets/images/fill.png')
                          : require('../../assets/images/like.png')
                      }
                      style={styles.heartIcon}
                    />
                  </Animated.View>

                  <Animated.View
                    style={[
                      styles.deleteButton,
                      {
                        opacity: translateX.interpolate({
                          inputRange: [-100, 0],
                          outputRange: [1, 0],
                        }),
                      },
                    ]}
                  >
                    <TouchableOpacity onPress={() => deleteMusic(item.id)}>
                      <Image source={require('../../assets/images/trash.png')} style={styles.trashIcon} />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { fontSize: 16, fontWeight: 'bold' },
  audioPath: { fontSize: 12, color: 'gray' },
  list: {
    width: 330,
    top: 20,
    padding: 20,
    height: 500,
    borderColor: '#5EBB1A',
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    left: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    overflow: 'hidden',
  },
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
  header: {
    width: 360,
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#5EBB1A',
  },
  userName: { marginLeft: 30, fontSize: 20, fontWeight: 'bold', color: '#fff', top: 50 },
  avatarImage: { width: 75, height: 75, right: 20, top: 15 },
  heartIcon: { width: 24, height: 24, marginRight: 10 },
  musicInfo: { flex: 1 },
});

