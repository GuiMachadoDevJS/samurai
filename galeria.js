/* =========================================================
   Galeria — Samurai
   Como preencher:
   - Adicione aqui todos os ARQUIVOS da pasta /assets que você quer na galeria.
   - Pode misturar fotos (image) e vídeos (video).
   - O script ignora automaticamente itens com "logo", "info" ou "imgbr" no nome.
   ========================================================= */

const MEDIA = [
  // ==== EXEMPLOS (troque pelos seus arquivos reais) ====
  // Fotos:
  // { src: "assets/treino-01.jpg", type: "image", alt: "Treinamento 01" },
  // { src: "assets/treino-02.webp", type: "image", alt: "Treinamento 02" },

  // Vídeos (use poster se quiser uma miniatura melhor):
  // { src: "assets/WhatsApp Video 2025-08-24 at 21.41.57.mp4", type: "video", poster: "assets/imgbr.jpeg", alt: "Cenário prático" },
  // { src: "assets/WhatsApp Video 2025-08-24 at 22.58.35.mp4", type: "video", poster: "assets/imgbr.jpeg", alt: "Linha de tiro" },
];

/* =============== Código =============== */
const grid   = document.getElementById("grid");
const count  = document.getElementById("count");
const tabs   = document.querySelectorAll(".tab");
const qInput = document.getElementById("q");

// Lightbox refs
const lb     = document.getElementById("lightbox");
const lbImg  = document.getElementById("lbImg");
const lbVid  = document.getElementById("lbVid");
const lbCap  = document.getElementById("lbCap");
const btnPrev= document.querySelector(".lb-nav.prev");
const btnNext= document.querySelector(".lb-nav.next");
const btnClose=document.querySelector(".lb-close");

let currentIndex = -1;
let currentList  = []; // itens mostrados (após filtro/pesquisa)

function normalizeList() {
  // remove itens proibidos e normaliza campos
  return (MEDIA || []).filter(m => {
    const s = (m?.src || "").toLowerCase();
    return s && !s.includes("logo") && !s.includes("info") && !s.includes("imgbr");
  }).map(m => ({
    type: m.type || (/\.(mp4|webm|mov)$/i.test(m.src) ? "video" : "image"),
    src: m.src,
    alt: m.alt || nameFromSrc(m.src),
    poster: m.poster || undefined,
  }));
}

function nameFromSrc(src){
  const base = src.split("/").pop().replace(/\.[a-z0-9]+$/i,"").replace(/[-_]+/g," ");
  return base.replace(/\s+/g," ").trim();
}

function render(){
  const filter = document.querySelector(".tab.active")?.dataset.filter || "all";
  const term = (qInput.value || "").toLowerCase().trim();

  const all = normalizeList();
  currentList = all.filter(item => {
    const matchType = filter === "all" ? true : item.type === filter;
    const matchTerm = !term || (item.alt.toLowerCase().includes(term) || item.src.toLowerCase().includes(term));
    return matchType && matchTerm;
  });

  grid.innerHTML = "";
  currentList.forEach((m, i) => {
    const card = document.createElement("figure");
    card.className = "card";
    card.dataset.index = i;

    if (m.type === "image") {
      const img = document.createElement("img");
      img.className = "thumb";
      img.loading = "lazy";
      img.src = m.src;
      img.alt = m.alt;
      card.appendChild(img);
    } else {
      // vídeo: usa <video> só para exibir o first frame (sem autoplay)
      const vid = document.createElement("video");
      vid.className = "thumb";
      vid.muted = true;
      vid.playsInline = true;
      vid.preload = "metadata";
      if (m.poster) vid.poster = m.poster;
      const source = document.createElement("source");
      source.src = m.src;
      source.type = "video/mp4";
      vid.appendChild(source);
      card.appendChild(vid);

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "Vídeo";
      card.appendChild(badge);
    }

    const cap = document.createElement("figcaption");
    cap.className = "caption";
    cap.textContent = m.alt;
    card.appendChild(cap);

    card.addEventListener("click", () => openLightbox(i));
    grid.appendChild(card);
  });

  count.textContent = `${currentList.length} ${currentList.length === 1 ? "item" : "itens"}`;
}

function openLightbox(i){
  currentIndex = i;
  const m = currentList[i];
  if (!m) return;

  lbImg.hidden = lbVid.hidden = true;
  lbCap.textContent = m.alt;

  if (m.type === "image") {
    lbImg.src = m.src;
    lbImg.hidden = false;
  } else {
    lbVid.src = m.src;
    if (m.poster) lbVid.poster = m.poster;
    lbVid.hidden = false;
    lbVid.play().catch(()=>{});
  }

  lb.hidden = false;
  lb.setAttribute("aria-hidden","false");
}

function closeLightbox(){
  lb.hidden = true;
  lb.setAttribute("aria-hidden","true");
  lbImg.src = "";
  lbVid.pause(); lbVid.currentTime = 0; lbVid.src = "";
}

function next(delta){
  if (currentList.length < 2) return;
  currentIndex = (currentIndex + delta + currentList.length) % currentList.length;
  openLightbox(currentIndex);
}

/* ===== Eventos ===== */
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  render();
}));
qInput.addEventListener("input", render);

btnClose.addEventListener("click", closeLightbox);
btnPrev.addEventListener("click", () => next(-1));
btnNext.addEventListener("click", () => next(1));
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });

document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") next(1);
  if (e.key === "ArrowLeft") next(-1);
});

/* ===== Init ===== */
render();
