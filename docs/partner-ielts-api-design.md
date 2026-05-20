# Partner IELTS API 设计文档

> 版本：v1.0  
> 最后更新：2026-05-21  
> 基础路径：`/api/v1`

---

## 1. API 总览

### 1.1 基本信息

| 项目 | 说明 |
|------|------|
| 基础 URL | `https://api.partner-ielts.com/api/v1` |
| 协议 | HTTPS |
| 数据格式 | JSON (application/json) |
| 字符编码 | UTF-8 |

### 1.2 认证方式

所有需要认证的接口使用 **Supabase JWT Bearer Token** 进行鉴权。

```
Authorization: Bearer <supabase_jwt_token>
```

### 1.3 响应信封格式

所有 API 响应使用统一的数据信封封装。

**成功响应：**

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  timestamp: string; // ISO 8601
}
```

**错误响应：**

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;          // 错误码，如 "INVALID_INPUT"
    message: string;       // 人类可读的错误描述
    details?: unknown;     // 详细错误信息（可选）
  };
  timestamp: string;       // ISO 8601
}
```

**错误码表：**

| HTTP 状态码 | error.code | 说明 |
|-------------|------------|------|
| 400 | `INVALID_INPUT` | 请求参数校验失败 |
| 400 | `MISSING_FIELD` | 缺少必填字段 |
| 401 | `UNAUTHORIZED` | 未提供或 Token 无效 |
| 401 | `TOKEN_EXPIRED` | Token 已过期 |
| 403 | `FORBIDDEN` | 无权限访问 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 409 | `CONFLICT` | 资源冲突（如重复绑定） |
| 429 | `RATE_LIMITED` | 请求频率超限 |
| 500 | `INTERNAL_ERROR` | 服务器内部错误 |
| 503 | `SERVICE_UNAVAILABLE` | 服务暂不可用 |

### 1.4 速率限制

| 用户类型 | 限制 | 窗口 |
|----------|------|------|
| 已认证用户 | 100 次/分钟 | 滑动窗口 |
| 匿名用户 | 30 次/分钟 | 滑动窗口 |

超出限制时返回 429，响应头包含限流信息：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1687298400
```

### 1.5 版本管理

采用 URL 路径版本化策略：`/api/v1/`。  
当出现不兼容的破坏性变更时，提升至 `/api/v2/`。

---

## 2. 认证 API

### 2.1 注册账号

```
POST /auth/register
```

**描述：** 使用邮箱和密码注册新用户。

**是否需要认证：** 否

**Request Body：**

```typescript
interface RegisterRequest {
  email: string;          // 邮箱地址，必填
  password: string;       // 密码，8-32 位，必填
  nickname: string;       // 昵称，2-20 字符，必填
  avatar_url?: string;    // 头像 URL，可选
}
```

**Response (201 Created)：**

```typescript
interface RegisterResponse {
  user: {
    id: string;           // UUID
    email: string;
    nickname: string;
    avatar_url: string | null;
    created_at: string;   // ISO 8601
  };
  access_token: string;   // JWT
  refresh_token: string;
  expires_at: string;     // ISO 8601
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 201 | 注册成功 |
| 400 | `INVALID_INPUT` — 邮箱格式错误/密码不符合要求 |
| 409 | `CONFLICT` — 邮箱已被注册 |

---

### 2.2 登录

```
POST /auth/login
```

**描述：** 使用邮箱和密码登录。

**是否需要认证：** 否

**Request Body：**

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response (200 OK)：**

```typescript
interface LoginResponse {
  user: {
    id: string;
    email: string;
    nickname: string;
    avatar_url: string | null;
    partner_id: string | null; // 绑定的学习伙伴用户 ID
    created_at: string;
  };
  access_token: string;
  refresh_token: string;
  expires_at: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 登录成功 |
| 401 | `UNAUTHORIZED` — 邮箱或密码错误 |

---

### 2.3 绑定学习伙伴

```
POST /auth/partner-bind
```

**描述：** 通过伙伴邮箱绑定学习伙伴。双方互绑后关系正式建立。

**是否需要认证：** 是

**Request Body：**

```typescript
interface PartnerBindRequest {
  partner_email: string;  // 要绑定的伙伴邮箱
}
```

**Response (200 OK)：**

```typescript
interface PartnerBindResponse {
  status: "pending" | "matched";
  partner: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  } | null;
  message: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 绑定成功/等待对方确认 |
| 400 | `INVALID_INPUT` — 无法绑定自己 |
| 404 | `NOT_FOUND` — 伙伴邮箱未注册 |
| 409 | `CONFLICT` — 已绑定伙伴 |

---

### 2.4 解除伙伴绑定

```
POST /auth/partner-unbind
```

**描述：** 解除与当前学习伙伴的绑定关系。

**是否需要认证：** 是

**Request Body：**

```typescript
interface PartnerUnbindRequest {
  // 无额外参数，直接基于当前用户操作
}
```

**Response (200 OK)：**

```typescript
interface PartnerUnbindResponse {
  message: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 解绑成功 |
| 400 | `INVALID_INPUT` — 当前没有绑定伙伴 |

---

## 3. 学习记录 API

### 3.1 查询学习记录列表

```
GET /study/sessions?date=2026-05-21&user_id=xxx
```

**描述：** 按日期和用户查询学习记录列表。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface StudySessionsQuery {
  date?: string;           // 日期，格式 YYYY-MM-DD，可选
  start_date?: string;     // 开始日期，可选
  end_date?: string;       // 结束日期，可选
  user_id?: string;        // 用户 UUID，可选（不传则查当前用户）
  type?: "writing" | "speaking" | "vocabulary" | "chat"; // 学习类型筛选
  page?: number;           // 页码，默认 1
  page_size?: number;      // 每页条数，默认 20，最大 100
}
```

**Response (200 OK)：**

```typescript
interface StudySession {
  id: string;
  user_id: string;
  type: "writing" | "speaking" | "vocabulary" | "chat";
  duration_seconds: number;
  started_at: string;      // ISO 8601
  ended_at: string;        // ISO 8601
  metadata?: {
    // 各类型自有元数据
    word_count?: number;
    score?: number;
    topic?: string;
  };
}

type StudySessionsResponse = ApiResponse<StudySession[]>;
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 401 | `UNAUTHORIZED` |

---

### 3.2 创建学习记录（计时结束）

```
POST /study/sessions
```

**描述：** 学习完成时停止计时并创建一条学习记录。

**是否需要认证：** 是

**Request Body：**

```typescript
interface CreateStudySessionRequest {
  type: "writing" | "speaking" | "vocabulary" | "chat";
  duration_seconds: number;   // 学习时长（秒）
  started_at: string;         // 开始时间 ISO 8601
  metadata?: {
    word_count?: number;
    score?: number;
    topic?: string;
    session_ref_id?: string;  // 关联的写作/口语等子记录 ID
  };
}
```

**Response (201 Created)：**

```typescript
interface CreateStudySessionResponse {
  id: string;
  user_id: string;
  type: string;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 201 | 创建成功 |
| 400 | `INVALID_INPUT` — 参数校验失败 |

---

### 3.3 开始计时

```
POST /study/sessions/start
```

**描述：** 开始一次学习计时，返回 session ID 用于后续结束。

**是否需要认证：** 是

**Request Body：**

```typescript
interface StartSessionRequest {
  type: "writing" | "speaking" | "vocabulary" | "chat";
  topic?: string;         // 学习主题（可选）
}
```

**Response (201 Created)：**

```typescript
interface StartSessionResponse {
  id: string;             // session ID，用于结束计时
  started_at: string;     // ISO 8601
  type: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 201 | 开始计时成功 |
| 400 | `INVALID_INPUT` |

---

### 3.4 查询连续学习天数

```
GET /study/streak/:user_id
```

**描述：** 获取用户的连续学习天数（Streak）。

**是否需要认证：** 是

**Path Parameters：**

```
user_id: string — 用户 UUID
```

**Response (200 OK)：**

```typescript
interface StreakResponse {
  user_id: string;
  current_streak: number;       // 当前连续学习天数
  longest_streak: number;       // 历史最长连续天数
  last_study_date: string;      // 最近学习日期 YYYY-MM-DD
  is_today_studied: boolean;    // 今天是否已学习
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 404 | `NOT_FOUND` — 用户不存在 |

---

### 3.5 查询月度学习日历

```
GET /study/calendar?month=5&year=2026
```

**描述：** 获取指定月份的学习日历数据，用于展示打卡日历。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface CalendarQuery {
  month: number;    // 月份 1-12
  year: number;     // 年份，如 2026
  user_id?: string; // 可选，不传则查当前用户
}
```

**Response (200 OK)：**

```typescript
interface DayStudyData {
  date: string;               // YYYY-MM-DD
  is_studied: boolean;
  total_minutes: number;      // 学习总分钟数
  session_count: number;      // 学习次数
  types: string[];            // 学习类型列表
}

interface CalendarResponse {
  year: number;
  month: number;
  days: DayStudyData[];
  total_study_days: number;
  total_minutes: number;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 400 | `INVALID_INPUT` — 月份/年份格式错误 |

---

## 4. 写作 API

### 4.1 提交作文批改

```
POST /writing/submit
```

**描述：** 提交作文进行 AI 批改评分。

**是否需要认证：** 是

**Request Body：**

```typescript
interface WritingSubmitRequest {
  content: string;              // 作文正文，100-500 单词
  topic: string;                // 题目/话题
  task_type: "task1" | "task2"; // IELTS 任务类型
  word_count: number;           // 实际单词数
  duration_minutes?: number;    // 用时（分钟）
}
```

**Response (201 Created)：**

```typescript
interface WritingSubmitResponse {
  id: string;                   // 提交 ID
  status: "pending" | "processing" | "completed" | "failed";
  estimated_time_seconds: number; // 预估处理时间
  created_at: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 201 | 提交成功，进入队列 |
| 400 | `INVALID_INPUT` — 字数不符合要求/题目为空 |
| 429 | `RATE_LIMITED` — 今日批改次数已用完 |

---

### 4.2 获取批改结果

```
GET /writing/submissions/:id
```

**描述：** 获取作文批改的详细结果。

**是否需要认证：** 是

**Path Parameters：**

```
id: string — 提交 ID (UUID)
```

**Response (200 OK)：**

```typescript
interface WritingCorrection {
  // 四项评分
  scores: {
    task_achievement: number;       // 任务完成度 0-9
    coherence_cohesion: number;     // 连贯与衔接 0-9
    lexical_resource: number;       // 词汇资源 0-9
    grammatical_range: number;      // 语法范围与准确性 0-9
    overall: number;                // 总分 0-9
  };

  // 批改详情
  corrections: Array<{
    original: string;
    corrected: string;
    reason: string;                 // 修改原因（中文）
    type: "grammar" | "vocabulary" | "coherence" | "task";
  }>;

  // 改进建议
  suggestions: Array<{
    category: string;               // 类别
    description: string;            // 问题描述
    example: string;                // 改进示例
    priority: "high" | "medium" | "low";
  }>;

  // 范文
  sample_essay?: string;            // AI 生成的参考范文

  // 元信息
  original_content: string;
  topic: string;
  task_type: "task1" | "task2";
  word_count: number;
  created_at: string;
  completed_at: string;
}

interface WritingSubmissionResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: WritingCorrection;       // status 为 completed 时有值
  error_message?: string;           // status 为 failed 时有值
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 404 | `NOT_FOUND` — 提交记录不存在 |

---

### 4.3 查询写作历史

```
GET /writing/history
```

**描述：** 分页查询用户的写作提交历史。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface WritingHistoryQuery {
  page?: number;            // 默认 1
  page_size?: number;       // 默认 20，最大 50
  task_type?: "task1" | "task2"; // 按任务类型筛选
  status?: "completed" | "failed";
  start_date?: string;      // YYYY-MM-DD
  end_date?: string;        // YYYY-MM-DD
}
```

**Response (200 OK)：**

```typescript
interface WritingHistoryItem {
  id: string;
  topic: string;
  task_type: "task1" | "task2";
  word_count: number;
  overall_score: number | null;
  status: string;
  created_at: string;
}

type WritingHistoryResponse = ApiResponse<WritingHistoryItem[]>;
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 4.4 争议评分

```
POST /writing/dispute/:id
```

**描述：** 对批改评分提出异议，触发人工或重新评估。

**是否需要认证：** 是

**Path Parameters：**

```
id: string — 提交 ID (UUID)
```

**Request Body：**

```typescript
interface DisputeRequest {
  reason: string;               // 争议原因，10-500 字符
  disputed_aspects: Array<
    "task_achievement" | "coherence_cohesion" |
    "lexical_resource" | "grammatical_range" | "overall"
  >;
  expected_score?: number;      // 期望分数
}
```

**Response (200 OK)：**

```typescript
interface DisputeResponse {
  dispute_id: string;
  status: "pending_review";
  message: string;
  estimated_review_time: string; // 预计审核完成时间
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 争议提交成功 |
| 400 | `INVALID_INPUT` |
| 404 | `NOT_FOUND` — 提交记录不存在 |
| 409 | `CONFLICT` — 该记录已有待处理的争议 |

---

## 5. 口语 API

### 5.1 提交口语录音评估

```
POST /speaking/submit
```

**描述：** 提交口语录音文件进行 AI 评估。

**是否需要认证：** 是

**Request Body（multipart/form-data）：**

```typescript
interface SpeakingSubmitRequest {
  audio: File;                  // 录音文件，支持 MP3/WAV/M4A，最大 50MB
  topic: string;                // 话题
  part: 1 | 2 | 3;             // IELTS 口语 Part
  duration_seconds: number;     // 录音时长
  transcript?: string;          // 用户提供的转录文本（可选）
}
```

**Response (201 Created)：**

```typescript
interface SpeakingSubmitResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  estimated_time_seconds: number;
  created_at: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 201 | 提交成功 |
| 400 | `INVALID_INPUT` — 文件格式不支持/文件过大 |
| 429 | `RATE_LIMITED` — 今日评估次数已用完 |

---

### 5.2 查询口语历史

```
GET /speaking/history
```

**描述：** 分页查询用户的口语测评历史。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface SpeakingHistoryQuery {
  page?: number;
  page_size?: number;        // 默认 20，最大 50
  part?: 1 | 2 | 3;         // 按 Part 筛选
  status?: "completed" | "failed";
  start_date?: string;
  end_date?: string;
}
```

**Response (200 OK)：**

```typescript
interface SpeakingHistoryItem {
  id: string;
  topic: string;
  part: 1 | 2 | 3;
  duration_seconds: number;
  overall_score: number | null;
  fluency_score: number | null;
  pronunciation_score: number | null;
  grammar_score: number | null;
  vocabulary_score: number | null;
  status: string;
  created_at: string;
}

type SpeakingHistoryResponse = ApiResponse<SpeakingHistoryItem[]>;
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 5.3 发音分析

```
POST /speaking/pronunciation
```

**描述：** 提交音频进行发音分析（独立于完整口语评估）。

**是否需要认证：** 是

**Request Body（multipart/form-data）：**

```typescript
interface PronunciationRequest {
  audio: File;                  // 录音文件，MP3/WAV/M4A，最大 10MB
  reference_text: string;       // 参考文本，必填
}
```

**Response (200 OK)：**

```typescript
interface PronunciationResponse {
  overall_score: number;         // 发音总分 0-100

  word_scores: Array<{
    word: string;
    score: number;               // 0-100
    phonemes: Array<{
      phoneme: string;           // 音标
      score: number;             // 0-100
      is_correct: boolean;
    }>;
    suggestions?: string;        // 改进建议
  }>;

  fluency: {
    score: number;               // 流利度分数
    words_per_minute: number;
    pause_count: number;
    average_pause_duration_ms: number;
  };

  overall_suggestions: string[]; // 综合发音建议
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 分析成功 |
| 400 | `INVALID_INPUT` |

---

## 6. 词汇 API

### 6.1 获取单词列表

```
GET /vocab/words?level=core&page=1
```

**描述：** 获取 IELTS 单词列表，支持分级和分页。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface VocabWordsQuery {
  level: "core" | "advanced" | "academic" | "all"; // 难度等级，默认 "all"
  page?: number;                // 默认 1
  page_size?: number;           // 默认 20，最大 100
  search?: string;              // 关键词搜索
  sort_by?: "alphabetical" | "frequency" | "newest";
  order?: "asc" | "desc";       // 默认为 asc
}
```

**Response (200 OK)：**

```typescript
interface VocabWord {
  id: string;
  word: string;
  phonetic: string;             // 音标
  part_of_speech: string;       // 词性
  definition: string;           // 英文释义
  definition_cn: string;        // 中文释义
  examples: Array<{
    sentence: string;
    translation: string;
  }>;
  difficulty: "easy" | "medium" | "hard";
  level: "core" | "advanced" | "academic";
  tags: string[];               // 标签，如 ["education", "environment"]
}

type VocabWordsResponse = ApiResponse<VocabWord[]>;
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 400 | `INVALID_INPUT` — 等级参数无效 |

---

### 6.2 提交复习结果

```
POST /vocab/review
```

**描述：** 提交单词复习结果（Again/Hard/Good/Easy），驱动 FSRS 间隔重复算法。

**是否需要认证：** 是

**Request Body：**

```typescript
interface VocabReviewRequest {
  word_id: string;              // 单词 ID
  rating: "again" | "hard" | "good" | "easy"; // 用户评分
  reviewed_at: string;          // 复习时间 ISO 8601
  response_time_ms?: number;    // 答题反应时间（毫秒）
}
```

**Response (200 OK)：**

```typescript
interface VocabReviewResponse {
  word_id: string;
  rating: string;
  next_review_at: string;       // 下次复习时间 ISO 8601
  interval_days: number;        // 间隔天数
  stability: number;            // FSRS stability 参数
  difficulty: number;           // FSRS difficulty 参数
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 提交成功 |
| 400 | `INVALID_INPUT` — rating 值无效 |
| 404 | `NOT_FOUND` — 单词不存在 |

---

### 6.3 获取待复习单词

```
GET /vocab/due
```

**描述：** 获取当前到期需要复习的单词列表（基于 FSRS 算法）。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface VocabDueQuery {
  limit?: number;               // 返回数量，默认 20，最大 50
  level?: "core" | "advanced" | "academic"; // 按等级筛选
}
```

**Response (200 OK)：**

```typescript
interface DueWord extends VocabWord {
  review_state: "new" | "learning" | "review" | "relearning";
  due_at: string;               // 到期时间 ISO 8601
  interval_days: number;
  stability: number;
  difficulty: number;
  lapses: number;               // 遗忘次数
}

interface VocabDueResponse {
  total_due: number;            // 总待复习数
  words: DueWord[];
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 6.4 生成 AI 单词故事

```
POST /vocab/story
```

**描述：** 基于选定单词生成 AI 辅助记忆故事。

**是否需要认证：** 是

**Request Body：**

```typescript
interface VocabStoryRequest {
  word_ids: string[];           // 要包含的单词 ID，2-10 个
  style?: "funny" | "serious" | "scenario" | "exam"; // 风格，默认 "scenario"
  language?: "en" | "zh";      // 故事语言，默认 "en"
}
```

**Response (200 OK)：**

```typescript
interface VocabStoryResponse {
  story: string;                // 生成的英文故事
  translation?: string;         // 中文翻译（language 为 zh 时返回）
  words_highlighted: Array<{
    word: string;
    definition: string;
    sentence: string;           // 故事中包含该词的句子
  }>;
  created_at: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 生成成功 |
| 400 | `INVALID_INPUT` — 单词数不在范围内 |

---

### 6.5 获取学习热力图数据

```
GET /vocab/heatmap
```

**描述：** 获取用户词汇学习的日历热力图数据。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface VocabHeatmapQuery {
  year: number;                 // 年份，如 2026
}
```

**Response (200 OK)：**

```typescript
interface VocabHeatmapData {
  date: string;                 // YYYY-MM-DD
  count: number;                // 当日学习单词数
  new_words: number;            // 新学单词数
  review_words: number;         // 复习单词数
  duration_minutes: number;     // 学习时长
}

interface VocabHeatmapResponse {
  year: number;
  data: VocabHeatmapData[];
  total_new_words: number;
  total_reviews: number;
  max_daily_count: number;      // 单日最高单词数
  current_streak: number;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

## 7. 聊天对战 API

### 7.1 发送消息

```
POST /chat/message
```

**描述：** 在聊天对战中发送一条消息。

**是否需要认证：** 是

**Request Body：**

```typescript
interface ChatMessageRequest {
  battle_id: string;            // 对战 ID
  content: string;              // 消息内容，1-500 字符
  message_type?: "text" | "voice"; // 消息类型，默认 "text"
  audio_url?: string;           // 语音消息 URL（message_type 为 voice 时必填）
}
```

**Response (201 Created)：**

```typescript
interface ChatMessageResponse {
  id: string;                   // 消息 ID
  battle_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  audio_url: string | null;
  correction?: {                // AI 语法纠错（如果启用）
    original: string;
    corrected: string;
    explanation: string;
  };
  created_at: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 201 | 发送成功 |
| 400 | `INVALID_INPUT` |
| 404 | `NOT_FOUND` — 对战不存在 |
| 403 | `FORBIDDEN` — 不是该对战参与者 |

---

### 7.2 获取可用话题

```
GET /chat/topics
```

**描述：** 获取聊天对战可选话题列表。

**是否需要认证：** 是

**Response (200 OK)：**

```typescript
interface ChatTopic {
  id: string;
  title: string;                // 话题标题
  description: string;          // 话题描述
  category: "daily" | "academic" | "technology" | "culture" | "environment";
  difficulty: "easy" | "medium" | "hard";
  icon: string;                 // 话题图标 URL
  estimated_duration_minutes: number;
}

interface ChatTopicsResponse {
  topics: ChatTopic[];
  daily_recommended?: ChatTopic; // 今日推荐话题
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 7.3 匹配对手

```
POST /chat/match
```

**描述：** 开始匹配学习伙伴进行聊天对战。

**是否需要认证：** 是

**Request Body：**

```typescript
interface ChatMatchRequest {
  topic_id?: string;            // 可选，指定话题
  difficulty?: "easy" | "medium" | "hard"; // 可选，指定难度
  match_type: "random" | "partner";       // 随机匹配或与伙伴对战
  timeout_seconds?: number;     // 匹配超时时间，默认 60
}
```

**Response (200 OK)：**

```typescript
interface ChatMatchResponse {
  battle_id: string;
  status: "matched" | "waiting";
  opponent: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  } | null;                     // matched 时有值
  topic: ChatTopic;
  matched_at: string;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 匹配成功/进入等待队列 |
| 408 | 匹配超时 |

---

### 7.4 获取对战历史

```
GET /chat/history/:battleId
```

**描述：** 获取指定对战的历史消息记录。

**是否需要认证：** 是

**Path Parameters：**

```
battleId: string — 对战 ID (UUID)
```

**Query Parameters：**

```typescript
interface ChatHistoryQuery {
  page?: number;                // 默认 1
  page_size?: number;           // 默认 50，最大 200
}
```

**Response (200 OK)：**

```typescript
interface BattleDetail {
  id: string;
  topic: ChatTopic;
  participants: Array<{
    id: string;
    nickname: string;
    avatar_url: string | null;
  }>;
  status: "active" | "completed" | "abandoned";
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  message_count: number;
  score?: {                     // 对战结束后的评分
    overall: number;
    fluency: number;
    accuracy: number;
    vocabulary: number;
  };
}

interface BattleHistoryResponse {
  battle: BattleDetail;
  messages: Array<{
    id: string;
    sender_id: string;
    content: string;
    message_type: string;
    correction?: object;
    created_at: string;
  }>;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 404 | `NOT_FOUND` — 对战不存在 |

---

## 8. AI 助手 API

### 8.1 发送消息

```
POST /agent/chat
```

**描述：** 向 AI 学习助手发送消息并获取回复。

**是否需要认证：** 是

**Request Body：**

```typescript
interface AgentChatRequest {
  message: string;              // 用户消息
  context_type?: "general" | "writing" | "speaking" | "vocabulary"; // 上下文类型
  context_id?: string;          // 关联的写作/口语记录 ID
  stream?: boolean;             // 是否流式响应，默认 false
}
```

**Response (200 OK)：**

```typescript
interface AgentChatResponse {
  reply: string;                // AI 回复内容
  context_type: string;
  actions?: Array<{             // 建议操作
    type: "show_example" | "quiz" | "correction" | "suggestion";
    data: Record<string, unknown>;
  }>;
  session_id: string;           // 会话 ID，用于上下文关联
}
```

**流式响应（SSE, stream=true）：**

```
event: message
data: {"chunk": "文本片段", "session_id": "xxx"}

event: done
data: {"full_reply": "完整回复", "session_id": "xxx"}

event: error
data: {"code": "ERROR_CODE", "message": "错误描述"}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 响应成功 |
| 400 | `INVALID_INPUT` |
| 429 | `RATE_LIMITED` — 消息频率超限 |

---

### 8.2 获取存储的记忆

```
GET /agent/memories
```

**描述：** 获取 AI 助手存储的关于用户的学习记忆。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface AgentMemoriesQuery {
  category?: "strength" | "weakness" | "preference" | "goal" | "all";
  limit?: number;               // 默认 20
}
```

**Response (200 OK)：**

```typescript
interface AgentMemory {
  id: string;
  category: "strength" | "weakness" | "preference" | "goal";
  content: string;              // 记忆内容
  source: string;               // 来源
  confidence: number;           // 置信度 0-1
  created_at: string;
  updated_at: string;
}

interface AgentMemoriesResponse {
  memories: AgentMemory[];
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 8.3 获取推送历史

```
GET /agent/notifications
```

**描述：** 获取 AI 助手主动推送的消息/提醒历史。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface AgentNotificationsQuery {
  page?: number;
  page_size?: number;           // 默认 20
  type?: "reminder" | "tip" | "encouragement" | "suggestion";
  is_read?: boolean;            // 按已读状态筛选
}
```

**Response (200 OK)：**

```typescript
interface AgentNotification {
  id: string;
  type: "reminder" | "tip" | "encouragement" | "suggestion";
  title: string;
  content: string;
  action_url?: string;          // 相关操作链接
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

type AgentNotificationsResponse = ApiResponse<AgentNotification[]>;
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 8.4 更新 AI 个性配置

```
PUT /agent/config
```

**描述：** 更新 AI 助手的个性/交互偏好配置。

**是否需要认证：** 是

**Request Body：**

```typescript
interface AgentConfigRequest {
  personality?: {
    formality: number;            // 正式程度 1-5
    strictness: number;           // 严格程度 1-5
    encouragement_frequency: number; // 鼓励频率 1-5
    humor_level: number;          // 幽默程度 0-5
  };
  preferences?: {
    auto_correct: boolean;        // 是否自动纠错
    auto_suggest: boolean;        // 是否自动给出建议
    daily_tip_enabled: boolean;   // 每日学习提示
    language: "en" | "zh";       // 交互语言
  };
  study_goals?: {
    daily_study_minutes: number;
    target_band_score: number;    // 目标分数 0-9
    exam_date?: string;           // 考试日期 ISO 8601
  };
}
```

**Response (200 OK)：**

```typescript
interface AgentConfigResponse {
  message: string;
  config: {
    personality: {
      formality: number;
      strictness: number;
      encouragement_frequency: number;
      humor_level: number;
    };
    preferences: {
      auto_correct: boolean;
      auto_suggest: boolean;
      daily_tip_enabled: boolean;
      language: string;
    };
    study_goals: {
      daily_study_minutes: number;
      target_band_score: number;
      exam_date: string | null;
    };
  };
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 更新成功 |
| 400 | `INVALID_INPUT` — 参数值超出范围 |

---

### 8.5 获取今日已学表达

```
GET /agent/daily-expressions
```

**描述：** 获取 AI 助手今日推送/记录的学习表达。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface DailyExpressionsQuery {
  date?: string;                // YYYY-MM-DD，默认今天
}
```

**Response (200 OK)：**

```typescript
interface DailyExpression {
  id: string;
  expression: string;           // 英文表达
  translation: string;          // 中文翻译
  usage_example: string;        // 使用例句
  source: string;               // 来源上下文
  category: "idiom" | "phrasal_verb" | "collocation" | "vocabulary";
  is_reviewed: boolean;         // 是否已复习
}

interface DailyExpressionsResponse {
  date: string;
  expressions: DailyExpression[];
  total_count: number;
  reviewed_count: number;
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

## 9. 积分与奖励 API

### 9.1 获取积分余额

```
GET /points/balance
```

**描述：** 获取用户当前积分和花朵余额。

**是否需要认证：** 是

**Response (200 OK)：**

```typescript
interface PointsBalanceResponse {
  points: number;               // 当前积分
  flowers: number;              // 当前花朵数（可兑换奖励）
  lifetime_points: number;      // 累计获得积分
  level: number;                // 用户等级
  level_progress: number;       // 当前等级进度百分比 0-100
  next_level_points: number;    // 升级所需积分
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 9.2 获取积分明细

```
GET /points/history
```

**描述：** 获取积分变动明细。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface PointsHistoryQuery {
  page?: number;                // 默认 1
  page_size?: number;           // 默认 20
  type?: "earn" | "spend";     // 收入/支出
  category?: "study" | "streak" | "achievement" | "exchange" | "bonus";
  start_date?: string;
  end_date?: string;
}
```

**Response (200 OK)：**

```typescript
interface PointsHistoryItem {
  id: string;
  type: "earn" | "spend";
  category: "study" | "streak" | "achievement" | "exchange" | "bonus";
  amount: number;               // 变动数量（正数）
  balance_after: number;        // 变动后余额
  description: string;          // 变动说明
  reference_id?: string;        // 关联记录 ID
  created_at: string;
}

type PointsHistoryResponse = ApiResponse<PointsHistoryItem[]>;
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 9.3 兑换奖励

```
POST /rewards/exchange
```

**描述：** 使用花朵兑换奖励物品。

**是否需要认证：** 是

**Request Body：**

```typescript
interface ExchangeRequest {
  reward_id: string;            // 奖励物品 ID
  quantity: number;             // 数量，默认为 1
}
```

**Response (200 OK)：**

```typescript
interface ExchangeResponse {
  order_id: string;
  reward_id: string;
  reward_name: string;
  quantity: number;
  flowers_spent: number;
  flowers_balance: number;
  status: "success" | "pending_delivery";
  message: string;
  estimated_delivery?: string;  // 预计发放时间
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 兑换成功 |
| 400 | `INVALID_INPUT` — 花朵不足 |
| 404 | `NOT_FOUND` — 奖励物品不存在 |

---

### 9.4 获取奖励目录

```
GET /rewards/catalog
```

**描述：** 获取可兑换的奖励物品列表。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface RewardsCatalogQuery {
  category?: "avatar" | "theme" | "badge" | "ticket" | "physical";
  available_only?: boolean;     // 是否仅显示可兑换的，默认 false
}
```

**Response (200 OK)：**

```typescript
interface RewardItem {
  id: string;
  name: string;
  description: string;
  category: "avatar" | "theme" | "badge" | "ticket" | "physical";
  price_flowers: number;        // 所需花朵数
  stock: number;                // 库存，-1 表示不限量
  image_url: string;            // 预览图
  is_limited: boolean;          // 是否限时/限量
  expires_at?: string;          // 过期时间
}

interface RewardsCatalogResponse {
  items: RewardItem[];
  user_flowers: number;         // 用户当前花朵数
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

## 10. 通知 API

### 10.1 获取通知列表

```
GET /notifications
```

**描述：** 获取用户的通知列表。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface NotificationsQuery {
  page?: number;                // 默认 1
  page_size?: number;           // 默认 20，最大 50
  type?: "system" | "partner" | "study" | "reward" | "agent";
  is_read?: boolean;            // 按已读状态筛选
}
```

**Response (200 OK)：**

```typescript
interface Notification {
  id: string;
  type: "system" | "partner" | "study" | "reward" | "agent";
  title: string;
  content: string;
  is_read: boolean;
  action_url?: string;          // 点击跳转链接
  image_url?: string;           // 通知配图
  created_at: string;
  read_at?: string;
}

type NotificationsResponse = ApiResponse<Notification[]>;
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |

---

### 10.2 标记已读

```
PUT /notifications/:id/read
```

**描述：** 将指定通知标记为已读。支持批量标记。

**是否需要认证：** 是

**Path Parameters：**

```
id: string — 通知 ID 或 "all"（标记全部已读）
```

**Request Body（可选，批量标记时使用）：**

```typescript
interface MarkReadRequest {
  ids?: string[];               // 要标记的通知 ID 列表（仅 path 为 "all" 时使用）
}
```

**Response (200 OK)：**

```typescript
interface MarkReadResponse {
  marked_count: number;         // 标记已读数量
  unread_count: number;         // 剩余未读数量
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 404 | `NOT_FOUND` — 通知不存在 |

---

### 10.3 更新通知偏好

```
PUT /notifications/settings
```

**描述：** 更新用户的通知偏好设置。

**是否需要认证：** 是

**Request Body：**

```typescript
interface NotificationSettingsRequest {
  push_enabled?: boolean;                   // 总开关
  sound_enabled?: boolean;                  // 声音通知
  channels?: {
    partner_request: boolean;               // 伙伴请求
    partner_message: boolean;               // 伙伴消息
    study_reminder: boolean;               // 学习提醒
    streak_reminder: boolean;              // 连续学习提醒
    reward_available: boolean;             // 奖励开放
    agent_tip: boolean;                    // AI 助手提示
    system_announcement: boolean;          // 系统公告
  };
  quiet_hours?: {                           // 免打扰时段
    enabled: boolean;
    start: string;                          // HH:mm
    end: string;                            // HH:mm
  };
}
```

**Response (200 OK)：**

```typescript
interface NotificationSettingsResponse {
  push_enabled: boolean;
  sound_enabled: boolean;
  channels: Record<string, boolean>;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 更新成功 |

---

## 11. 排行榜 API

### 11.1 获取排行榜

```
GET /leaderboard?league=gold&page=1
```

**描述：** 获取按联赛分组的排行榜。

**是否需要认证：** 是

**Query Parameters：**

```typescript
interface LeaderboardQuery {
  league: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  page?: number;                // 默认 1
  page_size?: number;           // 默认 50，最大 100
  period?: "weekly" | "monthly" | "all_time"; // 统计周期，默认 "weekly"
}
```

**Response (200 OK)：**

```typescript
interface LeaderboardEntry {
  rank: number;                 // 排名
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  league: string;
  points: number;               // 本周/月/总积分
  study_hours: number;          // 学习时长（小时）
  streak: number;               // 连续学习天数
  is_partner: boolean;          // 是否为当前用户的学习伙伴
  is_current_user: boolean;     // 是否为当前用户
}

interface LeaderboardResponse {
  league: string;
  period: string;
  current_user_rank: {          // 当前用户排名信息
    rank: number;
    points: number;
    entries_above: number;      // 前方人数
    entries_below: number;      // 后方人数
  };
  entries: LeaderboardEntry[];
}
```

**状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 400 | `INVALID_INPUT` — league 参数无效 |

---

## 附录

### A. 通用枚举定义

```typescript
// 学习类型
type StudyType = "writing" | "speaking" | "vocabulary" | "chat";

// FSRS 评分等级
type FSRSPRating = "again" | "hard" | "good" | "easy";

// 困难等级
type DifficultyLevel = "easy" | "medium" | "hard";

// 联赛段位
type League = "bronze" | "silver" | "gold" | "platinum" | "diamond";
```

### B. 分页请求/响应通用类型

```typescript
interface PaginationParams {
  page: number;
  page_size: number;
}

interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
```

### C. HTTP 状态码速查

| 方法 | 成功 | 创建 | 无内容 | 错误 |
|------|------|------|--------|------|
| GET | 200 | - | - | 400/401/404/500 |
| POST | 200 | 201 | - | 400/401/404/409/429/500 |
| PUT | 200 | - | - | 400/401/404/500 |
| DELETE | 200 | - | 204 | 401/404/500 |

---

> 本文档为 Partner IELTS API v1 的完整设计规范。所有接口遵循 RESTful 风格，使用 JSON 格式通信，通过 Supabase JWT 进行认证。任何接口变更将在此文档更新并通知客户端团队。
