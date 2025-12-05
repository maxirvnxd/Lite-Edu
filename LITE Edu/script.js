// Fungsi Navigasi Sederhana
function showView(viewId) {
    // Sembunyikan semua view
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    // Tampilkan view yang dipilih
    const selected = document.getElementById(viewId);
    selected.classList.remove('hidden');
    selected.classList.add('active');
}

// ==========================================
// 1. LOGIKA KIMIA (Drag & Drop pH Meter)
// ==========================================
const probe = document.getElementById('ph-probe');
const infoTitle = document.getElementById('ph-info-title');
const infoDesc = document.getElementById('ph-info-desc');
const probeScreen = document.getElementById('probe-screen');
const beakers = document.querySelectorAll('.beaker');

let isDragging = false;

// Event Listeners untuk Mouse
probe.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);

// Event Listeners untuk Touch (HP)
probe.addEventListener('touchstart', startDrag, {passive: false});
document.addEventListener('touchmove', drag, {passive: false});
document.addEventListener('touchend', endDrag);

function startDrag(e) {
    isDragging = true;
    probe.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault(); // Mencegah scroll layar saat drag di HP

    let clientX, clientY;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // Pindahkan probe mengikuti cursor
    // Kita perlu menyesuaikan posisi agar centered di mouse
    const containerRect = document.querySelector('.lab-bench').getBoundingClientRect();
    
    // Hitung posisi relatif terhadap container
    let newLeft = clientX - containerRect.left;
    let newTop = clientY - containerRect.top;

    probe.style.left = newLeft + 'px';
    probe.style.top = newTop + 'px';

    checkCollision(clientX, clientY);
}

function endDrag() {
    isDragging = false;
    probe.style.cursor = 'grab';
    
    // Kembalikan ke posisi awal jika tidak mengenai gelas (opsional, disini kita biarkan saja)
    resetInfoIfOutside();
}

function checkCollision(x, y) {
    let touchedBeaker = false;

    beakers.forEach(beaker => {
        const rect = beaker.getBoundingClientRect();
        
        // Cek apakah ujung probe (bagian bawah stik) masuk ke dalam area gelas
        // Asumsi ujung probe ada di sekitar (x, y + 40px) dari titik tengah
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            touchedBeaker = true;
            const ph = beaker.getAttribute('data-ph');
            const name = beaker.getAttribute('data-name');
            const desc = beaker.getAttribute('data-desc');

            // Update Tampilan
            probeScreen.textContent = ph;
            infoTitle.textContent = `pH ${ph}: ${name}`;
            infoDesc.textContent = desc;
            infoDesc.style.color = '#333';
        }
    });

    if (!touchedBeaker) {
        probeScreen.textContent = "--";
    }
}

function resetInfoIfOutside() {
    if (probeScreen.textContent === "--") {
        infoTitle.textContent = "Siap Mengukur?";
        infoDesc.textContent = "Tarik alat pengukur ke dalam gelas.";
    }
}


// ==========================================
// 2. LOGIKA FISIKA (Hukum Newton)
// ==========================================
let mass = 10; // Default kg
let force = 500; // Newton
let boxPosition = 20; // px
let velocity = 0;
let animationId = null;

function setMass(val) {
    mass = val;
    // Update tombol aktif
    document.querySelectorAll('.btn-mass').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.includes(val)) btn.classList.add('active');
    });
    
    // Update visual box
    const box = document.getElementById('physics-box');
    document.getElementById('box-label').textContent = val + "kg";
    
    // Reset posisi
    boxPosition = 20;
    box.style.left = boxPosition + 'px';
    cancelAnimationFrame(animationId);
    velocity = 0;
    
    // Update Info
    document.getElementById('newton-info').innerHTML = 
        `Massa diset ke <b>${mass}kg</b>. Jika didorong dengan gaya 500N, percepatan akan berubah.`;
    document.getElementById('acceleration-display').textContent = "Percepatan (a): 0 m/s²";
}

document.getElementById('btn-push').addEventListener('click', () => {
    // Rumus a = F / m
    const acceleration = force / mass; // m/s^2 (dalam simulasi ini pixel/frame^2)
    
    document.getElementById('acceleration-display').textContent = 
        `Percepatan (a) = ${force}N / ${mass}kg = ${acceleration.toFixed(1)} m/s²`;

    document.getElementById('newton-info').innerHTML = 
        `<b>Wush!</b> Benda ${mass < 30 ? 'ringan melesat cepat' : 'berat bergerak lambat'} karena a = F/m.`;

    animateBox(acceleration);
});

function animateBox(accel) {
    const box = document.getElementById('physics-box');
    const containerWidth = document.querySelector('.track-container').offsetWidth;
    
    // Skala percepatan untuk animasi agar tidak terlalu cepat/lambat di layar
    let scaledAccel = accel * 0.05; 
    
    if (animationId) cancelAnimationFrame(animationId);

    function frame() {
        velocity += scaledAccel;
        boxPosition += velocity;

        if (boxPosition > containerWidth - 100) {
            boxPosition = containerWidth - 100; // Stop di ujung
            velocity = 0; // Berhenti memantul
            
            // Animasi berhenti
            return; 
        }

        box.style.left = boxPosition + 'px';
        animationId = requestAnimationFrame(frame);
    }
    
    frame();
}


// ==========================================
// 3. LOGIKA MATEMATIKA (Trigonometri)
// ==========================================
// Kita simulasikan dengan mouse move di area lingkaran
const circleWrapper = document.querySelector('.circle-wrapper');
const dotPoint = document.getElementById('dot-point');
const lineSin = document.getElementById('line-sin');
const lineCos = document.getElementById('line-cos');
const lineRadius = document.getElementById('line-radius');

// Teks Value
const angleText = document.getElementById('angle-val');
const sinText = document.getElementById('sin-val');
const cosText = document.getElementById('cos-val');

circleWrapper.addEventListener('mousemove', (e) => {
    const rect = circleWrapper.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Posisi mouse relatif terhadap tengah lingkaran
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;
    
    // Hitung sudut menggunakan ArcTan2
    let angleRad = Math.atan2(mouseY, mouseX);
    
    updateTrigVisuals(angleRad, centerX, centerY);
});

// Default start
updateTrigVisuals(-Math.PI / 4, 150, 150); // Mulai di 45 derajat

function updateTrigVisuals(angleRad, cx, cy) {
    const radius = 100; // Jari-jari visual dalam px (sesuai CSS unit-circle/2 dikurang margin)
    
    // Koordinat titik pada lingkaran
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    // Pindahkan Dot
    // Kita tambah cx cy karena posisi absolute dimulai dari kiri atas container
    dotPoint.style.left = (cx + x) + 'px';
    dotPoint.style.top = (cy + y) + 'px';
    
    // Update Garis Sin (Vertikal)
    // Sinus adalah jarak ke sumbu X.
    // Posisi left sama dengan dot. Posisi top tergantung apakah y positif atau negatif
    lineSin.style.height = Math.abs(y) + 'px';
    lineSin.style.left = (cx + x) + 'px';
    lineSin.style.top = (y > 0) ? cy + 'px' : (cy + y) + 'px'; // Jika y positif (bawah), start dari center. Jika negatif (atas), start dari y.

    // Update Garis Cos (Horizontal)
    // Cosinus adalah jarak ke sumbu Y.
    lineCos.style.width = Math.abs(x) + 'px';
    lineCos.style.top = (cy + y) + 'px';
    lineCos.style.left = (x > 0) ? cx + 'px' : (cx + x) + 'px';

    // Update Garis Radius (Dari tengah ke titik)
    // Kita gunakan rotate transform untuk garis ini
    const deg = angleRad * (180 / Math.PI);
    lineRadius.style.width = radius + 'px';
    lineRadius.style.top = cy + 'px';
    lineRadius.style.left = cx + 'px';
    lineRadius.style.transform = `rotate(${deg}deg)`;

    // Update Angka
    // Konversi radian matematika (y positif ke bawah di layar) ke koordinat kartesius standar (y positif ke atas)
    // Di layar komputer, Y bertambah ke bawah. Jadi -y adalah Sin matematika.
    let realSin = -Math.sin(angleRad);
    let realCos = Math.cos(angleRad);
    
    // Normalisasi Sudut agar 0-360 derajat (berlawanan jarum jam dari sumbu X positif)
    let degrees = -deg;
    if (degrees < 0) degrees += 360;

    angleText.textContent = degrees.toFixed(0) + "°";
    sinText.textContent = realSin.toFixed(3);
    cosText.textContent = realCos.toFixed(3);
}