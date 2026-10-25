import React from 'react'
import { Card, Stack, Text } from '@sanity/ui'
import { useFormValue, type ObjectInputProps } from 'sanity'
import { LANGUAGES, sourceHash } from '../schemaTypes/i18n'

// 翻譯分頁最上方的狀態：尚未翻譯／中文改過／尚未校對。都正常就不顯示。
export function TranslationStatus(props: ObjectInputProps) {
  const doc = useFormValue([]) as Record<string, any> | undefined
  const value = (props.value ?? {}) as Record<string, any>
  const lines = LANGUAGES.slice(1).flatMap((lang) => {
    const tr = value[lang.code]
    const has = tr && Object.entries(tr).some(([k, v]) => !['_type', 'reviewed', 'sourceHash'].includes(k) && v != null && v !== '')
    if (!has) return [{ tone: 'primary' as const, text: `${lang.label}：尚未翻譯，英文網站目前顯示中文。` }]
    if (doc && tr.sourceHash && tr.sourceHash !== sourceHash(doc, doc._type))
      return [{ tone: 'caution' as const, text: `${lang.label}：中文在翻譯後改過，英文可能已過時。` }]
    if (!tr.reviewed) return [{ tone: 'transparent' as const, text: `${lang.label}：尚未校對。` }]
    return []
  })
  return (
    <Stack space={3}>
      {lines.map((l) => (
        <Card key={l.text} tone={l.tone} padding={3} radius={2} border>
          <Text size={1}>{l.text}</Text>
        </Card>
      ))}
      {props.renderDefault(props)}
    </Stack>
  )
}
