import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'

// ─── Mock Posts ───────────────────────────────────────────────────────────────
const POSTS = [
  {
    id: 'p1',
    user: { name: '雅思小王子', avatar: '王', level: 15 },
    time: '2小时前',
    content: '今天终于突破写作6.5了！分享一下我的备考计划：从Task 1图表题入手，每天一篇，配合AI批改，3周搞定。',
    likes: 128,
    comments: 23,
    tags: ['写作', '经验分享'],
    image: true,
  },
  {
    id: 'p2',
    user: { name: '剑桥精英', avatar: '剑', level: 13 },
    time: '5小时前',
    content: '推荐一个超好用的雅思词汇App——用FSRS算法背单词，每天20分钟，2个月词汇量翻倍。附上我的学习记录📈',
    likes: 96,
    comments: 15,
    tags: ['词汇', '工具推荐'],
    image: false,
  },
  {
    id: 'p3',
    user: { name: '上岸烤鸭', avatar: '烤', level: 14 },
    time: '1天前',
    content: '口语Part 2终于不卡壳了！秘诀是：用「故事法」把所有话题串成一个故事，大大减少准备时间。模板已整理，需要的扣1。',
    likes: 245,
    comments: 67,
    tags: ['口语', '备考技巧'],
    image: false,
  },
]

const TAGS = ['全部', '经验分享', '工具推荐', '备考技巧', '词汇', '写作', '口语', '听力', '阅读']

// ─── Component ────────────────────────────────────────────────────────────────
export default function Square() {
  const [activeTag, setActiveTag] = useState('全部')
  const [showPostModal, setShowPostModal] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const filteredPosts = activeTag === '全部'
    ? POSTS
    : POSTS.filter((p) => p.tags.includes(activeTag))

  function toggleLike(id: string) {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{'🌐'} 学习广场</h1>
          <p className="text-sm text-text-muted mt-1">
            搭子动态 · 经验分享 · 互相激励
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowPostModal(true)}>
          + 发布动态
        </Button>
      </div>

      {/* Tag Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200',
              activeTag === tag
                ? 'bg-accent-green text-bg-primary'
                : 'text-text-secondary border border-border-subtle hover:border-accent-green/50'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Post Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-green/30 to-accent-green/10 flex items-center justify-center">
                <span className="text-sm font-bold text-accent-green">{post.user.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{post.user.name}</span>
                  <Badge variant="default" size="sm">Lv.{post.user.level}</Badge>
                </div>
                <p className="text-[10px] text-text-muted">{post.time}</p>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-text-secondary leading-relaxed mb-3">{post.content}</p>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-3">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-accent-green">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Image placeholder */}
            {post.image && (
              <div className="rounded-[10px] bg-gradient-to-br from-bg-elevated to-accent-green/10 h-40 mb-3 flex items-center justify-center">
                <span className="text-text-muted text-sm">📷 图片</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-border-subtle">
              <button
                onClick={() => toggleLike(post.id)}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-all duration-200',
                  likedPosts.has(post.id)
                    ? 'text-danger'
                    : 'text-text-muted hover:text-danger'
                )}
              >
                <span>{likedPosts.has(post.id) ? '❤️' : '🤍'}</span>
                <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-green transition-colors">
                <span>💬</span>
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-green transition-colors ml-auto">
                <span>↗️</span>
                <span>分享</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="发布动态"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted mb-1 block">分享你的学习心得…</label>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full h-32 rounded-[10px] border border-border-subtle bg-bg-secondary p-3 text-sm text-text-primary outline-none focus:border-accent-green transition-all resize-none"
              placeholder="今天学了什么？有什么心得想分享？"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowPostModal(false)}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowPostModal(false)}>
              发布
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}