import {React, useEffect, useState} from "react";
import MatrizCD from '../MatrizCD';
import { Link, useLocation } from "react-router-dom";
import ClientesService from "../../service/ClientesService";

function HistorialContenedor() {
  const[registro, setRegistro] = useState([])
 const location = useLocation();
  const { poHist } = location.state || {};
    useEffect(() => {
      consultarHistorial();
    }, []);
  const consultarHistorial = ()=>{
        ClientesService.getHistorialById(poHist).then((response)=>{
                setRegistro(response.data)
        }).catch((error)=>{
            console.log(error)
        });
  }
  return (
    <div>
      <div
        id="contenedor-segmento"
        style={{
          position: "fixed",
          top: "15%",
          left: "10%",
          width: "70%",
          height: "70%",
          backgroundColor: "rgba(255, 255, 255, 1)",
          border: "1px solid #ccc",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          zIndex: 1000,
          padding: "10px",
          overflowY: "auto",
        }}
      ><div>
        <span style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}> HISTORIAL PO: <b>{poHist}</b></span>
            <Link to={`/importaciones/controldocumental/matrizcd`} className="btn btn" style={{marginLeft:"68%" , color:"red", fontSize:"12px"}}>❌</Link>
        </div>
        <table style={{ width: "90%", borderCollapse: "unset" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #999", textAlign: "left" }}>
                Elemento
              </th>
              <th style={{ borderBottom: "1px solid #999", textAlign: "left" }}>
                Anterior
              </th>
              <th style={{ borderBottom: "1px solid #999", textAlign: "left" }}>
                Actual
              </th>
              <th style={{ borderBottom: "1px solid #999", textAlign: "left" }}>
                Fecha del Cambio
              </th>
              <th style={{ borderBottom: "1px solid #999", textAlign: "left" }}>
                Usuario
              </th>
            </tr>
          </thead>
          <tbody>
            {registro.map((item,index) => (
              <tr key={index}>
                <td style={{ padding: "4px 8px", border:"solid 1px " }}>{item.dato}</td>
                <td style={{ padding: "4px 8px" , border:"solid 1px " }}>{item.anterior}</td>
                <td style={{ padding: "4px 8px" , border:"solid 1px " }}>{item.actual}</td>
                <td style={{width:"110px", padding: "4px 8px", border: "solid 1px" }}>  {new Date(item.fechaactualizacion).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric", })}</td>
                <td style={{ padding: "4px 8px" , border:"solid 1px " }}>{item.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <MatrizCD />
      </div>
    </div>
  );
}

export default HistorialContenedor;
