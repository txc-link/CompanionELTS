// ─── 共享词典 + 单词本工具 ──────────────────────────────────────────────
// 供 Reading.tsx / Library.tsx 复用

// ─── SM-2 评分等级 ──────────────────────────────────────────────────────
export type SRSRating = 0 | 1 | 2 | 3 | 4 | 5
// 0 完全错误  1 错误但回忆后记住  2 错误但容易回忆  3 正确但困难  4 正确稍有犹豫  5 完全正确
// 简化为三档：again(0-1) hard(2-3) good(4-5)
export type SimpleRating = 'again' | 'hard' | 'good' | 'easy'

// ─── SRS 数据结构（基于 SM-2 算法）────────────────────────────────────
export interface SRSData {
  /** 复习间隔（天），初始 0 */
  interval: number
  /** 连续正确次数，初始 0 */
  repetition: number
  /** 难度因子（≥1.3），初始 2.5 */
  efactor: number
  /** 单词状态 */
  state: 'new' | 'learning' | 'review' | 'relearning'
  /** 下次复习日期（ISO字符串） */
  dueDate: string
  /** 上次复习时间 */
  lastReviewed: string
  /** 遗忘次数（评分<3的次数） */
  lapseCount: number
}

// ─── 单词本单词 ────────────────────────────────────────────────────────
export interface VocabWord {
  id: string
  word: string
  phonetic: string
  pos: string
  meaning: string
  example: string
  savedAt: string
  sourceBook?: string
  sourceParagraph?: string
  /** SM-2 复习数据 */
  srs: SRSData
}

// ─── 内置词典（雅思高频学术词汇）────────────────────────────────────────
const DICTIONARY: Record<string, { phonetic: string; pos: string; meaning: string; example: string }> = {
  artificial: { phonetic: '/ˌɑːrtɪˈfɪʃl/', pos: 'adj.', meaning: '人造的；虚假的', example: 'The artificial intelligence system can process millions of data points per second.' },
  intelligence: { phonetic: '/ɪnˈtelɪdʒəns/', pos: 'n.', meaning: '智力；情报；智能', example: 'Her intelligence and dedication made her an invaluable member of the team.' },
  employment: { phonetic: '/ɪmˈplɔɪmənt/', pos: 'n.', meaning: '就业；雇用；职业', example: 'The government introduced new policies to boost employment rates.' },
  unprecedented: { phonetic: '/ʌnˈpresɪdentɪd/', pos: 'adj.', meaning: '空前的；史无前例的', example: 'The pandemic caused unprecedented disruption.' },
  profound: { phonetic: '/prəˈfaʊnd/', pos: 'adj.', meaning: '深刻的；意义深远的', example: 'The discovery had a profound impact.' },
  innovation: { phonetic: '/ˌɪnəˈveɪʃn/', pos: 'n.', meaning: '创新；革新', example: 'Innovation is key to staying competitive.' },
  resilience: { phonetic: '/rɪˈzɪliəns/', pos: 'n.', meaning: '韧性；恢复力', example: 'The community showed remarkable resilience.' },
  autonomy: { phonetic: '/ɔːˈtɑːnəmi/', pos: 'n.', meaning: '自主权；自治', example: 'Employees value autonomy in their work.' },
  significant: { phonetic: '/sɪɡˈnɪfɪkənt/', pos: 'adj.', meaning: '显著的；重要的', example: 'There was a significant increase in enrollment.' },
  contemporary: { phonetic: '/kənˈtempəreri/', pos: 'adj.', meaning: '当代的；同时代的', example: 'Contemporary art challenges traditional notions.' },
  multifaceted: { phonetic: '/ˌmʌltiˈfæsɪtɪd/', pos: 'adj.', meaning: '多方面的', example: 'The problem requires a multifaceted approach.' },
  automation: { phonetic: '/ˌɔːtəˈmeɪʃn/', pos: 'n.', meaning: '自动化', example: 'Factory automation has increased efficiency.' },
  displacement: { phonetic: '/dɪsˈpleɪsmənt/', pos: 'n.', meaning: '取代；置换', example: 'Technological displacement of workers is a concern.' },
  productivity: { phonetic: '/ˌprɑːdʌkˈtɪvəti/', pos: 'n.', meaning: '生产力；生产率', example: 'Remote work has mixed effects on productivity.' },
  transition: { phonetic: '/trænˈzɪʃn/', pos: 'n.', meaning: '过渡；转变', example: 'The transition to renewable energy takes decades.' },
  delicate: { phonetic: '/ˈdelɪkət/', pos: 'adj.', meaning: '微妙的；精致的', example: 'Negotiations require a delicate balance.' },
  emerging: { phonetic: '/ɪˈmɜːrdʒɪŋ/', pos: 'adj.', meaning: '新兴的；出现的', example: 'Emerging markets drive global economic growth.' },
}

// ─── 查词（本地词典 + 兜底）─────────────────────────────────────────────
export function lookupWord(word: string): {
  phonetic: string
  pos: string
  meaning: string
  example: string
} | null {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '')
  if (DICTIONARY[clean]) return DICTIONARY[clean]
  // 模糊匹配
  for (const [key, val] of Object.entries(DICTIONARY)) {
    if (key.startsWith(clean) || clean.startsWith(key) || key.includes(clean)) return val
  }
  return null
}

// ─── 添加到单词本（总是成功）─────────────────────────────────────────────
export function buildVocabWord(
  text: string,
  extra?: { sourceBook?: string; sourceParagraph?: string }
): VocabWord {
  const clean = text.trim().toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)[0]
  const info = lookupWord(clean)
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    word: text.trim().substring(0, 50),
    phonetic: info?.phonetic || '',
    pos: info?.pos || '',
    meaning: info?.meaning || '',
    example: info?.example || '',
    savedAt: today,
    sourceBook: extra?.sourceBook,
    sourceParagraph: extra?.sourceParagraph,
    srs: {
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      state: 'new',
      dueDate: today, // 新词当天即可复习
      lastReviewed: '',
      lapseCount: 0,
    },
  }
}

// ─── SM-2 算法核心 ─────────────────────────────────────────────────────
// 参考 jamezmca/spaced-repetition-in-javascript + VienDinhCom/supermemo
export function ratingToGrade(rating: SimpleRating): SRSRating {
  if (rating === 'again') return 0
  if (rating === 'hard') return 3
  if (rating === 'good') return 4
  return 5 // easy
}

export function calculateSM2(
  current: SRSData,
  rating: SimpleRating
): SRSData {
  const grade = ratingToGrade(rating)
  let { interval, repetition, efactor } = current

  if (grade >= 3) {
    // 更新 efactor（SM-2 公式）
    efactor = Math.max(1.3, efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)))

    // 计算间隔
    if (repetition === 0) {
      interval = 1
    } else if (repetition === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * efactor)
    }
    repetition += 1

    // 计算下一个复习日期
    const next = new Date()
    next.setDate(next.getDate() + interval)
    const dueDate = next.toISOString().slice(0, 10)

    const newState: SRSData['state'] =
      repetition >= 3 ? 'review' : 'learning'

    return {
      interval,
      repetition,
      efactor,
      state: newState,
      dueDate,
      lastReviewed: new Date().toISOString().slice(0, 10),
      lapseCount: current.lapseCount,
    }
  } else {
    // 错误响应：重置间隔，状态变为 relearning
    efactor = Math.max(1.3, efactor - 0.2)
    const next = new Date()
    next.setDate(next.getDate() + 1) // 明天再复习
    return {
      interval: 1,
      repetition: 0,
      efactor,
      state: 'relearning',
      dueDate: next.toISOString().slice(0, 10),
      lastReviewed: new Date().toISOString().slice(0, 10),
      lapseCount: current.lapseCount + 1,
    }
  }
}

// ─── 按到期日过滤待复习单词 ──────────────────────────────────────────────
export function getDueWords(words: VocabWord[]): VocabWord[] {
  const today = new Date().toISOString().slice(0, 10)
  return words.filter((w) => w.srs.dueDate <= today)
}

// ─── 按状态分组 ─────────────────────────────────────────────────────────
export function groupByState(words: VocabWord[]) {
  return {
    new: words.filter((w) => w.srs.state === 'new'),
    learning: words.filter((w) => w.srs.state === 'learning'),
    review: words.filter((w) => w.srs.state === 'review'),
    relearning: words.filter((w) => w.srs.state === 'relearning'),
  }
}
