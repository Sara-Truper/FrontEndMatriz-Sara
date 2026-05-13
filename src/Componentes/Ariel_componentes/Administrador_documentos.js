import React, { useEffect, useState } from 'react';
import styles from './Administrador_Documentos.module.css';
import ClientesService from '../../service/ClientesService';

const Administrador_Documentos = () => {
  const [openFolders, setOpenFolders] = useState({});
  const [nuevoDoc, setnuevoDoc] = useState('none')
  const [areas, setAreas] = useState([]);
  const [archEdorNew, setarchEdorNew] = useState([]);
  const [dataFiltrada, setDataFiltrada] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [subAreas, setSubAreas] = useState([]);
  const [areaestado,setareaestado] =useState([]);
  const almacenlocalusuario = localStorage.getItem('username')
  const [archivosabrir, setarchivosabrir] = useState([])
  const [espnuevo , setespnuevo] = useState ([])
  const [activoId, setActivoId] = useState(null); 
  useEffect(() => {
    listarCarpetas();
    iniciallinks();
  }, []);

  useEffect(() => {
  if (filtro.trim() === "") {
    setDataFiltrada(archivosabrir);
    return;
  }

  const filtrados = archivosabrir.filter(item =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  setDataFiltrada(filtrados);

}, [filtro, archivosabrir]);

  const listarCarpetas = () => {
    ClientesService.getdocumentos()
      .then((response) => {
        setAreas(response.data)
      })
      .catch((err) => console.log(err));

    ClientesService.getSub_folders_documentos()
      .then((rsp) => {
        setSubAreas(rsp.data)
      })
      .catch((err) => console.log(err));
  };

  const traerarchivos = (archivos) =>{
    ClientesService.getarchivos(archivos).then((resp)=>{
        setarchivosabrir(resp.data)
    }).catch((errr)=>{
      console.log(errr)
    })
  }
  const toggleFolder = (area) => {

    setOpenFolders({
  [area.carpeta_principal]: area.carpeta_principal,
    })
  };

  const iniciallinks = () =>{
    ClientesService.getallLink().then((response)=>{
        setarchivosabrir(response.data);
        setDataFiltrada(response.data);

    }).catch((error)=>{
      console.log(error)
    })
  }

  const editar = (a) => {
    if (activoId === a.id ){
      setarchEdorNew([])
          setActivoId(null)
    }else {
      setarchEdorNew(a)
      setActivoId(a.id)
    }
  }
  const NuevoDocumento = (a) =>{
        if (a.target.name === "nombre_carpeta"){
  const selected = a.target.options[a.target.selectedIndex];
          areas.forEach(element => {
            if (parseInt(selected.dataset.idarriba) === element.id){
                setareaestado(element);
                  setarchEdorNew((prev) => ({
              ...prev, 
              area : element.carpeta_principal,
          }))
            }});
            setarchEdorNew((prev) => ({
              ...prev, 
              onboarding : a.target.value,
              id_carpeta_principal: selected.dataset.idarriba,
                id_folder : selected.dataset.key,     
          }))
        }
        else{      
          setarchEdorNew((prev) => ({
      ...prev, [a.target.name] : a.target.value,
    }))};}

const EliminarDoc = (a) => {
  const idEliminar = a.target.name;
  const confirmar = window.confirm("¿Seguro que deseas eliminar este documento?");
  if (!confirmar) return; // si el usuario da "Cancelar", no hace nada
  ClientesService.elimDocumentos(idEliminar).then(() => {
      setarchivosabrir((prev) =>
        prev.filter((item) => item.id !== parseInt(idEliminar)));
    }).catch((error) => {
      console.error("Error al eliminar documento:", error);
    });
};

    const postOrPut = (a) => {
       if (a.target.name === "nuevo"){
         ClientesService.postNuevoDoc(archEdorNew).then((response)=>{
setarchivosabrir((prev) => {
  const existe = prev.some((item) => item.id === response.data.id);
  return existe ? prev.map((item) =>         item.id === response.data.id ? response.data : item)    : [...prev, response.data];});
           setarchEdorNew()
           setActivoId(null)
           setespnuevo([])
           setnuevoDoc('none')
         }).catch((error)=>{
           console.log(error)
         })
     }else{
         ClientesService.putDocumentos(archEdorNew.id, archEdorNew).then((response)=>{
setarchivosabrir((prev) =>  prev.map((item) =>    item.id === response.data.id ? response.data : item ));
           setarchEdorNew()
           setActivoId(null)
           setespnuevo([])
         }).catch((error)=>{
           console.log(error)
         })
  }
}
  return (
    <div>  
 <div style={{ backgroundColor: '#f2f2f2', minHeight: '100vh', padding: '10px' }}>
        <div  className={styles['adm-main-container']}>
        <div className={styles['adm-left-panel']}>
          <div className={styles['adm-section-title']}>Áreas</div>
          {areas.map((area) => (
            <div key={area.id}>
              <div
                className={styles['adm-folder']}
                onClick={() => toggleFolder(area)}
              >
                📁 {area.carpeta_principal}
              </div>
              {openFolders[area.carpeta_principal] && (
                <div
                  className={styles['adm-material-list']}
                  id={`material-list-${area.id}`}
                >
                  {subAreas
                    .filter((sub) => sub.id_c_arriba === area.id)
                    .map((subarea) => (
                      <div 
                        key={subarea.id}
                        id={subarea.id}
                        style={{ backgroundColor: 'lightblue' }}
                        className={styles['adm-folder']}
                        onClick={(a) => traerarchivos(a.target.id)}>
                        📂 {subarea.nombre_carpeta}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles['adm-right-panel']}>
          <div className={styles['adm-section-title']}>Búsqueda de archivo</div>
          <div className={styles['adm-search-section']}>
            <div>
              <label>Filtro General </label>
              <input type="text" id="filtroDocName" style={{width:'200%'}}  onChange={e => setFiltro(e.target.value)} />
            </div>

            {/* <div> */}
              {/* <label>Capacitador</label>
              <input type="text" id="filtroTrainer" />
            </div>
            <div>
              <label>Onboarding</label>
              <input type="text" id="filtroOnboarding" />
            </div>
            <div>
              <label>Área</label>
              <select id="filtroArea">
                <option value="">Todas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.carpeta_principal}>
                    {area.carpeta_principal}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Dirección</label>
              <input type="text" id="filtroDireccion" />
            </div>
            <div>
              <label>Tipo</label>
              <select id="filtroTipo">
                <option value="">Todos</option>
                <option value="video">Video</option>
                <option value="Presentación">Presentación</option>
                <option value="proceso">Proceso</option>
                <option value="imagen">Imagen</option>
                <option value="pdf">PDF</option>
              </select> */}
            {/* </div> */}
            <button style={{ marginLeft:'50%', display: ["Ariel","Lucero"].includes(almacenlocalusuario) ?'' : 'none'}} className='btn btn-success btn-sm' onClick={()=>{ nuevoDoc === 'none'  ? setnuevoDoc('') : setnuevoDoc('none')  }}> Agregar + </button>
          </div>
{/* Nuevo Registro de documentos */}
  <div   key='nuevo' style={{ marginTop: '1%',  padding: '5px', display:nuevoDoc ,border:'solid #0c30ffff 1px'}} className={styles['adm-results-section']} id="resultados">
          <span>Nombre Documento</span>
            <input   style={{marginLeft:'10px'}}  id='nuevo'  name='nombre_archivo'  placeholder='Nombre del nuevo Documento' value={espnuevo.nombre_archivo} onChange={((a)=>{ NuevoDocumento(a) })}  />
                <span   style={{marginLeft:'10px'}} >Onboarding</span>
                <select  style={{marginLeft:'10px'}} name='nombre_carpeta' onChange={(a)=>{ NuevoDocumento(a)}} defaultValue={espnuevo.nombre_carpeta} >
                <option>-----</option>
                  {subAreas.map((area)=>(
                    <option  data-key={area.id} value={area.nombre_carpeta} data-idarriba={area.id_c_arriba}>{area.nombre_carpeta}</option>                 
                ))}
                </select>
                <br ></br>
                <label style={{marginTop:"2%"}} for='capacitador'> Capacitador</label>
                <input id='capacitador' name='capacitador' type='text' onChange={(a)=>{ NuevoDocumento(a)}} placeholder='responsable de capacitación' value={espnuevo.capacitador}/>
                <label for='area'> Area</label>
                <input disabled id='area' name='Area' type='text'  value={areaestado.carpeta_principal} />

                <label for='direccion'> Direccion</label>
                  <select id='direccion' name='direccion' onChange={(a)=>{ NuevoDocumento(a)}} value={espnuevo.direccion} >
                    <option>------</option>
                   <option>Importaciones</option>
                   <option>Planeación de importaciones</option>
                   <option>Logistica y comercio exterior</option>
                   <option>Calidad</option>
                   <option>Planeación de abasto sucursales, mayoreo y tiendas FIX</option>
                   <option>Coberturas de inventario</option>
                   <option>Mercadotecnia</option>
                   <option>Operaciones</option>
                   <option>Comunicación / DC</option>
                   <option>Administración</option>
                   <option>Finanzas</option>
                  </select>
                <label for='tipo'> Tipo</label>
                  <select id='tipo' name='tipo' onChange={(a)=>{ NuevoDocumento(a)}} value={espnuevo.tipo} >
                    <option>------</option>
                    <option>Procedimiento Específico</option>
                    <option>Procedimiento General</option>
                    <option>Políticas</option>
                    <option>Instructivo</option>
                    <option>Formato</option>
                    <option>Registro </option>
                    <option>Evidencia</option>
                    <option>Reglamento</option>
                    <option>Presentación</option>
                    <option>Organigrama</option>
                    <option>Check-List</option>
                    <option>Video</option>
                    <option>Resumen ejecutivo</option>
                  </select>
    <br />
    <span  ><b>Link: &nbsp;</b></span><input name='link' style={{marginTop:'1%'}} onChange={((a)=>{ NuevoDocumento(a) })} value={espnuevo.link}  placeholder='pega el link de tu archivo' />
    <button name='nuevo' style={{borderRadius:'20%', border:'solid grey 1px', backgroundColor:'transparent', marginLeft:'20%'}} onClick={(a)=>{ postOrPut(a)}}>
      💾
    </button>
  </div>
{dataFiltrada.map((archivo, index) => (
  <div   key={index} style={{ marginTop: '1%', border: activoId === archivo.id ? '2px solid blue' : 'none', padding: '5px' }} className={styles['adm-results-section']} id="resultados">
    <input id={archivo.id} style={{display: activoId === archivo.id ? '' : 'none'}} name='nombre_archivo' defaultValue={archivo.nombre_archivo} onChange={((a)=>{ NuevoDocumento(a) })}  />
    <strong style={{display: activoId === archivo.id ? 'none' : ''}}>{archivo.nombre_archivo}</strong><br></br>
    <span style={{ marginLeft: '1%' }}></span>

    <span style={{display: activoId === archivo.id ? '' : 'none'}}>
      Capacitador: <input name='capacitador' onChange={((a)=>{ NuevoDocumento(a) })}  defaultValue={archivo.capacitador} /> | 
      Onboarding: <input name='onboarding' onChange={((a)=>{ NuevoDocumento(a) })}  defaultValue={archivo.onboarding} /> | 
      Área: <input name='area' onChange={((a)=>{ NuevoDocumento(a) })}  defaultValue={archivo.area} />  <br></br> 
      Dirección: <input name='direccion' onChange={((a)=>{ NuevoDocumento(a) })}  defaultValue={archivo.direccion} / > | 
      Tipo: <input name='tipo' onChange={((a)=>{ NuevoDocumento(a) })}  defaultValue={archivo.tipo} / > </span>
    
    <span style={{display: activoId === archivo.id ? 'none' : ''}}> Capacitador: {archivo.capacitador} | Onboarding: {archivo.onboarding} |  Área: {archivo.area} | Dirección: {archivo.direccion} | Tipo: {archivo.tipo} </span>
    <br />
    <a style={{display: activoId === archivo.id ? 'none' : ''}} href={archivo.link} target='_blank' className={styles['adm-upload-button']} >
      Visualizar
    </a>
    <span style={{ display: activoId === archivo.id ? '' : 'none'}} ><b>Link: &nbsp;</b></span><input name='link' style={{marginTop:'1%', display: activoId === archivo.id ? '' : 'none'}} onChange={((a)=>{ NuevoDocumento(a) })}  placeholder='pega el link de tu archivo' />
    <button style={{ display: ["Ariel","Lucero"].includes(almacenlocalusuario) ?'' : 'none' ,borderRadius:'20%', border:'solid grey 1px', marginLeft:'80%',backgroundColor:'transparent'}}
    onClick={() => editar(archivo)}      >
      ✏️
    </button>
    <button  id={`guardado${archivo.id}`} name={archivo.id}  style={{borderRadius:'20%', border:'solid grey 1px', backgroundColor:'transparent',display: activoId === archivo.id ? '' : 'none'}} onClick={(a)=>{ postOrPut(a)}}>
      💾
    </button>
    <button  id={`guardado${archivo.id}`} name={archivo.id}  style={{borderRadius:'20%', border:'solid grey 1px', backgroundColor:'transparent',display: activoId === archivo.id ? '' : 'none'}} onClick={(a)=>{ EliminarDoc(a)}}>
      ❌
    </button>
  </div>
))}
        </div>
      </div>
    </ div>
    </div>
  );
};

export default Administrador_Documentos;
