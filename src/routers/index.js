import Vue from 'vue';
import Router from 'vue-router';
import Home from '../components/layout/Home/index.vue';
import Mantenimientos from '../components/layout/Mantenimientos/index.vue';
import MedicionesResultados from '../components/layout/MedicionesResultados/index.vue';
import Reportes from '../components/layout/Reportes/index.vue';
import Main from '../components/layout/Main/index.vue';
import ErrorNotFound from '../components/layout/ErrorNotFound/index.vue';
import Login from '../components/layout/Login/index.vue';

import ReporteRE from '../components/layout/Reportes/ReporteRE/index.vue';
import ReporteCursos from '../components/layout/Reportes/ReporteCursos/index.vue';
import ReporteHorario from '../components/layout/Reportes/ReporteHorario/index.vue';
import ReporteHistorico from '../components/layout/Reportes/ReporteHistorico/index.vue';
import ResultadosEstudiante from '../components/layout/MedicionesResultados/ResultadosEstudiante/index.vue';
import Mediciones from '../components/layout/MedicionesResultados/Mediciones/index.vue';
import MedicionesDetalle from '../components/layout/MedicionesResultados/Mediciones/MedicionesDetalle/index.vue';
import Evidencias from '../components/layout/MedicionesResultados/Mediciones/MedicionesDetalle/Evidencias/index.vue';
import IndicadoresDesempeno from '../components/layout/MedicionesResultados/ResultadosEstudiante/IndicadoresDesempeno/index.vue';
import PlanMedicion from '../components/layout/MedicionesResultados/PlanMedicion/index.vue';
import VerMedicion from '../components/layout/MedicionesResultados/PlanMedicion/VerMedicion/index.vue';
import Rubrica from '../components/layout/MedicionesResultados/Rubrica/index.vue';
import EstadoMediciones from '../components/layout/MedicionesResultados/EstadoMediciones/index.vue';
import Facultades from '../components/layout/Mantenimientos/Facultades/index.vue';
import Especialidades from '../components/layout/Mantenimientos/Facultades/Especialidades/index.vue';
import Usuarios from '../components/layout/Mantenimientos/Usuarios/index.vue';
import Semestres from '../components/layout/Mantenimientos/Semestres/index.vue';
import Cursos from '../components/layout/Mantenimientos/Cursos/index.vue';
import ReestablecerContrasena from '../components/layout/Login/reestablecerContrasena/index.vue';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login,
            
        },
        {
            path: '/reestablecerContrasena',
            name: 'ReestablecerContrasena',
            component: ReestablecerContrasena,
        },
        {
            path: '/',
            name: 'Main',
            component: Main,
            redirect: '/login',
            children: [
                {
                    path: 'home/',
                    name: 'Home',
                    component: Home,
                },
                {
                    path: 'mantenimientos/',
                    name: 'Mantenimientos',
                    component: Mantenimientos,
                },
                {
                    path: 'mantenimientos/Facultades',
                    name: 'Facultades',
                    component: Facultades,
                },
                {
                    path: 'mantenimientos/Facultades/Especialidades',
                    name: 'Especialidades',
                    component: Especialidades,
                },
                {
                    path: 'mantenimientos/Usuarios',
                    name: 'Usuarios',
                    component: Usuarios,
                },
                {
                    path: 'mantenimientos/Semestres',
                    name: 'Semestres',
                    component: Semestres,
                },
                {
                    path: 'mantenimientos/Cursos',
                    name: 'Cursos',
                    component: Cursos,
                },
                {
                    path: 'mediciones-resultados/',
                    name: 'MedicionesResultados',
                    component: MedicionesResultados,
                },
                {
                    path: 'mediciones-resultados/ResultadosEstudiante/',
                    name: 'ResultadosEstudiante',
                    component: ResultadosEstudiante,
                },
                {
                    path: 'mediciones-resultados/ResultadosEstudiante/IndicadoresDesempeno',
                    name: 'IndicadoresDesempeno',
                    component: IndicadoresDesempeno,
                },
                {
                    path: 'mediciones-resultados/Rubrica/',
                    name: 'Rubrica',
                    component: Rubrica,
                },
                {
                    path: 'mediciones-resultados/PlanMedicion/',
                    name: 'PlanMedicion',
                    component: PlanMedicion,
                },
                {
                    path:'mediciones-resultados/PlanMedicion/VerMedicion/:id',
                    name:'VerMedicion',
                    component: VerMedicion,
                },
                {
                    path: 'mediciones-resultados/Mediciones',
                    name: 'Mediciones',
                    component: Mediciones,
                },
                {
                    path: 'mediciones-resultados/Mediciones/MedicionesDetalle/:idMuestra',
                    name: 'MedicionesDetalle',
                    component: MedicionesDetalle,
                },
                {
                    path: 'mediciones-resultados/MedicionesDetalle/Evidencias',
                    name: 'Evidencias',
                    component: Evidencias,
                },
                {
                    path: 'mediciones-resultados/EstadoMediciones',
                    name: 'EstadoMediciones',
                    component: EstadoMediciones,
                },
                {
                    path: 'reportes/',
                    name: 'Reportes',
                    component: Reportes,
                },
                {
                    path: 'reportes/reporte-re/',
                    name: 'ReporteRE',
                    component: ReporteRE,
                },
                {
                    path: 'reportes/reporte-cursos/',
                    name: 'ReporteCursos',
                    component: ReporteCursos,
                },
                {
                    path: 'reportes/reporte-horario/',
                    name: 'ReporteHorario',
                    component: ReporteHorario,
                },
                {
                    path: 'reportes/reporte-historico/',
                    name: 'ReporteHistorico',
                    component: ReporteHistorico,
                },
            ],
        },
        {
            path: '/404',
            component: ErrorNotFound,
        },
        {
            path: '*',
            redirect: '/404',
        },
    ],
    mode: 'history',
});
