# Partner IELTS App 数据库架构设计文档

> 技术栈：Supabase (PostgreSQL) + pgvector
> 版本：v1.0
> 最后更新：2026-05-21

---

## 1. 概述

### 1.1 技术选型

| 组件 | 技术 | 说明 |
|------|------|------|
| 数据库 | PostgreSQL (via Supabase) | 关系型数据存储 |
| 向量检索 | pgvector 插件 | AI agent 记忆的语义搜索 |
| 认证 | Supabase Auth (auth.users) | 用户认证与授权 |
| 实时 | Supabase Realtime | 聊天对战等实时场景 |
| 存储 | Supabase Storage | 用户上传的学习材料 |
| 安全 | Row Level Security (RLS) | 行级权限控制 |

### 1.2 设计原则

- **用户数据隔离**：所有用户数据通过 RLS 策略严格隔离，用户只能访问自己的数据
- **合伙人关系**：通过 `partner_bindings` 双向绑定，两个用户互为伙伴
- **AI 记忆增强**：使用 pgvector 存储用户交互的语义嵌入，支持 AI 助手的个性化记忆检索
- **游戏化体系**：积分（Points）与花朵（Flowers）双轨经济系统
- **FSRS 间隔重复**：词汇学习基于 FSRS 算法，优化记忆保留
- **JSONB 灵活性**：评阅人数据、评价数据使用 JSONB 存储，支持结构演化

### 1.3 pgvector 说明

> pgvector 是 PostgreSQL 的向量相似度搜索扩展。在 Partner IELTS 中，我们使用 384 维的嵌入向量存储 AI agent 的记忆片段，实现语义级别的检索。

```sql
-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 2. 核心表结构

### 2.1 profiles（用户档案）

扩展 Supabase `auth.users` 的用户档案表。

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  target_band_score REAL DEFAULT 6.5,
  target_exam_date DATE,
  phone TEXT,
  level INTEGER DEFAULT 3 CHECK (level BETWEEN 1 AND 5),  -- L1~L5
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS '用户档案，关联 auth.users';
COMMENT ON COLUMN profiles.target_band_score IS '目标雅思分数 (0~9)';
COMMENT ON COLUMN profiles.level IS '用户等级 L1~L5';
```

### 2.2 partner_bindings（伙伴绑定）

用户之间的伙伴关系绑定表。

```sql
CREATE TABLE partner_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'unbound')),
  bound_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

COMMENT ON TABLE partner_bindings IS '用户之间的学习伙伴绑定关系';
COMMENT ON COLUMN partner_bindings.status IS '绑定状态: active/paused/unbound';

-- 确保 user_a < user_b 避免重复
CREATE OR REPLACE FUNCTION enforce_partner_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_a > NEW.user_b THEN
    RAISE EXCEPTION 'user_a must be less than user_b';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_partner_order
  BEFORE INSERT OR UPDATE ON partner_bindings
  FOR EACH ROW EXECUTE FUNCTION enforce_partner_order();
```

### 2.3 study_sessions（学习记录）

用户的日常学习记录。

```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('listening','reading','writing','speaking')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE study_sessions IS '用户学习记录';
COMMENT ON COLUMN study_sessions.subject IS '学科: listening/reading/writing/speaking';
```

### 2.4 writing_submissions（写作提交）

用户的写作练习提交，支持 AI 评阅和人工评阅。

```sql
CREATE TABLE writing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('task1','task2')),
  essay TEXT NOT NULL,
  examiners JSONB DEFAULT '[]'::jsonb,   -- [{name, scores: {tr,cc,lr,gra}, feedback: []}]
  final_score REAL CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 9)),
  dispute_status TEXT DEFAULT 'none' CHECK (dispute_status IN ('none','pending','resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE writing_submissions IS '写作练习提交';
COMMENT ON COLUMN writing_submissions.task_type IS 'task1=图表作文, task2=议论文';
COMMENT ON COLUMN writing_submissions.examiners IS '评阅人数组: {name, scores, feedback}';
COMMENT ON COLUMN writing_submissions.final_score IS '最终分数 (0~9)';
COMMENT ON COLUMN writing_submissions.dispute_status IS '争议状态: none/pending/resolved';
```

**examiners JSONB 结构示例**：

```json
[
  {
    "name": "小雅AI",
    "scores": {
      "tr": 6.5,
      "cc": 7.0,
      "lr": 6.0,
      "gra": 6.5
    },
    "feedback": [
      "论点展开不够充分，建议添加具体例子",
      "段落连接词使用恰当"
    ]
  }
]
```

### 2.5 speaking_sessions（口语练习）

用户的语音练习记录，支持单人、双人和 AI 对练模式。

```sql
CREATE TABLE speaking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('solo','duo','ai')),
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recording_url TEXT,
  evaluation JSONB DEFAULT NULL,   -- {fluency, pronunciation, grammar, vocabulary, scores}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE speaking_sessions IS '口语练习记录';
COMMENT ON COLUMN speaking_sessions.mode IS '练习模式: solo=单人/duo=双人/ai=AI';
COMMENT ON COLUMN speaking_sessions.recording_url IS '录音文件 URL (Supabase Storage)';
COMMENT ON COLUMN speaking_sessions.evaluation IS 'AI 评语 JSON';
```

### 2.6 vocab_progress（词汇进度 - FSRS）

基于 FSRS（Free Spaced Repetition Scheduler）算法的词汇学习进度表。

```sql
CREATE TABLE vocab_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  ease_factor REAL DEFAULT 2.5 CHECK (ease_factor >= 1.3),  -- FSRS ease multiplier
  interval INTEGER DEFAULT 0 CHECK (interval >= 0),          -- 复习间隔（天）
  due_at TIMESTAMPTZ DEFAULT NOW(),                          -- 下次复习时间
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  lapses INTEGER DEFAULT 0 CHECK (lapses >= 0),             -- 遗忘次数
  last_rating TEXT CHECK (last_rating IN ('again','hard','good','easy')),
  UNIQUE(user_id, word)
);

COMMENT ON TABLE vocab_progress IS '词汇学习进度（FSRS 间隔重复算法）';
COMMENT ON COLUMN vocab_progress.ease_factor IS '难度系数 (>=1.3)';
COMMENT ON COLUMN vocab_progress.interval IS '距下次复习的天数';
COMMENT ON COLUMN vocab_progress.lapses IS '遗忘/错误次数';
COMMENT ON COLUMN vocab_progress.last_rating IS '上次评价: again/hard/good/easy';
```

**FSRS 评分说明**：

| Rating | 含义 | 对间隔的影响 |
|--------|------|-------------|
| again | 完全忘记 | 重置为最短间隔 |
| hard | 想起但困难 | 间隔轻微增加 |
| good | 正常回忆 | 按 ease_factor 增加 |
| easy | 立即回忆 | 间隔大幅增加 |

### 2.7 chat_battles（聊天对战）

用户之间的主题聊天对战（辩论/讨论）记录。

```sql
CREATE TABLE chat_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  opponent_type TEXT DEFAULT 'ai' CHECK (opponent_type IN ('ai','partner','random')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  user_message_count INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  winner TEXT,    -- 'user_a', 'user_b', 'draw'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE chat_battles IS '聊天对战记录';
COMMENT ON COLUMN chat_battles.opponent_type IS '对手类型: ai/partner/random';
COMMENT ON COLUMN chat_battles.winner IS '胜者: user_a/user_b/draw';
```

### 2.8 points_balances & points_history（积分与花朵）

双轨经济系统的余额表和变动历史表。

```sql
CREATE TABLE points_balances (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  flowers INTEGER DEFAULT 0 CHECK (flowers >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE points_balances IS '用户积分与花朵余额';

CREATE TABLE points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('chat_message','battle_win','achievement','daily','streak_bonus')),
  points INTEGER NOT NULL,   -- 可正可负
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE points_history IS '积分变动历史';
COMMENT ON COLUMN points_history.source IS '积分来源';
COMMENT ON COLUMN points_history.points IS '变动值（正=增加，负=消耗）';

CREATE INDEX idx_points_history_user ON points_history(user_id, created_at DESC);
```

### 2.9 achievements（成就）

用户解锁的成就记录。

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_key TEXT NOT NULL,
  reward_flowers INTEGER DEFAULT 0 CHECK (reward_flowers >= 0),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

COMMENT ON TABLE achievements IS '用户成就记录';
COMMENT ON COLUMN achievements.achievement_key IS '成就标识符';
```

### 2.10 agent_memories（AI Agent 记忆）

使用 pgvector 的 AI agent 长期记忆存储。

```sql
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('learning','topic','personal','goal')),
  content TEXT NOT NULL,
  embedding VECTOR(384),           -- all-MiniLM-L6-v2 嵌入
  importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  last_referenced TIMESTAMPTZ DEFAULT NOW(),
  reference_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE agent_memories IS 'AI agent 对用户的长期记忆';
COMMENT ON COLUMN agent_memories.memory_type IS '记忆类型: learning=学习/topic=话题/personal=个人/goal=目标';
COMMENT ON COLUMN agent_memories.embedding IS '384 维语义嵌入向量';
COMMENT ON COLUMN agent_memories.importance IS '重要度 (1~10)';
```

### 2.11 agent_config（AI Agent 配置）

每个用户对 AI 助手的个性化设置。

```sql
CREATE TABLE agent_config (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  personality TEXT DEFAULT 'encouraging'
    CHECK (personality IN ('encouraging','strict','academic','friendly','custom')),
  name TEXT DEFAULT '考官小雅',
  reminder_frequency TEXT DEFAULT 'normal'
    CHECK (reminder_frequency IN ('off','low','normal','high')),
  quiet_hours_start TIME DEFAULT '23:00',
  quiet_hours_end TIME DEFAULT '09:00',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE agent_config IS 'AI 助手的个性化配置';
COMMENT ON COLUMN agent_config.personality IS '助手的性格风格';
COMMENT ON COLUMN agent_config.name IS 'AI 助手的名字';
COMMENT ON COLUMN agent_config.reminder_frequency IS '提醒频率: off/low/normal/high';
COMMENT ON COLUMN agent_config.quiet_hours_start IS '免打扰开始时间';
COMMENT ON COLUMN agent_config.quiet_hours_end IS '免打扰结束时间';
```

### 2.12 notifications（通知）

系统通知与推送记录。

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'partner_request','partner_accept','achievement','reminder',
    'battle_invite','score_update','system','daily_report'
  )),
  title TEXT NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,       -- 点击后跳转的 deep link
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE notifications IS '用户通知';
COMMENT ON COLUMN notifications.type IS '通知类型';
COMMENT ON COLUMN notifications.action_url IS '点击通知后的跳转链接';
```

### 2.13 study_materials（学习材料）

用户上传的学习材料。

```sql
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf','docx','image','audio','text')),
  ai_tags JSONB DEFAULT '[]'::jsonb,     -- AI 自动生成的标签
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE study_materials IS '用户上传的学习材料';
COMMENT ON COLUMN study_materials.file_type IS '文件类型';
COMMENT ON COLUMN study_materials.ai_tags IS 'AI 提取的标签数组';
COMMENT ON COLUMN study_materials.is_shared IS '是否允许与伙伴分享';
```

### 2.14 daily_expressions（AI 每日表达）

AI agent 学习并积累的地道英语表达。

```sql
CREATE TABLE daily_expressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,    -- 来源 (如 '剑桥真题', 'BBC', '用户对话')
  expression TEXT NOT NULL,
  meaning TEXT,
  example TEXT,
  learned_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE daily_expressions IS 'AI 积累的地道英语表达库';
COMMENT ON COLUMN daily_expressions.source IS '表达来源';
```

---

## 3. 索引设计

### 3.1 主键与唯一约束

所有表的主键已在 `CREATE TABLE` 中定义。以下为额外性能索引：

```sql
-- profiles
CREATE INDEX idx_profiles_level ON profiles(level);

-- partner_bindings
CREATE INDEX idx_partner_bindings_user_a ON partner_bindings(user_a);
CREATE INDEX idx_partner_bindings_user_b ON partner_bindings(user_b);
CREATE INDEX idx_partner_bindings_status ON partner_bindings(status);

-- study_sessions
CREATE INDEX idx_study_sessions_user_date ON study_sessions(user_id, date DESC);
CREATE INDEX idx_study_sessions_subject ON study_sessions(user_id, subject, date DESC);

-- writing_submissions
CREATE INDEX idx_writing_submissions_user ON writing_submissions(user_id, created_at DESC);
CREATE INDEX idx_writing_submissions_dispute ON writing_submissions(dispute_status)
  WHERE dispute_status != 'none';

-- speaking_sessions
CREATE INDEX idx_speaking_sessions_user ON speaking_sessions(user_id, created_at DESC);
CREATE INDEX idx_speaking_sessions_mode ON speaking_sessions(user_id, mode);

-- vocab_progress
CREATE INDEX idx_vocab_progress_due ON vocab_progress(user_id, due_at ASC)
  WHERE due_at <= NOW();
CREATE INDEX idx_vocab_progress_word ON vocab_progress(user_id, word);

-- chat_battles
CREATE INDEX idx_chat_battles_user ON chat_battles(user_id, created_at DESC);

-- agent_memories
CREATE INDEX idx_agent_memories_user_type ON agent_memories(user_id, memory_type);
CREATE INDEX idx_agent_memories_importance ON agent_memories(user_id, importance DESC);

-- 向量相似度搜索索引 (IVFFlat)
CREATE INDEX idx_agent_memories_embedding ON agent_memories
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- study_materials
CREATE INDEX idx_study_materials_user ON study_materials(user_id, created_at DESC);
CREATE INDEX idx_study_materials_type ON study_materials(user_id, file_type);
CREATE INDEX idx_study_materials_shared ON study_materials(is_shared)
  WHERE is_shared = TRUE;

-- points_history
CREATE INDEX idx_points_history_source ON points_history(user_id, source);

-- achievements
CREATE INDEX idx_achievements_user ON achievements(user_id);
```

### 3.2 索引说明

| 索引 | 策略 | 说明 |
|------|------|------|
| `idx_vocab_progress_due` | 条件索引（`WHERE due_at <= NOW()`） | 仅索引已到期的复习记录，减少索引体积 |
| `idx_writing_submissions_dispute` | 条件索引 | 仅索引有争议的提交，管理后台常用 |
| `idx_study_materials_shared` | 条件索引 | 仅索引已分享的材料，伙伴查看时使用 |
| `idx_notifications_user_read` | 复合索引 | 按用户查询未读通知是最频繁的操作 |
| `idx_agent_memories_embedding` | IVFFlat 向量索引 | pgvector 向量相似度搜索，`lists=100` 适合 1 万级数据 |
| `idx_study_sessions_user_date` | 复合索引（DESC） | 按时间倒序查看学习记录 |

---

## 4. Row Level Security (RLS) 策略

### 4.1 通用原则

- 所有表启用 RLS
- 用户只能访问自己的数据（通过 `auth.uid()` 判断）
- 伙伴关系数据：双方均可访问
- 管理员通过 `service_role` 绕过 RLS

### 4.2 RLS 策略

```sql
-- ==========================================
-- profiles
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的档案"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "用户可更新自己的档案"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "用户可以查看伙伴的档案"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partner_bindings
      WHERE status = 'active'
        AND (user_a = auth.uid() OR user_b = auth.uid())
        AND (user_a = profiles.id OR user_b = profiles.id)
    )
  );

-- ==========================================
-- partner_bindings
-- ==========================================
ALTER TABLE partner_bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的绑定"
  ON partner_bindings FOR SELECT
  USING (user_a = auth.uid() OR user_b = auth.uid());

CREATE POLICY "用户可以创建绑定（作为 user_a）"
  ON partner_bindings FOR INSERT
  WITH CHECK (user_a = auth.uid());

CREATE POLICY "用户可以更新自己的绑定"
  ON partner_bindings FOR UPDATE
  USING (user_a = auth.uid() OR user_b = auth.uid())
  WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());

-- ==========================================
-- study_sessions
-- ==========================================
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的学习记录"
  ON study_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "伙伴可查看对方的学习记录"
  ON study_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partner_bindings
      WHERE status = 'active'
        AND (user_a = auth.uid() OR user_b = auth.uid())
        AND (user_a = study_sessions.user_id OR user_b = study_sessions.user_id)
    )
  );

-- ==========================================
-- writing_submissions
-- ==========================================
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的写作提交"
  ON writing_submissions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==========================================
-- speaking_sessions
-- ==========================================
ALTER TABLE speaking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的口语记录"
  ON speaking_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "对方可查看双人对练记录"
  ON speaking_sessions FOR SELECT
  USING (
    mode = 'duo'
    AND partner_id = auth.uid()
  );

-- ==========================================
-- vocab_progress
-- ==========================================
ALTER TABLE vocab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的词汇"
  ON vocab_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==========================================
-- chat_battles
-- ==========================================
ALTER TABLE chat_battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的对战"
  ON chat_battles FOR SELECT
  USING (user_id = auth.uid() OR opponent_id = auth.uid());

CREATE POLICY "用户可创建对战"
  ON chat_battles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ==========================================
-- points_balances, points_history
-- ==========================================
ALTER TABLE points_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的积分"
  ON points_balances FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户可查看自己的积分历史"
  ON points_history FOR SELECT
  USING (user_id = auth.uid());

-- 积分变动仅允许服务端（service_role）写入
-- 用户侧不开放 INSERT/UPDATE

-- ==========================================
-- achievements
-- ==========================================
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的成就"
  ON achievements FOR SELECT
  USING (user_id = auth.uid());

-- ==========================================
-- agent_memories
-- ==========================================
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的 AI 记忆"
  ON agent_memories FOR SELECT
  USING (user_id = auth.uid());

-- 记忆读写由 AI agent（service_role）管理
-- 用户侧只读

-- ==========================================
-- agent_config
-- ==========================================
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的 AI 配置"
  ON agent_config FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==========================================
-- notifications
-- ==========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的通知"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户可标记通知为已读"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND is_read = TRUE);

-- ==========================================
-- study_materials
-- ==========================================
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的材料"
  ON study_materials FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "伙伴可查看已分享的材料"
  ON study_materials FOR SELECT
  USING (
    is_shared = TRUE
    AND EXISTS (
      SELECT 1 FROM partner_bindings
      WHERE status = 'active'
        AND (user_a = auth.uid() OR user_b = auth.uid())
        AND (user_a = study_materials.user_id OR user_b = study_materials.user_id)
    )
  );

-- ==========================================
-- daily_expressions
-- ==========================================
ALTER TABLE daily_expressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有用户可查看每日表达"
  ON daily_expressions FOR SELECT
  USING (TRUE);

-- 写入由 AI agent（service_role）管理
```

### 4.3 RLS 策略矩阵

| 表 | SELECT | INSERT | UPDATE | DELETE | 伙伴可见 |
|----|--------|--------|--------|--------|---------|
| profiles | 自己 | - | 自己 | - | 基本信息 |
| partner_bindings | 双方 | user_a | 双方 | - | - |
| study_sessions | 自己 | 自己 | 自己 | 自己 | 是 |
| writing_submissions | 自己 | 自己 | 自己 | 自己 | 否 |
| speaking_sessions | 自己 | 自己 | 自己 | 自己 | duo 模式 |
| vocab_progress | 自己 | 自己 | 自己 | 自己 | 否 |
| chat_battles | 双方 | 自己 | - | - | 是 |
| points_balances | 自己 | - | - | - | 否 |
| points_history | 自己 | - | - | - | 否 |
| achievements | 自己 | - | - | - | 否 |
| agent_memories | 自己 | - | - | - | 否 |
| agent_config | 自己 | 自己 | 自己 | 自己 | 否 |
| notifications | 自己 | - | 标记已读 | - | 否 |
| study_materials | 自己 | 自己 | 自己 | 自己 | 已分享 |
| daily_expressions | 全部 | - | - | - | - |

---

## 5. 关系图 (ER Diagram)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          auth.users                                    │
│                         (Supabase Auth)                                │
└────────┬────────────────────────────────────────────────────┬──────────┘
         │                                                    │
         │ 1:1                                               │ 1:1
         ▼                                                    ▼
┌────────────────┐                                  ┌──────────────────┐
│   profiles     │◄───────────────────────────►     │  agent_config    │
│ (用户档案)     │    partner_bindings 多对多       │ (AI 配置)        │
└───┬───┬───┬───┘                                  └──────────────────┘
    │   │   │
    │   │   │ 1:N
    │   │   ▼
    │   │  ┌───────────────────────┐
    │   │  │   study_sessions     │
    │   │  │   (学习记录)         │
    │   │  └───────────────────────┘
    │   │
    │   │ 1:N
    │   ├──►┌──────────────────────────┐
    │   │   │  writing_submissions    │
    │   │   │  (写作提交)             │
    │   │   └──────────────────────────┘
    │   │
    │   │ 1:N
    │   ├──►┌──────────────────────────┐
    │   │   │  speaking_sessions      │
    │   │   │  (口语练习)             │
    │   │   └──────────────────────────┘
    │   │
    │   │ 1:N
    │   ├──►┌──────────────────────────┐
    │   │   │  vocab_progress         │
    │   │   │  (词汇进度 - FSRS)      │
    │   │   └──────────────────────────┘
    │   │
    │   │ 1:N               ┌──────────────────┐
    │   ├──────────────────►│  chat_battles    │
    │   │                   │  (聊天对战)      │
    │   │              ┌───►│                  │
    │   │              │    └──────────────────┘
    │   │              │ opponent_id (可选)
    │   │              │
    │   │ 1:1
    │   ├──►┌──────────────────────────┐
    │   │   │  points_balances        │
    │   │   │  (积分余额)             │
    │   │   └──────────┬───────────────┘
    │   │              │ 1:N
    │   │              ▼
    │   │   ┌──────────────────────────┐
    │   │   │  points_history         │
    │   │   │  (积分记录)             │
    │   │   └──────────────────────────┘
    │   │
    │   │ 1:N
    │   ├──►┌──────────────────────────┐
    │   │   │  achievements           │
    │   │   │  (成就)                 │
    │   │   └──────────────────────────┘
    │   │
    │   │ 1:N
    │   ├──►┌──────────────────────────┐
    │   │   │  agent_memories         │
    │   │   │  (AI 记忆 - pgvector)   │
    │   │   └──────────────────────────┘
    │   │
    │   │ 1:N
    │   ├──►┌──────────────────────────┐
    │   │   │  notifications          │
    │   │   │  (通知)                 │
    │   │   └──────────────────────────┘
    │   │
    │   │ 1:N
    │   └──►┌──────────────────────────┐
    │       │  study_materials        │
    │       │  (学习材料)             │
    │       └──────────────────────────┘
    │
    │
    │   独立表：
    │   ┌──────────────────────────┐
    │   │  daily_expressions      │
    │   │  (AI 每日表达库)         │
    │   └──────────────────────────┘
    │
    │   绑定关系（多对多）：
    │   ┌──────────────────────────────────────┐
    │   │  partner_bindings                    │
    │   │  user_a ──► profiles                 │
    │   │  user_b ──► profiles                 │
    │   │  (双向绑定，互为学习伙伴)            │
    │   └──────────────────────────────────────┘
```

### 5.1 关系总结

| 关系 | 类型 | 说明 |
|------|------|------|
| profiles ↔ auth.users | 1:1 | 每个用户有且仅有一个档案 |
| profiles ↔ profiles | M:N | 通过 partner_bindings 建立伙伴关系 |
| profiles → study_sessions | 1:N | 用户有多条学习记录 |
| profiles → writing_submissions | 1:N | 用户有多篇写作提交 |
| profiles → speaking_sessions | 1:N | 用户有多条口语练习记录 |
| profiles → vocab_progress | 1:N | 用户有多个词汇学习项 |
| profiles → chat_battles | 1:N (user_id) | 用户发起多个对战 |
| profiles → chat_battles | 1:N (opponent_id) | 用户参与多个对战（对手方） |
| profiles ↔ points_balances | 1:1 | 每个用户一个积分余额 |
| profiles → points_history | 1:N | 积分变动历史 |
| profiles → achievements | 1:N | 多个成就记录 |
| profiles → agent_memories | 1:N | 多个 AI 记忆片段 |
| profiles ↔ agent_config | 1:1 | 每个用户一份 AI 配置 |
| profiles → notifications | 1:N | 多条通知 |
| profiles → study_materials | 1:N | 多个学习材料 |

---

## 6. 附录

### 6.1 迁移执行顺序

在 Supabase 中创建表时，请按以下顺序执行，以满足外键依赖：

```text
1. profiles                    (依赖 auth.users)
2. partner_bindings            (依赖 profiles)
3. agent_config                (依赖 profiles)
4. study_sessions              (依赖 profiles)
5. writing_submissions         (依赖 profiles)
6. speaking_sessions           (依赖 profiles)
7. vocab_progress              (依赖 profiles)
8. chat_battles                (依赖 profiles × 2)
9. points_balances             (依赖 profiles)
10. points_history             (依赖 profiles)
11. achievements               (依赖 profiles)
12. agent_memories             (依赖 profiles, 需先启用 pgvector)
13. notifications              (依赖 profiles)
14. study_materials            (依赖 profiles)
15. daily_expressions          (无外键依赖)
16. 索引 (表创建完成后)
17. RLS 策略 (索引创建完成后)
```

### 6.2 初始化触发器

在新用户注册时，自动创建相关记录：

```sql
-- 用户注册时自动创建档案、积分余额和 AI 配置
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', '用户' || substr(NEW.id::text, 1, 8)));

  INSERT INTO points_balances (user_id)
  VALUES (NEW.id);

  INSERT INTO agent_config (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 6.3 更新 points_balances.updated_at 触发器

```sql
CREATE OR REPLACE FUNCTION update_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_points_updated_at
  BEFORE UPDATE ON points_balances
  FOR EACH ROW EXECUTE FUNCTION update_points_updated_at();
```

---

> **文档结束**
>
> 本文档覆盖 Partner IELTS App 的全部 15 张核心数据表，包含完整的 `CREATE TABLE` SQL、索引策略、RLS 安全策略和实体关系图。适用于 Supabase 初始化迁移和后续开发参考。
