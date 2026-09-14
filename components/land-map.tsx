/// <reference types="google.maps" />
'use client';
import {useEffect,useRef,useState} from 'react';
import {Crosshair,Layers,LoaderCircle,Minus,Plus,Undo2,Eye,EyeOff} from 'lucide-react';
import {Land,Point} from '@/lib/lands';
let mapsPromise:Promise<void>|null=null;
function loadMaps(key:string){if(!mapsPromise)mapsPromise=new Promise((resolve,reject)=>{if(window.google?.maps){resolve();return;}const script=document.createElement('script');script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=quarterly&language=ar&region=SA&loading=async&callback=qarmMapReady`;(window as unknown as Record<string,unknown>).qarmMapReady=resolve;script.onerror=()=>reject(new Error('تعذر تحميل الخريطة'));document.head.appendChild(script);});return mapsPromise;}
export default function LandMap({lands,selected,onSelect,drawing,path,onPath}:{lands:Land[];selected:string|null;onSelect:(id:string)=>void;drawing:boolean;path:Point[];onPath:(p:Point[])=>void}){
 const container=useRef<HTMLDivElement>(null),map=useRef<google.maps.Map|null>(null);const [ready,setReady]=useState(false),[error,setError]=useState(''),[satellite,setSatellite]=useState(false),[hideIcons,setHideIcons]=useState(false);const key=process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
 const live=useRef({drawing,path,onPath});live.current={drawing,path,onPath};
 useEffect(()=>{if(!key)return;let active=true;let listener:google.maps.MapsEventListener|undefined;loadMaps(key).then(()=>{if(!active||!container.current)return;map.current=new google.maps.Map(container.current,{center:{lat:24.829,lng:46.635},zoom:12,disableDefaultUI:true,clickableIcons:false,gestureHandling:'greedy'});listener=map.current.addListener('click',(e:google.maps.MapMouseEvent)=>{const c=live.current;if(c.drawing&&e.latLng&&c.path.length<100)c.onPath([...c.path,e.latLng.toJSON()]);});setReady(true);}).catch(()=>setError('تعذر تحميل Google Maps. تحقق من المفتاح والاتصال.'));return()=>{active=false;listener?.remove();};},[key]);
 useEffect(()=>{if(!ready||!map.current)return;const polygons=lands.map(land=>{const color=land.status==='محجوزة'?'#d79538':land.status==='متاحة للإيجار'?'#2c8298':'#256856';const polygon=new google.maps.Polygon({map:map.current,paths:land.path,strokeColor:land.id===selected?'#d79538':color,strokeWeight:3,fillColor:color,fillOpacity:.35,clickable:!drawing});polygon.addListener('click',()=>onSelect(land.id));return polygon;});return()=>polygons.forEach(p=>{google.maps.event.clearInstanceListeners(p);p.setMap(null);});},[lands,selected,ready,drawing,onSelect]);
 useEffect(()=>{if(!ready||!map.current||path.length===0)return;const polygon=new google.maps.Polygon({map:map.current,paths:path,strokeColor:'#d79538',fillColor:'#d79538',fillOpacity:.25,editable:drawing,clickable:false});const p=polygon.getPath();const update=()=>live.current.onPath(p.getArray().map(x=>x.toJSON()));const listeners=['set_at','insert_at','remove_at'].map(e=>p.addListener(e,update));return()=>{listeners.forEach(l=>l.remove());polygon.setMap(null);};},[path,drawing,ready]);
 useEffect(()=>{if(!ready||!selected)return;const land=lands.find(l=>l.id===selected);if(land?.path.length){const bounds=new google.maps.LatLngBounds();land.path.forEach(p=>bounds.extend(p));map.current?.fitBounds(bounds,100);}},[selected,ready,lands]);
 useEffect(()=>{map.current?.setOptions({draggableCursor:drawing?'crosshair':null});},[drawing,ready]);
 useEffect(()=>{if(!ready)return;map.current?.setOptions({styles:hideIcons?[{featureType:'poi',elementType:'labels.icon',stylers:[{visibility:'off'}]},{featureType:'transit',elementType:'labels.icon',stylers:[{visibility:'off'}]}]:[]});},[hideIcons,ready]);
 const [locating,setLocating]=useState(false),[locationMessage,setLocationMessage]=useState('');
 const locationLayers=useRef<google.maps.Circle[]>([]);
 const locationRequest=useRef(0);
 useEffect(()=>()=>{locationRequest.current++;locationLayers.current.forEach(layer=>layer.setMap(null));},[]);
 function locateUser(){
  if(!map.current||locating)return;
  if(!navigator.geolocation){setLocationMessage('هذا المتصفح لا يدعم تحديد الموقع.');return;}
  setLocating(true);setLocationMessage('جارٍ تحديد موقعك…');
  const request=++locationRequest.current;
  navigator.geolocation.getCurrentPosition(position=>{
   if(request!==locationRequest.current||!map.current)return;
   const center={lat:position.coords.latitude,lng:position.coords.longitude};
   const accuracy=position.coords.accuracy;
   locationLayers.current.forEach(layer=>layer.setMap(null));
   const accuracyCircle=new google.maps.Circle({map:map.current,center,radius:accuracy,strokeColor:'#4285f4',strokeOpacity:0.35,strokeWeight:1,fillColor:'#4285f4',fillOpacity:0.12,clickable:false});
   const dot=new google.maps.Circle({map:map.current,center,radius:8,strokeColor:'#ffffff',strokeWeight:3,fillColor:'#4285f4',fillOpacity:1,clickable:false,zIndex:100});
   locationLayers.current=[accuracyCircle,dot];
   map.current.panTo(center);map.current.setZoom(17);
   if(accuracy>150){const bounds=accuracyCircle.getBounds();if(bounds)map.current.fitBounds(bounds,60);}
   setLocating(false);setLocationMessage(`موقعك الحالي • دقة تقريبية ${Math.round(accuracy)} متر`);
  },error=>{
   if(request!==locationRequest.current)return;
   setLocating(false);
   setLocationMessage(error.code===1?'اسمح بالوصول إلى موقعك من إعدادات المتصفح ثم حاول مجددًا.':error.code===3?'انتهت مهلة تحديد الموقع. حاول مجددًا.':'تعذر تحديد موقعك. تحقق من تفعيل خدمات الموقع ثم حاول مجددًا.');
  },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
 }
 const project=(p:Point)=>({x:(p.lng-46.585)/.1*1000,y:(24.88-p.lat)/.1*700});
 return <div className="map-shell"><div ref={container} className="google-map"/>{!ready&&<div className="demo-map"><svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-label="مخطط توضيحي للأراضي، وليس خريطة جغرافية"><defs><pattern id="blocks" width="100" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><rect width="100" height="80" fill="#f1eee6"/><rect x="7" y="7" width="85" height="65" rx="5" fill="#e5e3d9"/><path d="M50 7v65M7 40h85" stroke="#f1eee6" strokeWidth="5"/></pattern></defs><rect width="1000" height="700" fill="url(#blocks)"/><path d="M-60 470 Q180 300 390 420T1050 320" stroke="#d9e2cc" strokeWidth="90" fill="none"/><g fill="none" stroke="#faf9f4" strokeWidth="25"><path d="M-100 500L1100 70M150 -50L600 800M-80 170L1050 620M680 -50L260 800"/></g><g fill="none" stroke="#ddd6c7" strokeWidth="2"><path d="M-100 500L1100 70M150 -50L600 800M-80 170L1050 620M680 -50L260 800"/></g><g fill="#8c9589" fontSize="17" textAnchor="middle"><text x="710" y="140">حي النرجس</text><text x="390" y="180">حي العارض</text><text x="210" y="550">حي الملقا</text><text x="760" y="550">شمال الرياض</text></g>{lands.map((land,i)=>{const p=project(land.path[0]);return <g key={land.id} onClick={()=>onSelect(land.id)} className="map-marker" role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')onSelect(land.id);}} aria-label={land.title}><rect x={p.x-28} y={p.y-20} width="58" height="44" transform={`rotate(-24 ${p.x} ${p.y})`} fill={land.status==='محجوزة'?'#d7953880':land.status==='متاحة للإيجار'?'#2c829880':'#25685666'} stroke={selected===land.id?'#d79538':land.status==='متاحة للإيجار'?'#2c8298':'#256856'} strokeWidth="3"/><rect x={p.x-52} y={p.y-61} width="104" height="30" rx="15" fill={selected===land.id?'#256856':'white'}/><text x={p.x} y={p.y-41} textAnchor="middle" fontSize="13" fill={selected===land.id?'white':'#256856'}>{land.area} م²</text></g>})}</svg><div className="demo-label">{error|| (key?'جارٍ تحميل الخريطة…':'معاينة توضيحية • أضف مفتاح Google Maps لتفعيل الرسم')}</div></div>}
 <div className="map-heading"><span className="live-dot"/> {drawing?'انقر على زوايا الأرض بالترتيب':'استكشف أراضيك على الخريطة'}</div>
 {drawing&&<div className="draw-tools"><span>{path.length} نقاط محددة</span><button onClick={()=>onPath(path.slice(0,-1))} disabled={!path.length}><Undo2 size={16}/> تراجع</button><button onClick={()=>onPath([])} disabled={!path.length}>مسح الحدود</button></div>}
 <div className="map-controls"><button title="تكبير" disabled={!ready} onClick={()=>map.current?.setZoom((map.current.getZoom()||12)+1)}><Plus size={20}/></button><button title="تصغير" disabled={!ready} onClick={()=>map.current?.setZoom((map.current.getZoom()||12)-1)}><Minus size={20}/></button><button title="موقعي الحالي" aria-label="موقعي الحالي" aria-busy={locating} disabled={!ready||locating} onClick={locateUser}>{locating?<LoaderCircle className="location-spinner" size={20}/>:<Crosshair size={20}/>}</button><button title={hideIcons?'إظهار الأيقونات':'إخفاء الأيقونات'} aria-label={hideIcons?'إظهار الأيقونات':'إخفاء الأيقونات'} disabled={!ready} aria-pressed={hideIcons} onClick={()=>setHideIcons(v=>!v)}>{hideIcons?<Eye size={20}/>:<EyeOff size={20}/>}</button></div>
 {locationMessage&&<div className="location-message" role="status">{locationMessage}</div>}

 <button className="map-layer" disabled={!ready} onClick={()=>{map.current?.setMapTypeId(satellite?'roadmap':'satellite');setSatellite(!satellite);}}><Layers size={18}/>{satellite?'خريطة الشوارع':'القمر الصناعي'}</button><div className="map-legend"><span><i/> للبيع</span><span><i className="rent"/> للإيجار</span><span><i className="gold"/> محجوزة</span></div>
 </div>;
}
