// js/script.js — versão profissional e robusta
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // Selectors
  const el = {
    btnSurpresa: $("#btn-surpresa"),
    textoSurpresa: $("#texto-surpresa"),
    surpresaScroll: $(".surpresa-scroll"),
    bgm: $("#bgm"),
    btnPause: $("#btn-pause"),
    btnVoltar: $("#btn-voltar"),
    countdown: $("#countdown"),
    flips: $$(".flip"),
    modal: $("#modal"),
    modalImg: $("#modal-img"),
    modalText: $("#modal-text"),
    modalClose: $("#modal-close"),
    btnBaixarCartao: $("#baixar-cartao"),
    cartao: $("#cartao"),
    cartaoImg: $("#cartao-img"),
  };

  /* -------------------------
     Countdown
     ------------------------- */
  (function initCountdown() {
    if (!el.countdown) return;
    const target = new Date("2025-12-12T00:00:00").getTime();
    function tick() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        el.countdown.innerHTML = "🎉 É HOJE! Feliz aniversário, meu amor! 💖✨";
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      el.countdown.innerHTML = `🎂 Faltam <b>${d}</b> dias • ${h}h ${m}m ${s}s`;
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* -------------------------
     Surpresa: show/hide + audio controls
     ------------------------- */
  (function setupSurpresa() {
    if (!el.btnSurpresa || !el.textoSurpresa) return;

    // prepare audio
    const audio = el.bgm || null;
    if (audio) {
      audio.volume = 0.18;
      audio.preload = "auto";
    }

    function show() {
      // play audio (user click allows playback)
      audio && audio.play().catch(() => {});

      el.textoSurpresa.style.display = "block";
      // small reflow to allow transitions
      void el.textoSurpresa.offsetWidth;
      el.textoSurpresa.classList.add("show");
      el.textoSurpresa.setAttribute("aria-hidden", "false");

      // stagger paragraph reveal
      const ps = el.textoSurpresa.querySelectorAll("p");
      ps.forEach((p, i) => {
        p.style.opacity = "0";
        p.style.transform = "translateY(8px)";
        setTimeout(() => {
          p.style.transition = "opacity .6s ease, transform .6s ease";
          p.style.opacity = "1";
          p.style.transform = "translateY(0)";
        }, 200 + i * 180);
      });
      // focus scroll for keyboard users
      el.surpresaScroll && el.surpresaScroll.focus();
    }

    function hide() {
      el.textoSurpresa.classList.remove("show");
      el.textoSurpresa.setAttribute("aria-hidden", "true");
      setTimeout(() => (el.textoSurpresa.style.display = "none"), 350);
      audio && audio.pause();
    }

    el.btnSurpresa.addEventListener("click", show);

    // bind pause/resume if button exists
    if (el.btnPause && audio) {
      el.btnPause.addEventListener("click", () => {
        if (audio.paused) {
          audio.play();
          el.btnPause.textContent = "Pausar Música";
          el.btnPause.setAttribute("aria-pressed", "true");
        } else {
          audio.pause();
          el.btnPause.textContent = "Reproduzir Música";
          el.btnPause.setAttribute("aria-pressed", "false");
        }
      });
    }

    if (el.btnVoltar) el.btnVoltar.addEventListener("click", hide);

    // hide if user presses Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });

    // pause audio when user leaves tab
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && audio && !audio.paused) audio.pause();
    });
  })();

  /* -------------------------
     Floating balões (dinâmico)
     ------------------------- */
  (function createBaloes() {
    const root = document.querySelector(".dec-baloes");
    if (!root) return;

    // add a few decorative absolute divs (only visual)
    const count = 3; // you already had 3 markup placeholders; keep them animated via CSS if desired.
    // Nothing else needed here if CSS already animates .balao
  })();

  /* -------------------------
     Gallery -> Modal
     ------------------------- */
  (function galleryModal() {
    if (!el.flips || !el.modal) return;

    el.flips.forEach((flip) => {
      flip.addEventListener("click", () => {
        const img = flip.querySelector(".flip-front img");
        const text = flip.querySelector(".flip-back p")?.innerText || "";
        if (!img) return;
        el.modalImg.src = img.src;
        el.modalText.textContent = text;
        el.modal.style.display = "flex";
        void el.modal.offsetWidth;
        el.modal.classList.add("open");
        el.modal.setAttribute("aria-hidden", "false");
      });

      // keyboard support (Enter)
      flip.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          flip.click();
        }
      });
    });

    function closeModal() {
      el.modal.classList.remove("open");
      el.modal.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        el.modal.style.display = "none";
        el.modalImg.src = "";
        el.modalText.textContent = "";
      }, 220);
    }

    el.modalClose && el.modalClose.addEventListener("click", closeModal);
    el.modal.addEventListener("click", (e) => {
      if (e.target === el.modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.modal.style.display === "flex") closeModal();
    });
  })();

  /* -------------------------
     Cartão -> export PNG (html2canvas preferred)
     ------------------------- */
  (function cardExport() {
    if (!el.btnBaixarCartao || !el.cartao) return;

    function setLoading(on) {
      el.btnBaixarCartao.disabled = on;
      el.btnBaixarCartao.textContent = on
        ? "Gerando..."
        : "Baixar Cartão (PNG)";
      el.btnBaixarCartao.style.opacity = on ? "0.7" : "1";
    }

    el.btnBaixarCartao.addEventListener("click", async () => {
      setLoading(true);
      try {
        if (window.html2canvas) {
          const canvas = await html2canvas(el.cartao, {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
          });
          const url = canvas.toDataURL("image/png");
          download(url, "cartao-geise.png");
        } else {
          // fallback minimal: draw main image to canvas and save
          await fallbackExport();
        }
      } catch (err) {
        console.error("Erro gerar PNG:", err);
        alert("Não foi possível gerar o cartão. Veja o console para detalhes.");
      } finally {
        setLoading(false);
      }
    });

    async function fallbackExport() {
      const imgEl = el.cartaoImg;
      if (!imgEl) throw new Error("Imagem do cartão não encontrada.");
      const w = 1200;
      const h = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#2b1c2b";
      ctx.fillRect(0, 0, w, h);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgEl.src;
      await img.decode();

      const iw = w - 160;
      const ih = (img.height / img.width) * iw;
      ctx.drawImage(img, 80, 60, iw, ih);

      // text
      ctx.fillStyle = "#fff";
      ctx.font = 'bold 42px "Playfair Display", serif';
      ctx.textAlign = "center";
      wrapText(
        ctx,
        "Feliz aniversário, Geise! Com todo meu amor 💖",
        w / 2,
        ih + 140,
        w - 120,
        44
      );

      const url = canvas.toDataURL("image/png");
      download(url, "cartao-geise.png");
    }

    function download(dataUrl, filename) {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  })();

  /* Balões pequenos flutuando */
  (function gerarBaloes() {
    const total = 20;

    for (let i = 0; i < total; i++) {
      const b = document.createElement("div");
      b.className = "balao";

      const delay = Math.random() * 6;
      const left = Math.random() * 100;

      b.style.left = left + "vw";
      b.style.animationDelay = delay + "s";
      b.style.background = ["#FF79BB", "#FFB6C1", "#FFD6E0"][
        Math.floor(Math.random() * 3)
      ];

      document.body.appendChild(b);
    }
  })();

  /* -------------------------
     Helpers: canvas wrap text
     ------------------------- */
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, curY);
  }

  console.info("script.js carregado — funcionalidades ativas.");
});
