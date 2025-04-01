import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pickAudioFile, pickVideo } from '../../utils/musicUtils';
import { Screens } from '../../navigations/type';
import TrackPlayer from 'react-native-track-player';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleAddMusic = async () => {
    const music = await pickAudioFile();
    if (!music) return;

    await TrackPlayer.add({
      id: music.id.toString(),
      url: music.uri,
      title: music.name,
    });
  };

  const handlePickVideo = async () => {
    const videoUri = await pickVideo();
    if (videoUri) {
      navigation.navigate(Screens.ConvertScreen, { videoUri });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>🎵Music is an endless {'\n'} source of inspiration!</Text>
        <Image source={require('../../assets/images/image1.png')} style={styles.avatarImage} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonMusic} onPress={handleAddMusic}>
          <Image source={require('../../assets/images/image3.png')} style={styles.avatarImageItem} />
          <Text style={styles.buttonText}>Import Music</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonVideo} onPress={handlePickVideo}>
          <Image source={require('../../assets/images/image4.png')} style={styles.avatarImageItem} />
          <Text style={styles.buttonText}>Import Video</Text>
        </TouchableOpacity>
       
      </View>
      <View>
        <Image source={require('../../assets/images/music.png')} style={styles.imageContent} />
      </View>
    </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    top:40,
  },
  buttonVideo:{
    backgroundColor: '#5EBB1A',
    padding: 30,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
    right:20,
  },
  avatarImageItem: {
    width: 45,
    height: 52,
    alignItems: 'center',
  },
  header: {
    
    width: 360,
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#5EBB1A',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  userName: { marginLeft: 10, fontSize: 14, fontWeight: 'bold', color: '#fff',top:50, },
  avatarImage: { width: 80, height: 80, right: 20,top:40, },
  buttonMusic: {
    backgroundColor: '#5EBB1A',
    padding: 30,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
    left:20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContent:{
    width:200,
    height:200,
    left:80,
    top:70,
  }
});
