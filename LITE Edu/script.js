// =========================================
// 1. SISTEM NAVIGASI UTAMA
// =========================================
function showView(viewId) {
    // Sembunyikan semua section
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    
    // Reset Submenu (Agar saat pindah mapel, menu tertutup rapi)
    document.querySelectorAll('.content-container').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.menu-container').forEach(m => m.classList.remove('hidden'));

    // Tampilkan Section yang dipilih
    const selected = document.getElementById(viewId);
    if(selected) {
        selected.classList.remove('hidden');
        selected.classList.add('active');
    } else {
        console.error("View tidak ditemukan: " + viewId);
    }
    
    // Scroll ke paling atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// 2. SISTEM BUKA-TUTUP KONTEN (SUB-MENU)
// =========================================
function openContent(contentId, menuId) {
    // Sembunyikan Menu
    const menu = document.getElementById(menuId);
    if(menu) menu.classList.add('hidden');

    // Tampilkan Konten
    const content = document.getElementById(contentId);
    if(content) content.classList.remove('hidden');

    // Refresh Visualisasi Matematika (Agar canvas merender ulang)
    if(contentId === 'mtk-sim') {
        setTimeout(() => updateTrig(-Math.PI/4, 110, 110), 100);
    }
}

function closeContent(contentId, menuId) {
    const content = document.getElementById(contentId);
    if(content) content.classList.add('hidden');

    const menu = document.getElementById(menuId);
    if(menu) menu.classList.remove('hidden');
}

// =========================================
// 3. SIMULASI KIMIA (pH Meter)
// =========================================
const probe = document.getElementById('ph-probe');
let isDragKimia = false;
let offsetKimiaX = 0; 
let offsetKimiaY = 0;

if(probe) {
    // --- START DRAG ---
    const startKimia = (clientX, clientY) => {
        isDragKimia = true;
        probe.style.cursor = 'grabbing';
        const rect = probe.getBoundingClientRect();
        offsetKimiaX = clientX - rect.left;
        offsetKimiaY = clientY - rect.top;
    };

    // Mouse
    probe.addEventListener('mousedown', (e) => startKimia(e.clientX, e.clientY));
    // Touch
    probe.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        startKimia(t.clientX, t.clientY);
        e.preventDefault(); 
    }, {passive: false});

    // --- END DRAG ---
    const endKimia = () => { isDragKimia = false; probe.style.cursor = 'grab'; };
    document.addEventListener('mouseup', endKimia);
    document.addEventListener('touchend', endKimia);

    // --- MOVE DRAG ---
    const moveKimia = (clientX, clientY) => {
        if(!isDragKimia) return;

        const container = document.querySelector('.lab-bench');
        const contRect = container.getBoundingClientRect();

        // Hitung posisi baru
        let newLeft = clientX - contRect.left - offsetKimiaX;
        let newTop = clientY - contRect.top - offsetKimiaY;

        // Terapkan posisi
        probe.style.left = newLeft + 'px';
        probe.style.top = newTop + 'px';

        // --- DETEKSI SENSOR ---
        // Hitung posisi ujung sensor secara dinamis (Support HP & PC)
        const currentProbeHeight = probe.offsetHeight; 
        const currentProbeWidth = probe.offsetWidth;

        // Koordinat Ujung Sensor (Tengah lebar + Bawah alat - sedikit offset)
        const tipX = contRect.left + newLeft + (currentProbeWidth / 2);
        const tipY = contRect.top + newTop + currentProbeHeight - 5;

        checkPh(tipX, tipY);
    };

    // Event Listener Gerak
    document.addEventListener('mousemove', (e) => {
        if(isDragKimia) { e.preventDefault(); moveKimia(e.clientX, e.clientY); }
    });
    
    document.addEventListener('touchmove', (e) => {
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
        
        // Logika Deteksi: Cairan mulai dari 40% tinggi gelas
        const liquidTop = r.top + (r.height * 0.4); 
        
        // Cek tabrakan
        if(tipX >= (r.left + 5) && tipX <= (r.right - 5) && tipY >= liquidTop && tipY <= (r.bottom + 10)) {
            hit = true;
            screen.textContent = b.dataset.ph;
            title.textContent = "Larutan: " + b.dataset.name;
            desc.textContent = b.dataset.desc;
            reason.innerHTML = `<span style="color:#d32f2f; font-weight:bold;">Analisis pH ${b.dataset.ph}:</span> ${b.dataset.reason}`;
            reason.style.border = `2px solid ${varToHex(b.dataset.ph)}`;
            reason.style.background = "#fff";
        }
    });

    if(!hit) {
        screen.textContent = "--";
        // Opsional: Reset border reasoning jika tidak kena
        if(reason) {
            reason.style.borderColor = "#ddd";
            reason.style.background = "#fff";
        }
    }
}

function varToHex(ph) {
    if(ph < 7) return "#e53935"; // Merah
    if(ph == 7) return "#1e88e5"; // Biru
    return "#43a047"; // Hijau
}

// =========================================
// 4. FISIKA (Newton)
// =========================================
let mass = 10;
const force = 500;

window.setMass = function(val) {
    mass = val;
    const pBox = document.getElementById('physics-box');
    if(pBox) {
        pBox.textContent = val + "kg";
        pBox.style.left = '10px';
    }
    
    document.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('active'));
    // Menggunakan event.target bisa error jika dipanggil manual, jadi kita check
    if(event && event.target) event.target.classList.add('active');
    
    const exp = document.getElementById('newton-explanation');
    if(exp) exp.classList.add('hidden');
    
    const acc = document.getElementById('acc-display');
    if(acc) acc.textContent = "a: 0 m/s²";
};

const btnPush = document.getElementById('btn-push');
if(btnPush) {
    btnPush.addEventListener('click', () => {
        const box = document.getElementById('physics-box');
        const a = force / mass;
        
        document.getElementById('acc-display').textContent = `a: ${a} m/s²`;
        
        // Hitung durasi animasi
        let dur = 30 / a;
        if(dur > 3) dur = 3; if(dur < 0.5) dur = 0.5;

        box.style.transition = `left ${dur}s cubic-bezier(0.25, 1, 0.5, 1)`;
        box.style.left = "calc(100% - 60px)"; // Sesuaikan agar tidak lewat

        const expBox = document.getElementById('newton-explanation');
        let text = mass === 10 ? "Ringan, melesat cepat." : (mass === 50 ? "Sedang." : "Berat, gerak lambat.");
        
        expBox.innerHTML = `
            <h4 style="margin-top:0; color:var(--primary)">📊 Analisis Hukum Newton II</h4>
            <p>${text}</p>
            <div style="background:#f0f7ff; padding:10px; border-radius:8px; margin-top:10px; font-weight:bold; color:#333;">
                a = F / m = ${force} / ${mass} = ${a} m/s²
            </div>
        `;
        expBox.classList.remove('hidden');

        // Reset setelah animasi
        setTimeout(() => { 
            box.style.transition='none'; 
            box.style.left='10px'; 
        }, 3000);
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

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx);

    updateTrig(angle, circleRadius, circleRadius);
}

if(unitCircle) {
    // Mouse
    unitCircle.addEventListener('mousedown', e => { 
        isDragMtk=true; 
        handleCircleInteraction(e.clientX, e.clientY); 
    });
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

    // Update Dot
    const dot = document.getElementById('dot');
    if(dot) {
        dot.style.transform = `translate(${x}px, ${y}px)`;
        dot.style.left = "50%"; 
        dot.style.top = "50%";
    }

    // Update Lines
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

    // Update Values
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
    // Drag PC
    g.addEventListener('dragstart', e => { e.dataTransfer.setData('gene', g.dataset.g); });
    
    // Click Mobile
    g.addEventListener('click', () => {
        document.querySelectorAll('.gamete').forEach(x => x.style.border = '2px solid var(--primary)');
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
    
    // Click Mobile
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
