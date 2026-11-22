import unittest
from datetime import datetime,timezone,timedelta
from analysis import angle_at,evaluate,weekly
P=lambda x,y,v=1:{'x':x,'y':y,'visibility':v}
RULE={'joint':'left_knee','landmarks':['a','b','c'],'min_deg':80,'max_deg':100,'tolerance_deg':10,'weight':1,'feedback_low':'Bend less','feedback_high':'Bend more'}
class Tests(unittest.TestCase):
 def test_right_angle(self):self.assertAlmostEqual(angle_at(P(1,0),P(0,0),P(0,1)),90)
 def test_straight(self):self.assertAlmostEqual(angle_at(P(-1,0),P(0,0),P(1,0)),180)
 def test_zero(self):self.assertIsNone(angle_at(P(0,0),P(0,0),P(1,1)))
 def test_low_visibility(self):self.assertIsNone(angle_at(P(1,0,.1),P(0,0),P(0,1)))
 def test_invalid(self):self.assertIsNone(angle_at({'x':float('nan'),'y':1},P(0,0),P(1,0)))
 def test_score_inside(self):self.assertEqual(evaluate({'a':P(1,0),'b':P(0,0),'c':P(0,1)},[RULE])['score'],100)
 def test_score_boundary(self):self.assertEqual(evaluate({'a':P(1,0),'b':P(0,0),'c':P(0,1)},[dict(RULE,min_deg=90,max_deg=90)])['score'],100)
 def test_feedback(self):self.assertEqual(evaluate({'a':P(-1,0),'b':P(0,0),'c':P(1,0)},[RULE])['feedback'],['Bend more'])
 def test_missing_not_100(self):self.assertIsNone(evaluate({},[RULE])['score'])
 def test_unconfigured(self):self.assertEqual(evaluate({},[])['status'],'unconfigured')
 def test_week(self):
  now=datetime(2026,11,22,tzinfo=timezone.utc);rows=[{'pose_id':1,'accuracy_score':80,'created_at':(now-timedelta(days=1)).isoformat()},{'pose_id':1,'accuracy_score':100,'created_at':now.isoformat()},{'pose_id':1,'accuracy_score':20,'created_at':(now-timedelta(days=9)).isoformat()}]
  r=weekly(rows,now);self.assertEqual((r['average'],r['completed_attempts'],r['days_practiced']),(90,2,2))
if __name__=='__main__':unittest.main()

class SeedCoverageTests(unittest.TestCase):
 def test_every_seed_pose_present(self):
  import json
  from pathlib import Path
  d=Path(__file__).parent
  data=json.loads((d/'pose_reference_data.json').read_text())
  seed=json.loads((d.parent.parent/'backend/app/seed/seed_data.json').read_text())
  self.assertEqual([(p['pose_name'],p['client_id']) for p in data['poses']],[(p['pose_name'],p['client_id']) for p in seed['poses']])
  for p in data['poses']:
   self.assertEqual(len(p['reference_angles'])>0,p['pose_name']=='tadasana')
