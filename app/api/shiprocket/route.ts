import {NextRequest,NextResponse} from 'next/server';
import {isAdmin,sameOrigin} from '@/lib/admin-auth';
import {getOrder,pushToShiprocket,refreshTracking} from '@/lib/orders';
// Admin actions: send an order to Shiprocket again, or refresh its tracking.
export async function POST(req:NextRequest){
  if(!sameOrigin(req))return NextResponse.json({error:'Invalid request origin'},{status:403});
  if(!await isAdmin(req))return NextResponse.json({error:'Admin sign-in required.'},{status:401});
  try{
    const b:any=await req.json();if(!/^[0-9a-f-]{36}$/i.test(b.id||''))throw Error('Invalid order');
    const o=await getOrder('id=eq.'+b.id);if(!o)throw Error('Order not found');
    if(o.status==='Cancelled')throw Error('Cancelled orders cannot be shipped');
    if(b.action==='push'){if(o.payment_method==='Razorpay'&&o.payment_status!=='paid')throw Error('This order has not been paid yet');return NextResponse.json({data:await pushToShiprocket(o)});}
    if(b.action==='track')return NextResponse.json({data:await refreshTracking(o)});
    throw Error('Invalid action');
  }catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}
}
