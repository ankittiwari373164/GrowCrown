import {cookies} from 'next/headers';
import {verifyAdminSession} from '@/lib/admin-auth';
import AdminAccess from '../../admin-access';
import Store from '../../store';
export const dynamic='force-dynamic';
export default async function AdminPage({params}:{params:Promise<{path?:string[]}>}){const jar=await cookies();if(!await verifyAdminSession(jar.get('gc_admin')?.value))return <AdminAccess/>;const {path=[]}=await params;return <Store initialPath={'/admin'+(path.length?'/'+path.join('/'):'')}/>;}
