#!/usr/bin/env python3
"""把產生的 NDJSON 對照 Studio 實際編譯出的 schema 檢查一遍，趁匯入前抓錯。

    cd studio && npx sanity schema extract      # 產生 studio/schema.json
    python scripts/validate-ndjson.py
"""

import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NDJSON = os.path.join(ROOT, 'scripts', 'out', 'content.ndjson')
SCHEMA = os.path.join(ROOT, 'studio', 'schema.json')

if not os.path.exists(SCHEMA):
    sys.exit('找不到 studio/schema.json，請先在 studio/ 執行 npx sanity schema extract')

schema = {t['name']: t for t in json.load(io.open(SCHEMA, encoding='utf-8'))}
docs = [json.loads(l) for l in io.open(NDJSON, encoding='utf-8') if l.strip()]

errors = []
warnings = []
ids = {d['_id'] for d in docs}


def attrs_of(type_name):
    t = schema.get(type_name)
    if not t:
        return None
    return t.get('attributes', {})


for d in docs:
    where = f"{d['_id']} ({d['_type']})"
    at = attrs_of(d['_type'])
    if at is None:
        errors.append(f'{where}: schema 裡沒有這個型別')
        continue

    # 未知欄位
    for f in d:
        if f.startswith('_'):
            continue
        if f not in at:
            errors.append(f'{where}: 欄位 "{f}" 不在 schema 中')

    # 必填欄位
    for f, spec in at.items():
        if f.startswith('_'):
            continue
        if spec.get('optional') is False and f not in d:
            errors.append(f'{where}: 缺少必填欄位 "{f}"')

# 參照是否指向存在的文件
def check_refs(node, where):
    if isinstance(node, dict):
        if node.get('_type') == 'reference':
            if node.get('_ref') not in ids:
                errors.append(f'{where}: 參照 {node.get("_ref")} 找不到對應文件')
        for v in node.values():
            check_refs(v, where)
    elif isinstance(node, list):
        for v in node:
            check_refs(v, where)


# 陣列成員需要 _key，否則 Studio 編輯時會出問題
def check_keys(node, where, path=''):
    if isinstance(node, list):
        for i, v in enumerate(node):
            if isinstance(v, dict) and '_key' not in v:
                errors.append(f'{where}: {path}[{i}] 缺少 _key')
            check_keys(v, where, f'{path}[{i}]')
    elif isinstance(node, dict):
        for k, v in node.items():
            check_keys(v, where, f'{path}.{k}')


for d in docs:
    where = f"{d['_id']} ({d['_type']})"
    check_refs(d, where)
    check_keys(d, where)

# 安全紅線：不得出現檔案上傳
raw = io.open(NDJSON, encoding='utf-8').read()
if 'fileAsset' in raw or '"_type": "file"' in raw:
    errors.append('安全：NDJSON 含有檔案（非圖片）資產')

# 單例的 _id 必須與型別同名，structure.ts 才找得到
SINGLETONS = ['siteSettings', 'homePage', 'themesSection', 'plansPage',
              'donatePage', 'contactPage', 'boardAreaPage']
for d in docs:
    if d['_type'] in SINGLETONS and d['_id'] != d['_type']:
        errors.append(f"{d['_id']}: 單例文件的 _id 必須等於型別名稱 {d['_type']}")

for d in docs:
    if d['_type'] == 'article':
        if not d.get('body'):
            warnings.append(f"{d['_id']}: 沒有內文")
        if len(d.get('excerpt', '')) > 200:
            errors.append(f"{d['_id']}: 摘要超過 200 字上限")

print(f'檢查 {len(docs)} 筆文件，對照 {len(schema)} 個 schema 型別\n')
if warnings:
    print(f'提醒 {len(warnings)} 項：')
    for w in warnings:
        print('  ·', w)
    print()
if errors:
    print(f'錯誤 {len(errors)} 項：')
    for e in errors:
        print('  ✗', e)
    sys.exit(1)
print('✓ 全部通過，可以匯入')
