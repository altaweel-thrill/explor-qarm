'use client';
import {useEffect,useState} from 'react';
import {collection,onSnapshot,query,where,doc,updateDoc} from 'firebase/firestore';
import {UserProfile} from '@/lib/roles';
import {Inbox,Clock3,CheckCheck,LandPlot} from 'lucide-react';
import DashboardStats from '@/components/dashboard-stats';
import {db} from '@/lib/firebase';
import {ContactRequest,REQUESTS_KEY,cloudMode} from '@/lib/public-lands';
export default function ContactRequests({uid,profile}:{uid?:string;profile?:UserProfile}){
 const useCloud=cloudMode||profile?.role==='regional_supervisor';
 const [requests,setRequests]=useState<ContactRequest[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState('');
 useEffect(()=>{
  if(!useCloud){const read=()=>{try{setRequests(JSON.parse(localStorage.getItem(REQUESTS_KEY)||'[]'));}catch{setError('تعذر قراءة الطلبات المحلية.');}};read();window.addEventListener('storage',read);return()=>window.removeEventListener('storage',read);}
  setRequests([]);if(!uid||!db)return;
  const fail=()=>setError('تعذر تحميل الطلبات. تحقق من صلاحيات الإدارة وقواعد Firestore.');
  if(profile?.role!=='regional_supervisor')return onSnapshot(query(collection(db,'contactRequests'),where('adminUid','==',uid)),s=>setRequests(s.docs.map(d=>({...d.data(),id:d.id}) as ContactRequest)),fail);
  const firestore=db;
  const scopes=(profile.regions||[]).map(region=>({region,names:profile.governorates?.[region]||[]})).filter(scope=>scope.names.length);
  const groups=new Map<string,ContactRequest[]>();
  return scopes.map(({region,names})=>onSnapshot(query(collection(firestore,'contactRequests'),where('region','==',region),where('governorate','in',names)),s=>{groups.set(region,s.docs.map(d=>({...d.data(),id:d.id}) as ContactRequest));setRequests([...groups.values()].flat());},fail)).reduce<()=>void>((previous,unsubscribe)=>()=>{previous();unsubscribe();},()=>{});
 },[uid,profile,useCloud]);
 async function complete(request:ContactRequest){setBusy(request.id);try{if(useCloud){if(!db||!uid)throw Error();await updateDoc(doc(db,'contactRequests',request.id),{status:'تم التواصل'});}else{const next=requests.map(r=>r.id===request.id?{...r,status:'تم التواصل' as const}:r);localStorage.setItem(REQUESTS_KEY,JSON.stringify(next));setRequests(next);}}catch{setError('تعذر تحديث الطلب.');}finally{setBusy('');}}
 return <><DashboardStats items={[
  {label:'إجمالي الطلبات',value:requests.length,unit:'طلب',foot:'جميع طلبات التواصل الواردة',icon:Inbox},
  {label:'طلبات جديدة',value:requests.filter(request=>request.status==='جديد').length,unit:'طلب',foot:'بانتظار تواصل الفريق',icon:Clock3,gold:true},
  {label:'تم التواصل',value:requests.filter(request=>request.status==='تم التواصل').length,unit:'طلب',foot:'طلبات أُنجز التواصل بشأنها',icon:CheckCheck},
  {label:'أراضٍ مطلوبة',value:new Set(requests.map(request=>request.landId)).size,unit:'أرض',foot:'أراضٍ وصلها اهتمام من الزوار',icon:LandPlot},
 ]}/><section className="requests-panel"><div className="panel-title"><h2>طلبات التواصل <small>({requests.length})</small></h2></div>{!useCloud&&<p className="local-notice">طلبات تجريبية محفوظة في هذا المتصفح فقط.</p>}{error&&<p role="alert">{error}</p>}{!requests.length?<div className="empty">لا توجد طلبات تواصل بعد. ستظهر هنا طلبات زوار الواجهة الرئيسية.</div>:<div className="request-grid">{[...requests].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(r=><article className="request-card" key={r.id}><span className="badge">{r.status}</span><h3>{r.name}</h3><a dir="ltr" href={`tel:${r.phone.replace(/[^+0-9]/g,'')}`}>{r.phone}</a><p>الأرض: {r.landTitle}</p><p>{r.message}</p><small>{new Date(r.createdAt).toLocaleString('ar-SA')}</small><button className="secondary full" disabled={r.status==='تم التواصل'||busy===r.id} onClick={()=>complete(r)}>تم التواصل</button></article>)}</div>}</section></>;
}
