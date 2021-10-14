<template>
    <v-data-table
        :headers    = "headers"
        :items      = "semestres"
        :search     = "busqueda"
        sort-by     = "nombre"
        class       = "elevation-1"
    >
        <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-spacer></v-spacer>
                <v-dialog
                    v-model     = "dialog"
                    max-width   = "700px"
                >
                    <template v-slot:activator = "{ on, attrs }">
                        <v-btn
                            color   = "var(--turquoise)"
                            dark
                            class   = "mb-2"
                            v-bind  = "attrs"
                            v-on    = "on"
                            v-if    = "!noEsAdmin"
                        ><v-icon left>mdi-pencil-plus-outline</v-icon>
                            Nuevo Semestre
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class = "headline">
                                {{ formTitle }}
                            </span>
                        </v-card-title>
                        <v-form ref="form">
                        <v-card-text>
                            <v-row>
                                <v-col
                                    col = "12"
                                    sm = "6"
                                    md = "4"
                                >
                                    <v-text-field
                                        v-model = "editedItem.nombre"
                                        label   = "Semestre"
                                        :rules="[rules.required]"
                                        counter
                                        maxlength="8"
                                        ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6" md="8">
                                    <DatePicker
                                        v-on:cambio-fecha="getFecha"
                                        label="Fecha Inicio"
                                        v-bind:date="editedItem.fechaInicio"
                                    ></DatePicker>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6" md="8">
                                    <DatePicker
                                        v-on:cambio-fecha="getFecha2"
                                        label="Fecha Fin"
                                        v-bind:date="editedItem.fechaFin"
                                    ></DatePicker>
                                </v-col>
                            </v-row>
                            <p v-if="errorRegistroSemestre" style="color:red">{{mensajeError}}</p>
                        </v-card-text>
                        </v-form>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color   = "var(--coral)"
                                outlined
                                @click  = "close"
                            ><v-icon left>mdi-close</v-icon>
                                Cancelar
                            </v-btn>
                            <v-btn
                                color   = "var(--turquoise)"
                                outlined
                                @click  = "save"
                            ><v-icon left>mdi-check</v-icon>
                                Guardar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model = "dialogDelete" max-width = "500px">
                    <v-card>
                        <v-card-title class = "textoModalDelete">
                            ¿Está seguro que desea eliminar este Semestre?
                        </v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                                <v-btn
                                    color   = "var(--coral)"
                                    outlined
                                    @click  = "closeDelete"
                                ><v-icon left>mdi-close</v-icon>
                                    Cancelar
                                </v-btn>
                                <v-btn
                                    color   = "var(--turquoise)"
                                    outlined
                                    @click  = "deleteItemConfirm"
                                ><v-icon left>mdi-check</v-icon>
                                    Ok
                                </v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-icon
                class="mr-2"
                @click="editItem(item)"
                v-if    = "!noEsAdmin"
            >
                mdi-pencil
            </v-icon>
            <v-icon
                @click="deleteItem(item)"
                v-if    = "!noEsAdmin"
            >
                mdi-delete
            </v-icon>
        </template>
        <template v-slot:no-data>
            No hay datos
        </template>
    </v-data-table>
</template>

<script>
    import Select from '../../../shared/Select.vue';
    import DatePicker from './SemestresDatePicker.vue';
    import { setSemestre, updateSemestre, deleteSemestre } from '../../../util/services/index.js';

    export default {
        props: [
            'semestres',
            'seSelecciono',
            'busqueda',
            'noEsAdmin',
        ],
        components: {
            Select,
            DatePicker,
        },
        data: () => ({
            dialog: false,
            dialogDelete: false,
            headers: [
                { text: 'Semestre', value: 'nombre', class: 'grey lighten-3'},
                { text: 'Fecha Inicio(año, mes, día)', value: 'fechaInicio', class: 'grey lighten-3'},
                { text: 'Fecha Fin(año, mes, día)', value: 'fechaFin', class: 'grey lighten-3'},
                { text: 'Actions', value: 'actions', sortable: false, filterable: false, class: 'grey lighten-3'},
            ],
            editedIndex: -1,
            editedItem: {
                idSemestre: -1,
                nombre: '',
                fechaInicio: '',
                fechaFin: '',
            },
            defaultItem: {
                idSemestre: -1,
                nombre: '',
                fechaInicio: '',
                fechaFin: '',
            },
            errorRegistroSemestre:false,
            mensajeError:'aa',
            rules:{
                required: value => !!value || 'No puede dejar campos vacíos',
            },
        }),

        computed: {
            formTitle() {
                return this.editedIndex === -1 ? 'Agregar Semestre' : 'Editar Semestre';
            },
        },

        watch: {
        dialog(val) {
            val || this.close();
        },
        dialogDelete(val) {
            val || this.closeDelete();
        },
    },
    created() {
        this.initialize();
        if(this.noEsAdmin){
            this.headers = [
                { text: 'Semestre', value: 'nombre', class: 'grey lighten-3'},
                { text: 'Fecha Inicio', value: 'fechaInicio', class: 'grey lighten-3'},
                { text: 'Fecha Fin', value: 'fechaFin', class: 'grey lighten-3'},
            ];
        }
    },

    methods: {
        initialize() {
            
        },

        editItem(item) {
            this.editedIndex = this.semestres.indexOf(item);
            this.editedItem = { ...item };            
            console.log(this.editedItem);
            this.dialog = true;
        },

        deleteItem(item) {
            this.editedIndex = this.semestres.indexOf(item);
            this.editedItem = { ...item };
            console.log(this.editedItem);
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            console.log(this.editedItem);
            this.eliminarSemestre(this.editedItem.idSemestre);
            this.semestres.splice(this.editedIndex, 1);
            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.$refs.form.resetValidation();
            this.$nextTick(() => {
                this.editedItem = { ...this.defaultItem };
                this.editedIndex = -1;
            });
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = { ...this.defaultItem };
                this.editedIndex = -1;
            });
        },
        validarSemestre(fechaNum1,fechaNum2,idSemestre){
            let semestreValido=true;
            let fechaComparar1;
            let fechaComparar2;
            let fechaCompararNum1;
            let fechaCompararNum2;
            for(let i=0;i<this.semestres.length;i++){
                if(this.semestres[i].idSemestre!=idSemestre){
                    fechaComparar1=this.semestres[i].fechaInicio.split("-");
                    fechaComparar2=this.semestres[i].fechaFin.split("-");
                    fechaCompararNum1=parseInt(fechaComparar1[0])*10000+parseInt(fechaComparar1[1])*100+parseInt(fechaComparar1[2]);
                    fechaCompararNum2=parseInt(fechaComparar2[0])*10000+parseInt(fechaComparar2[1])*100+parseInt(fechaComparar2[2]);
                    console.log(fechaCompararNum1);
                    console.log(fechaCompararNum2);
                    if(fechaNum1<=fechaCompararNum1 && fechaNum2>=fechaCompararNum2){//envuelve
                        semestreValido=false;
                        break;
                    }
                    if(fechaNum1>=fechaCompararNum1 && fechaNum2<=fechaCompararNum2){//esta dentro
                        semestreValido=false;
                        break;
                    }
                    if(fechaNum1<=fechaCompararNum1 && fechaNum2>=fechaCompararNum1){//
                        semestreValido=false;
                        break;
                    }
                    if(fechaNum1<=fechaCompararNum2 && fechaNum2>=fechaCompararNum2){//
                        semestreValido=false;
                        break;
                    }
                }
            }
            return semestreValido;
        },
        save(){
            if(this.editedItem.nombre!=""){
                let fecha1=this.editedItem.fechaInicio.split("-");
                let fecha2=this.editedItem.fechaFin.split("-");
                let fechaNum1=parseInt(fecha1[0])*10000+parseInt(fecha1[1])*100+parseInt(fecha1[2]);
                let fechaNum2=parseInt(fecha2[0])*10000+parseInt(fecha2[1])*100+parseInt(fecha2[2]);
                console.log(fechaNum1);
                console.log(fechaNum2);
                if (fechaNum1<fechaNum2) {
                    if(this.validarSemestre(fechaNum1,fechaNum2,this.editedItem.idSemestre)){
                        if (this.editedIndex > -1) {
                            this.editarSemestre(this.editedItem.idSemestre, this.editedItem.nombre, this.editedItem.fechaInicio, this.editedItem.fechaFin);
                            Object.assign(this.semestres[this.editedIndex], this.editedItem);
                        } else {
                            console.log(this.editedItem);
                            this.anadirSemestre(this.editedItem.nombre, this.editedItem.fechaInicio, this.editedItem.fechaFin);
                        }
                        this.close();
                    }else{
                        this.errorRegistroSemestre=true;
                        this.mensajeError="El rango de fecha ingresado impacta con otro semestre";
                        setTimeout(()=>{
                            this.errorRegistroSemestre=false;
                        },2000);
                        return;
                    }
                }else{
                    this.mensajeError="La fecha inicial debe ser menor a la final";
                    this.errorRegistroSemestre=true;
                    setTimeout(()=>{
                        this.errorRegistroSemestre=false;
                    },2000);
                    return;
                }
            }else{
                return;
            }
        },
        async anadirSemestre(nombre, fechaInicio, fechaFin) {
            try {
                console.log(nombre);
                console.log(fechaInicio);
                console.log(fechaFin);
                let data = await setSemestre(nombre, fechaInicio, fechaFin);
                console.log(data);
                if(data.data.status!="error"){
                    this.editedItem.idSemestre=data.data.id_semestre;
                    this.editedItem.nombre=nombre;
                    this.editedItem.fechaInicio=fechaInicio;
                    this.editedItem.fechaFin=fechaFin;
                    let newSemestre = this.editedItem;
                        console.log(newSemestre);
                    setTimeout(() =>{
                        this.semestres.push(newSemestre);
                    });
                    this.editedItem={...this.defaultItem};
                    this.editedIndex=-1;
                    this.manejarAlerta(0,0);
                }else{
                    this.manejarAlerta(1,0);
                }
                this.$refs.form.resetValidation();
            } catch (err) {
                console.log(err);
                this.manejarAlerta(1,0);
            }
        },
        async editarSemestre(idSemestre, fechaInicio, fechaFin, nombre){
            try {
                let data = await updateSemestre(idSemestre,fechaFin, nombre, fechaInicio);
                console.log(data);
                this.$refs.form.resetValidation();
                if(data.data.status!="error"){
                    this.manejarAlerta(0,1);
                }else{
                    this.manejarAlerta(1,1);
                }
            } catch (err) {
                console.log(err);
                this.manejarAlerta(1,1);
            }
        },
        async eliminarSemestre(idSemestre){
            try {
                console.log(idSemestre);
                let data = await deleteSemestre(idSemestre);
                console.log(data);
                if(data.data.status!="error"){
                    this.manejarAlerta(0,2);
                }else{
                    this.manejarAlerta(1,2);
                }
            } catch (err) {
                console.log(err);
                this.manejarAlerta(1,2);
            }
        },
        manejarAlerta(tipo,accion){
            this.$emit("alerta",tipo,accion);
        },
        getFecha(fecha){
            console.log(fecha);
            this.editedItem.fechaInicio = fecha;
        },
        getFecha2(fecha){
            this.editedItem.fechaFin = fecha;
        },
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
