# Usage: python3 scripts/attach-images.py <CategoryListingsReport.xlsm>  -> fills images/gallery in data/boutique.json
import sys,json,openpyxl
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True);ws=wb['Template'];m={}
for r in ws.iter_rows(min_row=7,values_only=True):
  if r[2]:
    im=[str(x).strip() for x in r[27:36] if x and str(x).startswith('http')]
    if im:m[str(r[2]).strip()]=im
def look(sku):
  for k in (sku,sku.replace('FBA','',1),'FBA'+sku):
    if k in m:return m[k]
d=json.load(open('data/boutique.json'));hit=miss=0
for p in d['products']:
  p['gallery']={}
  for c in p['colours']:
    g=next((look(v['sku']) for v in p['variants'] if v['colour']==c and look(v['sku'])),None)
    if g:p['images'][c]=g[0];p['gallery'][c]=g;hit+=1
    else:miss+=1
  p['image']=p['images'][p['colours'][0]]
json.dump(d,open('data/boutique.json','w'),ensure_ascii=False,separators=(',',':'))
print('colours with real photos',hit,'missing',miss)
