/* ==========================================================================
   ASCEND — Settings
   ========================================================================== */
const Settings = {
  render(){
    const s = Store.getSettings();
    const campaign = Store.getActiveCampaign();
    const missionStarted = U.isMissionStarted();
    const meta = Store.getMeta();
    const phase = U.getPhaseStatus(s);
    const archived = Store.getArchivedCampaigns();

    const html = `
      <div>
        <div class="page-title">Settings</div>
        <div class="page-sub">Configure ASCEND and your active campaign</div>
      </div>

      <span class="section-label">Operator</span>
      <div class="card operator-settings-card"><div><b>${Store.isOperatorInitialized() ? (Store.getOperator().name || 'Operator') : 'Profile incomplete'}</b><span>${Store.isOperatorInitialized() ? 'Permanent profile synchronized' : 'Complete initialization before beginning a campaign'}</span></div><button class="btn btn-outline btn-sm" id="editOperatorBtn">${Store.isOperatorInitialized() ? 'Review Profile' : 'Initialize'}</button></div>

      <span class="section-label">Active Campaign</span>
      <div class="card campaign-settings-card"><span>Campaign</span><b>${campaign.name}</b><small>Phase ${phase.number} · ${phase.name} · ${campaign.status.toUpperCase()}</small></div>
      <div class="card campaign-actions-card"><button class="btn btn-outline btn-sm" id="newCampaignBtn">New Campaign</button><span>${archived.length} archived campaign${archived.length===1?'':'s'}</span></div>

      <span class="section-label">Body Goal</span>
      <div class="card settings-list">
        <div class="settings-row">
          <div class="settings-row-label">${rowIcon('target')}<span>Goal weight</span></div>
          <div class="flex-row">
            <input type="number" step="0.1" class="input" id="s_goalWeight" style="width:84px;padding:8px 10px;text-align:right;" value="${s.goalWeight}">
            <span class="unit-tag">kg</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">${rowIcon('flag')}<span>Minimum phase duration</span></div>
          <div class="flex-row">
            <input type="number" class="input" id="s_missionDays" style="width:64px;padding:8px 10px;text-align:right;" value="${s.missionDays}">
            <span class="unit-tag">days</span>
          </div>
        </div>
      </div>

      <span class="section-label">Daily Targets</span>
      <div class="card settings-list">
        <div class="settings-row">
          <div class="settings-row-label">${rowIcon('cal')}<span>Calories</span></div>
          <div class="flex-row">
            <input type="number" class="input" id="s_calorieTarget" style="width:84px;padding:8px 10px;text-align:right;" value="${s.calorieTarget}">
            <span class="unit-tag">kcal</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">${rowIcon('protein')}<span>Protein</span></div>
          <div class="flex-row">
            <input type="number" class="input" id="s_proteinTarget" style="width:84px;padding:8px 10px;text-align:right;" value="${s.proteinTarget}">
            <span class="unit-tag">g</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">${rowIcon('water')}<span>Water</span></div>
          <div class="flex-row">
            <input type="number" step="0.1" class="input" id="s_waterTarget" style="width:84px;padding:8px 10px;text-align:right;" value="${s.waterTarget}">
            <span class="unit-tag">L</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">${rowIcon('steps')}<span>Steps</span></div>
          <div class="flex-row">
            <input type="number" class="input" id="s_stepTarget" style="width:84px;padding:8px 10px;text-align:right;" value="${s.stepTarget}">
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">${rowIcon('sleep')}<span>Sleep</span></div>
          <div class="flex-row">
            <input type="number" step="0.5" class="input" id="s_sleepTarget" style="width:84px;padding:8px 10px;text-align:right;" value="${s.sleepTarget}">
            <span class="unit-tag">h</span>
          </div>
        </div>
      </div>

      <button class="btn btn-primary" id="saveSettingsBtn">Save Changes</button>

      <span class="section-label">Campaign Control</span>
      <div class="card mission-control-card">
        <div>
          <b>${missionStarted ? `Phase ${phase.number} active · Day ${U.missionDay()}` : 'Campaign not started'}</b>
          <span>${missionStarted ? `Started ${U.prettyDate(meta.startDate)}` : meta.previousStartDate ? `Previous automatic counter (${U.prettyDate(meta.previousStartDate)}) was frozen. Initialize when ready.` : 'The counter remains frozen until you initialize it.'}</span>
        </div>
        ${missionStarted
          ? '<button class="btn btn-outline btn-sm" id="resetMissionStartBtn">Return to Pre-start</button>'
          : '<button class="btn btn-primary btn-sm" id="startMissionBtn">Initialize Campaign</button>'}
      </div>

      <span class="section-label">Data</span>
      <div class="card settings-list">
        <div class="settings-row" style="cursor:pointer;" id="exportRow">
          <div class="settings-row-label">${rowIcon('export')}<span>Export data (.json)</span></div>
          <span class="chev-wrap">${chev()}</span>
        </div>
        <div class="settings-row" style="cursor:pointer;" id="importRow">
          <div class="settings-row-label">${rowIcon('import')}<span>Import backup</span></div>
          <span class="chev-wrap">${chev()}</span>
        </div>
      </div>

      <span class="section-label">Danger Zone</span>
      <div class="card">
        <button class="btn btn-danger" id="resetBtn">Erase All Data</button>
      </div>

      <div class="app-version">ASCEND · v${M89_VERSION} · All data stored on-device</div>
      <input type="file" accept="application/json" id="importInput" class="hidden">
    `;

    document.getElementById('settingsContent').innerHTML = html;
    this._bind();
  },

  _bind(){
    document.getElementById('saveSettingsBtn').onclick = () => {
      const patch = {
        goalWeight: parseFloat(document.getElementById('s_goalWeight').value) || 89,
        missionDays: Math.max(1, parseInt(document.getElementById('s_missionDays').value) || 20),
        calorieTarget: Math.max(1, parseInt(document.getElementById('s_calorieTarget').value) || 2200),
        proteinTarget: Math.max(0, parseInt(document.getElementById('s_proteinTarget').value) || 180),
        waterTarget: Math.max(0.1, parseFloat(document.getElementById('s_waterTarget').value) || 3.5),
        stepTarget: Math.max(0, parseInt(document.getElementById('s_stepTarget').value) || 10000),
        sleepTarget: Math.max(0.5, parseFloat(document.getElementById('s_sleepTarget').value) || 8)
      };
      Store.saveSettings(patch);
      Store.saveCampaign({ ...Store.getActiveCampaign(), goalWeight:patch.goalWeight, minimumDays:patch.missionDays });
      U.toast('Settings saved ✓');
      if(typeof App !== 'undefined') App.refreshHeader();
    };

    const newCampaignBtn = document.getElementById('newCampaignBtn');
    if(newCampaignBtn) newCampaignBtn.onclick = () => App.createCampaign();

    const editOperatorBtn = document.getElementById('editOperatorBtn');
    if(editOperatorBtn) editOperatorBtn.onclick = () => Onboarding.start();

    const startMissionBtn = document.getElementById('startMissionBtn');
    if(startMissionBtn) startMissionBtn.onclick = () => App.startMission();
    const resetMissionStartBtn = document.getElementById('resetMissionStartBtn');
    if(resetMissionStartBtn) resetMissionStartBtn.onclick = () => App.resetMissionStart();

    document.getElementById('exportRow').onclick = () => this._export();

    document.getElementById('importRow').onclick = () => document.getElementById('importInput').click();
    document.getElementById('importInput').onchange = (e) => this._import(e);

    document.getElementById('resetBtn').onclick = () => {
      if(confirm('This will permanently erase all ASCEND data on this device. This cannot be undone. Continue?')){
        Store.wipeAll();
        U.toast('All data erased');
        setTimeout(()=> location.reload(), 600);
      }
    };
  },

  _export(){
    const data = Store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = U.todayStr();
    a.href = url;
    a.download = `ascend-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    U.toast('Backup exported ✓');
  },

  _import(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try{
        const payload = JSON.parse(ev.target.result);
        Store.importAll(payload);
        U.toast('Backup restored ✓');
        setTimeout(()=> location.reload(), 600);
      }catch(err){
        U.toast('Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
};

function rowIcon(type){
  const map = {
    target:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    flag:'<svg viewBox="0 0 24 24"><path d="M5 3v18M5 4h13l-3 4 3 4H5"/></svg>',
    cal:'<svg viewBox="0 0 24 24"><path d="M18 2c-2 2-4 5-4 9a4 4 0 0 0 4 4c0-4 2-9 4-11-2-1-3-2-4-2z"/></svg>',
    protein:'<svg viewBox="0 0 24 24"><path d="M6 3v6a3 3 0 0 0 3 3M6 3H4v6a5 5 0 0 0 5 5M18 3v6a3 3 0 0 1-3 3M18 3h2v6a5 5 0 0 1-5 5M11 12v9M9 21h4"/></svg>',
    water:'<svg viewBox="0 0 24 24"><path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/></svg>',
    steps:'<svg viewBox="0 0 24 24"><path d="M5 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM7 8v4l-2 8M15 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM17 16v4l2-8-3-3"/></svg>',
    sleep:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
    export:'<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    import:'<svg viewBox="0 0 24 24"><path d="M12 21V9M7 14l5-5 5 5M4 3h16" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  return map[type] || '';
}
function chev(){
  return '<svg viewBox="0 0 24 24" style="width:16px;height:16px;color:var(--text-3);"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}