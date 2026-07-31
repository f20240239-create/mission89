/* ==========================================================================
   MISSION 89 — Calendar
   ========================================================================== */
const Calendar = {
  cursor: new Date(),

  render(){
    const year = this.cursor.getFullYear();
    const month = this.cursor.getMonth();
    const today = U.todayStr();
    const checkins = Store.getCheckins();

    const monthLabel = this.cursor.toLocaleDateString('en-US', { month:'long', year:'numeric' });
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month+1, 0).getDate();

    const dowRow = ['S','M','T','W','T','F','S'].map(d=>`<div class="cal-dow">${d}</div>`).join('');

    let cells = '';
    for(let i=0;i<startOffset;i++) cells += `<div class="cal-cell empty"></div>`;
    for(let d=1; d<=daysInMonth; d++){
      const dateStr = U.toDateStr(new Date(year, month, d));
      const isFuture = dateStr > today;
      const isToday = dateStr === today;
      const checkin = checkins[dateStr];
      const grade = checkin ? U.dayGrade(checkin) : null;
      let cls = 'cal-cell';
      if(isFuture) cls += ' future';
      else if(grade) cls += ` ${grade}`;
      if(isToday) cls += ' today';
      cells += `<div class="${cls}">${d}</div>`;
    }

    // month stats
    const monthDates = [];
    for(let d=1; d<=daysInMonth; d++) monthDates.push(U.toDateStr(new Date(year, month, d)));
    const loggedInMonth = monthDates.filter(d => checkins[d] && d <= today);
    const greenCount = loggedInMonth.filter(d => U.dayGrade(checkins[d]) === 'green').length;
    const yellowCount = loggedInMonth.filter(d => U.dayGrade(checkins[d]) === 'yellow').length;
    const redCount = loggedInMonth.filter(d => U.dayGrade(checkins[d]) === 'red').length;

    const html = `
      <div>
        <div class="page-title">Calendar</div>
        <div class="page-sub">Consistency at a glance</div>
      </div>

      <div class="card">
        <div class="flex-between">
          <button class="icon-btn" id="calPrev">‹</button>
          <span style="font-weight:800;font-size:15px;">${monthLabel}</span>
          <button class="icon-btn" id="calNext">›</button>
        </div>
        <div class="cal-grid mt-12">
          ${dowRow}
          ${cells}
        </div>
      </div>

      <div class="card cal-legend">
        <div class="cal-legend-item"><span class="cal-dot" style="background:var(--emerald);"></span>Perfect (${greenCount})</div>
        <div class="cal-legend-item"><span class="cal-dot" style="background:var(--yellow);"></span>Good (${yellowCount})</div>
        <div class="cal-legend-item"><span class="cal-dot" style="background:var(--red);"></span>Missed (${redCount})</div>
      </div>
    `;

    document.getElementById('calendarContent').innerHTML = html;

    document.getElementById('calPrev').onclick = () => { this.cursor = new Date(year, month-1, 1); this.render(); };
    document.getElementById('calNext').onclick = () => { this.cursor = new Date(year, month+1, 1); this.render(); };
  }
};
