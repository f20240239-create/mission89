/* ==========================================================================
   MISSION 89 — Utilities
   ========================================================================== */
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

  // ---- Scoring ----
  // Mission Score /100 composite for a given day's checkin vs settings targets
  computeDayScore(checkin, settings){
    if(!checkin) return 0;
    let score = 0;
    const weights = {
      calories: 20, protein: 20, water: 12, steps: 12,
      sleep: 12, workout: 16, cardio: 8
    };
    // Calories: full credit within 10% of target, tapering after
    if(checkin.calories != null && settings.calorieTarget){
      const ratio = checkin.calories / settings.calorieTarget;
      const diff = Math.abs(1-ratio);
      score += weights.calories * this.clamp(1 - diff*2.2, 0, 1);
    }
    if(checkin.protein != null && settings.proteinTarget){
      const ratio = checkin.protein / settings.proteinTarget;
      score += weights.protein * this.clamp(ratio, 0, 1);
    }
    if(checkin.water != null && settings.waterTarget){
      score += weights.water * this.clamp(checkin.water / settings.waterTarget, 0, 1);
    }
    if(checkin.steps != null && settings.stepTarget){
      score += weights.steps * this.clamp(checkin.steps / settings.stepTarget, 0, 1);
    }
    if(checkin.sleep != null && settings.sleepTarget){
      score += weights.sleep * this.clamp(checkin.sleep / settings.sleepTarget, 0, 1);
    }
    if(checkin.workoutDone) score += weights.workout;
    if(checkin.cardioDone) score += weights.cardio;
    if(checkin.cheatMeal) score = Math.max(0, score - 8);
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
  }
};
