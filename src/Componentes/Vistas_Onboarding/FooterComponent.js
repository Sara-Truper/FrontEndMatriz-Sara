import React from "react";
import styles from "./Administrador_Documentos.module.css";

function FooterComponent() {
  return (
    <footer className={styles.footerOnboarding}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <p className={styles["adm-section-title"]}>ONBOARDING</p>
          <ul className={styles.footerList}>
            <a href=""><li>Acerca de nosotros</li></a>
            <a href=""><li>Documentación</li></a>
            <a href=""><li>Organigrama</li></a>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles["adm-section-title"]}>SOPORTE</p>
          <ul className={styles.footerList}>
            <a href=""><li>Preguntas frecuentes</li></a>
            <a href=""><li>Exámenes pendientes</li></a>
            <a href=""><li>Recordatorios</li></a>
            <a href=""><li>Ayuda</li></a>
          </ul>
        </div>

        <div className={styles.footerColumn}> <p className={styles["adm-section-title"]}>RECURSOS</p>
          <ul className={styles.footerList}>
            <a href=""><li>Nuevo documento</li></a>
            <a href=""><li>Procedimientos</li></a>
            <a href=""><li>Materiales</li></a>
            <a href=""><li>Políticas</li></a>
          </ul>
        </div>

      </div>
      <div className={styles.footerBottom}>
        <div>
          <a href="">Aviso de privacidad</a>
          <span> | </span>
          <a href="">Términos y condiciones</a>
        </div>

        <p>Portal de Onboarding Grupo Truper</p>
      </div>
    </footer>
  );
}

export default FooterComponent;