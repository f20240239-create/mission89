/* ==========================================================================
   MISSION 89 — App Controller
   ========================================================================== */
const App = {
  currentView: 'dashboard',
  primaryTabs: ['dashboard','workout','checkin','nutrition'],
  moreTabs: ['progress','calendar','photos','coach','settings'],

  init(){
    U.ensureMissionStarted();
    this._bindNav();
    this._bindSheet();
    this.navigate('dashboard');
    this._registerSW();
    this._hideSplash();
  },

  navigate(view){
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
    const streak = U.computeStreak();
    document.getElementById('streakCount').textContent = streak;
  const dayX = U.missionDayCapped(settings.missionDays);
    document.getElementById('headerDayLabel').textContent = `Mission Day ${dayX}`;
    if(this.currentView === 'dashboard') Dashboard.render();
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
