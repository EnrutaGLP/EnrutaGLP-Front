<template>
    <div class="contenedorPrincipal">
        <div class="listaUsuarios">
            <Title texto="Mantenimientos > Usuarios del Sistema" :usarBotonAyuda=true urlKey="usuarios"/>
            <br>
            <div class='containerTabla'>
                <CRUDDataTableUsuarios
                />
                <BackButton />
            </div>
        </div>
    </div>
</template>

<script>
import Title from '../../../shared/Title.vue';
import CRUDDataTableUsuarios from './CRUDDataTableUsuarios.vue';
import BackButton from '../../../shared/BackButton.vue';
import { getPersonas } from '../../../util/services/index';
import ModalInputFileUsuarios from "../../../shared/ModalInputFileUsuarios.vue";
import * as CryptoJS from 'crypto-js';

export default {
    name: 'Usuarios',
    components: {
        Title,
        CRUDDataTableUsuarios,
        BackButton,
        ModalInputFileUsuarios,
    },
    data: () => ({
        nombres:[],
        editedIndex: -1,
        editedItem: {
            idResultado: -1,
            codigo: '',
            descripcion: '',
        },
        defaultItem: {
            idResultado: -1,
            codigo: '',
            descripcion: '',
        },
        cargaUsuarios: false,
        acceso: -1,
    }),

    methods:{
        async showUsuarios(){
            /*try{
                let res = await getPropuestaMejora(this.$route.params.obj.codigo);
                //console.log(res);
                this.items = res.data.Mejoras;
            }
            catch(err){
                this.items = [
                    { codigo: 'PM1', descripcion: 'El sistema de evaluación requería una revisión y basado en los RE de la (a) a la (k) no respondía adecuadamente para medir la nueva agrupación de RE del 1 al 7' },
                    { codigo: 'PM2', descripcion: 'Los docentes requieren apoyo para resolver sus dudas con relación al uso de las plataformas virtuales' },
                ];
            }*/
        },

        async listNombres(){
            var n;
            for (n of this.items){
                this.nombres.push(n.nombres);
            }
            console.log(this.nombres);
        }
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
        //console.log(this.$route.params.obj);
        //this.showPropuestas();
    },

    mounted() {

    },
};
</script>

<style scoped>
    .registrarPropuestas{
        margin-left: 20px;
    }
    .containerNombre{
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        width: 300px;
        margin-left: 20px;
        margin-top: 0px;
        margin-bottom: 5px;
    }
    .filtrosNuevoPlanMejora{
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        width: 650px;
        margin-left: 20px;
        margin-top: 0px;
        margin-bottom: 5px;
    }
    .especialidadField{
        max-width: 200px;
    }
    .facultadField{
        max-width: 200px;
    }
    .containerTextArea{
        max-height: 70px;
    }
    .textArea{
        height: 70px;
        overflow-y: auto;
    }
</style>
