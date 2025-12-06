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
    if(contentId === 'mtk-sim') updateTrig(-Math.PI/4, 110, 110);
}

function closeContent(contentId, menuId) {
    document.getElementById(contentId).classList.add('hidden');
    document.getElementById(menuId).classList.remove('hidden');
}

// === KIMIA (pH) - Support Touch ===
const probe = document.getElementById('ph-probe');
let isDrag = false;

function moveProbe(x, y) {
    const rect = document.querySelector('.lab-bench').getBoundingClientRect();
    // Batasi area gerak
    let newLeft = x - rect.left - 30;
    let newTop = y - rect.top - 10;
    
    probe.style.left = newLeft + 'px';
    probe.style.top = newTop + 'px';
    checkPh(x, y);
}

if(probe) {
    // Mouse Events
    probe.addEventListener('mousedown', () => { isDrag = true; probe.style.cursor='grabbing'; });
    document.addEventListener('mouseup', () => { isDrag = false; probe.style.cursor='grab'; });
    document.addEventListener('mousemove', (e) => {
        if(!isDrag) return;
        e.preventDefault();
        moveProbe(e.clientX, e.clientY);
    });

    // Touch Events (Android/IOS)
    probe.addEventListener('touchstart', (e) => { isDrag = true; }, {passive: false});
    document.addEventListener('touchend', () => { isDrag = false; });
    document.addEventListener('touchmove', (e) => {
        if(!isDrag) return;
        e.preventDefault(); // Stop scrolling screen
        const touch = e.touches[0];
        moveProbe(touch.clientX, touch.clientY);
    }, {passive: false});
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
const force = 500; // Gaya Tetap 500N

function setMass(val) {
    mass = val;
    document.getElementById('physics-box').textContent = val + "kg";
    document.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    // Reset saat ganti massa
    document.getElementById('newton-explanation').classList.add('hidden');
    document.getElementById('acc-display').textContent = "a: 0 m/s²";
    document.getElementById('physics-box').style.left = '10px';
}

document.getElementById('btn-push').addEventListener('click', () => {
    const box = document.getElementById('physics-box');
    const a = force / mass; // Hitung percepatan
    
    // 1. Update Display Singkat
    document.getElementById('acc-display').textContent = `a: ${a} m/s²`;
    
    // 2. Jalankan Animasi
    // Semakin besar percepatan, durasi animasi semakin kecil (cepat)
    let duration = 30 / a; 
    if (duration > 3) duration = 3; // Batasi lambatnya
    if (duration < 0.5) duration = 0.5; // Batasi cepatnya

    box.style.transition = `left ${duration}s cubic-bezier(0.25, 1, 0.5, 1)`;
    box.style.left = "calc(100% - 70px)"; // Gerak ke ujung kanan
    
    // 3. Tampilkan Penjelasan Detail (Teori & Rumus)
    const expBox = document.getElementById('newton-explanation');
    let analysisText = "";

    // Analisis Kata-kata berdasarkan berat
    if (mass === 10) {
        analysisText = "Benda ini <b>sangat ringan</b>. Karena massanya kecil, gaya 500N memberikan dampak percepatan yang sangat besar. Benda melesat dengan cepat.";
    } else if (mass === 50) {
        analysisText = "Benda ini memiliki <b>massa sedang</b>. Percepatannya standar, tidak terlalu cepat dan tidak terlalu lambat.";
    } else {
        analysisText = "Benda ini <b>sangat berat</b>. Karena inersia (kelembaman) yang besar, gaya 500N kesulitan menggerakkan benda ini, sehingga percepatannya kecil (lambat).";
    }

    // HTML Penjelasan
    expBox.innerHTML = `
        <h4 style="margin-top:0; color:var(--primary)">📊 Analisis Hukum Newton II</h4>
        <p>${analysisText}</p>
        
        <h5 style="margin-top:15px; border-bottom:1px solid #ddd; padding-bottom:5px;">🧮 Perhitungan Rumus</h5>
        <p>Diketahui:</p>
        <ul style="margin-left:20px; margin-bottom:10px;">
            <li>Gaya (F) = <b>${force} N</b></li>
            <li>Massa (m) = <b>${mass} kg</b></li>
        </ul>
        
        <p>Ditanya: Percepatan (a)?</p>
        
        <div style="background:#f0f7ff; padding:10px; border-radius:8px; margin-top:10px; font-family:'Courier New', monospace; font-weight:bold; color:#333;">
            a = F / m <br>
            a = ${force} / ${mass} <br>
            a = ${a} m/s²
        </div>
        
        <p style="margin-top:10px; font-size:0.9rem; color:#666;">
            <i>Kesimpulan: Percepatan benda adalah <b>${a} m/s²</b>.</i>
        </p>
    `;
    
    expBox.classList.remove('hidden');

    // Reset posisi setelah animasi selesai (opsional, delay 3 detik)
    setTimeout(() => { 
        box.style.transition='none'; 
        box.style.left='10px'; 
    }, 3000);
});
// === MTK (Trigono) - Support Touch & Improved ===
const unitCircle = document.getElementById('unit-circle');
const circleRadius = 110; // Setengah dari width/height 220px

function handleCircleInteraction(clientX, clientY) {
    const rect = unitCircle.getBoundingClientRect();
    const centerX = rect.left + circleRadius;
    const centerY = rect.top + circleRadius;

    // Hitung sudut relatif terhadap pusat
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx);

    updateTrig(angle, circleRadius, circleRadius);
}

// Mouse
unitCircle.addEventListener('mousedown', (e) => {
    isDrag = true;
    handleCircleInteraction(e.clientX, e.clientY);
});
document.addEventListener('mousemove', (e) => {
    if(isDrag && unitCircle.offsetParent !== null) { // Cek jika sedang visible
        e.preventDefault();
        handleCircleInteraction(e.clientX, e.clientY);
    }
});
document.addEventListener('mouseup', () => isDrag = false);

// Touch (Android/IOS)
unitCircle.addEventListener('touchstart', (e) => {
    isDrag = true;
    handleCircleInteraction(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});

document.addEventListener('touchmove', (e) => {
    if(isDrag && unitCircle.offsetParent !== null) {
        e.preventDefault(); // Stop scrolling screen
        handleCircleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
}, {passive: false});


function updateTrig(rad, cx, cy) {
    const r = 100; // Radius visual garis
    const x = Math.cos(rad) * r;
    const y = Math.sin(rad) * r;
    
    // Posisi Dot (titik)
    // Kita translate dari titik tengah (110, 110)
    document.getElementById('dot').style.transform = `translate(${x}px, ${y}px)`; 
    document.getElementById('dot').style.left = "50%";
    document.getElementById('dot').style.top = "50%";
    
    // Garis Sinus (Merah - Vertikal)
    const lineSin = document.getElementById('line-sin');
    lineSin.style.height = Math.abs(y) + 'px';
    lineSin.style.left = (cx + x) + 'px';
    // Jika y positif (bawah), start dari tengah. Jika negatif (atas), start dari titik y.
    lineSin.style.top = (y > 0) ? cx + 'px' : (cx + y) + 'px';
    
    // Garis Cosinus (Hijau - Horizontal)
    const lineCos = document.getElementById('line-cos');
    lineCos.style.width = Math.abs(x) + 'px';
    lineCos.style.top = (cy + y) + 'px';
    lineCos.style.left = (x > 0) ? cy + 'px' : (cy + x) + 'px';
    
    // Garis Jari-jari (Radius)
    const lineRad = document.getElementById('line-rad');
    const degRaw = rad * (180/Math.PI);
    lineRad.style.width = r + 'px';
    lineRad.style.top = cy + 'px';
    lineRad.style.left = cx + 'px';
    lineRad.style.transform = `rotate(${degRaw}deg)`;

    // Update Angka
    let deg = degRaw;
    if(deg < 0) deg += 360;
    
    document.getElementById('val-deg').textContent = deg.toFixed(0) + "°";
    // Ingat: di layar komputer Y ke bawah positif, tapi di grafik kartesius Y ke atas positif.
    // Jadi Sin = -y visual (atau pakai Math.sin langsung dari rad)
    document.getElementById('val-sin').textContent = Math.sin(rad).toFixed(2);
    document.getElementById('val-cos').textContent = Math.cos(rad).toFixed(2);
}

// === BIOLOGI (Drag Drop Touch Support) ===
const slots = [document.querySelector('.s1'), document.querySelector('.s2')];
let filled = 0;
let genes = [];

document.querySelectorAll('.gamete').forEach(g => {
    // Mouse
    g.addEventListener('dragstart', (e) => { e.dataTransfer.setData('gene', g.dataset.g); });
    
    // Touch Logic (Simpel: Klik untuk pilih, lalu klik kotak untuk taruh)
    g.addEventListener('click', () => {
        // Seleksi gamet (kasih efek visual)
        document.querySelectorAll('.gamete').forEach(x => x.style.border = '2px solid var(--primary)');
        g.style.border = '3px solid #e53935'; // Merah tanda terpilih
        window.selectedGene = g.dataset.g;
    });
});

const offBox = document.querySelector('.offspring-box');

// Mouse Drop
offBox.addEventListener('dragover', (e) => e.preventDefault());
offBox.addEventListener('drop', (e) => {
    e.preventDefault();
    addGene(e.dataTransfer.getData('gene'));
});

// Touch/Click Drop
offBox.addEventListener('click', () => {
    if(window.selectedGene) {
        addGene(window.selectedGene);
        window.selectedGene = null; // Reset selection
        document.querySelectorAll('.gamete').forEach(x => x.style.border = '2px solid var(--primary)');
    }
});

function addGene(gene) {
    if(filled < 2) {
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
}

window.resetBio = function() {
    filled=0; genes=[]; slots.forEach(s=>s.textContent='');
    document.querySelector('.flower-res').classList.add('hidden');
    document.getElementById('bio-info').innerHTML = `<h4>Mulai Lagi</h4><p>Pilih gamet, lalu klik kotak anak.</p>`;
};

