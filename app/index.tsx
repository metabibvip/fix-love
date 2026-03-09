import { ImageBackground, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { appStyles } from '@/constants/app-styles'
import { RelationshipFeatureIndex } from '@/features/relationship/relationship-feature-index'

export default function HomeScreen() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')

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
                style={{
                  backgroundColor: '#d35f7c',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>中文</Text>
              </Pressable>
              <Pressable
                onPress={() => setLanguage('en')}
                style={{
                  backgroundColor: '#d35f7c',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>English</Text>
              </Pressable>
            </View>
            <RelationshipFeatureIndex language={language} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  )
}
