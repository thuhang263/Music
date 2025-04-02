import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { onShare } from '../../utils/share';
export default function SettingScreen() {
  const [isRateAppVisible, setRateAppVisible] = useState(false); // Trạng thái mở/đóng đánh giá
  const [rating, setRating] = useState(0); // Số sao được chọn
  const [review, setReview] = useState(''); // Nội dung nhận xét

  // Hàm gửi đánh giá
  const handleRatingSubmit = () => {
    if (rating === 0 || review.trim() === '') {
      Alert.alert('Vui lòng chọn số sao và nhập nhận xét.');
      return;
    }

    Alert.alert('Cảm ơn!', `Bạn đã đánh giá ${rating} sao\nNhận xét: ${review}`);
    setRating(0);
    setReview('');
    setRateAppVisible(false); // Đóng modal
  };

  return (
    <View style={styles.container}>
      <View style={styles.layoutContainerTop}>
        <View style={styles.textContain}>
          <Text style={styles.boldText}>
            Settings{'\n'}
          </Text>
        </View>
        <Image style={styles.image} source={require('../../assets/images/playlist.png')} />
      </View>

      <View style={styles.layoutContainer}>
        {/* Nút Share App */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => onShare()} // Đảm bảo gọi hàm onShare đúng cú pháp
        >
          <Text style={styles.itemboldText}>Share App</Text>
        </TouchableOpacity>

        {/* Nút Rate App */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => setRateAppVisible(true)}
        >
          <Text style={styles.itemboldText}>Rate App</Text>
        </TouchableOpacity>

        {/* Nút Policy */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => Alert.alert('Policy', 'Xem chính sách của ứng dụng!')}
        >
          <Text style={styles.itemboldText}>Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Đánh giá App */}
      <Modal
        visible={isRateAppVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRateAppVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.ratingContainer}>
            <Text style={styles.modalTitle}>Đánh giá ứng dụng</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((index) => (
                <TouchableOpacity key={index} onPress={() => setRating(index)}>
                  <Text style={index <= rating ? styles.starSelected : styles.star}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập nhận xét của bạn..."
              value={review}
              onChangeText={setReview}
              multiline
            />
            <Button title="Gửi đánh giá" onPress={handleRatingSubmit} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  layoutContainerTop: {
    width: '100%',
    height: 150,
    padding: 24,
    backgroundColor: '#5EBB1A',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
  },
  textContain: {
    flex: 1,
  },
  image: {
    width: 90,
    height: 120,
  },
  boldText: { marginTop: 50, color: '#fff', fontSize: 23, textAlign: 'center' },
  layoutContainer: {
    alignContent: 'center',
    width: 320,
    height: 400,
    padding: 20,
    backgroundColor: '#5EBB1A',
    top: 60,
    borderColor: '#F9CADB',
    borderRadius: 25,
    marginLeft: 20,
  },
  itemContainer: {
    margin: 20,
    alignItems: 'center',
    backgroundColor: '#FF6961',
    borderRadius: 10,
    padding: 25,
  },
  itemboldText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ratingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  star: { fontSize: 30, color: '#ccc' },
  starSelected: { fontSize: 30, color: '#FFD700' },
  textInput: { height: 100, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
});
