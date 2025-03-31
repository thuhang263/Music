import React, { useEffect, useState } from 'react';
import { View, Button, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import TrackPlayer from 'react-native-track-player';
import { pickAudioFile, pickVideo, pickAndConvertVideo } from '../../utils/musicUtils';
import { realm, Music } from '../../data/realm';

export default function HomeScreen() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const musicObjects = realm.objects<Music>('Music');
    const listener = () => setMusicList([...musicObjects]);

    musicObjects.addListener(listener);
    return () => musicObjects.removeListener(listener);
  }, []);

  const handleAddMusic = async () => {
    const music = await pickAudioFile();
    if (music) setMusicList([...musicList, music]);
  };

  const handlePickVideo = async () => {
    const videoUri = await pickVideo();
    if (videoUri) setSelectedVideo(videoUri);
  };

  const handleConvertVideo = async () => {
    const audio = await pickAndConvertVideo();
    if (audio) setMusicList([...musicList, audio]);
  };

  const playMusic = async (music: Music) => {
    await TrackPlayer.reset(); // Dừng bài trước nếu có
    await TrackPlayer.add({
      id: music.id.toString(),
      url: music.uri,
      title: music.name,
    });
    await TrackPlayer.play();
  };

  return (
    <View style={styles.container}>
      <Button title="Thêm nhạc từ file" onPress={handleAddMusic} />
      <Button title="Chọn video" onPress={handlePickVideo} />
      <Button title="Convert Video to MP3" onPress={handleConvertVideo} />

      {selectedVideo && (
        <Video source={{ uri: selectedVideo }} style={styles.video} controls resizeMode="contain" />
      )}

      <FlatList
        data={musicList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.name}</Text>
            <TouchableOpacity onPress={() => playMusic(item)}>
              <Text style={styles.audioPath}>🎵 {item.uri}</Text> 
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  item: { marginVertical: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
  video: { width: '100%', height: 200, marginVertical: 10 },
  text: { fontSize: 16, fontWeight: 'bold' },
  audioPath: { fontSize: 14, color: 'blue', textDecorationLine: 'underline' },
});
