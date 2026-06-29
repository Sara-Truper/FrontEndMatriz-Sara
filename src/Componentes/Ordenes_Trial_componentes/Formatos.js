import React, { useState, useEffect, useRef } from 'react';
import { BUs , razonSocial, tipoOrden,centro, colocador ,ordenador } from '../materialReutilizable/RangosReusables';
import ClientesService from '../../service/ClientesService';
import html2pdf from 'html2pdf.js';

const Formatos = () => {
  const [registrosGuardados, setRegistrosGuardados]=useState([]);
  const pdf=useRef();
  const [fabricas, setFabricas] = useState([]);
  const [listaSellos, setListaSellos] = useState([]);
  const [listaCodigos, setListaCodigos]=useState([]);
  const [listaPrecios, setListaPrecios]=useState([]);
  const [arancel, setArancel]=useState([]);
  const [precioManual, setPrecioManual]=useState(true);
  const[verTabla, setVerTabla]=useState(false);
  const [toastState, setToastState] = useState({show: false, titulo: '', comentario: ''});
  const fila = { codigo: '', clave: '', cantidad: '', diasInventario: '', precioUnitarioFabrica: '', precioUnitarioMontoTotal: '', montoTotalFabrica:'', montoTotal:''};
  const sellos = [
    ['Sello 1', 'Sello 2', 'Sello 3', 'Sello 4', 'Sello 5', 'Sello 6'],
    ['Sello 7', 'Sello 8', 'Sello 9', 'Sello 10', 'Sello 23', 'Sello 100'],
    ['Sello 120', 'Sello 121', 'Sello 123', 'Sello 128', 'Sello 218', 'Sello 231'],['Sello 124']];

  const [formData, setFormData] = useState({
    bu: '', responsable: '', fecha: new Date().toLocaleDateString('es-MX'),
    nombreProveedor:'', claveProveedor: '', terminoPago: '', moneda: '',
    noFabrica: '', nombreFabrica: '', spec: '', razonSocial: '',
    tipoOrden: '', tipoContenedor: '',
    almacen: '', puertoEmbarque: '', centro: '', sellos: {} 
  });

  useEffect(() => {
    ClientesService.getSellosAll().then((response) => {
      setListaSellos(response.data || []);
    }).catch((error) => console.error("Error:", error));

    ClientesService.getCodigosAll().then((response)=>{
      setListaCodigos(response.data || []);
    }).catch((error)=> console.error("Error:",error));

    ClientesService.getPreciosAll().then((response)=>{
      setListaPrecios(response.data || []);
    }).catch((error)=> console.error("Error:",error));

    ClientesService.getArancel().then((response)=>{
      setArancel(response.data || []);
    }).catch((error)=> console.error("Error:",error));

  }, []);

  useEffect(() => {
    if (formData.bu && formData.bu !== "") {
      ClientesService.getcontactosall().then((response) => {
        const listaContactos = response.data || [];
        //console.log(listaContactos)
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
        const pMap = listaProveedores.find(p => {
        const codigoProv = p.noProveedor || p.noproveedor || p.acreedor;
        return codigoProv && String(codigoProv).trim() === String(formData.noSap).trim();});

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
      }).catch((err) => console.error("Error:", err));
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

  const handleSelloChange = (selloNombre) => {
    const check = !formData.sellos[selloNombre];
    setFormData((prev) => ({
      ...prev,
      sellos: {
      ...(prev.sellos || {}),
      [selloNombre]: check 
    }}));
    if (check) {
      const numeroSello= String(selloNombre).replace(/\D/g, '');
      const selloEncontrado = listaSellos.find(s => {
        const codigo_sap = String(s.codigo_sap ||s.id|| '').trim();
        return codigo_sap === numeroSello;
      });
      if (selloEncontrado) {
        //console.log(selloEncontrado)
      setToastState({show: true,
        titulo: `Sello ${selloEncontrado.codigo_sap}:`,
        comentario: selloEncontrado.texto_sello 
    });
    setTimeout(() => {
      setToastState(prev => ({ ...prev, show: false }));
    }, 8000);
    }
  }
};

 //estado tablas dinamic- inicia con dos filas vacia
  const [tablas, setTablas] = useState([{etd: '', cantFilas:1, filas: [{ ...fila }]}]);
  const agregarTabla = () => {setTablas([...tablas, {etd: '', cantFilas:1,filas: [{ ...fila }] }]);};
  const eliminarTabla = () => { if (tablas.length === 1) return; setTablas(tablas.slice(0, -1)); };

  const agregarFila = (tablaIndex) => {
    const nuevasTablas = [...tablas];
    const cantidad=parseInt(nuevasTablas[tablaIndex].cantFilas,10) || 0;
    for(let i=0; i<cantidad; i++){
      nuevasTablas[tablaIndex].filas.push({ ...fila });
    }
    setTablas(nuevasTablas);
  };

  const eliminarFila=(tablaIndex) => {
    const nuevasTablas=[...tablas];
    const cantidad=parseInt(nuevasTablas[tablaIndex].cantFilas,10) || 0;
    const filasActuales=nuevasTablas[tablaIndex].filas.length;
    if (filasActuales <= 1) return;
    if (nuevasTablas[tablaIndex].filas.length === 1) return;
    const nuevasFilas=filasActuales-cantidad;
    nuevasTablas[tablaIndex].filas = nuevasTablas[tablaIndex].filas.slice(0, nuevasFilas < 1 ? 1 : nuevasFilas);
    setTablas(nuevasTablas);
  };

  const handleCantidadFilas = (tablaIndex, valor) => {
    const nuevasTablas =[...tablas];
    nuevasTablas[tablaIndex].cantFilas =valor;
    setTablas(nuevasTablas);
  };

  const handleFilaChange = (tablaIndex, filaIndex, campo, valor) => {
  const nuevasTablas = tablas.map((tabla, tIdx) => { if (tIdx !== tablaIndex) return tabla;
    return {
      ...tabla,
      filas: tabla.filas.map((fila, fIdx) => {
        if (fIdx !== filaIndex) return fila;
        return { ...fila, [campo]: valor };
      })
    };
  });

  if (campo === 'codigo') {
    if (valor.trim() === '') {
      nuevasTablas[tablaIndex].filas[filaIndex]['clave'] = '';
    } else {
      const codigoIngresado = Number(valor);
      if (!isNaN(codigoIngresado)) {
        const codigoTabla = listaCodigos.find(c => Number(c.Codigo || c.codigo || 0) === codigoIngresado);
        if (codigoTabla) {
          nuevasTablas[tablaIndex].filas[filaIndex]['clave'] = codigoTabla.clave || codigoTabla.Clave || '';
        } else {
          nuevasTablas[tablaIndex].filas[filaIndex]['clave'] = '';
          
        }
        if (!precioManual) {
          const proveedorActual = String(formData.noSap || '').trim();
          
          const precioEncontrado = listaPrecios.find(p => {
            const materialt = String(p.material || '').trim();
            const proveedort = String(p.proveedor || p.noProveedor || '').trim();
            const codigoFila = String(valor || '').trim();
            return Number(materialt) === Number(codigoFila) && Number(proveedort) === Number(proveedorActual);
          });

          //console.log(precioEncontrado);

          if (precioEncontrado) {
            const precioVal = precioEncontrado.precio || precioEncontrado.Precio || 0;
            nuevasTablas[tablaIndex].filas[filaIndex]['precioUnitarioFabrica'] = precioVal;
            nuevasTablas[tablaIndex].filas[filaIndex]['precioUnitarioMontoTotal'] = precioVal;
            const cant = parseFloat(nuevasTablas[tablaIndex].filas[filaIndex].cantidad) || 0;
            nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = (cant * parseFloat(precioVal)).toFixed(4);
            nuevasTablas[tablaIndex].filas[filaIndex]['montoTotal'] = (cant * parseFloat(precioVal)).toFixed(4);
          } else {
            nuevasTablas[tablaIndex].filas[filaIndex]['precioUnitarioFabrica'] = '';
            nuevasTablas[tablaIndex].filas[filaIndex]['precioUnitarioMontoTotal'] = '';
            nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = '';
            nuevasTablas[tablaIndex].filas[filaIndex]['montoTotal'] = '';
          }
        }
      }
    }
  }

  if(campo==='cantidad' || campo==='precioUnitarioFabrica' || campo==='precioUnitarioMontoTotal'){
    const filaActual = nuevasTablas[tablaIndex].filas[filaIndex];
    const cant = parseFloat(filaActual.cantidad) || 0;
    const precioFab = parseFloat(filaActual.precioUnitarioFabrica) || 0;
    const precioMont=parseFloat(filaActual.precioUnitarioMontoTotal || 0);
    if (cant === 0 && precioFab === 0) {
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = '';
    } else {
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = (cant * precioFab).toFixed(4);
    }
    if(cant===0 && precioMont===0){
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotal'] = '';
    }else{
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotal'] = (cant * precioMont).toFixed(4);
    }
  }
  setTablas(nuevasTablas);
};

  const calcularTotalesTabla = (filas) => {
    let totalMontoFabrica = 0;
    var totalMonto = 0;
    filas.forEach(f => {
      const totalFabrica = parseFloat(f.montoTotalFabrica) || 0;
      const totalMont=parseFloat(f.montoTotal)||0;
      totalMontoFabrica += totalFabrica;
      totalMonto+=totalMont;
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

  const datosTabla=()=>{
    const lsitaCodigosObtenidos = {};
    const proveedorActual = String(formData.noSap || '').trim();
    tablas.forEach(tabla=>{
      tabla.filas.forEach(f=>{
        const cod = String(f.codigo || '').trim();
        if (cod === '') return;

        if(!lsitaCodigosObtenidos[cod]){
          const arancelEncontrado = arancel.find(a => {
            const codigoArancel = String(a.material || '').trim();
            const sapArancel = String(a.proveedor || '').trim();
            return Number(codigoArancel) === Number(cod) && Number(sapArancel) === Number(proveedorActual);
          });
          const porcentajeArancel = arancelEncontrado ? (parseFloat(arancelEncontrado.porcentaje) || 0) : "";

          lsitaCodigosObtenidos[cod]={
            codigo: cod,
            clave: f.clave,
            fob: f.precioUnitarioFabrica,
            price: ((f.precioUnitarioFabrica)*(porcentajeArancel+1)),
            base100: (((f.precioUnitarioFabrica)*(porcentajeArancel+1))*100),
            porcentaje: (porcentajeArancel*100),
            variacion: (porcentajeArancel*100)
          }
        }
      })
    })
    return Object.values(lsitaCodigosObtenidos)
  }
  const datosUnicos=datosTabla();

  //pdf 
  const descargarPDF = () => {
    const elemento = pdf.current;
    const tablaParcel = elemento.querySelector('.tabla-parcel');
    const oculta=!verTabla;
    if(oculta && tablaParcel){
      tablaParcel.style.display="block"; //la tabla parcel se hace visible en el dom para ser capturada en el pdf 
    }
    const opciones = {
      margin:       [12, 12, 12, 12], 
      filename:     `Trial_Order_${formData.noSap || 'Reporte'}.pdf`,
      image:        {type: 'jpeg', quality: 0.99 },
      html2canvas:  { scale: 2.5, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' },
      //salto de pag 
      pagebreak: {mode: ["avoid-all"], before:[".tabla-parcel"]}
    };
    html2pdf().set(opciones).from(elemento).save().then(()=>{
      if(oculta && tablaParcel){
        tablaParcel.style.display='none';
      }
    });
  };

  //guardar
  const guardarDatos = () => {
    const datos={
      folio: formData.folio,
      bu: formData.bu,
      fecha: formData.fecha,
      noProvSap: formData.noSap,
      nombreProv: formData.nombreProveedor,
      claveProv: formData.claveProveedor
    };
    //console.log("Datos :", datos);
    ClientesService.postRegistroTrial(datos).then((response) => {
        alert(`Registro ${formData.noSap} guardado`)
        consultarRegistros(); 
      }).catch((error) => {
        console.error("Error: ", error);
      });
    };

    const consultarRegistros = () => {
      ClientesService.getTrialAll().then((response)=>{
        setRegistrosGuardados(response.data);
      })
      .catch((error) => {
        console.error("Error al listar: ", error);
      });
    };

    useEffect(() => {
      consultarRegistros();
    }, []);

   return (
    <div>
        <div className="row justify-content-end">
          <div className="col-md-3 d-flex gap-3 mb-2 mt-3 my-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-secondary-subtle fw-bold text-muted small">Folio:</span>
              <input type="text" 
                className="form-control form-control-sm text-center border-secondary-subtle fw-bold text-uppercase"  
                />
            </div>
            <button className="btn btn-primary btn-sm fw-bold px-4">Buscar</button>
          </div>
        </div>
      <div ref={pdf} className="container my-3 p-4 border bg-white">
        <div className="text-center mb-4">
          <h4 className="fw-bold" style={{ color: '#F29111' }}>
            CONTROL Y AUTORIZACIÓN PARA CREACIÓN DE ÓRDENES DE COMPRA EN SAP / TRIAL ORDER
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
              <input type="text" id="noSap" className="form-control form-control-sm border-0 rounded-0 text-center" value={formData.noSap || ''} onChange={handleChange} />
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
            <div className="d-flex justify-content-center fw-bold mb-2">Puerto de Embarque:
              <div className="col-7 align-items-center border-secondary ms-2">
                <input type="text" id="puertoEmbarque" className="form-control form-control-sm border-1 text-center" value={formData.puertoEmbarque} onChange={handleChange} />
              </div>
            </div>
            
            <div className="d-flex justify-content-center fw-bold">Centro:
              <div className="col-7 border-secondary ms-2">
                <select id="centro" className="form-select form-select-sm border-0 border-bottom rounded-0 text-center" value={formData.centro} onChange={handleChange}>
                  <option value="">Seleccionar</option>
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
                      checked={!!(formData.sellos && formData.sellos[sello])} 
                      onChange={() => handleSelloChange(sello)} 
                    />
                  </div>
                ))}
                {colIndex === 3 && (
                  <div className="mt-5 pt-4 border-top border-secondary border-dashed">
                    <span className="fw-bold d-block text-center mb-2">¿Requiere NOM?</span>
                    <div className="d-flex justify-content-around">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="nomSi" checked={formData.requiereNom === 'Si'} onChange={() => handleCheckboxChange('requiereNom', 'Si')} />
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
        
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
        <div className={`toast ${toastState.show ? 'show' : 'hide'} shadow`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header bg-primary text-white d-flex justify-content-between align-items-center">
            <strong className="me-auto"><i className="bi bi-info-circle me-2"></i>{toastState.titulo}</strong>
            <button type="button" className="btn-close btn-close-white" onClick={() => setToastState(prev => ({ ...prev, show: false }))} aria-label="Close"></button>
          </div>
          <div className="toast-body bg-white text-dark fw-medium p-3" style={{ fontSize: '13px', textAlign: 'justify' }}>
            {toastState.comentario}
          </div>
        </div>
      </div>


        <div className="d-flex justify-content-end gap-2 mb-3 mt-5">
          <button className="btn btn-light btn-sm border fw-bold" onClick={()=>setPrecioManual(!precioManual)}>{precioManual ? "Precio Manual" : "Precio Automático"}</button>
          <button className="btn btn-white btn-sm border fw-bold" onClick={()=>setVerTabla(true)}>Ver Tabla</button>
          <button className="btn btn-danger btn-sm fw-bold px-3" onClick={eliminarTabla}>- Tabla</button>
          <button className="btn btn-success btn-sm fw-bold px-3" onClick={agregarTabla}>+ Tabla</button>
        </div>

        {tablas.map((tabla, tIdx) => {
          const {totalMontoFabrica, totalMonto} = calcularTotalesTabla(tabla.filas);
          return (
            <div key={tIdx} className="mb-4 p-3 border border-secondary rounded bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-1">
                  <button className="btn btn-danger btn-sm fw-bold px-2 py-0" onClick={() => eliminarFila(tIdx)}>-</button>
                  <input type="text" className="form-control form-control-sm text-center bg-white border-0 mx-1 fw-bold" style={{ width: '55px', height: '24px', fontSize: '13px' }} min="1" value={tabla.cantFilas} onChange={(e) => handleCantidadFilas(tIdx, e.target.value)}/>
                  <button className="btn btn-success btn-sm fw-bold px-2 py-0" onClick={() => agregarFila(tIdx)}>+</button>
                </div>
                
                <div className="d-flex align-items-center border" style={{ fontSize: '14px' }}>
                  <span className="px-3 py-1 fw-bold">ETD</span>
                  <input type="date" name="fechaHoy" className="form-control form-control-sm border-1 rounded-0 text-center" value={tabla.etd} onChange={(e) => handleEtd(tIdx, e.target.value)} style={{ width: '120px' }} />
                </div>
              </div>

                <table className="table-bordered border-secondary table-sm align-middle mb-0 text-black text-center" style={{ width: '100%' }}>
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
                    {tabla.filas.map((fila, fIdx) => (
                      <tr key={fIdx}>
                        <td className="col-pdf-codigo">
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.codigo} onChange={(e) => handleFilaChange(tIdx, fIdx, 'codigo', e.target.value)} />
                        </td>
                        <td className="col-pdf-clave">
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.clave} onChange={(e) => handleFilaChange(tIdx, fIdx, 'clave', e.target.value)} />
                        </td>
                        <td className="col-pdf-cantidad">
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.cantidad} onChange={(e) => handleFilaChange(tIdx, fIdx, 'cantidad', e.target.value)} />
                        </td>
                        <td className="col-pdf-dias">
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.diasInventario} onChange={(e) => handleFilaChange(tIdx, fIdx, 'diasInventario', e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className={`form-control form-control-sm border-0 text-center ${!precioManual && fila.precioUnitarioFabrica ? 'bg-light text-muted' : ''}`} value={fila.precioUnitarioFabrica} onChange={(e) => handleFilaChange(tIdx, fIdx, 'precioUnitarioFabrica', e.target.value)}/>
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.montoTotalFabrica} readOnly />
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.precioUnitarioMontoTotal} onChange={(e) => handleFilaChange(tIdx, fIdx, 'precioUnitarioMontoTotal', e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.montoTotal} readOnly />
                        </td>
                      </tr>
                    ))}
                    <tr className="fw-bold bg-white">
                      <td colSpan="5" className="text-end border-0 text-uppercase pe-3 pt-2">Monto de la Trial Order:</td>
                      <td className="border-secondary text-center ps-2 bg-light">${totalMontoFabrica.toFixed(4)}</td>
                      <td className="border-secondary text-end pe-2 bg-light"></td>
                      <td className="border-secondary text-center ps-2 bg-light">${totalMonto.toFixed(4)}</td>
                    </tr>
                  </tbody>
                </table>
            </div>
          );
        })}

        <div className="tabla-parcel mt-4 p-3 bg-white" style={{ display: 'none' }}>
          <div className="row g-3 mb-4 p-3 bg-light rounded border border-light-subtle">
            <div className="col-4 text-center border-end border-light-subtle">
              <span className="text-muted d-block fw-bold small">No. SAP</span>
              <h4 className="fw-bold m-0 text-dark">{formData.noSap || "------"}</h4>
            </div>
            <div className="col-8 ps-4">
              <span className="text-muted d-block fw-bold small">Supplier</span>
              <h4 className="fw-bold m-0" style={{ color: '#F29111' }}>{formData.nombreProveedor || "-----------"}</h4>
            </div>
          </div>

          <table className="table table-bordered table-sm text-center align-middle mb-0 bg-white">
            <thead>
              <tr className="bg-dark text-white fw-bold">
                <th style={{ width: '15%' }}>Código</th>
                <th style={{ width: '15%' }}>Clave</th>
                <th style={{ width: '14%' }}>Fob Price USD</th>
                <th style={{ width: '12%' }}>%</th>
                <th style={{ width: '14%' }}>Price</th>
                <th style={{ width: '15%' }}>Base 100</th>
                <th style={{ width: '15%' }}>% Variación</th>
              </tr>
            </thead>
            <tbody>
              {datosUnicos.length === 0 ? (
                <tr><td colSpan="7" className="text-muted py-2 fw-bold">Sin códigos ingresados</td></tr>
              ) : (
                datosUnicos.map((item, index) => (
                  <tr key={index}>
                    <td className="fw-bold text-dark bg-light-subtle">{item.codigo}</td>
                    <td>{item.clave}</td>
                    <td>${parseFloat(item.fob || 0).toFixed(2)}</td>
                    <td>{parseFloat(item.porcentaje || 0).toFixed(2)}%</td>
                    <td>${parseFloat(item.price || 0).toFixed(4)}</td>
                    <td>{parseFloat(item.base100 || 0).toFixed(2)}</td>
                    <td>{parseFloat(item.variacion || 0).toFixed(2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {verTabla && (
        <div className="modal d-block d-flex align-items-center justify-content-center" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1100 }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded">
              <div className="modal-body p-4 bg-light">
                <div className="row g-3 mb-4 p-3 shadow-sm">
                  <div className="col-md-4 text-center border-end border-light-subtle">
                    <span className="text-muted d-block fw-bold small tracking-wider">No. SAP</span>
                    <h2 className="fw-bold m-0 text-dark">{formData.noSap || "------"}</h2>
                  </div>
                  <div className="col-md-8 ps-md-4 d-flex flex-column justify-content-center">
                    <span className="text-muted d-block fw-bold small tracking-wider">Supplier</span>
                    <h2 className="fw-bold m-0" style={{ color: '#F29111', fontSize: '2rem', lineHeight: '1.2' }}>
                      {formData.nombreProveedor || "-----------"}
                    </h2>
                  </div>
                </div>

                  <table className="table table-hover align-middle mb-0 text-center table-sm">
                    <thead>
                      <tr>
                        <th className="py-3 border-secondary" style={{ width: '15%' }}>Código</th>
                        <th className="py-3 border-secondary" style={{ width: '15%' }}>Clave</th>
                        <th className="py-3 border-secondary" style={{ width: '14%' }}>Fob Price USD</th>
                        <th className="py-3 border-secondary" style={{ width: '12%' }}>%</th>
                        <th className="py-3 border-secondary" style={{ width: '14%' }}>Price</th>
                        <th className="py-3 border-secondary" style={{ width: '15%' }}>Base 100</th>
                        <th className="py-3 border-secondary" style={{ width: '15%' }}>% Variación</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '13.5px' }}>
                      {datosUnicos.length === 0 ? (
                        <tr><td colSpan="7" className="text-muted py-4 fw-bold">Sin códigos ingresados</td></tr>
                      ) : (
                        datosUnicos.map((item, index) => (
                          <tr key={index} className="fw-medium text-muted">
                            <td className="text-center fw-bold text-dark bg-light-subtle">{item.codigo}</td>
                            <td><span className="text-center px-2 py-1">{item.clave}</span></td>
                            <td><span className="text-center px-2">${item.fob}</span></td>
                            <td className="text-center fw-bold">{item.porcentaje}%</td>
                            <td className="text-center fw-bold">${item.price}</td>
                            <td className="text-center fw-bold">{item.base100.toFixed(2)}</td>
                            <td><span className="text-center">{item.variacion}%</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
              </div>
              <div className="modal-footer bg-light px-4 py-2 border-top">
                <button type="button" className="btn btn-secondary btn-sm fw-bold shadow-sm px-4" onClick={() => setVerTabla(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='d-flex justify-content-center gap-3 mb-3 mt-3 my-3'>
        <button className="btn btn-dark btn-sm fw-bold px-3" onClick={descargarPDF}>Descargar PDF</button>
        <button className="btn btn-success btn-sm fw-bold px-3" onClick={guardarDatos}>Guardar</button>
      </div>
    </div>
  )};

export default Formatos;