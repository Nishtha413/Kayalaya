"""Kayalaya desktop webcam prototype. Press 1-8 to change poses, S to save, W for weekly report, Q to quit."""
import csv
import math
import os
import time
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

import cv2
import mediapipe as mp

ROOT = Path(__file__).resolve().parent
LOG = ROOT / 'sessions.csv'
NAMES = {11:'left_shoulder',12:'right_shoulder',13:'left_elbow',14:'right_elbow',15:'left_wrist',16:'right_wrist',23:'left_hip',24:'right_hip',25:'left_knee',26:'right_knee',27:'left_ankle',28:'right_ankle'}
JOINTS = {
 'left_knee':('left_hip','left_knee','left_ankle'), 'right_knee':('right_hip','right_knee','right_ankle'),
 'left_elbow':('left_shoulder','left_elbow','left_wrist'), 'right_elbow':('right_shoulder','right_elbow','right_wrist'),
 'left_hip':('left_shoulder','left_hip','left_knee'), 'right_hip':('right_shoulder','right_hip','right_knee'),
 'left_shoulder':('left_elbow','left_shoulder','left_hip'), 'right_shoulder':('right_elbow','right_shoulder','right_hip')}
# All ranges below are INITIAL DESIGN TARGETS, not clinically validated universal standards.
# Format: joint, lower, upper, feedback when below, feedback when above.
R = lambda j,lo,hi,below,above:(j,lo,hi,below,above)
POSES = {
 'mountain':[R('left_knee',165,180,'Straighten left knee','Relax left knee'),R('right_knee',165,180,'Straighten right knee','Relax right knee'),R('left_hip',160,180,'Stand taller','Relax your back'),R('right_hip',160,180,'Stand taller','Relax your back')],
 'tree':[R('left_knee',165,180,'Straighten standing leg','Relax standing knee'),R('right_knee',55,120,'Bend lifted knee more','Bend lifted knee more')],
 'warrior2':[R('left_knee',80,110,'Reduce front knee bend','Bend front knee more'),R('right_knee',160,180,'Straighten back leg','Relax back knee'),R('left_elbow',155,180,'Extend left arm','Relax left elbow'),R('right_elbow',155,180,'Extend right arm','Relax right elbow'),R('left_shoulder',70,110,'Raise left arm','Lower left arm'),R('right_shoulder',70,110,'Raise right arm','Lower right arm')],
 'chair':[R('left_knee',75,125,'Reduce left knee bend','Bend left knee more'),R('right_knee',75,125,'Reduce right knee bend','Bend right knee more'),R('left_hip',65,130,'Open hip angle','Sit hips back'),R('right_hip',65,130,'Open hip angle','Sit hips back')],
 'cobra':[R('left_elbow',120,180,'Extend arms gently','Relax elbows'),R('right_elbow',120,180,'Extend arms gently','Relax elbows'),R('left_hip',115,180,'Lift chest gently','Relax back')],
 'downward_dog':[R('left_knee',150,180,'Lengthen left leg','Relax knee'),R('right_knee',150,180,'Lengthen right leg','Relax knee'),R('left_elbow',150,180,'Lengthen left arm','Relax elbow'),R('right_elbow',150,180,'Lengthen right arm','Relax elbow'),R('left_hip',65,115,'Lift hips higher','Shift hips slightly down')],
 'triangle':[R('left_knee',155,180,'Lengthen left leg','Relax knee'),R('right_knee',155,180,'Lengthen right leg','Relax knee'),R('left_elbow',150,180,'Extend left arm','Relax elbow'),R('right_elbow',150,180,'Extend right arm','Relax elbow')],
 'childs':[R('left_knee',15,65,'Release knee fold','Sit back toward heels'),R('right_knee',15,65,'Release knee fold','Sit back toward heels'),R('left_hip',20,90,'Fold torso gently','Fold torso toward thighs')]
}
MIRRORABLE = {'tree','warrior2','triangle'}

def angle(a,b,c):
    """2D angle ABC in degrees using dot product, clamped for floating point stability."""
    u=(a[0]-b[0],a[1]-b[1]); v=(c[0]-b[0],c[1]-b[1]); nu=math.hypot(*u); nv=math.hypot(*v)
    if nu < 1e-8 or nv < 1e-8: return None
    return math.degrees(math.acos(max(-1,min(1,(u[0]*v[0]+u[1]*v[1])/(nu*nv)))))

def swap(j):
    return ('right'+j[4:]) if j.startswith('left') else ('left'+j[5:]) if j.startswith('right') else j

def measure(lms):
    pts={name:(lms[i].x,lms[i].y) for i,name in NAMES.items() if lms[i].visibility >= .60}
    out={}
    for joint,(a,b,c) in JOINTS.items():
        if all(p in pts for p in (a,b,c)):
            x=angle(pts[a],pts[b],pts[c])
            if x is not None: out[joint]=x
    return out

def evaluate(angles,pose,mirrored=False):
    rules=POSES[pose]; results=[]; missing=[]
    for joint,lo,hi,below,above in rules:
        key=swap(joint) if mirrored else joint
        if key not in angles:
            missing.append(key); continue
        value=angles[key]; distance=max(lo-value,0,value-hi)
        # 0 error inside range; linear penalty of 2 points per degree outside range.
        score=max(0,100-2*distance)
        tip=below if value<lo else above if value>hi else 'Good alignment'
        results.append((key,value,score,distance,tip))
    if missing: return None,results,missing
    return sum(r[2] for r in results)/len(rules),results,[]

def weekly_report():
    if not LOG.exists(): return 'No saved sessions yet'
    today=date.today(); start=today-timedelta(days=6); by_pose=defaultdict(list); days=set()
    with LOG.open(newline='',encoding='utf8') as f:
        for row in csv.DictReader(f):
            d=date.fromisoformat(row['date'])
            if start<=d<=today:
                by_pose[row['pose']].append(float(row['score'])); days.add(d)
    if not by_pose: return 'No sessions in the past 7 days'
    lines=[f'Last 7 days ({start} to {today}) | active days: {len(days)}']
    for pose,values in sorted(by_pose.items()): lines.append(f'{pose}: {len(values)} samples, mean {sum(values)/len(values):.1f}/100')
    return '\n'.join(lines)

def save_sample(pose,score,coverage,hold):
    first=not LOG.exists()
    with LOG.open('a',newline='',encoding='utf8') as f:
        writer=csv.writer(f)
        if first: writer.writerow(['date','timestamp','pose','score','coverage','hold_seconds'])
        writer.writerow([date.today().isoformat(),int(time.time()),pose,f'{score:.2f}',f'{coverage:.2f}',f'{hold:.2f}'])

def main():
    cap=cv2.VideoCapture(0)
    if not cap.isOpened(): raise RuntimeError('Webcam unavailable. Check permissions or camera index.')
    pose_names=list(POSES); selected=0; ema={}; smooth=None; hold_start=None; held=0; last_feedback='Move into camera view'; report_until=0; report_text=''
    mp_pose=mp.solutions.pose
    try:
        with mp_pose.Pose(static_image_mode=False,model_complexity=1,smooth_landmarks=True,min_detection_confidence=.6,min_tracking_confidence=.6) as tracker:
            while True:
                ok,frame=cap.read()
                if not ok: break
                frame=cv2.flip(frame,1); h,w=frame.shape[:2]
                rgb=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB); rgb.flags.writeable=False
                detection=tracker.process(rgb); rgb.flags.writeable=True
                current=pose_names[selected]; valid=False; coverage=0
                if detection.pose_landmarks:
                    mp.solutions.drawing_utils.draw_landmarks(frame,detection.pose_landmarks,mp_pose.POSE_CONNECTIONS)
                    angles=measure(detection.pose_landmarks.landmark)
                    # Exponential smoothing,