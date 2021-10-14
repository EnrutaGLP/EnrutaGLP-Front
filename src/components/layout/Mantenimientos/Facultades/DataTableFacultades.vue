<template>
    <div>
        <v-text-field class="filterCadena"
            label="Ingrese la facultad que desea buscar"
            v-model="busqueda"
            append-icon="mdi-magnify"
            outlined
        >
        </v-text-field>
        <v-alert
            :value="hayAlerta"
            v-bind:type="tipoAlerta"
            transition="scale-transition"
        >
            {{textoAlerta}}
        </v-alert>
    <v-data-table
        :headers="headers"
        :items="facultades"
        :search="busqueda"
        sort-by="codigo"
        class="elevation-1"
        :loading="cargando"
        loading-text="Cargando facultades"
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
                            v-if="!noEsAdmin"
                        ><v-icon left>mdi-pencil-plus-outline</v-icon>
                            Nueva Facultad
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
                                        label="Codigo"
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
                                label="Descripcion"
                                :rules="[rules.required, rules.descripcion]"
                                counter
                                no-resize
                                maxlength="200"
                            ></v-textarea>
                            <div>
                                <td v-if="!noEsAdmin">Coordinador de Facultad: </td>
                                <Select
                                    v-model="coordPreSeleccionado"
                                    texto="Seleccione un Coordinador"
                                    v-on:cambio-seleccion="cambioUsuario2"
                                    v-bind:items="usuarios1"
                                    v-if="!noEsAdmin"
                                    v-bind:value="coordPreSeleccionado"
                                    mensajeNoData="No hay coordinadores registrados"
                                />
                                <p v-if="noHayUsuario" style="color:red">Debe seleciconar un coordinador</p>
                            </div>
                        </v-card-text>
                        </v-form>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="var(--coral)"
                                @click="close"
                                outlined
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
                        <v-card-title class="textoModalDelete">¿Está seguro que desea eliminar esta Facultad?</v-card-title>
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
        <template v-slot:item.actions="{ item }">
            <v-icon
                class="mr-2"
                @click="editItem(item)"
                v-if="!noEsAdmin"
            >
                mdi-pencil
            </v-icon>
            <v-icon
                @click="mostrarEspecialidades(item)"
            >
                mdi-magnify
            </v-icon>
            <v-icon
                @click="deleteItem(item)"
				v-if="!noEsAdmin"
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

import { setFacultades, updateFacultades, deleteFacultades } from '../../../util/services/index';
import Select from '../../../shared/Select.vue'

export default {
    props: [
        'facultades',
        'usuarios1',
        'noEsAdmin',
        'cargando',
    ],
    components:{
        Select,
    },
    data: () => ({
        dialog: false,
        dialogDelete: false,
        tipoAlerta: 'success',
        textoAlerta: '',
        hayAlerta: false,
        busqueda:'',
        headers: [
            { text: 'Codigo', value: 'codigo' },
            { text: 'Nombre', value: 'nombre' },
            { text: 'Descripcion', value: 'descripcion' },
            { text: 'Coordinador', value: 'usuario.nombre' },
            { text: 'Actions', value: 'actions', sortable: false , filterable: false },
        ],
        usuarios: {
            id_persona:-1,
            nombre:'',
        },
        editedIndex: -1,
        editedItem: {
            idFacultad: -1,
            codigo: '',
            nombre: '',
            descripcion: '',
            usuario:{
                id_persona:-1,
                nombre:'',
            },
        },
        defaultItem: {
            idFacultad: -1,
            codigo: '',
            nombre: '',
            descripcion: '',
            usuario:{
                id_persona:-1,
                nombre:'',
            },
        },
        /*coordPreSeleccionado:{
            value:{
                id_persona:-1,
                nombre:'',
            },
            text:'',
        },*/
        coordPreSeleccionado:0,
        rules:{
            required: value => !!value || 'No puede dejar campos vacíos',
            codigo:v=>v.length<=8 || 'Máximo 8 caracteres',
            nombre:v=>v.length<=50 || 'Máximo 50 caracteres',
            descripcion:v=>v.length<=200 || 'Máximo 200 caracteres',
        },
        noHayUsuario:false,
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Agregar Facultad' : 'Editar Facultad';
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
            this.editedIndex = this.facultades.indexOf(item);
            console.log(item);
            this.editedItem = { ...item };
            let auxCordPreSelec={
                value:{
                    id_persona:this.editedItem.usuario.id_persona,
                    nombre:this.editedItem.usuario.nombre,
                },
            };
            this.coordPreSeleccionado=auxCordPreSelec;
            this.cambioUsuario2(this.editedItem.usuario);
            console.log(this.editedItem);
            this.dialog = true;
        },

        deleteItem(item) {
            this.editedIndex = this.facultades.indexOf(item);
            this.editedItem = { ...item };
            console.log(this.editedItem);
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            console.log(this.editedItem);
            this.eliminarFacultad(this.editedItem.idFacultad);
            this.facultades.splice(this.editedIndex, 1);
            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.$refs.form.resetValidation();
            //this.usuarios1.push(this.coordPreSeleccionado);
            //this.usuarios1.pop();
            this.$nextTick(() => {
                this.editedItem = { ...this.defaultItem };
                this.usuarios={
                    id_persona:-1,
                    nombre:'',
                };
                if(this.editedIndex===-1){
                    this.usuarios1.push(this.coordPreSeleccionado);
                    this.usuarios1.pop();
                }
                this.editedIndex = -1;
                this.coordPreSeleccionado=0;
            });
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$refs.form.resetValidation();
            this.$nextTick(() => {
                this.editedItem = { ...this.defaultItem };
                this.editedIndex = -1;
                this.usuarios={
                    id_persona:-1,
                    nombre:'',
                };
                this.coordPreSeleccionado=0;
            });
        },

        save () {
            if(this.editedItem.codigo==="" || this.editedItem.nombre==="" || this.editedItem.descripcion===""){
                return;
            }else{
                if (this.editedIndex > -1) {//editar
                    if(this.usuarios.nombre===""){
                        this.noHayUsuario=true;
                        setTimeout(()=>{
                            this.noHayUsuario=false;
                        },2000);
                        return;
                    }
                    console.log(this.editedItem);
                    if(this.noEsAdmin){//cord fac
						this.editarFacultad(this.editedItem.idFacultad,this.editedItem.codigo,this.editedItem.nombre,
    	                this.editedItem.descripcion,this.editedItem.usuario);
                    }else{
						this.editarFacultad(this.editedItem.idFacultad,this.editedItem.codigo,this.editedItem.nombre,
    	                this.editedItem.descripcion,this.usuarios);
						this.editedItem.usuario=this.usuarios;
					}
					Object.assign(this.facultades[this.editedIndex], this.editedItem);
                } else {//añadir
                    if(this.usuarios.nombre===""){
                        this.noHayUsuario=true;
                        setTimeout(()=>{
                            this.noHayUsuario=false;
                        },2000);
                        return;
                    }
                    this.anadirFacultad(this.editedItem.codigo,this.editedItem.nombre,this.editedItem.descripcion,this.usuarios);
                }
                this.close();
            }
            
        },
        cambioUsuario2(dato){//id+todo
            console.log(dato);
            
            this.usuarios.id_persona=dato.id_persona;
            this.usuarios.nombre=dato.nombre;
        },
        async anadirFacultad(codigo,nombre,descripcion,usuario){
            console.log(codigo);
            console.log(nombre);
            console.log(descripcion);
            console.log(usuario);
            try{
                let data=await setFacultades(codigo,nombre,descripcion,usuario);
                console.log("entra");
                if(data.data.status!="success"){
                    this.manejarAlerta(1,0);
                    return;
                }
                //this.editedItem.idFacultad=data.data.id_facultad;
                this.editedItem.idFacultad=data.data.idFacultad;
                this.editedItem.codigo=codigo;
                this.editedItem.nombre=nombre;
                this.editedItem.descripcion=descripcion;
                this.editedItem.usuario=usuario;
                let aux=this.editedItem;
                setTimeout(()=>{
                    this.facultades.push(aux);
                },0);
                this.editedItem = { ...this.defaultItem };
                this.editedIndex = -1;
                console.log(data);
                this.$refs.form.resetValidation();
                this.coordPreSeleccionado=0;
                this.manejarAlerta(0,0);
            }catch(err){
                console.log(err);
                this.manejarAlerta(1,0);
            }
        },
        async editarFacultad(idFacultad,codigo,nombre,descripcion,usuario){
            try{
                let data=await updateFacultades(idFacultad,codigo,nombre,descripcion,usuario);
                if(data.data.status!="success"){
                    this.$refs.form.resetValidation();
                    this.manejarAlerta(1,1);
                    return;
                }
                console.log(data);
                this.manejarAlerta(0,1);
                this.$refs.form.resetValidation();
            }catch(err){
                this.manejarAlerta(1,1);
            }
        },
        async eliminarFacultad(idFacultad){
            try{
                let data=await deleteFacultades(idFacultad);
                console.log(data);
                if(data.data.status!="success"){
                    this.manejarAlerta(1,2);
                    return;
                }
                console.log(data);
                this.manejarAlerta(0,2);
            }catch(err){
                this.manejarAlerta(1,2);
            }
        },
        manejarAlerta(tipo,accion){
            if (tipo == 0) {
                this.tipoAlerta='success';
                if (accion==0) {//registro
                    this.textoAlerta = 'Se registró exitosamente la facultad';
                } else if (accion == 1) {//editar
                    this.textoAlerta = 'Se editó exitosamente la facultad';
                } else {//delete
                    this.textoAlerta = 'Se eliminó exitosamente la facultad';
                }
            } else {
                this.tipoAlerta = 'error';
                if (accion == 0) {//registro
                    this.textoAlerta='Hubo un error al registrar la facultad';
                } else if (accion == 1) {//editar
                    this.textoAlerta = 'Hubo un error al editar la facultad';
                } else {//delete
                    this.textoAlerta = 'Hubo un error al eliminar la facultad';
                }
            }
            this.hayAlerta=true;
            setTimeout(() => {
                this.hayAlerta = false;
            }, 2000);
        },
        mostrarEspecialidades(item){
            this.editedIndex = this.facultades.indexOf(item);
            this.editedItem = { ...item };
            this.$router.push({
            name:"Especialidades",
                params:{
                    id:this.editedItem.idFacultad,
                    codigo:this.editedItem.codigo,
                    nombre:this.editedItem.nombre,
                    descripcion:this.editedItem.descripcion,
                    usuario:this.editedItem.usuario,    
                }
            })
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
    .filterCadena{
        display:flex;
        margin-left: 20px;
        width:500px;
    }
    .textoModalDelete{
        white-space: normal;
    }
</style>
