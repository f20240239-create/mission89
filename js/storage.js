/* ========================================================================== 
   ASCEND — Storage Layer
   Local-first persistence with schema migration, workout intelligence,
   mess allocation profiles, campaign archives and complete backups.
   ========================================================================== */
const M89_KEYS = {
  SETTINGS:'m89_settings', CHECKINS:'m89_checkins', PHOTOS:'m89_photos', WORKOUTS:'m89_workout_log',
  META:'m89_meta', APP:'m89_app', CAMPAIGNS:'ascend_campaigns', ACTIVE_CAMPAIGN:'ascend_active_campaign',
  OPERATOR:'ascend_operator', ONBOARDING:'ascend_onboarding', RECOVERY:'ascend_recovery_history',
  TRAINING_SESSIONS:'ascend_training_sessions', MESS_PROFILE:'ascend_mess_profile', MEAL_HISTORY:'ascend_meal_history'
};

const DEFAULT_SETTINGS = {
  goalWeight:89, startWeight:98, calorieTarget:1800, proteinTarget:190, waterTarget:4,
  stepTarget:10000, sleepTarget:8, missionDays:20, units:'kg', height:175,
  birthdayGoal:'2026-11-23', projectName:'Mission 89'
};

const DEFAULT_PHASES = Object.freeze([
  { id:'awakening', number:'I', name:'AWAKENING', minimumDays:20, minLoggedDays:16, minAverageScore:75, minWorkoutRate:70, minProteinRate:70 },
  { id:'momentum', number:'II', name:'MOMENTUM', minimumDays:28, minLoggedDays:22, minAverageScore:80, minWorkoutRate:75, minProteinRate:75 },
  { id:'transformation', number:'III', name:'TRANSFORMATION', minimumDays:42, minLoggedDays:34, minAverageScore:82, minWorkoutRate:78, minProteinRate:80 }
]);

const DEFAULT_CAMPAIGN = Object.freeze({
  id:'mission-89', name:'Mission 89', type:'fat-loss', status:'ready', startWeight:98, goalWeight:89,
  requestedDays:20, estimatedMinDays:45, estimatedMaxDays:75, currentPhaseId:'awakening',
  phases:DEFAULT_PHASES, createdAt:null, startedAt:null, completedAt:null, archivedAt:null
});

const Store = {
  _read(key,fallback){ try{ const raw=localStorage.getItem(key); return raw===null ? fallback : JSON.parse(raw); }catch(e){ console.warn('Storage read failed for',key,e); return fallback; } },
  _write(key,value){ try{ localStorage.setItem(key,JSON.stringify(value)); return true; }catch(e){ console.warn('Storage write failed for',key,e); return false; } },
  _remove(key){ try{ localStorage.removeItem(key); }catch(e){ console.warn('Storage remove failed for',key,e); } },

  getSettings(){ return Object.assign({},DEFAULT_SETTINGS,this._read(M89_KEYS.SETTINGS,{})); },
  saveSettings(patch){ const merged=Object.assign({},this.getSettings(),patch); this._write(M89_KEYS.SETTINGS,merged); return merged; },

  getMeta(){ return Object.assign({startDate:null,installedAt:null,manuallyStarted:false,startedAt:null,phaseId:'awakening',phaseStartedAt:null,lifecycleVersion:3,previousStartDate:null},this._read(M89_KEYS.META,{})); },
  saveMeta(patch){ const merged=Object.assign({},this.getMeta(),patch); this._write(M89_KEYS.META,merged); return merged; },

  getCheckins(){ return this._read(M89_KEYS.CHECKINS,{}); },
  getCheckin(dateStr){ return this.getCheckins()[dateStr]||null; },
  saveCheckin(dateStr,data){ const all=this.getCheckins(); all[dateStr]=Object.assign({},all[dateStr]||{},data,{date:dateStr}); this._write(M89_KEYS.CHECKINS,all); return all[dateStr]; },
  deleteCheckin(dateStr){ const all=this.getCheckins(); delete all[dateStr]; this._write(M89_KEYS.CHECKINS,all); },

  getPhotos(){ return this._read(M89_KEYS.PHOTOS,{}); },
  savePhoto(dateStr,slot,dataUrl){ const all=this.getPhotos(); all[dateStr]=Object.assign({},all[dateStr]||{},{[slot]:dataUrl}); this._write(M89_KEYS.PHOTOS,all); return all[dateStr]; },
  deletePhoto(dateStr,slot){ const all=this.getPhotos(); if(all[dateStr]){ delete all[dateStr][slot]; if(!Object.keys(all[dateStr]).length) delete all[dateStr]; } this._write(M89_KEYS.PHOTOS,all); },

  // Legacy completion log retained for compatibility.
  getWorkoutLog(){ return this._read(M89_KEYS.WORKOUTS,{}); },
  getWorkoutDay(dateStr){ return this.getWorkoutLog()[dateStr]||{exercises:{}}; },
  toggleExercise(dateStr,exerciseId){ const all=this.getWorkoutLog(); if(!all[dateStr]) all[dateStr]={exercises:{}}; all[dateStr].exercises[exerciseId]=!all[dateStr].exercises[exerciseId]; this._write(M89_KEYS.WORKOUTS,all); return all[dateStr]; },

  // Detailed training sessions, keyed by date then exercise id.
  getTrainingSessions(){ return this._read(M89_KEYS.TRAINING_SESSIONS,{}); },
  getTrainingDay(dateStr){ return this.getTrainingSessions()[dateStr]||{date:dateStr,exercises:{},completed:false}; },
  saveExerciseSets(dateStr,exerciseId,payload){
    const all=this.getTrainingSessions();
    if(!all[dateStr]) all[dateStr]={date:dateStr,exercises:{},completed:false,updatedAt:null};
    all[dateStr].exercises[exerciseId]=Object.assign({},all[dateStr].exercises[exerciseId]||{},payload,{updatedAt:new Date().toISOString()});
    all[dateStr].updatedAt=new Date().toISOString();
    this._write(M89_KEYS.TRAINING_SESSIONS,all);
    return all[dateStr].exercises[exerciseId];
  },
  completeTrainingDay(dateStr,completed=true){ const all=this.getTrainingSessions(); if(!all[dateStr]) all[dateStr]={date:dateStr,exercises:{}}; all[dateStr].completed=completed; all[dateStr].completedAt=completed?new Date().toISOString():null; this._write(M89_KEYS.TRAINING_SESSIONS,all); return all[dateStr]; },
  getExerciseHistory(exerciseId,limit=12){
    return Object.values(this.getTrainingSessions()).filter(day=>day?.exercises?.[exerciseId]?.sets?.length)
      .sort((a,b)=>a.date.localeCompare(b.date)).slice(-limit)
      .map(day=>({date:day.date,...day.exercises[exerciseId]}));
  },

  getMessProfile(){ return Object.assign({katoriMl:180,ladleMl:110,glassMl:250,rotiSize:'medium',updatedAt:null},this._read(M89_KEYS.MESS_PROFILE,{})); },
  saveMessProfile(patch){ const merged=Object.assign({},this.getMessProfile(),patch,{updatedAt:new Date().toISOString()}); this._write(M89_KEYS.MESS_PROFILE,merged); return merged; },
  getMealHistory(){ return this._read(M89_KEYS.MEAL_HISTORY,[]); },
  saveMealAllocation(meal){ const all=this.getMealHistory(); all.push(Object.assign({id:`meal-${Date.now().toString(36)}`,createdAt:new Date().toISOString()},meal)); this._write(M89_KEYS.MEAL_HISTORY,all.slice(-500)); return all[all.length-1]; },

  _normalizeCampaign(campaign){
    const settings=this.getSettings();
    return Object.assign({},DEFAULT_CAMPAIGN,campaign||{}, {
      phases:Array.isArray(campaign?.phases)&&campaign.phases.length ? campaign.phases : DEFAULT_PHASES.map(p=>({...p})),
      startWeight:Number(campaign?.startWeight ?? settings.startWeight),
      goalWeight:Number(campaign?.goalWeight ?? settings.goalWeight)
    });
  },
  getCampaigns(){
    const stored=this._read(M89_KEYS.CAMPAIGNS,null);
    if(Array.isArray(stored)&&stored.length){ const normalized=stored.map(c=>this._normalizeCampaign(c)); this._write(M89_KEYS.CAMPAIGNS,normalized); return normalized; }
    const campaign=this._normalizeCampaign({createdAt:new Date().toISOString(),minimumDays:this.getSettings().missionDays});
    this._write(M89_KEYS.CAMPAIGNS,[campaign]); this._write(M89_KEYS.ACTIVE_CAMPAIGN,campaign.id); return [campaign];
  },
  saveCampaign(campaign){ const normalized=this._normalizeCampaign(campaign); const campaigns=this.getCampaigns(); const i=campaigns.findIndex(c=>c.id===normalized.id); if(i>=0) campaigns[i]=Object.assign({},campaigns[i],normalized); else campaigns.push(normalized); this._write(M89_KEYS.CAMPAIGNS,campaigns); return normalized; },
  createCampaign(input={}){ const now=new Date().toISOString(); const campaign=this._normalizeCampaign(Object.assign({},input,{id:input.id||`campaign-${Date.now().toString(36)}`,createdAt:input.createdAt||now,status:input.status||'ready',startedAt:null,completedAt:null,archivedAt:null,currentPhaseId:input.currentPhaseId||'awakening'})); this.saveCampaign(campaign); this.setActiveCampaign(campaign.id); return campaign; },
  getActiveCampaignId(){ return this._read(M89_KEYS.ACTIVE_CAMPAIGN,'mission-89'); },
  setActiveCampaign(id){ this._write(M89_KEYS.ACTIVE_CAMPAIGN,id); return this.getActiveCampaign(); },
  getActiveCampaign(){ const campaigns=this.getCampaigns(); return campaigns.find(c=>c.id===this.getActiveCampaignId())||campaigns.find(c=>c.status!=='archived')||campaigns[0]; },
  archiveCampaign(id,summary={}){ const campaign=this.getCampaigns().find(c=>c.id===id); if(!campaign) return null; return this.saveCampaign(Object.assign({},campaign,{status:'archived',archivedAt:new Date().toISOString(),archiveSummary:summary})); },
  getArchivedCampaigns(){ return this.getCampaigns().filter(c=>c.status==='archived'); },

  getOperator(){ return Object.assign({id:null,name:'',complete:false,profileVersion:0},this._read(M89_KEYS.OPERATOR,{})); },
  saveOperator(patch){ const merged=Object.assign({},this.getOperator(),patch); this._write(M89_KEYS.OPERATOR,merged); return merged; },
  isOperatorInitialized(){ return this.getOperator().complete===true; },
  getOnboardingState(){ return Object.assign({started:false,moduleIndex:0,questionIndex:0,step:0,draft:{},completedAt:null},this._read(M89_KEYS.ONBOARDING,{})); },
  saveOnboardingState(patch){ const merged=Object.assign({},this.getOnboardingState(),patch); this._write(M89_KEYS.ONBOARDING,merged); return merged; },
  getOnboardingDraft(){ return this.getOnboardingState().draft||{}; },
  saveOnboardingDraft(draft){ return this.saveOnboardingState({draft}); },
  clearOnboardingDraft(){ return this.saveOnboardingState({started:false,moduleIndex:0,questionIndex:0,step:0,draft:{}}); },

  getRecoveryHistory(){ return this._read(M89_KEYS.RECOVERY,[]); },
  saveRecoverySnapshot(snapshot){ const all=this.getRecoveryHistory().filter(x=>x.date!==snapshot.date); all.push(snapshot); all.sort((a,b)=>a.date.localeCompare(b.date)); this._write(M89_KEYS.RECOVERY,all.slice(-180)); return snapshot; },

  getAppState(){ return Object.assign({version:'0.0.0',migration:0,lastBriefDate:null},this._read(M89_KEYS.APP,{})); },
  saveAppState(patch){ const merged=Object.assign({},this.getAppState(),patch); this._write(M89_KEYS.APP,merged); return merged; },

  exportAll(){ return {schemaVersion:5,app:'ASCEND',exportedAt:new Date().toISOString(),settings:this.getSettings(),meta:this.getMeta(),checkins:this.getCheckins(),photos:this.getPhotos(),workouts:this.getWorkoutLog(),trainingSessions:this.getTrainingSessions(),messProfile:this.getMessProfile(),mealHistory:this.getMealHistory(),campaigns:this.getCampaigns(),activeCampaignId:this.getActiveCampaignId(),operator:this.getOperator(),onboarding:this.getOnboardingState(),recoveryHistory:this.getRecoveryHistory(),appState:this.getAppState()}; },
  validateBackup(payload){
    if(!payload||typeof payload!=='object') throw new Error('Invalid backup file');
    if(payload.app&&payload.app!=='ASCEND'&&payload.app!=='Mission 89') throw new Error('Backup belongs to another app');
    if(payload.checkins&&typeof payload.checkins!=='object') throw new Error('Invalid check-in data');
    if(payload.campaigns&&!Array.isArray(payload.campaigns)) throw new Error('Invalid campaign data');
    return true;
  },
  importAll(payload){ this.validateBackup(payload); if(payload.settings)this._write(M89_KEYS.SETTINGS,payload.settings); if(payload.meta)this._write(M89_KEYS.META,payload.meta); if(payload.checkins)this._write(M89_KEYS.CHECKINS,payload.checkins); if(payload.photos)this._write(M89_KEYS.PHOTOS,payload.photos); if(payload.workouts)this._write(M89_KEYS.WORKOUTS,payload.workouts); if(payload.trainingSessions)this._write(M89_KEYS.TRAINING_SESSIONS,payload.trainingSessions); if(payload.messProfile)this._write(M89_KEYS.MESS_PROFILE,payload.messProfile); if(payload.mealHistory)this._write(M89_KEYS.MEAL_HISTORY,payload.mealHistory); if(payload.campaigns)this._write(M89_KEYS.CAMPAIGNS,payload.campaigns); if(payload.activeCampaignId)this._write(M89_KEYS.ACTIVE_CAMPAIGN,payload.activeCampaignId); if(payload.operator)this._write(M89_KEYS.OPERATOR,payload.operator); if(payload.onboarding)this._write(M89_KEYS.ONBOARDING,payload.onboarding); if(payload.recoveryHistory)this._write(M89_KEYS.RECOVERY,payload.recoveryHistory); if(payload.appState)this._write(M89_KEYS.APP,payload.appState); this.getCampaigns(); return true; },
  wipeAll(){ Object.values(M89_KEYS).forEach(k=>this._remove(k)); }
};
