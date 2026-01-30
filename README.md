# ia-offline 🌐

Este repositorio aloja un proyecto de **Inteligencia Artificial sin conexión a Internet**, aprovechando principalmente las capacidades de **wllama**. El objetivo es proporcionar una experiencia de IA que funcione completamente sin necesidad de una conexión a Internet.

## 🏆 Insignias

[![Estrellas de GitHub](https://img.shields.io/github/stars/AngelSPerez/ia-offline?style=flat-square&logo=github)](https://github.com/AngelSPerez/ia-offline/stargazers)
[![Bifurcaciones de GitHub](https://img.shields.io/github/forks/AngelSPerez/ia-offline?style=flat-square&logo=github)](https://github.com/AngelSPerez/ia-offline/forks)
[![Licencia](https://img.shields.io/github/license/AngelSPerez/ia-offline?style=flat-square)](LICENSE)

## ✨ Características Principales

*   **Inteligencia Artificial Offline:** Ejecuta modelos de IA localmente, sin depender de una conexión a Internet.
*   **Basado en wllama:** Utiliza la potencia de wllama para el procesamiento de modelos de lenguaje.
*   **Experiencia de Usuario Fluida:** Diseñado para una interacción intuitiva y sin interrupciones.
*   **Instalación Sencilla:** Procedimientos claros para poner en marcha el proyecto rápidamente.
*   **Personalizable:** Posibilidad de adaptar la interfaz y el comportamiento a necesidades específicas.

## 🚀 Instalación

Para instalar y ejecutar `ia-offline` localmente, siga estos pasos:

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/AngelSPerez/ia-offline.git
    cd ia-offline
    ```

2.  **Configuración Inicial (Opcional):**
    Si planea realizar modificaciones o compilaciones, puede ser necesario ejecutar el script de construcción:
    ```bash
    chmod +x build.sh
    ./build.sh
    ```

3.  **Ejecutar el Proyecto:**
    Abra el archivo `index.html` en su navegador web. Dado que el proyecto está diseñado para funcionar sin conexión, no se requiere un servidor web para la funcionalidad básica.

    Para una experiencia más robusta o si encuentra problemas de carga de recursos, puede servir los archivos usando un servidor web simple (por ejemplo, `python -m http.server` o `npx serve`):
    ```bash
    # Usando Python 3
    python3 -m http.server 8000
    # O si prefiere Node.js
    # npm install -g serve
    # serve
    ```
    Luego, acceda a `http://localhost:8000` en su navegador.

## 💡 Uso

Una vez que el proyecto esté cargado en su navegador, podrá interactuar con el modelo de IA. La interfaz principal se encuentra en `index.html`.

### Ejemplo de Interacción

(Nota: La interacción específica dependerá de la implementación del modelo wllama y la interfaz de usuario desarrollada. A continuación, se presenta un ejemplo genérico.)

1.  Ingrese su consulta o prompt en el campo de texto proporcionado.
2.  Presione "Enviar" o la tecla Enter.
3.  La IA procesará su solicitud y generará una respuesta directamente en la interfaz.

```html
<!-- Ejemplo simplificado de la interfaz de usuario -->
<div class="chat-container">
    <div id="chat-output">
        <!-- Aquí se mostrarán los mensajes y respuestas -->
    </div>
    <div class="input-area">
        <input type="text" id="user-input" placeholder="Escribe tu pregunta aquí...">
        <button id="send-button">Enviar</button>
    </div>
</div>
```

```javascript
// Ejemplo simplificado de la lógica de interacción
document.getElementById('send-button').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    // Añadir mensaje del usuario al chat
    appendMessage('user', userInput);

    // Lógica para enviar la entrada al modelo wllama (implementación a definir)
    // const aiResponse = await processWithWllama(userInput);

    // Simulación de respuesta de la IA
    const aiResponse = `Respuesta simulada a: "${userInput}"`;
    appendMessage('ai', aiResponse);

    document.getElementById('user-input').value = '';
});

function appendMessage(sender, message) {
    const chatOutput = document.getElementById('chat-output');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to bottom
}
```

## 📚 Documentación de la API

Este proyecto se enfoca en la ejecución local de modelos de IA. La interacción principal se realiza a través de la interfaz de usuario y las funcionalidades expuestas por **wllama** en el lado del cliente (JavaScript y WebAssembly).

### Funciones Clave (Lado del Cliente)

*   `loadModel(modelPath)`: Carga un modelo wllama desde una ruta especificada.
*   `generateText(prompt, options)`: Genera texto basado en un prompt y opciones de configuración (temperatura, longitud, etc.).
*   `preprocessInput(text)`: Prepara el texto de entrada para el modelo.
*   `postprocessOutput(text)`: Formatea la salida generada por el modelo.

(Nota: La documentación detallada de la API de wllama se encuentra en la documentación oficial de wllama, ya que este proyecto es un consumidor de dicha biblioteca.)

## 📄 Licencia

Este proyecto no especifica una licencia. Por favor, consulte el repositorio para obtener información detallada sobre los derechos de uso y distribución.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, consulte el archivo `CONTRIBUTING.md` (si existe) para conocer las directrices.

## ⚠️ Advertencia

Este proyecto utiliza WebAssembly (`.wasm`) para ejecutar modelos de IA en el navegador. El rendimiento y la compatibilidad pueden variar según el navegador y el dispositivo. La eficiencia de la IA sin conexión depende en gran medida del tamaño y la complejidad del modelo cargado.

---

<p align="center">
  <a href="https://readmeforge.app?utm_source=badge">
    <img src="https://readmeforge.app/badge.svg" alt="Made with ReadmeForge" height="20">
  </a>
</p>