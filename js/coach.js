/* ==========================================================================
   ASCEND — System Analysis
   Factual, recovery-first guidance generated from on-device data.
   ========================================================================== */
const Coach = {
  render(){
    const settings=Store.getSettings();
    const today=U.todayStr();
    const daily=U.getDailyMission(settings,today);
    const recovery=U.getRecoveryProtocol(settings,today);
    const intel=U.getIntelligence(settings);
    const phase=U.getPhaseStatus(settings);
    const physique=U.physiqueProgress(settings);

    const headline=!daily.checkin
      ? 'No assessment is possible until today is logged.'
      : recovery.state==='ACTIVE'
        ? `Damage has been measured. Recovery remains possible in approximately ${recovery.recoveryDays} day${recovery.recoveryDays===1?'':'s'}.`
        : daily.score>=80
          ? 'Trajectory is stable. The standard remains unchanged.'
          : 'Execution is incomplete. Correct the highest-impact gap first.';

    const insights=[
      ...(recovery.state==='ACTIVE' ? recovery.actions.map((a,i)=>({type:i===0?'bad':'warn',title:i===0?'Primary recovery action':'Recovery action',body:a.label})) : []),
      ...intel.insights.map((text,i)=>({type:i===0?'warn':'good',title:i===0?'Current bottleneck':'System observation',body:text})),
      {type:phase.cleared?'good':'warn',title:`Phase ${phase.number}: ${phase.name}`,body:`${phase.completedRequirements}/${phase.requirements.length} clearance gates complete. Phase progress: ${phase.progress}%.`},
      {type:physique.status==='ON TRACK'?'good':physique.status==='REVERSING'?'bad':'warn',title:'Physique trajectory',body:physique.weeklyTrend==null?'Two or more weight entries are required before the System can estimate a trend.':`${physique.status}. Current trend: ${physique.weeklyTrend>0?'+':''}${physique.weeklyTrend} kg/week.`}
    ];

    document.getElementById('coachContent').innerHTML=`
      <div><div class="page-title">System Analysis</div><div class="page-sub">Observations derived from your logged data</div></div>
      <div class="card coach-hero"><div class="coach-avatar">${ICONS.bolt}</div><div class="coach-msg"><b>${headline}</b><br><small>Confidence: ${intel.confidence} · ${intel.dataDays} data day${intel.dataDays===1?'':'s'}</small></div></div>
      <span class="section-label">Current Analysis</span>
      <div class="stagger" style="display:flex;flex-direction:column;gap:10px;">
        ${insights.map(i=>`<div class="card insight-row insight-${i.type}"><div class="insight-icon">${INSIGHT_ICONS[i.type]}</div><div class="insight-text"><b style="color:var(--text-1);">${i.title}</b><br>${i.body}</div></div>`).join('')}
      </div>`;
  }
};

const INSIGHT_ICONS={
  good:'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  warn:'<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  bad:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
};
