import React, { useState, useEffect } from 'react';
import {CircularProgress } from '@mui/material';
import ClientesService from "../service/ClientesService";
import { useNavigate } from "react-router-dom";
import './Calculadora.css';

function CalculadoraC(){
  const navigate = useNavigate();
  const [listaProveedores, setListaProveedores] =useState([]);
  const [soc, setSoc] =useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] =useState(null);
  const [folioSeleccionado, setfolioSeleccionado] =useState();
  const [revisados, setRevisados]=useState(null);
  const [tablas, setTablas]=useState([]);
  const [codigos, setCodigos]=useState(null);
  const [contactosAll, setContactosAll]=useState(null);
  const [codigosPlaneador, setCodigosPlaneador]=useState(null);
  const [contactosPlanta, setContactosPlanta]=useState(null);
  const [bufferPlanta, setBufferPlanta]=useState(null);
  const [matrizCalculadora, setMatrizCalculadora]=useState(null);
  const [total, setTotal]=useState(0);
  const [totalqty, setTotalQty]= useState(0);
  const [wkshAll, setWkshAll]=useState(null);
  const [loading, setLoading] = useState(false);
  const [ancho, setAncho] = useState(window.screen.width);

  useEffect(() => {
    const detectarCambio = () => {  
      setAncho(window.screen.width);
    };
    window.addEventListener("resize", detectarCambio);
    return () => {
      window.removeEventListener("resize", detectarCambio);
    };
  }, []);

  useEffect(() => {
  const cargarDatos = async () => { setLoading(true);
    try {
      const [
        resProveedores,
        resSoc,
        resRevisados,
        resCodigos,
        resContactos,
        resMatriz,
        resWksh,
        resCodigosPlaneador, resContactosPlanta, resBufferPlanta,
      ] = await Promise.all([
        ClientesService.getproveedoresall(),
        ClientesService.getSocHistorial(),
        ClientesService.getRevisados(),
        ClientesService.getCodigosAll(),
        ClientesService.getcontactosall(),
        ClientesService.getMatrizCalculadoraAll(),
        ClientesService.getWksh(),
        ClientesService.getCodigosPlaneadorAll(),
        ClientesService.getContactosPlantaAll(),
        ClientesService.get_buffer_planta(),
      ]);
      setListaProveedores(resProveedores.data || []);
      setSoc(resSoc.data || []);
      setRevisados(resRevisados.data || []);
      setCodigos(resCodigos.data || []);
      setContactosAll(resContactos.data || []);
      setMatrizCalculadora(resMatriz.data || []);
      setWkshAll(resWksh.data || []);
      setCodigosPlaneador(resCodigosPlaneador.data||[]);
      setContactosPlanta(resContactosPlanta.data||[]);
      setBufferPlanta(resBufferPlanta.data||[]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  cargarDatos();
}, []);

const handleProveedorCalc=(valor)=>{
    if(!valor){
      setProveedorSeleccionado(null);
      return null;
    }
    const proveedorSelect= listaProveedores.find(p => {
      const prov= p.acreedor || p.noProveedor || p.noproveedor;
      return prov?.toString().trim()===valor.toString().trim();
    });
   const provs= proveedorSelect || {noProveedor: valor.toString().trim()}
   setProveedorSeleccionado(provs);
   return provs;
  } 

  const handlefolioT=(val)=>{
    if(!val){
      setfolioSeleccionado(null);
      setTablas([]);
      setTotal(0);
      setTotalQty(0);
      return;
    }
    const foliot = soc.find(s=>s.foliott?.toString().trim() === val.trim());
    let provActual = proveedorSeleccionado;
    const numProvSoc = foliot?.no_de_proveedor;
    if (numProvSoc) {
      provActual = handleProveedorCalc(numProvSoc);
    }
    const proveedorr=provActual?.noProveedor.toString().trim();

    if(foliot){
      setfolioSeleccionado(foliot);
      const noocObtenido =  foliot.foliott;
      if(noocObtenido){
        const cod = revisados.filter((r) => r.po === noocObtenido);
        const bus = cod.map((fila)=>{
          const codi = codigos.find((c) => (c.codigo || c.Codigo)?.toString().trim() === fila.material?.toString().trim());
          const codPlan = !codi ? codigosPlaneador.find((cp) => cp.item?.toString().trim() === fila.material?.toString().trim()) : null;

          const bubu = (codi?.UnidadDeNegocio || codi?.unidad_de_negocio || codi?.unidadDeNegocio || "").toString().trim();
          const bubuUCASE = bubu.toUpperCase();

          const cont = contactosAll.find((cs) => {
            const contactoo = (cs.unidaddeNegocio)?.toString().trim();
            return contactoo === bubu || contactoo === bubuUCASE;
          });

          
          const contPlanta = !codi && codPlan ? contactosPlanta.find((cs) => 
            (cs.gerente|| "").toString().trim().toLowerCase().includes((codPlan.gerente_planner || "").toLowerCase())) : null;
          const grupoPlan = cont?.grupoplan?.toString().trim() || "N/A";
          const mostarbu = codi ? ((grupoPlan === "N/A" || grupoPlan === "" || !grupoPlan) ? bubu : grupoPlan + " " + bubu)
          : (contPlanta?.bu || "");

          //planta y planeador del buffer
          const codigoPlantaPlaneador=(codPlan?.item || fila.material?.toString().trim())?.toString().trim();
          const plantaCruce= bufferPlanta.find((bp)=>{
            const codigoss=(bp.codigo)?.toString().trim();
            const pr=(bp.proveedor)?.toString().trim();
            const matchFolio= codigoss ===codigoPlantaPlaneador;
            const matchproved=(proveedorr)? pr.includes(proveedorr):true;
            return matchFolio && matchproved;
          }) 

          const tipomat = (codi?.codigo || codi?.Codigo || fila.material?.toString().trim())?.toString().trim();
          const tip = matrizCalculadora.find((mc)=>{
            const tipo=(mc.codigo)?.toString().trim();
            const provMC = (mc.no_proveedor)?.toString().trim();
            const matchCodigo = tipo === tipomat;
            const matchProveedor = (proveedorr)? provMC === (proveedorr): true;
            return matchCodigo && matchProveedor;
          })
          
          const concatBusqueda = `${proveedorr}${bubu}`;
          
          const registroWksh = wkshAll.find((w) => {
            const concatWksh = (w.concatenar).toString().trim();
            const matchConcat = concatWksh === concatBusqueda;
            const matchProv = w.no_Proveedor?.toString().trim() === proveedorr;
            const matchBU = (w.bu)?.toString().trim() === bubu;
            return matchConcat || (matchProv && matchBU);
          });
          
          const compradorFinal = codi ? (cont ? `${cont.drsr || ''}-${cont.drjr || ''}-${cont.gerenteBU || ''}-${cont.comprador || ''}` : "")
          : (codPlan?.comprador || "");

        const planeadorFinal = codi ? (cont ? `${cont.gteplan || ''}-${cont.planPlan || ''}` : "")
          : (`${codPlan?.gerente_planner || ''}-${codPlan?.nombre_planner || ''}`);


          return{
            ...fila, 
            bu: mostarbu,
            comprador: compradorFinal,
            planeador: planeadorFinal,
            tipomatriz: (tip?.tipomatriz) || "N/A", 
            tc_MP: (registroWksh?.tc_MP) || "",
            subtotalPo: Number(((fila.cantidad)*(fila.precio)) || 0),
            cantidad: Number(fila.cantidad || 0),
            planeadorDatos: (plantaCruce?.planeador) || "",
            planta: (plantaCruce?.planta) || "",
            esCodi: Boolean(codi),
          }
        })
        const sumaQty = bus.reduce((acc, fila) => acc + fila.cantidad, 0);
        let sumaMonto = 0;
        sumaMonto = bus.reduce((acc, fila) => acc + fila.subtotalPo, 0);

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
    const qtyPi = Number(field === 'qtyPi' ? value : (fila.qtyPi ?? fila.cantidad)) || 0;
    const precioPi = Number(field === 'precioPi' ? value : (fila.precioPi ?? fila.precio)) || 0;
    fila.subtotalPi = qtyPi * precioPi;
    nuevasTablas[index] = fila;
    setTablas(nuevasTablas);
  }

  const agregarFila=() => {
    const nuevaFila={
      material: "", bu: "", planeador: "",comprador: "",
      tipomatriz: "", cantidad: "", precio: "", subtotalPo: ""
    }
    setTablas((prevTablas) => [...prevTablas, nuevaFila]);
  }

  const eliminarFila=(filaIndex) => {
    const nuevasTablas = tablas.filter((_, index) => index !== filaIndex); // _ ignora el elemnto y toma el indice numS
    setTablas(nuevasTablas);
    const nuevaSumaQty = nuevasTablas.reduce((acc, fila) => acc + (Number(fila.cantidad) || 0), 0);
    const nuevaSumaMonto = nuevasTablas.reduce((acc, fila) => acc + (Number(fila.subtotalPo) || 0), 0);

    setTotalQty(nuevaSumaQty);
    setTotal(nuevaSumaMonto);
  }

  const handleCodigoIngresado=(nuevoCodigo, index)=>{
    const nuevasTablas=[...tablas];
    const filaAct={...nuevasTablas[index]}
    filaAct.material=nuevoCodigo;

    if(nuevoCodigo){
      const prov = (proveedorSeleccionado?.noProveedor || "").toString().trim();
      const codi = codigos.find((c) => (c.codigo || c.Codigo)?.toString().trim() === nuevoCodigo.toString().trim());
      const codPlan = !codi ? codigosPlaneador.find((cp) => cp.item?.toString().trim() === nuevoCodigo.toString().trim()) : null;

      const qtyprc= revisados.find((r) => (r.material || r.codigo || r.Codigo)?.toString().trim() === nuevoCodigo)
      const cantEncontrada = Number(qtyprc?.cantidad || codi?.cantidad || 0);
      const precioEncontrado = Number(qtyprc?.precio || codi?.precio || 0);
      
      const bubu = (codi?.UnidadDeNegocio || codi?.unidad_de_negocio || codi?.unidadDeNegocio || "").toString().trim();
      const cont = contactosAll.find((cs) => (cs.unidaddeNegocio)?.toString().trim() === bubu);
      const contPlanta = !codi && codPlan ? contactosPlanta.find((cs) => 
            (cs.gerente|| "").toString().trim().toLowerCase().includes((codPlan.gerente_planner || "").toLowerCase())) : null;
      const grupoPlan = cont?.grupoplan?.toString().trim() || "N/A";
      const mostarbu = codi ? ((grupoPlan === "N/A" || grupoPlan === "" || !grupoPlan) ? bubu : grupoPlan + " " + bubu)
        : (contPlanta?.bu || "");

      const codigoPlantaPlaneador=(codPlan?.item ||nuevoCodigo)?.toString().trim();
      const plantaCruce= bufferPlanta.find((bp)=>{
        const codigoss=(bp.codigo)?.toString().trim();
        const pr=(bp.proveedor)?.toString().trim();
        const matchFolio= codigoss ===codigoPlantaPlaneador;
        const matchproved=(prov)? pr.includes(prov):true;
        return matchFolio && matchproved;
      }) 

      const tipomat=(codi?.codigo || codi?.Codigo)?.toString().trim() || nuevoCodigo;
      const tip=matrizCalculadora.find((mc)=>{
        const tipo=(mc.codigo)?.toString().trim();
        const provMC = (mc.no_proveedor)?.toString().trim();
        const matchCodigo = tipo === tipomat;
        const matchProveedor = prov ? provMC === prov : true;
        return matchCodigo && matchProveedor;
      })
      const concatBusqueda = `${proveedorSeleccionado?.noProveedor}${bubu}`;
      const registroWksh = wkshAll.find((w) => {
        const concatWksh = (w.concatenar || "").toString().trim();
        const matchConcat = concatWksh === concatBusqueda;
        const matchProv = w.no_Proveedor?.toString().trim() === proveedorSeleccionado?.noProveedor;
        const matchBU = (w.bu)?.toString().trim() === bubu;
        return matchConcat || (matchProv && matchBU);
      });


      filaAct.bu = mostarbu;
      filaAct.comprador=codi ? (cont ? `${cont.drsr || ''}-${cont.drjr || ''}-${cont.gerenteBU || ''}-${cont.comprador || ''}` : ""): (codPlan?.comprador || "");
      filaAct.planeador = codi ? (cont ? `${cont.gteplan || ''}-${cont.planPlan || ''}` : "") : (`${codPlan?.gerente_planner || ''}-${codPlan?.nombre_planner || ''}`);
      filaAct.tipomatriz = tip?.tipomatriz || tip?.tipoMatriz || "N/A";
      filaAct.etd = qtyprc?.etd || "";
      filaAct.tc_MP = registroWksh?.tc_MP || "";
      filaAct.cantidad = cantEncontrada;
      filaAct.precio = precioEncontrado;
      filaAct.subtotalPo = cantEncontrada * precioEncontrado;
      filaAct.planeadorDatos= plantaCruce?.planeador || "";
      filaAct.planta=plantaCruce?.planta || "";
    } else{
      filaAct.bu = "";
      filaAct.tipomatriz = "";
      filaAct.tc_MP = "";
      filaAct.cantidad = 0;
      filaAct.precio = 0;
      filaAct.subtotalPo = 0;
    }
    nuevasTablas[index] = filaAct;
    setTablas(nuevasTablas);
    const nuevaSumaQty = nuevasTablas.reduce((acc, f) => acc + (Number(f.cantidad) || 0), 0);
    const nuevaSumaMonto = nuevasTablas.reduce((acc, f) => acc + (Number(f.subtotalPo) || 0), 0);
    setTotalQty(nuevaSumaQty);
    setTotal(nuevaSumaMonto);
  }

  const totalQtyPi = tablas?.reduce((acc, f) => acc + (Number(f.qtyPi !== undefined ? f.qtyPi : f.cantidad) || 0), 0);
  const totalSubtotalPi = tablas?.reduce((acc, f) => acc + (Number(f.subtotalPi !==undefined ? f.subtotalPi : f.subtotalPo) || 0), 0);

  return (
    <div style={{ marginTop: '5%' , width:"85vw"  , marginLeft: ancho >= 1290 ? 'calc(-12vw)' : 'calc(-2vw)' }}>
    {loading ?  (   <div style={{padding:'20%' , marginLeft:'10%'}}> <CircularProgress /> <label>Cargando</label> </div> ) : (  
  <div className="container-fluid p-4 border" style={{ minHeight: "130vh" }}>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold text-dark m-0 fs-4"></h2>
      <button className="btn btn-outline-secondary btn-sm shadow-sm" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"></i> Regresar
      </button>
    </div>

      <div className="row g-3 justify-content-center y text-center">
        <div className="col-md-1">
          <label className="form-label fw-bold extra-small text-muted mb-1">Folio TT</label>
          <input type="text" className="form-control form-control-sm" value={folioSeleccionado?.foliott || ""} onChange={(e) => handlefolioT(e.target.value)} />
        </div>
        <div className="col-md-1">
          <label className="form-label fw-bold extra-small text-muted mb-1">No. O.C.</label>
          <input type="text" className="form-control form-control-sm" value={folioSeleccionado?.nooc || ""} readOnly/>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-bold extra-small text-muted mb-1">No. De Proveedor</label>
          <input type="text" className="form-control form-control-sm" value={proveedorSeleccionado?.noProveedor || ""} onChange={(e) => handleProveedorCalc(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold extra-small text-muted mb-1">Nombre Proveedor</label>
          <input type="text" className="form-control form-control-sm bg-light" readOnly value={proveedorSeleccionado?.proveedor || ""} />
        </div>
        
        {tablas[0]?.esCodi &&(
          <>
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
        </div></>
        )}
            
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
    <div className="table-responsive shadow-sm rounded bg-white p-2">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead>
          <tr className="table-dark text-center small align-middle">
            <th className="bg-white"><button className="btn btn-success btn-sm fw-bold px-2 py-0" onClick={agregarFila}>+</button></th>
            <th>CÓDIGO</th>
            {!tablas[0]?.esCodi && (
              <>
              <th>PLANTA</th>
              <th>PLANEADOR</th>
              </>
            )}
            <th>BU</th>
            <th>PLANNER</th>
            <th>Comprador Sr./Comprador</th>
            <th>Tipo de Matriz</th>
            <th>QTY PO</th>
            <th>PRECIO PO</th>
            <th>SUBTOTAL PO</th>
            <th>ETD PO</th>

            <th style={{backgroundColor:'white'}}></th>
            <th className="bg-primary text-white" style={{width: "90px"}}>QTY PI</th>
            <th className="bg-primary text-white" style={{width: "100px"}}>PRECIO PI</th>
            <th className="bg-primary text-white" style={{width: "120px"}}>SUBTOTAL PI</th>
              <th style={{backgroundColor:'white'}}></th>
            <th className="bg-secondary text-white">BU LCI</th>
            <th className="bg-secondary text-white">Aplica reducción TC/MP</th>
          </tr>
        </thead>
        <tbody className="small">
          {tablas && tablas.length > 0 ? (
            tablas.map((fila, index) => (
              <tr key={index}>
                <td style={{ width: '15px' }} className="text-center">
                  <button className="btn btn-danger btn-sm fw-bold px-2 py-0" onClick={() => eliminarFila(index)}>-</button>
                </td>
                <td style={{ width: '80px' }}>
                  <input className="form-control form-control-sm text-center fw-bold" value={fila.material || ""} onChange={(e) => handleCodigoIngresado(e.target.value, index)} />
                </td>
                {!tablas[0]?.esCodi && (
                  <>
                  <td style={{width: '170px'}}>{fila.planta}</td>
                  <td style={{width: '120px'}}>{fila.planeadorDatos}</td>
                  </>
                )}
                <td style={{width: '130px'}}>{fila.bu}</td>
                <td style={{width: '210px'}}>{String(fila.poth)?.startsWith("6") ? "Mario Emmanuel Delgadillo Aguilar - Abril Rosales" : fila.planeador}</td>
                <td style={{width: '250px'}}>{fila.comprador}</td>
                <td style={{width: '100px'}} className="text-center">{fila.tipomatriz}</td>
                <td style={{width: '70px'}} className="text-center">{new Intl.NumberFormat('es-MX').format(fila.cantidad || 0)}</td>
                <td style={{width: '100px'}}>${fila.precio}</td>
                <td style={{width: '100px'}} className="fw-bold text-success">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format((fila.cantidad || 0) * (fila.precio || 0))}</td>
                <td style={{width: '70px'}}>{fila.etd ? new Date(fila.etd).toLocaleDateString('es-Mx') : ''}</td>
                  <td></td>
                <td className="p-1 align-middle">
                  <input className="form-control form-control-sm text-center" value={fila.qtyPi !== undefined ? fila.qtyPi : (fila.cantidad || '')} onChange={(e) => handleInputChange(index, 'qtyPi', e.target.value)} />
                </td>
                <td className="p-1 align-middle">
                  <input className="form-control form-control-sm text-end" value={fila.precioPi !== undefined ? fila.precioPi : (fila.precio || '')} onChange={(e) => handleInputChange(index, 'precioPi', e.target.value)} />
                </td>
                <td className="text-end fw-bold text-primary bg-light px-2 text-nowrap align-middle">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(fila.subtotalPi !== undefined ? fila.subtotalPi : (fila.subtotalPo || 0))}
                </td>
                  <td></td>
                <td className="align-middle">{fila.bu}</td>
                <td className="text-center align-middle">
                  <span>{fila.tc_MP || "NO"}</span>
                </td>
              </tr>
            ))
            ) : (
            <tr>
              <td colSpan="17" className="text-center text-muted bg-light py-3 text-center">Sin códigos encontrados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  )}
  </div>
)
};
export default CalculadoraC;