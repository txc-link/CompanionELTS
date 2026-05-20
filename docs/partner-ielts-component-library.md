# Partner IELTS 组件库设计文档

> **技术栈**: React 18 + TypeScript 5 + TailwindCSS 3 + shadcn/ui  
> **版本**: v1.0.0  
> **更新日期**: 2026-05-21

---

## 目录

1. [设计令牌 (Design Tokens)](#1-设计令牌-design-tokens)
2. [UI 组件规范 (UI Components)](#2-ui-组件规范-ui-components)
3. [功能组件描述 (Feature Components)](#3-功能组件描述-feature-components)
4. [组件树 (Component Tree)](#4-组件树-component-tree)
5. [Props 表 (Props Tables)](#5-props-表-props-tables)
6. [状态管理 (State Management)](#6-状态管理-state-management)

---

## 1. 设计令牌 (Design Tokens)

### 1.1 色彩系统

Partner IELTS 使用深色主题搭配品牌绿色与金色点缀。所有颜色均以 CSS 自定义属性和 TailwindCSS 扩展形式提供。

#### 主色调

| Token | HEX | Tailwind 类名 | 用途 |
|---|---|---|---|
| `brand-primary` | `#6ec56e` | `bg-brand-primary` | 主按钮、激活态、品牌主色 |
| `brand-primary-hover` | `#7fd87f` | `bg-brand-primary-hover` | 主按钮悬停 |
| `brand-primary-muted` | `rgba(110,197,110,0.15)` | `bg-brand-primary/15` | 背景色块、徽章 |
| `brand-gold` | `#e8b84b` | `text-brand-gold` | 高分标识、金牌、VIP 元素 |
| `brand-amber` | `#c4893a` | `text-brand-amber` | 警告、铜牌、次级强调 |

#### 深色背景

| Token | HEX | Tailwind 类名 | 用途 |
|---|---|---|---|
| `bg-deep` | `#0f1a12` | `bg-deep` | 最深层背景（全屏容器） |
| `bg-surface` | `#1a2b1c` | `bg-surface` | 卡片、面板、模态框 |
| `bg-elevated` | `#1e3022` | `bg-elevated` | 悬停提升层、下拉菜单 |
| `bg-hover` | `#243a28` | `bg-hover` | 列表项悬停 |

#### 文字色

| Token | HEX | Tailwind 类名 | 用途 |
|---|---|---|---|
| `text-primary` | `#f4f0e6` | `text-primary` | 主标题、正文 |
| `text-secondary` | `#b8c4a8` | `text-secondary` | 次要文字、描述 |
| `text-tertiary` | `#7a9170` | `text-tertiary` | 占位符、禁用态、辅助信息 |

#### 语义色

| Token | HEX | Tailwind 类名 | 用途 |
|---|---|---|---|
| `success` | `#4caf50` | `text-success` / `bg-success` | 正确、完成 |
| `error` | `#ef5350` | `text-error` / `bg-error` | 错误、警告 |
| `warning` | `#ff9800` | `text-warning` / `bg-warning` | 注意提醒 |
| `info` | `#42a5f5` | `text-info` / `bg-info` | 信息提示 |

#### TailwindCSS 扩展配置

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#6ec56e',
        'brand-primary-hover': '#7fd87f',
        'brand-gold': '#e8b84b',
        'brand-amber': '#c4893a',
        'brand-primary-muted': 'rgba(110,197,110,0.15)',
        deep: '#0f1a12',
        surface: '#1a2b1c',
        elevated: '#1e3022',
        'bg-hover': '#243a28',
        'text-primary': '#f4f0e6',
        'text-secondary': '#b8c4a8',
        'text-tertiary': '#7a9170',
        success: '#4caf50',
        error: '#ef5350',
        warning: '#ff9800',
        info: '#42a5f5',
      },
    },
  },
};
```

### 1.2 字体系统

| Token | 值 | 用途 |
|---|---|---|
| `font-display` | `'Fraunces', serif` | 标题、展示文字、大号分数 |
| `font-body` | `'DM Sans', sans-serif` | 正文、标签、按钮、输入框 |

#### 字重

| Token | 字体 | 字重 | Tailwind 类名 |
|---|---|---|---|
| `weight-display-semibold` | Fraunces | 600 | `font-display font-semibold` |
| `weight-display-bold` | Fraunces | 700 | `font-display font-bold` |
| `weight-body-regular` | DM Sans | 400 | `font-body font-normal` |
| `weight-body-medium` | DM Sans | 500 | `font-body font-medium` |
| `weight-body-semibold` | DM Sans | 600 | `font-body font-semibold` |

#### 字号层级

| Token | 大小 | 行高 | Tailwind 类名 | 用途 |
|---|---|---|---|---|
| `text-xs` | 12px | 16px | `text-xs` | 辅助标签、徽章数字 |
| `text-sm` | 14px | 20px | `text-sm` | 小号正文、表头 |
| `text-base` | 16px | 24px | `text-base` | 正文、按钮文字 |
| `text-lg` | 18px | 28px | `text-lg` | 卡片标题 |
| `text-xl` | 20px | 28px | `text-xl` | 模块标题 |
| `text-2xl` | 24px | 32px | `text-2xl` | 页面标题 |
| `text-3xl` | 30px | 36px | `text-3xl` | 大号展示 |
| `text-4xl` | 36px | 40px | `text-4xl` | 分数显示 |
| `text-5xl` | 48px | 48px | `text-5xl` | 英雄区 / 大数字 |

```ts
// tailwind.config.ts — 字体扩展
export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
};
```

### 1.3 间距系统

基于 4px 网格。所有间距使用 Tailwind 内置 `spacing`。

| Token | 像素 | Tailwind 类名 |
|---|---|---|
| `space-1` | 4px | `gap-1` `p-1` `m-1` |
| `space-2` | 8px | `gap-2` `p-2` `m-2` |
| `space-3` | 12px | `gap-3` `p-3` `m-3` |
| `space-4` | 16px | `gap-4` `p-4` `m-4` |
| `space-5` | 20px | `gap-5` `p-5` `m-5` |
| `space-6` | 24px | `gap-6` `p-6` `m-6` |
| `space-8` | 32px | `gap-8` `p-8` `m-8` |
| `space-10` | 40px | `gap-10` `p-10` `m-10` |

布局约束：
- 侧边栏宽度：`280px`
- 内容区最大宽度：`1200px`
- 移动端断点：`768px`

### 1.4 圆角

| Token | 值 | Tailwind 类名 | 用途 |
|---|---|---|---|
| `radius-sm` | 6px | `rounded-sm` | 输入框、小徽章、标签 |
| `radius-md` | 12px | `rounded-md` | 卡片、按钮、模态框 |
| `radius-lg` | 20px | `rounded-lg` | 大卡片、搜索框 |
| `radius-full` | 9999px | `rounded-full` | 头像、药丸徽章 |

### 1.5 阴影

| Token | 值 | 用途 |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.3)` | 小幅提升，如悬停卡片 |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | 下拉菜单、模态框 |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | 浮动元素、Toast |
| `shadow-glow-green` | `0 0 12px rgba(110,197,110,0.4)` | 激活态发光 |

```ts
// tailwind.config.ts — 阴影扩展
export default {
  theme: {
    extend: {
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.3)',
        md: '0 4px 12px rgba(0,0,0,0.4)',
        lg: '0 8px 24px rgba(0,0,0,0.5)',
        'glow-green': '0 0 12px rgba(110,197,110,0.4)',
      },
    },
  },
};
```

---

## 2. UI 组件规范 (UI Components)

### 2.1 Button 按钮

#### 设计规范

| 状态 | Primary | Secondary | Ghost |
|---|---|---|---|
| 默认 | 绿色渐变 `bg-gradient-to-r from-[#6ec56e] to-[#5ab85a]` | 深色背景 `bg-elevated` | 透明 `bg-transparent` |
| 悬停 | 亮度提升 `brightness-110` | 浅色背景 `bg-hover` | `bg-white/5` |
| 激活 | `scale-95` 缩放 | `scale-95` | `scale-95` |
| 禁用 | `opacity-40` 不可点击 | `opacity-40` | `opacity-40` |

#### 尺寸

| 尺寸 | 高度 | 内边距 | 字号 | 圆角 |
|---|---|---|---|---|
| `sm` | 32px | `px-3 py-1.5` | 13px | `rounded-sm` (6px) |
| `md` | 40px | `px-4 py-2` | 14px | `rounded-md` (12px) |
| `lg` | 52px | `px-6 py-3` | 16px | `rounded-md` (12px) |

#### TypeScript 接口

```ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;        // 左侧图标
  iconRight?: React.ReactNode;   // 右侧图标
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

#### 使用示例

```tsx
<Button variant="primary" size="lg" loading={isLoading}>
  开始学习
</Button>

<Button variant="secondary" size="md" icon={<PlayIcon />}>
  继续答题
</Button>

<Button variant="ghost" size="sm">
  取消
</Button>

<Button variant="primary" size="md" iconRight={<ArrowRight />} fullWidth>
  提交写作
</Button>
```

### 2.2 Input 输入框

#### 设计规范

- 背景色：`bg-elevated` (`#1e3022`)
- 边框：`border-[#2d4532]` (1px solid)，聚焦时 `border-brand-primary`
- 文字：`text-primary` (输入内容)，`text-tertiary` (占位符)
- 聚焦效果：`ring-1 ring-brand-primary` 外发光
- 高度（标准）：44px | 换行属性自动增长（textarea）

#### TypeScript 接口

```ts
interface InputProps {
  label?: string;                 // 标签文字
  placeholder?: string;
  error?: string;                 // 错误信息
  hint?: string;                  // 辅助提示
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;         // 前置图标
  iconRight?: React.ReactNode;    // 后置图标
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  multiline?: boolean;            // textarea 模式
  rows?: number;                  // textarea 行数
  maxLength?: number;
  className?: string;
}

interface SearchInputProps extends Omit<InputProps, 'icon'> {
  onClear?: () => void;
  onSearch?: (value: string) => void;
}
```

#### 使用示例

```tsx
{/* 标准输入 */}
<Input
  label="目标分数"
  placeholder="例如: 7.0"
  value={target}
  onChange={setTarget}
  error={targetError}
/>

{/* 带图标 */}
<Input
  icon={<SearchIcon />}
  placeholder="搜索单词..."
  value={query}
  onChange={setQuery}
  type="search"
/>

{/* 多行文本 */}
<Input
  label="作文内容"
  multiline
  rows={8}
  maxLength={500}
  placeholder="在此输入你的雅思作文..."
  value={essay}
  onChange={setEssay}
  hint={`${essay.length}/500`}
/>
```

### 2.3 Card 卡片

#### 变体

| 变体 | 背景 | 边框 | 特殊样式 |
|---|---|---|---|
| `container` | `bg-surface` | `border border-[#2d4532]` | `rounded-md` (12px) |
| `interactive` | `bg-surface` | `border border-[#2d4532]` | `hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer` |
| `stats` | `bg-surface` | 无 | 顶部 3px `border-t-4 border-t-brand-primary` |

#### TypeScript 接口

```ts
interface CardProps {
  variant?: 'container' | 'interactive' | 'stats';
  accentColor?: string;           // stats 卡片顶部色条颜色
  padding?: 'sm' | 'md' | 'lg';  // 内边距: 16/20/24
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

### 2.4 Badge 徽章

#### 变体

| 变体 | 背景 | 文字色 | 圆角 | 用途 |
|---|---|---|---|---|
| `status` | 语义色 `bg-opacity-15` | 语义色 | `rounded-md` | 完成/进行中 |
| `count` | `bg-elevated` | `text-secondary` | `rounded-full` (药丸) | 数字计数 |
| `level` | 根据 L1-L5 渐变色 | `text-primary` | `rounded-full` | 学习水平 |
| `achievement` | `bg-brand-gold/15` | `brand-gold` | `rounded-full` | 成就徽章 |

#### Level 级别色

| 级别 | 背景 | 含义 |
|---|---|---|
| L1 | `bg-gray-600/30` | 新手 |
| L2 | `bg-brand-primary/15` | 初阶 |
| L3 | `bg-blue-500/15` | 进阶 |
| L4 | `bg-purple-500/15` | 高阶 |
| L5 | `bg-brand-gold/20` | 大师 |

#### TypeScript 接口

```ts
type BadgeVariant = 'status' | 'count' | 'level' | 'achievement';
type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'pending';
type BadgeLevel = 1 | 2 | 3 | 4 | 5;

interface BadgeProps {
  variant?: BadgeVariant;
  status?: BadgeStatus;           // 仅 status 变体使用
  level?: BadgeLevel;             // 仅 level 变体使用
  label: string;
  count?: number;                 // 仅 count 变体使用
  size?: 'sm' | 'md';
  className?: string;
}
```

### 2.5 Tab 标签页

#### 变体

| 变体 | 激活态指示 | 间距 |
|---|---|---|
| `pill` | 背景填充 `bg-elevated` + `text-brand-primary` | `gap-2` |
| `underline` | 下划线 `border-b-2 border-brand-primary` | `gap-6` |

#### TypeScript 接口

```ts
interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: number;                 // 角标计数
}

interface TabsProps {
  variant?: 'pill' | 'underline';
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
```

### 2.6 Modal 模态框

#### 交互行为

- 背景遮罩：`bg-black/60 backdrop-blur-sm`，点击遮罩关闭
- 内容面板：居中 `fixed inset-0 flex items-center justify-center`
- 面板背景：`bg-surface rounded-md border border-[#2d4532] shadow-lg`
- 入场动画：`scale-95 → scale-100 opacity-0 → opacity-1` (200ms)
- 键盘：按 `Escape` 关闭

#### TypeScript 接口

```ts
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  footer?: React.ReactNode;
}
```

#### 尺寸

| 尺寸 | 最大宽度 |
|---|---|
| `sm` | 400px |
| `md` | 560px |
| `lg` | 720px |
| `xl` | 960px |
| `full` | `calc(100vw - 80px)` |

### 2.7 Toast 提示

#### 布局规则

- 位置：`fixed bottom-6 right-6`，垂直排列 `flex-col gap-3`
- 入场：从右滑入 `translate-x-full → translate-x-0` (300ms)
- 自动消失：5 秒后 `opacity-0` + 缩放淡出 (400ms)
- 每个 Toast 最多堆叠 5 个，超出覆盖

#### TypeScript 接口

```ts
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;              // 自动消失毫秒数, 0 表示不消失
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastConfig {
  position?: 'bottom-right' | 'top-right' | 'top-center';
  maxVisible?: number;
}

// Hook 用法
interface UseToastReturn {
  toast: (item: Omit<ToastItem, 'id'>) => string;  // 返回 id
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
```

### 2.8 ProgressBar 进度条

#### 变体

| 变体 | 描述 | 高度 |
|---|---|---|
| `linear` | 水平填充条 | 8px |
| `ring` | SVG 圆形进度 | 48x48px |

#### TypeScript 接口

```ts
interface ProgressBarProps {
  variant?: 'linear' | 'ring';
  value: number;                  // 0-100
  max?: number;                   // 默认 100
  label?: string;                 // 显示文字 (如 "65%")
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';     // 仅 linear
  color?: string;                 // 自定义颜色
  strokeWidth?: number;           // 仅 ring
  sizePx?: number;                // 仅 ring 尺寸
  className?: string;
}
```

### 2.9 Avatar 头像

#### 变体

| 变体 | 内容 | 特殊 |
|---|---|---|
| `user` | 首字母渐变 | 默认 `w-10 h-10 rounded-full` |
| `partner` | 图片或首字母 | 在线/离线状态圆点 `w-3 h-3` |

#### 首字母渐变色映射

```ts
const GRADIENT_MAP: Record<string, string> = {
  A: 'from-[#6ec56e] to-[#4a9e4a]',
  B: 'from-[#e8b84b] to-[#c4893a]',
  C: 'from-[#42a5f5] to-[#1e88e5]',
  D: 'from-[#ab47bc] to-[#8e24aa]',
  // ... 完整映射按需配置
  default: 'from-[#6ec56e] to-[#4a9e4a]',
};
```

#### TypeScript 接口

```ts
interface AvatarProps {
  src?: string;                   // 图片 URL
  name: string;                   // 显示首字母的 fallback
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'idle';  // 仅 partner 变体
  showStatus?: boolean;
  className?: string;
}

interface AvatarSize {
  sm: 32;
  md: 40;
  lg: 56;
  xl: 80;
}
```

### 2.10 Tooltip 工具提示

#### 设计规范

- 背景：`bg-[#2d4532]` (深色浮层)
- 文字：`text-primary text-sm`
- 箭头：4px CSS triangle
- 触发：`hover` + `focus-visible` (延迟 300ms 显示)
- 退出：移出后 100ms 消失

#### TypeScript 接口

```ts
interface TooltipProps {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;                 // 显示延迟, 默认 300ms
  children: React.ReactNode;      // 触发元素
  className?: string;
}
```

---

## 3. 功能组件描述 (Feature Components)

以下为功能组件的线框描述，给出核心交互逻辑与 UI 结构。

### 3.1 StudyCalendar 学习日历

**用途**：以周为单位展示学习日程，点击某天查看当日任务。

**UI 结构**：

```
┌──────────────────────────────────────────────────┐
│  ◀  2026年 5月                 五月 六月 七月 ▶  │  ← 月份切换 + 快捷月份标签
├──────────────────────────────────────────────────┤
│  一     二     三     四     五     六     日     │
│  18     19     20     21     22     23     24    │  ← 周视图条 (可左右滑动)
│  ████   ██     ██████ ██████ ██     ██    ██    │  ← 学习时长条 (宽度代表时长)
│  2h     1h     3h     2.5h   1h     1.5h  45m   │  ← 时长文字
├──────────────────────────────────────────────────┤
│  [2026-05-21 任务列表]                           │
│  ☐ 听力 Section 1  30min                        │  ← 当天任务列表
│  ☑ 阅读 Passage 1  45min                        │
│  ☐ 口语 Part 2     20min                        │
└──────────────────────────────────────────────────┘
```

**核心交互**：
- 点击日期 → 下方面板刷新当日任务
- 左右箭头 → 翻周
- 月份标签 → 跳转到对应月首

### 3.2 StudyTimer 学习计时器

**用途**：学习时记录耗时，支持开始/暂停/停止与科目选择。

**UI 结构**：

```
┌─────────────────────────────┐
│  科目选择器                   │
│  [听力 ▼] [阅读] [写作] [口语] │  ← Pill 式标签切换
├─────────────────────────────┤
│                             │
│       00 : 45 : 32          │  ← 大号计时器 (font-display text-5xl)
│         正在学习...          │  ← 状态文字
│                             │
│     [ ⏸ 暂停 ]  [ ⏹ 停止 ]  │  ← 控制按钮 (仅开始后显示暂停)
│     [ ▶ 开始 ]              │  ← 初始态显示开始
│                             │
│  今日学习: 2h 15m           │  ← 累计统计
└─────────────────────────────┘
```

**核心交互**：
- 选择科目后激活"开始"按钮
- 开始 → 计时递增，显示"正在学习..."
- 暂停 → 计时暂停，按钮变为"继续"
- 停止 → 记录本次学习时段，重置计时器

### 3.3 DualProgressRing 双人环形进度

**用途**：并排显示"我"与"学习伙伴"的学习进度对比。

**UI 结构**：

```
      我                     托福小助手
   ┌──────┐               ┌──────┐
   │  ╭──╮ │               │  ╭──╮ │
   │  │68%│ │               │  │82%│ │
   │  ╰──╯ │               │  ╰──╯ │
   │ 1120词│               │ 1450词│
   └──────┘               └──────┘
     本周进度                 本周进度
```

**SVG 实现说明**：
- 两个 SVG `<circle>` 元素，`r=40`, `cx=56`, `cy=56`
- 底色圆：`stroke="#2d4532" stroke-width="8" fill="none"`
- 进度圆：`stroke="url(#gradient-{id})" stroke-width="8" fill="none" stroke-linecap="round"`
  - `stroke-dasharray` = `2 * PI * r`
  - `stroke-dashoffset` = 根据百分比计算
- 中间文字：`<text>` 居中

### 3.4 TaskList 任务列表

**用途**：展示当日学习任务，支持勾选完成。

**UI 结构**：

```
┌─────────────────────────────────────────────────────────┐
│  ☐   📖  听力 Section 1 - Conversations    30min   >   │
│  ☑   📝  阅读 Passage 1 - True/False/Not Given  45min  │
│  ☐   🗣️  口语 Part 2 - 人物描述          20min        │
│  ☑   ✍️  写作 Task 1 - 图表描述              🎯  →  ▶  │  ← 已完成 (带分数)
├─────────────────────────────────────────────────────────┤
│  完成: 2/4  总学习时长: 2h 15m                          │  ← 底部统计
└─────────────────────────────────────────────────────────┘
```

**已完成状态**：文字添加 `line-through`，透明度降低至 `opacity-60`，图标替换为绿色勾选。

### 3.5 WritingEditor 写作编辑器

**用途**：雅思写作 Task 1 / Task 2 的模拟写作环境。

**UI 结构**：

```
┌──────────────────────────────────────────────────────────────┐
│  [Task 1] [Task 2]                      ⏱ 35:42  [提交]   │  ← 任务切换 + 倒计时 + 提交
├──────────────────────────────────────────────────────────────┤
│  题目区域:                                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ The chart below shows...                               │  │  ← 题目卡 (浅色分割线)
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  作文编辑区:                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ The line graph illustrates...                          │  │  ← Input(multiline)
│  │                                                        │  │     背景 bg-elevated
│  │                                                        │  │     高亮行显示字数
│  └─ 248 words ────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  [✕ 退出]                                [保存草稿] [提交]  │  ← 底部操作栏
└──────────────────────────────────────────────────────────────┘
```

**核心交互**：
- 选择 Task 1 / Task 2 → 切换题目 + 推荐用时
- 倒计时显示剩余时间（Task 1: 20min, Task 2: 40min）
- 实时单词数统计
- 提交 → 模态框确认 → AI 评分流转

### 3.6 ScoreCard 分数卡片

**用途**：展示 AI 评分的总分与四个维度得分。

**UI 结构**：

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│           大分展示区                                   │
│           ┌────────┐                                 │
│           │  7.5   │  ← font-display text-4xl         │
│           │  总分   │  ← text-secondary                │
│           └────────┘                                 │
│                                                      │
│  ┌─────────┬─────────┬─────────┬─────────┐          │
│  │  7.0    │  7.5    │  8.0    │  7.0    │          │  ← 四维网格
│  │ 任务完成 │ 连贯衔接 │ 词汇资源 │ 语法准确 │          │
│  │  ████   │  █████  │  ██████ │  ████   │          │  ← 进度条 (各维度)
│  └─────────┴─────────┴─────────┴─────────┘          │
│                                                      │
│  评分时间: 2026-05-21 14:30                          │  ← 底部 meta 信息
└──────────────────────────────────────────────────────┘
```

### 3.7 CorrectionList 批注列表

**用途**：逐条展示 AI 对写作/口语的纠错建议。

**UI 结构**：

```
┌─────────────────────────────────────────────────────────────┐
│  [语法错误] [用词不当] [表达优化]                               │  ← 分类标签页
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌── 错误类型标签 ────────────────────────────────────────┐  │
│  │ [语法] 主谓不一致                                       │  │  ← Badge (status)
│  │                                                         │  │
│  │ ❌ The students studies hard.                           │  │  ← 原文 (text-error 红色)
│  │ ✅ The students study hard.                             │  │  ← 修改 (text-success 绿色)
│  │                                                         │  │
│  │  主体: students 是复数, 谓语应用 study 而非 studies      │  │  ← 解释 (text-secondary)
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── [词汇] 用词重复 ──────────────────────────────────────┐  │
│  │ ❌ ...important and important...                        │  │
│  │ ✅ ...important and crucial...                          │  │
│  │  建议: 使用同义词避免重复                                │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**类型定义**：

```ts
interface CorrectionItem {
  id: string;
  type: 'grammar' | 'vocabulary' | 'optimization';
  original: string;               // 原文片段
  corrected: string;              // 修改后片段
  explanation: string;            // 解释说明
  severity?: 'minor' | 'major';  // 严重程度
}
```

### 3.8 FlashCard 闪卡

**用途**：单词记忆，正面显示单词，点击翻转显示释义。

**UI 结构**：

```
┌──────────────────────────────────────┐
│              (点击翻转)                │
│                                      │
│           ┌──────────────┐           │
│           │              │           │
│           │  Vocabulary   │           │  ← 正面卡片
│           │  词性标注     │           │     ↕ CSS 3D flip
│           │              │           │
│           └──────────────┘           │
│              ↓ 点击翻转 ↓             │
│           ┌──────────────┐           │
│           │  释义        │           │
│           │  音标        │           │
│           │  例句        │           │
│           └──────────────┘           │
│                                      │
│  12/50    [😊 认识] [🤔 不确定] [😰 忘记] │  ← 进度 + 评分按钮
└──────────────────────────────────────┘
```

**翻转动画实现**：使用 `perspective-1000` + `rotateY(180deg)` + `backface-visibility: hidden`，CSS transition 400ms。

### 3.9 WordHeatmap 单词热力图

**用途**：GitHub 风格日历图，展示 12 个月的学习活跃度。

**UI 结构**：

```
┌──────────────────────────────────────────────────────────────┐
│  学习活跃度                       [2026 ▼]                   │
├──────────────────────────────────────────────────────────────┤
│  Mon ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐      │
│  Wed │█││ ││█││█││ ││ ││█││ ││█││█││ ││ ││█││ ││ ││█│      │
│  Fri │█││ ││█││█││ ││ ││█││ ││█││█││ ││ ││█││ ││ ││█│      │
│       └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘      │
│        Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov Dec│
├──────────────────────────────────────────────────────────────┤
│  Less ████████████████████████████████████████████  More     │  ← 渐变色图例
│       #1e3022 → #2d4532 → #4a7c4a → #6ec56e                 │
└──────────────────────────────────────────────────────────────┘
```

**数据格式**：

```ts
interface HeatmapData {
  date: string;                   // 'YYYY-MM-DD'
  count: number;                  // 学习单词数
}

type HeatmapProps = {
  data: HeatmapData[];
  year?: number;
  colorScheme?: 'green' | 'gold';
};
```

### 3.10 ChatBubble 聊天气泡

**用途**：AI 口语练习中的对话气泡，区分用户 / AI / 学习伙伴。

**UI 结构**：

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  用户                           AI 小助手                    │
│  ┌─────────────────┐           ┌────────────────────────┐  │
│  │ I think...       │           │ Great! But try using   │  │
│  │                  │           │ "in my opinion" for    │  │
│  │                  │           │ a more formal tone.    │  │
│  └─────────────────┘           │                        │  │
│       14:30                    │        [+10点]          │  │
│                                 │                  14:31  │  │
│                                └────────────────────────┘  │
│                                                             │
│  伙伴                          ┌────────────────────────┐  │
│  ┌─────────────────┐           │ ★ 语法提示: "think"    │  │
│  │ That's a good   │           │ 后接从句时建议添加     │  │
│  │ point!          │           │ "that"                │  │
│  └─────────────────┘           └────────────────────────┘  │
│       14:31                                                   │
└─────────────────────────────────────────────────────────────┘
```

**变体**：

| 角色 | 对齐 | 背景色 | 圆角 | 特殊元素 |
|---|---|---|---|---|
| `user` | 右对齐 | `bg-brand-primary/15` | `rounded-md rounded-br-sm` | 无 |
| `agent` | 左对齐 | `bg-elevated` | `rounded-md rounded-bl-sm` | 评分点数徽章 |
| `partner` | 左对齐 | `bg-blue-500/10` | `rounded-md rounded-bl-sm` | 头像标记 |
| `hint` | 左对齐（缩进） | `bg-amber-500/10` | `rounded-md` | 语法提示星级 |

### 3.11 TopicSelector 话题选择器

**用途**：口语练习中按难度选择话题。

**UI 结构**：

```
┌─────────────────────────────────────────────────────────┐
│  [全部] [易] [中] [难]              ← 难度过滤标签        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │ 🎭 人物描述              │  │ 🏠 家居与生活方式      │  │
│  │ 8个话题                   │  │ 6个话题               │  │
│  │ [难度: ★★☆☆☆] x2.0     │  │ [难度: ★★★☆☆] x2.5  │  │
│  └─────────────────────────┘  └──────────────────────┘  │
│  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │ 🌍 环境与自然            │  │ 📚 教育与学习         │  │
│  │ 12个话题                  │  │ 10个话题              │  │
│  │ [难度: ★★★★☆] x3.0    │  │ [难度: ★★★☆☆] x2.5  │  │
│  └─────────────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**类型定义**：

```ts
interface TopicCategory {
  id: string;
  icon: string;                   // emoji
  name: string;
  topicCount: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  multiplier: number;             // 得分倍率
}
```

### 3.12 LeaderBoardRow 排行榜行

**用途**：展示排行榜上的一行数据。

**UI 结构**：

```
┌─────────────────────────────────────────────────────────────┐
│   🥇                        🥈               🥉             │
│  ┌──────────────────────────┬────────────────┬────────────┐ │
│  │ 🥇   Avatar    Sarah Chen │  总分 8,520     │  🔥 7天   │ │
│  │    #1          Lv.4       │  ↑ 本周+320     │  连续学习  │ │
│  └──────────────────────────┴────────────────┴────────────┘ │
│  ┌──────────────────────────┬────────────────┬────────────┐ │
│  │ 🥈   Avatar    Mike Zhou  │  总分 7,840     │  🔥 5天   │ │
│  │    #2          Lv.3       │  ↑ 本周+210     │  连续学习  │ │
│  └──────────────────────────┴────────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**金牌/银牌/铜牌**：
- #1: 🥇 `text-brand-gold`
- #2: 🥈 `text-gray-300`
- #3: 🥉 `text-amber-600` (`#c4893a`)
- #4+: `text-tertiary` 序号数字

### 3.13 AgentChatHeader AI 对话头

**用途**：AI 口语伙伴的个人信息头部，含性格切换。

**UI 结构**：

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                     │
│  │      │  Emma  (在线 🟢)                                    │  ← Avatar + 状态
│  │Avatar│  你的 AI 口语搭档                                    │  ← 描述
│  │      │  性格: [正式] [友好] [幽默]                          │  ← Personality Tabs
│  └──────┘                                                     │
├──────────────────────────────────────────────────────────────┤
│  [开始对话] [练习历史] [表现分析]                              │  ← 快捷操作
└──────────────────────────────────────────────────────────────┘
```

### 3.14 MemoryItem 记忆条目

**用途**：展示 AI 记住的用户信息。

**UI 结构**：

```
┌──────────────────────────────────────────────────────────────┐
│  [个人] 用户目标是雅思 7.0，重点提升写作                       │  ← 类型标签 + 内容
│  引用次数: 3           2026-05-20                    [🗑 删除] │  ← 引用计数 + 时间 + 操作
├──────────────────────────────────────────────────────────────┤
│  [兴趣] 喜欢科技类话题，尤其 AI 相关                           │
│  引用次数: 5           2026-05-18                    [🗑 删除] │
└──────────────────────────────────────────────────────────────┘
```

### 3.15 NotificationItem 通知条目

**用途**：展示系统通知。

**UI 结构**：

```
┌──────────────────────────────────────────────────────────────┐
│  🔔  学习提醒                    2 分钟前                     │
│       今天还有 2 个任务未完成                                  │
│                                       [标记已读] [查看]       │
├──────────────────────────────────────────────────────────────┤
│  ⭐  成就解锁                    1 小时前                     │
│       连续学习 7 天成就已达成!                                 │
│                                       [查看成就]              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 组件树 (Component Tree)

### 4.1 顶层结构

```
<App>
  └── <AppLayout>
        ├── <Sidebar>                    ← 左侧导航栏 (280px)
        │     ├── Logo + 品牌名
        │     ├── NavItem[]              ← 导航项列表
        │     │     ├── [仪表盘] icon + label
        │     │     ├── [写作练习] icon + label
        │     │     ├── [口语练习] icon + label
        │     │     ├── [词汇学习] icon + label
        │     │     ├── [AI 对话] icon + label
        │     │     ├── [AI 伙伴] icon + label
        │     │     ├── [成绩报告] icon + label
        │     │     ├── [上传资料] icon + label
        │     │     ├── [排行榜] icon + label
        │     │     └── [设置] icon + label
        │     └── UserInfoCard           ← 底部用户信息
        │
        ├── <Header>                     ← 顶部栏
        │     ├── PageTitle
        │     ├── SearchInput
        │     ├── NotificationBell
        │     └── Avatar (用户)
        │
        └── <MainContent>               ← 内容区域
              └── <Router>
                    ├── /dashboard     → <DashboardPage>
                    ├── /writing       → <WritingPage>
                    ├── /speaking      → <SpeakingPage>
                    ├── /vocab         → <VocabularyPage>
                    ├── /chat          → <ChatPage>
                    ├── /agent         → <AgentPage>
                    ├── /score         → <ScorePage>
                    ├── /upload        → <UploadPage>
                    ├── /leaderboard   → <LeaderboardPage>
                    └── /settings      → <SettingsPage>
```

### 4.2 页面组件组合

```tsx
// 示例: DashboardPage 组件组合
function DashboardPage() {
  return (
    <div className="space-6">
      <StudyCalendar />                    {/* 学习日历 */}
      <div className="grid grid-cols-2 gap-6">
        <StudyTimer />                     {/* 学习计时器 */}
        <DualProgressRing />               {/* 双人进度 */}
      </div>
      <TaskList />                         {/* 任务列表 */}
      <WordHeatmap />                      {/* 热力图 */}
    </div>
  );
}
```

### 4.3 Sidebar 导航项类型

```ts
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}
```

---

## 5. Props 表 (Props Tables)

### 5.1 Button

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | 按钮样式变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `loading` | `boolean` | `false` | 加载态，显示 Spinner 替代 children |
| `disabled` | `boolean` | `false` | 禁用态 |
| `fullWidth` | `boolean` | `false` | 宽度 100% |
| `icon` | `React.ReactNode` | `undefined` | 左侧图标 |
| `iconRight` | `React.ReactNode` | `undefined` | 右侧图标 |
| `children` | `React.ReactNode` | - | 按钮文字 / 内容 |
| `onClick` | `(e: MouseEvent) => void` | `undefined` | 点击回调 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `className` | `string` | `''` | 外部类名覆盖 |

### 5.2 Input

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `label` | `string` | `undefined` | 标签文字 |
| `placeholder` | `string` | `undefined` | 占位符 |
| `error` | `string` | `undefined` | 错误信息（非空时显示错误样式） |
| `hint` | `string` | `undefined` | 辅助提示（底部小字） |
| `value` | `string` | - | 当前值 |
| `onChange` | `(value: string) => void` | - | 值变化回调 |
| `disabled` | `boolean` | `false` | 禁用态 |
| `icon` | `React.ReactNode` | `undefined` | 前置图标 |
| `iconRight` | `React.ReactNode` | `undefined` | 后置图标 |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'search'` | `'text'` | 输入类型 |
| `multiline` | `boolean` | `false` | textarea 多行模式 |
| `rows` | `number` | `4` | 多行模式行数 |
| `maxLength` | `number` | `undefined` | 最大字符数 |
| `className` | `string` | `''` | 外部类名 |

### 5.3 Card

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `variant` | `'container' \| 'interactive' \| 'stats'` | `'container'` | 卡片变体 |
| `accentColor` | `string` | `'#6ec56e'` | stats 卡片顶部色条颜色 |
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | 内边距 |
| `children` | `React.ReactNode` | - | 卡片内容 |
| `onClick` | `() => void` | `undefined` | 点击回调 |
| `className` | `string` | `''` | 外部类名 |

### 5.4 Badge

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `variant` | `'status' \| 'count' \| 'level' \| 'achievement'` | `'status'` | 徽章变体 |
| `status` | `'success' \| 'warning' \| 'error' \| 'info' \| 'pending'` | `undefined` | 状态类型 (仅 status 变体) |
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `undefined` | 等级 (仅 level 变体) |
| `label` | `string` | - | 徽章文本 |
| `count` | `number` | `undefined` | 数字 (仅 count 变体) |
| `size` | `'sm' \| 'md'` | `'md'` | 尺寸 |
| `className` | `string` | `''` | 外部类名 |

### 5.5 Tabs

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `variant` | `'pill' \| 'underline'` | `'pill'` | 标签样式 |
| `items` | `TabItem[]` | - | 标签项数组 |
| `value` | `string` | - | 当前选中值 |
| `onChange` | `(value: string) => void` | - | 切换回调 |
| `className` | `string` | `''` | 外部类名 |

**TabItem**:

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string` | - | 唯一值 |
| `label` | `string` | - | 显示文字 |
| `icon` | `React.ReactNode` | `undefined` | 图标 |
| `disabled` | `boolean` | `false` | 禁用 |
| `badge` | `number` | `undefined` | 角标数字 |

### 5.6 Modal

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `open` | `boolean` | - | 是否打开 |
| `onClose` | `() => void` | - | 关闭回调 |
| `title` | `string` | `undefined` | 标题 |
| `description` | `string` | `undefined` | 描述文字 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | 宽度 |
| `children` | `React.ReactNode` | - | 主体内容 |
| `showCloseButton` | `boolean` | `true` | 显示关闭 X 按钮 |
| `closeOnOverlay` | `boolean` | `true` | 点击遮罩关闭 |
| `closeOnEsc` | `boolean` | `true` | 按 Escape 关闭 |
| `footer` | `React.ReactNode` | `undefined` | 底部操作区 |

### 5.7 Toast (useToast hook)

| 方法 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `toast` | `Omit<ToastItem, 'id'>` | `string` (id) | 显示一条通知 |
| `dismiss` | `id: string` | `void` | 关闭指定通知 |
| `dismissAll` | - | `void` | 关闭所有通知 |

**ToastItem**:

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | - | 通知类型 |
| `title` | `string` | - | 标题 |
| `description` | `string` | `undefined` | 详情 |
| `duration` | `number` | `5000` | 自动消失毫秒 (0=不消失) |
| `action` | `{ label: string, onClick: () => void }` | `undefined` | 操作按钮 |

### 5.8 ProgressBar

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `variant` | `'linear' \| 'ring'` | `'linear'` | 进度条样式 |
| `value` | `number` | - | 当前进度 (0-100) |
| `max` | `number` | `100` | 最大值 |
| `label` | `string` | `undefined` | 显示标签 (默认显示百分比) |
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | linear 高度 |
| `color` | `string` | `'#6ec56e'` | 进度条颜色 |
| `strokeWidth` | `number` | `6` | ring 描边宽度 |
| `sizePx` | `number` | `48` | ring 尺寸 (px) |
| `className` | `string` | `''` | 外部类名 |

### 5.9 Avatar

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `src` | `string` | `undefined` | 头像图片 URL |
| `name` | `string` | - | 用户名 (首字母 fallback) |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 尺寸 |
| `status` | `'online' \| 'offline' \| 'idle'` | `undefined` | 在线状态 |
| `showStatus` | `boolean` | `false` | 是否显示状态圆点 |
| `className` | `string` | `''` | 外部类名 |

### 5.10 Tooltip

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `content` | `React.ReactNode` | - | 提示内容 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 出现位置 |
| `delay` | `number` | `300` | 显示延迟 (ms) |
| `children` | `React.ReactNode` | - | 触发元素 |
| `className` | `string` | `''` | 外部类名 |

---

## 6. 状态管理 (State Management)

采用 **Zustand** 作为全局状态管理器，每个 Store 独立文件。

### 6.1 authStore — 用户认证

```ts
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;                    // 1-5
  targetScore: number;              // 目标分数
  joinDate: string;
}

interface Partner {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  isOnline: boolean;
  relationship: 'friend' | 'stranger' | 'blocked';
  mutualDays: number;               // 共同学习天数
}

interface Session {
  token: string;
  expiresAt: string;
}

interface AuthState {
  user: User | null;
  partner: Partner | null;
  session: Session | null;
  isAuthenticated: boolean;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setPartner: (partner: Partner) => void;
  updateUser: (partial: Partial<User>) => void;
  updateSession: (session: Session) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      partner: null,
      session: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({
          session: { token, expiresAt: '' },
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          partner: null,
          session: null,
          isAuthenticated: false,
        }),

      setPartner: (partner) => set({ partner }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      updateSession: (session) => set({ session }),
    }),
    { name: 'partner-ielts-auth' }
  )
);
```

### 6.2 studyStore — 学习数据

```ts
// stores/studyStore.ts
import { create } from 'zustand';

interface CalendarDay {
  date: string;                     // 'YYYY-MM-DD'
  duration: number;                 // 分钟
  tasks: StudyTask[];
}

interface StudyTask {
  id: string;
  subject: 'listening' | 'reading' | 'writing' | 'speaking';
  title: string;
  duration: number;                 // 预计分钟
  completed: boolean;
  completedAt?: string;
  score?: number;
}

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number;                  // 秒
  subject: StudyTask['subject'] | null;
  startTime: string | null;
}

interface StudyState {
  calendarData: CalendarDay[];       // 当月日历数据
  todayTasks: StudyTask[];
  timer: TimerState;
  weeklyDuration: {                  // 本周每日时长
    day: string;
    minutes: number;
  }[];

  // Actions
  fetchCalendarData: (month: string) => Promise<void>;
  toggleTask: (taskId: string) => void;
  startTimer: (subject: StudyTask['subject']) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;             // 每秒调用
}

export const useStudyStore = create<StudyState>((set, get) => ({
  calendarData: [],
  todayTasks: [],
  timer: {
    isRunning: false,
    isPaused: false,
    elapsed: 0,
    subject: null,
    startTime: null,
  },
  weeklyDuration: [],

  fetchCalendarData: async (month) => {
    // API call to fetch calendar data
  },

  toggleTask: (taskId) =>
    set((state) => ({
      todayTasks: state.todayTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    })),

  startTimer: (subject) =>
    set({
      timer: {
        isRunning: true,
        isPaused: false,
        elapsed: 0,
        subject,
        startTime: new Date().toISOString(),
      },
    }),

  pauseTimer: () =>
    set((state) => ({
      timer: { ...state.timer, isPaused: true, isRunning: false },
    })),

  resumeTimer: () =>
    set((state) => ({
      timer: { ...state.timer, isPaused: false, isRunning: true },
    })),

  stopTimer: () =>
    set({
      timer: {
        isRunning: false,
        isPaused: false,
        elapsed: 0,
        subject: null,
        startTime: null,
      },
    }),

  tickTimer: () =>
    set((state) => ({
      timer: {
        ...state.timer,
        elapsed: state.timer.elapsed + 1,
      },
    })),
}));
```

### 6.3 vocabStore — 词汇

```ts
// stores/vocabStore.ts
import { create } from 'zustand';

interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;                   // 中文释义
  example: string;                   // 例句
  partOfSpeech: string;
  level: number;
  nextReview: string;                // ISO date
  reviewCount: number;
  easeFactor: number;                // SM-2 算法参数
}

interface ReviewRecord {
  wordId: string;
  date: string;
  rating: 1 | 2 | 3;               // 忘记 / 不确定 / 认识
}

interface VocabState {
  dueWords: VocabWord[];             // 待复习单词
  reviewHistory: ReviewRecord[];     // 复习历史
  currentIndex: number;              // 当前闪卡索引

  // Actions
  fetchDueWords: () => Promise<void>;
  rateWord: (wordId: string, rating: 1 | 2 | 3) => void;
  nextCard: () => void;
  prevCard: () => void;
  getHeatmapData: (year: number) => { date: string; count: number }[];
}
```

### 6.4 chatStore — AI 对话

```ts
// stores/chatStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'agent' | 'partner' | 'hint';
  content: string;
  timestamp: string;
  points?: number;                   // AI 评分
  hint?: {                           // 语法提示
    type: 'grammar' | 'vocabulary';
    original: string;
    corrected: string;
  };
}

interface BattleState {
  isActive: boolean;
  currentRound: number;
  totalRounds: number;
  userScore: number;
  partnerScore: number;
  topic: string;
}

interface ChatState {
  activeTopic: string | null;        // 当前话题 ID
  messages: Message[];
  battle: BattleState;
  isTyping: boolean;                 // AI 正在输入

  // Actions
  setActiveTopic: (topicId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  startBattle: (topic: string, rounds: number) => void;
  endBattle: () => void;
  updateBattleScore: (role: 'user' | 'partner', points: number) => void;
}
```

### 6.5 agentStore — AI 伙伴

```ts
// stores/agentStore.ts
import { create } from 'zustand';

interface Memory {
  id: string;
  type: 'personal' | 'preference' | 'interest' | 'progress';
  content: string;
  referenceCount: number;
  createdAt: string;
}

interface AgentConfig {
  name: string;
  personality: 'formal' | 'friendly' | 'humorous';
  avatarStyle: string;
  voiceEnabled: boolean;
}

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'system' | 'partner';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface AgentState {
  agentInfo: {
    name: string;
    level: number;
    description: string;
  };
  memories: Memory[];
  notifications: Notification[];
  config: AgentConfig;

  // Actions
  fetchMemories: () => Promise<void>;
  deleteMemory: (id: string) => void;
  setPersonality: (personality: AgentConfig['personality']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}
```

### 6.6 uiStore — 界面状态

```ts
// stores/uiStore.ts
import { create } from 'zustand';

type Page =
  | 'dashboard'
  | 'writing'
  | 'speaking'
  | 'vocab'
  | 'chat'
  | 'agent'
  | 'score'
  | 'upload'
  | 'leaderboard'
  | 'settings';

interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  currentPage: Page;
  toasts: ToastItem[];

  // Actions
  toggleSidebar: () => void;
  setCurrentPage: (page: Page) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'dark',
  sidebarCollapsed: false,
  currentPage: 'dashboard',
  toasts: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCurrentPage: (page) => set({ currentPage: page }),

  setTheme: (theme) => set({ theme }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { ...toast, id }],
    }));

    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration ?? 5000);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
```

---

## 附录

### A. 目录结构

```
src/
├── components/
│   ├── ui/                          # 通用 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Avatar.tsx
│   │   └── Tooltip.tsx
│   ├── features/                    # 功能组件
│   │   ├── StudyCalendar.tsx
│   │   ├── StudyTimer.tsx
│   │   ├── DualProgressRing.tsx
│   │   ├── TaskList.tsx
│   │   ├── WritingEditor.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── CorrectionList.tsx
│   │   ├── FlashCard.tsx
│   │   ├── WordHeatmap.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── TopicSelector.tsx
│   │   ├── LeaderBoardRow.tsx
│   │   ├── AgentChatHeader.tsx
│   │   ├── MemoryItem.tsx
│   │   └── NotificationItem.tsx
│   └── layout/
│       ├── AppLayout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── stores/
│   ├── authStore.ts
│   ├── studyStore.ts
│   ├── vocabStore.ts
│   ├── chatStore.ts
│   ├── agentStore.ts
│   └── uiStore.ts
├── hooks/
│   ├── useTimer.ts                  # 计时器逻辑
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── utils.ts                     # cn() 等工具函数
│   └── constants.ts                 # 颜色映射、尺寸常量
├── types/
│   └── index.ts                     # 共享类型定义
├── pages/
│   ├── DashboardPage.tsx
│   ├── WritingPage.tsx
│   ├── SpeakingPage.tsx
│   ├── VocabularyPage.tsx
│   ├── ChatPage.tsx
│   ├── AgentPage.tsx
│   ├── ScorePage.tsx
│   ├── UploadPage.tsx
│   ├── LeaderboardPage.tsx
│   └── SettingsPage.tsx
├── styles/
│   └── globals.css                  # Tailwind directives + 字体引入
├── tailwind.config.ts
└── App.tsx
```

### B. 关键依赖

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next": "^14.2.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.400.0",
    "framer-motion": "^11.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0"
  }
}
```

> **本文档对应 Partner IELTS 版本 v1.0.0，所有组件规范、API 接口和存储结构以本文为准。**
