const assert=require('node:assert/strict');const {evaluateFrame}=require('../.test-build/pose/liveEngine.js');const {POSE_RULES}=require('../.test-build/data/poseRules.js');const {finalAssessment,weeklyAssessment}=require('../.test-build/pose/weeklyAssessment.js');
assert.equal(Object.keys(POSE_RULES).length,8);
for(const def of Object.values(POSE_RULES)){const read=p=>def.rules.find(r=>r.points.join()===p.join())?.target??null;assert.equal(evaluateFrame(def,read,{}).score,100);assert.equal(evaluateFrame(def,()=>null,{}).score,null);}
assert.equal(finalAssessment([{poseId:'a',correct:true},{poseId:'b',correct:false}]).score,50);
assert.equal(weeklyAssessment([{accuracy:80,timeSeconds:10,completedAt:'2026-11-23'}],new Date('2026-11-24')).average,80);
console.log('PASS: 19 assertions');
