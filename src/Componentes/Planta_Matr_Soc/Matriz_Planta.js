import {DataGrid, GridToolbarContainer} from '@mui/x-data-grid';
import Box from "@mui/material/Box";
import ClientesService from '../../service/ClientesService';
import {useEffect, useState, useCallback} from 'react';
import {Checkbox, CircularProgress} from '@mui/material';
import { Link } from "react-router-dom";
import { tradersMatricesP } from '../materialReutilizable/RangosReusables';
import { ExportarExcelLOG } from '../materialReutilizable/ExportarExcelLOG';

function Matriz_Planta() {
  const [registros, setRegistros]=useState([]);
  const [feriados, setFeriados] = useState(new Set());
  const [tablatemp , settablatemp] = useState([]);
  const opciones = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" };
  const [loading, setLoading] = useState(false);
  const [contactosPlanta, setContactosPlanta] = useState([]);
  const [search, setSearch] = useState({filtroUsuario:'ALL', filtroPo:'', filtroPoText: '',filtroPi:'',fechacerradas:false})
  const usuario = localStorage.getItem("username")
  useEffect(() => {
    handleVerControlPIs();
  }, []);

  const handleVerControlPIs = async () => {
    setLoading(true);
    try{
      const [resControlPIs, resBufferPlanta, resCodigosPlan,resFeriados,resSocPlanta, resContactosPlanta, resMatricesPlanta] = await Promise.all([
        ClientesService.getControlPIsAll(),
        ClientesService.get_buffer_planta(),
        ClientesService.getCodigosPlaneadorAll(),
        ClientesService.getFeriadosAll(),
        ClientesService.get_soc_planta(),
        ClientesService.getContactosPlantaAll(),
        ClientesService.getMatricesPlantaAll(),
      ]);
      const dataFeriados = resFeriados.data;
      const fechas = (Array.isArray(dataFeriados) ? dataFeriados : [])
        .map(f => (typeof f === 'string' ? f : f?.fecha || '').split('T')[0]);
      
      const setFeriadosNuevo = new Set(fechas.filter(Boolean));
      setFeriados(setFeriadosNuevo);
      setContactosPlanta(resContactosPlanta.data || [])

      const pis = resControlPIs.data;
      const bufferP = resBufferPlanta.data;
      const codiPlan= resCodigosPlan.data;
      const Soc_Planta = resSocPlanta.data;
      const contPlanta=resContactosPlanta.data;
      const matricesPlanta=resMatricesPlanta.data; 
      //const nombresMAtrices=new Set((matricesPlanta ||[]).map(m=>String(m.nombre).trim().toUpperCase()));

      const pMap=Object.fromEntries((codiPlan || []).map(c=>[String(c.item).trim(), c.nombre_planner]));
      const buMap = Object.fromEntries((contPlanta || []).map(c => [String(c.responsable || '').trim(), c.bu]));
      const cMap=Object.fromEntries((bufferP || []).map(c=>[String(c.po).trim(), c.codigo]));
      const etdMap=Object.fromEntries((bufferP || []).map(f=>[String(f.po).trim(), f.etd]));
      const familiaMap=Object.fromEntries((bufferP || []).map(f=>[String(f.po).trim(), f.clave]));
      
      const basePIs = Array.isArray(pis) ? pis : Object.values(pis || {});
      const datosCombinados = basePIs.map((p, index) => {
        const llaveBusqueda = String(p.nopo).trim();
        return {
          ...p,
          id: p.id,
          nopo: p.nopo,
          bu:buMap[String(pMap[String(cMap[llaveBusqueda] || "")] || '').trim()] || '',
          planeador: pMap[String(cMap[llaveBusqueda] || '').trim()] || '',
          etdpo: (etdMap[llaveBusqueda] || '').split('-').reverse().join('/') || '',
          familia: familiaMap[llaveBusqueda] || '',
          razonsocial:p.razonsocial || "MAL",
          incoterm: p.incoterm || "MAL",
          puerto: p.puerto || "MAL",
          terminopago: p.terminopago || "MAL",
          cantidad: p.cantidad || "MAL",
          precio: p.precio || "MAL",
          etd: p.etd || "MAL",
          comentarios: p.comentarios || "",
          fechainicial: p.fechainicial || "", 
          adicelim: p.adicelim || "", 
          etdpi: p.etdpi
        }; 
      }); 
      const datosCompletos =complementar(datosCombinados, Soc_Planta, matricesPlanta)
      settablatemp(datosCompletos)
      setRegistros(datosCompletos);
    } catch (error) {
        console.error("Error:", error);
    }finally {
      setLoading(false);
    }
  };

  const diasLab=useCallback((Finicio, Ffin) => {
    if (!Finicio) return 0;
    const fechaBien=(val) => {
      if(!val) return new Date();
      if(val instanceof Date) return new Date(val);
      const valor = String(val).trim();
      return (valor.includes('-'))? new Date(valor) : new Date(valor);
    };

    const inicio = fechaBien(Finicio);
    const fin = Ffin ? fechaBien(Ffin) : new Date();
    let diasLaborables=0;
    while(inicio <= fin){
      const esFinDeSemana=((inicio.getDay()) === 0 || (inicio.getDay()) === 6);// sabado 6, domingo 0
      const yyyy=inicio.getFullYear();
      const mm=String(inicio.getMonth() + 1).padStart(2, '0');
      const dd=String(inicio.getDate()).padStart(2, '0');
      const fechal=`${yyyy}-${mm}-${dd}`;

      const esFestivo=feriados.has(fechal);
      if (!esFinDeSemana && !esFestivo){
        diasLaborables++;
      }
      inicio.setDate(inicio.getDate()+1);
    }
    return Math.max(0, diasLaborables - 1);
  }, [feriados]);

  const handleCheckboxChange = async(id, checked, campo) => {
    const actualizarLista = (prev) =>
      prev.map((row) => (row.id === id ? { ...row, [campo]: checked ? "OK" : "MAL" } : row));

    setRegistros(actualizarLista);
    settablatemp(actualizarLista);
    const registroActual = registros.find((row) => row.id === id);
    if (!registroActual) return;
    try {
      await ClientesService.saveControlPIs({...registroActual,  [campo]: checked ? "OK" : "MAL"});
    } catch (error) {
      console.error("Error:", error);
      setRegistros((prev) => prev.map((row) => (row.id === id ? registroActual: row)));
      settablatemp((prev) => prev.map((row) => (row.id === id ? registroActual: row)));
    }
  }

  /* const processRowUpdate= async (newRow) => {
    await ClientesService.saveControlPIs(newRow);
    setRegistros((prev) => prev.map((row) => (row.id === newRow.id ? newRow : row)));
    return newRow;
  } */
 const processRowUpdate = async (newRow, oldRow) => {
    try {
      const rowModificada = {
        ...newRow,fechainicial: newRow.fechainicial ? new Date(newRow.fechainicial).toISOString().split('T')[0] : null,
        fecharegistr: newRow.fecharegistr ? new Date(newRow.fecharegistr).toISOString().split('T')[0] : null,
        fecharev: newRow.fecharev ? new Date(newRow.fecharev).toISOString().split('T')[0] : null,
        fechainicialcompras: newRow.fechainicialcompras ? new Date(newRow.fechainicialcompras).toISOString().split('T')[0] : null,
        fechafinalcompras: newRow.fechafinalcompras ? new Date(newRow.fechafinalcompras).toISOString().split('T')[0] : null,
        finicialplan: newRow.finicialplan ? new Date(newRow.finicialplan).toISOString().split('T')[0] : null,
        ffinalplan: newRow.ffinalplan ? new Date(newRow.ffinalplan).toISOString().split('T')[0] : null,
        enviada: newRow.enviada ? new Date(newRow.enviada).toISOString().split('T')[0] : null,
      };
      await ClientesService.saveControlPIs(rowModificada);
      setRegistros((prev) => prev.map((row) => (row.id === rowModificada.id ? rowModificada : row)));
      settablatemp((prev) => prev.map((row) => (row.id === rowModificada.id ? rowModificada : row)));
      return rowModificada;
    } catch (error) {
      console.error("Error:", error);
      return oldRow;
    }
  };

  const complementar = (datos_matriz , Soc_Planta, matricesPlanta) => {
    const tradersValidos=new Set(tradersMatricesP)
    const nombresMAtrices=new Map();
    (matricesPlanta || []).forEach(m => {
      const nombreFabrica = String(m.nombre || '').trim();
      //const traderUtilizado = String(m.trader_utilizado || '').trim();
      if (nombreFabrica) {
        nombresMAtrices.set(nombreFabrica, {
        trader: String(m.trader_utilizado || '').trim(),hoja: String(m.hoja || '').trim().toLowerCase()});
      }
    });

    const resultado = datos_matriz.map((element, index) => {
      const llave= String(element.nopo || "")
      const found = Soc_Planta.find( elementMatriz => {
        const poTh = String(elementMatriz.po_th || '')
        const po = String(elementMatriz.po || '')
        return (poTh !== '' && poTh === llave) || (po !== '' && po === llave);
      })

      const fabricaSoc = String(found?.fabrica || element.fabrica || '').trim();
      const traderEncontrado = nombresMAtrices.get(fabricaSoc);
      //const cumpleCondicion = traderEncontrado && tradersValidos.has(traderEncontrado);
      const esComponentes=["componentes", "componentes / desarrollo componentes","desarrollo componentes"].includes(String(element.bu || "").toLowerCase());
        //Number(elementMatriz.po_th) === Number(element.nopo) || Number(elementMatriz.po) === Number(element.nopo));
      //******************+*************//bu componentes y/o ¿componenetes y desarrollo????
      let esMatrices=false;
      if(!traderEncontrado){
        esMatrices=esComponentes;}else{
          
        const esHojaPmRule = traderEncontrado.hoja === "pm rule";
        esMatrices=(esHojaPmRule && esComponentes) || (esHojaPmRule && !esComponentes);
      }
      //dentro de return dm:((cumpleCondicion && (element.bu==="Componentes / Desarrollo Componentes" || element.bu==="Desarrollo Componentes" || element.bu==="Componentes"))?"MATRICES":"DIRECTO")};
      return { ...found, ...element, id: element.id ?? `row-${index}`,no_de_proveedor: (found?.no_de_proveedor || element.no_de_proveedor || ""), 
        dm: esMatrices?"MATRICES":"DIRECTO"};
    });
      //settablatemp(resultado);
    return resultado;
  };

  const filter = (e) => {
    if (e.target.id === "filtroPO") {
      const texto = e.target.value;
      const rango = texto.split("\n").map(r => parseInt(r.trim())).filter(r => !isNaN(r));
      setSearch(prev => ({ ...prev, filtroPo: rango, filtroPoText: texto }));
    }
  };
  const filasFiltradas = (tablatemp || []).filter((p) => { //datagrid y exp excel
    const filtroPo = search.filtroPo.length === 0 || search.filtroPo.includes(Number(p.po_th)) || search.filtroPo.includes(Number(p.po));
    return filtroPo;
  });

  const columns=[
    {field: "nopo", headerName: "NO. PO", width: 90,editable: false,headerClassName: "gris"},
    {field: "po",headerName: "Folio TT", width: 90, editable: false,headerClassName: "gris"},
    {field: "bu", headerName: "Unidad de Negocio", width: 90, editable: false, headerClassName: "gris"},
    {field: "comprador", headerName: "Comprador", width: 90, editable: false, headerClassName: "gris"},  // SALE DE SOC
    {field: "no_de_proveedor", headerName: "# de Proveedor", width: 90, editable: false,headerClassName: "gris"}, // SALE DE SOC
    {field: "proveedor", headerName: "Nombre del proveedor", width: 90, editable: false, headerClassName: "gris"}, // SALE DE SOC
    {field: "planeador", headerName: "Planeador", width: 150, editable: false, headerClassName: "gris"}, // SALE DE SOC REVISAR-.-.-.-.-.-..-.
    {field: "codigo", headerName: "Código", editable: false, headerClassName: "gris"}, // SALE DE SOC 
    {field: "fabrica", headerName: "FAB", editable: false, headerClassName: "gris"}, // SALE DE SOC 
    {field: "revisado", headerName: "TT", width: 90, editable: false, headerClassName: "gris"},  // SALE DE SOC
    {field: "dm", headerName: "D/M", width: 90, editable: false, headerClassName: "gris"},  // es una condicion
    {field: "etdpo", headerName: "ETD PO", width: 105, editable: false, headerClassName: "gris"}, // SALE DE SOC
    {field: "etdpi", headerName: "ETD PI", width: 90, editable: true, type: "date", headerClassName: "gris", 
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : "" },
    {field: "familia", headerName: "Familia", width: 140, editable: false, headerClassName: "gris"}, // SALE DE SOC
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
    {field: "adicelim", headerName: "Adición Eliminación", width: 100, editable: true, headerClassName: "gris"},
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
        if(!!row.adicelim) prob.push(row.adicelim);
        return prob.length === 0 ? "OK" : prob.join(" "); 
      }
    },
    {field: "comentarios", headerName: "Comentarios", width: 250, editable: true, headerClassName: "gris"},
    {field: "fechainicial", headerName: "Fecha inicial (recepción)", width: 100, editable: true, type: "date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : "" },
    {field: "fecharegistr", headerName: "Fecha registro", width: 100, editable: true, type: "date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : "" },
    {field: "fecharev", headerName: "Fecha revisión", width: 100, editable: true, type:"date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : ""},
    {field: "tiemporev", headerName: "Tiempo Real", width: 100, editable: false, headerClassName: "gris",
      valueGetter: (value, row) => diasLab(row.fechainicial, row.fecharegistr)},
    {field: "fechainicialcompras", headerName: "Fecha inicial", width: 100, editable: true, type:"date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : ""},
    {field: "fechafinalcompras", headerName: "Fecha final", width: 90, editable: true, type:"date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : ""},
    {field: "tiemporealcompras", headerName: "Tiempo Real", width: 90, editable: false, headerClassName: "gris",
      valueGetter: (value, row) => diasLab(row.fechainicialcompras, row.fechafinalcompras)},
    {field: "finicialplan", headerName: "Fecha inicial", width: 90, editable: true, type:"date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : ""},
    {field: "ffinalplan", headerName: "Fecha final", width: 90, editable: true, type:"date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : ""},
    {field: "tiemporealplan", headerName: "Tiempo Real", width: 90, editable: false, headerClassName: "gris",
      valueGetter: (value, row) => diasLab(row.finicialplan, row.ffinalplan)},
    {field: "enviada", headerName: "Enviada", width: 90, editable: true, type:"date", headerClassName: "gris",
      valueFormatter: (params) => params ? new Date(params).toLocaleDateString("es-MX", opciones) : ""},
    {field: "estatustiempo", headerName: "Estatus Tiempo", width: 280, editable: false, headerClassName: "gris",
      valueGetter: (value, row) =>{
        const dias= diasLab(row.fechainicial, row.enviada);
        const siEnviada= !!row.enviada; //true si hay fecha 
        if(!siEnviada && dias>3){
          return "Mayor a 3 días y sin envío a proveedor"
        }if(siEnviada && dias<=3){
          return "En tiempo y enviado a proveedor";
        }if(siEnviada && dias>3){
          return "Fuera de tiempo y enviado a proveedor";
        }
        return "En Tiempo";
      }},
    {field: "diasproceso", headerName: "Días Totales Proceso", width: 90, editable: false, headerClassName: "gris",
      valueGetter: (value, row) => diasLab(row.fechainicial, row.enviada)},
    {field: "diasatraso", headerName: "Días Totales de Atraso", width: 90, editable: false, headerClassName: "gris",
      valueGetter: (value, row) => diasLab(row.fechainicial, row.enviada)-3},
  ]

  const gruposDeColumnas = [
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
  ];

  function botonesSuperiores() {
    return (
    <GridToolbarContainer>
      <Link to={`/record/planta/matriz_planta/nuevapi`} style={{backgroundColor:"#3C7D22"}} className="btn btn-success">NUEVA PI</Link>
      <textarea value={search.filtroPoText} onChange={(e) => filter(e)} style={{marginLeft:'2%', height: '38px', verticalAlign: 'middle'}} placeholder='Filtro PO / PI' id="filtroPO"/>
      <ExportarExcelLOG columns={columns} rows={filasFiltradas} fuente="SocsLog"></ExportarExcelLOG>
    </GridToolbarContainer>
    
    )
  }  
  return (
    <div>
      {loading ? ( <div style={{padding:'30%'}}> <CircularProgress/><label>Actualizando</label>  </div> ) 
      : (
    <div style={{height:"650px"}}>
      <Box
        sx={{ zoom:"85%", marginLeft: "-160px",height: "100%", width: "120%",
          "& .actions": {color: "text.secondary",},
          "& .textPrimary": {color: "text.primary",},
        }}>

        <div className="col-md-4 d-flex align-items-center justify-content-start">
          <label htmlFor="fecha" className="form-label fw-bold mb-0 me-2 text-nowrap ">Fecha:</label>
          <input type="text" id="fecha" className="form-control border-0 text-start w-50 bg-transparent" value={new Date().toLocaleDateString('es-MX')} readOnly />
            <h2 style={{color:'gray'}}> Matriz Planta</h2>
          
        </div>
        <DataGrid 
          sx={{"& .MuiDataGrid-columnHeaderTitle": {whiteSpace: "normal", lineHeight: "normal",},
            "& .MuiDataGrid-columnHeader": {borderBottom: '1px solid #A6A6A6', borderRight: '1px solid #A6A6A6',},
            "& .MuiDataGrid-columnHeaders": {maxHeight: "168px !important",},
            "& .MuiDataGrid-cell": {borderRight: '1px solid #F2F2F2',  borderBottom: '1px solid #F2F2F2', },
          }}
          //rows={tablatemp}
          rows={filasFiltradas} 
          columns={columns}
          checkboxSelection
          columnGroupingModel={gruposDeColumnas} 
          processRowUpdate={processRowUpdate}
          /* onRowSelectionModelChange={(seleccion) => {
            setFilasSeleccionadas(seleccion);
            validarFilasSeleccionadas(seleccion);
          }} */
          slots={{
          toolbar: botonesSuperiores,
        }}
        /></Box></div>
      )}</div>
  )
}
export default Matriz_Planta;