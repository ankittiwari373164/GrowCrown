import {NextRequest,NextResponse} from 'next/server';
import {sameOrigin} from '@/lib/admin-auth';
import {supabase as db} from '@/lib/supabase-rest';
import {createRazorpayOrder,razorpayConfigured,verifyPaymentSignature} from '@/lib/razorpay';
import {getOrder,patchOrder,pushToShiprocket,markPaid} from '@/lib/orders';
// Checkout: create (COD or Razorpay), verify a Razorpay payment, or cancel an abandoned online payment.
export async function POST(req:NextRequest){
  if(!sameOrigin(req))return NextResponse.json({error:'Invalid request origin'},{status:403});
  try{
    const b:any=await req.json();const token=req.cookies.get('gc_session')?.value;
    if(!token)return NextResponse.json({error:'Please sign in to continue.'},{status:401});
    const user=await db('/auth/v1/user',token);
    if(b.action==='create'){
      const online=b.method==='online';
      if(online&&!razorpayConfigured())throw Error('Online payment is not available right now. Please choose Cash on Delivery.');
      const items=(b.items||[]).map((i:any)=>({id:i.id,size:i.size,qty:i.qty}));
      const placed=await db('/rest/v1/rpc/place_order',token,'POST',{items,shipping:b.shipping,coupon_code:b.coupon||'',request_key:b.requestKey});
      let o=await getOrder('id=eq.'+placed.id);
      if(!online){o=await patchOrder(o.id,{payment_method:'COD',payment_status:'cod'});o=await pushToShiprocket(o);return NextResponse.json({order:o});}
      if(o.payment_status==='paid')return NextResponse.json({order:o});
      if(!o.razorpay_order_id){const rp=await createRazorpayOrder(Math.round(Number(o.total)*100),o.id,{order_id:o.id});o=await patchOrder(o.id,{payment_method:'Razorpay',payment_status:'pending',razorpay_order_id:rp.id});}
      return NextResponse.json({order:o,razorpay:{key:process.env.RAZORPAY_KEY_ID,order_id:o.razorpay_order_id,amount:Math.round(Number(o.total)*100),currency:'INR',prefill:{name:b.shipping?.name||'',contact:b.shipping?.phone||'',email:user.email||''}}});
    }
    if(b.action==='verify'){
      const o=await getOrder('id=eq.'+encodeURIComponent(b.order_id));
      if(!o||o.user_id!==user.id||o.razorpay_order_id!==b.razorpay_order_id)throw Error('Order not found');
      if(!verifyPaymentSignature(b.razorpay_order_id,b.razorpay_payment_id,b.razorpay_signature))throw Error('Payment could not be verified. If money was deducted it will be confirmed automatically or refunded.');
      return NextResponse.json({order:await markPaid(o,b.razorpay_payment_id)});
    }
    if(b.action==='cancel'){
      const o=await getOrder('id=eq.'+encodeURIComponent(b.order_id));
      if(o&&o.user_id===user.id&&o.payment_status==='pending'&&o.status==='Placed')await patchOrder(o.id,{status:'Cancelled',payment_status:'failed'});
      return NextResponse.json({ok:true});
    }
    throw Error('Invalid action');
  }catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}
}
