'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {browserSessionPersistence,setPersistence,signInWithEmailAndPassword,signOut} from 'firebase/auth';
import {Eye,EyeOff,ArrowLeft,LockKeyhole} from 'lucide-react';
import {auth} from '@/lib/firebase';
import {getProfile,canAccess} from '@/lib/roles';
function loginFailure(error:unknown,authenticated:boolean){
 const code=(error as {code?:string}).code;
 const detail=(error as {message?:string}).message||'';
 if(authenticated)return code==='permission-denied'?'تم تسجيل الدخول، لكن Firestore منع قراءة صلاحيات الحساب. تحقق من قواعد المستخدمين المنشورة.':'تم تسجيل الدخول، لكن تعذر جلب صلاحيات الحساب من Firestore. حاول مجددًا.';
 if(detail.includes('Requests from referer')||detail.includes('API_KEY_HTTP_REFERRER_BLOCKED'))return 'نطاق هذا الموقع غير مسموح في قيود مفتاح Firebase. أضف نطاق الموقع إلى المواقع المسموحة للمفتاح في Google Cloud.';
 switch(code){
  case 'auth/invalid-credential':case 'auth/wrong-password':case 'auth/user-not-found':return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  case 'auth/too-many-requests':return 'محاولات كثيرة. يرجى المحاولة لاحقًا.';
  case 'auth/network-request-failed':return 'تعذر الاتصال بـ Firebase. تحقق من الإنترنت ومن سماح مفتاح Firebase لنطاق هذا الموقع.';
  case 'auth/operation-not-allowed':return 'تسجيل الدخول بالبريد وكلمة المرور غير مفعّل.';
  case 'auth/unauthorized-domain':return 'نطاق هذا الموقع غير مضاف إلى النطاقات المصرح بها.';
  case 'auth/invalid-api-key':return 'مفتاح Firebase غير صحيح أو نطاق هذا الموقع غير مسموح له باستخدامه.';
  case 'auth/not-configured':return 'إعدادات Firebase غير مكتملة في النسخة المنشورة.';
  default:return `تعذر تسجيل الدخول${code?' ('+code+')':''}. تحقق من إعدادات Firebase وحاول مجددًا.`;
 }
}
export default function AdminLogin(){
 const router=useRouter();const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setError('');setBusy(true);let authenticated=false;try{if(!auth)throw {code:'auth/not-configured'};await setPersistence(auth,browserSessionPersistence);const result=await signInWithEmailAndPassword(auth,email.trim(),password);authenticated=true;const profile=await getProfile(result.user.uid);if(!canAccess(profile)){await signOut(auth);setError('هذا الحساب لا يملك صلاحية الإدارة. تواصل مع مسؤول المشروع.');return;}setPassword('');const next=new URLSearchParams(window.location.search).get('next');const allowed=['/admin','/admin/lands','/admin/requests','/admin/users','/admin/supervisors'];router.replace(next&&allowed.includes(next)?next:'/admin');}catch(e){setError(loginFailure(e,authenticated));}finally{setBusy(false);}}
 return <div className="admin-auth-screen"><div className="admin-auth-card"><Link href="/" aria-label="العودة إلى الرئيسية"><img src="/qarm-logo.svg" alt="قَرم" width="78" height="62"/></Link><span className="auth-eyebrow"><LockKeyhole size={15}/> مساحة الإدارة</span><h1>أهلًا بعودتك</h1><p>سجّل الدخول لإدارة الأراضي ومتابعة طلبات التواصل.</p><form onSubmit={submit}><label>البريد الإلكتروني<input required type="email" autoComplete="username" dir="ltr" value={email} maxLength={254} disabled={busy} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></label><label htmlFor="admin-password">كلمة المرور</label><div className="password-field"><input id="admin-password" required type={visible?'text':'password'} autoComplete="current-password" dir="ltr" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/><button type="button" aria-label={visible?'إخفاء كلمة المرور':'إظهار كلمة المرور'} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{error&&<p className="form-error" role="alert">{error}</p>}<button className="primary full" disabled={busy}><ArrowLeft size={17}/>{busy?'جارٍ تسجيل الدخول…':'تسجيل الدخول'}</button></form><Link href="/" className="auth-back">العودة إلى الموقع</Link></div><span className="auth-footer">قَرم — مساحة لرؤية أكبر</span></div>;
}
