<template>
    <div class="contenedorPrincipal">
        <div class="simulación3dias">
            <Title texto="Simulación de 3 días"/>
            <br>
            <div class="botones">
                <v-row>
                    <v-col>
                        <ModalInputFileUsuarios
                            :disabled="false"
                            v-on:importarDatos="subirBloqueos"
                            :cargando="cargaBloqueos"
                        />
                    </v-col>
                </v-row>
            </div>
            <p v-if="importoArchivos">Debe seleccionar una fecha y hora antes de empezar la simulación</p>
            <br>
            <br>
            <v-alert
                :value="hayAlerta"
                v-bind:type="tipoAlerta"
                transition="scale-transition"
            >
                {{textoAlerta}}
            </v-alert>
            <div class="fechaPicker">
                <DatePicker
                    v-bind:date="fechaInicio"
                    v-on:cambio-fecha="cambioFechaInicio"
                    texto="Fecha de inicio de simulación"
                />
                <TimePicker
                    v-bind:hour="horaInicio"
                    v-on:cambio-hora="cambioHoraInicio"
                    texto="Hora de inicio de simulación"
                />
            </div>
            <br>
            <div class="controlesSimulacion">
                <v-btn
                    class="mx-2"
                    fab
                    dark
                    small
                    color="#7434EB"
                    :disabled="importoArchivos"
                    @click="disminuyoVelocidad"
                >
                    <v-icon>mdi-rewind</v-icon>
                </v-btn>
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
                    @click="aumentoVelocidad"
                >
                    <v-icon>mdi-fast-forward</v-icon>
                </v-btn>
                <v-btn
                    elevation="2"
                    disabled=true
                    v-if="!importoArchivos"
                >
                    x{{velocidadSimulacion}}
                </v-btn>
                <v-progress-circular
                    indeterminate
                    color="7434EB"
                    v-if="cargandoSimulacion"
                >
                </v-progress-circular>
                <p style="color:#FF0000" v-if="sePasoDeIncremento">No se puede incrementar la velocidad más allá de x256</p>
                <p style="color:#FF0000" v-if="sePasoDeDecremento">No se puede disminuir la velocidad más allá de x1</p>
                <p style="color:#FF0000" v-if="cargandoDataBack">Cargando las rutas</p>
            </div>
            <br>
            <div class="mapa">
                <MapaSimulacion
                    :reanudoSimulacion="reanudoSimulacion"
                    :velocidadSimulacion="velocidadSimulacion"
                    :fechaInicioSim="fechaInicioEnvio"
                    v-on:cargandoSimulacion="cargandoSimul"
                    v-on:finSimulacion="finSimul"
                    v-on:faltaDeDataDeBack="faltaDataBack"
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
import MapaSimulacion from '../SimulacionTresDias/MapaSimulacion.vue'
import {
    setPedidosMasivo, setBloqueosMasivo, setConfiguracionDiaADia, setConfiguracionSimulacionTresDias, setFechaInicioSimulacion,
} from '../../../util/services/index';
import Title from '../../../shared/Title.vue';
import BackButton from '../../../shared/BackButton.vue';
import ModalInputFileUsuarios from "../../../shared/ModalInputFileUsuarios.vue";
import ModalInputFileAlumnos from "../../../shared/ModalInputFileAlumnos.vue";
import DatePicker from "../../../shared/DatePicker.vue";
import TimePicker from "../../../shared/TimePicker.vue";

export default {
    name: 'SimulacionTresDias',
    components: {
        BackButton,
        Title,
        ModalInputFileUsuarios,
        ModalInputFileAlumnos,
        MapaSimulacion,
        DatePicker,
        TimePicker,
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
            velocidadSimulacion:1,
            velocidadMinima:1,
            velocidadMaxima:4096,
            sePasoDeIncremento:false,
            sePasoDeDecremento:false,
            yaInicioSimulacion:false,

            fechaInicio:'',
            horaInicio:'',
            fechaInicioEnvio:'',

            cargandoSimulacion:false,
            cargandoDataBack:false,
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
            if(!this.yaInicioSimulacion){
                this.reanudoSimulacion=true;
                this.cargandoSimulacion=true;
                try {
                    let fechaIniAux=this.fechaInicio.split("-");
                    this.fechaInicioEnvio=fechaIniAux[0]+"-"+fechaIniAux[1]+"-"+fechaIniAux[2]+" "+this.horaInicio+":00";
                    let data=await setConfiguracionSimulacionTresDias(this.fechaInicioEnvio);
                    //let data2=await setFechaInicioSimulacion(this.fechaInicioEnvio);
                    console.log(data);
                    //console.log(data2);
                } catch (err) {
                    this.cargandoSimulacion=false;
                    console.log(err);
                }
                this.yaInicioSimulacion=true;
            }
        },
        disminuyoVelocidad(){
            if(this.velocidadSimulacion>this.velocidadMinima){
                this.velocidadSimulacion=this.velocidadSimulacion/2;
            }else{
                this.sePasoDeDecremento=true;
                setTimeout(()=>{
                    this.sePasoDeDecremento=false;
                },2000);
            }
        },
        aumentoVelocidad(){
            if(this.velocidadSimulacion<this.velocidadMaxima){
                this.velocidadSimulacion=this.velocidadSimulacion*2;
            }else{
                this.sePasoDeIncremento=true;
                setTimeout(()=>{
                    this.sePasoDeIncremento=false;
                },2000);
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
        cambioFechaInicio(dato){
            this.fechaInicio=dato;
            console.log(this.fechaInicio);
            this.importoPedidos=true;
        },
        cambioHoraInicio(dato){
            this.horaInicio=dato;
            console.log(this.horaInicio);
            this.importoBloqueos=true;
        },
        cargandoSimul(){
            this.cargandoDataBack=false;
            this.cargandoSimulacion=false;
        },
        finSimul(){
            alert("FIN DE LA SIMULACIÓN!");
        },
        faltaDataBack(){
            this.cargandoDataBack=true;
            this.cargandoSimulacion=true;
        }
    },
    computed:{
        importoArchivos:function(){
            return !(this.importoPedidos&&this.importoBloqueos);
        },
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
    .fechaPicker{
        width: 30rem;
    }
    .horaPicker{
        width: 30rem;
    }
</style>
