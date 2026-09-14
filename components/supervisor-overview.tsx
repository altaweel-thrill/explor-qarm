'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {collection,onSnapshot} from 'firebase/firestore';
import {Check,Map,ShieldCheck,UsersRound,ArrowUpLeft} from 'lucide-react';
import {db} from '@/lib/firebase';
import {UserProfile,canAccess} from '@/lib/roles';
import {SAUDI_REGIONS} from '@/lib/regions';
import regionMap from '@/lib/saudi-region-map.json';
import DashboardStats from '@/components/dashboard-stats';

type RegionShape={path:string;label:number[]};
const shapes=regionMap as Record<string,RegionShape>;

export default function SupervisorOverview({profile}:{profile:UserProfile}){
 const [users,setUsers]=useState<UserProfile[]>([]);
 const [selected,setSelected]=useState<string>('الرياض');
 const [loaded,setLoaded]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  if(profile.role!=='admin'||!profile.active||!db)return;
  return onSnapshot(collection(db,'users'),snapshot=>{
   setUsers(snapshot.docs.map(item=>({...item.data(),id:item.id}) as UserProfile));
   setLoaded(true);setError('');
  },()=>{setLoaded(true);setError('تعذر تحميل بيانات المشرفين. تحقق من اتصالك وصلاحيات Firestore.');});
 },[profile.role,profile.active]);
 if(profile.role!=='admin'||!profile.active)return <div className="empty">هذه الصفحة متاحة للمدير فقط.</div>;
 if(!loaded)return <div className="empty">جارٍ تحميل توزيع المشرفين على المناطق…</div>;
 if(error)return <div className="empty" role="alert">{error}</div>;
 const supervisors=users.filter(user=>user.role==='regional_supervisor');
 const active=supervisors.filter(canAccess);
 const byRegion=Object.fromEntries(SAUDI_REGIONS.map(region=>[region,active.filter(user=>user.regions?.includes(region))])) as Record<string,UserProfile[]>;
 const covered=SAUDI_REGIONS.filter(region=>byRegion[region].length>0).length;
 const selectedUsers=byRegion[selected]||[];
 return <section className="supervisor-overview">
  <DashboardStats items={[
   {label:'المشرفون النشطون',value:active.length,unit:'مشرف',foot:'بحسابات وصلاحيات مكتملة',icon:ShieldCheck},
   {label:'المناطق المغطاة',value:covered,unit:'منطقة',foot:'من أصل ١٣ منطقة إدارية',icon:Map},
   {label:'مناطق بلا مشرف',value:13-covered,unit:'منطقة',foot:'تحتاج إلى تعيين مشرف',icon:Check,gold:true},
   {label:'إجمالي التكليفات',value:SAUDI_REGIONS.reduce((sum,region)=>sum+byRegion[region].length,0),unit:'تكليف',foot:'قد يُكلّف المشرف بأكثر من منطقة',icon:UsersRound},
  ]}/>
  <div className="supervisor-layout">
   <div className="supervisor-map-card">
    <div className="supervisor-card-heading"><div><span className="eyebrow">التغطية الإدارية</span><h2>المشرفون على خريطة المملكة</h2><p>اختر منطقة لمعرفة المشرفين المكلّفين بها.</p></div><span className="supervisor-map-count">١٣ منطقة</span></div>
    <svg className="supervisor-svg" viewBox="0 0 900 670" aria-label="خريطة المناطق الإدارية الثلاث عشرة في السعودية وأعداد المشرفين النشطين" xmlns="http://www.w3.org/2000/svg">
     <defs><linearGradient id="supervisor-map-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6f8f0"/><stop offset="1" stopColor="#eaf2ed"/></linearGradient><pattern id="supervisor-map-grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#d7e3da" strokeWidth=".6"/></pattern></defs>
     <rect width="900" height="670" rx="16" fill="url(#supervisor-map-bg)"/><rect width="900" height="670" rx="16" fill="url(#supervisor-map-grid)" opacity=".55"/>
     {SAUDI_REGIONS.map(region=>{
      const shape=shapes[region],count=byRegion[region].length,isSelected=selected===region;
      return <g key={region} role="button" tabIndex={0} aria-label={`${region}: ${count} مشرف`} aria-pressed={isSelected} className={'supervisor-map-region'+(count?' covered':'')+(isSelected?' selected':'')} onClick={()=>setSelected(region)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelected(region);}}}>
       <title>{region}: {count} مشرف نشط</title><path d={shape.path} fillRule="evenodd"/>
       <g transform={`translate(${shape.label[0]} ${shape.label[1]})`} className="supervisor-map-marker"><circle r="19"/><text textAnchor="middle" y="5">{count}</text><text className="supervisor-map-name" textAnchor="middle" y="36">{region}</text></g>
      </g>;
     })}
    </svg>
    <div className="supervisor-map-footer"><span><i/> عدد المشرفين النشطين المكلّفين بكل منطقة</span><a href="https://www.geoboundaries.org/api/current/gbOpen/SAU/ADM1/" target="_blank" rel="noreferrer">حدود توضيحية: geoBoundaries / © OpenStreetMap</a></div>
   </div>
   <aside className="supervisor-region-detail"><div className="supervisor-detail-header"><span className="eyebrow">المنطقة المحددة</span><h2>{selected}</h2><p><strong>{selectedUsers.length}</strong> {selectedUsers.length===1?'مشرف نشط':'مشرفون نشطون'} في هذه المنطقة</p></div>
    {selectedUsers.length?<div className="supervisor-person-list">{selectedUsers.map(user=><article key={user.id}><span className="supervisor-avatar">{(user.name||user.email).trim().slice(0,1)}</span><div><strong>{user.name||user.email}</strong><small dir="ltr">{user.email}</small><span>{user.governorates?.[selected]?.length||0} محافظات مكلّف بها</span></div></article>)}</div>:<div className="supervisor-empty"><ShieldCheck size={34}/><strong>لا يوجد مشرف نشط</strong><p>عيّن مشرفًا لهذه المنطقة وحدد محافظاته من صفحة المستخدمين والصلاحيات.</p></div>}
    <Link href="/admin/users" className="secondary supervisor-manage-link">إدارة الصلاحيات <ArrowUpLeft size={16}/></Link>
   </aside>
  </div>
  <div className="supervisor-region-list"><div className="supervisor-list-heading"><h2>جميع المناطق</h2><span>اضغط على المنطقة لإظهار تفاصيلها على الخريطة</span></div><div className="supervisor-region-grid">{SAUDI_REGIONS.map(region=><button key={region} className={selected===region?'selected':''} aria-pressed={selected===region} onClick={()=>setSelected(region)}><span>{region}</span><strong>{byRegion[region].length}</strong></button>)}</div></div>
 </section>;
}
