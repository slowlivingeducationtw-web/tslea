import type { StructureResolver } from 'sanity/structure'
import { CATEGORIES } from './schemaTypes/shared'

// 左側選單。刻意用同事腦中的分類，而不是資料庫結構。
// 2026-10：年度計畫頁併入「認識學會」，plansPage／planItem 的資料保留但不再顯示在選單。
// 注意：每一個 list 與 listItem 都必須有唯一的 id，否則 Studio 執行時會出現
// 「`id` is required for lists」而整個結構讀不出來（編譯階段不會報錯）。
export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('臺灣慢活教育學會')
    .items([
      // 還沒發布：新寫的、或已發布但改了還沒按發布的，集中在這裡，不用一篇一篇找
      S.listItem()
        .id('unpublished')
        .title('🕓  還沒發布')
        .child(
          S.list()
            .id('unpublished-list')
            .title('還沒發布（含已發布但有修改）')
            .items([
              drafts(S, 'unpublished-article', '專欄文章（全部）', '_type == "article"'),
              ...CATEGORIES.map((c) =>
                drafts(S, `unpublished-${c.value}`, `　└ ${c.title}`, `_type == "article" && category == "${c.value}"`),
              ),
              S.divider(),
              drafts(S, 'unpublished-event', '活動', '_type == "event"'),
              drafts(S, 'unpublished-pages', '頁面文案與其他', '!(_type in ["article", "event"])'),
            ]),
        ),

      S.divider(),

      S.listItem()
        .id('content')
        .title('📝  內容')
        .child(
          S.list()
            .id('content-list')
            .title('內容')
            .items([
              S.listItem()
                .id('article')
                .title('專欄文章')
                .child(
                  S.list()
                    .id('article-list')
                    .title('專欄文章')
                    .items([
                      S.documentTypeListItem('article').id('article-all').title('全部文章'),
                      S.divider(),
                      ...CATEGORIES.map((c) =>
                        S.listItem()
                          .id(`article-${c.value}`)
                          .title(c.title)
                          .schemaType('article')
                          .child(() =>
                            S.documentList()
                              .id(`article-${c.value}-docs`)
                              .title(c.title)
                              .schemaType('article')
                              .apiVersion('2024-01-01')
                              .filter('_type == "article" && category == $cat')
                              .params({ cat: c.value })
                              .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                          ),
                      ),
                    ]),
                ),
              S.documentTypeListItem('event').id('event').title('活動（宣傳、報名、回顧）'),
              S.documentTypeListItem('activityType').id('activityType').title('學會活動類別'),
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
              // 順序與網站選單一致
              singleton(S, 'homePage', '首頁'),
              singleton(S, 'themesSection', '慢活共學主題＋學會活動類別'),
              S.divider(),
              singleton(S, 'aboutPage', '認識學會'),
              singleton(S, 'contactPage', '聯絡我們'),
              singleton(S, 'eventsPage', '活動'),
              singleton(S, 'columnPage', '慢活專欄'),
              singleton(S, 'joinPage', '加入我們'),
              singleton(S, 'partnerPage', '與我們合作'),
              singleton(S, 'donatePage', '與我們合作・捐款資訊'),
              S.divider(),
              singleton(S, 'boardAreaPage', '理監事專區'),
            ]),
        ),

      S.divider(),

      singleton(S, 'navigation', '選單與頁尾', '🧭'),
      singleton(S, 'siteSettings', '網站設定', '⚙️'),
    ])

// 只列草稿（新寫的，或已發布但有修改還沒按發布的）。清單用函式延後建立（要 Studio 執行時才有 schema）
function drafts(S: any, id: string, title: string, filter: string) {
  return S.listItem()
    .id(id)
    .title(title)
    .child(() =>
      S.documentList()
        .id(`${id}-docs`)
        .title(title.replace(/^[　└ ]+/, ''))
        .apiVersion('2024-01-01')
        .filter(`_id in path("drafts.**") && ${filter}`)
        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
    )
}

// 單例文件：文件 _id 與型別同名，直接開啟那一份，不顯示清單。
function singleton(S: any, type: string, title: string, icon?: string) {
  return S.listItem()
    .id(type)
    .title(icon ? `${icon}  ${title}` : title)
    .child(S.document().id(type).schemaType(type).documentId(type).title(title))
}
