<template>
    <div class="contenedorPrincipal">
        <div class="simulaciones">
            <Title texto="Simulaciones"/>
            <br>
            <div class="botones">
                <v-row>
                    <v-col>
                        <ModalInputFileAlumnos
                            :disabled="false"
                            v-on:importarDatos="subirPedidos"
                            :cargando="cargaPedidos"
                        />
                    </v-col>
                    <v-col>
                        <ModalInputFileUsuarios
                            :disabled="false"
                            v-on:importarDatos="subirBloqueos"
                            :cargando="cargaBloqueos"
                        />
                    </v-col>
                </v-row>
            </div>
            <p v-if="importoArchivos">Debe importar el archivo de pedidos y bloqueos antes de empezar la simulación</p>
            <br>
            <br>
            <v-alert
                :value="hayAlerta"
                v-bind:type="tipoAlerta"
                transition="scale-transition"
            >
                {{textoAlerta}}
            </v-alert>
            <div class="controlesSimulacion">
                <v-btn
                    class="mx-2"
                    fab
                    dark
                    small
                    color="#7434EB"
                    :disabled="importoArchivos"
                    @click="dioPlay"
                >
                    <v-icon>mdi-play</v-icon>
                </v-btn>
                <v-btn
                    class="mx-2"
                    fab
                    dark
                    small
                    color="#7434EB"
                    :disabled="importoArchivos"
                    @click="dioStop"
                >
                    <v-icon>mdi-stop</v-icon>
                </v-btn>
            </div>
            <br>
            <div class="mapa">
                <MapaDiaADia
                    esSimulacion=1
                    :reanudoSimulacion="reanudoSimulacion"
                />
                
            </div>
            <div class="row">
                <div class="col sm-5">
                    <BackButton></BackButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MapaDiaADia from '../Rubrica/MapaDiaADia.vue'
import {
    setPedidosMasivo, setBloqueosMasivo, setConfiguracionDiaADia, setConfiguracionSimulacionTresDias
} from '../../../util/services/index';
import Title from '../../../shared/Title.vue';
import BackButton from '../../../shared/BackButton.vue';
import ModalInputFileUsuarios from "../../../shared/ModalInputFileUsuarios.vue";
import ModalInputFileAlumnos from "../../../shared/ModalInputFileAlumnos.vue";

export default {
    name: 'Simulaciones',
    components: {
        BackButton,
        Title,
        ModalInputFileUsuarios,
        ModalInputFileAlumnos,
        MapaDiaADia,
    },
    data() {
        return {
            tipoAlerta:"success",
            textoAlerta:"",
            hayAlerta: false,

            cargaBloqueos:false,
            cargaPedidos:false,

            importoPedidos:false,
            importoBloqueos:false,

            reanudoSimulacion:false,
        };
    },
    methods: {
        async subirBloqueos(listaBloqueos){
            this.cargaBloqueos=true;
            console.log(listaBloqueos);
            try{
                let data=await setBloqueosMasivo(listaBloqueos);
                console.log(data);
                this.cargaBloqueos=false;
                this.importoBloqueos=true;
                this.manejarAlerta(0,1);
            }catch(err){
                this.cargaBloqueos=false;
                this.manejarAlerta(1,1);
            }
        },
        async subirPedidos(listaPedidos){
            this.cargaPedidos=true;
            console.log(listaPedidos);
            try {
                let data=await setPedidosMasivo(listaPedidos);
                console.log(data);
                this.cargaPedidos=false;
                this.importoPedidos=true;
                this.manejarAlerta(0,0);
            } catch (err) {
                this.cargaPedidos=false;
                this.manejarAlerta(1,0);
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.tipoAlerta="success";
                if(accion==0) {
                    this.textoAlerta="Se registró exitosamente los pedidos";
                }else if(accion==1){
                    this.textoAlerta="Se registraron los bloqueos";
                }
            }else {
                this.tipoAlerta="error";
                if(accion==0) {
                    this.textoAlerta="Hubo un error al registrar los pedidos";
                }else if(accion==1){
                    this.textoAlerta="Hubo un error al registrar los bloqueos";
                }
            }
            this.hayAlerta=true;
            setTimeout(() => {
                this.hayAlerta = false;
            }, 2000);
        },
        async dioPlay(){
            this.reanudoSimulacion=true;
            try {
                let data=await setConfiguracionSimulacionTresDias();
                console.log(data);
            } catch (err) {
                console.log(err);
            }
        },
        async dioStop(){
            this.reanudoSimulacion=false;
            try {
                let data=await setConfiguracionDiaADia();
                console.log(data);
            } catch (err) {
                console.log(err);
            }
        },
    },
    computed:{
        importoArchivos:function(){
            return !(this.importoPedidos&&this.importoBloqueos);
        }  
    },
    async created() {
        
    },
    mounted() {

    },
};
</script>
<style scoped>
    .botones{
        float:right;
    }
</style>
