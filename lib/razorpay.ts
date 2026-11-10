import {createHmac,timingSafeEqual} from 'node:crypto';
// Razorpay server helpers. Needs RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (and RAZORPAY_WEBHOOK_SECRET for the webhook).
export const razorpayConfigured=()=>!!process.env.RAZORPAY_KEY_ID&&!!process.env.RAZORPAY_KEY_SECRET;
export async function createRazorpayOrder(amountPaise:number,receipt:string,notes:Record<string,string>){
  const auth=Buffer.from(process.env.RAZORPAY_KEY_ID+':'+process.env.RAZORPAY_KEY_SECRET).toString('base64');
  const r=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:'Basic '+auth,'Content-Type':'application/json'},body:JSON.stringify({amount:amountPaise,currency:'INR',receipt:receipt.slice(0,40),notes}),cache:'no-store'});
  const d:any=await r.json().catch(()=>null);
  if(!r.ok)throw Error(d?.error?.description||'Could not start Razorpay payment');
  return d as {id:string;amount:number;currency:string};
}
function safeEqual(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function verifyPaymentSignature(orderId:string,paymentId:string,signature:string){
  const expected=createHmac('sha256',process.env.RAZORPAY_KEY_SECRET!).update(orderId+'|'+paymentId).digest('hex');
  return safeEqual(expected,String(signature||''));
}
export function verifyWebhookSignature(rawBody:string,signature:string){
  if(!process.env.RAZORPAY_WEBHOOK_SECRET)return false;
  const expected=createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return safeEqual(expected,String(signature||''));
}
