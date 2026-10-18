import React, { useMemo, useState } from 'react'
import { useClient, useDocumentOperation, type DocumentActionComponent } from 'sanity'
import { Box, Button, Card, Flex, Stack, Text, TextArea } from '@sanity/ui'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { parseFacebookPost } from './parseFacebookPost'
import { articleFields, toFigures } from './buildArticle'
import { CATEGORIES } from '../schemaTypes/shared'

// 專欄文章右下角選單的「從臉書貼文匯入」：貼上臉書全文、拖進圖片，自動填好文章欄位。
// 只填草稿，不會自動發布；認不出來的地方會列出來請同仁補。

export const ImportFacebookAction: DocumentActionComponent = (props) => {
  const { patch } = useDocumentOperation(props.id, props.type)
  const client = useClient({ apiVersion: '2024-01-01' })
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string[] | null>(null)
  const [error, setError] = useState('')

  const parsed = useMemo(() => (raw.trim() ? parseFacebookPost(raw) : null), [raw])
  const doc: any = props.draft || props.published
  const hasContent = Boolean(doc?.title || doc?.body?.length)

  const close = () => {
    setOpen(false)
    setRaw('')
    setFiles([])
    setResult(null)
    setError('')
    props.onComplete()
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFiles((prev) => [...prev, ...Array.from(list).filter((f) => f.type.startsWith('image/'))])
  }
  const moveFirst = (i: number) => setFiles((prev) => [prev[i], ...prev.filter((_, j) => j !== i)])
  const remove = (i: number) => setFiles((prev) => prev.filter((_, j) => j !== i))

  async function run() {
    if (!parsed) return
    setBusy(true)
    setError('')
    try {
      const ids: string[] = []
      for (const f of files) ids.push((await client.assets.upload('image', f, { filename: f.name }))._id)
      const { fields, notes } = await articleFields(client, parsed, toFigures(parsed, ids), {
        docId: props.id,
        currentSlug: doc?.slug?.current,
      })
      patch.execute([{ set: fields }])
      setResult(notes)
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  const row = (label: string, value?: string) => (
    <Flex gap={3}>
      <Box style={{ width: '5em', flex: 'none' }}>
        <Text size={1} muted>{label}</Text>
      </Box>
      <Text size={1}>{value || '（認不出來，匯入後請手動填）'}</Text>
    </Flex>
  )

  const content = result ? (
    <Stack space={4}>
      <Text weight="semibold">已經填好了，還沒發布。請檢查：</Text>
      <Stack space={3}>
        {result.map((n) => (
          <Text key={n} size={1}>・{n}</Text>
        ))}
      </Stack>
      <Button text="好，我去檢查" tone="primary" onClick={close} />
    </Stack>
  ) : (
    <Stack space={4}>
      {hasContent && (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>這篇已經有內容，匯入會覆蓋標題、摘要、內文、分類等欄位。</Text>
        </Card>
      )}
      <Stack space={2}>
        <Text size={1} weight="semibold">1. 貼上臉書貼文全文（從「慢活文字專欄｜」那行到最後的 #臺灣慢活教育學會）</Text>
        <TextArea rows={10} value={raw} onChange={(e) => setRaw(e.currentTarget.value)} placeholder="慢活文字專欄｜每月一味，跟著氣味學慢活……" />
      </Stack>

      <Stack space={2}>
        <Text size={1} weight="semibold">2. 加入圖片（第一張會當封面）</Text>
        <Card
          padding={4}
          radius={2}
          border
          style={{ borderStyle: 'dashed', textAlign: 'center' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            addFiles(e.dataTransfer.files)
          }}
        >
          <Stack space={3}>
            <Text size={1} muted>把圖片拖到這裡，或</Text>
            <Box>
              <label>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.currentTarget.files)} />
                <Text size={1}>
                  <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>選擇檔案</span>
                </Text>
              </label>
            </Box>
          </Stack>
        </Card>
        {files.map((f, i) => (
          <Flex key={`${f.name}-${i}`} gap={2} align="center">
            <Box flex={1}>
              <Text size={1} textOverflow="ellipsis">
                {i === 0 ? '封面　' : `${i + 1}.　`}
                {f.name}
              </Text>
            </Box>
            {i > 0 && <Button mode="bleed" fontSize={1} padding={2} text="設為封面" onClick={() => moveFirst(i)} />}
            <Button mode="bleed" tone="critical" fontSize={1} padding={2} text="移除" onClick={() => remove(i)} />
          </Flex>
        ))}
      </Stack>

      {parsed && (
        <Card padding={3} radius={2} tone="transparent" border>
          <Stack space={3}>
            <Text size={1} weight="semibold">3. 自動判斷的結果</Text>
            {row('標題', parsed.title)}
            {row('分類', CATEGORIES.find((c) => c.value === parsed.category)?.title)}
            {parsed.series && row('系列', parsed.series)}
            {row('作者', parsed.authorName)}
            {row('日期', parsed.publishedAt)}
            {row('內文', `${parsed.paragraphs.length} 段`)}
            {parsed.warnings.map((w) => (
              <Text key={w} size={1} style={{ color: 'var(--card-badge-caution-fg-color, #8a6100)' }}>⚠ {w}</Text>
            ))}
          </Stack>
        </Card>
      )}

      {error && (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>匯入失敗：{error}</Text>
        </Card>
      )}

      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text="取消" onClick={close} disabled={busy} />
        <Button tone="primary" text={busy ? '匯入中……' : '匯入'} onClick={run} disabled={!parsed || busy} loading={busy} />
      </Flex>
    </Stack>
  )

  return {
    label: '從臉書貼文匯入',
    icon: DocumentTextIcon,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog',
      header: '從臉書貼文匯入',
      onClose: close,
      content,
    },
  }
}
