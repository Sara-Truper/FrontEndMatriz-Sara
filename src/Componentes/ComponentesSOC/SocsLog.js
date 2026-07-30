import React, { useEffect, useState} from 'react';
import ClientesService from '../../service/ClientesService';
import { DataGrid } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import { width } from '@mui/system';

const statusLog = (valor, rea, ea, reimp) => {
    const v = String(valor || "").trim();
    const r = String(rea || "").trim();
    const e = String(ea || "").trim();
    const rei= String (reimp || "").trim();
    if (v.includes('-')) {
        return v;
    }
    
    if (rei !== "") {
        return rei;
    }

    let num = 0;
    if (v === "" || v === "0") {
        num = (e !== "") ? 0 : 1;
    } else {
        num = parseInt(v.replace(/[^0-9]/g, '')) || 1;
    }

    if (e !== "") {
        if (rei !== "") return `EA${e}-REIMP${rei}-${num}`; 
            return `EA${e}-${num}`;  
    }
    if (r !== "") {
        if (rei !== "") return `R${r}-REIMP${rei}-${num}`; 
        return `R${r}-${num}`;
    }
    if (rei!=="") return rei;
    return String(num);
};

function SocsLog() {
    const [search, setSearch] = useState({filtroUsuario:'ALL', filtroPo:''})
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contactos ,setcontactos] = useState([]);
    const usuarioLocal = localStorage.getItem("username");
    const opciones = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" };
    const [usuarioActual, setUsuarioActual] = useState(localStorage.getItem("username") || "");
    const [copiedData, setCopiedData] = useState('');
    const [sortModel, setSortModel] = React.useState([
      {
        field: "status_reimp",
        sort: "asc",
      },
       {
         field: "nopo",
         sort: "asc",
       },
    ]);
    const columns = [
        { field: 'asistentepos', headerName: "Asistente PO's", width: 120, headerClassName: "gris" },
        { field: 'no_de_proveedor', headerName: 'No. De Proveedor', width: 130, headerClassName: "gris" },
        { field: 'nombreProveedor', headerName: 'Proveedor', width: 200, headerClassName: "gris" }, 
        { field: 'nopo', headerName: 'No. P.O.', width: 110, headerClassName: "gris" },
        { field: 'nooc', headerName: 'No. N.L.', width: 110, headerClassName: "gris" },
        { field: 'status_problema', headerName: 'Status / Problema', width: 150, headerClassName: "gris" },
        { field: 'unidad_de_negocio', headerName: 'Unidad de Negocio', width: 150, headerClassName: "gris" },
        { field: 'gte_responsable_bu', headerName: 'Gerente', width: 150, headerClassName: "gris" },
        { field: 'rea', headerName: 'R/EA', width: 90, headerClassName: "gris" },

        { field: 'fecha_de_emisionoc', headerName: 'Fecha Emisión', width: 140, headerClassName: "gris", 
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'enviocolocacion', headerName: 'Fecha Inicial', width: 140, headerClassName: "gris",
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'diasTranscurridos', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", renderCell: (params) => {
            const fila = params.row;
            if (!fila) return <span style={{ color: '#ccc' }}>-</span>;
            const fEmision = fila.enviocolocacion; 
            const fRecibo = fila.enviosap;
    
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
      }
    },
    
      { field: 'enviosap', headerName: 'Fecha de Recibo a Ctrl PO\'s', width: 160, headerClassName: "gris",
     valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' 
    },
        { field: 'tiempo', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", 
            renderCell: (params) => {
            const fila = params.row;
            if (!fila) return <span style={{ color: '#ccc' }}>-</span>;
            const fEmision = fila.enviosap; 
            const fRecibo = fila.enviodp;
    
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
      }
    },
        { field: 'enviodp', headerName: 'Fecha Inicial', width: 140, headerClassName: "gris",
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' 
         },
        
        { field: 'tiemp', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", 
          renderCell: (params) => {
            const fila = params.row;
            if (!fila) return <span style={{ color: '#ccc' }}>-</span>;
            const fEmision = fila.enviodp; 
            const fRecibo = fila.enviodc;
    
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
      }
        },
        { field: 'enviodc', headerName: 'Fecha Inicial', width: 140, headerClassName: "gris", 
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' 
        },
        
        { field: 'tiem', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", renderCell: (params) => {
          const fila = params?.row;
            if (!fila || !fila.enviodc || !fila.enviada) return "-";
            const inicio = new Date(fila.enviodc);
            const fin = new Date(fila.enviada);
            inicio.setHours(0,0,0,0);
            fin.setHours(0,0,0,0);
    
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return "-";
            const dif = fin.getTime() - inicio.getTime();
            const dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    
            return dias >= 0 ? `${dias} días` : "";
        }},
        {field: 'numero_reimp', headerName: '# Log', width: 150, headerClassName: "gris"},
        {field: 'status_reimp', headerName: 'Status', width: 150, headerClassName: "gris", type: "singleSelect", valueOptions: ["Abierta", "Cerrada"], editable: (params) => params.row.status_reimp !== "Cerrada", renderCell: (params) => params.value || "Abierta" },
        

        { field: 'enviada', headerName: 'Enviada', width: 140, headerClassName: "gris",
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' 
        },
        { field: 'fecha_revisado', headerName: 'Fecha de Revisado', width: 140, headerClassName: "gris",
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' 
        },
        { field: 'promesa_de_embarque_proforma', headerName: 'Fecha Envio de EA', width: 140, headerClassName: "gris",
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' 
        },
        { field: 'dias', headerName: 'Días Totales', width: 120, headerClassName: "gris", 
          renderCell: (params) => {
            const fila = params.row;
            if (!fila || !fila.fecha_de_emisionoc || !fila.enviada) return "-";
            const inicio = new Date(fila.fecha_de_emisionoc);
            const fin = new Date(fila.enviada);
            inicio.setHours(0,0,0,0);
            fin.setHours(0,0,0,0);
    
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return "-";
            const dif = fin.getTime() - inicio.getTime();
            const dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    
            return dias >= 0 ? `${dias} días` : "";
          }
        },
        { field: 'fecha_recibo_log', headerName: 'Fecha Recibo de Log', width: 180, headerClassName: "gris",
          valueFormatter: (params) => {
            if (!params) return '-';
            const opcionesConHora = { 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric", 
            hour: "2-digit", 
            minute: "2-digit"
          };
          return new Date(params).toLocaleDateString("es-MX", opcionesConHora);

          }
        },
        {field: 'comentarios_reimp', headerName: 'Comentarios', width: 150, headerClassName: "gris", editable: true},
    ];
    
    const gruposDeColumnas = [
      {
        groupId: 'referencia',
        headerName: 'REFERENCIA PO',
        headerClassName: "morado",
        headerAlign: 'center',
        children: [
          { field: 'asistentepos' },
          { field: 'no_de_proveedor' },
          { field: 'nombreProveedor' },
          { field: 'nopo' },
          { field: 'nooc' },
          { field: 'status_problema' },
          { field: 'unidad_de_negocio' },
          { field: 'gte_responsable_bu' },
          { field: 'rea' }
        ],
      },
      {
        groupId: 'colocacion',
        headerName: 'FECHA DE COLOCACIÓN',
        headerClassName: "amarillo",
        headerAlign: 'center',
        children: [
          { field: 'fecha_de_emisionoc' }
        ],
      },
      {
        groupId: 'impresion',
        headerName: 'FECHA DE IMPRESIÓN DE P.O. (SAP)',
        headerClassName: "azul",
        headerAlign: 'center',
        children: [
          { field: 'enviocolocacion' },
          { field: 'diasTranscurridos' }
        ],
      },
      {
        groupId: 'control',
        headerName: 'CONTROL DOCUMENTAL',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
          { field: 'enviosap' },
          { field: 'tiempo' },
          { field: 'comentarios_doc' }
        ],
      },
      {
        groupId: 'dir',
        headerName: 'DIRECCIÓN DE PLANEACIÓN (GIBRAN/ALBERTO)',
        headerClassName: "ama",
        headerAlign: 'center',
        children: [
          { field: 'enviodp' },
          { field: 'tiemp' },
          { field: 'comentarios_plan' }
        ],
      },
      {
        groupId: 'direccion',
        headerName: 'DIRECCIÓN DE COMPRAS (SERGIO/GTE MP)',
        headerClassName: "ama",
        headerAlign: 'center',
        children: [
          { field: 'enviodc' },
          { field: 'tiem' },
          { field: 'comentarios_compras' }
        ],
      },
      {
        groupId: 'reimp',
        headerName: 'STATUS',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
          { field: 'numero_reimp' },
          { field: 'status_reimp' }
        ],
      },
      {
        groupId: 'prev',
        headerName: 'ENVÍO PREVIAS',
        headerClassName: "morado",
        headerAlign: 'center',
        children: [
          { field: 'enviada' },
          {field: 'fecha_revisado'},
          {field: 'promesa_de_embarque_proforma'},
          { field: 'dias' },
          {field: 'fecha_recibo_log' },
          { field: 'comentarios_reimp' }
        ],
      },
    ];

useEffect(() => {
        handleVerLogPos();
    }, []);


const handleVerLogPos = async () => {
    setLoading(true);
    try{
      const [resSoc, resLog, resProv, resContactos] = await Promise.all([
              ClientesService.getSocHistorial(),
              ClientesService.getlogall(),
              ClientesService.getproveedoresall(),
              ClientesService.getcontactosall()
          ]);

          const logs = resLog.data;
          const soc = resSoc.data;
          console.log(resSoc.data)
          setcontactos(resContactos.data)
          const contactos=resContactos.data;
          const provs = resProv.data;

        const pMap = Object.fromEntries((provs || []).map(p => [String(p.no_de_proveedor || p.noProveedor).trim(), p.proveedor]));
        const cMap = Object.fromEntries((contactos || []).map(c => [String(c.unidaddeNegocio || c.unidad_de_negocio).trim(), c.gerenteBU]));
        const lMap = Object.fromEntries((soc || []).map(l => [String(l.foliott ).trim(), l]));
        const baseSocs = Array.isArray(logs) ? logs : Object.values(logs || {});
        const datosCombinados = baseSocs.map((s) => {
        const llaveBusqueda = String(s.nopo).trim();
        const editable = lMap[llaveBusqueda] || {};
        const reimpValor = (s.reimp !== undefined && s.reimp !== null) ? String(s.reimp).trim() : String(editable.reimp || "").trim();
        const reaValor = (s.rea !== undefined && s.rea !== null) ? String(s.rea).trim() : String(editable.rea || "").trim();
        const eaValor = (s.ubicacion_en_archivo !== undefined && s.ubicacion_en_archivo !== null) ? String(s.ubicacion_en_archivo).trim() : String(editable.ubicacion_en_archivo || "").trim();  

        return {
                ...s,
                id: s.id,
                nopo: s.nopo,
                asistentepos: s.asistentepos || usuarioLocal,
                no_de_proveedor : editable.no_de_proveedor,
                nombreProveedor: pMap[String(editable.no_de_proveedor).trim()] || '',
                nooc: editable.nooc || '',
                status_problema: editable.status_problema || '',
                unidad_de_negocio: editable.unidad_de_negocio || '',
                rea: reaValor,
                reimp: reimpValor,
                ubicacion_en_archivo: eaValor,
                gte_responsable_bu: cMap[String(editable.unidad_de_negocio).trim()] || '',
                fecha_de_emisionoc: editable.fecha_de_emisionoc || editable.fecha_de_emisionoc, 
                enviocolocacion: editable.enviocolocacion || s.enviocolocacion || '',
                enviosap: editable.enviosap, 
                enviodp: editable.enviodp,
                enviodc: editable.enviodc,
                observaciones: s.observaciones || editable.observaciones || '',
                fecha_revisado: editable.fecha_de_emisionrea || s.fecha_de_emisionrea || '',
                promesa_de_embarque_proforma: editable.promesa_de_embarque_proforma || s.promesa_de_embarque_proforma || '',
                numero_reimp: s.numero_reimp || "0", 
                fecha_recibo_log: s ? s.fecha_recibo_log: '',
                status_reimp: (s && s.status_reimp) ? s.status_reimp : 'Abierta',
                enviada: editable.envio_de_laocal_proveedoreoc,
                comentarios_reimp: s ? s.comentarios_reimp : '',
            }; 
        }); 
        const mRegistros = datosCombinados.filter(r => {
            const user = (usuarioActual || "").trim();
            return true;
        });
        setRegistros(mRegistros);

    } catch (error) {
        console.error("Error al cargar:", error);
    } finally {setTimeout(() => { setLoading(false); }, 100);}
}; 



  const processRowUpdate = (newRow, oldRow) => {
  const d = new Date();
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const seg = String(d.getSeconds()).padStart(2, '0');
  const fechaHora= `${anio}-${mes}-${dia} ${hora}:${min}:${seg}`;
  const hoyfecha= new Date().toISOString().split('T')[0];
  const reaValor = newRow.rea ? String(newRow.rea).trim() : "";
  const reimpValor = newRow.reimp ? String(newRow.reimp).trim() : "";
  const eaValor = newRow.ubicacion_en_archivo ? String(newRow.ubicacion_en_archivo || "").trim() : "";
  let numLogActual = String(newRow.numero_reimp || "0").trim();
  numLogActual = statusLog(numLogActual, reaValor, eaValor, reimpValor);
  
  let esREA= numLogActual.includes("R");
  let esEA=numLogActual.includes("EA");
  let sinFecha;
  if(esREA){
    sinFecha= newRow.status_reimp === 'Cerrada' && (newRow.fecha_revisado === null || newRow.fecha_revisado === '' || newRow.fecha_revisado === '-');
  }else if(esEA){
    sinFecha= newRow.status_reimp ==='Cerrada' && (newRow.promesa_de_embarque_proforma=== null || newRow.promesa_de_embarque_proforma==='' || newRow.promesa_de_embarque_proforma==='-');
  }
  else{
    sinFecha= newRow.status_reimp === 'Cerrada' && (newRow.enviada === null || newRow.enviada === '' || newRow.enviada === '-');
  }
  let filaCerrada = { ...newRow, numero_reimp: numLogActual, status_reimp: sinFecha ? 'Cerrada' : newRow.status_reimp, rea: reaValor, ubicacion_en_archivo:eaValor, reimp: reimpValor, fecha_recibo_log: fechaHora};
  let filaNueva = null;
  if (sinFecha) {
    const ultimoGuion = numLogActual.lastIndexOf('-');
    let siguienteNumLog = "";
    if (ultimoGuion !== -1) {
      const prefijoCompleto = numLogActual.substring(0, ultimoGuion);
      const numeroFinal = numLogActual.substring(ultimoGuion + 1);
      let contActual = parseInt(numeroFinal) || 0;
      siguienteNumLog = `${prefijoCompleto}-${contActual + 1}`;
    } else {
      const cont = parseInt(numLogActual) || 1;
        siguienteNumLog = String(cont + 1);
    }

    filaNueva = {
        ...newRow, 
        id: `TEMP-${newRow.foliott}-${siguienteNumLog}`,
        status_reimp: 'Abierta', numero_reimp: siguienteNumLog, reciboctrlpos_ctrl: hoyfecha, fecha_reciboctrl: hoyfecha, autorizacion_previa: null, 
         comentarios_reimp: '', rea: reaValor, ubicacion_en_archivo: eaValor, reimp:reimpValor, fecha_recibo_log: fechaHora
    }
    }
      setRegistros((prev)=>{
        const index = prev.findIndex(r => r.id === newRow.id); 
        if (index === -1) return prev;
        const nuevaLista = [...prev];
        nuevaLista[index] = filaCerrada;
        if(sinFecha && filaNueva){
          nuevaLista.splice(index + 1, 0, filaNueva);
        }
        return nuevaLista;
      });
      const{id, ...datos}=filaCerrada;
      if (String(id).includes('TEMP')) {
        ClientesService.saveLog(datos).then(()=>{
        }).catch((errr)=>{
          console.log(errr)
        })
      }else{
        ClientesService.saveLog(filaCerrada)
            .catch(err => console.log(err));
      }
    if(sinFecha){
      const { id, ...payload} = filaNueva;
      ClientesService.new_log(payload).then((res)=>{
        const idReal = res.data.id; 
        setRegistros(prev => prev.map(r => r.id === filaNueva.id ? { ...r, id: idReal } : r));
          }).catch((error)=>{
          console.log(error)
        })
      } 

      return filaCerrada;
  };

const filter = (e) => {
  if (e.target.id === "filtroUsuario") {
    setSearch(prev => ({
      ...prev,
      filtroUsuario: e.target.checked ? usuarioLocal : "ALL"
    }));
  } else {
    setSearch(prev => ({
      ...prev,
      filtroPo: e.target.value
    }));
  }
};
    return (
        <Box sx={{ p: 1 , marginLeft:'-5%' , width:'110%' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ color: '#e91e63' }}>Log PO's</h4>
                <button className="btn btn-secondary" onClick={() => window.history.back()}>
                    Volver a Socs
                </button>
            </div>
            <div style={{fontSize:'large'}} class="form-check form-switch">
              <input  onClick={(e)=>{filter(e)}}  class="form-check-input" type="checkbox" role="switch" id="filtroUsuario"/>
              <label class="form-check-label"  for="flexSwitchCheckDefault"> {search.filtroUsuario === "ALL" ?  "Mis registros" : "Todos los registros" }</label>
              <input onChange={(e)=>{filter(e)}} style={{marginLeft:'10%'}} placeholder='Filtro PO' id="filtroPO" type='number'/>
            </div>
            {loading ? (
                <CircularProgress/>
            ) : (
                <div style={{ height: '550px', width: '100%', backgroundColor: 'white', borderRadius: '8px', padding: '10px' }}>
                    <DataGrid
                    rows={  (registros || []).filter((p) => {
                        const filtroUsuario =
                          search.filtroUsuario === "ALL" ||
                          p.asistentepos === search.filtroUsuario;
                        const filtroPo =
                          search.filtroPo === "" || 
                          p.nopo.toString().includes(search.filtroPo);
                        return filtroUsuario && filtroPo;})}
                        columns={columns}
                        getRowId={(row) => row.id}
                        sortModel={sortModel}
                        processRowUpdate={processRowUpdate}
                        columnGroupingModel={gruposDeColumnas}
                        isCellEditable={(params) => params.row.status_reimp !== "Cerrada"}
                        checkboxSelection
                        onClipboardCopy={(copiedString) =>{ console.log("copiado"); setCopiedData(copiedString)}}
                        ignoreValueFormatterDuringExport
                    />
                </div>
            )}
        </Box>
    );
}
export default SocsLog