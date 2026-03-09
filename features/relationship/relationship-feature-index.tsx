import { useEffect, useMemo, useState } from 'react'
import {
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import {
  Connection,
  LAMPORTS_PER_SOL,
  ParsedInstruction,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
} from '@solana/web3.js'
import { appStyles } from '@/constants/app-styles'
import { AppConfig } from '@/constants/app-config'
import { ellipsify } from '@/utils/ellipsify'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Lang = 'zh' | 'en'

type Analysis = {
  basicText: string
  premiumText: string
}

const i18n = {
  zh: {
    sectionTitle: '关系分析与修复',
    inputLabel: '1. 输入你的关系经历（分手/冲突经过）',
    inputPlaceholder: '例如：我们经常因为沟通方式争吵，我情绪上头会冷战...',
    genBasic: '生成基础分析',
    analyzingHint: '分析需要一点时间，请耐心等待...',
    basic: '基础分析',
    sourceDeepseek: '来源：DeepSeek API',
    sourceLocal: '来源：本地兜底分析',
    premiumLocked: '高级建议（付费解锁）',
    price: '价格',
    walletCurrent: '当前钱包',
    walletPrompt: '点击下方按钮后将先触发连接钱包',
    recipient: '收款地址',
    recipientInvalid: '请先在配置里替换真实收款钱包地址',
    payUnlock: (price: string) => `支付 ${price} 并解锁`,
    unlocked: '已解锁：高级建议',
    tx: '交易签名',
    alertInputTitle: '请先输入关系经历',
    alertInputBody: '描述越具体，分析越准确。',
    alertHint: '提示',
    alertDeepseekFallback: 'DeepSeek 调用失败，已自动回退到本地分析。',
    alertDeepseekException: (e: string) => `DeepSeek 调用异常，已回退本地分析：${e}`,
    analysisOk: 'DeepSeek API 调用成功',
    analysisEmpty: 'DeepSeek 返回为空，已使用本地兜底',
    analysisErr: (e: string) => `DeepSeek 调用异常：${e}`,
    recipientConfigTitle: '请先配置收款地址',
    recipientConfigBody: '当前收款地址是默认占位值，无法发起支付。',
    payStart: '开始支付流程...',
    payConnecting: '正在连接钱包...',
    payNoAddress: '未获取到有效钱包地址',
    payConfirmingInWallet: '请在钱包确认支付...',
    payNoSignature: '钱包未返回交易签名',
    payConfirmingChain: '正在链上确认支付...',
    payValidationFailed: '链上校验失败：金额或收款地址不匹配',
    payDoneStatus: '支付成功，已解锁',
    payDoneTitle: '支付成功',
    payDoneBody: (amount: number) => `已支付 ${amount} SOL 并解锁高级建议。`,
    payFailedTitle: '支付失败',
    rpcBusy: 'RPC节点限流（429），请等待10-20秒后重试。',
    unlockStateRpcBusy: 'RPC繁忙（429），请稍后重试。',
    localBasic: (story: string) =>
      `问题诊断（基础分析）\n\n你提供的关系经历是：${story}\n\n从当前信息看，关系失败并不是单点事件，而是多个模式叠加：沟通时机错位、情绪升级后的修复动作不足、以及关系边界和预期没有被明确确认。很多情侣在冲突中会把“被理解”转化为“争输赢”，导致每次讨论都只增加防御，不增加理解。\n\n建议你先做三件基础动作：\n1) 事件复盘：按时间线写下最近3次冲突，只记录事实，不写评价。\n2) 需求澄清：把“我希望你改变”改成“我需要什么才能有安全感”。\n3) 沟通协议：约定冲突时暂停机制（例如先暂停20分钟再继续），避免升级成攻击。\n\n如果对方仍愿意沟通，关系有修复窗口；如果持续回避且无行动承诺，则要开始准备止损方案。`,
    localPremium:
      '高级建议（完整修复方案）\n\n第一阶段：止损与降温（第1-3天）\n停止高频追问、情绪化信息轰炸与翻旧账。目标不是立刻复合，而是先恢复沟通安全感。每天只允许一次低压力触达，控制在120字以内。\n\n第二阶段：重建沟通秩序（第4-7天）\n发起一次结构化对话，格式为“事实-感受-需求-行动”。避免“你总是/你从不”句式，改成“当X发生时，我感到Y，我希望Z”。提出一条可验证改变，并给7天观察窗口。\n\n第三阶段：行为证明与关系评估（第8-14天）\n不再做口头承诺，改为行为承诺。每周一次复盘：本周有哪些冲突触发点、各自是否执行约定、下周如何微调。若两周内只有表态没有行动，应判定为高风险关系循环。\n\n长期提升建议\n下一段关系优先筛选“冲突处理能力”和“边界感”，而不是单纯依赖情绪强度。',
    deepseekSystem:
      '你是关系咨询助手。仅输出 JSON，格式为 {"basicText": string, "premiumText": string}。要求：basicText 和 premiumText 都是完整长文，包含分段与可执行步骤，不要简写。',
    deepseekUserPrefix: '用户关系经历：',
  },
  en: {
    sectionTitle: 'Relationship Analysis & Repair',
    inputLabel: '1. Describe your relationship story (breakup/conflict details)',
    inputPlaceholder:
      'Example: We keep arguing about communication, and I shut down when emotions escalate...',
    genBasic: 'Generate Basic Analysis',
    analyzingHint: 'This may take a moment. Please wait...',
    basic: 'Basic Analysis',
    sourceDeepseek: 'Source: DeepSeek API',
    sourceLocal: 'Source: Local fallback',
    premiumLocked: 'Advanced Advice (Paid Unlock)',
    price: 'Price',
    walletCurrent: 'Current wallet',
    walletPrompt: 'Tap the button below to connect your wallet first',
    recipient: 'Recipient',
    recipientInvalid: 'Please configure a real recipient wallet address first',
    payUnlock: (price: string) => `Pay ${price} and Unlock`,
    unlocked: 'Unlocked: Advanced Advice',
    tx: 'Transaction Signature',
    alertInputTitle: 'Please enter your relationship story first',
    alertInputBody: 'The more specific you are, the more accurate the analysis will be.',
    alertHint: 'Notice',
    alertDeepseekFallback: 'DeepSeek failed, automatically switched to local fallback analysis.',
    alertDeepseekException: (e: string) => `DeepSeek exception, switched to local fallback: ${e}`,
    analysisOk: 'DeepSeek API call succeeded',
    analysisEmpty: 'DeepSeek returned empty content, local fallback used',
    analysisErr: (e: string) => `DeepSeek error: ${e}`,
    recipientConfigTitle: 'Please configure recipient address first',
    recipientConfigBody: 'Current recipient address is a placeholder, payment cannot start.',
    payStart: 'Starting payment flow...',
    payConnecting: 'Connecting wallet...',
    payNoAddress: 'No valid wallet address returned',
    payConfirmingInWallet: 'Please confirm payment in your wallet...',
    payNoSignature: 'Wallet did not return a transaction signature',
    payConfirmingChain: 'Confirming payment on-chain...',
    payValidationFailed: 'On-chain validation failed: amount or recipient mismatch',
    payDoneStatus: 'Payment successful, unlocked',
    payDoneTitle: 'Payment Success',
    payDoneBody: (amount: number) => `Paid ${amount} SOL and unlocked advanced advice.`,
    payFailedTitle: 'Payment Failed',
    rpcBusy: 'RPC is rate-limited (429). Please retry in 10-20 seconds.',
    unlockStateRpcBusy: 'RPC is busy (429). Please retry shortly.',
    localBasic: (story: string) =>
      `Diagnosis (Basic Analysis)\n\nYour story: ${story}\n\nFrom the current information, this relationship likely failed due to stacked patterns instead of a single event: timing mismatch in communication, weak repair behavior after emotional escalation, and unclear boundaries/expectations. In many couples, “I want to be understood” turns into “I need to win the argument,” which increases defensiveness but not understanding.\n\nStart with three actions:\n1) Event timeline: list the last 3 conflicts with facts only.\n2) Need clarity: replace “you should change” with “I need X to feel safe.”\n3) Conflict protocol: agree on a pause rule (e.g., 20 minutes) before resuming difficult talks.\n\nIf the other person is still willing to communicate, there is a repair window. If they keep avoiding and provide no behavioral commitment, begin a structured exit/stop-loss plan.`,
    localPremium:
      'Advanced Advice (Full Plan)\n\nPhase 1: Stabilize (Days 1-3)\nStop emotional flooding, repeated pressure messages, and old-score replaying. Goal: restore communication safety first, not immediate reconciliation.\n\nPhase 2: Rebuild conversation structure (Days 4-7)\nUse a structured script: facts-feelings-needs-action. Avoid blame language, ask for one measurable change with a 7-day verification window.\n\nPhase 3: Behavioral proof and evaluation (Days 8-14)\nMove from promises to observable behavior. Weekly review: triggers, execution quality, and next adjustments. If there is talk without action for 2 weeks, treat it as a high-risk loop.\n\nLong-term upgrade\nIn future relationships, prioritize conflict skills and boundary maturity over intensity alone.',
    deepseekSystem:
      'You are a relationship advisor. Output JSON only in this schema: {"basicText": string, "premiumText": string}. Both fields must be complete long-form English guidance with clear sections and actionable steps.',
    deepseekUserPrefix: 'User relationship story:',
  },
}

function resolvePublicKey(value: unknown): PublicKey | null {
  if (!value) return null
  if (value instanceof PublicKey) return value
  if (typeof value === 'string') {
    try {
      return new PublicKey(value)
    } catch {
      return null
    }
  }
  const maybe = value as { toBase58?: () => string; toString?: () => string }
  if (typeof maybe.toBase58 === 'function') {
    try {
      return new PublicKey(maybe.toBase58())
    } catch {
      return null
    }
  }
  if (typeof maybe.toString === 'function') {
    try {
      return new PublicKey(maybe.toString())
    } catch {
      return null
    }
  }
  return null
}

function isRpcRateLimitError(error: unknown): boolean {
  const text = String(error ?? '').toLowerCase()
  return text.includes('429') || text.includes('too many requests')
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRpcRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRpcRateLimitError(error) || i === retries - 1) break
      await sleep(500 * (i + 1))
    }
  }
  throw lastError
}

function buildLocalAnalysis(story: string, language: Lang): Analysis {
  const t = i18n[language]
  return {
    basicText: t.localBasic(story.trim()),
    premiumText: t.localPremium,
  }
}

function parseJsonFromContent(content: string): Analysis | null {
  try {
    const parsed = JSON.parse(content) as Partial<Analysis> & {
      issues?: string[]
      nextStep?: string
      premiumHint?: string
    }
    if (typeof parsed.basicText === 'string' && typeof parsed.premiumText === 'string') {
      return { basicText: parsed.basicText, premiumText: parsed.premiumText }
    }
    if (Array.isArray(parsed.issues) || parsed.nextStep || parsed.premiumHint) {
      return {
        basicText: `${(parsed.issues ?? []).join('\n')}\n\n${parsed.nextStep ?? ''}`.trim(),
        premiumText: parsed.premiumHint ?? '',
      }
    }
    return null
  } catch {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    try {
      const parsed = JSON.parse(content.slice(start, end + 1)) as Partial<Analysis>
      if (typeof parsed.basicText === 'string' && typeof parsed.premiumText === 'string') {
        return { basicText: parsed.basicText, premiumText: parsed.premiumText }
      }
      return null
    } catch {
      return null
    }
  }
}

function parseTextAnalysis(content: string): Analysis {
  return {
    basicText: content.trim(),
    premiumText:
      'Unlocked premium guidance includes a full 14-day plan, communication scripts, and long-term strategy.',
  }
}

async function getDeepSeekAnalysis(story: string, language: Lang): Promise<Analysis | null> {
  if (!AppConfig.deepseekApiKey) return null
  const t = i18n[language]

  const response = await fetch(`${AppConfig.deepseekBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AppConfig.deepseekApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AppConfig.deepseekModel,
      temperature: 0.3,
      messages: [
        { role: 'system', content: t.deepseekSystem },
        { role: 'user', content: `${t.deepseekUserPrefix} ${story}` },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`DeepSeek HTTP ${response.status}: ${errText.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) return null

  const jsonParsed = parseJsonFromContent(content)
  if (jsonParsed) return jsonParsed
  return parseTextAnalysis(content)
}

async function verifyPaymentBySignature(
  connection: Connection,
  signature: string,
  payer: PublicKey | null,
  recipient: PublicKey,
  minAmountLamports: number,
) {
  const tx = await withRpcRetry(() =>
    connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    }),
  )
  if (!tx || tx.meta?.err) return false

  const foundTransfer = tx.transaction.message.instructions.some((ix) => {
    if (ix.programId.toString() !== SystemProgram.programId.toString()) return false
    if (!('parsed' in ix)) return false

    const parsed = ix as ParsedInstruction
    if (parsed.parsed?.type !== 'transfer') return false

    const info = parsed.parsed.info as {
      source?: string
      destination?: string
      lamports?: number
    }

    const payerMatched = payer ? info.source === payer.toString() : true
    return (
      payerMatched &&
      info.destination === recipient.toString() &&
      (info.lamports ?? 0) >= minAmountLamports
    )
  })

  return foundTransfer
}

export function RelationshipFeatureIndex({ language }: { language: Lang }) {
  const t = i18n[language]
  const { account, connection, connect, signAndSendTransaction } = useMobileWallet()
  const payerPublicKey = resolvePublicKey(account?.address)
  const payerAddress = payerPublicKey?.toBase58() ?? null
  const [story, setStory] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [analysisSource, setAnalysisSource] = useState<'deepseek' | 'local' | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [lastSignature, setLastSignature] = useState<string | null>(null)
  const unlockStorageKey = payerAddress ? `heartfix:premium:${payerAddress}` : null

  const priceLabel = useMemo(() => `${AppConfig.premiumPriceSol} SOL`, [])
  const hasValidRecipient =
    AppConfig.paymentRecipient !== '11111111111111111111111111111111'

  useEffect(() => {
    async function loadUnlockState() {
      try {
        if (!payerPublicKey || !unlockStorageKey) {
          setIsUnlocked(false)
          setLastSignature(null)
          return
        }

        const savedSignature = await AsyncStorage.getItem(unlockStorageKey)
        if (!savedSignature) {
          setIsUnlocked(false)
          setLastSignature(null)
          return
        }

        const recipient = new PublicKey(AppConfig.paymentRecipient)
        const amountLamports = Math.round(AppConfig.premiumPriceSol * LAMPORTS_PER_SOL)
        const valid = await verifyPaymentBySignature(
          connection,
          savedSignature,
          payerPublicKey,
          recipient,
          amountLamports,
        )

        if (valid) {
          setIsUnlocked(true)
          setLastSignature(savedSignature)
        } else {
          await AsyncStorage.removeItem(unlockStorageKey)
          setIsUnlocked(false)
          setLastSignature(null)
        }
      } catch (error) {
        console.log('[payment] load unlock state failed', error)
        if (isRpcRateLimitError(error)) setPaymentStatus(t.unlockStateRpcBusy)
      }
    }

    loadUnlockState()
  }, [connection, payerPublicKey, unlockStorageKey, t.unlockStateRpcBusy])

  async function runBasicAnalysis() {
    const trimmed = story.trim()
    if (!trimmed) {
      Alert.alert(t.alertInputTitle, t.alertInputBody)
      return
    }

    setIsAnalyzing(true)
    try {
      const deepseekAnalysis = await getDeepSeekAnalysis(trimmed, language)
      if (deepseekAnalysis) {
        setAnalysis(deepseekAnalysis)
        setAnalysisSource('deepseek')
        setAnalysisStatus(t.analysisOk)
        return
      }

      setAnalysis(buildLocalAnalysis(trimmed, language))
      setAnalysisSource('local')
      setAnalysisStatus(t.analysisEmpty)
      if (AppConfig.deepseekApiKey) {
        Alert.alert(t.alertHint, t.alertDeepseekFallback)
      }
    } catch (error) {
      setAnalysis(buildLocalAnalysis(trimmed, language))
      setAnalysisSource('local')
      setAnalysisStatus(t.analysisErr(String(error)))
      Alert.alert(t.alertHint, t.alertDeepseekException(String(error)))
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function startWalletPayFlow() {
    try {
      const recipient = new PublicKey(AppConfig.paymentRecipient)
      const amount = AppConfig.premiumPriceSol
      const amountLamports = Math.round(amount * LAMPORTS_PER_SOL)
      let activePayer = payerPublicKey

      if (!activePayer) {
        setPaymentStatus(t.payConnecting)
        const connectedAccount = await connect()
        activePayer = resolvePublicKey(connectedAccount.address)
        if (!activePayer) throw new Error(t.payNoAddress)
      }

      setPaymentStatus(t.payConfirmingInWallet)
      const {
        context: { slot: minContextSlot },
        value: latestBlockhash,
      } = await withRpcRetry(() => connection.getLatestBlockhashAndContext())

      const message = new TransactionMessage({
        payerKey: activePayer,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: activePayer,
            toPubkey: recipient,
            lamports: amountLamports,
          }),
        ],
      }).compileToLegacyMessage()

      const transaction = Transaction.populate(message)
      const rawSignature = await signAndSendTransaction(transaction, minContextSlot)
      const signature = Array.isArray(rawSignature) ? rawSignature[0] : rawSignature
      if (!signature) throw new Error(t.payNoSignature)

      setPaymentStatus(t.payConfirmingChain)
      await withRpcRetry(() =>
        connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed'),
      )

      const valid = await verifyPaymentBySignature(
        connection,
        signature,
        activePayer,
        recipient,
        amountLamports,
      )
      if (!valid) throw new Error(t.payValidationFailed)

      setLastSignature(signature)
      setIsUnlocked(true)
      setPaymentStatus(t.payDoneStatus)
      if (unlockStorageKey) {
        await AsyncStorage.setItem(unlockStorageKey, signature)
      }
      Alert.alert(t.payDoneTitle, t.payDoneBody(amount))
    } catch (error) {
      if (isRpcRateLimitError(error)) {
        setPaymentStatus(t.rpcBusy)
      } else {
        setPaymentStatus(`${t.payFailedTitle}: ${String(error)}`)
      }
      Alert.alert(t.payFailedTitle, `${error}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  async function unlockPremium() {
    if (!hasValidRecipient) {
      Alert.alert(t.recipientConfigTitle, t.recipientConfigBody)
      return
    }

    setIsProcessingPayment(true)
    setPaymentStatus(t.payStart)
    await startWalletPayFlow()
  }

  return (
    <View style={appStyles.stack}>
      <Text style={appStyles.title}>{t.sectionTitle}</Text>
      <View style={appStyles.card}>
        <Text>{t.inputLabel}</Text>
        <TextInput
          multiline
          numberOfLines={5}
          placeholder={t.inputPlaceholder}
          value={story}
          onChangeText={setStory}
          style={appStyles.input}
        />
        {isAnalyzing ? (
          <View style={{ alignItems: 'center', gap: 8 }}>
            <ActivityIndicator />
            <Text>{t.analyzingHint}</Text>
          </View>
        ) : (
          <Pressable
            onPress={runBasicAnalysis}
            style={{
              backgroundColor: '#d35f7c',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t.genBasic}</Text>
          </Pressable>
        )}
      </View>

      {analysis ? (
        <View style={appStyles.card}>
          <Text style={appStyles.subtitle}>{t.basic}</Text>
          <Text style={appStyles.spacingTop} selectable>
            {analysis.basicText}
          </Text>
        </View>
      ) : null}

      <View style={appStyles.card}>
        <Text style={appStyles.subtitle}>{t.premiumLocked}</Text>
        {!hasValidRecipient ? <Text style={appStyles.warningText}>{t.recipientInvalid}</Text> : null}
        {paymentStatus ? <Text>{paymentStatus}</Text> : null}
        {isProcessingPayment ? (
          <ActivityIndicator />
        ) : (
          <Pressable
            onPress={unlockPremium}
            style={{
              backgroundColor: '#d35f7c',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t.payUnlock(priceLabel)}</Text>
          </Pressable>
        )}
      </View>

      {isUnlocked ? (
        <View style={appStyles.card}>
          <Text style={appStyles.subtitle}>{t.unlocked}</Text>
          <Text style={appStyles.spacingTop} selectable>
            {analysis?.premiumText ?? ''}
          </Text>
          {lastSignature ? <Text>{`${t.tx}: ${ellipsify(lastSignature, 12)}`}</Text> : null}
        </View>
      ) : null}
    </View>
  )
}
