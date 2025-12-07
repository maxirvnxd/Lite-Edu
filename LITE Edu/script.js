// =========================================
// 1. SISTEM NAVIGASI
// =========================================
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    
    // Reset Submenu
    document.querySelectorAll('.content-container').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.menu-container').forEach(m => m.classList.remove('hidden'));

    const selected = document.getElementById(viewId);
    if(selected) {
        selected.classList.remove('hidden');
        selected.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// 2. SISTEM BUKA-TUTUP KONTEN
// =========================================
function openContent(contentId, menuId) {
    document.getElementById(menuId).classList.add('hidden');
    const content = document.getElementById(contentId);
    content.classList.remove('hidden');

    // Refresh Visualisasi MTK
    if(contentId === 'mtk-sim') {
        setTimeout(() => updateTrig(-Math.PI/4, 110, 110), 100);
    }
}

function closeContent(contentId, menuId) {
    document.getElementById(contentId).classList.add('hidden');
    document.getElementById(menuId).classList.remove('hidden');
}

// =========================================
// 3. KIMIA (pH Meter)
// =========================================
const probe = document.getElementById('ph-probe');
let isDragKimia = false;
let offsetKimiaX = 0; 
let offsetKimiaY = 0;

if(probe) {
    // Start Drag
    const startKimia = (clientX, clientY) => {
        isDragKimia = true;
        probe.style.cursor = 'grabbing';
        const rect = probe.getBoundingClientRect();
        offsetKimiaX = clientX - rect.left;
        offsetKimiaY = clientY - rect.top;
    };

    probe.addEventListener('mousedown', e => startKimia(e.clientX, e.clientY));
    probe.addEventListener('touchstart', e => {
        const t = e.touches[0];
        startKimia(t.clientX, t.clientY);
        e.preventDefault();
    }, {passive: false});

    // End Drag
    const endKimia = () => { isDragKimia = false; probe.style.cursor = 'grab'; };
    document.addEventListener('mouseup', endKimia);
    document.addEventListener('touchend', endKimia);

// Move Drag
    const moveKimia = (clientX, clientY) => {
        if(!isDragKimia) return;

        const container = document.querySelector('.lab-bench');
        const contRect = container.getBoundingClientRect();

        let newLeft = clientX - contRect.left - offsetKimiaX;
        let newTop = clientY - contRect.top - offsetKimiaY;

        probe.style.left = newLeft + 'px';
        probe.style.top = newTop + 'px';

        // --- UPDATE PENTING UNTUK RESPONSIVE ---
        // Kita hitung tinggi asli alat secara dinamis (agar support HP & PC)
        // offsetHeight akan mengambil tinggi alat yang sebenarnya (kecil di HP, besar di PC)
        const currentProbeHeight = probe.offsetHeight; 
        const currentProbeWidth = probe.offsetWidth;

        // Titik sensor ada di: Tengah Lebar alat, dan Paling Bawah alat
        const tipX = contRect.left + newLeft + (currentProbeWidth / 2);
        const tipY = contRect.top + newTop + currentProbeHeight;

        checkPh(tipX, tipY);
    };

    document.addEventListener('mousemove', e => {
        if(isDragKimia) { e.preventDefault(); moveKimia(e.clientX, e.clientY); }
    });
    
    document.addEventListener('touchmove', e => {
        if(isDragKimia) {
            e.preventDefault(); 
            const t = e.touches[0];
            moveKimia(t.clientX, t.clientY);
        }
    }, {passive: false});
}

function checkPh(tipX, tipY) {
    let hit = false;
    const screen = document.getElementById('probe-screen');
    const title = document.getElementById('ph-info-title');
    const desc = document.getElementById('ph-info-desc');
    const reason = document.getElementById('chem-reasoning');

    document.querySelectorAll('.beaker').forEach(b => {
        const r = b.getBoundingClientRect();
        // Area cairan (35% dari atas gelas sampai bawah)
        const liquidTop = r.top + (r.height * 0.35);

        if(tipX >= r.left && tipX <= r.right && tipY >= liquidTop && tipY <= r.bottom) {
            hit = true;
            screen.textContent = b.dataset.ph;
            title.textContent = "Terdeteksi: " + b.dataset.name;
            desc.textContent = b.dataset.desc;
            reason.innerHTML = `<span style="color:#d32f2f; font-weight:bold;">Analisis pH ${b.dataset.ph}:</span> ${b.dataset.reason}`;
            reason.style.border = `2px solid ${varToHex(b.dataset.ph)}`;
        }
    });

    if(!hit) {
        screen.textContent = "--";
    }
}

function varToHex(ph) {
    if(ph < 7) return "#e53935";
    if(ph == 7) return "#1e88e5";
    return "#43a047";
}

// =========================================
// 4. FISIKA (Newton)
// =========================================
let mass = 10;
const force = 500;

window.setMass = function(val) {
    mass = val;
    document.getElementById('physics-box').textContent = val + "kg";
    document.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('newton-explanation').classList.add('hidden');
    document.getElementById('acc-display').textContent = "a: 0 m/s²";
    document.getElementById('physics-box').style.left = '10px';
};

const btnPush = document.getElementById('btn-push');
if(btnPush) {
    btnPush.addEventListener('click', () => {
        const box = document.getElementById('physics-box');
        const a = force / mass;
        
        document.getElementById('acc-display').textContent = `a: ${a} m/s²`;
        
        let dur = 30 / a;
        if(dur > 3) dur = 3; if(dur < 0.5) dur = 0.5;

        box.style.transition = `left ${dur}s cubic-bezier(0.25, 1, 0.5, 1)`;
        box.style.left = "calc(100% - 70px)";

        const expBox = document.getElementById('newton-explanation');
        let text = mass === 10 ? "Ringan, melesat cepat." : (mass === 50 ? "Sedang." : "Berat, gerak lambat.");
        
        expBox.innerHTML = `
            <h4 style="margin-top:0; color:var(--primary)">📊 Analisis Hukum Newton II</h4>
            <p>${text}</p>
            <div style="background:#f0f7ff; padding:10px; border-radius:8px; margin-top:10px; font-weight:bold;">
                a = F / m = ${force} / ${mass} = ${a} m/s²
            </div>
        `;
        expBox.classList.remove('hidden');

        setTimeout(() => { box.style.transition='none'; box.style.left='10px'; }, 3000);
    });
}

// =========================================
// 5. MATEMATIKA (Trigonometri)
// =========================================
const unitCircle = document.getElementById('unit-circle');
const circleRadius = 110; 
let isDragMtk = false;

function handleCircleInteraction(clientX, clientY) {
    const rect = unitCircle.getBoundingClientRect();
    const centerX = rect.left + circleRadius;
    const centerY = rect.top + circleRadius;
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    updateTrig(angle, circleRadius, circleRadius);
}

if(unitCircle) {
    unitCircle.addEventListener('mousedown', e => { isDragMtk=true; handleCircleInteraction(e.clientX, e.clientY); });
    document.addEventListener('mousemove', e => { if(isDragMtk) { e.preventDefault(); handleCircleInteraction(e.clientX, e.clientY); } });
    document.addEventListener('mouseup', () => isDragMtk=false);

    unitCircle.addEventListener('touchstart', e => {
        isDragMtk=true; 
        handleCircleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive:false});
    
    document.addEventListener('touchmove', e => {
        if(isDragMtk) {
            e.preventDefault(); 
            handleCircleInteraction(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, {passive:false});
}

function updateTrig(rad, cx, cy) {
    const r = 100;
    const x = Math.cos(rad) * r;
    const y = Math.sin(rad) * r;

    const dot = document.getElementById('dot');
    if(dot) {
        dot.style.transform = `translate(${x}px, ${y}px)`;
        dot.style.left = "50%"; dot.style.top = "50%";
    }

    const lSin = document.getElementById('line-sin');
    if(lSin) {
        lSin.style.height = Math.abs(y) + 'px';
        lSin.style.left = (cx + x) + 'px';
        lSin.style.top = (y > 0) ? cx + 'px' : (cx + y) + 'px';
    }

    const lCos = document.getElementById('line-cos');
    if(lCos) {
        lCos.style.width = Math.abs(x) + 'px';
        lCos.style.top = (cy + y) + 'px';
        lCos.style.left = (x > 0) ? cy + 'px' : (cy + x) + 'px';
    }
    
    const lRad = document.getElementById('line-rad');
    if(lRad) {
        const degRaw = rad * (180/Math.PI);
        lRad.style.width = r + 'px';
        lRad.style.top = cy + 'px';
        lRad.style.left = cx + 'px';
        lRad.style.transform = `rotate(${degRaw}deg)`;
    }

    let deg = rad * (180/Math.PI);
    if(deg < 0) deg += 360;

    const vDeg = document.getElementById('val-deg');
    if(vDeg) vDeg.textContent = deg.toFixed(0) + "°";
    
    const vSin = document.getElementById('val-sin');
    if(vSin) vSin.textContent = Math.sin(rad).toFixed(2);
    
    const vCos = document.getElementById('val-cos');
    if(vCos) vCos.textContent = Math.cos(rad).toFixed(2);
}

// =========================================
// 6. BIOLOGI (Genetika)
// =========================================
const slots = [document.querySelector('.s1'), document.querySelector('.s2')];
let filled = 0;
let genes = [];
let selectedGene = null;

document.querySelectorAll('.gamete').forEach(g => {
    g.addEventListener('dragstart', e => { e.dataTransfer.setData('gene', g.dataset.g); });
    g.addEventListener('click', () => {
        document.querySelectorAll('.gamete').forEach(x => x.style.border = '2px solid var(--primary)');
        g.style.border = '3px solid #e53935'; 
        selectedGene = g.dataset.g;
    });
});

const offBox = document.querySelector('.offspring-box');
if(offBox) {
    offBox.addEventListener('dragover', e => e.preventDefault());
    offBox.addEventListener('drop', e => {
        e.preventDefault();
        addGene(e.dataTransfer.getData('gene'));
    });
    offBox.addEventListener('click', () => {
        if(selectedGene) {
            addGene(selectedGene);
            selectedGene = null;
            document.querySelectorAll('.gamete').forEach(x => x.style.border = '2px solid var(--primary)');
        }
    });
}

function addGene(gene) {
    if(filled < 2 && slots[filled]) {
        slots[filled].textContent = gene;
        genes.push(gene);
        filled++;
        
        if(filled === 2) {
            genes.sort();
            const gStr = genes.join('');
            const res = document.querySelector('.flower-res');
            const info = document.getElementById('bio-info');
            
            res.classList.remove('hidden');
            if(gStr === 'mm') res.style.filter = "grayscale(100%) brightness(200%)"; 
            else res.style.filter = "none";
            
            info.innerHTML = `<h4>Hasil: ${gStr}</h4><p>${gStr==='mm'?'Putih':'Merah'}</p> <button onclick="resetBio()" style="margin-top:5px;">Ulangi</button>`;
        }
    }
}

window.resetBio = function() {
    filled=0; genes=[]; 
    slots.forEach(s => s.textContent='');
    document.querySelector('.flower-res').classList.add('hidden');
    document.getElementById('bio-info').innerHTML = `<h4>Mulai</h4><p>Pilih gamet.</p>`;
};

