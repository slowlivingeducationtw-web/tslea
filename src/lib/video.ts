// 後台「影片」欄位的網址 → 網站上的播放器網址與縮圖。
// YouTube 用 youtube-nocookie.com（訪客按播放前不寫入追蹤 cookie）。

/** 從各種 YouTube 網址取出影片 ID：watch?v=、youtu.be/、shorts/、embed/、live/ */
export function youtubeId(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^(www|m)\./, '')
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || undefined
    if (host === 'youtube.com') {
      if (u.searchParams.get('v')) return u.searchParams.get('v')!
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]+)/)
      if (m) return m[2]
    }
  } catch {}
  return undefined
}

/** 播放器網址（YouTube 或 Facebook），不支援的網址回傳 undefined */
export function videoEmbedUrl(url?: string): string | undefined {
  const id = youtubeId(url)
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0`
  if (url && /facebook\.com|fb\.watch/.test(url)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
  }
  return undefined
}

/** YouTube 影片縮圖（卡片沒有照片時用） */
export function videoThumb(url?: string): string | undefined {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined
}

/** 播放器 HTML（16:9），PortableText 與活動頁共用 */
export function videoHtml(url: string | undefined, title: string, caption?: string): string {
  const src = videoEmbedUrl(url)
  if (!src) return ''
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
  return `<figure class="video-embed"><div class="video-frame"><iframe src="${esc(src)}" title="${esc(title)}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>${
    caption ? `<figcaption>${esc(caption)}</figcaption>` : ''
  }</figure>`
}
