import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import { Link } from 'react-router-dom';
import onboarding from './learning-journey.png';
import process from './process.png';
import notification from './notification-bell.png';
import familytree from './family-tree.png';
import deadline from './deadline.png';
import procedure from './procedure.png';
import sap from './sap.png';
import { FoodBank, FormatColorText } from '@mui/icons-material';

function OnboardingCard({title,text,image,imageTitle, fontsize = '30px' ,width = "25rem",bgColor = "#ffffff",textColor = "#2E4D5B",href = "#"}) {

    return (
<div className='container-gral'>
    <div className="card-animation-layer">
        <Link to={href}style={{textDecoration: "none"}}>
                <Card classname="tarjeta-onboarding tarjeta-principal"
                style={{marginLeft: "-13%", width: width,height: "260px",textAlign: "center",color: textColor,backgroundColor: bgColor}}>
                    <Card.Body
                        style={{display: "flex",flexDirection: "column", height: "100%"}}>
                        <Card.Title>
                            <span style={{ fontSize: "25px" }}>{title}</span>
                        </Card.Title>
                    <Card.Text>{text}</Card.Text>
                        <div
                        style={{display: "flex", justifyContent: "center", alignItems: "flex-end", height: "129px"}}>
                            {image && ( /*Tamaño imagen 2das*/
                                <img src={image} alt={imageTitle} title={imageTitle} style={{width: "45%", maxHeight: "110px", objectFit: "contain"}}/> 
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Link>
        </div>
</div>
  );
}


function OnboardingCard2({title, text = "", image, imageTitle, width = "16rem", bgColor = "#ffffff", textColor = "#2E4D5B",href = "#"}) {

return (
    <div className='container-gral'>
        <div className="card-animation-layer"> 
        <Link to={href}style={{textDecoration: "none"}}>
            <Card className="tarjeta-onboarding tarjeta-principal"
                style={{borderRadius: "22px", width, height: "300px", textAlign: "center", color: textColor, backgroundColor: bgColor}}>
                <Card.Body style={{display: "flex",flexDirection: "column", height: "100%"}}>
                    <Card.Title>
                            <span style={{ fontSize: "25px" }}>{title}</span>
                    </Card.Title>
                    <Card.Text>{text}</Card.Text>
                    <div
                    style={{justifyContent: "center", alignItems: "flex-end", height: "100px",margin:"40px auto 0 auto"}}>
                        {image && (<img src={image} alt={imageTitle} title={imageTitle} style={{width: "45%", maxHeight: "350px", objectFit: "contain"}}/>)}
                        </div>
                </Card.Body>
            </Card>
        </Link>
        </div>
    </div>
  );
}

function OnboardingCard3({title, text = "", image, imageTitle, width = "16rem", bgColor = "#ffffff", textColor = "#2E4D5B",href = "#"}) {

return (
    <div className='container-gral'>
        <div className="card-animation-layer"> 
        <Link to={href}style={{textDecoration: "none"}}>
            <Card className="tarjeta-onboarding tarjeta-principal"
                style={{borderRadius: "22px", width, height: "300px", textAlign: "center", color: textColor, backgroundColor: bgColor}}>
                <Card.Body style={{display: "flex",flexDirection: "column", height: "100%"}}>
                    <Card.Title>
                            <span style={{ fontSize: "25px" }}>{title}</span>
                    </Card.Title>
                    <Card.Text>{text}</Card.Text>
                    <div
                    style={{justifyContent: "center", alignItems: "flex-end", height: "100px",margin:"10px auto 0 auto"}}>
                        {image && (<img src={image} alt={imageTitle} title={imageTitle} style={{width: "55%", maxHeight: "350px", objectFit: "contain"}}/>)}
                        </div>
                </Card.Body>
            </Card>
        </Link>
        </div>
    </div>
  );
}

function CuerpoOnboarding() {
    return (
    <div >
            <div style={{padding: "2%", display: "grid", gridTemplateColumns: "repeat(4, 3fr)", gap: "60px"}}>
                <OnboardingCard2 title="Onboarding"text=""image={onboarding}imageTitle="Onboarding"/>
                <OnboardingCard2 title="Documentación"text=""image={process} object-fit scale-down imageTitle="Documentación" bgColor="#2E4D5B" textColor="#fff"/>
                <OnboardingCard2 title="Recordatorios" text="" image={notification} imageTitle="Recordatorios"/>
                <OnboardingCard3 title="Formatos de cambio en sistema" text="" image={sap} imageTitle="Formatos de cambio en sistema" bgColor="#2E4D5B" textColor="#fff"/>
            </div>
            {/* Segunda sección */}
            <section style={{padding: "7%", display: "grid", height: "55%", gridTemplateColumns: "repeat(3, 0fr)",gap: "0px"}}>
                <OnboardingCard title="Organigrama" image={familytree} imageTitle="Organigrama" bgColor="#2E4D5B" textColor="#fff"/>
                <OnboardingCard title="Exámenes Pendientes" image={deadline} imageTitle="Exámenes Pendientes"/>
                <OnboardingCard title="Nuevo Documento" image={procedure} imageTitle="Nuevo Documento" bgColor="#2E4D5B" textColor="#fff"/>
            </section>
        </div>
    );
}

export default CuerpoOnboarding;