import {doc,getDoc} from 'firebase/firestore';
import {db} from './firebase';
import {validSupervisorScope} from './governorates';
export type UserProfile={id:string;email:string;name:string;role:'admin'|'editor'|'regional_supervisor';regions?:string[];governorates?:Record<string,string[]>;active:boolean};
export function canAccess(profile:Partial<UserProfile>|undefined){return profile?.active===true&&(profile.role==='admin'||profile.role==='editor'||(profile.role==='regional_supervisor'&&validSupervisorScope(profile.regions||[],profile.governorates||{})));}
export async function getProfile(uid:string){if(!db)throw Error('Firestore unavailable');const snapshot=await getDoc(doc(db,'users',uid));return snapshot.exists()?({...snapshot.data(),id:uid} as UserProfile):undefined;}
