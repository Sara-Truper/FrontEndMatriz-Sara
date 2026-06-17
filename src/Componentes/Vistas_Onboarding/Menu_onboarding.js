import * as React from 'react';
import Button from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import image from './herramientasOK.jpg';

function Menu_onboarding() {

    const momentodia = ()=>{
        const hora = new Date()
        const horadia = hora.getHours();
        if (horadia < 12){
            return "BUENOS DIAS"  
        }else if(horadia >= 12 && horadia < 18){
            return "BUENAS TARDES"         
        }else{
            return "BUENAS NOCHES"          
        }   
    }

    return (
<div style={{ position: 'relative',marginLeft:'-10%' , width:'120%' , minHeight: '60vh' }}>

    <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.3,
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
    }}
    />
    <div style={{ position: 'relative', zIndex: 1 }}>
       <h2 style={{marginLeft:'40%', color:'#FF6400'}} > {momentodia() }</h2> 
        <div  className="dropdown">
            <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{fontSize:'20px',color:"#f07027ff" , backgroundColor:'lightgray' , marginLeft:'5%' }} >
                <b>Menu </b>
            </button>
            <ul className="dropdown-menu">
                <li><Link to="/importaciones/AdmonDocs" style={{color:'#FF6400'}} className='dropdown-item'><strong>Documentos</strong></Link></li>
                <li><Link to="/importaciones/Sesiones" style={{color:'#FF6400'}} className='dropdown-item'><strong>Sesiones</strong></Link></li>
            </ul>
        </div>
    </div>

</div>
  );
}

export default Menu_onboarding