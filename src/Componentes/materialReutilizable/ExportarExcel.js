import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { anchos } from "./RangosReusables";

export const ExportarExcel = ({ columns = [], rows = [], fuente = "" }) => {
  const [rango, setRango] = useState({ inicio: "", fin: "" });

  const filtrarPorFecha = (data) => {
    const { inicio, fin } = rango;
    if (!inicio || !fin) return data;

    const desde = new Date(inicio);
    const hasta = new Date(fin);
    hasta.setHours(23, 59, 59, 999);

    return data.filter((r) => {
      const valor = r[fuente === "soc" ? "fecha_de_reciboactrlpos" : "fecha_inicio"];
      if (!valor) return false;
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

    const header = ws.addRow(columns.map((c) => c.headerName || c.field));
    header.eachCell((c) => {
      c.font = { bold: true };
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF999999" },
      };
      c.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    let datos = filtrarPorFecha(rows);
    const campoFecha = fuente === "soc" ? "fecha_de_reciboactrlpos" : "fecha_inicio";
    datos = [...datos].sort((a, b) => {
      const fechaA = new Date(a[campoFecha]);
      const fechaB = new Date(b[campoFecha]);
      if (isNaN(fechaA) || isNaN(fechaB)) return 0;
      return fechaA - fechaB; 
    });
    datos.forEach((r) => {
      const fila = ws.addRow(
        columns.map((c) => {
          const val = r[c.field];
          if (
            c.field.toLowerCase().includes("fecha") ||
            c.field.toLowerCase().includes("env")
          ) {
            if (!val) return null;
            if (val === "2000-01-01" || val.startsWith("2000-01-01")) {
              return "N/A";
            }
            const fecha = new Date(val);
            if (isNaN(fecha)) return val;
            return fecha;
          }
          if (c.field.toLowerCase().includes("monto")) {
            return parseFloat(val || 0);
          }
          return val ?? "";
        })
      );

      fila.eachCell((cell, colNumber) => {
        const col = columns[colNumber - 1];
        if (
          col.field.toLowerCase().includes("fecha") ||
          col.field.toLowerCase().includes("env")
        ) {
          cell.numFmt = "dd/mm/yyyy";
        }
      });
    });

    ws.columns.forEach((col, i) => (col.width = anchos[i] ?? 15));

    const buffer = await wb.xlsx.writeBuffer();
    const nombre =
      rango.inicio && rango.fin
        ? `reporte_${rango.inicio}_a_${rango.fin}.xlsx`
        : `reporte_completo_${hoy.toLocaleDateString().replace(/\//g, "-")}.xlsx`;

    saveAs(new Blob([buffer]), nombre);
  };

  return (
    <div
      style={{ border: "dotted grey 1px" }}
      className="d-flex gap-2 align-items-center flex-wrap"
    >
      {["inicio", "fin"].map((t) => (
        <div key={t}>
          <input
          style={{display:localStorage.getItem('perfil') === "SeguimientoOC1" ? '' : 'none'}}
            type="date"
            className="form-control"
            value={rango[t]}
            onChange={(e) => setRango({ ...rango, [t]: e.target.value })}
          />
        </div>
      ))}
      <button
        className="btn btn-outline-primary"
        onClick={exportar}
        // disabled={!rows.length || !rango.inicio || !rango.fin}
      >
        Exportar Excel
      </button>
    </div>
  );
};
