/* ==========================================================================
   MISSION 89 — Utilities
   ========================================================================== */
const MISSION_WEIGHTS = Object.freeze({
  calories: 20,
  protein: 20,
  water: 12,
  steps: 12,
  sleep: 12,
  workout: 16,
  cardio: 8
});

const U = {
  todayStr(){ return this.toDateStr(new Date()); },
  toDateStr(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  },
  parseDate(str){
    const [y,m,d] = str.split('-').map(Number);
    return new Date(y, m-1, d);
  },
  addDays(dateStr, n){
    const d = this.parseDate(dateStr);
    d.setDate(d.getDate()+n);
    return this.toDateStr(d);
  },
  daysBetween(a,b){
    const da = this.parseDate(a), db = this.parseDate(b);
    return Math.round((db - da) / 86400000);
  },
  dayOfWeekName(dateStr){
    return this.parseDate(dateStr).toLocaleDateString('en-US', { weekday:'long' });
  },
  shortDay(dateStr){
    return this.parseDate(dateStr).toLocaleDateString('en-US', { weekday:'short' });
  },
  prettyDate(dateStr){
    return this.parseDate(dateStr).toLocaleDateString('en-US', { month:'short', day:'numeric' });
  },
  prettyDateFull(dateStr){
    return this.parseDate(dateStr).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  },
  clamp(v,min,max){ return Math.max(min, Math.min(max, v)); },
  round1(v){ return Math.round(v*10)/10; },
  uid(){ return Math.random().toString(36).slice(2,9); },

  // ---- Mission day tracking ----
  ensureMissionStarted(){
    const meta = Store.getMeta();
    if(!meta.startDate){
      Store.saveMeta({ startDate: this.todayStr(), installedAt: new Date().toISOString() });
    }
    return Store.getMeta();
  },
  missionDay(){
    const meta = this.ensureMissionStarted();
    const diff = this.daysBetween(meta.startDate, this.todayStr());
    return this.clamp(diff+1, 1, 9999);
  },
  missionDayCapped(totalDays){
    return Math.min(this.missionDay(), totalDays);
  },

  // ---- Toast ----
  toast(msg){
    const el = document.getElementById('toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(()=> el.classList.remove('show'), 2200);
  },

  // ---- SVG ring helpers ----
  circumference(r){ return 2 * Math.PI * r; },
  ringOffset(r, pct){
    const c = this.circumference(r);
    const clamped = this.clamp(pct,0,1);
    return c - (c * clamped);
  },

  // ---- Mission / score engine ----
  // One source of truth powers the ring, Daily Quest, calendar and Coach.
  getMissionObjectives(settings, dateStr = this.todayStr()){
    const checkin = Store.getCheckin(dateStr);
    const c = checkin || {};

    const ratio = (value, target) => {
      if(value == null || !target) return 0;
      return this.clamp(value / target, 0, 1);
    };

    const calorieCredit = (() => {
      if(c.calories == null || !settings.calorieTarget) return 0;
      const calorieRatio = c.calories / settings.calorieTarget;
      const diff = Math.abs(1 - calorieRatio);
      return this.clamp(1 - diff * 2.2, 0, 1);
    })();

    const definitions = [
      {
        id:'calories', title:'Calories on target', icon:'cal', reward:MISSION_WEIGHTS.calories,
        current:c.calories ?? null, target:settings.calorieTarget, unit:'kcal',
        progress:calorieCredit,
        detail:c.calories == null ? 'Not logged' : `${Math.round(c.calories)} / ${settings.calorieTarget} kcal`,
        destination:'checkin'
      },
      {
        id:'protein', title:'Hit protein target', icon:'protein', reward:MISSION_WEIGHTS.protein,
        current:c.protein ?? null, target:settings.proteinTarget, unit:'g',
        progress:ratio(c.protein, settings.proteinTarget),
        detail:c.protein == null ? 'Not logged' : `${Math.round(c.protein)} / ${settings.proteinTarget} g`,
        destination:'checkin'
      },
      {
        id:'water', title:'Hydration target', icon:'water', reward:MISSION_WEIGHTS.water,
        current:c.water ?? null, target:settings.waterTarget, unit:'L',
        progress:ratio(c.water, settings.waterTarget),
        detail:c.water == null ? 'Not logged' : `${this.formatNum(c.water,1)} / ${this.formatNum(settings.waterTarget,1)} L`,
        destination:'checkin'
      },
      {
        id:'steps', title:'Daily steps', icon:'steps', reward:MISSION_WEIGHTS.steps,
        current:c.steps ?? null, target:settings.stepTarget, unit:'steps',
        progress:ratio(c.steps, settings.stepTarget),
        detail:c.steps == null ? 'Not logged' : `${Math.round(c.steps).toLocaleString()} / ${settings.stepTarget.toLocaleString()}`,
        destination:'checkin'
      },
      {
        id:'sleep', title:'Recovery sleep', icon:'sleep', reward:MISSION_WEIGHTS.sleep,
        current:c.sleep ?? null, target:settings.sleepTarget, unit:'h',
        progress:ratio(c.sleep, settings.sleepTarget),
        detail:c.sleep == null ? 'Not logged' : `${this.formatNum(c.sleep,1)} / ${this.formatNum(settings.sleepTarget,1)} h`,
        destination:'checkin'
      },
      {
        id:'workout', title:'Complete workout', icon:'bolt', reward:MISSION_WEIGHTS.workout,
        current:c.workoutDone ? 1 : 0, target:1, unit:'',
        progress:c.workoutDone ? 1 : 0,
        detail:c.workoutDone ? 'Completed' : 'Not completed',
        destination:'workout'
      },
      {
        id:'cardio', title:'Complete cardio', icon:'cardio', reward:MISSION_WEIGHTS.cardio,
        current:c.cardioDone ? 1 : 0, target:1, unit:'',
        progress:c.cardioDone ? 1 : 0,
        detail:c.cardioDone ? 'Completed' : 'Not completed',
        destination:'checkin'
      }
    ];

    return definitions.map(objective => {
      const progress = this.clamp(objective.progress, 0, 1);
      const earned = objective.reward * progress;
      return {
        ...objective,
        progress,
        earned,
        completed: progress >= 0.999,
        state: progress >= 0.999 ? 'complete' : progress > 0 ? 'active' : 'pending'
      };
    });
  },

  getDailyMission(settings, dateStr = this.todayStr()){
    const checkin = Store.getCheckin(dateStr);
    const objectives = this.getMissionObjectives(settings, dateStr);
    const rawScore = objectives.reduce((sum, objective) => sum + objective.earned, 0);
    const penalty = checkin && checkin.cheatMeal ? 8 : 0;
    const score = Math.round(this.clamp(rawScore - penalty, 0, 100));
    const completedCount = objectives.filter(objective => objective.completed).length;
    const loggedCount = objectives.filter(objective => objective.current != null && objective.current !== false).length;

    return {
      date: dateStr,
      checkin,
      objectives,
      score,
      rawScore: Math.round(rawScore),
      penalty,
      completedCount,
      loggedCount,
      totalCount: objectives.length,
      progress: score / 100,
      complete: completedCount === objectives.length && penalty === 0
    };
  },

  // Mission Score /100 composite for a given day's check-in.
  computeDayScore(checkin, settings){
    if(!checkin) return 0;
    // Historical dates must use the supplied object rather than reading today.
    const calorieRatio = checkin.calories != null && settings.calorieTarget
      ? this.clamp(1 - Math.abs(1 - checkin.calories / settings.calorieTarget) * 2.2, 0, 1)
      : 0;

    let score = 0;
    score += MISSION_WEIGHTS.calories * calorieRatio;
    score += MISSION_WEIGHTS.protein * (checkin.protein != null && settings.proteinTarget ? this.clamp(checkin.protein / settings.proteinTarget, 0, 1) : 0);
    score += MISSION_WEIGHTS.water * (checkin.water != null && settings.waterTarget ? this.clamp(checkin.water / settings.waterTarget, 0, 1) : 0);
    score += MISSION_WEIGHTS.steps * (checkin.steps != null && settings.stepTarget ? this.clamp(checkin.steps / settings.stepTarget, 0, 1) : 0);
    score += MISSION_WEIGHTS.sleep * (checkin.sleep != null && settings.sleepTarget ? this.clamp(checkin.sleep / settings.sleepTarget, 0, 1) : 0);
    if(checkin.workoutDone) score += MISSION_WEIGHTS.workout;
    if(checkin.cardioDone) score += MISSION_WEIGHTS.cardio;
    if(checkin.cheatMeal) score -= 8;
    return Math.round(this.clamp(score, 0, 100));
  },

  // ---- Day grade for calendar coloring ----
  dayGrade(checkin){
    if(!checkin) return null;
    const settings = Store.getSettings();
    const score = this.computeDayScore(checkin, settings);
    if(score >= 80) return 'green';
    if(score >= 50) return 'yellow';
    return 'red';
  },

  // ---- Streak: consecutive days (ending today or yesterday) with score >= 50 ----
  computeStreak(){
    const checkins = Store.getCheckins();
    const settings = Store.getSettings();
    let streak = 0;
    let cursor = this.todayStr();
    // if no checkin today yet, start counting from yesterday
    if(!checkins[cursor]){
      cursor = this.addDays(cursor, -1);
    }
    while(true){
      const c = checkins[cursor];
      if(!c) break;
      const score = this.computeDayScore(c, settings);
      if(score < 50) break;
      streak++;
      cursor = this.addDays(cursor, -1);
    }
    return streak;
  },

  // ---- Weight helpers ----
  getLatestWeight(){
    const checkins = Store.getCheckins();
    const dates = Object.keys(checkins).sort();
    for(let i = dates.length-1; i>=0; i--){
      if(checkins[dates[i]].weight != null) return { weight: checkins[dates[i]].weight, date: dates[i] };
    }
    const settings = Store.getSettings();
    return settings.startWeight ? { weight: settings.startWeight, date: null } : null;
  },

  formatNum(n, decimals=0){
    if(n == null || isNaN(n)) return '—';
    return Number(n).toFixed(decimals).replace(/\.0$/,'');
  },

  totalMissionScore(settings){
    const meta = this.ensureMissionStarted();
    const today = this.todayStr();
    const elapsedDays = this.daysBetween(meta.startDate, today) + 1; // inclusive of today

    let total = 0;
    let cursor = meta.startDate;
    for(let i = 0; i < elapsedDays; i++){
      const checkin = Store.getCheckin(cursor);
      total += this.computeDayScore(checkin, settings);
      cursor = this.addDays(cursor, 1);
    }
    return total;
  },

expectedMissionScore(settings){
    const meta = this.ensureMissionStarted();
    const elapsedDays = Math.max(1, this.daysBetween(meta.startDate, this.todayStr()) + 1);
    return elapsedDays * 100;
  },

  completionPercent(settings){
    const expected = this.expectedMissionScore(settings);
    return expected === 0 ? 0 : Math.round(this.totalMissionScore(settings) / expected * 100);
  },

  daysBehind(settings){
    const expectedDays = Math.floor(this.expectedMissionScore(settings) / 100);
    const earnedDays = Math.floor(this.totalMissionScore(settings) / 100);
    return Math.max(0, expectedDays - earnedDays);
  },

  missionStats(settings){
    const totalScore = this.totalMissionScore(settings);
    const expectedScore = this.expectedMissionScore(settings);
    const actualMissionDay = this.missionDay();
    const missionDay = this.missionDayCapped(settings.missionDays);
    const elapsedMissionDays = Math.min(actualMissionDay, settings.missionDays);
    const targetScore = settings.missionDays * 100;

    const completion = expectedScore === 0
      ? 0
      : Math.round(totalScore / expectedScore * 100);
    const expectedDays = Math.floor(expectedScore / 100);
    const earnedDays = Math.floor(totalScore / 100);
    const remainingDays = Math.max(0, settings.missionDays - elapsedMissionDays);
    const remainingScore = Math.max(0, targetScore - totalScore);
    const requiredAverage = remainingScore === 0
      ? 0
      : remainingDays === 0
        ? Infinity
        : Math.ceil(remainingScore / remainingDays);
    const currentAverage = elapsedMissionDays === 0
      ? 0
      : Math.round(totalScore / elapsedMissionDays);
    const projectedFinishDay = remainingScore === 0
      ? missionDay
      : currentAverage <= 0
        ? Infinity
        : Math.ceil(targetScore / currentAverage);
    const projectedDelay = projectedFinishDay === Infinity
      ? Infinity
      : Math.max(0, projectedFinishDay - settings.missionDays);

    let forecastStatus;
    if(remainingScore === 0) forecastStatus = 'MISSION COMPLETE';
    else if(currentAverage === 0) forecastStatus = 'NO DATA';
    else if(projectedFinishDay <= settings.missionDays) forecastStatus = 'ON SCHEDULE';
    else forecastStatus = 'BEHIND';

    let recoveryStatus;
    if(remainingScore === 0) recoveryStatus = 'COMPLETE';
    else if(requiredAverage === Infinity || requiredAverage > 100) recoveryStatus = 'UNRECOVERABLE';
    else if(requiredAverage === 100) recoveryStatus = 'ON TRACK';
    else if(requiredAverage >= 95) recoveryStatus = 'CRITICAL';
    else if(requiredAverage >= 85) recoveryStatus = 'BEHIND';
    else if(requiredAverage >= 70) recoveryStatus = 'RECOVERING';
    else recoveryStatus = 'AHEAD';

    return {
      totalScore,
      expectedScore,
      completion,
      earnedDays,
      expectedDays,
      daysBehind: Math.max(0, Math.min(expectedDays, settings.missionDays) - earnedDays),
      missionDay,
      actualMissionDay,
      remainingDays,
      remainingScore,
      requiredAverage,
      currentAverage,
      projectedFinishDay,
      projectedDelay,
      forecastStatus,
      recoveryStatus
    };
  },

  // ---- Physique Progress: is your body actually moving toward the goal? ----
// Execution Score (above) measures "did I follow the plan today."
// This measures "is my body actually changing" — real weight trend over
// time via linear regression, independent of daily habit adherence.
physiqueProgress(settings){
  const checkins = Store.getCheckins();
  const entries = Object.values(checkins)
    .filter(c => c.weight != null)
    .sort((a,b) => a.date.localeCompare(b.date));

  const startWeight = settings.startWeight;
  const goalWeight = settings.goalWeight;
  const goalDirection = Math.sign(goalWeight - startWeight) || -1; // default: losing weight

  if(entries.length < 2){
    const currentWeight = entries.length === 1 ? entries[0].weight : startWeight;
    return {
      status: 'NOT ENOUGH DATA',
      currentWeight,
      totalChange: this.round1(currentWeight - startWeight),
      weeklyTrend: null,
      remainingToGoal: this.round1(Math.abs(currentWeight - goalWeight)),
      progressPercent: 0
    };
  }

  const currentWeight = entries[entries.length-1].weight;
  const totalChange = this.round1(currentWeight - startWeight);

  // Same linear-regression approach as the Progress page's finish estimate
  const meta = Store.getMeta();
  const anchor = meta.startDate || entries[0].date;
  const xs = entries.map(e => this.daysBetween(anchor, e.date));
  const ys = entries.map(e => e.weight);
  const n = xs.length;
  const sumX = xs.reduce((a,b)=>a+b,0), sumY = ys.reduce((a,b)=>a+b,0);
  const sumXY = xs.reduce((s,x,i)=>s+x*ys[i],0);
  const sumXX = xs.reduce((s,x)=>s+x*x,0);
  const denom = (n*sumXX - sumX*sumX);
  const slope = denom === 0 ? 0 : (n*sumXY - sumX*sumY) / denom; // kg per day
  const weeklyTrend = this.round1(slope * 7);

  const totalNeeded = goalWeight - startWeight;
  const progressPercent = totalNeeded === 0
    ? 100
    : Math.round(this.clamp(totalChange / totalNeeded, 0, 1) * 100);

  // Positive onTrackTrend = moving toward goal, regardless of loss/gain direction
  const onTrackTrend = weeklyTrend * goalDirection;
  let status;
  if(onTrackTrend >= 0.2) status = 'ON TRACK';
  else if(onTrackTrend >= -0.05) status = 'STALLED';
  else status = 'REVERSING';

  return {
    status,
    currentWeight,
    totalChange,
    weeklyTrend,
    remainingToGoal: this.round1(Math.abs(currentWeight - goalWeight)),
    progressPercent
  };
},

// ---- What If Simulator ----
// "If I average X points/day for the rest of the mission, what happens?"
// Pure projection — doesn't touch stored data, safe to call on every keystroke.
simulateWhatIf(settings, hypotheticalAvgScore){
  const avg = this.clamp(hypotheticalAvgScore, 0, 100);
  const stats = this.missionStats(settings);
  const { totalScore, missionDay } = stats;
  const target = settings.missionDays * 100;
  const remainingDaysInMission = Math.max(0, settings.missionDays - missionDay);
  const remainingScoreNeeded = Math.max(0, target - totalScore);

  const projectedTotalAtMissionEnd = totalScore + avg * remainingDaysInMission;
  const missionSuccessPercent = target === 0
    ? 0
    : Math.round(this.clamp(projectedTotalAtMissionEnd / target, 0, 2) * 100);

  let projectedFinishDay;
  if(remainingScoreNeeded === 0){
    projectedFinishDay = missionDay;
  } else if(avg <= 0){
    projectedFinishDay = Infinity;
  } else {
    projectedFinishDay = missionDay + Math.ceil(remainingScoreNeeded / avg);
  }

  let status;
  if(avg <= 0) status = 'CRITICAL';
  else if(projectedFinishDay <= settings.missionDays) status = 'ON SCHEDULE';
  else if(projectedFinishDay <= settings.missionDays + 5) status = 'BEHIND';
  else status = 'CRITICAL';

  return { hypotheticalAvgScore: avg, projectedFinishDay, missionSuccessPercent, status };
},
};