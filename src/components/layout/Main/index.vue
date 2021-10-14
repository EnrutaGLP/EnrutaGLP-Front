<template>
<v-toolbar-items>
        <v-tabs vertical>
            <div class="navBar" v-if="false">
                
                <img
                    id="logo"
                    src="../../assets/shared_images/logo_horizontal.png"
                    v-on:click="ocultarNavBar"
                />
                <!--<div class="contenedorRolUsuario">
                    <img
                        class="rolUsuario"
                        src="../../assets/shared_icons/userDocente.png"
                        v-if="acceso==1"
                    />
                    <img
                        class="rolUsuario"
                        src="../../assets/shared_icons/userCoodEspecialidad.png"
                        v-else-if="acceso<=3"
                    />
                    <img
                        class="rolUsuario"
                        src="../../assets/shared_icons/userCoordFacultad.png"
                        v-else-if="acceso<=6"
                    />
                    <img
                        class="rolUsuario"
                        src="../../assets/shared_icons/userAdmin.png"
                        v-else-if="acceso==7"
                    />
                </div>-->
                <br>
                <br>
                <div class="contenedorNombreUsuario">
                    <v-avatar
                        color="var(--wb3)"
                        size="65"
                    ><v-icon large v-if='fotoPerfil.length == 0'>mdi-account-circle</v-icon>
                    <v-img v-else :src="fotoPerfil"></v-img>
                    </v-avatar>
                </div>
                <br>
                <div class="contenedorNombreUsuario">
                    <div>{{nombreUsuario}}</div>
                </div>
                <div class="contenedorDescripcionRol">
                    <div>{{rol}}</div>
                </div>
                <router-link to="/reestablecerContrasena">
                    <a class="contenedorReestablecerContrasena">Reestablecer Contraseña</a>
                </router-link>
                <v-divider dark style="padding: 0.5rem"></v-divider>
                <router-link v-for="c in navList" :key="c.id" :to="c.route" class="linkDecoration">
                    <v-tab class="tab" v-if="(c.rol<=acceso) && !(acceso==7 && c.noAdmin)">
                        <v-icon left v-if="c.icon != null" color="var(--wb1)">
                            {{ c.icon }}
                        </v-icon>
                        {{ c.name }}
                    </v-tab>
                </router-link>
                <div class="logout">
                    <router-link to="/login" class="linkDecoration">
                        <v-tab class="tab" v-on:click="cerrarSesion">
                        <v-icon left color="white">
                            mdi-logout
                        </v-icon>
                            Cerrar Sesión
                        </v-tab>
                    </router-link>
                </div>
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
        cerrarSesion() {
            localStorage.setItem('acceso',0);
            localStorage.setItem('id_persona',0);
            localStorage.setItem('strRol','');
            localStorage.setItem('json','');
            sessionStorage.setItem('linkFoto','');
            // console.log("Window log out:", window);
            if(window.gapi?.auth2){
                var auth2 = window.gapi.auth2.getAuthInstance();
                auth2.signOut().then(() => console.log("¡Se cerró sesión correctamente!"));
            }
        },
        ocultarNavBar(){
            this.mostrarNavBar=!this.mostrarNavBar;
        }
    },
    created() {
        try{
            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
            this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
            
            this.nombreUsuario=this.datosUsuario.datos[0].personas.nombre;
            this.rol=this.datosUsuario.datos[0].personas.funcion.replace(/{/g, "").replace(/}/g, "").replace("", "").replace(/"/g, " ");

            

            if(sessionStorage.getItem('linkFoto')){
                this.fotoPerfil = sessionStorage.getItem('linkFoto');
                
            }
        }catch(err){

        }
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
