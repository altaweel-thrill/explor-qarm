import {Land} from './lands';
export type PublicLand=Pick<Land,'id'|'title'|'propertyType'|'location'|'region'|'governorate'|'district'|'area'|'price'|'status'|'path'> & {adminUid?:string};
export type ContactRequest={id:string;landId:string;landTitle:string;name:string;phone:string;message:string;createdAt:string;status:'جديد'|'تم التواصل';adminUid:string;region?:string;governorate?:string};
export const PUBLIC_KEY='qarm-public-lands-v1';
export const REQUESTS_KEY='qarm-contact-requests-v1';
export const cloudMode=process.env.NEXT_PUBLIC_REQUIRE_LOGIN==='true';
export function publicLand(land:Land,adminUid=''):PublicLand{return {id:land.id,title:land.title,...(land.propertyType?{propertyType:land.propertyType}:{}),location:land.location,region:land.region||'',governorate:land.governorate||'',district:land.district||'',area:land.area,price:land.price,status:land.status,path:land.path,adminUid};}
export function publishLocal(lands:Land[]){localStorage.setItem(PUBLIC_KEY,JSON.stringify(lands.filter(l=>l.status!=='مباعة').map(l=>publicLand(l))));window.dispatchEvent(new Event('qarm-public-updated'));}
