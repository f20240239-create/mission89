/* ========================================================================== 
   ASCEND — Training Intelligence
   Detailed set logging, progressive overload, PRs, plateaus and exercise variety.
   ========================================================================== */
const EXERCISE_INTEL = {
  push1:{muscles:['Chest','Triceps'],alternatives:['Dumbbell Bench Press','Machine Chest Press']},
  push2:{muscles:['Upper Chest','Triceps'],alternatives:['Incline Barbell Press','Low-to-High Cable Fly']},
  push3:{muscles:['Shoulders','Triceps'],alternatives:['Seated Dumbbell Press','Machine Shoulder Press']},
  push4:{muscles:['Chest'],alternatives:['Pec Deck','Dumbbell Fly']}, push5:{muscles:['Side Delts'],alternatives:['Cable Lateral Raise','Machine Lateral Raise']},
  push6:{muscles:['Triceps'],alternatives:['Straight-Bar Pushdown','Assisted Dip']}, push7:{muscles:['Triceps'],alternatives:['Skull Crusher','Single-Arm Cable Extension']},
  pull1:{muscles:['Back','Hamstrings'],alternatives:['Rack Pull','Romanian Deadlift']}, pull2:{muscles:['Lats'],alternatives:['Neutral-Grip Pulldown','Assisted Pull-Up']},
  pull3:{muscles:['Mid Back'],alternatives:['Chest-Supported Row','T-Bar Row']}, pull4:{muscles:['Mid Back'],alternatives:['Machine Row','One-Arm Cable Row']},
  pull5:{muscles:['Rear Delts'],alternatives:['Reverse Pec Deck','Rear-Delt Cable Fly']}, pull6:{muscles:['Biceps'],alternatives:['Dumbbell Curl','Preacher Curl']}, pull7:{muscles:['Biceps','Forearms'],alternatives:['Cross-Body Hammer Curl','Cable Rope Curl']},
  legs1:{muscles:['Quads','Glutes'],alternatives:['Hack Squat','Leg Press']}, legs2:{muscles:['Hamstrings','Glutes'],alternatives:['Good Morning','45° Back Extension']},
  legs3:{muscles:['Quads','Glutes'],alternatives:['Hack Squat','Belt Squat']}, legs4:{muscles:['Quads','Glutes'],alternatives:['Bulgarian Split Squat','Step-Up']},
  legs5:{muscles:['Hamstrings'],alternatives:['Seated Leg Curl','Nordic Curl']}, legs6:{muscles:['Calves'],alternatives:['Seated Calf Raise','Leg Press Calf Raise']},
  legs7:{muscles:['Abs'],alternatives:['Reverse Crunch','Captain’s Chair Raise']}, legs8:{muscles:['Abs'],alternatives:['Machine Crunch','Weighted Sit-Up']},
  up1:{muscles:['Upper Chest'],alternatives:['Incline Dumbbell Press','Machine Incline Press']}, up2:{muscles:['Lats'],alternatives:['Neutral-Grip Pulldown','Assisted Pull-Up']},
  up3:{muscles:['Shoulders'],alternatives:['Machine Shoulder Press','Arnold Press']}, up4:{muscles:['Mid Back'],alternatives:['Seated Cable Row','Machine Row']},
  up5:{muscles:['Biceps'],alternatives:['Cable Curl','Preacher Curl']}, up6:{muscles:['Triceps','Chest'],alternatives:['Close-Grip Bench Press','Assisted Dip']},
  low1:{muscles:['Quads'],alternatives:['Hack Squat','Leg Press']}, low2:{muscles:['Glutes'],alternatives:['Glute Bridge','Cable Pull-Through']},
  low3:{muscles:['Quads','Glutes'],alternatives:['Walking Lunge','Step-Up']}, low4:{muscles:['Shoulders'],alternatives:['Dumbbell Shoulder Press','Machine Press']},
  low5:{muscles:['Side Delts'],alternatives:['Dumbbell Lateral Raise','Machine Lateral Raise']}, low6:{muscles:['Calves'],alternatives:['Standing Calf Raise','Leg Press Calf Raise']},
  arm1:{muscles:['Triceps','Chest'],alternatives:['Weighted Dip','Machine Press']}, arm2:{muscles:['Biceps'],alternatives:['EZ-Bar Curl','Cable Curl']},
  arm3:{muscles:['Triceps'],alternatives:['Overhead Cable Extension','Rope Pushdown']}, arm4:{muscles:['Biceps'],alternatives:['Spider Curl','Machine Curl']},
  arm5:{muscles:['Triceps'],alternatives:['Single-Arm Extension','Skull Crusher']}, arm6:{muscles:['Biceps'],alternatives:['Bayesian Cable Curl','Hammer Curl']},
  arm7:{muscles:['Abs'],alternatives:['Cable Crunch','Decline Sit-Up']}, arm8:{muscles:['Obliques'],alternatives:['Cable Woodchop','Pallof Press']}
};

const Workout = {
  activeDate: U.todayStr(),

  render(dateStr){
    if(dateStr) this.activeDate=dateStr;
    const date=this.activeDate;
    const workout=getWorkoutForDate(date);
    const day=Store.getTrainingDay(date);
    const isRest=workout.tag==='REST';
    const completed=workout.exercises.filter(ex=>this._exerciseComplete(day.exercises[ex.id],ex)).length;
    const pct=workout.exercises.length?Math.round(completed/workout.exercises.length*100):0;

    const cards=workout.exercises.map((ex,i)=>this._exerciseCard(ex,day.exercises[ex.id],i)).join('');
    document.getElementById('workoutContent').innerHTML=`
      <div><div class="page-title">Train</div><div class="page-sub">${U.prettyDateFull(date)}</div></div>
      ${this._buildScroller(date)}
      <div class="card training-command-card">
        <div><span class="eyebrow">${isRest?'Recovery Protocol':'Training Protocol'}</span><h2>${workout.title}</h2><p>${workout.sub}</p></div>
        <div class="training-completion"><b>${pct}%</b><span>${completed}/${workout.exercises.length} cleared</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      </div>
      ${isRest?'<div class="card system-note"><b>Recovery is training.</b><span>Keep intensity low. Finish fresher than you started.</span></div>':''}
      <div class="training-toolbar">
        <span class="section-label">${isRest?'Recovery Activities':'Exercises'}</span>
        <button class="btn btn-ghost btn-small" onclick="Workout.showWeeklyVolume()">Weekly Volume</button>
      </div>
      <div class="stagger">${cards}</div>
      <button class="btn btn-primary" onclick="Workout.finishDay()">${day.completed?'Training Logged ✓':'Complete Training Day'}</button>`;
    this._bind();
  },

  _exerciseCard(ex,saved,index){
    const history=Store.getExerciseHistory(ex.id,8);
    const intel=this._analyze(ex,history);
    const sets=this._normalizeSets(saved?.sets,ex.sets);
    const complete=this._exerciseComplete({sets},ex);
    const bodyweight=this._isBodyweight(ex.name);
    const inputs=sets.map((set,i)=>`<div class="set-row">
      <b>${i+1}</b>
      <label>${bodyweight?'Load +/−':'kg'}<input type="number" inputmode="decimal" min="0" step="0.5" data-ex="${ex.id}" data-set="${i}" data-field="weight" value="${set.weight??''}" placeholder="${bodyweight?'0':'kg'}"></label>
      <label>Reps<input type="number" inputmode="numeric" min="0" step="1" data-ex="${ex.id}" data-set="${i}" data-field="reps" value="${set.reps??''}" placeholder="reps"></label>
      <button class="set-check ${set.done?'done':''}" data-ex="${ex.id}" data-set="${i}" aria-label="Complete set">✓</button>
    </div>`).join('');
    const alternatives=(EXERCISE_INTEL[ex.id]?.alternatives||[]).join(' · ');
    return `<article class="card smart-exercise ${complete?'exercise-cleared':''}" style="animation-delay:${index*.025}s">
      <button class="exercise-summary" data-toggle="${ex.id}">
        <span><b>${ex.name}</b><small>${ex.sets} sets × ${ex.reps}</small></span>
        <span class="exercise-target"><small>NEXT TARGET</small><b>${intel.target}</b></span>
        <span class="exercise-state">${complete?'✓':'›'}</span>
      </button>
      <div class="exercise-detail" id="detail-${ex.id}">
        <div class="intel-strip ${intel.plateau?'warning':''}"><span>${intel.message}</span><b>${intel.pr?'PR RANGE · ':''}${intel.confidence} CONFIDENCE</b></div>
        <div class="set-grid">${inputs}</div>
        <textarea class="exercise-note" data-note="${ex.id}" placeholder="Form, pain, machine setting, or anything worth remembering">${saved?.note||''}</textarea>
        ${intel.plateau?`<div class="variety-callout"><b>Plateau detected.</b><span>Do not rotate randomly. First deload or change rep range. If technique is stable, consider: ${alternatives}</span></div>`:''}
        <div class="exercise-history-line"><span>Last: ${intel.last}</span><span>Best e1RM: ${intel.best}</span></div>
      </div>
    </article>`;
  },

  _normalizeSets(sets,count){ return Array.from({length:count},(_,i)=>Object.assign({weight:'',reps:'',done:false},sets?.[i]||{})); },
  _isBodyweight(name){ return /pull-up|dip|plank|sit-up|crunch|raise|twist|mobility|walk|rolling|stretch/i.test(name); },
  _repRange(repText){ const nums=String(repText).match(/\d+/g)?.map(Number)||[8,12]; return {min:nums[0],max:nums[1]||nums[0]}; },
  _e1rm(weight,reps){ const w=Number(weight)||0,r=Number(reps)||0; return w>0&&r>0?w*(1+r/30):0; },
  _bestSet(session){ return (session?.sets||[]).filter(s=>s.done&&Number(s.reps)>0).sort((a,b)=>this._e1rm(b.weight,b.reps)-this._e1rm(a.weight,a.reps))[0]||null; },

  // Progressive overload is performance-gated, never time-gated.
  // The System keeps the same load until the prescribed work earns a load increase.
  _loadIncrement(ex,weight){
    if(this._isBodyweight(ex.name)) return 1;
    const name=ex.name.toLowerCase();
    if(/lateral|curl|extension|fly|face pull|calf|raise/.test(name)) return weight>=20?1:0.5;
    if(/dumbbell/.test(name)) return 2;
    if(/deadlift|squat|leg press|hip thrust/.test(name)) return weight>=80?5:2.5;
    return 2.5;
  },
  _sessionSummary(session,ex){
    const range=this._repRange(ex.reps);
    const sets=(session?.sets||[]).filter(s=>s.done&&Number(s.reps)>0);
    if(!sets.length) return null;
    const weights=sets.map(s=>Number(s.weight)||0);
    const workingWeight=Math.max(...weights);
    const workingSets=sets.filter(s=>(Number(s.weight)||0)===workingWeight);
    const reps=workingSets.map(s=>Number(s.reps)||0);
    const totalReps=reps.reduce((a,b)=>a+b,0);
    const allPrescribedDone=sets.length>=ex.sets;
    const sameLoadAcrossWork=workingSets.length>=Math.min(ex.sets,sets.length);
    const allAtMinimum=allPrescribedDone&&sameLoadAcrossWork&&reps.slice(0,ex.sets).every(r=>r>=range.min);
    const promotionEarned=allPrescribedDone&&sameLoadAcrossWork&&reps.slice(0,ex.sets).every(r=>r>=range.max);
    return {workingWeight,reps,totalReps,allPrescribedDone,allAtMinimum,promotionEarned,range,sets};
  },
  _analyze(ex,history){
    const sessions=history.map(h=>({session:h,summary:this._sessionSummary(h,ex),best:this._bestSet(h)})).filter(x=>x.summary);
    const last=sessions.at(-1)||null;
    const bestSet=sessions.reduce((acc,x)=>this._e1rm(x.best?.weight,x.best?.reps)>this._e1rm(acc?.weight,acc?.reps)?x.best:acc,null);
    const range=this._repRange(ex.reps);

    if(!last){
      return {
        target:`${range.min}-${range.max} reps · establish baseline`,
        message:'No previous performance. Choose a controlled working load and leave 1–2 clean reps in reserve.',
        plateau:false,last:'No data',best:'—',pr:false,confidence:'LOW'
      };
    }

    const latest=last.summary;
    const weight=latest.workingWeight;
    const increment=this._loadIncrement(ex,weight);
    const sameLoad=sessions.filter(x=>x.summary.workingWeight===weight);
    const bestTotalAtLoad=Math.max(...sameLoad.map(x=>x.summary.totalReps));
    const latestTotal=latest.totalReps;
    const previousBestAtLoad=Math.max(0,...sameLoad.slice(0,-1).map(x=>x.summary.totalReps));
    const topRep=latest.reps.length?Math.max(...latest.reps):0;
    const lowestRep=latest.reps.length?Math.min(...latest.reps):0;

    let target;
    let message;
    let confidence=sessions.length>=4?'HIGH':sessions.length>=2?'MODERATE':'LOW';

    if(latest.promotionEarned){
      target=`${U.formatNum(weight+increment,1)} kg × ${range.min}`;
      message='Load increase earned. The full prescribed work reached the top of the rep range. Move up when ready.';
    }else if(!latest.allAtMinimum){
      target=`${U.formatNum(weight,1)} kg · reach ${range.min} on every set`;
      message='Maintain the current load. First bring every working set into the prescribed rep range.';
    }else{
      const nextTotal=Math.min(ex.sets*range.max,bestTotalAtLoad+1);
      target=`${U.formatNum(weight,1)} kg · ${nextTotal} total reps`;
      message='Maintain the load. Add one clean rep somewhere across the prescribed sets; there is no deadline.';
    }

    // A single poor exposure never lowers the earned target.
    if(sameLoad.length>=2&&latestTotal<previousBestAtLoad){
      target=`${U.formatNum(weight,1)} kg · return to ${previousBestAtLoad} total reps`;
      message='Performance variance detected. Do not reduce the load after one weaker session. Recover the previous standard first.';
      confidence='MODERATE';
    }

    // Plateau requires repeated exposure at the same load with no rep or strength improvement.
    const recentSame=sameLoad.slice(-4);
    const plateau=recentSame.length>=4 && recentSame.every(x=>!x.summary.promotionEarned) &&
      Math.max(...recentSame.map(x=>x.summary.totalReps))<=recentSame[0].summary.totalReps &&
      Math.max(...recentSame.map(x=>this._e1rm(x.best?.weight,x.best?.reps)))<=this._e1rm(recentSame[0].best?.weight,recentSame[0].best?.reps)*1.01;
    if(plateau){
      message='Four exposures at the same load produced no measurable rep or strength improvement. Check recovery before changing the exercise.';
      confidence='HIGH';
    }

    const previousBest=sessions.slice(0,-1).reduce((m,x)=>Math.max(m,this._e1rm(x.best?.weight,x.best?.reps)),0);
    const currentBest=this._e1rm(last.best?.weight,last.best?.reps);
    const pr=currentBest>previousBest+0.1;
    const lastText=`${U.formatNum(weight,1)} kg · ${latest.reps.join('/') || topRep} reps`;
    const bestText=bestSet?`${this._e1rm(bestSet.weight,bestSet.reps).toFixed(1)} kg`:'—';
    return {target,message,plateau,last:lastText,best:bestText,pr,confidence};
  },
  _exerciseComplete(saved,ex){ const sets=saved?.sets||[]; return sets.length>=ex.sets&&sets.slice(0,ex.sets).every(s=>s.done&&Number(s.reps)>0); },

  _buildScroller(activeDate){ let items=''; for(let i=-3;i<=3;i++){ const d=U.addDays(activeDate,i),active=d===activeDate,today=d===U.todayStr(); items+=`<button class="day-pill ${active?'active':''}" data-date="${d}"><b>${U.parseDate(d).getDate()}</b><span>${today?'Today':U.shortDay(d)}</span></button>`; } return `<div class="day-scroller">${items}</div>`; },
  _bind(){
    document.querySelectorAll('.day-pill').forEach(b=>b.onclick=()=>this.render(b.dataset.date));
    document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>document.getElementById(`detail-${b.dataset.toggle}`)?.classList.toggle('open'));
    document.querySelectorAll('.set-check').forEach(b=>b.onclick=()=>{ const ex=b.dataset.ex,i=Number(b.dataset.set),day=Store.getTrainingDay(this.activeDate),workout=getWorkoutForDate(this.activeDate),def=workout.exercises.find(x=>x.id===ex),sets=this._normalizeSets(day.exercises[ex]?.sets,def.sets); sets[i].done=!sets[i].done; this._save(ex,sets,day.exercises[ex]?.note||''); this.render(this.activeDate); });
    document.querySelectorAll('.set-row input').forEach(input=>input.onchange=()=>{ const ex=input.dataset.ex,i=Number(input.dataset.set),field=input.dataset.field,day=Store.getTrainingDay(this.activeDate),def=getWorkoutForDate(this.activeDate).exercises.find(x=>x.id===ex),sets=this._normalizeSets(day.exercises[ex]?.sets,def.sets); sets[i][field]=input.value===''?'':Number(input.value); this._save(ex,sets,day.exercises[ex]?.note||''); });
    document.querySelectorAll('[data-note]').forEach(t=>t.onchange=()=>{ const ex=t.dataset.note,day=Store.getTrainingDay(this.activeDate),def=getWorkoutForDate(this.activeDate).exercises.find(x=>x.id===ex),sets=this._normalizeSets(day.exercises[ex]?.sets,def.sets); this._save(ex,sets,t.value.trim()); });
  },
  _save(ex,sets,note){ Store.saveExerciseSets(this.activeDate,ex,{sets,note}); },
  finishDay(){
    const workout=getWorkoutForDate(this.activeDate),day=Store.getTrainingDay(this.activeDate);
    const count=workout.exercises.filter(ex=>this._exerciseComplete(day.exercises[ex.id],ex)).length;
    if(count===0&&!confirm('No completed exercise sets were found. Mark the training day complete anyway?')) return;
    Store.completeTrainingDay(this.activeDate,true);
    if(this.activeDate===U.todayStr()) Store.saveCheckin(this.activeDate,{workoutDone:true});
    U.toast(`Training stored · ${count}/${workout.exercises.length} exercises cleared.`); this.render(this.activeDate);
  },
  showWeeklyVolume(){
    const end=this.activeDate,start=U.addDays(end,-6),days=Store.getTrainingSessions(),volume={};
    Object.values(days).filter(d=>d.date>=start&&d.date<=end).forEach(day=>Object.entries(day.exercises||{}).forEach(([id,entry])=>{ const muscles=EXERCISE_INTEL[id]?.muscles||['Other']; const completed=(entry.sets||[]).filter(s=>s.done).length; muscles.forEach(m=>volume[m]=(volume[m]||0)+completed/muscles.length); }));
    const rows=Object.entries(volume).sort((a,b)=>b[1]-a[1]).map(([m,s])=>`<div class="system-init-row"><span>${m}</span><b>${s.toFixed(1)} sets</b></div>`).join('')||'<p class="text-dim">Complete training sets to generate volume analysis.</p>';
    const modal=document.createElement('div'); modal.className='simple-modal show'; modal.innerHTML=`<section class="card simple-modal-card"><button class="daily-brief-close">×</button><span class="eyebrow">7-DAY ANALYSIS</span><h2>Muscle Volume</h2>${rows}<p class="text-dim">Volume is distributed across the primary muscles assigned to each exercise. Use it as a consistency signal, not a medical prescription.</p></section>`; document.body.appendChild(modal); modal.querySelector('button').onclick=()=>modal.remove(); modal.onclick=e=>{if(e.target===modal)modal.remove();};
  }
};
