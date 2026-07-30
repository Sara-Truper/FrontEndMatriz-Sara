import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import ClientesService from "../service/ClientesService";
import FileSaver from 'file-saver';
import { useNavigate } from "react-router-dom";
import {grupoCompras} from './materialReutilizable/RangosReusables';

function CalculadoraC(){
  const navigate = useNavigate();
  const [listaProveedores, setListaProveedores] =useState([]);
  const [soc, setSoc] =useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] =useState(null);
  const [folioSeleccionado, setfolioSeleccionado] =useState(null);
  const [revisados, setRevisados]=useState(null);
  const [tablas, setTablas]=useState([]);
  const [codigos, setCodigos]=useState(null);
  const [contactosAll, setContactosAll]=useState(null);
  const [matrizCalculadora, setMatrizCalculadora]=useState(null);
  const [total, setTotal]=useState(0);
  const [totalqty, setTotalQty]= useState(0);
  const [cantidades, setCantidades] = useState({});
  const [wkshAll, setWkshAll]=useState(null);

  useEffect(() => {
    ClientesService.getproveedoresall().then((response) => {
      setListaProveedores(response.data || []);
    }).catch((error) => console.error("Error:", error));

    ClientesService.getSocHistorial().then((response) => {
      setSoc(response.data || []);
      //console.log(response.data)
    }).catch((error) => console.error("Error:", error));

    ClientesService.getRevisados().then((response)=>{
      setRevisados(response.data || []);
    }).catch((error)=>console.error("Error:", error))

    ClientesService.getCodigosAll().then((response)=>{
      setCodigos(response.data || []);
    }).catch((error)=>console.log("Error:", error))

    ClientesService.getcontactosall().then((response)=>{
      setContactosAll(response.data ||[]);
    }).catch((error)=>console.log("Error: ", error))

    ClientesService.getMatrizCalculadoraAll().then((response)=>{
      setMatrizCalculadora(response.data ||[]);
    }).catch((error)=>console.log("Error:",error))

    ClientesService.getWksh().then((response)=>{
      setWkshAll(response.data || []);
      console.log(response.data)
    }).catch((error)=>console.log("Error:",error))
  },[])

  const handleProveedorCalc=(valor)=>{
    if(!valor){
      setProveedorSeleccionado(null);
      return;
    }
    //console.log(socs)
    const proveedorSelect= listaProveedores.find(p => {
      const prov= p.acreedor || p.noProveedor || p.noproveedor;
      return prov?.toString().trim()===valor.trim();
    });
        //console.log(proveedorSelect)
    if(proveedorSelect){
      setProveedorSeleccionado(proveedorSelect);
    }else{
      setProveedorSeleccionado({noProveedor: valor})
    }
  } 

  const handlefolioT=(val)=>{
    if(!val){
      setfolioSeleccionado(null);
      setTablas([]);
      setTotal(0);
      setTotalQty(0);
      return;
    }

    const foliot=soc.find(s=>s.foliott?.toString().trim() === val.trim());
    if(foliot){
      setfolioSeleccionado(foliot);
      const noocObtenido=foliot.nooc;
      
      if(noocObtenido){
        const cod=revisados.filter((r)=>r.poth ===noocObtenido);
        //console.log(codigos)
        const bus=cod.map((fila)=>{
          const codi = codigos.find((c) => {
            const codig = (c.codigo || c.Codigo)?.toString().trim();
            return codig === fila.material?.toString().trim();
          });
          /* matrzicalcualdora --- tipomatriz */
          const tipomat=(codi?.codigo || codi?.Codigo)?.toString().trim();
          const tip=matrizCalculadora.find((mc)=>{
            const tipo=(mc.codigo)?.toString().trim();
            const matchCodigo = tipo === tipomat;
            const matchProveedor = mc.no_proveedor?.toString().trim() === proveedorSeleccionado?.noProveedor?.toString().trim();
            return matchCodigo && matchProveedor;
          })
          //console.log(tip)

          //
          const bubu = (codi?.UnidadDeNegocio || codi?.unidad_de_negocio || codi?.unidadDeNegocio || "").toString().trim();
          const concatBusqueda = `${proveedorSeleccionado?.noProveedor}${bubu}`;
          
          const registroWksh = wkshAll.find((w) => {
            const concatWksh = (w.concatenar || "").toString().trim();
            const matchConcat = concatWksh === concatBusqueda;
            const matchProv = w.no_Proveedor?.toString().trim() === proveedorSeleccionado?.noProveedor;
            const matchBU = (w.bu)?.toString().trim() === bubu;
            return matchConcat || (matchProv && matchBU);
          });

          const cont=contactosAll.find((cs)=>{
            const contactoo=(cs.unidaddeNegocio)?.toString().trim();
            return contactoo===bubu;
          })
          const grupoPlan = cont?.grupoplan?.toString().trim() || "N/A";
          const mostarbu = (grupoPlan === "N/A" || grupoPlan==="" || !grupoPlan) ? bubu : grupoPlan+" "+bubu;


          return{
            ...fila, 
            bu: mostarbu,
            comprador: (cont?.drsr+"-"+cont?.drjr+"-"+cont?.gerenteBU+"-"+cont?.comprador) || "",
            planeador: (cont?.gteplan+"-"+cont?.planPlan) || "",
            tipomatriz: (tip?.tipomatriz) || "", 
            tc_MP: registroWksh?.tc_MP || "",
            subtotalPo: Number(((fila.cantidad)*(fila.precio)) || 0),
            cantidad: Number(fila.cantidad || 0) 
          }
          
        })
        //console.log(bus)
        const sumaQty = bus.reduce((acc, fila) => acc + fila.cantidad, 0);
        const idProveedorStr = (proveedorSeleccionado?.acreedor || proveedorSeleccionado?.noProveedor || proveedorSeleccionado?.noproveedor || "").toString().trim();
        let sumaMonto = 0;
        sumaMonto = bus.reduce((acc, fila) => acc + fila.subtotalPo, 0);

        //const sumaQtyPi=

        setTotalQty(sumaQty);
        setTotal(sumaMonto);
        setTablas(bus)
      }
    }else{
      setfolioSeleccionado({foliott:val, nooc:""})
      setTablas([]);
      setTotal(0);
      setTotalQty(0);
    }
  }

  const handleInputChange = (index, field, value) => {
    const nuevasTablas = [...tablas];
    const fila = { ...nuevasTablas[index] };
    fila[field] = value;
    const qtyPi = Number(fila.qtyPi) || 0;
    const precioPi = Number(fila.precioPi) || 0;
    fila.subtotalPi = qtyPi * precioPi;
    nuevasTablas[index] = fila;
    setTablas(nuevasTablas);
  }

  const totalQtyPi = tablas?.reduce((acc, f) => acc + (Number(f.qtyPi) || 0), 0);
  const totalSubtotalPi = tablas?.reduce((acc, f) => acc + (Number(f.subtotalPi) || 0), 0);

  const handleCantidadItemsChange=(index, value)=>{
    setCantidades({
      ...cantidades, 
      [index]: value
    })
  }

  return (
  <div className="container-fluid p-4 border" style={{ minHeight: "130vh" }}>
    
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold text-dark m-0 fs-4"></h2>
      <button className="btn btn-outline-secondary btn-sm shadow-sm" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"></i> Regresar
      </button>
    </div>

    
      <div className="row g-3">
        <div className="col-md-2">
          <label className="form-label fw-bold extra-small text-muted mb-1">No. De Proveedor</label>
          <input type="text" className="form-control form-control-sm" value={proveedorSeleccionado?.noProveedor || ""} onChange={(e) => handleProveedorCalc(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold extra-small text-muted mb-1">Nombre Proveedor</label>
          <input type="text" className="form-control form-control-sm bg-light" readOnly value={proveedorSeleccionado?.proveedor || ""} />
        </div>
        <div className="col-md-1">
          <label className="form-label fw-bold extra-small text-muted mb-1">Folio TT</label>
          <input type="text" className="form-control form-control-sm" value={folioSeleccionado?.foliott || ""} onChange={(e) => handlefolioT(e.target.value)} />
        </div>
        <div className="col-md-1">
          <label className="form-label fw-bold extra-small text-muted mb-1">No. O.C.</label>
          <input type="text" className="form-control form-control-sm" value={folioSeleccionado?.nooc || ""} onChange={(e) => handlefolioT(e.target.value)}/>
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label fw-bold extra-small text-muted mb-1">Directos</label>
          <input type="text" className="form-control form-control-sm bg-light text-end fw-bold" value={folioSeleccionado?.reporte_con_problemas || ""} readOnly />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-bold extra-small text-muted mb-1">RAZÓN SOCIAL</label>
          <input type="text" className="form-control form-control-sm bg-light text-center" 
            value={
              String(folioSeleccionado?.foliott).startsWith('8') ? 'PARCELMOBI' : 
              String(folioSeleccionado?.foliott).startsWith('7') ? 'TRADING SPECIALTIES' : 
              String(folioSeleccionado?.foliott).startsWith('0') || folioSeleccionado === "" ? 'TRUPER' : ""} 
            readOnly/>
        </div>
            
        <div className="col-md-3">
          <label className="form-label fw-bold extra-small text-muted mb-1">DIRECCIÓN</label>
          <textarea className="form-control form-control-sm bg-light" rows="2" readOnly
            value={`${proveedorSeleccionado?.calle || ""}, ${proveedorSeleccionado?.poblacion || ""}, ${proveedorSeleccionado?.dis1 || ""}`}/>
        </div>
        <div className="col-md-1">
          <label className="form-label fw-bold extra-small text-muted mb-1">C.P.</label>
          <input type="text" className="form-control form-control-sm bg-light" readOnly value={proveedorSeleccionado?.cp || ""} />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-bold extra-small text-muted mb-1">TAX ID</label> 
          <input type="text" className="form-control form-control-sm bg-light text-center" readOnly value={proveedorSeleccionado?.taxid !== "" ? proveedorSeleccionado?.taxid : proveedorSeleccionado?.taxid2} />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold extra-small text-danger mb-1">STATUS / PROBLEMA</label>
          <input type="text" className="form-control form-control-sm bg-warning fw-bold text-center" value={folioSeleccionado?.status_problema || ""} readOnly />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-bold extra-small text-muted mb-1">Status PO</label>
          <input type="text" className="form-control form-control-sm fw-bold text-center" />
        </div>
      </div>
    
<br></br>
    <div className="row g-2 mb-4 justify-content-center">
      <div className="col-md-2 col-6">
        <div className="card shadow-sm border-0 border-start border-success border-3 p-2 bg-white">
          <span className="fw-bold extra-small text-muted">TOTAL PO</span>
          <span className="fw-bold fs-6">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN'}).format(total || 0)}
          </span>
        </div>
      </div>
      <div className="col-md-2 col-6">
        <div className="card shadow-sm border-0 border-start border-success border-3 p-2 bg-white">
          <span className="fw-bold extra-small text-muted">TOTAL QTY PO</span>
          <span className="fw-bold fs-6">
            {new Intl.NumberFormat('es-MX').format(totalqty || 0)}
          </span>
        </div>
      </div>
      <div className="col-md-2 col-6">
        <div className="card shadow-sm border-0 border-start border-primary border-3 p-2 bg-white">
          <span className="fw-bold extra-small text-muted">TOTAL PI</span>
          <span className="fw-bold fs-6">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN'}).format(totalSubtotalPi || 0)}
          </span>
        </div>
      </div>
      <div className="col-md-2 col-6">
        <div className="card shadow-sm border-0 border-start border-primary border-3 p-2 bg-white">
          <span className="fw-bold extra-small text-muted">TOTAL QTY PI</span>
          <span className="fw-bold text-dark fs-6">
            {new Intl.NumberFormat('es-MX').format(totalQtyPi || 0)}
          </span>
        </div>
      </div>
    </div>

    <div className="table-responsive shadow-sm rounded border bg-white p-2">
      <div className="d-flex flex-nowrap align-items-start gap-3 pb-2">

        <div className="flex-shrink-0">
          <table className="table table-striped table-hover table-bordered align-middle mb-0">
            <thead className="table-dark text-center small">
              <tr>
                <th>CÓDIGO</th>
                <th>BU</th>
                <th>PLANNER</th>
                <th>Comprador Sr./Comprador</th>
                <th>Tipo de Matriz</th>
                <th className="bg-danger text-white">Cobre</th>
                <th>QTY PO</th>
                <th>PRECIO PO</th>
                <th>SUBTOTAL PO</th>
                <th>ETD PO</th>
              </tr>
            </thead>
            <tbody className="small">
              {tablas && tablas.length > 0 ? (
                tablas.map((fila, index) => (
                  <tr key={index} style={{ height: "40px" }}>
                    <td className="text-center fw-bold">{fila.material}</td>
                    <td>{fila.bu}</td>
                    <td>{fila.planeador}</td>
                    <td>{fila.comprador}</td>
                    <td className="text-center">{fila.tipomatriz}</td>
                    <td></td>
                    <td className="text-center">{new Intl.NumberFormat('es-MX').format(fila.cantidad || 0)}</td>
                    <td>${fila.precio}</td>
                    <td className="fw-bold text-success">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN'}).format((fila.cantidad || 0)*(fila.precio || 0))}</td>
                    <td>{fila.etd}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ height: "40px" }}>
                  <td colSpan="10" className="text-center text-muted bg-light">Sin códigos encontrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-shrink-0" style={{ width: "340px" }}>
          <table className="table table-striped table-hover table-bordered align-middle mb-0">
            <thead className="bg-primary text-white text-center small">
              <tr>
                <th style={{width:"90px"}}>QTY PI</th>
                <th style={{width:"110px"}}>PRECIO PI</th>
                <th style={{width:"140px"}}>SUBTOTAL PI</th>
              </tr>
            </thead>
            <tbody className="small">
              {tablas && tablas.length > 0 ? (
                tablas.map((fila, index) => (
                  <tr key={index} style={{height: "40px"}}>
                    <td className="p-1">
                      <input className="form-control form-control-sm text-center" value={fila.qtyPi || ''} onChange={(e) => handleInputChange(index, 'qtyPi', e.target.value)}/>
                    </td>
                    <td className="p-1">
                      <input className="form-control form-control-sm text-end" value={fila.precioPi || ''} onChange={(e) => handleInputChange(index, 'precioPi', e.target.value)}/>
                    </td>
                    <td className="text-end fw-bold text-primary bg-light px-2">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(fila.subtotalPi || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ height: "40px" }}>
                  <td colSpan="3" className="text-center text-muted bg-light">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-shrink-0">
          <table className="table table-striped table-hover table-bordered align-middle mb-0">
            <thead className="table-dark text-center small">
              <tr>
                <th>BU LCI</th>
                <th>Aplica reducción TC/MP</th>
              </tr>
            </thead>
            <tbody className="small">
              {tablas && tablas.length > 0 ? (
                tablas.map((fila, index) => (
                  <tr key={index} style={{ height: "40px" }}>
                    <td>{fila.bu}</td>
                    <td className="text-center">
                      <span>{fila.tc_MP || "NO"}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ height: "40px" }}>
                  <td colSpan="2" className="text-center text-muted bg-light">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-shrink-0" style={{ minWidth: "140px" }}>
          <table className="table table-striped table-hover table-bordered align-middle mb-0">
            <thead className="table-dark text-center small">
              <tr>
                <th>F&R MATRICES</th>
              </tr>
            </thead>
            <tbody className="small">
              <tr><td className='text-center'>RECHAZADAS</td></tr>
              <tr><td className='text-center'>AUDITORIA</td></tr>
              <tr><td className='text-center'>POOL MATRICES</td></tr>
              <tr><td className='text-center'>VALIDAR PB TEL </td></tr>
              <tr><td className='text-center'>PENDIENTES</td></tr>
              <tr><td className='text-center'>ESTATUS CD</td></tr>
            </tbody>
          </table>
        </div>

        {/* <div className="flex-shrink-0">
          <table className="table table-striped table-hover table-bordered align-middle mb-0">
            <thead className="table-dark text-center small">
              <tr>
                <th>GRUPO DE COMPRAS</th>
                <th>CANTIDAD DE ITEMS</th>
                <th>CONCATENADO</th>
              </tr>
            </thead>
            <tbody className="small">
              {grupoCompras.map((item, index) => (
                <tr key={index} >
                  <td className="text-center">{item}</td>
                  <td>
                    <input className="form-control form-control-sm text-center" value={item.cantitems}/>
                  </td>
                  <td>{item.nombre - item.cantitems}</td>
                </tr>
              ))} 
            </tbody>
          </table>
        </div> */}

      </div>
    </div>
  </div>
);
};
export default CalculadoraC;