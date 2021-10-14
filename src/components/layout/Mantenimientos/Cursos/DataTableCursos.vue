<template>
    <div>
        <v-text-field class="filterCadena"
            label="Ingrese el curso que desea buscar"
            v-model="busqueda"
            append-icon="mdi-magnify"
            outlined
            v-if="especialidadSeleccionada"
        >
        </v-text-field>
        <Alert
            v-bind:senalAlerta="senalAlerta"
            v-bind:textoAlerta="textoAlerta"
            v-bind:hayAlert="hayAlert"
        />
    <v-data-table
        :headers="headers"
        :items="cursos"
        :search="busqueda"
        sort-by="codigo"
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
                            color="var(--turquoise)"
                            dark
                            class="mb-2"
                            v-bind="attrs"
                            v-on="on"
                        ><v-icon left>mdi-pencil-plus-outline</v-icon>
                            Nuevo Curso
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-form ref="form">
                        <v-card-text>
                            <v-row>
                                <v-col
                                    cols="12"
                                    sm="6"
                                    md="4"
                                >
                                    <v-text-field
                                        v-model="editedItem.codigo"
                                        label="Código"
                                        :rules="[rules.required, rules.codigo]"
                                        counter
                                        maxlength="8"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6" md="8">
                                    <v-text-field
                                        v-model="editedItem.nombre"
                                        label="Nombre"
                                        :rules="[rules.required, rules.nombre]"
                                        counter
                                        maxlength="50"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-textarea
                                v-model="editedItem.descripcion"
                                label="Descripción"
                                :rules="[rules.required, rules.descripcion]"
                                counter
                                no-resize
                                maxlength="500"
                            ></v-textarea>
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
                <v-dialog v-model="dialogDelete" max-width="500px">
                    <v-card>
                        <v-card-title class="textoModalDelete">¿Está seguro que desea eliminar este Curso?</v-card-title>
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
            >
                mdi-pencil
            </v-icon>
            <v-icon
                @click="deleteItem(item)"
            >
                mdi-delete
            </v-icon>
        </template>
        <template v-slot:no-data>
            No hay datos
        </template>
    </v-data-table>
    </div>
</template>
<script>

import { setCurso, updateCurso, deleteCurso } from '../../../util/services/index';
import Alert from '../../../shared/Alert.vue'

export default {
    props: [
        'cursos',
        'idEspecialidad',
        'especialidadSeleccionada',
    ],
    components:{
        Alert,
    },
    data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
            { text: 'Código', value: 'codigo' },
            { text: 'Nombre', value: 'nombre' },
            { text: 'Descripción', value: 'descripcion' },
            { text: 'Actions', value: 'actions', sortable: false, filterable: false },
        ],
        editedIndex: -1,
        editedItem: {
            idCurso: -1,
            codigo: '',
            nombre: '',
            descripcion: '',
        },
        defaultItem: {
            idCurso: -1,
            codigo: '',
            nombre: '',
            descripcion: '',
        },
        busqueda:'',

        textoAlerta:"",
        senalAlerta:'',
        hayAlert:false,

        respuesta:{},
        rules:{
            required: value => !!value || 'No puede dejar campos vacíos',
            codigo:v=>v.length<=8 || 'Máximo 8 caracteres',
            nombre:v=>v.length<=50 || 'Máximo 50 caracteres',
            descripcion:v=>v.length<=500 || 'Máximo 500 caracteres',
        },
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Agregar Curso' : 'Editar Curso';
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
    },

    methods: {
        initialize() {

        },

        editItem(item) {
            this.editedIndex = this.cursos.indexOf(item);
            this.editedItem = { ...item };
            console.log(this.editedItem);
            this.dialog = true;
        },

        deleteItem(item) {
            this.editedIndex = this.cursos.indexOf(item);
            this.editedItem = { ...item };
            console.log(this.editedItem);
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            console.log(this.editedItem);
            this.eliminarCurso(this.editedItem.idCurso);
            this.cursos.splice(this.editedIndex, 1);
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
            this.$refs.form.resetValidation();
            this.$nextTick(() => {
                this.editedItem = { ...this.defaultItem };
                this.editedIndex = -1;
            });
        },

        save () {
            if(this.editedItem.codigo=="" || this.editedItem.descripcion=="" || this.editedItem.nombre==""){

            }else{
                if (this.editedIndex > -1) {//editar
                    this.editarCurso(this.editedItem.idCurso,this.editedItem.codigo,this.editedItem.nombre,this.editedItem.descripcion);
                    Object.assign(this.cursos[this.editedIndex], this.editedItem);
                } else {//añadir
                    this.anadirCurso(this.editedItem.codigo,this.editedItem.nombre,this.editedItem.descripcion,this.idEspecialidad);
                    console.log(this.editedItem);
                }
                this.close();
            }
        },
        async anadirCurso(codigo,nombre,descripcion,idEspecialidad){
            try{
                console.log(idEspecialidad+codigo+nombre+descripcion);
                let data=await setCurso(codigo,nombre,descripcion,idEspecialidad);
                console.log(data);
                if(data.data.status=="error"){
                    this.manejarAlerta(1,0);
                }else{
                    this.editedItem.idCurso=data.data.id_curso;
                    this.editedItem.codigo=codigo;
                    this.editedItem.nombre=nombre;
                    this.editedItem.descripcion=descripcion;
                    let aux=this.editedItem;
                    setTimeout(()=>{
                        this.cursos.push(aux);
                    },0);
                    this.editedItem={...this.defaultItem};
                    this.editedIndex=-1;
                    this.$refs.form.resetValidation();
                    this.manejarAlerta(0,0);
                }
            }catch(err){
                this.manejarAlerta(1,0);
            }
        },
        async editarCurso(idCurso,codigo,nombre,descripcion){
            console.log(idCurso+codigo+nombre+descripcion);
            try{
                let data=await updateCurso(idCurso,codigo,nombre,descripcion);
                console.log(data);
                if(data.data.status=="success"){
                    this.manejarAlerta(0,1);
                }else{
                    this.manejarAlerta(1,1);
                }
                this.$refs.form.resetValidation();
            }catch(err){
                this.manejarAlerta(1,1);
            }
        },
        async eliminarCurso(idCurso){
            console.log(idCurso);
            try{
                let data=await deleteCurso(idCurso);
                console.log(data);
                if(data.data.status=="success"){
                    this.manejarAlerta(0,2);
                }else{
                    this.manejarAlerta(1,2);
                }
            }catch(err){
                this.manejarAlerta(1,2);
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se registró exitosamente el curso";
                } else if (accion==1) {//editar
                    this.textoAlerta="Se editó exitosamente el curso";
                } else {//delete
                    this.textoAlerta="Se eliminó exitosamente el curso";
                }
            } else {    
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta='Hubo un error al registrar el curso';
                } else if(accion==1) {//editar
                    this.textoAlerta="Hubo un error al editar el curso";
                } else {//delete
                    this.textoAlerta="Hubo un error al eliminar el curso";
                }
            }
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
    .filterCadena{
        display:flex;
        
        width:500px;
    }
</style>
