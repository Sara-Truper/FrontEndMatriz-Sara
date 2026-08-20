import React, { useEffect, useState } from 'react'

function Matriz_Planta() {
  const [segundos, setSegundos] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundos((prevSegundos) => [prevSegundos] + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []); 

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <p>Tiempo transcurrido: {segundos} segundos</p>
    </div>
  );
}

export default Matriz_Planta