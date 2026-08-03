import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import { Link } from 'react-router-dom';

function CuerpoOnboarding() {
return (
  <div >
    <div style={{padding:'1%' , marginLeft:'1%' ,display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap:'10px', textAlign:'left' , minWidth:'70%'  }} >
      <Card style={{borderRadius:'22px', width: '13rem' }}>
        <Card.Body>
          <Card.Title>Documentos</Card.Title>
          <Card.Text>
                Onboarding
          </Card.Text>
          <button className='btn btn-warning' style={{color:'white' , backgroundColor:'#ff6400'}}><Link to="/importaciones/AdmonDocs"  className='dropdown-item'><strong>Ir...</strong></Link></button>
        </Card.Body>
      </Card>
      <Card style={{borderRadius:'22px', width: '13rem' ,backgroundColor:'#e2e2e2ef'}}>
        <Card.Body>
          <Card.Title>Sesiones</Card.Title>
          <Card.Text>
                Onboarding
          </Card.Text>
          <button className='btn btn-warning' style={{color:'white' , backgroundColor:'#ff6400'}}><Link to="/importaciones/Sesiones"  className='dropdown-item'><strong>Ir...</strong></Link></button>
        </Card.Body>
      </Card>
      <Card style={{borderRadius:'22px', width: '13rem' }}>
        <Card.Body>
          <Card.Title>Documentos</Card.Title>
          <Card.Text>
                Onboarding
          </Card.Text>
          <button className='btn btn-warning' style={{color:'white' , backgroundColor:'#ff6400'}}><Link to="/importaciones/AdmonDocs"  className='dropdown-item'><strong>Ir...</strong></Link></button>
        </Card.Body>
      </Card>
      <Card style={{borderRadius:'22px', width: '13rem',backgroundColor:'#e2e2e2ef' }}>
        <Card.Body>
          <Card.Title>Sesiones</Card.Title>
          <Card.Text>
                Onboarding
          </Card.Text>
          <button className='btn btn-warning' style={{color:'white' , backgroundColor:'#ff6400'}}><Link to="/importaciones/Sesiones"  className='dropdown-item'><strong>Ir...</strong></Link></button>
        </Card.Body>
      </Card>
      <Card style={{borderRadius:'22px', width: '13rem' }}>
        <Card.Body>
          <Card.Title>Documentos</Card.Title>
          <Card.Text>
                Onboarding
          </Card.Text>
          <button className='btn btn-warning' style={{color:'white' , backgroundColor:'#ff6400'}}><Link to="/importaciones/AdmonDocs"  className='dropdown-item'><strong>Ir...</strong></Link></button>
        </Card.Body>
      </Card>
      <Card style={{borderRadius:'22px', width: '13rem' ,backgroundColor:'#e2e2e2ef'}}>
        <Card.Body>
          <Card.Title>Sesiones</Card.Title>
          <Card.Text>
                Onboarding
          </Card.Text>
          <button className='btn btn-warning' style={{color:'white' , backgroundColor:'#ff6400'}}><Link to="/importaciones/Sesiones"  className='dropdown-item'><strong>Ir...</strong></Link></button>
        </Card.Body>
      </Card>
    </div>
    {/* <section style={{marginTop:'2%',border:'1px solid #bdbdbdef' , height:'20rem' , backgroundColor:'white', borderRadius:'10px'}}>     </section>
*/}

  </div>  
  );
}

export default CuerpoOnboarding