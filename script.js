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
      "La nueva edición del MTB Ride del Congo llega con ruta recreativa de 65 km, ruta competitiva de 90 km y dos jerseys oficiales.",
    distance: "65 km recreativa · 90 km competitiva",
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
      "assets/ediciones/2026/foto3.webp"
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
      "assets/ediciones/2025/foto3.webp"
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
      "assets/ediciones/2024/foto3.webp"
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
      "assets/ediciones/2023/foto3.webp"
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
