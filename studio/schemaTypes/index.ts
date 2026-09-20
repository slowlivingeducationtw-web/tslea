import { link } from './objects/link'
import { verse } from './objects/verse'
import { figure } from './objects/figure'
import { imageRow } from './objects/imageRow'
import { richText } from './objects/richText'

import { article } from './documents/article'
import { author } from './documents/author'
import { person } from './documents/person'
import { event } from './documents/event'
import { planItem } from './documents/planItem'

import { siteSettings } from './singletons/siteSettings'
import { homePage } from './singletons/homePage'
import { themesSection } from './singletons/themesSection'
import { plansPage } from './singletons/plansPage'
import { donatePage } from './singletons/donatePage'
import { contactPage } from './singletons/contactPage'
import { boardAreaPage } from './singletons/boardAreaPage'

// 全站只會有一份的文件。Studio 會把它們顯示成單一頁面，不是清單。
export const SINGLETONS = [
  'siteSettings',
  'homePage',
  'themesSection',
  'plansPage',
  'donatePage',
  'contactPage',
  'boardAreaPage',
] as const

export const schemaTypes = [
  link, verse, figure, imageRow, richText,
  article, author, person, event, planItem,
  siteSettings, homePage, themesSection, plansPage, donatePage, contactPage, boardAreaPage,
]
