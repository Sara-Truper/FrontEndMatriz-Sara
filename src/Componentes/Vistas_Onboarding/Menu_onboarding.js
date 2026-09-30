import * as React from 'react';
import Button from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import image from './Logo_Truper.jpg';
import { Stack } from 'react-bootstrap';

// Estilos locales encapsulados bajo el contenedor raíz '.adm-scope'
const LocalStyles = () => (
  <style>{`
    /* Encapsulamiento dentro de .adm-scope */
    .adm-scope {
      box-sizing: border-box;
    }
    .adm-scope *,
    .adm-scope *::before,
    .adm-scope *::after {
      box-sizing: border-box;
    }

    /* Contenedor principal */
    .adm-scope .adm-main-container {
      display: flex;
      padding: 20px;
      gap: 10px;
    }

    /* Panel izquierdo */
    .adm-scope .adm-left-panel {
      width: 200px;
    }

    /* Títulos de secciones */
    .adm-scope .adm-section-title {
      font-weight: bold;
      color: #ff6600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    /* Carpetas */
    .adm-scope .adm-folder {
      background-color: #fff;
      border: 1px solid #ccc;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 6px;
      cursor: pointer;
    }

    /* Listas de materiales */
    .adm-scope .adm-material-list {
      margin-left: 10px;
      font-size: 11px;
    }

    /* Panel derecho */
    .adm-scope .adm-right-panel {
      flex-grow: 1;
    }

    /* Sección de búsqueda */
    .adm-scope .adm-search-section {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 10px;
      align-items: flex-end;
    }

    .adm-scope .adm-search-section div {
      display: flex;
      flex-direction: column;
    }

    .adm-scope .adm-search-section label {
      font-size: 11px;
    }

    .adm-scope .adm-search-section input,
    .adm-scope .adm-search-section select,
    .adm-scope .adm-search-section textarea {
      width: 100%;
      padding: 4px;
      font-size: 11px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    /* Resultados */
    .adm-scope .adm-results-section {
      background: #fff;
      padding: 10px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .adm-scope .adm-result-item {
      border-bottom: 1px solid #ddd;
      padding: 6px 0;
    }

    .adm-scope .adm-result-item:last-child {
      border-bottom: none;
    }

    /* Etiquetas */
    .adm-scope .adm-tag {
      background-color: #ff6600;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      margin-right: 6px;
    }

    /* Botones */
    .adm-scope .adm-btn,
    .adm-scope .adm-upload-button {
      background-color: #ff6600;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    }

    /* Modales */
    .adm-scope .adm-modal {
      display: flex;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0, 0, 0, 0.4);
      justify-content: center;
      align-items: center;
    }

    .adm-scope .adm-modal-content {
      background-color: #fff;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
      max-height: 80%;
      overflow-y: auto;
      border-radius: 8px;
    }

    .adm-scope .adm-close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }

    .adm-scope .adm-close:hover,
    .adm-scope .adm-close:focus {
      color: black;
      text-decoration: none;
    }

    /* Visor de documentos */
    .adm-scope .adm-viewer-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.75);
      display: none;
      justify-content: center;
      align-items: center;
    }

    .adm-scope .adm-viewer-content {
      background-color: white;
      width: 80%;
      height: 80%;
      position: relative;
      border-radius: 8px;
    }

    .adm-scope .adm-viewer-content iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 8px;
    }

    .adm-scope .adm-close-viewer {
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: #ff6600;
      color: white;
      border: none;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      border-radius: 4px;
    }

    .adm-scope .mower {
      display: inline-block;
      font-size: 2rem;
      animation: podar 10s linear infinite reverse;
    }

    @keyframes podar {
      0% { transform: translateX(0) scaleX(1); }
      49% { transform: translateX(400px) scaleX(1); }
      50% { transform: translateX(300px) scaleX(-1); }
      99% { transform: translateX(0) scaleX(-1); }
      100% { transform: translateX(0) scaleX(1); }
    }

    /* Front onboarding */
    .adm-scope .bannerOnboarding {
      position: relative;
      width: 100%;
      min-height: clamp(300px, 32.5vmin, 650px);
      overflow: hidden;
      background-image:
        linear-gradient(
          rgba(0, 0, 0, 0.42),
          rgba(0, 0, 0, 0.12),
          rgba(0, 0, 0, 0.42)
        ),
        var(--imagen-banner);
      background-position: center center;
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
      display: flex;
      align-items: center;
      justify-content: center;
      isolation: isolate;
    }

    .adm-scope .contenidoBanner {
      position: relative;
      z-index: 1;
      width: min(1200px, 100%);
      min-height: inherit;
      margin: 0 auto;
      padding: clamp(30px, 6vw, 80px);
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(200px, 320px);
      grid-template-areas:
        "saludo buscador"
        "iconos iconos";
      align-items: center;
      gap: 30px;
    }

    .adm-scope .saludo {
      grid-area: saludo;
      margin: 0;
      color: #ff6400;
      font-family: 'Arial nova', sans-serif;
      font-size: clamp(38px, 6vw, 70px);
      font-weight: 700;
      line-height: 1.1;
      text-align: left;
      text-shadow:
        0 2px 3px rgba(0, 0, 0, 0.45),
        0 0 12px rgba(255, 255, 255, 0.25);
    }

    .adm-scope .buscador {
      grid-area: buscador;
      width: 100%;
      min-width: 0;
      height: 46px;
      align-self: end;
      transform: translateY(120px);
      border: 2px solid rgba(255, 100, 0, 0.7);
      border-radius: 12px;
      box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25);
    }

    /* Footer Onboarding */
    .adm-scope .footerOnboarding {
      width: 100%;
      min-width: 0;
      padding: 40px 6% 20px;
      color: white;
      background-color: #2e4d5b;
    }

    .adm-scope .footerContent {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 60px;
    }

    .adm-scope .footerColumn {
      min-width: 0;
    }

    .adm-scope .footerColumn .adm-section-title {
      margin-bottom: 15px;
      font-size: 14px;
    }

    .adm-scope .footerList {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .adm-scope .footerList li {
      margin-bottom: 10px;
    }

    .adm-scope .footerList a {
      color: white;
      font-size: 13px;
      text-decoration: none;
    }

    .adm-scope .footerList a:hover {
      color: #ff6600;
    }

    .adm-scope .footerBottom {
      width: 100%;
      max-width: 1200px;
      margin: 35px auto 0;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.25);
      font-size: 12px;
    }

    .adm-scope .footerBottom p {
      margin: 0;
    }

    .adm-scope .footerBottom a {
      color: white;
      text-decoration: none;
    }

    .adm-scope .footerBottom a:hover {
      color: #ff6600;
    }
  `}</style>
);

function Menu_onboarding() {
  const momentodia = () => {
    const hora = new Date();
    const horadia = hora.getHours();
    if (horadia < 12) {
      return '¡Buenos Dias!';
    } else if (horadia >= 12 && horadia < 18) {
      return '¡Buenas Tardes!';
    } else {
      return '¡Buenas Noches!';
    }
  };

  return (
    // Solo debes asegurar envolver el retorno en este div con la clase '.adm-scope'
    <div className="adm-scope">
      <LocalStyles />
      <header
        className="bannerOnboarding"
        style={{
          '--imagen-banner': `url(${image})`,
        }}
      >
        <div className="contenidoBanner">
          <h2 className="saludo">{momentodia()}</h2>
          <input
            className="form-control buscador"
            type="search"
            placeholder="Buscar"
            aria-label="Buscar"
          />
        </div>
      </header>
    </div>
  );
}

export default Menu_onboarding;