import ClientesService from "../../service/ClientesService";

export const obtenerEstadoEnvio = (id,row ,value ) => {
    if (row.acuse === "CERRADA" || row.acuse === "CANCELADA") {
    return row.acuse;
  }
  if (
    ["R", "PPU", "MS", "X", "N/A"].includes(row.liberada_por_matrices) &&
    row.liberada_por_bu === "ACEPTADA" &&
    row.liberada_por_planeacion === "ACEPTADA"
  ) {
    if (row.qty === "MAL" || row.add_elim_item !== "N/A" || row.precio !== "OK") {
      if (row.liberada_por_auditoria === "ACEPTADA" && row.liberada_por_sap === "ACEPTADA") {
        return "ENVIO";
      } else {
        return "AUDITORIA/SAP";
      }
    } else {
    	  return "ENVIO";
    }
  }
  const grupoE = [
    "Mecánica 1",
    "Der. Petróleo 1",
    "Máquinas 2",
    "Htas. Manuales 1",
    "Volteck 1",
    "Volteck 2",
    "Volteck 3",
    "VOLTECK 1",
    "VOLTECK 2",
    "VOLTECK 3"
  ];
  if (!["R", "PPU", "MS", "X", "N/A"].includes(row.liberada_por_matrices)) {
    if (grupoE.includes(row.unidad_de_negocio)) {
      return "COMPRAS";
    } else {
      return "COMPRAS";
    }
  }
  if (row.liberada_por_bu !== "ACEPTADA") {
    if (grupoE.includes(row.unidad_de_negocio)) {
      return "COMPRAS";
    } else {
      return "COMPRAS";
    }
  }
  return "PLANEACION";
};


export const BUs_Piloto = (value,row) => {
  if (["Mecánica 1","Der. Petróleo 1","Máquinas 2","Htas. Manuales 1","VOLTECK 1","VOLTECK 2","VOLTECK 3","Volteck 1","Volteck 2","Volteck 3","VOLTECK 1", "VOLTECK 2", "VOLTECK 3"].includes(row.unidad_de_negocio)){
             return false;
           }  else{
             return false;
           }
        
}    

export const LiberadaPorMatrices = async (row) => {
  if (row.precio === "OK" && row.condicion_de_matrices === "NAM") {
        return "N/A";
  }
   else if(row.precio === "OK" && row.condicion_de_matrices !== "NAM"){
    try {
      const response = await ClientesService.getCondMatrices(
        row.folio_tt,
        row.no_oc
      );
        
      return response.data.liberada_por_matrices === null ? null : response.data.liberada_por_matrices;
    } catch (err) {
    
      return "PRUEBA ERROR";
    }
     } 
   else if (row.unidad_de_negocio === "REFACCIONES") {
        return "N/ARefs";
  } else if (
    row.unidad_de_negocio !== "Der. Petróleo 1" &&
    (row.proveedor === "FORESTON TRADING PTE. ETD" ||
      row.proveedor === "LESMONT GLOBAL PTE LTD" ||
      row.proveedor === "LEARTBAR PARTNERS PTE. LTD")
  ) {
    
    return "N/AProv";
  } else {
    try {
      const response = await ClientesService.getCondMatrices(
        row.folio_tt,
        row.no_oc
      );
    
      return response.data.liberada_por_matrices === null ? null : response.data.liberada_por_matrices;
    } catch (err) {
          
      return "PRUEBA ERROR";
    }
  }
};

    