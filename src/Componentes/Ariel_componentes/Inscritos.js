import { Stack, Card, CardContent, Typography, Button, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientesService from "../../service/ClientesService";

function Inscritos() {
  const [estadoinicialTemp, setestadoinicialTemp] = useState([]);
  const location = useLocation();
  const estado = location.state || {};
  const navigate = useNavigate();
  const perfil = localStorage.getItem("username");

  useEffect(() => {
    temporaled();
  }, []);

  const eliminarUser = (e) => {
    const opcion = window.confirm(
      "¿Está seguro que desea eliminar al usuario " + e.target.value + "?"
    );

    if (opcion) {
      ClientesService.eliminarUserSesion(e.target.id)
        .then(() => {
          alert("Usuario " + e.target.value + " eliminado");
          traerUsersSesiones();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      alert("Usuario " + e.target.value + " NO eliminado");
    }
  };

  const temporaled = () => {
    setestadoinicialTemp(estado.estadotemporal);
  };

  const traerUsersSesiones = () => {
    ClientesService.traeUsuariosSesiones()
      .then((response) => {
        setestadoinicialTemp(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const capacitacionesStatus = (e) => {
    const ids = e.split(",").map(Number);

    const valorRegreso = ids.map((id) => {
      const encontrado = estado.sesionesbackend.find((item) => item.id === id);
      return encontrado ? encontrado.nombre_carpeta : "";
    });

    return valorRegreso.filter(Boolean).join(", ");
  };

  return (
    <Box sx={{ p: 3 }}>
      {perfil === "Ariel" && (
        <Button
          variant="contained"
          sx={{ mb: 2 }}
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
      )}
      <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: "green", fontWeight: "bold", mb: 2 }}
        >
          Eliminar Usuario
        </Typography>

        <Stack spacing={2}>
          {estadoinicialTemp.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 2,
                border: "1px solid #ccc",
                boxShadow: 1,
                p: 2,
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.usuario}
                    </Typography>
                    <span> Sesiones Agendadas:  </span>
                    <Typography variant="body2" color="text.secondary">
                      {capacitacionesStatus(item.capacitaciones_inscri)}
                    </Typography>
                  </Box>
                    <Button  id={item.id}
                    value={item.usuario}
                    variant="contained"
                    color="error"
                    onClick={eliminarUser}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Card>
    </Box>
  );
}

export default Inscritos;
