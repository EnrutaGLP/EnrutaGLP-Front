<template>
    <div class="contenedorPrincipal">
        <div class="rubrica">
            <Title texto="Operaciones del día a día"/>
            <br>
            <div class="row">
                <div class="col sm-5">
                    <BackButton></BackButton>
                </div>
            </div>
            <div class="botones">
                <v-row>
                    <v-col>
                        <AveriasDialog
                            v-on:cambio="registroAveria"            
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
            <v-dialog
                v-model="dialog"
                max-width="700px"
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">{{tituloHojaDeRuta}}</span>
                    </v-card-title>
                    <v-form  ref="form">
                        <v-card-text>
                            <div class="hojaDeRutas" v-for="hojaDeRutaMostrar in hojaDeRuta">
                                <span><b>Hora de salida:</b> {{hojaDeRutaMostrar.horaSalida}}</span><br>
                                <span><b>Hora de llegada:</b> {{hojaDeRutaMostrar.horaLlegada}}</span><br>
                                <span><b>Consumo de Petróleo:</b> {{hojaDeRutaMostrar.consumoPetroleo}}m³</span><br>
                                <span>
                                    <b>Puntos:</b>
                                    <span v-for="punto in hojaDeRutaMostrar.puntos"> ({{punto.ubicacionX}},{{punto.ubicacionY}})</span>
                                </span><br>
                                <span v-if="hojaDeRutaMostrar.tipo==1"><b>Código del pedido:</b> {{hojaDeRutaMostrar.codigoPedido}}<br></span>
                                <span v-if="hojaDeRutaMostrar.tipo==1"><b>Cantidad de GLP entregada:</b>{{hojaDeRutaMostrar.cantidadEntregada}}m³<br></span>
                                <span v-if="hojaDeRutaMostrar.tipo==1"><b>Cantidad de GLP en el camión:</b> {{hojaDeRutaMostrar.cantidadGlp}}m³<br></span>
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
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-progress-circular indeterminate color="#7434EB" v-if="cargaRutas"></v-progress-circular>
            <br>
            <br>
            <v-alert
                :value="hayAlerta"
                v-bind:type="tipoAlerta"
                transition="scale-transition"
            >
                {{textoAlerta}}
            </v-alert>
            <div class="mapa">
                <MapaDiaADia
                    v-bind:averia="nuevaAveria"
                    v-on:cargoRutas="cargandoRutas"
                    v-on:mostrarHojaRuta="mostrarHojaDeRuta"
                />
                
            </div>
        </div>
    </div>
</template>

<script>
import MapaDiaADia from '../OperacionDiaADia/MapaDiaADia.vue';
import BloqueosDialog from '../OperacionDiaADia/BloqueosDialog.vue';
import {
    setAveria, setBloqueosMasivo, setConfiguracionDiaADia
} from '../../../util/services/index';
import Title from '../../../shared/Title.vue';
import BackButton from '../../../shared/BackButton.vue';
import AveriasDialog from './AveriasDialog/index.vue';
import ModalInputFileUsuarios from "../../../shared/ModalInputFileUsuarios.vue";


export default {
    name: 'Rubrica',
    components: {
        BackButton,
        Title,
        AveriasDialog,
        ModalInputFileUsuarios,
        MapaDiaADia,
        BloqueosDialog,
    },
    data() {
        return {
            dialog:false,

            tipoAlerta:"success",
            textoAlerta:"",
            hayAlerta: false,

            cargaBloqueos:false,
            cargaRutas:false,

            nuevaAveria:"",

            tituloHojaDeRuta:"",
            hojaDeRuta:[],
        };
    },
    methods: {
        mostrarHojaDeRuta(hojaDeRuta){
            console.log("saliendo del componente de mapa");
            console.log(hojaDeRuta);
            this.tituloHojaDeRuta="Hoja de ruta del camión "+hojaDeRuta[0].codigoCamion;
            this.hojaDeRuta=hojaDeRuta;
            this.dialog=true;
        },
        cargandoRutas(dato){
            this.cargaRutas=dato;
        },
        dioOk(){
            this.dialog=false;
        },
        async subirBloqueos(listaBloqueos){
            this.cargaBloqueos=true;
            console.log(listaBloqueos);
            try{
                let data=await setBloqueosMasivo(listaBloqueos);
                console.log(data);
                this.cargaBloqueos=false;
                this.manejarAlerta(0,1);
            }catch(err){
                this.cargaBloqueos=false;
                this.manejarAlerta(1,1);
            }
        },
        async registroAveria(dato){
            try {
                let hoy=new Date();
                let fecha;
                fecha=`${hoy.getDate()}`.padStart(2,'0')+"-"+`${hoy.getMonth()}`.padStart(2,'0')+"-"+
                hoy.getFullYear()+" "+`${hoy.getHours()}`.padStart(2,'0')+":"+`${hoy.getMinutes()}`.padStart(2,'0')+':11';

                let data=await setAveria(dato,fecha);
                console.log(data);
                if(data.data.status!="error"){
                    this.nuevaAveria=dato;
                    this.manejarAlerta(0,0);
                }else{
                    this.manejarAlerta(1,0);
                }
                this.manejarAlerta(0,0);
            } catch (err) {
                this.manejarAlerta(1,0);
            }
        },
        async registroBloqueo(bloqueo,fechaIniBloqueo,horaIniBloqueo,fechaFinBloqueo,horaFinBloqueo){
            console.log(bloqueo);
            console.log(fechaIniBloqueo);
            console.log(horaIniBloqueo);
            console.log(fechaFinBloqueo);
            console.log(horaFinBloqueo);
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.tipoAlerta="success";
                if(accion==0) {
                    this.textoAlerta="Se registró exitosamente la avería";
                }else if(accion==1){
                    this.textoAlerta="Se registraron los bloqueos";
                }
            }else {
                this.tipoAlerta="error";
                if(accion==0) {
                    this.textoAlerta="Hubo un error al registrar la avería";
                }else if(accion==1){
                    this.textoAlerta="Hubo un error al registrar los bloqueos";
                }
            }
            this.hayAlerta=true;
            setTimeout(() => {
                this.hayAlerta = false;
            }, 2000);
        },
    },

    async created() {
        try {
            let data=await setConfiguracionDiaADia();
            console.log(data);
        } catch (err) {
            console.log(err);
        }
    },
};
</script>
<style scoped>
    .botones{
        float:right;
    }
    .hojaDeRutas{
        font-size: 14px;
        margin: 10px;
        padding: 0.5rem;
    }
</style>