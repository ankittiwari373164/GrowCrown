import csv,re,json,collections,sys,os,html
r=list(csv.DictReader(open(sys.argv[1],encoding='latin-1'),delimiter='\t'))
inv={x['sku'].strip():x for x in csv.DictReader(open(sys.argv[2],encoding='latin-1'),delimiter='\t')}
OUT=sys.argv[3]; os.makedirs(OUT+'/public/assets/art',exist_ok=True)
SIZES=['XS','S','M','L','XL','XXL','3XL']
HEX={'white':'#f4f1ea','off white':'#ece4d3','cream':'#eadcc0','beige':'#d9c3a0','yellow':'#e8c12f','mustard':'#c9961e','orange':'#e0782b','peach':'#f0b59a','pink':'#e88aa8','baby pink':'#f4c2cf','magenta':'#b8246f','red':'#b9262e','rust':'#a8442b','maroon':'#6e1a28','wine':'#6a1630','burgundy':'#6b1a2c','purple':'#6a3a8c','lavender':'#b7a3d6','mauve':'#a77d99','blue':'#2f5fa8','navy':'#1f2d55','royal':'#2a46a4','sky':'#7fb7e0','teal':'#1f6f74','green':'#3c8a4a','parrot':'#5db53a','mehendi':'#7a7d2a','mehndi':'#7a7d2a','olive':'#6b6f2c','army':'#555b34','mint':'#9ed8b8','apple':'#8cc63f','pear':'#b5c534','brown':'#6e4428','chocolate':'#4b2c1c','black':'#2a2627','grey':'#8c8a88','gajri':'#e46f5b','rani':'#c2185b','gold':'#c9a24e'}
def hexof(c):
  c=c.lower()
  for k in sorted(HEX,key=len,reverse=True):
    if k in c: return HEX[k]
  return '#b98b5a'
def code_of(sku):
  s=re.sub(r'^(FBA)?','',sku.strip()); s=re.sub(r'^AM-621-','',s)
  m=re.match(r'(HC35-K\d+|HC-?\d+|UG-?\d+|HM-?\d+|[A-Z]{1,4}-?\d+)',s,re.I)
  return (m.group(1) if m else s).upper().replace('HC-','HC').replace('UG-','UG').replace('HM-','HM')
def cat_of(n):
  n=n.lower()
  if 'co-ord' in n or 'coard' in n or 'co ord' in n: return 'Co-ord Sets'
  if 'silk' in n or 'georgette' in n or 'banarasi' in n: return 'Festive & Silk'
  if 'gown' in n: return 'Gowns'
  if 'anarkali' in n: return 'Anarkali Sets'
  if 'chikan' in n: return 'Chikankari'
  if any(k in n for k in ['sleeveless','short kurti','crop','short ']): return 'Short & Sleeveless'
  if 'a-line' in n or 'a line' in n or 'flared' in n or 'nayra' in n: return 'A-Line & Flared'
  if 'dupatta' in n: return 'Kurta Dupatta Sets'
  return 'Kurti Pant Sets'
G=collections.OrderedDict()
for x in r:
  name=x['item-name']
  if not re.match(r'\s*(Agarwal Global Trader\s*)?wom[ae]n',name,re.I): continue
  n=name.replace('Agarwal Global Trader','').strip()
  m=re.search(r'\(([^()]*)\)\s*$',n); colour=size=None; base=n
  if m:
    base=n[:m.start()].strip()
    for p in [p.strip() for p in re.split(r'[-,/]',m.group(1)) if p.strip()]:
      if p.upper() in SIZES+['XXXL']: size='3XL' if p.upper()=='XXXL' else p.upper()
      elif colour is None: colour=re.sub(r'\d+$','',p).strip().title()
  base=re.sub(r'\s*-\s*[A-Z]{1,4}-?\d+\s*$','',base).strip(' -')
  sku=x['seller-sku'].strip()
  if not size:
    ms=re.search(r'-?(XS|S|M|L|XL|XXL|3XL|XXXL)$',sku,re.I); size=ms.group(1).upper() if ms and ms.group(1).upper()!='S' or (ms and sku.upper().endswith('-S')) else None
  if not size: continue   # parent/unsized listing, not purchasable variant
  colour=colour or 'Multicolour'
  g=G.setdefault(code_of(sku),{'names':collections.Counter(),'v':{}})
  g['names'][base]+=1
  q=x['quantity'] or inv.get(sku,{}).get('quantity','') 
  fba=x['fulfillment-channel']!='DEFAULT'
  key=(colour,size)
  old=g['v'].get(key)
  if old and old['fba'] and not fba: continue
  g['v'][key]=dict(sku=sku,asin=x['asin1'],colour=colour,size=size,price=float(x['price'] or 0),mrp=float(x['maximum-retail-price'] or 0) or None,stock=int(q) if str(q).isdigit() else (20 if fba else 0),fba=fba)
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def svg(colour,hx,title,code):
  t=html.escape(title[:38]+('…' if len(title)>38 else ''))
  return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8efe1"/><stop offset="1" stop-color="#ead9c0"/></linearGradient><linearGradient id="k" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{hx}"/><stop offset="1" stop-color="{hx}" stop-opacity=".78"/></linearGradient><pattern id="p" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="17" cy="17" r="2.4" fill="#fff" fill-opacity=".35"/><path d="M0 0l8 8M34 0l-8 8M0 34l8-8M34 34l-8-8" stroke="#fff" stroke-opacity=".18"/></pattern></defs><rect width="600" height="800" fill="url(#b)"/><circle cx="300" cy="330" r="250" fill="#fff" fill-opacity=".45"/><g><path d="M250 120q50 40 100 0l80 30 40 150-50 15-15-70 10 420H185l10-420-15 70-50-15 40-150z" fill="url(#k)" stroke="#00000022" stroke-width="2"/><path d="M250 120q50 40 100 0l80 30 40 150-50 15-15-70 10 420H185l10-420-15 70-50-15 40-150z" fill="url(#p)"/><path d="M262 124q38 70 76 0" fill="none" stroke="#c9a24e" stroke-width="5"/><path d="M190 600h220" stroke="#c9a24e" stroke-width="6"/><path d="M300 175v190" stroke="#c9a24e" stroke-width="3" stroke-dasharray="6 7"/></g><g fill="#651e30" font-family="Georgia,serif" text-anchor="middle"><text x="300" y="700" font-size="30">{html.escape(colour)}</text><text x="300" y="740" font-size="17" fill="#8d6c47" font-family="Arial" letter-spacing="3">GLOWCROWN · {html.escape(code)}</text></g></svg>'''
prods=[]
for code,g in G.items():
  name=g['names'].most_common(1)[0][0]
  vs=sorted(g['v'].values(),key=lambda v:(v['colour'],SIZES.index(v['size']) if v['size'] in SIZES else 9))
  colours=list(dict.fromkeys(v['colour'] for v in vs)); sizes=[s for s in SIZES if any(v['size']==s for v in vs)]
  pid=slug(code+'-'+re.sub(r"Women'?s?\s*",'',name)[:60])
  imgs={}
  for c in colours:
    fn=f'{slug(code)}-{slug(c)}.svg'; open(f'{OUT}/public/assets/art/{fn}','w').write(svg(c,hexof(c),name,code)); imgs[c]='/assets/art/'+fn
  price=min(v['price'] for v in vs); mrps=[v['mrp'] for v in vs if v['mrp']]
  cat=cat_of(name); fab='Viscose silk' if 'silk' in name.lower() else 'Rayon' if 'rayon' in name.lower() else 'Georgette' if 'georgette' in name.lower() else 'Cotton'
  prods.append(dict(id=pid,code=code,name=re.sub(r"^Women'?s?\s+",'',name).replace('PalAMzo','Palazzo').replace('Embroiderd','Embroidered').replace('Coard','Co-ord'),category=cat,price=price,compare_price=max(mrps) if mrps and max(mrps)>price else round(price*1.5/100)*100-1,
    image=imgs[colours[0]],images=imgs,colours=colours,colourHex={c:hexof(c) for c in colours},sizes=sizes,fabric=fab,stock=sum(v['stock'] for v in vs),fba=any(v['fba'] for v in vs),
    variants=[{k:v[k] for k in ('sku','asin','colour','size','price','stock','fba')} for v in vs],
    description=f"{re.sub(chr(39)+'s','',name)} from GlowCrown by Agarwal Global Trader. Available in {', '.join(colours)} · sizes {', '.join(sizes)}. Fabric: {fab}. Check the size guide or call us for fit advice.",
    active=True,featured=False))
prods.sort(key=lambda p:(not p['fba'],-len(p['colours']),p['code']))
for p in prods[:8]: p['featured']=True
cats=[c for c,_ in collections.Counter(p['category'] for p in prods).most_common()]
os.makedirs(OUT+'/data',exist_ok=True)
json.dump({'categories':cats,'products':prods},open(OUT+'/data/boutique.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(prods),'products',sum(len(p['variants']) for p in prods),'variants',collections.Counter(p['category'] for p in prods))
print([ (p['code'],p['colours'],p['sizes']) for p in prods[:5]])
