<template>
    <div class="contenedorPrincipal">
        <div class="mantenimiento">
            <Title texto="Mantenimientos" />
            <br />
            <div>
                <Card class="card"
                    title="Facultades"
                    :description="textoFacultades"
                    route="mantenimientos/Facultades/"
                    :imgSrc="Facultades"
                    v-if="(datosUsuario.facultades.length>0) || acceso>3"
                />
                <Card class="card"
                    title="Especialidades"
                    description="Visualiza las especialidades, permitiendo añadir, modificar o eliminar estas"
                    route="mantenimientos/Facultades/Especialidades"
                    :imgSrc="Especialidades"
                    v-if="datosUsuario.especialidaes.length>0 && !esAsistente"
                />
                <Card class="card"
                    title="Usuarios"
                    description="Visualiza los usuarios, permitiendo añadir, modificar o eliminar estos"
                    route="mantenimientos/Usuarios/"
                    :imgSrc="UsuarioSist"
                />
                <Card class="card"
                    title="Semestres"
                    description="Visualiza los semestres, permitiendo añadir, modificar o eliminar estos"
                    route="mantenimientos/Semestres/"
                    :imgSrc="Semestres"
                />
                <Card class="card"
                    title="Cursos"
                    description="Visualiza los cursos, permitiendo añadir, modificar o eliminar estos"
                    route="mantenimientos/Cursos/"
                    :imgSrc="Cursos"
                    v-if="(acceso>1) && (acceso!=7) && (datosUsuario.especialidaes.length>0 || datosUsuario.facultades.length>0)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import Facultades from '@/components/assets/shared_icons/facultad.png';
import UsuarioSist from '@/components/assets/shared_icons/usuario-sistema.png';
import Semestres from '@/components/assets/shared_icons/semestres.png';
import Cursos from '@/components/assets/shared_icons/cursos.png';
import Especialidades from '@/components/assets/shared_icons/especialidad.png';
import Title from '../../shared/Title.vue';
import Card from '../../shared/Card.vue';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'Mantenimientos',
    components: {
        Card,
        Title,
    },
    data() {
        return {
            Facultades,
            UsuarioSist,
            Semestres,
            Cursos,
            Especialidades,
            esAsistente:false,
            datosUsuario:{

            },
            textoFacultades:'',
            acceso: -1,
        };
    },
    created() {
        let acces = localStorage.getItem('acceso');
        if (!acces) {
            this.$router.push('/login');
        }
        this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
        this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
        if (this.acceso == 0) {
            this.$router.push('/login');
        } else if (this.acceso < 2) {
            this.$router.push('/home');
        }
        let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
        this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
        if(this.datosUsuario.datos[0].personas.funcion.includes("Asistente")){
            this.esAsistente=true;
        }
        if(this.acceso<7){
            this.textoFacultades="Visualiza las facultades para luego crear, editar y eliminar las especialidades de la facultad";
        }else{
            this.textoFacultades="Visualiza las facultades, permitiendo añadir, modificar o eliminar estas";
        }
        console.log(this.datosUsuario);
    }
};
</script>

<style scoped>
    .grupoCards {
        display: flex;
    }

    .card {
        margin: 2rem 0 0 2rem;
    }

    .medicionesResultado {
        max-width: 100vw;
    }

</style>
