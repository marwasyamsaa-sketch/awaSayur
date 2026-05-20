/* =====================================================
   script.js — Toko Sayur Bu Ani (Edisi Lebih Ramai & Interaktif)
   Fitur Terintegrasi:
   1. Keranjang belanja (cart) + badge + modal modern
   2. Tombol "+ Tambah" dengan efek Pop & Kembang Api Daun
   3. Form kontak dengan validasi & pesan sukses responsif
   4. Navbar shrink + Auto-Active link saat scroll
   5. Animasi fade-in smooth untuk setiap section
   6. Toast global dengan icon dinamis
   7. Floating WhatsApp button dengan efek Pulse gelombang
   8. Banner Running Text (Promo Marquee) otomatis di bawah navbar
   9. Efek Hover Baris Tabel interaktif
   ===================================================== */

/* ─── 1. DATA PRODUK ─────────────────────────────────── */
const produkData = [
  { nama: "🌿 Bayam Hijau",  satuan: "per ikat (~200gr)", harga: 3000  },
  { nama: "🥕 Wortel",       satuan: "per kg",            harga: 8000  },
  { nama: "🌿 Kangkung",     satuan: "per ikat (~300gr)", harga: 2500  },
  { nama: "🍅 Tomat Merah",  satuan: "per kg",            harga: 12000 },
  { nama: "🌶️ Cabai Merah", satuan: "per ons",           harga: 5000  },
];

/* ─── 2. KERANJANG BELANJA ───────────────────────────── */
let keranjang = []; 

function injectCartUI() {
  // Badge di navbar (Dibuat lebih mencolok)
  const logo = document.querySelector(".logo");
  if (logo) {
    const badge = document.createElement("span");
    badge.id = "cart-badge";
    badge.style.cssText = `
      display:none; background:#ef4444; color:#fff;
      border-radius:50%; font-size:0.75rem; font-weight:700;
      width:20px; height:20px; line-height:20px; text-align:center;
      margin-left:8px; vertical-align:middle; box-shadow: 0 2px 5px rgba(239,68,68,0.4);
      animation: pulse-badge 1.5s infinite;
    `;
    logo.appendChild(badge);
  }

  // Tombol keranjang di navbar
  const nav = document.querySelector(".navbar");
  if (nav) {
    const btnCart = document.createElement("button");
    btnCart.id = "btn-cart";
    btnCart.innerHTML = "🛒 Keranjang <span id='cart-count'></span>";
    btnCart.style.cssText = `
      background:#16a34a; color:#fff; border:none; padding:10px 20px;
      border-radius:50px; font-weight:600; font-size:0.88rem; cursor:pointer;
      transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(22,163,74,0.2);
    `;
    btnCart.onmouseenter = () => {
      btnCart.style.background = "#15803d";
      btnCart.style.transform = "scale(1.05)";
    };
    btnCart.onmouseleave = () => {
      btnCart.style.background = "#16a34a";
      btnCart.style.transform = "scale(1)";
    };
    btnCart.onclick = bukaModal;
    nav.appendChild(btnCart);
  }

  // Modal overlay
  const modal = document.createElement("div");
  modal.id = "cart-modal";
  modal.style.cssText = `
    display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5);
    z-index:999; align-items:center; justify-content:center; backdrop-filter: blur(4px);
  `;
  modal.innerHTML = `
    <div id="cart-box" style="
      background:#fff; border-radius:16px; padding:32px; width:90%; max-width:480px;
      max-height:80vh; overflow-y:auto; box-shadow:0 10px 50px rgba(0,0,0,0.25);
      position:relative; animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <style>
        @keyframes popIn{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes pulse-badge{0%{transform:scale(1);} 50%{transform:scale(1.2);} 100%{transform:scale(1);}}
      </style>
      <h3 style="font-size:1.3rem;font-weight:700;color:#14532d;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
        🛒 Keranjang Belanja <span style="font-size:0.9rem; font-weight:normal; color:#6b7280;">(Segar & Alami)</span>
      </h3>
      <div id="cart-items"></div>
      <div id="cart-total" style="margin-top:16px;font-weight:700;font-size:1.1rem;color:#16a34a;border-top:2px dashed #e5e7eb;padding-top:16px;"></div>
      <div style="display:flex;gap:10px;margin-top:24px;">
        <button id="btn-order-wa" class="tombol" style="flex:1.3;text-align:center;box-shadow: 0 4px 12px rgba(22,163,74,0.3);">
          📲 Pesan via WhatsApp
        </button>
        <button id="btn-kosongkan" style="
          flex:0.7; background:#fee2e2; color:#b91c1c; border:none;
          border-radius:50px; font-weight:600; font-size:0.88rem; cursor:pointer;
          padding:12px; transition:all 0.2s;
        ">🗑️ Kosongkan</button>
      </div>
      <button id="btn-tutup-modal" style="
        position:absolute; top:14px; right:18px; background:none; border:none;
        font-size:1.4rem; cursor:pointer; color:#6b7280; transition: color 0.2s;
      ">✕</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", e => { if (e.target === modal) tutupModal(); });
  document.getElementById("btn-tutup-modal").onclick = tutupModal;
  document.getElementById("btn-kosongkan").onclick = kosongkanKeranjang;
  document.getElementById("btn-order-wa").onclick = pesanWhatsApp;

  // Efek hover untuk tombol kosongkan
  const btnKosong = document.getElementById("btn-kosongkan");
  btnKosong.onmouseenter = () => btnKosong.style.background = "#fca5a5";
  btnKosong.onmouseleave = () => btnKosong.style.background = "#fee2e2";
}

function bukaModal() {
  renderKeranjang();
  const modal = document.getElementById("cart-modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function tutupModal() {
  document.getElementById("cart-modal").style.display = "none";
  document.body.style.overflow = "";
}

function renderKeranjang() {
  const container = document.getElementById("cart-items");
  const totalEl   = document.getElementById("cart-total");
  if (keranjang.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px 0;">
        <span style="font-size:3rem;">🥗</span>
        <p style="color:#6b7280;margin-top:10px;font-weight:500;">Keranjangmu kosong nih. Yuk isi dengan sayur segar!</p>
      </div>
    `;
    totalEl.textContent = "";
    return;
  }
  let total = 0;
  container.innerHTML = keranjang.map((item, i) => {
    total += item.harga * item.qty;
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:14px 0;border-bottom:1px solid #f3f4f6;gap:8px; animation: fadeInRow 0.2s ease;">
        <div style="flex:1;">
          <div style="font-weight:600;font-size:0.95rem;color:#1f2937;">${item.nama}</div>
          <div style="font-size:0.8rem;color:#6b7280;margin-top:2px;">${item.satuan}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button onclick="ubahQty(${i},-1)" style="
            width:28px;height:28px;border-radius:50%;border:1.5px solid #16a34a;
            background:#fff;color:#16a34a;font-weight:700;cursor:pointer;font-size:1rem;
            display:flex;align-items:center;justify-content:center;transition:all 0.2s;
          " onmouseenter="this.style.background='#f0fdf4'" onmouseleave="this.style.background='#fff'">−</button>
          <span style="font-weight:700;min-width:24px;text-align:center;font-size:0.95rem;">${item.qty}</span>
          <button onclick="ubahQty(${i},1)" style="
            width:28px;height:28px;border-radius:50%;border:none;
            background:#16a34a;color:#fff;font-weight:700;cursor:pointer;font-size:1rem;
            display:flex;align-items:center;justify-content:center;transition:all 0.2s;
          " onmouseenter="this.style.background='#15803d'" onmouseleave="this.style.background='#16a34a'">+</button>
        </div>
        <div style="font-weight:700;color:#16a34a;min-width:90px;text-align:right;font-size:0.95rem;">
          Rp ${(item.harga * item.qty).toLocaleString("id-ID")}
        </div>
      </div>
    `;
  }).join("");
  totalEl.innerHTML = `Total Belanja: <span style="float:right;color:#14532d;font-size:1.2rem;">Rp ${total.toLocaleString("id-ID")}</span>`;
}

/* Global scope injection agar onclick di string innerHTML dapat berfungsi */
window.ubahQty = function(i, delta) {
  keranjang[i].qty += delta;
  if (keranjang[i].qty <= 0) keranjang.splice(i, 1);
  updateBadge();
  renderKeranjang();
};

function kosongkanKeranjang() {
  keranjang = [];
  updateBadge();
  renderKeranjang();
  tampilkanToast("Keranjang telah dikosongkan 🗑️", "#ef4444");
}

function updateBadge() {
  const total = keranjang.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById("cart-badge");
  const count = document.getElementById("cart-count");
  if (badge && count) {
    if (total > 0) {
      badge.style.display = "inline-block";
      badge.textContent = total;
      count.textContent = `(${total})`;
    } else {
      badge.style.display = "none";
      count.textContent = "";
    }
  }
}

function pesanWhatsApp() {
  if (keranjang.length === 0) return;
  const nomor = "6281234567890";
  let teks = "Halo Bu Ani, saya ingin memesan sayuran segar berikut:\n\n";
  let total = 0;
  keranjang.forEach(item => {
    teks += `• ${item.nama} x${item.qty} (${item.satuan}) = Rp ${(item.harga * item.qty).toLocaleString("id-ID")}\n`;
    total += item.harga * item.qty;
  });
  teks += `\n=========================\n`;
  teks += `Total Keseluruhan: Rp ${total.toLocaleString("id-ID")}`;
  teks += "\n=========================\n\nMohon diinfo ketersediaan dan ongkirnya ya Bu. Terima kasih! 🌾";
  window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(teks)}`, "_blank");
}

/* ─── 3. TOMBOL + TAMBAH & EFEK SELEBRASI DAUN ────────── */
function initTombolTambah() {
  const tombolList = document.querySelectorAll(".btn-tambah");
  tombolList.forEach((btn, i) => {
    btn.addEventListener("click", function (e) {
      const produk = produkData[i];
      if (!produk) return;
      
      const ada = keranjang.find(k => k.nama === produk.nama);
      if (ada) {
        ada.qty++;
      } else {
        keranjang.push({ ...produk, qty: 1 });
      }
      updateBadge();

      // Animasi feedback tombol
      this.textContent = "✨ Berhasil!";
      this.style.background = "#15803d";
      this.style.transform = "scale(0.95)";
      this.disabled = true;
      
      // Efek Letupan Partikel Daun (Konfeti Mikro)
      buatPartikelSayur(e.clientX, e.clientY);

      setTimeout(() => {
        this.textContent = "+ Tambah";
        this.style.background = "#16a34a";
        this.style.transform = "scale(1)";
        this.disabled = false;
      }, 1000);

      tampilkanToast(`${produk.nama} berhasil masuk keranjang! 🛒`);
    });
  });
}

// Fitur Efek Visual Unik Semakin Ramai
function buatPartikelSayur(x, y) {
  const emojiSayur = ['🌿', '🥕', '🍅', '🍃', '🌱'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("div");
    p.textContent = emojiSayur[Math.floor(Math.random() * emojiSayur.length)];
    p.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px;
      z-index: 10000; pointer-events: none; font-size: 1.2rem;
      transition: all 0.6s cubic-bezier(0.1, 0.8, 0.3, 1);
    `;
    document.body.appendChild(p);

    const amX = (Math.random() - 0.5) * 120;
    const amY = (Math.random() - 0.7) * 120;
    
    requestAnimationFrame(() => {
      p.style.transform = `translate(${amX}px, ${amY}px) scale(0.5) rotate(${Math.random() * 360}deg)`;
      p.style.opacity = "0";
    });

    setTimeout(() => p.remove(), 600);
  }
}

/* ─── 4. FORM KONTAK ─────────────────────────────────── */
function initForm() {
  const form = document.getElementById("form-kontak");
  const pesan = document.getElementById("pesan-sukses");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const namaInput = document.getElementById("nama");
    const nama = namaInput ? namaInput.value.trim() : "Pelanggan";

    if (pesan) {
      pesan.style.display = "block";
      pesan.style.padding = "14px 20px";
      pesan.style.boxShadow = "0 4px 12px rgba(22,163,74,0.15)";
      pesan.innerHTML = `🎉 <strong>Hebat, ${nama}!</strong> Pesan Anda meluncur langsung ke Bu Ani. Kami balas secepat kilat ya!`;
      pesan.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      form.reset();
      setTimeout(() => { if (pesan) pesan.style.display = "none"; }, 5000);
    }, 1000);
  });
}

/* ─── 5. RUNNING TEXT (BANNER PROMO BERJALAN) ────────── */
function injectRunningText() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const marqueeContainer = document.createElement("div");
  marqueeContainer.style.cssText = `
    background: #f0fdf4; border-bottom: 1px solid #bbf7d0;
    overflow: hidden; white-space: nowrap; padding: 6px 0;
    font-size: 0.82rem; font-weight: 600; color: #15803d;
  `;
  
  marqueeContainer.innerHTML = `
    <div style="display: inline-block; animation: marquee-effect 25s linear infinite; padding-left: 100%;">
      🔥 DISKON PAGI HARI: Dapatkan Sayur Bayam & Kangkung Segar Hanya Rp 2.500! 🥕 Ongkir Gratis Area Sekitar Toko dengan Minim Order Rp 30rb! 🍅 Sayur Bu Ani Selalu Fresh & Dipetik Langsung Dari Mitra Petani Lokal Lokal Hari Ini! ✨
    </div>
  `;

  const styleTrack = document.createElement("style");
  styleTrack.textContent = `
    @keyframes marquee-effect {
      0% { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-100%, 0, 0); }
    }
  `;
  document.head.appendChild(styleTrack);
  navbar.after(marqueeContainer);
}

/* ─── 6. NAVBAR SHRINK & AUTO ACTIVE NAVLINK ─────────── */
function initNavbarDanNavigation() {
  const navbar = document.querySelector(".navbar");
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-links a");

  const activeStyle = document.createElement("style");
  activeStyle.textContent = `
    .nav-links a { position: relative; padding-bottom: 4px; }
    .nav-links a::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:#16a34a; transition: width 0.3s ease; }
    .nav-links a.aktif { color:#16a34a; font-weight:700; }
    .nav-links a.aktif::after { width: 100%; }
  `;
  document.head.appendChild(activeStyle);

  window.addEventListener("scroll", () => {
    // Shrink Navbar Effect
    if (window.scrollY > 40) {
      navbar.style.height = "52px";
      navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
    } else {
      navbar.style.height = "60px";
      navbar.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.07)";
    }

    // Dynamic Navigation Track
    let currentId = "";
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 90) {
        currentId = s.id;
      }
    });

    links.forEach(link => {
      link.classList.toggle("aktif", link.getAttribute("href") === `#${currentId}`);
    });
  });
}

/* ─── 7. FADE-IN ANIMATION FOR SECTIONS ──────────────── */
function initFadeInSections() {
  const style = document.createElement("style");
  style.textContent = `
    .fade-hidden { opacity:0; transform:translateY(24px); transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1); }
    .fade-visible { opacity:1; transform:translateY(0); }
  `;
  document.head.appendChild(style);

  const sections = document.querySelectorAll("section");
  sections.forEach(s => s.classList.add("fade-hidden"));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => observer.observe(s));
}

/* ─── 8. TOAST NOTIFIKASI ELEGAN ─────────────────────── */
let toastTimeout;
function tampilkanToast(pesan, warna = "#16a34a") {
  let toast = document.getElementById("toast-global");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-global";
    toast.style.cssText = `
      position:fixed; bottom:85px; left:50%; transform:translateX(-50%) translateY(20px);
      background:#16a34a; color:#fff; padding:12px 28px; border-radius:50px;
      font-size:0.88rem; font-weight:600; z-index:9999; opacity:0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow:0 6px 20px rgba(0,0,0,0.15); white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  clearTimeout(toastTimeout);
  toast.textContent = pesan;
  toast.style.background = warna;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";

  toastTimeout = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, 2800);
}

/* ─── 9. FLOATING WHATSAPP DENGAN PULSE ──────────────── */
function injectFloatingWA() {
  const btn = document.createElement("a");
  btn.href = "https://wa.me/6281234567890?text=Halo%20Bu%20Ani%2C%20saya%20mau%20tanya%20stok%20sayur%20hari%20ini.";
  btn.target = "_blank";
  btn.title = "Chat Langsung via WhatsApp";
  btn.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:998;
    background:#25d366; color:#fff; border-radius:50%;
    width:56px; height:56px; display:flex; align-items:center; justify-content:center;
    font-size:1.7rem; box-shadow:0 4px 20px rgba(37,211,102,0.4);
    transition: all 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
    animation: wave-pulse 2s infinite;
  `;
  btn.innerHTML = "💬";
  
  btn.onmouseenter = () => { btn.style.transform = "scale(1.1) rotate(8deg)"; };
  btn.onmouseleave = () => { btn.style.transform = "scale(1) rotate(0deg)"; };

  const styleWA = document.createElement("style");
  styleWA.textContent = `
    @keyframes wave-pulse {
      0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
      70% { box-shadow: 0 0 0 14px rgba(37, 211, 102, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
    }
  `;
  document.head.appendChild(styleWA);
  document.body.appendChild(btn);
}

/* ─── 10. TABEL INTERAKTIF & HIGHLIGHT ───────────────── */
function initTableHover() {
  const style = document.createElement("style");
  style.textContent = `
    tbody tr { transition: all 0.25s ease; }
    tbody tr:hover { background-color: #f2fdf5 !important; transform: scale(1.005); }
  `;
  document.head.appendChild(style);
}

/* ─── INITIALIZE ALL MAGIC FEATURES ─────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  injectCartUI();
  initTombolTambah();
  initForm();
  injectRunningText();
  initNavbarDanNavigation();
  initFadeInSections();
  injectFloatingWA();
  initTableHover();
});