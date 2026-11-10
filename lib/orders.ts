import {supabase as db} from '@/lib/supabase-rest';
import {createShipment,shiprocketConfigured,trackShipment} from '@/lib/shiprocket';
// Server-only order helpers (service role). Never import from client code.
export async function getOrder(where:string){const r=await db('/rest/v1/orders?select=*&'+where+'&limit=1',undefined,'GET',undefined,true);return r?.[0]||null;}
export async function patchOrder(id:string,data:Record<string,unknown>){const r=await db('/rest/v1/orders?id=eq.'+encodeURIComponent(id),undefined,'PATCH',data,true);return r?.[0]||null;}
export async function pushToShiprocket(o:any){
  if(!shiprocketConfigured())return patchOrder(o.id,{shiprocket_error:'Shiprocket is not configured on the server.'});
  if(o.shiprocket_shipment_id)return o;
  try{
    const prof=await db('/rest/v1/profiles?select=email&id=eq.'+o.user_id,undefined,'GET',undefined,true).catch(()=>[]);
    const ids=[...new Set((o.items||[]).map((i:any)=>i.id))].join(',');
    const prods=ids?await db('/rest/v1/products?select=id,sku&id=in.('+ids+')',undefined,'GET',undefined,true).catch(()=>[]):[];
    const skus=Object.fromEntries((prods||[]).filter((p:any)=>p.sku).map((p:any)=>[p.id,p.sku]));
    const r=await createShipment(o,prof?.[0]?.email||'',skus);
    return patchOrder(o.id,{shiprocket_order_id:String(r.order_id||''),shiprocket_shipment_id:String(r.shipment_id||''),awb:r.awb_code||'',courier:r.courier_name||'',shiprocket_error:'',status:o.status==='Placed'?'Processing':o.status});
  }catch(e){return patchOrder(o.id,{shiprocket_error:(e as Error).message.slice(0,500)});}
}
export async function markPaid(o:any,paymentId:string){
  if(o.payment_status==='paid')return o;
  const paid=await patchOrder(o.id,{payment_status:'paid',razorpay_payment_id:paymentId,payment_method:'Razorpay'});
  return pushToShiprocket(paid||o);
}
export async function refreshTracking(o:any){
  if(!o.shiprocket_shipment_id||!shiprocketConfigured())return o;
  const t=await trackShipment(o.shiprocket_shipment_id);
  const data:Record<string,unknown>={awb:t.awb||o.awb,courier:t.courier||o.courier,tracking_url:t.url||o.tracking_url};
  if(t.awb)data.tracking=(t.courier?t.courier+' · ':'')+'AWB '+t.awb;
  if(t.status.includes('DELIVERED')&&!t.status.includes('UNDELIVERED')&&o.status==='Shipped')data.status='Delivered';
  else if(t.awb&&/(SHIPPED|TRANSIT|PICKED|OUT FOR DELIVERY|DELIVERED)/.test(t.status)&&['Placed','Processing'].includes(o.status))data.status='Shipped';
  return patchOrder(o.id,data);
}
