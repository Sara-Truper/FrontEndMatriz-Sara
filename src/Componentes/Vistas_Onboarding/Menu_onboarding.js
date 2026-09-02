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
<<<<<<< HEAD
    return (
<div style={{ position: 'relative',marginLeft:'-15%' , width:'130%' , minHeight: '15vh' ,backgroundColor:"#444343" }}>
    <div style={{ position: 'absolute',
        top: 0, left: 0,width: '100%', height: '100%', backgroundImage: `url(${image})`, backgroundSize: 'cover',
        backgroundPosition: 'center', backgroundRepeat: 'no-repeat', zIndex: 0 }}    />
    <div style={{ position: 'relative', zIndex: 1 }}>;
        <div  className="dropdown">
            {/* <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{fontSize:'20px',color:"#f07027ff" , backgroundColor:'lightgray' , marginLeft:'5%' }} >
                <b>Menu </b>
            </button> */}
            <ul className="dropdown-menu">
                <li><Link to="/importaciones/AdmonDocs" style={{color:'#FF6400'}} className='dropdown-item'><strong>Documentos</strong></Link></li>
                <li><Link to="/importaciones/Sesiones" style={{color:'#FF6400'}} className='dropdown-item'><strong>Sesiones</strong></Link></li>
            </ul>
        </div> */}
        <Stack direction='horizontal'  >
            <h2 style={{marginLeft:'40%', color:'#FF6400', fontSize:'30px' , fontFamily:'serif'}} > <b>{momentodia()}</b></h2> 
                <input style={{width:'20%' , marginLeft:'10%'}} className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
        </Stack>
        </div>
            <span className={styles.mower} style={{ marginLeft: "30%", fontSize: "40px" }}>
                🚜  🔨 🦼
            </span> 
</div>
=======
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
>>>>>>> emmaorigin/master
  );
}

export default Menu_onboarding;