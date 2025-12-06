// === NAVIGASI ===
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    const selected = document.getElementById(viewId);
    if(selected) {
        selected.classList.remove('hidden');
        selected.classList.add('active');
    }
}

// ==========================================
// 1. KIMIA (pH Drag & Drop) - Dipertahankan
// ==========================================
const probe = document.getElementById('ph-probe');
const infoTitle = document.getElementById('ph-info-title');
const infoDesc = document.getElementById('ph-info-desc');
const probeScreen = document.getElementById('probe-screen');
const beakers = document.querySelectorAll('.beaker');
let isDragging = false;

if(probe) {
    probe.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch support simple
    probe.addEventListener('touchstart', (e) => { startDrag(e.touches[0]); e.preventDefault(); });
    document.addEventListener('touchmove', (e) => { drag(e.touches[0]); e.preventDefault(); });
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    isDragging = true;
    probe.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging) return;
    const container = document.querySelector('.lab-bench');
    if(!container) return;
    const rect = container.getBoundingClientRect();
    
    // Posisi relatif mouse
    let x = (e.clientX || e.pageX) - rect.left;
    let y = (e.clientY || e.pageY) - rect.top;
    
    probe.style.left = x + 'px';
    probe.style.top = y + 'px';

    checkCollision(e.clientX || e.pageX, e.clientY || e.pageY);
}

function endDrag() {
    isDragging = false;
    probe.style.cursor = 'grab';
}

function checkCollision(x, y) {
    let touched = false;
    beakers.forEach(beaker => {
        const rect = beaker.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            touched = true;
            const ph = beaker.getAttribute('data-ph');
            probeScreen.textContent = ph;
            infoTitle.textContent = `pH ${ph}: ${beaker.getAttribute('data-name')}`;
            infoDesc.textContent = beaker.getAttribute('data-desc');
        }
    });
    if (!touched) probeScreen.textContent = "--";
}

// ==========================================
// 2. FISIKA (Newton) - Dipertahankan
// ==========================================
let mass = 10;
function setMass(val) {
    mass = val;
    document.getElementById('box-label').textContent = val + "kg";
    document.querySelectorAll('.btn-mass').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('newton-info').textContent = `Massa: ${val}kg. Siap didorong.`;
}

const btnPush = document.getElementById('btn-push');
if(btnPush) {
    btnPush.addEventListener('click', () => {
        const force = 500;
        const a = force / mass;
        const box = document.getElementById('physics-box');
        
        document.getElementById('acceleration-display').textContent = `a = ${a} m/s²`;
        document.getElementById('newton-info').textContent = `Hukum Newton II: Percepatan (${a}) = Gaya (${force}) / Massa (${mass}).`;
        
        // Simple animation logic
        box.style.transition = `left ${30/a}s cubic-bezier(0.25, 1, 0.5, 1)`;
        box.style.left = "calc(100% - 70px)";
        
        setTimeout(() => {
            box.style.transition = 'none';
            box.style.left = "10px";
        }, 2000);
    });
}

// ==========================================
// 3. MATEMATIKA (Trigono) - Dipertahankan
// ==========================================
const circleWrapper = document.querySelector('.circle-wrapper');
if(circleWrapper) {
    circleWrapper.addEventListener('mousemove', (e) => {
        const rect = circleWrapper.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;
        const angle = Math.atan2(y, x);
        
        updateTrig(angle, centerX, centerY);
    });
}

function updateTrig(rad, cx, cy) {
    const r = 100; // radius visual
    const x = Math.cos(rad) * r;
    const y = Math.sin(rad) * r;
    
    document.getElementById('dot-point').style.left = (cx + x) + 'px';
    document.getElementById('dot-point').style.top = (cy + y) + 'px';
    
    // Update lines
    const lineSin = document.getElementById('line-sin');
    const lineCos = document.getElementById('line-cos');
    
    lineSin.style.height = Math.abs(y) + 'px';
    lineSin.style.left = (cx + x) + 'px';
    lineSin.style.top = (y > 0) ? cy + 'px' : (cy + y) + 'px';

    lineCos.style.width = Math.abs(x) + 'px';
    lineCos.style.top = (cy + y) + 'px';
    lineCos.style.left = (x > 0) ? cx + 'px' : (cx + x) + 'px';

    // Text
    let deg = (rad * 180 / Math.PI);
    if(deg < 0) deg += 360;
    document.getElementById('angle-val').textContent = deg.toFixed(0) + "°";
    document.getElementById('sin-val').textContent = Math.sin(rad).toFixed(2); // Y screen kebalik
    document.getElementById('cos-val').textContent = Math.cos(rad).toFixed(2);
}

// ==========================================
// 4. BIOLOGI (Genetika Drag & Drop) - BARU
// ==========================================
const gametes = document.querySelectorAll('.gamete-source');
const offspringBox = document.querySelector('.offspring-box');
const bioInfoPanel = document.getElementById('bio-info-panel');
const slots = [document.querySelector('.slot-1'), document.querySelector('.slot-2')];
let filledSlots = 0;
let currentGenotype = [];

gametes.forEach(gamete => {
    gamete.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('gene', gamete.getAttribute('data-gene'));
        e.dataTransfer.effectAllowed = "copy";
    });
});

if(offspringBox) {
    offspringBox.addEventListener('dragover', (e) => {
        e.preventDefault(); // allow drop
        offspringBox.classList.add('highlight');
    });

    offspringBox.addEventListener('dragleave', () => {
        offspringBox.classList.remove('highlight');
    });

    offspringBox.addEventListener('drop', (e) => {
        e.preventDefault();
        offspringBox.classList.remove('highlight');

        const gene = e.dataTransfer.getData('gene');
        
        if (filledSlots < 2) {
            // Isi slot
            slots[filledSlots].textContent = gene;
            slots[filledSlots].style.backgroundColor = gene === 'M' ? '#ffcdd2' : '#f0f4c3'; // Merah muda atau Putih
            currentGenotype.push(gene);
            filledSlots++;

            // Update Info
            if (filledSlots === 1) {
                bioInfoPanel.innerHTML = `<h3>Satu Gamet Diterima: ${gene}</h3><p>Sekarang ambil satu gamet lagi dari induk pasangannya.</p>`;
            } else if (filledSlots === 2) {
                finishCrossing();
            }
        }
    });
}

function finishCrossing() {
    // Urutkan Genotype (misal mM jadi Mm)
    currentGenotype.sort(); 
    const genoStr = currentGenotype.join('');
    
    const resultFlower = document.querySelector('.result-flower');
    resultFlower.classList.remove('hidden');
    
    let phenotype = "";
    let explanation = "";

    if (genoStr === "MM") {
        phenotype = "Merah (Dominan Homozigot)";
        explanation = "Gen M bertemu Gen M. Sifat merah muncul penuh.";
        resultFlower.style.filter = "hue-rotate(0deg)"; // Merah
    } else if (genoStr === "Mm" || genoStr === "mM") {
        phenotype = "Merah (Heterozigot)";
        explanation = "Gen Dominan (M) menutupi Gen Resesif (m). Bunga tetap berwarna merah.";
        resultFlower.style.filter = "hue-rotate(0deg)"; // Merah
    } else if (genoStr === "mm") {
        phenotype = "Putih (Resesif Homozigot)";
        explanation = "Tidak ada gen dominan merah. Sifat resesif putih muncul.";
        resultFlower.style.filter = "grayscale(100%) brightness(200%)"; // Putih
    }

    bioInfoPanel.innerHTML = `
        <h3 style="color:var(--primary)">Hasil: ${phenotype}</h3>
        <p><strong>Genotip: ${genoStr}</strong></p>
        <p>${explanation}</p>
        <button onclick="resetBioSim()" style="margin-top:10px; padding:5px 10px; cursor:pointer;">Ulangi</button>
    `;
}

window.resetBioSim = function() {
    filledSlots = 0;
    currentGenotype = [];
    slots.forEach(slot => {
        slot.textContent = "";
        slot.style.backgroundColor = "rgba(0,0,0,0.05)";
    });
    document.querySelector('.result-flower').classList.add('hidden');
    bioInfoPanel.innerHTML = `<h3>Mulai Persilangan!</h3><p>Tarik gamet ke dalam kotak.</p>`;
};
