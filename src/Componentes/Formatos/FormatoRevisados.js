import { Stack, Switch } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { BUs, familia, Orden_Etd_Cur, Revisados_Masivo, Revisados_Unica, tipos_modif ,other_items } from '../materialReutilizable/RangosReusables'
import { ContentCopy, CurtainsOutlined, Scale } from '@mui/icons-material'
import '../../Componentes/button.css'
import ClientesService from '../../service/ClientesService'

function FormatoRevisados() {
    const [leerfolio,setleerfolio]= useState([])
    const [foliorevisado,setfoliorevisado] = useState('');
    const [othersValidos,setothersValidos]= useState(false);
    const [aplicaSN,setaplicaSN] = useState('No');
    const [juntopo,setjuntopo] = useState('No');
    const [Arancel,setArancel]= useState([]);
    const [posMasivo,setposMasivo]= useState([]);
    const [verprecios,setverprecios] = useState(true)
    const [provsUnicos,setprovsUnicos]= useState('');
    const [itemsPO, setitemsPO] = useState(false);
    const [preciosPO, setpreciosPO] = useState(false);
    const [tablavisible, settablavisible] = useState('')
    const [clickcambio,setclickcambio]= useState(true);
    const [clickEA,setclickEA]= useState(true);
    const [clicksidocs, setclicksidocs] = useState(true);
    const [NoSolped,setNoSolped] = useState(true)    
    const [otro,setotro] = useState(true)    
    const [molde,setmolde] = useState(true)    
    const [filasTab, setfilasTab] = useState(2);
    const [filasinput, setfilasinput] = useState(1);
    const [proveedores, setproveedores ] = useState([]);
    const [contactos, setcontactos ] = useState([]);
    const [precios, setprecios ] = useState([]);
    const [registro, setregistro] = useState([]);
    const [registrotabla, setregistrotabla] = useState([]);
    const [aditem,setaditem] = useState(false);
    const [datosTpPm, setdatosTpPm] = useState([]);
    const [titulosColor,settitulosColor] = useState({Precio:false , Cantidad:false , monto:false , solped:false , um:false , descripcion:false , etd:false  ,termPago:false })
    useEffect(()=>{
        ClientesService.getproveedoresall().then((response)=>{
            setproveedores(response.data)
        }).catch((err)=>{
            console.log(err)
        })
        ClientesService.getcontactosall().then((response)=>{
            setcontactos(response.data)
        }).catch((err)=>{
            console.log(err)
        })
        ClientesService.getPreciosAll().then((response)=>{
            setprecios(response.data)
        }).catch((err)=>{
            console.log(err)
        })
    ClientesService.getArancel().then((response)=>{
          setArancel(response.data || []);
        }).catch((error)=> console.error("Error:",error));

    },[])
    const tablaC = (e) =>{
                settablavisible(e.target.value)
    setregistro((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    setleerfolio({[e.target.id]: e.target.value })
    };
    const tipoM = (e)=>{
            if (e.target.id ==="Solped"){
                    setNoSolped(e.target.checked ? false : true)
                settitulosColor((prev) => ({...prev,
                solped: e.target.checked   
            }))
            }  else if (e.target.id === "Adición item / other item"){
                setaditem(e.target.checked ? true : false)
                settitulosColor((prev) => ({...prev,
             Cantidad:e.target.checked ,Precio: e.target.checked , monto: e.target.checked, descripcion: e.target.checked , um: e.target.checked , etd: e.target.checked , solped: e.target.checked   
            }))
            }  else if (e.target.id === "Otro"){
                setotro(e.target.checked ? false : true)
            }else if (e.target.id === "Molde recuperable"){
                setmolde(e.target.checked ? false : true)
            }
            else if (e.target.id === "Precio" || e.target.id === "Cantidad"){ 
                settitulosColor((prev) => ({...prev,
            [e.target.id]: e.target.checked 
            }))
            }else if (e.target.id === "Adición de línea" ){ 
                settitulosColor((prev) => ({...prev,
             etd: e.target.checked    
            }))            
            }else if (e.target.id === "Término de pago" ){ 
                const proveedorOk = proveedores?.find(p => p.noProveedor === Number(registro.proveedor.substring(0, 6)));
                setregistro((prev) => ({ ...prev, terminos_de_pago: proveedorOk?.terminos_de_pago, clvterm: proveedorOk?.c_pag }));
                settitulosColor((prev) => ({...prev,
                    termPago: e.target.checked    
                    }))            
                    };
setregistro(prev => {
  const objetoActual = JSON.parse(prev.tipo_modificacion || '{}');
  const objetoActualizado = {...objetoActual, [e.target.id]: e.target.checked };
  return { ...prev, tipo_modificacion: JSON.stringify(objetoActualizado)};});   
 };
    const fechahoy = new Date()
    const fechaFormateada = fechahoy.toISOString().split('T')[0];
    const cambiofila = async (e , indicefila ) => {
            const textoIn = e.target.id
                let palabrasIn = textoIn.split(" ");    
                let primeraIn = palabrasIn[0]; 
                let filaIn = Number(textoIn.split(" ").slice(1).join(" ")); 
                     setregistrotabla(prev => ({...prev, [filaIn]: { ...prev[filaIn], [e.target.dataset.columna]: e.target.innerText }}));      
     if (!(e.target.id).includes("m0")) {   
        const guiones = ["-"].some(prefijo => e?.target?.value?.includes(prefijo));  // funciona para fechas etd
      if (indicefila !== undefined && guiones === false ){
            setdatosTpPm(prev => ({...prev, [indicefila]: { ...prev[indicefila], um: e.target.value }}));      
            setregistrotabla(prev => ({...prev, [indicefila]: { ...prev[indicefila], um: e.target.value }}));      
        } else if (indicefila !== undefined && guiones === true ){
            setdatosTpPm(prev => ({...prev, [indicefila]: { ...prev[indicefila], ETD: e.target.value }}));      
            setregistrotabla(prev => ({...prev, [indicefila]: { ...prev[indicefila], ETD: e.target.value }}));      
        } 
      }  
        const coincide = ["u0", "m2"].some(prefijo => e?.target?.id?.startsWith(prefijo));
            const texto = e.target.id
                let palabras = texto.split(" ");    
                let primera = palabras[0]; 
                let fila = Number(texto.split(" ").slice(1).join(" ")); 
        if (coincide && (e.target.innerText).length >= 4 && fila >= 0 ){
            if (["2931","2932","2933","2934","2935","2936","2937","2938","2939","2940","2941"].includes(e.target.innerText) && aditem ){
                        setitemsPO(true)
                         setothersValidos(["2937","2931"].includes(e.target.innerText) ? true: false);
                         let clavevalue = other_items[e.target.innerText]?.clave
                         let tipovalue = other_items[e.target.innerText]?.tipo
                         let valorvalue = other_items[e.target.innerText]?.valor
                       setdatosTpPm(prev => ({ ...prev, [fila]: { material: Number(e.target.innerText), clave: clavevalue, 
                        cantidadnueva: "ingrese Cantidad", precio: "ingrese precio", 
                descripcion: e.target.innerText === "2937" ? "Trabajos de ingeniería, diseño y evaluación" : "" , tipo: tipovalue , valor:valorvalue}
}));
                }else if (["2931","2932","2933","2934","2935","2936","2937","2938","2939","2940","2941"].includes(e.target.innerText) && aditem === false ){
                    alert("Para Ingresar un Other Item, active la casilla Adición item / other item")
                    e.target.innerText  = "";
                }else if (!["2931","2932","2933","2934","2935","2936","2937","2938","2939","2940","2941"].includes(e.target.innerText) ){
                    alert("Other Item NO valido, favor de validar")
                    e.target.innerText  = "";
                }
        }else if ((e.target.id).includes("m0") && (e.target.innerText).includes("\n")) {
            
                let variasPOs = e.target.innerText 
                const var2 = variasPOs.split("\n");
                    setfilasTab(var2.length)
                      setposMasivo(prev => ({...prev,...var2}))
                const POsUnicas = [...new Set(var2)];
                try {
                        const respuestas = await Promise.all(
                        POsUnicas.map(item => ClientesService.getTpPm(item))
                );
                        const datos = respuestas.flatMap(r => r.data);
                        setdatosTpPm(prev => ({...prev, ...datos }));
                        setregistro(prev => ({...prev, proveedor: datos[0].proveedor}));
                } catch (error) {
                        console.log(error);
        }} else if ((e.target.id).includes("m0") && e.target.id !== "mo 0" ) {
                  let variasPOs = e.target.innerText 
                 const var2 = e.target.innerText;
                     setfilasTab(filasTab)
                     setposMasivo(prev => ({...prev, [Object.keys(prev).length]: var2}))
                         const POsUnicas = var2;
                        try {
                        const datos = await ClientesService.getTpPm(POsUnicas);
                            const index = Object.keys(datosTpPm).length;
                            setregistrotabla(prev => ({ ...prev, ...datos.data[0]}));
                        } catch (error) {
                            console.log(error);
            }}else if (((e.target.id).includes("u4") || (e.target.id).includes("u5")  || (e.target.id).includes("m9") || (e.target.id).includes("m7")) && (datosTpPm[fila]?.material).toString().length === 4 ) {   
                setdatosTpPm(prev => { const cantidad = e.target.dataset.columna === "CANTIDAD NUEVA" ? Number(e.target.innerText) :
                     prev[fila]?.cantidadnueva, precio = e.target.dataset.columna === "PRECIO UNITARIO" ? Number(e.target.innerText) : 
                     prev[fila]?.precio;
                    return { ...prev, [fila]: { ...prev[fila], cantidadnueva: cantidad, precio: precio, precioparcel: precio,
                montototal: cantidad * precio, montoparcel: cantidad * precio } };
                });
            } 

            setregistro(prev => {
  const objetoActual = JSON.parse(prev.contenido_tabla || '{}');
  const objetoActualizado = { ...objetoActual, datosTpPm };
  return { ...prev, contenido_tabla: JSON.stringify(objetoActualizado)
  };
});

        }
    const añadirfila = (e) =>{
        if (e.target.innerText === "+"){
        setfilasTab(Number(filasTab) + Number(filasinput))
        }else if (e.target.innerText === "-") {
        setfilasTab(Number(filasTab) - Number(filasinput) <= 0 ? 1 : Number(filasTab) - Number(filasinput))
    }};
    const resultado =  (e) =>{
        if (e.target.id === "bu"){
        const res = contactos.find(
        item => item.unidaddeNegocio === e.target.value
        );
        setregistro((prev) => ({ ...prev, responsable: res?.gerenteBU , unidad_de_negocio : res?.unidaddeNegocio  }));
    }else{
        if (e.target.id === "cuentadocs" && e.target.value === "si"  ) {
            setclicksidocs(false)
        }else if (e.target.id === "cuentadocs" && e.target.value === "no"){  
            setclicksidocs(true)
        }
        if (e.target.value === "ea"){
            setclickEA(e.target.checked ? false : true)
        }else if (e.target.value === "revisado" || e.target.value === "reimpresion" ){
            setclickEA(e.target.checked ? true : true)
        }
        setclickcambio(e.target.checked ? false : true);
        setregistro((prev) => ({ ...prev, [e.target.id]: e.target.value }))
            setleerfolio({[e.target.id]: e.target.value });

    }
}
const getordenTP = (e)=>{
    const medida = (e.target.value).length
        if (medida === 7) {
              ClientesService.getTpPm(e.target.value).then((response)=>{
                setdatosTpPm(response.data);
                setregistro((prev) => ({ ...prev, proveedor:response.data[0].proveedor}))
            }).catch((error)=>{
                console.log(error)
              })}
}
const solpedfunc = (e) =>{
    if (e.target.id === 'solped'){  
    setregistro((prev) => ({ ...prev, nosolped: e.target.value }))
}else if (e.target.id === 'molde'){
    setregistro((prev) => ({ ...prev, molde: e.target.value }))
}else if (e.target.id === 'motivo'){
    setregistro((prev) => ({ ...prev, motivo: e.target.value }))
}
}
const cambioSwith = (e)=>{
    if (e.target.id === "itemP"){
        if (e.target.checked === true) {
            setfilasTab(datosTpPm.length)
            setregistrotabla((prev) => ({ ...prev, ...datosTpPm}))
        }
        setitemsPO(itemsPO ? false : true)
    }else if (e.target.id === "preciosP"){
        setverprecios(e.target.checked ? false : true)
        setpreciosPO(preciosPO ? false : true)
    }
}

const clavesunicas = [...new Set(proveedores?.map(p => p.c_pag))];
const nuevotermPago = (e) =>{
    const nterm = proveedores?.find(p => p.c_pag === e.target.value)?.terminos_de_pago;
    setregistro((prev) => ({ ...prev,  nvotermpago: nterm  }));
 }
 const AplicaPOs = (e)=>{
    if(e.target.id ==="juntopo"){
        setjuntopo(e.target.value)
    }else {
    setaplicaSN(e.target.value)
 }
 }
const Cancelar =()=>{
    setregistro([]);
    setdatosTpPm([]);
    setfilasTab([]);
}

const guardaRegistro = ()=>{
    ClientesService.postFormatoRevisados(registro).then((response)=>{
        const id = String(response.data.id).padStart(3, '0');
        alert("Registro guardado " +  "FOLIO REV-" +   id)
        window.location.href = ClientesService.linkInicio;

    }).catch((err)=>{
        console.log(err)
    })
}
const buscarFolio = ()=>{
        const id = Number(foliorevisado);
        ClientesService.getFormatoRevisados(id).then((response)=>{
            setleerfolio(response.data)
        }).catch((error)=>{
            console.log(error)
        })
    }

return (
    <div style={{width:tablavisible === 'unica' ? '100%' : '110%' }} >
        <Stack direction='row' alignItems='end' spacing={2} sx={{padding:'1%',marginLeft:'70%' }}>
            <span className="input-group-text bg-white border-secondary-subtle fw-bold text-muted small">Folio: REV-
            <input onChange={(e)=>{setfoliorevisado(e.target.value)}} type="number" id="miInput" style={{width:'50px'}} className="form-control form-control-sm text-center border-secondary-subtle fw-bold text-uppercase" />
            </span>
            <button onClick={()=>{buscarFolio()}} className="btn btn-primary btn-sm fw-bold px-4" style={{height:'40px'}}>Buscar</button>
        </Stack>
        <section style={{padding:'.5%', border:'solid #dfdfdf 1px'}}>
            <h5 className="fw-bold" style={{ color: '#F29111' , textAlign:'center' }}>SOLICITUD PARA MODIFICACIÓN / CANCELACIÓN TOTAL Y/O PARCIAL EN ÓRDENES DE COMPRA</h5>
            <section style={{alignItems:'center',display:'flex' , gap: '1rem' , border:'sold #EAEAEA 1px'}}>
                <label style={{width:'75px' , textWrap:'pretty'}}>Unidad de Negocio</label>
                <select onChange={(e)=>{resultado(e)}} id='bu' className='form-select' style={{width:'15%'}} value={leerfolio?.unidad_de_negocio}>
                    <option>Seleccione</option>
                        {BUs.map((item) => (
                        <option key={item} value={item}>
                        {item}
                        </option>))}
                </select>
                <label style={{width:'75px' , textWrap:'pretty'}}>Responsable </label>
                <input value={registro.responsable === undefined ? leerfolio?.responsable : registro.responsable || [] } disabled/>
                <label style={{width:'75px' , textWrap:'pretty'}}>Fecha </label>
                <input disabled style={{backgroundColor:'#f8f8f8'}} type='date' value={fechaFormateada} />
                <label style={{width:'75px' , textWrap:'pretty' , marginLeft:'10%'}}>FOLIO</label>
                <input value={(leerfolio === [] || leerfolio.id === undefined )? "" : "REV-" + String(leerfolio.id).padStart(3, '0')} disabled />
            </section> 
            <section style={{padding:'20px', alignItems:'center',display:'flex' , gap:'1rem' ,border:'solid #d1cece 1px ' }}>
                <input style={{marginLeft:'90px' , transform: 'scale(1.3)'}} onClick={(e)=>{ resultado(e)}} type='radio' id="tipoRev" name="cambio" value="modificacion" checked={leerfolio?.tipoRev === "modificacion" } />
                <label for="modificacion">Modificación</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type='radio' id="tipoRev" name="cambio" value="canceltot" checked={leerfolio?.tipoRev === "canceltot" } />
                <label for="canceltot">Cancelación total</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type='radio' id="tipoRev" name="cambio" value="cancelparc" checked={leerfolio?.tipoRev === "cancelparc" } />
                <label for="cancelparc">Cancelación parcial (No hay PI)</label>
            </section>
            <section hidden={(clickcambio && leerfolio.id === undefined) ? true : false } style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ' }}>
                <input style={{marginLeft:'90px' , transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type='radio' id="clasir" name="subcambio" value="ea"  checked={leerfolio?.clasir === "ea" } />
                <label for="ea">EA</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type='radio' id="clasir" name="subcambio" value="revisado"  checked={leerfolio?.clasir === "revisado" } />
                <label for="revisado">REVISADO</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type='radio' id="clasir" name="subcambio" value="reimpresion"  checked={leerfolio?.clasir === "reimpresion" } />
                <label for="reimpresion">REIMPRESION(No hay PI)</label>
              </section>
            <section hidden={clickEA} style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ' }}>
                <label style={{marginLeft:'6%'}}><b>¿Cuenta con Documentos?</b></label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}}  type='radio' id="cuentadocs" name="sino" value="si" />
                <label for="revisado">Sí</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type='radio' id="cuentadocs" name="sino" value="no" />
                <label for="reimpresion">No</label>
                <label hidden={clicksidocs} style={{color:'red'}}><b>Agregar confirmación de revocación de documentos</b></label>
            </section>
            <section  style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ' }}>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}}  onClick={(e)=>{tablaC(e)}}  type='radio' id="tipotabla" name="tipotabla" value="unica"   checked={leerfolio?.tipotabla === "unica"  }/>
                <label for="unica">Única</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}}  onClick={(e)=>{tablaC(e)}} type='radio' id="tipotabla" name="tipotabla" value="masivo"   checked={leerfolio?.tipotabla === "masivo" } />
                <label for="masivo">Masivo</label>
                <div  style={{padding:'1%' , marginLeft:'2%' ,display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' ,textAlign:'center' , maxWidth:'60%'  }}>
                    {Orden_Etd_Cur.map((item) => (
                    <label key={item} value={item} style={{color:'#4d73da', fontWeight:'bold'}} hidden={tablavisible === 'unica'  ? false : ( item.includes("Moneda") && tablavisible === 'masivo' )  ? false : true } > 
                    {item}<br></br><input onChange={(e)=>{getordenTP(e)}} readOnly={item.includes("PO PM") ? false : true } 
                         value={item === "PO TT" ? datosTpPm[0]?.poth : item === "Moneda" ? datosTpPm[0]?.moneda : 
                            item === "PO PM/TS" ? datosTpPm[0]?.po : item === "ETD" ? datosTpPm[0]?.etd : ''
                          } 
                        id={item === "etd" ? '' : item.includes("PO") ? 'miInput' : '{item}'} 
                        style={{ textAlign:'center' , width:item === "ETD" ? '' : item.includes("PO") ? '120px' : '70px'}} 
                        type={item === "ETD" ? 'date' : item.includes("PO") ? 'number' : 'text'}/>
                    </label>))}
                    <label hidden={tablavisible === 'unica'  ? false :false} style={{borderBottom:'solid 1px black', padding:'5%',width:'250%'}}> Proveedor:  {datosTpPm[0]?.proveedor}</label>
                </div>                
            </section>
            <div hidden={tablavisible === '' ? true : false} style={{marginTop:'1%', alignItems:'center' , border:'solid #d1cece 1px ' }}>
               <label style={{marginTop:'10px', marginLeft:'10px'}}>Tipo de modificación</label>
            <Stack direction='row' >
                <div  style={{padding:'1%' , marginLeft:'1%' ,display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap:'10px', textAlign:'left' , minWidth:'70%'  }}>
                            {tipos_modif.map((item) => (
                            <label key={item} value={item}>  <input type='checkbox' onClick={(e)=>{tipoM(e)}} key={item} id={item} defaultChecked={titulosColor === item}/ >&nbsp;&nbsp;
                            {item}
                            </label>))}
                </div>
                <Stack hidden={NoSolped} direction='row' style={{padding:'1%',marginLeft:'-10%',maxWidth:'60%'}}>
                    <span >No. Solped</span>&nbsp;
                    <input onChange={(e)=>{solpedfunc(e)}} id='solped' value={registro.solpedval} style={{maxHeight:'50%' ,border:'none', borderBottom:'1px solid black'}} type='text' />
                </Stack>
            </Stack>
<Stack direction='row' justifyContent={molde && otro ? 'flex-end' : 'center'} sx={{width:'80%'}}>  
        <Stack hidden={molde} direction='row' style={{padding:'1%',marginLeft:'15%',maxWidth:'80%'}}>
            <span >Molde PO PM/TS:</span>&nbsp;
            <input onChange={(e)=>{solpedfunc(e)}} value={registro.moldeval} id='molde' style={{border:'none', borderBottom:'1px solid black'}} type='text' />
        </Stack>
        <Stack hidden={otro} direction='row' style={{padding:'1%',marginLeft:'12%',maxWidth:'80%'}}>
            <span >Motivo...</span>&nbsp;
            <input onChange={(e)=>{solpedfunc(e)}} style={{border:'none', borderBottom:'1px solid black'}} type='text' id='motivo' />
        </Stack>        
</Stack>
    </div>
        </section>
    <section style={{padding:'.5%', border:'solid #dfdfdf 1px'}}>
<Stack style={{display:titulosColor.termPago ? '':'none' }} direction='row' spacing={8}>
    <Stack sx={{ display: "inline-flex", alignItems: "stretch" }} >
        <Stack direction="row">
            <input value={registro?.clvterm} style={{maxWidth:'25%'}} disabled />
            <input value={registro?.terminos_de_pago} style={{minWidth:'75%'}} disabled />
        </Stack>
        <label style={{ borderTop: "1px solid black", textAlign: "center", paddingTop: "4px" }} >
    Término de pago actual
        </label>
    </Stack>
    <Stack sx={{alignItems:'center'}} style={{minWidth:'450px',display:( tablavisible === "masivo" )? '' :'none' }}>
        <label>¿Aplica para todas las Pos?</label>
        <div style={{alignItems:'center',display:'flex' , gap: '1rem'}}>
            <label>Si</label><input onClick={(e)=>{AplicaPOs(e)}} style={{transform: 'scale(1.3)'}} type='radio' id="aplicaAllPOs" value='Si' name='si_no'/>
            <label>No</label><input onClick={(e)=>{AplicaPOs(e)}} style={{ transform: 'scale(1.3)'}} type='radio' id="aplicaAllPOs" value='No' name='si_no'/>
        </div>
        <div style={{display:aplicaSN === "Si" ?'':'none' ,marginTop:'3%', alignItems:'center' , gap: '1rem'}}>
            <label>Indicar POs</label>
            <input type='text' style={{border:'none',borderBottom:'1px solid black'}} />
        </div>
        
    </Stack>
    <Stack sx={{ display: "inline-flex", alignItems: "stretch" }} >
        <Stack direction="row">
            <select onChange={(e)=>{nuevotermPago(e)}} >
                <option> Select </option>
                 {clavesunicas.map((item) => (
                    <option key={item} value={item}>
                {item}
                </option>))} 
            </select>
            <input style={{minWidth:'100px'}} value={registro.nuevotermpago} size={registro.nuevotermpago?.length || 1}  />
        </Stack>
        <label style={{ borderTop: "1px solid black", textAlign: "center", paddingTop: "4px" }} >
    Término de pago nuevo
        </label>
    </Stack>
</Stack>
        <Stack sx={{alignItems:'center'}} style={{minWidth:'300px',display:othersValidos ? '' :'none'  }}>
                <div style={{border:'dotted 1px red'}}>
                <label>Pago Junto con PO</label>
                <div style={{alignItems:'center',display:'flex' , gap: '1rem'}}>
                    <label>Si</label><input onClick={(e)=>{AplicaPOs(e)}} style={{transform: 'scale(1.3)'}} type='radio' id="juntopo" value='Si' name='si_jpo'/>
                    <label>No</label><input onClick={(e)=>{AplicaPOs(e)}} style={{ transform: 'scale(1.3)'}} type='radio' id="juntopo" value='No' name='si_jpo'/>
                </div>
                </div>
                <div style={{display:juntopo === "Si" ?'':'none' ,marginTop:'3%', alignItems:'center' , gap: '1rem'}}>
                    <label style={{color:'red', fontWeight:'bold',display:juntopo === "Si" ?'':'none'}}>Indicar nuevo término de pago (marcar casilla)</label>
                </div>
            </Stack>
    <div  hidden={(tablavisible === "unica" ? false : true )} style={{marginTop:'2%' , Width:'80%' , border:'solid #d1cece 1px' , borderRadius:'10px'}}> 
            <div >
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-danger btn-sm fw-bold px-2 py-0" >-</button>
                    <input  onChange={(e) => {setfilasinput(e.target.value)}} id='miInput' type='number'  defaultValue={filasinput} style={{fontWeight:'bold'  ,textAlign:'center',fontSize:'12px', marginLeft:'1%',width:'3%'}}/ >
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-success btn-sm fw-bold px-2 py-0" >+</button>             
             <label style={{marginLeft:'5%',fontWeight:itemsPO ? '': 'bold'}}>Items Manual</label>
                <Switch id="itemP" onChange={(e)=>{cambioSwith(e)}}  color='warning' />
             <label style={{fontWeight:itemsPO ? 'bold': ''}}>Items Automatico</label>
             <label style={{marginLeft:'5%',fontWeight:preciosPO ? '': 'bold'}}>Precio Manual</label>
                <Switch id="preciosP" onChange={(e)=>{cambioSwith(e)}}  color='success' />
             <label style={{ fontWeight:preciosPO ? 'bold': ''}}>Precio Automatico</label>
                <button className='btn btn-link' style={{marginLeft:'7%' , backgroundColor:'#e7e7e7' ,border:'1px gray dotted'}}>Ver tabla Parcelmobi</button>

            </div>
            <div style={{display:titulosColor.Cantidad ? '':'none' , color:'red', marginLeft:'5%' , height:'45px'}}>Para ajustes de cantidad únicamente considerar líneas que indiquen información en el campo "Cantidad Nueva"</div>
            <table className='table'>
                <thead className='thead-dark' style={{textAlign:'center'}} >
                <tr>
                    {Revisados_Unica.map((item) => 
                        <th key={item} id={item} 
                        style={{ fontSize:'small'  ,display:item === "UM" && aditem === false ? 'none' :'' , 
                     backgroundColor:((item.includes("PRECIO") && titulosColor.Precio) || (item.includes("CANTIDAD") && titulosColor.Cantidad) ||
                    (item.includes("MONTO") && titulosColor.monto) || (item.includes("DESCRIPCIÓN") && titulosColor.descripcion) ||
                    (item.includes("UM") && titulosColor.um) || (item.includes("ETD") && titulosColor.etd || (item.includes("SOLPED") && titulosColor.solped))) ? "#FBE2D5" : ''}}   
                    >{item}</th>
                    )} 
                </tr>      
                 </thead>  
                    <tbody onBlur={(e)=>{cambiofila(e)}}>
                        {Array.from({ length: filasTab }).map((_, indexFila) => (
                            <tr key={indexFila} style={{  backgroundColor: 'gray', }} >
                            {Revisados_Unica.map((item, indexItem) => (
                                <td key={'u'+ indexItem} id={'u'+ indexItem + " " + indexFila} data-columna={item} 
                                contentEditable='true' style={{width:'100px',textAlign:'center', border:'dotted black 1px' , borderRadius:'6px', display:item === "UM" && aditem === false ? 'none' :''}}>
                                {item === "ETD" ? <input id={'u'+ indexItem + " " + indexFila} onChange={(e)=>{cambiofila(e, indexFila)}} type="date" /> : (item === "ITEM" && itemsPO === true) ? datosTpPm[indexFila]?.material : 
                                 (item === "CLAVE" && itemsPO === true) ? datosTpPm[indexFila]?.clave : (item === "POSICIÓN" && itemsPO === true) ? datosTpPm[indexFila]?.posicion : 
                                  (itemsPO && item === "CANTIDAD ACTUAL" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.cantidad : 
                                  (item === "PRECIO UNITARIO" && verprecios === false) ? `$${(datosTpPm[indexFila]?.precio ?? 0).toFixed(2)}` : 
                                  (itemsPO && item === "CANTIDAD NUEVA" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.cantidadnueva :
                                  (itemsPO && item === "MONTO TOTAL" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.montototal :
                                  (itemsPO && item === "MONTO TOTAL PARCELMOBI" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.montoparcel :
                                  (itemsPO && item === "PRECIO UNITARIO" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.precio : 
                                  (itemsPO && item === "PRECIO PARCELMOBI" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.precioparcel : 
                                  (itemsPO && item === "DESCRIPCIÓN (other item)" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.descripcion : 
                                  (itemsPO && item === "UM" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.tipo === "string" ? datosTpPm[indexFila]?.valor : 
                                  datosTpPm[indexFila]?.tipo === "lista" ? <select onChange={(e)=>{cambiofila(e, indexFila)}}> <option>seleccione</option>{(datosTpPm[indexFila]?.valor).map((item => (<option key={item} id={'u'+ item }>{item}</option> )))}</select> : null : null  }
                                </td> 
                            ))}
                            </tr>
                        ))}
                    </tbody>            
            </table>
        </div>
    <div  hidden={(tablavisible === "masivo" ? false : true )} style={{marginTop:'2%' , Width:'80%' , border:'solid #d1cece 1px' , borderRadius:'10px'}}> 
            <div >
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-danger btn-sm fw-bold px-2 py-0" >-</button>
                    <input  onChange={(e) => {setfilasinput(e.target.value)}} id='miInput' type='number'  defaultValue={filasinput} style={{fontWeight:'bold'  ,textAlign:'center',fontSize:'12px', marginLeft:'1%',width:'3%'}}/ >
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-success btn-sm fw-bold px-2 py-0" >+</button>

             <label style={{marginLeft:'30%',fontWeight:preciosPO ? '': 'bold'}}>Precio Manual</label>
                <Switch id="preciosP" onChange={(e)=>{cambioSwith(e)}}  color= 'success' />
             <label style={{ fontWeight:preciosPO ? 'bold': ''}}>Precio Automatico</label>
                <button className='btn btn-light' style={{marginLeft:'7%'}}>Ver tabla Parcelmobi</button>
            </div>
            <table className='table'>
                <thead className='thead-dark' style={{textAlign:'center'}} >
                <tr>
                    {Revisados_Masivo.map((item) => 
                        <th key={item} id={item} style={{display:item === "UM" && aditem === false ? 'none' : (item.includes("SOLPED") && titulosColor.solped === false) ? 'none' : '',
                             backgroundColor:((item.includes("PRECIO") && titulosColor.Precio) || (item.includes("CANTIDAD") && titulosColor.Cantidad) ||
                    (item.includes("MONTO") && titulosColor.monto) || (item.includes("DESCRIPCIÓN") && titulosColor.descripcion) ||
                    (item.includes("UM") && titulosColor.um) || (item.includes("ETD") && titulosColor.etd || (item.includes("SOLPED") && titulosColor.solped))) ? "#FBE2D5" : ''}}>{item}</th>
                    )} 
                </tr>      
                 </thead>  
                    <tbody onBlur={(e)=>{cambiofila(e)}} >
                        {Array.from({ length: filasTab }).map((_, indexFila) => (
                            <tr key={indexFila} style={{ borderBlock: '1px solid #d1cece', backgroundColor: 'gray', textAlign:'center'}} >
                            {Revisados_Masivo.map((item, indexItem) => (
                                <td key={'m'+indexItem} id={'m'+ indexItem + " " + indexFila}  data-columna={item}
                                contentEditable='true' style={{fontSize:item === "CLAVE" ? '13px': '15px' ,width:item === "CLAVE" ? '250px': '' ,display:item === "UM" && aditem === false ? 'none' :''}}>
                                {item === "ETD" ? <input id={'m'+ indexItem + " " + indexFila} type="date" /> : item === "PO PM/TS" ? posMasivo[indexFila] 
                                : item === "PO TT" ? datosTpPm[indexFila]?.poth : item === "ITEM" ? datosTpPm[indexFila]?.material 
                                : item === "CLAVE" ? datosTpPm[indexFila]?.clave : item === "POSICIÓN" ? datosTpPm[indexFila]?.posicion 
                                : ( item === "CANTIDAD ACTUAL" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.cantidad : 
                                item === "PRECIO UNITARIO" && verprecios === false ? `$${(datosTpPm[indexFila]?.precio ?? 0).toFixed(2)}` : (itemsPO && item === "CANTIDAD NUEVA" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.cantidadnueva :
                                (itemsPO && item === "MONTO TOTAL" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.montototal :
                                (itemsPO && item === "MONTO TOTAL PARCELMOBI" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.montoparcel :
                                (itemsPO && item === "PRECIO UNITARIO" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.precio : 
                                (itemsPO && item === "PRECIO PARCELMOBI" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.precioparcel : 
                                (itemsPO && item === "DESCRIPCIÓN (other item)" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.descripcion : 
                                (itemsPO && item === "UM" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.tipo === "string" ? datosTpPm[indexFila]?.valor : 
                                datosTpPm[indexFila]?.tipo === "lista" ? <select onChange={(e)=>{cambiofila(e, indexFila)}}> <option>seleccione</option>{(datosTpPm[indexFila]?.valor).map((item => (<option key={item} id={'u'+ item }>{item}</option> )))}</select> : null : null  
                                }
                                </td>
                            ))}
                            </tr>
                        ))}
                    </tbody>            
            </table>
        </div>
       </section> 
        <Stack  marginLeft='40%' direction='row' spacing={2}>
            <button onClick={()=>{guardaRegistro()}} className='btn btn-success'>Guardar</button>
            <button onClick={()=>{Cancelar()}} className='btn btn-danger'>Cancelar</button>
        </Stack>
        <br></br>
    </div>
  )
}

export default FormatoRevisados