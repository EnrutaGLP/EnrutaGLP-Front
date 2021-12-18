<template>
    <div class="contenedorPrincipal">
        <div class="simulación3dias">
            <Title texto="Simulación hasta el colapso logístico"/>
            <br>
            <div class="row">
                <div class="col sm-5">
                    <BackButton></BackButton>
                </div>
            </div>
            <div class="botones">
                <v-row> 
                    <v-col>
                        <ModalInputFileUsuarios
                            :disabled="false"
                            v-on:importarDatos="subirBloqueos"
                            :cargando="cargaBloqueos"
                        />
                    </v-col>
                    <v-col>
                        <v-btn
                            @click="eliminarRutas"
                        >
                            Eliminar rutas
                        </v-btn>
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
            <v-dialog
                v-model="dialog"
                max-width="700px"
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">{{tituloColapso}}</span>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="var(--turquoise)"
                            outlined
                            @click="descargarHojaDeRutas"
                        ><v-icon dark left>mdi-account-box-multiple-outline</v-icon>
                            Descargar
                        </v-btn>
                    </v-card-title>
                    <v-form  ref="form">
                        <v-card-text>
                            <div class="hojaDeRutas" v-for="hojaDeRutaMostrar in hojaDeRuta">
                                <h2><b>Camión:</b> {{hojaDeRutaMostrar.codigoCamion}}</h2><br>
                                
                                <span><b>Hora de salida:</b> {{hojaDeRutaMostrar.horaSalida}}</span><br>
                                <span><b>Hora de llegada:</b> {{hojaDeRutaMostrar.horaLlegada}}</span><br>
                                <span><b>Consumo de Petróleo:</b> {{hojaDeRutaMostrar.consumoPetroleo}}m³</span><br>
                                <span>
                                    <b>Puntos:</b>
                                    <span v-for="punto in hojaDeRutaMostrar.puntos"> ({{punto.ubicacionX}},{{punto.ubicacionY}})</span>
                                </span><br>
                                <span v-if="hojaDeRutaMostrar.tipo==1"><b>Código del pedido:</b> {{hojaDeRutaMostrar.codigoPedido}}<br></span>
                                <span v-if="hojaDeRutaMostrar.tipo==1"><b>Cantidad de GLP entregada:</b>{{hojaDeRutaMostrar.cantidadEntregada}}m³<br></span>
                                <span v-if="hojaDeRutaMostrar.tipo==1"><b>Cantidad de GLP del pedido:</b> {{hojaDeRutaMostrar.cantidadGlp}}m³<br></span>
                                <span v-if="hojaDeRutaMostrar.tipo==1"><b>Fecha y hora límite de entrega:</b> {{hojaDeRutaMostrar.fechaLimite}}<br></span>
                                <span v-if="hojaDeRutaMostrar.tipo==2"><b>Nombre de planta:</b> {{hojaDeRutaMostrar.nombrePlanta}}<br></span>
                                <span v-if="hojaDeRutaMostrar.tipo==2"><b>Cantidad de GLP recargada:</b> {{hojaDeRutaMostrar.cantidadRecargada}}m³<br></span>
                                <hr>
                            </div>
                        </v-card-text>
                    </v-form>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="var(--turquoise)"
                            outlined
                            @click="dioOk"
                        ><v-icon left>mdi-check</v-icon>
                            Ok
                        </v-btn>
                        <!--<v-btn
                            color="var(--turquoise)"
                            outlined
                            @click="descargarHojaDeRutas"
                        ><v-icon dark left>mdi-account-box-multiple-outline</v-icon>
                            Descargar
                        </v-btn>-->
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog
                v-model="dialogEliminarRutas"
                max-width="700px"
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">Rutas Eliminadas</span>
                    </v-card-title>
                    <v-form  ref="form">
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" sm="6" md="12">
                                    <p>Se eliminaron las rutas</p>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-form>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="var(--turquoise)"
                            outlined
                            @click="dioOkEliminarRutas"
                        ><v-icon left>mdi-check</v-icon>
                            Ok
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
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
                    @click="dioPausa"
                >
                    <v-icon>mdi-pause</v-icon>
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
                <p style="color:#FF0000" v-if="sePasoDeIncremento">No se puede incrementar la velocidad más allá de x4096</p>
                <p style="color:#FF0000" v-if="sePasoDeDecremento">No se puede disminuir la velocidad más allá de x1</p>
                <p style="color:#FF0000" v-if="cargandoDataBack">Cargando las rutas</p>
                <p v-if="llegoAlColapso">{{mensajeColapso}}</p>

            </div>
            <br>
            <div class="mapa">
                <MapaSimulacionColapso
                    :reanudoSimulacion="reanudoSimulacion"
                    :velocidadSimulacion="velocidadSimulacion"
                    :fechaInicioSim="fechaInicioEnvio"
                    v-on:cargandoSimulacion="cargandoSimul"
                    v-on:faltaDeDataDeBack="faltaDataBack"
                    v-on:llegoColapso="llegoColapsoLogistico"
                />
                
            </div>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
        </div>
    </div>
</template>

<script>
import MapaSimulacionColapso from '../SimulacionColapsoLogistico/MapaSimulacionColapso.vue'
import {
    setPedidosMasivo, setBloqueosMasivo, setConfiguracionSimulacionColapsoLogistico, setConfiguracionSimulacionTresDias, setFechaInicioSimulacion,
    deleteRutas
} from '../../../util/services/index';
import { DExcel } from '../../../util/reports/exportExcel';
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
        MapaSimulacionColapso,
        DatePicker,
        TimePicker,
    },
    data() {
        return {
            dialog:false,
            dialogEliminarRutas:false,
            
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

            llegoAlColapso:false,
            tituloColapso:"Fin de la simulacion",
            mensajeColapso:"",
            codigoColapso:"",

            hojaDeRuta:[],
            hojaDeRutaOrdenada:[],
        };
    },
    methods: {
        descargarHojaDeRutas(){
            try{
                DExcel("Hoja de rutas de la simulación hasta el colapso logístico","Hoja de rutas",null,this.hojaDeRuta);
            }catch(err){
                console.log(err);
            }
            this.dialog=false;
        },
        llegoColapsoLogistico(codigo,hojaDeRuta){
            console.log(hojaDeRuta);
            this.hojaDeRuta=hojaDeRuta;
            this.hojaDeRuta.sort(function (a,b){
                if(a.codigoCamion>b.codigoCamion){
                    return 1;
                }
                if(a.codigoCamion<b.codigoCamion){
                    return -1;
                }
                return 0;
            });
            for(let i=0;i<this.hojaDeRuta.length;i++){
                this.hojaDeRuta[i].horaSalida=this.cambiarFormatoFechaTaEspacio(this.hojaDeRuta[i].horaSalida);
                this.hojaDeRuta[i].horaLlegada=this.cambiarFormatoFechaTaEspacio(this.hojaDeRuta[i].horaLlegada);
                if(this.hojaDeRuta[i].tipo==1){
                    this.hojaDeRuta[i].fechaLimite=this.cambiarFormatoFechaTaEspacio(this.hojaDeRuta[i].fechaLimite);
                }
            }
            /*this.hojaDeRuta.sort(function (a,b){
                if(a.codigoCamion>b.codigoCamion){
                    return 1;
                }
                if(a.codigoCamion<b.codigoCamion){
                    return -1;
                }
                return 0;
            });
            let i=0;
            let j=0;
            let codigoCamionAux;
            while(i<this.hojaDeRuta.length){
                codigoCamionAux=this.hojaDeRuta[i].codigoCamion;
                this.hojaDeRutaOrdenada.push({
                    codigoCamion:codigoCamionAux,
                    datosHojaDeRuta:[],
                });
                while(codigoCamionAux==this.hojaDeRuta[i].codigoCamion){
                    console.log("xd");
                    this.hojaDeRutaOrdenada[j].datosHojaDeRuta.push(this.hojaDeRuta[i]);
                    i++;
                }
                j++;
            }*/
            this.codigoColapso=codigo;
            this.tituloColapso="Se llegó al colapso logístico";
            this.dialog=true;
        },
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
        dioOk(){
            this.dialog=false;
        },
        dioPausa(){
            this.reanudoSimulacion=false;
        },
        async dioPlay(){
            this.reanudoSimulacion=true;
            if(!this.yaInicioSimulacion){
                this.cargandoSimulacion=true;
                try {
                    let fechaIniAux=this.fechaInicio.split("-");
                    this.fechaInicioEnvio=fechaIniAux[0]+"-"+fechaIniAux[1]+"-"+fechaIniAux[2]+" "+this.horaInicio+":00";
                    let data=await setConfiguracionSimulacionColapsoLogistico(this.fechaInicioEnvio);
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
        faltaDataBack(){
            this.cargandoDataBack=true;
            this.cargandoSimulacion=true;
        },
        dioOkEliminarRutas(){
            this.dialogEliminarRutas=false;
        },
        async eliminarRutas(){
            try{
                const data=await deleteRutas();
                this.dialogEliminarRutas=true;
                console.log(data);
            }catch(err){
                console.log(err);
            }
        },
        cambiarFormatoFechaTaEspacio(fechaConT){
            let auxFechaArray=fechaConT.split("T");
            return auxFechaArray[0]+" "+auxFechaArray[1];
        },
    },
    computed:{
        importoArchivos:function(){
            return !(this.importoPedidos&&this.importoBloqueos);
        },
    },
    async created() {
        /*this.hojaDeRuta=[
            {
                id : 1,
                codigoCamion: "TA01", 
                horaSalida : "29-05-2021 15:59:33",
                horaLlegada : "30-05-2021 15:59:33",
                consumoPetroleo: 0.5, 
                puntos : [
                    {
                        ubicacionX : 12,
                        ubicacionY : 8
                    },
                    {
                        ubicacionX : 25,
                        ubicacionY : 8
                    }
                ],
                tipo: 1,
                codigoPedido : "ABCD1234",
                cantidadEntregada : 5,
                cantidadGlp: 20,
                fechaLimite: "30-05-2021 15:59:33",
                nombrePlanta : null,
                cantidadRecargada: null,
            },
            {
                id : 2,
                codigoCamion: "TA02", 
                horaSalida : "29-05-2021 15:59:33",
                horaLlegada : "30-05-2021 15:59:33",
                consumoPetroleo: 0.5, 
                puntos : [
                    {
                        ubicacionX : 12,
                        ubicacionY : 8
                    },
                    {
                        ubicacionX : 25,
                        ubicacionY : 8
                    },
                    {
                        ubicacionX : 25,
                        ubicacionY : 18
                    }
                ],
                tipo: 2,
                codigoPedido : null,
                cantidadEntregada : null,
                cantidadGlp: null,
                fechaLimite: null,
                nombrePlanta : "Principal",
                cantidadRecargada: 25,
            },
            {
                id : 3,
                codigoCamion: "TA01", 
                horaSalida : "29-05-2021 15:59:33",
                horaLlegada : "30-05-2021 15:59:33",
                consumoPetroleo: 0.5, 
                puntos : [
                    {
                        ubicacionX : 12,
                        ubicacionY : 8
                    },
                    {
                        ubicacionX : 5,
                        ubicacionY : 8
                    },
                    {
                        ubicacionX : 5,
                        ubicacionY : 18
                    }
                ],
                tipo: 2,
                codigoPedido : null,
                cantidadEntregada : null,
                cantidadGlp: null,
                fechaLimite: null,
                nombrePlanta : "Secundaria",
                cantidadRecargada: 12,
            },
        ];
        this.hojaDeRuta.sort(function (a,b){
            if(a.codigoCamion>b.codigoCamion){
                return 1;
            }
            if(a.codigoCamion<b.codigoCamion){
                return -1;
            }
            return 0;
        });*/
        /*let i=0;
        let j=0;
        let codigoCamionAux;
        while(i<this.hojaDeRuta.length){
            codigoCamionAux=this.hojaDeRuta[i].codigoCamion;
            this.hojaDeRutaOrdenada.push({
                codigoCamion:codigoCamionAux,
                datosHojaDeRuta:[],
            });
            while(codigoCamionAux==this.hojaDeRuta[i].codigoCamion){
                console.log("xd");
                this.hojaDeRutaOrdenada[j].datosHojaDeRuta.push(this.hojaDeRuta[i]);
                i++;
            }
            j++;
        }*/
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
    .hojaDeRutas{
        font-size: 14px;
        margin: 10px;
        padding: 0.5rem;
    }
</style>
