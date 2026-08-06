/* ==========================================================================
   ASCEND — Operator Synchronization Protocol v0.6
   Full one-question synchronization, live analysis, module summaries,
   reality analysis and cinematic campaign generation.
   ========================================================================== */
const Onboarding = {
  moduleIndex: 0,
  questionIndex: 0,
  screen: 'intro',
  data: {},
  _timers: [],

  modules: [
    {
      id:'identity', title:'Identity', code:'01',
      description:'Establish the permanent Operator record used across every campaign.',
      questions:[
        {key:'name', title:'Operator designation', copy:'What should the System call you?', type:'text', placeholder:'Enter your name', action:'Synchronize designation'},
        {key:'birthDate', title:'Date of birth', copy:'Age will be calculated automatically.', type:'date', action:'Calculate age'},
        {key:'sex', title:'Biological sex', copy:'Used only where physiology changes planning estimates.', type:'select', options:[['','Select'],['male','Male'],['female','Female'],['other','Other / prefer not to say']], action:'Store biological record'},
        {key:'height', title:'Height', copy:'Required for baseline body metrics.', type:'number', step:'1', suffix:'cm', action:'Analyze height'},
        {key:'currentWeight', title:'Current weight', copy:'This becomes the first campaign baseline.', type:'number', step:'0.1', suffix:'kg', action:'Establish baseline'}
      ]
    },
    {
      id:'biology', title:'Biology', code:'02',
      description:'Build the recovery and feasibility baseline. Optional answers improve accuracy.',
      questions:[
        {key:'highestWeight', title:'Highest adult weight', copy:'Optional. Helps ASCEND understand your historical range.', type:'number', step:'0.1', suffix:'kg', optional:true, action:'Store historical maximum'},
        {key:'lowestAdultWeight', title:'Lowest adult weight', copy:'Optional. Use a weight you maintained as an adult.', type:'number', step:'0.1', suffix:'kg', optional:true, action:'Store historical minimum'},
        {key:'waist', title:'Current waist', copy:'Optional. Useful when scale weight hides physique change.', type:'number', step:'0.1', suffix:'cm', optional:true, action:'Store body measurement'},
        {key:'injuries', title:'Movement limitations', copy:'List injuries, pain, or restrictions. Write “none” if there are none.', type:'textarea', placeholder:'Example: knee discomfort during deep squats', action:'Map movement constraints'},
        {key:'medicalConditions', title:'Medical context', copy:'Optional. Include relevant conditions or medication. ASCEND will not diagnose or prescribe.', type:'textarea', placeholder:'Leave blank if not applicable', optional:true, action:'Store medical context'}
      ]
    },
    {
      id:'lifestyle', title:'Lifestyle', code:'03',
      description:'A campaign that ignores real life will fail in real life.',
      questions:[
        {key:'role', title:'Current role', copy:'What occupies most of your weekdays?', type:'select', options:[['student','Student'],['working','Working'],['both','Student + working'],['other','Other']], action:'Map schedule type'},
        {key:'activityLevel', title:'Daily movement', copy:'Outside planned exercise, how active are most days?', type:'select', options:[['low','Mostly seated'],['moderate','Moderately active'],['high','Highly active']], action:'Estimate activity baseline'},
        {key:'gymAccess', title:'Training access', copy:'What equipment can you reliably access?', type:'select', options:[['full-gym','Full gym'],['limited-gym','Limited gym'],['home','Home only'],['none','No equipment']], action:'Configure training environment'},
        {key:'diet', title:'Diet pattern', copy:'Choose the closest match. This affects protein strategy.', type:'select', options:[['vegetarian','Vegetarian'],['eggetarian','Vegetarian + eggs'],['non-vegetarian','Non-vegetarian'],['vegan','Vegan'],['other','Other']], action:'Configure nutrition environment'},
        {key:'cooking', title:'Cooking ability', copy:'Be honest. Plans should fit what you can repeatedly execute.', type:'select', options:[['none','Cannot cook'],['basic','Basic meals'],['comfortable','Comfortable'],['advanced','Advanced']], action:'Estimate meal flexibility'},
        {key:'stressLevel', title:'Current stress load', copy:'Use your normal week, not your best week.', type:'select', options:[['low','Low'],['medium','Medium'],['high','High']], action:'Estimate recovery pressure'},
        {key:'wakeTime', title:'Usual wake time', copy:'The System will use this for daily timing later.', type:'time', action:'Store wake window'},
        {key:'sleepTime', title:'Usual sleep time', copy:'Use the time you actually sleep—not the time you intend to.', type:'time', action:'Store sleep window'}
      ]
    },
    {
      id:'objective', title:'Objective', code:'04',
      description:'Define what we are building and why it matters now.',
      questions:[
        {key:'goalType', title:'Primary objective', copy:'What should the first campaign optimize for?', type:'select', options:[['fat-loss','Fat loss'],['recomposition','Body recomposition'],['lean-bulk','Lean bulk'],['strength','Strength'],['endurance','Endurance'],['custom','Custom']], action:'Define campaign class'},
        {key:'goalWeight', title:'Target weight', copy:'This is a campaign destination, not a deadline promise.', type:'number', step:'0.1', suffix:'kg', action:'Store target coordinate'},
        {key:'requestedDays', title:'Requested duration', copy:'How quickly do you want the full objective? ASCEND will compare this with a realistic range.', type:'number', step:'1', suffix:'days', action:'Analyze deadline'},
        {key:'primaryReason', title:'Why now?', copy:'Give the real reason. This becomes permanent campaign context.', type:'textarea', placeholder:'Example: return to college feeling confident and in control', action:'Lock campaign motive'},
        {key:'secondaryGoal', title:'Secondary objective', copy:'What should improve alongside the main goal?', type:'select', options:[['build-consistency','Build consistency'],['strength','Increase strength'],['fitness','Improve fitness'],['confidence','Build confidence'],['sleep','Fix sleep'],['custom','Custom']], action:'Set secondary objective'}
      ]
    },
    {
      id:'history', title:'History', code:'05',
      description:'Previous attempts are data. ASCEND uses them instead of pretending this is your first try.',
      questions:[
        {key:'trainingExperience', title:'Training experience', copy:'Choose the closest description.', type:'select', options:[['beginner','Beginner'],['returning','Returning after inconsistency'],['intermediate','Consistent intermediate'],['advanced','Advanced']], action:'Classify experience'},
        {key:'previousSuccess', title:'Previous success', copy:'What is the best result or transformation you have achieved?', type:'textarea', placeholder:'Example: lost 8 kg during one consistent period', action:'Store proof of capability'},
        {key:'longestStreak', title:'Longest consistent streak', copy:'How many days or weeks did you execute without abandoning the plan?', type:'text', placeholder:'Example: 30 days', action:'Store consistency record'}
      ]
    },
    {
      id:'psychology', title:'Psychology', code:'06',
      description:'Recovery accuracy depends on knowing what usually breaks your momentum.',
      questions:[
        {key:'blockers', title:'What usually breaks consistency?', copy:'Choose every pattern that has repeatedly affected you.', type:'multiselect', options:[['missed-day','Missing one day'],['travel','Travel'],['exams','Exams / deadlines'],['social-food','Social eating'],['emotional-eating','Emotional eating'],['ordering','Late-night ordering'],['burnout','Doing too much too soon']], action:'Map failure patterns'},
        {key:'recoveryPreference', title:'After a bad day, show me…', copy:'Choose how ASCEND should present recovery.', type:'cards', options:[['action-plan','Damage + exact recovery plan','Direct steps with estimated recovery time.'],['minimal','Only the next best action','No overload. Just the highest-impact move.'],['analysis','Detailed analysis and options','Causes, alternatives and confidence levels.']], action:'Configure recovery response'}
      ]
    },
    {
      id:'system', title:'System', code:'07',
      description:'Configure ASCEND’s presence. No fake praise. No meaningless punishment.',
      questions:[
        {key:'systemTone', title:'System voice', copy:'Choose the closest operating style.', type:'cards', options:[['cold-direct','Cold & direct','Calm confidence. Frank truth. Recovery follows criticism.'],['analytical','Analytical','More numbers, causes and confidence levels.'],['adaptive','Adaptive','Changes tone according to performance and risk.']], action:'Synchronize system voice'},
        {key:'reminderIntensity', title:'Reminder intensity', copy:'How aggressively should the System bring you back to execution?', type:'cards', options:[['daily','Daily','One deliberate reminder every day.'],['high','Persistent on weak days','More pressure when decline is detected.'],['minimal','Critical only','Only intervene when trajectory is at risk.']], action:'Configure intervention level'}
      ]
    },
    {
      id:'campaign', title:'Campaign', code:'08',
      description:'Finalize the first phase. The full objective remains adaptive.',
      questions:[
        {key:'campaignName', title:'Campaign designation', copy:'Name the first campaign. Mission 89 is only the beginning.', type:'text', placeholder:'Mission 89', action:'Generate campaign'}
      ]
    }
  ],

  shouldRun(){ return !Store.isOperatorInitialized(); },

  start(){
    this.data = Object.assign({}, this._defaults(), Store.getOnboardingDraft());
    const state = Store.getOnboardingState();
    this.moduleIndex = Math.max(0, Math.min(this.modules.length - 1, Number(state.moduleIndex ?? state.step) || 0));
    this.questionIndex = Math.max(0, Number(state.questionIndex ?? state.identityIndex) || 0);
    this.screen = state.started ? 'protocol' : 'intro';
    this._normalizePosition();
    this.render();
  },

  resume(){ this.start(); },

  _defaults(){
    const settings = Store.getSettings();
    return {
      name:'', birthDate:'', sex:'', units:settings.units || 'kg',
      height:settings.height || 175, currentWeight:settings.startWeight || 98,
      highestWeight:'', lowestAdultWeight:'', waist:'', injuries:'', medicalConditions:'',
      role:'student', activityLevel:'moderate', gymAccess:'full-gym', diet:'vegetarian', cooking:'basic',
      wakeTime:'08:00', sleepTime:'00:00', stressLevel:'medium',
      goalType:'fat-loss', goalWeight:settings.goalWeight || 89, requestedDays:settings.missionDays || 20,
      primaryReason:'', secondaryGoal:'build-consistency', trainingExperience:'returning', previousSuccess:'',
      longestStreak:'', blockers:[], recoveryPreference:'action-plan', systemTone:'cold-direct',
      reminderIntensity:'daily', campaignName:'Mission 89'
    };
  },

  _normalizePosition(){
    const module = this.modules[this.moduleIndex];
    this.questionIndex = Math.max(0, Math.min(module.questions.length, this.questionIndex));
  },

  render(){
    this._clearTimers();
    document.querySelector('.operator-init-overlay')?.remove();
    if(this.screen === 'intro') return this._renderIntro();
    if(this.screen === 'generation') return this._renderGeneration();
    this._renderProtocol();
  },

  _renderIntro(){
    const overlay = document.createElement('div');
    overlay.className = 'operator-init-overlay operator-intro-overlay';
    overlay.innerHTML = `
      <section class="sync-intro-shell">
        <div class="sync-orb" aria-hidden="true"><span>A</span><i></i><i></i><i></i></div>
        <span class="operator-kicker">ASCEND · PERSONAL PROGRESSION SYSTEM</span>
        <h1>No Operator Profile Found</h1>
        <p>A permanent profile is required before ASCEND can generate campaigns, calculate recovery or adapt to the person using it.</p>
        <div class="sync-intro-grid">
          <div><small>Estimated synchronization</small><b>8–12 minutes</b></div>
          <div><small>Frequency</small><b>Completed once</b></div>
          <div><small>Campaigns affected</small><b>All future campaigns</b></div>
        </div>
        <div class="sync-intro-note">Accuracy later depends on honesty now. The System cannot correct data you choose to hide.</div>
        <button class="btn btn-primary sync-begin-btn" id="beginSynchronization">Begin Profile Synchronization</button>
      </section>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>overlay.classList.add('show'));
    overlay.querySelector('#beginSynchronization').addEventListener('click', ()=>this._beginBoot());
  },

  _beginBoot(){
    Store.saveOnboardingState({ started:true, moduleIndex:0, questionIndex:0 });
    const overlay = document.querySelector('.operator-init-overlay');
    if(!overlay) return;
    overlay.innerHTML = `
      <section class="sync-boot-shell">
        <div class="sync-orb booting" aria-hidden="true"><span>A</span><i></i><i></i><i></i></div>
        <span class="operator-kicker">OPERATOR SYNCHRONIZATION PROTOCOL</span>
        <h1>Initializing</h1>
        <div class="boot-terminal" id="bootTerminal"></div>
        <div class="boot-progress"><span id="bootProgress"></span></div>
      </section>`;
    const messages = ['Loading Operator Core…','Loading Campaign Engine…','Loading Recovery Engine…','Loading Intelligence Memory…','Awaiting Operator…'];
    const terminal = overlay.querySelector('#bootTerminal');
    const bar = overlay.querySelector('#bootProgress');
    messages.forEach((message,index)=>{
      this._timers.push(setTimeout(()=>{
        const line = document.createElement('div');
        line.innerHTML = `<span>0${index+1}</span><b>${message}</b><em>${index === messages.length-1 ? 'READY' : 'ONLINE'}</em>`;
        terminal.appendChild(line);
        requestAnimationFrame(()=>line.classList.add('visible'));
        bar.style.width = `${((index+1)/messages.length)*100}%`;
      }, 300 + index*360));
    });
    this._timers.push(setTimeout(()=>{ this.screen='protocol'; this.moduleIndex=0; this.questionIndex=0; this.render(); }, 2600));
  },

  _renderProtocol(){
    const overlay = document.createElement('div');
    overlay.className = 'operator-init-overlay';
    const module = this.modules[this.moduleIndex];
    const complete = this.questionIndex >= module.questions.length;
    const progress = this._progress();
    overlay.innerHTML = `
      <section class="operator-init-shell one-question-shell">
        <header class="operator-init-header">
          <div>
            <span class="operator-kicker">OPERATOR SYNCHRONIZATION PROTOCOL</span>
            <span class="operator-module">MODULE ${module.code} · ${module.title.toUpperCase()}</span>
          </div>
          <span class="operator-step">${progress.percent}%</span>
        </header>
        <div class="operator-progress"><span style="width:${progress.percent}%"></span></div>
        <main class="operator-init-body">${complete ? this._moduleSummary(module) : this._questionMarkup(module.questions[this.questionIndex])}</main>
        <footer class="operator-init-actions">
          ${this._canGoBack() ? '<button class="btn btn-ghost" id="operatorBack">Back</button>' : '<span></span>'}
          <button class="btn btn-primary" id="operatorNext">${complete ? this._moduleNextLabel() : module.questions[this.questionIndex].action}</button>
        </footer>
      </section>`;
    document.body.appendChild(overlay);
    this._bind(overlay);
    requestAnimationFrame(()=>overlay.classList.add('show'));
  },

  _questionMarkup(q){
    return `<section class="protocol-question" data-question="${q.key}">
      <span class="identity-counter">NODE ${String(this.questionIndex+1).padStart(2,'0')} / ${String(this.modules[this.moduleIndex].questions.length).padStart(2,'0')}</span>
      <h1>${q.title}</h1>
      <p>${q.copy}</p>
      ${this._control(q)}
      ${q.optional ? '<span class="protocol-optional">OPTIONAL · SKIP ALLOWED</span>' : ''}
      <div class="identity-live" id="operatorLiveResponse">${this._liveResponse(q)}</div>
    </section>`;
  },

  _control(q){
    const value = this.data[q.key] ?? '';
    if(q.type === 'select') return `<label class="identity-control"><select id="op_${q.key}">${q.options.map(([v,t])=>`<option value="${v}" ${String(value)===String(v)?'selected':''}>${t}</option>`).join('')}</select></label>`;
    if(q.type === 'textarea') return `<label class="identity-control protocol-textarea"><textarea id="op_${q.key}" placeholder="${q.placeholder || ''}">${this._escape(value)}</textarea></label>`;
    if(q.type === 'multiselect'){
      const current = Array.isArray(value) ? value : [];
      return `<div class="protocol-choice-grid">${q.options.map(([v,t])=>`<label class="operator-choice ${current.includes(v)?'selected':''}"><input type="checkbox" name="op_${q.key}" value="${v}" ${current.includes(v)?'checked':''}><span>${t}</span></label>`).join('')}</div>`;
    }
    if(q.type === 'cards') return `<div class="protocol-card-list">${q.options.map(([v,t,c])=>`<label class="operator-tone-card ${String(value)===v?'selected':''}"><input type="radio" name="op_${q.key}" value="${v}" ${String(value)===v?'checked':''}><b>${t}</b><span>${c}</span></label>`).join('')}</div>`;
    return `<label class="identity-control ${q.suffix?'has-suffix':''} ${q.type==='text'?'wide-input':''}"><input id="op_${q.key}" type="${q.type}" value="${this._escape(value)}" placeholder="${q.placeholder || ''}" ${q.step?`step="${q.step}"`:''} autocomplete="off">${q.suffix?`<span>${q.suffix}</span>`:''}</label>`;
  },

  _liveResponse(q){
    const value = this.data[q.key];
    const waiting = `<b>Awaiting input.</b><span>${q.optional ? 'This node may be skipped.' : 'Synchronization cannot continue without this record.'}</span>`;
    if(q.key==='name') return value ? `<b>Designation recognized.</b><span>Operator ${this._escape(value)}.</span>` : waiting;
    if(q.key==='birthDate'){ const age=this._ageFromBirthDate(value); return age!=null ? `<b>Age calculated: ${age}.</b><span>Date stored. Age will update automatically.</span>` : waiting; }
    if(q.key==='height') return Number(value)>80 ? `<b>Height stored: ${value} cm.</b><span>Body metrics can now be calculated.</span>` : waiting;
    if(q.key==='currentWeight'){ const bmi=this._bmi(); return Number(value)>25 ? `<b>Baseline stored: ${value} kg.</b><span>${bmi?`Initial BMI calculated: ${bmi}.`:'Height required before BMI calculation.'}</span>` : waiting; }
    if(q.key==='requestedDays' && Number(value)>0){ const r=this._reality(); return `<b>${r.status}.</b><span>Planning range: ${r.minDays}–${r.maxDays} days.</span>`; }
    if(q.key==='goalWeight' && Number(value)>25){ const change=Math.abs(Number(this.data.currentWeight)-Number(value)).toFixed(1); return `<b>Target stored: ${value} kg.</b><span>Total requested change: ${change} kg.</span>`; }
    if(q.key==='wakeTime' || q.key==='sleepTime') return value ? `<b>Time window stored.</b><span>Daily brief timing can adapt later.</span>` : waiting;
    if(q.type==='multiselect'){ const count=Array.isArray(value)?value.length:0; return count ? `<b>${count} failure pattern${count===1?'':'s'} mapped.</b><span>Recovery protocols will account for these risks.</span>` : waiting; }
    if(q.type==='cards' || q.type==='select') return value ? `<b>Preference synchronized.</b><span>The System will use this selection during campaign execution.</span>` : waiting;
    if(String(value ?? '').trim()) return `<b>Record captured.</b><span>This information has been added to the Operator model.</span>`;
    return waiting;
  },

  _moduleSummary(module){
    const items = this._summaryItems(module.id);
    if(module.id === 'campaign'){
      const r = this._reality();
      return `<section class="module-complete campaign-preview">
        <span class="sync-check">✓</span><span class="operator-kicker">CAMPAIGN PROPOSAL READY</span>
        <h2>${this._escape(this.data.campaignName || 'Mission 89')}</h2>
        <div class="reality-card ${r.statusClass}"><span>REALITY ANALYSIS</span><h3>${r.status}</h3><div class="reality-grid"><div><small>Requested</small><b>${this.data.requestedDays} days</b></div><div><small>Planning range</small><b>${r.minDays}–${r.maxDays} days</b></div><div><small>Phase I</small><b>${r.phaseDays} days minimum</b></div></div><p>${r.message}</p></div>
        <div class="generated-phase card"><span>PHASE I</span><h3>Awakening</h3><ul><li>Minimum ${r.phaseDays} logged days</li><li>Execution gates must be cleared</li><li>Weight checkpoint: ${r.phaseGoalWeight} kg</li><li>Recovery protocol remains available after setbacks</li></ul></div>
      </section>`;
    }
    return `<section class="module-complete"><span class="sync-check">✓</span><span class="operator-kicker">MODULE ${module.code} COMPLETE</span><h2>${module.title} Synchronized</h2><p>${module.description}</p><div class="module-summary-grid">${items.map(i=>`<div><small>${i.label}</small><b>${this._escape(i.value)}</b></div>`).join('')}</div></section>`;
  },

  _summaryItems(id){
    const age = this._ageFromBirthDate(this.data.birthDate);
    const map = {
      identity:[{label:'Operator',value:this.data.name},{label:'Age',value:age ?? '—'},{label:'Height',value:`${this.data.height} cm`},{label:'Baseline',value:`${this.data.currentWeight} kg`},{label:'BMI',value:this._bmi() ?? '—'}],
      biology:[{label:'Historical range',value:this.data.highestWeight||this.data.lowestAdultWeight?`${this.data.lowestAdultWeight||'—'}–${this.data.highestWeight||'—'} kg`:'Not supplied'},{label:'Waist',value:this.data.waist?`${this.data.waist} cm`:'Not supplied'},{label:'Movement limits',value:this.data.injuries||'None reported'}],
      lifestyle:[{label:'Role',value:this._labelFor('role',this.data.role)},{label:'Training access',value:this._labelFor('gymAccess',this.data.gymAccess)},{label:'Diet',value:this._labelFor('diet',this.data.diet)},{label:'Stress',value:this._labelFor('stressLevel',this.data.stressLevel)}],
      objective:[{label:'Objective',value:this._labelFor('goalType',this.data.goalType)},{label:'Target',value:`${this.data.goalWeight} kg`},{label:'Requested',value:`${this.data.requestedDays} days`},{label:'Reason',value:this.data.primaryReason}],
      history:[{label:'Experience',value:this._labelFor('trainingExperience',this.data.trainingExperience)},{label:'Best proof',value:this.data.previousSuccess||'Not supplied'},{label:'Longest streak',value:this.data.longestStreak||'Not supplied'}],
      psychology:[{label:'Mapped blockers',value:`${(this.data.blockers||[]).length}`},{label:'Recovery mode',value:this._labelFor('recoveryPreference',this.data.recoveryPreference)}],
      system:[{label:'Voice',value:this._labelFor('systemTone',this.data.systemTone)},{label:'Reminders',value:this._labelFor('reminderIntensity',this.data.reminderIntensity)}]
    };
    return map[id] || [];
  },

  _labelFor(key,value){
    for(const module of this.modules){
      const q=module.questions.find(item=>item.key===key);
      if(!q) continue;
      const match=q.options?.find(item=>item[0]===value);
      if(match) return match[1];
    }
    return String(value || '—');
  },

  _progress(){
    const total = this.modules.reduce((sum,m)=>sum+m.questions.length+1,0);
    let completed=0;
    for(let i=0;i<this.moduleIndex;i++) completed+=this.modules[i].questions.length+1;
    completed+=Math.min(this.questionIndex,this.modules[this.moduleIndex].questions.length);
    return {percent:Math.max(3,Math.min(100,Math.round((completed/total)*100)))};
  },

  _canGoBack(){ return this.moduleIndex>0 || this.questionIndex>0; },
  _moduleNextLabel(){ return this.moduleIndex===this.modules.length-1 ? 'Generate Campaign' : `Proceed to ${this.modules[this.moduleIndex+1].title}`; },

  _bind(overlay){
    overlay.querySelector('#operatorBack')?.addEventListener('click',()=>this._back());
    overlay.querySelector('#operatorNext')?.addEventListener('click',()=>this._advance());
    overlay.querySelectorAll('.operator-tone-card input').forEach(input=>input.addEventListener('change',e=>{ overlay.querySelectorAll('.operator-tone-card').forEach(card=>card.classList.remove('selected')); e.target.closest('.operator-tone-card').classList.add('selected'); this._captureCurrent(); this._refreshLive(); }));
    overlay.querySelectorAll('.operator-choice input').forEach(input=>input.addEventListener('change',e=>{ e.target.closest('.operator-choice').classList.toggle('selected',e.target.checked); this._captureCurrent(); this._refreshLive(); }));
    const q=this._currentQuestion();
    if(q){
      const input=overlay.querySelector(`#op_${q.key}`);
      input?.focus();
      input?.addEventListener('input',()=>{this._captureCurrent();this._refreshLive();});
      input?.addEventListener('change',()=>{this._captureCurrent();this._refreshLive();});
      input?.addEventListener('keydown',e=>{if(e.key==='Enter' && q.type!=='textarea'){e.preventDefault();this._advance();}});
    }
  },

  _refreshLive(){ const q=this._currentQuestion(); const live=document.querySelector('#operatorLiveResponse'); if(q&&live) live.innerHTML=this._liveResponse(q); },
  _currentQuestion(){ const m=this.modules[this.moduleIndex]; return this.questionIndex<m.questions.length ? m.questions[this.questionIndex] : null; },

  _back(){
    this._captureCurrent();
    if(this.questionIndex>0) this.questionIndex-=1;
    else if(this.moduleIndex>0){ this.moduleIndex-=1; this.questionIndex=this.modules[this.moduleIndex].questions.length; }
    this._savePosition(); this.render();
  },

  _advance(){
    const module=this.modules[this.moduleIndex];
    if(this.questionIndex<module.questions.length){
      const q=module.questions[this.questionIndex];
      if(!this._captureCurrent(true)) return;
      const message=this._ackMessage(q);
      return this._acknowledge(message,()=>{ this.questionIndex+=1; this._savePosition(); this.render(); });
    }
    if(this.moduleIndex<this.modules.length-1){ this.moduleIndex+=1; this.questionIndex=0; this._savePosition(); this.render(); }
    else { this.screen='generation'; this.render(); }
  },

  _captureCurrent(validate=false){
    const q=this._currentQuestion();
    if(!q) return true;
    if(q.type==='multiselect') this.data[q.key]=Array.from(document.querySelectorAll(`input[name="op_${q.key}"]:checked`)).map(el=>el.value);
    else if(q.type==='cards') this.data[q.key]=document.querySelector(`input[name="op_${q.key}"]:checked`)?.value || this.data[q.key];
    else {
      const el=document.querySelector(`#op_${q.key}`);
      if(el) this.data[q.key]=q.type==='number' ? (el.value===''?'':Number(el.value)) : el.value;
    }
    if(validate){ const message=this._validationMessage(q); if(message){ U.toast(message); return false; } }
    Store.saveOnboardingDraft(this.data);
    return true;
  },

  _validationMessage(q){
    const value=this.data[q.key];
    if(q.optional) return '';
    if(q.type==='multiselect' && (!Array.isArray(value)||value.length===0)) return 'Select at least one pattern.';
    if(q.type==='cards' && !value) return 'Select one option.';
    if(q.key==='name' && !String(value).trim()) return 'Enter an operator designation.';
    if(q.key==='birthDate' && this._ageFromBirthDate(value)==null) return 'Enter a valid date of birth.';
    if(q.key==='height' && !(Number(value)>80)) return 'Enter a valid height.';
    if((q.key==='currentWeight'||q.key==='goalWeight') && !(Number(value)>25)) return 'Enter a valid weight.';
    if(q.key==='requestedDays' && !(Number(value)>0)) return 'Enter a valid duration.';
    if((q.type==='text'||q.type==='textarea') && !String(value??'').trim()) return 'This record is required.';
    if(q.type==='select' && !value) return 'Select an option.';
    return '';
  },

  _ackMessage(q){
    const value=this.data[q.key];
    const custom={name:`Operator ${value} recognized.`,birthDate:`Age calculated: ${this._ageFromBirthDate(value)}.`,height:'Height synchronized.',currentWeight:'Starting baseline established.',requestedDays:'Deadline analysis complete.',primaryReason:'Campaign motive locked.',blockers:'Failure patterns mapped.',systemTone:'System voice synchronized.',campaignName:'Campaign designation accepted.'};
    return custom[q.key] || `${q.title} synchronized.`;
  },

  _acknowledge(message,done){
    const body=document.querySelector('.operator-init-body');
    const actions=document.querySelector('.operator-init-actions');
    if(!body) return done();
    if(actions) actions.classList.add('disabled');
    body.innerHTML=`<section class="sync-ack"><div class="sync-ack-ring">✓</div><span>SYNCHRONIZED</span><h2>${this._escape(message)}</h2><p>Record accepted. Continuing protocol.</p></section>`;
    this._timers.push(setTimeout(done,620));
  },

  _renderGeneration(){
    const overlay=document.createElement('div');
    overlay.className='operator-init-overlay';
    overlay.innerHTML=`<section class="campaign-generation-shell"><div class="sync-orb booting"><span>A</span><i></i><i></i><i></i></div><span class="operator-kicker">CAMPAIGN GENERATION</span><h1>Building First Campaign</h1><div class="generation-stream" id="generationStream"></div><div class="boot-progress"><span id="generationProgress"></span></div></section>`;
    document.body.appendChild(overlay); requestAnimationFrame(()=>overlay.classList.add('show'));
    const messages=['Validating Operator profile…','Comparing requested deadline…','Designing Phase I gates…','Configuring recovery protocol…','Finalizing campaign proposal…'];
    const stream=overlay.querySelector('#generationStream'); const bar=overlay.querySelector('#generationProgress');
    messages.forEach((message,index)=>this._timers.push(setTimeout(()=>{const line=document.createElement('div');line.innerHTML=`<span>0${index+1}</span><b>${message}</b><em>COMPLETE</em>`;stream.appendChild(line);requestAnimationFrame(()=>line.classList.add('visible'));bar.style.width=`${((index+1)/messages.length)*100}%`;},250+index*420)));
    this._timers.push(setTimeout(()=>this._complete(),2850));
  },

  _savePosition(){ Store.saveOnboardingState({started:true,moduleIndex:this.moduleIndex,questionIndex:this.questionIndex,step:this.moduleIndex,identityIndex:this.questionIndex}); },
  _ageFromBirthDate(value){ if(!value)return null;const birth=new Date(`${value}T00:00:00`);if(Number.isNaN(birth.getTime())||birth>new Date())return null;const now=new Date();let age=now.getFullYear()-birth.getFullYear();const before=now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate());if(before)age-=1;return age>=10&&age<=100?age:null; },
  _bmi(){ const h=Number(this.data.height)/100,w=Number(this.data.currentWeight);if(!(h>.8)||!(w>25))return null;return (w/(h*h)).toFixed(1); },
  _clearTimers(){ this._timers.forEach(clearTimeout); this._timers=[]; },
  _escape(value){ return String(value??'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch])); },

  _reality(){
    const current=Number(this.data.currentWeight)||1,target=Number(this.data.goalWeight)||current,requested=Math.max(1,Number(this.data.requestedDays)||20),change=Math.abs(current-target),loss=target<current;
    const conservativeWeekly=current*(loss?.005:.0025),fasterWeekly=current*(loss?.008:.005);
    const minDays=change===0?14:Math.max(14,Math.ceil((change/Math.max(fasterWeekly,.1))*7));
    const maxDays=change===0?28:Math.max(minDays,Math.ceil((change/Math.max(conservativeWeekly,.1))*7));
    const realistic=requested>=minDays,phaseDays=Math.max(14,Math.min(28,requested)),direction=Math.sign(target-current),phaseChange=Math.min(change,current*(loss?.025:.015)),phaseGoalWeight=(current+direction*phaseChange).toFixed(1);
    return {minDays,maxDays,phaseDays,phaseGoalWeight,status:realistic?'ACHIEVABLE RANGE':'DEADLINE TOO AGGRESSIVE',statusClass:realistic?'ok':'warn',message:realistic?'The requested deadline sits inside a plausible planning range. ASCEND will still use phases and adapt the ETA from real data.':'ASCEND will not pretend the full objective fits this deadline. Phase I will target execution and a smaller checkpoint while the total campaign ETA remains adaptive.'};
  },

  _complete(){
    const reality=this._reality(),age=this._ageFromBirthDate(this.data.birthDate);
    const operator=Object.assign({},this.data,{id:Store.getOperator().id||U.uid(),age,initializedAt:new Date().toISOString(),profileVersion:3,complete:true});
    Store.saveOperator(operator);
    Store.saveSettings({startWeight:Number(this.data.currentWeight),goalWeight:Number(this.data.goalWeight),height:Number(this.data.height),units:this.data.units||'kg',missionDays:reality.phaseDays,projectName:this.data.campaignName});
    const old=Store.getActiveCampaign();
    const campaign=Object.assign({},old,{id:old.id||`campaign-${U.uid()}`,name:this.data.campaignName,type:this.data.goalType,status:'ready',startWeight:Number(this.data.currentWeight),goalWeight:Number(this.data.goalWeight),requestedDays:Number(this.data.requestedDays),estimatedMinDays:reality.minDays,estimatedMaxDays:reality.maxDays,minimumDays:reality.phaseDays,phaseGoalWeight:Number(reality.phaseGoalWeight),primaryReason:this.data.primaryReason,currentPhaseId:'awakening',generatedAt:new Date().toISOString()});
    Store.saveCampaign(campaign); Store.setActiveCampaign(campaign.id); Store.clearOnboardingDraft(); Store.saveOnboardingState({started:true,moduleIndex:0,questionIndex:0,completedAt:new Date().toISOString()});
    document.querySelector('.operator-init-overlay')?.remove(); U.toast('Operator synchronized. Campaign ready.'); App.refreshHeader(); App.navigate('dashboard');
  }
};
