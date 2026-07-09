import { Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { BUs, familia, Orden_Etd_Cur, Revisados_Masivo, Revisados_Unica, tipos_modif } from '../materialReutilizable/RangosReusables'
import { ContentCopy, Scale } from '@mui/icons-material'
import '../../Componentes/button.css'
import ClientesService from '../../service/ClientesService'

function FormatoRevisados() {
    const [tablavisible, settablavisible] = useState('')
    const [clickcambio,setclickcambio]= useState(true);
    const [clickEA,setclickEA]= useState(true);
    const [clicksidocs, setclicksidocs] = useState(true);
    const [tabla, settabla] = useState({visible:true , tipotabla:''});
    const [NoSolped,setNoSolped] = useState(true)    
    const [filasTab, setfilasTab] = useState(2);
    const [filasinput, setfilasinput] = useState(1);
    const [proveedores, setproveedores ] = useState([]);
    const [contactos, setcontactos ] = useState([]);
    const [precios, setprecios ] = useState([]);
    const [registro, setregistro] = useState([]);
    const [aditem,setaditem] = useState(false);

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
    },[])

    const tablaC = (e) =>{
                settabla({visible:false , tipotabla:e.target.value})
                settablavisible(e.target.value)
    setregistro((prev) => ({
            ...prev,
            [e.target.id]: e.target.value
        }))
    };
    const tipoM = (e)=>{
            if (e.target.value ==="Solped"){
                    setNoSolped(e.target.checked ? false : true)
            }  else if (e.target.value === "Adición item / other item"){
                setaditem(e.target.checked ? true : false)
            }
    };

    const fechahoy = new Date()
    const fechaFormateada = fechahoy.toISOString().split('T')[0];

    const cambiofila = (e) =>{
        console.log(e.target.id)
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
        setregistro((prev) => ({
            ...prev,
            responsable: res.gerenteBU , unidad_de_negocio : res.unidaddeNegocio 
            
        }));
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
        setregistro((prev) => ({
            ...prev,
            [e.target.id]: e.target.value
        }))
    }
}
{console.log(registro)}
return (
    <div >
        <Stack direction='row' alignItems='end' spacing={2} sx={{padding:'1%',marginLeft:'70%' }}>
            <span className="input-group-text bg-white border-secondary-subtle fw-bold text-muted small">Folio:
            <input type="text" id="folioBusqueda" className="form-control form-control-sm text-center border-secondary-subtle fw-bold text-uppercase" />
            </span>
            <button className="btn btn-primary btn-sm fw-bold px-4" style={{height:'40px'}}>Buscar</button>
        </Stack>
        <section style={{padding:'.5%', border:'solid #dfdfdf 1px'}}>
            <h5 className="fw-bold" style={{ color: '#F29111' , textAlign:'center' }}>SOLICITUD PARA MODIFICACIÓN / CANCELACIÓN TOTAL Y/O PARCIAL EN ÓRDENES DE COMPRA</h5>
            <section style={{alignItems:'center',display:'flex' , gap: '1rem' , border:'sold #EAEAEA 1px'}}>
                <label style={{width:'75px' , textWrap:'pretty'}}>Unidad de Negocio</label>
                <select onChange={(e)=>{resultado(e)}} id='bu' className='form-select' style={{width:'15%'}}>
                    <option>Seleccione</option>
                        {BUs.map((item) => (
                        <option key={item} value={item}>
                        {item}
                        </option>))}
                </select>
                <label style={{width:'75px' , textWrap:'pretty'}}>Responsable </label>
                <input value={registro.responsable || []} disabled/>
                <label style={{width:'75px' , textWrap:'pretty'}}>Fecha </label>
                <input disabled style={{backgroundColor:'#f8f8f8'}} type='date' value={fechaFormateada} />
                <label style={{width:'75px' , textWrap:'pretty' , marginLeft:'10%'}}>FOLIO</label>
                <input disabled />
            </section> 
            <section style={{padding:'20px', alignItems:'center',display:'flex' , gap:'1rem' ,border:'solid #d1cece 1px ' }}>
                <input style={{marginLeft:'90px' , transform: 'scale(1.3)'}} onClick={(e)=>{ resultado(e)}} type="radio" id="tipoRev" name="cambio" value="modificacion" />
                <label for="modificacion">Modificación</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type="radio" id="tipoRev" name="cambio" value="canceltot" />
                <label for="canceltot">Cancelación total</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type="radio" id="tipoRev" name="cambio" value="cancelparc" />
                <label for="cancelparc">Cancelación parcial (No hay PI)</label>
            </section>
            <section hidden={clickcambio} style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ' }}>
                <input style={{marginLeft:'90px' , transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type="radio" id="clasir" name="subcambio" value="ea" />
                <label for="ea">EA</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type="radio" id="clasir" name="subcambio" value="revisado" />
                <label for="revisado">REVISADO</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type="radio" id="clasir" name="subcambio" value="reimpresion" />
                <label for="reimpresion">REIMPRESION(No hay PI)</label>
              </section>
            <section hidden={clickEA} style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ' }}>
                <label style={{marginLeft:'6%'}}><b>¿Cuenta con Documentos?</b></label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}}  type="radio" id="cuentadocs" name="sino" value="si" />
                <label for="revisado">Sí</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onClick={(e)=>{resultado(e)}} type="radio" id="cuentadocs" name="sino" value="no" />
                <label for="reimpresion">No</label>
                <label hidden={clicksidocs} style={{color:'red'}}><b>Agregar confirmación de revocación de documentos</b></label>
            </section>
            <section  style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ' }}>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}}  onClick={(e)=>{tablaC(e)}}  type="radio" id="tipotabla" name="tipotabla" value="unica" />
                <label for="unica">Única</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}}  onClick={(e)=>{tablaC(e)}} type="radio" id="tipotabla" name="tipotabla" value="masivo" />
                <label for="masivo">Masivo</label>
                <div  style={{padding:'1%' , marginLeft:'2%' ,display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' ,textAlign:'center' , maxWidth:'70%'  }}>
                    {Orden_Etd_Cur.map((item) => (
                    <label key={item} value={item} style={{color:'#4d73da', fontWeight:'bold'}} hidden={tablavisible === 'unica'  ? false : ( item.includes("Moneda") && tablavisible === 'masivo' )  ? false : true } > 
                    {item}<br></br><input id={item === "etd" ? '' : item.includes("PO") ? 'miInput' : '{item}'} style={{ textAlign:'center' , width:item === "ETD" ? '' : item.includes("PO") ? '120px' : '70px'}} type={item === "ETD" ? 'date' : item.includes("PO") ? 'number' : 'text'}/>
                    </label>))}
                </div>                
            </section>
            <div hidden={tabla.visible} style={{marginTop:'1%', alignItems:'center' , border:'solid #d1cece 1px ' }}>
               <label style={{marginTop:'10px', marginLeft:'10px'}}>Tipo de modificación</label>
            <Stack direction='row' >
                <div  style={{padding:'1%' , marginLeft:'1%' ,display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap:'10px', textAlign:'left' , minWidth:'70%'  }}>
                            {tipos_modif.map((item) => (
                            <label key={item} value={item}>  <input type='checkbox' onClick={(e)=>{tipoM(e)}} key={item} value={item}/ >&nbsp;&nbsp;
                            {item}
                            </label>))}
                </div>
                <Stack hidden={NoSolped} direction='row' style={{padding:'1%',marginLeft:'-10%',maxWidth:'60%'}}>
                    <span >No. Solped</span>&nbsp;
                    <input style={{maxHeight:'50%' ,border:'none', borderBottom:'1px solid black'}} type='text' />
                </Stack>
            </Stack>
            </div>
        </section>
    <section style={{padding:'.5%', border:'solid #dfdfdf 1px'}}>
    <div  hidden={(tablavisible === "unica" ? false : true )} style={{marginTop:'2%' , Width:'80%' , border:'solid #d1cece 1px' , borderRadius:'10px'}}> 
            <div >
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-danger btn-sm fw-bold px-2 py-0" >-</button>
                    <input  onChange={(e) => {setfilasinput(e.target.value)}} id='miInput' type='number'  defaultValue={filasinput} style={{fontWeight:'bold'  ,textAlign:'center',fontSize:'12px', marginLeft:'1%',width:'3%'}}/ >
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-success btn-sm fw-bold px-2 py-0" >+</button>
            </div>
            <table className='table'>
                <thead className='thead-dark' style={{textAlign:'center'}} >
                <tr>
                    {Revisados_Unica.map((item) => 
                        <th key={item} id={item} style={{ fontSize:'small'  ,display:item === "UM" && aditem === false ? 'none' :''}} >{item}</th>
                    )} 
                </tr>      
                 </thead>  
                    <tbody onInput={(e)=>{cambiofila(e)}}>
                        {Array.from({ length: filasTab }).map((_, indexFila) => (
                            <tr key={indexFila} style={{  backgroundColor: 'gray', }} >
                            {Revisados_Unica.map((item, indexItem) => (
                                <td key={'u'+ indexItem} id={'u'+ indexItem + " " + indexFila}  
                                contentEditable='true' style={{border:'dotted black 1px' , borderRadius:'6px', display:item === "UM" && aditem === false ? 'none' :''}}>
                                {item === "ETD" ? <input type="date" /> : null}
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
            </div>
            <table className='table'>
                <thead className='thead-dark' style={{textAlign:'center'}} >
                <tr>
                    {Revisados_Masivo.map((item) => 
                        <th key={item} id={item} style={{display:item === "UM" && aditem === false ? 'none' :''}}>{item}</th>
                    )} 
                </tr>      
                 </thead>  
                    <tbody >
                        {Array.from({ length: filasTab }).map((_, indexFila) => (
                            <tr key={indexFila} style={{ borderBlock: '1px solid #d1cece', backgroundColor: 'gray', }} >
                            {Revisados_Masivo.map((item, indexItem) => (
                                <td key={'m'+indexItem} id={'u'+ indexItem + " " + indexFila} contentEditable='true' style={{display:item === "UM" && aditem === false ? 'none' :''}}>
                                </td>
                            ))}
                            </tr>
                        ))}
                    </tbody>            
            </table>
        </div>
       </section> 
        <Stack hidden={true} marginLeft='40%' direction='row' spacing={2}>
            <button className='btn btn-success'>Guardar</button>
            <button className='btn btn-danger'>Cancelar</button>
        </Stack>
        <br></br>
    </div>
  )
}

export default FormatoRevisados