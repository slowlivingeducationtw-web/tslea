import type { StructureResolver } from 'sanity/structure'

// 左側選單。刻意用同事腦中的分類，而不是資料庫結構。
export const structure: StructureResolver = (S) => {
  const single = (type: string, title: string, icon?: string) =>
    S.listItem()
      .title(icon ? `${icon}  ${title}` : title)
      .id(type)
      .child(S.document().schemaType(type).documentId(type).title(title))

  return S.list()
    .title('臺灣慢活教育學會')
    .items([
      S.listItem()
        .title('📝  內容')
        .child(
          S.list()
            .title('內容')
            .items([
              S.documentTypeListItem('article').title('專欄文章'),
              S.documentTypeListItem('event').title('活動資訊'),
              S.documentTypeListItem('planItem').title('年度計畫項目'),
              S.documentTypeListItem('author').title('作者'),
            ]),
        ),

      S.listItem()
        .title('👥  組織')
        .child(
          S.list()
            .title('組織')
            .items([S.documentTypeListItem('person').title('理監事與成員')]),
        ),

      S.divider(),

      S.listItem()
        .title('📄  頁面文案')
        .child(
          S.list()
            .title('頁面文案')
            .items([
              single('homePage', '首頁'),
              single('themesSection', '三大共學主題'),
              single('plansPage', '年度計畫'),
              single('donatePage', '捐款支持'),
              single('contactPage', '聯絡我們'),
              single('boardAreaPage', '理監事專區'),
            ]),
        ),

      S.divider(),

      single('siteSettings', '網站設定', '⚙️'),
    ])
}
