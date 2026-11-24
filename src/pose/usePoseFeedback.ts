import { useCallback, useEffect, useRef, useState } from 'react';
import { getImageJointAngle } from 'expo-mediapipe-pose';
import type { PoseDefinition } from '../data/poseRules';
import { evaluateFrame } from './liveEngine';
type FrameLike={landmarks:any;additionalData:any};
export function usePoseFeedback(definition:PoseDefinition|undefined){
 const [accuracy,setAccuracy]=useState(0); const [correction,setCorrection]=useState<string|null>(null); const [inPose,setInPose]=useState(false);
 const [angles,setAngles]=useState<Record<string,number>>({}); const [tracking,setTracking]=useState(false);
 const samples=useRef({sum:0,count:0});
 const history=useRef<Record<string,number>>({}); const last=useRef(0); const pending=useRef({message:'',since:0});
 const reset=useCallback(()=>{samples.current={sum:0,count:0};history.current={};last.current=0;pending.current={message:'',since:0};setAccuracy(0);setCorrection(null);setInPose(false);setAngles({});setTracking(false);},[]);
 useEffect(()=>{reset(); const timer=setInterval(()=>{if(last.current && Date.now()-last.current>700){last.current=0;history.current={};pending.current={message:'',since:0};setTracking(false);setInPose(false);setAccuracy(0);setAngles({});setCorrection('Camera tracking lost');}},100);return ()=>clearInterval(timer);},[definition,reset]);
 const onFrame=useCallback((frame:FrameLike)=>{
  if(!definition?.rules.length){reset();setCorrection('Reference angles unavailable');return;}
  const now=Date.now();last.current=now;
  const result=evaluateFrame(definition,points=>{try{const r=getImageJointAngle({landmarks:frame.landmarks,imageSize:frame.additionalData},points[0] as any,points[1] as any,points[2] as any);return r.status==='available'?r.value:null;}catch{return null;}},history.current);
  if(result.score!==null){samples.current.sum+=result.score;samples.current.count++;}
  setAngles(result.angles);setTracking(result.score!==null);setAccuracy(result.score??0);setInPose(result.correct);
  if(result.score===null){history.current={};pending.current={message:'',since:0};setCorrection(result.feedback);return;}
  if(pending.current.message!==result.feedback)pending.current={message:result.feedback,since:now};
  if(now-pending.current.since>=400)setCorrection(result.feedback);
 },[definition,reset]);
 return {accuracy,correction,inPose,onFrame,reset,angles,tracking,samples};
}
