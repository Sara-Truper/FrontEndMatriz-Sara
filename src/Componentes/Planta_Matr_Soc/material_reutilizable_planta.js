

    export const gruposColsSocPlanta = [
      {
        groupId: 'sap',
        headerName: 'Fecha de Impresión de P.O. (SAP)',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
          { field: 'fecha_inicial_sap' },
          { field: 'fecha_final_sap' },
          { field: 'inicio_proceso_cd' },
          { field: 'tiempo_real_cd' },
        ],
        },
    {   groupId: 'colocacion',
        headerName: 'Colocación',
        headerClassName: "ama",
        headerAlign: 'center',
        children: [
     { field: 'fecha_inicial_colocacion'}, 
     { field: 'fecha_final_colocacion'}, 
     { field: 'tiempo_real_colocacion'}, 
     { field: 'comentarios_colocacion'}, 
    ]
     },
 { groupId: 'compras',
        headerName: 'Compras',
        headerClassName: "trial",
        headerAlign: 'center',
        children: [
     { field: 'fecha_inicial_compras'},
     { field: 'fecha_final_compras'}, 
     { field: 'tiempo_real_compras'}, 
     { field: 'comentarios_compras'}, 
        ]
     },
 { groupId: 'planeacion',
        headerName: 'Dirección de Planeación (Gibran/ Alberto)',
        headerClassName: "morado",
        headerAlign: 'center',
        children: [
     { field: 'fecha_inicial_planeacion'}, 
     { field: 'fecha_final_planeacion'}, 
     { field: 'tiempo_real_planeacion'}, 
     { field: 'comentarios_planeacion'}, 
             ]
     },

 { groupId: 'dircompras',
        headerName: 'Dirección de Compras (Sergio / Gte MP)',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
     { field: 'fecha_inicial_dircompras'}, 
     { field: 'fecha_final_dircompras'}, 
     { field: 'tiempo_real_dircompras'}, 
     { field: 'comentarios_dircompras'},
             ]
     },
  { groupId: 'dg_mp',
        headerName: 'Dirección General (GIL/DI MP)',
        headerClassName: "trial",
        headerAlign: 'center',
        children: [
     { field: 'fecha_inicial_mp'}, 
     { field: 'fecha_final_mp'}, 
     { field: 'tiempo_real_mp'}, 
     { field: 'comentarios_mp'}, 
                ]
     },

 { groupId: 'dg',
        headerName: 'Dirección General',
        headerClassName: "verde",
        headerAlign: 'center',
        children: [
     { field: 'fecha_inicial_dg'}, 
     { field: 'fecha_final_dg'}, 
     { field: 'tiempo_real_dg'}, 
     { field: 'comentarios_dg'}, 
                ]
     },
 { groupId: 'er',
        headerName: 'ER',
        headerClassName: "trial",
        headerAlign: 'center',
        children: [
     { field: 'enviada'}, 
     { field: 'er_comentario'}, 
]
      },
      { groupId: 'contactos',
        headerName: 'Contactos',
        headerClassName: "bu",
        headerAlign: 'center',
        children: [
     { field: 'comprador'}, 
     { field: 'confirmador'}, 
     { field: 'colocador'}, 
]
      },
    ];

   