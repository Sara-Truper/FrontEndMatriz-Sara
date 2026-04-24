import React, { useEffect, useState , useRef} from 'react';
import ClientesService from '../../service/ClientesService';
import { DataGrid } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import { useCallback } from 'react';

function SocsLog() {
    const [registros, setRegistros] = useState([]);
    const [registrosOriginales, setRegistrosOriginales] = useState([]);
    const[allLog, setLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarTablaLog, setMostrarTablaLog] = useState(false);
    const [contactos ,setcontactos] = useState([]);
    const [visibilidadSOC,setvisibilidadSOC] = useState(true)    
    const usuarioLocal = localStorage.getItem("username");
    const opciones = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" };
    const [usuarioActual, setUsuarioActual] = useState(localStorage.getItem("username") || "");

    const buscadorRef = useRef(null);

    const columns = [
        //REFERENCIA PO
        { field: 'asistentepos', headerName: "Asistente PO's", width: 120, headerClassName: "gris" },
        { field: 'no_de_proveedor', headerName: 'No. De Proveedor', width: 130, headerClassName: "gris" },
        { field: 'nombreProveedor', headerName: 'Proveedor', width: 200, headerClassName: "gris" }, 
        { field: 'nopo', headerName: 'No. P.O.', width: 110, headerClassName: "gris" },
        { field: 'nooc', headerName: 'No. N.L.', width: 110, headerClassName: "gris" },
        { field: 'status_problema', headerName: 'Status / Problema', width: 150, headerClassName: "gris" },
        { field: 'unidad_de_negocio', headerName: 'Unidad de Negocio', width: 150, headerClassName: "gris" },
        { field: 'gte_responsable_bu', headerName: 'Gerente', width: 150, headerClassName: "gris" },
        { field: 'rea', headerName: 'R/EA', width: 90, headerClassName: "gris" },
    
        //FECHA DE COLOCACIÓN
        { field: 'fecha_de_emisionoc', headerName: 'Fecha Emisión', width: 140, headerClassName: "gris", 
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'autorizacion_previa', headerName: 'Autorización Previa', width: 150, headerClassName: "gris", type: 'date', editable: true,
          valueGetter: (value) => value ? new Date(value) : null 
        },
    
        { field: 'colovacionVSimpresion', headerName: 'Dif. Coloc vs Imp', width: 150, headerClassName: "gris" },
    
        //FECHA DE IMPRESIÓN
        { field: 'fechaInicial', headerName: 'Fecha Inicial', width: 140, headerClassName: "gris",
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'reciboctrlpos', headerName: 'Entrega SAP a CD', width: 140, headerClassName: "gris",
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },
        { field: 'diasTranscurridos', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", renderCell: (params) => {
            const fila = params.row;
            if (!fila) return <span style={{ color: '#ccc' }}>-</span>;
            const fEmision = fila.fechaInicial; 
            const fRecibo = fila.reciboctrlpos;
    
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
    
        //CONTROL DOCUMENTAL
        { field: 'reciboctrlpos_ctrl', headerName: 'Fecha de Recibo a Ctrl PO\'s', width: 160, headerClassName: "gris",
        renderCell: (params) => {
            const fechaOriginal = params.row?.reciboctrlpos;
            if (!fechaOriginal) return "-";
            try {
                return new Date(fechaOriginal).toLocaleDateString("es-MX", opciones);
            } catch (error) {
                return "-";
            }
        }
    },
        { field: 'fechaFinal', headerName: 'Fecha Final', width: 140, headerClassName: "gris",
          renderCell: (params) => {
            const fila = params?.row;
            if (!fila || !fila.observaciones) return "";
    
            const regexFecha = /^(\d{2})\.(\d{2})\.(\d{2})/;
            const coincidencia = fila.observaciones.trim().match(regexFecha);
    
            if (coincidencia) {
                const [, d, m, a] = coincidencia;
                const fechaObjeto = new Date(`20${a}-${m}-${d}T00:00:00Z`);
                const opciones = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" };
                return fechaObjeto.toLocaleDateString("es-MX", opciones);
            }
            return "";
        }, 
    },
        { field: 'tiempo', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", renderCell: (params) => {
            const fila = params.row;
            if (!fila || !fila.observaciones || !fila.reciboctrlpos) return "-";
            const inicio = new Date(fila.reciboctrlpos);
    
            const regexFecha = /^(\d{2})\.(\d{2})\.(\d{2})/;
            const coincidencia = fila.observaciones.trim().match(regexFecha);
            if (!coincidencia) return "-";
    
            const [, d, m, a] = coincidencia;
            const fin = new Date(`20${a}-${m}-${d}T00:00:00Z`);
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                return "-";
            }
            inicio.setHours(0,0,0,0);
            fin.setHours(0,0,0,0);
            const diff = fin.getTime() - inicio.getTime();
            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            return dias >= 0 ? `${dias} días` : "";
        }
    },
        { field: 'comentarios_doc', headerName: 'Comentarios', width: 180, headerClassName: "gris", editable: true,},
    
        //DIRECCIÓN PLANEACIÓN
        { field: 'fein', headerName: 'Fecha Inicial', width: 140, headerClassName: "gris", renderCell: (params) => {
            const fila = params?.row;
            if (!fila || !fila.observaciones) return "";
            const regex = /^(\d{2})\.(\d{2})\.(\d{2})/;
            const match = fila.observaciones.trim().match(regex);
            if (match) {
                const [, d, m, a] = match;
                const fechaObj = new Date(`20${a}-${m}-${d}T00:00:00Z`);
                return fechaObj.toLocaleDateString("es-MX", opciones);
            }
            return "";
        } },
        { field: 'fecha_final_plan', headerName: 'Fecha Final', width: 140, headerClassName: "gris", type: 'date', editable: true,valueGetter: (value) => value ? new Date(value) : null },
        { field: 'tiemp', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", renderCell: (params) => {
          const fila = params?.row;
          if (!fila || !fila.observaciones || !fila.fecha_final_plan) return "-";
          const match = fila.observaciones.trim().match(/^(\d{2})\.(\d{2})\.(\d{2})/);
          if (!match) return "-";
    
          const [, d, m, a] = match;
          const fechaInicio = new Date(`20${a}-${m}-${d}T00:00:00Z`);
          const fechaFin = new Date(fila.fecha_final_plan);
    
          fechaInicio.setUTCHours(0,0,0,0);
          fechaFin.setHours(0,0,0,0);
    
          if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) return "-";
          const dif = fechaFin.getTime() - fechaInicio.getTime();
          const dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    
          return dias >= 0 ? `${dias} días` : "";
        }},
        { field: 'comentarios_plan', headerName: 'Comentarios', width: 180, headerClassName: "gris", editable: true },
    
        //DIRECCIÓN COMPRAS
        //fecha inicial misma fecha final dir plan //{ field: 'fefi', headerName: 'Fecha Final', width: 140, headerClassName: "gris", type: 'date', editable: true },
        { field: 'fei', headerName: 'Fecha Inicial', width: 140, headerClassName: "gris", renderCell: (params) => {
          const fecha= params.row?.fecha_final_plan;
          if (!fecha) return "";
          try { return new Date(fecha).toLocaleDateString("es-MX", opciones);} catch (error) { return "";}
        }},
        { field: 'fecha_final_compras', headerName: 'Fecha Final', width: 140, headerClassName: "gris", type: 'date', editable: true, valueGetter: (value) => value ? new Date(value) : null },
        { field: 'tiem', headerName: 'Tiempo Real', width: 120, headerClassName: "gris", renderCell: (params) => {
          const fila = params?.row;
            if (!fila || !fila.fecha_final_plan || !fila.fecha_final_compras) return "-";
            const inicio = new Date(fila.fecha_final_plan);
            const fin = new Date(fila.fecha_final_compras);
            inicio.setHours(0,0,0,0);
            fin.setHours(0,0,0,0);
    
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return "-";
            const dif = fin.getTime() - inicio.getTime();
            const dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    
            return dias >= 0 ? `${dias} días` : "";
        }},
        { field: 'comentarios_compras', headerName: 'Comentarios', width: 180, headerClassName: "gris", editable: true },
    
        //REIM
        {field: 'numero_reimp', headerName: '# de REIMP', width: 150, headerClassName: "gris", editable: true},
        {field: 'comentarios_reimp', headerName: 'Comentarios', width: 150, headerClassName: "gris", editable: true},
        {field: 'status_reimp', headerName: 'Status REIMP', width: 150, headerClassName: "gris", type: "singleSelect", valueOptions: ["Abierta", "Cerrada"], editable: true, renderCell: (params) => params.value || "Abierta" },
    
        //ENVÍO PREVIAS
        { field: 'enviada', headerName: 'Enviada', width: 120, headerClassName: "gris", 
          renderCell: (params) => {
            const enviada = params.row.envio_de_laocal_proveedoreoc;
            if (!enviada) return "";
                return new Date(enviada).toLocaleDateString("es-MX", opciones);}
        },
        { field: 'dias', headerName: 'Días Totales', width: 120, headerClassName: "gris", 
          renderCell: (params) => {
            const fila = params.row;
            if (!fila || !fila.fecha_de_emisionoc || !fila.envio_de_laocal_proveedoreoc) return "-";
            const inicio = new Date(fila.fecha_de_emisionoc);
            const fin = new Date(fila.envio_de_laocal_proveedoreoc);
            inicio.setHours(0,0,0,0);
            fin.setHours(0,0,0,0);
    
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return "-";
            const dif = fin.getTime() - inicio.getTime();
            const dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    
            return dias >= 0 ? `${dias} días` : "";
          }
        },
        //BOTÓN
        {
    field: 'action',
    headerName: 'Acc',
    width: 120,
    headerClassName: "gris",
    renderCell: (params) => (
<button
            onClick={() => guardarLog(params.row)}
>
            Actualizar
</button>
    ),
}
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
          { field: 'fecha_de_emisionoc' },
          { field: 'autorizacion_previa' },
          { field: 'colovacionVSimpresion' }
        ],
      },
      {
        groupId: 'impresion',
        headerName: 'FECHA DE IMPRESIÓN DE P.O. (SAP)',
        headerClassName: "azul",
        headerAlign: 'center',
        children: [
          { field: 'fechaInicial' },
          { field: 'reciboctrlpos' },
          { field: 'diasTranscurridos' }
        ],
      },
      {
        groupId: 'control',
        headerName: 'CONTROL DOCUMENTAL',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
          { field: 'reciboctrlpos_ctrl' },
          { field: 'fechaFinal' },
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
          { field: 'fein' },
          { field: 'fecha_final_plan' },
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
          { field: 'fei' },
          { field: 'fecha_final_compras' },
          { field: 'tiem' },
          { field: 'comentarios_compras' }
        ],
      },
      {
        groupId: 'reimp',
        headerName: 'REIMP #',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
          { field: 'numero_reimp' },
          { field: 'comentarios_reimp' },
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
          { field: 'dias' },
          {field: 'action' }
        ],
      },
    ];

    const guardarLog = async (row) => {
    try {
        const datosLog = {
            nopo: row.nopo || row.foliott, 
            comentarios_doc: row.comentarios_doc || "",
            comentarios_plan: row.comentarios_plan || "",
            comentarios_compras: row.comentarios_compras || "",
            comentarios_reimp: row.comentarios_reimp || "",
            status_reimp: row.status_reimp || 'Abierta',
            numero_reimp: String(row.numero_reimp || "0"),
            autorizacion_previa: row.autorizacion_previa,
            fecha_final_plan: row.fecha_final_plan,
            fecha_final_compras: row.fecha_final_compras,
            asistentepos: row.asistentepos
        };
//console.log(datosLog);
        const response = await ClientesService.saveLog(datosLog);

        if (response.status === 200 || response.status === 201) {
            alert(`Registro ${row.foliott} guardado`);
            const resActualizada = await ClientesService.getlogall();
            setLog(resActualizada.data); 
            
            setRegistros((prev) => 
                prev.map((r) => (r.foliott === row.foliott ? { ...r, ...datosLog } : r))
            );
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

useEffect(() => {
        handleVerLogPos();
    }, []);


const handleVerLogPos = async () => {
    setLoading(true);
    try {
        //const response = await ClientesService.getlogall();
        //const logs = response.data;
        const [resSoc, resLog, resProv, resContactos] = await Promise.all([
                ClientesService.getSocHistorial(),
                ClientesService.getlogall(),
                ClientesService.getproveedoresall(),
                ClientesService.getcontactosall()
            ]);

            const logs = resLog.data;
            const soc = resSoc.data;
            setcontactos(resContactos.data)
            const contactos=resContactos.data;
            const provs = resProv.data;

        // console.log("Datos soc:", soc);
        // console.log("Datos log:", logs);
        const pMap = Object.fromEntries((provs || []).map(p => [String(p.no_de_proveedor || p.noProveedor).trim(), p.proveedor]));
        const cMap = Object.fromEntries((contactos || []).map(c => [String(c.unidaddeNegocio || c.unidad_de_negocio).trim(), c.gerenteBU]));
        const lMap = Object.fromEntries((logs || []).map(l => [String(l.nopo || l.noPo).trim(), l]));
        const baseSocs = Array.isArray(soc) ? soc : Object.values(soc || {});

        const datosCombinados = baseSocs.map((s) => {
            const llaveBusqueda = String(s.foliott).trim();
            const editable = lMap[llaveBusqueda]; 
            
            return {
                ...s,
                id: s.id,
                nopo: s.foliott,
                //noPo: s.foliott,
                asistentepos: s.asistentepos || usuarioLocal,
                nombreProveedor: pMap[String(s.no_de_proveedor).trim()] || '',
                nooc: s.nooc || '',
                status_problema: s.status_problema || '',
                unidadDeNegocio: s.unidad_de_negocio || '',
                gte_responsable_bu: cMap[String(s.unidad_de_negocio).trim()] || '',
                fecha_de_emisionoc: s.fechaEmision || s.fecha_de_emisionoc, 
                fechaInicial: s.fechaEmision || s.fecha_de_emisionoc,
                reciboctrlpos: s.fecha_de_reciboactrlpos || '',
                
                // Datos del log
                colovacionVSimpresion: editable ? editable.colovacionVSimpresion : '',
                comentarios_doc: editable ? editable.comentarios_doc : '',
                fecha_final_plan: editable ? editable.fecha_final_plan : null,
                comentarios_plan: editable ? editable.comentarios_plan : '',
                fecha_final_compras: editable ? editable.fecha_final_compras : null,
                comentarios_compras: editable ? editable.comentarios_compras : '',
                autorizacion_previa: editable ? editable.autorizacion_previa : null,
                
                numero_reimp: (editable && editable.numero_reimp) ? editable.numero_reimp : '0', 
                status_reimp: (editable && editable.status_reimp) ? editable.status_reimp : 'Abierta',
                comentarios_reimp: editable ? editable.comentarios_reimp : '',
            }; 
        }); 
        const mRegistros = datosCombinados.filter(r => {
            const user = (usuarioActual || "").trim();
            if (user === 'prueba' || user === "" ) return true; 
            return r.asistentepos?.trim() === user;
        });
        // console.log("Registros finales a mostrar:", mRegistros);
        setRegistros(mRegistros);
        //setvisibilidadSOC(true);
        //setLog(logs); 
        //if (typeof setMostrarTablaLog === "function") setMostrarTablaLog(true);
    } catch (error) {
        console.error("Error al cargar:", error);
    } finally {setTimeout(() => { setLoading(false); }, 500);}
}; 

const processRowUpdate = (newRow) => {
              //await guardarLog(newRow);   
      const sinFecha = newRow.status_reimp === 'Cerrada' && (!newRow.envio_de_laocal_proveedoreoc);
        const idActual = newRow.id;
      setRegistros((prev)=>{
        const filaCerrada = { ...newRow, status_reimp: sinFecha ? 'Cerrada' : newRow.status_reimp};
        const index = prev.findIndex(r => r.id === idActual); 
        if (index === -1) return prev;
        const nuevaLista = [...prev];
        nuevaLista[index] = filaCerrada;
      if (sinFecha) {
            const numActual = parseInt(newRow.numero_reimp) || 0;
            const siguienteNum = numActual + 1;
    
            const filaNueva = {
                ...newRow, 
                id: `TEMP-${newRow.foliott}-${siguienteNum}`,
                status_reimp: 'Abierta', numero_reimp: siguienteNum, autorizacion_previa: null, 
                comentarios_doc: '', fecha_final_plan: null, comentarios_plan: '', fecha_final_compras: null, comentarios_compras: '', comentarios_reimp: ''
            }
            nuevaLista.splice(index + 1, 0, filaNueva);
      }
    return nuevaLista;
    });
        //console.log(newRow);

        return newRow;
    };


    return (
        <Box sx={{ p: 3 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ color: '#e91e63' }}>Log PO's</h4>
                <button className="btn btn-secondary" onClick={() => window.history.back()}>
                    Volver a Socs
                </button>
            </div>

            {loading ? (
                <CircularProgress/>
            ) : (
                <div style={{ height: '600px', width: '100%', backgroundColor: 'white', borderRadius: '8px', padding: '10px' }}>
                    <DataGrid
                        rows={registros}
                        columns={columns}
                        getRowId={(row) => row.id || row.foliott}
                        processRowUpdate={processRowUpdate}
                        columnGroupingModel={gruposDeColumnas}
                        disableSelectionOnClick
                        //autoHeight={false}
                        //pageSize={10}
                        //rowsPerPageOptions={[registros.length]}
                    />
                </div>
            )}
        </Box>
    );
}
export default SocsLog