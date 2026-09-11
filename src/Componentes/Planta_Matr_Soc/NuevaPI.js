import Stack from "@mui/material/Stack";
import {useNavigate} from "react-router-dom";
import ClientesService from "../../service/ClientesService";
import { useState } from "react";
import {getBreadcrumbsUtilityClass, Input } from "@mui/material";
import { BUs } from "../materialReutilizable/RangosReusables";
import { attachPinnedStyle, gridVirtualizationEnabledSelector } from "@mui/x-data-grid/internals";

function NuevaPI(){
    const navigate = useNavigate();
    const [nopos,setNopos]=useState("");
    const [view, setView]=useState();
    const [view2, setView2]=useState();
    const [registro, setRegistro]=useState();
    const [correccionSegunda, setCorreccionSegunda]=useState();

    const consultanopo = async () => {
      if (!nopos) return;
      const resPI = await ClientesService.getnuevapi(nopos);

      if (resPI.data && resPI.data.length > 0) {
        const datosBase = resPI.data[resPI.data.length - 1];
        setRegistro(datosBase);
        setView(true);
        cargarCruces(datosBase);
      } else {
        alert("No existe " + nopos + " en socs");
      }
    };

    const cargarCruces= async (datosBase) => {
      try {
        const [resBufferPlanta, resCodigosPlan] = await Promise.all([
          ClientesService.get_buffer_planta(),
          ClientesService.getCodigosPlaneadorAll()
        ]);
        const bufferP = resBufferPlanta.data || [];
        const codiPlan = resCodigosPlan.data || [];
        const pMap = Object.fromEntries(codiPlan.map(c => [String(c.item).trim(), c.nombre_planner]));
        const cMap = Object.fromEntries(bufferP.map(c => [String(c.po).trim(), c.codigo]));
        const fMap = Object.fromEntries(bufferP.map(f => [String(f.po).trim(), f.prov]));
        const etdMap = Object.fromEntries(bufferP.map(f => [String(f.po).trim(), f.etd]));
        const familiaMap = Object.fromEntries(bufferP.map(f => [String(f.po).trim(), f.clave]));

        const llaveBusqueda = String(nopos).trim();
        setRegistro((prev) => ({
          ...prev,
          nombreprov: fMap[llaveBusqueda] || prev.nombreprov || "",
          etdpo: etdMap[llaveBusqueda] ? etdMap[llaveBusqueda].split('-').reverse().join('/') : (prev.etdpo || ""),
          planeador: pMap[String(cMap[llaveBusqueda] || "").trim()] || prev.planeador || "",
          familia: familiaMap[llaveBusqueda] || prev.familia || ""
        }));
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const seg_corr = (x)=>{
      setCorreccionSegunda(x)
      setView(false)

      if(x==="Segunda"){
        setRegistro((prev) => {
          const { id, ...restoCampos } = prev;
          return {
            ...restoCampos,
            etdpi: "", razonsocial: "", incoterm: "", puerto: "", 
            terminopago: "", etd: "", cantidad: "", precio: "", 
            adicelim: "", comentarios: "", fechainicial: "", 
            fecharegistr: "", fecharev: "", fechainicialcompras: "", 
            fechafinalcompras: "", finicialplan: "", ffinalplan: "", enviada: ""
          }
        });
      }
      setView2(true);
    }

    const handleChange =(e) => {
      const name = e.target.name || e.target.id;
      const value = e.target.value;
      setRegistro((prev) => ({
        ...prev,
        [name]: value
      }))
    };

    const guardarDatos = async() => {
      let datos = {...registro};
      if(correccionSegunda==="Segunda"){
        delete datos.id;
      }
      await ClientesService.saveControlPIs(datos);

      alert("Registro guardado");
      console.log(datos);
    };

    const cerrar = ()=>{
      setNopos();
      setView2(false);
      setCorreccionSegunda("")
      setRegistro({});
    };

    if (view){
      return(
        <div style={{padding:'40px'}}> 
        <span style={{marginLeft:"12px", outline:'1px solid black'}}> PI <b>{registro.nopo}</b> </span> 
        <button style={{marginLeft:"12px"}} onClick={()=>{seg_corr("Segunda")}}className="btn btn-success mb-2"> Segunda </button>
        <button style={{marginLeft:"12px"}} onClick={()=>{seg_corr("Correccion")}} className="btn btn-danger mb-2"> Correccion </button>
        </div>
      )
    }

    if(view2){
      return(
        <div className="px-8 py-5">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <div><h2 className="fw-bold text-dark m-2">{correccionSegunda === "Correccion" ? "CORRECCIÓN" : "SEGUNDA"}</h2></div>
            <div className="d-flex gap-2">
              <button className="btn btn-success px-4 fw-semibold shadow-sm" onClick={guardarDatos}>Guardar Cambios</button>
              <button className="btn btn-danger px-4 fw-semibold" onClick={() => cerrar()}>Cancelar</button>
            </div>
          </div>
          <div className="container-fluid p-0">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label fw-bold extra-small text-muted mb-1">NO. PO</label>
                    <Input readOnly value={nopos} className="form-control form-control-sm bg-light fw-bold text-center" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold extra-small text-muted mb-1">FOLIO TT</label>
                    <Input readOnly value={registro.foliott || ""} className="form-control form-control-sm bg-light text-center" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold extra-small text-muted mb-1">BU</label>
                    <select className="form-select form-select-sm text-center">
                      <option></option>
                      {BUs.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold extra-small text-muted mb-1">Comprador</label>
                    <Input className="form-control form-control-sm" value={registro.comprador || ""} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold extra-small text-muted mb-1">No. Proveedor</label>
                    <Input className="form-control form-control-sm" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold extra-small text-muted mb-1">Nombre Proveedor</label>
                    <Input className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold extra-small text-muted mb-1">Planeador</label>
                    <Input className="form-control form-control-sm" value={registro.planeador || ""}/>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold extra-small text-muted mb-1">TT</label>
                    <Input className="form-control form-control-sm text-center" />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label fw-bold extra-small text-muted mb-1">D/M</label>
                    <Input className="form-control form-control-sm text-center" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold extra-small text-muted mb-1">ETD PO</label>
                    <Input className="form-control form-control-sm text-center" value={registro.etdpo || ""}/>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label fw-bold extra-small text-muted mb-1">ETD PI</label>
                    <Input name="etdpi" type="date" className="form-control form-control-sm text-center" defaultValue={registro.etdpi || ""} onChange={handleChange}/>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold extra-small text-muted mb-1">Familia</label>
                    <Input className="form-control form-control-sm" value={registro.familia || ""} />
                  </div>
                </div>
              </div>
            </div>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-2">
                  {[{ label: "Razón Social", name:"razonsocial"},
                    { label: "Incoterm", name:"incoterm"},
                    { label: "Puerto", name:"puerto"},
                    { label: "Términos Pago", name:"terminopago"},
                    { label: "ETD", name:"etd"},
                    { label: "Cantidad", name:"cantidad"},
                    { label: "Precio", name:"precio"},].map((item) => (
                    <div key={item.name} className="col-6 col-sm-4 col-md-3 col-lg text-center">
                      <div className="p-2 border rounded bg-light-subtle">
                        <label className="form-label fw-bold extra-small text-muted d-block mb-1 text-truncate">{item.label}</label>
                        <select name={item.name} className={`form-select form-select-sm text-center fw-bold`} style={{color: registro[item.name] === 'OK' ? "green" : registro[item.name]==="MAL" ? "red": "black" }} defaultValue={registro[item.name] || ""} onChange={handleChange}>
                          <option value="">...</option>
                          <option value="OK">OK</option>
                          <option value="MAL">MAL</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold extra-small text-muted mb-1">Adición / Eliminación</label>
                    <textarea name="adicelim" className="form-control form-control-sm" rows="2" defaultValue={registro.adicelim || ""} onChange={handleChange}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold extra-small text-muted mb-1">Comentarios</label>
                    <textarea name="comentarios" className="form-control form-control-sm" rows="2" defaultValue={registro.comentarios || ""} onChange={handleChange}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          <div className="row g-3 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Recepción e Impresión P.I.</h6>
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">Fecha Inicial (Recepción)</label>
                      <input name="fechainicial" type="date" className="form-control form-control-sm" defaultValue={registro.fechainicial || ""} onChange={handleChange}/>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">Fecha Registro</label>
                      <input name="fecharegistr" type="date" className="form-control form-control-sm" defaultValue={registro.fecharegistr || ""} onChange={handleChange}/>
                    </div>
                    <div className="mb-0">
                      <label className="form-label small text-muted mb-1">Fecha Revisión</label>
                      <input name="fecharev" type="date" className="form-control form-control-sm" defaultValue={registro.fecharev || ""} onChange={handleChange}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Área de Compras</h6>
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">Fecha Inicial</label>
                      <input name="fechainicialcompras" type="date" className="form-control form-control-sm" defaultValue={registro.fechainicialcompras || ""} onChange={handleChange}/>
                    </div>
                    <div className="mb-0">
                      <label className="form-label small text-muted mb-1">Fecha Final</label>
                      <input name="fechafinalcompras" type="date" className="form-control form-control-sm" defaultValue={registro.fechafinalcompras || ""} onChange={handleChange}/>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Planeación / Confirmación</h6>
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">Fecha Inicial</label>
                      <input name="finicialplan" type="date" className="form-control form-control-sm" defaultValue={registro.finicialplan || ""} onChange={handleChange}/>
                    </div>
                    <div className="mb-0">
                      <label className="form-label small text-muted mb-1">Fecha Final</label>
                      <input name="ffinalplan" type="date" className="form-control form-control-sm" defaultValue={registro.ffinalplan || ""} onChange={handleChange}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Enviada</h6>
                    <div className="mb-0">
                      <label className="form-label small text-muted mb-1">Fecha Enviada</label>
                      <input name="enviada" type="date" className="form-control form-control-sm" defaultValue={registro.enviada || ""} onChange={handleChange}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )
    }
    
    const handleKeyPress = (event) => {
      if(event.key === 'Enter'){
        //handleopen();
        consultanopo();
      }
    }

    return(
      <Stack direction="row"  style={{marginLeft:"15px", marginTop: "30px", width: "100px" }} >
        <input type="number" placeholder="Digite PI" value={nopos} onChange={(e) => setNopos(e.target.value)}  onKeyDown={handleKeyPress}></input>
        <button onClick={consultanopo} className={"btn btn-success"} >Aceptar</button>
        <button onClick={()=>navigate(-1)} className={"btn btn-danger"}>Cancelar</button>
      </Stack>
    )
}

export default NuevaPI;