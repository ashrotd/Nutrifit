import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useAppStore } from '../stores/useAppStore'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '../constants/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOnboarded } = useAppStore()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/(auth)/login')
    } else if (!isOnboarded) {
      router.replace('/onboarding/index')
    } else {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isLoading, isOnboarded])

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bg
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/index" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}