import React, { useEffect, useState , useRef} from 'react'
import { DataGrid } from '@mui/x-data-grid'
import ClientesService from '../../service/ClientesService';
import { CircularProgress , Hidden, Stack } from '@mui/material';
import '../../Componentes/button.css'
import { gruposColsSocPlanta } from './material_reutilizable_planta';
import { registerLocale } from 'react-datepicker';
import { daDK } from '@mui/material/locale';

function Soc_Planta() {
    const [digitoInicial, setdigitoInicial] = useState("");
    const [tablatemp , settablatemp] = useState([]);
    const [listProveedores, setlistProveedores] = useState([]);
    const [bufferPlanta,setbufferPlanta] =useState([]);
    const [existe, setexiste] = useState(false);
    const [loading, setLoading] = useState(false);
    const [SocPlanta,setSocPlanta] = useState([]);
    const [PlaneadoresPl, setPlaneadoresPl] = useState([]);
    const [ancho, setAncho] = useState(window.screen.width);
    const [tabla1, settabla1] = useState(false);
    const [vistaRegistro, setvistaRegistro] = useState(false);
    const [Registro,setRegistro]= useState({});
    const [RegistroMasivo,setRegistroMasivo]= useState({});
    const [botonesmasivos, setbotonesmasivos] = useState({length:0});
    const [CambiosMasivos, setCambiosMasivos] = useState([]);
    const [fechas_masivo, set_fechas_masivo] = useState({});
    const [visorMasivas, setvisorMasivas] = useState(false);
    const dialogRef = useRef(null);
    const [sortModel, setSortModel] = React.useState([
       {
         field: "fecha_de_creacion",
         sort: "desc",
       },
    ]);

    const nombres_Titulos_fechas_Soc_Planta = [
         "SAP",
         "COLOCACIÓN",
         "COMPRAS",
         "PLANEACIÓN",
         "DIRECCIÓN COMPRAS",
         "DIRECCIÓN GENERAL MP",
         "DIRECCIÓN GENERAL",
    ];


  const nombres_areas_pos = [
         "sap",
         "colocacion",
         "compras",
         "planeacion",
         "dircompras",
         "mp",
         "dg",
    ];

    const nombres_fechaInicial_Soc_Planta = [
         Registro?.fecha_inicial_sap,
         Registro?.fecha_inicial_colocacion,
         Registro?.fecha_inicial_compras,
         Registro?.fecha_inicial_planeacion,
         Registro?.fecha_inicial_dircompras,
         Registro?.fecha_inicial_mp,
         Registro?.fecha_inicial_dg,
    ];
      
    const nombres_fechaFinal_Soc_Planta = [
         Registro?.fecha_final_sap,
         Registro?.fecha_final_colocacion,
         Registro?.fecha_final_compras,
         Registro?.fecha_final_planeacion,
         Registro?.fecha_final_dircompras,
         Registro?.fecha_final_mp,
         Registro?.fecha_final_dg,
    ];

    const opciones = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" };

      useEffect(() => {
        const detectarCambio = () => {
          setAncho(Number(window.screen.width) - 20 );
        };
        window.addEventListener("resize", detectarCambio);
        return () => {
          window.removeEventListener("resize", detectarCambio);
        };
      }, []);
  
const complementar = (dataSoc_planta, data_Buffer) => {
  const resultado = dataSoc_planta.map(element => {
    const found = data_Buffer.find( elementBuffer => Number(elementBuffer.po_th) === Number(element.po) || Number(elementBuffer.po) === Number(element.po));
    return { ...element};
  });
  settablatemp(resultado);
};

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProveedores, resBuffer , resSocplanta, resPlaneadores] = await Promise.all([
        ClientesService.getproveedoresall(),
        ClientesService.get_bufferSinTots(),
        ClientesService.get_soc_planta(),
        ClientesService.get_Planeadores_Planta()
      ]);
      setlistProveedores(resProveedores.data);
      setbufferPlanta(resBuffer.data);
      complementar(resSocplanta.data , resBuffer.data )
      setSocPlanta(resSocplanta.data)
      setPlaneadoresPl(resPlaneadores.data)
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoading(false);
      settabla1(true);
    }
  };
  fetchData();
}, []);

const actualizar_Bases = async () => {
  setLoading(true);
  try {
    await ClientesService.actualizarBasesPlanta();
  } catch (err) {
    console.error("Error en la actualización:", err);
  } finally {
    alert("Bases Actualizadas");
    setLoading(false);
  }
};

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visorMasivas) {
      if (!dialog.open) {
        dialog.showModal(); 
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [visorMasivas]);
const Cancelar = () =>{
  setdigitoInicial("");
    setRegistro({})
    settabla1(true)
        setvistaRegistro(false);
        setexiste(false);
  // window.location.reload();
  }

  const guardar_cambios = ()=>{
    if(Registro.id === undefined){
        ClientesService.postear_Soc_planta(Registro).then(()=>{
          alert("Registro Guardado! " +  " " +  Registro.po_th )
        }).catch((error)=>{
            console.log(error)
        })
    }else{
        ClientesService.Put_Soc_Planta(Registro.id, Registro).then(()=>{
          alert("Registro Actualizado! " +  " " +  Registro.po_th )
        }).catch((error)=>{
            console.log(error)
        })
    }
    Cancelar();
  }

  const calcularDiasLaborales = (start, end) => {
  let count = 0, cur = new Date(start), final = new Date(end);
  while (cur <= final) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count - 1;
};

const parsearFechaLatina = (str) => {
  if (typeof str !== 'string') return new Date(str);
  const partes = str.trim().split('/');
  if (partes.length === 3) {
    return new Date(partes[2], partes[1] - 1, partes[0]);
  }
  return new Date(str);
};

const columns_Soc_planta = [
        { field: 'fecha_de_creacion', headerName: 'Creacion',headerClassName: "gris" },
        { field: 'po_th', headerName: 'PO',headerClassName: "gris" },
        { field: 'po', headerName: 'PO TH',headerClassName: "gris"},
        { field: 'fabrica', headerName: 'Fabrica',headerClassName: "gris"},
        { field: 'comprador', headerName: 'Comprador',headerClassName: "gris"},
        { field: 'confirmador', headerName: 'Confirmador',headerClassName: "gris"},
        { field: 'colocador', headerName: 'Colocador',headerClassName: "ama  "},
        { field: 'no_de_proveedor', headerName: 'No. De Proveedor',headerClassName: "gris"},
        { field: 'proveedor', headerName: 'PROVEEDOR',headerClassName: "gris"},
        { field: 'tipo', headerName: 'Tipo',headerClassName: "gris"},
        { field: 'revisado', headerName: 'Revisado ( DG )',headerClassName: "gris"},
        { field: 'urgente', headerName: 'Urgente',headerClassName: "trial",
              valueGetter: (params) =>
                params !== null ? "ER" : null,
              },
        { field: 'codigo', headerName: 'Código',headerClassName: "gris"},
        { field: 'clave', headerName: 'Clave',headerClassName: "gris"},
        { field: 'etd' , type: "date", headerName: 'ETD',headerClassName: "gris", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'fecha_inicial_sap', type: "date", headerName: 'Fecha Inicial ', headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-'},
        { field: 'fecha_final_sap', type: "date", headerName: 'Fecha Final',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'inicio_proceso_cd', type: "date" , headerName: ' Inicio proceso CD',headerClassName: "verde", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'tiempo_real_cd', headerName: 'Tiempo Real',headerClassName: "ama", renderCell: (params) => {
            const fila = params.row;
            if (!fila) ;
            const fEmision = fila.fecha_inicial_sap; 
            const fRecibo = fila.fecha_final_sap;
            if (!fEmision || !fRecibo) {return `-`;}
            const inicio = new Date(fEmision);
            const fin = new Date(fRecibo);
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                return <span title="Formato de fecha no reconocido">-</span>;
            }
            const diff = fin.getTime() - inicio.getTime();
            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (dias >= 0) {
            return `${dias} días`;
        } else { return ''; }
      }},
        { field: 'fecha_inicial_colocacion', type: "date", headerName: 'Fecha Inicial ',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'fecha_final_colocacion', type: "date", headerName: 'Fecha Final',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'tiempo_real_colocacion', headerName: 'Tiempo Real',headerClassName: "ama"},
        { field: 'comentarios_colocacion', headerName: 'Comentarios CD',headerClassName: "rojooscuro"},
        { field: 'fecha_inicial_compras', type: "date", headerName: 'Fecha Inicial ',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'fecha_final_compras', type: "date", headerName: 'Fecha Final',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'tiempo_real_compras', headerName: 'Tiempo Real',headerClassName: "ama"},
        { field: 'comentarios_compras', headerName: 'Comentarios CD',headerClassName: "rojooscuro"},
        { field: 'fecha_inicial_planeacion', type: "date", headerName: 'Fecha Inicial ',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'fecha_final_planeacion', type: "date", headerName: 'Fecha Final',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'tiempo_real_planeacion', headerName: 'Tiempo Real',headerClassName: "ama"},
        { field: 'comentarios_planeacion', headerName: 'Comentarios CD',headerClassName: "rojooscuro"},
        { field: 'fecha_inicial_dircompras', type: "date", headerName: 'Fecha Inicial ',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'fecha_final_dircompras', type: "date", headerName: 'Fecha Final',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'tiempo_real_dircompras', headerName: 'Tiempo Real',headerClassName: "ama"},
        { field: 'comentarios_dircompras', headerName: 'Comentarios CD',headerClassName: "rojooscuro"},
        { field: 'fecha_inicial_mp', type: "date", headerName: 'Fecha Inicial ',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'fecha_final_mp', type: "date", headerName: 'Fecha Final',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'tiempo_real_mp', headerName: 'Tiempo Real',headerClassName: "ama"},
        { field: 'comentarios_mp', headerName: 'Comentarios CD',headerClassName: "rojooscuro"},
        { field: 'fecha_inicial_dg', type: "date", headerName: 'Fecha Inicial',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'fecha_final_dg', type: "date", headerName: 'Fecha final',headerClassName: "ama", valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'tiempo_real_dg', headerName: 'Tiempo real',headerClassName: "ama"},
        { field: 'comentarios_dg', headerName: 'Comentarios CD',headerClassName: "rojooscuro"},
        { field: 'enviada', headerName: 'ENVIADA', headerClassName:'trial'},
        { field: 'er_comentario', headerName: 'ER',headerClassName:'rojooscuro'},
        { field: 'motivo_de_revisado', headerName: 'Motivo de Revisado', headerClassName:'trial'},
        { field: 'status', headerName: 'Status',headerClassName:'sap' , },
        { field: 'días_totales_proceso', headerName: 'Días totales proceso',headerClassName:'sap', renderCell: (params) => {
            const fila = params.row;
            if (!fila) ;
            const fEmision = fila.fecha_inicial_sap; 
            const fRecibo = fila.enviada;
            const Texto = fRecibo?.startsWith("'") ? "SI" : "NO";
            console.log(fEmision)
            console.log(Texto)
            if (!fEmision || !fRecibo) {return `-`;}
            const inicio = new Date(fEmision);
            const fin = new Date(fRecibo);
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                return <span title="Formato de fecha no reconocido">-</span>;
            }
            const diff = fin.getTime() - inicio.getTime();
            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (dias >= 0) {
            return `${dias} días`;
        } else { return ''; }
      }},
        { field: 'observaciones_cd', headerName: 'Observaciones CD',headerClassName:'gris'},
        { field: 'correos_bu', headerName: 'correos BU'},
        { field: 'correos_confirmador', headerName: 'CORREOS CONFIRMADOR'},
        { field: 'correos', headerName: 'CORREOS'},
        { field: 'control_interno', headerName: 'Control Interno'},
]

const fechaIsoFunc = () => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Mexico_City',
  dateStyle: 'short',
  timeStyle: 'medium'
}).format(new Date()).replace(' ', 'T');

const nuevo_modificar_Po = (e) => {
   const existe_en_Soc = tablatemp.find(elementotabla =>  Number(elementotabla.po_th) === Number(e) || Number(elementotabla.po) === Number(e) ); 
   if (existe_en_Soc !== undefined){
         settabla1(false);
         setvistaRegistro(true);
         setRegistro(existe_en_Soc)
         setexiste(true)
     }else{
    const found = bufferPlanta.find( elementBuffer => Number(elementBuffer?.po_th) === Number(e) || Number(elementBuffer?.po) === Number(e));
      if (found === undefined){
          setRegistro({po_th: 0 , po: e , fecha_de_creacion: fechaIsoFunc()});   
          settabla1(false);
          setvistaRegistro(true);      
          setexiste(false)
      }else{
    const contactos = PlaneadoresPl.find(elementoContact => Number(found?.codigo) === Number(elementoContact.item) )
        setRegistro({ ...found, comprador: contactos?.comprador, confirmador: contactos?.nombre_planner, 
          colocador: contactos?.gerente_planner , fabrica: found?.prov , fecha_de_creacion: fechaIsoFunc()});   
        settabla1(false);
         setvistaRegistro(true);      
         setexiste(false)
     }}
}
const cambioSocPlanta = (e) => {
    if (e.target.id === "proveedorname"){
        const encontrarProv = listProveedores.find(proveedor => proveedor.proveedor === e.target.value)
          setRegistro((prev) => ({...prev,
                  ["proveedor"]: encontrarProv.proveedor,
                  ["no_de_proveedor"]: encontrarProv.noProveedor 
                  }))    
            }else {
              if( e.target.id !== "urgente"){
                setRegistro((prev) => ({...prev, [e.target.id]: e.target.value }))    
            }else{              
                setRegistro((prev) => ({...prev, [e.target.id]: e.target.checked }))    
          }
        }
  }

const estadoFechasMasivo = (e) =>{
  const titulo = e.target.id + "_" + nombres_areas_pos[Number(e.target.name)- 1] ;
  if (e.target.id === "inputInicioCD"){
      setRegistroMasivo((prev) => ({...prev, ["inicio_proceso_cd"]: e.target.value }))    
  }else{
      setRegistroMasivo((prev) => ({...prev, [titulo]: e.target.value }))    
}};

  
const estadoFechas = (e) =>{
  const titulo = e.target.id + "_" + nombres_areas_pos[Number(e.target.name)- 1] ;
  if (e.target.id === "inputInicioCD"){
      setRegistro((prev) => ({...prev, ["inicio_proceso_cd"]: e.target.value }))    
  }else{
      setRegistro((prev) => ({...prev, [titulo]: e.target.value }))    
}};

const visor_Masivas = (e) => {
    if (e.target.id === "cancelarmasivo"){
      setvisorMasivas(false)
    }else{
      setvisorMasivas(true)
  }}

const rellenar_fechas_masivo = async () => {
   for (let i = 0 ; i < CambiosMasivos.length ; i++ ) {
const putRegistroActualizado = {  ...CambiosMasivos[i], ...RegistroMasivo };
       try {
         await ClientesService.Put_Soc_Planta(putRegistroActualizado.id , putRegistroActualizado);
       } catch (err) {
         console.error(`Error con el elemento:`, err);
       }
    }
   alert("POs Actualizadas con la fecha del dia!!");
    window.location.reload();
};

const rellenar_fechas = async () => {
   for (let i = 0 ; i < botonesmasivos.length ; i++ ) {
      const putRegistro = tablatemp.find(elementotabla =>  Number(botonesmasivos[i]) === Number(elementotabla.id)  ); 
const putRegistroActualizado = {
  ...putRegistro,
  fecha_final_colocacion: fechaIsoFunc(), fecha_final_compras: fechaIsoFunc(),
  fecha_final_dg: fechaIsoFunc(), fecha_final_dircompras: fechaIsoFunc(),
  fecha_final_mp: fechaIsoFunc(), fecha_final_planeacion: fechaIsoFunc(),
  fecha_final_sap: fechaIsoFunc(), fecha_inicial_colocacion: fechaIsoFunc(),
  fecha_inicial_compras: fechaIsoFunc(), fecha_inicial_dg: fechaIsoFunc(),
  fecha_inicial_dircompras: fechaIsoFunc(), fecha_inicial_mp: fechaIsoFunc(),
  fecha_inicial_planeacion: fechaIsoFunc(), fecha_inicial_sap: fechaIsoFunc(),  inicio_proceso_cd: fechaIsoFunc()
};
      try {
        await ClientesService.Put_Soc_Planta(putRegistroActualizado.id , putRegistroActualizado);
      } catch (err) {
        console.error(`Error con el elemento:`, err);
      }}
   alert("POs Actualizadas con la fecha del dia!!");
   window.location.reload();
};

const funcionBotonesMasiv = (e) => {
  setbotonesmasivos(e)
  const nuevosRegistros = [];
  for (let i = 0; i < e.length; i++) {
    const putRegistro = tablatemp.find(
      elementotabla => Number(e[i]) === Number(elementotabla.id)
    ); 
    if (putRegistro) {
      nuevosRegistros.push({ ...putRegistro });
    }
  }
  setCambiosMasivos(nuevosRegistros);
};
        const hoyinput = new Date();
        hoyinput.setDate(hoyinput.getDate() - 4);
        const fechaMin = hoyinput.toISOString().split("T")[0];

return ( 
  <div> 
    {/* INICIO DIALOG -------------------------------------------------- --------------------------------------------------  */}
      <dialog ref={dialogRef} style={{width:'30vw', minHeight: '100px'}}>
        <Stack direction='row' spacing={1}>
            <span>POs a Modificar Masivamente: {CambiosMasivos.map(element => element.po + " ")}</span> 
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className='btn btn-success' id='guardarmasivo' onClick={rellenar_fechas_masivo}>Guardar</button>  {/* ponerle un onclick que guarde masivamente por linea del grid */}
               <button className='btn btn-danger' id='cancelarmasivo' onClick={(e)=>{visor_Masivas(e)}}>Cancelar</button> {/* revisar que el estado se limpie */}
            </div>
        </Stack>
        <br></br>
            {[...Array(7)].map((_, i) => {
  const num = i + 1;
  return (  <div id={num} key={num} style={{border:'solid #cccccc 1px', borderRadius:'5px' , padding:'1%'}}> <b>{nombres_Titulos_fechas_Soc_Planta[i] }</b> <br></br>
      <label className="form-label text-secondary small fw-medium" > Fecha de Inicio</label>
      <input type="date" id={`fecha_inicial`} name={num} className="form-control" min={fechaMin}  onChange={(e)=>{estadoFechasMasivo(e)}} />
  {i === 0 ? (<>
    <label className="form-label text-secondary small fw-medium" style={{backgroundColor:'#d3f5ad'}}>
      Fecha de Inicio proceso CD
    </label>
    <input type="date"  id={`inputInicioCD`}  className="form-control" value={RegistroMasivo.inicio_proceso_cd ?? ""} min={fechaMin} onChange={(e) => estadoFechasMasivo(e)} /> </>) : null}
      <label className="form-label text-secondary small fw-medium"> Fecha de Término </label>
      <input type="date" id={`fecha_final`} name={num} className="form-control"  min={fechaMin}   onChange={(e)=>{estadoFechasMasivo(e)}} />
    </div>)})}
        </dialog>
        {/* FIN DIALOG -------------------------------------------------- -------------------------------------------------- */}



  {loading ? ( <div style={{padding:'25%'}}> <CircularProgress/><label>Actualizando</label>  </div> ) 
  : (
    <div style={{ display: tabla1 === false ? 'none': '', marginTop: '2%' }}>
        <Stack direction='row' spacing={2}>
            <input type="number" id="miInput" placeholder="Digita PO / PO TH" value={digitoInicial} onChange={(e) => { const val = e.target.value; setdigitoInicial(val); if (val.length === 7) { nuevo_modificar_Po(val);}}}  />
            <button style={{width:'15%'}} onClick={()=>{actualizar_Bases()}} className='btn btn-success'>Actuaizar Bases Planta</button> 
            <h3 style={{color:'gray'}}> Seguimiento OC Planta</h3>
            <button hidden={botonesmasivos.length === 0 ? true : false} className='btn btn-danger' onClick={()=>{rellenar_fechas()}}>Llenar Fechas</button>
            <button hidden={botonesmasivos.length === 0 ? true : false} className='btn btn-success' id='mostrarmasivo' onClick={(e)=>{visor_Masivas(e)}}>Masivas</button>
        </Stack>
<div style={{marginTop:'1%', width:"90vw"  , marginLeft: ancho >= 1290 ? 'calc(-18vw)' : 'calc(-6vw)' ,height:'35vw' }}>
    <DataGrid 
        columns={columns_Soc_planta} 
        rows={tablatemp}
        columnGroupingModel={gruposColsSocPlanta}
        sortModel={sortModel}
        columnVisibilityModel={{ fecha_de_creacion: false }}
        checkboxSelection
        onRowSelectionModelChange={(selectionmodel) =>{
          funcionBotonesMasiv(selectionmodel)
        }}
        >
    </DataGrid>
    </div>
    </div>
)
}
  <div style={{marginTop:'2vw',display:vistaRegistro === false ? 'none' : ''}}>
      <form onSubmit={(e) => e.preventDefault()} className="container max-w-lg p-4 bg-white rounded shadow-sm border">
        <div className="pb-4 mb-4 border-bottom">
          <h2 className="h5 mb-3" style={{color:'rgb(255, 157, 28)'}} >{existe ? "Modificar PO" : "Nueva PO"}</h2>
        <div  style={{padding:'1%' , marginLeft:'1%' ,display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap:'5px', textAlign:'left' , minWidth:'70%'  }}>
              <div>
                  <label className="form-label text-secondary small fw-medium">PO</label>
                  <input required type="number" id='miInput' className="form-control" value={Registro.po_th === "" ? Registro.po : Registro.po_th} onChange={(e) => setRegistro(prev => ({ ...prev, po_th: e.target.value }))} />
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">PI</label>
                  <input required type="number" id='miInput' className="form-control" value={Registro.po}  />
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">Fábrica</label>
                  <input required type="text" className="form-control" value={Registro.fabrica} onChange={(e) => setRegistro(prev => ({ ...prev, fabrica: e.target.value }))} />
              </div>
              <div style={{width:'auto'}}>
                  <label  className="form-label text-secondary small fw-medium">No de Proveedor</label>
                  <input required type="number" id='miInput'  className="form-control" value={Registro.no_de_proveedor} />
              </div>
              <div style={{width:'auto'}}>
                  <label className="form-label text-secondary small fw-medium">Proveedor</label>
                  <input required type="text" className="form-control" id='proveedorname' list='proveedor' value={Registro.proveedor} onBlur={(e) => cambioSocPlanta(e)} />
                  <datalist id="proveedor">
                          {listProveedores.map((proveedor)=>(
                            <option>{proveedor.proveedor}</option>
                          ))}
                  </datalist>
              </div>
              <div >
                  <label className="form-label text-secondary small fw-medium">Revisado</label>
                  <select className="form-select" id='revisado' onChange={(e)=>{cambioSocPlanta(e)}}>
                    <option></option>
                    <option>DG</option>
                    <option>EA</option>
                    <option>R</option>
                  </select>
              </div>
              <div style={{display:'grid' , placeItems: 'center'}}>
                  <label className="form-label text-secondary small fw-medium">Urgente</label>
                  <input  type="checkbox" className="form-check-input" style={{ width: '20px', height: '20px' }} checked={Registro.urgente}  id='urgente' onChange={(e)=>{cambioSocPlanta(e)}} />
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">Código</label>
                  <input type="text" className="form-control" value={Registro.codigo} onChange={(e) => setRegistro(prev => ({ ...prev, codigo: e.target.value }))} />
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">Clave</label>
                  <input type="text" className="form-control" value={Registro.clave}  onChange={(e) => setRegistro(prev => ({ ...prev, clave: e.target.value }))}/>
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">Comprador</label>
                  <input required type="text" className="form-control" id='comprador' value={Registro.comprador} onChange={(e)=>{cambioSocPlanta(e)}}  />
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">Confirmador</label>
                  <input required type="text" className="form-control" id='confirmador' value={Registro.confirmador} onChange={(e)=>{cambioSocPlanta(e)}} />
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">Colocador</label>
                  <input required type="text" className="form-control" id='colocador' value={Registro.colocador} onChange={(e)=>{cambioSocPlanta(e)}} />
              </div>
              <div>
                  <label className="form-label text-secondary small fw-medium">ETD</label>
                  <input disabled={Registro.etd === undefined ? false : true} type="date" className="form-control" value={Registro.etd} id='etd' onChange={(e)=>{cambioSocPlanta(e)}}  />
              </div>
        </div>
        </div>
    <div  style={{padding:'1%' , marginLeft:'1%' ,display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap:'15px', textAlign:'left' , minWidth:'70%'  }}>
{[...Array(7)].map((_, i) => {
  const num = i + 1;
  return (
    <div id={num} key={num} style={{border:'solid #cccccc 1px', borderRadius:'5px' , padding:'1%'}}> <b>{nombres_Titulos_fechas_Soc_Planta[i] }</b> <br></br>
      <label className="form-label text-secondary small fw-medium" > Fecha de Inicio</label>
      <input type="date" id={`fecha_inicial`} name={num} className="form-control"  value={nombres_fechaInicial_Soc_Planta[i] ?? "" } onChange={(e)=>{estadoFechas(e)}}/>
{i === 0 ? (<>
    <label className="form-label text-secondary small fw-medium" style={{backgroundColor:'#d3f5ad'}}>
      Fecha de Inicio proceso CD
    </label>
    <input type="date"  id={`inputInicioCD`}  className="form-control" value={Registro.inicio_proceso_cd ?? ""} onChange={(e) => estadoFechas(e)} /> </>) : null}
      
      <label className="form-label text-secondary small fw-medium"> Fecha de Término </label>
      <input type="date" id={`fecha_final`} name={num} className="form-control"  value={nombres_fechaFinal_Soc_Planta[i] ?? "" }  onChange={(e)=>{estadoFechas(e)}} />

    </div>
        );
      })}
        </div>
        <button type="submit" className="btn btn-primary w-25 fw-bold" onClick={()=>{{guardar_cambios()}}}>
          Guardar Cambios
        </button>
         <button  className="btn btn-danger w-25 fw-bold" onClick={()=>{Cancelar()}}>Cancelar</button>
                {/* <button  onClick={handleEnviarCorreo} style={{  padding: '10px 20px', backgroundColor: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} >
      Enviar con Outlook
    </button> */}

      </form>
  </div>
</div>
)
}
export default Soc_Planta