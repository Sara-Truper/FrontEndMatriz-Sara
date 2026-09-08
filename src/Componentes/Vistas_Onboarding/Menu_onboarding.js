import * as React from 'react';
import Button from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import image from './Logo_Truper.jpg';
import { Stack } from 'react-bootstrap';
import styles from "./Administrador_Documentos.module.css";

function Menu_onboarding() {

    const momentodia = ()=>{
        const hora = new Date()
        const horadia = hora.getHours();
        if (horadia < 12){return "¡Buenos Dias!"}
            else if(horadia >= 12 && horadia < 18)
                {return "¡Buenas Tardes!"}
            else{return "¡Buenas Noches!"}   
    }
  return (
    <header
      className={styles.bannerOnboarding}
      style={{
        "--imagen-banner": `url(${image})`,
      }}
    > <div/>
      <div className={styles.contenidoBanner}>
        <h2 className={styles.saludo}> {momentodia()}</h2>
        <input className={`form-control ${styles.buscador}`} type="search" placeholder="Buscar" aria-label="Buscar"/>
      </div>
    </header>
  );
}

export default Menu_onboarding;