import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { anchos } from "./RangosReusables";

export const ExportarExcelMATRIZ = ({ columns = [], rows = [], fuente = "" }) => {
  const [rango, setRango] = useState({ inicio: "", fin: "" });

  const campoFecha = fuente === "soc"
    ? "fecha_de_reciboactrlpos"
    : "fecha_inicio";
  const esCampoFecha = (field = "") =>
    field.toLowerCase().includes("fecha") || field.toLowerCase().includes("etd_");

  const parsearFecha = (val) => {
    if (!val) return null;
    if (val.startsWith("2000-01-01")) return "N/A";
    const fecha = new Date(val);
    return isNaN(fecha) ? val : fecha;
  };
  const filtrarPorFecha = (data) => {
    const { inicio, fin } = rango;
    if (!inicio || !fin) return data;

    const desde = new Date(inicio);
    const hasta = new Date(fin);
    hasta.setHours(23, 59, 59, 999);

    return data.filter((r) => {
      const valor = r[campoFecha];
      const fecha = new Date(valor);
      return !isNaN(fecha) && fecha >= desde && fecha <= hasta;
    });
  };
  const exportar = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Datos");
    const hoy = new Date();

    ws.getCell("A1").value = `Fecha exportación: ${hoy.toLocaleDateString()}`;
    ws.getCell("A1").font = { size: 14, bold: true };
    const header = ws.addRow(columns.map((c) => c.headerName ?? c.field));
    header.eachCell((c) => {
      c.font = { bold: true };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF999999" } };
      c.border = { top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" } };
    });
    const datos = [...filtrarPorFecha(rows)].sort((a, b) => {
      const A = new Date(a[campoFecha]);
      const B = new Date(b[campoFecha]);
      return (isNaN(A) || isNaN(B)) ? 0 : A - B;
    });

    datos.forEach((r) => {
      const fila = ws.addRow(
        columns.map(({ field }) => {
          const val = r[field];

          if (esCampoFecha(field)) return parsearFecha(val);

          return field.toLowerCase().includes("monto")
            ? parseFloat(val || 0)
            : val ?? "";
        })
      );

      fila.eachCell((cell, idx) => {
        const col = columns[idx - 1];
        if (esCampoFecha(col.field) && cell.value instanceof Date) {
          cell.numFmt = "dd/mm/yyyy";
        }
      });
    });

    ws.columns.forEach((col, i) => (col.width = anchos[i] ?? 15));

    const nombre = rango.inicio
      ? `reporte_${rango.inicio}_a_${rango.fin}.xlsx`
      : `reporte_${hoy.toLocaleDateString().replace(/\//g, "-")}.xlsx`;

    saveAs(new Blob([await wb.xlsx.writeBuffer()]), nombre);
  };

  return (
    <div className="d-flex gap-2 flex-wrap" style={{ border: "dotted grey 1px" }}>
      {["inicio", "fin"].map((t) => (
        <input
          key={t}
          type="date"
          className="form-control"
          style={{ display: localStorage.getItem("perfil") === "SeguimientoOC1" ? "" : "none" }}
          value={rango[t]}
          onChange={(e) => setRango({ ...rango, [t]: e.target.value })}
        />
      ))}
      <button className="btn btn-outline-primary" onClick={exportar}>
        Exportar Excel
      </button>
    </div>
  );
};