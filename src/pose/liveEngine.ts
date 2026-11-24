import type { PoseDefinition } from '../data/poseRules';
export type Reading = (points: string[]) => number | null;
export const swapSide = (n:string) => n.startsWith('left') ? 'right'+n.slice(4) : n.startsWith('right') ? 'left'+n.slice(5) : n;
export function evaluateSide(def:PoseDefinition, read:Reading, mirror:boolean, history:Record<string,number>) {
 let sum=0, valid=0, worst=0, tip=''; const angles:Record<string,number>={};
 for (const [i,r] of def.rules.entries()) {
  const points=mirror?r.points.map(swapSide):r.points;
  const key=`${mirror}:${i}`; const raw=read(points);
  if(raw===null || !Number.isFinite(raw) || raw<0 || raw>180){delete history[key];continue;}
  const a=history[key]===undefined?raw:history[key]+0.35*(raw-history[key]); history[key]=a;
  angles[points.join('_')]=Math.round(a); valid++;
  const low=Math.max(0,r.target-r.tolerance), high=Math.min(180,r.target+r.tolerance);
  const error=Math.max(0,low-a,a-high); const rawError=Math.max(0,low-raw,raw-high);
  const deviation=Math.max(error,rawError);
  sum+=Math.max(0,100-2*deviation);
  if(deviation>worst){worst=deviation;tip=mirror?r.tip.replace(/left|right/g,swapSide):r.tip;}
 }
 const available=valid===def.rules.length && valid>0;
 return {score:available?Math.round(sum/valid):null, correct:available&&worst===0, coverage:def.rules.length?valid/def.rules.length:0, angles, feedback:!available?'Step back so the required joints are visible':worst?tip:'Great — hold it steady!'};
}
export function evaluateFrame(def:PoseDefinition,read:Reading,history:Record<string,number>){
 const a=evaluateSide(def,read,false,history); if(!def.mirror)return a;
 const b=evaluateSide(def,read,true,history);
 return (b.score??-1)>(a.score??-1)?b:a;
}
