// 首頁主視覺拿掉照片，只放背景影片（影片載入前顯示影片縮圖）。
// 2026-10-18 先拿掉第二頁，同日學會要求三頁都拿掉。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-hero-no-photos.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })

client
  .patch('homePage')
  .unset(['heroSlides[_key=="kmvc5vppmz"].image', 'heroSlides[_key=="kmvc5vppm10"].image', 'heroSlides[_key=="kmvc5vppm11"].image'])
  .commit()
  .then((d) => console.log(d.heroSlides.map((s: any) => `${s.title.replace(/\s+/g, '').slice(0, 8)}：${s.image ? '有照片' : '無照片'}`).join('\n')))
