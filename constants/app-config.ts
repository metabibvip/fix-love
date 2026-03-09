import { clusterApiUrl } from '@solana/web3.js'
import { SolanaCluster } from '@wallet-ui/react-native-web3js'
import Constants from 'expo-constants'

type ExpoExtra = {
  deepseekApiKey?: string
  deepseekBaseUrl?: string
  deepseekModel?: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra

export class AppConfig {
  static name = 'HeartFix'
  static uri = 'https://github.com/wangkingqq/heartfix-public'
  static paymentRecipient = '11111111111111111111111111111111'
  static premiumPriceSol = 0.1
  static deepseekApiKey =
    extra.deepseekApiKey || ''
  static deepseekBaseUrl = extra.deepseekBaseUrl || 'https://api.deepseek.com'
  static deepseekModel = extra.deepseekModel || 'deepseek-chat'
  static networks: SolanaCluster[] = [
    {
      id: 'solana:mainnet',
      label: 'Mainnet',
      url: clusterApiUrl('mainnet-beta'),
    },
  ]
}
