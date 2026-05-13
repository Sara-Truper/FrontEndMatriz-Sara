import React, {useState, useNavigate, useEffect} from 'react';
import Clienteservice from '../service/ClientesService';
import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import image from '../BannerRecord.jpg';
import { height, margin, maxHeight, minHeight } from '@mui/system';
import { Box } from '@mui/joy';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './button.css' 

function LoginForm({Login, error}) {
    const [details, setDetails] = useState({username:"",password:""});
    const [usuarioinfo , setUsuarios]= useState({id:"",usuario:"",constrasena:"",perfil:""});
    
      const listarUsuarios =(e)=>{
        Clienteservice.getAllUsuario().then(response =>{
            const max = response.data.length
           for (let i = 0; i < max; i++) {
            if (response.data[i].usuario === details.username && response.data[i].constrasena === details.password) {
              Login(response.data[i]);
                {break;}
            }else if (i == max -1 ){
              // alert("usuario incorrecto ")            
            }
          }
        }).catch(error => {
          console.log(error);
        })
  
      }
    const NuevoUser  = (e) =>{
        usuarioinfo.usuario ="NuevoUser"    
    Login(usuarioinfo.usuario)
    }
    const handleKeyPress = (event) => {
      if(event.key === 'Enter'){
        listarUsuarios();
      }
    }
    const myStyle = {
      backgroundImage: `url(${image})`,
      backgroundRepeat: "round",
      width:"100%",
      height:"80vh",
      // opacity:0.9,
    };
      
  return (
<Stack style={{marginTop:"6%"}}>
<Stack  style={myStyle}>
<br></br>
<br></br>
    <Box style={{ opacity:0.8 , marginLeft:"32%",height:235,width:350,backgroundColor:'white'}} sx={{ borderRadius: '16px' }}>
        <div className='form-inner'>
              <h2>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Login</h2>
            {(error !="") ? ( <div className='error'>{error}</div>):""}
            <Stack  spacing={1} marginLeft='20%' marginRight='20%'>
                <TextField size='small' sx={{border:'#FF7536'}} id="outlined-basic" style={{backgroundColor:"#E9E9E9" }} type='text' name='username' placeholder='Usuario'  onChange={e => setDetails({...details, username: e.target.value})}  />
                <TextField size='small' id="outlined-basic" style={{ backgroundColor:'#E9E9E9'}} type='password' name='password' placeholder='Contraseña' autoComplete='on' onChange={e => setDetails({...details, password: e.target.value})} onKeyPress={handleKeyPress}  />
            </Stack>
            <br></br>
            <Stack marginLeft='20%' direction='row'>
            <Button variant='contained' style={{backgroundColor:'#FF7833'}} type='Submit' value="LOGIN" onClick={e => listarUsuarios(e)}>LOGIN</Button>
            &nbsp;&nbsp;
            <Button href='usuario' variant='contained' style={{ backgroundColor:'#FF7833'}} type='Submit' value="Nuevo Usuario" onClick={e => NuevoUser()}> <strong>Nuevo User</strong></Button>
            </Stack>
             </div>
    </Box>
    </Stack>
    </Stack>
  );
  }
  
export default LoginForm;