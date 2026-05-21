// ─── 共享词典 + 单词本工具 ──────────────────────────────────────────────
// 供 Reading.tsx / Library.tsx 复用

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
  return {
    id: `v-${Date.now()}`,
    word: text.trim().substring(0, 50),
    phonetic: info?.phonetic || '',
    pos: info?.pos || '',
    meaning: info?.meaning || '',
    example: info?.example || '',
    savedAt: new Date().toISOString().slice(0, 10),
    sourceBook: extra?.sourceBook,
    sourceParagraph: extra?.sourceParagraph,
  }
}

const ADJECTIVES_POS = ['adj.', 'adv.']
const NOUNS_POS = ['n.', 'pron.']
const VERBS_POS = ['v.', 'aux.']
