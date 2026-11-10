// Shiprocket API helpers. Needs SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD (an API user created in Shiprocket → Settings → API)
// and SHIPROCKET_PICKUP_LOCATION (the exact pickup address nickname from Shiprocket → Settings → Pickup Addresses).
const BASE='https://apiv2.shiprocket.in/v1/external';
let cached:{token:string;until:number}|null=null;
export const shiprocketConfigured=()=>!!process.env.SHIPROCKET_EMAIL&&!!process.env.SHIPROCKET_PASSWORD&&!!process.env.SHIPROCKET_PICKUP_LOCATION;
async function token(){
  if(cached&&cached.until>Date.now())return cached.token;
  const r=await fetch(BASE+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.SHIPROCKET_EMAIL,password:process.env.SHIPROCKET_PASSWORD}),cache:'no-store'});
  const d:any=await r.json().catch(()=>null);
  if(!r.ok||!d?.token)throw Error('Shiprocket login failed: '+(d?.message||r.status));
  cached={token:d.token,until:Date.now()+8*24*3600*1000};// tokens last 10 days
  return d.token as string;
}
async function call(path:string,method='GET',body?:unknown){
  const r=await fetch(BASE+path,{method,headers:{Authorization:'Bearer '+await token(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});
  const d:any=await r.json().catch(()=>null);
  if(!r.ok||(d?.status_code&&d.status_code>=400))throw Error('Shiprocket: '+(d?.message||'')+(d?.errors?' '+JSON.stringify(d.errors):'')+(d?.data&&!d?.message?JSON.stringify(d.data):'')||'HTTP '+r.status);
  return d;
}
const n=(k:string,def:number)=>Number(process.env[k])||def;
export async function createShipment(o:any,email:string,skus:Record<string,string>){
  const s=o.shipping||{};const [first,...rest]=String(s.name||'Customer').trim().split(/\s+/);
  const units=(o.items||[]).reduce((a:number,i:any)=>a+Number(i.qty||1),0)||1;
  const prepaid=o.payment_status==='paid';
  const payload={
    order_id:String(o.id).slice(0,8).toUpperCase()+'-'+String(o.id).slice(-4),
    order_date:new Date(o.created_at||Date.now()).toISOString().slice(0,16).replace('T',' '),
    pickup_location:process.env.SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name:first,billing_last_name:rest.join(' '),
    billing_address:s.address,billing_city:s.city,billing_pincode:s.pincode,billing_state:s.state,billing_country:'India',
    billing_email:email||process.env.SHIPROCKET_EMAIL,billing_phone:String(s.phone||'').replace(/\D/g,'').slice(-10),
    shipping_is_billing:true,
    order_items:(o.items||[]).map((i:any)=>({name:i.name+(i.size?' ('+i.size+')':''),sku:(skus[i.id]||String(i.id).slice(0,8))+(i.size?'-'+i.size:''),units:Number(i.qty||1),selling_price:Number(i.price)})),
    payment_method:prepaid?'Prepaid':'COD',
    shipping_charges:Number(o.shipping_fee||0),total_discount:Number(o.discount||0),sub_total:Number(o.subtotal||0),
    length:n('SHIPROCKET_LENGTH_CM',30),breadth:n('SHIPROCKET_BREADTH_CM',25),height:Math.max(3,n('SHIPROCKET_HEIGHT_CM',4)*Math.min(units,5)),weight:+(n('SHIPROCKET_WEIGHT_KG',0.5)*units).toFixed(2),
  };
  const d:any=await call('/orders/create/adhoc','POST',payload);
  // Shiprocket can answer HTTP 200 with an error inside the body; treat a missing shipment_id as a failure.
  if(!d?.shipment_id){
    const why=d?.message||(d?.errors?Object.values(d.errors).flat().join('; '):'')||JSON.stringify(d).slice(0,300);
    const hint=/pickup/i.test(why)?' (check SHIPROCKET_PICKUP_LOCATION matches the pickup nickname in Shiprocket exactly)':'';
    throw Error('Shiprocket did not create the order: '+why+hint);
  }
  return d as {order_id:number;shipment_id:number;status:string;awb_code?:string;courier_name?:string};
}
export async function trackShipment(shipmentId:string|number){
  const d:any=await call('/courier/track/shipment/'+shipmentId);
  const t=d?.tracking_data||d?.[shipmentId]?.tracking_data||{};const st=t.shipment_track?.[0]||{};
  return {awb:st.awb_code||'',courier:st.courier_name||'',status:String(st.current_status||t.shipment_status||'').toUpperCase(),url:t.track_url||''};
}
