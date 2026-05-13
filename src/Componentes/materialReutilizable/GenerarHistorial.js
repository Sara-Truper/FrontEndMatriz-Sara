import { useState } from "react";
import ClientesService from "../../service/ClientesService";

const GeneraHistorial = (e, registro, registroanterior) => {
  const diffs = {};

  for (const key in registro) {
    if (!(key in registroanterior)) {
      diffs[key] = { registro: registro[key], registroanterior: undefined };
    } else if (registro[key] !== registroanterior[key]) {
      diffs[key] = { registro: registro[key], registroanterior: registroanterior[key] };
    }
  }
    let PO = registro.folio_tt;

  for (const key in registroanterior) {
    if (!(key in registro)) {
      diffs[key] = { registro: undefined, registroanterior: registroanterior[key] };
    }
  }
 Object.entries(diffs).forEach(([key, value]) => {
  if (key.includes("liberada_por") || key.includes,("envio_a_proveedor")){
        if (key.includes("liberada_por")) {
        if (registro[key.replace("liberada_por_", "fecha_")] === null && e !== "masivo"  ) {
          const opcion = window.confirm("¿Deseas usar la fecha actual?\nPresiona 'Cancelar' para usar N/A");
          registro[key.replace("liberada_por_", "fecha_")] = opcion ? new Date().toISOString().split('T')[0] + "T00:00:00" : "2000-01-01T00:00:00";
    }
        else if (key.includes("envio_a_proveedor")){

          registro["fecha_de_envio"] = 
            value === "" ? "" : new Date().toISOString().split('T')[0] + "T00:00:00";
            }else if(e === "masivo"){

            }
            else{
              registro[key.replace("liberada_por_", "fecha_")] = (registro[key] === "RECHAZADA" || registro[key] === "ACEPTADA") ? registro[key.replace("liberada_por_", "fecha_")]  : null ;
        }
         
     ClientesService.updatematrizcd(registro.id, registro).then(() => {
                // funcionfiltro();
             })
             .catch((error) => {
               console.log(error);
             });
      }
    }
   if (!key.toLowerCase().includes("fecha_inicio") && !key.toLowerCase().includes("fecha_revision")) {
    const vueltaJSON = {
      dato: e === "nuevo" ? "NUEVO REGISTRO" : key,
      actual:e === "nuevo" ? "" : value.registro,
      anterior:e === "nuevo" ? "" : value.registroanterior,
      usuario:e === "nuevo" ? "" : localStorage.getItem("username"),
      po: PO,
      fechaactualizacion: e === "nuevo" ? "" : new Date().toISOString()
    };
    if (e !== "nuevo") {
     ClientesService.postHistorial(vueltaJSON).then((response)=>{

     }).catch((error)=>{

       console.log(error)
     })
     }
  }
});
 const vueltaJSON = {
      dato: "NUEVO REGISTRO",
      actual:"",
      anterior:"",
      usuario:localStorage.getItem("username"),
      po: PO,
      fechaactualizacion: new Date().toISOString(),
    };
    if (e === "nuevo") { 
     ClientesService.postHistorial(vueltaJSON).then((response)=>{

     }).catch((error)=>{
 
      console.log(error)
     })
     }
};

export { GeneraHistorial };
