import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { Box, Dialog, DialogTitle, TextField } from '@mui/material';
import { ExportarExcel } from '../materialReutilizable/ExportarExcel'
import ClientesService from '../../service/ClientesService';

export default function TablaHistorialSOC({ datos }) {
  const [objMasiv, setobjMasiv] = useState({});
  const [objMasivhist, setobjMasivhist] = useState([]);
  const [filasOriginales, setFilasOriginales] = useState([]);
  const [filasFiltradas, setFilasFiltradas] = useState([]);
  const [fecha, setfecha] = useState()
  const [filtroColocador, setFiltroColocador] = useState('');
  const [filtroMoneda, setFiltroMoneda] = useState('');
  const [filtrMasivo, setfiltrMasivo] = useState('')
  const [dialogo,setdialogo] = useState(false)
  const [dialogo2,setdialogo2] = useState(false)
  useEffect(() => {
    if (datos && datos.length > 0) {
      setFilasOriginales(datos);
    }
  }, [datos]);
    useEffect(() => {
    let filtradas = filasOriginales;
    if (filtroColocador.trim() !== '') {
      filtradas = filtradas.filter((fila) =>
        fila.colocador?.toLowerCase().includes(filtroColocador.toLowerCase())
      );
    }
    if (filtroMoneda.trim() !== '') {
      filtradas = filtradas.filter((fila) =>
        fila.moneda?.toLowerCase().includes(filtroMoneda.toLowerCase())
      );
    }
    setFilasFiltradas(filtradas);
  }, [filasOriginales, filtroColocador, filtroMoneda]);
  const [sortModel, setSortModel] = useState([
    {
      field: "fecha_de_reciboactrlpos",
      sort: "desc",
    },
  ]);
  const opciones = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC"  };
  const columns = [
    { field: 'fecha_de_reciboactrlpos', headerName: "Fecha de Recibo a Ctrl PO's", width: 160 , valueFormatter: (params) => {
        if (!params) return '-'; 
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date === null ? '-' : date;

      }, headerClassName: "gris",},
    { field: 'status_problema', headerName: 'Status / Problema', width: 130  , headerClassName: "gris",},
    { field: 'unidad_de_negocio', headerName: 'Unidad de Negocio', width: 130, headerClassName: "gris"},
    { field: 'no_de_proveedor', headerName: 'No. De Proveedor', width: 110, headerClassName: "gris"},
    { field: 'foliott', headerName: 'Folio TT', width: 90, headerClassName: "gris"},
    { field: 'nooc', headerName: 'No. O.C.', width: 90, headerClassName: "gris"},
    { field: 'familia_del_producto', headerName: 'Familia del Producto', width: 120, headerClassName: "gris"},
    { field: 'full', headerName: 'Full', width: 90, headerClassName: "gris"},
    { field: 'fecha_de_emisionoc', headerName: 'Fecha de Emisión O.C.', width: 120 , valueFormatter: (params) => {
        if (!params) return '-'; 
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date === null ? '-' : date; }, headerClassName: "gris"},
    { field: 'rea', headerName: 'R/EA', width: 90, headerClassName: "gris"},
    { field: 'fecha_de_emisionrea', headerName: 'Fecha de Emisión R/EA', width: 120 , valueFormatter: (params) => {
        if (!params) return '-'; 
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date === null ? '-' : date;
     }, headerClassName: "gris"},
    { field: 'fecha_de_embarque_de_laoc', headerName: 'Fecha de Embarque de la O.C.', width: 140 , valueFormatter: (params) => {
        if (!params) return '-'; 
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date === null ? '' : date;

     }, headerClassName: "gris"},
    { field: 'envio_de_laocal_proveedoreoc', headerName: 'Envío de la O.C. al Proveedor (E.O.C.)', width: 180 , valueFormatter: (params) => {
        if (!params) return '-'; 
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date === null ? '' : date;

    }, headerClassName: "gris"},
    { field: 'control_interno', headerName: 'Control Interno', width: 120, headerClassName: "gris"},
    { field: 'status_de_embarque', headerName: 'Status de Embarque', width: 140, headerClassName: "gris"},
    { field: 'observaciones', headerName: 'OBSERVACIONES', width: 180, headerClassName: "gris"},
     { field: 'reporte_con_problemas', headerName: 'Reporte con Problemas', width: 140, headerClassName: "gris"},
    { field: 'colocador', headerName: 'FABRICA', width: 90, headerClassName: "gris"},
    { field: 'puerto_de_embarque', headerName: 'Puerto de Embarque', width: 140, headerClassName: "gris"},
    { field: 'monto_de_po', headerName: 'Monto de PO', width: 90, headerClassName: "gris", valueFormatter: (params) => {
    if (params === null) return '';
    return params.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    })}},
    { field: 'moneda', headerName: 'Moneda', width: 90, headerClassName: "gris"},
    { field: 'asistentepos', headerName: "Asistente PO's", width: 90, headerClassName: "gris"},
  ];
const guardarCambios = () =>{
//   // POs Masivas
 Object.keys(objMasiv).forEach(key => {
          ClientesService.putNuevoSOC(objMasiv[key].id, objMasiv[key]).then(()=>{
          }).catch((error)=>{
            console.log(error);
  })
 })
//         //   // Historial
   objMasivhist.map(itemhist =>               
           ClientesService.postHistorialSOC(itemhist).then(()=>{
            }).catch((error)=>{
              console.log(error)
 }))
 setobjMasiv({});
 setobjMasivhist([]);  
 setdialogo2(false);
};
const guardarfecha = (e) => { 
  const hoydate = new Date();
  const dd = String(hoydate.getDate()).padStart(2, '0');
  const mm = String(hoydate.getMonth() + 1).padStart(2, '0');
  const yy = String(hoydate.getFullYear()).slice(-2);
  const fecha = `${dd}.${mm}.${yy}`;
  const d = new Date(e.target.value);
  const hoy = d.toISOString().split("T")[0];
  setfecha(hoy);
  const prevObj = structuredClone(objMasiv); 
  const historial = [];
  const nuevo = {};
  Object.keys(prevObj).forEach(key => {
    const cadena = prevObj[key].observaciones;
    const nuevaObs = cadena.slice(0, 8).includes(".")? cadena.slice(9) : cadena;
    nuevo[key] = {
      ...prevObj[key],
      observaciones: nuevaObs,
      control_interno: "Gest. Documental",
      [e.target.name]: hoy
    };
    historial.push({
      registro: hoy,
      foliott: prevObj[key].foliott,
      nooc: prevObj[key].nooc,
      unidadde_negocio: prevObj[key].unidad_de_negocio,
      comentarios: "GD " + fecha + " " + nuevaObs,
      usuario: localStorage.getItem("username")
    });
  });
  setobjMasiv(nuevo);
  setobjMasivhist(prev => [...prev, ...historial]);
};

const handleClose = () => {
    setdialogo(false);
  };
const handleClose2 = () => {
    setdialogo2(false);
  };
const abrirsegunda = ()=>{
  const posSep = filtrMasivo.split("\n")
  posSep.map(item => {
      ClientesService.getsocsR(item).then((response)=>{
        setobjMasiv(prev => ({
          ...(prev || {}),
          [response.data.id]: response.data
        }));
      }).catch((err)=>{
        console.log(err)
      })
  })
  setdialogo(false)  
  setdialogo2(true)
}
  if (dialogo) {
    return (
      <Dialog onClose={handleClose} open={dialogo}>
        <DialogTitle>Pega POs a modificar Masivo </DialogTitle>
        <div style={{ height: "250px", width: "300px" , backgroundColor: 'transparent',boxShadow: "none",}}>
          &nbsp;&nbsp;
          <textarea
            className="filtroPOs"
            style={{ width: "280px", height: "180px" }}
            placeholder="pega POs"
            onChange={(e)=>{setfiltrMasivo(e.target.value)}}
          ></textarea>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button
            onClick={() => { abrirsegunda();}} className="btn btn-success" >{" "} Confirmar{" "}</button>
          <button style={{ marginLeft: "10px" }}
            className="btn btn-danger"
            onClick={handleClose}
          > Cancelar{" "}</button>
        </div>
        <br></br>
      </Dialog>
    );
  }
    if (dialogo2) {
    return (
      <Dialog onClose={handleClose2} open={dialogo2} style={{backgroundColor: "rgba(255,255,255,0.3)",  backdropFilter: "blur(8px)",}}>
        <DialogTitle>Pega POs a modificar Masivo </DialogTitle>
        <div style={{ border:'solid black 2px', padding:'2%', height: "350px", width: "600px" , backgroundColor: 'transparent', boxShadow: "none",}}>
          <label style={{border:'dotted black 1px',padding:'1%'}}>  {filtrMasivo}</label>
          <br ></br>
            <label style={{padding:'2%'}}>Control Interno</label>
            <input disabled value="Gest. Documental" />
            <br></br>
            <label style={{padding:'2%'}}>Envío de la O</label>
            <input type='date' name='envio_de_laocal_proveedoreoc'  onChange={(e)=>{guardarfecha(e)}} /><br></br>
            <label style={{padding:'2%'}}>Fecha Revisado</label>
            <input type='date' name='fecha_de_emisionrea' onChange={(e)=>{guardarfecha(e)}} />
            <br></br>
            <label style={{color:'red'}}><b>Observaciones será modificado</b></label>
          <div  style={{marginTop:'2%'}}>
          <button onClick={() => { guardarCambios();}} className="btn btn-success" >{" "} Guardar Cambios{" "}</button>
          <button style={{ marginLeft: "10px" }}
            className="btn btn-danger"
            onClick={handleClose2}
          > Cancelar{" "}</button>
          </div>
        </div>
        <br></br>
      </Dialog>
    );
  }

  return (
    <Box sx={{ marginLeft: "-10%", width: '120%',
          "& .MuiDataGrid-columnHeaderTitle": {
            whiteSpace: "normal",
            lineHeight: "normal",
          },
          "& .MuiDataGrid-columnHeader": {
            borderBottom: '1px solid #A6A6A6',
             borderRight: '1px solid #A6A6A6',
          },
          "& .MuiDataGrid-columnHeaders": {
            maxHeight: "168px !important",
          },
          "& .MuiDataGrid-cell": {
            borderRight: '1px solid #F2F2F2',  
            borderBottom: '1px solid #F2F2F2', 
          },
        
     }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <ExportarExcel columns={columns} rows={filasFiltradas} fuente="soc"/ >

      <button className='btn btn' onClick={()=>{setdialogo(true)}} style={{backgroundColor:'#5a70cfff'}}>masivas</button>
      </Box>
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={filasFiltradas}
          columns={columns}
          getRowId={(row) => row.id || `${row.nooc}-${row.foliott}`}
          sortModel={sortModel}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 50 },
            },
          }}
          pageSizeOptions={[50, 100 ]}
        />
      </Box>
    </Box>
  );
}
