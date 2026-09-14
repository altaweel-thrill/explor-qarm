'use client';
import {useEffect,useState} from 'react';
import {onIdTokenChanged,signOut,User} from 'firebase/auth';
import {usePathname,useRouter} from 'next/navigation';
import Link from 'next/link';
import {auth,db} from '@/lib/firebase';
import {doc,onSnapshot} from 'firebase/firestore';
import {canAccess,UserProfile} from '@/lib/roles';
import LandWorkspace from './land-workspace';
export default function AdminShell({children}:{children:React.ReactNode}){
 const pathname=usePathname(),router=useRouter();
 const [state,setState]=useState<'loading'|'guest'|'allowed'|'denied'|'error'>('loading');
 useEffect(()=>{if(!auth||!db){setState('error');return;}let unsubscribeProfile:(()=>void)|undefined;const unsubscribe=onIdTokenChanged(auth,user=>{unsubscribeProfile?.();setState('loading');if(!user){setState('guest');return;}unsubscribeProfile=onSnapshot(doc(db!,'users',user.uid),snapshot=>{if(auth?.currentUser?.uid!==user.uid)return;setState(canAccess(snapshot.data() as Partial<UserProfile>)?'allowed':'denied');},()=>setState('error'));});return()=>{unsubscribe();unsubscribeProfile?.();};},[]);
 useEffect(()=>{if(pathname!=='/admin/login'&&state==='guest')router.replace('/admin/login?next='+encodeURIComponent(pathname));},[state,pathname,router]);
 if(pathname==='/admin/login')return <>{children}</>;
 if(state==='allowed')return <><div className="admin-session"><span>جلسة الإدارة</span><button onClick={()=>auth&&signOut(auth).catch(()=>setState('error'))}>تسجيل الخروج</button></div><LandWorkspace/>{children}</>;
 return <div className="admin-auth-screen"><div className="admin-auth-card"><img src="/qarm-logo.svg" alt="قَرم" width="78" height="62"/><h2>{state==='denied'?'لا تملك صلاحية الإدارة':state==='error'?'تعذر التحقق من تسجيل الدخول':'جارٍ التحقق من جلسة الإدارة…'}</h2>{(state==='denied'||state==='error')&&<><p>استخدم حسابًا مُعتمدًا لإدارة قَرم.</p><Link href="/admin/login" className="primary">صفحة تسجيل الدخول</Link></>}</div></div>;
}
