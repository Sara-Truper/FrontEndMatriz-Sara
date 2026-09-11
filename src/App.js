import './App.css';
import  ListaComponentes from './Componentes/ListaComponentes'
import HeaderComponent from './Componentes/HeaderComponent'
import {  BrowserRouter, Route, Routes } from 'react-router-dom'
import Inicio from './Componentes/Inicio';
import React, {useState, useEffect} from 'react';
import LoginForm from './Componentes/LoginForm';
import AgregarUsuario from './Componentes/AgregarUsuario';
import MatrizCD from './Componentes/MatrizCD'
import NuevaPO from './Componentes/NuevaPO';
import CalculadoraC from './Componentes/CalculadoraC';
import HistorialContenedor from './Componentes/materialReutilizable/historialContenedor';
import Administrador_documentos from './Componentes/Vistas_Onboarding/Administrador_documentos';
import Socs from './Componentes/ComponentesSOC/Socs';
import Sesiones from './Componentes/Vistas_Onboarding/Sesiones';
import Inscritos from './Componentes/Vistas_Onboarding/Inscritos';
import SocsLog from './Componentes/ComponentesSOC/SocsLog';
import ClientesService from './service/ClientesService';
import { ContactsOutlined } from '@mui/icons-material';
import FormatoTrial from './Componentes/Formatos/FormatoTrial';
import MenuFormatos from './Componentes/Formatos/MenuFormatos';
import FormatoRevisados from './Componentes/Formatos/FormatoRevisados';
import MenuSocMatriz from './Componentes/MenuMatriz-Soc/MenuSocMatriz';

import Soc_Planta from './Componentes/Planta_Matr_Soc/Soc_Planta';
import Menu_Matriz_Soc_Planta from './Componentes/Planta_Matr_Soc/Menu_Matriz_Soc_Planta';
import Matriz_Planta from './Componentes/Planta_Matr_Soc/Matriz_Planta';
import Matriz from './Componentes/Planta_Matr_Soc/Matriz';
import NuevaPI from './Componentes/Planta_Matr_Soc/NuevaPI';
import Menu_Planta_Planta from './Componentes/Planta_Matr_Soc/Menu_Planta_Planta';

function App() {
  
  const almacenlocalusuario = localStorage.getItem('username')
  const almacenlocalpassword = localStorage.getItem('password')
  const [user,setUser] = useState({username:"",password:""});
  const[error,setError] =useState("");

const Login = async usuarioinfo =>{
    if ( usuarioinfo.perfil === "admin" ||  usuarioinfo.perfil === "usuarioinicial"  ||  
         usuarioinfo.perfil === "usuarioseguimiento" || usuarioinfo.perfil ==="ControlDocumental" || 
         usuarioinfo.perfil ==="Documentos" || usuarioinfo.perfil === "SeguimientoOC1"  || 
         usuarioinfo.perfil === "Matr/Soc" ||  usuarioinfo.perfil === "ControlPlanta" 
         ||  usuarioinfo.perfil === "CalculadoraPlanta"  ) {
      setUser({
        username:usuarioinfo.usuario,
        password:usuarioinfo.constrasena})
        localStorage.setItem('username', usuarioinfo.usuario)
        localStorage.setItem('perfil', usuarioinfo.perfil)
        
    }
    else if (usuarioinfo.perfil === "formatos"){
  setUser({
        username:usuarioinfo.usuario,
        password:usuarioinfo.constrasena})
        localStorage.setItem('username', usuarioinfo.usuario)
        localStorage.setItem('perfil', usuarioinfo.perfil)
    }else{
    if(usuarioinfo === "NuevoUser") {
        setUser({
          username:usuarioinfo.usuario,
          password:usuarioinfo.constrasena})
          localStorage.setItem('username', usuarioinfo)
      }
      else{
      setError("Usuario / Contraseña incorrectos")
    }
  }}
  

if(almacenlocalusuario === null){
  return (
    <div>
         <BrowserRouter>
      <div className='container'>
      <Routes>
        <Route  path='record/' element={<LoginForm Login={Login} error={error} />}></Route>    
      </Routes>
      </div>
      </BrowserRouter>
   
  </div>
)
}else{
  if(almacenlocalusuario ==="NuevoUser"){

    return(
      <div>
      <BrowserRouter>
      <HeaderComponent />
      <div className='container'>
      <Routes>
        <Route  path='record/usuario' element={<AgregarUsuario/>}></Route>    
      </Routes>
      </div>
      </BrowserRouter>
    </div>
    )    
  }
 else  if(localStorage.getItem('perfil') === "ControlDocumental"){
    return(
      <div>
      <BrowserRouter>
      <HeaderComponent />
      <div className='container'>
      <Routes>
         <Route exact path='record/' element={<Inicio/>}></Route>
          <Route path='importaciones/controldocumental/matrizcd' element={<MatrizCD/>}></Route>    
          <Route path='importaciones/controldocumental/matrizcd/NuevaPO' element={<NuevaPO/>}></Route>    
          <Route path='importaciones/controldocumental/matrizcd/historialCD' element={<HistorialContenedor/>}></Route>    
          <Route path='importaciones/controldocumental/matrizcd/calculadora' element={<CalculadoraC/>}></Route>
      </Routes>
      </div>
      </BrowserRouter>
    </div>
    )
  }else if(localStorage.getItem('perfil') === "Documentos"){
    return(
      <div style={{ backgroundColor: '#f2f2f2'}}>
      <BrowserRouter>
      <HeaderComponent />
      <div className='container'>
      <Routes>
            <Route exact path='record/' element={<Inicio/>}></Route>
           <Route  path='importaciones/AdmonDocs' element={<Administrador_documentos/>}></Route>   
           <Route  path='importaciones/Sesiones' element={<Sesiones/>}></Route>   
           <Route  path='importaciones/inscritos' element={<Inscritos/>}></Route>   
      </Routes>
      </div>
      </BrowserRouter>
    </div>
    )
  } 
  else if(localStorage.getItem("perfil") === "SeguimientoOC1"){
    return (
      <div>
         <BrowserRouter>
      <HeaderComponent/>
        <div className='container'>
        <Routes>
          <Route  path='record/' element={<Socs/>}></Route>
          <Route path='importaciones/controldocumental/matrizcd/log-detalle' element={<SocsLog/>}></Route>
        </Routes>
      </div>
      </BrowserRouter>
      </div>
    )
  }
  else if (localStorage.getItem("perfil") === "formatos") {
    return (
      <div>
         <BrowserRouter>
      <HeaderComponent/>
        <div className='container'>
        <Routes>
          <Route  path='record/' element={<MenuFormatos/>}></Route>
          <Route  path='record/formatotrial' element={<FormatoTrial/>}></Route>
          <Route  path='record/formatorevisados' element={<FormatoRevisados/>}></Route>
        </Routes>
      </div>
      </BrowserRouter>
      </div>
    )
  }
    else if (localStorage.getItem("perfil") === "Matr/Soc") {
    return (
      <div>
         <BrowserRouter>
      <HeaderComponent/>
        <div className='container'>
        <Routes>
          <Route  path='record/' element={<MenuSocMatriz/>}></Route>
          <Route  path='record/Soc' element={<Socs/>}></Route>
          <Route path='importaciones/controldocumental/matrizcd/log-detalle' element={<SocsLog/>}></Route>
          <Route path='record/Inicio' element={<Inicio/>}></Route>
          <Route path='record/importaciones/controldocumental/matrizcd' element={<MatrizCD/>}></Route>    
          <Route path='importaciones/controldocumental/matrizcd/NuevaPO' element={<NuevaPO/>}></Route>  
          <Route path='importaciones/controldocumental/matrizcd/calculadora' element={<CalculadoraC/>}></Route>  
          <Route path='importaciones/controldocumental/matrizcd/historialCD' element={<HistorialContenedor/>}></Route>    
          <Route path='importaciones/controldocumental/matrizcd/calculadora' element={<CalculadoraC/>}></Route>
        </Routes>
      </div>
      </BrowserRouter>
      </div>
    )

  }    else if (localStorage.getItem("perfil") === "ControlPlanta") {
    return (
      <div>
         <BrowserRouter>
      <HeaderComponent/>
        <div className='container'>
        <Routes>
          <Route  path='/record/' element={<Menu_Matriz_Soc_Planta/>}></Route>
          <Route  path='/record/planta/soc_planta' element={<Soc_Planta/>}></Route>
          <Route  path='/record/planta/matriz_planta' element={<Matriz/>}></Route>
          <Route  path='/record/planta/matriz_planta/NuevaPI' element={<NuevaPI/>}></Route>   
        </Routes>
      </div>
      </BrowserRouter>
      </div>
    )
  }

   else if (localStorage.getItem("perfil") === "CalculadoraPlanta") {
    return (
      <div>
         <BrowserRouter>
      <HeaderComponent/>
        <div className='container'>
        <Routes>
          <Route  path='record/' element={<Menu_Planta_Planta/>}></Route>
          <Route  path='record/Calculadoraplanta' element={<CalculadoraC/>}></Route>
        </Routes>
      </div>
      </BrowserRouter>
      </div>
    )
  }

  /* if ( localStorage.getItem("perfil") === "admin" ||  localStorage.getItem("perfil") === "usuarioinicial"  ||  localStorage.getItem("perfil") === "usuarioseguimiento") {
  return(
   <div>
  <BrowserRouter>
  <HeaderComponent/>
  <div className='container'>
 <Routes>
   <Route exact path='record/' element={<Inicio/>}></Route>
    <Route  path='record/clientes' element={<ListaComponentes/>}></Route>
    <Route  path='record/add-Clientes' element={<AddClientesComponent/>}></Route>
  <Route  path='record/edit-Clientes/:id' element={<AddClientesComponent/>}></Route>
 <Route  path='record/usuario' element={<AgregarUsuario/>}></Route>

  </Routes>
 </div>
 </BrowserRouter>
 </div>
)} */



  }
  }

export default App;
