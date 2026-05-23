// ─── Web Speech API 封装 ────────────────────────────────────────────────
// 零成本，使用浏览器原生 TTS，支持任意文本、任意语言
// 提供多音色选择，自动匹配合适的高质量音色

import { useCallback, useEffect, useRef, useState } from 'react'

export type LangCode = 'en-US' | 'en-GB' | 'zh-CN' | 'zh-TW' | 'ja-JP' | 'ko-KR'

export interface SpeechOptions {
  lang?: LangCode
  rate?: number
  pitch?: number
  volume?: number
  voiceName?: string  // 可指定具体音色名称
}

export interface VoiceItem {
  voice: SpeechSynthesisVoice
  label: string       // 用户可见名称
  lang: string        // 语言标签
  quality: 'high' | 'medium' | 'low'
}

// ─── 预定义音色偏好（按优先级排序）───────────────────────────────
// 覆盖 Chrome/Edge（Windows）/ Chrome/Edge（macOS）/ Safari / 系统默认
const ENGLISH_VOICE_PREFERENCES = [
  // Google Chrome/Edge 高质量英文
  'Google US English',          // Chrome Windows/macOS
  'Microsoft David - English (United States)',  // Windows Edge
  'Samantha',                   // macOS
  'Daniel',                      // macOS 英式
  'Karen',                       // macOS 澳式
  'Tessa',                       // 英式
  'Kate',                        // macOS 英式
  'Moira',                       // macOS 爱尔兰
  'Google UK English Female',     // Chrome
  'Google UK English Male',
  'Google US English Female',
  // Microsoft Edge (Windows)
  'Microsoft Aria Online (Natural Voice - US English)',
  'Microsoft ZiraRUS',
  // Safari
  'Alex',                        // macOS 最好用
  'Allison',
  'Ava (Enhanced)',
  'Karen (Enhanced)',
  // 通用关键词兜底
  'enhanced',
  'premium',
  'natural',
  // 最后才选系统默认
  'default',
]

const CHINESE_VOICE_PREFERENCES = [
  'Microsoft Xiaoxiao Online (Natural Voice - Chinese (Mandarin, Simplified)',
  'Microsoft Yuxi Online (Natural Voice - Chinese (Mandarin, Simplified)',
  'Microsoft HuihuiRUS',
  'Google 普通话',
  'Google Chinese (Simplified)',
  'Ting-Ting',        // macOS 中文
  'Mei-Jia',          // macOS 台湾
  'Yunyang',          // 讯飞
  'Xiaoyan',
  'Han Han',
]

// ─── 加载所有可用音色 ──────────────────────────────────────
function loadVoices(): Promise<VoiceItem[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    const voices = synth.getVoices()
    if (voices.length > 0) return resolve(buildVoiceList(voices))

    synth.addEventListener('voiceschanged', () => {
      resolve(buildVoiceList(synth.getVoices()))
    }, { once: true })

    // Safari 兜底
    setTimeout(() => resolve(buildVoiceList(synth.getVoices())), 600)
  })
}

function buildVoiceList(voices: SpeechSynthesisVoice[]): VoiceItem[] {
  return voices.map(v => ({
    voice: v,
    label: v.name.split('(')[0].trim(),
    lang: v.lang,
    quality: v.localService ? 'high' : 'medium',
  }))
}

// ─── 选择最佳音色（智能匹配）─────────────────────────────────
export function pickBestVoice(
  voiceList: VoiceItem[],
  lang: LangCode,
  preferredVoiceName?: string
): SpeechSynthesisVoice | null {
  if (!voiceList.length) return null

  // 用户手动指定音色
  if (preferredVoiceName) {
    const manual = voiceList.find(vi =>
      vi.voice.name === preferredVoiceName ||
      vi.label === preferredVoiceName
    )
    if (manual) return manual.voice
  }

  // 按语言筛选
  const langPrefix = lang.split('-')[0]
  const targets = voiceList.filter(vi =>
    vi.lang.startsWith(langPrefix)
  )
  if (!targets.length) return null

  // 根据不同语言使用不同的偏好列表
  const prefs = lang.startsWith('zh') || lang.startsWith('ja') || lang.startsWith('ko')
    ? CHINESE_VOICE_PREFERENCES
    : ENGLISH_VOICE_PREFERENCES

  // 优先级匹配
  for (const pref of prefs) {
    const match = targets.find(vi => {
      const name = vi.voice.name.toLowerCase()
      if (pref === 'enhanced') return name.includes('enhanced') || name.includes('premium')
      if (pref === 'premium') return name.includes('premium')
      if (pref === 'natural') return name.includes('natural')
      if (pref === 'default') return name.includes('default')
      return vi.voice.name === pref
    })
    if (match) return match.voice
  }

  // 最后：本地服务 > 网络，高质量优先
  const sorted = [...targets].sort((a, b) => {
    const scoreA = (a.voice.localService ? 1000 : 0) +
      (a.voice.name.includes('Enhanced') ? 100 : 0) +
      (a.voice.name.includes('Natural') ? 90 : 0) +
      (a.voice.name.includes('Google') ? 80 : 0) +
      (a.voice.name.includes('Microsoft') ? 60 : 0) +
      (a.voice.lang === lang ? 50 : 0)
    const scoreB = (b.voice.localService ? 1000 : 0) +
      (b.voice.name.includes('Enhanced') ? 100 : 0) +
      (b.voice.name.includes('Natural') ? 90 : 0) +
      (b.voice.name.includes('Google') ? 80 : 0) +
      (b.voice.name.includes('Microsoft') ? 60 : 0) +
      (b.voice.lang === lang ? 50 : 0)
    return scoreB - scoreA
  })
  return sorted[0]?.voice ?? null
}

// ─── 获取英文音色列表 ──────────────────────────────────────
export function getEnglishVoices(voiceList: VoiceItem[]): VoiceItem[] {
  return voiceList.filter(vi => vi.lang.startsWith('en'))
}

// ─── 获取中文音色列表 ──────────────────────────────────────
export function getChineseVoices(voiceList: VoiceItem[]): VoiceItem[] {
  return voiceList.filter(vi =>
    vi.lang.startsWith('zh') || vi.lang.startsWith('ja') || vi.lang.startsWith('ko')
  )
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useSpeech() {
  const [voiceList, setVoiceList] = useState<VoiceItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [currentVoiceName, setCurrentVoiceName] = useState<string>('')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    loadVoices().then((list) => {
      setVoiceList(list)
      setLoaded(true)
      // 设置默认最佳音色
      const best = pickBestVoice(list, 'en-US')
      if (best) setCurrentVoiceName(best.name)
    })

    const synth = window.speechSynthesis
    const onEnd = () => setSpeaking(false)
    const onError = () => setSpeaking(false)
    synth.addEventListener('end', onEnd)
    synth.addEventListener('error', onError)

    return () => {
      synth.removeEventListener('end', onEnd)
      synth.removeEventListener('error', onError)
      synth.cancel()
    }
  }, [])

  // ─── 朗读 ──────────────────────────────────────────────────
  const speak = useCallback((
    text: string,
    opts: SpeechOptions = {}
  ) => {
    const {
      lang = 'en-US',
      rate = 1,
      pitch = 1,
      volume = 1,
      voiceName,
    } = opts

    const synth = window.speechSynthesis
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    const targetName = voiceName || currentVoiceName
    const voice = targetName
      ? pickBestVoice(voiceList, lang, targetName)
      : pickBestVoice(voiceList, lang)
    if (voice) {
      utterance.voice = voice
      if (!currentVoiceName) setCurrentVoiceName(voice.name)
    }

    utteranceRef.current = utterance
    setSpeaking(true)
    synth.speak(utterance)
  }, [voiceList, currentVoiceName])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
  }, [])

  const speakWord = useCallback((word: string) => {
    speak(word.trim(), { lang: 'en-US', rate: 0.85 })
  }, [speak])

  const speakSentence = useCallback((sentence: string) => {
    speak(sentence.trim(), { lang: 'en-US', rate: 0.8 })
  }, [speak])

  const speakChinese = useCallback((text: string) => {
    speak(text.trim(), { lang: 'zh-CN', rate: 1 })
  }, [speak])

  // ─── 切换音色 ─────────────────────────────────────────────
  const setVoice = useCallback((name: string) => {
    setCurrentVoiceName(name)
  }, [])

  return {
    voiceList,
    englishVoices: getEnglishVoices(voiceList),
    chineseVoices: getChineseVoices(voiceList),
    loaded,
    speaking,
    currentVoiceName,
    setVoice,
    setCurrentVoiceName,
    speak,
    stop,
    pause,
    resume,
    speakWord,
    speakSentence,
    speakChinese,
  }
}

// ─── 便捷工具函数（无需 hook）────────────────────────────────
let _cachedVoices: VoiceItem[] = []
let _synthRef: SpeechSynthesis | null = null

function ensureSynth() {
  if (!_synthRef) {
    _synthRef = window.speechSynthesis
    _synthRef.addEventListener('voiceschanged', () => {
      _cachedVoices = buildVoiceList(_synthRef!.getVoices())
    })
    _cachedVoices = buildVoiceList(_synthRef.getVoices())
  }
}

export function speakText(text: string, lang: LangCode = 'en-US', rate = 1) {
  ensureSynth()
  const synth = _synthRef!
  synth.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = rate
  const voice = pickBestVoice(_cachedVoices, lang)
  if (voice) utt.voice = voice
  synth.speak(utt)
}

export function speakWord(word: string) {
  speakText(word.trim(), 'en-US', 0.85)
}

export function speakSentence(sentence: string) {
  speakText(sentence.trim(), 'en-US', 0.8)
}

export function speakChinese(text: string) {
  speakText(text.trim(), 'zh-CN', 1)
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window
}
