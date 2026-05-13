import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const ExportHistorial = ({ historialfull = [] }) => {
  const [rango, setRango] = useState({ inicio: "", fin: "" });

  const filtrarPorFecha = (data) => {
    const { inicio, fin } = rango;
    if (!inicio && !fin) return data;

    const desde = inicio ? new Date(inicio) : new Date("1970-01-01");
    const hasta = fin ? new Date(fin) : new Date();
    hasta.setHours(23, 59, 59, 999);

    return data.filter((r) => {
      const valor = r["registro"];
      if (!valor) return false;
      const fecha = new Date(valor);
      return !isNaN(fecha) && fecha >= desde && fecha <= hasta;
    });
  };
  const exportar = async () => {
    if (!historialfull.length) return;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Datos");
    ws.getCell("A1").value = `Fecha exportación: ${new Date().toLocaleDateString()}`;

    const datos = filtrarPorFecha(historialfull);

    const keys = Object.keys(datos[0] || {});

    const headerRow = ws.addRow(keys);
    
    datos.forEach((item) => {
      const fila = keys.map((key) => {
        const val = item[key];
        if (key === "registro") return val ? new Date(val) : null;
        if (key.toLowerCase().includes("monto")) return parseFloat(val || 0);
        return val ?? "";
      });

      const nuevaFila = ws.addRow(fila);

      keys.forEach((key, idx) => {
        if (key === "Registro") {
          nuevaFila.getCell(idx + 1).numFmt = "dd/mm/yyyy";
        }
      });
    });

    ws.columns.forEach((col) => (col.width = 20));

    const buffer = await wb.xlsx.writeBuffer();
    const nombre =
      rango.inicio && rango.fin
        ? `reporte_${rango.inicio}_a_${rango.fin}.xlsx`
        : `reporte_completo_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`;
    saveAs(new Blob([buffer]), nombre);
  };

  return (
    <div style={{ border: "dotted grey 1px", width: "50%", marginLeft: "2%" }} className="d-flex gap-2 align-items-center flex-wrap">
      {["inicio", "fin"].map((t) => (
        <div key={t}>
          <input
            type="date"
            className="form-control"
            value={rango[t]}
            onChange={(e) => setRango({ ...rango, [t]: e.target.value })}
          />
        </div>
      ))}
      <button className="btn btn-outline-secondary" onClick={exportar} disabled={!rango.inicio || !rango.fin}>
        Exportar Historial
      </button>
    </div>
  );
};
