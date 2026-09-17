import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import SurveyScreen from '../screens/SurveyScreen';
import MainTabs from './MainTabs';
import PosePracticeScreen from '../screens/PosePracticeScreen';
import DayCompletionScreen from '../screens/DayCompletionScreen';
import AssessmentIntroScreen from '../screens/AssessmentIntroScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import AssessmentResultScreen from '../screens/AssessmentResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Survey" component={SurveyScreen} />
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ animation: 'simple_push' }}
      />
      <Stack.Screen name="PosePractice" component={PosePracticeScreen} />
      <Stack.Screen name="DayComplete" component={DayCompletionScreen} />
      <Stack.Screen name="AssessmentIntro" component={AssessmentIntroScreen} />
      <Stack.Screen name="Assessment" component={AssessmentScreen} />
      <Stack.Screen name="AssessmentResult" component={AssessmentResultScreen} />
    </Stack.Navigator>
  );
}
