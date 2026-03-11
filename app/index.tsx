import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { appStyles } from '@/constants/app-styles'
import { RelationshipFeatureIndex } from '@/features/relationship/relationship-feature-index'

export default function HomeScreen() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const { account, connect } = useMobileWallet()
  const hasWalletConnection = useMemo(() => Boolean(account?.address), [account?.address])

  async function handleConnectWallet() {
    if (hasWalletConnection || isConnectingWallet) return

    setIsConnectingWallet(true)
    try {
      await connect()
    } catch (error) {
      console.log('[wallet] initial connect failed', error)
    } finally {
      setIsConnectingWallet(false)
    }
  }

  return (
    <ImageBackground
      source={require('../assets/images/love.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.18)' }}>
        <SafeAreaView style={appStyles.screen}>
          <ScrollView contentContainerStyle={appStyles.stack}>
            <View>
              <Text style={appStyles.title}>
                {language === 'en' ? 'Relationship Repair Assistant' : '关系修复助手'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => setLanguage('zh')}
                style={styles.roseButton}
              >
                <Text style={styles.roseButtonText}>中文</Text>
              </Pressable>
              <Pressable
                onPress={() => setLanguage('en')}
                style={styles.roseButton}
              >
                <Text style={styles.roseButtonText}>English</Text>
              </Pressable>
            </View>
            <RelationshipFeatureIndex language={language} />
          </ScrollView>
        </SafeAreaView>

        {!hasWalletConnection ? (
          <View style={styles.gateOverlay}>
            <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFillObject} />
            <View style={styles.gateCard}>
              <Text style={styles.gateTitle}>Connect Wallet</Text>
              <Text style={styles.gateSubtitle}>
                连接钱包后进入主界面
              </Text>
              <Text style={styles.gateCaption}>
                Connect your wallet to continue.
              </Text>
              <Pressable onPress={handleConnectWallet} style={styles.gateButton}>
                {isConnectingWallet ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.gateButtonText}>Connect Wallet</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  gateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  gateCard: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    gap: 10,
  },
  gateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(32,24,24,0.92)',
  },
  gateSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(32,24,24,0.86)',
  },
  gateCaption: {
    fontSize: 14,
    color: 'rgba(32,24,24,0.72)',
    marginBottom: 6,
  },
  gateButton: {
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#d35f7c',
  },
  gateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  roseButton: {
    backgroundColor: '#d35f7c',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  roseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
})
