import { Stack, Switch } from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import { BUs, Orden_Etd_Cur, Revisados_Masivo, Revisados_Unica, tipos_modif ,other_items, responsableProvsAlternos } from '../materialReutilizable/RangosReusables'
import '../../Componentes/button.css'
import ClientesService from '../../service/ClientesService'
import html2pdf from 'html2pdf.js';
import { fontStyle, fontWeight } from '@mui/system'

function FormatoRevisados() {
    const [leerfolio,setleerfolio]= useState([])
    const [foliorevisado,setfoliorevisado] = useState('');
    const [othersValidos,setothersValidos]= useState(false);
    const [aplicaSN,setaplicaSN] = useState('No');
    const [juntopo,setjuntopo] = useState('Si');
    const [Arancel,setArancel]= useState([]);
    const [posMasivo,setposMasivo]= useState([]);
    const [verprecios,setverprecios] = useState(true)
    const [itemsPO, setitemsPO] = useState(false);
    const [preciosPO, setpreciosPO] = useState(false);
    const [tablavisible, settablavisible] = useState('')
    const [clickcambio,setclickcambio]= useState(true);
    const [clickEA,setclickEA]= useState(true);
    const [clicksidocs, setclicksidocs] = useState(true);
    const [NoSolped,setNoSolped] = useState(true)    
    const [otro,setotro] = useState(true)    
    const [molde,setmolde] = useState(true)    
    const [filasTab, setfilasTab] = useState(1);
    const [filasinput, setfilasinput] = useState(1);
    const [proveedores, setproveedores ] = useState([]);
    const [contactos, setcontactos ] = useState([]);
    const [precios, setprecios ] = useState([]);
    const [registro, setregistro] = useState([]);
    const [registrotabla, setregistrotabla] = useState([]);
    const [aditem,setaditem] = useState(false);
    const [datosTpPm, setdatosTpPm] = useState([]);
    const [titulosColor,settitulosColor] = useState({Precio:false , Cantidad:false , monto:false , solped:false , um:false , descripcion:false , etd:false  ,termPago:false })
    const [filasMolde, setFilasMolde]=useState([{molde:'', piezas:'', item:'', nota:''}]);
    const pdf=useRef();
    const [registrosGuardados, setRegistrosGuardados]=useState([]);
    const fechaFormateada = new Date().toISOString().split('T')[0];

    useEffect(()=>{
        ClientesService.getproveedoresall().then((response)=>{
            setproveedores(response.data)
        }).catch((err)=>console.log(err));

        ClientesService.getcontactosall().then((response)=>{
            setcontactos(response.data)
        }).catch((err)=>console.log(err));

        ClientesService.getPreciosAll().then((response)=>{
            setprecios(response.data)
        }).catch((err)=>console.log(err));

        ClientesService.getArancel().then((response)=>{
          setArancel(response.data || []);
        }).catch((error)=> console.error("Error:",error));
    },[]);

    const consultarRegistros=()=>{
        ClientesService.getFormatoRevisadosAll().then((response)=>{
        setRegistrosGuardados(response.data|| []);
      }).catch((error) => {
        console.error("Error: ", error);
      });
    }

    const tablaC = (e) =>{
        settablavisible(e.target.value)
        setregistro((prev) => ({ ...prev, [e.target.id || e.target.name]: e.target.value }))
        setleerfolio((prev) => ({
            ...prev,
            [e.target.id || e.target.name]: e.target.value
        }))
    };

    const tipoM = (e)=>{
        const {id, checked} = e.target;
        if(id ==="Solped"){
            setNoSolped(!checked)
            settitulosColor((prev) => ({...prev, solped: checked }))
        }else if(id==="Adición item / other item"){
            setaditem(checked)
            settitulosColor((prev) => ({...prev, Cantidad: checked, Precio: checked, monto: checked, descripcion: checked, um: checked, solped:checked }))
        }else if(id==="Otro"){
            setotro(!checked)
        }else if(id=== "Molde recuperable"){
            setmolde(!checked)
        }else if(id=== "Precio" ||id=== "Cantidad"){ 
            settitulosColor((prev) => ({...prev, [id]: checked}))
        }else if(id=== "Adición de línea" ){
            settitulosColor((prev) => ({...prev, etd: checked}))            
        }else if (id=== "Término de pago"){
            const valorProveedor = registro?.proveedor ? Number((registro.proveedor).substring(0, 6))    : "";
            //console.log(valorProveedor)
            const proveedorOk = proveedores?.find(p => p.noProveedor === valorProveedor);
            //console.log(proveedorOk)
            setregistro((prev) => ({...prev, terminos_de_pago: proveedorOk?.terminos_de_pago, clvterm: proveedorOk?.c_pag }));
            settitulosColor((prev) => ({...prev, termPago: checked}))            
        }
        setregistro(prev => {
            const objetoActual=JSON.parse(prev.tipo_modificacion || '{}');
            return {...prev, tipo_modificacion: JSON.stringify({...objetoActual, [id]: checked})}});   
    };
    
    const cambiofila = async (e,indicefila) => {
        const textoIn = e.target.id
        if (e.target.type === "date" || e.target.dataset.columna === "ETD"){
            const nuevaFecha = e.target.value;
            setdatosTpPm(prev => ({...prev,[indicefila]: {...prev[indicefila],etd: nuevaFecha}}));
            setregistrotabla(prev => ({...prev,[indicefila]: {...prev[indicefila],etd: nuevaFecha}}));
            return;
        }
        let filaIn = Number(textoIn.split(" ").slice(1).join(" "));
        if (e.target.dataset.columna === "DESCRIPCIÓN (other item)"){
            const nuevoValor = e.target.innerText.trim();
            setdatosTpPm(prev => ({...prev,[filaIn]: {...prev[filaIn],descripcion: nuevoValor}}));
            setregistrotabla(prev => ({...prev,[filaIn]: {...prev[filaIn],descripcion: nuevoValor}}));
            return;
        }
        setregistrotabla(prev => ({...prev, [filaIn]: { ...prev[filaIn], [e.target.dataset.columna]: e.target.innerText}}));      
        if (!textoIn.includes("m0")) {   
            const guiones = e?.target?.value?.includes("-");  //funciona para fechas etd
            if (indicefila !== undefined){
                const campo=guiones?"ETD":"um";
                setdatosTpPm(prev => ({...prev, [indicefila]: { ...prev[indicefila], [campo]: e.target.value }}));   
                console.log("datostp:"+datosTpPm)   
                setregistrotabla(prev => ({...prev, [indicefila]: { ...prev[indicefila], [campo]: e.target.value }}));      
            }
        }  
        const coincide = ["u0", "m2"].some(prefijo => textoIn?.startsWith(prefijo));
        const fila = Number(textoIn.split(" ").slice(1).join(" "));
        if (coincide && (e.target.innerText).length >= 4 && fila >= 0 ){
            const codigoItem=e.target.innerText;
            const validoItems=["2931","2932","2933","2934","2935","2936","2937","2938","2939","2940","2941"]
            if(aditem){
                const existeTabla=Object.entries(datosTpPm).some(([key,item])=>{
                    return Number(key)!==fila && String(item?.material).trim()===String(codigoItem);
                })
                if(existeTabla){
                    alert(`Ítem ${codigoItem} ya existe en la PO. Seleccionar casilla "Adición de línea"`);
                    e.target.innerText=""
                    setdatosTpPm(prev => {
                        const c = { ...prev };
                        delete c[fila]?.material;
                        return c;
                    })
                    return;
                }
            }
            if (validoItems.includes(codigoItem) && aditem){
                    //setitemsPO(true)
                    setothersValidos(["2937","2931"].includes(codigoItem));
                    const itemConfig = other_items[codigoItem] || {};
                    setdatosTpPm(prev => ({ ...prev, [fila]: {material: Number(codigoItem), clave: itemConfig.clave, 
                        cantidadnueva: "ingrese Cantidad", precio: "ingrese precio", 
                        descripcion: codigoItem==="2937" ? "Trabajos de ingeniería, diseño y evaluación" : (codigoItem==="2941" || codigoItem==="2935") ? "Ingrese descripción":"", tipo: itemConfig.tipo , valor:itemConfig.valor}}));
            }else if (!aditem && validoItems.includes(codigoItem)){
                alert("Seleccionar casilla de other/item")
                e.target.innerText  = "";
            }else{
                try{
                const response= await ClientesService.getTpPmPorMaterial(codigoItem)
                //console.log(response.data)
                const datosRespuesta = Array.isArray(response.data) ? response.data : [response.data];
                if(datosRespuesta && datosRespuesta.length > 0 && datosRespuesta[0]){
                    const itemData= datosRespuesta[0]
                    console.log(itemData)
                    setitemsPO(true)
                    setdatosTpPm(prev=>({
                        ...prev, [fila]: {...prev[fila], material:itemData.material, clave: itemData.clave,
                            posicion: itemData.posicion,
                            cantidad: itemData.cantidad,
                            precio: itemData.precio,
                            poth: itemData.poth,
                            po:itemData.po,
                            proveedor: itemData.proveedor || prev[fila]?.proveedor,
                            moneda:itemData.moneda || prev[fila]?.moneda,
                        }
                    }))
                }else{
                alert(`Ítem/material ${codigoItem} no encontrado`);
                e.target.innerText = "";
            }
            }catch(error){
                console.error("Error:", error);
                e.target.innerText = "";
            }}}else if(textoIn.includes("m0") && (e.target.innerText).includes("\n")) {
                const var2 = e.target.innerText.split("\n");
                setfilasTab(var2.length)
                setposMasivo(prev => ({...prev,...var2}))
                const POsUnicas = [...new Set(var2)];
                try {
                    const respuestas = await Promise.all(POsUnicas.map(item => ClientesService.getTpPm(item)));
                    const datos = respuestas.flatMap(r => r.data);
                    setdatosTpPm(prev => ({...prev, ...datos }));
                    setregistro(prev => ({...prev, proveedor: datos[0].proveedor}));
                }catch(error){
                    console.error(error);
                }
            }else if ((e.target.id).includes("m0") && e.target.id !== "mo 0" ) {
                const var2 = e.target.innerText;
                setfilasTab(filasTab)
                setposMasivo(prev => ({...prev, [Object.keys(prev).length]: var2}))
                const POsUnicas = var2;
                try {
                    const datos = await ClientesService.getTpPm(POsUnicas);
                    setregistrotabla(prev => ({ ...prev, ...datos.data[0]}));
                }catch(error) {
                    console.error(error);
                }
            }else if((textoIn.includes("u4") || textoIn.includes("u5") || textoIn.includes("m9") || textoIn.includes("m7")) && (datosTpPm[fila]?.material).toString().length === 4 ) {   
                setdatosTpPm(prev => { const valCantidad = e.target.dataset.columna === "CANTIDAD NUEVA" ? Number(e.target.innerText) :
                     datosTpPm[fila]?.cantidadnueva; const valPrecio = e.target.dataset.columna === "PRECIO UNITARIO" ? Number(e.target.innerText) : 
                     datosTpPm[fila]?.precio;
                    const cantidadNum = !isNaN(Number(valCantidad)) && valCantidad !==""? Number(valCantidad) : 0;
                    const precioNum = !isNaN(Number(valPrecio)) && valPrecio!=="" ? Number(valPrecio) : 0;
                    return { ...prev, [fila]: { ...prev[fila], cantidadnueva: valCantidad, precio: valPrecio, precioparcel: valPrecio,
                montototal: cantidadNum * precioNum, montoparcel: cantidadNum * precioNum} };
                }); 
            } 
            setregistro(prev => {
                const objetoActual = JSON.parse(prev.contenido_tabla || '{}');
                const objetoActualizado = { ...objetoActual, datosTpPm };
                return { ...prev, contenido_tabla: JSON.stringify(objetoActualizado)
                };
            });
    }

    const pegadoCodigos= async (e, indexFilaInicial)=>{
        e.preventDefault(); 
        const lineas=e.clipboardData.getData('text').split(/\r?\n/).map(l => l.trim()).filter(l => (l !== '' && l.length>=4));
        if(lineas.length === 0) return;
        if(aditem){
            const existeTabla=Object.values(datosTpPm).map(item=>String(item?.material).trim()).filter(Boolean);
            const duplicadoItem=lineas.filter(cod=>existeTabla.includes(String(cod)))
            if(duplicadoItem.length>0){
                alert(`Ítem(s) ${duplicadoItem.join(", ")} ya existe(n) en la PO. Seleccionar casilla "Adición de línea"`);
                return;
            }
        }
        const totalFilas= indexFilaInicial + lineas.length;
        if (totalFilas > filasTab) {
            setfilasTab(totalFilas);
        }
        try{
            const resp= await Promise.all(
                lineas.map(cod=>ClientesService.getTpPmPorMaterial(cod))
            )
            setdatosTpPm(prev => {
                const nuevoE = { ...prev };
                lineas.forEach((cod, idx) => {
                    const filaDestino = indexFilaInicial + idx;
                    const res=resp[idx]?.data
                    //const datosRespuesta = Array.isArray(res) ? [...res] : (res ? [res] : []);
                    const datosRespuesta = Array.isArray(res) ? res : [res];
                    //datosRespuesta.sort((a, b) => (a?.posicion || 0) - (b?.posicion || 0))
                    //********no ordena por pposicin sort */ .sort((a,b)=>a?.posicion-b?.posicion)
                    
                    //const datosRespuesta = res.sort((a,b)=>(a?.posicion || 0)-(b?.posicion||0));
                    const itemData = datosRespuesta[0];
                    console.log(datosRespuesta) 
                    if (itemData) {
                        nuevoE[filaDestino] = {
                            ...nuevoE[filaDestino],
                            material: itemData.material,
                            clave: itemData.clave,
                            etd:itemData.etd,
                            posicion: itemData.posicion,
                            cantidad: itemData.cantidad,
                            precio: itemData.precio,
                            poth: itemData.poth,
                            po: itemData.po,
                            proveedor: itemData.proveedor || nuevoE[filaDestino]?.proveedor,
                            moneda: itemData.moneda || nuevoE[filaDestino]?.moneda,
                        };
                    } else {
                        nuevoE[filaDestino] = {
                            ...nuevoE[filaDestino],
                            material: cod
                        };
                    }
                });
                return nuevoE;
            });
            //setitemsPO(true);
        }catch(error){
            console.error("Error: " + error);
        }
    };
    
    const añadirfila = (e) =>{
        if (e.target.innerText === "+"){
            setfilasTab(Number(filasTab) + Number(filasinput))
        }else if (e.target.innerText === "-") {
        setfilasTab(Number(filasTab) - Number(filasinput) <= 0 ? 1 : Number(filasTab) - Number(filasinput))
    }};

    const resultado =  (e) =>{
        const {id, name, value, checked}=e.target;
        const campo=id || name;
        if (id=== "bu"){
            const res = contactos.find(item => item.unidaddeNegocio === value);
            setregistro((prev) => ({ ...prev, responsable: (res?.gerenteBU || ""), unidad_de_negocio : res?.unidaddeNegocio}));
        }else{
            if (id=== "cuentadocs") setclicksidocs(value!=="si")
            if (value=== "ea") setclickEA(!checked)
            else if (value=== "revisado" || value=== "reimpresion") setclickEA(true);
            setclickcambio(!checked);
            setregistro((prev) => ({ ...prev, [campo]: value }))
            setleerfolio((prev) => ({...prev,[campo]: value}))
        }
    }

    const getordenTP = (e) => {
    const valorPo = e.target.value;
    if (valorPo.length === 7) {
        ClientesService.getTpPm(valorPo).then((response) => {
            if (response.data && (response.data).length>0) {
                const primerItem = response.data[0];
                setregistro((prev) => ({
                    ...prev, proveedor: primerItem.proveedor,
                    poth: primerItem.poth || prev.poth, po: primerItem.po || prev.po, etd: primerItem.etd, moneda: primerItem.moneda
                }));
                if (itemsPO || leerfolio?.tipoRev==="canceltot") {
                    setdatosTpPm(response.data);
                    setfilasTab((response.data).length);
                }else{
                    setdatosTpPm({
                        0: {proveedor: primerItem.proveedor,moneda: primerItem.moneda,
                            poth: primerItem.poth,po: primerItem.po}
                    }); 
                    setfilasTab(1);
                }
            }}).catch((error) => console.error("Error:", error));
        }
    };

    const solpedfunc = (e) =>{
        const campos={solped:"nosolped", molde:"molde", motivo:"motivo"}
        if (campos[e.target.id]){  
            setregistro((prev) => ({ ...prev, [campos[e.target.id]]: e.target.value }))
        }
    };

    const cambioSwith = (e) => {
    if (e.target.id === "itemP") {
        setitemsPO(e.target.checked);
        if (e.target.checked) {
            const poActual = registro.po || datosTpPm[0]?.po;
            if (poActual) {
                ClientesService.getTpPm(poActual).then((response) => {
                    const data = response.data || [];
                    setdatosTpPm(data);
                    setfilasTab(data.length);
                    setregistrotabla(data);
                }).catch((err) => console.error(err));
            }
        } else {
            const primerItem = Array.isArray(datosTpPm) ? datosTpPm[0] : datosTpPm[0] || {};
            setdatosTpPm({
                0: {proveedor: primerItem?.proveedor || registro.proveedor,
                    moneda: primerItem?.moneda,etd: primerItem?.etd,
                    poth: primerItem?.poth || registro.poth, po: primerItem?.po || registro.po}
            });
            setregistrotabla({});
            setfilasTab(1);
        } // DEJA LA ETD DEL PRIMER ITEM IGUAL PARA CUALQUIER ITEM DE CUALQUIER PO*************
    } else if (e.target.id === "preciosP") {
        setverprecios(!e.target.checked);
        setpreciosPO(!preciosPO);
    }
    };

    const clavesunicas = [...new Set(proveedores?.map(p => p.c_pag))];
    const nuevotermPago = (e) =>{
        const valorSeleccionado = e.target.value;
        const nterm = proveedores?.find(p => String(p.c_pag).trim() === String(valorSeleccionado).trim())?.terminos_de_pago || "sin descripción";
        setregistro((prev) => ({ ...prev,  c_pag: valorSeleccionado, nuevotermpago: nterm}));
    }
    const AplicaPOs = (e)=>{
        if(e.target.id ==="juntopo") setjuntopo(e.target.value)
        else setaplicaSN(e.target.value)
    }
    const Cancelar =()=>window.history.back();

    const guardaRegistro = ()=>{
        const datos={...registro, contenido_tabla: JSON.stringify(datosTpPm)}
        ClientesService.postFormatoRevisados(datos).then((response)=>{
            const id = String(response.data.id).padStart(3, '0');
            alert("Registro guardado " +  "FOLIO REV-" +   id)
            //consultarRegistros(); 
            window.history.back()
        }).catch((err)=>{console.log(err)})
    };

    useEffect(() => {
        consultarRegistros();
    }, []);

    const buscarFolio = ()=>{
        const id = Number(foliorevisado);
        ClientesService.getFormatoRevisados(id).then((response)=>{
            const data=response.data
            if(!data) return; 
            setleerfolio(data)
            setregistro(prev => ({
                ...prev, id: data.id, unidad_de_negocio: data.unidad_de_negocio || '', buprovalternos: data.buprovalternos || '',
                 clvterm: data.clvterm || '', c_pag: data. c_pag, nuevotermpago: data.nuevotermpago,
                tipotabla: data.tipotabla || '', po: data.po || '', poth: data.poth || '', molde: data.molde,
                motivo: data.motivo, nosolped: data.nosolped, responsableprovs:data.responsableprovs, motivocanceltot: data.motivocanceltot
            }))
            setclickEA(data.clasir !=="ea"); //true 
            if (data.cuentadocs) setclicksidocs(data.cuentadocs!=="si");
            if(data.tipotabla) settablavisible(data.tipotabla)

            if (data.tipo_modificacion) {
                try {
                    const tipo_modif = typeof data.tipo_modificacion==="string"? JSON.parse(data.tipo_modificacion): data.tipo_modificacion;
                    if (tipo_modif) {
                        setNoSolped(!tipo_modif["Solped"]);//true 
                        setaditem(!!tipo_modif["Adición item / other item"]);//false
                        setotro(!tipo_modif["Otro"]); //true
                        setmolde(tipo_modif["Molde recuperable"] ? false : true);
                        settitulosColor((prev) => ({
                            ...prev, solped: tipo_modif["Solped"] || tipo_modif["Adición item / other item"] || false,
                            Cantidad: tipo_modif["Adición item / other item"] || tipo_modif["Cantidad"] || false,
                            Precio: tipo_modif["Adición item / other item"] || tipo_modif["Precio"] || false,
                            monto: tipo_modif["Adición item / other item"] || false,
                            descripcion: tipo_modif["Adición item / other item"] || false,
                            um: tipo_modif["Adición item / other item"] || false,
                            etd: tipo_modif["Adición de línea"] || false,
                            termPago: tipo_modif["Término de pago"] || false,
                        }));
                        setregistro(prev => ({
                            ...prev,tipo_modificacion: typeof data.tipo_modificacion === "string" ? data.tipo_modificacion : JSON.stringify(data.tipo_modificacion)
                        })); 
                        }
                } catch (e) {
                    console.error("Error", e);
                    tipos_modif = {};
                }
            }

            let tieneTablaGuardada = false;
            if (data.contenido_tabla) {
                const tablaaa = typeof data.contenido_tabla === "string" ? JSON.parse(data.contenido_tabla) : data.contenido_tabla;
                if(tablaaa){
                    setdatosTpPm(tablaaa)
                    const totalFilas = Array.isArray(tablaaa) ? tablaaa.length : Object.keys(tablaaa).length;
                        setfilasTab(totalFilas);
                        setpreciosPO(true)
                        setitemsPO(true)
                        setverprecios(false);
                        tieneTablaGuardada=true
                }
            }

            if (data.po) {
            ClientesService.getTpPm(data.po).then((resTp) => {
                if (!tieneTablaGuardada) {
                    setdatosTpPm(resTp.data);
                    const totalFilas = resTp.data ? resTp.data.length : 1;
                    setfilasTab(totalFilas);
                }
                const infProv = resTp.data && resTp.data[0]?.proveedor;
                //console.log(infProv)
                if(infProv){
                    const proveedorOk = proveedores?.find((p) => p.noProveedor === (Number(infProv.substring(0, 6))));
                    //console.log(proveedorOk)
                    setregistro((prev) => ({
                        ...prev,
                        proveedor: infProv,
                        terminos_de_pago: proveedorOk?.terminos_de_pago || '', 
                        clvterm: data.clvterm || proveedorOk?.c_pag || '',    
                    }));
                }
            }).catch((err) => {
                console.log("Error:", err);
            });
        }
        if (data.molde) {
            const lineas = data.molde.split("\n");
            const filasDiv = lineas.map(linea => {
                const regex = /Mould charge for (.*?), will be returned after the counting of (.*?) units of (.*?)\.(.*)/;
                const match = linea.match(regex);
                if (match) { return {molde: match[1]?.trim() || "",piezas: match[2]?.trim() || "",item: match[3]?.trim() || "",nota: match[4]?.trim() || ""}}
            })
            if (filasDiv.length > 0) {
                setFilasMolde(filasDiv);
            }
        }

        }).catch((error)=>{
            console.log(error)
        })
    }

    const agregaroeliminarFMolde=(tipo)=>{
        if(tipo==="+"){
            if(filasMolde.length<10){
                setFilasMolde(prev=> [...prev, {molde:"", piezas:"", item:"", nota:""}])
            }
        }else if(tipo==="-"){
            if(filasMolde.length>1){
                setFilasMolde(prev=> prev.slice(0,-1))
            }
        }
    };

    const cambiosMolde=(index, campo, valor)=>{
        setFilasMolde(prev => {
            const nuevasFilas = [...prev];
            let valorFinal = valor;
            if (campo === 'molde') {
            valorFinal = valor.replace(/,/g, ''); 
            }
            nuevasFilas[index] = { ...nuevasFilas[index], [campo]: valorFinal };
            return nuevasFilas;
        })
    }

    useEffect(() => {
        const filasConDatos = filasMolde.filter(f => f.molde || f.piezas || f.item || f.nota);
        if (filasConDatos.length === 0) {
            setregistro(prev => ({ ...prev, molde: "" }));
            return;
        }
        const concat = filasConDatos.map(f => `Mould charge for ${f.molde}, will be returned after the counting of ${f.piezas} units of ${f.item}. ${f.nota}`).join("\n");
        setregistro(prev => ({...prev, molde: concat}));
    }, [filasMolde]);

    const descargarPDF = () => {
        const elemento = pdf.current;
        const elementosOcultar = elemento.querySelectorAll('.no-pdf');
        elementosOcultar.forEach(o => {
        o.style.setProperty('display', 'none', 'important');
        });
        const reemplazosTextarea = [];
        elemento.querySelectorAll('textarea').forEach((ta) => {
            const div = document.createElement('div');
            div.className = ta.className;
            div.style.cssText = window.getComputedStyle(ta).cssText;
            div.innerText = ta.value || '';
            div.style.whiteSpace = 'pre-wrap'; //mantiene saltos de lnea
            div.style.wordBreak = 'break-word';
            div.style.overflow = 'hidden';
            div.style.minHeight = ta.style.height || `${ta.offsetHeight}px`;
            ta.parentNode.insertBefore(div, ta);
            ta.style.display = 'none';
            reemplazosTextarea.push({ textarea: ta, divTemporal: div });
        });
        const reemplazosInputDate = [];
        elemento.querySelectorAll('input[type="date"]').forEach((inp) => {
            const span = document.createElement('span');
            span.className = inp.className;
            span.style.cssText = window.getComputedStyle(inp).cssText;
            span.innerText = inp.value || '';
            span.style.display = 'inline-block';
            span.style.width = '100%';
            span.style.textAlign = 'center';
            span.style.whiteSpace = 'nowrap';
            span.style.fontSize = '9px';
            
            inp.parentNode.insertBefore(span, inp);
            inp.style.display = 'none';
            reemplazosInputDate.push({ inputDate: inp, spanTemporal: span });
        });
        const contenedores = elemento.querySelectorAll('.pdf-overflow-container');
        const tablas = elemento.querySelectorAll('.pdf-tabla');
        const celdas = elemento.querySelectorAll('.pdf-tabla td, .pdf-tabla th');
        const registrosFlex = elemento.querySelectorAll('.pdf-flex-ajuste');

        const memoriaEstilos = [];

        contenedores.forEach(c => {
            memoriaEstilos.push({ el: c, overflowX: c.style.overflowX, width: c.style.width });
            c.style.overflowX = 'visible';
            c.style.width = '100%';
        });
        tablas.forEach(t => {
            memoriaEstilos.push({ el: t, tableLayout: t.style.tableLayout, width: t.style.width, fontSize: t.style.fontSize });
            t.style.tableLayout = 'fixed';
            t.style.width = '100%';
            t.style.fontSize = '8.5px';
        });

        celdas.forEach(cell => {
            memoriaEstilos.push({ el: cell, padding: cell.style.padding, width: cell.style.width, wordBreak: cell.style.wordBreak });
            cell.style.padding = '3px 1px';
            cell.style.width = 'auto';
            cell.style.wordBreak = 'break-word';
        });

        registrosFlex.forEach(rf => {
            memoriaEstilos.push({ el: rf, flexWrap: rf.style.flexWrap });
            rf.style.flexWrap = 'nowrap';
        });
        const opciones = {
            margin:       [4, 4, 4, 4], //[superior, izquierdo, inferior, derecho]
            filename:     `FormatoRevisados.pdf`,
            image:        {type: 'jpeg', quality: 0.99 },
            html2canvas:  { scale: 2, useCORS: true, logging: false,windowWidth: 1280 },
            jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' },
            pagebreak: {mode: ["avoid-all"]}
        };
        html2pdf().set(opciones).from(elemento).save().then(()=>{
        reemplazosTextarea.forEach(({ textarea, divTemporal }) => {
            textarea.style.display = '';
            if (divTemporal.parentNode) {
            divTemporal.parentNode.removeChild(divTemporal);
            }
        });
        reemplazosInputDate.forEach(({ inputDate, spanTemporal }) => {
            inputDate.style.display = '';
            if (spanTemporal.parentNode) {
                spanTemporal.parentNode.removeChild(spanTemporal);
            }
        });
        elementosOcultar.forEach(o => {
        o.style.display = ''; 
        });
        memoriaEstilos.forEach(item => {
                if (item.overflowX !== undefined) item.el.style.overflowX = item.overflowX;
                if (item.tableLayout !== undefined) item.el.style.tableLayout = item.tableLayout;
                if (item.width !== undefined) item.el.style.width = item.width;
                if (item.fontSize !== undefined) item.el.style.fontSize = item.fontSize;
                if (item.padding !== undefined) item.el.style.padding = item.padding;
                if (item.wordBreak !== undefined) item.el.style.wordBreak = item.wordBreak;
                if (item.flexWrap !== undefined) item.el.style.flexWrap = item.flexWrap;
            });
        });
    };

    const validarDatosDescarga=()=>{
        const camposLlenos=Boolean(registro?.unidad_de_negocio) && ((registro?.unidad_de_negocio==="Proveedores alternos") ? (Boolean(registro?.buprovalternos) && Boolean(registro?.responsableprovs)): Boolean(registro?.responsable)) 
            && Boolean(leerfolio?.tipoRev) && Boolean(leerfolio?.clasir) && ((registro?.clasir==='ea')?Boolean(leerfolio?.cuentadocs):true)
            && Boolean(leerfolio?.tipotabla) && ((leerfolio?.tipotabla==='unica')?Boolean(registro?.po || datosTpPm?.po):true)
            
        if(leerfolio?.tipoRev === "modificacion" || leerfolio?.tipoRev==="cancelparc"){
            let modifObj={}
            try{
                modifObj = typeof registro?.tipo_modificacion === 'string' ? JSON.parse(registro.tipo_modificacion || '{}'): (registro?.tipo_modificacion || {});
            } catch (e) {modifObj = {}}
            const tieneAlMenosUnaModif = Object.values(modifObj).some(val => val === true);
            if (!tieneAlMenosUnaModif) {
                return false;
            }
            if(modifObj["Término de pago"] && !Boolean(registro?.c_pag)){
                return false;
            }
            if(modifObj["Solped"] && !Boolean(registro?.nosolped)){
                return false;
            }
            if(modifObj["Otro"] && !Boolean(registro?.motivo)){
                return false;
            }
            if(modifObj["Adición item / other item"]){
            const filas = Array.isArray(datosTpPm) ? datosTpPm : Object.values(datosTpPm || {});
            const descripcionInvalida = filas.some(f => {
                const mat=String(f?.material || "").trim();
                if (mat==="2935" || mat === "2941") {
                    const desc=String(f?.descripcion || "").trim();
                    //console.log(desc)
                    return desc==="" || desc.toLowerCase()==="ingrese descripción";
                }
                return false;
            });

            if (descripcionInvalida) {
                return false;
            }}
            if(leerfolio?.tipotabla==="unica"?modifObj["Adición de línea"]: leerfolio?.tipotabla==="masivo"){
                const filas=Array.isArray(datosTpPm)? datosTpPm:Object.values(datosTpPm || {})
                const tieneETD=filas.every(f=>Boolean(f?.etd && String(f.etd).trim()!==""))
                if(!tieneETD){
                    return false;
                }
            }
            if(othersValidos){
                if (!(Boolean(juntopo) && (juntopo==="Si" || juntopo==="No"))) {
                    return false;
                }
            }
        }

        if(!camposLlenos){
            return false;
        }
        if (leerfolio?.tipoRev==='canceltot' && !Boolean(registro?.motivocanceltot)) {
            return false;
        }
        return true;
    };

return (
    <div  ref={pdf} style={{ width: '100%', boxSizing: 'border-box' }}>
        <Stack direction='row' alignItems='center' justifyContent={"flex-end"} spacing={2} sx={{padding:'1%'}} className='no-pdf'>
            <span className="input-group-text bg-white border-secondary-subtle fw-bold text-muted small">Folio: REV-
                <input onChange={(e)=>{setfoliorevisado(e.target.value)}} type="number" id="miInput" list="opcionesFolios" autoComplete="off" style={{width:'60px'}} className="form-control form-control-sm text-center border-secondary-subtle fw-bold text-uppercase" />
            </span>
            <datalist id="opcionesFolios">
              {registrosGuardados && registrosGuardados.length > 0 && (
                registrosGuardados.map((registro, index) => (
                  <option key={registro.id || index} value={registro.id} />
                ))
              )}
            </datalist>
            <button onClick={()=>{buscarFolio()}} className="btn btn-primary btn-sm fw-bold px-4" style={{height:'40px'}}>Buscar</button>
        </Stack>
        <section style={{padding:'.5%', border:'solid #dfdfdf 1px', width: '100%'}}>
            <h4 className="fw-bold" style={{ color: '#F29111' , textAlign:'center' }}>SOLICITUD PARA MODIFICACIÓN / CANCELACIÓN TOTAL Y/O PARCIAL EN ÓRDENES DE COMPRA</h4>
            
            <div className="d-flex justify-content-end mb-2">
                <div className="d-flex align-items-center">
                <label style={{textWrap:'pretty', width:"45px"}}>FOLIO</label>
                <input  type="text" value={(!leerfolio || leerfolio.id === undefined )? "" : "REV-" + String(leerfolio.id).padStart(3, '0')} disabled /></div>
            </div>
            
                <section style={{alignItems:'center',display:'flex' ,gap: '1.5rem', flexWrap: 'wrap'}}>
                <label>Unidad de Negocio</label>
                <select onChange={(e)=>{resultado(e)}} id='bu' className='form-select' style={{width:'17%'}} value={leerfolio?.unidad_de_negocio || registro?.unidad_de_negocio}>
                    <option value="">Seleccionar</option>
                    {BUs.map((item) => (<option key={item} value={item}>{item}</option>))}
                </select>
                {(registro.unidad_de_negocio==="Proveedores alternos")&&(
                    <div style={{ width: '130px' }}>
                        <span className="fw-bold d-block mb-1" style={{ fontSize: '13px' }}>BU Prov.Alternos:</span>
                            <select type="text" id="buprovalternos" className="form-control form-control-sm text-center" value={registro.buprovalternos || ""} onChange={(e)=>{resultado(e)}}>
                                <option value={""}>Seleccionar</option>
                                {BUs.filter((item) => item!=="Proveedores alternos").map((item)=>( <option key={item} value={item}>{item}</option>))}
                            </select>
                    </div>
                )}
                <label style={{width:'90px' , textWrap:'pretty'}}>Responsable </label>
                {registro.unidad_de_negocio==="Proveedores alternos"?(
                <>
                    <select id="responsableprovs" className='form-select form-select-sm border-0 border-bottom rounded-0 bg-transparent text-center w-auto' value={registro.responsableprovs || ""} onChange={(e)=>{resultado(e)}}>
                        <option value="">Seleccionar</option>
                        {responsableProvsAlternos.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </>):(
                    <input value={registro.responsable?? leerfolio?.responsable ?? ""} disabled/>
                )}
                <div className="ms-auto d-flex align-items-center">
                    <label style={{ textWrap: 'pretty', width: "45px" }}>Fecha </label>
                    <textarea disabled style={{ backgroundColor: '#f8f8f8' }} type='date' value={fechaFormateada} />
                </div>
            </section> 
            <br></br>
            <section style={{padding:'10px', alignItems:'center',display:'flex' , gap:'1rem' ,border:'solid #d1cece 1px ', marginTop: '10px', flexWrap: 'wrap' }}>
                <input style={{marginLeft:'90px' , transform: 'scale(1.3)'}} onChange={(e)=>{ resultado(e)}} type='radio' id="tipoRev" name="cambio" value="modificacion" checked={leerfolio?.tipoRev === "modificacion" } />
                <label htmlFor="modificacion">Modificación</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onChange={(e)=>{resultado(e)}} type='radio' id="tipoRev" name="cambio" value="canceltot" checked={leerfolio?.tipoRev === "canceltot" } />
                <label htmlFor="canceltot">Cancelación total</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onChange={(e)=>{resultado(e)}} type='radio' id="tipoRev" name="cambio" value="cancelparc" checked={leerfolio?.tipoRev === "cancelparc" } />
                <label htmlFor="cancelparc">Cancelación parcial (No hay PI)</label>
            </section>
            <section hidden={(clickcambio && (leerfolio.id=== undefined)) ? true : (leerfolio?.tipoRev === "canceltot")?true : false } style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ', padding: '10px' }}>
                <input style={{marginLeft:'90px' , transform: 'scale(1.3)'}} onChange={(e)=>{resultado(e)}} type='radio' id="clasir" name="subcambio" value="ea"  checked={leerfolio?.clasir === "ea" } />
                <label htmlFor="ea">EA</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onChange={(e)=>{resultado(e)}} type='radio' id="clasir" name="subcambio" value="revisado"  checked={leerfolio?.clasir === "revisado" } />
                <label htmlFor="revisado">REVISADO</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onChange={(e)=>{resultado(e)}} type='radio' id="clasir" name="subcambio" value="reimpresion"  checked={leerfolio?.clasir === "reimpresion" } />
                <label htmlFor="reimpresion">REIMPRESION(No hay PI)</label>
            </section>
            <section hidden={clickEA || (leerfolio?.tipoRev==="canceltot")} style={{marginTop:'1%', alignItems:'center',display:'flex' , gap:'1rem', border:'solid #d1cece 1px ', padding: '10px' }}>
                <label style={{marginLeft:'6%'}}><b>¿Cuenta con factura en F&R?</b></label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onChange={(e)=>{resultado(e)}}  type='radio' id="cuentadocs" name="sino" value="si" checked={leerfolio?.cuentadocs==="si"}/>
                <label htmlFor="revisado">Sí</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}} onChange={(e)=>{resultado(e)}} type='radio' id="cuentadocs" name="sino" value="no" checked={leerfolio?.cuentadocs==="no"}/>
                <label htmlFor="reimpresion">No</label>
                <label hidden={clicksidocs} style={{color:'red'}}><b>Agregar confirmación de revocación de documentos (Factura)</b></label>
            </section>
            <section  style={{marginTop:'1%', alignItems:'center',display:'flex', flexWrap: 'wrap',gap:'1rem', border:'solid #d1cece 1px ', padding: '10px'}}>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}}  onChange={(e)=>{tablaC(e)}}  type='radio' id="tipotabla" name="tipotabla" value="unica"   checked={leerfolio?.tipotabla === "unica"  }/>
                <label htmlFor="unica">Única</label>
                <input style={{marginLeft:'90px', transform: 'scale(1.3)'}}  onChange={(e)=>{tablaC(e)}} type='radio' id="tipotabla" name="tipotabla" value="masivo"   checked={leerfolio?.tipotabla === "masivo" } />
                <label htmlFor="masivo">Masivo</label>
                <div  style={{padding:'1%' , marginLeft:'auto' ,display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' ,textAlign:'center' , maxWidth:'60%'  }}>
                    {Orden_Etd_Cur.map((item) => (
                    <label key={item} value={item} style={{color:'#4d73da', fontWeight:'bold',textAlign: 'center'}} hidden={tablavisible === 'unica'  ? false : ( item.includes("Moneda") && tablavisible === 'masivo' )  ? false : true } > 
                    {item}<br></br><input onChange={(e)=>{getordenTP(e); if (item.includes("PO PM/TS")) {
                            setregistro(prev => ({ ...prev, po: e.target.value }));
                        } else if (item.includes("PO TT")) {
                            setregistro(prev => ({ ...prev, poth: e.target.value }));
                        }
                        }} readOnly={item.includes("PO PM") ? false : true } 
                         value={item === "PO TT" ? (registro.poth || datosTpPm[0]?.poth || '') : item === "Moneda" ? (datosTpPm[0]?.moneda||"") : 
                            item === "PO PM/TS" ? (registro.po || datosTpPm[0]?.po || '') : item === "ETD" ? datosTpPm[0]?.etd : ''} 
                        id={item === "etd" ? '' : item.includes("PO") ? 'miInput' : '{item}'} 
                        style={{ textAlign:'center' , width:item === "ETD" ? '' : item.includes("PO") ? '120px' : '70px'}} 
                        type={item === "ETD" ? 'date' : item.includes("PO") ? 'number' : 'text'}/>
                    </label>))}
                    <label hidden={tablavisible === 'unica'  ? false :false} style={{borderBottom:'solid 1px black', padding:'5%',width:'250%', fontWeight:'bold'}}> Proveedor:  {datosTpPm[0]?.proveedor || leerfolio?.proveedor}</label>
                </div>                
            </section>
            <div hidden={(tablavisible==='') || (leerfolio?.tipoRev==="canceltot")} style={{marginTop:'1%', alignItems:'center' , border:'solid #d1cece 1px ', padding:'10px' }}>
               <label style={{marginTop:'10px', marginLeft:'10px', fontWeight:'bold'}}>Tipo de modificación</label>
            <Stack direction='row' >
                <div  style={{padding:'1%' ,display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap:'10px', textAlign:'left' , minWidth:'70%'  }}>
                            {tipos_modif.map((item) => {
                                let esCheck = false;
                                try {
                                const modifObj = JSON.parse(registro.tipo_modificacion || '{}');
                                esCheck = !!modifObj[item]; 
                                } catch (e) {
                                esCheck = false;
                                }
                                return(
                                    <label key={item} value={item}>  <input type='checkbox' onChange={(e)=>{tipoM(e)}} key={item} id={item} checked={esCheck} />&nbsp;&nbsp;
                            {item}
                            </label>
                                )
                            })}
                </div>
                <Stack hidden={NoSolped} direction='row' alignItems='center' style={{padding:'1%',marginLeft:'-10%'}}>
                    <span style={{fontWeight:'bold'}}>No. Solped</span>&nbsp;
                    <textarea onChange={(e)=>{solpedfunc(e)}} id='solped' value={registro.solpedval} style={{border:'none', borderBottom:'1px solid black', fieldSizing: 'content',minWidth: '40px', textAlign:"center"}} type='text' ></textarea>
                </Stack>
            </Stack>
    <Stack direction='row' justifyContent={molde && otro ? 'flex-end' : 'center'} sx={{width:'100%'}}>  
        <Stack hidden={molde} direction='column' style={{ padding: '1%', marginLeft: '15%', alignItems: 'flex-start' }}> 
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{fontWeight:'bold'}}>Molde PO PM/TS:</span>&nbsp; 
            <textarea onChange={(e) => {solpedfunc(e)}} value={registro.molde || ""} id='molde' readOnly style={{ border: 'none', borderBottom: '1px solid black', fieldSizing: 'content', minWidth: '60px' }} type='text'/> 
        </div>
        <div>
            <div style={{marginBottom: '5px'}} className='no-pdf'>
                <button type="button" onClick={()=>agregaroeliminarFMolde("-")} className="btn btn-danger btn-sm fw-bold px-2 py-0 me-2">-</button>
                <button type="button" onClick={()=>agregaroeliminarFMolde("+")} className="btn btn-success btn-sm fw-bold px-2 py-0 ms-2">+</button>
            </div>
            <table className='table table-bordered no-pdf'> 
                <thead>
                    <tr className='text-center'> 
                    <th>Costo Molde</th> <th>Piezas para la recuperación</th><th>Item/Clave</th><th>Nota Adicional</th>
                    </tr> 
                </thead>
                <tbody>
                    {filasMolde.map((fila, idx) => (
                    <tr key={idx}>  
                        <td>
                            <input type="text" className="form-control form-control-sm text-center border-0" value={Number(fila.molde) ? (Number(fila.molde).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})) : fila.molde} onChange={(e) => cambiosMolde(idx, 'molde', e.target.value)}/>
                        </td>
                        <td>
                            <input type="text" className="form-control form-control-sm text-center border-0" value={fila.piezas} onChange={(e) => cambiosMolde(idx, 'piezas', e.target.value)}/>
                        </td>
                        <td>
                            <input type="text" className="form-control form-control-sm text-center border-0" value={fila.item} onChange={(e) => cambiosMolde(idx, 'item', e.target.value)}/>
                        </td>
                        <td>
                            <input type="text" className="form-control form-control-sm text-center border-0" value={fila.nota} onChange={(e) => cambiosMolde(idx, 'nota', e.target.value)}/>
                        </td>
                    </tr>  
                ))}
            </tbody>
            </table> 
        </div> 
        </Stack>
        <Stack hidden={otro} direction='colum' style={{padding:'1%',marginLeft:'12%',alignItems: 'flex-start'}}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{fontWeight:'bold'}}>Motivo...</span>&nbsp;
                <textarea onChange={(e)=>{solpedfunc(e)}} value={registro.motivo || ""} style={{border:'none', borderBottom:'1px solid black',fieldSizing: 'content',minWidth: '60px'}} type='text' id='motivo'></textarea>
            </div>
        </Stack>       
</Stack> 
    </div>
        </section>
    <section style={{ padding: '.5%', border: 'solid #dfdfdf 1px', marginTop: '10px' }}>
                <div style={{ display: titulosColor.termPago ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }} className="pdf-flex-ajuste">
                    <Stack sx={{ display: "inline-flex", alignItems: "stretch" }} >
                        <Stack direction="row">
                            <input value={registro?.clvterm || ''} style={{ maxWidth: '30%', textAlign: 'center' }} disabled />
                            <input value={registro?.terminos_de_pago || ''} style={{ minWidth: '70% ', fieldSizing:"content"}} disabled />
                        </Stack>
                        <label style={{ borderTop: "1px solid black", textAlign: "center", paddingTop: "4px"}} >Término de pago actual</label>
                    </Stack>

                    <Stack sx={{ alignItems: 'center' }} style={{ display: (tablavisible === "masivo") ? 'flex' : 'none' }}>
                        <label style={{ fontWeight: 'bold' }}>¿Aplica para todas las Pos?</label>
                        <div style={{ alignItems: 'center', display: 'flex', gap: '1rem' }}>
                            <label>Si</label><input onClick={(e) => { AplicaPOs(e) }} checked={juntopo==="Si"} style={{ transform: 'scale(1.2)' }} type='radio' id="aplicaAllPOs" value='Si' name='si_no' />
                            <label>No</label><input onClick={(e) => { AplicaPOs(e) }} checked={juntopo==="No"} style={{ transform: 'scale(1.2)' }} type='radio' id="aplicaAllPOs" value='No' name='si_no' />
                        </div>
                        <div style={{ display: aplicaSN === "Si" ? 'flex' : 'none', marginTop: '5px', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontSize: '13.5px' }}>Indicar POs</label>
                            <input type='text' style={{ border: 'none', borderBottom: '1px solid black', width: '120px' }} />
                        </div>
                    </Stack>

                    <Stack sx={{ display: "inline-flex", alignItems: "stretch" }} >
                        <Stack direction="row">
                            <select value={registro.c_pag || ""} onChange={nuevotermPago} >
                                <option value={""}> Select </option>
                                {clavesunicas.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>))}
                            </select>
                            <input style={{ minWidth: '70px', fieldSizing:"content" }} value={registro?.nuevotermpago || ''} readOnly />
                        </Stack>
                        <label style={{ borderTop: "1px solid black", textAlign: "center", paddingTop: "4px"}} >Término de pago nuevo</label>
                    </Stack>
                </div>

                <Stack sx={{ alignItems: 'center' }} style={{ display: othersValidos ? 'flex' : 'none', marginTop: '10px' }}>
                    <div style={{ border: 'dotted 1px red', padding: '5px 15px', borderRadius: '5px' }}>
                        <label style={{ fontWeight: 'bold' }}>Pago Junto con PO</label>
                        <div style={{ alignItems: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <label>Si</label><input onClick={(e) => { AplicaPOs(e) }} checked={juntopo==="Si"} style={{ transform: 'scale(1.2)' }} type='radio' id="juntopo" value='Si' name='si_jpo' />
                            <label>No</label><input onClick={(e) => { AplicaPOs(e) }} checked={juntopo==="No"} style={{ transform: 'scale(1.2)' }} type='radio' id="juntopo" value='No' name='si_jpo' />
                        </div>
                    </div>
                    <div style={{ display: juntopo === "No" ? 'block' : 'none', marginTop: '5px' }}>
                        <label className='no-pdf' style={{ color: 'red', fontWeight: 'bold' }}>Indicar nuevo término de pago (marcar casilla)</label>
                    </div>
                </Stack>
    <div hidden={!(leerfolio?.tipoRev === "canceltot")} style={{ marginTop: '10px'}}>
        <label style={{ fontWeight: 'bold' }}>Motivo <label style={{color:"#FF0000"}}>*</label></label>
        <input type="text" id="motivocanceltot" className="form-control form-control-sm text-center" value={registro.motivocanceltot || ""} onChange={(e)=>{ resultado(e)}}></input>
    </div>
    <div  hidden={(tablavisible==='') || (tablavisible==='unica' && leerfolio?.tipoRev==="canceltot") || (tablavisible!=="unica")} className="pdf-overflow-container" style={{marginTop:'2%' , width:'100%', overflowX: 'auto', border:'solid #d1cece 1px' , borderRadius:'10px', boxSizing: 'border-box'}}> 
        <div className='no-pdf' style={{ padding: '8px' }}>
            <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-danger btn-sm fw-bold px-2 py-0" >-</button>
                <input  onChange={(e) => {setfilasinput(e.target.value)}} id='miInput' type='number'  defaultValue={filasinput} style={{fontWeight:'bold'  ,textAlign:'center',fontSize:'12px', marginLeft:'1%',width:'3%'}}/ >
            <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-success btn-sm fw-bold px-2 py-0" >+</button>             
            <label style={{marginLeft:'5%',fontWeight:itemsPO ? '': 'bold'}}>Items Manual</label>
            <Switch id="itemP" checked={itemsPO} onChange={(e)=>{cambioSwith(e)}}  color='warning' />
            <label style={{fontWeight:itemsPO ? 'bold': ''}}>PO Completa</label>
            <label style={{marginLeft:'5%',fontWeight:preciosPO ? '': 'bold'}}>Precio Manual</label>
            <Switch id="preciosP" checked={preciosPO} onChange={(e)=>{cambioSwith(e)}}  color='success' />
            <label style={{ fontWeight:preciosPO ? 'bold': ''}}>Precios en Sistema</label>
            <button className='btn btn-link' style={{marginLeft:'7%' , backgroundColor:'#e7e7e7' ,border:'1px gray dotted'}}>Ver tabla Parcelmobi</button>
        </div>
            <div className='no-pdf' style={{display:titulosColor.Cantidad  ? '':'none' , color:'red', marginLeft:'5%' , height:'45px'}}>Para ajustes de cantidad únicamente considerar líneas que indiquen información en el campo "Cantidad Nueva"</div>
            <table className='table pdf-tabla' style={{ width: '100%', tableLayout: 'auto' }}>
                <thead className='thead-dark' style={{textAlign:'center'}} >
                <tr>
                    {Revisados_Unica.map((item) => {
                    const poActual = String(registro.poth || datosTpPm[0]?.poth || '');
                    const esPoTipo7 = poActual.startsWith('7');
                    const tituloEncabezado = (item === "PRECIO PARCELMOBI" && esPoTipo7) ? "PRECIO TS" : item;
                    return (
                        <th key={item} id={item} 
                        style={{fontSize: 'small', display: item === "UM" && aditem === false ? 'none' : item.includes("ETD") && !titulosColor.etd ? 'none' : '',
                            backgroundColor: ((item.includes("PRECIO") && titulosColor.Precio) || (item.includes("CANTIDAD") && titulosColor.Cantidad) ||
                            (item.includes("MONTO") && titulosColor.monto) || (item.includes("DESCRIPCIÓN") && titulosColor.descripcion) ||
                            (item.includes("UM") && titulosColor.um) || (item.includes("ETD") && titulosColor.etd || (item.includes("SOLPED") && titulosColor.solped))) ? "#FBE2D5" : ''
                        }}>
                        {tituloEncabezado}
                        </th>
                    );
                    })}
                </tr>     
                 </thead>  
                    <tbody onBlur={(e)=>{cambiofila(e)}}>
                        {Array.from({ length: filasTab }).map((_, indexFila) => (
                            <tr key={indexFila} style={{backgroundColor: 'gray'}} >
                            {Revisados_Unica.map((item, indexItem) => (
                                <td key={'u' + indexItem + '-' + (datosTpPm[indexFila]?.material || indexFila)} id={'u'+ indexItem + " " + indexFila} data-columna={item} 
                                contentEditable={item==="POSICIÓN"? ((aditem || titulosColor.etd)? 'true':'false'): 'true'}
                                onPaste={(e)=>{
                                    if(item==="ITEM"){ 
                                        pegadoCodigos(e, indexFila)
                                        }}} style={{width:'100px',textAlign:'center', border:'dotted black 1px' , borderRadius:'6px', display:item === "UM" && aditem === false ? 'none' : item.includes("ETD") && !titulosColor.etd ? 'none' : ''}}>
                                {item === "ETD" ? <input id={'u'+ indexItem + " " + indexFila} onChange={(e)=>{cambiofila(e, indexFila)}} type="date" data-columna="ETD" value={datosTpPm[indexFila]?.etd || ''}/> : item === "ITEM" ? datosTpPm[indexFila]?.material : 
                                 (item === "CLAVE") ? datosTpPm[indexFila]?.clave : 
                                item === "POSICIÓN" ? ((aditem || titulosColor.etd) ? <span style={{fontWeight:"bold"}}>ADD</span> : datosTpPm[indexFila]?.posicion):
                                  (item === "CANTIDAD ACTUAL" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.cantidad :  
                                  (item === "PRECIO UNITARIO")?(preciosPO ? (!isNaN(Number(datosTpPm[indexFila]?.precio)) && datosTpPm[indexFila]?.precio !== "" ? `$${Number(datosTpPm[indexFila]?.precio).toFixed(4)}` : datosTpPm[indexFila]?.precio || ""): null )  : 
                                  (item === "CANTIDAD NUEVA" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.cantidadnueva :
                                  (item === 'MONTO TOTAL' && titulosColor.Cantidad === true) ? (datosTpPm[indexFila]?.montototal && !isNaN(datosTpPm[indexFila].montototal)? Number(datosTpPm[indexFila].montototal).toFixed(2): ""):
                                  (item === "MONTO TOTAL PARCELMOBI" && titulosColor.Cantidad === true) ? ( datosTpPm[indexFila]?.montoparcel && !isNaN(datosTpPm[indexFila].montoparcel)? Number(datosTpPm[indexFila]?.montoparcel).toFixed(2):"") :
                                  (item === "PRECIO UNITARIO" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.precio : 
                                  (item === "PRECIO PARCELMOBI" && titulosColor.Cantidad) ? (
                                        !isNaN(Number(datosTpPm[indexFila]?.precioparcel)) && datosTpPm[indexFila]?.precioparcel !== "" && datosTpPm[indexFila]?.precioparcel !== null
                                        ? `$${Number(datosTpPm[indexFila]?.precioparcel).toFixed(4)}`
                                        : datosTpPm[indexFila]?.precioparcel || ""
                                    ) : 
                                  (item === "DESCRIPCIÓN (other item)" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.descripcion || '':  
                                  (item === "UM" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.tipo === "string" ? datosTpPm[indexFila]?.valor : 
                                  datosTpPm[indexFila]?.tipo === "lista" ? <select onChange={(e)=>{cambiofila(e, indexFila)}}> <option>seleccione</option>{(datosTpPm[indexFila]?.valor).map((item => (<option key={item} id={'u'+ item }>{item}</option> )))}</select> : null : null  }
                                </td> 
                            ))}
                            </tr>
                        ))}
                    </tbody>            
            </table>
        </div>
    <div  hidden={(tablavisible === "masivo" && leerfolio?.tipoRev!=="canceltot") ? false : true } className="pdf-overflow-container" style={{marginTop:'2%' , width:'100%', overflowX: 'auto', border:'solid #d1cece 1px' , borderRadius:'10px', boxSizing: 'border-box'}}> 
            <div className='no-pdf' style={{ padding: '8px' }}>
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-danger btn-sm fw-bold px-2 py-0" >-</button>
                    <input  onChange={(e) => {setfilasinput(e.target.value)}} id='miInput' type='number'  defaultValue={filasinput} style={{fontWeight:'bold'  ,textAlign:'center',fontSize:'12px', marginLeft:'1%',width:'3%'}}/ >
                <button style={{marginLeft:'1%'}} onClick={(e)=> añadirfila(e)} className="btn btn-success btn-sm fw-bold px-2 py-0" >+</button>

             <label style={{marginLeft:'30%',fontWeight:preciosPO ? '': 'bold'}}>Precio Manual</label>
                <Switch id="preciosP" onChange={(e)=>{cambioSwith(e)}}  checked={preciosPO} color= 'success' />
             <label style={{ fontWeight:preciosPO ? 'bold': ''}}>Precio en Sistema</label>
                <button className='btn btn-link' style={{marginLeft:'7%'}}>Ver tabla Parcelmobi</button>
            </div>
            <div className='no-pdf' style={{display:titulosColor.Cantidad  ? '':'none' , color:'red', marginLeft:'5%' , height:'45px'}}>Para ajustes de cantidad únicamente considerar líneas que indiquen información en el campo "Cantidad Nueva"</div>
            <table className='table pdf-tabla' style={{ width: '100%', tableLayout: 'auto' }}>
                <thead className='thead-dark' style={{textAlign:'center'}} >
                <tr>
                    {Revisados_Masivo.map((item) => {
                    const poMasiva = String(datosTpPm[0]?.poth || registro.poth || '');
                    const esPoTipo7 = poMasiva.startsWith('7');
                    const tituloEncabezado = (item === "PRECIO PARCELMOBI" && esPoTipo7) ? "PRECIO TS" : item;

                    return (
                        <th key={item} id={item} style={{fontSize: 'small', display: item === "UM" && aditem === false ? 'none' : (item.includes("SOLPED") && titulosColor.solped === false) ? 'none' : '',
                            backgroundColor: ((item.includes("PRECIO") && titulosColor.Precio) || (item.includes("CANTIDAD") && titulosColor.Cantidad) ||
                            (item.includes("MONTO") && titulosColor.monto) || (item.includes("DESCRIPCIÓN") && titulosColor.descripcion) ||
                            (item.includes("UM") && titulosColor.um) || (item.includes("ETD") && titulosColor.etd || (item.includes("SOLPED") && titulosColor.solped))) ? "#FBE2D5" : ''
                        }}>{tituloEncabezado}</th>
                    );
                    })}
                </tr>
                </thead>
                <tbody onBlur={(e) => {cambiofila(e)}}>
                {Array.from({ length: filasTab }).map((_, indexFila) => (
                    <tr key={indexFila} style={{ backgroundColor: 'gray', textAlign: 'center' }} >
                        {Revisados_Masivo.map((item, indexItem) => (
                            <td key={'m' + indexItem + '-' + (datosTpPm[indexFila]?.material || indexFila)} id={'m' + indexItem + " " + indexFila} data-columna={item}
                                contentEditable={item==="POSICIÓN"? ((aditem || titulosColor.etd)? 'true':'false'):'true'} onPaste={(e)=>{
                                    if(item==="ITEM"){
                                        pegadoCodigos(e, indexFila)
                                        }}} style={{ width: '100px', textAlign: 'center', display: item === "UM" && aditem === false ? 'none' : (item.includes("SOLPED") && titulosColor.solped === false) ? 'none' : '' }}>
                                    {item === "ETD" ? <input id={'m' + indexItem + " " + indexFila} type="date" data-columna="ETD" onChange={(e) => cambiofila(e, indexFila)} value={datosTpPm[indexFila]?.etd || ''}/>
                                    : item === "PO PM/TS" ? datosTpPm[indexFila]?.po
                                    : item === "PO TT" ? datosTpPm[indexFila]?.poth : item === "ITEM" ? datosTpPm[indexFila]?.material
                                    : item === "CLAVE" ? datosTpPm[indexFila]?.clave : item === "POSICIÓN" ? ((aditem || titulosColor.etd) ? <span style={{fontWeight:"bold"}}>ADD</span> : datosTpPm[indexFila]?.posicion) 
                                    : (item === "CANTIDAD ACTUAL" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.cantidad :
                                        (item === "PRECIO UNITARIO") ? (preciosPO ? (!isNaN(Number(datosTpPm[indexFila]?.precio)) && datosTpPm[indexFila]?.precio !== "" ? `$${Number(datosTpPm[indexFila]?.precio).toFixed(4)}` : datosTpPm[indexFila]?.precio || "") : null) :
                                        (item === "CANTIDAD NUEVA" && titulosColor.Cantidad === true) ? (
                                            datosTpPm[indexFila]?.cantidadnueva) :
                                        (item === "MONTO TOTAL" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.montototal :
                                        (item === "MONTO TOTAL PARCELMOBI" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.montoparcel :
                                        (item === "PRECIO UNITARIO" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.precio :
                                        (item === "PRECIO PARCELMOBI") ? (
                                            !isNaN(Number(datosTpPm[indexFila]?.precioparcel)) && datosTpPm[indexFila]?.precioparcel !== "" && datosTpPm[indexFila]?.precioparcel !== null
                                                ? `$${Number(datosTpPm[indexFila]?.precioparcel).toFixed(4)}`
                                                : datosTpPm[indexFila]?.precioparcel || ""
                                        ) :
                                            (item === "DESCRIPCIÓN (other item)" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.descripcion :
                                            (item === "UM" && titulosColor.Cantidad === true) ? datosTpPm[indexFila]?.tipo === "string" ? datosTpPm[indexFila]?.valor :
                                                datosTpPm[indexFila]?.tipo === "lista" ? <select onChange={(e) => { cambiofila(e, indexFila) }}> <option>seleccione</option>{(datosTpPm[indexFila]?.valor).map((item => (<option key={item} id={'u' + item}>{item}</option>)))}</select> : null : null
                                }
                            </td>
                            ))}
                            </tr>
                        ))}
                    </tbody>            
            </table>
        </div>
       </section> 
        <Stack  marginLeft='40%' direction='row' spacing={2} className='no-pdf'>
            <button className="btn btn-dark btn-sm fw-bold px-3" onClick={descargarPDF} disabled={!validarDatosDescarga()}>Descargar PDF</button>
            <button onClick={()=>{guardaRegistro()}} className='btn btn-success'>Guardar</button>
            <button onClick={()=>{Cancelar()}} className='btn btn-danger'>Cancelar</button>
        </Stack>
        <br></br>
    </div>
  )
}

export default FormatoRevisados