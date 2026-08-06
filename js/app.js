/* ==========================================================================
   ASCEND — App Controller
   ========================================================================== */
const App = {
  currentView: 'dashboard',
  primaryTabs: ['dashboard','workout','checkin','nutrition'],
  moreTabs: ['progress','calendar','photos','coach','settings'],

  init(){
    U.migrate();
    this._bindNav();
    this._bindSheet();
    this.navigate('dashboard');
    if(Onboarding.shouldRun()) setTimeout(() => Onboarding.start(), 650);
    else this._scheduleDailyBrief();
    this._registerSW();
    this._hideSplash();
  },

  navigate(view){
    const preStartAllowed = ['dashboard','settings'];
    if(!U.isMissionStarted() && !preStartAllowed.includes(view)){
      U.toast('Initialize the campaign first.');
      view = 'dashboard';
    }
    this.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${view}`);
    if(target) target.classList.add('active');

    // bottom nav active state
    document.querySelectorAll('.navbtn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === view || (btn.dataset.target === 'more' && this.moreTabs.includes(view)));
    });

    this._render(view);
    document.getElementById('viewsContainer').scrollTop = 0;
    window.scrollTo(0,0);
    this._closeSheet();
  },

  _render(view){
    switch(view){
      case 'dashboard': Dashboard.render(); break;
      case 'checkin': Checkin.render(U.todayStr()); break;
      case 'workout': Workout.render(U.todayStr()); break;
      case 'nutrition': Nutrition.render(); break;
      case 'progress': Progress.render(); break;
      case 'calendar': Calendar.render(); break;
      case 'photos': Photos.render(); break;
      case 'coach': Coach.render(); break;
      case 'settings': Settings.render(); break;
    }
  },

  refreshHeader(){
    // re-render dashboard stats silently if user is elsewhere too (streak/day label)
    const settings = Store.getSettings();
    const started = U.isMissionStarted();
    const streak = started ? U.computeStreak() : 0;
    document.getElementById('streakCount').textContent = streak;
    const dayX = U.missionDayCapped(settings.missionDays);
    document.getElementById('headerDayLabel').textContent = started ? `Mission Day ${dayX}` : 'Mission Awaiting Start';
    if(this.currentView === 'dashboard') Dashboard.render();
  },


  startMission(){
    if(!Store.isOperatorInitialized()){ Onboarding.start(); return; }
    const settings = Store.getSettings();
    const message = `Initialize Phase I: Awakening?

Today becomes Day 1. The phase remains active until its clearance requirements are met.`;
    if(!confirm(message)) return;
    this._runInitialization(() => {
      U.startMission();
      const campaign = Store.getActiveCampaign();
      Store.saveCampaign({ ...campaign, status:'active', startedAt:new Date().toISOString(), completedAt:null });
      U.toast('Campaign active. Day 1 begins now.');
      this.refreshHeader();
      this.navigate('dashboard');
    });
  },

  _runInitialization(onComplete){
    const overlay=document.createElement('div');
    overlay.className='system-boot-overlay';
    overlay.innerHTML=`<div class="system-boot-core"><span>SYSTEM INITIALIZATION</span><b id="systemBootCount">3</b><small>Phase I · Awakening</small></div>`;
    document.body.appendChild(overlay);
    let count=3;
    const tick=()=>{
      const el=document.getElementById('systemBootCount');
      if(el) el.textContent=count>0?count:'ACTIVE';
      if(count===0){ setTimeout(()=>{ overlay.remove(); onComplete(); },650); return; }
      count-=1; setTimeout(tick,650);
    };
    requestAnimationFrame(()=>overlay.classList.add('show'));
    tick();
  },

  resetMissionStart(){
    if(!confirm('Return the active campaign to the pre-start state? Existing logs will remain stored, but the mission counter will restart only when you press Start again.')) return;
    U.resetMissionStart();
    const campaign = Store.getActiveCampaign();
    Store.saveCampaign({ ...campaign, status:'ready', startedAt:null, completedAt:null });
    Store.saveAppState({ lastBriefDate:null });
    U.toast('Campaign returned to awaiting start.');
    this.refreshHeader();
    this.navigate('dashboard');
  },


  _scheduleDailyBrief(){
    if(!U.isMissionStarted()) return;
    const state = Store.getAppState();
    const today = U.todayStr();
    if(state.lastBriefDate === today) return;
    setTimeout(() => this.showDailyBrief(), 850);
  },

  showDailyBrief(){
    if(!U.isMissionStarted()) return;
    const brief = U.getDailyBrief(Store.getSettings());
    document.querySelector('.daily-brief-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'daily-brief-overlay';
    const delay = brief.etaDelay === Infinity ? 'Awaiting data' : brief.etaDelay === 0 ? 'On schedule' : `${brief.etaDelay} day${brief.etaDelay === 1 ? '' : 's'} delayed`;
    const command = brief.priority
      ? `<button class="daily-brief-command" data-destination="${brief.priority.destination}"><span>PRIMARY COMMAND</span><b>${brief.priority.title}</b><small>${brief.priority.detail}</small></button>`
      : `<div class="daily-brief-command cleared"><span>PRIMARY COMMAND</span><b>Return tomorrow. Repeat the standard.</b></div>`;
    overlay.innerHTML = `<section class="daily-brief-panel">
      <button class="daily-brief-close" aria-label="Close">×</button>
      <span class="eyebrow">ASCEND · DAILY BRIEF</span>
      <h2>${brief.campaignName}</h2>
      <div class="daily-brief-meta"><span>DAY ${brief.day}</span><span>PHASE ${brief.phaseName}</span><span>${brief.phaseState}</span></div>
      <div class="daily-brief-score"><b>${brief.score}</b><span>/100 execution</span></div>
      <p>${brief.tone}</p>
      ${command}
      <div class="daily-brief-footer"><span>ETA</span><b>${delay}</b><span>RECOVERY</span><b>${brief.recovery.state}</b></div>
    </section>`;
    document.body.appendChild(overlay);
    const close = () => { Store.saveAppState({ lastBriefDate:U.todayStr() }); overlay.classList.remove('show'); setTimeout(()=>overlay.remove(),220); };
    overlay.querySelector('.daily-brief-close').onclick = close;
    overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
    const cmd = overlay.querySelector('.daily-brief-command[data-destination]');
    if(cmd) cmd.onclick = () => { const dest=cmd.dataset.destination; close(); setTimeout(()=>this.navigate(dest),230); };
    requestAnimationFrame(()=>overlay.classList.add('show'));
  },


  advancePhase(){
    const next=U.advancePhase();
    if(!next){ U.toast('Phase requirements are incomplete.'); return; }
    const overlay=document.createElement('div');
    overlay.className='system-boot-overlay phase-clear-overlay';
    overlay.innerHTML=`<div class="system-boot-core"><span>PHASE CLEARED</span><b>${next.number}</b><small>${next.name} UNLOCKED</small></div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>overlay.classList.add('show'));
    setTimeout(()=>{overlay.remove();U.toast(`Phase ${next.number} active.`);this.refreshHeader();this.navigate('dashboard');},1800);
  },

  completeCampaign(){
    const summary=U.completeCampaign();
    if(!summary){ U.toast('Campaign completion requirements are incomplete.'); return; }
    const campaign=Store.getActiveCampaign();
    const name=prompt('Campaign archived. Name the next campaign:', 'Next Ascension');
    if(!name){ U.toast('Campaign archived. Create the next campaign from Settings.'); this.navigate('settings'); return; }
    const settings=Store.getSettings();
    const next=Store.createCampaign({name:name.trim(),type:'custom',startWeight:U.getLatestWeight()?.weight||settings.startWeight,goalWeight:settings.goalWeight,requestedDays:settings.missionDays,phases:DEFAULT_PHASES.map(p=>({...p}))});
    U.resetMissionStart();
    Store.saveSettings({projectName:next.name,startWeight:next.startWeight});
    Store.saveAppState({lastBriefDate:null});
    this.refreshHeader(); this.navigate('dashboard');
  },

  createCampaign(){
    const name=prompt('Campaign designation:', 'New Campaign');
    if(!name||!name.trim()) return;
    const settings=Store.getSettings();
    const current=U.getLatestWeight()?.weight||settings.startWeight;
    const target=Number(prompt('Target weight (kg):', String(settings.goalWeight)));
    if(!Number.isFinite(target)||target<25){ U.toast('Invalid target.'); return; }
    const campaign=Store.createCampaign({name:name.trim(),type:target<current?'fat-loss':target>current?'gain':'recomposition',startWeight:current,goalWeight:target,requestedDays:settings.missionDays,phases:DEFAULT_PHASES.map(p=>({...p}))});
    U.resetMissionStart();
    Store.saveSettings({projectName:campaign.name,startWeight:current,goalWeight:target});
    Store.saveAppState({lastBriefDate:null});
    U.toast('New campaign generated.'); this.refreshHeader(); this.navigate('dashboard');
  },

  _bindNav(){
    document.querySelectorAll('.navbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        if(btn.dataset.target === 'more'){
          this._openSheet();
        } else {
          this.navigate(btn.dataset.target);
        }
      });
    });
  },

  _bindSheet(){
    document.querySelectorAll('.sheet-item').forEach(item => {
      item.addEventListener('click', () => {
        if(item.dataset.target){
          this.navigate(item.dataset.target);
        } else if(item.dataset.action === 'export'){
          this._closeSheet();
          Settings._export();
        }
      });
    });
    document.getElementById('moreBackdrop').addEventListener('click', () => this._closeSheet());
  },

  _openSheet(){
    document.getElementById('moreBackdrop').classList.add('show');
    document.getElementById('moreSheet').classList.add('show');
  },
  _closeSheet(){
    document.getElementById('moreBackdrop').classList.remove('show');
    document.getElementById('moreSheet').classList.remove('show');
  },

  _hideSplash(){
    const splash = document.getElementById('splash');
    const app = document.getElementById('app');
    app.classList.remove('hidden');
    setTimeout(() => {
      splash.classList.add('hidden');
    }, 550);
  },

  _registerSW(){
    if('serviceWorker' in navigator){
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(err => {
          console.warn('Service worker registration failed', err);
        });
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
