/* ==========================================================================
   MISSION 89 — Progress Photos
   Photos are downscaled client-side and stored as base64 in localStorage.
   ========================================================================== */
const Photos = {
  today: U.todayStr(),

  render(){
    const all = Store.getPhotos();
    const todayPhotos = all[this.today] || {};

    const slots = ['front','side','back'].map(slot => {
      const src = todayPhotos[slot];
      return `
        <div class="photo-slot" data-slot="${slot}">
          ${src ? `<img src="${src}" alt="${slot} photo">` : `
            <div class="photo-slot-empty">
              ${ICONS.plus.replace('18px','20px')}
              <span style="font-size:10px;font-weight:800;text-transform:uppercase;">${slot}</span>
            </div>`}
          <div class="photo-slot-label">${slot}</div>
        </div>`;
    }).join('');

    // history grouped by date, most recent first, excluding today (already shown above)
    const dates = Object.keys(all).filter(d => d !== this.today).sort().reverse();
    let historyHtml = '';
    dates.forEach(date => {
      const p = all[date];
      historyHtml += `
        <div class="photo-log-date">${U.prettyDateFull(date)}</div>
        <div class="photo-grid">
          ${['front','side','back'].map(slot => `
            <div class="photo-slot">
              ${p[slot] ? `<img src="${p[slot]}" alt="${slot}">` : `<div class="photo-slot-empty"><span style="font-size:10px;font-weight:800;text-transform:uppercase;">${slot}</span></div>`}
              <div class="photo-slot-label">${slot}</div>
            </div>`).join('')}
        </div>`;
    });

    const html = `
      <div>
        <div class="page-title">Progress Photos</div>
        <div class="page-sub">Visual proof beats the scale</div>
      </div>

      <div class="card">
        <span class="section-label" style="margin:0 0 12px 0;">Today · ${U.prettyDate(this.today)}</span>
        <div class="photo-grid">${slots}</div>
      </div>

      ${dates.length ? `<span class="section-label">History</span><div class="photo-log-group">${historyHtml}</div>` : ''}

      <input type="file" accept="image/*" capture="environment" id="photoInput" class="hidden">
    `;

    document.getElementById('photosContent').innerHTML = html;
    this._bind();
  },

  _bind(){
    const input = document.getElementById('photoInput');
    let activeSlot = null;

    document.querySelectorAll('.photo-slot[data-slot]').forEach(el => {
      el.onclick = () => {
        activeSlot = el.dataset.slot;
        input.click();
      };
    });

    input.onchange = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      this._resizeAndStore(file, (dataUrl) => {
        Store.savePhoto(this.today, activeSlot, dataUrl);
        U.toast('Photo saved ✓');
        this.render();
      });
      input.value = '';
    };
  },

  _resizeAndStore(file, callback){
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if(width > height && width > maxDim){
          height = Math.round(height * (maxDim/width)); width = maxDim;
        } else if(height > maxDim){
          width = Math.round(width * (maxDim/height)); height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try{
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          callback(dataUrl);
        }catch(err){
          U.toast('Could not process photo');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
