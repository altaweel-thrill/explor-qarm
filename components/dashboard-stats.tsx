import type {LucideIcon} from 'lucide-react';
import {format} from '@/lib/lands';

export type StatItem={label:string;value:number;unit:string;foot:string;icon:LucideIcon;gold?:boolean};

export default function DashboardStats({items}:{items:StatItem[]}){
 return <div className="stats">{items.map(({label,value,unit,foot,icon:Icon,gold})=><div className="stat" key={label}>
  <span className={'stat-icon'+(gold?' gold-icon':'')}><Icon/></span>
  <div><span>{label}</span><strong>{format(value)} <small>{unit}</small></strong></div>
  <span className="stat-foot">{foot}</span>
 </div>)}</div>;
}
