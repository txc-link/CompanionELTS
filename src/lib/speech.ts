// ─── Web Speech API 封装 ────────────────────────────────────────────────
// 零成本，使用浏览器原生 TTS，支持任意文本、任意语言

import { useCallback, useEffect, useRef, useState } from 'react'

export type LangCode = 'en-US' | 'en-GB' | 'zh-CN' | 'zh-TW' | 'ja-JP' | 'ko-KR'

export interface SpeechOptions {
  lang?: LangCode
  rate?: number      // 语速 0.1~10，默认 1
  pitch?: number      // 音高 0~2，默认 1
  volume?: number    // 音量 0~1，默认 1
}

export interface SpeechState {
  speaking: boolean
  voices: SpeechSynthesisVoice[]
  loaded: boolean
  preferredVoice: SpeechSynthesisVoice | null
}

// ─── 获取可用语音 ────────────────────────────────────────────────────
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    const voices = synth.getVoices()
    if (voices.length > 0) return resolve(voices)

    // Chrome 需要等 voiceschanged 事件
    synth.addEventListener('voiceschanged', () => {
      resolve(synth.getVoices())
    }, { once: true })

    // Safari/其他浏览器兜底
    setTimeout(() => resolve(synth.getVoices()), 500)
  })
}

// ─── 选择最佳语音 ────────────────────────────────────────────────────
export function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: LangCode
): SpeechSynthesisVoice | null {
  if (!voices.length) return null

  // 优先级：本地服务 > 高质量 > 网络
  const targets = voices
    .filter(v => v.lang.startsWith(lang.split('-')[0]))
    .sort((a, b) => {
      const scoreA = (a.localService ? 100 : 0) + (a.name.includes('Enhanced') ? 10 : 0)
      const scoreB = (b.localService ? 100 : 0) + (b.name.includes('Enhanced') ? 10 : 0)
      return scoreB - scoreA
    })
  return targets[0] || null
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useSpeech() {
  const [state, setState] = useState<SpeechState>({
    speaking: false,
    voices: [],
    loaded: false,
    preferredVoice: null,
  })
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    loadVoices().then((voices) => {
      const preferredVoice = pickBestVoice(voices, 'en-US')
      setState({ speaking: false, voices, loaded: true, preferredVoice })
    })

    // 结束时回调
    const synth = window.speechSynthesis
    const onEnd = () => setState(s => ({ ...s, speaking: false }))
    synth.addEventListener('end', onEnd)
    synth.addEventListener('error', onEnd)

    return () => {
      synth.removeEventListener('end', onEnd)
      synth.removeEventListener('error', onEnd)
      synth.cancel()
    }
  }, [])

  // ─── 核心函数 ──────────────────────────────────────────────────
  const speak = useCallback((
    text: string,
    opts: SpeechOptions = {}
  ) => {
    const {
      lang = 'en-US',
      rate = 1,
      pitch = 1,
      volume = 1,
    } = opts

    const synth = window.speechSynthesis
    synth.cancel() // 停止之前的

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // 尝试使用最佳语音
    const bestVoice = pickBestVoice(state.voices, lang)
    if (bestVoice) utterance.voice = bestVoice

    utteranceRef.current = utterance
    setState(s => ({ ...s, speaking: true }))

    synth.speak(utterance)
  }, [state.voices])

  // 停止当前朗读
  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setState(s => ({ ...s, speaking: false }))
  }, [])

  // 暂停/继续
  const pause = useCallback(() => {
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
  }, [])

  // 朗读单词（自动选择英文）
  const speakWord = useCallback((word: string) => {
    speak(word.trim(), { lang: 'en-US', rate: 0.9 })
  }, [speak])

  // 朗读句子（英文，自动适当语速）
  const speakSentence = useCallback((sentence: string) => {
    speak(sentence.trim(), { lang: 'en-US', rate: 0.85 })
  }, [speak])

  // 朗读中文
  const speakChinese = useCallback((text: string) => {
    speak(text.trim(), { lang: 'zh-CN', rate: 1 })
  }, [speak])

  return {
    ...state,
    speak,
    stop,
    pause,
    resume,
    speakWord,
    speakSentence,
    speakChinese,
    pickBestVoice,
  }
}

// ─── 便捷工具函数（无需 hook，直接调用）─────────────────────────────
let _synth: SpeechSynthesis | null = null
let _cachedVoices: SpeechSynthesisVoice[] = []

function getSynth() {
  if (!_synth) {
    _synth = window.speechSynthesis
    _synth.addEventListener('voiceschanged', () => {
      _cachedVoices = _synth!.getVoices()
    })
    _cachedVoices = _synth.getVoices()
  }
  return _synth
}

/** 直接朗读任意文本，无需 React 上下文 */
export function speakText(text: string, lang: LangCode = 'en-US', rate = 1) {
  const synth = getSynth()
  synth.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = rate
  const voice = pickBestVoice(_cachedVoices, lang)
  if (voice) utt.voice = voice
  synth.speak(utt)
}

/** 朗读单词（英文） */
export function speakWord(word: string) {
  speakText(word.trim(), 'en-US', 0.9)
}

/** 朗读例句（英文，自动适当语速） */
export function speakSentence(sentence: string) {
  speakText(sentence.trim(), 'en-US', 0.85)
}

/** 朗读中文 */
export function speakChinese(text: string) {
  speakText(text.trim(), 'zh-CN', 1)
}

/** 检查浏览器是否支持 TTS */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window
}
