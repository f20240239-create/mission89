/* ========================================================================== 
   ASCEND — Mess Allocation Engine
   Quantities, not recipes. Uses practical mess units and remaining macros.
   Estimates are intentionally labelled as estimates.
   ========================================================================== */
const MESS_FOODS = [
  {id:'dal',name:'Dal',unit:'katori',label:'katori',kcal:190,protein:10,carbs:28,fat:5,max:3,step:.5},
  {id:'rajma',name:'Rajma',unit:'katori',label:'katori',kcal:230,protein:12,carbs:38,fat:4,max:3,step:.5},
  {id:'chole',name:'Chole',unit:'katori',label:'katori',kcal:250,protein:12,carbs:36,fat:8,max:3,step:.5},
  {id:'kala-chana',name:'Kala Chana',unit:'katori',label:'katori',kcal:240,protein:13,carbs:38,fat:5,max:3,step:.5},
  {id:'rice',name:'Cooked Rice',unit:'katori',label:'katori',kcal:240,protein:5,carbs:52,fat:1,max:1.5,step:.5},
  {id:'roti',name:'Roti',unit:'piece',label:'roti',kcal:110,protein:3.5,carbs:21,fat:2,max:3,step:1},
  {id:'paneer',name:'Paneer Curry',unit:'ladle',label:'serving spoon',kcal:185,protein:10,carbs:6,fat:14,max:4,step:.5},
  {id:'soy',name:'Soya Chunk Curry',unit:'katori',label:'katori',kcal:210,protein:20,carbs:22,fat:5,max:3,step:.5},
  {id:'curd',name:'Curd',unit:'katori',label:'katori',kcal:115,protein:6,carbs:8,fat:6,max:2,step:.5},
  {id:'raita',name:'Raita',unit:'katori',label:'katori',kcal:130,protein:6,carbs:10,fat:7,max:2,step:.5},
  {id:'milk',name:'Milk',unit:'glass',label:'glass',kcal:155,protein:8,carbs:12,fat:8,max:3,step:.5},
  {id:'buttermilk',name:'Buttermilk',unit:'glass',label:'glass',kcal:75,protein:4,carbs:9,fat:2,max:3,step:1},
  {id:'veg',name:'Dry Vegetable',unit:'ladle',label:'serving spoon',kcal:105,protein:3,carbs:14,fat:4,max:4,step:.5},
  {id:'sabzi-gravy',name:'Gravy Sabzi',unit:'ladle',label:'serving spoon',kcal:150,protein:4,carbs:16,fat:8,max:4,step:.5},
  {id:'salad',name:'Salad',unit:'bowl',label:'bowl',kcal:45,protein:2,carbs:9,fat:0,max:3,step:1},
  {id:'idli',name:'Idli',unit:'piece',label:'piece',kcal:65,protein:2,carbs:13,fat:.5,max:6,step:1},
  {id:'sambar',name:'Sambar',unit:'katori',label:'katori',kcal:145,protein:7,carbs:22,fat:4,max:3,step:.5},
  {id:'poha',name:'Poha',unit:'katori',label:'katori',kcal:260,protein:6,carbs:48,fat:6,max:2.5,step:.5},
  {id:'upma',name:'Upma',unit:'katori',label:'katori',kcal:270,protein:7,carbs:45,fat:7,max:2.5,step:.5},
  {id:'bread',name:'Bread',unit:'piece',label:'slice',kcal:75,protein:3,carbs:14,fat:1,max:6,step:1},
  {id:'egg',name:'Whole Egg',unit:'piece',label:'egg',kcal:72,protein:6.3,carbs:.4,fat:5,max:6,step:1},
  {id:'egg-white',name:'Egg White',unit:'piece',label:'white',kcal:17,protein:3.6,carbs:.2,fat:0,max:10,step:1},
  {id:'chicken',name:'Chicken Curry',unit:'ladle',label:'serving spoon',kcal:190,protein:22,carbs:5,fat:9,max:4,step:.5},
  {id:'dessert',name:'Dessert / Sweet',unit:'piece',label:'portion',kcal:240,protein:4,carbs:38,fat:8,max:2,step:1}
];

const Nutrition = {
  selected:new Set(), allocation:null,
  render(){
    const settings=Store.getSettings(),today=U.todayStr(),checkin=Store.getCheckin(today)||{},profile=Store.getMessProfile();
    const cal=Number(checkin.calories)||0,pro=Number(checkin.protein)||0,water=Number(checkin.water)||0;
    const calRemain=Math.max(0,settings.calorieTarget-cal),proRemain=Math.max(0,settings.proteinTarget-pro);
    document.getElementById('nutritionContent').innerHTML=`
      <div><div class="page-title">Fuel</div><div class="page-sub">Quantities, not recipes.</div></div>
      <div class="card nutrition-status-card">
        <span class="eyebrow">REMAINING TODAY</span>
        <div class="nutrition-remaining"><div><b>${Math.round(calRemain)}</b><span>kcal</span></div><div><b>${Math.round(proRemain)}</b><span>g protein</span></div><div><b>${Math.max(0,settings.waterTarget-water).toFixed(1)}</b><span>L water</span></div></div>
        <small>ASCEND allocates the next plate against what remains. Mess portions are estimates, not laboratory measurements.</small>
      </div>
      <div class="card mess-profile-mini">
        <div><span class="eyebrow">MESS PORTION PROFILE</span><p>1 katori ≈ ${profile.katoriMl} ml · 1 serving spoon ≈ ${profile.ladleMl} ml · 1 glass ≈ ${profile.glassMl} ml</p></div>
        <button class="btn btn-ghost btn-small" onclick="Nutrition.editProfile()">Calibrate</button>
      </div>
      <div class="card allocation-controls">
        <span class="eyebrow">MEAL CONTEXT</span>
        <div class="choice-row" id="mealContext"><button class="active" data-value="normal">Normal</button><button data-value="pre">Pre-workout</button><button data-value="post">Post-workout</button><button data-value="last">Last meal</button></div>
        <div class="choice-row" id="hungerLevel"><button data-value="light">Light</button><button class="active" data-value="normal">Normal hunger</button><button data-value="high">Very hungry</button></div>
      </div>
      <span class="section-label">What is available?</span>
      <div class="food-select-grid">${MESS_FOODS.map(f=>`<button class="food-choice ${this.selected.has(f.id)?'selected':''}" data-food="${f.id}"><b>${f.name}</b><small>per ${f.label}: ${f.kcal} kcal · ${f.protein}g P</small></button>`).join('')}</div>
      <button class="btn btn-primary" id="generatePlate">Generate My Plate</button>
      <div id="allocationResult">${this.allocation?this._renderAllocation(this.allocation):''}</div>
      <button class="btn btn-ghost" onclick="App.navigate('checkin')">Manual Macro Check-in</button>`;
    this._bind(calRemain,proRemain);
  },
  _bind(calRemain,proRemain){
    document.querySelectorAll('.food-choice').forEach(b=>b.onclick=()=>{ this.selected.has(b.dataset.food)?this.selected.delete(b.dataset.food):this.selected.add(b.dataset.food); b.classList.toggle('selected'); });
    document.querySelectorAll('.choice-row button').forEach(b=>b.onclick=()=>{ b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active'); });
    document.getElementById('generatePlate').onclick=()=>{
      if(!this.selected.size){U.toast('Select the foods currently available.');return;}
      const context=document.querySelector('#mealContext .active')?.dataset.value||'normal',hunger=document.querySelector('#hungerLevel .active')?.dataset.value||'normal';
      this.allocation=this.allocate([...this.selected],calRemain,proRemain,context,hunger);
      document.getElementById('allocationResult').innerHTML=this._renderAllocation(this.allocation);
      this._bindResult();
    };
    this._bindResult();
  },
  allocate(ids,calRemain,proRemain,context='normal',hunger='normal'){
    const foods=ids.map(id=>MESS_FOODS.find(f=>f.id===id)).filter(Boolean);
    const hungerFactor={light:.55,normal:.72,high:.88}[hunger]||.72;
    let targetCalories=Math.min(Math.max(250,calRemain*hungerFactor),context==='last'?Math.max(300,calRemain):900);
    if(context==='pre') targetCalories=Math.min(targetCalories,600);
    const targetProtein=Math.min(proRemain,context==='post'?Math.max(35,proRemain*.55):Math.max(20,proRemain*.38));
    let states=[{items:[],kcal:0,protein:0,carbs:0,fat:0}];
    foods.forEach(food=>{
      const options=[]; for(let q=food.step;q<=food.max+1e-6;q+=food.step) options.push(Number(q.toFixed(1)));
      const expanded=[...states];
      states.forEach(s=>options.forEach(q=>{ const kcal=s.kcal+food.kcal*q;if(kcal>Math.max(targetCalories*1.35,1100))return;expanded.push({items:[...s.items,{food,q}],kcal,protein:s.protein+food.protein*q,carbs:s.carbs+food.carbs*q,fat:s.fat+food.fat*q}); }));
      states=expanded.sort((a,b)=>this._score(a,targetCalories,targetProtein,context)-this._score(b,targetCalories,targetProtein,context)).slice(0,1800);
    });
    let best=states.filter(s=>s.items.length).sort((a,b)=>this._score(a,targetCalories,targetProtein,context)-this._score(b,targetCalories,targetProtein,context))[0];
    if(!best) best={items:[],kcal:0,protein:0,carbs:0,fat:0};
    return {...best,targetCalories,targetProtein,context,hunger,calRemain,proRemain};
  },
  _score(s,targetCal,targetPro,context){
    const calPenalty=Math.abs(s.kcal-targetCal)*.12;
    const proteinDeficit=Math.max(0,targetPro-s.protein)*5;
    const proteinBonus=-Math.min(s.protein,targetPro)*.25;
    const overPenalty=Math.max(0,s.kcal-targetCal)*.25;
    const riceDessertPenalty=context==='last'?s.items.filter(i=>['rice','dessert'].includes(i.food.id)).reduce((a,i)=>a+i.q*25,0):0;
    return calPenalty+proteinDeficit+overPenalty+proteinBonus+riceDessertPenalty;
  },
  _qty(item){ const q=item.q,label=item.food.label; const n=Number.isInteger(q)?q:q.toFixed(1).replace('.0',''); return `${n} ${label}${q>1&&!['rice','dal'].includes(label)?'s':''}`; },
  _renderAllocation(a){
    if(!a.items.length)return '<div class="card empty-state"><b>No usable allocation found.</b><span>Add at least one substantial food.</span></div>';
    const rows=a.items.map(i=>`<div class="plate-row"><span><b>${i.food.name}</b><small>${Math.round(i.food.kcal*i.q)} kcal · ${(i.food.protein*i.q).toFixed(1)}g protein</small></span><strong>${this._qty(i)}</strong></div>`).join('');
    const remainingCal=Math.max(0,a.calRemain-a.kcal),remainingPro=Math.max(0,a.proRemain-a.protein);
    return `<section class="card generated-plate"><span class="eyebrow">RECOMMENDED PLATE</span><h2>Take this much.</h2>${rows}<div class="plate-total"><span>Estimated meal</span><b>${Math.round(a.kcal)} kcal · ${a.protein.toFixed(0)}g P</b></div><div class="plate-after"><span>After this meal</span><b>${Math.round(remainingCal)} kcal · ${remainingPro.toFixed(0)}g protein remain</b></div><p>Estimate based on your utensil profile. Oil, recipe and serving density can shift the real value. Consistency matters more than fake precision.</p><button class="btn btn-primary" id="logAllocation">Log Estimated Meal</button></section>`;
  },
  _bindResult(){ const btn=document.getElementById('logAllocation');if(btn)btn.onclick=()=>this.logAllocation(); },
  logAllocation(){
    if(!this.allocation)return;
    const today=U.todayStr(),checkin=Store.getCheckin(today)||{};
    const meal={date:today,items:this.allocation.items.map(i=>({id:i.food.id,name:i.food.name,quantity:i.q,unit:i.food.label})),calories:Math.round(this.allocation.kcal),protein:Number(this.allocation.protein.toFixed(1)),carbs:Number(this.allocation.carbs.toFixed(1)),fat:Number(this.allocation.fat.toFixed(1)),estimated:true};
    Store.saveMealAllocation(meal);
    Store.saveCheckin(today,{calories:(Number(checkin.calories)||0)+meal.calories,protein:(Number(checkin.protein)||0)+meal.protein});
    U.toast('Estimated meal logged. Remaining targets recalculated.'); this.allocation=null;this.selected.clear();this.render();
  },
  editProfile(){
    const p=Store.getMessProfile(),k=Number(prompt('Approximate katori capacity in ml:',p.katoriMl)),l=Number(prompt('Approximate serving spoon / ladle capacity in ml:',p.ladleMl)),g=Number(prompt('Approximate glass capacity in ml:',p.glassMl));
    if([k,l,g].every(x=>Number.isFinite(x)&&x>=50&&x<=600)){Store.saveMessProfile({katoriMl:k,ladleMl:l,glassMl:g});U.toast('Mess portion profile updated.');this.render();}else U.toast('Use realistic values between 50 and 600 ml.');
  }
};
