# Cuentas Claras - by FerDev 🥩🍻

Una SPA (Single Page Application) diseñada con enfoque **mobile-first** para resolver de forma rápida y sin errores matemáticos la división de gastos en juntadas, asados o viajes. 

Desplegala en segundos usando **GitHub Pages** para llevarla siempre en el celular.

## 🚀 Características Principales

* **Algoritmo Optimizado de Liquidación:** Minimiza la cantidad de transacciones necesarias. Divide el gasto total de manera exacta, contemplando de forma automática a los invitados que asistieron pero no realizaron gastos directos ("El que falta").
* **Gestión de Alias Interactiva 🔑:** Permite registrar opcionalmente el Alias/CBU de quien aportó capital. Los deudores pueden visualizar el alias en la tabla de resultados y copiarlo con un solo toque.
* **Persistencia Local (LocalStorage) 💾:** Los datos ingresados, la cantidad de personas y el historial de nombres no se pierden si la pestaña se cierra o el navegador del móvil se recarga por accidente.
* **Historial de Nombres Inteligente ⚡:** La aplicación aprende de los últimos 5 nombres únicos ingresados para ofrecer botones de acceso rápido, acelerando la carga de datos repetitivos.
* **Validaciones de Entrada Estrictas 🛑:** Filtros por hardware/teclado que impiden el ingreso de caracteres inválidos (`-`, `+`, `e`) y bloquean el cálculo si faltan datos esenciales.
* **Integración con WhatsApp 💬:** Genera un bloque de texto formateado con Markdown listo para copiar y pegar directo en los grupos de mensajería.

## 🛠️ Tecnologías utilizadas

* **HTML5** & **JavaScript Vanilla (ES6+)** (Sin frameworks complejos ni dependencias pesadas).
* **Tailwind CSS v4** (A través de CDN para una carga ultra rápida y diseño responsivo adaptado a modo oscuro nativo).

## 📦 Despliegue en GitHub Pages

Al estar construida exclusivamente con archivos estáticos (`index.html`), se puede subir directo a tu plataforma favorita:

1. Creá un repositorio público en GitHub.
2. Subí el archivo `index.html`.
3. Andá a **Settings** > **Pages**.
4. En la sección *Build and deployment*, elegí la rama `main` (o `master`) y la carpeta `/root`.
5. ¡Listo! GitHub te dará una URL pública tipo `https://tu-usuario.github.io/tu-repositorio/`.

---
Desarrollado con ❤️ por **FerDev**.