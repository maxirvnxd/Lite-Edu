// Menunggu hingga seluruh dokumen HTML dimuat
document.addEventListener('DOMContentLoaded', () => {

    // === BAGIAN 1: SELEKSI ELEMEN ===
    // Kita kumpulkan semua elemen penting yang akan kita gunakan
    const loginPage = document.getElementById('login-page');
    const appPage = document.getElementById('app-page');
    const successAnimation = document.getElementById('success-animation');
    
    // Form Login
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    // Navigasi & Tampilan
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    // Tombol Navigasi
    const navHome = document.getElementById('nav-home');
    const navNotes = document.getElementById('nav-notes');
    const navLogout = document.getElementById('nav-logout');

    // Tampilan Konten (Views)
    const allViews = document.querySelectorAll('.view');
    const homeView = document.getElementById('home-view');
    const notesView = document.getElementById('notes-view');
    const grignardView = document.getElementById('grignard-view');
    const phView = document.getElementById('ph-view');

    // Link di dalam konten
    const linkGrignard = document.getElementById('link-grignard');
    const linkPh = document.getElementById('link-ph');
    const backButtons = document.querySelectorAll('.btn-back');

    // === BAGIAN 2: DATA & FUNGSI ===

    /**
     * Fungsi untuk berpindah tampilan (view)
     * @param {string} viewId - ID dari elemen view yang ingin ditampilkan
     */
    function showView(viewId) {
        // 1. Sembunyikan semua view
        allViews.forEach(view => {
            view.classList.add('hidden');
        });

        // 2. Tampilkan view yang dipilih
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) {
            viewToShow.classList.remove('hidden');
        }

        // 3. (Mobile) Tutup sidebar setelah memilih
        sidebar.classList.remove('open');
        
        // 4. Scroll ke atas halaman
        mainContent.scrollTop = 0;
        window.scrollTo(0, 0);
    }

    /**
     * Fungsi untuk menangani proses login
     */
    function handleLogin(event) {
        event.preventDefault(); // Mencegah form mengirim data (refresh)

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Data login yang valid
        const validUsers = {
            'mita': 'mita19',
            'rahmat': 'rahmat19'
        };

        // Periksa apakah username ada dan password-nya cocok
        if (validUsers[username] && validUsers[username] === password) {
            // Login Berhasil
            loginError.textContent = ''; // Hapus pesan error
            
            // 1. Tampilkan animasi GIF
            successAnimation.classList.remove('hidden');

            // 2. Setelah 2 detik (2000 ms), lanjutkan
            setTimeout(() => {
                successAnimation.classList.add('hidden'); // Sembunyikan GIF
                loginPage.classList.remove('active'); // Sembunyikan halaman login
                loginPage.classList.add('hidden');
                appPage.classList.remove('hidden'); // Tampilkan halaman aplikasi
                appPage.classList.add('active');
                showView('home-view'); // Tampilkan 'home' sebagai default
            }, 2000); // Durasi GIF (2 detik)

        } else {
            // Login Gagal
            loginError.textContent = 'Username atau password salah!';
        }
    }

    /**
     * Fungsi untuk logout
     */
    function handleLogout() {
        // Sembunyikan halaman aplikasi
        appPage.classList.remove('active');
        appPage.classList.add('hidden');

        // Tampilkan halaman login
        loginPage.classList.remove('hidden');
        loginPage.classList.add('active');

        // Kosongkan field form
        usernameInput.value = '';
        passwordInput.value = '';
        loginError.textContent = '';
        
        // Tutup sidebar (jika terbuka di mode HP)
        sidebar.classList.remove('open');
    }

    /**
     * Fungsi untuk membuat Skala pH Interaktif
     */
    function generatePhScale() {
        const container = document.getElementById('ph-scale-container');
        if (!container) return; // Hentikan jika container tidak ada
        
        container.innerHTML = ''; // Kosongkan dulu

        const phData = [
            { p: 0, c: '#d00000', t: 'light', ex: 'Asam Baterai' },
            { p: 1, c: '#e85d04', t: 'light', ex: 'Asam Lambung' },
            { p: 2, c: '#f48c06', t: 'light', ex: 'Jus Lemon, Cuka' },
            { p: 3, c: '#faa307', t: 'dark', ex: 'Jus Jeruk, Soda' },
            { p: 4, c: '#ffba08', t: 'dark', ex: 'Jus Tomat, Hujan Asam' },
            { p: 5, c: '#fcf300', t: 'dark', ex: 'Kopi Hitam, Pisang' },
            { p: 6, c: '#9ef01a', t: 'dark', ex: 'Susu, Air liur' },
            { p: 7, c: '#15803d', t: 'light', ex: 'Air Murni (Netral)' }, // Netral
            { p: 8, c: '#04a777', t: 'light', ex: 'Air Laut, Telur' },
            { p: 9, c: '#00b4d8', t: 'light', ex: 'Baking Soda' },
            { p: 10, c: '#023e8a', t: 'light', ex: 'Susu Magnesium' },
            { p: 11, c: '#0c00a3', t: 'light', ex: 'Larutan Amonia' },
            { p: 12, c: '#4900a3', t: 'light', ex: 'Air Sabun' },
            { p: 13, c: '#7b2cbf', t: 'light', ex: 'Pemutih, Pembersih Oven' },
            { p: 14, c: '#a4133c', t: 'light', ex: 'Pembersih Saluran' }
        ];

        phData.forEach(item => {
            const phItem = document.createElement('div');
            phItem.className = `ph-item ${item.t === 'light' ? 'light-text' : 'dark-text'}`;
            phItem.style.backgroundColor = item.c;
            
            phItem.innerHTML = `
                <h4>pH ${item.p}</h4>
                <p>${item.ex}</p>
            `;
            
            container.appendChild(phItem);
        });
    }

    // === BAGIAN 3: EVENT LISTENERS ===
    
    // Menghubungkan fungsi login ke form
    loginForm.addEventListener('submit', handleLogin);

    // Tombol hamburger untuk buka/tutup sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Navigasi Sidebar
    navHome.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah link pindah halaman
        showView('home-view');
    });

    navNotes.addEventListener('click', (e) => {
        e.preventDefault();
        showView('notes-view');
    });

    navLogout.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Navigasi Konten
    linkGrignard.addEventListener('click', (e) => {
        e.preventDefault();
        showView('grignard-view');
    });

    linkPh.addEventListener('click', (e) => {
        e.preventDefault();
        showView('ph-view');
    });

    // Tombol "Kembali"
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetView = button.getAttribute('data-target');
            showView(targetView);
        });
    });

    // === BAGIAN 4: INISIALISASI ===
    
    // Buat skala pH saat halaman dimuat
    generatePhScale();

});