import axios from "axios";
// const Clientes_BASE_REST_API =  "http://172.18.2.87:8080/Recordatorios/importaciones/controldocumental";
const Clientes_BASE_REST_API =  "http://localhost:8082/importaciones/controldocumental";
// const Usuario_BASE_REST_API = "http://172.18.2.87:8080/Recordatorios/importaciones/usuarios/usuarios";
const Usuario_BASE_REST_API =  "http://localhost:8082/importaciones/usuarios/usuarios";
// const matrizcd_BASE_REST_API =   "http://172.18.2.87:8080/Recordatorios/importaciones/controldocumental/matrizcd";
const matrizcd_BASE_REST_API =  "http://localhost:8082/importaciones/controldocumental/matrizcd";
// const matrizcd_HISTORIAL =   "http://172.18.2.87:8080/Recordatorios/importaciones/controldocumental/historial";
const matrizcd_HISTORIAL =  "http://localhost:8082/importaciones/controldocumental/historial";
// const documentos_AUDIT =   "http://172.18.2.87:8080/Recordatorios/importaciones";
const documentos_AUDIT =  "http://localhost:8082/importaciones";
const LOG_API_BASE = "http://localhost:8082/imp"; 

class Clienteservice {
  getAllClientes() {
    return axios.get(Clientes_BASE_REST_API + "/matrizcd");
  }
  getcombProv(probBu){
    return axios.get(Clientes_BASE_REST_API + "/cambiobu/" + probBu)
  }
  createClientes(Clientes) {
    return axios.post(Clientes_BASE_REST_API + "/matrizcd", Clientes);
  }
  getClientesById(ClientesId) {
    return axios.get(Clientes_BASE_REST_API + "/matrizcd" + "/" + ClientesId);
  }
  updateClientes(ClientesId, Clientes) {
    return axios.put(Clientes_BASE_REST_API + "/matrizcd" + "/" + ClientesId, Clientes);
  }
  deleteClientes(ClientesId) {
    return axios.delete(Clientes_BASE_REST_API + "/matrizcd" + "/" + ClientesId);
  }

  getAllUsuario() {
    return axios.get(Usuario_BASE_REST_API);
  }
  createUsuario(Usuario) {
    return axios.post(Usuario_BASE_REST_API, Usuario);
  }
  getUsuarioById(UsuarioId) {
    return axios.get(Usuario_BASE_REST_API + "/" + UsuarioId);
  }
  getAllmatrizcd() {
    return axios.get(matrizcd_BASE_REST_API);
  }
  updatematrizcd(MatrizId, RegistroMatriz) {
    console.log(RegistroMatriz)
     return axios.put(matrizcd_BASE_REST_API + "/" + MatrizId, RegistroMatriz);
  }
  getnuevapo(OrdenC){
    return axios.get(matrizcd_BASE_REST_API + "/nuevapo/" + OrdenC);

  }
  getnuevapoNA(OrdenC){
    return axios.get(matrizcd_BASE_REST_API + "/nuevapo/new/" + OrdenC);

  }
  getmatrizporId(id){
    return axios.get(matrizcd_BASE_REST_API + "/" + id)
  }
  postHistorial(historial){
    return axios.post(matrizcd_HISTORIAL + "/nhist" , historial)
  }
  getHistorialById(HistId) {
    return axios.get(matrizcd_HISTORIAL + "/nhist/" + HistId);
  }
  getporUser(){
    return axios.get(matrizcd_BASE_REST_API + "/inicio/" + localStorage.getItem("username"));
  }

  getsocsR(registroSoc){
    return axios.get(Clientes_BASE_REST_API + "/seguimientooc/" + registroSoc)
  }

  postNuevoSOC(nuevosoc){
       return axios.post(Clientes_BASE_REST_API + "/seguimientooc/nuevaPO", [nuevosoc]);
  }
  putNuevoSOC(socID , NuevoSoc){
      return axios.put(Clientes_BASE_REST_API + "/seguimientooc/modPO/" + socID , NuevoSoc)    
  }

  getProveedor (noProveedor){
    return axios.get(Clientes_BASE_REST_API + "/proveedor/" + noProveedor)
  }

  getFamilia (Codigo){
    return axios.get(Clientes_BASE_REST_API + "/familia/" + Codigo)
  }

  getHistorialSoc(codigo){
    return axios.get(documentos_AUDIT + "/historialsoc/" + codigo)
  }

  postHistorialSOC(registro){
    return axios.post(documentos_AUDIT + "/historialsoc/generarHistSoc/", registro)
  }

  getdocumentos(){
    return axios.get(documentos_AUDIT + "/documentos/carpatasini")
  }

  getSub_folders_documentos(){
    return axios.get(documentos_AUDIT + "/documentos/folders")
  }
  actualizarFechayDura(id , docs){
    return axios.put(documentos_AUDIT + "/documentos/fechaydur/" + id , docs)
  }
  getallLink(){
    return axios.get(documentos_AUDIT + "/documentos/archivos/full" )
  }
  getarchivos(id_folders){
    return axios.get(documentos_AUDIT + "/documentos/archivos/" + id_folders)
  }

  postNuevoDoc(nuevoDoc){
    return axios.post(documentos_AUDIT + "/documentos/archivos/nuevoDoc" , nuevoDoc)
  }

  putDocumentos (idDoc, documento){
    return axios.put(documentos_AUDIT + "/documentos/archivos/nuevoDoc/" + idDoc , documento)
  }

  elimDocumentos (idDoc){
    return axios.delete(documentos_AUDIT + "/documentos/archivos/elimin/" + idDoc )
  }

  getSocHistorial(){
    return axios.get(Clientes_BASE_REST_API + "/soccompleto/")
  }
  getCondMatrices(folio , nooc){
  const url = Clientes_BASE_REST_API + "/condmatrices/" + folio + "/" + nooc;
  return axios.get(url);  
}
gethistSocFull(){
  return axios.get(documentos_AUDIT + "/historialsoc/histsoccompleto/")
}

traeUsuariosSesiones (){
  return axios.get(documentos_AUDIT + "/registrousers/consultar/")
}
postregistroSesion(registroaSesion){
  return axios.post(documentos_AUDIT + "/registrousers/registrarSesion" , registroaSesion)
}
eliminarUserSesion(id){
  return axios.delete(documentos_AUDIT + "/registrousers/eliminarUser/" + id)
}
getcontactosall(){
  return axios.get(Clientes_BASE_REST_API + "/contactos/all")
}

getproveedoresall (){
  return axios.get(Clientes_BASE_REST_API + "/proveedores/all")
}
getSocs() {
    return axios.get("http://localhost:8082/imp/socs");
}

getlogall() {
    return axios.get(`${LOG_API_BASE}/log-all`);
  }

  saveLog(datosLog) {
    return axios.put(LOG_API_BASE + "/guardar", datosLog);
  }
}
export default new Clienteservice();