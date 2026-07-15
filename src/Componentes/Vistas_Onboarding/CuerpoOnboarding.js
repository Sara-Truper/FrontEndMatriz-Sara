import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';

function CuerpoOnboarding() {
return (
    <div className="d-flex justify-content-start" >
      <Card style={{borderRadius:'22px', width: '18rem' }}>
        <Card.Body>
          <Card.Title>Titulo Segmento</Card.Title>
          <Card.Text>
                Documentos
          </Card.Text>
          <Button onClick={()=>{alert("Abriendo Documento")}} variant="primary" style={{backgroundColor:'#FF6400'}}>Ir... &nbsp;&nbsp;&nbsp;</Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CuerpoOnboarding