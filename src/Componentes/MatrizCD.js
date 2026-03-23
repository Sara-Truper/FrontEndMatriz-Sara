import * as React from "react";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, Tooltip  } from "@mui/material";
import { BUs } from "./materialReutilizable/RangosReusables"
import { default as ReactSelect, components } from "react-select";
import { obtenerEstadoEnvio, LiberadaPorMatrices } from "./materialReutilizable/AreaDestino";
import { ExportarExcelMATRIZ } from './materialReutilizable/ExportarExcelMATRIZ'
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useEffect } from "react";
import ClientesService from "../service/ClientesService";
// import "./button.css";
import { GeneraHistorial } from "./materialReutilizable/GenerarHistorial";
function FullFeaturedCrudGrid() {
  const [loading, setLoading] = React.useState(false);
  const [filatrat, setfilatrat] = React.useState([]);
  const [rango, setRango] = React.useState({ inicio: "", fin: "" });
  const [dialogo2, setdialogo2] = React.useState(false);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [state, setState] = React.useState({ optionSelected: null });
  const [filtrofull, setfiltrofull] = React.useState([]);
  const [rows, setRows] =React.useState([])
  const [valores, setvalores] = React.useState([]);
  const [histant, sethistant] = React.useState([]);
  const [dialogo, setdialogo] = React.useState(false);
  const [modificar, setmodificar] = React.useState(false);
  const [bu,setbu] = React.useState(false);
const [sortModel, setSortModel] = React.useState([
   {
     field: "fecha_inicio",
     sort: "desc",
   },
  {
    field: "no_de_proveedor",
    sort: "desc",
  },
]);
  const handleClose = () => {
    setdialogo(false);
    setdialogo2(false);
    
  };
  const areasdestinolista = [ "COMPRAS","PLANEACION","AUDITORIA/SAP","ENVIO","CANCELADA","CERRADA"  ].map(a => ({ label: a, value: a }));

  const refreshTab = ()=> {
    setLoading(true)
    setmodificar(false);
    setfiltrofull()
    ClientesService.getAllmatrizcd().then((response)=>{
      setvalores(response.data)
      sethistant(response.data)
    }).catch((error)=>{
      console.log(error)
    })
   setTimeout(() => {
     setLoading(false);
   }, 3000);

  }
  function transformarFechas(obj) {
  const regexFecha = /^\d{2}\/\d{2}\/\d{4}$/;
  const nuevoObjeto = {};
  for (const key in obj) {
    const valor = obj[key];
    if (typeof valor === "string" && regexFecha.test(valor)) {
      // Convertir "dd/mm/yyyy" → "yyyy-mm-ddT00:00:00"
      const [dia, mes, anio] = valor.split("/");
      nuevoObjeto[key] = `${anio}-${mes}-${dia}T00:00:00`;
    } else {
      nuevoObjeto[key] = valor;
    }
  }

  return nuevoObjeto;
}

const listarClientes = (e) => {
        setLoading(true);
    const nwarr = new Array();
    ClientesService.getAllmatrizcd()
      .then((response) => {
        if (e === undefined && filtrofull.length === 0) {
          setvalores(response.data);
          sethistant(response.data);
        } else {
          if (typeof filtrofull !== "object") {
            const var2 = filtrofull.split("\n");
            var2.forEach(function (rango) {
              let i = 0;
              var rango = parseInt(rango);
              for (i = 0; i < response.data.length; i++) {
                const var1 = response.data[i].folio_tt;
                if (var1 === rango) {
                  nwarr.push(response.data[i]);
                  break;
                }}
              setvalores(nwarr);
              sethistant(nwarr)
            });
          } else {
            let i = 0;
            for (i = 0; i < response.data.length; i++) {
              const var1 = response.data[i].area_destino.toUpperCase();
              const var2 = e.toUpperCase();
              if (var1 === var2) {
                nwarr.push(response.data[i]);
              }}
            setvalores(nwarr);
            sethistant(nwarr)
          }}})
      .catch((error) => {
        console.log(error);
      });
      setTimeout(() => {
    setLoading(false);
  }, 4500);
};
  const handleChange = (selected) => {
    setState({
      optionSelected: selected
    });
  };

const filtrosCalculados = (e)=>{
const estatus = state.optionSelected
  const labels = estatus.map(item => item.label) 

   setLoading(true)
       const nwarr = new Array();
   ClientesService.getAllClientes().then((response)=>{
          const d = new Date((rango.inicio === "" ? "2000-01-01" : rango.inicio) + "T00:00:00");
          const inicio = d.toISOString().slice(0, 10);
          const e = new Date((rango.fin === "" ? new Date().toISOString().slice(0,10) : rango.fin) + "T00:00:00");
          const fin = e.toISOString().slice(0, 10);
           for (let i = 0; i < response.data.length; i++) {
             const var1 = response.data[i].area_destino;
             const var2 = new Date(response.data[i].fecha_area_destino).toISOString().split('T')[0] + "T00:00:00";
             const acuseV = response.data[i].acuse;
               if (labels.includes(var1)  && (var2.split('T')[0] >= inicio && var2.split('T')[0] <= fin   )) {
                nwarr.push(response.data[i]);
               }
           setvalores(nwarr);
           sethistant(nwarr)
         };
   }).catch((error)=>{
     console.log(error)
   })
   setTimeout(() => {
     setLoading(false);
   }, 4000);
   setState({ optionSelected: null})
}

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

  const fechaarea = (e) => { 
    if(e.target.value === ""){
              e.target.id.replace("liberada_por_","fecha_")
              setvalores(prevValores =>
              prevValores.map(val => ({
                ...val,
                [e.target.id.replace("liberada_por_","fecha_")]: null
      })));
    }else{
    const opcion = window.confirm("¿Deseas usar la fecha actual?\nPresiona 'Cancelar' para usar N/A");
    e.target.id.replace("liberada_por_","fecha_")
    setvalores(prevValores =>
    prevValores.map(val => ({
      ...val,
      [e.target.id.replace("liberada_por_","fecha_")]: opcion ? new Date().toISOString().split('T')[0] + "T00:00:00" : "2000-01-01T00:00:00" 
        })));
}};
const cambiomasivos = (event) => {
   fechaarea(event);
   setvalores(prevValores =>
     prevValores.map(val => ({
       ...val,
       [event.target.id]:  event.target.value === "" ? null : (event.target.id ==="fecha_de_envio"  ||  event.target.id ==="fecha_area_destino") ?  event.target.value + "T00:00:00"  :  event.target.value 
     }))
   );
};

const postearStatus = async () => {
   setLoading(true); 
   let avance = 0;
   const promesas = valores.map(val => {
     GeneraHistorial("masivo", valores[avance], histant[avance]);
      const value = obtenerEstadoEnvio(null, val);
      val.area_destino = value;
      avance++;
      return ClientesService.updatematrizcd(val.id, val)
        .catch((error) => {
          console.error("Error actualizando fila:", val.id, error);
        });
   });
   await Promise.all(promesas);
   setdialogo2(false);
   listarClientes();
   setTimeout(() => {
     setLoading(false);
   }, 3000);
};

const nuevorango = (filtrofull) => {
    setfiltrofull(filtrofull.target.value);
  };
  const abrirdialogo = (filtrofull) => {
    setdialogo2(true);
  };
  const funcionfiltro = () => {
    setLoading(true);
    setdialogo(false);
    listarClientes();
    setmodificar(true);
      setTimeout(() => {
    setLoading(false);
  }, 4000);
  };

  const funcionModif = async (id, updatedRow, originalRow) => {
  try {
    let rowFinal = { ...updatedRow };
    if (bu) {
      const response = await ClientesService.getcombProv(
        updatedRow.no_de_proveedor + updatedRow.unidad_de_negocio
      );
      rowFinal = {
        ...rowFinal,
        gerente_de_compras: response.data?.gte_Responsable_BU,
        confirmador: response.data?.planeador_planeacion
      };
    }
    const value = obtenerEstadoEnvio(id, rowFinal, originalRow);
    rowFinal = {
      ...rowFinal,
      area_destino: value
    };
    const libMatr = await LiberadaPorMatrices(rowFinal);

    rowFinal = {
      ...rowFinal,
      liberada_por_matrices: libMatr
    };
    const rowConFechasTransformadas = transformarFechas(rowFinal);
    await ClientesService.updatematrizcd(id, rowConFechasTransformadas);
    GeneraHistorial(id, rowConFechasTransformadas, originalRow);
    return rowConFechasTransformadas;
  } catch (error) {
    console.log(error);
  }
};

  const handleProcessRowUpdateError = (error) => {
    console.log(error);
  };
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
        event.defaultMuiPrevented = true;
    }
  };
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  const opciones = { day: "2-digit", month: "2-digit", year: "numeric" };
  const columns = [
    {
      field: "fecha_de_recepcion",
      headerName: "FECHA DE RECEPCION",
      width: 110,
      type: "date",
      editable: false,
      headerClassName: "gris",
      valueFormatter: (params) => {
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date;
      },
    },
    {
      field: "fecha_inicio",
      headerName: "FECHA",
      width: 100,
      type: "dateTime",
      editable: false,
      headerClassName: "gris",
valueGetter: (params) =>
  params ? new Date(params.replace(" ", "T")) : null,

},
    {
      field: "folio_tt",
      headerName: "FOLIO TT",
      width: 90,
      editable: false,
      headerClassName: "gris",
    },
    {
      field: "no_oc",
      headerName: "NO. O.C.",
      width: 90,
      editable: false,
      headerClassName: "gris",
    },
    {
      field: "unidad_de_negocio",
      headerName: "UNIDAD DE NEGOCIO",
      width: 140,
      editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      type: "singleSelect",
      headerClassName: "gris",
      valueOptions: BUs
    },
    {
      field: "no_de_proveedor",
      headerName: "NO. DE PROVEEDOR",
      width: 110,
      editable: false,
      headerClassName: "gris",
    },
    {
      field: "proveedor",
      headerName: "PROVEEDOR",
      width: 180,
      editable: false,
      headerClassName: "gris",
    },
    {
      field: "gerente_de_compras",
      headerName: "GERENTE DE COMPRAS",
      width: 180,
      editable: false,
      headerClassName: "gris",
    },
    {
      field: "confirmador",
      headerName: "CONFIRMADOR",
      width: 180,
      editable: false,
      headerClassName: "gris",
    },
    {
      field: "segunda",
      headerName: "2DA",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["SI", "NO","PF"],
    },
    {
      field: "precio",
      width: 80,
      headerName: "PRECIO",
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["A LA ALZA", "A LA BAJA", "OK","ALZA Y BAJA", "MONEDA", "NOTA $"],
       cellClassName: (params) => {
      if (!["A LA ALZA", "A LA BAJA","ALZA Y BAJA"].includes(params.value)) {
        return "celda-ok";
      } else if (["A LA ALZA", "A LA BAJA","ALZA Y BAJA"].includes(params.value)) {
        return "celda-mal";
      }
      return "";
  }
},
    {
      field: "matriz",
      headerName: "MATRIZ",
      width: 140,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["REFERENCIA", "FIRMADA", "MIXTA","N/A"],
    },
    {
      field: "datos_fiscales",
      headerName: "DATOS FISCALES",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
      cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },
    },
    {
      field: "term_de_pago",
      headerName: "TERM. DE PAGO",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
            cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },

    },
    {
      field: "dir_de_prov",
      headerName: "DIR. DE PROV.",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
            cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },

    },
    {
      field: "tax_id",
      headerName: "TAX ID",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
            cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },

    },
    {
      field: "incoterm",
      headerName: "INCOTERM",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
            cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },

    },
    {
      field: "qty",
      headerName: "QTY",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
            cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },

    },
    {
      field: "etd",
      headerName: "ETD",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
            cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },

    },
    {
      field: "etd_po",
      headerName: "ETD PO",
      width: 100,
      editable: false,
      headerClassName: "gris",
      valueFormatter: (params) => {
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date;
      },
    },
    {
      field: "etd_pi",
      headerName: "ETD PI",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      type: "date",
      headerClassName: "gris",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date;
        }
      },
      },
    {
      field: "montopi",
      headerName: "MONTO PI",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      valueFormatter: (params) => {
        return params === null ? "$" + 0 : "$" + params.toLocaleString("es-MX");
      },
    },
    {
      field: "moneda",
      headerName: "MONEDA",
      width: 80,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
    },
    {
      field: "add_elim_item",
      headerName: "ADD/ELIM ITEM",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["ADD ITEM", "ELIM ITEM", "N/A", "ELIM/ADD", "HC"],
    },
    {
      field: "peso_vol",
      headerName: "PESO/VOL",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "MAL"],
            cellClassName: (params) => {
      if (params.value === "OK") {
        return "celda-ok";
      } else if (params.value === "MAL") {
        return "celda-mal";
      }
      return "";
  },
    },
    {
      field: "pto_directo",
      headerName: "PTO. DIRECTO",
      width: 100,
      editable: false,
      headerClassName: "gris",
    },
    {
      field: "validacion_pod_vs_pi",
      headerName: "VALIDACIÓN POD VS PI",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: ["OK", "NO INDICA", "DIFERENTE", "N/A"],
    },
{
  field: "observaciones",
  headerName: "OBSERVACIONES",
  width: 420,
  editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
  headerClassName: "gris",
  renderCell: (params) => (
    <div style={{ whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
      <Tooltip title={params.value?.toString() || ''}>
        <span>{params.value}</span>
      </Tooltip>
    </div>
  ),
renderEditCell: (params) => (
  <textarea
    style={{ width: "100%", height: "80px", fontSize: "14px" }}
    defaultValue={params.value || ""}
    autoFocus
    onChange={(e) =>
      params.api.setEditCellValue({
        id: params.id,
        field: params.field,
        value: e.target.value,
      })
    }
    onKeyDown={(e) => {
      // Evita que el DataGrid cierre edición con Enter
      if (e.key === "Enter") {
        e.stopPropagation(); // evita salto de celda
      }
    }}
  />
),},
    {
      field: "liberacion_de_matr_con_sello",
      headerName: "LIBERACION DE MATRICES CON SELLO",
      width: 160,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
    },
    {
      field: "validaciones_extraordinarias",
      headerName: "VALIDACIONES EXTRAORDINARIAS",
      width: 160,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
    },
    {
      field: "condicion_de_matrices",
      headerName: "CONDICIÓN DE MATRICES",
      width: 110,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
      type:"singleSelect",
      valueOptions:["---","NAM"]
    },  
    {
      field: "compartida",
      headerName: "Compartida",
      width: 180,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
    },
        {
      field: "area_destino",
      headerName: "AREA DESTINO",
      width: 110,
      editable: true,
      headerClassName: "area",
      valueGetter: (value, row) => {
         return obtenerEstadoEnvio(value, row)
    },
  },
    {
      field: "fecha_area_destino",
      headerName: "FECHA",
      width: 100,
      type: "date",
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "area",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date === "01/01/2000" ? "N/A" : date;
        }
      },
    },
    {
      field: "acuse",
      headerName: "ACUSE",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "area",
    },
    {
      field: "status__problema",
      headerName: "STATUS",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "area",
    },
    {
      field: "liberada_por_matrices",
      headerName: "LIBERADA POR MATRICES",
      width: 100,
      editable: false,
      headerClassName: "matrices",
    },
    {
      field: "fecha_matrices",
      headerName: "FECHA",
      width: 100,
      editable: false,
      headerClassName: "matrices",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date;
        }
      },
    },
    {
      field: "motivo_matrices",
      headerName: "MOTIVO",
      width: 180,
      headerClassName: "matrices",
    },
    {
      field: "liberada_por_bu",
      headerName: "LIBERADA POR BU",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "bu",
      type: "singleSelect",
      valueOptions: ["" , "ACEPTADA", "RECHAZADA"],
    },
    {
      field: "fecha_bu",
      headerName: "FECHA",
      width: 100,
      type: "date",
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "bu",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date ==="01/01/2000" ? "N/A" : date;
        }
      },
    },
    {
      field: "motivo_bu",
      headerName: "MOTIVO",
      width: 180,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "bu",
    },
    {
      field: "liberada_por_planeacion",
      headerName: "LIBERADA POR PLANEACION",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "planeacion",
      type: "singleSelect",
      valueOptions: ["" , "ACEPTADA", "RECHAZADA"],
    },
    {
      field: "fecha_planeacion",
      headerName: "FECHA",
      width: 100,
      type: "date",
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "planeacion",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date ==="01/01/2000" ? "N/A" : date;
        }
      },
    },
    {
      field: "motivo_planeacion",
      headerName: "MOTIVO",
      width: 180,
      editable: localStorage.getItem("username") === "pruebacd" ? true : false,
      headerClassName: "planeacion",
    },
    {
      field: "liberada_por_auditoria",
      headerName: "LIBERADA POR AUDITORIA",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "auditoria",
      type: "singleSelect",
      valueOptions: ["" , "ACEPTADA", "RECHAZADA"],
    },
    {
      field: "fecha_auditoria",
      headerName: "FECHA",
      width: 100,
      type: "date",
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "auditoria",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date ==="01/01/2000" ? "N/A" : date;
        }
      },
    },
    {
      field: "motivo_auditoria",
      headerName: "MOTIVO",
      width: 180,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "auditoria",
    },
    {
      field: "liberada_por_sap",
      headerName: "LIBERADA POR SAP",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "sap",
      type: "singleSelect",
      valueOptions: ["" , "ACEPTADA", "RECHAZADA"],
    },
    {
      field: "fecha_sap",
      headerName: "FECHA",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      type: "date",
      headerClassName: "sap",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date ==="01/01/2000" ? "N/A" : date;
        }
      },
    },
    {
      field: "motivo_sap",
      headerName: "MOTIVO",
      width: 180,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "sap",
    },
    {
      field: "envio_a_proveedor",
      headerName: "ENVIO A PROVEEDOR",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "gris",
    },
    {
      field:"fecha_de_envio",
      headerName:"FECHA DE ENVIO",
      editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      type: "date",
      headerClassName: "gris",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date;
        }
      },
    },
    {
      field: "trial",
      headerName: "TRIAL",
      width: 100,
            editable: ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl","pruebacd","srodriguezg"].includes(localStorage.getItem("username")),
      headerClassName: "trial",
    },
    {
      field: "historial_de_modificacion",
      headerName: "HISTORIAL DE MODIFICACION",
      width: 100,
      editable: false,
    },
    {
      field: "fecha_revision",
      headerName: "Fecha Revision",
      width: 100,
      editable: false,
      headerClassName: "gris",
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date ==="01/01/2000" ? "N/A" : date;
        }
      },
    },
    {
      field: "fecha_entrega_compras",
      headerName: "FECHA DE ENTREGA COMPRAS",
      width: 100,
      editable: false,
      headerClassName: "gris",
      type: "singleSelect",
      valueOptions: [new Date(Date()+1).toLocaleDateString("es-MX", opciones)],
      valueFormatter: (params) => {
        if (params === null) {
          const date = "";
          return date;
        } else {
          const date = new Date(params).toLocaleDateString("es-MX", opciones);
          return date ==="01/01/2000" ? "N/A" : date;
        }
      },
    },
  ];

  useEffect(() => {
    listarClientes();
  }, []);

  useEffect(() => {
  async function cargar() {
    const updated = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        liberada_por_matrices: await LiberadaPorMatrices(row),
      }))
    );
    setRows(updated);
  }
  cargar();
}, []);
  if (dialogo) {
    return (
      <Dialog onClose={handleClose} open={dialogo}>
        <DialogTitle>Pega POs a Filtrar </DialogTitle>
        <div style={{ height: "250px", width: "300px" }}>
          &nbsp;&nbsp;
          <textarea
            onChange={(filtrofull) => {
              nuevorango(filtrofull);
            }}
            className="filtroPOs"
            style={{ width: "280px", height: "180px" }}
            placeholder="pega POs"
          ></textarea>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button
            onClick={() => { funcionfiltro();}} className="btn btn-success" >{" "} Confirmar{" "}</button>
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
      <div>
        <Dialog open={dialogo2} onClose={handleClose} PaperProps={{style: {backgroundColor: 'transparent',}, }}
                          BackdropProps={{style: { backgroundColor: "transparent", }, }}> 
            <DialogTitle>Modificar Masivo</DialogTitle>            
          <DialogContent>
            <Box
              // noValidate
              // component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                m: "auto",
                width: "fit-content",
              }}
            >
              <Stack direction="row">
              <span style={{width:"35%"}}>{filtrofull}</span>
                          <div style={{ marginLeft:"2%",  width:"25%", flexDirection: 'row'  }}>
                          <Stack direction="row">
                            <Stack direction="column">
                              <label style={{fontSize:13 }}>ENVIO A PROVEEDOR</label>
                              <input style={{width:"110px"}} type="text" onChange={cambiomasivos}  id="envio_a_proveedor" value={valores[0].envio_a_proveedor}/ >
                            </Stack>
                            <Stack direction="column">
                              <label style={{width:"80px" , fontSize:13}}>FECHA DE ENVIO</label>
                              <input style={{width:"110px"}} type=  "date" onChange={cambiomasivos}  id="fecha_de_envio" value={valores[0].fecha_de_envio === null ? "" : new Date(valores[0].fecha_de_envio).toISOString().split('T')[0]} / >
                            </Stack>
                            <Stack direction="column">
                              <label style={{fontSize:13}}>FECHA AREA DESTINO</label>
                              <input style={{width:"110px"}} type=  "date" onChange={cambiomasivos}  id="fecha_area_destino" value={valores[0].fecha_area_destino === null ? "" : new Date(valores[0].fecha_area_destino).toISOString().split('T')[0]} / >
                            </Stack>
                          </Stack>
                          </div>
              </Stack>
              <Stack direction="row" >
                <table class="table" >
                  <thead>
                    <tr>
                      <th style={{fontSize:13}} scope="col"> Area Destino</th>
                      <th style={{fontSize:13}} scope="col"> Liberado por Matrices</th>
                      <th style={{fontSize:13}} scope="col"> Liberado por BU</th>
                      <th style={{fontSize:13}} scope="col"> Liberado por Planeacion</th>
                      <th style={{fontSize:13}} scope="col"> Liberado por Auditoria</th>
                      <th style={{fontSize:13}} scope="col"> Liberado por SAP</th>
                    </tr>
                  </thead>
                  <tr>
                    <th scope="row" style={{fontSize:10.5}}>{valores[0].area_destino}</th>
                    <th scope="row">
                    <select disabled id="liberada_por_matrices" onChange={cambiomasivos} style={{fontSize:12}}>
                        <option > {valores[0].liberada_por_matrices}</option>
                      </select>
                      </th>
                      <th scope="row">
                      <select id="liberada_por_bu" onChange={cambiomasivos} style={{fontSize:12}}>
                        <option> {valores[0].liberada_por_bu}</option>
                        <option> </option>
                        <option> ACEPTADA</option>
                        <option> RECHAZADA</option>
                      </select>
                    </th>
                    <th scope="row">
                      <select id="liberada_por_planeacion" onChange={cambiomasivos} style={{fontSize:12}}>
                        <option> {valores[0].liberada_por_planeacion}</option>
                        <option> </option>
                        <option> ACEPTADA</option>
                        <option> RECHAZADA</option>
                      </select>
                    </th>
                    <th scope="row">
                      <select id="liberada_por_auditoria" onChange={cambiomasivos} style={{fontSize:12}}>
                        <option> {valores[0].liberada_por_auditoria}</option>
                        <option> </option>
                        <option> ACEPTADA</option>
                        <option> RECHAZADA</option>
                      </select>
                    </th>
                    <th scope="row">
                      <select id="liberada_por_sap" onChange={cambiomasivos} style={{fontSize:12}}>                                            
                        <option> {valores[0].liberada_por_sap}</option>
                        <option>  </option>
                        <option> ACEPTADA</option>
                        <option> RECHAZADA</option>
                      </select>
                    </th>
                  </tr>
                </table>
              </Stack>
              <stack direction="row">
                <button
                 onClick={() => { postearStatus() }} className="btn btn-success">{" "}Confirmar Masivo{" "}
                  </button>
                <button
                  style={{ marginLeft: "10px" }} className="btn btn-danger" onClick={handleClose}>Cancelar{" "}
                </button>
              </stack>
            </Box>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  function CustomToolbar() {
      const [poHist,setpoHist] = React.useState();
    return (
  <GridToolbarContainer>
    <GridToolbarExport />
        <Link to={`/importaciones/controldocumental/matrizcd/NuevaPO`} style={{backgroundColor:"#3C7D22"}} className="btn btn-success">  NUEVA PO </Link>
        <button  style={{backgroundColor:"#4EA72E"}}  className="btn btn-success"  onClick={() => { setdialogo(true);}}>
          {" "} Filtro por POs{" "}
        </button>
        {/* <button style={{backgroundColor:"#8ED973"}}  className="btn btn"  name="PLANEACION" onClick={(e)=>{ filtrosCalculados(e) }}> Filtro Planeacion</button>
        <button style={{backgroundColor:"#B5E6A2"}}  className="btn btn"  name="ENVIO" onClick={(e)=>{ filtrosCalculados(e) }}> Filtro Envio</button> */}
        <button  style={{backgroundColor:"#CAE8AA"}}  className="btn btn" name="Refresh" onClick={()=>{ refreshTab() }}> <b>↻</b> </button>
    <Stack style={{width:'40%'}} direction='row' sx={{marginLeft:'2px' ,border:'dotted black 1px'}}>
        <ReactSelect 
        options={areasdestinolista}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        components={{Option }}
        onChange={handleChange}
        value={state.optionSelected}
      />
      {["inicio", "fin"].map((t) => (
        <div key={t}>
          <input
            type="date"
            className="form-control"
            value={rango[t]}
            onChange={(e) => setRango({ ...rango, [t]: e.target.value })}
          />
        </div>
      ))}
<button className="btn btn-success" onClick={(e)=>{filtrosCalculados(e)}}>Filtrar</button>
      </Stack>
        {modificar === true ? (
          <button onClick={() => { abrirdialogo(filtrofull);}}style={{ backgroundColor: "red", borderRadius: "10px", color: "white",}}>{" "} Modificar Masivo{" "} </button>
        ) : (
          <button hidden className="modi">{" "} Modificar{" "} </button>
        )}
        <input   onChange={(a) =>{setpoHist(a.target.value)}}  placeholder="Historial PO" value={poHist}></input>
        <Link to={`/importaciones/controldocumental/matrizcd/historialCD`} state={{ poHist }} className="btn btn-secondary" name="buscarHist" >🔍</Link>
        <Box sx={{ flexGrow: 1 }} />
        <ExportarExcelMATRIZ columns={columns} rows={valores} fuente="MatrizCD"  />
        {/* <GridToolbarExport  csvOptions={{ utf8WithBom: true, }} slotProps={{ tooltip: { title: "Export data" }, button: { variant: "outlined" },}} /> */}
        <br></br>
        <br></br>
      </GridToolbarContainer>
  );
  }


if (loading) {
  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.9)",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 0 15px rgba(0,0,0,0.2)",
      zIndex: 9999
    }}>
      <CircularProgress />
      <p style={{ marginTop: "12px", fontWeight: "bold" }}>Actualizando...</p>
    </div>
  );
}
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
      }}
    >

      <DataGrid
        sx={{
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
        }}
processRowUpdate={async (updatedRow, originalRow) => {
  try {
    const rowActualizada = await funcionModif(
      updatedRow.id,
      updatedRow,
      originalRow
    );
    setRowModesModel((prev) => ({
      ...prev,
      [updatedRow.id]: { mode: "view" },
    }));
    return rowActualizada;
  } catch (error) {
    console.error("Error en DataGrid:", error);
  throw error; 
  }
}}
        getRowHeight={() => ["daguilarm", "natorreg", "mrgarnicah", "arramirez", "gdlopezl", "pruebacd"].includes(localStorage.getItem("username")) ? "auto" : ""}
        filterMode="client"
        disableColumnFilter={false}
        disableColumnSelector={false}
        disableDensitySelector={false}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        sortModel={sortModel}
        rows={valores}
        onCellEditStart={(params) => {
          params.field === "unidad_de_negocio" ? setbu(true):setbu(false) ;
        }}
        columns={columns}
        editMode="cell"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        slots={{
          toolbar: CustomToolbar,
        }}
      />
    </Box>
    </div>
  );
}

export default FullFeaturedCrudGrid;