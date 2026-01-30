# ia-offline 🌐

This repository hosts an **offline Artificial Intelligence project**, primarily leveraging the capabilities of **wllama**. The goal is to provide an AI experience that functions entirely without an internet connection.

## 🏆 Badges

[![GitHub Stars](https://img.shields.io/github/stars/AngelSPerez/ia-offline?style=flat-square&logo=github)](https://github.com/AngelSPerez/ia-offline/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/AngelSPerez/ia-offline?style=flat-square&logo=github)](https://github.com/AngelSPerez/ia-offline/fork)
[![GitHub Issues](https://img.shields.io/github/issues/AngelSPerez/ia-offline?style=flat-square&logo=github)](https://github.com/AngelSPerez/ia-offline/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## ✨ Features

*   **Fully Offline AI:** Experience AI interactions without requiring an active internet connection.
*   **wllama Integration:** Built upon the robust wllama library, enabling local execution of AI models.
*   **Progressive Web App (PWA) Capabilities:** Designed for seamless offline use and potential installation on devices.
*   **Customizable Styling:** Includes options for custom CSS to tailor the visual appearance.
*   **Service Worker for Offline Functionality:** Utilizes `sw.js` to manage offline caching and access.

## 🚀 Installation

To set up `ia-offline` on your local machine, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/AngelSPerez/ia-offline.git
    cd ia-offline
    ```

2.  **Build the Project (if applicable):**
    The repository includes a `build.sh` script, which may be necessary for compiling or preparing assets.
    ```bash
    chmod +x build.sh
    ./build.sh
    ```
    *Note: The exact output and necessity of this script depend on its implementation within the repository.*

3.  **Serve Locally:**
    To run the application, you will need a local web server. If you have Python 3 installed, you can use the following command in the root directory of the project:
    ```bash
    python -m http.server
    ```
    If you prefer Node.js, you can install `http-server` globally:
    ```bash
    npm install -g http-server
    http-server
    ```

4.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:8000` (or the port specified by your local server).

## 💡 Usage

Once the application is running locally, you can interact with the offline AI.

### Basic Interaction

Navigate to the main page (`index.html`) in your browser. You should be presented with an interface to interact with the AI. Input your queries or prompts in the designated area and observe the AI's responses.

### Understanding the Structure

*   `index.html`: The main entry point for the application.
*   `offline.html`: A page displayed when the application cannot be accessed offline.
*   `install.html`: Potentially used for guiding users through PWA installation.
*   `sw.js`: The service worker script responsible for offline caching and functionality.
*   `assets/`: Contains compiled JavaScript and CSS files, as well as WebAssembly modules (`.wasm`).
*   `icons/`: Application icons for various resolutions.
*   `custom-whyai.css`, `high.css`: Custom stylesheet files.

## 🤝 Contributing

We welcome contributions to `ia-offline`. If you would like to contribute, please follow these guidelines:

1.  **Fork the Repository:** Create a fork of this repository on GitHub.
2.  **Create a New Branch:** Make your changes in a new branch.
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Commit Your Changes:** Write clear and concise commit messages.
    ```bash
    git commit -m "Add some amazing feature"
    ```
4.  **Push to the Branch:**
    ```bash
    git push origin feature/your-feature-name
    ```
5.  **Open a Pull Request:** Submit a pull request to the main repository.

Please ensure your contributions adhere to the project's coding standards and best practices.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

<p align="center">
  <a href="https://readmeforge.app?utm_source=badge">
    <img src="https://readmeforge.app/badge.svg" alt="Made with ReadmeForge" height="20">
  </a>
</p>