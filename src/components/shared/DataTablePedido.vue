<template>
    <v-data-table
        :headers="headers"
        :items="pedidos"
        :search="busqueda"
        sort-by="codigo"
        :loading="cargando"
        loading-text="Cargando pedidos"
        class="elevation-1"
    >
        <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-spacer></v-spacer>
                <v-dialog
                    v-model="dialog"
                    max-width="700px"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            color="#7434EB"
                            dark
                            class="mb-2"
                            v-bind="attrs"
                            v-on="on"
                        ><v-icon left>mdi-pencil-plus-outline</v-icon>
                            Nuevo Pedido
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-form  ref="form">
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                            v-model="editedItem.codigo"
                                            label="Código"
                                            :rules="[rules.required, rules.codigo]"
                                            counter
                                            maxlength="20"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" sm="6" md="8">
                                    <v-text-field
                                        v-model="editedItem.razonSocial"
                                        label="Razón social del cliente"
                                        :rules="[rules.required, rules.razonSocial]"
                                        counter
                                        maxlength="100"
                                    ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                            v-model="editedItem.glp"
                                            label="Cantidad de GLP (m^3)"
                                            :rules="[rules.required, rules.glp[0],rules.glp[1]]"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                            v-model="editedItem.posX"
                                            label="Coordenada X"
                                            :rules="[rules.required, rules.posX[0], rules.posX[1], rules.posX[2]]"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                            v-model="editedItem.posY"
                                            label="Coordenada Y"
                                            :rules="[rules.required, rules.posY[0], rules.posY[1], rules.posY[2]]"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" sm="6" md="8">
                                        <DatePicker
                                            v-bind:date="fechaEntrega"
                                            v-on:cambio-fecha="cambioFechaEntrega"
                                            texto="Fecha de entrega"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" sm="6" md="8">
                                        <TimePicker
                                            v-bind:hour="horaEntrega"
                                            v-on:cambio-hora="cambioHoraEntrega"
                                            texto="Hora de entrega"
                                        />
                                    </v-col>
                                </v-row>
                                <p v-if="noEstaEnElPlazo" style="color:red">{{mensajeError}}</p>
                            </v-card-text>
                        </v-form>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="var(--coral)"
                                outlined
                                @click="close"
                            ><v-icon left>mdi-close</v-icon>
                                Cancelar
                            </v-btn>
                            <v-btn
                                color="var(--turquoise)"
                                outlined
                                @click="save"
                            ><v-icon left>mdi-check</v-icon>
                                Guardar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-toolbar>
        </template>
        <template v-slot:no-data>
            No hay datos
        </template>
    </v-data-table>
</template>
<script>

import { setPedido } from '../util/services/index';
import DatePicker from "../../components/shared/DatePicker.vue";
import TimePicker from "../../components/shared/TimePicker.vue";

export default {
    props: [
        'pedidos',
        'busqueda',
        'cargando',
    ],
    components:{
        DatePicker,
        TimePicker,
    },
    data: () => ({
        dialog: false,
        headers: [
            { text: 'Código', value: 'codigo' },
            { text: 'Razón social cliente', value: 'razonSocial' },
            { text: 'GLP solicitado (m^3)', value: 'glp' , sortable: false },
            { text: '(X,Y)', value: 'posiciones' , sortable: false },
            { text: 'Fecha y hora de entrega', value: 'fechaHora' , sortable: false },
            { text: 'Estado', value: 'estado' , sortable: false },
        ],
        fechaEntrega:'',
        horaEntrega:'',
        editedIndex: -1,
        noEstaEnElPlazo:false,
        mensajeError:"La fecha de entrega debe estar al menos 4 horas adelante de la fecha actual",
        editedItem: {
            idPedido: -1,
            codigo: '',
            razonSocial:'',
            glp:'',
            posX:'',
            posY:'',
            fechaHora:'',
            estado:'',
            posiciones:'',
        },
        defaultItem: {
            idPedido: -1,
            codigo: '',
            razonSocial:'',
            glp:'',
            posX:'',
            posY:'',
            fechaHora:'',
            estado:'',
            posiciones:'',
        },
        rules:{
            required: value => !!value || 'No puede dejar campos vacíos',
            codigo:v=>v.length<=20 || 'Máximo 20 caracteres',
            razonSocial:v=>v.length<=100 || 'Máximo 100 caracteres',
            glp:[
                v => Number.isInteger(Number(v)) || 'Tiene que ser un número',
                v=>v>0 || 'Tiene que ser mayor que 0'
            ],
            posX:[
                v => Number.isInteger(Number(v)) || 'Tiene que ser un número',
                v=>v>0 || 'Tiene que ser mayor que 0',
                v=>v<100 || 'Posición fuera del mapa',
            ],
            posY:[
                v => Number.isInteger(Number(v)) || 'Tiene que ser un número',
                v=>v>0 || 'Tiene que ser mayor que 0',
                v=>v<100 || 'Posición fuera del mapa',
            ],
        },
    }),

    computed: {
        formTitle() {
            return "Agregar Pedido";
        },
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
    },

    created() {
        this.initialize();
    },

    methods: {
        initialize() {

        },
        close() {
            this.dialog = false;
            this.$refs.form.resetValidation();
            console.log(this.fechaEntrega);
            console.log(this.horaEntrega);
            this.$nextTick(() => {
                //this.editedItem = { ...this.defaultItem };
                this.fechaEntrega="";
                this.horaEntrega="";
                this.editedIndex = -1;
            });
        },
        save () {
            if(this.editedItem.codigo=="" || this.editedItem.razonSocial=="" || this.editedItem.glp=="" || this.editedItem.posX=="" || this.editedItem.posY=="" || this.fechaEntrega=="" || this.horaEntrega==""){
                
            }else{
                if(this.validarPedido(this.fechaEntrega,this.horaEntrega)){
                    this.anadirPedido(this.editedItem.codigo,this.editedItem.razonSocial,this.editedItem.glp,this.editedItem.posX,this.editedItem.posY,this.fechaEntrega,this.horaEntrega);
                    console.log(this.editedItem);
                    this.close();
                }else{
                    this.noEstaEnElPlazo=true;
                    setTimeout(()=>{
                        this.noEstaEnElPlazo=false;
                    },2000);
                    return;
                }
            }
        },
        validarPedido(fechaEntrega,horaEntrega){
            let fechaEntregaDate=new Date(fechaEntrega + " " + horaEntrega + ":00");
            let fechaActual=new Date();
            console.log(fechaEntregaDate);
            console.log(fechaActual);
            fechaActual.setHours(fechaActual.getHours()+4);
            if(fechaEntregaDate>=fechaActual){
                return true;
            }else{
                return false;
            }
        },
        verificarFormatoFecha(fecha){
            let fechaSplit=fecha.split
        },
        async anadirPedido(codigo,razonSocial,cantidadGLP,posX,posY,fechaEntrega,horaEntrega){
            try{
                let hoy=new Date();
                let fecha=hoy.getDate()+'-'+(hoy.getMonth()+1)+'-'+hoy.getFullYear();
                let hora=hoy.getHours()+':'+hoy.getMinutes()+':'+'11';
                let fechaPedido=fecha+' '+hora;
                let fechaEntregaAux=fechaEntrega.split('-');
                fechaEntrega=fechaEntregaAux[2]+'-'+fechaEntregaAux[1]+'-'+fechaEntregaAux[0];
                
                let fechaLimite=fechaEntrega+ ' ' + horaEntrega+':11';
                this.editedItem.fechaHora=fechaLimite;
                this.editedItem.estado="En cola";
                this.editedItem.posiciones="("+posX+","+posY+")";
                
                console.log(fechaPedido);
                console.log(fechaLimite);
                this.verificarFormatoFecha(fechaPedido);
                this.verificarFormatoFecha(fechaLimite);
                let data=await setPedido(codigo,razonSocial,cantidadGLP,posX,posY,fechaPedido,fechaLimite);
                let aux = this.editedItem;  
                console.log("aux:",aux);
                setTimeout(()=>{
                    this.pedidos.push(aux);
                },0);
                this.editedItem={...this.defaultItem};
                this.editedIndex=-1;
                this.$refs.form.resetValidation();
                console.log(data);
                this.manejarAlerta(0,0);
            }catch(err){
                this.manejarAlerta(1,0);
            }
        },
        manejarAlerta(tipo,accion){
            this.$emit("alerta",tipo,accion);
        },
        cambioFechaEntrega(dato){
            this.fechaEntrega=dato;
        },
        cambioHoraEntrega(dato){
            console.log(dato);
            this.horaEntrega=dato;
        }
    },
};
</script>

<style scoped>
    .ocultar{
        visibility: hidden;
    }
    .noOcultar{
        visibility: inherit;
    }
    .textoModalDelete{
        white-space: normal;
    }
</style>
