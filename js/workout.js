/* ==========================================================================
   MISSION 89 — Workout
   ========================================================================== */
const Workout = {
  activeDate: U.todayStr(),

  render(dateStr){
    if(dateStr) this.activeDate = dateStr;
    const date = this.activeDate;
    const workout = getWorkoutForDate(date);
    const log = Store.getWorkoutDay(date);
    const doneCount = workout.exercises.filter(e => log.exercises[e.id]).length;
    const total = workout.exercises.length;
    const pct = total ? Math.round((doneCount/total)*100) : 0;
    const isRest = workout.tag === 'REST';

    // 7-day scroller centered on this week
    const scroller = this._buildScroller(date);

    let exList = '';
    workout.exercises.forEach((ex, i) => {
      const checked = !!log.exercises[ex.id];
      exList += `
        <div class="card exercise-card" style="animation-delay:${i*0.03}s">
          <div class="exercise-top">
            <div>
              <div class="exercise-name">${ex.name}</div>
              <div class="exercise-meta">${ex.sets} sets × ${ex.reps}</div>
            </div>
            <div class="checkbox ${checked?'checked':''}" data-id="${ex.id}">
              <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="3"/></svg>
            </div>
          </div>
        </div>`;
    });

    const html = `
      <div>
        <div class="page-title">Train</div>
        <div class="page-sub">${U.prettyDateFull(date)}</div>
      </div>

      ${scroller}

      <div class="card" style="padding:18px;">
        <div class="flex-between">
          <div>
            <span class="eyebrow">${date === U.todayStr() ? "Today's Split" : 'Split'}</span>
            <div style="font-size:20px;font-weight:800;margin-top:4px;">${workout.title}</div>
            <div class="page-sub" style="margin-top:2px;">${workout.sub}</div>
          </div>
          <div class="workout-preview-tag" style="width:44px;height:44px;font-size:15px;">${workout.tag.slice(0,2)}</div>
        </div>
        <div class="workout-progress-bar mt-12">
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span class="text-dim num" style="font-size:12px;font-weight:800;">${doneCount}/${total}</span>
        </div>
      </div>

      ${isRest ? `
      <div class="card rest-card">
        <div class="rest-icon">${cardioIcon()}</div>
        <div style="font-weight:800;font-size:15px;">Recovery Day</div>
        <div class="text-dim" style="font-size:13px;">Keep it light. Mobility and blood flow — no heavy lifting today.</div>
      </div>` : ''}

      <span class="section-label">${isRest ? 'Recovery Activities' : 'Exercises'}</span>
      <div class="stagger">${exList}</div>
    `;

    document.getElementById('workoutContent').innerHTML = html;
    this._bind();
  },

  _buildScroller(activeDate){
    // show a rolling window: 3 days before to 3 days after active date
    let items = '';
    for(let i=-3; i<=3; i++){
      const d = U.addDays(activeDate, i);
      const w = getWorkoutForDate(d);
      const isActive = d === activeDate;
      const isToday = d === U.todayStr();
      items += `
        <button class="day-pill ${isActive?'active':''}" data-date="${d}">
          <b>${U.parseDate(d).getDate()}</b>
          <span>${isToday ? 'Today' : U.shortDay(d)}</span>
        </button>`;
    }
    return `<div class="day-scroller">${items}</div>`;
  },

  _bind(){
    document.querySelectorAll('.day-pill').forEach(btn=>{
      btn.onclick = () => this.render(btn.dataset.date);
    });
    document.querySelectorAll('.checkbox').forEach(box=>{
      box.onclick = () => {
        Store.toggleExercise(this.activeDate, box.dataset.id);
        box.classList.toggle('checked');
        // recompute progress bar without full re-render for snappy feel
        const workout = getWorkoutForDate(this.activeDate);
        const log = Store.getWorkoutDay(this.activeDate);
        const doneCount = workout.exercises.filter(e => log.exercises[e.id]).length;
        const total = workout.exercises.length;
        const pct = total ? Math.round((doneCount/total)*100) : 0;
        const fill = document.querySelector('.workout-progress-bar .bar-fill');
        const label = document.querySelector('.workout-progress-bar .num');
        if(fill) fill.style.width = pct + '%';
        if(label) label.textContent = `${doneCount}/${total}`;

        // auto-mark workoutDone on today's checkin if all exercises complete
        if(this.activeDate === U.todayStr() && doneCount === total && total > 0){
          Store.saveCheckin(this.activeDate, { workoutDone: true });
          U.toast('Workout complete 💪');
        }
      };
    });
  }
};
