import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import { Link } from 'react-router-dom';
import ClientesService from '../../service/ClientesService';
import { CircularProgress, Stack } from '@mui/material';

function MenuSocMatriz() {
    const [loading, setLoading] = React.useState(false);

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
          <Card.Title>Matriz Control Documental</Card.Title>
          <Card.Text>
                M-CD
          </Card.Text>
        <Link  to="importaciones/controldocumental/matrizcd" className='btn btn-success'  style={{ backgroundColor:'#FF6620', marginLeft: '1%', display: 'inline-block',lineHeight: '2'}}> Ir...</Link>
        </Card.Body>
      </Card>
      <Card style={{borderRadius:'22px', width: '15rem' , marginLeft:'1%' }}>
        <Card.Body>
          <Card.Title>Seguimoento OC</Card.Title>
          <Card.Text>
                SOC
          </Card.Text>
        <Link  to="Soc" className='btn btn-success'  style={{ backgroundColor:'#FF6620', marginLeft: '1%', display: 'inline-block',lineHeight: '2'}}> Ir...</Link>
        </Card.Body>
      </Card>
    </div>
  );
}

export default MenuSocMatriz