import { defineField, defineType } from 'sanity'
import { PERSON_GROUPS } from '../shared'

export const person = defineType({
  name: 'person',
  title: '理監事與成員',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '姓名',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'role',
      title: '職稱',
      type: 'string',
      description: '例：理事長、副理事長、理事、監事、秘書長、總幹事、財務顧問',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'group',
      title: '分組',
      type: 'string',
      description: '決定這個人顯示在名單的哪一區。',
      options: { list: PERSON_GROUPS, layout: 'radio', direction: 'horizontal' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'note',
      title: '備註（選填）',
      type: 'string',
      description: '顯示在姓名下方的小字。例：李臺鴒會計稅務記帳士事務所',
    }),
    defineField({
      name: 'term',
      title: '屆別',
      type: 'number',
      description: '第幾屆。換屆時新增新一屆的資料即可，舊的留著不用刪，網站只顯示最新一屆。',
      initialValue: 1,
      validation: (r) => r.required().integer().positive(),
    }),
    defineField({
      name: 'order',
      title: '排序',
      type: 'number',
      description: '數字小的排前面。同分組內有效。',
      initialValue: 10,
    }),
  ],
  orderings: [
    { title: '分組與排序', name: 'groupOrder', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { name: 'name', role: 'role', group: 'group', term: 'term' },
    prepare({ name, role, group, term }) {
      const g = PERSON_GROUPS.find((x) => x.value === group)?.title || ''
      return { title: `${role}　${name}`, subtitle: `${g}　·　第 ${term} 屆` }
    },
  },
})
