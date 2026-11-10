import {NextRequest,NextResponse} from 'next/server';
import {verifyWebhookSignature} from '@/lib/razorpay';
import {getOrder,markPaid,patchOrder} from '@/lib/orders';
// Razorpay → Settings → Webhooks: URL https://<your-site>/api/razorpay/webhook, events payment.captured + order.paid + payment.failed.
export async function POST(req:NextRequest){
  const raw=await req.text();
  if(!verifyWebhookSignature(raw,req.headers.get('x-razorpay-signature')||''))return NextResponse.json({error:'Invalid signature'},{status:401});
  try{
    const ev=JSON.parse(raw);const pay=ev?.payload?.payment?.entity;const rpOrder=pay?.order_id||ev?.payload?.order?.entity?.id;
    if(!rpOrder)return NextResponse.json({ok:true});
    const o=await getOrder('razorpay_order_id=eq.'+encodeURIComponent(rpOrder));
    if(!o)return NextResponse.json({ok:true});
    if(ev.event==='payment.captured'||ev.event==='order.paid')await markPaid(o,pay?.id||o.razorpay_payment_id||'');
    else if(ev.event==='payment.failed'&&o.payment_status==='pending')await patchOrder(o.id,{payment_status:'failed'});
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({error:(e as Error).message},{status:500});}
}
