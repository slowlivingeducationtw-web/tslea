#!/usr/bin/env python3
"""把搬進 Sanity 的每一段中文，逐字比對原始 index.html，抓出轉錄錯誤。

刻意新增、不存在於原檔的內容（三大共學主題、理監事專區改寫）會被略過。
"""

import io
import json
import os
import re
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NDJSON = os.path.join(ROOT, 'scripts', 'out', 'content.ndjson')
ORIGINAL = os.path.join(ROOT, 'index.html')

# 這些文件是刻意新寫的，不該拿去跟原檔比對
SKIP_DOCS = {'themesSection', 'boardAreaPage', 'siteSettings'}
# 這些欄位是結構性的，不是原檔的內文
SKIP_FIELDS = {'_id', '_type', '_key', '_ref', 'slug', 'category', 'accent', 'track',
               'group', 'year', 'order', 'term', 'sortDate', 'publishedAt', 'style',
               'marks', 'level', 'listItem', 'url', 'href', 'label'}


def norm(s: str) -> str:
    """去掉空白與全半形差異，只留下實質文字。"""
    s = unicodedata.normalize('NFKC', s)
    return re.sub(r'\s+', '', s)


raw = io.open(ORIGINAL, encoding='utf-8').read()
raw = re.sub(r'data:image/\w+;base64,[A-Za-z0-9+/=]+', '', raw)
text_only = re.sub(r'<[^>]+>', '\n', raw)
haystack = norm(text_only)

docs = [json.loads(l) for l in io.open(NDJSON, encoding='utf-8') if l.strip()]

missing = []
checked = 0


def visit(node, doc_id, path=''):
    global checked
    if isinstance(node, dict):
        for k, v in node.items():
            if k in SKIP_FIELDS:
                continue
            visit(v, doc_id, f'{path}.{k}')
    elif isinstance(node, list):
        for i, v in enumerate(node):
            visit(v, doc_id, f'{path}[{i}]')
    elif isinstance(node, str):
        # 只查有中文、且長度足夠的字串
        if len(node) < 6 or not re.search(r'[一-鿿]', node):
            return
        checked += 1
        for chunk in [c for c in node.split('\n') if len(norm(c)) >= 6]:
            if norm(chunk) not in haystack:
                missing.append((doc_id, path, chunk.strip()[:80]))


for d in docs:
    if d['_id'] in SKIP_DOCS:
        continue
    visit({k: v for k, v in d.items() if not k.startswith('_')}, d['_id'])

print(f'比對 {len(docs) - len(SKIP_DOCS)} 筆文件、{checked} 個字串\n')
if missing:
    print(f'✗ 找不到對應原文的片段 {len(missing)} 處：\n')
    for doc, path, s in missing:
        print(f'  [{doc}]{path}')
        print(f'    {s}\n')
    sys.exit(1)
print('✓ 全部文字都能在原始 index.html 中找到，沒有轉錄錯誤')
