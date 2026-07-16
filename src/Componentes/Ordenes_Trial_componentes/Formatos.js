import React, { useState, useEffect, useRef } from 'react';
import { BUs , razonSocial, tipoOrden,centro, colocador, cambios} from '../materialReutilizable/RangosReusables';
import ClientesService from '../../service/ClientesService';
import html2pdf from 'html2pdf.js';
import CircularProgress from "@mui/material/CircularProgress";

const Formatos = () => {
  const [loading, setLoading] = useState(false);
  const [listaCPag, setListaCPag] = useState([]);
  const [descripciones, setDescripciones] = useState({})
  const [folioBusqueda, setFolioBusqueda] = useState(''); 
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
  const fila = {codigo: '', clave: '', cantidad: '', diasInventario: '', precioUnitarioFabrica: '', precioUnitarioMontoTotal: '', montoTotalFabrica:'', montoTotal:''};
  const sellos = [['Sello 1', 'Sello 2', 'Sello 3', 'Sello 4'],['Sello 5', 'Sello 6','Sello 7', 'Sello 8'],['Sello 9', 'Sello 10', 'Sello 23', 'Sello 100'
  ],['Sello 120', 'Sello 121', 'Sello 123','Sello 128'],[ 'Sello 218', 'Sello 231','Sello 124']];

  const [formData, setFormData] = useState({
    folio:'',bu: '', responsable: '', fecha: new Date().toLocaleDateString('es-MX'),
    nombreProveedor:'', claveProveedor: '', terminoPago: '', moneda: '',
    noFabrica: '', nombreFabrica: '', spec: '', razonSocial: '',
    tipoOrden: '', tipoContenedor: '',
    almacen: '', puertoEmbarque: '', centro: '', sellos: {}, claveProveedorCruce: '', terminoPagoCruce: '', c_pag: '',              // Almacenará el c_pag elegido del anexo
    descripcionCondPago: ''
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
     if (!formData.noSap || formData.noSap === ""){
      setFormData(prev => ({
        ...prev,
        nombreProveedor: '',
        moneda: '',
        claveProveedor: '',
        terminoPago: '',
        noFabrica: '',
        nombreFabrica: '',
        claveProveedorCruce: '',
        terminoPagoCruce: '',
      }));
      return;
    }
    ClientesService.getproveedoresall().then((response) => {
      const listaProveedores = response.data || [];
      const pMap = listaProveedores.find(p => {
      const codigoProv = p.noProveedor || p.noproveedor || p.acreedor;
      return codigoProv && String(codigoProv).trim() === String(formData.noSap).trim();});

      let numeroFabrica=formData.noFabrica;
      let nombreAFabrica=formData.nombreFabrica;
      if (!numeroFabrica) {
        if (String(formData.noSap).startsWith("72")) {
          numeroFabrica = "77";
          nombreAFabrica = "Agregar Fábrica";
        } else if (String(formData.noSap).startsWith("71")) {
          numeroFabrica = "N/A";
          nombreAFabrica = "N/A";
        } else {
          numeroFabrica = "";
          nombreAFabrica = "";
        }
      }

      if (pMap) {
        const claveCruce = pMap.c_pag || pMap.claves || '';
        const terminoCruce = pMap.terminos_de_pago || '';
        setFormData(prev => {
          const esAnexo = prev.claveProveedor==="ANEXO";
          return{
            ...prev,
          nombreProveedor: pMap.proveedor || '',
          moneda: pMap.moneda || '',
          puertoEmbarque: pMap.puerto || '',
          terminoPago: terminoCruce,
          noFabrica: numeroFabrica,
          nombreFabrica:prev.nombreFabrica ||nombreAFabrica,
          claveProveedorCruce: claveCruce,
          terminoPagoCruce: terminoCruce,
          claveProveedor: esAnexo ? "ANEXO" : claveCruce,
          terminoPago: esAnexo ? "ANEXO" : terminoCruce
          }
        });
      }
    }).catch((error) => console.error("Error:", error));
    ClientesService.getFabricasByProveedor(formData.noSap).then((res) => {
    const listaFabricasBD = res.data || [];
    setFabricas(listaFabricasBD);
    }).catch((err) => console.error("Error:", err));
    
  }, [formData.noSap])


  const handleFabricaChange = (e) => {
    const sapFabricaSeleccionado = e.target.value;
    if (sapFabricaSeleccionado==="") {
      setFormData(prev => ({ ...prev, nombreFabrica: 'Agregar Fábrica' }));
      return;
    }
    ClientesService.getNombreFabrica(formData.noSap, sapFabricaSeleccionado).then((res) => {
      setFormData(prev => ({
        ...prev,
        noFabrica: sapFabricaSeleccionado,
        nombreFabrica: res.data || 'Agregar Fábrica'
      }));
    }).catch((err) => console.error("Error:", err));
  }

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
    } else if(id==='tipoOrden' && (value==="CI88 - Consumo Interno en el almacen 88")){
      nuevoEstado.almacen="88"
    }
    return nuevoEstado;
  });
  if(id==='bu'){
    const buSeleccionada = String(value).trim();
    if (buSeleccionada && buSeleccionada !== "") {
      ClientesService.getcontactosall().then((response) => {
        const listaContactos = response.data || [];
        //console.log(listaContactos)
        const cMap = listaContactos.find(c => {
          const nombreBU = c.unidaddeNegocio || c.unidad_de_negocio || "";
          return String(nombreBU).trim()===buSeleccionada;
        });

        if (cMap) {
          setFormData(prev => ({
            ...prev,
            responsable: cMap.gte_responsable_bu || cMap.gerenteBU || ''
          }));
        } else {
          setFormData(prev => ({ ...prev, responsable: '' }));
        }
      }).catch((error) => {
        console.error("Error:", error);
      });
    } else {
      setFormData(prev => ({ ...prev, responsable: '' }));
    }
  }
  }
  
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
  const [tablas, setTablas] = useState([{etd: '', cantFilas:1, c_pag: '', descripcionCondPago: '', filas: [{ ...fila }]}]);
  const agregarTabla = () => {setTablas([...tablas, {etd: '', cantFilas:1,c_pag: '', descripcionCondPago: '',filas: [{ ...fila }] }]);};
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
          nuevasTablas[tablaIndex].filas[filaIndex]['precioUnitarioMontoTotal'] = '';
          nuevasTablas[tablaIndex].filas[filaIndex]['montoTotal'] = '';
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
            const cant = parseFloat(nuevasTablas[tablaIndex].filas[filaIndex].cantidad) || 0;
            nuevasTablas[tablaIndex].filas[filaIndex]['precioUnitarioFabrica'] = precioVal;
            nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = (cant * parseFloat(precioVal)).toFixed(4);
          } else {
            nuevasTablas[tablaIndex].filas[filaIndex]['precioUnitarioFabrica'] = '';
            nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = '';
          }
        }
      }
    }
  }

  if(campo==='cantidad' || campo==='precioUnitarioFabrica' ){
    const filaActual = nuevasTablas[tablaIndex].filas[filaIndex];
    const cant = parseFloat(filaActual.cantidad) || 0;
    const precioFab = parseFloat(filaActual.precioUnitarioFabrica) || 0;
    //const precioMont=parseFloat(filaActual.precioUnitarioMontoTotal || 0);
    if (cant === 0 && precioFab === 0) {
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = '';
    } else {
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotalFabrica'] = (cant * precioFab).toFixed(4);
    }
    //if(cant === 0 || filaActual.precioUnitarioMontoTotal === '' || isNaN(precioMont)){
    /* if (cant > 0 && !isNaN(precioMont) && filaActual.precioUnitarioMontoTotal !== '') {
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotal'] = '';
    }else{
      nuevasTablas[tablaIndex].filas[filaIndex]['montoTotal'] = (cant * precioMont).toFixed(4);
    } */
  }
  setTablas(nuevasTablas);
};

  const calcularTotalesTabla = (filas) => {
    let totalMontoFabrica = 0;
    var totalMonto = 0;
    filas.forEach(f => {
      const totalFabrica=parseFloat(f.montoTotalFabrica) || 0;
      const totalMont=parseFloat(f.montoTotal)||0;
      totalMontoFabrica += totalFabrica;
      totalMonto+=totalMont;
    });
    return {totalMontoFabrica, totalMonto};
  };

  const handleEtd = (tablaIndex, valor) => {
    var today = new Date().toISOString().split('T')[0];
    document.getElementsByName('fechaHoy')[0].setAttribute('min', today);
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
    const oculta=!verTabla && formData.razonSocial==="Parcelmobi"; 
    const elementosOcultar = elemento.querySelectorAll('.no-pdf');
    elementosOcultar.forEach(o => {
      o.style.setProperty('display', 'none', 'important');
    });
    if(oculta && tablaParcel){
      tablaParcel.style.display="block"; //la tabla parcel se hace visible en el dom para ser capturada en el pdf 
    }
    const opciones = {
      margin:       [5, 5, 5, 5], //[superior, izquierdo, inferior, derecho]
      filename:     `Trial_Order_${formData.noSap || 'Reporte'}.pdf`,
      image:        {type: 'jpeg', quality: 0.99 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' },
      //autotable: {theme:'grid'},
      //salto de pag 
      pagebreak: {mode: ["avoid-all"]} //, before:[".tabla-parcel"]
      //pagebreak:    { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opciones).from(elemento).save().then(()=>{
      if(oculta && tablaParcel){
        tablaParcel.style.display='none';
      }
      elementosOcultar.forEach(o => {
      o.style.display = ''; 
    });
    });
  };

  const guardarDatos = () => {
    if (!formData.spec || formData.spec.trim() === '') {
      alert("Campo 'Spec' obligatorio");
      return; 
    }else if (!formData.requiereNom || formData.requiereNom === '') {
      alert("Seleccionar si 'Requiere NOM' antes de guardar");
      return; 
    }
    setLoading(true)

    const datos={
      id:formData.id,
      folio: formData.folio,
      bu: formData.bu,
      fecha: formData.fecha,
      noProvSap: formData.noSap,
      //nombreProv: formData.nombreProveedor,
      claveProv: formData.claveProveedor,
      //responsable: formData.responsable,
      //terminoPago: formData.terminoPago
      fabrica: formData.noFabrica,
      spec: formData.spec,
      razonSocial: formData.razonSocial,
      tipoOrden: formData.tipoOrden,      
      tipoContenedor: formData.tipoContenedor, 
      almacen: formData.almacen,         
      centro: formData.centro,         
      requiereNom: formData.requiereNom,
      sellos: JSON.stringify(formData.sellos || {}),
      contenidoTablas: JSON.stringify(tablas) 
    };
    //console.log("Datos :", datos);
    ClientesService.postRegistroTrial(datos).then((response) => {
      const registroCreado = response.data;
      alert(`Registro guardado \nFolio: ${registroCreado.folio}`);
      //setFormData(prev => ({ ...prev, id: registroCreado.id, folio: registroCreado.folio }));
      setFormData({
        folio:'',bu: '', responsable: '', fecha: new Date().toLocaleDateString('es-MX'),
        nombreProveedor:'', claveProveedor: '', terminoPago: '', moneda: '',
        noFabrica: '', nombreFabrica: '', spec: '', razonSocial: '',
        tipoOrden: '', tipoContenedor: '',
        almacen: '', puertoEmbarque: '', centro: '', sellos: {}, claveProveedorCruce: '', terminoPagoCruce: '', c_pag: '',              // Almacenará el c_pag elegido del anexo
        descripcionCondPago: ''
      });
      setTablas([{etd: '', cantFilas:1, c_pag: '', descripcionCondPago: '', filas: [{ ...fila }]}]);
        consultarRegistros(); 
        setLoading(false)
      }).catch((error) => {
        setLoading(false)
        console.error("Error: ", error);
      });
    };

    const consultarRegistros = () => {
      ClientesService.getTrialAll().then((response)=>{
        setRegistrosGuardados(response.data);
      }).catch((error) => {
        console.error("Error: ", error);
      });
    };

    useEffect(() => {
      consultarRegistros();
    }, []);


    const buscarPorFolio= () => {
      const folioABuscar = folioBusqueda;
      if (!folioABuscar.trim()) return;
      ClientesService.getTrialporFolio(folioABuscar).then((response) => {
        if (response.data) {
          //console.log(response.data)
          const registro = response.data;
          let sellosRecuperados = {};
          if(registro.sellos){
            try {
              sellosRecuperados = typeof registro.sellos === 'string' ? JSON.parse(registro.sellos) : registro.sellos;
            }catch(e){
              console.error("Error:", e);
              sellosRecuperados = {};
            }
          }
          if(registro.contenidoTablas){
            /* onst tablaCont= typeof registro.contenidoTablas==='string'? JSON.parse(registro.contenidoTablas): registro.contenidoTablas;
            setTablas(JSON.parse(registro.contenidoTablas)); */
            setTablas(typeof registro.contenidoTablas === 'string' ? JSON.parse(registro.contenidoTablas) : registro.contenidoTablas);
            //console.log(registro.contenidoTablas)
          }else{
            setTablas([{etd: '', cantFilas:1, c_pag:'', descripcionCondPago:'', filas: [{ codigo: '', clave: '', cantidad: '', diasInventario: '', precioUnitarioFabrica: '', precioUnitarioMontoTotal: '', montoTotalFabrica:'', montoTotal:''}]}]);
          }
          
          if (registro.claveProv==="ANEXO") {
            terminosPagoAnexo();
          }

          const pFabrica = (registro.noProvSap && registro.fabrica) ? ClientesService.getNombreFabrica(registro.noProvSap, registro.fabrica).then(res => res.data || "N/A"): Promise.resolve('Agregar Fábrica');
          if (registro.noProvSap && registro.fabrica) {
          const pResponsable = (registro.bu)? ClientesService.getcontactosall().then((res) => {
            const lista = res.data || [];
            const contacto = lista.find(c => String(c.unidaddeNegocio || c.unidad_de_negocio || "").trim() === String(registro.bu).trim());
            return contacto ? (contacto.gte_responsable_bu || contacto.gerenteBU || '') : '';
          }): Promise.resolve('');
          Promise.all([pFabrica, pResponsable]).then(([nombreFabricaR, responsableR]) => {
          actualizarForm(registro, sellosRecuperados, nombreFabricaR, responsableR);
        }).catch((err) => {
          console.error("Error:", err);
          actualizarForm(registro, sellosRecuperados, 'Agregar Fábrica', '');
        });
      }}
  }).catch((error) => {
    console.error("Error:", error);
    alert(`Folio "${folioABuscar}" no encontrado`);
  });
}

  const actualizarForm = (registro, sellosRecuperados, nombreFabB, responsableB) => {
    setFormData({
      id: registro.id,
      folio: registro.folio,
      bu: registro.bu,
      fecha: registro.fecha,
      noSap: registro.noProvSap,
      noFabrica: registro.fabrica,
      nombreFabrica: nombreFabB, 
      spec: registro.spec,
      razonSocial: registro.razonSocial,
      tipoOrden: registro.tipoOrden,
      tipoContenedor: registro.tipoContenedor,
      almacen: registro.almacen,
      puertoEmbarque: '',
      centro: registro.centro,
      requiereNom: registro.requiereNom,
      sellos: sellosRecuperados,
      nombreProveedor: '', 
      claveProveedor: registro.claveProv || '', 
      responsable: responsableB, 
      terminoPago: registro.terminoPago, 
      moneda: '', 
      c_pag: registro.c_pag || '',
      descripcionCondPago: registro.descripcionCondPago || ''
    });
    setFolioBusqueda("");
  };

    const handleClaveOTerminoChange = (campo, valor) => {
      setFormData(prev => {
        let nuevoEstado = {...prev, [campo]: valor}
        if (valor==='ANEXO') {
          nuevoEstado.claveProveedor = 'ANEXO';
          nuevoEstado.terminoPago = 'ANEXO';
          if (listaCPag.length === 0) {
          terminosPagoAnexo();
        }
        }
        return nuevoEstado;
      });
    }

    const terminosPagoAnexo = () => {
      ClientesService.getproveedoresall().then((response) => {
        const proveedores = response.data || [];
        const cPagUnicos = new Set();
        const listaTemporal = [];
        const mapaTemporal = {};

        proveedores.forEach((prov) => {
          if (prov.c_pag && prov.c_pag.trim()!== "") {
            const codigo = prov.c_pag.trim();
            const desc = prov.terminos_de_pago||"sin descr";

            if (!cPagUnicos.has(codigo)) {
              cPagUnicos.add(codigo);
              listaTemporal.push({ c_pag: codigo, descripcion: desc });
            }
            mapaTemporal[codigo] = desc;
          }
        });
        setListaCPag(listaTemporal);
        setDescripciones(mapaTemporal);
      }).catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCPagChange = (tablaIndex, cPagSeleccionado) => {
    //const cPagSeleccionado = e.target.value;
    const descripcionC = descripciones[cPagSeleccionado] || '';
    const nuevasTablas = tablas.map((tabla, tIdx) => {
      if (tIdx !== tablaIndex) return tabla;
      return {
        ...tabla,
        c_pag: cPagSeleccionado,
        descripcionCondPago: descripcionC
      }
    })
  setTablas(nuevasTablas);
  }

  const handlePegadoCodigos = (tIdx, fIdx, e) => {
    e.preventDefault()
    const textoP=e.clipboardData.getData('text');
    const lineas=textoP.split(/[\n, ]+/).map(l => l.trim()).filter(l => l !== ''); //dividir \n "," o espacio en blanco  y limpiar saltos blanco

    const nuevasTablas=[...tablas];
    const tablaActual=nuevasTablas[tIdx];
    const filasAntes=tablaActual.filas.slice(0, fIdx);
    const filasPost=tablaActual.filas.slice(fIdx + 1);

    const filasNuevasPegadas=lineas.map((codigoIngresado) => {
      const nuevaFila={codigo: codigoIngresado, clave: '', cantidad: '', diasInventario: '', precioUnitarioFabrica: '', precioUnitarioMontoTotal: '', montoTotalFabrica: '', montoTotal: '' };
      const numCodigo=Number(codigoIngresado);
      const proveedorActual=String(formData.noSap || '').trim();

      if (numCodigo){
        const coincidenciaCodigo=listaCodigos.find(c => Number(c.Codigo || c.codigo || 0) === numCodigo);
        
        if (coincidenciaCodigo) {
          nuevaFila.clave=coincidenciaCodigo.clave || coincidenciaCodigo.Clave || '';
        }
        if (!precioManual){
          const precioEncontrado=listaPrecios.find(p => {
            const materialt=String(p.material || '').trim();
            const proveedort=String(p.proveedor || p.noProveedor || '').trim();
            return Number(materialt) === numCodigo && Number(proveedort) === Number(proveedorActual);
          });

          if (precioEncontrado){
            const precioVal=precioEncontrado.precio || precioEncontrado.Precio || 0;
            nuevaFila.precioUnitarioFabrica=precioVal;
            nuevaFila.precioUnitarioMontoTotal="";
            //nuevaFila.precioUnitarioMontoTotal=precioVal;
          }
        }
      }
      return nuevaFila;
    });
    tablaActual.filas = [...filasAntes, ...filasNuevasPegadas, ...filasPost];
    setTablas(nuevasTablas);
  }


  const calcularConversionesTabla = (fobPrecioInput, monedaSeleccionada) => {
    const precioOriginal = parseFloat(fobPrecioInput.fob) || 0;
    const mon = (monedaSeleccionada || 'USD').toUpperCase();
    const tasaUSD = cambios.USD || 17.3213;

    if (mon === 'USD') {
      return {
        fobMoneda: precioOriginal.toFixed(4),
        montoMxn: (precioOriginal * tasaUSD).toFixed(4),
        fobUsd: precioOriginal.toFixed(4)
      };
    }

    const tasaDivisaAMxn = cambios[mon] || 1;
    
    const mxn = precioOriginal * tasaDivisaAMxn;
    
    const usd = tasaUSD > 0 ? mxn / tasaUSD : 0;

    return {
      fobMoneda: precioOriginal.toFixed(4),
      montoMxn: mxn.toFixed(4),
      fobUsd: usd.toFixed(4)
    };
  };

  


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
    <div>
        <div className="row justify-content-end me-1">
          <div className="col-md-3 d-flex gap-2 mb-2 mt-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-secondary-subtle fw-bold text-muted small">Folio:</span>
              <input type="text" id="folioBusqueda" className="form-control form-control-sm text-center border-secondary-subtle fw-bold text-uppercase" value={folioBusqueda} onChange={(e) => setFolioBusqueda(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-sm fw-bold px-4" onClick={buscarPorFolio}>Buscar</button>
          </div>
        </div>
      <div ref={pdf} className="container my-2 p-4 border bg-white" style={{ fontSize: '14px' }}>
        <div className="text-center mb-3">
          <h4 className="fw-bold" style={{ color: '#F29111' }}>
            CONTROL Y AUTORIZACIÓN PARA CREACIÓN DE ÓRDENES DE COMPRA EN SAP / TRIAL ORDER
          </h4>
        </div>

        <div className="row g-2 mb-3 align-items-center p-3">
          <div className="col-md-3 d-flex align-items-center">
            <label htmlFor="bu" className="form-label fw-bold mb-0 me-2 text-nowrap">BU:</label>
            <select id="bu" className="form-select form-select-sm border-0 border-bottom rounded-0 bg-transparent text-center" value={formData.bu} onChange={handleChange}>
              <option value="">Seleccionar</option>
              {formData.bu && !BUs.includes(formData.bu) && (
      <option value={formData.bu}>{formData.bu}</option>
    )}
              {BUs.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>))}
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <label htmlFor="responsable" className="form-label fw-bold mb-0 me-2 text-nowrap">Responsable:</label>
            <input type="text" id="responsable" className="form-control form-control-sm border-0 border-bottom rounded-0 bg-transparent text-center" value={formData.responsable} readOnly onChange={handleChange} />
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <label htmlFor="fecha" className="form-label fw-bold mb-0 me-2 text-nowrap ">Fecha:</label>
            <input type="text" id="fecha" className="form-control form-control-sm border-0 text-center w-50 bg-transparent" value={formData.fecha} readOnly />
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <label htmlFor='folio' className='form-label fw-bold mb-0 me-2 text-nowrap' >Folio:</label>
            <input type="text" id="folio" className="form-control form-control-sm text-center  border-0 border-bottom rounded-0 w-60 bg-transparent fw-bold text-danger" value={formData.folio} readOnly onChange={handleChange}/>
          </div>
        </div>

        <div className="rounded mb-3 p-3">
          <div className="row g-2 align-items-center">
            <div className="col-1 py-1 fw-bold">Proveedor</div>
            <div className="col-md-1">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>No. SAP</label>
              <input type="text" id="noSap" className="form-control form-control-sm text-center" value={formData.noSap || ''} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Nombre Proveedor</label>
              <input type="text" id="nombreProveedor" className="form-control form-control-sm text-center" value={formData.nombreProveedor} onChange={handleChange} />
            </div>
            <div className="col-md-1" >
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Clave</label>
              <select id="claveProveedor" className="form-select form-select-sm text-center" 
                value={formData.claveProveedor} onChange={(e) => handleClaveOTerminoChange('claveProveedor', e.target.value)}> 
                <option value=""></option>
                {formData.claveProveedorCruce && formData.claveProveedorCruce !== 'ANEXO' && (
                  <option value={formData.claveProveedorCruce}>{formData.claveProveedorCruce}</option>
                )}
                <option value="ANEXO">ANEXO</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Término de Pago</label>
              <select id="terminoPago" className="form-select form-select-sm text-center" 
                value={formData.terminoPago} onChange={(e) => handleClaveOTerminoChange('terminoPago', e.target.value)}>
                <option value=""></option>
                {formData.terminoPagoCruce && formData.terminoPagoCruce !== 'ANEXO' && (
                  <option value={formData.terminoPagoCruce}>{formData.terminoPagoCruce}</option>
                )}
                <option value="ANEXO">ANEXO</option>
              </select>

            </div>
            <div className="col-md-2">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Moneda</label>
              <input type="text" id="moneda" className="form-control form-control-sm text-center" value={formData.moneda} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="row g-1 align-items-center">
            <div className="col-1 py-3 fw-bold">Fábrica</div>
            <div className="col-md-1">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>No. Fábrica</label>
              {fabricas.length > 0 ? (
                <select className="form-select form-select-sm px-1" style={{ fontSize: '12px', height: '100%' }} value={formData.noFabrica} onChange={handleFabricaChange}>
                  <option value={""}>--</option>
                  <option>{formData.noFabrica}</option>
                  {fabricas.map((sapFabrica, index) => (
                    <option key={index} value={sapFabrica}>
                      {sapFabrica}
                    </option>
                  ))}
                </select>

              ) : (
                <input type="text" id="noFabrica" className="form-control form-control-sm text-center" value={formData.noFabrica} onChange={handleChange} readOnly={Boolean(formData.noSap && formData.noSap.startsWith("71"))} />
              )}
            </div>
            <div className="col-md-3">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Nombre de Fábrica</label>
              <input type="text" id="nombreFabrica" className="form-control form-control-sm text-center" value={formData.nombreFabrica} onChange={handleChange} readOnly={Boolean(formData.noSap && formData.noSap.startsWith("71"))} />
            </div>
            <div className="col-md-1"> 
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Spec</label>
              <input type="text" id="spec" className="form-control form-control-sm required text-center" value={formData.spec} onChange={handleChange} />
            </div>
            <div className="col-md-2">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Razón Social</label>
              <select id="razonSocial" className="form-select form-select-sm text-center" value={formData.razonSocial} onChange={handleChange}>
                <option value="">Seleccionar</option>
                <option>{formData.razonSocial}</option>
                {razonSocial.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="text-muted d-block m-0" style={{ fontSize: '13px' }}>Tipo de Orden</label>
              <select id="tipoOrden" className="form-select form-select-sm text-center" value={formData.tipoOrden} onChange={handleChange}>
                <option value="">Seleccionar</option>
                <option>{formData.tipoOrden}</option>
                {tipoOrden.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>))}
              </select>
            </div>
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-2 p-3">
            <div>
            <span className="fw-bold d-block mb-2 border-end">Tipo de Contenedor:</span>
            <div className="d-flex justify-content-start gap-3 pt-2 border-end">
              {formData.centro==="SRTI-DIRECTOS" ?(
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="checkDirectos" checked={true} readOnly />
                  <label className="form-check-label" htmlFor="checkDirectos">D-Directos</label>
                </div>
                
              ): (
                <>
                  <div className="form-check form-check-inline m-1">
                    <input className="form-check-input" type="checkbox" id="checkFull" checked={formData.tipoContenedor === 'Full'} onChange={() => handleCheckboxChange('tipoContenedor', 'Full')} />
                    <label className="form-check-label" htmlFor="checkFull">Full</label>
                  </div>
                  <div className="form-check form-check-inline m-1">
                    <input className="form-check-input" type="checkbox" id="checkConsolidado" checked={formData.tipoContenedor === 'Consolidado'} onChange={() => handleCheckboxChange('tipoContenedor', 'Consolidado')} />
                    <label className="form-check-label" htmlFor="checkConsolidado">Consolidado</label>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>

          <div className="col-md-2 p-3 text-center">
          <div>
            <span className="fw-bold d-block mb-1">Almacén:</span>
            <div className="d-flex justify-content-center gap-2 pt-1">
              {formData.centro === "SRTI-DIRECTOS" || formData.tipoOrden === "CI88 - Consumo Interno en el almacen 88" ? (
                <div className="form-check m-1">
                  <input className="form-check-input" type="checkbox" id="alm88" checked readOnly />
                  <label className="form-check-label fw-bold" htmlFor="alm88">88</label>
                </div>
              ) : (
                <>
                  <div className="form-check m-1">
                    <input className="form-check-input" type="checkbox" id="alm20" checked={formData.almacen === '20'} onChange={() => handleCheckboxChange('almacen', '20')} />
                    <label className="form-check-label" htmlFor="alm20">20</label>
                  </div>
                  <div className="form-check m-1">
                    <input className="form-check-input" type="checkbox" id="alm45" checked={formData.almacen === '45'} onChange={() => handleCheckboxChange('almacen', '45')} />
                    <label className="form-check-label" htmlFor="alm45">45</label>
                  </div>
                  <div className="form-check m-1">
                    <input className="form-check-input" type="checkbox" id="almManual" checked={formData.almacen === 'Manual'} onChange={() => handleCheckboxChange('almacen', 'Manual')} />
                    <label className="form-check-label" htmlFor="almManual">Manual</label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

          <div className="col-md-3 p-3 text-center">
            <span className="fw-bold d-block mb-1">Puerto de Embarque:</span>
            <div className="d-flex justify-content-center gap-2 pt-1">
              <div className="col-7">
                <input type="text" id="puertoEmbarque" className="form-control form-control-sm text-center" value={formData.puertoEmbarque} onChange={handleChange} />
              </div>
            </div>
            </div>
      
            <div className="col-md-3 p-3">
            <span className="fw-bold d-block mb-1 text-center">Centro:</span>
            <div className="d-flex justify-content-center gap-2 pt-1">
              <div className="col-6 border-secondary ms-2">
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
<div className="col-md-2 p-3">
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
        </div>

        <div className="border border-secondary p-3 rounded position-relative mb-3">
          <span className="position-absolute fw-bold bg-white px-2" style={{ top: '-11px', left: '15px' }}>Sellos:</span>
          <div className="row g-2 mt-0">
            {sellos.map((columna, colIndex) => (
              <div key={colIndex} className="col">
                {columna.map((sello) => (
                  <div key={sello} className="d-flex justify-content-start align-items-center mb-2 gap-2">
                    <span>{sello}</span>
                    <input className="form-check-input m-0" type="checkbox" 
                      checked={!!(formData.sellos && formData.sellos[sello])} 
                      onChange={() => handleSelloChange(sello)} 
                    />
                  </div>
                ))}
                
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
      
      <div className="d-flex justify-content-end gap-2 mb-3 mt-5 no-pdf">
        <button className="btn btn-light btn-sm border fw-bold" onClick={()=>setPrecioManual(!precioManual)}>{precioManual ? "Precio Automático":"Precio Manual" }</button>
        {formData.razonSocial && formData.razonSocial.trim()==="Parcelmobi" && (
          <button className="btn btn-white btn-sm border fw-bold" onClick={()=>setVerTabla(true)}>Ver Tabla</button>
        )}
        <button className="btn btn-danger btn-sm fw-bold px-3" onClick={eliminarTabla}>- Tabla</button>
        <button className="btn btn-success btn-sm fw-bold px-3" onClick={agregarTabla}>+ Tabla</button>
      </div>
        {tablas.map((tabla, tIdx) => {
          const {totalMontoFabrica, totalMonto} = calcularTotalesTabla(tabla.filas);
          return (
            <div key={tIdx} className="mb-4 p-3 border border-secondary rounded bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-1 no-pdf">
                  <button className="btn btn-danger btn-sm fw-bold px-2 py-0" onClick={() => eliminarFila(tIdx)}>-</button>
                  <input type="text" className="form-control form-control-sm text-center bg-white border-0 mx-1 fw-bold" style={{ width: '55px', height: '24px', fontSize: '13px' }} min="1" value={tabla.cantFilas} onChange={(e) => handleCantidadFilas(tIdx, e.target.value)}/>
                  <button className="btn btn-success btn-sm fw-bold px-2 py-0" onClick={() => agregarFila(tIdx)}>+</button>
                </div>
                
                {formData.claveProveedor === 'ANEXO' && formData.terminoPago === 'ANEXO' && (
              <div className="d-flex align-items-center gap-2">
                <label className="fw-bold small text-muted mb-0">Término de pago:</label>
                <select className="form-select form-select-sm" value={tabla.c_pag || ''} onChange={(e) => handleCPagChange(tIdx, e.target.value)} style={{ width: '110px'}}>
                  <option value=""></option>
                  {listaCPag.map((item, idx) => (
                    <option key={idx} value={item.c_pag}>
                      {item.c_pag}
                    </option>
                  ))}
                </select>

                {tabla.descripcionCondPago && (
                  <span className="badge bg-light text-dark border p-2 small fw-bold">
                    {tabla.descripcionCondPago}
                  </span>
                )}
              </div>
              )}
                <div className="d-flex align-items-center border" style={{ fontSize: '14px' }}>
                  <span className="px-3 py-1 fw-bold">ETD</span>
                  <input type="date" name="fechaHoy" className="form-control form-control-sm border-1 rounded-0 text-center" value={tabla.etd} onChange={(e) => handleEtd(tIdx, e.target.value)} style={{ width: '120px' }} />
                </div>
              </div>

                <table className="table-bordered border-secondary table-sm align-middle mb-0 text-black text-center" data-toggle="table" style={{ width: '100%' }}>
                  <thead className="bg-light fw-bold" style={{ fontSize: '12px' }}>
                    <tr className="align-middle">
                      <th className="border-secondary py-2 text-center">Código</th>
                      <th className="border-secondary py-2 text-center">Clave</th>
                      <th className="border-secondary py-2 text-center">Cantidad</th>
                      <th className="border-secondary py-2 text-center">Días de inventario</th>
                      <th className="border-bottom-0 border-secondary py-1">Precio Fábrica / Proveedor<br /> <span className='text-muted'>(Precio Unitario)</span></th>
                      <th className="border-bottom-0 border-secondary py-1 ">Precio Fábrica / Proveedor<br /> <span className='text-muted'>(Monto Total)</span></th>
                      <th className="border-bottom-0 border-secondary py-1">Monto Total<br /> <span className='text-muted'>(Precio Unitario)</span></th>
                      <th className="border-bottom-0 border-secondary py-1">Monto Total<br /> <span className='text-muted'>(Monto Total))</span></th>

                    </tr>
                  </thead>
                  
                  <tbody>
                    {tabla.filas.map((fila, fIdx) => (
                      <tr key={fIdx}>
                        <td className="col-pdf-codigo">
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.codigo} onChange={(e) => handleFilaChange(tIdx, fIdx, 'codigo', e.target.value)} onPaste={(e) => handlePegadoCodigos(tIdx, fIdx, e)} />
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
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.precioUnitarioMontoTotal || ''} 
    onChange={(e) => handleFilaChange(tIdx, fIdx, 'precioUnitarioMontoTotal', e.target.value)}/>
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0 text-center" value={fila.montoTotal || ''}  readOnly />
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
              <span className="text-muted d-block fw-bold small">SAP No.</span>
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
                {/* <th style={{ width: '14%' }}>Fob Price USD</th> */}
                {formData.moneda !== 'USD' ? (
                <>
                  <th className="py-2">FOB Price {formData.moneda}</th>
                  <th className="py-2">% ({formData.moneda} a MXN)</th>
                  <th className="py-2">FOB Price USD (MXN a USD)</th>
                </>
              ) : (
                <th className="py-2">FOB Price USD</th>
              )}

                <th style={{ width: '12%' }}>%</th>
                <th style={{ width: '14%' }}>Price</th>
                <th style={{ width: '15%' }}>Base 100</th>
                <th style={{ width: '15%' }}>% Variación</th>
              </tr>
            </thead>
            <tbody>
              {datosUnicos.length === 0 ? (
                <tr><td colSpan={formData.moneda !== 'USD' ? "9" : "7"}className="text-muted py-2 fw-bold">Sin códigos ingresados</td></tr>
              ) : (
                datosUnicos.map((item, index) => (
                  <tr key={index}>
                    <td className="fw-bold text-dark bg-light-subtle">{item.codigo}</td>
                    <td>{item.clave}</td>
                    {/* <td>${parseFloat(item.fob || 0).toFixed(2)}</td> */}
                    {formData.moneda !== 'USD' ? (
              <>
                <td>${item.fobMoneda}</td>
                <td className="bg-light fw-bold text-muted">${item.fobMxn}</td>
                <td className="bg-light fw-bold text-muted">${item.fobUsd}</td>
              </>
            ) : (
              <td>${item.fobUsd}</td>
            )}

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
                        {/* <th className="py-3 border-secondary" style={{ width: '14%' }}>Fob Price USD</th> */}
                        {formData.moneda !== 'USD' ? (
                  <>
                    <th className="py-3 border-secondary">FOB Price {formData.moneda}</th>
                    <th className="py-3 border-secondary">% ({formData.moneda} a MXN)</th>
                    <th className="py-3 border-secondary">FOB Price USD (MXN a USD)</th>
                  </>
                ) : (
                  <th className="py-3 border-secondary" style={{ width: '14%' }}>FOB Price USD</th>
                )}
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
                            {/* <td><span className="text-center px-2">${item.fob}</span></td> */}

                            {formData.moneda !== 'USD' ? (
                      <>
                        <td className="text-center fw-bold text-dark">${item.fobMoneda}</td>
                        <td className="text-center fw-bold bg-light-subtle">${item.fobMxn}</td>
                        <td className="text-center fw-bold bg-light-subtle text-primary">${item.fobUsd}</td>
                      </>
                    ) : (
                      <td><span className="text-center px-2">${item.fobUsd}</span></td>
                    )}


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