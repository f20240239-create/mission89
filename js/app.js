/* ==========================================================================
   MISSION 89 — App Controller
   ========================================================================== */
const App = {
  currentView: 'dashboard',
  primaryTabs: ['dashboard','workout','checkin','nutrition'],
  moreTabs: ['progress','calendar','photos','coach','settings'],

  init(){
    this._bindNav();
    this._bindSheet();
    this.navigate('dashboard');
    this._registerSW();
    this._hideSplash();
  },

  navigate(view){
    const preStartAllowed = ['dashboard','settings'];
    if(!U.isMissionStarted() && !preStartAllowed.includes(view)){
      U.toast('Start the mission first.');
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
    const settings = Store.getSettings();
    const message = `Begin Phase I: Awakening today?\n\nThe ${settings.missionDays}-day counter starts immediately and cannot be paused.`;
    if(!confirm(message)) return;
    U.startMission();
    U.toast('Mission initialized. Day 1 begins now.');
    this.refreshHeader();
    this.navigate('dashboard');
  },

  resetMissionStart(){
    if(!confirm('Return Mission 89 to the pre-start state? Existing logs will remain stored, but the mission counter will restart only when you press Start again.')) return;
    U.resetMissionStart();
    U.toast('Mission returned to awaiting start.');
    this.refreshHeader();
    this.navigate('dashboard');
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
