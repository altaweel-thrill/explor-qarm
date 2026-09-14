import {SAUDI_REGIONS} from '@/lib/regions';
import {governoratesFor} from '@/lib/governorates';

type Scope={regions:string[];governorates:Record<string,string[]>};
export default function RegionCheckboxes({value,onChange,disabled=false}:{value:Scope;onChange:(value:Scope)=>void;disabled?:boolean}){
 function toggleRegion(region:string,checked:boolean){
  const regions=checked?[...value.regions,region]:value.regions.filter(r=>r!==region);
  const governorates={...value.governorates};
  if(!checked)delete governorates[region];
  else governorates[region]=governorates[region]||[];
  onChange({regions,governorates});
 }
 function setGovernorates(region:string,names:string[]){onChange({...value,governorates:{...value.governorates,[region]:names}});}
 return <fieldset className="region-picker" disabled={disabled}><legend>المناطق والمحافظات المسموحة <small>اختر محافظة واحدة على الأقل في كل منطقة</small></legend><div className="region-groups">{SAUDI_REGIONS.map(region=>{
  const checked=value.regions.includes(region),selected=value.governorates[region]||[],items=governoratesFor(region);
  return <div className="region-group" key={region}><label className="region-heading"><input type="checkbox" checked={checked} onChange={e=>toggleRegion(region,e.target.checked)}/><strong>{region}</strong><small>{selected.length}/{items.length}</small></label>{checked&&<div className="governorate-options"><button className="select-all" type="button" onClick={()=>setGovernorates(region,selected.length===items.length?[]:items.map(g=>g.name))}>{selected.length===items.length?'إلغاء تحديد الكل':'تحديد الكل'}</button>{items.map(g=><label key={g.id}><input type="checkbox" checked={selected.includes(g.name)} onChange={e=>setGovernorates(region,e.target.checked?[...selected,g.name]:selected.filter(name=>name!==g.name))}/>{g.name}{g.capital&&<small>مقر الإمارة</small>}</label>)}</div>}</div>;
 })}</div></fieldset>;
}
