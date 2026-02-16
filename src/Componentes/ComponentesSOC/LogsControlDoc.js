import { DataGrid } from '@mui/x-data-grid'
import React, { useState , useRef} from 'react'

export default function LogsControlDoc({proveedores , contactos , logs }) {

  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("Ningún archivo");

  const handleClick = () => {
    fileRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    setFileName(file ? file.name : "Ningún archivo");
  };

  return (
    <div>
      <button type="button" onClick={handleClick}>
        Subir archivo
      </button>
      <span style={{ marginLeft: 10 }}>{fileName}</span>
      <input
        type="file"
        ref={fileRef}
        onChange={handleChange}
        hidden
      />
    </div>
  );
}
 