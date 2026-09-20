#!/usr/bin/env python3
"""
把目前寫死在 Astro 頁面裡的內容，轉成 Sanity 可匯入的 NDJSON。

用法：
    python scripts/migrate-content.py            # 產生 scripts/out/content.ndjson
    cd studio && npx sanity login                # 第一次要登入
    npx sanity dataset import ../scripts/out/content.ndjson production

圖片不需要事先上傳——NDJSON 用 `_sanityAsset` 指向正式站上的網址，
匯入時 Sanity 會自己去抓。這也是為什麼要先上線再搬內容。
"""

import io
import json
import os
import uuid

SITE = 'https://slowlivingeducation.org'
OUT = os.path.join(os.path.dirname(__file__), 'out', 'content.ndjson')

docs = []


def key():
    return uuid.uuid4().hex[:12]


def para(text, style='normal', marks=None):
    """一個普通段落。marks 例如 ['strong'] 或 ['highlight']。"""
    return {
        '_type': 'block',
        '_key': key(),
        'style': style,
        'markDefs': [],
        'children': [
            {'_type': 'span', '_key': key(), 'text': text, 'marks': marks or []}
        ],
    }


def rich(*blocks):
    return list(blocks)


def image(path, alt, caption=None):
    f = {
        '_type': 'figure',
        '_key': key(),
        'image': {'_type': 'image', '_sanityAsset': f'image@{SITE}{path}'},
        'alt': alt,
    }
    if caption:
        f['caption'] = caption
    return f


# ─────────────────────────────── 作者 ───────────────────────────────

docs.append({
    '_id': 'author-guo',
    '_type': 'author',
    'name': '郭純嵐（小嵐老師）',
    'title': '臺灣慢活教育學會創會會員',
    'initial': '郭',
    'accent': 'earth',
})

docs.append({
    '_id': 'author-chen',
    '_type': 'author',
    'name': '陳玉明（小明老師）',
    'title': '臺灣慢活教育學會創會會員・《漢字好好教 好好教漢字》作者之一',
    'initial': '陳',
    'accent': 'sage',
})

# ─────────────────────────────── 專欄文章 ───────────────────────────────

TEA_TREE = """拿出清潔大師 - 茶樹精油，
氣味一出現，
其實不甜也不是討喜，
但卻能讓人清醒、帶點讓人筆直的氣息。
像山林裡的冷空氣，
不張揚，卻讓人覺得很穩定。

拖地時，滴上幾滴，空氣變得透明。
不濃烈，卻很有存在感
像在提醒自己
「清理，不只是整理空間，
也是整理自己的心。」

茶樹精油種植於苗栗三義，
適合台灣的氣候及土壤，
有很好的抑菌與除味特性，
卻也帶著一種特別的氣質
去除多餘，留下必要。

年前大掃除，其實是一種儀式。
擦著窗框、刷著地板、整理櫥櫃，
清除看得見的灰塵，
看不見的情緒也慢慢清除。

我喜歡在拖地的時候，
在水中加入茶樹精油，
再滴上幾滴檸檬或甜橙。
清新中帶點陽光。

在歲末年終，
讓氣味陪你把過去的輕輕放下，
把新的日子，好好迎來。

一月一味，從茶樹精油開始。"""

docs.append({
    '_id': 'article-tea-tree-february',
    '_type': 'article',
    'title': '跟著氣味學慢活——二月・澳洲茶樹',
    'slug': {'_type': 'slug', 'current': 'tea-tree-february'},
    'excerpt': '過年期間的各種掃除，總是需要一點動力與決心。清理堆積的雜物，掃除角落的灰塵，也把這一年來的疲憊心情與煩亂，一起打包丟掉……',
    'cover': image('/images/column-tea-tree.jpg', '跟著氣味學慢活——二月・澳洲茶樹'),
    'body': [
        {'_type': 'verse', '_key': key(), 'text': TEA_TREE},
    ],
    'links': [{
        '_type': 'link', '_key': key(),
        'title': '📘 facebook 粉專：三義茅鄉炭坊',
        'url': 'https://www.facebook.com/31mstfoil',
    }],
    'category': 'art',
    'series': '慢活文字專欄｜每月一味',
    'author': {'_type': 'reference', '_ref': 'author-guo'},
    'publishedAt': '2026-02-01',
    'tags': ['跟著氣味學慢活', '精油', '茶樹', '苗栗三義', '慢活文字專欄'],
    'accent': 'earth',
})

docs.append({
    '_id': 'article-mu-march',
    '_type': 'article',
    'title': '跟著文字學慢活——三月・木',
    'slug': {'_type': 'slug', 'current': 'mu-march'},
    'excerpt': '「木」字是一棵樹，字體演變中一直看得出中間是樹幹，上面是樹枝，下面是樹根。古人創造漢字時要凸顯「特徵」，以便與相像的字區分……',
    'cover': image('/images/mu-card-writing.jpg', '木字部件卡－書寫'),
    'body': rich(
        para('「木」字是一棵樹，它的字體演變一直都看得出中間是樹幹，上面畫出了樹枝，樹枝的方向可以聯想到這棵樹的樹葉與樹型；下面畫出了樹根。'),
        para('平常我們看到的樹很多都不會直接看到樹根，為什麼古人設計「木」字時要畫出樹根呢？因為古人創造漢字時都要盡量凸顯「特徵」，以便於跟其他相像的字區分，像「屮」（一根草）字和「木」字的字形差異，就在於有沒有畫出根。'),
        para('＊「屮」音ㄔㄜˋ，是一根草的意思，「艸」就是兩根草，後來字典裡的「草部」就是這個「艸」ㄘㄠˇ。', style='note'),
        para('一個漢字如果有「木」部件，通常代表跟「樹」或「木頭材質」有關係，例如：「李、桃、松、柳、杉……」都是樹名，「枝、根、株、林、休……」都跟樹有關係，還有「桌、椅、杖、柱、架……」都是古時候用木製成的物品。'),
        para('那麼，「杯」也是木做的嗎？古時候有木作的「杯」哦！是裝羹湯用的。「杯」也寫作「桮」或「盃」。不要再把「杯」解釋成「『不』是『木』作的」了，現在很多地方都還有木作的杯子呢！'),
        para('🌿 今天的慢活任務：找到一棵喜歡的樹，撿拾幾片樹葉或花瓣，夾在書裡當作書籤。', marks=['highlight']),
        para('預告：4月我們來看看小一點的植物——「禾」字。', style='note'),
        {
            '_type': 'imageRow',
            '_key': key(),
            'images': [
                image('/images/mu-card-writing.jpg', '木字部件卡－書寫'),
                image('/images/mu-rest.jpg', '木字－休息示意'),
                image('/images/mu-card-evolution.jpg', '木字部件卡－字體演變'),
            ],
            'caption': '圖像引用自《漢字好好教 好好教漢字》部件卡',
        },
    ),
    'links': [{
        '_type': 'link', '_key': key(),
        'title': '📘 facebook 粉專：小明的漢字研究基地',
        'url': 'https://www.facebook.com/xiaoming.hanzi',
    }],
    'category': 'art',
    'series': '慢活文字專欄｜每月一字',
    'author': {'_type': 'reference', '_ref': 'author-chen'},
    'publishedAt': '2026-03-01',
    'tags': ['跟著文字學慢活', '漢字', '木', '慢活文字專欄'],
    'accent': 'sage',
})

# ─────────────────────────────── 理監事與成員 ───────────────────────────────

PEOPLE = [
    ('陳鵬文', '理事長',   'director',   None, 10),
    ('邱曉琳', '副理事長', 'director',   None, 20),
    ('張世宗', '理事',     'director',   None, 30),
    ('陳君山', '理事',     'director',   None, 31),
    ('張蕊仙', '理事',     'director',   None, 32),
    ('謝啟彬', '理事',     'director',   None, 33),
    ('鄭麗寶', '理事',     'director',   None, 34),
    ('郭純嵐', '理事',     'director',   None, 35),
    ('吳順卿', '理事',     'director',   None, 36),
    ('楊秋玉', '監事',     'supervisor', None, 10),
    ('陳建城', '監事',     'supervisor', None, 11),
    ('李佳穗', '監事',     'supervisor', None, 12),
    ('許宸豪', '秘書長',   'secretariat', None, 10),
    ('李亮誼', '總幹事',   'secretariat', None, 20),
    ('李臺鴒', '財務顧問', 'advisor', '會計稅務記帳士事務所', 10),
    ('仁愛旅行社', '旅遊顧問', 'advisor', None, 20),
    ('蔡尚諭', '資訊顧問', 'advisor', None, 30),
]

for i, (name, role, group, note, order) in enumerate(PEOPLE):
    d = {
        '_id': f'person-{i:02d}',
        '_type': 'person',
        'name': name,
        'role': role,
        'group': group,
        'term': 1,
        'order': order,
    }
    if note:
        d['note'] = note
    docs.append(d)

# ─────────────────────────────── 活動資訊 ───────────────────────────────

EVENTS = [
    ('event-miaoli-art', '苗栗青年藝術論壇', '2026 · 06 · 28', '2026-06-28', '🎭',
     '支持青年藝術家阿里，結合行為藝術與論壇形式，在苗栗舉辦一場關於藝術與生命的對話。',
     '藝術陪伴', True, True),
    ('event-chiayi-trip', '慢旅共學・嘉義首站', '2026 · Q3（籌備中）', '2026-09-01', '🚂',
     '以旅行作為學習方式，走入嘉義的生態、文化與人情，體驗「慢活」最真實的樣子。',
     '慢旅共學', True, True),
    ('event-online-talks', '線上共學講座', '每月定期', '2026-10-01', '🎙️',
     '40分鐘線上講座，由會員輪流分享慢活實踐主題，錄影上傳YouTube，隨時可回顧。',
     '共學活動', True, True),
    ('event-column-callout', '慢活文字專欄・每月一味・歡迎投稿', '長期徵稿', '2026-12-01', '✍️',
     '歡迎會員投稿慢活主題文章，與大家分享你的實踐與體會。',
     '慢活專欄', True, False),
]

for _id, title, label, sort, icon, desc, tag, marquee, card in EVENTS:
    docs.append({
        '_id': _id, '_type': 'event', 'title': title, 'dateLabel': label,
        'sortDate': sort, 'icon': icon, 'description': desc, 'tag': tag,
        'showInMarquee': marquee, 'showAsCard': card,
    })

# ─────────────────────────────── 年度計畫項目 ───────────────────────────────

PLAN_ITEMS = [
    ('org', '🏛️', '立案與法人登記', '向內政部完成立案，取得統一編號，開設協會帳戶。'),
    ('org', '📋', '每年兩次會員大會', '上半年說明年度計畫，下半年報告成果並開放交流。'),
    ('org', '🤝', '理監事會議定期召開', '定期凝聚決策共識，確保各業務方向有效推進。'),
    ('org', '📣', '會員招募與社群經營', '以開放、友善的方式吸引認同慢活理念的新夥伴。'),
    ('learn', '🎙️', '線上共學講座', '每月40分鐘線上講座，會員輪流擔任主講，錄影上傳YouTube。'),
    ('learn', '✍️', '慢活專欄', '邀請老師撰寫旅遊、精油、漢字等慢活主題文章，於網站公開刊載。'),
    ('learn', '🛠️', '線上工作坊', '設計可動手操作的慢活體驗活動，讓學習更具身體感。'),
    ('learn', '📺', 'YouTube頻道建立', '系統化整理課程影片，打造學會的線上學習資料庫。'),
    ('project', '🏘️', '社區慢活講座', '透過音樂、芳香、手作等體驗活動介紹協會，連結在地社群。'),
    ('project', '🏫', 'SEL校園講座', '針對體制內老師推廣社會情緒學習，將實踐案例帶入校園。'),
    ('project', '🚂', '慢旅共學計畫（嘉義首站）', '結合在地文化與生態探索，讓旅行成為深度共學的媒介。'),
    ('project', '🎭', '青年藝術家獎助計畫', '支持有行動力的青年創作者，以苗栗行為藝術活動作為啟動項目。'),
    ('finance', '💰', '使用者付費機制', '部分工作坊與活動採收費制，讓優質課程能夠永續辦理。'),
    ('finance', '🤝', '外部贊助連結', '透過合作夥伴連結企業與個人贊助，支持公益性專案活動。'),
    ('finance', '📑', '政府補助申請', '針對教育、文化、社區類型專案，積極申請各級政府補助資源。'),
    ('finance', '🛍️', '學會特色產品開發', '未來規劃開發具慢活精神的學會周邊產品，創造自主收益。'),
]

for i, (track, icon, title, desc) in enumerate(PLAN_ITEMS):
    docs.append({
        '_id': f'plan-{i:02d}', '_type': 'planItem', 'track': track, 'icon': icon,
        'title': title, 'description': desc, 'year': '115-116', 'order': (i % 4 + 1) * 10,
    })

# ─────────────────────────────── 單例：網站設定 ───────────────────────────────

docs.append({
    '_id': 'siteSettings',
    '_type': 'siteSettings',
    'orgName': '臺灣慢活教育學會',
    'orgNameEn': 'Taiwan Slow Living Education Association',
    'address': '苗栗縣苗栗市建台街一巷13號',
    'email': 'slowlivingeducation@gmail.com',
})

# ─────────────────────────────── 單例：首頁 ───────────────────────────────

docs.append({
    '_id': 'homePage',
    '_type': 'homePage',
    'eyebrow': 'Est. 2026 · 臺灣',
    'headlineBefore': '在學習中找到',
    'headlineAccent': '慢活',
    'headlineAfter': '的節奏與喜悅',
    'subheadEn': 'Taiwan Slow Living Education Association',
    'lead': 'AI時代下，學習是享受快樂的最佳模式。\n我們以「慢活」為語言，搭建個人與社會的橋梁，\n讓素養教育成為每個人內在成長的底蘊。',
    'heroTags': ['身心健康', '藝術陪伴', '生態永續'],
    'aboutLabel': 'About Us',
    'aboutTitle': '關於學會',
    'aboutBody': rich(
        para('在追求物質高速發展的現代社會，人們常以外在成就評斷自我價值，忽略內在精神的認識與滋養，造成身心失衡與社會對立。AI時代的來臨更讓許多人對生命意義感到迷茫——我們相信，「學習」正是享受快樂、找回意義的最佳方式。'),
        para('學會以推廣「慢活教育」為核心目標，透過「身心健康、藝術陪伴、生態永續」三大共學主題，開發個人的覺察能力，連結群體的創造力，營造互助共好的生活文化。'),
        para('我們鼓勵每個人進入學習型狀態，以親身示範學習的喜悅——不為標準、不為證照，而是為了體驗成長帶來的滿足感，讓「慢活」成為臺灣素養教育的底蘊，與參與國際社群的暖實力。'),
    ),
    'eventsLabel': 'Events',
    'eventsTitle': '活動資訊',
})

# ─────────────────────── 單例：三大共學主題（新區塊） ───────────────────────
# ⚠️ 這一區原本不存在，說明文字是依現有文案改寫的草稿，需要學會確認。

docs.append({
    '_id': 'themesSection',
    '_type': 'themesSection',
    'label': 'Our Themes',
    'title': '三大共學主題',
    'intro': '慢活不是放棄前進，而是換一種節奏前進。我們以三個方向作為共學的入口。',
    'themes': [
        {'_type': 'theme', '_key': key(), 'icon': '🌿', 'title': '身心健康',
         'description': '從覺察自己的身體與情緒開始。透過芳香、飲食、作息與靜心練習，找回與自己相處的方式。',
         'accent': 'sage'},
        {'_type': 'theme', '_key': key(), 'icon': '🎨', 'title': '藝術陪伴',
         'description': '讓藝術走進日常，也讓創作者被看見。以文字、音樂、手作與展演，陪伴彼此表達與理解。',
         'accent': 'earth'},
        {'_type': 'theme', '_key': key(), 'icon': '🌏', 'title': '生態永續',
         'description': '把視線從個人延伸到土地。透過慢旅、在地文化與環境議題的共學，練習與環境共好。',
         'accent': 'sky'},
    ],
})

# ─────────────────────────────── 單例：年度計畫 ───────────────────────────────

docs.append({
    '_id': 'plansPage',
    '_type': 'plansPage',
    'label': 'Annual Plans',
    'title': '年度計畫',
    'intro': '115、116年度工作計畫已完成送出，以下為學會三大業務主軸的具體推動方向。',
    'tracks': [
        {'_type': 'trackIntro', '_key': key(), 'track': 'org', 'body': rich(
            para('學會已向內政部遞交立案資料，待核發統一編號後即可申請帳戶，正式展開會務運作。'),
            para('會務核心在於確保協會合法、透明、永續地運作，讓每位會員都能在安心的組織架構中共同成長。'),
            para('建議每年召開兩次會員大會：第一次說明年度計畫與方向，第二次報告年度成果，並提供會員交流機會，持續吸引認同慢活理念的新夥伴加入。'),
        )},
        {'_type': 'trackIntro', '_key': key(), 'track': 'learn', 'body': rich(
            para('業務核心是「學習」。我們相信，當每個人都能進入學習型狀態，就能從中獲得喜悅與成就感。'),
            para('線上共學活動規劃為40分鐘講座與工作坊，內容錄影上傳YouTube，讓知識的流動不受時間限制。'),
            para('學會鼓勵會員擔任分享者，主題需與慢活連結，讓每個人的生命智慧都成為學會的共同資產。'),
        )},
        {'_type': 'trackIntro', '_key': key(), 'track': 'project', 'body': rich(
            para('專案計畫旨在將「學習的樂趣」推廣給更廣泛的群體，走出線上，深入社區、校園與各地角落。'),
            para('慢旅共學計畫首站選在嘉義，以旅行作為學習方式，體驗在地的生態、文化與人情，是慢活最真實的實踐。'),
        )},
        {'_type': 'trackIntro', '_key': key(), 'track': 'finance', 'body': rich(
            para('學會目前主要收入來自會費，用於基礎行政運作。秉持謹慎財務原則，不隨意動用會費。'),
            para('各項專案活動經費將盡量尋求外部資源，目標是建立多元財務支柱，確保學會長期穩健發展。'),
        )},
    ],
})

# ─────────────────────────────── 單例：捐款支持 ───────────────────────────────
# ⚠️ bankName / accountNo 刻意維持「待立案後公告」。填入真實帳號前請先確認勸募許可字號。

docs.append({
    '_id': 'donatePage',
    '_type': 'donatePage',
    'label': 'Support Us',
    'title': '捐款支持',
    'intro': '您的支持是學會持續前行的動力。每一份捐款都將用於推動慢活教育、支持青年藝術家、走入社區與偏鄉，讓更多人有機會體驗學習的喜悅。',
    'uses': [
        {'_type': 'use', '_key': key(), 'icon': '🌿', 'title': '慢活教育推廣',
         'description': '辦理線上共學講座、社區體驗活動與校園SEL課程。'},
        {'_type': 'use', '_key': key(), 'icon': '🎭', 'title': '青年藝術家獎助',
         'description': '支持有行動力的青年創作者，讓藝術走進生活各角落。'},
        {'_type': 'use', '_key': key(), 'icon': '🚂', 'title': '慢旅共學計畫',
         'description': '帶領會員深入台灣各地，以旅行作為學習與連結的方式。'},
        {'_type': 'use', '_key': key(), 'icon': '❤️', 'title': '心靈偏鄉陪伴',
         'description': '走入資源不足的社區，陪伴需要關懷的民眾。'},
    ],
    'accountName': '臺灣慢活教育學會',
    'bankName': '待立案後公告',
    'accountNo': '待立案後公告',
    'receiptNote': '學會立案取得統一編號後，即可開立正式捐款收據。',
    'notes': [
        '匯款後請來信告知姓名與金額',
        '捐款資訊將於立案後正式公告',
        '感謝您與我們一起慢活共好',
    ],
})

# ─────────────────────────────── 單例：聯絡我們 ───────────────────────────────

docs.append({
    '_id': 'contactPage',
    '_type': 'contactPage',
    'label': 'Contact',
    'title': '聯絡我們',
    'subtitle': '慢活，從一個真誠的連結開始',
    'cards': [
        {'_type': 'card', '_key': key(), 'icon': '📧', 'title': '電子信箱',
         'body': 'slowlivingeducation@gmail.com',
         'link': {'_type': 'link', 'title': '來信給我們', 'url': 'mailto:slowlivingeducation@gmail.com'}},
        {'_type': 'card', '_key': key(), 'icon': '📍', 'title': '學會地址',
         'body': '苗栗縣苗栗市建台街一巷13號'},
        {'_type': 'card', '_key': key(), 'icon': '📅', 'title': '成立年份',
         'body': '2026年10月'},
    ],
    'notes': [
        '對學會有興趣？歡迎來信了解入會資訊',
        '想投稿慢活專欄？歡迎與我們分享您的故事',
        '想合作或贊助？期待與理念相近的夥伴攜手',
    ],
})

# ─────────────────────────────── 單例：理監事專區 ───────────────────────────────

docs.append({
    '_id': 'boardAreaPage',
    '_type': 'boardAreaPage',
    'title': '理監事專區',
    'intro': '會議記錄、年度工作計畫、財務報告與活動照片，均存放於學會共用雲端硬碟，由秘書處依理監事名單開放存取權限。',
    'accessNote': '請以您的 Google 帳號來信告知秘書處，我們會將您加入學會的共用雲端硬碟。',
    'whyNote': '公開網站無法真正保護內部文件——任何放在網站檔案裡的內容，即使前面擺了登入畫面，都可能被搜尋引擎或檢視原始碼的人取得。理監事文件改由雲端硬碟以帳號權限控管，是唯一可靠的做法。',
})

# ─────────────────────────────── 輸出 ───────────────────────────────

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, 'w', encoding='utf-8') as f:
    for d in docs:
        f.write(json.dumps(d, ensure_ascii=False) + '\n')

from collections import Counter
counts = Counter(d['_type'] for d in docs)
print(f'已寫出 {len(docs)} 筆文件 → {OUT}')
for t, n in sorted(counts.items(), key=lambda x: -x[1]):
    print(f'  {t:<16} {n}')
assets = sum(json.dumps(d, ensure_ascii=False).count('_sanityAsset') for d in docs)
print(f'\n圖片參照 {assets} 個（匯入時由 Sanity 從正式站抓取）')
