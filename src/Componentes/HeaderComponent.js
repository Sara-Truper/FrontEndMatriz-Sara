import React from 'react'
import { Link ,useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
export const HeaderComponent = () => {

  const limpiarstorage = () => {
    localStorage.clear();
    navigate('record/');
    window.location.reload(false);
  }
  const navigate = useNavigate();
  const almacenlocalusuario = localStorage.getItem('username')
  const almacenlocalpassword = localStorage.getItem('password')
if (almacenlocalusuario === "NuevoUser"){
  return(
    <div style={{position:"sticky", top:0}}>
        <header >
            <nav  className='navbar navbar-expand-mb navbar-dark- bg-dark'>
                <div>
                  <h1> </h1>
                </div>
                <Link to='record'><button className='btn btn-danger'  onClick={limpiarstorage}> Log Out </button></Link>

            </nav>
        </header>
    </div>

  )
}
if(localStorage.getItem('perfil') === 'ControlDocumental' ){
  return (
    <div style={{position:"sticky", top:0}}>
        <header >
            <nav  style={{border: "1px solid black"}}  className='navbar navbar-expand-mb navbar-light- bg-light'>
                <div>
                    <Link  to="record" style={{color:"#FF6720" }} className='navbar-brand'>&nbsp; <strong>Inicio</strong> </Link>    
                    <Link  to="importaciones/controldocumental/matrizcd" style={{color:"#FF6720" }} className='navbar-brand'>&nbsp; <strong>Matriz CD</strong> </Link>    
                </div>
                                <span style={{marginLeft:"40%", fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Usuario  : {localStorage.getItem("username") }</span>
                <Link to='record'><button className='btn btn-danger'  onClick={limpiarstorage}> Log Out </button></Link>

            </nav>
        </header>
    </div>
  )
}else if (localStorage.getItem('perfil') === 'Documentos'){
 return (
    <div style={{position:"sticky", top:0}}>
        <header >
            <nav  style={{border: "1px solid black"}}  className='navbar navbar-expand-mb navbar-light- bg-light'>
               <div className="dropdown">
      <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{fontSize:'20px',color:"#f07027ff" , marginLeft:"10%"}} >
        <b>Onboarding</b>
      </button>
      <ul className="dropdown-menu">
        <li><a className="dropdown-item" href="#"><Link  to="importaciones/AdmonDocs" style={{color:'#FF6400'}} className='navbar-brand'> <strong>Documentos</strong> </Link>    </a></li>
        <li><a className="dropdown-item" href="#"><Link  to="importaciones/Sesiones" style={{color:'#FF6400'}} className='navbar-brand'> <strong>Sesiones</strong> </Link>    </a></li>
      </ul>
    </div>
                <span style={{marginLeft:"40%", fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Usuario  : {localStorage.getItem("username") }</span>
              <Link to='record'><button className='btn btn-danger'  onClick={limpiarstorage}> Log Out </button></Link>
              
            </nav>
        </header>
    </div>
  )
}
  else{
  return (
    <div style={{position:"sticky", top:0}}>
        <header >
            <nav  style={{border: "1px solid black"}}  className='navbar navbar-expand-mb navbar-light- bg-light'>
                <div>
                    <Link  to="record" style={{color:"#FF6720" }} className='navbar-brand'>&nbsp; <strong>Inicio</strong> </Link>                    
                </div>
                                                <span style={{marginLeft:"40%", fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Usuario  : {localStorage.getItem("username") }</span>
                <Link to='record'><button className='btn btn-danger'  onClick={limpiarstorage}> Log Out </button></Link>

            </nav>
        </header>
    </div>
  )
}
}
export default HeaderComponent;