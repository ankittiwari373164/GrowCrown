import type { NextRequest } from 'next/server';
const encoder=new TextEncoder();
export function adminConfigured(){return !!process.env.ADMIN_USERNAME && (process.env.ADMIN_PASSWORD?.length||0)>=12 && (process.env.ADMIN_SESSION_SECRET?.length||0)>=32;}
async function digest(value:string){return new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export async function constantEqual(a:string,b:string){const [x,y]=await Promise.all([digest(a),digest(b)]);let mismatch=0;for(let i=0;i<x.length;i++)mismatch|=x[i]^y[i];return mismatch===0;}
async function signingKey(){return crypto.subtle.importKey('raw',encoder.encode(process.env.ADMIN_SESSION_SECRET!+'|'+process.env.ADMIN_PASSWORD!),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function makeAdminSession(){const payload=JSON.stringify({user:process.env.ADMIN_USERNAME,exp:Date.now()+3600000,nonce:crypto.randomUUID()});const encoded=btoa(String.fromCharCode(...encoder.encode(payload)));const sig=new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(encoded)));return encoded+'.'+btoa(String.fromCharCode(...sig));}
export async function verifyAdminSession(token?:string){if(!token||!adminConfigured())return false;try{const [body,signature,extra]=token.split('.');if(extra||!body||!signature)return false;const valid=await crypto.subtle.verify('HMAC',await signingKey(),Uint8Array.from(atob(signature),c=>c.charCodeAt(0)),encoder.encode(body));if(!valid)return false;const payload=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body),c=>c.charCodeAt(0))));return payload.user===process.env.ADMIN_USERNAME&&Number.isFinite(payload.exp)&&payload.exp>Date.now()&&payload.exp<=Date.now()+3600000;}catch{return false;}}
export const isAdmin=(req:NextRequest)=>verifyAdminSession(req.cookies.get('gc_admin')?.value);
export function sameOrigin(req:NextRequest){return !req.headers.get('origin')||req.headers.get('origin')===req.nextUrl.origin;}
// Best-effort per-instance limiter. Configure an edge rate limit for public production traffic.
const attempts=new Map<string,{count:number;until:number}>();
export function allowRequest(req:NextRequest,group:string,limit=5,windowMs=600000){const now=Date.now();const key=group+':'+(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown');for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);if(attempts.size>5000)return false;const entry=attempts.get(key)||{count:0,until:now+windowMs};entry.count++;attempts.set(key,entry);return entry.count<=limit;}
