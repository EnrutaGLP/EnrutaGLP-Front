<template>
<v-toolbar-items>
        <v-tabs vertical>
            <div class="navBar" v-if="false">
                
                <img
                    id="logo"
                    src="../../assets/shared_images/logo_horizontal.png"
                    v-on:click="ocultarNavBar"
                />
                
                <div class="contenedorNombreUsuario">
                    
                </div>
                <br>
                <v-divider dark style="padding: 0.5rem"></v-divider>
                
            </div>
            <v-tabs-items class="contenidoPricipal">
                <v-card class="container">
                    <router-view />    
                </v-card>
            </v-tabs-items>
        </v-tabs>
</v-toolbar-items>
</template>

<script>
import { navList } from './navList';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'Main',
    components: {

    },
    data() {
        return {
            navList,
            acceso: -1,
            urlImagen: '../../assets/shared_icons/resultados-estudiante.png',
            rol:'',
            nombreUsuario:'',
            datosUsuario:{
                
            },
            fotoPerfil: '',
            mostrarNavBar:true,
        };
    },
    methods: {
        ocultarNavBar(){
            this.mostrarNavBar=!this.mostrarNavBar;
        }
    },
    created() {
        
    },
};
</script>

<style>
    @import '../../assets/styles.css';

    ::-webkit-scrollbar {
    display: none;
    }

    #logo {
    width: 100%;
    height: 15vh;
    }
    .contenedorRolUsuario{
        display: flex;
        justify-content: center;
        padding: 2rem 1rem 0rem 1rem;
    }
    .rolUsuario{
        width: 50%;
        height: 15vh;
    }
    .contenedorDescripcionRol{
        display: flex;
        justify-content: center;
        font-size: 90%;
        color: var(--wb2) !important;
        text-decoration-color: var(--dark-turquoise);
        padding-bottom: 1.5rem;
        white-space: normal;
        text-align: center;
    }

    .contenedorReestablecerContrasena{
        display: flex;
        justify-content: center;
        font-size: 80%;
        color: var(--blue) !important;
        text-decoration-color: var(--dark-turquoise) !important;
        margin-bottom: 1.5rem;
        white-space: normal;
        text-align: center;
    }

    .contenedorNombreUsuario{
        display: flex;
        justify-content: center;
        font-size: 130%;
        color: var(--wb2);
    }

    .flechaNavBar{
        font-size: 40px;
    }

    .navBar {
        height: 100vh;
        max-width: 16vw;
        text-align: start;
        justify-content: flex-start !important;
        background-color: var(--wb7);
    }

    .container {
        height: 100vh;
        bottom: 0;
        overflow-y: scroll;
        max-width: 100% !important;
        padding: 0px !important;
        background-color: var(--wb1pto5) !important;
    }

    .linkDecoration {
        text-decoration: none;
    }

    .contenidoPricipal {
        
    }

    .tab {
        display: flex;
        justify-content: flex-start !important;
        color: var(--wb2) !important;
    }

    .tab:hover::before{
        opacity: 0.30 !important;
    }

    .logout{
        position:absolute;
        bottom: 40px;
    }

    .footer {
        width: 100%;
        position: absolute;
    }
    

</style>
