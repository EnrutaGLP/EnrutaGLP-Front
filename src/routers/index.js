import Vue from 'vue';
import Router from 'vue-router';
import Home from '../components/layout/Home/index.vue';

import EnrutaGLP from '../components/layout/EnrutaGLP/index.vue';
import Main from '../components/layout/Main/index.vue';
import ErrorNotFound from '../components/layout/ErrorNotFound/index.vue';
import Login from '../components/layout/Login/index.vue';

import Pedidos from '../components/layout/EnrutaGLP/Pedidos/index.vue';
import Mediciones from '../components/layout/EnrutaGLP/Mediciones/index.vue';
import MedicionesDetalle from '../components/layout/EnrutaGLP/Mediciones/MedicionesDetalle/index.vue';
import Evidencias from '../components/layout/EnrutaGLP/Mediciones/MedicionesDetalle/Evidencias/index.vue';
import PlanMedicion from '../components/layout/EnrutaGLP/PlanMedicion/index.vue';
import VerMedicion from '../components/layout/EnrutaGLP/PlanMedicion/VerMedicion/index.vue';
import OperacionDiaADia from '../components/layout/EnrutaGLP/OperacionDiaADia/index.vue';
import SimulacionTresDias from '../components/layout/EnrutaGLP/SimulacionTresDias/index.vue';
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
                    path: 'enruta-glp/',
                    name: 'EnrutaGLP',
                    component: EnrutaGLP,
                },
                {
                    path: 'enruta-glp/Pedidos/',
                    name: 'Pedidos',
                    component: Pedidos,
                },
                {
                    path: 'enruta-glp/OperacionDiaADia/',
                    name: 'OperacionDiaADia',
                    component: OperacionDiaADia,
                },
                {
                    path: 'enruta-glp/PlanMedicion/',
                    name: 'PlanMedicion',
                    component: PlanMedicion,
                },
                {
                    path:'enruta-glp/PlanMedicion/VerMedicion/:id',
                    name:'VerMedicion',
                    component: VerMedicion,
                },
                {
                    path: 'enruta-glp/Mediciones',
                    name: 'Mediciones',
                    component: Mediciones,
                },
                {
                    path: 'enruta-glp/Mediciones/MedicionesDetalle/:idMuestra',
                    name: 'MedicionesDetalle',
                    component: MedicionesDetalle,
                },
                {
                    path: 'enruta-glp/MedicionesDetalle/Evidencias',
                    name: 'Evidencias',
                    component: Evidencias,
                },
                {
                    path: 'enruta-glp/SimulacionTresDias',
                    name: 'SimulacionTresDias',
                    component: SimulacionTresDias,
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
