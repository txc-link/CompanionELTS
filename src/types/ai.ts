export interface AISuggestion {
  id: string
  type: 'motivation' | 'tip' | 'warning' | 'insight'
  message: string
  createdAt: string
  isRead: boolean
}

export interface AIFeedback {
  score: number
  strengths: string[]
  improvements: string[]
  suggestion: string
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  context: string
  createdAt: string
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
