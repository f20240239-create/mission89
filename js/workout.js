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
        <div class="training-toolbar-actions"><button class="btn btn-ghost btn-small" onclick="Workout.modifyWorkout()">Modify Workout</button><button class="btn btn-ghost btn-small" onclick="Workout.showWeeklyVolume()">Weekly Volume</button></div>
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
    const alternatives=this._candidateExercises(ex,'replace').slice(0,3).map(x=>x.name).join(' · ');
    return `<article class="card smart-exercise ${complete?'exercise-cleared':''}" style="animation-delay:${index*.025}s">
      <button class="exercise-summary" data-toggle="${ex.id}">
        <span><b>${ex.name}</b><small>${ex.sets} sets × ${ex.reps}</small></span>
        <span class="exercise-target"><small>NEXT TARGET</small><b>${intel.target}</b></span>
        <span class="exercise-state">${complete?'✓':'›'}</span>
      </button>
      <button class="exercise-adapt-btn" data-adapt="${ex.id}">Adapt Exercise</button>
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
    document.querySelectorAll('[data-adapt]').forEach(b=>b.onclick=()=>this.openExerciseActions(b.dataset.adapt));
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
  _currentWorkout(){ return getWorkoutForDate(this.activeDate); },
  _exerciseBySlot(id){ return this._currentWorkout().exercises.find(ex=>ex.id===id); },
  _catalogMeta(ex){ return EXERCISE_BY_ID[ex?.catalogId]||EXERCISE_BY_NAME[String(ex?.name||'').toLowerCase()]||ex||{}; },
  _available(ex){
    const unavailable=Store.getGymProfile().unavailableEquipment||[];
    return !unavailable.includes(ex.equipment);
  },
  _candidateExercises(original,mode='replace'){
    const source=this._catalogMeta(original);
    const prefs=Store.getExercisePreferences();
    return EXERCISE_CATALOG.filter(ex=>ex.id!==source.catalogId&&ex.id!==source.id&&this._available(ex)&&!prefs.avoid?.[ex.id])
      .map(ex=>{
        let score=0;
        if(ex.movement===source.movement) score+=60;
        if(ex.primary===source.primary) score+=30;
        if((ex.secondary||[]).includes(source.primary)||(source.secondary||[]).includes(ex.primary)) score+=6;
        if(prefs.preferred?.[source.catalogId]===ex.id) score+=20;
        const diff=(ex.difficulty||2)-(source.difficulty||2);
        if(mode==='easier') score+=diff<0?35:-Math.abs(diff)*15;
        if(mode==='harder') score+=diff>0?35:-Math.abs(diff)*15;
        if(mode==='replace') score-=Math.abs(diff)*3;
        return {...ex,score,approval:ex.movement===source.movement?'Equivalent movement':ex.primary===source.primary?'Same primary muscle':'Secondary match'};
      }).filter(ex=>ex.score>=25).sort((a,b)=>b.score-a.score);
  },
  _modal(content){
    document.querySelector('.exercise-intel-modal')?.remove();
    const modal=document.createElement('div'); modal.className='simple-modal show exercise-intel-modal';
    modal.innerHTML=`<section class="card simple-modal-card exercise-intel-card"><button class="daily-brief-close" data-close>×</button>${content}</section>`;
    document.body.appendChild(modal); modal.querySelector('[data-close]').onclick=()=>modal.remove(); modal.onclick=e=>{if(e.target===modal)modal.remove();}; return modal;
  },
  openExerciseActions(exId){
    const ex=this._exerciseBySlot(exId); if(!ex) return;
    const meta=this._catalogMeta(ex);
    const modal=this._modal(`<span class="eyebrow">EXERCISE INTELLIGENCE</span><h2>${ex.name}</h2>
      <div class="exercise-analysis-grid"><div><span>Movement</span><b>${this._label(meta.movement)}</b></div><div><span>Primary</span><b>${meta.primary||'Unclassified'}</b></div><div><span>Equipment</span><b>${meta.equipment||'Unknown'}</b></div><div><span>Difficulty</span><b>${meta.difficulty||'—'}/5</b></div></div>
      <p class="text-dim">The exercise can change. The training purpose should not.</p>
      <div class="adapt-action-grid">
        <button data-mode="busy">Machine busy</button><button data-mode="unavailable">Not in my gym</button>
        <button data-mode="easier">Need easier variation</button><button data-mode="harder">Need harder variation</button>
        <button data-mode="replace">Choose replacement</button><button data-mode="remove" class="danger-action">Remove exercise</button>
      </div>`);
    modal.querySelectorAll('[data-mode]').forEach(btn=>btn.onclick=()=>{
      const mode=btn.dataset.mode;
      if(mode==='remove'){ modal.remove(); this.removeExercise(exId); return; }
      if(mode==='unavailable'&&meta.equipment){
        const profile=Store.getGymProfile(),unavailable=[...new Set([...(profile.unavailableEquipment||[]),meta.equipment])]; Store.saveGymProfile({unavailableEquipment:unavailable});
      }
      modal.remove(); this.showSuggestions(exId,mode==='busy'||mode==='unavailable'?'replace':mode);
    });
  },
  showSuggestions(exId,mode='replace'){
    const original=this._exerciseBySlot(exId); if(!original) return;
    const candidates=this._candidateExercises(original,mode).slice(0,12);
    const rows=candidates.map(ex=>`<button class="exercise-option" data-catalog="${ex.id}"><span><b>${ex.name}</b><small>${ex.approval} · ${ex.equipment} · difficulty ${ex.difficulty}/5</small></span><strong>${Math.min(99,Math.max(55,ex.score))}%</strong></button>`).join('');
    const modal=this._modal(`<span class="eyebrow">APPROVED VARIATIONS</span><h2>Replace ${original.name}</h2><p class="text-dim">Ranked by movement pattern, target muscle, difficulty and your gym profile.</p><div class="exercise-option-list">${rows||'<p>No approved match remains after gym and preference filters.</p>'}</div>`);
    modal.querySelectorAll('[data-catalog]').forEach(btn=>btn.onclick=()=>{ const id=btn.dataset.catalog; modal.remove(); this.chooseScope(`Use ${EXERCISE_BY_ID[id].name}`,scope=>this.replaceExercise(exId,id,scope)); });
  },
  chooseScope(title,callback){
    const modal=this._modal(`<span class="eyebrow">APPLY CHANGE</span><h2>${title}</h2><p class="text-dim">Today keeps the original plan for future sessions. Routine changes every future ${U.shortDay(this.activeDate)} session.</p><div class="scope-actions"><button class="btn btn-ghost" data-scope="today">Today only</button><button class="btn btn-primary" data-scope="routine">Save to routine</button></div>`);
    modal.querySelectorAll('[data-scope]').forEach(btn=>btn.onclick=()=>{ const scope=btn.dataset.scope; modal.remove(); callback(scope); });
  },
  _saveWorkout(workout,scope){ const payload={tag:workout.tag,title:workout.title,sub:workout.sub,exercises:workout.exercises}; if(scope==='routine') Store.saveRoutineWorkout(U.parseDate(this.activeDate).getDay(),payload); else Store.saveDayWorkout(this.activeDate,payload); },
  replaceExercise(slotId,catalogId,scope){
    const workout=this._currentWorkout(),index=workout.exercises.findIndex(ex=>ex.id===slotId),old=workout.exercises[index],item=EXERCISE_BY_ID[catalogId]; if(index<0||!item)return;
    const newId=`${slotId.split('--')[0]}--${catalogId}`;
    workout.exercises[index]={...item,id:newId,catalogId:item.id,sets:old.sets,reps:old.reps,replacedFrom:old.name};
    this._saveWorkout(workout,scope);
    const prefs=Store.getExercisePreferences(); Store.saveExercisePreferences({preferred:{...(prefs.preferred||{}),[old.catalogId||old.id]:catalogId}});
    U.toast(`${item.name} approved · ${scope==='routine'?'routine updated':'today only'}.`); this.render(this.activeDate);
  },
  removeExercise(slotId){
    const ex=this._exerciseBySlot(slotId); if(!ex)return;
    this.chooseScope(`Remove ${ex.name}`,scope=>{ const workout=this._currentWorkout(); workout.exercises=workout.exercises.filter(x=>x.id!==slotId); this._saveWorkout(workout,scope); U.toast(`${ex.name} removed ${scope==='routine'?'from routine':'for today'}.`); this.render(this.activeDate); });
  },
  modifyWorkout(){
    const modal=this._modal(`<span class="eyebrow">WORKOUT CONTROL</span><h2>Modify ${this._currentWorkout().title}</h2><p class="text-dim">Add an approved exercise, teach ASCEND your equipment, or restore the default protocol.</p><div class="adapt-action-grid"><button data-action="add">Add exercise</button><button data-action="gym">Gym equipment</button><button data-action="resetToday">Reset today</button><button data-action="resetRoutine">Reset routine</button></div>`);
    modal.querySelector('[data-action="add"]').onclick=()=>{modal.remove();this.addExercise();};
    modal.querySelector('[data-action="gym"]').onclick=()=>{modal.remove();this.editGymProfile();};
    modal.querySelector('[data-action="resetToday"]').onclick=()=>{Store.clearDayWorkout(this.activeDate);modal.remove();U.toast('Today restored from routine.');this.render(this.activeDate);};
    modal.querySelector('[data-action="resetRoutine"]').onclick=()=>{if(confirm('Restore the default workout for this weekday?')){Store.clearRoutineWorkout(U.parseDate(this.activeDate).getDay());Store.clearDayWorkout(this.activeDate);modal.remove();U.toast('Default routine restored.');this.render(this.activeDate);}};
  },
  addExercise(){
    const available=EXERCISE_CATALOG.filter(ex=>this._available(ex));
    const modal=this._modal(`<span class="eyebrow">EXERCISE LIBRARY</span><h2>Add Exercise</h2><input class="field-input exercise-search" data-search placeholder="Search exercise, muscle, movement or equipment"><div class="exercise-option-list" data-results></div><button class="btn btn-ghost" data-custom>Create custom exercise</button>`);
    const results=modal.querySelector('[data-results]');
    const render=q=>{ const terms=q.trim().toLowerCase(); const list=available.filter(ex=>!terms||`${ex.name} ${ex.primary} ${ex.movement} ${ex.equipment}`.toLowerCase().includes(terms)).slice(0,30); results.innerHTML=list.map(ex=>`<button class="exercise-option" data-catalog="${ex.id}"><span><b>${ex.name}</b><small>${ex.primary} · ${this._label(ex.movement)} · ${ex.equipment}</small></span><strong>APPROVED</strong></button>`).join(''); results.querySelectorAll('[data-catalog]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.catalog;modal.remove();this.configureAddedExercise(EXERCISE_BY_ID[id]);}); };
    modal.querySelector('[data-search]').oninput=e=>render(e.target.value); modal.querySelector('[data-custom]').onclick=()=>{modal.remove();this.createCustomExercise();}; render('');
  },
  configureAddedExercise(item){
    const modal=this._modal(`<span class="eyebrow">PROGRAM CHECK</span><h2>${item.name}</h2><div class="exercise-analysis-grid"><div><span>Movement</span><b>${this._label(item.movement)}</b></div><div><span>Primary</span><b>${item.primary}</b></div></div><label class="field-label">Working sets<input class="field-input" data-sets type="number" min="1" max="8" value="3"></label><label class="field-label">Rep range<input class="field-input" data-reps value="8-12"></label><button class="btn btn-primary" data-approve>Approve addition</button>`);
    modal.querySelector('[data-approve]').onclick=()=>{ const sets=Math.max(1,Math.min(8,Number(modal.querySelector('[data-sets]').value)||3)),reps=modal.querySelector('[data-reps]').value.trim()||'8-12'; modal.remove(); this.chooseScope(`Add ${item.name}`,scope=>{ const workout=this._currentWorkout(),id=`custom-${Date.now().toString(36)}--${item.id}`; workout.exercises.push({...item,id,catalogId:item.id,sets,reps}); this._saveWorkout(workout,scope); U.toast(`${item.name} added · ${scope==='routine'?'routine updated':'today only'}.`); this.render(this.activeDate); }); };
  },
  createCustomExercise(){
    const movements=[...new Set(EXERCISE_CATALOG.map(x=>x.movement))],muscles=[...new Set(EXERCISE_CATALOG.map(x=>x.primary))],equipment=[...new Set(EXERCISE_CATALOG.map(x=>x.equipment))];
    const modal=this._modal(`<span class="eyebrow">CUSTOM MOVEMENT</span><h2>Classify Exercise</h2><p class="text-dim">ASCEND can approve a custom exercise only when its training purpose is defined.</p><label class="field-label">Exercise name<input class="field-input" data-name></label><label class="field-label">Primary muscle<select class="field-input" data-primary>${muscles.map(x=>`<option>${x}</option>`).join('')}</select></label><label class="field-label">Movement pattern<select class="field-input" data-movement>${movements.map(x=>`<option value="${x}">${this._label(x)}</option>`).join('')}</select></label><label class="field-label">Equipment<select class="field-input" data-equipment>${equipment.map(x=>`<option>${x}</option>`).join('')}</select></label><button class="btn btn-primary" data-review>Review movement</button>`);
    modal.querySelector('[data-review]').onclick=()=>{ const name=modal.querySelector('[data-name]').value.trim(); if(!name){U.toast('Exercise name is required.');return;} const item={id:`user-${this._slug(name)}-${Date.now().toString(36)}`,name,primary:modal.querySelector('[data-primary]').value,movement:modal.querySelector('[data-movement]').value,equipment:modal.querySelector('[data-equipment]').value,secondary:[],difficulty:2,userCreated:true}; modal.remove(); this.configureAddedExercise(item); };
  },
  editGymProfile(){
    const profile=Store.getGymProfile(),items=[...new Set(EXERCISE_CATALOG.map(x=>x.equipment))].sort();
    const modal=this._modal(`<span class="eyebrow">GYM PROFILE</span><h2>Unavailable Equipment</h2><p class="text-dim">Selected equipment will not appear in future recommendations.</p><div class="equipment-grid">${items.map(x=>`<label><input type="checkbox" value="${x}" ${profile.unavailableEquipment?.includes(x)?'checked':''}><span>${x}</span></label>`).join('')}</div><button class="btn btn-primary" data-save>Save gym profile</button>`);
    modal.querySelector('[data-save]').onclick=()=>{ const unavailable=[...modal.querySelectorAll('input:checked')].map(x=>x.value); Store.saveGymProfile({unavailableEquipment:unavailable}); modal.remove(); U.toast('Gym profile synchronized.'); };
  },
  _label(value){ return String(value||'').split('-').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' '); },
  _slug(value){ return String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); },
  showWeeklyVolume(){
    const end=this.activeDate,start=U.addDays(end,-6),days=Store.getTrainingSessions(),volume={};
    Object.values(days).filter(d=>d.date>=start&&d.date<=end).forEach(day=>Object.entries(day.exercises||{}).forEach(([id,entry])=>{ const ex=Object.values(BASE_WORKOUT_SPLIT).flatMap(w=>w.exercises).find(x=>x.id===id)||EXERCISE_CATALOG.find(x=>id.endsWith(`--${x.id}`)); const muscles=[ex?.primary,...(ex?.secondary||[])].filter(Boolean).slice(0,2)||['Other']; const completed=(entry.sets||[]).filter(s=>s.done).length; muscles.forEach(m=>volume[m]=(volume[m]||0)+completed/muscles.length); }));
    const rows=Object.entries(volume).sort((a,b)=>b[1]-a[1]).map(([m,s])=>`<div class="system-init-row"><span>${m}</span><b>${s.toFixed(1)} sets</b></div>`).join('')||'<p class="text-dim">Complete training sets to generate volume analysis.</p>';
    const modal=document.createElement('div'); modal.className='simple-modal show'; modal.innerHTML=`<section class="card simple-modal-card"><button class="daily-brief-close">×</button><span class="eyebrow">7-DAY ANALYSIS</span><h2>Muscle Volume</h2>${rows}<p class="text-dim">Volume is distributed across the primary muscles assigned to each exercise. Use it as a consistency signal, not a medical prescription.</p></section>`; document.body.appendChild(modal); modal.querySelector('button').onclick=()=>modal.remove(); modal.onclick=e=>{if(e.target===modal)modal.remove();};
  }
};
