import React, { useEffect, useState } from 'react'; 
import {Stack ,Grid} from "@mui/material";
import ClientesService from '../../service/ClientesService';
import { default as ReactSelect, components } from "react-select";
import { useNavigate } from 'react-router-dom';

const Sesiones = () => {
const navigate = useNavigate();
const [state, setState] = useState({ optionSelected: null });
const [estadotemporal, setestadotemporal] = useState({})  
const [nuevoPost , setnuevoPost] = useState({});
const [editable , seteditable] = useState(false);
const [sumas, setSumas] = useState({});
const [sumasneg, setSumasneg] = useState({});
const [sesionesbackend,setsesionesbackend]= useState([]);
const [filtro, setFiltro] = useState('');
const [colaboradores, setColaboradores] = useState('');
const [archEdorNew, setarchEdorNew] = useState([]);
const [activoId, setActivoId] = useState(null); 
const [capacitaciones, setCapacitaciones ] = useState({
usuario:'',  
capacitaciones_inscri: '',
status_capa:'',
posicion:'',
});  
const guardarRegistro = (e) => {
  const nombre = e.target.name;
  setestadotemporal(prev =>
    prev.map(item => {
      if (item.status_capa.includes(nombre + "false")) {
        const nuevotexto = item.status_capa.replace(nombre + "false", nombre + "true" );
       ClientesService.postregistroSesion({
          ...item,
          status_capa: nuevotexto
        }).catch(console.log);
        return {
          ...item,
          status_capa: nuevotexto
        };
      }
      return item;
    })
  );     
      ClientesService.actualizarFechayDura(nuevoPost.id, nuevoPost).then(()=>{
           setarchEdorNew([])
             setActivoId(null)
           seteditable(false)

        }).catch((error)=>{
          console.log(error)
        }) 
  }

  const inscritos =()=>{
    navigate('/importaciones/inscritos' ,{
      state: {
       estadotemporal,
       sesionesbackend,
       sumasneg,
       sumas
      }
    })
  }

  const modifSS = (e)=>{
    setnuevoPost((prev) => ({
            ...prev, 
            [e.target.name] : e.target.value,
              id : e.target.dataset.id,
                id_c_arriba:  sesionesbackend[e.target.id].id_c_arriba,
              nombre_carpeta: sesionesbackend[e.target.id].nombre_carpeta
        }))

  };
const editar = (a) => {
    if (activoId === a.id ){
      setarchEdorNew([])
          setActivoId(null)
      seteditable(false)
        }else {
      setarchEdorNew(a)
      setActivoId(a.id)
    }
  }
const perfil = localStorage.getItem("username")

useEffect(()=>{
        colaborador();
        getsesiones();
        traerUsersSesiones();
},guardarRegistro);

const colaborador = ()=>{
  ClientesService.getAllUsuario().then((response)=>{
  
    for(let clave in response.data){
        if (response.data[clave].usuario === localStorage.getItem("username")){
          setColaboradores(response.data[clave].colaboradores);
          
        }
      }
  }).catch((error)=>{
    console.log(error)
  })
};  
    const getsesiones = ()=>{
        ClientesService.getSub_folders_documentos().then((response)=>{
          setsesionesbackend(response.data);
        }).catch((error)=>{
            console.log(error)
        })
    }
const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

const guardarReg = () => {
    const listacapas = capacitaciones.posicion.split(",");
    const estatusC = capacitaciones.status_capa.split(",");
   const alertaTexto = listacapas
     .map((item, index) => {
       return ( sesionesbackend[item].nombre_carpeta + " | "  + (estatusC[index].includes("false") ? "ON HOLD" : "OK"  )
       );
     })
     .join("\n");
  
    const opcion = window.confirm(alertaTexto + "\n" + "Las sesiones con estatus “On hold” se programarán cuando se reúna el mínimo de 5 participantes." + "\n" + "Si la sesión está a menos de 7 días de llevarse a cabo, tu registro se considerará para el siguiente grupo.");
      if (opcion) {

      if (state.optionSelected === null) {
        capacitaciones.usuario = localStorage.getItem("username");
      }
      const ciclo = state.optionSelected === null ? 1 : state.optionSelected.length
      for(let i =0 ; i <   ciclo ; i++){
        if (state.optionSelected !== null ){
           capacitaciones.usuario = state.optionSelected[i].value;
        }
         ClientesService.postregistroSesion(capacitaciones)
          .then(() => {
            traerUsersSesiones();
          })
          .catch((error) => {
            console.log(error);
          });
         }
         setState({ optionSelected: null })
    }
};

  const handleChange = (selected) => {
    setState({
      optionSelected: selected
    });
  };

const traerUsersSesiones = () => {
    ClientesService.traeUsuariosSesiones()
      .then((response) => {
        setestadotemporal(response.data)
        const data = response.data;
        const tempSumas = {};
        const tempSumasneg = {};        
        data.forEach((item) => {
          const lista = item.status_capa
            ?.split(",")
            .map((num) => num.trim())
            .filter(Boolean);
          lista?.forEach((valor) => {
            const texto = valor
            const numero = parseInt(texto.match(/\d+/)[0]);
            const sinNumero = texto.replace(/\d+/g, "");
          if(sinNumero === "true"){
                tempSumas[numero] = (tempSumas[numero] || 0) + 1;
          }else{
                tempSumasneg[numero] = (tempSumasneg[numero] || 0) + 1;                        
          }
          });
        });
      setSumas(tempSumas);  
      setSumasneg(tempSumasneg);

      })
      .catch((error) => {
        console.log(error);
      });
  };

 const addCapacitaciones = (e) => {
  const { id, name, checked, value } = e.target;

  if (name === "capacitaciones_inscri") {
    setCapacitaciones((prev) => {
      const nuevaPosicion =  (prev.posicion ? prev.posicion + "," : "") + value;
      const inscrifecha = prev.status_capa || "";
      const estatuslista = inscrifecha
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      const inscri = prev.capacitaciones_inscri || "";
      const lista = inscri
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      let nuevaLista;
      let estatus;

      if (checked) {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 7);
        const fechalimite = hoy.toISOString().split("T")[0];

        if (
          sesionesbackend[e.target.value].fecha_sesion <= fechalimite ||
          sesionesbackend[e.target.value].fecha_sesion === null
        ) {
          estatus = [...estatuslista, id + "false"];
        } else {
          estatus = [...estatuslista, id + "true"];
        }

        if (!lista.includes(id)) {
          nuevaLista = [...lista, id];
        } else {
          nuevaLista = lista;
        }
      } else {
        nuevaLista = lista.filter((i) => i !== id);
        estatus = estatuslista.filter(
          (i) => i !== id + "true" && i !== id + "false"
        );
      }

      return {
        ...prev,
        posicion: nuevaPosicion, 
        capacitaciones_inscri: nuevaLista.join(","),
        status_capa: estatus.join(","),
      };
    });
  } else {
    setCapacitaciones((prev) => ({
      ...prev,
      [id]: value,
    }));
  }
};

const toNum = v => isNaN(Number(v)) ? 0 : Number(v);
 const listaColaboradores = colaboradores
      .split(',')
      .map(item => item.trim())
      .map(item => ({ value: item, label: item }));
return (
    <div  style={{ backgroundColor:'white' , marginLeft:'-8%', width:'120%'}} >
        <div style={{marginLeft:'4%'}}>
          <Stack sx={{padding:'1%'}} direction="row">
          <input onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar capacitación" />
          <span style={{marginLeft:'30%' , display:colaboradores.includes(",") ? '' : 'none'}} >Seleccionar Usuario a Inscribir</span>
          <span style={{marginLeft:'30%' , display:colaboradores.includes(",") ? 'none' : ''}} >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    {colaboradores.includes(",") ? (<ReactSelect 
        options={listaColaboradores}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        components={{Option }}
        onChange={handleChange}
        value={state.optionSelected}
      /> ) : null  }
          <button style={{marginLeft:'1%'}} className='btn btn-success' onClick={()=>{guardarReg()}} > Agendar sesiones </button>
          <button style={{marginLeft:'1%' , display:perfil === "Ariel"? '' : 'none'}} className='btn btn-warning' onClick={()=>{ inscritos() }} > Ver Incritos </button>
        </Stack>
      <h6 >Lista completa de capacitaciones</h6>
        <Stack sx={{outline:'dotted gray 1px' , borderRadius:'4px' , width:'90%' , backgroundColor:'#F9F9F9'}} direction='row'>
            <button onClick={() => setFiltro('')}  style={{backgroundColor:'transparent',width:'50%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{marginLeft:'1%',width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'black',color:'black'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>All </span></button>
            <button onClick={() => setFiltro(1)}  style={{backgroundColor:'transparent',width:'50%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{marginLeft:'1%',width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'#EF6221',color:'#EF6221'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Compras </span></button>
            <button  onClick={() => setFiltro(2)}  style={{backgroundColor:'transparent',width:'70%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'#4CAF50',color:'#4CAF50'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; Planeación de importaciones </span></button>  
            <button  onClick={() => setFiltro(3)}  style={{backgroundColor:'transparent',width:'50%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'#9C27B0',color:'#9C27B0'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; Confirmación </span></button>
            <button  onClick={() => setFiltro(4)}  style={{backgroundColor:'transparent',width:'50%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'#F8BBD0',color:'#F8BBD0'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; Mercadotecnia </span></button>
            <button  onClick={() => setFiltro(5)}  style={{backgroundColor:'transparent',width:'50%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'#b3b3b3ff',color:'#a0a0a0ff'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; Planta </span></button>
            <button  onClick={() => setFiltro(6)}  style={{backgroundColor:'transparent',width:'50%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'#FFEB3B',color:'#FFEB3B'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; Tiendas</span></button>
            <button  onClick={() => setFiltro(7)}  style={{backgroundColor:'transparent',width:'50%' , border:'none'}}><span style={{marginLeft:'1%'}}> <span style={{width:'12px',height:'12px', borderRadius:'4px',backgroundColor:'#2196F3',color:'#2196F3'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; Auditoria</span></button>
        </Stack>
 <Grid container spacing={2} sx={{ padding: '1%', width: '93%', marginLeft: '-2%' }} justifyContent="space-around">
  {sesionesbackend
    .sort((a, b) => a.id_c_arriba - b.id_c_arriba)
    .filter((item) =>
     filtro === '' ? item.nombre_carpeta?.toLowerCase().includes(filtro.toLowerCase()) : typeof filtro === "string" ? item.nombre_carpeta?.toLowerCase().includes(filtro.toLowerCase()) :
      item.id_c_arriba === Number(filtro)  
  )
    .map((item, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <span  style={{ display: 'flow', alignItems: 'initial', gap: '10px', borderRadius: '8px', width: '100%', height: '120px', backgroundColor: 
          item.id_c_arriba === 1 ? '#EF6221' : item.id_c_arriba === 2 ? '#4CAF50' : 
          item.id_c_arriba === 3 ? '#9C27B0' : item.id_c_arriba === 4 ? '#F8BBD0' : 
          item.id_c_arriba === 5 ? '#b3b3b3ff' : item.id_c_arriba === 6 ? '#FFEB3B' : 
          item.id_c_arriba === 7 ? '#2196F3' : item.id_c_arriba === 8 ? 'black' : 'black'
          , padding: '1%' , color: [4,5,6].includes(item.id_c_arriba) ? 'black':'white' }}>
        <div > 
          <label style={{ fontSize:'14px', position: 'relative', top: '10px', left:'78%', backgroundColor:'rgba(0, 0, 0, 0.5)', borderRadius:'4px',opacity:'98%' , color:'white'}}> 
            &nbsp; Inscritos: {   toNum(sumas[item.id]) + toNum(sumasneg[item.id]) }  &nbsp;</label>
          <br style={{display:sumasneg[item.id]>=5 ? '': 'none'}}></br>
  <Stack direction='row' sx={{position:'absolute' , padding:'2%', marginLeft:'20%'}}>
          <button style={{ display: ["Ariel","Lucero"].includes(perfil) ? '' : 'none' ,borderRadius:'20%', border:'solid grey 1px', backgroundColor:'transparent'}}
          onClick={() => editar(item)}      >
            ✏️
          </button>
          <button  onClick={(e)=>{guardarRegistro(e)}} id={`guardado${item.id}`} name={item.id}  style={{borderRadius:'20%', border:'solid grey 1px', backgroundColor:'transparent', display: activoId === item.id  ?  '' : 'none'}} >
            💾
          </button>
    </Stack>
          <input name='capacitaciones_inscri' id={item.id} style={{  marginLeft:sumasneg[item.id]>=5 ?'0%': '-10%'}} 
          value={index}  type="checkbox" onChange={(e)=>{ addCapacitaciones(e) }} />
            <span style={{ display: perfil === "Ariel" ? sumasneg[item.id]>=5 ? '' : 'none' : 'none',color: 'black', marginLeft:'2%',  backgroundColor:'yellow'}}>Agendar Sesion</span>
          <p style={{ marginLeft:'0%',maxWidth:'70%' , fontSize:'12px'}}>
            <input disabled={true} style={{ backgroundColor:'transparent', border:'none', color: [4,5,6].includes(item.id_c_arriba) ? 'black':'white', width:`${item.nombre_carpeta?.length * 7}px`}} value= {item.nombre_carpeta}  />  
            <input key={index} name='duracion' data-id={item.id} id={index} disabled={activoId === item.id ? false : true}  style={{ backgroundColor:activoId === item.id ? 'grey' : 'transparent', border:'none', color: [4,5,6].includes(item.id_c_arriba) ? 'black':'white', width:item.duracion === null ? activoId === item.id ? '100px': '1px' : `${item.duracion?.length * 8}px`}}  onChange={(e)=>{ modifSS(e)}} defaultValue={item.duracion !== null ? " (" + item.duracion + ") " : "" }/>   
            <span> {item.capacitador}</span>
            <br></br>
            <span style={{ padding:'2%', fontSize:'12px'}}> 
              <b>Fecha de sesión: </b>
              <input key={index} data-id={item.id} id={index} name='fecha_sesion' type={activoId === item.id  ?  'date' : 'text'} disabled={activoId === item.id  ?  false : true} style={{  backgroundColor: activoId === item.id  ?  'grey' : 'transparent', border:'none' , color: [4,5,6].includes(item.id_c_arriba) ? 'black':'white'}}  onChange={(e)=>{ modifSS(e)}} 
              defaultValue={item.fecha_sesion !== null  ? new Date(item.fecha_sesion + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric'})   : "Por definir"}/> 
            </span>
          </p>
  </div>
        </span>
      </Grid>
    ))}
</Grid>
   </div>
    </div>
  );
};

export default Sesiones;