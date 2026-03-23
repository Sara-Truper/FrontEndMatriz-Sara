import React, { Fragment, useState , useEffect } from "react";
import ClientesService from "../service/ClientesService";
import Stack from "@mui/material/Stack";
import { Input } from "@mui/material";
import { BUs } from "./materialReutilizable/RangosReusables";
import { GeneraHistorial } from "./materialReutilizable/GenerarHistorial.js";
import { obtenerEstadoEnvio, BUs_Piloto , LiberadaPorMatrices } from "./materialReutilizable/AreaDestino.js";

function NuevaPO() {
  const [x, setx] = useState();
  const [sub, setsub] = useState();
  const[view,setview]= useState(false);
  const[view2,setview2]= useState(false);
  const[registro, setRegistro] = useState([])
  const[registrohist, setRegistrohist] = useState([])
  const[registroanterior, setRegistroanterior] = useState([])
  const opciones = { day: "2-digit", month: "2-digit", year: "numeric" };

  const llenos = [registro.segunda, registro.precio, registro.matriz, registro.datos_fiscales, registro.term_de_pago, registro.dir_de_prov, registro.tax_id, registro.incoterm, registro.qty, registro.etd, registro.etd_pi, registro.add_elim_item, registro.peso_vol, 
      registro.validacion_pod_vs_pi, registro.condicion_de_matrices, registro.compartida , registro.trial, registro.fecha_de_recepcion, registro.fecha_entrega_compras
    ];
  
   const todosLlenos = llenos.every(  campo => typeof campo === 'string' && campo.trim() !== '');
   const crearRegistro = ()=>{ 
       setRegistrohist(registro)
        if(todosLlenos || registro.segunda === "PF") {
              if( (registro.montopi === '' || registro.montopi === null)  && registro.segunda !== "PF"){
               alert("Favor de llenar Monto")
              }else{
            const value = obtenerEstadoEnvio(null, registro); 
            registro.area_destino = value;
                   if (registro.fecha_matrices !== null && registro.fecha_matrices.includes("/")) {
                    const [day, month, year] = registro.fecha_matrices.split('/');
              registro.fecha_matrices = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00`;       
             }    
                   if(registro.id === undefined){
                      registro.liberacion_de_matr_con_sello = registro.liberacion_de_matr_con_sello === undefined ? "-" : registro.liberacion_de_matr_con_sello
                         ClientesService.createClientes(registro).then((response) =>{
                               setview(false)
                         }).catch((error)=>{
                               console.log(error)
                         })
                        //  GeneraHistorial("nuevo", registrohist , registroanterior)
                 }else{
                     ClientesService.updateClientes(registro.id, registro).then((response) =>{
                           setview(false)
                     }).catch((error)=>{
                           console.log(error)
                     })
                      //  GeneraHistorial(registro.id, registrohist , registroanterior)
     }
        } }else{
               alert("Favor de llenar todos los Campos")
         }
         setx()
} 
    const handleKeyPress = (event) => {
      if(event.key === 'Enter'){
        handleopen();
      }
    }

const seg_corr = (x)=>{
      if(x ==='Correccion'){
            setx('Correccion')
            setview2(false)
      }else{
       let id = registro.id           
ClientesService.getnuevapoNA(sub).then((response) => {
      if (response.data[0]?.folio_tt !== undefined) {
  const datos = response.data[0];
  const datosFormateados = Object.fromEntries(
    Object.entries(datos).map(([clave, valor]) => {
      if (typeof valor === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
          return [clave, `${valor}T00:00`];
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
          const [dia, mes, anio] = valor.split("/");
          const fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          const fecha = new Date(fechaISO);
          if (!isNaN(fecha.getTime())) {
            return [clave, `${fechaISO}T00:00`];
            }}}
      return [clave, valor];
    }));
  datosFormateados.montopi = ""
  setRegistro(datosFormateados); 
  setRegistro((prev) => ({...prev, ["id"]: id} ))
  setx('segunda')
  setview2(false)
} else {
  alert("NO EXISTE PO " + sub + " en Socs");
}}).catch(error => {
    console.log(error);
  });
}
  setview(true);
}
  const cerrar = ()=>{
    setsub();
    setview(false);
    setx()
  };
  
 const ActualizarRegistro = (a, nume) => {
  let valor;
  if (a.target.name === "unidad_de_negocio") {
      ClientesService.getcombProv(registro.no_de_proveedor + a.target.value).then((response)=>{
          setRegistro((prev) => ({...prev, 
            ["gerente_de_compras"]: response.data?.gte_Responsable_BU,
            ["confirmador"]: response.data?.planeador_planeacion,
            ["validaciones_extraordinarias"]: response.data?.tc_MP
          } ))
      }).catch((error)=>{
        console.log(error)
      })}
  const nuevoRegistro = { ...registro };
  if (a.target.type === "date") {
    if(["fecha_sap", "fecha_auditoria", "fecha_planeacion" ,"fecha_bu"].includes(a.target.name)){
        const opcion = window.confirm("¿Deseas usar la fecha seleccionada?\nPresiona 'Cancelar' para usar N/A");
     valor = a.target.value === "" ? null : opcion ? new Date().toISOString().split('T')[0] + "T00:00:00" : "2000-01-01T00:00:00" 
    }
  } else {    //  '''aqui me quedo    Revisar el estado en TIEMPO REAL
      valor = a.target.value;
 } 
 if(["liberada_por_sap", "liberada_por_auditoria", "liberada_por_planeacion" ,"liberada_por_bu"].includes(a.target.name)){
          if(a.target.value === ""){
    nuevoRegistro[a.target.name.replace("liberada_por_","fecha_")] = null; 
    }else{
    const opcion = window.confirm("¿Deseas usar la fecha actual?\nPresiona 'Cancelar' para usar N/A");
    nuevoRegistro[a.target.name.replace("liberada_por_","fecha_")] = opcion ? new Date().toISOString().split('T')[0] + "T00:00:00" : "2000-01-01T00:00:00" 
}
}
 if (a.target.type === "date" && !["fecha_sap", "fecha_auditoria", "fecha_planeacion" ,"fecha_bu"].includes(a.target.name)){
     valor = new Date(a.target.value).toISOString().split('T')[0] + "T00:00:00"; 
 }
  if (a.target.name === "segunda" &&  (registro.liberada_por_matrices === "X" || registro.liberada_por_matrices === "MS")) {
    nuevoRegistro["liberacion_de_matr_con_sello"] = a.target.value === "SI"  ? "PI ANTERIOR LIBERADA CON SELLO" : "PI LIBERADA CON SELLO"
    }
  if (a.target.name === "montopi") {
    nuevoRegistro[a.target.name] = nume;
  } else {
    nuevoRegistro[a.target.name] = valor;
    const hoy = new Date().toISOString().split("T")[0] + "T00:00";
    const fecha = new Date();
const fechaMexico = new Date().toLocaleString("sv-SE", {
  timeZone: "America/Mexico_City"
});
const fechaISOlocal = fechaMexico.replace(" ", "T");
    nuevoRegistro["fecha_inicio"] = fechaISOlocal;
    nuevoRegistro["fecha_revision"] = hoy;
 if (BUs_Piloto(nuevoRegistro.fecha_entrega_compras, nuevoRegistro) === false) {
  if (nuevoRegistro.liberada_por_bu === "ACEPTADA") {
    // nuevoRegistro["fecha_entrega_compras"] = null; linea anterior 
    // nuevoRegistro["fecha_entrega_compras"] = registro.fecha_entrega_compras;
  } 
   else {
    // nuevoRegistro["fecha_entrega_compras"] = registro.fecha_entrega_compras;
  }
}
setRegistro(nuevoRegistro);
  }
  nuevoRegistro["area_destino"] = obtenerEstadoEnvio(null, nuevoRegistro);
  LiberadaPorMatrices(nuevoRegistro).then(resp => {
  setRegistro(prev => ({
    ...prev,
    liberada_por_matrices: resp
  }));
});
  setRegistro(nuevoRegistro);
};

const handleopen = ()=>{
      ClientesService.getnuevapo(sub).then((response) => {
      if (response.data[0].folio_tt !== undefined) {
           setRegistroanterior(response.data[0])
           setRegistro(response.data[0])
           setview2(true);
           setx('Correccion')
       if (response.data[0].segunda ==='NO')
            setview2(true);
         }else{
           alert("NO EXISTE PO " + sub + " en Socs")
         }
         // primera condiciones, existe en BD 
         //console.log(registro.ptoDirecto !== "NA" ? "ABRIL ROSALES" : registro.confirmador)
         const datos= response.data[0];
         const confirmadorOriginal = datos.confirmador;
        const ptoDirecto = (datos.pto_directo || "").toString().trim().toUpperCase();
        if (ptoDirecto !== "" && ptoDirecto !== "NA") {
          datos.confirmador = "ABRIL ROSALES";
          {console.log("valor anterior:", confirmadorOriginal)}
        }
        }
      
    ).catch(error => {
  ClientesService.getnuevapoNA(sub).then((response) => { //no existe en BD, se busca en SOCS. Registro nuevo

    if (response.data[0]?.folio_tt !== undefined) {
      const datos = response.data[0];
      const datosFormateados = Object.fromEntries(
        Object.entries(datos).map(([clave, valor]) => {
          if (
            typeof valor === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(valor) ) {
            return [clave, `${valor}T00:00`];
          }
          return [clave, valor];
        })
      );
      const ptoDirecto= (datosFormateados.pto_directo || "").toString().trim().toUpperCase();
      // vacio y NaN, igual     no vacio o diferente a NA ABRIL ROSALES
      if(ptoDirecto!=="" && ptoDirecto!== "NA"){
        datosFormateados.confirmador="ABRIL ROSALES";
      }

       datosFormateados.montopi = ""
      setRegistroanterior(datosFormateados);
      setRegistro(datosFormateados);
      setview(true);

      if (datos.segunda === 'NO') {
        setview2(true);
      }
    } else {
      alert("NO EXISTE PO " + sub + " en Socs");
    }
  }).catch(error => {
    console.log(error);
  });
});
};
{console.log(registro)}

const fechaFormateada = (fecha) => { 
    if (fecha !== undefined){
        return  registro.length !== 0   ? new Date(fecha).toISOString().split('T')[0] + "T00:00:00"   : ''; 
    }
}
const fechaFormateadaObj = (fecha) => { 
    if (fecha !== undefined){
        return  registro.length !== 0   ? new Date(fecha).toISOString().split('T')[0]   : ''; 
    }
}
const fechaEntregaCompras =(a)=>{
           if (a.target.type === "text"){
             setRegistro((prev) => ({...prev, 
             [a.target.name]: fechaFormateada(new Date()),
           }))
           }else {
             const opcion = window.confirm("¿Deseas usar la fecha seleccionada?\nPresiona 'Cancelar' para usar N/A");
             let valor = ""
               valor = a.target.value === "" ? null : opcion ? new Date(a.target.value).toISOString().split('T')[0] + "T00:00:00" : "2000-01-01T00:00:00"
               if (opcion){

              }else {
                    
            } 
             setRegistro((prev) => ({...prev, 
             [a.target.name]: valor,
           }))
           }}      
if (view2){
      return(
      <div style={{padding:'10px'}}> 
      <br></br>
      <span style={{marginLeft:"12px", outline:'2px solid black'}}> PO  <b>{registro.folio_tt}</b> </span> 
      <button style={{marginLeft:"12px"}} onClick={(x)=>{ seg_corr('segunda') }} className="btn btn-success mb-2"> Segunda </button>
      <button style={{marginLeft:"12px"}} onClick={(x)=>{ seg_corr('Correccion') }} className="btn btn-danger mb-2"> Correccion </button>
      </div>
)
    }
    if  (view){
      registro.historial_de_modificacion = localStorage.getItem('username')  
      //hoy 
      const hoy = new Date();
      const fechaMin = hoy.toISOString().split("T")[0];

      //fecha max hoy2
      const hoy2 = new Date();
      hoy2.setFullYear(hoy.getFullYear() + 2);
      const fechaMax = hoy2.toISOString().split("T")[0]; 
      
      return(
        <Stack direction='column' >
          <br></br>
          <div style={{border:"groove"}}>
          <h2 style={{ marginLeft:"10px" ,  color: registro.status_de_embarque === "X" ? "red": "black" }}> {x === undefined ? registro.status_de_embarque === "X" ? "CANCELADA" : "Nuevo Registro" : x ==="Correccion" ? "CORRECCIÓN" : "SEGUNDA" }     </h2> 
          
            <label style={{marginLeft:"12px"}} for="fecha_de_recepcion">FECHA DE RECEPCION</label> 
          <input onChange={(a)=>{ActualizarRegistro(a)}} type="date" name="fecha_de_recepcion" min={fechaMin} max={fechaMax} value={registro.fecha_de_recepcion?.split('T')[0]} onKeyDown={(e) => e.preventDefault()}/>
          
            <label style={{marginLeft:"12px"}} for="fecha_inicio" >FECHA INICIO</label> 
          <input readOnly type="date" name="fecha_inicio" value={new Date().toISOString().split('T')[0]}/>
            <label hidden={BUs_Piloto(registro.fecha_entrega_compras, registro)}  style={{marginLeft:"12px"}} for="fecha_entrega_compras" >FECHA ENTREGA A COMPRAS</label> 
          {/* poner nueva funcionalidad que actualice el estado setRegistro */}
          <input hidden={(registro.fecha_entrega_compras === undefined || registro.fecha_entrega_compras !== "2000-01-01T00:00:00" ) ? false : true} onChange={(a)=>{fechaEntregaCompras(a)}} style={{width:"10%"}}  type="date" name="fecha_entrega_compras" min={fechaMin} max={fechaMax} value={fechaFormateadaObj(registro.fecha_entrega_compras)}/>
          <input hidden={registro.fecha_entrega_compras === "2000-01-01T00:00:00" ? false : true} onClick={(a)=>{fechaEntregaCompras(a)}} style={{width:"10%"}}  type="text" value="N/A" name="fecha_entrega_compras"/>
          {/* <input readOnly hidden={BUs_Piloto(registro.fecha_entrega_compras, registro)} style={{width:"10%"}} type={registro.liberada_por_bu === "ACEPTADA" && x === undefined && obtenerEstadoEnvio(registro.fecha_area_destino, registro) ==="PLANEACION"  ? "text" : (registro.fecha_entrega_compras === undefined || registro.fecha_entrega_compras === null) ? "date" : "text"} name="fecha_entrega_compras"  value={(registro.liberada_por_bu === "ACEPTADA" && x === undefined && obtenerEstadoEnvio(registro.fecha_area_destino, registro) ==="PLANEACION") ? "N/A" :  (registro.fecha_entrega_compras === undefined || registro.fecha_entrega_compras === null) ? new Date().toISOString().split('T')[0] : "N/A" }/> */}
            <button  onClick={()=>{crearRegistro()}} style={{ padding:'7px', color:'white', backgroundColor:'green', borderRadius:"10%" , marginLeft: BUs_Piloto(registro.fecha_entrega_compras, registro) === false ? "7%": "22%"}}>Guardar</button>
            <label style={{width:'1%'}}></label>
            <button onClick={()=>{cerrar()}} style={{ padding:'7px', color:'white', backgroundColor:'red', borderRadius:"10%"}}>Cancelar</button>      
          <p></p>
          </div>
            <p></p>
          <Stack direction='column'  >
            <fieldset  style={{ outline: '1px solid black'}}>
            <label style={{marginLeft:"12px", display:'inline-block', width:'10%'}} for='NoPO' > NO. PO <br></br> 
            <Input readOnly value={sub} name="NoPO" style={{borderStyle:'groove', width:'100%'}}></Input> </label>
            <label style={{ marginLeft:"12px", display:'inline-block', width:'10%'}} for='foliott'> FOLIO TT <br></br> 
                <Input readOnly name="no_oc" style={{borderStyle:'groove', width:'80%'}}value={registro.no_oc}></Input></label>
                <label style={{  display:'inline-block', width:'17%'}} for='bu'> UNIDAD DE NEGOCIO 
                <select onChange={(a)=>{ActualizarRegistro(a)}}  id="bu" name="unidad_de_negocio" style={{borderStyle:'groove', width:'100%' }} >
                        <option>{registro.unidad_de_negocio}</option>
                         {BUs.map((item) => (
                        <option key={item} value={item}>
                              {item}
                        </option>
                        ))} 
                  </select></label>
            <label  style={{marginLeft:"12px",  display:'inline-block', width:'15%'}} for='noprov'> NUMERO DE PROVEEDOR 
                <Input readOnly name="no_de_proveedor" style={{borderStyle:'groove', width:'90%' }} value={registro.no_de_proveedor}></Input></label>
            <label style={{  marginTop:'1%', display:'inline-block', width:'43%'}} for='nprov'> PROVEEDOR
            <input multiline='true' readOnly name="proveedor" style={{borderStyle:'groove', width:'100%' }} value={registro.proveedor}></input></label>
                <hr></hr>
            <label style={{marginLeft:"12px", display:'inline-block', width:'19%'}} for='gcompras'> GERENTE COMPRAS 
                <Input readOnly name="gerente_de_compras" style={{borderStyle:'groove', width:'100%' }} value={registro.gerente_de_compras}></Input></label>
            <label style={{marginLeft:"12px", display:'inline-block', width:'23%'}} for='confir'> CONFIRMADOR 

                <Input readOnly name="confirmador" style={{borderStyle:'groove', width:'100%' }} value={registro.confirmador === "0" ? "TBD" : registro.confirmador}></Input></label>
              <label style={{marginLeft:"12px", display:'inline-block', width:'12%'}}  for='ptodirecto'> PTO. DIRECTO
                <Input readOnly name="pto_directo" style={{ borderStyle:'groove', width:'100%' }} value={registro.pto_directo}></Input></label>

              <label style={{marginLeft:"12px", display:'inline-block', width:'10%'}}  for='montopi'> MONTO PI
                <Input title="SOLO PERMITE PEGAR" onChange={(a)=>{ActualizarRegistro(a)}} 
                        onKeyDown={(e) => {
                        const isPaste = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v';
                        const isTab = e.key === 'Tab';
                        if (!isPaste && !isTab) {
                        e.preventDefault();
                        }}}
onPaste={(e) => {
  const textoPegado = e.clipboardData.getData('text');
  const textoLimpio = textoPegado.replace(/[^\d.,]/g, '');
// const regex = /^\d+(\.\d{1,4})?$/;
const regex = /^\d{1,3}(,\d{3})*(\.\d{1,4})?$|^\d+(\.\d{1,4})?$/;

  if (regex.test(textoLimpio)) {
    const numero = textoLimpio.replace(/,/g, '');
    ActualizarRegistro(e, numero);
    e.preventDefault();
  } else {
    e.preventDefault();}}}  name="montopi" style={{ borderStyle:'groove', width:'100%', textAlign:"center" }} value={registro.montopi ? `$ ${Number(registro.montopi).toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:4})}` : ""}
     ></Input></label>

              <label style={{marginLeft:"12px", display:'inline-block', width:'6%'}}  for='moneda'> MONEDA 
                <Input readOnly name="moneda" style={{borderStyle:'groove', width:'100%' }} value={registro.moneda}></Input></label>
              <label style={{marginLeft:"12px", display:'inline-block', width:'10%', backgroundColor:'red' , color:'white', textAlign:'center'}}  for='validaciones_extraordinarias'> <b>VALIDAR TC/MP </b>
                <Input readOnly name="validaciones_extraordinarias" style={{borderStyle:'groove', width:'100%' , backgroundColor:'white' }} value={registro.validaciones_extraordinarias}></Input></label>
                <hr></hr>

                {registro.fecha_matrices === "" ? (<></>) : ( <> <label style={{marginLeft:"12px", display: 'inline-block', width: '38%' }} htmlFor='Mmatrices'> MOTIVO MATRICES <Input multiline readOnly name="motivo_matrices" style={{ borderStyle: 'groove', width: '100%' }} value={registro.motivo_matrices }/>
    </label>
    <label style={{marginLeft:"12px", display: 'inline-block', width: '10%' }} htmlFor='FMatrices'>
      FECHA MATRICES
      <Input readOnly type= {(x === "Correccion" || x === "segunda")  ? registro.fecha_matrices === null ? "text" : "date" : "text"} name="fecha_matrices" style={{ borderStyle: 'groove', width: '100%' }}  value={(x === "Correccion" || x === "segunda")  ? registro.fecha_matrices === null ? null : new Date(registro.fecha_matrices).toISOString().split('T')[0] : registro.fecha_matrices} /> 
      </label></>)}
                  <label style={{marginLeft:"2%", display: 'inline-block', width: '15%' }} htmlFor='liberada_por_matrices'>LIBERADA POR MATRICES
                  <Input readOnly  name="liberada_por_matrices" style={{ borderStyle: 'groove', width: '100%' }}  value={registro?.liberada_por_matrices ?? ''} /></label>

                  <label style={{marginLeft:"2%", display: 'inline-block', width: '25%' }} htmlFor='liberacion_de_matr_con_sello'>LIBERACION DE MATRICES CON SELLO
                  <Input readOnly  name="liberacion_de_matr_con_sello" style={{ borderStyle: 'groove', width: '100%' }}  value={registro.liberacion_de_matr_con_sello === undefined ? "-" : registro.liberacion_de_matr_con_sello } /></label>
                <hr></hr>            
          <label style={{marginLeft:"19px", display:'inline-block', width:'6%'}}  for='Segunda'> 2DA 
                  <select defaultValue={x === '2da' ? 'SI' :  x === '' ? '' : registro.segunda}  onChange={(a)=>{ActualizarRegistro(a)}} name="segunda" style={{width:'100%'}}  >
                        <option>...</option>
                        <option>SI</option>
                        <option>NO</option>
                        <option>PF</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'11%'}}  for='Precio'> PRECIO 
                  <select onChange={(a)=>{ActualizarRegistro(a)}} name="precio" style={{width:'100%', color:["A LA ALZA","A LA BAJA","ALZA Y BAJA"].includes(registro.precio) ? "red" : "black"}} value={registro.precio} >
                        <option>...</option>
                        <option>A LA ALZA</option>
                        <option>A LA BAJA</option>
                        <option>OK</option>
                        <option>ALZA Y BAJA</option>
                        <option>MONEDA</option>
                        <option>NOTA $</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'10%'}}  for='matriz'> MATRIZ 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="matriz" style={{width:'100%'}} value={registro.matriz}>
                        <option>...</option>
                        <option>REFERENCIA</option>
                        <option>FIRMADA</option>
                        <option>MIXTA</option>
                        <option>N/A</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'7%'}}  for='Dfiscales'> DATOS FISCALES 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="datos_fiscales" style={{width:'100%', color: registro.datos_fiscales ==="MAL" ? "red" : "black"}} value={registro.datos_fiscales}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'7%'}}  for='tpago'> TERM DE PAGO 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="term_de_pago" style={{width:'100%', backgroundColor: registro.term_de_pago ==="MAL" ? "red" : ""}} value={registro.term_de_pago}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'7%'}}  for='dprov'> DIR DE PROV 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="dir_de_prov" style={{width:'100%', color: registro.dir_de_prov ==="MAL" ? "red" : "black"}} value={registro.dir_de_prov}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'7%'}}  for='taxid'> TAX ID 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="tax_id" style={{width:'100%', color: registro.tax_id ==="MAL" ? "red" : "black"}} value={registro.tax_id}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'7%'}}  for='incoterm'> INCOTERM
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="incoterm" style={{width:'100%', color: registro.incoterm ==="MAL" ? "red" : "black"}} value={registro.incoterm}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
            <label style={{marginLeft:"19px", display:'inline-block', width:'7%'}}  for='qty'> QTY 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="qty" style={{width:'100%', color: registro.qty ==="MAL" ? "red" : "black"}} value={registro.qty}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
                  <hr></hr>
            <label style={{marginLeft:"12px", display:'inline-block', width:'7%'}}  for='etdnw'> ETD 
                  <select onChange={(a)=>{ActualizarRegistro(a)}} name="etd" style={{width:'100%', color: registro.etd ==="MAL" ? "red" : "black"}} value={registro.etd}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
            <label style={{marginLeft:"18px", display:'inline-block', width:'10%'}}  for='etdf'> ETD PO 
                <Input readOnly name="etd_po" type="date" style={{borderStyle:'groove', width:'100%' }} value={fechaFormateadaObj(registro.etd_po)}></Input></label>
            <label style={{marginLeft:"18px", display:'inline-block', width:'12%'}}  for='etdf'> ETD PI
                <Input style={{borderStyle:'groove'}} onChange={(a)=>{ActualizarRegistro(a)}} type="date" name="etd_pi" value={registro.etd_pi?.split('T')[0]}></Input></label>

            <label style={{marginLeft:"18px", display:'inline-block', width:'15%'}}  for='addelim'> ADD/ELIM ITEM 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="add_elim_item" style={{width:'100%'}} value={registro.add_elim_item}>
                        <option>...</option>
                        <option>ADD ITEM</option>
                        <option>ELIM ITEM</option>
                        <option>N/A</option>
                        <option>ELIM/ADD</option>
                        <option>HC</option>
                  </select></label>
            <label style={{marginLeft:"18px", display:'inline-block', width:'7%'}}  for='pesovol'> PESO/VOL 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="peso_vol" style={{width:'100%', color: registro.peso_vol ==="MAL" ? "red" : "black"}} value={registro.peso_vol}>
                        <option>...</option>
                        <option>OK</option>
                        <option>MAL</option>
                  </select></label>
            <label style={{marginLeft:"18px", display:'inline-block', width:'16%'}}  for='validpopi'> VALIDACIÓN POD VS PI 
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="validacion_pod_vs_pi" style={{width:'100%'}} value={registro.validacion_pod_vs_pi}>
                        <option>...</option>
                        <option>OK</option>
                        <option>NO INDICA</option>
                        <option>DIFERENTE</option>
                        <option>N/A</option>
                  </select></label>
            <label style={{marginLeft:"18px", display:'inline-block', width:'17%'}}  for='condicion_de_matrices'> CONDICIÓN DE MATRICES  
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="condicion_de_matrices" style={{width:'100%'}} value={registro.condicion_de_matrices}>
                        <option> </option>
                        <option><b>---</b></option>
                        <option>NAM</option>
                  </select></label>
                  <hr></hr>
                  <label style={{marginLeft:"18px", display: 'inline-block', width: '38%' }} htmlFor='observaciones'> OBSERVACIONES 
                        <Input multiline  onChange={(a)=>{ActualizarRegistro(a)}} name="observaciones" style={{ borderStyle: 'groove', width: '100%' }} value={registro.observaciones}/></label>

            <label style={{marginLeft:"18px", display: 'inline-block', width: '15%' }} htmlFor='area_destino'> AREA DESTINO 
                        <Input readOnly name="area_destino" style={{ borderStyle: 'groove', width: '100%' }} value={obtenerEstadoEnvio(registro.fecha_area_destino, registro)}/></label>
            <label  style={{marginLeft:"18px", display:'inline-block', width:'10%'}}  for='fecha_area_destino'> FECHA AREA DESTINO
      <Input style={{borderStyle:'groove' , width:"95%"}} onChange={(a)=>{ActualizarRegistro(a)}} type="date" name="fecha_area_destino" value={registro.fecha_area_destino?.split('T')[0]}></Input></label>      

        <label style={{ marginLeft:"7%", display:'inline-block', width:'10%' , backgroundColor:'red' , color:'white', textAlign:'center'}} for='compartida'> <b>COMPARTIDA</b>  
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="compartida" style={{width:'100%'}} value={registro.compartida}>
                        <option>...</option>
                        <option>Si</option>
                        <option>No</option>
                  </select></label>
            <label style={{marginLeft:"2%", display:'inline-block', width:'10%' , backgroundColor:'red' , color:'white', textAlign:'center'}}  for='trial'> <b>TRIAL</b>  
                  <select  onChange={(a)=>{ActualizarRegistro(a)}} name="trial" style={{width:'100%'}} value={registro.trial}>
                        <option>...</option>
                        <option>Si</option>
                        <option>No</option>
                  </select></label>
                  <hr></hr>
            <label style={{ marginLeft:"12px", display:'inline-block', width:'12%'}} for='bu'> LIBERADA POR BU 
            <select onChange={(a)=>{ActualizarRegistro(a)}}  id="liberada_por_bu" name="liberada_por_bu" style={{borderStyle:'groove', width:'100%' }} defaultValue={registro.liberada_por_bu} >
                        <option > </option> 
                        <option >ACEPTADA</option> 
                        <option >RECHAZADA</option> 
                  </select></label>
            <label  style={{marginLeft:"18px", display:'inline-block', width:'10%'}}  for='fecha_bu'> FECHA BU
              <br style={{display:(registro.fecha_bu === "2000-01-01T00:00:00") ? '' : 'none' }}></br>
              <input disabled style={{display:(registro.fecha_bu === "2000-01-01T00:00:00") ? '' : 'none' }} value="N/A" />
                <Input style={{borderStyle:'groove' , width:"95%" , display:(registro.fecha_bu === "2000-01-01T00:00:00") ? 'none' : '' }} onChange={(a)=>{ActualizarRegistro(a)}} type="date" name="fecha_bu" value={registro.fecha_bu === null ? null : registro.fecha_bu?.split('T')[0]}></Input></label>      
            <label hidden={x !== "Correccion" ? true : false  } style={{ marginLeft:"12px", display:'inline-block', width:'11%'}} for='bu'> LIBERADA POR PLANEACION 
                <select onChange={(a)=>{ActualizarRegistro(a)}}  id="liberada_por_planeacion" name="liberada_por_planeacion" style={{borderStyle:'groove', width:'100%' }} defaultValue={registro.liberada_por_planeacion} >
                        <option > </option> 
                        <option >ACEPTADA</option> 
                        <option >RECHAZADA</option> 
                  </select></label>
            <label hidden={x !== "Correccion" ? true : false  }   style={{marginLeft:"18px", display:'inline-block', width:'10%'}}  for='fecha_planeacion'> FECHA PLANEACION
              <br hidden={x !== "Correccion" ? true : false  } style={{display:(registro.fecha_planeacion === "2000-01-01T00:00:00") ? '' : 'none' }}></br>
              <input hidden={x !== "Correccion" ? true : false  } disabled style={{display:(registro.fecha_planeacion === "2000-01-01T00:00:00") ? '' : 'none' }} value="N/A" />

                <Input style={{borderStyle:'groove', width:"95%" , display:(registro.fecha_planeacion === "2000-01-01T00:00:00") ? 'none' : '' }} onChange={(a)=>{ActualizarRegistro(a)}} type="date" name="fecha_planeacion" value={registro.fecha_planeacion === null ? null : registro.fecha_planeacion?.split('T')[0]}></Input></label>      
            <label hidden={x !== "Correccion" ? true : false  }  style={{ marginLeft:"12px", display:'inline-block', width:'11%'}} for='bu'> LIBERADA POR AUDITORIA 
                <select onChange={(a)=>{ActualizarRegistro(a)}}  id="liberada_por_auditoria" name="liberada_por_auditoria" style={{borderStyle:'groove', width:'100%' }} defaultValue={registro.liberada_por_auditoria} >
                        <option > </option> 
                        <option >ACEPTADA</option> 
                        <option >RECHAZADA</option> 
                  </select></label>

            <label hidden={x !== "Correccion" ? true : false  }   style={{marginLeft:"18px", display:'inline-block', width:'10%'}}  for='fecha_auditoria'> FECHA AUDITORIA
              <br hidden={x !== "Correccion" ? true : false  } style={{display:(registro.fecha_auditoria === "2000-01-01T00:00:00") ? '' : 'none' }}></br>
              <input hidden={x !== "Correccion" ? true : false  } disabled style={{display:(registro.fecha_auditoria === "2000-01-01T00:00:00") ? '' : 'none' }} value="N/A" />

                <Input style={{borderStyle:'groove', width:"95%" , display:(registro.fecha_auditoria === "2000-01-01T00:00:00") ? 'none' : ''}} onChange={(a)=>{ActualizarRegistro(a)}} type="date" name="fecha_auditoria" value={registro.fecha_auditoria === null ? null : registro.fecha_auditoria?.split('T')[0]}></Input></label>      

            <label hidden={x !== "Correccion" ? true : false  }  style={{ marginLeft:"12px", display:'inline-block', width:'11%'}} for='bu'> LIBERADA POR SAP 
                <select onChange={(a)=>{ActualizarRegistro(a)}}  id="liberada_por_sap" name="liberada_por_sap" style={{borderStyle:'groove', width:'100%' }} defaultValue={registro.liberada_por_sap} >
                        <option > </option> 
                        <option >ACEPTADA</option> 
                        <option >RECHAZADA</option> 
                  </select></label>

            <label hidden={x !== "Correccion" ? true : false  }   style={{marginLeft:"18px", display:'inline-block', width:'10%'}}  for='fecha_sap'> FECHA SAP
              <br hidden={x !== "Correccion" ? true : false  } style={{display:(registro.fecha_sap=== "2000-01-01T00:00:00") ? '' : 'none' }}></br>
              <input hidden={x !== "Correccion" ? true : false  } disabled style={{display:(registro.fecha_sap=== "2000-01-01T00:00:00") ? '' : 'none' }} value="N/A" />

                <Input style={{borderStyle:'groove', width:"95%" , display:(registro.fecha_sap=== "2000-01-01T00:00:00") ? 'none' : ''}} onChange={(a)=>{ActualizarRegistro(a)}} type="date" name="fecha_sap" value={registro.fecha_sap === null ? null : registro.fecha_sap?.split('T')[0]}></Input></label>      

            <label hidden={x !== "Correccion" ? true : false  }   style={{marginLeft:"18px", display:'inline-block', width:'10%'}}  for='fecha_sap'> ACUSE
                <Input style={{borderStyle:'groove', width:"95%"}} onChange={(a)=>{ActualizarRegistro(a)}}  name="acuse" value={registro.acuse}></Input></label>      
          <p></p>
            </fieldset>
            <div>
            </div>
        </Stack>
        <p></p>
        </Stack>
      );
    }
  return (
    <Stack direction="row"  style={{marginLeft:"12px", marginTop: "30px", width: "100px" }} >
        <input  onChange={(i)=>{setsub(i.target.value)}} type="number" placeholder="Digite PO"  onKeyPress={handleKeyPress}></input>
        <button onClick={()=>{handleopen()}} className="buscar" style={{ padding:'5px', color:'white', backgroundColor:'green', borderRadius:"10%"}}> Aceptar </button>
    </Stack>
  );
}

export default NuevaPO;