/* ==========================================================================
   MISSION 89 — Daily Check-in
   ========================================================================== */
const Checkin = {
  activeDate: U.todayStr(),
  _saveTimer: null,

  render(dateStr){
    if(dateStr) this.activeDate = dateStr;
    const date = this.activeDate;
    const checkin = Store.getCheckin(date) || {};
    const settings = Store.getSettings();
    const isToday = date === U.todayStr();
    const isFuture = U.daysBetween(date, U.todayStr()) < 0;

    const html = `
      <div class="checkin-header flex-between">
        <div>
          <div class="page-title">Daily Check-in</div>
          <div class="page-sub">${isToday ? 'Today' : U.prettyDateFull(date)}</div>
        </div>
        <div class="flex-row">
          <button class="icon-btn" id="ciPrev" style="color:var(--text-2);">‹</button>
          <button class="icon-btn" id="ciNext" style="color:var(--text-2);" ${isToday?'disabled':''}>›</button>
        </div>
      </div>

      <div class="card checkin-group stagger">
        <span class="section-label" style="margin:0 0 -2px 0;">Body</span>
        <div class="field">
          <label class="field-label">Weight <span class="hint">kg</span></label>
          <input type="number" inputmode="decimal" step="0.1" class="input" id="f_weight" placeholder="e.g. 92.4" value="${checkin.weight ?? ''}">
        </div>
        <div class="field">
          <label class="field-label">Sleep <span class="hint">hours</span></label>
          <div class="stepper">
            <button data-step="-0.5" data-target="f_sleep">−</button>
            <input type="number" inputmode="decimal" id="f_sleep" value="${checkin.sleep ?? ''}" placeholder="0">
            <button data-step="0.5" data-target="f_sleep">+</button>
          </div>
        </div>
      </div>

      <div class="card checkin-group stagger">
        <span class="section-label" style="margin:0 0 -2px 0;">Nutrition</span>
        <div class="field">
          <label class="field-label">Calories <span class="hint">target ${settings.calorieTarget} kcal</span></label>
          <input type="number" inputmode="numeric" class="input" id="f_calories" placeholder="e.g. 2100" value="${checkin.calories ?? ''}">
        </div>
        <div class="field">
          <label class="field-label">Protein <span class="hint">target ${settings.proteinTarget} g</span></label>
          <input type="number" inputmode="numeric" class="input" id="f_protein" placeholder="e.g. 165" value="${checkin.protein ?? ''}">
        </div>
        <div class="field">
          <label class="field-label">Water <span class="hint">target ${settings.waterTarget} L</span></label>
          <div class="stepper">
            <button data-step="-0.25" data-target="f_water">−</button>
            <input type="number" inputmode="decimal" id="f_water" value="${checkin.water ?? ''}" placeholder="0">
            <button data-step="0.25" data-target="f_water">+</button>
          </div>
        </div>
      </div>

      <div class="card checkin-group stagger">
        <span class="section-label" style="margin:0 0 -2px 0;">Activity</span>
        <div class="field">
          <label class="field-label">Steps <span class="hint">target ${settings.stepTarget}</span></label>
          <input type="number" inputmode="numeric" class="input" id="f_steps" placeholder="e.g. 8500" value="${checkin.steps ?? ''}">
        </div>
      </div>

      <div class="card checkin-group stagger">
        <span class="section-label" style="margin:0 0 -2px 0;">Today</span>
        <div class="toggle-row" id="row_workout">
          <div class="toggle-label">${ICONS.bolt}<span>Workout completed</span></div>
          <div class="switch ${checkin.workoutDone ? 'on':''}" id="sw_workout"></div>
        </div>
        <div class="toggle-row" id="row_cardio">
          <div class="toggle-label">${cardioIcon()}<span>Cardio completed</span></div>
          <div class="switch ${checkin.cardioDone ? 'on':''}" id="sw_cardio"></div>
        </div>
        <div class="toggle-row" id="row_cheat">
          <div class="toggle-label">${cheatIcon()}<span>Cheat meal</span></div>
          <div class="switch ${checkin.cheatMeal ? 'on':''}" id="sw_cheat"></div>
        </div>
      </div>

      <div class="checkin-save-bar">
        <button class="btn btn-primary" id="ciSaveBtn">${ICONS.plus.replace('18px','16px')} Save Check-in</button>
      </div>
    `;

    document.getElementById('checkinContent').innerHTML = html;
    this._bind();
  },

  _bind(){
    const date = this.activeDate;

    document.getElementById('ciPrev').onclick = () => this.render(U.addDays(this.activeDate, -1));
    document.getElementById('ciNext').onclick = () => {
      if(U.daysBetween(this.activeDate, U.todayStr()) > 0) this.render(U.addDays(this.activeDate, 1));
    };

    document.querySelectorAll('.stepper button').forEach(btn=>{
      btn.onclick = () => {
        const target = document.getElementById(btn.dataset.target);
        const step = parseFloat(btn.dataset.step);
        let val = parseFloat(target.value) || 0;
        val = Math.max(0, U.round1(val + step));
        target.value = val;
        this._autoSave();
      };
    });

    ['sw_workout','sw_cardio','sw_cheat'].forEach(id=>{
      document.getElementById(id).onclick = (e) => {
        e.currentTarget.classList.toggle('on');
        this._autoSave();
      };
    });

    ['f_weight','f_sleep','f_calories','f_protein','f_water','f_steps'].forEach(id=>{
      const el = document.getElementById(id);
      el.addEventListener('input', ()=> this._autoSave());
    });

    document.getElementById('ciSaveBtn').onclick = () => {
      this._save();
      U.toast('Check-in saved ✓');
      if(typeof App !== 'undefined') App.refreshHeader();
    };
  },

  _autoSave(){
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(()=> {
      this._save();
      if(typeof App !== 'undefined') App.refreshHeader();
    }, 500);
  },

  _save(){
    const num = (id) => {
      const v = document.getElementById(id).value;
      return v === '' ? null : parseFloat(v);
    };
    const data = {
      weight: num('f_weight'),
      sleep: num('f_sleep'),
      calories: num('f_calories'),
      protein: num('f_protein'),
      water: num('f_water'),
      steps: num('f_steps'),
      workoutDone: document.getElementById('sw_workout').classList.contains('on'),
      cardioDone: document.getElementById('sw_cardio').classList.contains('on'),
      cheatMeal: document.getElementById('sw_cheat').classList.contains('on')
    };
    Store.saveCheckin(this.activeDate, data);

    // capture start weight automatically if not set
    const settings = Store.getSettings();
    if(!settings.startWeight && data.weight != null){
      Store.saveSettings({ startWeight: data.weight });
    }
  }
};

function cardioIcon(){
  return '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
}
function cheatIcon(){
  return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M8 15c1.5 1.5 6.5 1.5 8 0"/></svg>';
}
