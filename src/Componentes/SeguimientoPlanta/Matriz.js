import { DataGrid, GridCellEditStopReasons } from '@mui/x-data-grid';
import Box from "@mui/material/Box";
import ClientesService from '../../service/ClientesService';
import { useEffect, useState } from 'react';
import { Checkbox } from '@mui/material';
import { Placeholder } from 'react-bootstrap';

function Matriz(){
  const [registros, setRegistros]=useState([]);
  
  useEffect(() => {
    handleVerControlPIs();
  }, []);
  
  const handleVerControlPIs = async () => {
    try{
      const [resControlPIs, resBufferPlanta, resCodigosPlan] = await Promise.all([
        ClientesService.getControlPIsAll(),
        ClientesService.getBufferPlantaAll(),
        ClientesService.getCodigosPlaneadorAll()
      ]);
  
      const pis = resControlPIs.data;
      const bufferP = resBufferPlanta.data;
      const codiPlan= resCodigosPlan.data;

      //planeador por codigo
      const pMap=Object.fromEntries((codiPlan || []).map(c=>[String(c.item).trim(), c.nombre_planner]));
      const cMap=Object.fromEntries((bufferP || []).map(c=>[String(c.po).trim(), c.codigo]));
      const fMap=Object.fromEntries((bufferP || []).map(f=>[String(f.po).trim(), f.prov]));
      const etdMap=Object.fromEntries((bufferP || []).map(f=>[String(f.po).trim(), f.etd]));
      const familiaMap=Object.fromEntries((bufferP || []).map(f=>[String(f.po).trim(), f.clave]));

      const basePIs = Array.isArray(pis) ? pis : Object.values(pis || {});
      const datosCombinados = basePIs.map((p, index) => {
        const llaveBusqueda = String(p.nopo).trim();
        //const codigoEncontrado= cMap[llaveBusqueda] || '';

        const fabricaEncontrada=fMap[llaveBusqueda] || '';
        const etdEncontrado=etdMap[llaveBusqueda] || '';
        return {
          ...p,
          id: p.id,
          nopo: p.nopo,
          planeador: pMap[String(cMap[llaveBusqueda] || '').trim()] || '',
          etdpo: (etdEncontrado).split('-').reverse().join('/') || '',
          familia: familiaMap[llaveBusqueda] || '',
          razonsocial:p.razonsocial || "MAL",
          incoterm: p.incoterm || "MAL",
          puerto: p.puerto || "MAL",
          terminopago: p.terminopago || "MAL",
          cantidad: p.cantidad || "MAL",
          precio: p.precio || "MAL",
          etd: p.etd || "MAL",
          comentarios: p.comentarios || ""
        }; 
      }); 
      //console.log(datosCombinados)
      setRegistros(datosCombinados);
    } catch (error) {
        console.error("Error:", error);
    }
  };

  const handleCheckboxChange = async(id, checked, campo) => {
    const registroActual = registros.find((row) => row.id === id);
    if (!registroActual) return;

    const registroModificado= {...registroActual,  [campo]: checked ? "OK" : "MAL"}
    setRegistros((prev) => prev.map((row) => (row.id === id ? registroModificado : row)));
    try {
      await ClientesService.saveControlPIs(registroModificado);
    } catch (error) {
      console.error("Error:", error);
      setRegistros((prev) => prev.map((row) => (row.id === id ? registroActual: row)));
    }
  }

  const processRowUpdate= async (newRow, oldRow) => {
    await ClientesService.saveControlPIs(newRow);
    setRegistros((prev) => prev.map((row) => (row.id === newRow.id ? newRow : row)));
    return newRow;
  }

  const columns=[
    {field: "nopo", headerName: "NO. PO", width: 90,editable: false,headerClassName: "gris"},
    {field: "foliott",headerName: "Folio TT", width: 90, editable: false,headerClassName: "gris"},
    {field: "bu", headerName: "Unidad de Negocio", width: 90, editable: false, headerClassName: "gris"},
    {field: "comprador", headerName: "Comprador", width: 90, editable: false, headerClassName: "gris"},
    {field: "noproveedor", headerName: "# de Proveedor", width: 90, editable: false,headerClassName: "gris"},
    {field: "nombreprov", headerName: "Nombre del proveedor", width: 90, editable: false, headerClassName: "gris"},
    {field: "planeador", headerName: "Planeador", width: 150, editable: false, headerClassName: "gris"},
    {field: "tt", headerName: "TT", width: 90, editable: false, headerClassName: "gris"},
    {field: "dm", headerName: "D/M", width: 90, editable: false, headerClassName: "gris"},
    {field: "etdpo", headerName: "ETD PO", width: 105, editable: false, headerClassName: "gris"},
    {field: "etdpi", headerName: "ETD PI", width: 90, editable: false, headerClassName: "gris"},
    {field: "familia", headerName: "Familia", width: 140, editable: false, headerClassName: "gris"},
    {field: "razonsocial", headerName: "Razón Social", width: 70, editable: false, headerClassName: "gris",renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <Checkbox size="small" checked={params.row.razonsocial=== "OK"}
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked,"razonsocial")}/>
      </Box>)},
    {field: "incoterm", headerName: "Incoterm", width: 80, editable: false, headerClassName: "gris",
      renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <Checkbox size="small" checked={params.row.incoterm=== "OK"} onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked, "incoterm")}/>
      </Box>)
    },
    {field: "puerto", headerName: "Puerto", width: 70, editable: false, headerClassName: "gris",
      renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <Checkbox size="small" checked={params.row.puerto=== "OK"} 
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked, "puerto")}/>
      </Box>)
    },
    {field: "terminopago", headerName: "Términos de Pago", width: 80, editable: false, headerClassName: "gris",
      renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <Checkbox size="small" checked={params.row.terminopago=== "OK"} 
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked, "terminopago")}/>
      </Box>)
    },
    {field: "cantidad", headerName: "Cantidad", width: 80, editable: false, headerClassName: "gris",
      renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <Checkbox size="small" checked={params.row.cantidad=== "OK"} 
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked, "cantidad")}/>
      </Box>)
    },
    {field: "precio", headerName: "Precio", width: 70, editable: false, headerClassName: "gris",
      renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <Checkbox size="small" checked={params.row.precio=== "OK"} 
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked, "precio")}/>
      </Box>)
    },
    {field: "etd", headerName: "ETD", width: 60, editable: false, headerClassName: "gris",
      renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <Checkbox size="small" checked={params.row.etd=== "OK"} 
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked, "etd")}/>
      </Box>)
    },
    {field: "adicelim", headerName: "Adición Eliminación", width: 100, editable: false, headerClassName: "gris"},
    {field: "estatusproblema", headerName: "Estatus Problema", width: 250, editable: false, headerClassName: "gris",
      valueGetter: (value, row) => {
        const prob = [];
        if (row.razonsocial !== "OK") prob.push("Razón Social");
        if (row.incoterm !== "OK") prob.push("Incoterm");
        if (row.puerto !== "OK") prob.push("Puerto");
        if (row.terminopago !== "OK") prob.push("Términos de Pago");
        if (row.cantidad !== "OK") prob.push("Cantidad");
        if (row.precio !== "OK") prob.push("Precio");
        if (row.etd !== "OK") prob.push("ETD");
        return prob.length === 0 ? "OK" : prob.join(" "); 
      }
    },
    {field: "comentarios", headerName: "Comentarios", width: 250, editable: true, headerClassName: "gris"},
    {field: "fechainicial", headerName: "Fecha inicial (recepción)", width: 100, editable: true, type: "date", headerClassName: "gris"},
    {field: "fecharegistr", headerName: "Fecha registro", width: 100, editable: true, type: "date", headerClassName: "gris"},
    {field: "fecharev", headerName: "Fecha revisión", width: 100, editable: false, headerClassName: "gris"},
    {field: "tiemporev", headerName: "Tiempo Real", width: 100, editable: false, headerClassName: "gris"},
    {field: "fechainicialcompras", headerName: "Fecha inicial", width: 100, editable: false, headerClassName: "gris"},
    {field: "fechafinalcompras", headerName: "Fecha final", width: 90, editable: false, headerClassName: "gris"},
    {field: "tiemporealcompras", headerName: "Tiempo Real", width: 90, editable: false, headerClassName: "gris"},
    {field: "finicialplan", headerName: "Fecha inicial", width: 90, editable: false, headerClassName: "gris"},
    {field: "ffinalplan", headerName: "Fecha final", width: 90, editable: false, headerClassName: "gris"},
    {field: "tiemporealplan", headerName: "Tiempo Real", width: 90, editable: false, headerClassName: "gris"},
    {field: "enviada", headerName: "Enviada", width: 90, editable: false, headerClassName: "gris"},
    {field: "estatustiempo", headerName: "Estatus Tiempo", width: 90, editable: false, headerClassName: "gris"},
    {field: "diasproceso", headerName: "Días Totales Proceso", width: 90, editable: false, headerClassName: "gris"},
    {field: "diasatraso", headerName: "Días Totales de Atraso", width: 90, editable: false, headerClassName: "gris"},
    {field: "numliberacion", headerName: "# de liberación", width: 90, editable: false, headerClassName: "gris"},
  ]


  const gruposDeColumnas = [
    {
      groupId: 'sin',
      headerName: '',
      headerClassName: "blanco",
      headerAlign: 'center',
      children: [
        {field: 'nopo'},
        {field: 'foliott'},
        {field: 'bu'},
        {field: 'comprador'},
        {field: 'noproveedor'},
        {field: 'nombreprov'},
        {field: 'planeador'},
        {field: 'tt'},
        {field: 'dm'},
        {field: 'etdpo'},
        {field: 'etdpi'},
        {field: 'familia'}
      ],
    },
    {
      groupId: 'revision',
      headerName: 'REVISIÓN',
      headerClassName: "area",
      headerAlign: 'center',
      children: [
        { field: 'razonsocial' },
        { field: 'incoterm' },
        { field: 'puerto' },
        { field: 'terminopago' },
        { field: 'cantidad' },
        { field: 'precio' },
        { field: 'etd' },
        {field: 'adicelim'}
      ],
    },
    {
      groupId: 'blanc',
      headerName: '',
      headerClassName: "blanco",
      headerAlign: 'center',
      children: [
        { field: 'estatusproblema' },
        { field: 'comentarios' },
      ],
    },
    {
      groupId: 'fechas',
      headerName: 'Fecha de Recepción e Impresión de P.I.',
      headerClassName: "ama",
      headerAlign: 'center',
      children: [
        { field: 'fechainicial' },
        { field: 'fecharegistr' },
        { field: 'fecharev' },
        { field: 'tiemporev' }
      ],
    },
    {
      groupId: 'compras',
      headerName: 'ÁREA DE COMPRAS',
      headerClassName: "planeacion",
      headerAlign: 'center',
      children: [
        { field: 'fechainicialcompras' },
        { field: 'fechafinalcompras' },
        { field: 'tiemporealcompras' }
      ],
    },
    {
      groupId: 'planeacion',
      headerName: 'ÁREA DE PLANEACIÓN/CONFIRMACIÓN',
      headerClassName: "sap",
      headerAlign: 'center',
      children: [
        { field: 'finicialplan' },
        { field: 'ffinalplan' },
        { field: 'tiemporealplan' }
      ],
    },
    {
      groupId: 'enviad',
      headerName: 'ENVIADA',
      headerClassName: "v",
      headerAlign: 'center',
      children: [
        { field: 'enviada' }
      ],
    },
    {
      groupId: 'sincolor',
      headerName: '',
      headerClassName: "blanco",
      headerAlign: 'center',
      children: [
        { field: 'estatustiempo' },
        { field: 'diasproceso' },
        { field: 'diasatraso' },
        {field: 'numliberacion'}
      ],
    },
  ];

  //const rows = [];

  return (
    <div style={{height:"550px"}}>
      <Box
        sx={{ zoom:"80%",
          marginLeft: "-50px",
          height: "100%",
          width: "108%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}>
        <br></br>
        <div className="col-md-2 d-flex align-items-center justify-content-start">
          <label htmlFor="fecha" className="form-label fw-bold mb-0 me-2 text-nowrap ">Fecha:</label>
          <input type="text" id="fecha" className="form-control border-0 text-start w-50 bg-transparent" value={new Date().toLocaleDateString('es-MX')} readOnly />
        </div>
        <br></br>
        <DataGrid 
          sx={{"& .MuiDataGrid-columnHeaderTitle": {
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
        }
      }
      rows={registros} columns={columns}
      columnGroupingModel={gruposDeColumnas} 
      processRowUpdate={processRowUpdate}
    /></Box></div>
  )
}
export default Matriz;