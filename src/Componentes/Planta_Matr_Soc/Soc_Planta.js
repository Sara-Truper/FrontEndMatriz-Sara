import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Stack } from 'react-bootstrap';
import ClientesService from '../../service/ClientesService';
import { CircularProgress } from '@mui/material';


function Soc_Planta() {
    const [listProveedores, setlistProveedores] = useState([]);
    const [bufferPlanta,setbufferPlanta] =useState([]);
    const [loading, setLoading] = useState(false);


useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProveedores, resBuffer] = await Promise.all([
        ClientesService.getproveedoresall(),
        ClientesService.get_buffer_planta()
      ]);
      setlistProveedores(resProveedores.data);
      setbufferPlanta(resBuffer.data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

const columns_Soc_planta = [
        { field: 'po', headerName: 'PO',headerClassName: "gris",},
        { field: 'prov', headerName: 'Fabrica',headerClassName: "gris"},
        { field: 'comprador', headerName: 'Comprador',headerClassName: "gris"},
        { field: 'no_de_proveedor', headerName: 'No. De Proveedor',headerClassName: "gris"},
        { field: 'proveedor', headerName: 'PROVEEDOR',headerClassName: "gris"},
        { field: 'po_th', headerName: 'PO TH',headerClassName: "gris"},
        { field: 'tipo', headerName: 'Tipo',headerClassName: "gris"},
        { field: 'revisado', headerName: 'Revisado ( DG )',headerClassName: "gris"},
        { field: 'colocador', headerName: 'Colocador',headerClassName: "naran  "},
        { field: 'urgente', headerName: 'Urgente',headerClassName: "trial"},
        { field: 'codigo', headerName: 'Código',headerClassName: "gris"},
        { field: 'clave', headerName: 'Clave',headerClassName: "gris"},
        { field: 'confirmador', headerName: 'Confirmador',headerClassName: "gris"},
        { field: 'etd', headerName: 'ETD',headerClassName: "gris"},
        { field: 'fecha_inicial_sap', headerName: 'Fecha Inicial ',headerClassName: "ama"},
        { field: 'fecha_final_sap', headerName: 'Fecha Final',headerClassName: "ama"},
        { field: 'inicio_proceso_cd', headerName: ' Inicio  proceso CD',headerClassName: "verde"},
        { field: 'tiempo_real_cd', headerName: 'Tiempo Real',headerClassName: "ama"},
        { field: 'fecha_inicial_colocacion', headerName: 'Fecha Inicial ',headerClassName: "naran"},
        { field: 'fecha_final_colocacion', headerName: 'Fecha Final',headerClassName: "naran"},
        { field: 'tiempo_real_colocacion', headerName: 'Tiempo Real',headerClassName: "naran"},
        { field: 'comentarios_colocacion', headerName: 'Comentarios CD',headerClassName: "red"},
        { field: 'fecha_inicial_compras', headerName: 'Fecha Inicial ',headerClassName: "naran"},
        { field: 'fecha_final_compras', headerName: 'Fecha Final',headerClassName: "naran"},
        { field: 'tiempo_real_compras', headerName: 'Tiempo Real',headerClassName: "naran"},
        { field: 'comentarios_compras', headerName: 'Comentarios CD',headerClassName: "red"},
        { field: 'fecha_inicial_planeacion', headerName: 'Fecha Inicial ',headerClassName: "naran"},
        { field: 'fecha_final_planeacion', headerName: 'Fecha Final',headerClassName: "naran"},
        { field: 'tiempo_real_planeacion', headerName: 'Tiempo Real',headerClassName: "naran"},
        { field: 'comentarios_planeacion', headerName: 'Comentarios CD',headerClassName: "red"},
        { field: 'fecha_inicial_dircompras', headerName: 'Fecha Inicial ',headerClassName: "naran"},
        { field: 'fecha_final_dircompras', headerName: 'Fecha Final',headerClassName: "naran"},
        { field: 'tiempo_real_dircompras', headerName: 'Tiempo Real',headerClassName: "naran"},
        { field: 'comentarios_dircompras', headerName: 'Comentarios CD',headerClassName: "red"},
        { field: 'fecha_inicial_mp', headerName: 'Fecha Inicial ',headerClassName: "naran"},
        { field: 'fecha_final_mp', headerName: 'Fecha Final',headerClassName: "naran"},
        { field: 'tiempo_real_mp', headerName: 'Tiempo Real',headerClassName: "naran"},
        { field: 'comentarios_mp', headerName: 'Comentarios CD',headerClassName: "red"},
        { field: 'fecha_inicial_dg', headerName: 'Fecha Inicial',headerClassName: "ama"},
        { field: 'fecha_final_dg', headerName: 'Fecha final',headerClassName: "ama"},
        { field: 'tiempo_real_dg', headerName: 'Tiempo real',headerClassName: "ama"},
        { field: 'comentarios_dg', headerName: 'Comentarios CD',headerClassName: "red"},
        { field: 'enviada', headerName: 'ENVIADA', headerClassName:'trial'},
        { field: 'er_comentario', headerName: 'ER',headerClassName:'red'},
        { field: 'motivo_de_revisado', headerName: 'Motivo de Revisado', headerClassName:'trial'},
        { field: 'status', headerName: 'Status',headerClassName:'sap'},
        { field: 'días_totales_proceso', headerName: 'Días totales proceso',headerClassName:'sap'},
        {field:''},
        { field: 'observaciones_cd', headerName: 'Observaciones CD',headerClassName:'gris'},
        { field: 'correos_bu', headerName: 'correos BU'},
        { field: 'correos_confirmador', headerName: 'CORREOS CONFIRMADOR'},
        { field: 'correos', headerName: 'CORREOS'},
        { field: 'control_interno', headerName: 'Control Interno'},
]
    
  return ( 
  <div>
  {loading ? ( <div style={{padding:'25%'}}> <CircularProgress/><label>Actualizando</label>  </div> ) 
  : (
    <div style={{marginLeft:'-10%', marginTop:'5%' , width:'120%'}}>
        <Stack>
            {/* <button style={{width:'5%'}} className='btn btn-success'>Aceptar</button> */}
        </Stack>
    <DataGrid 
        columns={columns_Soc_planta} 
        // rows={bufferPlanta}
        >

    </DataGrid>
    </div>
)
}
</div>
)
}
export default Soc_Planta