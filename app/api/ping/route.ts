import {NextResponse} from 'next/server';
// Daily keep-alive: Vercel Cron calls this (see vercel.json) so Supabase never pauses for inactivity.
// You can also point a free monitor (cron-job.org / UptimeRobot) at https://<your-site>/api/ping
export const dynamic='force-dynamic';
export async function GET(){
  const url=process.env.SUPABASE_URL,anon=process.env.SUPABASE_ANON_KEY,svc=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!anon)return NextResponse.json({ok:false,error:'Supabase not configured'},{status:503});
  try{
    const r=await fetch(url+'/rest/v1/products?select=id&limit=1',{headers:{apikey:anon,Authorization:'Bearer '+anon},cache:'no-store'});
    if(svc)await fetch(url+'/rest/v1/keepalive',{method:'POST',headers:{apikey:svc,Authorization:'Bearer '+svc,'Content-Type':'application/json',Prefer:'return=minimal'},body:'{}',cache:'no-store'}).catch(()=>null);
    return NextResponse.json({ok:r.ok,status:r.status,at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return NextResponse.json({ok:false,error:(e as Error).message},{status:500});}
}
