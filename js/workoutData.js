/* ==========================================================================
   MISSION 89 — Workout Split
   Keyed by JS Date.getDay(): 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
   ========================================================================== */
const WORKOUT_SPLIT = {
  1: { // Monday
    tag: 'PUSH', title: 'Push', sub: 'Chest · Shoulders · Triceps',
    exercises: [
      { id:'push1', name:'Barbell Bench Press', sets:4, reps:'6-8' },
      { id:'push2', name:'Incline Dumbbell Press', sets:3, reps:'8-10' },
      { id:'push3', name:'Overhead Barbell Press', sets:3, reps:'6-8' },
      { id:'push4', name:'Cable Fly', sets:3, reps:'12-15' },
      { id:'push5', name:'Lateral Raise', sets:3, reps:'12-15' },
      { id:'push6', name:'Triceps Rope Pushdown', sets:3, reps:'10-12' },
      { id:'push7', name:'Overhead Triceps Extension', sets:3, reps:'10-12' }
    ]
  },
  2: { // Tuesday
    tag: 'PULL', title: 'Pull', sub: 'Back · Biceps · Rear Delts',
    exercises: [
      { id:'pull1', name:'Deadlift', sets:4, reps:'5-6' },
      { id:'pull2', name:'Pull-Up / Lat Pulldown', sets:4, reps:'8-10' },
      { id:'pull3', name:'Barbell Row', sets:3, reps:'8-10' },
      { id:'pull4', name:'Seated Cable Row', sets:3, reps:'10-12' },
      { id:'pull5', name:'Face Pull', sets:3, reps:'15' },
      { id:'pull6', name:'Barbell / EZ-Bar Curl', sets:3, reps:'10-12' },
      { id:'pull7', name:'Hammer Curl', sets:3, reps:'10-12' }
    ]
  },
  3: { // Wednesday
    tag: 'LEGS', title: 'Legs + Abs', sub: 'Quads · Hamstrings · Core',
    exercises: [
      { id:'legs1', name:'Barbell Back Squat', sets:4, reps:'6-8' },
      { id:'legs2', name:'Romanian Deadlift', sets:3, reps:'8-10' },
      { id:'legs3', name:'Leg Press', sets:3, reps:'10-12' },
      { id:'legs4', name:'Walking Lunge', sets:3, reps:'12/leg' },
      { id:'legs5', name:'Leg Curl', sets:3, reps:'12-15' },
      { id:'legs6', name:'Standing Calf Raise', sets:4, reps:'15-20' },
      { id:'legs7', name:'Hanging Leg Raise', sets:3, reps:'15' },
      { id:'legs8', name:'Cable Crunch', sets:3, reps:'15-20' }
    ]
  },
  4: { // Thursday
    tag: 'UPPER', title: 'Upper', sub: 'Chest · Back · Shoulders · Arms',
    exercises: [
      { id:'up1', name:'Incline Barbell Press', sets:4, reps:'6-8' },
      { id:'up2', name:'Weighted Pull-Up / Pulldown', sets:4, reps:'8-10' },
      { id:'up3', name:'Seated Dumbbell Shoulder Press', sets:3, reps:'8-10' },
      { id:'up4', name:'Chest-Supported Row', sets:3, reps:'10-12' },
      { id:'up5', name:'Dumbbell Curl', sets:3, reps:'10-12' },
      { id:'up6', name:'Triceps Dip', sets:3, reps:'10-12' }
    ]
  },
  5: { // Friday
    tag: 'LOWER', title: 'Lower + Shoulders', sub: 'Posterior Chain · Delts',
    exercises: [
      { id:'low1', name:'Front Squat', sets:4, reps:'6-8' },
      { id:'low2', name:'Hip Thrust', sets:3, reps:'10-12' },
      { id:'low3', name:'Bulgarian Split Squat', sets:3, reps:'10/leg' },
      { id:'low4', name:'Seated Barbell Press', sets:3, reps:'8-10' },
      { id:'low5', name:'Cable Lateral Raise', sets:3, reps:'12-15' },
      { id:'low6', name:'Seated Calf Raise', sets:4, reps:'15-20' },
      { id:'low7', name:'Plank', sets:3, reps:'45-60s' }
    ]
  },
  6: { // Saturday
    tag: 'ARMS', title: 'Arms + Abs', sub: 'Biceps · Triceps · Core',
    exercises: [
      { id:'arm1', name:'Close-Grip Bench Press', sets:4, reps:'8-10' },
      { id:'arm2', name:'Barbell Curl', sets:4, reps:'8-10' },
      { id:'arm3', name:'Skull Crusher', sets:3, reps:'10-12' },
      { id:'arm4', name:'Preacher Curl', sets:3, reps:'10-12' },
      { id:'arm5', name:'Cable Overhead Extension', sets:3, reps:'12-15' },
      { id:'arm6', name:'Incline Dumbbell Curl', sets:3, reps:'12-15' },
      { id:'arm7', name:'Weighted Sit-Up', sets:3, reps:'15-20' },
      { id:'arm8', name:'Russian Twist', sets:3, reps:'20' }
    ]
  },
  0: { // Sunday
    tag: 'REST', title: 'Active Recovery', sub: 'Mobility · Light Cardio · Stretch',
    exercises: [
      { id:'rec1', name:'Light Incline Walk', sets:1, reps:'30-40 min' },
      { id:'rec2', name:'Full-Body Mobility Flow', sets:1, reps:'10 min' },
      { id:'rec3', name:'Foam Rolling', sets:1, reps:'10 min' },
      { id:'rec4', name:'Deep Stretch — Hips & Hamstrings', sets:1, reps:'10 min' }
    ]
  }
};

function getWorkoutForDate(dateStr){
  const dow = U.parseDate(dateStr).getDay();
  return WORKOUT_SPLIT[dow];
}
