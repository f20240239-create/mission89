/* ==========================================================================
   MISSION 89 — Nutrition
   ========================================================================== */
const MEAL_DB = [
  { name:'Grilled Chicken Breast + Rice', calories:520, protein:52, tag:'High Protein', icon:'meat' },
  { name:'Greek Yogurt + Berries + Honey', calories:280, protein:24, tag:'Quick', icon:'bowl' },
  { name:'Whey Protein Shake + Banana', calories:260, protein:30, tag:'Fast', icon:'shake' },
  { name:'Salmon + Sweet Potato + Greens', calories:610, protein:44, tag:'Omega-3', icon:'fish' },
  { name:'Egg White Omelette + Oats', calories:390, protein:34, tag:'Breakfast', icon:'egg' },
  { name:'Steak + Roasted Vegetables', calories:650, protein:56, tag:'High Protein', icon:'meat' },
  { name:'Cottage Cheese + Almonds', calories:300, protein:28, tag:'Snack', icon:'bowl' },
  { name:'Turkey Wrap + Side Salad', calories:450, protein:38, tag:'Lunch', icon:'wrap' },
  { name:'Tofu Stir-Fry + Brown Rice', calories:480, protein:30, tag:'Plant-Based', icon:'bowl' },
  { name:'Protein Bar + Apple', calories:240, protein:20, tag:'On-the-go', icon:'shake' },
  { name:'Tuna Salad + Whole Grain Toast', calories:400, protein:36, tag:'Lunch', icon:'fish' },
  { name:'Beef Mince + Pasta', calories:600, protein:42, tag:'Dinner', icon:'meat' }
];

const MEAL_ICONS = {
  meat:'<svg viewBox="0 0 24 24"><path d="M8 15c-3-3-3-8 1-11 2 1 6 5 6 9a5 5 0 0 1-7 2z"/><path d="M6 17l-2 4"/></svg>',
  bowl:'<svg viewBox="0 0 24 24"><path d="M3 12h18a9 6 0 0 1-18 0z"/><path d="M12 12V6"/></svg>',
  shake:'<svg viewBox="0 0 24 24"><path d="M8 2h8l-1 6H9L8 2z"/><path d="M8 8l1 13h6l1-13"/></svg>',
  fish:'<svg viewBox="0 0 24 24"><path d="M3 12s4-5 10-5 8 5 8 5-2 5-8 5-10-5-10-5z"/><circle cx="17" cy="11" r=".6"/></svg>',
  egg:'<svg viewBox="0 0 24 24"><path d="M12 3C8 8 6 12 6 15a6 6 0 0 0 12 0c0-3-2-7-6-12z"/></svg>',
  wrap:'<svg viewBox="0 0 24 24"><path d="M4 6l16 6-16 6z"/></svg>'
};

const Nutrition = {
  render(){
    const settings = Store.getSettings();
    const today = U.todayStr();
    const checkin = Store.getCheckin(today) || {};
    const cal = checkin.calories || 0;
    const pro = checkin.protein || 0;
    const water = checkin.water || 0;

    const calRemain = Math.max(0, settings.calorieTarget - cal);
    const proRemain = Math.max(0, settings.proteinTarget - pro);
    const waterRemain = Math.max(0, settings.waterTarget - water);

    const rings = [
      { label:'Calories', val:cal, target:settings.calorieTarget, unit:'kcal', color:'var(--emerald)' },
      { label:'Protein', val:pro, target:settings.proteinTarget, unit:'g', color:'var(--emerald-light)' },
      { label:'Water', val:water, target:settings.waterTarget, unit:'L', color:'var(--blue)' }
    ];

    let ringsHtml = '';
    rings.forEach(r=>{
      const rad = 33;
      const c = U.circumference(rad);
      const pct = r.target ? U.clamp(r.val/r.target,0,1) : 0;
      const offset = U.ringOffset(rad, pct);
      ringsHtml += `
        <div>
          <div class="macro-ring">
            <svg viewBox="0 0 80 80">
              <circle class="macro-ring-track" cx="40" cy="40" r="${rad}"></circle>
              <circle class="macro-ring-fill" cx="40" cy="40" r="${rad}" stroke="${r.color}"
                stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle>
            </svg>
            <div class="macro-ring-center">
              <b class="num">${U.formatNum(r.val, r.unit==='L'?1:0)}</b>
              <span>/ ${U.formatNum(r.target, r.unit==='L'?1:0)}${r.unit==='L'?'L':''}</span>
            </div>
          </div>
          <div class="macro-ring-name">${r.label}</div>
        </div>`;
    });

    const suggestions = this._suggestMeals(calRemain, proRemain);
    let mealsHtml = suggestions.map(m => `
      <div class="card meal-card">
        <div class="meal-icon">${MEAL_ICONS[m.icon]}</div>
        <div class="meal-body">
          <div class="meal-name">${m.name}</div>
          <div class="meal-macro">${m.calories} kcal · ${m.protein}g protein</div>
          <span class="meal-tag">${m.tag}</span>
        </div>
      </div>
    `).join('');

    if(suggestions.length === 0){
      mealsHtml = `
        <div class="card empty-state">
          ${ICONS.bolt}
          <b>Targets hit</b>
          <span>You've covered your calories and protein for today. Nice work.</span>
        </div>`;
    }

    const html = `
      <div>
        <div class="page-title">Fuel</div>
        <div class="page-sub">${U.prettyDateFull(today)}</div>
      </div>

      <div class="card">
        <span class="section-label" style="margin:0;">Today's Macros</span>
        <div class="macro-ring-row">${ringsHtml}</div>
      </div>

      <div class="two-col">
        <div class="card stat-tile">
          <b class="num">${U.formatNum(calRemain)}</b>
          <span>Calories Left</span>
        </div>
        <div class="card stat-tile">
          <b class="num">${U.formatNum(proRemain)}g</b>
          <span>Protein Left</span>
        </div>
      </div>

      <span class="section-label">Suggested Meals</span>
      <div class="stagger" style="display:flex;flex-direction:column;gap:12px;">${mealsHtml}</div>

      <button class="btn btn-ghost" onclick="App.navigate('checkin')">${ICONS.plus.replace('18px','16px')} Log Nutrition</button>
    `;

    document.getElementById('nutritionContent').innerHTML = html;
  },

  _suggestMeals(calRemain, proRemain){
    if(calRemain <= 50) return [];
    return MEAL_DB
      .filter(m => m.calories <= calRemain + 100)
      .map(m => ({ ...m, score: (m.protein / Math.max(m.calories,1)) * Math.min(m.protein, proRemain || m.protein) }))
      .sort((a,b) => b.score - a.score)
      .slice(0,4);
  }
};
