/* ==========================================================================
   MISSION 89 — Dashboard
   ========================================================================== */
const Dashboard = {
  render(){
    const settings = Store.getSettings();
    const meta = U.ensureMissionStarted();
    const totalDays = settings.missionDays;
    const dayX = U.missionDayCapped(totalDays);
    const today = U.todayStr();
    const checkin = Store.getCheckin(today);
    const score = U.computeDayScore(checkin, settings);

    const latest = U.getLatestWeight();
    const currentWeight = latest ? latest.weight : (settings.startWeight || settings.goalWeight);
    const remaining = U.round1(currentWeight - settings.goalWeight);
    const remainingLabel = remaining > 0 ? `${U.formatNum(remaining,1)} kg to go` : (remaining < 0 ? `${U.formatNum(Math.abs(remaining),1)} kg under goal` : 'Goal reached');

    const workout = getWorkoutForDate(today);
    const workoutLog = Store.getWorkoutDay(today);
    const doneCount = workout.exercises.filter(e => workoutLog.exercises[e.id]).length;
    const totalEx = workout.exercises.length;

    const cal = checkin && checkin.calories != null ? checkin.calories : 0;
    const calRemain = Math.max(0, settings.calorieTarget - cal);
    const protein = checkin && checkin.protein != null ? checkin.protein : 0;
    const proteinRemain = Math.max(0, settings.proteinTarget - protein);
    const water = checkin && checkin.water != null ? checkin.water : 0;
    const steps = checkin && checkin.steps != null ? checkin.steps : 0;
    const sleep = checkin && checkin.sleep != null ? checkin.sleep : 0;

    const streak = U.computeStreak();
    document.getElementById('streakCount').textContent = streak;
    document.getElementById('headerDayLabel').textContent = `Day ${dayX} of ${totalDays}`;

    // Ring math
    const r = 88;
    const c = U.circumference(r);
    const offset = U.ringOffset(r, score/100);

    // Day pips
    let pips = '';
    for(let i=1; i<=totalDays; i++){
      let cls = 'pip';
      if(i < dayX) cls += ' done';
      else if(i === dayX) cls += ' today';
      pips += `<div class="${cls}"></div>`;
    }

    const html = `
      <div class="card hero-card glow">
        <div class="hero-top">
          <div class="hero-mission">
            <span class="eyebrow">Mission Progress</span>
            <span class="hero-daycount">Day ${dayX} of ${totalDays} · ${U.prettyDateFull(today)}</span>
            <div class="day-pips">${pips}</div>
          </div>
        </div>
        <div class="ring-wrap">
          <svg class="ring-svg" viewBox="0 0 200 200">
            <circle class="ring-track" cx="100" cy="100" r="${r}"></circle>
            <circle class="ring-fill" cx="100" cy="100" r="${r}"
              stroke-dasharray="${c}" stroke-dashoffset="${c}"
              id="scoreRingCircle"></circle>
          </svg>
          <div class="ring-center">
            <div class="ring-score num">${score}</div>
            <div class="ring-score-max">/ 100</div>
            <div class="ring-label">Mission Score</div>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <b class="num">${U.formatNum(currentWeight,1)}</b>
            <span>Current KG</span>
          </div>
          <div class="hero-stat">
            <b class="num">${U.formatNum(settings.goalWeight,1)}</b>
            <span>Goal KG</span>
          </div>
          <div class="hero-stat">
            <b class="num text-emerald">${U.formatNum(Math.abs(remaining),1)}</b>
            <span>${remaining > 0 ? 'Remaining' : 'Under Goal'}</span>
          </div>
        </div>
      </div>

      <div class="card workout-preview" onclick="App.navigate('workout')" role="button">
        <div class="workout-preview-tag">${workout.tag.slice(0,2)}</div>
        <div class="workout-preview-body">
          <div class="workout-preview-title">${workout.title}</div>
          <div class="workout-preview-sub">${workout.sub} · ${doneCount}/${totalEx} done</div>
        </div>
        <svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>

      <span class="section-label">Today's Numbers</span>
      <div class="metric-grid stagger">
        ${metricCard('cal','Calories Left', calRemain, 'kcal', cal, settings.calorieTarget)}
        ${metricCard('protein','Protein Left', proteinRemain, 'g', protein, settings.proteinTarget)}
        ${metricCard('water','Water', water, `/ ${settings.waterTarget} L`, water, settings.waterTarget, true)}
        ${metricCard('steps','Steps', steps, `/ ${settings.stepTarget}`, steps, settings.stepTarget, true)}
      </div>

      <div class="card metric-wide">
        <div class="metric-icon">${ICONS.sleep}</div>
        <div class="metric-wide-body">
          <div class="metric-wide-top">
            <span class="metric-name">Sleep</span>
            <span class="num" style="font-weight:800;">${sleep ? U.formatNum(sleep,1)+'h' : '—'} <small style="color:var(--text-3);font-weight:700;">/ ${settings.sleepTarget}h</small></span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${U.clamp((sleep/settings.sleepTarget)*100,0,100)}%"></div></div>
        </div>
      </div>

      <button class="btn btn-primary" onclick="App.navigate('checkin')">
        ${ICONS.plus}
        ${checkin ? "Update Today's Check-in" : "Log Today's Check-in"}
      </button>
    `;

    const el = document.getElementById('dashboardContent');
    el.innerHTML = html;

    // animate ring after paint
    requestAnimationFrame(()=>{
      const ring = document.getElementById('scoreRingCircle');
      if(ring) ring.style.strokeDashoffset = offset;
    });
  }
};

function metricCard(key, name, mainVal, unit, current, target, isPositive){
  const pct = target ? U.clamp((current/target)*100, 0, 100) : 0;
  const over = current > target;
  return `
    <div class="card metric-card">
      <div class="metric-head">
        <span class="metric-name">${name}</span>
        <div class="metric-icon">${ICONS[key] || ICONS.bolt}</div>
      </div>
      <div class="metric-value num">${U.formatNum(mainVal, key==='water'?1:0)} <small>${unit}</small></div>
      <div class="bar-track"><div class="bar-fill ${over?'over':''}" style="width:${pct}%"></div></div>
    </div>
  `;
}

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><path d="M18 2c-2 2-4 5-4 9a4 4 0 0 0 4 4c0-4 2-9 4-11-2-1-3-2-4-2z"/></svg>',
  protein: '<svg viewBox="0 0 24 24"><path d="M6 3v6a3 3 0 0 0 3 3M6 3H4v6a5 5 0 0 0 5 5M6 3h2M18 3v6a3 3 0 0 1-3 3M18 3h2v6a5 5 0 0 1-5 5M18 3h-2M11 12v9M9 21h4"/></svg>',
  water: '<svg viewBox="0 0 24 24"><path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/></svg>',
  steps: '<svg viewBox="0 0 24 24"><path d="M5 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM7 8v4l-2 8M15 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM17 16v4l2-8-3-3"/></svg>',
  sleep: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>'
};
