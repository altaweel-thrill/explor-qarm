import directory from './governorates.json';

export type Governorate = {id:string;name:string;capital:boolean};
export const GOVERNORATES = directory as Record<string,Governorate[]>;
export function governoratesFor(region:string):Governorate[]{return GOVERNORATES[region]||[];}
export function governorateNames(region:string):string[]{return governoratesFor(region).map(g=>g.name);}
export function normalizeGovernorate(region:string,value:string):string{
 const clean=(text:string)=>text.trim().replace(/^(?:مدينة|محافظة)\s+/,'').replace(/\s+/g,' ').replace(/[إأآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
 const target=clean(value);
 return governorateNames(region).find(name=>clean(name)===target)||'';
}
export function allowedGovernorates(profile:{regions?:string[];governorates?:Record<string,string[]>},region:string):string[]{
 return profile.regions?.includes(region)?(profile.governorates?.[region]||[]):[];
}
export function validSupervisorScope(regions:string[],governorates:Record<string,string[]>):boolean{
 return regions.length>0 && regions.every(region=>{
  const chosen=governorates[region]||[];
  const allowed=governorateNames(region);
  return chosen.length>0 && new Set(chosen).size===chosen.length && chosen.every(name=>allowed.includes(name));
 });
}
