import React, { useEffect, useState } from 'react'

function Matriz_Planta() {
  const [segundos, setSegundos] = useState(false);
    const [ancho, setAncho] = useState(window.screen.width);
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundos((prevSegundos) => prevSegundos + 1); 
    }, 1000);
    return () => clearInterval(intervalo);
  }, []); 
  useEffect(() => {
    const detectarCambio = () => {
      setAncho(window.screen.width);
    };
      window.addEventListener("resize", detectarCambio);
    return () => {
      window.removeEventListener("resize", detectarCambio);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <p>Tiempo transcurrido: {segundos} segundos</p>
    <div>
      Ancho de pantalla: {Ancho}
    </div>
    </div>
  );
}

export default Matriz_Planta