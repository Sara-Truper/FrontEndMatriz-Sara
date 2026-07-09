import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import { Link } from 'react-router-dom';
import ClientesService from '../../service/ClientesService';
import { CircularProgress, Stack } from '@mui/material';

function MenuFormatos() {
    const [loading, setLoading] = React.useState(false);
    const usuario = localStorage.getItem("username")

  const actualizar_Bases = async () => {
    setLoading(true);  
    try {
      await ClientesService.postArancel();
      await ClientesService.postFabricas();
      await ClientesService.postRevisados();
    } catch (err) {
      console.error("Error en la actualización:", err);
    } finally {
      alert("Bases Actualizadas");
      setLoading(false);
    }
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
    <div style={{padding:'2%'}}className="d-flex justify-content-start" >
      <Card style={{borderRadius:'22px', width: '15rem' }}>
        <Card.Body>
          <Card.Title>Formato TRIAL</Card.Title>
          <Card.Text>
                Trial
          </Card.Text>
        <Link  to="/record/formatotrial" className='btn btn-success'  style={{ backgroundColor:'#FF6620', marginLeft: '1%', display: 'inline-block',lineHeight: '2'}}> Ir...</Link>
        </Card.Body>
      </Card>
      <Card style={{borderRadius:'22px', width: '15rem' , marginLeft:'1%' }}>
        <Card.Body>
          <Card.Title>Formato REVISADOS</Card.Title>
          <Card.Text>
                Revisados
          </Card.Text>
        <Link  to="/record/formatorevisados" className='btn btn-success'  style={{ backgroundColor:'#FF6620', marginLeft: '1%', display: 'inline-block',lineHeight: '2'}}> Ir...</Link>
        </Card.Body>
      </Card>
      <Stack >
              <button onClick={()=>{actualizar_Bases()}} style={{display:usuario === "pruebaformatos" ? '' :'none' }} className='btn btn-success'>Actualizar bases 2</button>
      </Stack>
    </div>
  );
}

export default MenuFormatos