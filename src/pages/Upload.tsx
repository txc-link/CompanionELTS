import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

// ─── Mock Data ──────────────────────────────────────────────────────────────
const formatBadges = [
  { label: 'PDF', color: 'bg-danger/20 text-danger border-danger/30', dot: 'bg-danger' },
  { label: 'DOCX', color: 'bg-info/20 text-info border-info/30', dot: 'bg-info' },
  { label: 'PNG/JPG', color: 'bg-accent-green/20 text-accent-green border-accent-green/30', dot: 'bg-accent-green' },
  { label: 'MP3', color: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30', dot: 'bg-accent-gold' },
]

const parsedResults = [
  { type: 'PDF', filename: '剑桥雅思18_T1.pdf', status: '解析完成', done: true, shared: true },
  { type: 'PNG', filename: '写作笔记_2024.png', status: 'OCR 完成', done: true, shared: false },
  { type: 'DOCX', filename: '口语Part2模板.docx', status: '转文字', done: true, shared: true },
]

const typeIcons: Record<string, string> = {
  PDF: '\u{1F4C4}',
  PNG: '\u{1F5BC}',
  DOCX: '\u{1F4DD}',
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Upload() {
  const [dragOver, setDragOver] = useState(false)
  const [uploading] = useState(true)
  const [copyrightOpen, setCopyrightOpen] = useState(false)

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          {'\u{1F4C1}'} 上传中心
        </h1>
        <p className="text-sm text-text-muted mt-1">
          拖拽上传 · AI 自动解析 · 搭子共享
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
        className={cn(
          'rounded-[16px] border-2 dashed p-10 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer',
          dragOver
            ? 'border-accent-green bg-accent-green/5'
            : 'border-border-subtle bg-bg-card hover:border-border-accent hover:bg-bg-elevated/50'
        )}
      >
        <span className="text-4xl">{'\u{1F4C2}'}</span>
        <p className="text-base font-semibold text-text-primary">
          拖拽文件到此处
        </p>
        <p className="text-xs text-text-muted">
          支持 PDF/Word/图片/音频
        </p>
        <Button variant="secondary" size="sm" className="mt-1">
          或点击选择文件
        </Button>
      </div>

      {/* Format Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {formatBadges.map((fmt) => (
          <span
            key={fmt.label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border',
              fmt.color
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', fmt.dot)} />
            {fmt.label}
          </span>
        ))}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardTitle>上传进度</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-primary font-medium">剑桥雅思18_T1.pdf</span>
              <span className="text-accent-green font-semibold">65%</span>
            </div>
            <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green/70 transition-all duration-700"
                style={{ width: '65%' }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* AI Parsed Results */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-3">
          {'\u{1F916}'} AI 解析结果
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {parsedResults.map((item) => (
            <Card key={item.filename} variant="interactive">
              <div className="flex flex-col gap-2.5">
                {/* Top row: type icon + filename */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{typeIcons[item.type]}</span>
                    <span className="text-xs text-text-primary font-medium truncate">
                      {item.filename}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <Badge variant={item.done ? 'success' : 'warning'} size="sm">
                    {item.status}
                    {item.done && ' \u2705'}
                  </Badge>

                  {/* Shared toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={item.shared}
                    />
                    <span
                      className={cn(
                        'w-[36px] h-[20px] rounded-full transition-all duration-200 peer',
                        item.shared
                          ? 'bg-accent-green'
                          : 'bg-border-subtle'
                      )}
                    >
                      <span
                        className={cn(
                          'block w-[16px] h-[16px] bg-white rounded-full transition-all duration-200 mt-[2px]',
                          item.shared ? 'ml-[18px]' : 'ml-[2px]'
                        )}
                      />
                    </span>
                    <span className="ml-1.5 text-[10px] text-text-muted">
                      {item.shared ? '共享' : '私密'}
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Copyright Notice Button */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCopyrightOpen(true)}
        >
          {'\u{00A9}'} 版权提示
        </Button>
      </div>

      {/* Copyright Modal */}
      <Modal
        isOpen={copyrightOpen}
        onClose={() => setCopyrightOpen(false)}
        title="版权责任提示"
        size="sm"
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            您上传的所有资料仅供个人学习使用。请确保您拥有上传内容的合法使用权，或该内容为公开的免费学习资源。
          </p>
          <p>
            平台不对用户上传内容的版权合规性承担责任。如涉及版权纠纷，由上传者自行承担全部法律责任。
          </p>
          <p className="text-text-muted text-xs">
            如有疑问，请联系我们。
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setCopyrightOpen(false)}>
            我知道了
          </Button>
        </div>
      </Modal>
    </div>
  )
}
