import React, { useEffect, useState } from 'react'
import Clienteservice from '../service/ClientesService';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';


export const AddClientesComponent = () => {
    const [direccion , setdireccion] = useState('');
    const [director , setdirector] = useState('');
    const [tipo , settipo] = useState('');
    const [folio , setfolio] = useState('');
    const [folionew , setfolionew] = useState();
    const [frecuenciatipo , setfrecuenciatipo] = useState('');
    const [titular , settitular] = useState('');
    const [frecuencia , setfrecuencia] = useState('');
    const [diaenvio , setdiaenvio] = useState('');
    const [fechaprogramada , setfechaprogramada] = useState('');
    const [estatus , setestatus] = useState('');
    const [comentarios , setcomentarios] = useState('');
    const [fechainicial , setfechainicial] = useState(new Date().toISOString().slice(0, 10));
    const [respuesta , setrespuesta] = useState('false');
    const [textorecordatorio , settextorecordatorio] = useState('');
    const [Clientes , setClientes]= useState([]);
    const navigate = useNavigate();
    const {id} =useParams();
    let e = 0;

    function myfunction(e){
        if (folionew - folionew === 0){
            const numero = folionew.toString().padStart(3,'0');
            settipo(e)    
            setfolio(direccion.substring(0,3) + '-' + numero + '-' + e.substring(0,3));
        }else{
            setfolio(direccion.substring(0,3) + '-' + "001" + '-' + e.substring(0,3));
            settipo(e)    
        }
    }
    const saveOrUpdateClientes = (e) => {
        e.preventDefault();
        const Clientes = {id, direccion,director, tipo, folio , textorecordatorio, frecuenciatipo, titular , frecuencia, diaenvio, fechaprogramada, estatus, comentarios, respuesta, fechainicial};
        if(id){

             Clienteservice.updateClientes(id,Clientes).then((response) =>{
                 navigate(-1)}
                 ).catch(error => {
                 console.log(error)
             })
        }
        else{
            Clienteservice.createClientes(Clientes).then((response) =>{
                navigate(-1)}
                ).catch(error => {
                console.log(error)
            })
            }
    }
    useEffect(()=>{
        setClientes();
        if(id){
        Clienteservice.getClientesById(id).then((response)=>{
            setdireccion(response.data.direccion);
            setdirector(response.data.director);
            settipo(response.data.tipo);
            setfolio(response.data.folio);
            settextorecordatorio(response.data.textorecordatorio);
            setfrecuenciatipo(response.data.frecuenciatipo);
            settitular(response.data.titular);
            setfrecuencia(response.data.frecuencia);
            setdiaenvio(response.data.diaenvio);
            setfechaprogramada(response.data.fechaprogramada);
            setestatus(response.data.estatus);
            setcomentarios(response.data.comentarios);
            setrespuesta(response.data.respuesta)
        }).catch(error=>{
            console.log(error)
        })
    }else{
        Clienteservice.getAllClientes(id).then(response =>{
            const rango = response.data.length - 1;
            setfechainicial (fechainicial)
            setfolionew(response.data[rango].id + 1  );
          }).catch(error => {
            console.log(error);
          })
    
    }
    },[])

    const title =()=>{
        if(id){
            return (
                <Stack direction='row'>
                   <Link onClick={() => navigate(-1)} className='btn btn-secondary mb-2'> Atras </Link>
                    <h2 className='text-center'> Actualizar Recordatorio</h2> 
                </Stack>
                )
            }
        else{

            return (
            <Stack direction='row'>
               <Link onClick={() => navigate(-1)}  className='btn btn-secondary mb-2'> Atras </Link>
                <h2 className='text-center'> Agregar Recordatorio</h2>
 
            </Stack>
            )
        }
    }
    return (
    <div>
        <div className='container'>
        <div className='row'>
        <div className='card col-md-6 offset-md-3 offset-md-3'>    
        <h2 className='text-center'> { title()} </h2>
        <div className='card-body'>
    </div>
        <form>
        <div className='form-group -mb-2'>
                <label className='form-label'>Direccion</label>
                <select 
                type='text' 
                placeholder='Digite Direccion' 
                name='direccion' 
                className='form-control' 
                value={direccion} 
                onChange={(e) => setdireccion(e.target.value)}
                 >
                   <option> Seleccionar... </option> 
                   <option> Importaciones </option> 
                   <option> Exportaciones </option> 
                   <option> Planta </option> 
                 </select>
        </div>
        <div className='form-group -mb-2'>
                <label className='form-label'>Director</label>
                <select 
                type='text' 
                placeholder='Digite Director' 
                name='director' 
                className='form-control' 
                value={director} 
                onChange={(e) => setdirector(e.target.value)}
                >
                <option> Seleccionar... </option> 
                <option> Fernando Pelusi de Icaza </option> 
                <option> Gil Morley </option> 
                <option> Sergio Isunza </option> 
              </select>
     </div>
        <div className='form-group -mb-2'>
                <label className='form-label'>Tipo</label>
                <select 
                onChange={(e)=> myfunction(e.target.value)}
                type='text' 
                placeholder='Digite Tipo' 
                name='tipo' 
                className='form-control' 
                value={tipo} 
                >
                <option> Seleccionar... </option> 
                <option> DG </option> 
                <option> INTERNO </option> 
              </select>

        </div>
        <div className='form-group -mb-2'>
                <label className='form-label'>Folio</label>
                <input 
                disabled  
                type='text' 
                placeholder='Digite Folio' 
                name='folio' 
                className='form-control' 
                value={folio} 
                onChange={(e) => setfolio(e.target.value)}
                 />
        </div>
        <div className='form-group -mb-2'>
                <label className='form-label'>Frecuencia </label>
                <select 
                type='text' 
                placeholder='Digite Frecuencia Envio' 
                name='frecuenciatipo' 
                className='form-control' 
                value={frecuenciatipo} 
                onChange={(e) => setfrecuenciatipo(e.target.value)}
                >
                    <option>Diario</option>
                    <option>48 horas</option>
                    <option>72 horas</option>
                    <option>Semanal</option>
                    <option>Quincenal</option>
                    <option>Mensual</option>
                    <option>Bimestral</option>
                    <option>Trimestral</option>
                    <option>Cuatrimestral</option>
                    <option>Semestral</option>
                    <option>Anual</option>
              </select>

        </div>
        <div className='form-group -mb-2'>
                <label className='form-label'>Titular</label>
                <select 
                type='text' 
                placeholder='Digite Titular' 
                name='titular' 
                className='form-control' 
                value={titular} 
                onChange={(e) => settitular(e.target.value)}
                >
            <option>Adrien Moreno</option>
            <option>Anwar Ortiz</option>
            <option>Edwige Wegiel</option>
            <option>Fernando Pelusi</option>
            <option>Gil Morley</option>
            <option>Juan Carlos Oneto</option>
            <option>Sergio Isunza</option>
          </select>

        </div>
        <div className='form-group -mb-2'>
                <label className='form-label'> Fecha Programada </label>
                <input 
                type="date"
                name='fechaprogramada' 
                className='form-control' 
                value={fechaprogramada} 
                onChange={(e) => setfechaprogramada(e.target.value)}
                 />
        </div>
        <div className='form-group -mb-2'>
                <label className='form-label'>Recordatorio</label>
                <textarea 
                style={{height:'80px'}}
                type='text' 
                placeholder='Digite Recordatorio' 
                name='textorecordatorio' 
                className='form-control' 
                value={textorecordatorio} 
                onChange={(e) => settextorecordatorio(e.target.value)}
                 />
        </div>

        <br></br>
            {folio == "" || fechaprogramada == "" ?
            <button disabled  className='btn btn-success' onClick={ (e) => saveOrUpdateClientes(e) } >Guardar</ button>
            :
            <button  className='btn btn-success' onClick={ (e) => saveOrUpdateClientes(e) } >Guardar</ button>
    
        }
            &nbsp;&nbsp;
            <Link  onClick={() => navigate(-1)} className='btn btn-danger'>Cancelar</Link>
        </form>
        <br></br>
        </div>
        </div>    
        </div>        
    </div>
  )
}

export default AddClientesComponent;