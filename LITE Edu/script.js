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
