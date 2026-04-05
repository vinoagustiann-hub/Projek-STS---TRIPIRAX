        let bookings = [];
        let editingId = null; 

        function navigate(pageId) {
            // Sembunyikan semua section
            document.querySelectorAll('.page-section').forEach(sec => {
                sec.classList.remove('active');
            });
            // Tampilkan section yang dituju
            document.getElementById(pageId).classList.add('active');
            // Scroll ke atas halaman
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Update promo text saat masuk halaman booking
            if(pageId === 'booking') updatePromoSuggestion();
        }

        // Pindah ke booking form & auto-select gunung dari halaman destinasi
        function bookSpecific(gunungVal) {
            navigate('booking');
            const select = document.getElementById('gunung');
            select.value = gunungVal;
        }

        // Tampilkan Custom Toast
        function showToast(msg, isSuccess = false) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.className = 'show' + (isSuccess ? ' success' : '');
            setTimeout(() => { toast.className = toast.className.replace('show', '').trim(); }, 3000);
        }

        // Fungsi Edit Booking
        function editBooking(id) {
            // Cari data booking berdasarkan ID
            const booking = bookings.find(b => b.id === id);
            if (!booking) return;

            // Masukkan data lama ke dalam form
            document.getElementById('nama').value = booking.nama;
            document.getElementById('gunung').value = booking.gunung;

            // Format ulang tanggal
            const parts = booking.tanggal.split('/'); 
            if (parts.length === 3) {
               document.getElementById('tanggal').value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }

            // Set ID yang sedang diedit
            editingId = id;

            // Pindah ke halaman form
            navigate('booking');
            showToast("Silakan perbarui data pesanan Anda.", true);
        }

        // Fungsi Simpan Booking
        function saveBooking() {
            const nama = document.getElementById('nama').value.trim();
            const gunungSelect = document.getElementById('gunung');
            const gunung = gunungSelect.value;
            const harga = gunungSelect.options[gunungSelect.selectedIndex]?.getAttribute('data-price');
            const tanggal = document.getElementById('tanggal').value;

            // Validasi Input
            if (!nama) return showToast("Mohon isi Nama Lengkap Anda!");
            if (!gunung) return showToast("Mohon pilih Destinasi Gunung!");
            if (!tanggal) return showToast("Mohon tentukan Tanggal Keberangkatan!");

            // Format Tanggal Naik
            const tglNaikObj = new Date(tanggal);
            const tglNaikFormatted = `${tglNaikObj.getDate()}/${tglNaikObj.getMonth()+1}/${tglNaikObj.getFullYear()}`;

            // Cek apakah ini mode Edit atau Tambah Baru
            if (editingId !== null) {
                const index = bookings.findIndex(b => b.id === editingId);
                if (index !== -1) {
                    bookings[index].nama = nama;
                    bookings[index].gunung = gunung;
                    bookings[index].tanggal = tglNaikFormatted;
                    bookings[index].harga = parseInt(harga).toLocaleString('id-ID');
                }
                showToast("Berhasil! Jadwal berhasil diperbarui.", true);
                editingId = null; 
            } else {
                // Mode Tambah Baru
                const dateObj = new Date();
                const tglDaftar = `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

                bookings.unshift({ 
                    id: Date.now(),
                    tglDaftar: tglDaftar,
                    nama: nama, 
                    gunung: gunung, 
                    tanggal: tglNaikFormatted, 
                    harga: parseInt(harga).toLocaleString('id-ID') 
                });
                showToast("Berhasil! Jadwal berhasil disimpan.", true);
            }

            render();
            updatePromoSuggestion();
            
            // Reset Form
            document.getElementById('nama').value = "";
            document.getElementById('gunung').value = "";
            document.getElementById('tanggal').value = "";
        }

        // Fungsi Update Dinamis Saran Promosi
        function updatePromoSuggestion() {
            const promoText = document.getElementById('promo-text');
            if(bookings.length === 0) {
                promoText.innerHTML = "Saat ini <strong>Gunung Rinjani</strong> sedang menjadi tren! Amankan kursi Anda sebelum kehabisan.";
                return;
            }

            // Hitung gunung mana yang paling banyak dibooking
            const counts = {};
            let maxCount = 0;
            let topGunung = "Gede";
            
            bookings.forEach(b => {
                counts[b.gunung] = (counts[b.gunung] || 0) + 1;
                if(counts[b.gunung] > maxCount) {
                    maxCount = counts[b.gunung];
                    topGunung = b.gunung;
                }
            });

            promoText.innerHTML = `Luar Biasa! <strong>Gunung ${topGunung}</strong> adalah rute paling diminati saat ini. Jangan sampai ketinggalan rombongan!`;
        }

        // Fungsi Hapus Booking
        function deleteBooking(id) {
            if(confirm("Apakah Anda yakin ingin membatalkan jadwal ini?")) {
                bookings = bookings.filter(b => b.id !== id);
                render();
                updatePromoSuggestion();
                showToast("Jadwal berhasil dibatalkan.");
            }
        }

        // Fungsi Render Tabel
        function render() {
            const list = document.getElementById('booking-list');
            const counter = document.getElementById('counter');
            const emptyState = document.getElementById('empty-state');
            
            list.innerHTML = "";

            if(bookings.length === 0) {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                bookings.forEach((b) => {
                    list.innerHTML += `
                        <tr class="hover:bg-gray-50 transition">
                            <td class="p-4 text-xs text-gray-400">${b.tglDaftar}</td>
                            <td class="p-4 font-bold text-gray-800">${b.nama}</td>
                            <td class="p-4 text-brand-600 font-semibold">${b.gunung}</td>
                            <td class="p-4">${b.tanggal}</td>
                            <td class="p-4 font-medium text-gray-900">Rp ${b.harga}</td>
                            <td class="p-4 text-right whitespace-nowrap">
<button class="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded hover:bg-blue-500 hover:text-white transition mr-2" onclick="editBooking(${b.id})">Edit</button>
<button class="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition" onclick="deleteBooking(${b.id})">Batalkan</button>
                            </td>
                        </tr>
                    `;
                });
            }
            counter.innerText = `${bookings.length} Pesanan Aktif`;
        }

        // Inisialisasi awal
        render();