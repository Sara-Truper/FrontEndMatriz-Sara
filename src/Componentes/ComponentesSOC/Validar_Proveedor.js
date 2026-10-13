import React, { useEffect, useState } from 'react'
import ClientesService from '../../service/ClientesService'

function Validar_Proveedor() {

    const [digitoInicial,setdigitoInicial] = useState();
    const [proveedorC,setproveedorC] = useState([]);
    const [proveedorEncontrado, setproveedorEncontrado] = useState([]);

    useEffect(() => {
        proveedorOK();
    }, []);
    
    const proveedorOK = (e) =>{
        ClientesService.getproveedoresall().then((response)=>{
            setproveedorC(response.data)
        }).catch((err)=>{
            console.log(err)
        })
    }
    const proveedorfind = (e)=>{
        console.log(e)
           const found = proveedorC.find( proveedores => Number(proveedores.noProveedor) === Number(e) );
            setproveedorEncontrado(found)
    }
  return (
    <div>
        <label>No Validar_Proveedor</label>
        <input type='number' placeholder='Ingresa No de Proveedor'
        onChange={(e) => { const val = e.target.value; setdigitoInicial(val); if (val.length === 6) { proveedorfind(val);}}}  / >
            <br></br>
        <label>{proveedorEncontrado.proveedor}</label>       
            <br></br>
         <label>{proveedorEncontrado.moneda}</label>
    </div>
  )
}

export default Validar_Proveedor