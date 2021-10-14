<template>
    <div class="containerHome">
        <v-img class="contenidoHome"
        aspect-ratio="1.75" dark
        gradient="to top right, rgba(50,115,30,.33), rgba(25,32,72,1)"
        src="../../assets/shared_images/imagenHome.jpg">
            <div class="fill-height bottom-gradient"></div>
            <p class="mensajeBienvenida">{{nombreUsuario}}, ¡bienvenido a CHRONOS: el sistema integral de gestión de acreditaciones!</p>
            <p class="descripcionSistema">CHRONOS es la plataforma que contempla el flujo completo de acreditaciones internacionales para las distintas facultades de la PUCP.</p>
            <v-btn
            elevation="8"
            large rounded
            class="btnGenially" target="_blank" href="https://view.genial.ly/6109c5da823b850d9c8299ef/dossier-sales-chronos-tutoriales">
                ¡Vea un tutorial interactivo!
                <v-icon right>mdi-link-variant</v-icon>
            </v-btn>
        </v-img>
    </div>
</template>

<script>
import ImagenHome from '../../assets/shared_images/imagenHome.jpg';
import Card from '../../../components/shared/Card.vue';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'Home',
    components: {
        Card,
    },
    methods: {
    },
    data: () => ({
        ImagenHome,
        nombreUsuario:'',
        acceso:-1,
        datosUsuario:{

        },
    }),
    created() {
        try{    
            let acces = localStorage.getItem('acceso');
            if (!acces) {
                this.$router.push('/login');
            }
            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            if (this.acceso == 0) {
                this.$router.push('/login');
            }
            let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
            this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
            this.nombreUsuario=this.datosUsuario.datos[0].personas.nombre;
            
        }catch(err){

        }
    },
};
</script>

<style scoped>
    .ImagenHome{
        margin-top: 10%;
        margin-left: 2%;
        height: 100%;
        width: 45%;
        object-fit: cover;
    }
    .Illustration{
        display: block;
        margin-left: auto;
        margin-right: 0px;
        height: 45%;
        width: 45%;
    }
    .mensajeBienvenida{
        position: absolute;
        white-space: normal;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-weight: bold;
        font-size: 200%;
        top:13%;
        left:10%;
        width: 35rem;
    }
    .descripcionSistema{
        position: absolute;
        font-size: 120%;
        top:33%;
        left:10%;
        width: 30rem;
    }

    .btnGenially {
        position: absolute;
        font-size: 120%;
        top:49%;
        left:10%;
        width: 20rem;
    }

    .btnGenially:hover {
        border-radius: 0.8rem;
    }

    .bottom-gradient {
        background-image: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 200px);
    }

</style>
