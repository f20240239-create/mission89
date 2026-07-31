/* ==========================================================================
   MISSION 89 — Coach
   Rule-based daily coaching generated entirely on-device from logged data.
   ========================================================================== */
const Coach = {
  render(){
    const settings = Store.getSettings();
    const today = U.todayStr();
    const checkin = Store.getCheckin(today);
    const score = U.computeDayScore(checkin, settings);
    const streak = U.computeStreak();
    const checkins = Store.getCheckins();
    const weightEntries = Object.values(checkins).filter(c=>c.weight!=null).sort((a,b)=>a.date.localeCompare(b.date));

    const headline = this._headline(checkin, score, streak);
    const insights = this._insights(checkin, settings, weightEntries, streak);

    const html = `
      <div>
        <div class="page-title">Coach</div>
        <div class="page-sub">Feedback generated from your own data</div>
      </div>

      <div class="card coach-hero">
        <div class="coach-avatar">${ICONS.bolt}</div>
        <div class="coach-msg">${headline}</div>
      </div>

      <span class="section-label">Today's Breakdown</span>
      <div class="stagger" style="display:flex;flex-direction:column;gap:10px;">
        ${insights.map(i => `
          <div class="card insight-row insight-${i.type}">
            <div class="insight-icon">${INSIGHT_ICONS[i.type]}</div>
            <div class="insight-text"><b style="color:var(--text-1);">${i.title}</b><br>${i.body}</div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('coachContent').innerHTML = html;
  },

  _headline(checkin, score, streak){
    if(!checkin){
      return `You haven't logged today yet. <b>Log your check-in</b> so I can give you real feedback instead of guessing.`;
    }
    if(score >= 85){
      return `Elite execution today, <b>${score}/100</b>. This is exactly the standard that gets you to 89kg on schedule. Keep stacking days like this.`;
    }
    if(score >= 65){
      return `Solid day — <b>${score}/100</b>. You hit most of your targets. Tighten up the gaps below and this becomes a great day.`;
    }
    if(score >= 40){
      return `Mixed day, <b>${score}/100</b>. Some targets slipped. That's fine once — just don't let it become a pattern. ${streak > 0 ? `Your ${streak}-day streak is still alive.` : ''}`;
    }
    return `Rough day, <b>${score}/100</b>. Everyone has these. What matters is what you do tomorrow — don't let one day turn into three.`;
  },

  _insights(checkin, settings, weightEntries, streak){
    const insights = [];
    if(!checkin){
      insights.push({ type:'warn', title:'No check-in logged', body:'Log your weight, nutrition, and activity for today to unlock personalized coaching.' });
      return insights;
    }

    // Calories
    if(checkin.calories != null){
      const diff = checkin.calories - settings.calorieTarget;
      if(Math.abs(diff) <= settings.calorieTarget * 0.08){
        insights.push({ type:'good', title:'Calories on target', body:`${checkin.calories} kcal logged, right around your ${settings.calorieTarget} kcal target.` });
      } else if(diff > 0){
        insights.push({ type:'warn', title:'Calories over target', body:`You're ${Math.round(diff)} kcal over target. Not a disaster on its own — watch it over the next few days.` });
      } else {
        insights.push({ type:'warn', title:'Calories under target', body:`You're ${Math.round(Math.abs(diff))} kcal under target. Under-eating consistently can stall recovery and strength.` });
      }
    } else {
      insights.push({ type:'bad', title:'Calories not logged', body:'Log your calories so your Mission Score and meal suggestions stay accurate.' });
    }

    // Protein
    if(checkin.protein != null){
      if(checkin.protein >= settings.proteinTarget){
        insights.push({ type:'good', title:'Protein target hit', body:`${checkin.protein}g logged against a ${settings.proteinTarget}g target. Great for recovery and muscle retention.` });
      } else {
        const gap = settings.proteinTarget - checkin.protein;
        insights.push({ type:'warn', title:'Protein short by ' + Math.round(gap) + 'g', body:'Check the Fuel tab for high-protein meal suggestions that fit your remaining calories.' });
      }
    }

    // Water
    if(checkin.water != null){
      if(checkin.water >= settings.waterTarget){
        insights.push({ type:'good', title:'Hydration on point', body:`${checkin.water}L logged. Staying hydrated supports performance and appetite control.` });
      } else {
        insights.push({ type:'warn', title:'Hydration low', body:`${checkin.water}L of ${settings.waterTarget}L target. Keep a bottle at your desk tomorrow.` });
      }
    }

    // Sleep
    if(checkin.sleep != null){
      if(checkin.sleep >= settings.sleepTarget){
        insights.push({ type:'good', title:'Sleep target hit', body:`${checkin.sleep}h logged. Recovery is where the actual adaptation happens.` });
      } else if(checkin.sleep < settings.sleepTarget - 1.5){
        insights.push({ type:'bad', title:'Sleep well short', body:`Only ${checkin.sleep}h logged. This will hit recovery, cravings, and training quality — prioritize it tonight.` });
      } else {
        insights.push({ type:'warn', title:'Sleep slightly short', body:`${checkin.sleep}h vs ${settings.sleepTarget}h target. Try to get to bed a little earlier tonight.` });
      }
    }

    // Steps
    if(checkin.steps != null){
      if(checkin.steps >= settings.stepTarget){
        insights.push({ type:'good', title:'Step target hit', body:`${checkin.steps.toLocaleString()} steps logged — great daily activity outside the gym.` });
      } else {
        insights.push({ type:'warn', title:'Steps below target', body:`${checkin.steps.toLocaleString()} of ${settings.stepTarget.toLocaleString()}. A short evening walk closes the gap.` });
      }
    }

    // Workout
    if(checkin.workoutDone){
      insights.push({ type:'good', title:'Workout completed', body:'Session logged. Consistency in training is the single biggest lever you control.' });
    } else {
      insights.push({ type:'bad', title:'Workout not completed', body:"Today's session isn't marked done yet. Head to Train and check it off once you're finished." });
    }

    // Cheat meal
    if(checkin.cheatMeal){
      insights.push({ type:'warn', title:'Cheat meal logged', body:'One off-plan meal won\'t undo your progress. Just get back on track with the very next meal.' });
    }

    // Weight trend (needs 3+ points)
    if(weightEntries.length >= 3){
      const last3 = weightEntries.slice(-3);
      const trend = last3[2].weight - last3[0].weight;
      if(trend < -0.2){
        insights.push({ type:'good', title:'Weight trending down', body:`Down ${U.round1(Math.abs(trend))}kg over your last 3 logged entries. The plan is working — stay consistent.` });
      } else if(trend > 0.2){
        insights.push({ type:'warn', title:'Weight trending up', body:`Up ${U.round1(trend)}kg over your last 3 entries. Revisit calories and steps over the next few days.` });
      }
    }

    // Streak callout
    if(streak >= 5){
      insights.push({ type:'good', title:`${streak}-day streak`, body:'This is where real transformations happen — in the days that feel routine, not the exciting ones.' });
    }

    return insights;
  }
};

const INSIGHT_ICONS = {
  good:'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  warn:'<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  bad:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
};
