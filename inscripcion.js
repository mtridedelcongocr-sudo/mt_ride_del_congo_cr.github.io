"use strict";

const ENABLE_REAL_SUBMISSION = false;
const REGISTRATION_API_URL = "https://mtb-inscripciones-api.mt-ride-del-congo-cr.workers.dev/api/inscripciones";
let submissionInProgress = false;
let submissionConfirmed = false;
let pendingRequest = null;

// Configuración pública de la demostración; no contiene credenciales.
const registrationConfig = {
  prices: { competitive: 28000, recreational: 18000, jersey: 7000 },
  categories: [
    ["juvenile", "Juvenil · 15 a 17 años"],
    ["open", "Open · 18 a 29 años"],
    ["masterA", "Master A · 30 a 39 años"],
    ["masterB", "Master B · 40 a 49 años"],
    ["masterC", "Master C · 50 a 59 años"],
    ["masterD", "Master D · 60 a 79 años"],
    ["ebike", "E-Bike · sin límite de edad"]
  ],
  ageReferenceYear: 2027,
  ageRanges: {
    juvenile: [15, 17],
    open: [18, 29],
    masterA: [30, 39],
    masterB: [40, 49],
    masterC: [50, 59],
    masterD: [60, 79]
  },
  sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
};
const form = document.getElementById("registrationForm");
const participants = document.getElementById("participants");
const money = amount => new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(amount);
const today = new Date();
const dateMax = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

function participantMarkup(index) {
  const id = `p${index}`;
  return `<fieldset class="participant" data-participant="${index}"><legend>Participante ${index}</legend>
    <div class="field-grid">
      <div class="field-full"><label for="${id}-name">Nombre completo *</label><input id="${id}-name" name="${id}-name" autocomplete="name" required minlength="3" maxlength="120"></div>
      <div><label for="${id}-identification">Cédula o identificación *</label><input id="${id}-identification" name="${id}-identification" required minlength="5" maxlength="30" pattern="[A-Za-z0-9 .-]{5,30}" title="Ingresá de 5 a 30 caracteres: letras, números, espacios, puntos o guiones."></div>
      <div><label for="${id}-sex">Sexo *</label><select id="${id}-sex" name="${id}-sex" required><option value="">Seleccioná</option><option value="female">Femenino</option><option value="male">Masculino</option></select></div>
      <div><label for="${id}-birth">Fecha de nacimiento *</label><input id="${id}-birth" name="${id}-birth" type="date" min="1900-01-01" max="${dateMax}" required></div>
      <div><label for="${id}-phone">Teléfono *</label><input id="${id}-phone" name="${id}-phone" type="tel" autocomplete="tel" required pattern="[+0-9 ()-]{8,24}" maxlength="24" title="Ingresá un teléfono de 8 a 24 caracteres; podés incluir el código de país."></div>
      <div class="field-full"><label for="${id}-email">Correo electrónico *</label><input id="${id}-email" name="${id}-email" type="email" autocomplete="email" required maxlength="150"></div>
      <div class="field-full"><p class="field-help age-note" id="${id}-age" aria-live="polite">Edad de competencia al 31 de diciembre de 2027: 2027 menos el año de nacimiento.</p></div>
      <div><label for="${id}-mode">Modalidad *</label><select id="${id}-mode" name="${id}-mode" required><option value="">Seleccioná</option><option value="competitive">Competitiva · con premiación</option><option value="recreational">No competitiva · recreativa</option></select></div>
      <div><label for="${id}-category">Categoría *</label><select id="${id}-category" name="${id}-category" required><option value="">Elegí primero la modalidad</option></select></div>
    </div>
    <label class="check-line"><input id="${id}-jersey" name="${id}-jersey" type="checkbox"><span>Quiero el jersey oficial (+ ${money(registrationConfig.prices.jersey)})</span></label>
    <div class="jersey-details field-grid" id="${id}-jerseyDetails" hidden>
      <div><label for="${id}-design">Diseño de jersey *</label><select id="${id}-design" name="${id}-design" disabled required><option value="">Seleccioná</option><option value="men">Jersey hombre</option><option value="women">Jersey mujer</option></select></div>
      <div><label for="${id}-size">Talla *</label><select id="${id}-size" name="${id}-size" disabled required><option value="">Seleccioná</option>${registrationConfig.sizes.map(size => `<option>${size}</option>`).join("")}</select></div>
    </div>
  </fieldset>`;
}
participants.innerHTML = participantMarkup(1) + participantMarkup(2);
const field = (index, key) => document.getElementById(`p${index}-${key}`);
const isPair = () => form.elements.registrationType.value === "pair";
function activeParticipants() { return isPair() ? [1, 2] : [1]; }

function construirDatosInscripcion() {
  const datos = {
    tipoInscripcion: isPair() ? "pair" : "individual",
    participantes: activeParticipants()
      .filter(index => {
        const grupo = participants.querySelector(`[data-participant="${index}"]`);
        return grupo && !grupo.hidden && !grupo.disabled;
      })
      .map(index => {
        const texto = key => field(index, key).value.trim();
        const jersey = field(index, "jersey").checked;
        const participante = {
          nombre: texto("name"),
          identificacion: texto("identification"),
          sexo: texto("sex"),
          fechaNacimiento: texto("birth"),
          telefono: texto("phone"),
          correo: texto("email"),
          modalidad: texto("mode"),
          categoria: texto("category"),
          jersey
        };
        if (jersey) {
          participante.disenoJersey = texto("design");
          participante.tallaJersey = texto("size");
        }
        return participante;
      }),
    metodoPago: document.getElementById("paymentMethod").value.trim(),
    referenciaPago: document.getElementById("paymentReference").value.trim(),
    comentarios: document.getElementById("comments").value.trim()
  };
  if (isPair()) datos.categoriaPareja = document.getElementById("pairCategory").value.trim();
  return datos;
}

function updateCategories(index) {
  const mode = field(index, "mode").value;
  const category = field(index, "category");
  const previous = category.value;
  let options = [];
  if (mode === "recreational") options = [["recreational", "Recreativa · sin premiación"]];
  else if (mode === "competitive") {
    options = isPair() ? [[document.getElementById("pairCategory").value, document.getElementById("pairCategory").selectedOptions[0].textContent]] : registrationConfig.categories;
    options = options.filter(([value]) => value);
  }
  category.replaceChildren(new Option(options.length ? "Seleccioná" : "Elegí modalidad y categoría de pareja", ""), ...options.map(([value, label]) => new Option(label, value)));
  if (options.some(([value]) => value === previous)) category.value = previous;
  else if (options.length === 1) category.value = options[0][0];
}

function updateForm() {
  const pair = isPair();
  const second = participants.querySelector('[data-participant="2"]');
  second.hidden = !pair;
  second.disabled = !pair;
  document.getElementById("pairCategoryWrap").hidden = !pair;
  document.getElementById("pairCategory").disabled = !pair;
  for (const index of [1, 2]) {
    const jersey = field(index, "jersey").checked;
    field(index, "jerseyDetails").hidden = !jersey;
    field(index, "design").disabled = !jersey || (index === 2 && !pair);
    field(index, "size").disabled = !jersey || (index === 2 && !pair);
    updateCategories(index);
    field(index, "name").setCustomValidity(field(index, "name").value.trim().length < 3
      ? "Ingresá un nombre completo de al menos 3 caracteres, sin contar espacios al inicio o al final." : "");
    field(index, "identification").setCustomValidity("");
    field(index, "sex").setCustomValidity("");
    const birth = field(index, "birth").value;
    const age = birth ? registrationConfig.ageReferenceYear - Number(birth.split("-")[0]) : null;
    const category = field(index, "category");
    category.setCustomValidity("");
    let ageMessage = age === null
      ? "Edad de competencia al 31 de diciembre de 2027: 2027 menos el año de nacimiento."
      : `Edad de competencia al 31 de diciembre de 2027: ${age} años.`;
    if (!pair && index === 1 && field(index, "mode").value === "competitive") {
      const range = registrationConfig.ageRanges[category.value];
      if (age !== null && range && (age < range[0] || age > range[1])) {
        const label = registrationConfig.categories.find(([value]) => value === category.value)[1];
        const message = `La categoría ${label} no corresponde a tu edad de competencia (${age} años al 31 de diciembre de 2027). Seleccioná una categoría que corresponda a tu edad.`;
        category.setCustomValidity(message);
        ageMessage += ` ${message}`;
      } else if (category.value === "ebike") {
        ageMessage += " E-Bike no tiene un límite de edad definido.";
      }
    }
    if (age !== null && age < 18) {
      ageMessage += " Participante menor de edad según la referencia de competencia: la inscripción real requerirá la autorización de su representante. El procedimiento está pendiente de definir.";
    }
    field(index, "age").textContent = ageMessage;
  }
  const normalizeId = value => value.replace(/[ .-]/g, "").toUpperCase();
  if (pair && field(1,"identification").value && normalizeId(field(1,"identification").value) === normalizeId(field(2,"identification").value)) {
    field(2,"identification").setCustomValidity("Cada participante debe tener una identificación diferente.");
  }
  if (pair) {
    const category = document.getElementById("pairCategory").value;
    const first = field(1,"sex").value;
    const secondSex = field(2,"sex").value;
    if (first && secondSex && ((category === "female" && (first !== "female" || secondSex !== "female")) || (category === "male" && (first !== "male" || secondSex !== "male")) || (category === "mixed" && first === secondSex))) {
      field(2,"sex").setCustomValidity("Revisá que el sexo de ambos participantes coincida con la categoría de pareja elegida.");
    }
  }
  updateSummary();
}

function updateSummary() {
  let total = 0;
  const items = document.getElementById("summaryItems");
  items.replaceChildren();
  for (const index of activeParticipants()) {
    const mode = field(index,"mode").value;
    const jersey = field(index,"jersey").checked;
    const amount = mode ? registrationConfig.prices[mode] + (jersey ? registrationConfig.prices.jersey : 0) : 0;
    total += amount;
    const row = document.createElement("div"); row.className = "summary-item";
    const name = document.createElement("strong"); name.textContent = field(index,"name").value.trim() || `Participante ${index}`;
    const detail = document.createElement("small"); detail.textContent = mode ? `${mode === "competitive" ? "Competitiva" : "Recreativa"} · ${jersey ? "con jersey" : "sin jersey"} · ${money(amount)}` : "Modalidad pendiente de elegir";
    row.append(name,detail); items.append(row);
  }
  document.getElementById("totalAmount").textContent = money(total);
}

function updatePayment() {
  const method = document.getElementById("paymentMethod").value;
  const input = document.getElementById("paymentReference");
  document.getElementById("paymentDetail").hidden = !method;
  input.disabled = !method;
  input.value = "";
  input.type = method === "sinpe" ? "tel" : "text";
  input.maxLength = method === "sinpe" ? 24 : 80;
  input.minLength = method === "sinpe" ? 8 : 3;
  input.pattern = method === "sinpe" ? "[+0-9 ()-]{8,24}" : ".*\\S.*";
  document.getElementById("paymentLabel").textContent = method === "sinpe" ? "Teléfono desde el que se realizó el SINPE *" : "Referencia o número de transferencia *";
  document.getElementById("paymentHelp").textContent = method === "sinpe"
    ? (ENABLE_REAL_SUBMISSION ? "Ingresá el teléfono desde el que se realizó el pago." : "Usá un número ficticio para esta demostración.")
    : "No ingresés claves bancarias ni números de cuenta.";
}

function showSubmissionMessage(title, detail, error = false) {
  const result = document.getElementById("formResult");
  result.replaceChildren();
  result.classList.toggle("error", error);
  const heading = document.createElement("strong");
  heading.textContent = title;
  const message = document.createElement("p");
  message.textContent = detail;
  result.append(heading, message);
  result.hidden = false;
  result.focus();
}

function resetSubmissionTurnstile() {
  if (window.turnstile) {
    try { window.turnstile.reset(); } catch {
      // No alterar el resultado del envío si el widget no pudo restablecerse.
      const note = document.createElement("p");
      note.textContent = "Recargá la verificación de seguridad antes de otro intento. Al recargar la página se pierde el identificador de reintento.";
      document.getElementById("formResult").append(note);
    }
  }
}

function requestIdFor(datos) {
  const serialized = JSON.stringify(datos);
  if (!pendingRequest || pendingRequest.serialized !== serialized) {
    pendingRequest = { requestId: crypto.randomUUID(), serialized };
  }
  return pendingRequest.requestId;
}

form.addEventListener("input", () => {
  if (submissionInProgress || submissionConfirmed) return;
  document.getElementById("formResult").hidden = true;
  updateForm();
});
form.addEventListener("change", event => {
  if (submissionInProgress || submissionConfirmed) return;
  if (event.target.id === "paymentMethod") updatePayment();
  updateForm();
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (submissionInProgress || submissionConfirmed) return;
  updateForm();
  if (!form.reportValidity()) return;
  const datos = construirDatosInscripcion();
  const cantidadEsperada = datos.tipoInscripcion === "pair" ? 2 : 1;
  if (datos.participantes.length !== cantidadEsperada) {
    showSubmissionMessage("Revisá los participantes", "La inscripción individual requiere una persona y la inscripción en pareja requiere dos. No se ha enviado la información.", true);
    return;
  }
  if (!ENABLE_REAL_SUBMISSION) {
    showSubmissionMessage("Formulario completo · demostración", `${datos.participantes.length} participante(s) validado(s). La información está preparada para enviarse. El envío real está desactivado: no se ha enviado ni guardado ninguna inscripción ni confirmado el pago.`);
    return;
  }
  const token = document.querySelector('[name="cf-turnstile-response"]')?.value;
  if (!token) {
    showSubmissionMessage("Verificación de seguridad pendiente", "Completá Turnstile para obtener un token vigente antes de enviar.", true);
    resetSubmissionTurnstile();
    return;
  }

  const button = document.getElementById("submitRegistration");
  submissionInProgress = true;
  button.disabled = true;
  button.textContent = "Enviando inscripción...";
  form.inert = true;
  form.setAttribute("aria-busy", "true");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let requestStarted = false;
  try {
    const requestId = requestIdFor(datos);
    requestStarted = true;
    const response = await fetch(REGISTRATION_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, turnstileToken: token, inscripcion: datos }),
      signal: controller.signal,
      credentials: "omit",
      redirect: "error"
    });
    if (response.status === 429) {
      showSubmissionMessage("Esperá antes de volver a intentar", "Se alcanzó el límite de solicitudes. Esperá unos minutos y completá nuevamente la verificación de seguridad. No se confirmó esta inscripción.", true);
      return;
    }
    const data = await response.json();
    if (response.ok && data && data.success === true) {
      submissionConfirmed = true;
      const id = typeof data.idInscripcion === "string" || typeof data.idInscripcion === "number"
        ? ` Número de inscripción: ${data.idInscripcion}.` : " El servidor no proporcionó un número de inscripción.";
      showSubmissionMessage("Inscripción recibida correctamente", `${id} El pago está pendiente de verificación. Este formulario ya fue enviado; no lo vuelvas a enviar.`);
      pendingRequest = null;
    } else if (response.status >= 500 || !data || typeof data.success !== "boolean") {
      showSubmissionMessage("No pudimos confirmar la recepción", "El registro podría haberse recibido. Reintentá sin modificar los datos para conservar el mismo identificador de solicitud.", true);
    } else {
      showSubmissionMessage("No se confirmó la inscripción", "El servidor rechazó la solicitud. Revisá los datos y la verificación de seguridad antes de reintentar. Si el problema continúa, contactá a la organización.", true);
    }
  } catch {
    showSubmissionMessage(requestStarted ? "Resultado del envío incierto" : "No se pudo preparar el envío",
      requestStarted
        ? "No pudimos confirmar la respuesta. El registro podría haberse recibido. Reintentá sin modificar los datos para utilizar el mismo identificador; no recargués la página."
        : "No se envió la inscripción. Usá un navegador actualizado y abrí la página mediante HTTPS antes de reintentar.", true);
  } finally {
    clearTimeout(timeout);
    submissionInProgress = false;
    form.inert = false;
    if (submissionConfirmed) {
      for (const control of form.elements) control.disabled = true;
    }
    form.setAttribute("aria-busy", "false");
    button.disabled = submissionConfirmed;
    button.textContent = submissionConfirmed ? "Inscripción recibida" : "Enviar inscripción";
    resetSubmissionTurnstile();
    document.getElementById("formResult").focus();
  }
});
if (ENABLE_REAL_SUBMISSION) {
  document.getElementById("submissionNotice").textContent = "Envío habilitado. La inscripción se enviará a la organización mediante Cloudflare Workers. El pago queda pendiente de verificación.";
  document.getElementById("paymentNotice").textContent = "La recepción de la inscripción no equivale a la aprobación del pago.";
  document.getElementById("submissionPrivacy").textContent = "Al enviar, los datos de inscripción se transmiten a la organización mediante Cloudflare Workers. El identificador de reintento se conserva solo en memoria y se pierde al recargar; no se utiliza almacenamiento local. La verificación de seguridad utiliza Cloudflare Turnstile. Antes de abrir inscripciones reales se publicarán las condiciones de privacidad y la autorización para menores.";
  document.getElementById("submissionConsent").textContent = "Entiendo que se enviarán estos datos a la organización y que el pago quedará pendiente de verificación. *";
  document.getElementById("turnstileContainer").hidden = false;
  document.getElementById("submitRegistration").textContent = "Enviar inscripción";
}
updateForm();
