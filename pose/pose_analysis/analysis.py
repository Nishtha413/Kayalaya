"""Person 3 pure-Python reference implementation; no camera or backend mutations."""
import math
from datetime import datetime, timedelta, timezone

def angle_at(a,b,c,min_visibility=0.5):
    """2D angle at B, degrees, or None for untrustworthy geometry."""
    if any(p is None or not isinstance(p,dict) for p in (a,b,c)): return None
    try:
        if any(float(p.get('visibility',1)) < min_visibility for p in (a,b,c)): return None
        x=[(float(p['x']),float(p['y'])) for p in (a,b,c)]
        if any(not math.isfinite(v) for pair in x for v in pair): return None
    except (ValueError,TypeError,KeyError,OverflowError): return None
    u=(x[0][0]-x[1][0],x[0][1]-x[1][1]);v=(x[2][0]-x[1][0],x[2][1]-x[1][1]);den=math.hypot(*u)*math.hypot(*v)
    if den < 1e-12: return None
    return math.degrees(math.acos(max(-1.,min(1.,(u[0]*v[0]+u[1]*v[1])/den))))

def evaluate(landmarks, rules, min_visibility=0.5):
    """Return unscorable if ANY required angle is missing; never inflate coverage."""
    if not rules:return {'status':'unconfigured','score':None,'coverage':0.,'feedback':['Reference angles require calibration'],'joints':{}}
    total=0.;weight_sum=0.;joints={};errors=[];missing=[]
    for r in rules:
        a,b,c=[landmarks.get(n) for n in r['landmarks']]
        angle=angle_at(a,b,c,min_visibility); key=r['joint']; w=float(r.get('weight',1))
        if not math.isfinite(w) or w<=0:raise ValueError('Weights must be positive and finite')
        if angle is None:
            missing.append(key);joints[key]={'angle':None,'score':None};continue
        lo,hi,tol=map(float,(r['min_deg'],r['max_deg'],r['tolerance_deg']))
        if not (0<=lo<=hi<=180 and tol>0 and all(map(math.isfinite,(lo,hi,tol)))):raise ValueError('Invalid reference range')
        err=max(lo-angle,0,angle-hi)
        score=100*max(0.,1-err/(2*tol));total+=w*score;weight_sum+=w
        joints[key]={'angle':round(angle,2),'error_deg':round(err,2),'score':round(score,2)}
        if err>0: errors.append((err/tol,r['feedback_low'] if angle<lo else r['feedback_high']))
    coverage=(len(rules)-len(missing))/len(rules)
    if missing:return {'status':'cannot_evaluate','score':None,'coverage':coverage,'feedback':['Move your full body into camera view'],'joints':joints}
    score=round(total/weight_sum,2)
    return {'status':'correct' if not errors else 'needs_adjustment','score':score,'coverage':1.,'feedback':[errors and max(errors)[1] or 'Good alignment; hold steadily'],'joints':joints}

def weekly(attempts,now=None):
    """Rolling seven-day descriptive summary; not a pass/fail decision."""
    now=now or datetime.now(timezone.utc);start=now-timedelta(days=7); valid=[]
    for a in attempts:
        try:
            t=datetime.fromisoformat(str(a['created_at']).replace('Z','+00:00'))
            if t.tzinfo is None:t=t.replace(tzinfo=timezone.utc)
            s=float(a['accuracy_score'])
            if start<=t<=now and math.isfinite(s) and 0<=s<=100:valid.append((a,t,s))
        except (KeyError,TypeError,ValueError):continue
    by_pose={};dates=set()
    for a,t,s in valid:
        key=str(a['pose_id']);by_pose.setdefault(key,[]).append(s);dates.add(t.date().isoformat())
    return {'average':round(sum(s for _,_,s in valid)/len(valid),2) if valid else None,'completed_attempts':len(valid),'pose_averages':{k:round(sum(v)/len(v),2) for k,v in by_pose.items()},'days_practiced':len(dates),'days_without_attempts':7-len(dates),'duration_seconds':None,'improvement':None,'completion_status':'use_backend_progress_status'}
