// 全站共用的選項清單。要新增分類或色調，改這裡就好。

export const CATEGORIES = [
  { title: '身心健康', value: 'health' },
  { title: '藝術陪伴', value: 'art' },
  { title: '生態永續', value: 'eco' },
  { title: '慢旅共學', value: 'travel' },
  { title: '慢活小語', value: 'words' },
  { title: '其他', value: 'other' },
]

// 專欄系列（文章的「系列」下拉選單）。值要和網站上已有文章的系列名稱一字不差，
// 名稱的「｜」後面會當成按鈕上的短名（每月一字）。新增系列加在這裡，並到「慢活專欄」頁寫系列簡介。
export const SERIES = [
  { title: '每月一字・跟著文字學慢活（小明老師）', value: '慢活文字專欄｜每月一字' },
  { title: '每月一味・跟著氣味學慢活（小嵐老師）', value: '慢活文字專欄｜每月一味' },
  { title: '每月一遊・跟著旅人學慢活（楊導）', value: '慢活文字專欄｜每月一遊' },
]

export const ACCENTS = [
  { title: '沙綠', value: 'sage' },
  { title: '大地', value: 'earth' },
  { title: '天空', value: 'sky' },
]

export const PLAN_TRACKS = [
  { title: '會務運作', value: 'org' },
  { title: '業務發展', value: 'learn' },
  { title: '專案計畫', value: 'project' },
  { title: '財務規劃', value: 'finance' },
]

export const PERSON_GROUPS = [
  { title: '理事', value: 'director' },
  { title: '監事', value: 'supervisor' },
  { title: '行政秘書處', value: 'secretariat' },
  { title: '顧問', value: 'advisor' },
]
