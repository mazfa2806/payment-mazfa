document.addEventListener("DOMContentLoaded", () => {
  // ===== Toast =====
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1200);
  }

  // ===== Modal Payment =====
  const overlay = document.getElementById("overlay");
  const openPayBtn = document.getElementById("openPay");
  const closePayBtn = document.getElementById("closePay");

  const tabBtns = Array.from(document.querySelectorAll(".tabBtn"));
  const panes = {
    qris: document.getElementById("pane-qris"),
    ewallet: document.getElementById("pane-ewallet"),
    bank: document.getElementById("pane-bank"),
  };

  function setTab(key) {
    // tabs ui
    tabBtns.forEach(b => {
      const active = b.dataset.tab === key;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    // panes ui
    Object.entries(panes).forEach(([k, el]) => {
      if (!el) return;
      el.hidden = (k !== key);
    });
  }

  function openModal() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    setTab("qris"); // default QRIS
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  openPayBtn?.addEventListener("click", openModal);
  closePayBtn?.addEventListener("click", closeModal);

  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
    if (e.target?.dataset?.close) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && overlay.hidden === false) closeModal();
  });

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  // ===== Actions (copy/open/download) =====
  async function copyText(text) {
    const val = (text || "").trim();
    if (!val) return toast("Kosong");

    try {
      await navigator.clipboard.writeText(val);
      toast("Tersalin ✅");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = val;
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        toast("Tersalin ✅");
      } catch {
        toast("Gagal copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  function openUrl(url) {
    try {
      const u = new URL(url);
      if (!["http:", "https:"].includes(u.protocol)) return toast("URL invalid");
      window.open(u.toString(), "_blank", "noopener,noreferrer");
    } catch {
      toast("URL invalid");
    }
  }

  function downloadQris() {
    const img = document.getElementById("qrisImg");
    if (!img?.src) return toast("QR kosong");

    const a = document.createElement("a");
    a.href = img.src;
    a.download = "MAZFA_PAY_QR.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("Download...");
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".actionBtn");
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === "copy") return copyText(btn.dataset.copy);
    if (action === "open") return openUrl(btn.dataset.url);
    if (action === "download-qris") return downloadQris();
  });

  // ===== Logo fallback kalau src kosong =====
  document.querySelectorAll("img.payLogo").forEach((img) => {
    const src = (img.getAttribute("src") || "").trim();
    if (src) return;

    const label = img.getAttribute("data-fallback") || "PAY";
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#2aa8ff"/>
            <stop offset="1" stop-color="#7a5cff"/>
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="76" height="76" rx="22" fill="#ffffff" stroke="rgba(20,35,80,.12)" stroke-width="2"/>
        <rect x="10" y="10" width="68" height="68" rx="20" fill="url(#g)" opacity="0.14"/>
        <text x="44" y="52" font-family="system-ui,Arial" font-size="18" font-weight="900"
          text-anchor="middle" fill="#101427">${label}</text>
      </svg>`;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });

  // ===== Music =====
  const bgm = document.getElementById("bgm");
  const musicBtn = document.getElementById("musicBtn");
  const musicLabel = document.getElementById("musicLabel");
  const dot = document.querySelector(".dot");
  let musicOn = false;

  function setMusicUI(on) {
    musicBtn?.setAttribute("aria-pressed", String(on));
    if (musicLabel) musicLabel.textContent = `Music: ${on ? "ON" : "OFF"}`;
    dot?.classList.toggle("on", on);
  }

  async function playMusic() {
    if (!bgm) return false;
    try {
      bgm.volume = 0.35;
      await bgm.play();
      return true;
    } catch {
      return false;
    }
  }

  function stopMusic() {
    if (!bgm) return;
    bgm.pause();
    bgm.currentTime = 0;
  }

  setMusicUI(false);

  musicBtn?.addEventListener("click", async () => {
    musicOn = !musicOn;

    if (musicOn) {
      const ok = await playMusic();
      if (!ok) {
        musicOn = false;
        toast("bgm.mp3 tidak ada / diblokir browser");
      } else {
        toast("Music ON");
      }
    } else {
      stopMusic();
      toast("Music OFF");
    }

    setMusicUI(musicOn);
  });
});