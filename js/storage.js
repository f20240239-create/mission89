/* ==========================================================================
   MISSION 89 — Storage Layer
   All persistence lives in localStorage. Nothing ever leaves the device.
   ========================================================================== */
const M89_KEYS = {
  SETTINGS: 'm89_settings',
  CHECKINS: 'm89_checkins',
  PHOTOS: 'm89_photos',
  WORKOUTS: 'm89_workout_log',
  META: 'm89_meta'
};

const DEFAULT_SETTINGS = {
  goalWeight: 89,
  startWeight: 98,

  calorieTarget: 1800,
  proteinTarget: 190,

  waterTarget: 4,

  stepTarget: 10000,

  sleepTarget: 8,

  units: 'kg',

  height: 175,

  birthdayGoal: "2026-11-23",

  projectName: "Mission 89"
};

const Store = {
  _read(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(raw === null) return fallback;
      return JSON.parse(raw);
    }catch(e){
      console.warn('Storage read failed for', key, e);
      return fallback;
    }
  },
  _write(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      console.warn('Storage write failed for', key, e);
      return false;
    }
  },

  // ---- Settings ----
  getSettings(){
    return Object.assign({}, DEFAULT_SETTINGS, this._read(M89_KEYS.SETTINGS, {}));
  },
  saveSettings(patch){
    const merged = Object.assign({}, this.getSettings(), patch);
    this._write(M89_KEYS.SETTINGS, merged);
    return merged;
  },

  // ---- Meta (mission start date etc.) ----
  getMeta(){
    return Object.assign({ startDate: null, installedAt: null }, this._read(M89_KEYS.META, {}));
  },
  saveMeta(patch){
    const merged = Object.assign({}, this.getMeta(), patch);
    this._write(M89_KEYS.META, merged);
    return merged;
  },

  // ---- Check-ins, keyed by YYYY-MM-DD ----
  getCheckins(){
    return this._read(M89_KEYS.CHECKINS, {});
  },
  getCheckin(dateStr){
    const all = this.getCheckins();
    return all[dateStr] || null;
  },
  saveCheckin(dateStr, data){
    const all = this.getCheckins();
    all[dateStr] = Object.assign({}, all[dateStr] || {}, data, { date: dateStr });
    this._write(M89_KEYS.CHECKINS, all);
    return all[dateStr];
  },
  deleteCheckin(dateStr){
    const all = this.getCheckins();
    delete all[dateStr];
    this._write(M89_KEYS.CHECKINS, all);
  },

  // ---- Photos, keyed by YYYY-MM-DD ----
  getPhotos(){
    return this._read(M89_KEYS.PHOTOS, {});
  },
  savePhoto(dateStr, slot, dataUrl){
    const all = this.getPhotos();
    all[dateStr] = Object.assign({}, all[dateStr] || {}, { [slot]: dataUrl });
    this._write(M89_KEYS.PHOTOS, all);
    return all[dateStr];
  },
  deletePhoto(dateStr, slot){
    const all = this.getPhotos();
    if(all[dateStr]){
      delete all[dateStr][slot];
      if(Object.keys(all[dateStr]).length === 0) delete all[dateStr];
    }
    this._write(M89_KEYS.PHOTOS, all);
  },

  // ---- Workout completion log, keyed by YYYY-MM-DD ----
  getWorkoutLog(){
    return this._read(M89_KEYS.WORKOUTS, {});
  },
  getWorkoutDay(dateStr){
    const all = this.getWorkoutLog();
    return all[dateStr] || { exercises: {} };
  },
  toggleExercise(dateStr, exerciseId){
    const all = this.getWorkoutLog();
    if(!all[dateStr]) all[dateStr] = { exercises: {} };
    all[dateStr].exercises[exerciseId] = !all[dateStr].exercises[exerciseId];
    this._write(M89_KEYS.WORKOUTS, all);
    return all[dateStr];
  },

  // ---- Export / Import ----
  exportAll(){
    return {
      app: 'Mission 89',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      meta: this.getMeta(),
      checkins: this.getCheckins(),
      photos: this.getPhotos(),
      workouts: this.getWorkoutLog()
    };
  },
  importAll(payload){
    if(!payload || typeof payload !== 'object') throw new Error('Invalid backup file');
    if(payload.settings) this._write(M89_KEYS.SETTINGS, payload.settings);
    if(payload.meta) this._write(M89_KEYS.META, payload.meta);
    if(payload.checkins) this._write(M89_KEYS.CHECKINS, payload.checkins);
    if(payload.photos) this._write(M89_KEYS.PHOTOS, payload.photos);
    if(payload.workouts) this._write(M89_KEYS.WORKOUTS, payload.workouts);
    return true;
  },
  wipeAll(){
    Object.values(M89_KEYS).forEach(k => localStorage.removeItem(k));
  }
};
