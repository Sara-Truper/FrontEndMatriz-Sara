import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import ClientesService from "../service/ClientesService";
import FileSaver from 'file-saver';

function CalculadoraC({open, onClose}){
    const [listaProveedores, setListaProveedores] =useState([]);
    const [soc, setSoc] =useState([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] =useState(null);
    const [folioSeleccionado, setfolioSeleccionado] =useState(null);
    const [revisados, setRevisados]=useState(null);
    const [tablas, setTablas]=useState([]);
    const [codigos, setCodigos]=useState(null);
    const [contactosAll, setContactosAll]=useState(null);
    const [matrizCalculadora, setMatrizCalculadora]=useState(null);

    useEffect(() => {
        if (open){
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
              //console.log("codigos:")
              //console.log(response.data)
            }).catch((error)=>console.log("Error:", error))

            ClientesService.getcontactosall().then((response)=>{
              setContactosAll(response.data ||[]);
              //console.log(response.data)
            }).catch((error)=>console.log("Error: ", error))

            ClientesService.getMatrizCalculadoraAll().then((response)=>{
              setMatrizCalculadora(response.data ||[]);
              console.log(response.data)
            }).catch((error)=>console.log("Error:",error))
        }
    }, [open])

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
        return;
      }

      const foliot=soc.find(s=>s.foliott?.toString().trim()===val.trim())
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
            console.log(tip)

            //
            const bubu = (codi?.UnidadDeNegocio || codi?.unidad_de_negocio || codi?.unidadDeNegocio || "").toString().trim();
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
              tipomatriz: (tip?.tipomatriz) || ""
            }
            
          })
          //console.log(bus)
          setTablas(bus)
        }
      }else{
        setfolioSeleccionado({foliott:val, nooc:""})
        setTablas([]);
      }
    }


    return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogContent className="bg-light">
        <div className="my-2">
          <div className="card mb-4 shadow-sm">
            <div className="card-body bg-white">
              <div className="row g-3 mb-2 ">
                <div className="col-md-2">
                  <label className="form-label fw-bold small text-muted">RAZÓN SOCIAL</label>
                  <input type="text" className="form-control" value={String(folioSeleccionado?.foliott).startsWith('8') ? 'PARCELMOBI' : 
                    String(folioSeleccionado?.foliott).startsWith('7') ? 'TRADING SPECIALTIES' : String(folioSeleccionado?.foliott).startsWith('0') || folioSeleccionado==="" ? 'TRUPER': ""} readOnly/>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold small text-muted">DIRECCIÓN</label>
                  <textarea className="form-control form-control-sm" rows="2" readOnly
                    value={`${proveedorSeleccionado?.calle || ""}, ${proveedorSeleccionado?.poblacion || ""}, ${proveedorSeleccionado?.dis1 || ""}`}
                  />
                </div>
                <div className="col-md-1">
                  <label className="form-label fw-bold small text-muted">C.P.</label>
                  <input type="text" className="form-control" readOnly value={proveedorSeleccionado?.cp || ""} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold small text-muted">TAX ID</label>
                  <input type="text" className="form-control" readOnly value={proveedorSeleccionado?.taxid || ""} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold small text-danger">STATUS / PROBLEMA</label>
                  <input type="text" className="form-control bg-warning fw-bold text-center"  value={folioSeleccionado?.status_problema || ""}/>
                </div>
                <div className="col-md-1">
                  <label className="form-label fw-bold small">Status PO</label>
                  <input type="text" className="form-control fw-bold text-center"/>
                </div>
              </div>
              <hr />

              <div className="row g-3 align-items-end">
                <div className="col-md-2">
                  <label className="form-label fw-bold small text-muted">Folio TT</label>
                  <input type="text" className="form-control" value={folioSeleccionado?.foliott || ""} onChange={(e) => handlefolioT(e.target.value)} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold small text-muted">No. O.C.</label>
                  <input type="text" className="form-control" readOnly value={folioSeleccionado?.nooc || ""} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold small text-muted">No. De Proveedor</label>
                  <input type="text" className="form-control" value={proveedorSeleccionado?.noProveedor || ""} onChange={(e) => handleProveedorCalc(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold small text-muted">Nombre Proveedor</label>
                  <input type="text" className="form-control" readOnly value={proveedorSeleccionado?.proveedor || ""} />
                </div>
                <div className="col-md-2 col-6">
                  <label className="form-label fw-bold small text-muted">Directos</label>
                  <input type="text" className="form-control bg-light text-end fw-bold" value={folioSeleccionado?.reporte_con_problemas}/>
                </div>
                <div className="col-md-2 col-6">
                  <label className="form-label fw-bold small text-success">TOTAL PO</label>
                  <input type="text" className="form-control bg-light text-end fw-bold" disabled />
                </div>
                <div className="col-md-2 col-6">
                  <label className="form-label fw-bold small text-success">TOTAL QTY PO</label>
                  <input type="text" className="form-control bg-light text-end fw-bold" disabled />
                </div>
                <div className="col-md-2 col-6">
                  <label className="form-label fw-bold small text-success">IDA MIN</label>
                  <input type="text" className="form-control bg-light text-end fw-bold" disabled />
                </div>
                <div className="col-md-2 col-6">
                  <label className="form-label fw-bold small text-success">PO DIFERENTE</label>
                  <input type="text" className="form-control bg-light text-end fw-bold" disabled />
                </div>  
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
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
                  {tablas.length > 0 ? (
                    tablas.map((fila, index) => (
                      <tr key={index}>
                        <td className="text-center fw-bold">{fila.material}</td>
                        <td>{fila.bu}</td>
                        <td>{fila.planeador}</td>
                        <td>{fila.comprador}</td>
                        <td className='text-center'>{fila.tipomatriz}</td>
                        <td></td>
                        {/* style currency: valor monetario, currency mxn: simbolo de moneda */}
                        {/* <td className='text-center'>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(fila.cantidad)}</td>  */}
                        <td className='text-center'>{new Intl.NumberFormat('es-MX').format(fila.cantidad)}</td> 
                        <td></td>
                        <td></td>
                        <td>{fila.etd}</td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{height: "32px"}}>
                      <td colSpan="10" className="text-center text-muted bg-light">
                        Sin códigos encontrados 
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      </DialogContent>
      <div className="modal-footer bg-light gap-2">
        <button type="button" className="btn btn-danger" onClick={onClose}>Cerrar</button>
      </div>
    </Dialog>
  )
}
export default CalculadoraC;