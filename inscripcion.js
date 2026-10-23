"use strict";

// Configuración pública de la demostración; no contiene credenciales.
const registrationConfig = {
  prices: { competitive: 28000, recreational: 18000, jersey: 7000 },
  categories: [
    ["juvenile", "Juvenil · 15 a 18 años"],
    ["open", "Open · 18 a 29 años"],
    ["masterA", "Master A · 30 a 39 años"],
    ["masterB", "Master B · 40 a 49 años"],
    ["masterC", "Master C · 50 a 59 años"],
    ["masterD", "Master D · 60 a 79 años"],
    ["ebike", "E-Bike · sin límite de edad"]
  ],
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
      <div class="field-full"><p class="field-help age-note" id="${id}-age">La fecha y el criterio oficial para calcular edades están pendientes. No se bloquearán categorías por edad en esta prueba.</p></div>
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
    field(index, "identification").setCustomValidity("");
    field(index, "sex").setCustomValidity("");
    const birth = field(index, "birth").value;
    let minor = false;
    if (birth) {
      const [year, month, day] = birth.split("-").map(Number);
      let age = today.getFullYear() - year;
      if (today.getMonth()+1 < month || (today.getMonth()+1 === month && today.getDate() < day)) age--;
      minor = age < 18;
    }
    field(index, "age").textContent = minor
      ? "Participante menor de edad: la inscripción real requerirá la autorización de su representante. El procedimiento está pendiente de definir."
      : "El criterio oficial para calcular edades está pendiente. No se bloquearán categorías por edad en esta prueba.";
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
  document.getElementById("paymentHelp").textContent = method === "sinpe" ? "Usá un número ficticio para esta demostración." : "No ingresés claves bancarias ni números de cuenta.";
}

form.addEventListener("input", () => {
  document.getElementById("formResult").hidden = true;
  updateForm();
});
form.addEventListener("change", event => {
  if (event.target.id === "paymentMethod") updatePayment();
  updateForm();
});
form.addEventListener("submit", event => {
  event.preventDefault();
  updateForm();
  if (!form.reportValidity()) return;
  const result = document.getElementById("formResult");
  result.replaceChildren();
  const title = document.createElement("strong"); title.textContent = "Revisión de prueba completada";
  const detail = document.createElement("p"); detail.textContent = `${activeParticipants().length} participante(s). Total estimado: ${document.getElementById("totalAmount").textContent}.`;
  const note = document.createElement("p"); note.textContent = "No se ha enviado ninguna inscripción ni generado un número de registro. Cuando se conecte el servidor, la recepción quedará pendiente de verificación del pago.";
  result.append(title,detail,note); result.hidden = false; result.focus();
});
updateForm();
