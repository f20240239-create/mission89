/* ==========================================================================
   ASCEND — Core Engine
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

const ASCEND_VERSION = '1.1.0';
const M89_VERSION = ASCEND_VERSION;

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

  // ---- One-time app migration ----
  migrate(){
    const appState=Store.getAppState();
    if((appState.migration||0)<4){
      const meta=Store.getMeta();
      Store.saveMeta({ previousStartDate:meta.startDate||meta.previousStartDate||null, startDate:null, startedAt:null, manuallyStarted:false, lifecycleVersion:3, phaseId:'awakening', phaseStartedAt:null });
      Store.getCampaigns();
      Store.saveAppState({ version:ASCEND_VERSION, migration:4, migratedAt:new Date().toISOString() });
      return true;
    }
    if(appState.version!==ASCEND_VERSION) Store.saveAppState({version:ASCEND_VERSION});
    return false;
  },

  // ---- Mission lifecycle / day tracking ----
  // A mission only begins after the user explicitly starts it.
  // Legacy auto-generated start dates are ignored unless manuallyStarted is true.
  isMissionStarted(){
    const meta = Store.getMeta();
    return meta.manuallyStarted === true && !!meta.startDate;
  },
  startMission(){
    const now = new Date();
    return Store.saveMeta({
      startDate: this.todayStr(),
      installedAt: Store.getMeta().installedAt || now.toISOString(),
      manuallyStarted: true,
      startedAt: now.toISOString(),
      phaseId: 'awakening',
      phaseStartedAt: this.todayStr()
    });
  },
  resetMissionStart(){
    return Store.saveMeta({
      startDate: null,
      manuallyStarted: false,
      startedAt: null,
      phaseId: 'awakening',
      phaseStartedAt: null
    });
  },
  ensureMissionStarted(){
    // Kept for compatibility with older modules. It no longer auto-starts.
    return Store.getMeta();
  },
  missionDay(){
    if(!this.isMissionStarted()) return 0;
    const meta = Store.getMeta();
    const diff = this.daysBetween(meta.startDate, this.todayStr());
    return this.clamp(diff + 1, 1, 9999);
  },
  missionDayCapped(totalDays){
    const day = this.missionDay();
    return day === 0 ? 0 : Math.min(day, totalDays);
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
    if(!this.isMissionStarted()) return 0;
    const meta = Store.getMeta();
    const today = this.todayStr();
    const elapsedDays = Math.max(0, this.daysBetween(meta.startDate, today) + 1);

    let total = 0;
    let cursor = meta.startDate;
    for(let i = 0; i < elapsedDays; i++){
      total += this.computeDayScore(Store.getCheckin(cursor), settings);
      cursor = this.addDays(cursor, 1);
    }
    return total;
  },

  expectedMissionScore(settings){
    if(!this.isMissionStarted()) return 0;
    const meta = Store.getMeta();
    const elapsedDays = Math.max(0, this.daysBetween(meta.startDate, this.todayStr()) + 1);
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
    if(!this.isMissionStarted()){
      return {
        started:false,
        totalScore:0, expectedScore:0, completion:0,
        earnedDays:0, expectedDays:0, daysBehind:0,
        missionDay:0, actualMissionDay:0,
        remainingDays:settings.missionDays,
        remainingScore:settings.missionDays * 100,
        requiredAverage:100,
        currentAverage:0,
        projectedFinishDay:Infinity,
        projectedDelay:Infinity,
        forecastStatus:'AWAITING START',
        recoveryStatus:'NOT ACTIVE'
      };
    }
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
      started:true,
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


  // ---- Campaign + Phase Engine ----
  getCampaignState(settings){
    const campaign=Store.getActiveCampaign();
    const phase=this.getPhaseStatus(settings);
    const mission=this.missionStats(settings);
    const physique=this.physiqueProgress(settings);
    const complete=phase.cleared && physique.currentWeight!=null && (
      campaign.goalWeight <= campaign.startWeight
        ? physique.currentWeight <= campaign.goalWeight
        : physique.currentWeight >= campaign.goalWeight
    );
    return { campaign, phase, mission, physique, complete, status:complete?'COMPLETE':campaign.status.toUpperCase() };
  },

  getPhaseStatus(settings){
    const campaign=Store.getActiveCampaign();
    const phases=Array.isArray(campaign.phases)&&campaign.phases.length ? campaign.phases : DEFAULT_PHASES;
    const meta=Store.getMeta();
    const currentId=meta.phaseId||campaign.currentPhaseId||phases[0].id;
    const phaseIndex=Math.max(0,phases.findIndex(p=>p.id===currentId));
    const phase=phases[phaseIndex]||phases[0];
    if(!this.isMissionStarted()) return { ...phase,state:'LOCKED',elapsedDays:0,requirements:[],cleared:false,completedRequirements:0,progress:0,index:phaseIndex,totalPhases:phases.length };

    const start=meta.phaseStartedAt||meta.startDate;
    const today=this.todayStr();
    const elapsedDays=Math.max(1,this.daysBetween(start,today)+1);
    const checkins=Store.getCheckins();
    const dates=Object.keys(checkins).filter(d=>d>=start&&d<=today).sort();
    const loggedDays=dates.length;
    const scores=dates.map(d=>this.computeDayScore(checkins[d],settings));
    const averageScore=loggedDays?Math.round(scores.reduce((a,b)=>a+b,0)/loggedDays):0;
    const workoutDays=dates.filter(d=>checkins[d].workoutDone).length;
    const proteinDays=dates.filter(d=>(checkins[d].protein??0)>=settings.proteinTarget).length;
    const workoutRate=loggedDays?Math.round(workoutDays/loggedDays*100):0;
    const proteinRate=loggedDays?Math.round(proteinDays/loggedDays*100):0;
    const reqs=[
      {id:'duration',label:`Complete at least ${phase.minimumDays} days`,value:Math.min(elapsedDays,phase.minimumDays),target:phase.minimumDays,met:elapsedDays>=phase.minimumDays},
      {id:'logging',label:`Log at least ${phase.minLoggedDays} days`,value:loggedDays,target:phase.minLoggedDays,met:loggedDays>=phase.minLoggedDays},
      {id:'execution',label:`Maintain ${phase.minAverageScore}+ average execution`,value:averageScore,target:phase.minAverageScore,met:averageScore>=phase.minAverageScore},
      {id:'workout',label:`Train on ${phase.minWorkoutRate}% of logged days`,value:workoutRate,target:phase.minWorkoutRate,suffix:'%',met:workoutRate>=phase.minWorkoutRate},
      {id:'protein',label:`Hit protein on ${phase.minProteinRate}% of logged days`,value:proteinRate,target:phase.minProteinRate,suffix:'%',met:proteinRate>=phase.minProteinRate}
    ];
    const cleared=reqs.every(r=>r.met);
    const progress=Math.round(reqs.reduce((sum,r)=>sum+this.clamp(r.value/r.target,0,1),0)/reqs.length*100);
    return { ...phase,index:phaseIndex,totalPhases:phases.length,state:cleared?'CLEARED':elapsedDays>=phase.minimumDays?'EXTENDED':'ACTIVE',elapsedDays,loggedDays,averageScore,workoutRate,proteinRate,requirements:reqs,cleared,completedRequirements:reqs.filter(r=>r.met).length,progress,nextPhase:phases[phaseIndex+1]||null };
  },

  advancePhase(){
    const settings=Store.getSettings();
    const campaign=Store.getActiveCampaign();
    const phase=this.getPhaseStatus(settings);
    if(!phase.cleared||!phase.nextPhase) return false;
    Store.saveMeta({phaseId:phase.nextPhase.id,phaseStartedAt:this.todayStr()});
    Store.saveCampaign({...campaign,currentPhaseId:phase.nextPhase.id});
    return phase.nextPhase;
  },

  completeCampaign(){
    const state=this.getCampaignState(Store.getSettings());
    if(!state.complete) return false;
    const summary={completedAt:new Date().toISOString(),finalWeight:state.physique.currentWeight,averageScore:state.mission.currentAverage,totalDays:state.mission.actualMissionDay};
    Store.archiveCampaign(state.campaign.id,summary);
    return summary;
  },

  // ---- Recovery Engine ----
  // Recovery never prescribes extreme compensation. It restores the normal plan.
  getRecoveryProtocol(settings,dateStr=this.todayStr()){
    const daily=this.getDailyMission(settings,dateStr);
    const mission=this.missionStats(settings);
    const incomplete=daily.objectives.filter(o=>!o.completed).sort((a,b)=>(b.reward-b.earned)-(a.reward-a.earned));
    if(!daily.checkin){
      return {state:'WAITING',severity:'none',title:'Assessment pending',summary:'Log the day. The System cannot repair damage it cannot measure.',actions:[{label:'Complete today’s check-in',destination:'checkin'}],recoveryDays:0,recoverable:true,damage:0,etaImpact:0};
    }
    const stableFloor=80;
    const damage=Math.max(0,stableFloor-daily.score);
    if(damage===0){
      return {state:'STABLE',severity:'low',title:'No recovery required',summary:`Execution ${daily.score}/100. Preserve the current trajectory.`,actions:incomplete.slice(0,2).map(o=>({label:o.title,destination:o.destination})),recoveryDays:0,recoverable:true,damage:0,etaImpact:mission.projectedDelay===Infinity?0:mission.projectedDelay};
    }
    const recoveryDays=Math.max(1,Math.min(7,Math.ceil(damage/18)));
    const actions=[];
    const push=(label,destination)=>{if(!actions.some(x=>x.label===label))actions.push({label,destination});};
    incomplete.slice(0,3).forEach(o=>{
      if(o.id==='calories') push('Return to the normal calorie target — do not crash diet','checkin');
      else if(o.id==='sleep') push('Protect the next full sleep window','checkin');
      else push(o.title,o.destination);
    });
    push('Resume the normal plan at the next meal','nutrition');
    const protocol={state:'ACTIVE',severity:daily.score<40?'high':'medium',title:`Damage assessed: ${damage} points`,summary:`Recovery remains possible. Execute the protocol for ${recoveryDays} day${recoveryDays===1?'':'s'}; do not attempt to erase the setback in one day.`,actions:actions.slice(0,4),recoveryDays,recoverable:true,damage,score:daily.score,etaImpact:mission.projectedDelay===Infinity?0:mission.projectedDelay};
    Store.saveRecoverySnapshot({date:dateStr,score:daily.score,damage,recoveryDays,state:protocol.state});
    return protocol;
  },

  // ---- Intelligence Engine ----
  getIntelligence(settings){
    const checkins=Store.getCheckins();
    const dates=Object.keys(checkins).sort().slice(-28);
    if(!dates.length) return {dataDays:0,confidence:'LOW',bottleneck:null,strongest:null,insights:['No history yet. The System requires logged days before it can learn.'],metrics:{}};
    const keys=['calories','protein','water','steps','sleep','workout','cardio'];
    const aggregates={};
    keys.forEach(k=>aggregates[k]=[]);
    dates.forEach(date=>this.getMissionObjectives(settings,date).forEach(o=>aggregates[o.id].push(o.progress)));
    const rates={}; Object.entries(aggregates).forEach(([k,v])=>rates[k]=v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length*100):0);
    const ordered=Object.entries(rates).sort((a,b)=>a[1]-b[1]);
    const bottleneck=ordered[0], strongest=ordered[ordered.length-1];
    const scores=dates.map(d=>this.computeDayScore(checkins[d],settings));
    const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
    const recent=scores.slice(-7); const previous=scores.slice(-14,-7);
    const recentAvg=recent.length?Math.round(recent.reduce((a,b)=>a+b,0)/recent.length):0;
    const previousAvg=previous.length?Math.round(previous.reduce((a,b)=>a+b,0)/previous.length):null;
    const trend=previousAvg==null?0:recentAvg-previousAvg;
    const sleepPairs=dates.filter(d=>checkins[d].sleep!=null).map(d=>({sleep:Number(checkins[d].sleep),score:this.computeDayScore(checkins[d],settings)}));
    const good=sleepPairs.filter(x=>x.sleep>=settings.sleepTarget*.9); const poor=sleepPairs.filter(x=>x.sleep<settings.sleepTarget*.75);
    const mean=a=>a.length?a.reduce((s,x)=>s+x.score,0)/a.length:null;
    const sleepEffect=good.length>=2&&poor.length>=2?Math.round(mean(good)-mean(poor)):null;
    const labels={calories:'Calories',protein:'Protein',water:'Hydration',steps:'Steps',sleep:'Sleep',workout:'Training',cardio:'Cardio'};
    const insights=[
      `${labels[bottleneck[0]]} is the current bottleneck at ${bottleneck[1]}% adherence.`,
      `${labels[strongest[0]]} is the strongest system at ${strongest[1]}% adherence.`,
      trend===0?'Execution trend is stable.':`Seven-day execution is ${Math.abs(trend)} points ${trend>0?'higher':'lower'} than the previous week.`
    ];
    if(sleepEffect!=null) insights.push(`Your execution averages ${Math.abs(sleepEffect)} points ${sleepEffect>=0?'higher':'lower'} after adequate sleep.`);
    return {dataDays:dates.length,confidence:dates.length>=21?'HIGH':dates.length>=7?'MEDIUM':'LOW',bottleneck:{id:bottleneck[0],label:labels[bottleneck[0]],rate:bottleneck[1]},strongest:{id:strongest[0],label:labels[strongest[0]],rate:strongest[1]},insights,metrics:{averageScore:avg,recentAverage:recentAvg,trend,sleepEffect,rates}};
  },

  getDailyBrief(settings,dateStr=this.todayStr()){
    const campaign=Store.getActiveCampaign(), mission=this.missionStats(settings), phase=this.getPhaseStatus(settings), daily=this.getDailyMission(settings,dateStr), recovery=this.getRecoveryProtocol(settings,dateStr), intelligence=this.getIntelligence(settings);
    const priority=daily.objectives.filter(o=>!o.completed).sort((a,b)=>(b.reward-b.earned)-(a.reward-a.earned))[0]||null;
    let tone='Execution begins with the next action.';
    if(daily.complete) tone='Today is cleared. Repeat it before confidence turns into comfort.';
    else if(recovery.state==='ACTIVE') tone='Damage has been measured. Follow the protocol; momentum is recoverable.';
    else if(daily.checkin&&daily.score>=80) tone='Trajectory is stable. The standard remains unchanged.';
    return {campaignName:campaign.name,phaseName:phase.name,phaseState:phase.state,day:mission.actualMissionDay,score:daily.score,etaDelay:mission.projectedDelay,priority:priority?{title:priority.title,detail:priority.detail,destination:priority.destination}:null,recovery,intelligence,tone};
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