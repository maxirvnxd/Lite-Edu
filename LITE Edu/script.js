// =========================================
// 1. SISTEM NAVIGASI (VITAL)
// =========================================
function showView(viewId) {
    // Sembunyikan semua Halaman Utama (.view)
    const allViews = document.querySelectorAll('.view');
    allViews.forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    // Tampilkan Halaman yang Dipilih
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
    }

    // Reset Sub-Menu (Agar saat balik, menu terbuka dulu, bukan isinya)
    document.querySelectorAll('.content-container').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.menu-container').forEach(m => m.classList.remove('hidden'));

    // Scroll ke atas otomatis
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// 2. SISTEM BUKA-TUTUP MATERI (SUB-KONTEN)
// =========================================
function openContent(contentId, menuId) {
    document.getElementById(menuId).classList.add('hidden');
    const content = document.getElementById(contentId);
    content.classList.remove('hidden');

    // Refresh Visualisasi Matematika (Agar tidak gepeng saat dibuka)
    if(contentId === 'mtk-sim') {
        setTimeout(() => updateTrig(-Math.PI/4, 110, 110), 100);
    }
}

function closeContent(contentId, menuId) {
    document.getElementById(contentId).classList.add('hidden');
    document.getElementById(menuId).classList.remove('hidden');
}

// =========================================
// 3. SIMULASI KIMIA (pH Meter)
// =========================================
const probe = document.getElementById('ph-probe');
let isDragKimia = false;
let offsetKimiaX = 0; 
let offsetKimiaY = 0;

if(probe) {
    // START DRAG
    const startHandler = (clientX, clientY) => {
        isDragKimia = true;
        probe.style.cursor = 'grabbing';
        
        // Hitung jarak klik mouse ke pojok kiri atas elemen probe
        const rect = probe.getBoundingClientRect();
        offsetKimiaX = clientX - rect.left;
        offsetKimiaY = clientY - rect.top;
    };

    probe.addEventListener('mousedown', (e) => startHandler(e.clientX, e.clientY));
    probe.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startHandler(touch.clientX, touch.clientY);
        e.preventDefault(); 
    }, {passive: false});

    // END DRAG
    const endHandler = () => { isDragKimia = false; probe.style.cursor = 'grab'; };
    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchend', endHandler);

    // MOVE DRAG
    const moveHandler = (clientX, clientY) => {
        if(!isDragKimia) return;

        const container = document.querySelector('.lab-bench');
        const contRect = container.getBoundingClientRect();

        // Pindahkan Probe
        let newLeft = clientX - contRect.left - offsetKimiaX;
        let newTop = clientY - contRect.top - offsetKimiaY;

        probe.style.left = newLeft + 'px';
        probe.style.top = newTop + 'px';

        // DETEKSI COLLISION (Ujung Sensor)
        const probeTotalHeight = 220; // Estimasi jarak dari atas alat ke ujung hitam
        const probeCenterWidth = 45;  // Setengah lebar alat

        const tipX = contRect.left + newLeft + probeCenterWidth; 
        const tipY = contRect.top + newTop + probeTotalHeight;

        checkPh(tipX, tipY);
    };

    document.addEventListener('mousemove', (e) => {
        if(isDragKimia) { e.preventDefault(); moveHandler(e.clientX, e.clientY); }
    });
    
    document.addEventListener('touchmove', (e) => {
        if(isDragKimia) {
            e.preventDefault(); 
            const t = e.touches[0];
            moveHandler(t.clientX, t.clientY);
        }
    }, {passive: false});
}

function checkPh(tipX, tipY) {
    let hit = false;
    
    const screen = document.getElementById('probe-screen');
    const infoTitle = document.getElementById('ph-info-title');
    const infoDesc = document.getElementById('ph-info-desc');
    const reasoning = document.getElementById('chem-reasoning');

    document.querySelectorAll('.beaker').forEach(b => {
        const r = b.getBoundingClientRect();
        
        // Logika Deteksi: Ujung sensor harus masuk ke dalam area CAIRAN
        const liquidTop = r.top + (r.height * 0.35); // Permukaan air

        if(tipX >= r.left && tipX <= r.right && tipY >= liquidTop && tipY <= r.bottom) {
            hit = true;
            
            screen.textContent = b.dataset.ph;
            infoTitle.textContent = "Terdeteksi: " + b.dataset.name;
            infoDesc.textContent = b.dataset.desc;

            reasoning.innerHTML = `<span style="color:#d32f2f; font-weight:bold;">Analisis pH ${b.dataset.ph}:</span> ${b.dataset.reason}`;
            reasoning.style.border = `2px solid ${varToHex(b.dataset.ph)}`;
            reasoning.style.background = "#fff";
        }
    });

    if(!hit) {
        screen.textContent = "--";
    }
}

// Fungsi Bantuan Warna Kimia
function varToHex(ph) {
    if(ph < 7) return "#e53935"; // Merah
    if(ph == 7) return "#1e88e5"; // Biru
    return "#43a047"; // Hijau
}

// =========================================
// 4. SIMULASI FISIKA (Hukum Newton)
// =========================================
let mass = 10;
const force = 500;

window.setMass = function(val) {
    mass = val;
    document.getElementById('physics-box').textContent = val + "kg";
    document.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    // Reset
    document.getElementById('newton-explanation').classList.add('hidden');
    document.getElementById('acc-display').textContent = "a: 0 m/s²";
    document.getElementById('physics-box').style.left = '10px';
};

const btnPush = document.getElementById('btn-push');
if(btnPush) {
    btnPush.addEventListener('click', () => {
        const box = document.getElementById('physics-box');
        const a = force / mass;
        
        // Update Display Singkat
        document.getElementById('acc-display').textContent = `a: ${a} m/s²`;
        
        // Animasi
        let dur = 30 / a;
        if(dur > 3) dur = 3; if(dur < 0.5) dur = 0.5;

        box.style.transition = `left ${dur}s cubic-bezier(0.25, 1, 0.5, 1)`;
        box.style.left = "calc(100% - 70px)";

        // Tampilkan Penjelasan
        const expBox = document.getElementById('newton-explanation');
        let analysisText = "";

        if (mass === 10) {
            analysisText = "Benda ini <b>sangat ringan</b>. Karena massanya kecil, gaya 500N memberikan dampak percepatan yang sangat besar. Benda melesat dengan cepat.";
        } else if (mass === 50) {
            analysisText = "Benda ini memiliki <b>massa sedang</b>. Percepatannya standar.";
        } else {
            analysisText = "Benda ini <b>sangat berat</b>. Karena inersia besar, gaya 500N kesulitan menggerakkan benda ini.";
        }
        
        expBox.innerHTML = `
            <h4 style="margin-top:0; color:var(--primary)">📊 Analisis Hukum Newton II</h4>
            <p>${analysisText}</p>
            <h5 style="margin-top:15px; border-bottom:1px solid #ddd; padding-bottom:5px;">🧮 Perhitungan Rumus</h5>
            <div style="background:#f0f7ff; padding:10px; border-radius:8px; margin-top:10px; font-family:'Courier New', monospace; font-weight:bold; color:#333;">
                a = F / m <br>
                a = ${force} / ${mass} <br>
                a = ${a} m/s²
            </div>
        `;
        expBox.classList.remove('hidden');

        setTimeout(() => { box.style.transition='none'; box.style.left='10px'; }, 3000);
    });
}

// =========================================
// 5. SIMULASI MATEMATIKA (Trigonometri)
// =========================================
const unitCircle = document.getElementById('unit-circle');
const circleRadius = 110; 
let isDragMtk = false;

function handleCircleInteraction(clientX, clientY) {
    const rect = unitCircle.getBoundingClientRect();
    const centerX = rect.left + circleRadius;
    const centerY = rect.top + circleRadius;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx);

    updateTrig(angle, circleRadius, circleRadius);
}

if(unitCircle) {
    // Mouse
    unitCircle.addEventListener('mousedown', e => { isDragMtk=true; handleCircleInteraction(e.clientX, e.clientY); });
    document.addEventListener('mousemove', e => {
        if(isDragMtk && unitCircle.offsetParent !== null) { 
            e.preventDefault(); 
            handleCircleInteraction(e.clientX, e.clientY); 
        }
    });
    document.addEventListener('mouseup', () => isDragMtk=false);

    // Touch
    unitCircle.addEventListener('touchstart', e => {
        isDragMtk=true; 
        handleCircleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive:false});
    
    document.addEventListener('touchmove', e => {
        if(isDragMtk && unitCircle.offsetParent !== null) {
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
// 6. SIMULASI BIOLOGI (Genetika)
// =========================================
const slots = [document.querySelector('.s1'), document.querySelector('.s2')];
let filled = 0;
let genes = [];
let selectedGene = null;

// Handle Click Selection
document.querySelectorAll('.gamete').forEach(g => {
    // Drag PC
    g.addEventListener('dragstart', e => { e.dataTransfer.setData('gene', g.dataset.g); });
    
    // Click HP
    g.addEventListener('click', () => {
        document.querySelectorAll('.gamete').forEach(x => x.style.border = '2px solid #4b85e7');
        g.style.border = '3px solid #e53935'; 
        selectedGene = g.dataset.g;
    });
});

const offBox = document.querySelector('.offspring-box');
if(offBox) {
    // Drop PC
    offBox.addEventListener('dragover', e => e.preventDefault());
    offBox.addEventListener('drop', e => {
        e.preventDefault();
        addGene(e.dataTransfer.getData('gene'));
    });
    
    // Click Drop HP
    offBox.addEventListener('click', () => {
        if(selectedGene) {
            addGene(selectedGene);
            selectedGene = null;
            document.querySelectorAll('.gamete').forEach(x => x.style.border = '2px solid #4b85e7');
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
