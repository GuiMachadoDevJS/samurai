/* =========================================================
   Samurai Treinamento e Proteção — Landing Page V2
   ========================================================= */

/* ===== CONFIG: WhatsApp ===== */
const WHATSAPP_NUMBER = "5511930019640";  // ajuste se necessário
const DEFAULT_MESSAGE = "Olá! Vim do site Samurai Treinamento e Proteção e gostaria de informações.";

/* ===== GALERIA: liste os arquivos (na pasta /assets) =====
*/
const GALLERY_IMAGES = [
  // "treino-1.jpg",
  // "curso-02.webp",
  // "operacao-urbana.jpeg"
];

/* ===== monta o link do WhatsApp com mensagem ===== */
function buildWA(topic = "Treinamentos") {
  const msg = `${DEFAULT_MESSAGE}${topic}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* ===== Aplica links do WhatsApp nos CTAs ===== */
function wireWhatsApp() {
  document.querySelectorAll("[data-cta]").forEach(el => {
    const topic = el.closest("[data-topic]")?.getAttribute("data-topic") || el.getAttribute("data-topic") || "";
    el.href = buildWA(topic);
    el.target = "_blank";
    el.rel = "noopener";
  });
}

/* ===== Menu Mobile + visual do header quando rola ===== */
function wireHeader() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", document.body.classList.contains("nav-open"));
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
}

/* ===== Scroll suave para âncoras ===== */
function wireSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ===== Back to Top ===== */
function wireBackToTop() {
  const btn = document.getElementById("backToTop");
  const hero = document.getElementById("home");
  const io = new IntersectionObserver(([entry]) => {
    btn.classList.toggle("visible", !entry.isIntersecting);
  }, { threshold: 0.1 });
  io.observe(hero);
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ===== Ajuste do vídeo: cabe 100% do quadro sem cortar/distorcer =====
   Compara a razão de aspecto do vídeo e do container (frame-video).
   Se o vídeo for mais "largo", ajusta pela largura; senão, pela altura.
*/
function fitHeroVideo() {
  const container = document.querySelector(".frame-video");
  const vid = document.querySelector(".hero-video");
  if (!container || !vid) return;

  if (container.classList.contains("fill")) {
    vid.classList.remove("fit-width","fit-height"); // CSS do fill resolve tudo
    return;
  }

  const apply = () => {
    const cr = container.clientWidth / container.clientHeight;
    const vr = (vid.videoWidth && vid.videoHeight) ? (vid.videoWidth / vid.videoHeight) : 16/9;
    vid.classList.remove("fit-width","fit-height");
    (vr > cr) ? vid.classList.add("fit-width") : vid.classList.add("fit-height");
  };

  if (vid.readyState >= 1) apply();
  vid.addEventListener("loadedmetadata", apply);
  window.addEventListener("resize", apply);
}

/* ===== Galeria + Lightbox ===== */
function wireGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const blacklist = ["logo", "info", "imgbr"];
  const images = (GALLERY_IMAGES || []).filter(name => {
    const s = (name || "").toLowerCase();
    return s && !blacklist.some(b => s.includes(b)) && /\.(jpg|jpeg|png|webp)$/i.test(s);
  });

  images.forEach(name => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = `assets/${name}`;
    img.alt = "Imagem de treinamento";
    fig.appendChild(img);
    grid.appendChild(fig);
    fig.addEventListener("click", () => openLightbox(img.src));
  });

  if (images.length === 0) {
    // se a lista estiver vazia, escondemos a seção pra manter clean
    document.getElementById("galeria").style.display = "none";
  }
}

function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  img.src = src;
  lb.hidden = false;
  lb.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  img.src = "";
  lb.hidden = true;
  lb.setAttribute("aria-hidden", "true");
}
function wireLightbox() {
  const lb = document.getElementById("lightbox");
  const close = document.querySelector(".lightbox-close");
  close.addEventListener("click", closeLightbox);
  lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !lb.hidden) closeLightbox(); });
}

/* ===== Scrollspy: destaca item do menu conforme a seção visível ===== */
function wireScrollSpy() {
  const links = document.querySelectorAll(".nav a[href^='#']");
  if (!links.length) return;

  const map = [...links].map(a => [a, document.querySelector(a.getAttribute("href"))]).filter(([, el]) => el);

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = map.find(([, el]) => el === entry.target)?.[0];
      if (link) link.classList.toggle("active", entry.isIntersecting);
    });
  }, { threshold: 0.6 });

  map.forEach(([, el]) => io.observe(el));
}

/* ===== Ano do rodapé ===== */
function wireYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* =================== INIT =================== */
document.addEventListener("DOMContentLoaded", () => {
  wireWhatsApp();
  wireHeader();
  wireSmoothScroll();
  wireBackToTop();
  fitHeroVideo();       // vídeo da dobra (sem corte/distorção)
  wireGallery();        // grade de imagens
  wireLightbox();       // zoom nas imagens
  wireScrollSpy();      // destaque do menu por seção
  wireYear();           // ano no rodapé
});
