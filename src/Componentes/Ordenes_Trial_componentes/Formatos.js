import React, { useState, useEffect } from 'react';
import { BUs , razonSocial, tipoOrden,centro, colocador ,ordenador } from '../materialReutilizable/RangosReusables';
import ClientesService from '../../service/ClientesService';


const Formatos = () => {
  const [formData, setFormData] = useState({
    bu: '', responsable: '', fecha: new Date().toLocaleDateString('es-MX'),
    nombreProveedor:'', claveProveedor: '', terminoPago: '', moneda: '',
    noFabrica: '', nombreFabrica: '', spec: '', razonSocial: '',
    tipoOrden: '', tipoContenedor: '',
    almacen: '', puertoEmbarque: '', centro: '', sellos: {} 
  });

  const [fabricas, setFabricas] = useState([]);

  useEffect(() => {
    if (formData.bu && formData.bu !== "") {
      ClientesService.getcontactosall().then((response) => {
        const listaContactos = response.data || [];
        console.log(listaContactos)
        const cMap = listaContactos.find(c => String(c.unidaddeNegocio || c.unidad_de_negocio || "").trim() === String(formData.bu).trim());

        if (cMap) {
          setFormData(prev => ({
            ...prev,
            responsable: cMap.gte_responsable_bu || cMap.gerenteBU || ''
          }));
        } else {
          setFormData(prev => ({ ...prev, responsable: '' }));
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    } else {
      setFormData(prev => ({ ...prev, responsable: '' }));
    }
  }, [formData.bu]);


  useEffect(() => {
    if (formData.noSap && formData.noSap !== "") {
      ClientesService.getproveedoresall().then((response) => {
        const listaProveedores = response.data || [];
        console.log(listaProveedores)
        //const coincidencias = listaProveedores.filter(p => p.noproveedor && String(p.noproveedor).trim() === String(formData.noSap).trim());
        const pMap = listaProveedores.find(p => {
        const codigoProv = p.noProveedor || p.noproveedor || p.acreedor;
        return codigoProv && String(codigoProv).trim() === String(formData.noSap).trim();});

        //const pMap=coincidencias[0]; //primera coincidencia para antes de fabricas 
        /* const listaFabricas = coincidencias.filter(c => c.sapFabrica).map(c => ({
          noFabrica: c.sapFabrica,
          nombreFabrica: c.nombreFabrica
        }));
        setFabricas(listaFabricas); */
        let numeroFabrica="";
        let nombreAFabrica="";
        if(String(formData.noSap).startsWith("72")){
          numeroFabrica="77";
          nombreAFabrica="Agregar Fábrica";
        }else if(String(formData.noSap).startsWith("71")){
          numeroFabrica="N/A";
          nombreAFabrica="N/A";
        }else{
          numeroFabrica="";
          nombreAFabrica="";
        }

        if (pMap) {
          setFormData(prev => ({
            ...prev,
            nombreProveedor: pMap.proveedor || '',
            moneda: pMap.moneda || '',
            claveProveedor: pMap.c_pag || pMap.claves || '',
            puertoEmbarque: pMap.puerto || '',
            terminoPago: pMap.terminos_de_pago || '',
            noFabrica: numeroFabrica,
            nombreFabrica:nombreAFabrica
          }));
        }
      }).catch((error) => console.error("Error:", error));
      ClientesService.getFabricasByProveedor(formData.noSap).then((res) => {
      const listaFabricasBD = res.data || [];
      setFabricas(listaFabricasBD);
      }).catch((err) => console.error("Error al buscar fábricas del proveedor:", err));
    } else {
      setFormData(prev => ({
        ...prev,
        nombreProveedor: '',
        moneda: '',
        claveProveedor: '',
        terminoPago: '',
        noFabrica: '',
        nombreFabrica: ''
      }));
    }
  }, [formData.noSap])


  const handleFabricaChange = (e) => {
  const sapFabricaSeleccionado = e.target.value;
  if (sapFabricaSeleccionado === "") {
    setFormData(prev => ({ ...prev, nombreFabrica: 'Agregar Fábrica' }));
    return;
  }

  ClientesService.getNombreFabrica(formData.noSap, sapFabricaSeleccionado).then((res) => {
    setFormData(prev => ({
      ...prev,
      noFabrica: '77',  //sapFabicaSeleccionado
      nombreFabrica: res.data || 'Agregar Fábrica' 
    }));
  }).catch((err) => console.error("Error:", err));
};

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => { 
      const nuevoEstado={...prev, [id]: value };
      if (id === "centro" && value === "SRTI-DIRECTOS") {
      nuevoEstado.tipoContenedor = "D-Directos";
      nuevoEstado.almacen = "88";
      } else if (id === 'centro' && (value === "p5" || value === "stul")) {
      nuevoEstado.tipoContenedor = '';
      nuevoEstado.almacen = '';
    }
    return nuevoEstado;
  });
  };

  const handleCheckboxChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: prev[campo] === valor ? '' : valor }));
  };

  const handleSelloChange = (sello) => {
    setFormData((prev) => ({
      ...prev,
      sellos: {...prev.sellos, [sello]: !prev.sellos[sello]}
    }));
  };

  const sellos = [
    ['Sello 1', 'Sello 2', 'Sello 3', 'Sello 4', 'Sello 5', 'Sello 6'],
    ['Sello 7', 'Sello 8', 'Sello 9', 'Sello 10', 'Sello 23', 'Sello 100'],
    ['Sello 120', 'Sello 121', 'Sello 123', 'Sello 128', 'Sello 218', 'Sello 231'],['Sello 124']];

  const fila = { codigo: '', clave: '', cantidad: '',
    diasInventario: '', precioUnitarioFabrica: '', precioUnitarioMontoTotal: ''};

  //estado tablas dinamic- inicia con dos filas vacias 
  const [tablas, setTablas] = useState([{etd: '', filas: [{ ...fila }, { ...fila }]}]);

  const agregarTabla = () => {setTablas([...tablas, {etd: '', filas: [{ ...fila }, { ...fila }] }]);};
  const eliminarTabla = () => { if (tablas.length === 1) return; setTablas(tablas.slice(0, -1)); };

  const agregarFila = (tablaIndex) => {
    const nuevasTablas = [...tablas];
    nuevasTablas[tablaIndex].filas.push({ ...fila });
    setTablas(nuevasTablas);
  };
  const eliminarFila = (tablaIndex) => {
    const nuevasTablas = [...tablas];
    if (nuevasTablas[tablaIndex].filas.length === 1) return;
    nuevasTablas[tablaIndex].filas.pop();
    setTablas(nuevasTablas);
  };

  const handleFilaChange = (tablaIndex, filaIndex, campo, valor) => {
    const nuevasTablas = [...tablas];
    nuevasTablas[tablaIndex].filas[filaIndex][campo] = valor;
    setTablas(nuevasTablas);
  };

  const calcularTotalesTabla = (filas) => {
    var totalMontoFabrica = 0;
    var totalMonto = 0;
    filas.forEach(f => {
      const cant = parseFloat(f.cantidad) || 0;
      const pFab = parseFloat(f.precioUnitarioFabrica) || 0;
      const pMon = parseFloat(f.precioUnitarioMontoTotal) || 0;
      totalMontoFabrica += cant * pFab;
      totalMonto += cant * pMon;
    });
    return {totalMontoFabrica, totalMonto};
  };
  const handleEtd = (tablaIndex, valor) => {
    var today = new Date().toISOString().split('T')[0];
    document.getElementsByName("fechaHoy")[0].setAttribute('min', today);
    const nuevasTablas = [...tablas];
    nuevasTablas[tablaIndex].etd = valor;
    setTablas(nuevasTablas);
  };

  return (
    <div className="container my-4 p-4 border" style={{ maxWidth: '1100px' }}>
      <div className="text-center mb-4">
        <h4 className="fw-bold" style={{ color: '#F29111' }}>
          CONTROL Y AUTORIZACIÓN PARA CREACIÓN DE ÓRDENES DE COMPRA EN SAP (Trial Order)
        </h4>
      </div>

      <div className="row g-3 mb-4 align-items-center">
        <div className="col-md-4 d-flex align-items-center">
          <label htmlFor="bu" className="form-label fw-bold mb-0 me-2 text-nowrap">BU:</label>
          <select id="bu" className="form-select form-select-sm border-0 border-bottom rounded-0" value={formData.bu} onChange={handleChange}>
            <option value="">Seleccionar</option>
            <option>{formData.unidad_de_negocio}</option>
                    {BUs.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>))}
          </select>
        </div>
        <div className="col-md-5 d-flex align-items-center">
          <label htmlFor="responsable" className="form-label fw-bold mb-0 me-2 text-nowrap">Responsable:</label>
          <input type="text" id="responsable" className="form-control form-control-sm border-0 border-bottom rounded-0" value={formData.responsable} readOnly onChange={handleChange} />
        </div>

        <div className="col-md-3 d-flex align-items-center justify-content-end">
          <label htmlFor="fecha" className="form-label fw-bold mb-0 me-2 text-nowrap">Fecha:</label>
          <input type="text" id="fecha" className="form-control form-control-sm border-0 text-center w-50" value={formData.fecha} readOnly />
        </div>
      </div>

      <div className="mb-4">
        <div className="row g-0 border border-secondary text-center fw-bold bg-light" style={{ fontSize: '14px' }}>
          <div className="col-2 border-end border-secondary py-1 align-middle d-flex align-items-center justify-content-center">Proveedor:</div>
          <div className="col-1 border-end border-secondary">
            <input type="text" id="noSap" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.noSap} onChange={handleChange} />
          </div>
          <div className="col-3 border-end border-secondary">
            <input type="text" id="nombreProveedor" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.nombreProveedor} onChange={handleChange} />
          </div>
          <div className="col-1 border-end border-secondary" >
            <input type="text" id="claveProveedor" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.claveProveedor} onChange={handleChange} />
          </div>
          <div className="col-3 border-end border-secondary">
            <input type="text" id="terminoPago" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.terminoPago} onChange={handleChange} />
          </div>
          <div className="col-2">
            <input type="text" id="moneda" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.moneda} onChange={handleChange} />
          </div>
        </div>
        <div className="row g-0 border-start border-end border-bottom border-secondary text-center">
          <div className="col-2 border-end border-secondary bg-light"></div>
          <div className="col-1 border-end border-secondary py-1 align-middle d-flex align-items-center justify-content-center">No. SAP</div>
          <div className="col-3 border-end border-secondary py-1">Nombre</div>
          <div className="col-1 border-end border-secondary py-1">Clave</div>
          <div className="col-3 border-end border-secondary py-1">Término de pago</div>
          <div className="col-2 py-1">Moneda</div>

          
        </div>
      </div>

      <div className="mb-4">
        <div className="row g-0 border border-secondary text-center fw-bold bg-light" style={{ fontSize: '14px' }}>
          <div className="col-1 border-end border-secondary py-1 align-middle d-flex align-items-center justify-content-center">Fábrica:</div>
           <div className="col-2 border-end border-secondary d-flex align-items-center">
            {fabricas.length > 0 ? (
            <select className="form-select form-select-sm border-0 rounded-0 text-center px-1" style={{ fontSize: '12px', height: '100%' }} onChange={handleFabricaChange} defaultValue="">
              <option value="">--</option>
              {fabricas.map((sapFabrica, index) => (
              <option key={index} value={sapFabrica}>
                {sapFabrica}
              </option>
              ))}
            </select>
            ) : (
          <input type="text" id="noFabrica" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.noFabrica} onChange={handleChange} />
          )}
        </div>

          <div className="col-3 border-end border-secondary">
            <input type="text" id="nombreFabrica" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.nombreFabrica} onChange={handleChange} readOnly={fabricas.length > 0} />
          </div>
          <div className="col-1 border-end border-secondary border-1"> 
            <input type="text" id="spec" className="form-control form-control-sm border-0 rounded-0" value={formData.spec} onChange={handleChange} />
          </div>
          <div className="col-2 border-end border-secondary">
            <select id="razonSocial" className="form-select form-select-sm border-0 border-bottom rounded-0 text-center" value={formData.razonSocial} onChange={handleChange}>
            <option value="">Seleccionar</option>
            <option>{formData.razonSocial}</option>
                    {razonSocial.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>))}
          </select>
          </div>
          <div className="col-3">
            <select id="tipoOrden" className="form-select form-select-sm border-0 border-bottom text-center" value={formData.tipoOrden} onChange={handleChange}>
            <option value="">Seleccionar</option>
            <option>{formData.tipoOrden}</option>
                    {tipoOrden.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>))}
          </select>
          </div>
        </div>
        <div className="row g-0 border-start border-end border-bottom border-secondary text-center">
          <div className="col-1 border-end border-secondary bg-light"></div>
          <div className="col-2 border-end border-secondary py-1">No.</div>
          <div className="col-3 border-end border-secondary py-1">Nombre fábrica</div>
          <div className="col-1 border-end border-secondary py-1">Spec</div>
          <div className="col-2 border-end border-secondary py-1">Razón social</div>
          <div className="col-3 py-1">Tipo de orden</div>
        </div>
      </div>

      <div className="row g-0 border border-secondary mb-4" style={{ fontSize: '14px' }}>
        <div className="col-4 border-end border-secondary p-2">
          <span className="fw-bold d-block mb-2">Tipo de Contenedor:</span>
          <div className="d-flex justify-content-around">
            {formData.centro==="SRTI-DIRECTOS" ?(
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="checkDirectos" checked={true} readOnly />
                <label className="form-check-label" htmlFor="checkDirectos">D-Directos</label>
              </div>
            ): (
              <>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="checkFull" checked={formData.tipoContenedor === 'Full'} onChange={() => handleCheckboxChange('tipoContenedor', 'Full')} />
                  <label className="form-check-label" htmlFor="checkFull">Full</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="checkbox" id="checkConsolidado" checked={formData.tipoContenedor === 'Consolidado'} onChange={() => handleCheckboxChange('tipoContenedor', 'Consolidado')} />
                  <label className="form-check-label" htmlFor="checkConsolidado">Consolidado</label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="col-3 border-end border-secondary p-2">
          <div className="row g-0 align-items-center">
            <div className="col-5 fw-bold">Almacén:</div>
            <div className="col-7">
              {formData.centro==="SRTI-DIRECTOS"?(
                <div className="form-check d-flex justify-content-between align-items-center mb-1">
                  <label className="form-check-label" htmlFor="alm88">88</label>
                  <input className="form-check-input me-5" type="checkbox" id="alm88" checked={true} readOnly />
                </div>
              ):(
                <>
                  <div className="form-check d-flex justify-content-between align-items-center mb-1">
                    <label className="form-check-label mb-0" htmlFor="alm20">20</label>
                    <input className="form-check-input me-5" type="checkbox" id="alm20" checked={formData.almacen === '20'} onChange={() => handleCheckboxChange('almacen', '20')} />
                  </div>
                  <div className="form-check d-flex justify-content-between align-items-center mb-1">
                    <label className="form-check-label mb-0" htmlFor="alm45">45</label>
                    <input className="form-check-input me-5" type="checkbox" id="alm45" checked={formData.almacen === '45'} onChange={() => handleCheckboxChange('almacen', '45')} />
                  </div>
                  <div className="form-check d-flex justify-content-between align-items-center mb-0">
                    <label className="form-check-label mb-0" htmlFor="almManual">Manual</label>
                    <input className="form-check-input me-5" type="checkbox" id="almManual" checked={formData.almacen === 'Manual'} onChange={() => handleCheckboxChange('almacen', 'Manual')} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-5 text-center p-3">
          <div className="d-flex justify-content-center fw-bold ">Puerto de Embarque:
            <div className="col-7 align-items-center border-secondary">
            <input type="text" id="puertoEmbarque" className="form-control form-control-sm border-1 text-center" value={formData.puertoEmbarque} onChange={handleChange} />
          </div>
          </div>
          
          <div className=" d-flex justify-content-center fw-bold">Centro:
            <div className="col-7 border-secondary">
            <select id="centro" className="form-select form-select-sm border-0 border-bottom rounded-0 text-center" value={formData.centro} onChange={handleChange}>
            <option value="">Seleccionar</option>
            <option>{formData.centro}</option>
                    {centro.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>))}
          </select>
          </div>
          </div>
        </div>
      </div>

      <div className="border border-secondary p-3 position-relative" style={{ fontSize: '14px' }}>
        <span className="position-absolute fw-bold bg-white px-2" style={{ top: '-11px', left: '15px' }}>Sellos:</span>
        <div className="row mt-1">
          {sellos.map((columna, colIndex) => (
            <div key={colIndex} className="col-md-3">
              {columna.map((sello) => (
                <div key={sello} className="d-flex justify-content-between align-items-center mb-2 pe-5">
                  <span>{sello}</span>
                  <input 
                    className="form-check-input m-0" 
                    type="checkbox" 
                    checked={!!formData.sellos[sello]} 
                    onChange={() => handleSelloChange(sello)} 
                  />
                </div>
              ))}

              {colIndex === 3 && (
                <div className="mt-5 pt-4 border-top border-secondary border-dashed">
                  <span className="fw-bold d-block text-center mb-2">¿Requiere NOM?</span>
                  <div className="d-flex justify-content-around">
                    <div className="form-check" form-switch>
                      <input className="form-check-input" type="checkbox" role="switch" id="nomSi" checked={formData.requiereNom === 'Si'} onChange={() => handleCheckboxChange('requiereNom', 'Si')} />
                      <label className="form-check-label" htmlFor="nomSi">Sí</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="nomNo" checked={formData.requiereNom === 'No'} onChange={() => handleCheckboxChange('requiereNom', 'No')} />
                      <label className="form-check-label" htmlFor="nomNo">No</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 mb-3 mt-5">
        <button className="btn btn-light btn-sm border fw-bold">Precio Manual</button>
        <button className="btn btn-white btn-sm border fw-bold">Ver Tabla</button>
        <button className="btn btn-danger btn-sm fw-bold px-3" onClick={eliminarTabla}>- Tabla</button>
        <button className="btn btn-success btn-sm fw-bold px-3" onClick={agregarTabla}>+ Tabla</button>
      </div>

      
      {tablas.map((tabla, tIdx) => {
        const {totalMontoFabrica, totalMonto} = calcularTotalesTabla(tabla.filas);

        return (
          <div key={tabla.id} className="mb-4 p-3 border border-secondary rounded bg-white">
            
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-1">
                <button className="btn btn-danger btn-sm fw-bold px-2 py-0" onClick={() => eliminarFila(tIdx)}>-</button>
                <span className="px-3 border bg-light small fw-bold">{tabla.filas.length}</span>
                <button className="btn btn-success btn-sm fw-bold px-2 py-0" onClick={() => agregarFila(tIdx)}>+</button>
              </div>
              
              <div className="d-flex align-items-center border" style={{ fontSize: '14px' }}>
                <span className="px-3 py-1 fw-bold">ETD</span>
                <input type="date" name="fechaHoy" className="form-control form-control-sm border-1 rounded-0 text-center" value={tabla.etd} onChange={(e) => handleEtd(tIdx, e.target.value)} style={{ width: '120px' }} />
              </div>
            </div>


            <div className="table-responsive">
              <table className="table-bordered border-secondary table-sm align-middle mb-0 text-black text-center" style={{ fontSize: '14px' }}>
                <thead>
                  <tr className="bg-light fw-bold">
                    <th rowSpan="2" className="border-secondary">Código</th>
                    <th rowSpan="2" className="border-secondary">Clave</th>
                    <th rowSpan="2" className="border-secondary">Cantidad</th>
                    <th rowSpan="2" className="border-secondary">Días de inventario</th>
                    <th colSpan="2" className="border-bottom-0 border-secondary py-1 text-uppercase">Precio Fábrica / Proveedor</th>
                    <th colSpan="2" className="border-bottom-0 border-secondary py-1 text-uppercase">Monto Total</th>
                  </tr>
                  <tr className="bg-light">
                    <th className="border-secondary py-1">Precio Unitario</th>
                    <th className="border-secondary py-1">Monto Total</th>
                    <th className="border-secondary py-1">Precio Unitario</th>
                    <th className="border-secondary py-1">Monto Total</th>
                  </tr>
                </thead>
                
                <tbody>
                  {tabla.filas.map((fila, fIdx) => {
                    const cant = parseFloat(fila.cantidad) || 0;
                    const pFab = parseFloat(fila.precioUnitarioFabrica) || 0;
                    const pMon = parseFloat(fila.precioUnitarioMontoTotal) || 0;

                    return (
                      <tr key={fIdx}>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.codigo} onChange={(e) => handleFilaChange(tIdx, fIdx, 'codigo', e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.clave} onChange={(e) => handleFilaChange(tIdx, fIdx, 'clave', e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.cantidad} onChange={(e) => handleFilaChange(tIdx, fIdx, 'cantidad', e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.diasInventario} onChange={(e) => handleFilaChange(tIdx, fIdx, 'diasInventario', e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.precioUnitarioFabrica} onChange={(e) => handleFilaChange(tIdx, fIdx, 'precioUnitarioFabrica', e.target.value)}/>
                        {/*monto total */}
                        </td>
                        <td className="bg-light text-end"></td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.precioUnitarioMontoTotal} onChange={(e) => handleFilaChange(tIdx, fIdx, 'precioUnitarioMontoTotal', e.target.value)}/>
                        </td>
                        <td className="bg-light text-end pe-2 fw-bold"></td>
                      </tr>
                    );
                  })}

                  <tr className="fw-bold bg-white">
                    <td colSpan="5" className="text-end border-0 text-uppercase pe-3 pt-2">Monto de la Trial Order:</td>
                    <td className="border-secondary text-start ps-2 bg-light">$</td>
                    <td className="border-secondary text-end pe-2 bg-light">
                    </td>
                    <td className="border-secondary text-start ps-2 bg-light">$</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};



export default Formatos;
