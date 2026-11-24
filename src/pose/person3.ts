/** Person 3: pure, on-device geometry, scoring and feedback. No native dependency. */
export type Landmark = { x:number; y:number; z?:number; visibility?:number };
export type AngleRule = { id:string; points:[string,string,string]; min:number; max:number; tolerance:number; weight?:number; below:string; above:string; sourceId:string; evidence:'project-defined'|'published' };
export type Result = { score:number|null; coverage:number; status:'correct'|'adjust'|'unavailable'; angles:Record<string,number>; feedback:string[]; confidenceCoverage:number };
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
export function jointAngle(a?:Landmark|null,b?:Landmark|null,c?:Landmark|null,dimension:2|3=2,visibility=0.5):number|null {
 if(!a||!b||!c||[a,b,c].some(p=>!finite(p.x)||!finite(p.y)||(dimension===3&&!finite(p.z))||(p.visibility!==undefined&&(!finite(p.visibility)||p.visibility<visibility))))return null;
 const u=dimension===3?[a.x-b.x,a.y-b.y,a.z!-b.z!]:[a.x-b.x,a.y-b.y];
 const v=dimension===3?[c.x-b.x,c.y-b.y,c.z!-b.z!]:[c.x-b.x,c.y-b.y];
 const nu=Math.hypot(...u),nv=Math.hypot(...v);if(nu<1e-8||nv<1e-8)return null;
 const cosine=u.reduce((sum,x,i)=>sum+x*v[i],0)/(nu*nv);
 return Math.acos(Math.max(-1,Math.min(1,cosine)))*180/Math.PI;
}
export function evaluate(landmarks:Record<string,Landmark|undefined>,rules:AngleRule[],options:{dimension?:2|3;minCoverage?:number;correctThreshold?:number}={}):Result {
 const angles:Record<string,number>={};const minCoverage=options.minCoverage??1;
 if(!rules.length)return {score:null,coverage:0,confidenceCoverage:0,status:'unavailable',angles,feedback:['Reference angles are not configured for this pose']};
 let validWeight=0,totalWeight=0,weightedScore=0;const failures:{error:number;message:string}[]=[];
 for(const rule of rules){const weight=rule.weight??1; if(!finite(weight)||weight<=0||!finite(rule.min)||!finite(rule.max)||rule.min>rule.max||!finite(rule.tolerance)||rule.tolerance<=0)throw Error(`Invalid rule ${rule.id}`);
 totalWeight+=weight;const [a,b,c]=rule.points.map(n=>landmarks[n]);const angle=jointAngle(a,b,c,options.dimension??2);
 if(angle===null)continue;
 angles[rule.id]=angle;validWeight+=weight;
 const error=Math.max(rule.min-angle,0,angle-rule.max);weightedScore+=weight*100*Math.max(0,1-error/(2*rule.tolerance));
 if(error>0)failures.push({error:error/rule.tolerance,message:angle<rule.min?rule.below:rule.above});
 }
 const coverage=validWeight/totalWeight;
 if(coverage<minCoverage)return {score:null,coverage,confidenceCoverage:coverage,status:'unavailable',angles,feedback:['Move your full body into the camera view']};
 const score=Math.round(weightedScore/validWeight*10)/10;
 failures.sort((a,b)=>b.error-a.error);
 const status=failures.length===0&&score>=(options.correctThreshold??85)?'correct':'adjust';
 return {score,coverage,confidenceCoverage:coverage,status,angles,feedback:status==='correct'?['Great alignment — hold steady']:failures.length?[failures[0].message]:['Adjust your posture gently']};
}
/** Per-frame EMA; reset on pose switch or tracking loss. */
export function smooth(previous:number|null,current:number|null,alpha=0.3):number|null {
 if(current===null||!finite(current))return null;
 if(previous===null||!finite(previous))return current;
 if(alpha<=0||alpha>1)throw Error('alpha must be in (0,1]');
 return previous+alpha*(current-previous);
}
export type PracticeAttempt={pose_id:number;day_number:number;accuracy_score:number;created_at:string;duration_seconds?:number};
export function weeklySummary(attempts:PracticeAttempt[],now=new Date()){
 const end=now.getTime(),start=end-7*86400000;
 const valid=attempts.filter(a=>finite(a.accuracy_score)&&a.accuracy_score>=0&&a.accuracy_score<=100&&Number.isFinite(Date.parse(a.created_at))&&Date.parse(a.created_at)>=start&&Date.parse(a.created_at)<=end);
 const mean=(scores:number[])=>scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10:null;
 const poses:Record<number,number[]>={};for(const a of valid)(poses[a.pose_id]??=[]).push(a.accuracy_score);
 const dates=new Set(valid.map(a=>new Date(a.created_at).toISOString().slice(0,10)));
 const midpoint=start+3.5*86400000;
 const first=valid.filter(a=>Date.parse(a.created_at)<midpoint).map(a=>a.accuracy_score);
 const second=valid.filter(a=>Date.parse(a.created_at)>=midpoint).map(a=>a.accuracy_score);
 const improvement=first.length&&second.length?Math.round((mean(second)!-mean(first)!)*10)/10:null;
 return {average:mean(valid.map(a=>a.accuracy_score)),completedAttempts:valid.length,poseAverages:Object.fromEntries(Object.entries(poses).map(([k,v])=>[k,mean(v)])),practiceSeconds:valid.some(a=>finite(a.duration_seconds))?valid.reduce((s,a)=>s+(finite(a.duration_seconds)&&a.duration_seconds!>=0?a.duration_seconds!:0),0):null,improvementPoints:improvement,daysPracticed:dates.size,daysWithoutAttempts:7-dates.size};
}
