/* ==========================================================================
   MISSION 89 — Dashboard
   Render only. All mission calculations come from utils.js.
   ========================================================================== */
const Dashboard = {
  render(){
    const settings = Store.getSettings();
    const mission = U.missionStats(settings);
    const physique = U.physiqueProgress(settings);
    const today = U.todayStr();
    const daily = U.getDailyMission(settings, today);
    const score = daily.score;
    const totalDays = settings.missionDays;
    const dayX = mission.missionDay;

    const workout = getWorkoutForDate(today);
    const workoutLog = Store.getWorkoutDay(today);
    const doneCount = workout.exercises.filter(e => workoutLog.exercises[e.id]).length;
    const totalEx = workout.exercises.length;

    const streak = U.computeStreak();
    document.getElementById('streakCount').textContent = streak;
    document.getElementById('headerDayLabel').textContent = `Mission Day ${dayX}`;

    const r = 88;
    const c = U.circumference(r);
    const offset = U.ringOffset(r, score / 100);

    let pips = '';
    for(let i = 1; i <= totalDays; i++){
      let cls = 'pip';
      if(i < dayX) cls += ' done';
      else if(i === dayX) cls += ' today';
      pips += `<div class="${cls}"></div>`;
    }

    const questRows = daily.objectives.map(objective => `
      <button class="quest-row quest-${objective.state}" onclick="App.navigate('${objective.destination}')">
        <span class="quest-icon">${ICONS[objective.icon] || ICONS.bolt}</span>
        <span class="quest-main">
          <span class="quest-title">${objective.title}</span>
          <span class="quest-detail">${objective.detail}</span>
          <span class="quest-track"><span style="width:${Math.round(objective.progress * 100)}%"></span></span>
        </span>
        <span class="quest-reward">
          ${objective.completed ? ICONS.check : `<b>+${objective.reward}</b><small>pts</small>`}
        </span>
      </button>
    `).join('');

    const missionState = daily.complete
      ? `<div class="quest-complete-banner">${ICONS.check}<div><b>DAILY QUEST COMPLETE</b><span>All objectives cleared. System score 100/100.</span></div></div>`
      : `<div class="quest-command"><b>${this._nextAction(daily.objectives)}</b><span>${daily.completedCount}/${daily.totalCount} objectives complete</span></div>`;

    const html = `
      <div class="card hero-card glow">
        <div class="hero-top">
          <div class="hero-mission">
            <span class="eyebrow">Mission Progress</span>
            <span class="hero-daycount">Mission Day ${dayX} · ${U.prettyDateFull(today)}</span>
            <div class="day-pips">${pips}</div>
          </div>
        </div>
        <div class="ring-wrap">
          <svg class="ring-svg" viewBox="0 0 200 200">
            <circle class="ring-track" cx="100" cy="100" r="${r}"></circle>
            <circle class="ring-fill" cx="100" cy="100" r="${r}"
              stroke-dasharray="${c}" stroke-dashoffset="${c}" id="scoreRingCircle"></circle>
          </svg>
          <div class="ring-center">
            <div class="ring-score num">${score}</div>
            <div class="ring-score-max">/ 100</div>
            <div class="ring-label">Mission Score</div>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><b class="num">${mission.totalScore}</b><span>Total Score</span></div>
          <div class="hero-stat"><b class="num">${mission.completion}%</b><span>Execution</span></div>
          <div class="hero-stat"><b class="num ${mission.daysBehind ? 'text-yellow' : 'text-emerald'}">${mission.daysBehind}</b><span>Days Behind</span></div>
        </div>
      </div>

      <div class="card quest-card ${daily.complete ? 'is-complete' : ''}">
        <div class="quest-header">
          <div>
            <span class="eyebrow">System · Daily Quest</span>
            <div class="quest-heading">Today's Objectives</div>
          </div>
          <div class="quest-score"><b>${score}</b><span>/100</span></div>
        </div>
        ${missionState}
        <div class="quest-list">${questRows}</div>
        ${daily.penalty ? `<div class="quest-penalty">Cheat meal penalty applied: −${daily.penalty} points</div>` : ''}
      </div>

      <div class="card workout-preview" onclick="App.navigate('workout')" role="button">
        <div class="workout-preview-tag">${workout.tag.slice(0,2)}</div>
        <div class="workout-preview-body">
          <div class="workout-preview-title">${workout.title}</div>
          <div class="workout-preview-sub">${workout.sub} · ${doneCount}/${totalEx} exercises done</div>
        </div>
        <svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>

      <span class="section-label">Mission Intelligence</span>
      <div class="card forecast-card">
        <div class="forecast-header"><div><span class="eyebrow">Execution Forecast</span><div class="forecast-status">${mission.forecastStatus}</div></div></div>
        <div class="forecast-grid">
          <div class="forecast-stat"><span>Current Average</span><b class="num">${mission.currentAverage}</b><small>points / day</small></div>
          <div class="forecast-stat"><span>Required Average</span><b class="num">${mission.requiredAverage === Infinity ? '—' : mission.requiredAverage}</b><small>${mission.recoveryStatus}</small></div>
          <div class="forecast-stat"><span>Projected Finish</span><b class="num">${mission.projectedFinishDay === Infinity ? '—' : `Day ${mission.projectedFinishDay}`}</b><small>${mission.projectedDelay === Infinity ? 'No forecast yet' : mission.projectedDelay > 0 ? `${mission.projectedDelay} days late` : 'On schedule'}</small></div>
        </div>
      </div>

      <div class="card forecast-card">
        <div class="forecast-header"><div><span class="eyebrow">Physique Progress</span><div class="forecast-status">${physique.status}</div></div></div>
        <div class="forecast-grid">
          <div class="forecast-stat"><span>Current Weight</span><b class="num">${U.formatNum(physique.currentWeight,1)}</b><small>kg</small></div>
          <div class="forecast-stat"><span>Total Change</span><b class="num">${physique.totalChange > 0 ? '+' : ''}${U.formatNum(physique.totalChange,1)}</b><small>kg since start</small></div>
          <div class="forecast-stat"><span>Weekly Trend</span><b class="num">${physique.weeklyTrend == null ? '—' : (physique.weeklyTrend > 0 ? '+' : '') + U.formatNum(physique.weeklyTrend,1)}</b><small>${physique.weeklyTrend == null ? 'need 2+ entries' : 'kg / week'}</small></div>
        </div>
      </div>

      <button class="btn btn-primary" onclick="App.navigate('checkin')">${ICONS.plus}${daily.checkin ? "Update Today's Check-in" : "Log Today's Check-in"}</button>
    `;

    const el = document.getElementById('dashboardContent');
    el.innerHTML = html;
    requestAnimationFrame(() => {
      const ring = document.getElementById('scoreRingCircle');
      if(ring) ring.style.strokeDashoffset = offset;
    });
  },

  _nextAction(objectives){
    const next = objectives.find(objective => !objective.completed);
    if(!next) return 'All objectives cleared.';
    if(next.state === 'active') return `Continue: ${next.title}`;
    return `Next objective: ${next.title}`;
  }
};

const ICONS = {
  plus:'<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><path d="M18 2c-2 2-4 5-4 9a4 4 0 0 0 4 4c0-4 2-9 4-11-2-1-3-2-4-2z"/></svg>',
  protein:'<svg viewBox="0 0 24 24"><path d="M6 3v6a3 3 0 0 0 3 3M6 3H4v6a5 5 0 0 0 5 5M6 3h2M18 3v6a3 3 0 0 1-3 3M18 3h2v6a5 5 0 0 1-5 5M18 3h-2M11 12v9M9 21h4"/></svg>',
  water:'<svg viewBox="0 0 24 24"><path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/></svg>',
  steps:'<svg viewBox="0 0 24 24"><path d="M5 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM7 8v4l-2 8M15 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM17 16v4l2-8-3-3"/></svg>',
  sleep:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  cardio:'<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  bolt:'<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>'
};
