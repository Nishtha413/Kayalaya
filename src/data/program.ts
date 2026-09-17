import type { DayProgram, Pose } from '../types';

export const POSES: Pose[] = [
  {
    id: 'mountain',
    name: 'Mountain Pose',
    sanskrit: 'Tadasana',
    icon: 'human-handsup',
    difficulty: 'Beginner',
    duration: 120,
    builds: ['Posture', 'Legs'],
    description:
      'Stand tall with feet together, arms relaxed at your sides, and your weight evenly spread across both feet.',
    tips: ['Ground down evenly through both feet', 'Lift through the crown of your head', 'Roll your shoulders back'],
  },
  {
    id: 'tree',
    name: 'Tree Pose',
    sanskrit: 'Vrksasana',
    icon: 'tree',
    difficulty: 'Easy',
    duration: 120,
    builds: ['Balance', 'Legs'],
    description:
      'Balance on one leg with the sole of the other foot resting on the standing leg and hands pressed together at the chest.',
    tips: ['Fix your gaze on a steady point', 'Press your foot into the thigh', 'Keep your hips level'],
  },
  {
    id: 'downward-dog',
    name: 'Downward-Facing Dog',
    sanskrit: 'Adho Mukha Svanasana',
    icon: 'human-handsdown',
    difficulty: 'Easy',
    duration: 180,
    builds: ['Arms', 'Shoulders'],
    description:
      'From hands and knees, lift your hips up and back to form an inverted V with your body.',
    tips: ['Spread your fingers wide', 'Press heels toward the floor', 'Keep a long spine'],
  },
  {
    id: 'warrior-2',
    name: 'Warrior II',
    sanskrit: 'Virabhadrasana II',
    icon: 'human-male',
    difficulty: 'Moderate',
    duration: 180,
    builds: ['Legs', 'Core'],
    description:
      'Stand with legs wide, front knee bent over the ankle, arms stretched strongly in opposite directions.',
    tips: ['Front knee tracks over the ankle', 'Keep your chest open', 'Reach through both arms'],
  },
  {
    id: 'triangle',
    name: 'Triangle Pose',
    sanskrit: 'Trikonasana',
    icon: 'triangle-outline',
    difficulty: 'Moderate',
    duration: 180,
    builds: ['Hips', 'Flexibility'],
    description:
      'With legs wide, reach your front hand to the floor and extend the opposite arm straight up to the sky.',
    tips: ['Avoid collapsing the front knee', 'Lift the ribs away from the waist', 'Look up toward your top hand'],
  },
  {
    id: 'cobra',
    name: 'Cobra Pose',
    sanskrit: 'Bhujangasana',
    icon: 'human',
    difficulty: 'Easy',
    duration: 120,
    builds: ['Spine', 'Shoulders'],
    description:
      'Lying face down, press your palms into the floor and lift your chest off the mat, keeping hips down.',
    tips: ['Press the tops of your feet down', 'Keep elbows slightly bent', "Don't pinch the lower back"],
  },
  {
    id: 'childs',
    name: "Child's Pose",
    sanskrit: 'Balasana',
    icon: 'human-child',
    difficulty: 'Beginner',
    duration: 120,
    builds: ['Hips', 'Rest'],
    rest: true,
    description:
      'Kneel, sit back on your heels, and fold forward resting your forehead on the mat with arms extended.',
    tips: ['Let your chest rest between the thighs', 'Relax your shoulders', 'Breathe slowly and deeply'],
  },
  {
    id: 'chair',
    name: 'Chair Pose',
    sanskrit: 'Utkatasana',
    icon: 'chair-school',
    difficulty: 'Moderate',
    duration: 180,
    builds: ['Legs', 'Core'],
    description:
      'Stand and sit your hips back as if into a chair, reaching your arms overhead with weight in your heels.',
    tips: ['Keep knees over the ankles', 'Lengthen your spine', 'Draw your navel in'],
  },
];

export const DAYS: DayProgram[] = [
  {
    id: 1,
    title: 'Day 1',
    theme: 'Foundations',
    description: 'Learn the core standing and resting poses that build your practice.',
    poseIds: ['mountain', 'childs', 'chair', 'tree', 'downward-dog'],
  },
  {
    id: 2,
    title: 'Day 2',
    theme: 'Strength & Balance',
    description: 'Add a few new poses while drilling your foundation forms.',
    poseIds: ['mountain', 'downward-dog', 'warrior-2', 'triangle', 'cobra', 'childs'],
  },
  {
    id: 3,
    title: 'Day 3',
    theme: 'Opening the Body',
    description: 'Focus on flexibility through side stretches and hip openers.',
    poseIds: ['tree', 'chair', 'warrior-2', 'triangle', 'downward-dog', 'cobra'],
  },
  {
    id: 4,
    title: 'Day 4',
    theme: 'Standing Strong',
    description: 'A longer standing sequence to build endurance and alignment.',
    poseIds: ['mountain', 'chair', 'warrior-2', 'tree', 'triangle', 'cobra', 'downward-dog'],
  },
  {
    id: 5,
    title: 'Day 5',
    theme: 'Flow & Release',
    description: 'Move smoothly between poses while releasing tension in the hips and spine.',
    poseIds: ['childs', 'downward-dog', 'cobra', 'warrior-2', 'triangle', 'tree', 'chair'],
  },
  {
    id: 6,
    title: 'Day 6',
    theme: 'Full Routine',
    description: 'Almost the entire sequence - link your balance, strength and flexibility.',
    poseIds: ['mountain', 'tree', 'warrior-2', 'triangle', 'cobra', 'downward-dog', 'chair', 'childs'],
  },
  {
    id: 7,
    title: 'Day 7',
    theme: 'Complete Practice',
    description: 'Perform the full beginner routine smoothly from start to finish.',
    poseIds: ['mountain', 'tree', 'downward-dog', 'warrior-2', 'triangle', 'cobra', 'childs', 'chair'],
  },
];

export const DAY_COUNT = DAYS.length;

export function poseById(id: string): Pose {
  const pose = POSES.find((p) => p.id === id);
  if (!pose) {
    throw new Error(`Unknown pose id: ${id}`);
  }
  return pose;
}

export function dayById(id: number): DayProgram {
  const day = DAYS.find((d) => d.id === id);
  if (!day) {
    throw new Error(`Unknown day id: ${id}`);
  }
  return day;
}

export function posesForDay(dayId: number): Pose[] {
  const day = dayById(dayId);
  return day.poseIds.map((id) => poseById(id));
}

export const ASSESSMENT_POSE_IDS = [
  'mountain',
  'tree',
  'downward-dog',
  'warrior-2',
  'triangle',
  'cobra',
];