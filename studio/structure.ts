import type { StructureResolver } from 'sanity/structure'

// 左側選單。刻意用同事腦中的分類，而不是資料庫結構。
// 注意：每一個 list 與 listItem 都必須有唯一的 id，否則 Studio 執行時會出現
// 「`id` is required for lists」而整個結構讀不出來（編譯階段不會報錯）。
export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('臺灣慢活教育學會')
    .items([
      S.listItem()
        .id('content')
        .title('📝  內容')
        .child(
          S.list()
            .id('content-list')
            .title('內容')
            .items([
              S.documentTypeListItem('article').id('article').title('專欄文章'),
              S.documentTypeListItem('event').id('event').title('活動資訊'),
              S.documentTypeListItem('planItem').id('planItem').title('年度計畫項目'),
              S.documentTypeListItem('author').id('author').title('作者'),
            ]),
        ),

      S.listItem()
        .id('org')
        .title('👥  組織')
        .child(
          S.list()
            .id('org-list')
            .title('組織')
            .items([S.documentTypeListItem('person').id('person').title('理監事與成員')]),
        ),

      S.divider(),

      S.listItem()
        .id('pages')
        .title('📄  頁面文案')
        .child(
          S.list()
            .id('pages-list')
            .title('頁面文案')
            .items([
              singleton(S, 'homePage', '首頁'),
              singleton(S, 'themesSection', '三大共學主題'),
              singleton(S, 'plansPage', '年度計畫'),
              singleton(S, 'donatePage', '捐款支持'),
              singleton(S, 'contactPage', '聯絡我們'),
              singleton(S, 'boardAreaPage', '理監事專區'),
            ]),
        ),

      S.divider(),

      singleton(S, 'siteSettings', '網站設定', '⚙️'),
    ])

// 單例文件：文件 _id 與型別同名，直接開啟那一份，不顯示清單。
function singleton(S: any, type: string, title: string, icon?: string) {
  return S.listItem()
    .id(type)
    .title(icon ? `${icon}  ${title}` : title)
    .child(S.document().id(type).schemaType(type).documentId(type).title(title))
}
