/* ==========================================================================
   MISSION 89 — Progress
   ========================================================================== */
const Progress = {
  render(){
    const settings = Store.getSettings();
    const checkins = Store.getCheckins();
    const meta = Store.getMeta();

    const weightEntries = Object.values(checkins)
      .filter(c => c.weight != null)
      .sort((a,b) => a.date.localeCompare(b.date));

    const chart = this._buildChart(weightEntries, settings);

    // weekly average (last 7 logged entries)
    const last7 = weightEntries.slice(-7);
    const weeklyAvg = last7.length ? U.round1(last7.reduce((s,e)=>s+e.weight,0)/last7.length) : null;

    // estimated finish weight via linear regression on day-index vs weight
    const finish = this._estimateFinish(weightEntries, settings);

    // consistency %: days with a checkin logged / days elapsed since mission start
    const elapsed = Math.max(1, U.missionDayCapped(settings.missionDays));
    const loggedDays = Object.keys(checkins).filter(d => U.daysBetween(meta.startDate || d, d) >= 0).length;
    const consistency = Math.round(U.clamp(loggedDays / elapsed, 0, 1) * 100);

    const historyHtml = weightEntries.slice().reverse().slice(0,14).map((e,i,arr) => {
      const prev = weightEntries[weightEntries.indexOf(e)-1];
      let delta = '', cls='flat', sign='';
      if(prev){
        const d = U.round1(e.weight - prev.weight);
        cls = d < 0 ? 'down' : d > 0 ? 'up' : 'flat';
        sign = d > 0 ? '+' : '';
        delta = `${sign}${d} kg`;
      } else {
        delta = 'Start';
      }
      return `
        <div class="history-row">
          <span class="history-date">${U.prettyDate(e.date)}</span>
          <span class="history-weight num">${U.formatNum(e.weight,1)} kg</span>
          <span class="history-delta ${cls}">${delta}</span>
        </div>`;
    }).join('');

    const html = `
      <div>
        <div class="page-title">Progress</div>
        <div class="page-sub">Your transformation, tracked</div>
      </div>

      <div class="card chart-card">
        <div class="chart-head">
          <span class="section-label" style="margin:0;">Weight Trend</span>
          <span class="text-dim num" style="font-size:12px;font-weight:800;">${weightEntries.length} entries</span>
        </div>
        <div class="chart-svg-wrap">${chart}</div>
      </div>

      <div class="stat-tiles">
        <div class="card stat-tile">
          <b class="num">${weeklyAvg != null ? weeklyAvg+' kg' : '—'}</b>
          <span>Weekly Average</span>
        </div>
        <div class="card stat-tile">
          <b class="num">${finish != null ? finish+' kg' : '—'}</b>
          <span>Est. Finish Weight</span>
        </div>
        <div class="card stat-tile">
          <b class="num">${consistency}%</b>
          <span>Consistency</span>
        </div>
        <div class="card stat-tile">
          <b class="num">${U.computeStreak()}</b>
          <span>Day Streak</span>
        </div>
      </div>

      <span class="section-label">History</span>
      <div class="card" style="padding:6px 14px;">
        ${historyHtml || `<div class="empty-state">${ICONS.bolt}<b>No entries yet</b><span>Log your weight in Check-in to start tracking.</span></div>`}
      </div>
    `;

    document.getElementById('progressContent').innerHTML = html;
  },

  _buildChart(entries, settings){
    const w = 520, h = 200, pad = 24;
    if(entries.length < 2){
      return `<div class="empty-state">${ICONS.bolt}<b>Not enough data</b><span>Log your weight for a few days to see your trend line.</span></div>`;
    }
    const weights = entries.map(e=>e.weight);
    const minW = Math.min(...weights, settings.goalWeight) - 1;
    const maxW = Math.max(...weights, settings.goalWeight) + 1;
    const range = maxW - minW || 1;

    const stepX = (w - pad*2) / (entries.length - 1);
    const points = entries.map((e,i) => {
      const x = pad + i*stepX;
      const y = pad + (1 - (e.weight - minW)/range) * (h - pad*2);
      return [x,y];
    });

    const pathD = points.map((p,i) => (i===0?'M':'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const areaD = pathD + ` L${points[points.length-1][0].toFixed(1)},${h-pad} L${points[0][0].toFixed(1)},${h-pad} Z`;

    const goalY = pad + (1 - (settings.goalWeight - minW)/range) * (h - pad*2);

    const dots = points.map((p,i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i===points.length-1?4.5:2.6}" fill="${i===points.length-1?'#3ddc9a':'#10b981'}" stroke="#08090a" stroke-width="1.5"/>`).join('');

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;overflow:visible;">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <line x1="${pad}" y1="${goalY}" x2="${w-pad}" y2="${goalY}" stroke="#eab308" stroke-width="1.4" stroke-dasharray="4 5" opacity="0.7"/>
        <text x="${w-pad}" y="${goalY-6}" text-anchor="end" font-size="10" font-weight="700" fill="#eab308">GOAL ${settings.goalWeight}kg</text>
        <path d="${areaD}" fill="url(#areaGrad)"/>
        <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
        ${dots}
      </svg>`;
  },

  _estimateFinish(entries, settings){
    if(entries.length < 2) return null;
    const meta = Store.getMeta();
    const startDate = meta.startDate || entries[0].date;
    const xs = entries.map(e => U.daysBetween(startDate, e.date));
    const ys = entries.map(e => e.weight);
    const n = xs.length;
    const sumX = xs.reduce((a,b)=>a+b,0), sumY = ys.reduce((a,b)=>a+b,0);
    const sumXY = xs.reduce((s,x,i)=>s+x*ys[i],0);
    const sumXX = xs.reduce((s,x)=>s+x*x,0);
    const denom = (n*sumXX - sumX*sumX);
    if(denom === 0) return null;
    const slope = (n*sumXY - sumX*sumY) / denom;
    const intercept = (sumY - slope*sumX) / n;
    const finishX = settings.missionDays - 1;
    const projected = slope*finishX + intercept;
    return U.round1(projected);
  }
};
