// === LOGIKA NAVIGASI UTAMA ===
function showView(viewId) {
    // Sembunyikan semua section utama
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    // Reset Sub-Konten saat pindah halaman utama (Opsional, agar rapi)
    document.querySelectorAll('.sub-content').forEach(sub => sub.classList.add('hidden'));
    document.querySelectorAll('.menu-list').forEach(menu => menu.classList.remove('hidden'));

    // Tampilkan view yang dipilih
    const selected = document.getElementById(viewId);
    if(selected) {
        selected.classList.remove('hidden');
        selected.classList.add('active');
    }
}

// === LOGIKA MENU & SUB-KONTEN (BARU) ===
function openSubContent(contentId, menuId) {
    // Sembunyikan Menu
    document.getElementById(menuId).classList.add('hidden');
    
    // Tampilkan Konten
    const content = document.getElementById(contentId);
    content.classList.remove('hidden');
    
    // Perbaikan Bug Layout Fisika/MTK (Terkadang canvas perlu di-refresh saat un-hide)
    // Kita panggil fungsi update visual jika elemen ada
    if(contentId === 'mtk-sim-1') {
        updateTrig(-Math.PI / 4, 100, 100); // Refresh visual
    }
}

function closeSubContent(contentId, menuId) {
    // Sembunyikan Konten
    document.getElementById(contentId).classList.add('hidden');
    
    // Tampilkan Menu Kembali
    document.getElementById(menuId).classList.remove('hidden');
}


// ... (SISA KODE SIMULASI KIMIA, FISIKA, MTK, BIOLOGI TETAP SAMA SEPERTI SEBELUMNYA) ...
// Pastikan kode Drag & Drop Biologi dan lainnya tetap ada di bawah fungsi ini.
