export const SAUDI_REGIONS=['الرياض','مكة المكرمة','المدينة المنورة','القصيم','الشرقية','عسير','تبوك','حائل','الحدود الشمالية','جازان','نجران','الباحة','الجوف'] as const;
export function normalizeRegion(value:string){const text=value.trim().replace(/^منطقة\s+/,'').replace(/^المنطقة\s+/,'');return (SAUDI_REGIONS as readonly string[]).includes(text)?text:'';}
