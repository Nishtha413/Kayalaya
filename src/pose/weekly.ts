export type Attempt={pose_id:number;accuracy_score:number;created_at:string};
export function weeklyAssessment(attempts:Attempt[],now=new Date()){
 const start=now.getTime()-7*86400000;const week=attempts.filter(a=>{const t=Date.parse(a.created_at);return Number.isFinite(t)&&t>=start&&t<=now.getTime()&&Number.isFinite(a.accuracy_score)});
 const average=week.length?week.reduce((s,a)=>s+a.accuracy_score,0)/week.length:null;
 const byPose:Record<number,{sum:number;count:number}>={};for(const a of week){const v=byPose[a.pose_id]??{sum:0,count:0};v.sum+=a.accuracy_score;v.count++;byPose[a.pose_id]=v;}
 const poseAverages=Object.fromEntries(Object.entries(byPose).map(([k,v])=>[k,Math.round(v.sum/v.count)]));
 const dates=new Set(week.map(a=>new Date(a.created_at).toISOString().slice(0,10)));
 return {average:average===null?null:Math.round(average),completedAttempts:week.length,poseAverages,daysPracticed:dates.size,daysWithoutAttempts:7-dates.size};
}
