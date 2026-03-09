import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AppProviders } from '@/components/app-providers'
import { LogBox } from 'react-native'

LogBox.ignoreLogs([
  'Server responded with 429',
  'Too many requests for a specific RPC call',
])

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </AppProviders>
  )
}
