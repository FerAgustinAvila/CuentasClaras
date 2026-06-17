const STORAGE_KEYS = {
  APORTANTES: "cc_aportantes_v5",
  HISTORIAL: "cc_historial_nombres_v5",
  TOTAL_PERSONAS: "cc_total_personas_v5",
};

let aportantes =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.APORTANTES)) || [];
let historialNombres =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL)) || [];
let textoCompartir = "";

const inputNombre = document.getElementById("nombre");
const inputMonto = document.getElementById("monto");
const inputAlias = document.getElementById("alias");
const inputTotalPersonas = document.getElementById("total-personas");
const form = document.getElementById("persona-form");
const listaPersonas = document.getElementById("lista-personas");
const sinPersonas = document.getElementById("sin-personas");
const btnCalcular = document.getElementById("btn-calcular");
const resultadosSection = document.getElementById("resultados-section");
const txtGastoTotal = document.getElementById("gasto-total");
const txtCuotaIndividual = document.getElementById("cuota-individual");
const contenedorTransferencias = document.getElementById(
  "contenedor-transferencias",
);
const btnCompartir = document.getElementById("btn-compartir");
const btnReset = document.getElementById("btn-reset");
const contenedorChips = document.getElementById("contenedor-chips");
const listaChips = document.getElementById("lista-chips");
const btnLimpiarHistorial = document.getElementById("btn-limpiar-historial");

if (localStorage.getItem(STORAGE_KEYS.TOTAL_PERSONAS)) {
  inputTotalPersonas.value = localStorage.getItem(STORAGE_KEYS.TOTAL_PERSONAS);
}

actualizarLista();
actualizarChips();
chequearEstadoBotonCalcular();

inputMonto.addEventListener("keydown", (e) => {
  if (["-", "+", "e", "E", ",", "."].includes(e.key)) e.preventDefault();
});
inputMonto.addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, "");
  if (valor.startsWith("0")) valor = valor.replace(/^0+/, "");
  e.target.value = valor;
});

inputTotalPersonas.addEventListener("keydown", (e) => {
  if (["-", "+", "e", "E", ",", "."].includes(e.key)) e.preventDefault();
});
inputTotalPersonas.addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, "");
  if (valor.startsWith("0")) valor = valor.replace(/^0+/, "");
  e.target.value = valor;
  localStorage.setItem(STORAGE_KEYS.TOTAL_PERSONAS, e.target.value);
  resultadosSection.classList.add("hidden");
  validarCantidadPersonas();
  chequearEstadoBotonCalcular();
});

inputNombre.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, "");
});

function validarCantidadPersonas() {
  const total = parseInt(inputTotalPersonas.value) || 0;
  if (total > 0 && total < aportantes.length) {
    inputTotalPersonas.classList.add("border-red-500", "bg-red-950/20");
  } else {
    inputTotalPersonas.classList.remove("border-red-500", "bg-red-950/20");
  }
}

function chequearEstadoBotonCalcular() {
  const totalGente = parseInt(inputTotalPersonas.value) || 0;
  const tieneAportantes = aportantes.length > 0;

  if (totalGente > 0 && tieneAportantes && totalGente >= aportantes.length) {
    btnCalcular.disabled = false;
    btnCalcular.className =
      "w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-md tracking-wide uppercase cursor-pointer";
  } else {
    btnCalcular.disabled = true;
    btnCalcular.className =
      "w-full bg-slate-700 text-slate-500 font-bold py-3.5 rounded-xl transition-all shadow-lg text-md tracking-wide uppercase cursor-not-allowed";
  }
}

function agregarAlHistorial(nombre) {
  historialNombres = historialNombres.filter(
    (n) => n.toLowerCase() !== nombre.toLowerCase(),
  );
  historialNombres.unshift(nombre);
  if (historialNombres.length > 5) historialNombres.pop();
  localStorage.setItem(
    STORAGE_KEYS.HISTORIAL,
    JSON.stringify(historialNombres),
  );
  actualizarChips();
}

function actualizarChips() {
  listaChips.innerHTML = "";
  if (historialNombres.length === 0) {
    contenedorChips.classList.add("hidden");
    return;
  }
  contenedorChips.classList.remove("hidden");

  historialNombres.forEach((nombre) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "bg-slate-700 hover:bg-slate-640 active:scale-95 px-2.5 py-1 rounded-md shrink-0 transition-all font-medium text-slate-200 cursor-pointer";
    btn.innerText = nombre;
    btn.onclick = () => {
      inputNombre.value = nombre;
      inputMonto.focus();
    };
    listaChips.appendChild(btn);
  });
}

btnLimpiarHistorial.addEventListener("click", () => {
  historialNombres = [];
  localStorage.removeItem(STORAGE_KEYS.HISTORIAL);
  actualizarChips();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();
  const monto = parseFloat(inputMonto.value) || 0;
  const alias = inputAlias.value.trim();

  if (monto <= 0) return;

  aportantes.push({ nombre, monto, alias });
  agregarAlHistorial(nombre);
  guardarEstado();
  actualizarLista();
  validarCantidadPersonas();
  chequearEstadoBotonCalcular();
  form.reset();
  inputNombre.focus();
});

function guardarEstado() {
  localStorage.setItem(STORAGE_KEYS.APORTANTES, JSON.stringify(aportantes));
}

function actualizarLista() {
  listaPersonas.innerHTML = "";
  if (aportantes.length === 0) {
    sinPersonas.classList.remove("hidden");
    listaPersonas.appendChild(sinPersonas);
    return;
  }
  sinPersonas.classList.add("hidden");

  aportantes.forEach((p, index) => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center py-2.5 text-slate-300 text-sm";
    const aliasBadge = p.alias
      ? `<span class="block text-[10px] text-slate-500 truncate max-w-[150px]">🔑 ${p.alias}</span>`
      : "";

    li.innerHTML = `
            <div class="truncate pr-2">
                <span class="font-medium text-slate-200 block truncate">${p.nombre}</span>
                ${aliasBadge}
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <span class="bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 rounded-full text-xs font-bold">$${p.monto.toLocaleString("es-AR")}</span>
                <button onclick="eliminarAportante(${index})" class="text-slate-500 hover:text-red-400 font-bold px-1 cursor-pointer">✕</button>
            </div>
        `;
    listaPersonas.appendChild(li);
  });
}

window.eliminarAportante = function (index) {
  aportantes.splice(index, 1);
  guardarEstado();
  actualizarLista();
  validarCantidadPersonas();
  chequearEstadoBotonCalcular();
  resultadosSection.classList.add("hidden");
};

btnReset.addEventListener("click", () => {
  if (confirm("¿Querés borrar los datos de esta juntada?")) {
    aportantes = [];
    inputTotalPersonas.value = "";
    localStorage.removeItem(STORAGE_KEYS.APORTANTES);
    localStorage.removeItem(STORAGE_KEYS.TOTAL_PERSONAS);
    actualizarLista();
    validarCantidadPersonas();
    chequearEstadoBotonCalcular();
    resultadosSection.classList.add("hidden");
    form.reset();
  }
});

window.copiarAliasRapido = function (btn, textoAlias) {
  navigator.clipboard.writeText(textoAlias).then(() => {
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<span class="text-[10px] text-emerald-400 font-bold animate-pulse">✓ Copiado</span>`;
    setTimeout(() => {
      btn.innerHTML = originalHtml;
    }, 1500);
  });
};

btnCalcular.addEventListener("click", () => {
  const totalGente = parseInt(inputTotalPersonas.value) || 0;
  const gastoTotal = aportantes.reduce((sum, p) => sum + p.monto, 0);
  const cuotaIndividual = gastoTotal / totalGente;

  txtGastoTotal.innerText = `$${gastoTotal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
  txtCuotaIndividual.innerText = `$${cuotaIndividual.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

  const todos = [...aportantes];
  const losDemas = totalGente - aportantes.length;

  if (losDemas === 1) {
    todos.push({ nombre: "El que falta", monto: 0, alias: "" });
  } else if (losDemas > 1) {
    for (let i = 1; i <= losDemas; i++) {
      todos.push({ nombre: `Invitado #${i}`, monto: 0, alias: "" });
    }
  }

  let deudores = [];
  let acreedores = [];

  todos.forEach((p) => {
    const saldo = p.monto - cuotaIndividual;
    if (saldo < -0.99)
      deudores.push({ nombre: p.nombre, saldo: Math.abs(saldo) });
    if (saldo > 0.99)
      acreedores.push({ nombre: p.nombre, saldo: saldo, alias: p.alias });
  });

  contenedorTransferencias.innerHTML = "";
  let i = 0,
    j = 0;
  let lineasMensaje = [];

  while (i < deudores.length && j < acreedores.length) {
    let d = deudores[i];
    let a = acreedores[j];

    if (d.saldo < 1) {
      i++;
      continue;
    }
    if (a.saldo < 1) {
      j++;
      continue;
    }

    let transferir = Math.min(d.saldo, a.saldo);

    const div = document.createElement("div");
    // Se removieron bordes duplicados ya que el contenedor usa 'divide-y'
    div.className = "grid grid-cols-12 items-center text-xs gap-1 py-2.5 px-3";

    const aliasColumnHtml = a.alias
      ? `<button onclick="copiarAliasRapido(this, '${a.alias}')" class="col-span-4 text-left pl-2 border-l border-slate-800 cursor-pointer focus:outline-none w-full group" aria-label="Copiar alias">
                <span class="block text-[8px] text-slate-500 font-bold uppercase tracking-wide group-hover:text-indigo-400 transition-colors">Alias (Toca)</span>
                <span class="block text-[11px] text-indigo-400 font-semibold truncate max-w-full">${a.alias}</span>
               </button>`
      : `<div class="col-span-4"></div>`;

    div.innerHTML = `
            <span class="col-span-3 text-red-400 font-bold text-left truncate" title="${d.nombre}">${d.nombre}</span>
            <div class="col-span-2 flex flex-col items-center justify-center border-l border-slate-800 px-0.5">
                <span class="text-[8px] uppercase font-bold text-slate-500">Paga</span>
                <span class="text-xs font-black text-white">$${Math.round(transferir).toLocaleString("es-AR")}</span>
            </div>
            <span class="col-span-3 text-emerald-400 font-bold text-left truncate border-l border-slate-800 pl-1.5" title="${a.nombre}">a ${a.nombre}</span>
            ${aliasColumnHtml}
        `;
    contenedorTransferencias.appendChild(div);

    const stringAliasWhats = a.alias ? ` *(Alias: ${a.alias})*` : "";
    lineasMensaje.push(
      `• *${d.nombre}* ➡️ *$${Math.round(transferir).toLocaleString("es-AR")}* a *${a.nombre}*${stringAliasWhats}`,
    );

    d.saldo -= transferir;
    a.saldo -= transferir;

    if (d.saldo < 1) i++;
    if (a.saldo < 1) j++;
  }

  if (contenedorTransferencias.innerHTML === "") {
    contenedorTransferencias.innerHTML = `<div class="text-center py-4 text-slate-400 text-sm font-medium">Estamos todos a mano 🤝</div>`;
    textoCompartir =
      "💰 *Cuentas Claras* \n¡Estamos todos a mano! No se debe nada.";
  } else {
    textoCompartir =
      `💰 *RESUMEN DE LA JUNTADA* 🥩🍻\n\n` +
      `• *Gasto Total:* $${Math.round(gastoTotal).toLocaleString("es-AR")}\n` +
      `• *Por cabeza:* $${Math.round(cuotaIndividual).toLocaleString("es-AR")}\n\n` +
      `*TRANSFERENCIAS:* \n` +
      lineasMensaje.join("\n") +
      `\n\n_Calculado con Cuentas Claras_`;
  }

  resultadosSection.classList.remove("hidden");
  resultadosSection.scrollIntoView({ behavior: "smooth" });
});

btnCompartir.addEventListener("click", () => {
  navigator.clipboard
    .writeText(textoCompartir)
    .then(() => {
      const originalText = btnCompartir.innerHTML;
      btnCompartir.innerHTML = "✅ ¡Resumen copiado!";
      btnCompartir.classList.replace("text-emerald-400", "text-white");
      btnCompartir.classList.add("bg-emerald-700");

      setTimeout(() => {
        btnCompartir.innerHTML = originalText;
        btnCompartir.classList.replace("text-white", "text-emerald-400");
        btnCompartir.classList.remove("bg-emerald-700");
      }, 2000);
    })
    .catch((err) => alert("Error al copiar."));
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("Service Worker registrado con éxito", reg))
      .catch((err) =>
        console.error("Error al registrar el Service Worker", err),
      );
  });
}