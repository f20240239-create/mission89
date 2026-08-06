/* ==========================================================================
   ASCEND — System Dashboard
   Focused home: phase, today's command, recovery, then optional intelligence.
   ========================================================================== */
const Dashboard = {
  render(){
    const settings = Store.getSettings();
    const campaign = Store.getActiveCampaign();
    if(!U.isMissionStarted()){
      this._renderPreStart(settings, campaign);
      return;
    }

    const today = U.todayStr();
    const mission = U.missionStats(settings);
    const phase = U.getPhaseStatus(settings);
    const daily = U.getDailyMission(settings, today);
    const recovery = U.getRecoveryProtocol(settings, today);
    const physique = U.physiqueProgress(settings);
    const intelligence = U.getIntelligence(settings);
    const campaignState = U.getCampaignState(settings);
    const streak = U.computeStreak();

    document.getElementById('streakCount').textContent = streak;
    document.getElementById('headerDayLabel').textContent = `${campaign.name} · Day ${mission.actualMissionDay}`;

    const r = 74;
    const c = U.circumference(r);
    const offset = U.ringOffset(r, daily.score / 100);
    const next = daily.objectives.find(o => !o.completed);
    const priority = next || daily.objectives[0];

    const primaryObjectives = daily.objectives.slice(0,4).map(o => this._questRow(o)).join('');
    const secondaryObjectives = daily.objectives.slice(4).map(o => this._questRow(o)).join('');
    const recoveryActions = recovery.actions.map((action, i) => `
      <button class="recovery-action" onclick="App.navigate('${action.destination}')">
        <span>${String(i+1).padStart(2,'0')}</span><b>${action.label}</b>${ICONS.chev}
      </button>`).join('');

    const lifecycleAction = campaignState.complete
      ? `<button class="btn btn-primary" onclick="App.completeCampaign()">Archive Completed Campaign</button>`
      : phase.cleared && phase.nextPhase
        ? `<button class="btn btn-primary" onclick="App.advancePhase()">Unlock Phase ${phase.nextPhase.number}: ${phase.nextPhase.name}</button>`
        : '';

    const html = `
      <section class="system-command card">
        <div class="system-command-top">
          <div>
            <span class="eyebrow">ASCEND · PHASE ${phase.number} <i class="build-chip">v${M89_VERSION}</i></span>
            <h1>${phase.name}</h1>
            <span class="phase-state phase-${phase.state.toLowerCase()}">${phase.state} · ${phase.progress}%</span>
          </div>
          <div class="compact-ring">
            <svg viewBox="0 0 180 180"><defs><linearGradient id="ascendGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="48%" stop-color="#4f46e5"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
              <circle class="ring-track" cx="90" cy="90" r="${r}"></circle>
              <circle class="ring-fill" cx="90" cy="90" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" id="scoreRingCircle"></circle>
            </svg>
            <div><b>${daily.score}</b><span>/100</span></div>
          </div>
        </div>
        <div class="system-directive">
          <span>TODAY'S COMMAND</span>
          <b>${daily.complete ? 'Daily quest cleared. Do not get comfortable.' : priority.title}</b>
          <small>${daily.complete ? 'Return tomorrow and repeat it.' : priority.detail}</small>
          <button class="system-brief-link" onclick="App.showDailyBrief()">Open daily brief</button>
        </div>
        <div class="system-mini-stats">
          <div><b>${daily.completedCount}/${daily.totalCount}</b><span>Objectives</span></div>
          <div><b>${mission.projectedDelay === Infinity ? '—' : mission.projectedDelay}</b><span>ETA delay</span></div>
          <div><b>${phase.completedRequirements}/${phase.requirements.length}</b><span>Phase gates</span></div>
        </div>
        ${lifecycleAction}
      </section>

      <section class="card quest-card ${daily.complete ? 'is-complete' : ''}">
        <div class="section-head">
          <div><span class="eyebrow">DAILY QUEST</span><h2>Execute today</h2></div>
          <span class="quest-score"><b>${daily.score}</b><span>/100</span></span>
        </div>
        <div class="quest-list">${primaryObjectives}</div>
        ${secondaryObjectives ? `<details class="system-details"><summary>Show remaining objectives</summary><div class="quest-list">${secondaryObjectives}</div></details>` : ''}
        <button class="btn btn-primary" onclick="App.navigate('checkin')">${ICONS.plus}${daily.checkin ? 'Update Check-in' : 'Log Today'}</button>
      </section>

      <section class="card recovery-card recovery-${recovery.severity}">
        <div class="section-head">
          <div><span class="eyebrow">RECOVERY PROTOCOL</span><h2>${recovery.title}</h2></div>
          <span class="protocol-state">${recovery.state}</span>
        </div>
        <p>${recovery.summary}</p>
        <div class="recovery-actions">${recoveryActions}</div>
      </section>

      <details class="card system-details intelligence-details">
        <summary>Campaign intelligence</summary>
        <div class="intelligence-grid">
          <div><span>Current average</span><b>${mission.currentAverage}</b></div>
          <div><span>Required average</span><b>${mission.requiredAverage === Infinity ? '—' : mission.requiredAverage}</b></div>
          <div><span>Projected finish</span><b>${mission.projectedFinishDay === Infinity ? '—' : `Day ${mission.projectedFinishDay}`}</b></div>
          <div><span>Current weight</span><b>${U.formatNum(physique.currentWeight,1)} kg</b></div>
          <div><span>System confidence</span><b>${intelligence.confidence}</b></div>
          <div><span>Current bottleneck</span><b>${intelligence.bottleneck ? intelligence.bottleneck.label : '—'}</b></div>
        </div>
        <div class="system-insights">
          ${intelligence.insights.map(text => `<div><span>${ICONS.bolt}</span><p>${text}</p></div>`).join('')}
        </div>
        <div class="phase-requirements">
          <span class="eyebrow">PHASE CLEARANCE</span>
          ${phase.requirements.map(req => `<div class="phase-requirement ${req.met ? 'met' : ''}"><span>${req.met ? ICONS.check : ICONS.lock}</span><b>${req.label}</b><small>${req.value}${req.suffix || ''} / ${req.target}${req.suffix || ''}</small></div>`).join('')}
        </div>
      </details>
    `;

    document.getElementById('dashboardContent').innerHTML = html;
    requestAnimationFrame(() => {
      const ring = document.getElementById('scoreRingCircle');
      if(ring) ring.style.strokeDashoffset = offset;
    });
  },

  _questRow(o){
    return `<button class="quest-row quest-${o.state}" onclick="App.navigate('${o.destination}')">
      <span class="quest-icon">${ICONS[o.icon] || ICONS.bolt}</span>
      <span class="quest-main"><span class="quest-title">${o.title}</span><span class="quest-detail">${o.detail}</span><span class="quest-track"><span style="width:${Math.round(o.progress*100)}%"></span></span></span>
      <span class="quest-reward">${o.completed ? ICONS.check : `<b>+${o.reward}</b><small>pts</small>`}</span>
    </button>`;
  },

  _renderPreStart(settings, campaign){
    document.getElementById('streakCount').textContent = '0';
    document.getElementById('headerDayLabel').textContent = `${campaign.name} · Awaiting Start`;
    document.getElementById('dashboardContent').innerHTML = `
      <section class="system-init-shell">
        <div class="system-init-orb ascend-orb" aria-hidden="true"><span>A</span></div>
        <span class="eyebrow">ASCEND OFFLINE <i class="build-chip">v${M89_VERSION}</i></span>
        <h1>Phase I: Awakening</h1><div class="campaign-label">CAMPAIGN · ${campaign.name}</div>
        <p>The campaign begins only when you decide to execute. Until then, the counter stays at zero.</p>
        <div class="card system-init-card">
          <div class="system-init-row"><span>Starting weight</span><b>${U.formatNum(settings.startWeight,1)} kg</b></div>
          <div class="system-init-row"><span>First checkpoint</span><b>${U.formatNum(settings.goalWeight,1)} kg</b></div>
          <div class="system-init-row"><span>Minimum phase duration</span><b>${settings.missionDays} days</b></div>
          <div class="system-init-note">Phase I will remain active after Day ${settings.missionDays} until its execution requirements are cleared.</div>
        </div>
        ${Store.isOperatorInitialized()
          ? '<button class="btn btn-primary system-start-btn" onclick="App.startMission()">Initialize Campaign</button><button class="btn btn-ghost" onclick="Onboarding.start()">Review Operator Profile</button>'
          : "<button class='btn btn-primary system-start-btn' onclick='Onboarding.start()'>Begin Profile Synchronization</button><button class='btn btn-ghost' onclick=\"App.navigate('settings')\">Use existing settings later</button>"}
        <small class="system-init-warning">Initialize only when you are ready. That day becomes Day 1 of ${campaign.name}.</small>
      </section>`;
  }
};

const ICONS = {
  plus:'<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><path d="M18 2c-2 2-4 5-4 9a4 4 0 0 0 4 4c0-4 2-9 4-11-2-1-3-2-4-2z"/></svg>',
  protein:'<svg viewBox="0 0 24 24"><path d="M6 3v6a3 3 0 0 0 3 3M6 3H4v6a5 5 0 0 0 5 5M18 3v6a3 3 0 0 1-3 3M18 3h2v6a5 5 0 0 1-5 5M11 12v9M9 21h4"/></svg>',
  water:'<svg viewBox="0 0 24 24"><path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/></svg>',
  steps:'<svg viewBox="0 0 24 24"><path d="M5 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM7 8v4l-2 8M15 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM17 16v4l2-8-3-3"/></svg>',
  sleep:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  cardio:'<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  bolt:'<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>'
};
