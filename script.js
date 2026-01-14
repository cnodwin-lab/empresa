const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ============================
// Referencias del DOM
// ============================
const form = document.getElementById("formEntrada");
const autorSelect = document.getElementById("autor");
const contenidoInput = document.getElementById("contenido");
const fechaInput = document.getElementById("fecha"); // opcional
const mensajesDiv = document.getElementById("entradas");

// ============================
// Autor actual (persistido en localStorage)
// ============================
let autorActual = localStorage.getItem("autorActual") || autorSelect.value;
autorSelect.value = autorActual;

autorSelect.addEventListener("change", () => {
  autorActual = autorSelect.value;
  localStorage.setItem("autorActual", autorActual);
});

// ============================
// Funciones auxiliares
// ============================
function formatearHora(ts) {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const y = d.getFullYear();
  const mo = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${m}`;
}

function crearBurbuja(entrada) {
  const esMia = entrada.autor === autorActual;

  const item = document.createElement("div");
  item.classList.add("mensaje", esMia ? "mia" : "suya");

const contenidoEscapado = entrada.contenido
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  item.innerHTML = `
    <div class="burbuja">
      <div class="texto">${contenidoEscapado}</div>
      <div class="meta">
        <span class="autor">${entrada.autor}</span>
        <span class="hora">${formatearHora(entrada.timestamp || Date.now())}</span>
      </div>
    </div>
  `;

 return item;
}

function scrollAlFinal() {
  mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
}

// ============================
// Lectura en tiempo real
// ============================
db.ref("entradas")
  .orderByChild("timestamp")
  .on("child_added", (snapshot) => {
    const entrada = snapshot.val();
    const nodo = crearBurbuja(entrada);
    mensajesDiv.appendChild(nodo);
    scrollAlFinal();
  });

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const contenido = (contenidoInput.value || "").trim();
  if (!contenido) return;

  const fechaValor = fechaInput && fechaInput.value ? fechaInput.value : null;

  const nuevaEntrada = {
    autor: autorActual,
    contenido,
    fecha: fechaValor,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };

  db.ref("entradas").push(nuevaEntrada)
    .then(() => {
      contenidoInput.value = "";
      contenidoInput.focus();
    })
    .catch((err) => {
      console.error("Error al enviar:", err);
    });
});


