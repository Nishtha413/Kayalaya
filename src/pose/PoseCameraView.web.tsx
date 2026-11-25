import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import AppText from '../components/AppText';

type PoseCameraViewProps = {
  style?: StyleProp<ViewStyle>;
  [key: string]: unknown;
};

export function PoseCameraView({ style }: PoseCameraViewProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        style,
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#20231F',
          padding: 24,
        },
      ]}
    >
      <AppText variant="body" color={colors.text} center>
        Camera pose detection requires the Kayalaya mobile development build.
      </AppText>
    </View>
  );
}
