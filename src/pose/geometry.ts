export type Point = {x:number;y:number;visibility?:number};
export function angleAt(a?:Point|null,b?:Point|null,c?:Point|null,minVisibility=0.5):number|null {
 if(!a||!b||!c||[a,b,c].some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||(p.visibility!==undefined&&p.visibility<minVisibility)))return null;
 const ux=a.x-b.x,uy=a.y-b.y,vx=c.x-b.x,vy=c.y-b.y;
 const n1=Math.hypot(ux,uy),n2=Math.hypot(vx,vy);if(n1<1e-8||n2<1e-8)return null;
 return Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(n1*n2))))*180/Math.PI;
}
export function scoreAngles(measured:Record<string,number|null>,reference:{joint_name:string;min_angle:number;max_angle:number;tolerance_deg:number}[]){
 if(!reference.length)return {score:null,coverage:0,correct:false,feedback:['Reference angles have not been configured']};
 let total=0,valid=0;const feedback:string[]=[];
 for(const r of reference){const value=measured[r.joint_name];if(value==null||!Number.isFinite(value)){feedback.push(`Move ${r.joint_name.replace(/_/g,' ')} into camera view`);continue;}
 valid++;const deviation=Math.max(r.min_angle-value,0,value-r.max_angle);const tolerance=Math.max(1,r.tolerance_deg);
 total+=100*Math.max(0,1-deviation/(2*tolerance));if(deviation>0)feedback.push(`Adjust ${r.joint_name.replace(/_/g,' ')} by ${Math.round(deviation)}°`);
 }
 const coverage=valid/reference.length;
 return {score:valid?Math.round(total/valid):null,coverage,correct:coverage===1&&feedback.length===0,feedback};
}
