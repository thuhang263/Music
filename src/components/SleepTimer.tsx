import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import TrackPlayer from 'react-native-track-player';

const SleepTimer = () => {
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const setSleepTimer = (min: number, sec: number) => {
    const totalSeconds = min * 60 + sec;

    if (timer) clearTimeout(timer);

    setRemainingTime(totalSeconds);

    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    setTimer(
      setTimeout(() => {
        clearInterval(interval);
        TrackPlayer.stop();
        setRemainingTime(null);
      }, totalSeconds * 1000)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chọn thời gian hẹn giờ</Text>
      <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Minutes"
        value={minutes.toString()}
        onChangeText={(text) => setMinutes(parseInt(text) || 0)}
        />
        <Text>:</Text>
        <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Seconds"
        value={seconds.toString()}
        onChangeText={(text) => setSeconds(parseInt(text) || 0)}
        />

      </View>
      <TouchableOpacity style={styles.controlButton} onPress={() => setSleepTimer(minutes, seconds)}>
        <Image style={styles.controlIcon} source={require('../assets/images/clock.png')} />
      </TouchableOpacity>
      {remainingTime !== null && (
        <Text style={styles.timerText}>Tắt nhạc sau: {remainingTime}s</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center',},
  label: { fontSize: 16, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center',margin:10 },
  input: {
    width: 60,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 5,
    textAlign: 'center',
  },
  controlButton: { backgroundColor: '#78C93C', padding: 15, borderRadius: 50 },
  controlIcon: { width: 24, height: 24, resizeMode: 'contain' },
  timerText: { marginTop: 10, fontSize: 16, color: 'red' },
});

export default SleepTimer;
