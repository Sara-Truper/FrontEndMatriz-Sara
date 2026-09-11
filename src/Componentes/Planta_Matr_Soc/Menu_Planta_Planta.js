import React from 'react'
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';

function Menu_Planta_Planta() {
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
    <div>
    <div style={{padding:'2%' , marginTop:'1%', border:'black 1px dotted', borderRadius:'8px'}}className="d-flex justify-content-start" >

      <Card style={{borderRadius:'22px', width: '15rem' }}>
        <Card.Body>
          <Card.Title>Calculadora PLANTA</Card.Title>
          <Card.Text style={{ whiteSpace: 'pre-line' }}>
                {"Calculadora 🖩"}
          </Card.Text>
        <Link  to="Calculadoraplanta" className='btn btn-success'  style={{ backgroundColor:'#FF6620', marginLeft: '1%', display: 'inline-block',lineHeight: '2'}}> Ir...</Link>
        </Card.Body>
      </Card>
    </div>
    </div>
  );
}


export default Menu_Planta_Planta