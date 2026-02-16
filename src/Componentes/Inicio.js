import React, { useEffect, useState } from 'react'
import Clientesservice from '../service/ClientesService';
import { Link , useNavigate } from 'react-router-dom';
import {DataGrid } from "@mui/x-data-grid";


export const Inicio = () => {
  const [sumas, setSumas] = useState({});
  const [estadotemporal, setestadotemporal] = useState({});  
  const [sumasneg, setSumasneg] = useState({});
  const [ultimos3,setultimos3]= useState({});
  const navigate = useNavigate();
  const direc = (e) =>{
        navigate('/record/clientes' , {state:{e: e.target.value}});

  } 
  const perfillocalusuario = localStorage.getItem('perfil')
  const usuariol = localStorage.getItem('username')
  const opciones = { day: "2-digit", month: "2-digit", year: "numeric" };

const columns = [
  {
    field: 'fecha_inicio',
    headerClassName: "gris",
    headerName: 'Fecha ',
    width: 150,
    editable: false,
      valueFormatter: (params) => {
        const date = new Date(params).toLocaleDateString("es-MX", opciones);
        return date;
      },
},
  {
    field: 'folio_tt',
    headerClassName: "gris",
    headerName: 'No. PO',
    width: 100,
    editable: false,
  },
  {
    field: 'no_oc',
    headerClassName: "gris",
    headerName: 'NO. OC',
    editable: false,
  },
  {
    field: 'area_destino',
    headerClassName: "gris",
    headerName: 'Area Destino',
    sortable: false,
    width: 200,
  },
  {
    headerClassName: "gris",
  },
];

useEffect(() => {
    traerultimosReg();
    traerUsersSesiones();
  }, []);

  const traerultimosReg = () =>{
    Clientesservice.getporUser().then((response)=>{
      setultimos3(response.data)
    }).catch((error)=>{
      console.log(error)
    })
  };
const traerUsersSesiones = () => {
    Clientesservice.traeUsuariosSesiones()
      .then((response) => {
        setestadotemporal(response.data)
        const data = response.data;
        const tempSumas = {};
        const tempSumasneg = {};        
        data.forEach((item) => {
          const lista = item.status_capa
            ?.split(",")
            .map((num) => num.trim())
            .filter(Boolean);
          lista?.forEach((valor) => {
            const texto = valor
            const numero = parseInt(texto.match(/\d+/)[0]);
            const sinNumero = texto.replace(/\d+/g, "");
          if(sinNumero === "true"){
                tempSumas[numero] = (tempSumas[numero] || 0) + 1;
          }else{
                tempSumasneg[numero] = (tempSumasneg[numero] || 0) + 1;                        
          }
          });
        });
      setSumas(tempSumas);  
      setSumasneg(tempSumasneg);

      })
      .catch((error) => {
        console.log(error);
      });
  };



if(perfillocalusuario === "ControlDocumental"){
return (
    <div style={{padding:"7%",width: '60%' }}>
      <span style={{padding:"1%", border: "1px solid black"}}>{localStorage.getItem("username").toUpperCase()}</span>
      <p></p>
      <div style={{width: '100%' }}>
      <DataGrid
        rows={ultimos3}
        columns={columns}
        pageSizeOptions={[]} 
        paginationModel={undefined}
        pagination={false}      />
    </div>
    </div>
  );

}else if(perfillocalusuario === "Documentos" && usuariol === "Ariel"){
  return (
  <div>
  </div>
  )
}
}
export default Inicio;