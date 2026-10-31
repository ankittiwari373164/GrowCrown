# Usage: python3 -I scripts/build-catalog.py <All_Listings_Report.txt> <Inventory_Report.txt> <CategoryListingsReport.xlsm> <project_dir>
# Builds data/boutique.json from ACTIVE listings only, grouped by Parent SKU, with real Amazon photos.
import csv,json,re,sys,openpyxl,collections
L,I,X,OUT=sys.argv[1:5]
rows=[r for r in csv.DictReader(open(L,encoding='utf-8',errors='replace'),delimiter='\t') if r['status'].strip()=='Active']
inv={r['sku'].strip():r for r in csv.DictReader(open(I,encoding='utf-8',errors='replace'),delimiter='\t')}
ws=openpyxl.load_workbook(X,read_only=True,data_only=True)['Template'];R=list(ws.iter_rows(values_only=True));H=[str(h or '') for h in R[3]]
def col(name,nth=0):return [j for j,h in enumerate(H) if h==name][nth]
cat={}
for r in R[6:]:
  if not r[2]:continue
  imgs=[str(x).strip() for x in r[col('Main Image URL'):col('Swatch Image URL')] if x and str(x).startswith('http')]
  size=r[col('Apparel Size Value')] if 'Apparel Size Value' in H else None
  cat[str(r[2]).strip()]=dict(parent=(r[col('Parent SKU')] or '').strip() if r[col('Parent SKU')] else '',size=str(size or r[col('Size')] or '').strip(),imgs=imgs)
# Design facts written by hand from each listing's title/description (the report's colour column is copy-pasted).
D=[('silk afghani','Grey Silk Afghani Suit Set with Tissue Dupatta','Afghani Suit Sets','Grey','#9a9a9e','Silk, tissue dupatta'),
   ('tissue silk','Dusty Blue Tissue Silk Embroidered Suit with Palazzo','Silk & Tissue Suits','Dusty Blue','#7f9db5','Soft tissue silk'),
   ('black & white','Black & White Printed Rayon Afghani Suit with Mirror Work','Afghani Suit Sets','Black & White','#2a2627','Rayon'),
   ('rayon embroidered suit','Olive Green Rayon Mirror Work Suit with Printed Dupatta','Kurta Dupatta Sets','Olive Green','#6b6f2c','Rayon, cotton silk dupatta'),
   ('olive green floral','Olive Green Floral Printed Cotton Kurta with Palazzo','Kurta Palazzo Sets','Olive Green','#6b6f2c','Cotton'),
   ('cotton embroidered suit','Wine Purple Cotton Embroidered Suit with Silk Dupatta','Kurta Dupatta Sets','Wine Purple','#5e1f45','Cotton, cotton silk dupatta'),
   ('pure cotton embroidery','Brown Pure Cotton Embroidered Kurti, Pant & Dupatta','Kurta Dupatta Sets','Brown','#6e4428','Pure cotton'),
   ('chikankari','White Cotton Chikankari Anarkali with Dupatta','Anarkali Sets','White','#f4f1ea','Cotton'),
   ('viscose silk','Purple Viscose Silk Kurta, Trouser & Banarasi Dupatta','Silk & Tissue Suits','Purple','#6a3a8c','Viscose silk, Banarasi jacquard'),
   ('duffel','Leather Look Travel Duffel Bag (54×30×28 cm)','Men\'s Travel Bags','Black','#1d1b1c','Leather-look finish')]
ORDER=['S','M','L','XL','XXL','3XL']
G=collections.OrderedDict()
for r in rows:
  sku=r['seller-sku'].strip();t=r['item-name'].lower();c=cat.get(sku,{})
  d=next((x for x in D if x[0] in t),None)
  if not d:print('NO MATCH',sku,t[:90]);continue
  key=c.get('parent') or d[1]
  g=G.setdefault(key,dict(d=d,desc=r['item-description'].strip(),v=[],imgs=[]))
  size=(c.get('size') or '').upper().replace('2XL','XXL')
  if d[2]=="Men's Travel Bags":size='One Size'
  if not size:m=re.search(r'-(L|XL|XXL)\)?$',sku);size=m.group(1) if m else 'Free Size'
  price=float(r['price'] or inv.get(sku,{}).get('price') or 0);mrp=float(r['maximum-retail-price'] or 0)
  g['v'].append(dict(sku=sku,asin=r['asin1'].strip(),colour=d[3],size=size,price=price,mrp=mrp,stock=int(r['quantity'] or inv.get(sku,{}).get('quantity') or 0),fba=r['fulfillment-channel'].strip()!='DEFAULT'))
  if len(c.get('imgs',[]))>len(g['imgs']):g['imgs']=c['imgs']
def slug(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
P=[]
for key,g in G.items():
  d=g['d'];v=sorted(g['v'],key=lambda x:ORDER.index(x['size']) if x['size'] in ORDER else 9)
  desc=re.sub(r'\*\*','',g['desc']);desc=re.sub(r'^.*?(Introducing|Elevate|Enhance|Have a Variety)',r'\1',desc,count=1)
  if desc.startswith('Have a Variety'):desc=f"A {d[5].lower()} {d[1].split(' ',1)[1].lower()} from GlowCrown by Agarwal Global Trader, Farrukhabad. Comfortable for all-day wear and finished with care for festive days, office and family occasions."
  price=min(x['price'] for x in v);mrp=max(x['mrp'] for x in v)
  P.append(dict(id=slug(d[1]),code=v[0]['sku'],name=d[1],category=d[2],price=price,compare_price=mrp if mrp>price else 0,image=g['imgs'][0],images={d[3]:g['imgs'][0]},gallery={d[3]:g['imgs']},
    colours=[d[3]],colourHex={d[3]:d[4]},sizes=list(dict.fromkeys(x['size'] for x in v)),fabric=d[5],stock=sum(x['stock'] for x in v),fba=any(x['fba'] for x in v),
    variants=[{k:x[k] for k in('sku','asin','colour','size','price','stock','fba')} for x in v],description=desc,active=True,featured=True))
P.sort(key=lambda p:(p['category']=="Men's Travel Bags",-p['price']))
cats=list(dict.fromkeys(p['category'] for p in P))
json.dump({'categories':cats,'products':P},open(OUT+'/data/boutique.json','w'),ensure_ascii=False,indent=1)
for p in P:p['description']=p['description'].replace('Glow Grown','GlowCrown').replace('Glow Crown','GlowCrown')
for p in P:print(p['category'],'|',p['name'],'|',p['sizes'],p['price'],p['compare_price'],len(p['gallery'][p['colours'][0]]),'imgs')
