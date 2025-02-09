export const navList = [
    {
        id: 0,
        name: 'Home',
        icon: 'mdi-home-outline',
        route: '/home',
        rol:  0,
        noAdmin: false,
  },
  {
        id: 1,
        name: 'Mantenimientos',
        icon: 'mdi-table-cog',
        route: '/mantenimientos',
        rol: 2,
        noAdmin: false,
  },
  {
        id: 2,
        name: 'Mediciones y Resultados',
        icon: 'mdi-tape-measure',
        route: '/mediciones-resultados',
        noAdmin: true,
        rol: 1,
  },
  {
        id: 3,
        name: 'Reportes',
        icon: 'mdi-file-chart-outline',
        route: '/reportes',
        noAdmin: true,
        rol: 2,
  },
  {
        id: 4,
        name: 'Planes de mejora',
        icon: 'mdi-sprout-outline',
        route: '/planes-mejora',
        noAdmin: true,
        rol: 2,
  },
];
