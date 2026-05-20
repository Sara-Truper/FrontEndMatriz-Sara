import React, { useEffect, useState , useRef} from 'react';
import ClientesService from '../../service/ClientesService';
import { DataGrid } from '@mui/x-data-grid';
import { Box, CircularProgress, responsiveFontSizes } from '@mui/material';
import { useCallback } from 'react';
import { CompressOutlined } from '@mui/icons-material';
import { width } from '@mui/system';

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
        { field: 'autorizacion_previa', headerName: 'Autorización Previa', width: 140, headerClassName: "gris", 
          valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : '-' },

        { field: 'colovacionVSimpresion', headerName: 'Dif. Coloc vs Imp', width: 150, headerClassName: "gris" },
    
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
    
        { field: 'reciboctrlpos_ctrl', headerName: 'Fecha de Recibo a Ctrl PO\'s', width: 160, headerClassName: "gris",
        renderCell: (params) => {
            const fechaOriginal = params.row?.fecha_reciboctrl ||params.row?.reciboctrlpos_ctrl ||params.row?.reciboctrlpos;
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
        
        {field: 'ubicacion_en_archivo', headerName:'EA', width:180,headerClassName:"gris"},
        {field: 'numero_reimp', headerName: '# Log', width: 150, headerClassName: "gris"},
        {field: 'status_reimp', headerName: 'Status', width: 150, headerClassName: "gris", type: "singleSelect", valueOptions: ["Abierta", "Cerrada"], editable: (params) => params.row.status_reimp !== "Reimpresión Cerrada", renderCell: (params) => params.value || "Abierta" },
        {field: 'comentarios_reimp', headerName: 'Comentarios', width: 150, headerClassName: "gris", editable: true},

        { field: 'enviada', headerName: 'Enviada', width: 140, headerClassName: "gris",
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
        headerName: 'STATUS',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
          {field:'ubicacion_en_archivo'},
          { field: 'numero_reimp' },
          { field: 'status_reimp' },
          { field: 'comentarios_reimp' }
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

useEffect(() => {
        handleVerLogPos();
    }, []);


const handleVerLogPos = async () => {
    setLoading(true);
    try {
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

        const pMap = Object.fromEntries((provs || []).map(p => [String(p.no_de_proveedor || p.noProveedor).trim(), p.proveedor]));
        const cMap = Object.fromEntries((contactos || []).map(c => [String(c.unidaddeNegocio || c.unidad_de_negocio).trim(), c.gerenteBU]));
        const lMap = Object.fromEntries((soc || []).map(l => [String(l.foliott ).trim(), l]));
        const baseSocs = Array.isArray(logs) ? logs : Object.values(logs || {});
        const datosCombinados = baseSocs.map((s) => {
            const llaveBusqueda = String(s.nopo).trim();
            const editable = lMap[llaveBusqueda]; 
            const reaValor = editable.rea ? String(editable.rea).trim() : "";
            const eaValor = editable.ubicacion_en_archivo ? String(editable.ubicacion_en_archivo).trim() : "";
            let numLogActual = (s && s.numero_reimp) ? String(s.numero_reimp).trim() : "0";
            if ((!reaValor || reaValor==="") && (!eaValor || eaValor==="0")) {
                    if (numLogActual.includes('-')) {
                        numLogActual = String(parseInt(numLogActual.split('-').pop()) || 0);
                    }
                } else if(reaValor && (!eaValor || eaValor==="0")) {
                  //Si reaValor es 1, busca ^R1-\d+$ (R1, guion, numero)
                    const regexFormato = new RegExp(`^R${reaValor}-\\d+$`);
                    if (!regexFormato.test(numLogActual)) {
                        let contador = 0;
                        if (numLogActual.includes('-')) {
                            contador = parseInt(numLogActual.split('-').pop()) || 0;
                        } else {
                            contador = parseInt(numLogActual.replace(/[^0-9]/g, '')) || 0;
                        }
                        numLogActual = `R${reaValor}-${contador}`;
                    }
                } else if((reaValor && eaValor ==="1")|| (!reaValor && eaValor==="1")){
                  const regexF = new RegExp(`^EA-\\d+$`);
                  if (!regexF.test(numLogActual)) {
                      let cont = 0;
                      if (numLogActual.includes('-')) {
                          cont = parseInt(numLogActual.split('-').pop()) || 0;
                      } else {
                          cont = parseInt(numLogActual.replace(/[^0-9]/g, '')) || 0;
                      }
                      numLogActual = `EA-${cont}`;
                  }
                }

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
                ubicacion_en_archivo: editable.ubicacion_en_archivo,
                gte_responsable_bu: cMap[String(editable.unidad_de_negocio).trim()] || '',
                fecha_de_emisionoc: editable.fecha_de_emisionoc || editable.fecha_de_emisionoc, 
                fechaInicial: editable.fecha_de_emisionoc || s.fecha_de_emisionoc,
                reciboctrlpos: editable.fecha_de_reciboactrlpos || '',
                

                colovacionVSimpresion: s ? s.colovacionVSimpresion : '',
                comentarios_doc: s ? s.comentarios_doc : '',
                fecha_final_plan: s ? s.fecha_final_plan : null,
                comentarios_plan: s ? s.comentarios_plan : '',
                fecha_final_compras: s ? s.fecha_final_compras : null,
                comentarios_compras: s ? s.comentarios_compras : '',
                autorizacion_previa: s ? s.autorizacion_previa : null,
                
                numero_reimp: numLogActual, 
                status_reimp: (s && s.status_reimp) ? s.status_reimp : 'Abierta',
                enviada: editable.envio_de_laocal_proveedoreoc,
                comentarios_reimp: s ? s.comentarios_reimp : '',
            }; 
        }); 
        const mRegistros = datosCombinados.filter(r => {
            const user = (usuarioActual || "").trim();
            if (user === 'PruebasSOC' || user === "" ) return true; 
            return r.asistentepos?.trim() === user;
        });
        setRegistros(mRegistros);
    } catch (error) {
        console.error("Error al cargar:", error);
    } finally {setTimeout(() => { setLoading(false); }, 100);}
}; 

const processRowUpdate = (newRow) => {
      const hoyfecha= new Date().toISOString().split('T')[0];
      const sinFecha = newRow.status_reimp === 'Cerrada' && (newRow.enviada === null || newRow.enviada==='');
        const idActual = newRow.id;
        const reaValor = newRow.rea ? String(newRow.rea).trim() : "";
        const eaValor = newRow.ubicacion_en_archivo ? String(newRow.ubicacion_en_archivo).trim() : "";
        let numLogActual = newRow.numero_reimp ? String(newRow.numero_reimp).trim() : "0";
        let filaNueva = null;
        //let nume = parseInt(numLogActual) || 0;
        if ((!reaValor || reaValor==="") && (!eaValor || eaValor==="0")) {
            if (numLogActual.includes('-')) {
                numLogActual = String(parseInt(numLogActual.split('-').pop()) || 0);
            }
        } else if (reaValor && (!eaValor || eaValor==="0")){
            const regexFormato = new RegExp(`^R${reaValor}-\\d+$`);
            if (!regexFormato.test(numLogActual)) {
                let contador = 0;
                if (numLogActual.includes('-')) {
                    contador = parseInt(numLogActual.split('-').pop()) || 0;
                } else {
                    contador = parseInt(numLogActual.replace(/[^0-9]/g, '')) || 0;
                }
                numLogActual = `R${reaValor}-${contador}`;}
            }else if((reaValor && eaValor ==="1")|| (!reaValor && eaValor==="1")){
                  const regexF = new RegExp(`^EA${eaValor}-\\d+$`);
                  if (!regexF.test(numLogActual)) {
                      let cont = 0;
                      if (numLogActual.includes('-')) {
                          cont = parseInt(numLogActual.split('-').pop()) || 0;
                      } else {
                          cont = parseInt(numLogActual.replace(/[^0-9]/g, '')) || 0;
                      }
                      numLogActual = `EA-${cont}`;
                  }
        }
        let filaCerrada = { ...newRow, numero_reimp: numLogActual, status_reimp: sinFecha ? 'Cerrada' : newRow.status_reimp};
      if (sinFecha) {
            //const numActual = parseInt(newRow.numero_reimp) || 0;
            //const siguienteNum = numActual + 1;
    
            let siguienteNumLog = "";
            if ((!reaValor || reaValor==="") && (!eaValor || eaValor==="0")) {
                const baseNum = parseInt(numLogActual) || 0;
                siguienteNumLog = String(baseNum + 1);
            } else if (reaValor && (!eaValor || eaValor==="0")){
                const partes = numLogActual.split('-');
                const contadorActual = parseInt(partes[1]) || 0;
                siguienteNumLog = `R${reaValor}-${contadorActual + 1}`;
            } else if((reaValor && eaValor==="1") || (!reaValor && eaValor==="1")){
              const part=numLogActual.split('-');
              const cont=parseInt(part[1]) || 0;
              siguienteNumLog=`EA-${cont + 1}`;
            }

            filaNueva = {
                ...newRow, 
                id: `TEMP-${newRow.foliott}-${siguienteNumLog}`,
                status_reimp: 'Abierta', numero_reimp: siguienteNumLog, reciboctrlpos_ctrl: hoyfecha, fecha_reciboctrl: hoyfecha, autorizacion_previa: null, 
                comentarios_doc: '', fecha_final_plan: null, comentarios_plan: '', fecha_final_compras: null, comentarios_compras: '', comentarios_reimp: '', reciboctrlpos_ctrl: hoyfecha
            }
      }
      setRegistros((prev)=>{
        
        const index = prev.findIndex(r => r.id === idActual); 
        if (index === -1) return prev;
        const nuevaLista = [...prev];
        nuevaLista[index] = filaCerrada;
        if(sinFecha && filaNueva){
          nuevaLista.splice(index + 1, 0, filaNueva);
        }
        return nuevaLista;
    });
    if (sinFecha){
      ClientesService.saveLog(newRow).then(()=>{
        }).catch((errr)=>{
        console.log(errr)
      })
    }if (filaNueva){
      const { id, ...payload } = filaNueva;
      ClientesService.new_log(payload).then(()=>{
          }).catch((error)=>{
          console.log(error)
        })
    }
        return newRow;
  } ;

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
                        rows={registros || []}
                        columns={columns}
                        getRowId={(row) => row.id || row.foliott}
                        processRowUpdate={processRowUpdate}
                        columnGroupingModel={gruposDeColumnas}
                        disableSelectionOnClick
                        isCellEditable={(params) => params.row.status_reimp !== "Cerrada"}

                    />
                </div>
            )}
        </Box>
    );
}
export default SocsLog