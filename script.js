const raceDate = new Date("2027-08-15T06:00:00");

/*
  Jerseys anteriores con nombres originales:
  assets/jerseys/jersey-2023.webp
  assets/jerseys/jersey-2024.webp
  assets/jerseys/jersey-2025.webp
  assets/jerseys/jersey-2026.webp

  Jerseys 2027:
  assets/jerseys/2027/jersey-hombre.webp
  assets/jerseys/2027/jersey-mujer.webp
*/

const editions = [
  {
    year: "2027",
    title: "Próxima edición",
    description:
      "La nueva edición del MTB Ride del Congo llega con ruta recreativa de 68.1 km, ruta competitiva de 90.6 km y dos jerseys oficiales.",
    distance: "68.1 km recreativa · 90.6 km competitiva",
    jerseys: [
      "assets/jerseys/2027/jersey-hombre.webp",
      "assets/jerseys/2027/jersey-mujer.webp"
    ],
    photos: [
      "assets/ediciones/2027/foto1.webp",
      "assets/ediciones/2027/foto2.webp",
      "assets/ediciones/2027/foto3.webp"
    ]
  },
  {
    year: "2026",
    title: "Edición 2026",
    description:
      "Una edición marcada por montaña, comunidad y el crecimiento del MTB Ride del Congo.",
    distance: "65 km recreativa · 90 km competitiva",
    jersey: "assets/jerseys/jersey-2026.webp",
    photos: [
      "assets/ediciones/2026/foto1.webp",
      "assets/ediciones/2026/foto2.webp",
      "assets/ediciones/2026/foto3.webp",
      "assets/ediciones/2026/foto4.webp",
      "assets/ediciones/2026/foto5.webp",
      "assets/ediciones/2026/foto6.webp"
    ]
  },
  {
    year: "2025",
    title: "Edición 2025",
    description:
      "Una edición que fortaleció la comunidad ciclista y mantuvo vivo el espíritu de aventura del evento.",
    distance: "MTB · montaña · comunidad",
    jersey: "assets/jerseys/jersey-2025.webp",
    photos: [
      "assets/ediciones/2025/foto1.webp",
      "assets/ediciones/2025/foto2.webp",
      "assets/ediciones/2025/foto3.webp",
      "assets/ediciones/2025/foto4.webp"
    ]
  },
  {
    year: "2024",
    title: "Edición 2024",
    description:
      "Una experiencia llena de paisajes, amistad y ciclismo de montaña en los alrededores del Cerro Congo.",
    distance: "MTB · aventura · naturaleza",
    jersey: "assets/jerseys/jersey-2024.webp",
    photos: [
      "assets/ediciones/2024/foto1.webp",
      "assets/ediciones/2024/foto2.webp",
      "assets/ediciones/2024/foto3.webp",
      "assets/ediciones/2024/foto4.webp",
      "assets/ediciones/2024/foto5.webp"
    ]
  },
  {
    year: "2023",
    title: "Primera edición oficial",
    description:
      "La primera edición oficial superó las expectativas con una ruta recreativa de 65 km desde Carrizal de Alajuela hasta Hacienda Pozo Azul.",
    distance: "65 km recreativa",
    jersey: "assets/jerseys/jersey-2023.webp",
    photos: [
      "assets/ediciones/2023/foto1.webp",
      "assets/ediciones/2023/foto2.webp",
      "assets/ediciones/2023/foto3.webp",
      "assets/ediciones/2023/foto4.webp",
      "assets/ediciones/2023/foto5.webp"
    ]
  }
];

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

function updateCountdown() {
  const daysElement = document.getElementById("daysRemaining");

  if (!daysElement) return;

  const today = new Date();
  const difference = raceDate - today;
  const days = Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));

  daysElement.textContent = String(days).padStart(2, "0");
}

function createJerseyHtml(edition) {
  if (edition.jerseys && edition.jerseys.length > 0) {
    return `
      <div class="edition-jersey edition-jersey-duo">
        ${edition.jerseys
          .map((jersey, index) => {
            const label = index === 0 ? "hombre" : "mujer";
            return `
              <img
                src="${jersey}"
                alt="Jersey oficial ${label} edición ${edition.year}"
              >
            `;
          })
          .join("")}
      </div>
    `;
  }

  return `
    <div class="edition-jersey">
      <img src="${edition.jersey}" alt="Jersey oficial edición ${edition.year}">
    </div>
  `;
}

function createEditionCard(edition, editionIndex) {
  const article = document.createElement("article");
  article.className = "edition-card";

  article.innerHTML = `
    <div class="edition-info">
      <span class="edition-year">${edition.year}</span>
      <h3>${edition.title}</h3>
      <p>${edition.description}</p>
      <p><strong>${edition.distance}</strong></p>

      ${createJerseyHtml(edition)}
    </div>

    <div class="slider" data-slider="${editionIndex}">
      ${edition.photos
        .map((photo, photoIndex) => {
          return `
            <img
              src="${photo}"
              alt="Foto ${photoIndex + 1} de la edición ${edition.year}"
              class="${photoIndex === 0 ? "active" : ""}"
            >
          `;
        })
        .join("")}

      <div class="slider-controls">
        <button class="prev-slide" aria-label="Foto anterior">‹</button>

        <div class="slider-dots">
          ${edition.photos
            .map((_, photoIndex) => {
              return `
                <button
                  class="${photoIndex === 0 ? "active" : ""}"
                  data-dot="${photoIndex}"
                  aria-label="Ver foto ${photoIndex + 1}"
                ></button>
              `;
            })
            .join("")}
        </div>

        <button class="next-slide" aria-label="Foto siguiente">›</button>
      </div>
    </div>
  `;

  return article;
}

function renderEditions() {
  const container = document.getElementById("editionsContainer");

  if (!container) return;

  editions.forEach((edition, index) => {
    const card = createEditionCard(edition, index);
    container.appendChild(card);
  });
}

function setupSliders() {
  const sliders = document.querySelectorAll(".slider");

  sliders.forEach(slider => {
    const images = slider.querySelectorAll("img");
    const dots = slider.querySelectorAll(".slider-dots button");
    const prevButton = slider.querySelector(".prev-slide");
    const nextButton = slider.querySelector(".next-slide");

    if (images.length === 0 || dots.length === 0 || !prevButton || !nextButton) return;

    let currentIndex = 0;

    function showSlide(newIndex) {
      images[currentIndex].classList.remove("active");
      dots[currentIndex].classList.remove("active");

      currentIndex = (newIndex + images.length) % images.length;

      images[currentIndex].classList.add("active");
      dots[currentIndex].classList.add("active");
    }

    prevButton.addEventListener("click", () => {
      showSlide(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
      showSlide(currentIndex + 1);
    });

    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        showSlide(Number(dot.dataset.dot));
      });
    });

    setInterval(() => {
      showSlide(currentIndex + 1);
    }, 4500);
  });
}

function setupJerseyCards() {
  const jerseyCards = document.querySelectorAll(".jersey-card");
  const desktopQuery = window.matchMedia("(min-width: 901px)");

  function clearActiveCards() {
    jerseyCards.forEach(card => card.classList.remove("active"));
  }

  jerseyCards.forEach(card => {
    card.addEventListener("click", () => {
      if (!desktopQuery.matches) {
        clearActiveCards();
        return;
      }

      jerseyCards.forEach(item => {
        if (item !== card) {
          item.classList.remove("active");
        }
      });

      card.classList.toggle("active");
    });
  });

  desktopQuery.addEventListener("change", event => {
    if (!event.matches) {
      clearActiveCards();
    }
  });
}

updateCountdown();
renderEditions();
setupSliders();
setupJerseyCards();


// =========================================================
// Mapa y perfiles de elevación - rutas GPX 2027
// =========================================================
const routeConfigs = {
  short: {
    type: "Ruta recreativa",
    name: "Recorrido corto 2027",
    file: "assets/routes/ride-del-congo-ruta-corta-2027.gpx",
    color: "#00bfff",
    description: "Recorrido pensado para disfrutar la montaña, los paisajes y el espíritu del Ride del Congo."
  },
  long: {
    type: "Ruta competitiva",
    name: "Recorrido largo 2027",
    file: "assets/routes/ride-del-congo-ruta-larga-2027.gpx",
    color: "#ff7a00",
    description: "Un recorrido de mayor distancia y exigencia para ciclistas que buscan el desafío completo del Ride del Congo."
  }
};

const loadedRoutes = {};
let routeMap = null;
let activeRouteLayer = null;
let startMarker = null;
let finishMarker = null;
let activeRouteKey = "short";

function haversineDistance(a, b) {
  const R = 6371000;
  const toRad = value => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function parseGpx(text) {
  const xml = new DOMParser().parseFromString(text, "application/xml");
  const parserError = xml.querySelector("parsererror");
  if (parserError) throw new Error("El archivo GPX no se pudo interpretar.");

  const pointNodes = [...xml.querySelectorAll("trkpt, rtept")];
  const points = pointNodes.map(node => ({
    lat: Number(node.getAttribute("lat")),
    lon: Number(node.getAttribute("lon")),
    ele: Number(node.querySelector("ele")?.textContent ?? 0)
  })).filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lon));

  if (points.length < 2) throw new Error("El GPX no contiene suficientes puntos.");

  let distance = 0;
  let gain = 0;
  let loss = 0;
  const elevations = [];
  const cumulativeDistances = [0];

  for (let i = 0; i < points.length; i += 1) {
    if (Number.isFinite(points[i].ele)) elevations.push(points[i].ele);
    if (i === 0) continue;

    const segmentDistance = haversineDistance(points[i - 1], points[i]);
    distance += segmentDistance;
    cumulativeDistances.push(distance);

    const delta = points[i].ele - points[i - 1].ele;
    if (delta > 0) gain += delta;
    if (delta < 0) loss += Math.abs(delta);
  }

  return {
    points,
    cumulativeDistances,
    distance,
    gain,
    loss,
    minEle: Math.min(...elevations),
    maxEle: Math.max(...elevations)
  };
}

async function loadRoute(key) {
  if (loadedRoutes[key]) return loadedRoutes[key];

  const response = await fetch(routeConfigs[key].file);
  if (!response.ok) throw new Error(`No se pudo cargar ${routeConfigs[key].file}`);

  const route = parseGpx(await response.text());
  loadedRoutes[key] = route;
  return route;
}

function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString("es-CR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function drawElevationChart(route, color) {
  const canvas = document.getElementById("elevationChart");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(180 * dpr));

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 180;
  const pad = { left: 8, right: 8, top: 12, bottom: 18 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const min = route.minEle;
  const max = route.maxEle;
  const range = Math.max(1, max - min);

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i += 1) {
    const y = pad.top + (chartH * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  const coords = route.points.map((point, index) => {
    const x = pad.left + (route.cumulativeDistances[index] / route.distance) * chartW;
    const y = pad.top + chartH - ((point.ele - min) / range) * chartH;
    return { x, y };
  });

  const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  gradient.addColorStop(0, `${color}66`);
  gradient.addColorStop(1, `${color}05`);

  ctx.beginPath();
  ctx.moveTo(coords[0].x, pad.top + chartH);
  coords.forEach(point => ctx.lineTo(point.x, point.y));
  ctx.lineTo(coords[coords.length - 1].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  coords.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.fillStyle = "rgba(215,225,229,0.78)";
  ctx.font = "11px Arial";
  ctx.fillText("0 km", pad.left, height - 3);
  const endLabel = `${formatNumber(route.distance / 1000, 1)} km`;
  const labelWidth = ctx.measureText(endLabel).width;
  ctx.fillText(endLabel, width - pad.right - labelWidth, height - 3);
}

function updateRouteStats(route, key) {
  const config = routeConfigs[key];
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setText("routeType", config.type);
  setText("routeName", config.name);
  setText("routeDescription", config.description);
  setText("routeDistance", formatNumber(route.distance / 1000, 1));
  setText("routeGain", formatNumber(route.gain));
  setText("routeMaxEle", formatNumber(route.maxEle));
  setText("routeMinEle", formatNumber(route.minEle));
  setText("elevationRange", `${formatNumber(route.minEle)} m — ${formatNumber(route.maxEle)} m`);

  const download = document.getElementById("routeDownload");
  if (download) {
    download.href = config.file;
    download.setAttribute("download", "");
  }

  drawElevationChart(route, config.color);
}

function renderRouteOnMap(route, key) {
  if (!routeMap || typeof L === "undefined") return;

  if (activeRouteLayer) routeMap.removeLayer(activeRouteLayer);
  if (startMarker) routeMap.removeLayer(startMarker);
  if (finishMarker) routeMap.removeLayer(finishMarker);

  const config = routeConfigs[key];
  const latLngs = route.points.map(point => [point.lat, point.lon]);

  activeRouteLayer = L.polyline(latLngs, {
    color: config.color,
    weight: 5,
    opacity: 0.95,
    lineJoin: "round"
  }).addTo(routeMap);

  const start = latLngs[0];
  const finish = latLngs[latLngs.length - 1];

  startMarker = L.circleMarker(start, {
    radius: 8,
    color: "#ffffff",
    weight: 2,
    fillColor: "#00d6c9",
    fillOpacity: 1
  }).bindTooltip("Salida", { permanent: false }).addTo(routeMap);

  finishMarker = L.circleMarker(finish, {
    radius: 8,
    color: "#ffffff",
    weight: 2,
    fillColor: "#ff7a00",
    fillOpacity: 1
  }).bindTooltip("Meta", { permanent: false }).addTo(routeMap);

  routeMap.fitBounds(activeRouteLayer.getBounds(), { padding: [24, 24] });
}

async function selectRoute(key) {
  activeRouteKey = key;
  document.querySelectorAll(".route-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.route === key);
  });

  try {
    const route = await loadRoute(key);
    renderRouteOnMap(route, key);
    updateRouteStats(route, key);
  } catch (error) {
    console.error(error);
    const details = document.querySelector(".route-details");
    if (details) details.setAttribute("data-route-error", "true");
  }
}

function setupRouteExplorer() {
  const mapElement = document.getElementById("routeMap");
  if (!mapElement || typeof L === "undefined") return;

  routeMap = L.map(mapElement, {
    scrollWheelZoom: false,
    zoomControl: true
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(routeMap);

  document.querySelectorAll(".route-tab").forEach(button => {
    button.addEventListener("click", () => selectRoute(button.dataset.route));
  });

  selectRoute(activeRouteKey);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      routeMap.invalidateSize();
      const activeRoute = loadedRoutes[activeRouteKey];
      if (activeRoute) drawElevationChart(activeRoute, routeConfigs[activeRouteKey].color);
    }, 150);
  });
}

setupRouteExplorer();
