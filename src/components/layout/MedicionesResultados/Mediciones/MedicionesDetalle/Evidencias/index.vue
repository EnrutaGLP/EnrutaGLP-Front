<template>
    <div class="contenedorPrincipal">
        <div class="evidencias">
            <Title texto="Mediciones > Evidencias"/>
            <div class="panel">
                <div class="contenidoPanel">
                    <table>
                        <tr>
                            <td>Actividad: </td>
                            <td>
                            <Select class="select"
                                texto="Seleccione una actividad"
                                v-on:cambio-seleccion="cambioActividad"
                                v-bind:items="actividadesEvaluacion"
                                item-text="nombre"
							    item-value="idActividad"
                            />
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="botonesSup">
                <v-progress-circular :value="40" indeterminate v-if="cargando"></v-progress-circular>
                <ModalInputFileEvidencias v-on:importarDatos="cargarArchivos"/>
            </div>
            <Alert
                v-bind:senalAlerta="senalAlerta"
                v-bind:textoAlerta="textoAlerta"
                v-bind:hayAlert="hayAlert"
            />
            <div>
                <EvidenciasDataTable
                    :headers="header"
                    :dataList="evidencias"
                    :editedItem="edited"
                    :defaultItem="edited"
                    :cargando="dctEvidCarg"
                    v-on:alerta="manejarAlerta"
                />
            </div>
            <div class="botonesInf">
                <BackButton />
            </div>
        </div>
    </div>
</template>


<script>
import Title from '../../../../../shared/Title.vue';
import Select from '../../../../../shared/Select.vue';
import BackButton from '../../../../../shared/BackButton.vue';
import ModalInputFileEvidencias from '../../../../../shared/ModalInputFileEvidencias.vue';
import EvidenciasDataTable from './EvidenciasDataTable/index.vue';
import * as CryptoJS from 'crypto-js';
import {
	getActividadesEvaluacionPorMuestra,
    subirEvidencia,
    getEvidencias,
    eliminarEvidencia,
    descargarEvidencia
} from "@/components/util/services/index";
import Alert from "@/components/shared/Alert.vue";

export default {
    name: 'Evidencias',
    components: {
        Title,
        Select,
        BackButton,
        ModalInputFileEvidencias,
        EvidenciasDataTable,
        Alert,
    },
    methods: {

    },

    data() {
        return ({
            header: [
                { text: 'Nombre', value: 'nombre', align: 'center', sortable: true},
            ],
            archivos: [],
            archivosAux: [],
            edited: {nombre: '', archivo: ''},
            evidencias: [],
            actividadesEvaluacion: [],
            acceso: -1,
            idActividadEvaluacion: -1,
            idMuestra: -1,
            textoAlerta:"",
            senalAlerta:'',
            hayAlert:false,
            cargando: false,
            dctEvidCarg: {},
        });
    },

    methods: {
        cambioActividad(value) {
              this.idActividadEvaluacion = value;
              this.getEvidenciasList();    
        },
        async cargarArchivos(archivosNuevos) {
            this.cargando = true;
            try{
                //this.archivosAux.push(archivosNuevos);
                //this.archivos = this.archivosAux;
                this.archivos = archivosNuevos;

                const resSE = await subirEvidencia(this.archivos, this.idMuestra, this.idActividadEvaluacion);
                const status = resSE.data.message;
                this.cargando=false;
                if(status=='Files succesfully processed'){
                    this.manejarAlerta(0,1);
                    //alert('Se subieron correctamente los evidencias');
                }
                else{
                    this.manejarAlerta(1,1);
                    //alert('No se subieron las evidencias');
                }
            }
            catch(e){
                this.cargando=false;
                console.log(e);
            }
            this.getEvidenciasList();
        },
        goBackDetalle() {
            this.$router.push({
                name: 'MedicionesDetalle',
            });
        },
        async getEvidenciasList(){
            const resGE = await getEvidencias(this.idMuestra, this.idActividadEvaluacion);  
            this.evidencias = resGE.data.evidencias; 
            this.dctEvidCarg = Object.assign({}, ...this.evidencias.map((x) => ({[x.id_evidencia + x.nombre]: false})));
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//descargar
                    this.textoAlerta="Se descargó exitosamente la evidencia";
                } else if (accion==1) {//subir
                    this.textoAlerta="Se subió exitosamente la evidencia";
                } else {//eliminar
                    this.textoAlerta="Se eliminó exitosamente la evidencia";
                }
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//descargar
                    this.textoAlerta='Hubo un error al descargar la evidencia';
                } else if(accion==1) {//subir
                    this.textoAlerta="Hubo un error al subir la evidencia";
                } else {//eliminar
                    this.textoAlerta="Hubo un error al eliminar la evidencia";
                }
            }
        },
    },

    watch: {
        //evidencias(){
          //  this.getEvidenciasList();
        //},
        //idActividadEvaluacion(){
            //this.getEvidenciasList();
        //}
    },

    async created() {
        let acces = localStorage.getItem('acceso');
        const data = this.$route.params;
        this.idMuestra = data.idMuestra;
        if (!acces) {
            this.$router.push('/login');
        }
        this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
        this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
        if (this.acceso == 0) {
            this.$router.push('/login');
        }

        const resAE = await getActividadesEvaluacionPorMuestra(this.idMuestra);
        this.actividadesEvaluacion = resAE.data.actividades;
        
    }
}

</script>


<style scoped>
@import '../../../../../assets/styles.css';
    .botonesSup {
        display: flex;
        justify-content: right;
    }

    .panel {
        background-color: var(--wb2);
        padding: .5rem;
        margin: 1rem 0 0 0;
        border-radius: .5rem;
        /*border-style: solid;
        border-width: 2px;
        border-color: var(--turquoise);*/
    }

    .select {
        padding-top: 1.5rem !important;
    }

    .contenidoPanel {
        margin: 1rem 2rem 0rem 2rem;
    }

    .botonesSup{
        margin: 2rem 0 1rem 0;
    }

    .botonesInf{
        margin: 1rem 0 1rem 0;
    }

    td {
        width: 150px;
        text-align: start;
    }


</style>