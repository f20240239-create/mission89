/* ========================================================================== 
   ASCEND — Exercise Library + Adaptive Workout Split
   Exercises are classified by movement, muscle, equipment and difficulty so
   replacements preserve the purpose of the original slot.
   ========================================================================== */

const EXERCISE_CATALOG = [
  // Horizontal push
  {id:'barbell-bench',name:'Barbell Bench Press',movement:'horizontal-push',primary:'Chest',secondary:['Triceps','Front Delts'],equipment:'Barbell',difficulty:3},
  {id:'dumbbell-bench',name:'Dumbbell Bench Press',movement:'horizontal-push',primary:'Chest',secondary:['Triceps','Front Delts'],equipment:'Dumbbells',difficulty:3},
  {id:'machine-chest-press',name:'Machine Chest Press',movement:'horizontal-push',primary:'Chest',secondary:['Triceps','Front Delts'],equipment:'Machine',difficulty:2},
  {id:'push-up',name:'Push-Up',movement:'horizontal-push',primary:'Chest',secondary:['Triceps','Front Delts'],equipment:'Bodyweight',difficulty:1},
  {id:'close-grip-bench',name:'Close-Grip Bench Press',movement:'horizontal-push',primary:'Triceps',secondary:['Chest','Front Delts'],equipment:'Barbell',difficulty:3},
  {id:'weighted-dip',name:'Weighted Dip',movement:'vertical-push',primary:'Triceps',secondary:['Chest','Front Delts'],equipment:'Dip Station',difficulty:4},
  {id:'assisted-dip',name:'Assisted Dip',movement:'vertical-push',primary:'Triceps',secondary:['Chest','Front Delts'],equipment:'Assisted Machine',difficulty:1},
  {id:'bodyweight-dip',name:'Bodyweight Dip',movement:'vertical-push',primary:'Triceps',secondary:['Chest','Front Delts'],equipment:'Dip Station',difficulty:3},

  // Incline / upper chest
  {id:'incline-db-press',name:'Incline Dumbbell Press',movement:'incline-push',primary:'Upper Chest',secondary:['Triceps','Front Delts'],equipment:'Dumbbells',difficulty:3},
  {id:'incline-barbell-press',name:'Incline Barbell Press',movement:'incline-push',primary:'Upper Chest',secondary:['Triceps','Front Delts'],equipment:'Barbell',difficulty:3},
  {id:'incline-smith-press',name:'Incline Smith Press',movement:'incline-push',primary:'Upper Chest',secondary:['Triceps','Front Delts'],equipment:'Smith Machine',difficulty:2},
  {id:'machine-incline-press',name:'Machine Incline Press',movement:'incline-push',primary:'Upper Chest',secondary:['Triceps','Front Delts'],equipment:'Machine',difficulty:2},
  {id:'low-high-cable-fly',name:'Low-to-High Cable Fly',movement:'chest-adduction',primary:'Upper Chest',secondary:[],equipment:'Cable',difficulty:2},

  // Chest isolation
  {id:'cable-fly',name:'Cable Fly',movement:'chest-adduction',primary:'Chest',secondary:[],equipment:'Cable',difficulty:2},
  {id:'pec-deck',name:'Pec Deck',movement:'chest-adduction',primary:'Chest',secondary:[],equipment:'Machine',difficulty:1},
  {id:'dumbbell-fly',name:'Dumbbell Fly',movement:'chest-adduction',primary:'Chest',secondary:[],equipment:'Dumbbells',difficulty:3},

  // Vertical push / delts
  {id:'barbell-ohp',name:'Overhead Barbell Press',movement:'vertical-push',primary:'Shoulders',secondary:['Triceps'],equipment:'Barbell',difficulty:3},
  {id:'seated-db-press',name:'Seated Dumbbell Shoulder Press',movement:'vertical-push',primary:'Shoulders',secondary:['Triceps'],equipment:'Dumbbells',difficulty:2},
  {id:'machine-shoulder-press',name:'Machine Shoulder Press',movement:'vertical-push',primary:'Shoulders',secondary:['Triceps'],equipment:'Machine',difficulty:1},
  {id:'arnold-press',name:'Arnold Press',movement:'vertical-push',primary:'Shoulders',secondary:['Triceps'],equipment:'Dumbbells',difficulty:3},
  {id:'seated-barbell-press',name:'Seated Barbell Press',movement:'vertical-push',primary:'Shoulders',secondary:['Triceps'],equipment:'Barbell',difficulty:3},
  {id:'db-lateral-raise',name:'Dumbbell Lateral Raise',movement:'shoulder-abduction',primary:'Side Delts',secondary:[],equipment:'Dumbbells',difficulty:2},
  {id:'cable-lateral-raise',name:'Cable Lateral Raise',movement:'shoulder-abduction',primary:'Side Delts',secondary:[],equipment:'Cable',difficulty:2},
  {id:'machine-lateral-raise',name:'Machine Lateral Raise',movement:'shoulder-abduction',primary:'Side Delts',secondary:[],equipment:'Machine',difficulty:1},

  // Vertical pull
  {id:'pull-up',name:'Pull-Up',movement:'vertical-pull',primary:'Lats',secondary:['Biceps','Upper Back'],equipment:'Pull-Up Bar',difficulty:4},
  {id:'assisted-pull-up',name:'Assisted Pull-Up',movement:'vertical-pull',primary:'Lats',secondary:['Biceps','Upper Back'],equipment:'Assisted Machine',difficulty:1},
  {id:'lat-pulldown',name:'Lat Pulldown',movement:'vertical-pull',primary:'Lats',secondary:['Biceps','Upper Back'],equipment:'Cable',difficulty:2},
  {id:'neutral-pulldown',name:'Neutral-Grip Lat Pulldown',movement:'vertical-pull',primary:'Lats',secondary:['Biceps','Upper Back'],equipment:'Cable',difficulty:2},
  {id:'weighted-pull-up',name:'Weighted Pull-Up',movement:'vertical-pull',primary:'Lats',secondary:['Biceps','Upper Back'],equipment:'Pull-Up Bar',difficulty:5},

  // Horizontal pull
  {id:'barbell-row',name:'Barbell Row',movement:'horizontal-pull',primary:'Mid Back',secondary:['Lats','Biceps','Rear Delts'],equipment:'Barbell',difficulty:4},
  {id:'seated-cable-row',name:'Seated Cable Row',movement:'horizontal-pull',primary:'Mid Back',secondary:['Lats','Biceps','Rear Delts'],equipment:'Cable',difficulty:2},
  {id:'chest-supported-row',name:'Chest-Supported Row',movement:'horizontal-pull',primary:'Mid Back',secondary:['Lats','Biceps','Rear Delts'],equipment:'Machine',difficulty:2},
  {id:'machine-row',name:'Machine Row',movement:'horizontal-pull',primary:'Mid Back',secondary:['Lats','Biceps','Rear Delts'],equipment:'Machine',difficulty:1},
  {id:'tbar-row',name:'T-Bar Row',movement:'horizontal-pull',primary:'Mid Back',secondary:['Lats','Biceps','Rear Delts'],equipment:'T-Bar',difficulty:3},
  {id:'one-arm-cable-row',name:'One-Arm Cable Row',movement:'horizontal-pull',primary:'Mid Back',secondary:['Lats','Biceps','Rear Delts'],equipment:'Cable',difficulty:2},
  {id:'face-pull',name:'Face Pull',movement:'rear-delt-pull',primary:'Rear Delts',secondary:['Upper Back'],equipment:'Cable',difficulty:1},
  {id:'reverse-pec-deck',name:'Reverse Pec Deck',movement:'rear-delt-pull',primary:'Rear Delts',secondary:['Upper Back'],equipment:'Machine',difficulty:1},
  {id:'rear-delt-cable-fly',name:'Rear-Delt Cable Fly',movement:'rear-delt-pull',primary:'Rear Delts',secondary:['Upper Back'],equipment:'Cable',difficulty:2},

  // Hinge
  {id:'deadlift',name:'Deadlift',movement:'hip-hinge',primary:'Back',secondary:['Hamstrings','Glutes'],equipment:'Barbell',difficulty:5},
  {id:'rack-pull',name:'Rack Pull',movement:'hip-hinge',primary:'Back',secondary:['Hamstrings','Glutes'],equipment:'Barbell',difficulty:4},
  {id:'romanian-deadlift',name:'Romanian Deadlift',movement:'hip-hinge',primary:'Hamstrings',secondary:['Glutes','Back'],equipment:'Barbell',difficulty:3},
  {id:'db-romanian-deadlift',name:'Dumbbell Romanian Deadlift',movement:'hip-hinge',primary:'Hamstrings',secondary:['Glutes','Back'],equipment:'Dumbbells',difficulty:2},
  {id:'good-morning',name:'Good Morning',movement:'hip-hinge',primary:'Hamstrings',secondary:['Glutes','Back'],equipment:'Barbell',difficulty:4},
  {id:'back-extension',name:'45° Back Extension',movement:'hip-hinge',primary:'Hamstrings',secondary:['Glutes','Back'],equipment:'Back Extension',difficulty:1},

  // Squat / legs
  {id:'back-squat',name:'Barbell Back Squat',movement:'squat',primary:'Quads',secondary:['Glutes','Hamstrings'],equipment:'Barbell',difficulty:5},
  {id:'front-squat',name:'Front Squat',movement:'squat',primary:'Quads',secondary:['Glutes','Core'],equipment:'Barbell',difficulty:4},
  {id:'hack-squat',name:'Hack Squat',movement:'squat',primary:'Quads',secondary:['Glutes'],equipment:'Machine',difficulty:2},
  {id:'leg-press',name:'Leg Press',movement:'squat',primary:'Quads',secondary:['Glutes'],equipment:'Machine',difficulty:1},
  {id:'goblet-squat',name:'Goblet Squat',movement:'squat',primary:'Quads',secondary:['Glutes','Core'],equipment:'Dumbbell',difficulty:1},
  {id:'belt-squat',name:'Belt Squat',movement:'squat',primary:'Quads',secondary:['Glutes'],equipment:'Belt Squat',difficulty:2},
  {id:'walking-lunge',name:'Walking Lunge',movement:'single-leg-squat',primary:'Quads',secondary:['Glutes'],equipment:'Dumbbells',difficulty:3},
  {id:'bulgarian-split-squat',name:'Bulgarian Split Squat',movement:'single-leg-squat',primary:'Quads',secondary:['Glutes'],equipment:'Dumbbells',difficulty:4},
  {id:'step-up',name:'Step-Up',movement:'single-leg-squat',primary:'Quads',secondary:['Glutes'],equipment:'Dumbbells',difficulty:2},
  {id:'hip-thrust',name:'Hip Thrust',movement:'hip-extension',primary:'Glutes',secondary:['Hamstrings'],equipment:'Barbell',difficulty:2},
  {id:'glute-bridge',name:'Glute Bridge',movement:'hip-extension',primary:'Glutes',secondary:['Hamstrings'],equipment:'Bodyweight',difficulty:1},
  {id:'cable-pull-through',name:'Cable Pull-Through',movement:'hip-extension',primary:'Glutes',secondary:['Hamstrings'],equipment:'Cable',difficulty:2},
  {id:'leg-curl',name:'Leg Curl',movement:'knee-flexion',primary:'Hamstrings',secondary:[],equipment:'Machine',difficulty:1},
  {id:'seated-leg-curl',name:'Seated Leg Curl',movement:'knee-flexion',primary:'Hamstrings',secondary:[],equipment:'Machine',difficulty:1},
  {id:'nordic-curl',name:'Nordic Curl',movement:'knee-flexion',primary:'Hamstrings',secondary:[],equipment:'Bodyweight',difficulty:5},
  {id:'standing-calf-raise',name:'Standing Calf Raise',movement:'plantar-flexion',primary:'Calves',secondary:[],equipment:'Machine',difficulty:1},
  {id:'seated-calf-raise',name:'Seated Calf Raise',movement:'plantar-flexion',primary:'Calves',secondary:[],equipment:'Machine',difficulty:1},
  {id:'leg-press-calf',name:'Leg Press Calf Raise',movement:'plantar-flexion',primary:'Calves',secondary:[],equipment:'Machine',difficulty:1},

  // Arms
  {id:'ez-curl',name:'EZ-Bar Curl',movement:'elbow-flexion',primary:'Biceps',secondary:['Forearms'],equipment:'EZ-Bar',difficulty:2},
  {id:'barbell-curl',name:'Barbell Curl',movement:'elbow-flexion',primary:'Biceps',secondary:['Forearms'],equipment:'Barbell',difficulty:3},
  {id:'db-curl',name:'Dumbbell Curl',movement:'elbow-flexion',primary:'Biceps',secondary:['Forearms'],equipment:'Dumbbells',difficulty:2},
  {id:'preacher-curl',name:'Preacher Curl',movement:'elbow-flexion',primary:'Biceps',secondary:[],equipment:'Machine',difficulty:2},
  {id:'hammer-curl',name:'Hammer Curl',movement:'elbow-flexion-neutral',primary:'Biceps',secondary:['Forearms'],equipment:'Dumbbells',difficulty:2},
  {id:'incline-db-curl',name:'Incline Dumbbell Curl',movement:'elbow-flexion',primary:'Biceps',secondary:[],equipment:'Dumbbells',difficulty:3},
  {id:'bayesian-curl',name:'Bayesian Cable Curl',movement:'elbow-flexion',primary:'Biceps',secondary:[],equipment:'Cable',difficulty:2},
  {id:'rope-pushdown',name:'Triceps Rope Pushdown',movement:'elbow-extension',primary:'Triceps',secondary:[],equipment:'Cable',difficulty:1},
  {id:'straight-pushdown',name:'Straight-Bar Pushdown',movement:'elbow-extension',primary:'Triceps',secondary:[],equipment:'Cable',difficulty:1},
  {id:'overhead-cable-extension',name:'Overhead Cable Extension',movement:'overhead-elbow-extension',primary:'Triceps',secondary:[],equipment:'Cable',difficulty:2},
  {id:'skull-crusher',name:'Skull Crusher',movement:'overhead-elbow-extension',primary:'Triceps',secondary:[],equipment:'EZ-Bar',difficulty:3},
  {id:'single-arm-extension',name:'Single-Arm Cable Extension',movement:'elbow-extension',primary:'Triceps',secondary:[],equipment:'Cable',difficulty:1},

  // Core / recovery
  {id:'hanging-leg-raise',name:'Hanging Leg Raise',movement:'hip-flexion-core',primary:'Abs',secondary:['Hip Flexors'],equipment:'Pull-Up Bar',difficulty:3},
  {id:'captains-chair-raise',name:'Captain’s Chair Raise',movement:'hip-flexion-core',primary:'Abs',secondary:['Hip Flexors'],equipment:'Captain Chair',difficulty:2},
  {id:'reverse-crunch',name:'Reverse Crunch',movement:'hip-flexion-core',primary:'Abs',secondary:[],equipment:'Bodyweight',difficulty:1},
  {id:'cable-crunch',name:'Cable Crunch',movement:'spinal-flexion',primary:'Abs',secondary:[],equipment:'Cable',difficulty:2},
  {id:'machine-crunch',name:'Machine Crunch',movement:'spinal-flexion',primary:'Abs',secondary:[],equipment:'Machine',difficulty:1},
  {id:'weighted-sit-up',name:'Weighted Sit-Up',movement:'spinal-flexion',primary:'Abs',secondary:[],equipment:'Plate',difficulty:3},
  {id:'plank',name:'Plank',movement:'anti-extension',primary:'Abs',secondary:['Core'],equipment:'Bodyweight',difficulty:1},
  {id:'russian-twist',name:'Russian Twist',movement:'rotation',primary:'Obliques',secondary:['Abs'],equipment:'Bodyweight',difficulty:1},
  {id:'pallof-press',name:'Pallof Press',movement:'anti-rotation',primary:'Obliques',secondary:['Core'],equipment:'Cable',difficulty:2},
  {id:'light-walk',name:'Light Incline Walk',movement:'cardio',primary:'Cardio',secondary:['Legs'],equipment:'Treadmill',difficulty:1},
  {id:'mobility-flow',name:'Full-Body Mobility Flow',movement:'mobility',primary:'Mobility',secondary:[],equipment:'Bodyweight',difficulty:1},
  {id:'foam-rolling',name:'Foam Rolling',movement:'recovery',primary:'Recovery',secondary:[],equipment:'Foam Roller',difficulty:1},
  {id:'deep-stretch',name:'Deep Stretch — Hips & Hamstrings',movement:'mobility',primary:'Mobility',secondary:['Hamstrings'],equipment:'Bodyweight',difficulty:1}
];

const EXERCISE_BY_ID = Object.fromEntries(EXERCISE_CATALOG.map(ex=>[ex.id,ex]));
const EXERCISE_BY_NAME = Object.fromEntries(EXERCISE_CATALOG.map(ex=>[ex.name.toLowerCase(),ex]));

function catalogExercise(id, sets, reps, slotId){
  const item=EXERCISE_BY_ID[id];
  if(!item) throw new Error(`Unknown exercise catalog id: ${id}`);
  return {...item,id:slotId||id,catalogId:item.id,sets,reps};
}

const BASE_WORKOUT_SPLIT = {
  1:{tag:'PUSH',title:'Push',sub:'Chest · Shoulders · Triceps',exercises:[
    catalogExercise('barbell-bench',4,'6-8','push1'),catalogExercise('incline-db-press',3,'8-10','push2'),catalogExercise('barbell-ohp',3,'6-8','push3'),catalogExercise('cable-fly',3,'12-15','push4'),catalogExercise('db-lateral-raise',3,'12-15','push5'),catalogExercise('rope-pushdown',3,'10-12','push6'),catalogExercise('overhead-cable-extension',3,'10-12','push7')
  ]},
  2:{tag:'PULL',title:'Pull',sub:'Back · Biceps · Rear Delts',exercises:[
    catalogExercise('deadlift',4,'5-6','pull1'),catalogExercise('lat-pulldown',4,'8-10','pull2'),catalogExercise('barbell-row',3,'8-10','pull3'),catalogExercise('seated-cable-row',3,'10-12','pull4'),catalogExercise('face-pull',3,'15','pull5'),catalogExercise('ez-curl',3,'10-12','pull6'),catalogExercise('hammer-curl',3,'10-12','pull7')
  ]},
  3:{tag:'LEGS',title:'Legs + Abs',sub:'Quads · Hamstrings · Core',exercises:[
    catalogExercise('back-squat',4,'6-8','legs1'),catalogExercise('romanian-deadlift',3,'8-10','legs2'),catalogExercise('leg-press',3,'10-12','legs3'),catalogExercise('walking-lunge',3,'12','legs4'),catalogExercise('leg-curl',3,'12-15','legs5'),catalogExercise('standing-calf-raise',4,'15-20','legs6'),catalogExercise('hanging-leg-raise',3,'15','legs7'),catalogExercise('cable-crunch',3,'15-20','legs8')
  ]},
  4:{tag:'UPPER',title:'Upper',sub:'Chest · Back · Shoulders · Arms',exercises:[
    catalogExercise('incline-barbell-press',4,'6-8','up1'),catalogExercise('lat-pulldown',4,'8-10','up2'),catalogExercise('seated-db-press',3,'8-10','up3'),catalogExercise('chest-supported-row',3,'10-12','up4'),catalogExercise('db-curl',3,'10-12','up5'),catalogExercise('bodyweight-dip',3,'10-12','up6')
  ]},
  5:{tag:'LOWER',title:'Lower + Shoulders',sub:'Posterior Chain · Delts',exercises:[
    catalogExercise('front-squat',4,'6-8','low1'),catalogExercise('hip-thrust',3,'10-12','low2'),catalogExercise('bulgarian-split-squat',3,'10','low3'),catalogExercise('seated-barbell-press',3,'8-10','low4'),catalogExercise('cable-lateral-raise',3,'12-15','low5'),catalogExercise('seated-calf-raise',4,'15-20','low6'),catalogExercise('plank',3,'45','low7')
  ]},
  6:{tag:'ARMS',title:'Arms + Abs',sub:'Biceps · Triceps · Core',exercises:[
    catalogExercise('close-grip-bench',4,'8-10','arm1'),catalogExercise('barbell-curl',4,'8-10','arm2'),catalogExercise('skull-crusher',3,'10-12','arm3'),catalogExercise('preacher-curl',3,'10-12','arm4'),catalogExercise('overhead-cable-extension',3,'12-15','arm5'),catalogExercise('incline-db-curl',3,'12-15','arm6'),catalogExercise('weighted-sit-up',3,'15-20','arm7'),catalogExercise('russian-twist',3,'20','arm8')
  ]},
  0:{tag:'REST',title:'Active Recovery',sub:'Mobility · Light Cardio · Stretch',exercises:[
    catalogExercise('light-walk',1,'30','rec1'),catalogExercise('mobility-flow',1,'10','rec2'),catalogExercise('foam-rolling',1,'10','rec3'),catalogExercise('deep-stretch',1,'10','rec4')
  ]}
};

function cloneWorkout(workout){
  return {...workout,exercises:workout.exercises.map(ex=>({...ex,secondary:[...(ex.secondary||[])]}))};
}

function hydrateExercise(raw){
  const base=raw.catalogId ? EXERCISE_BY_ID[raw.catalogId] : EXERCISE_BY_NAME[String(raw.name||'').toLowerCase()];
  return {...(base||{}),...raw,secondary:[...(raw.secondary||base?.secondary||[])]};
}

function getWorkoutForDate(dateStr){
  const dow=U.parseDate(dateStr).getDay();
  const base=cloneWorkout(BASE_WORKOUT_SPLIT[dow]);
  const routine=typeof Store!=='undefined' ? Store.getRoutineWorkout?.(dow) : null;
  const day=typeof Store!=='undefined' ? Store.getDayWorkout?.(dateStr) : null;
  const selected=day||routine;
  if(!selected) return base;
  return {...base,...selected,exercises:(selected.exercises||base.exercises).map(hydrateExercise)};
}
