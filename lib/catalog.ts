import data from '@/data/boutique.json';
export type Variant={sku:string;asin:string;colour:string;size:string;price:number;stock:number;fba:boolean};
export type Product={id:string;name:string;category:string;price:number;compare_price:number;image:string;description:string;stock:number;sizes:string[];active:boolean;featured:boolean;code?:string;colours?:string[];colourHex?:Record<string,string>;images?:Record<string,string>;variants?:Variant[];fabric?:string;fba?:boolean;gallery?:Record<string,string[]>};
// Generated from the Amazon Active Listings Report (06-Oct-2026): every women's clothing listing,
// grouped by design code with all colour × size variants. Regenerate with scripts/build-catalog.py.
// Real Amazon photos are attached per colour by scripts/attach-images.py from the Category Listings Report.
export const categories:string[]=data.categories;
export const samples:Product[]=data.products as unknown as Product[];
export const amazonUrl=(asin:string)=>'https://www.amazon.in/dp/'+asin;
export const storefrontUrl='https://www.amazon.in/l/27943762031?ie=UTF8&marketplaceID=A21TJRUUN4KGV&me=A33W2704ULS7NA';
export const colourList=(ps:Product[])=>[...new Set(ps.flatMap(p=>p.colours||[]))].sort();
export const variantOf=(p:Product,colour?:string,size?:string)=>p.variants?.find(v=>(!colour||v.colour===colour)&&(!size||v.size===size));
export const imageOf=(p:Product,colour?:string)=>(colour&&p.images?.[colour])||p.image;
export const money=(n:number)=>'₹'+Number(n).toLocaleString('en-IN');
