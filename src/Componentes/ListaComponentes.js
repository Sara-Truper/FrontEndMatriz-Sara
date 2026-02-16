import React, { useEffect, useState } from "react";
import Clienteservice from "../service/ClientesService";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Stack from "@mui/material/Stack";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
export const ListaComponentes = () => {
  const [director, setDirector] = useState([]);
  const [Clientes, setClientes] = useState([]);
  const location = useLocation();
  const [nwarr, setnwarr] = useState([]);
  const [texto , settexto] = useState()
  const [filtD,setfiltD]= useState();
  const [EstatusR,setEstatusR]= useState();
  const [folioElim, setfolioElim] = useState({
    direccion: "",
    director: "",
    tipo: "",
    folio: "",
    textorecordatorio: "",
    frecuenciatipo: "",
    titular: "",
    frecuencia: "",
    fechaprogramada: "",
    estatus: "",
    comentarios: "",
    respuesta: false,
  });
  const navigate = useNavigate();
  const [view, setView] = useState(false);
  const [valorFolio, setvalorFolio] = useState("");
  const opciones = { day: "2-digit", month: "2-digit", year: "numeric" };

  const clickDir2 = (o) =>{
    setEstatusR(o)
    segundoFiltro(o);
 };
  const clickDir = (a) => {
    setfiltD(a);
    // setvalorFolio("");
    listarClientes(a);
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      listarClientes();
    }
  };
  const calculofech = (Cliente, meses, dias) => {
    if (meses !== 0) {
      var d = new Date(Cliente.fechaprogramada + "T00:00:00");
      d.setMonth(d.getMonth() + meses);
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
      }
    } else {
      var d = new Date(Cliente.fechaprogramada + "T00:00:00");
      d.setDate(d.getDate() + dias);
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
      }
    }
    let id = Cliente.id;
    Cliente.fechaprogramada = d.toISOString().slice(0, 10);
    Clienteservice.updateClientes(id, Cliente)
      .then((response) => {
        navigate(0);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const nuevafecha = (Cliente) => {
    if (Cliente.frecuenciatipo.includes("Quincenal")) {
      calculofech(Cliente, 0, 14);
    }
    if (Cliente.frecuenciatipo.includes("Diario")) {
      // si aplica condicion adicional
      calculofech(Cliente, 0, 1);
    }
    if (Cliente.frecuenciatipo.includes("48")) {
      // si aplica condicion adicional
      calculofech(Cliente, 0, 2);
    }
    if (Cliente.frecuenciatipo.includes("72")) {
      // si aplica condicion adicional
      calculofech(Cliente, 0, 3);
    }
    if (Cliente.frecuenciatipo.includes("Anual")) {
      calculofech(Cliente, 12);
    }
    if (Cliente.frecuenciatipo.includes("Bimestral")) {
      // si aplica condicion adicional
      calculofech(Cliente, 2);
    }
    if (Cliente.frecuenciatipo.includes("Cuatrimestral")) {
      // si aplica condicion adicional
      calculofech(Cliente, 4);
    }
    if (Cliente.frecuenciatipo.includes("Mensual")) {
      // si aplica condicion adicional
      calculofech(Cliente, 1);
    }
    if (Cliente.frecuenciatipo.includes("Semanal")) {
      calculofech(Cliente, 0, 7);
    }
    if (Cliente.frecuenciatipo.includes("Semestral")) {
      // si aplica condicion adicional
      calculofech(Cliente, 6);
    }
    if (Cliente.frecuenciatipo.includes("Trimestral")) {
      // si aplica condicion adicional
      calculofech(Cliente, 3);
    }
  };
  const deleteClientes = (folioElim) => {
    let id = folioElim.id;
    if (folioElim.respuesta === 'false'){ 
      folioElim.respuesta = "true";
    }else{
      folioElim.respuesta = "false";
    }
    Clienteservice.updateClientes(id, folioElim)
      .then((response) => {
        setView(false);
        navigate(0);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleClose = () => {
    setView(false);
  };
  const Popop = (Cliente) => {
     setfolioElim(Cliente);
     setView(true);
     if(Cliente.respuesta === 'true'){
      settexto('Reactivar')
     }else{
      settexto('Desactivar')
     }
  };
  useEffect(() => {
    listarClientes();
  }, []);

  if (view) {
    return (
      <Dialog onClose={handleClose} open={view}>
        <DialogTitle>Confirma <strong> {texto} </strong> {folioElim.folio} </DialogTitle>
        <DialogContent style={{ fontSize: 22 }}>
          {" "}
          Folio : {folioElim.folio}{" "}
        </DialogContent>
        <Stack direction="row">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button
            className="btn btn-success"
            onClick={() => deleteClientes(folioElim)}> {" "} Confirmar {" "}</button>
          <button
            style={{ marginLeft: "10px" }}
            className="btn btn-danger"
            onClick={handleClose}> Cancelar{" "} </button>
        </Stack>
        <br></br>
      </Dialog>
    );
  };
  const tercerfiltro = (x)=>{
    const nwarr = new Array();
    Clienteservice.getAllClientes().then((response) =>{
      for(let i = 0 ; i <= response.data.length; i++ ){
  if(typeof filtD === "undefined"){
          if(x ==="respondido"){
          if ( response.data[i].direccion === location.state.e && response.data[i].estatus !== null && response.data[i].respuesta === "false"  ){
          nwarr.push(response.data[i]);
          }
          }else{
            if ( response.data[i].direccion === location.state.e && response.data[i].estatus === null && response.data[i].respuesta === "false"  ){
              nwarr.push(response.data[i]);
            }}
}else {
        if(x ==="respondido"){
          if ( response.data[i].direccion === location.state.e && response.data[i].estatus !== null && response.data[i].respuesta === "false"  && response.data[i].director === filtD ){
          nwarr.push(response.data[i]);
          }}
          else{
            if ( response.data[i].direccion === location.state.e && response.data[i].estatus === null && response.data[i].respuesta === "false"  && response.data[i].director === filtD ){
              nwarr.push(response.data[i]);
              } 
          }}
      setClientes(nwarr);
    
    }}
  ).catch((error) => {
    console.log(error)
  })
};
  
  const segundoFiltro = (o)=>{
    const nwarr = new Array();
    if(o ==="activos"){
      o = "false"
    } else{
      o = "true"
    } ;
    Clienteservice.getAllClientes().then((response) => {
      for (let i = 0; i < response.data.length; i++) {
        if (filtD !== undefined){
          if( response.data[i].direccion === location.state.e &&  response.data[i].director === filtD && response.data[i].respuesta === o ){
          nwarr.push(response.data[i]);
        }
    }else{
      if( response.data[i].direccion === location.state.e  && response.data[i].respuesta === o ){
        nwarr.push(response.data[i]);
      }
    }
    setClientes(nwarr);
    }})
    .catch((error) => {
      console.log(error);
    });
  };
  const listarClientes = (a) => {
    const nwarr = new Array();
    if (typeof a === "undefined"  )  {
          Clienteservice.getAllClientes()
        .then((response) => {
          let i = 0;
          for (i = 0; i < response.data.length; i++) {
            if (valorFolio === "") {
              if (
                response.data[i].direccion === location.state.e &&
                response.data[i].respuesta === "false"
              ) {
                const exist = director.includes(response.data[i].director);
                if (exist === false) {
                  director.push(response.data[i].director);
                }
                nwarr.push(response.data[i]);
                setClientes(nwarr);
              }
            } else {
              let texto = response.data[i].textorecordatorio;
              let result = texto.toUpperCase();
              if (
                response.data[i].direccion === location.state.e &&
                response.data[i].respuesta === "false" &&
                result.includes(valorFolio.toUpperCase())
              ) {
                nwarr.push(response.data[i]);
                setClientes(nwarr);
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (typeof a != "undefined"  ) {
        Clienteservice.getAllClientes()
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              if (
                response.data[i].direccion === location.state.e &&
                response.data[i].director === a &&
                // a.target.id === "director" &&
                response.data[i].respuesta === "false"                 
              ) {
                const director = new Array();
                setClientes(director);
                const exist = director.includes(response.data[i].director);
                if (exist === false) {
                  director.push(response.data[i].director);
                }
                nwarr.push(response.data[i]);
                setClientes(nwarr);
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
  };

  const almacenperfil = localStorage.getItem("perfil");
  let max = Clientes.length;
  for (let i = 0; i < max; i++) {}
  return (
    <div style={{ margin: -70, zoom: "90%" }}>
      <br></br>
      <br></br>
      <br></br>
      <h4 className="text-center"> Recordatorios {location.state.e} </h4>
      <Stack direction="row">
        <Stack
          direction={"column"}
          style={{ height: 100, maxWidth: "40%", outlineStyle: "auto" }}
        >
          <br></br>
          <h6>
            <strong>&nbsp; Filtro Por Director </strong>
          </h6>
          <Stack direction="row" spacing={3}>
            {director.map((director) => (
              <Stack maxWidth={"70%"}>
                <label
                  style={{ fontSize: 12, textAlign: "center" }}
                  for={director}
                >
                  {" "}
                  &nbsp; {director} &nbsp;
                </label>
                <input
                  style={{ height: 20 }}
                  onClick={(a) => clickDir(a.target.value)}
                  type="radio"
                  id="director"
                  name="director"
                  value={director}
                ></input>
                <br></br>
              </Stack>
            ))}
          </Stack>
        </Stack>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
        <Stack marginTop={6} direction="column">
          <h6>
            <strong>&nbsp; Filtro por palabra Recordatorio </strong>
          </h6>
          <Stack direction="row">
            <input
              onChange={(e) => setvalorFolio(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ height: 30 }}
              type="text"
              id="folio"
              name="folio"
              placeholder="Palabra a Buscar"
              value={valorFolio}
            ></input>
            &nbsp;
            <button onClick={(e) => { listarClientes();}}>
              Buscar
            </button>
          </Stack>
        </Stack>
        <Stack width="80px"></Stack>
        <Stack direction="column" style={{ outline: "auto" }}>
          <br></br>
          <h5>&nbsp; Estatus Recordatorio &nbsp;  </h5> 
          <Stack direction="row" spacing={1}>
            {Array.from({ length: 2 }, (_, i) => {
              let valor = "";
              if (i === 0) {
                valor = "activos";
              }
              if (i === 1) {
                valor = "Inactivos";
              }
              if (i === 2) {
                valor = "Sin Respuesta";
              }
              return (
                <Stack direction="column" key={i}> <label htmlFor={`Activos${i}`} style={{ padding: "0 1em" }} >
                    {" "} {valor}{" "}
                  </label>
                  <input onChange={(o)=> clickDir2(o.target.value)} style={{ height: 20 }} type="radio" name="estatus" id={`{valor}${i}`} value={valor} ></input>
                <br></br>
                </Stack>
);
            })}
          </Stack>
        </Stack>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {EstatusR === 'activos' ?
                <Stack direction="column" style={{ outline: "auto" }}>
                  <br></br>
                  <h5>&nbsp; Respondidos  &nbsp; </h5>
                  <Stack direction='row' spacing={2}>
                    <Stack  direction='column'>
                  <label htmlFor='respondido' style={{ padding: "0 1em" }} >Si </label>
                    <input onClick={(x)=>{tercerfiltro(x.target.value) }} style={{ height: 20 }}  type="radio" name="Respuesta" id={'respondido'} value={'respondido'} ></input>
                    </Stack>
                    <Stack  direction='column'>
                    <label htmlFor={'NoRespondido'} style={{ padding: "0 1em" }} > No </label>
                    <input onClick={(x)=>{tercerfiltro(x.target.value) }} style={{ height: 20 }} type="radio" name="Respuesta" id={'NoRespondido'} value={'NoRespondido'} ></input>
                    </Stack>
                  </Stack>
                </Stack> 
                : <div hidden></div> 
                }
      </Stack>
      <br></br>
      <table
        id="myTable"
        className="table table-bordered table-striped"
        style={{ outlineStyle: "inset" }}
      >
        <thead
          style={{
            fontSize: 12,
            backgroundColor: "#949293",
            color: "white",
            textAlign: "center"}}>
          <th style={{width:120}} >Director</th> 
          <th style={{ width: 80 }}>Tipo</th>
          <th style={{ width: 120 }}>Folio</th>
          <th style={{ width: 100 }}>Frecuencia de envío</th>
          <th style={{ width: 130 }}>Titular</th>
          <th style={{ width: 100 }}>Fecha Inicio</th>
          <th style={{ width: 100 }}>Fecha Programada</th>
          <th style={{ width: 310 }}>Recordatorio</th>
            <th style={{ width: 75 }}>Estatus</th>
          {almacenperfil === "admin" ? 
           EstatusR === 'activos' || EstatusR === undefined  ? <th style={{ width: 155 }}>Validar / Editar / Eliminar</th> : <th style={{ width: 155 }}>Validar / Editar / Reactivar</th> 
           : 
            <></>
          }
        </thead>
        <tbody>
          {Clientes.slice() // Copia el arreglo para evitar mutar el original
            .sort(
              (a, b) =>
                new Date(a.fechaprogramada + "T00:00:00") -
                new Date(b.fechaprogramada + "T00:00:00")
            ) // Ordena por fechaprogramada
            .map((Cliente) => (
              <tr key={Cliente.id}>
                <td style={{ fontSize: 12, alignContent: "center" }}>
                  {Cliente.director}
                </td>
                <td style={{ fontSize: 12, alignContent: "center" }}>
                  {Cliente.tipo}
                </td>
                <td style={{ fontSize: 12, alignContent: "center" }}>
                  {Cliente.folio}
                </td>
                <td style={{ fontSize: 12, alignContent: "center" }}>
                  {Cliente.frecuenciatipo}
                </td>
                <td style={{ fontSize: 12, alignContent: "center" }}>
                  {Cliente.titular}
                </td>
                <td style={{ fontSize: 12, alignContent: "center" }}>
                  {Cliente.fechainicial}
                </td>
                {Math.floor(
                  new Date(Cliente.fechaprogramada + "T00:00:00").getTime() -
                    new Date().getTime()
                ) /
                  8.64e7 <
                2 ? (
                  <td
                    style={{
                      color: "white",
                      fontSize: 13,
                      alignContent: "center",
                      backgroundColor: "red",
                    }}
                  >
                    {new Date(
                      Cliente.fechaprogramada + "T00:00:00"
                    ).toLocaleDateString("es-MX", opciones)}
                  </td>
                ) : Math.floor(
                    new Date(Cliente.fechaprogramada + "T00:00:00").getTime() -
                      new Date().getTime()
                  ) /
                    8.64e7 >
                  15 ? (
                  <td
                    style={{
                      color: "white",
                      fontSize: 13,
                      alignContent: "center",
                      backgroundColor: "green",
                    }}
                  >
                    {new Date(
                      Cliente.fechaprogramada + "T00:00:00"
                    ).toLocaleDateString("es-MX", opciones)}
                  </td>
                ) : Math.floor(
                    new Date(Cliente.fechaprogramada + "T00:00:00").getTime() -
                      new Date().getTime()
                  ) /
                    8.64e7 <
                  15 ? (
                  <td
                    style={{
                      fontSize: 13,
                      alignContent: "center",
                      backgroundColor: "#DA851D",
                    }}
                  >
                    {new Date(
                      Cliente.fechaprogramada + "T00:00:00"
                    ).toLocaleDateString("es-MX", opciones)}
                  </td>
                ) : (
                  <td>
                    {new Date(
                      Cliente.fechaprogramada + "T00:00:00"
                    ).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                )}
                {almacenperfil === "admin" ||
                almacenperfil === "usuarioseguimiento" ? (
                  <td style={{ fontSize: 12, alignContent: "center" }}>
                    {Cliente.textorecordatorio}
                  </td>
                ) : null}
                <td>{Cliente.estatus}</td>
                {almacenperfil === "admin" ? (
                  <td>
                    <Stack direction="row" spacing={1}>
                      <button
                        className="btn btn-success"
                        onClick={() => nuevafecha(Cliente)} > ✔ </button>
                      <Link className="btn btn-warning" to={`/record/edit-Clientes/${Cliente.id}`} >
                        🖉
                      </Link>
                      { EstatusR === 'activos' || EstatusR === undefined  ?
                      <button value='eliminar' style={{ marginLeft: "10px" }} className="btn btn-danger" onClick={() => Popop(Cliente)} >
                        ❌
                      </button>
                      :
                      <button value='reactivar' style={{ marginLeft: "10px" }} className="btn btn-secondary" onClick={() => Popop(Cliente)} >
                        🔋
                      </button>
                      }
                    </Stack>
                  </td>
                ) : null}
              </tr>
            ))}
        </tbody>
      </table>
      <br></br>
    </div>
  );
};
export default ListaComponentes;