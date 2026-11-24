export type Mark={poseId:string;correct:boolean};
export type Session={accuracy:number;timeSeconds:number;completedAt:string};
export function finalAssessment(marks:Mark[]){const correctCount=marks.filter(m=>m.correct).length;return {correctCount,score:marks.length?Math.round(100*correctCount/marks.length):0};}
export function weeklyAssessment(sessions:Session[],now=new Date()){
 const end=now.getTime(),start=end-7*86400000;
 const valid=sessions.filter(s=>Number.isFinite(s.accuracy)&&s.accuracy>=0&&s.accuracy<=100&&Number.isFinite(s.timeSeconds)&&s.timeSeconds>=0);
 const between=(a:number,b:number)=>valid.filter(s=>Date.parse(s.completedAt)>a&&Date.parse(s.completedAt)<=b);
 const current=between(start,end),previous=between(start-7*86400000,start);
 const avg=(s:Session[])=>s.length?Math.round(s.reduce((n,x)=>n+x.accuracy,0)/s.length):null;
 const a=avg(current),b=avg(previous);return {average:a,previousAverage:b,improvement:a!==null&&b!==null?a-b:null,sessions:current.length,practiceSeconds:current.reduce((n,x)=>n+x.timeSeconds,0)};
}
