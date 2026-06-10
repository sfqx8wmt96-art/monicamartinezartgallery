/* ============================================================
   Monica Martinez Art Gallery — script.js
   Flujo de 3 vistas: Artistas -> Obras del artista -> Modal
   Para editar el contenido: edita datos.json
   ============================================================ */

/* ---------- ESTADO ---------- */
let galeriaData = null;        // bloque "galeria" de datos.json
let todosArtistas = [];        // bloque "artistas" de datos.json
let todosLosCuadros = [];      // bloque "cuadros" de datos.json
let artistaActualKey = null;   // key del artista actualmente abierto en Vista 2
let obrasArtistaActual = [];   // cuadros del artista actualmente abierto (orden visible)
let indiceModal = 0;           // índice (en obrasArtistaActual) de la obra abierta en el modal

/* ============================================================
   CARGA DE DATOS
   ============================================================ */
async function cargarDatos() {
  try {
    const resp = await fetch('datos.json', { cache: 'no-cache' });
    const data = await resp.json();
    galeriaData = data.galeria || {};
    todosArtistas = data.artistas || [];
    todosLosCuadros = data.cuadros || [];
    iniciar();
  } catch (e) {
    console.error('Error cargando datos.json:', e);
    const cont = document.getElementById('artistas-cards');
    if (cont) cont.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">No se pudo cargar el catálogo. Inténtalo de nuevo en unos minutos.</p>';
  }
}

function iniciar() {
  renderVistaArtistas();
  mostrarVista('artistas');
  conectarEventosGlobales();
}

/* ============================================================
   HELPERS
   ============================================================ */
function obrasDelArtista(nombreArtista) {
  return todosLosCuadros
    .filter(c => c.artista === nombreArtista)
    .sort((a, b) => a.id - b.id);
}

function cuadroPorId(id) {
  return todosLosCuadros.find(c => c.id === id);
}

function formatearPrecio(cuadro) {
  if (cuadro.precio_consultar || cuadro.precio == null) return 'Consultar';
  const moneda = (cuadro.moneda || 'MXN').toUpperCase();
  const locale = moneda === 'USD' ? 'en-US' : 'es-MX';
  return '$' + Number(cuadro.precio).toLocaleString(locale) + ' ' + moneda;
}

function whatsappLink(cuadro) {
  const numero = (galeriaData.contacto && galeriaData.contacto.whatsapp) || '+528717274655';
  const numLimpio = numero.replace(/\D/g, '');
  const mensaje = `Hola Mónica, me interesa la obra "${cuadro.titulo}" de ${cuadro.artista}. ¿Está disponible?`;
  return `https://wa.me/${numLimpio}?text=${encodeURIComponent(mensaje)}`;
}

function generarPlaceholder(titulo) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <rect width="600" height="750" fill="#f5efe6"/>
    <rect x="40" y="40" width="520" height="670" fill="none" stroke="#e0d6c5" stroke-width="1"/>
    <text x="300" y="370" text-anchor="middle" font-family="serif" font-size="22" fill="#b8946a" font-style="italic">${escapeXML(titulo)}</text>
    <text x="300" y="400" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#c5bba6" letter-spacing="3">Imagen próximamente</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function escapeXML(s) {
  return String(s || '').replace(/[<>&"']/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[ch]));
}

/* ============================================================
   NAVEGACIÓN ENTRE VISTAS
   ============================================================ */
function mostrarVista(nombre, opts = {}) {
  const v1 = document.getElementById('vista-artistas');
  const v2 = document.getElementById('vista-obras');
  if (nombre === 'artistas') {
    v1.hidden = false;
    v2.hidden = true;
    document.body.classList.remove('is-vista-obras');
  } else if (nombre === 'obras') {
    v1.hidden = true;
    v2.hidden = false;
    document.body.classList.add('is-vista-obras');
  }
  if (opts.scroll === false) return;
  if (opts.scrollTarget === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const galeria = document.getElementById('galeria');
    if (galeria) window.scrollTo({ top: galeria.offsetTop - 70, behavior: 'smooth' });
  }
}

/* ============================================================
   VISTA 1 — Galería de artistas
   ============================================================ */
function renderVistaArtistas() {
  const cont = document.getElementById('artistas-cards');
  cont.innerHTML = '';

  todosArtistas.forEach(artista => {
    const obras = obrasDelArtista(artista.nombre);
    if (obras.length === 0) return;

    const cover = cuadroPorId(artista.cover_id) || obras[0];
    const imgSrc = cover.imagen || generarPlaceholder(artista.nombre);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'artista-card';
    card.dataset.key = artista.key;
    card.setAttribute('aria-label', `Ver obras de ${artista.nombre}`);
    card.innerHTML = `
      <div class="artista-card-imagen">
        <img src="${imgSrc}" alt="${escapeXML(artista.nombre)}" loading="lazy" decoding="async">
      </div>
      <div class="artista-card-info">
        <p class="artista-card-nombre">${escapeXML(artista.nombre)}</p>
        ${artista.estilo ? `<p class="artista-card-estilo">${escapeXML(artista.estilo)}</p>` : ''}
        <p class="artista-card-obras">${obras.length} ${obras.length === 1 ? 'obra disponible' : 'obras disponibles'}</p>
        <span class="artista-card-cta">Ver obras <em>&rarr;</em></span>
      </div>
    `;
    card.addEventListener('click', (e) => {
      e.preventDefault();
      abrirArtista(artista.key);
    });
    cont.appendChild(card);
  });
}

/* ============================================================
   VISTA 2 — Obras del artista
   ============================================================ */
function abrirArtista(key) {
  const artista = todosArtistas.find(a => a.key === key);
  if (!artista) return;
  artistaActualKey = key;
  obrasArtistaActual = obrasDelArtista(artista.nombre);

  document.getElementById('artista-nombre').textContent = artista.nombre;
  document.getElementById('artista-bio').textContent = artista.bio || '';
  document.getElementById('artista-bio').hidden = !artista.bio;

  renderObrasGrid();
  mostrarVista('obras');
}

function renderObrasGrid() {
  const cont = document.getElementById('obras-grid');
  cont.innerHTML = '';
  obrasArtistaActual.forEach((cuadro, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'obra-card' + (!cuadro.disponible ? ' is-vendido' : '');
    card.setAttribute('aria-label', `Ver detalles de ${cuadro.titulo}`);
    const src = cuadro.thumb || cuadro.imagen || generarPlaceholder(cuadro.titulo);
    card.innerHTML = `
      <div class="obra-card-imagen">
        <img src="${src}" alt="${escapeXML(cuadro.titulo)}" loading="lazy" decoding="async">
        ${!cuadro.disponible ? '<span class="obra-card-vendido">VENDIDO</span>' : ''}
      </div>
      <div class="obra-card-info">
        <p class="obra-card-titulo">${escapeXML(cuadro.titulo)}</p>
        <p class="obra-card-tecnica">${escapeXML(cuadro.tecnica || '')}</p>
      </div>
    `;

    card.addEventListener('click', () => abrirModal(i));
    cont.appendChild(card);
  });
}

/* ============================================================
   VISTA 3 — Modal de la obra
   ============================================================ */
function abrirModal(index) {
  if (index < 0 || index >= obrasArtistaActual.length) return;
  indiceModal = index;
  llenarModal(obrasArtistaActual[indiceModal]);
  const modal = document.getElementById('modal');
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Pequeño retraso para que el navegador detecte el cambio y dispare la transición
  requestAnimationFrame(() => modal.classList.add('is-open'));
}

function cerrarModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('is-open');
  setTimeout(() => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }, 280);
}

function navegarModal(dir) {
  let nuevo = indiceModal + dir;
  if (nuevo < 0) nuevo = obrasArtistaActual.length - 1;
  if (nuevo >= obrasArtistaActual.length) nuevo = 0;
  indiceModal = nuevo;
  llenarModal(obrasArtistaActual[indiceModal]);
}

function llenarModal(cuadro) {
  if (!cuadro) return;

  // Imagen: pre-carga para fade limpio
  const img = document.getElementById('modal-img');
  const wrap = document.getElementById('modal-imagen-wrap');
  img.style.opacity = 0;
  // Limpiar sello vendido previo
  const selloPrev = wrap.querySelector('.modal-sello-vendido');
  if (selloPrev) selloPrev.remove();
  wrap.classList.toggle('is-vendido', !cuadro.disponible);

  const finalizarImg = (src) => {
    img.src = src;
    img.alt = cuadro.titulo;
    img.style.opacity = 1;
  };
  if (cuadro.imagen) {
    const pre = new Image();
    pre.onload = () => finalizarImg(cuadro.imagen);
    pre.onerror = () => finalizarImg(generarPlaceholder(cuadro.titulo));
    pre.src = cuadro.imagen;
    if (pre.complete && pre.naturalWidth > 0) finalizarImg(cuadro.imagen);
  } else {
    finalizarImg(generarPlaceholder(cuadro.titulo));
  }

  // Sello SOLD si está vendido
  if (!cuadro.disponible) {
    const sello = document.createElement('div');
    sello.className = 'modal-sello-vendido';
    sello.innerHTML = '<span>SOLD</span>';
    wrap.appendChild(sello);
  }

  // Texto
  document.getElementById('modal-tecnica').textContent = cuadro.tecnica || '';
  document.getElementById('modal-titulo').textContent = cuadro.titulo || '';
  document.getElementById('modal-medidas').textContent = cuadro.dimensiones || '—';

  // Precio
  const precioEl = document.getElementById('modal-precio');
  precioEl.textContent = formatearPrecio(cuadro);
  precioEl.classList.toggle('es-consultar', cuadro.precio_consultar || cuadro.precio == null);

  // Extras (envío / marco)
  const extras = [];
  if (cuadro.incluye_envio) extras.push('Envío nacional');
  if (cuadro.incluye_marco) extras.push('Marco');
  const rowExtras = document.getElementById('modal-row-extras');
  if (extras.length) {
    document.getElementById('modal-extras').textContent = extras.join(' · ');
    rowExtras.hidden = false;
  } else {
    rowExtras.hidden = true;
  }

  document.getElementById('modal-desc').textContent = cuadro.descripcion || '';

  // CTA WhatsApp
  const cta = document.getElementById('modal-cta');
  cta.href = whatsappLink(cuadro);
  if (!cuadro.disponible) {
    cta.textContent = 'Esta obra ya fue vendida';
    cta.classList.add('es-vendido');
    cta.removeAttribute('href');
  } else {
    cta.innerHTML = 'Me interesa esta obra <span aria-hidden="true">&rarr;</span>';
    cta.classList.remove('es-vendido');
  }
}

/* ============================================================
   EVENTOS GLOBALES
   ============================================================ */
function conectarEventosGlobales() {
  // Botón volver (vista 2 -> vista 1)
  document.getElementById('btn-volver').addEventListener('click', () => {
    mostrarVista('artistas');
    artistaActualKey = null;
    obrasArtistaActual = [];
  });

  // Modal: cerrar
  document.getElementById('modal-close').addEventListener('click', cerrarModal);

  // Modal: navegación
  document.getElementById('modal-prev').addEventListener('click', () => navegarModal(-1));
  document.getElementById('modal-next').addEventListener('click', () => navegarModal(+1));

  // Click fuera del contenido del modal
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') cerrarModal();
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('modal');
    if (modal.hidden) return;
    if (e.key === 'Escape') { cerrarModal(); }
    else if (e.key === 'ArrowLeft')  { navegarModal(-1); }
    else if (e.key === 'ArrowRight') { navegarModal(+1); }
  });

  // Swipe en mobile dentro del modal
  let touchStartX = 0;
  const imgWrap = document.getElementById('modal-imagen-wrap');
  imgWrap.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  imgWrap.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) navegarModal(diff > 0 ? +1 : -1);
  });

  // Menú hamburger
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navMobile').classList.toggle('open');
  });

  // Logo MM: regresa al estado inicial (Vista 1 + scroll a hero)
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('modal');
      if (!modal.hidden) cerrarModal();
      artistaActualKey = null;
      obrasArtistaActual = [];
      mostrarVista('artistas', { scrollTarget: 'top' });
      closeMobile();
    });
  }
}

// Función global usada por onclick="" en el HTML del nav mobile
function closeMobile() {
  document.getElementById('navMobile').classList.remove('open');
}

/* ============================================================
   ARRANCAR
   ============================================================ */
cargarDatos();
