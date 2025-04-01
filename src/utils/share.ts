import { Share } from 'react-native';

export const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'share movie now',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('share:', result.activityType);
        } else {
          console.log('share successful!');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('cancel');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
