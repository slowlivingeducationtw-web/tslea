// 後台純文字轉成大標／重點句的 HTML（不連 Sanity，tests/ 可以直接測）

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/**
 * 後台的純文字轉成大標用的 HTML：Enter 換行變 <br>，並在「、・，」之後才允許斷行，
 * 手機上不會把詞拆成兩半。英文本來就照空格斷行，不包（整句不准斷會超出畫面）。
 */
const CJK = /[㐀-鿿豈-﫿]/

export function headlineHtml(text: string) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) =>
      line
        .split(/(?<=[、・，,；])/)
        .map((seg) => (CJK.test(seg) ? `<span class="nw">${esc(seg)}</span>` : esc(seg)))
        .join(''),
    )
    .join('<br>')
}

/** 換行變 <br>，並把指定字詞包成 <mark>（只標第一個出現的位置） */
export function highlightHtml(text: string, word?: string) {
  let html = esc(text.trim())
  if (word?.trim()) {
    const w = esc(word.trim())
    const i = html.indexOf(w)
    if (i >= 0) html = `${html.slice(0, i)}<mark>${w}</mark>${html.slice(i + w.length)}`
  }
  return html.replace(/\r?\n/g, '<br>')
}
