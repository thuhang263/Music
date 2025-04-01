import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';

export async function convertVideoToAudio(videoUri: string): Promise<string | null> {
  try {
    console.log('🔹 Bắt đầu chuyển đổi video:', videoUri);

    // Kiểm tra file có tồn tại không
    const fileExists = await RNFS.exists(videoUri);
    if (!fileExists) {
      console.error('❌ Lỗi: File không tồn tại:', videoUri);
      return null;
    }

    // Định nghĩa đường dẫn lưu file (tạo tên file mới tránh trùng lặp)
    const timestamp = Date.now();
    const outputPath = `${RNFS.DocumentDirectoryPath}/converted_audio_${timestamp}.m4a`;

    // Nếu file đã tồn tại, xóa trước khi convert
    const outputExists = await RNFS.exists(outputPath);
    if (outputExists) {
      await RNFS.unlink(outputPath);
      console.log('🔄 Đã xóa file cũ:', outputPath);
    }

    // Câu lệnh FFmpeg chuyển đổi video sang AAC (m4a)
    const ffmpegCommand = `-i "${videoUri}" -vn -c:a aac -b:a 128k "${outputPath}"`;

    console.log('🛠️ Lệnh FFmpeg:', ffmpegCommand);

    // Chạy lệnh FFmpeg
    const session = await FFmpegKit.execute(ffmpegCommand);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)){
      console.log('✅ Convert thành công:', outputPath);
      return outputPath;
    } else {
      console.error('❌ Convert thất bại. Mã lỗi:', returnCode?.getValue());

      // In lỗi chi tiết từ FFmpeg logs
      const logs = await session.getLogs();
      logs.forEach(log => console.error(log.getMessage()));

      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi trong quá trình convert:', error);
    return null;
  }
}
