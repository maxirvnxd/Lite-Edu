// === LOGIKA NAVIGASI UTAMA ===
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    // Reset state submenu saat ganti tab
    document.querySelectorAll('.content-container').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.menu-container').forEach(m => m.classList.remove('hidden'));

    const selected = document.getElementById(viewId);
    if(selected) {
        selected.classList.remove('hidden');
        selected.classList.add('active');
    }
}

// === LOGIKA MENU KE KONTEN ===
function openContent(contentId, menuId) {
    document.getElementById(menuId).classList.add('hidden');
    const content = document.getElementById(contentId);
    content.classList.remove('hidden');

    // Refresh visual jika perlu (terutama MTK)
    if(contentId === 'mtk-sim') updateTrig(-Math.PI/4, 100, 100);
}

function closeContent(contentId, menuId) {
    document.getElementById(contentId).classList.add('hidden');
    document.getElementById(menuId).classList.remove('hidden');
}

// === KIMIA (pH) ===
const probe = document.getElementById('ph-probe');
let isDrag = false;
if(probe) {
    probe.addEventListener('mousedown', () => { isDrag = true; probe.style.cursor='grabbing'; });
    document.addEventListener('mouseup', () => { isDrag = false; probe.style.cursor='grab'; });
    document.addEventListener('mousemove', (e) => {
        if(!isDrag) return;
        const rect = document.querySelector('.lab-bench').getBoundingClientRect();
        probe.style.left = (e.clientX - rect.left - 30) + 'px';
        probe.style.top = (e.clientY - rect.top - 10) + 'px';
        checkPh(e.clientX, e.clientY);
    });
}
function checkPh(x, y) {
    let hit = false;
    document.querySelectorAll('.beaker').forEach(b => {
        const r = b.getBoundingClientRect();
        if(x > r.left && x < r.right && y > r.top) {
            hit = true;
            document.getElementById('probe-screen').textContent = b.dataset.ph;
            document.getElementById('ph-info-title').textContent = "pH " + b.dataset.ph;
            document.getElementById('ph-info-desc').textContent = b.dataset.desc;
        }
    });
    if(!hit) document.getElementById('probe-screen').textContent = "--";
}

// === FISIKA (Newton) ===
let mass = 10;
function setMass(val) {
    mass = val;
    document.getElementById('physics-box').textContent = val + "kg";
    document.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}
document.getElementById('btn-push').addEventListener('click', () => {
    const box = document.getElementById('physics-box');
    const a = 500 / mass;
    document.getElementById('acc-display').textContent = `a: ${a} m/s²`;
    box.style.transition = `left ${30/a}s cubic-bezier(0.25, 1, 0.5, 1)`;
    box.style.left = "calc(100% - 70px)";
    setTimeout(() => { box.style.transition='none'; box.style.left='10px'; }, 2000);
});

// === MTK (Trigono) ===
document.getElementById('unit-circle').addEventListener('mousemove', (e) => {
    const rect = e.target.closest('#unit-circle').getBoundingClientRect();
    const x = e.clientX - rect.left - 100;
    const y = e.clientY - rect.top - 100;
    updateTrig(Math.atan2(y, x), 100, 100);
});
function updateTrig(rad, cx, cy) {
    const r = 100;
    const x = Math.cos(rad) * r;
    const y = Math.sin(rad) * r;
    document.getElementById('dot').style.transform = `translate(${x}px, ${y}px)`; // Fix visual center
    document.getElementById('dot').style.left = "50%"; // Reset to center base
    document.getElementById('dot').style.top = "50%";
    
    document.getElementById('line-sin').style.height = Math.abs(y) + 'px';
    document.getElementById('line-sin').style.left = (100 + x) + 'px';
    document.getElementById('line-sin').style.top = (y > 0) ? '100px' : (100 + y) + 'px';
    
    document.getElementById('line-cos').style.width = Math.abs(x) + 'px';
    document.getElementById('line-cos').style.top = (100 + y) + 'px';
    document.getElementById('line-cos').style.left = (x > 0) ? '100px' : (100 + x) + 'px';
    
    let deg = (rad * 180 / Math.PI); if(deg < 0) deg += 360;
    document.getElementById('val-deg').textContent = deg.toFixed(0) + "°";
    document.getElementById('val-sin').textContent = Math.sin(rad).toFixed(2);
    document.getElementById('val-cos').textContent = Math.cos(rad).toFixed(2);
}

// === BIOLOGI ===
const slots = [document.querySelector('.s1'), document.querySelector('.s2')];
let filled = 0;
let genes = [];
document.querySelectorAll('.gamete').forEach(g => {
    g.addEventListener('dragstart', (e) => { e.dataTransfer.setData('gene', g.dataset.g); });
});
const offBox = document.querySelector('.offspring-box');
offBox.addEventListener('dragover', (e) => e.preventDefault());
offBox.addEventListener('drop', (e) => {
    e.preventDefault();
    if(filled < 2) {
        const gene = e.dataTransfer.getData('gene');
        slots[filled].textContent = gene;
        genes.push(gene);
        filled++;
        if(filled === 2) {
            genes.sort();
            const res = document.querySelector('.flower-res');
            res.classList.remove('hidden');
            const gStr = genes.join('');
            if(gStr === 'mm') res.style.filter = "grayscale(100%) brightness(200%)"; // Putih
            else res.style.filter = "none"; // Merah
            
            document.getElementById('bio-info').innerHTML = `<h4>Hasil: ${gStr}</h4><p>${gStr==='mm'?'Bunga Putih':'Bunga Merah'}</p> <button onclick="resetBio()">Reset</button>`;
        }
    }
});
window.resetBio = function() {
    filled=0; genes=[]; slots.forEach(s=>s.textContent='');
    document.querySelector('.flower-res').classList.add('hidden');
    document.getElementById('bio-info').innerHTML = `<h4>Mulai Lagi</h4><p>Tarik gamet.</p>`;
};
