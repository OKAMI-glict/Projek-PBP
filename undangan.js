/* ==========================================================================
   Main JavaScript - Wedding Invitation Logic
   Author: Student / Front-end Developer
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Parameter URL Nama Tamu Dinamis ---
  const urlParams = new URLSearchParams(window.location.search);
  const guestNameParam = urlParams.get("to") || urlParams.get("u");
  const guestNameElement = document.getElementById("guest-name");

  if (guestNameParam) {
    guestNameElement.textContent = decodeURIComponent(guestNameParam);
  } else {
    guestNameElement.textContent = "Tamu Undangan";
  }

  // --- 2. Buka Cover Undangan ---
  const btnOpen = document.getElementById("btn-open");
  const coverOverlay = document.getElementById("cover");
  const mainContent = document.getElementById("main-content");
  const btnMusic = document.getElementById("btn-music");
  const audioBg = document.getElementById("audio-bg");

  btnOpen.addEventListener("click", () => {
    // Sembunyikan Cover Overlay
    coverOverlay.classList.add("hide");
    
    // Tampilkan Konten Utama
    mainContent.classList.remove("d-none");
    btnMusic.classList.remove("d-none");

    // Enable Scroll pada Body
    document.body.style.overflowY = "auto";

    audioBg.play().then(() => {
      updateMusicControls(audioBg, btnMusic);
    }).catch(err => {
      updateMusicControls(audioBg, btnMusic);
      console.warn("Musik tidak dapat diputar otomatis:", err);
      showToast("Musik belum dapat diputar. Tekan tombol musik untuk mencoba lagi.");
    });
  });

  // --- 3. Countdown Timer ---
  // Target Tanggal Pernikahan (12 Desember 2026 08:00:00)
  const targetDate = new Date("December 12, 2026 08:00:00").getTime();

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days < 10 ? "0" + days : days;
    document.getElementById("hours").textContent = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").textContent = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").textContent = seconds < 10 ? "0" + seconds : seconds;
  };

  // Jalankan countdown setiap 1 detik
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // --- 4. Dynamic RSVP / Buku Tamu DOM Manipulation ---
  const rsvpForm = document.getElementById("rsvp-form");
  const guestbookList = document.getElementById("guestbook-list");
  const guestbookCount = document.getElementById("guestbook-count");

  let totalComments = 2; // Jumlah data awal

  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Cegah reload form

    const nama = document.getElementById("input-nama").value.trim();
    const kehadiran = document.getElementById("input-kehadiran").value;
    const ucapan = document.getElementById("input-ucapan").value.trim();

    if (!nama || !kehadiran || !ucapan) {
      showToast("Harap isi seluruh form RSVP dengan benar!");
      return;
    }

    // Badge status kehadiran
    let badgeClass = "bg-secondary";
    if (kehadiran === "Hadir") badgeClass = "bg-success";
    if (kehadiran === "Tidak Hadir") badgeClass = "bg-danger";
    if (kehadiran === "Ragu-ragu") badgeClass = "bg-warning text-dark";

    // Buat elemen komentar baru secara dinamis
    const cardDiv = document.createElement("div");
    cardDiv.className = "p-3 bg-light rounded-3 border-start border-4 border-gold shadow-sm";
    cardDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-1">
        <strong class="text-dark">${escapeHtml(nama)}</strong>
        <span class="badge ${badgeClass}">${escapeHtml(kehadiran)}</span>
      </div>
      <p class="small text-muted m-0">"${escapeHtml(ucapan)}"</p>
    `;

    // Sisipkan di paling atas list
    guestbookList.insertBefore(cardDiv, guestbookList.firstChild);

    // Update Counter
    totalComments++;
    guestbookCount.textContent = totalComments;

    // Reset Form & Tampilkan Notifikasi
    rsvpForm.reset();
    showToast("Terima kasih! Ucapan Anda berhasil terkirim.");
  });
});

function updateMusicControls(audio, button) {
  const icon = document.getElementById("icon-music");
  const isPlaying = !audio.paused;

  icon.className = isPlaying
    ? "fa-solid fa-compact-disc fa-spin"
    : "fa-solid fa-circle-play";
  button.setAttribute("aria-label", isPlaying ? "Jeda musik" : "Putar musik");
  button.setAttribute("aria-pressed", String(isPlaying));
}

function toggleAudio() {
  const audio = document.getElementById("audio-bg");
  const button = document.getElementById("btn-music");

  if (audio.paused) {
    audio.play().then(() => {
      updateMusicControls(audio, button);
    }).catch(err => {
      updateMusicControls(audio, button);
      console.error("Gagal memutar musik:", err);
      showToast("Musik tidak dapat diputar. Coba lagi.");
    });
    return;
  }

  audio.pause();
  updateMusicControls(audio, button);
}

// --- 5. Fitur Copy Rekening / Clipboard ---
function copyToClipboard(elementId, labelName) {
  const textToCopy = document.getElementById(elementId).innerText;

  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast(`${labelName} (${textToCopy}) berhasil disalin!`);
  }).catch(err => {
    showToast("Gagal menyalin teks.");
    console.error("Copy Error:", err);
  });
}

// Helper: Toast Alert Notification
function showToast(message) {
  const toastEl = document.getElementById("toast-notif");
  const toastMsg = document.getElementById("toast-message");
  
  if (toastEl && toastMsg) {
    toastMsg.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// Helper: Sanitize Input XSS Prevention
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}