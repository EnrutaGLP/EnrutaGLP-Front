<template>
    <v-data-table
        :headers="headers"
        :items="especialidades"
        :search="busqueda"
        sort-by="codigo"
        class="elevation-1"
        :loading="cargando"
        loading-text="Cargando especialidades"
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
                            Nueva Especialidad
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
                                        label="Codigo*"
                                        :rules="[rules.required, rules.codigo]"
                                        counter
                                        maxlength="8"
                                        v-if="!esCordEsp"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6" md="8">
                                <v-text-field
                                    v-model="editedItem.nombre"
                                    label="Nombre*"
                                    :rules="[rules.required, rules.nombre]"
                                    counter
                                    maxlength="50"
                                    v-if="!esCordEsp"
                                ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-textarea
                                v-model="editedItem.descripcion"
                                label="Descripcion*"
                                :rules="[rules.required, rules.descripcion]"
                                counter
                                rows="3"
                                no-resize
                                maxlength="300"
                                v-if="!esCordEsp"
                            ></v-textarea>
                            <div>
                                <td v-if="!noEsAdmin || !esCordEsp">Director de Carrera *: </td>
                                <Select
                                    v-model="coordPreSeleccionado"
                                    texto="Seleccione un Director de Carrera"
                                    v-on:cambio-seleccion="cambioUsuario2"
                                    v-bind:items="usuarios1"
                                    v-if="!noEsAdmin || !esCordEsp"
                                    v-bind:value="coordPreSeleccionado"
                                    mensajeNoData="No hay Director de Carreras registrados"
                                />
                                <p v-if="noHayUsuario" style="color:red">Debe seleccionar un Director de Carrera</p>
                            </div>
                            <div>
                                <td>Asistente de mejora contínua: </td>
                                <Select
                                    v-model="asisPreSeleccionado"
                                    texto="Seleccione un asistente"
                                    v-on:cambio-seleccion="cambioUsuario3"
                                    v-bind:items="asistentes"
                                    v-bind:value="asisPreSeleccionado"
                                    mensajeNoData="No hay asistentes registrados"
                                />
                            </div>
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
                        <v-card-title class="textoModalDelete">¿Está seguro que desea eliminar esta Especialidad?</v-card-title>
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
                v-if="!noEsAdmin || esCordEsp"
            >
                mdi-pencil
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
</template>
<script>

import { setEspecialidades, updateEspecialidades, deleteEspecialidades, setAsistenteEspecialidad } from '../../../../util/services/index';
import Select from '../../../../shared/Select.vue'
import * as CryptoJS from 'crypto-js';

export default {
    props: [
        'especialidades',
        'seSelecciono',
        'usuarios1',
        'asistentes',
        'busqueda',
        'idFacultad',
        'noEsAdmin',
        'cargando',
        'esCordEsp',
    ],
    components:{
        Select,
    },
    data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
            { text: 'Codigo', value: 'codigo' },
            { text: 'Nombre', value: 'nombre' },
            { text: 'Descripcion', value: 'descripcion' },
            { text: 'Director de Carrera', value: 'usuario.nombre' },
            { text: 'Asistente', value: 'asistente.nombre' },
            { text: 'Actions', value: 'actions', sortable: false , filterable: false },
        ],
        editedIndex: -1,
        usuarios: {
            id_persona:-1,
            nombre:'',
        },
        asistente:{
            id_persona:null,
            nombre:'',
        },
        editedItem: {
            idFacultad:-1,
            idEspecialidad: -1,
            codigo: '',
            nombre: '',
            descripcion: '',
            usuario:{
                id_persona:-1,
                nombre:'',
            },
            asistente:{
                id_persona:null,
                nombre:'',
            }
        },
        defaultItem: {
            idFacultad:-1,
            idEspecialidad: -1,
            codigo: '',
            nombre: '',
            descripcion: '',
            usuario:{
                id_persona:-1,
                nombre:'',
            },
            asistente:{
                id_persona:null,
                nombre:'',
            }
        },
        rules:{
            required: value => !!value || 'No puede dejar campos vacíos',
            codigo:v=>v.length<=8 || 'Máximo 8 caracteres',
            nombre:v=>v.length<=50 || 'Máximo 50 caracteres',
            descripcion:v=>v.length<=300 || 'Máximo 300 caracteres',
        },
        noHayUsuario:false,
        datosUsuario:{

        },
        coordPreSeleccionado:0,
        asisPreSeleccionado:0,
    }),

    computed: {
        formTitle() {
            if(this.esCordEsp){
                return 'Editar Asistente de mejora contínua ';
            }else{
                return this.editedIndex === -1 ? 'Agregar Especialidad' : 'Editar Especialidad';
            }
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
        console.log("especialidades");
        console.log(this.especialidaes);
    },

    methods: {
        initialize() {
            
        },

        editItem(item) {
            this.editedIndex = this.especialidades.indexOf(item);
            console.log(item);
            this.editedItem = { ...item };
            let auxCordPreSelec={
                value:{
                    id_persona:this.editedItem.usuario.id_persona,
                    nombre:this.editedItem.usuario.nombre,
                },
            };
            this.coordPreSeleccionado = auxCordPreSelec;
            
            this.cambioUsuario2(this.editedItem.usuario);

            console.log(this.editedItem.asistente);

            if (this.editedItem.asistente)
            {
                let auxAsisPreSelec = {
                    value: {
                        id_persona: this.editedItem.asistente.id_persona,
                        nombre: this.editedItem.asistente.nombre,
                    }
                };
                this.asisPreSeleccionado = auxAsisPreSelec;
                this.cambioUsuario3(this.editedItem.asistente);
            }

            /*this.coordPreSeleccionado.value.id_persona=this.editedItem.usuario.id_persona;
            this.coordPreSeleccionado.value.nombre=this.editedItem.usuario.nombre;
            this.coordPreSeleccionado.text=this.editedItem.usuario.nombre;
            this.asisPreSeleccionado.value.id_persona=this.editedItem.usuario.id_persona;
            this.asisPreSeleccionado.value.nombre=this.editedItem.usuario.nombre;
            this.asisdPreSeleccionado.text=this.editedItem.usuario.nombre;*/
            console.log(this.editedItem);
            this.dialog = true;
        },

        deleteItem(item) {
            this.editedIndex = this.especialidades.indexOf(item);
            this.editedItem = { ...item };
            console.log(this.editedItem);
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            console.log(this.editedItem);
            this.eliminarEspecialidad(this.editedItem.idEspecialidad);
        },
        close() {
            this.dialog = false;
            this.$refs.form.resetValidation();
            this.usuarios1.push(this.coordPreSeleccionado);
            this.usuarios1.pop();
            this.asistentes.push(this.asisPreSeleccionado);
            this.asistentes.pop();
            this.$nextTick(() => {
                this.editedItem = { ...this.defaultItem };
                this.usuarios={
                    id_persona:-1,
                    nombre:'',
                };
                this.asistente={
                    id_persona:null,
                    nombre:'',
                };
                this.coordPreSeleccionado=0;
                this.editedIndex = -1;
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
                this.asistente={
                    id_persona:null,
                    nombre:'',
                };
            });
        },

        async save() {
            console.log(this.esCordEsp);
            if(this.esCordEsp){
                console.log(this.editedIndex);
                await this.agregarAsistente(this.asistente,this.editedItem.idEspecialidad);
                this.close();
            }else{
                if(this.editedItem.codigo==="" || this.editedItem.nombre==="" || this.editedItem.descripcion===""){
                    return 0;
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
                        if(this.noEsAdmin){
                            await this.editarEspecialidad(this.editedItem.idEspecialidad,this.editedItem.codigo,this.editedItem.nombre,
                            this.editedItem.descripcion,this.editedItem.usuario,this.asistente);
                        }else{
                            await this.editarEspecialidad(this.editedItem.idEspecialidad,this.editedItem.codigo,this.editedItem.nombre,
                            this.editedItem.descripcion,this.usuarios,this.asistente);
                            this.editedItem.usuario=this.usuarios;
                        }
                        Object.assign(this.especialidades[this.editedIndex], this.editedItem);
                    } else {//añadir
                        if(this.usuarios.nombre===""){
                            this.noHayUsuario=true;
                            setTimeout(()=>{
                                this.noHayUsuario=false;
                            },2000);
                            return;
                        }
                        await this.anadirEspecialidad(this.idFacultad,this.editedItem.codigo,this.editedItem.nombre,this.editedItem.descripcion,
                        this.usuarios,this.asistente);
                    }
                    this.close();
                }
            }
        },
        cambioUsuario2(dato){//id+todo
            console.log(dato);
            
            this.usuarios.id_persona=dato.id_persona;
            this.usuarios.nombre=dato.nombre;
        },
        cambioUsuario3(dato){//id+todo
            console.log(dato);

            this.asistente.id_persona=dato.id_persona;
            this.asistente.nombre=dato.nombre;
        },
        async agregarAsistente(asistente,idEspecialidad){
            try{
                let data=await setAsistenteEspecialidad(asistente.id_persona,idEspecialidad);
                console.log(data);
                if(data.data.status!="error"){
                    console.log("entra");
                    console.log(this.editedIndex);
                    let asistenteAux={
                        id_persona:this.editedItem.asistente.id_persona,
                        nombre:this.editedItem.asistente.nombre,
                    }
                    this.editedItem.asistente.id_persona=asistente.id_persona;
                    this.editedItem.asistente.nombre=asistente.nombre;
                    for(let i=0;i<this.datosUsuario.especialidaes.length;i++){
                        if(this.datosUsuario.especialidaes[i].id_especialidad==idEspecialidad){
                            this.datosUsuario.especialidaes[i].id_asistente=asistente.id_persona;
                            let jsonEncriptado=CryptoJS.AES.encrypt(JSON.stringify(this.datosUsuario),'json').toString();
                            localStorage.setItem('json',jsonEncriptado);
                            /*for(let j=0;this.asistentes.length;j++){
                                if(this.asistentes[j].value.id_persona==asistente.id_persona){
                                    this.asistentes.splice(j,1);
                                    break;
                                }
                            }
                            console.log(asistenteAux);
                            if(asistenteAux.id_persona!=-1){//tenía asistente asignado
                                this.asistentes.push({
                                    value:{id_persona:asistenteAux.id_persona, nombre:asistenteAux.nombre},
                                    text:asistenteAux.nombre,
                                });
                            }*/
                            break;
                        }
                    }
                    Object.assign(this.especialidades[this.editedIndex], this.editedItem);
                    this.manejarAlerta(0,0,"Se asignó exitosamente el Asistente de mejora contínua");
                }else{
                    this.manejarAlerta(1,0,"Error al asignar el asistente de mejora contínua");
                }
            }catch(err){
                console.log(err);
            }
        },
        async anadirEspecialidad(idFacultad,codigo,nombre,descripcion,usuario,asistente){
            try{
                let data=await setEspecialidades(idFacultad,codigo,nombre,descripcion,usuario);
                console.log(data);
                let idEspec=data.data.id_especialidad;
                if(data.data.status!="error"){
                    this.editedItem.idEspecialidad=data.data.id_especialidad;
                    this.editedItem.codigo=codigo;
                    this.editedItem.nombre=nombre;
                    this.editedItem.descripcion=descripcion;
                    this.editedItem.usuario=usuario;
                    if(asistente.id_persona!=-1){
                        let data=await setAsistenteEspecialidad(asistente.id_persona,idEspec);
                        console.log(data);
                        if(data.data.status!="error"){
                            console.log("entra");
                            console.log(this.editedIndex);
                            this.editedItem.asistente.id_persona=asistente.id_persona;
                            this.editedItem.asistente.nombre=asistente.nombre;
                            /*for(let j=0;this.asistentes.length;j++){
                                if(this.asistentes[j].value.id_persona==asistente.id_persona){
                                    this.asistentes.splice(j,1);
                                    break;
                                }
                            }*/
                            let aux=this.editedItem;
                            setTimeout(()=>{
                                this.especialidades.push(aux);
                            },0);
                            this.editedItem = { ...this.defaultItem };
                            this.editedIndex = -1;
                            this.$refs.form.resetValidation();
                            this.manejarAlerta(0,0);
                        }else{
                            this.$refs.form.resetValidation();
                            this.manejarAlerta(1,0,"Error al asignar el Asistente de mejora contínua , pero se registro la especialidad");
                        }
                    }else{
                        let aux=this.editedItem;
                        setTimeout(()=>{
                            this.especialidades.push(aux);
                        },0);
                        this.editedItem = { ...this.defaultItem };
                        this.editedIndex = -1;
                        this.$refs.form.resetValidation();
                        this.manejarAlerta(0,0);
                    }
                }else{
                    this.$refs.form.resetValidation();
                    this.manejarAlerta(1,0);    
                }
            }catch(err){
                console.log(err);
                this.manejarAlerta(1,0);
            }
        },
        async editarEspecialidad(idEspecialidad,codigo,nombre,descripcion,usuario,asistente){
            try{
                if(this.noEsAdmin){
                    let data=await updateEspecialidades(this.editedItem.idFacultad,idEspecialidad,codigo,nombre,descripcion,usuario);
                    console.log(data);
                    console.log(this.editedItem.asistente.id_persona);
                    if(data.data.status!="error"){
                        console.log(this.editedItem.asistente.id_persona);
                        console.log(asistente.id_persona);
                        if(this.editedItem.asistente.id_persona!=asistente.id_persona){
                            console.log("entra");
                            let data=await setAsistenteEspecialidad(asistente.id_persona,idEspecialidad);
                            console.log(data);
                            if(data.data.status!="error"){
                                console.log(this.editedIndex);
                                let asistenteAux={
                                    id_persona:this.editedItem.asistente.id_persona,
                                    nombre:this.editedItem.asistente.nombre,
                                }
                                this.editedItem.asistente.id_persona=asistente.id_persona;
                                this.editedItem.asistente.nombre=asistente.nombre;
                                /*for(let j=0;this.asistentes.length;j++){
                                    if(this.asistentes[j].value.id_persona==asistente.id_persona){
                                        this.asistentes.splice(j,1);
                                        break;
                                    }
                                }
                                if(asistenteAux.id_persona!=-1){//tenía asistente asignado
                                    this.asistentes.push({
                                        value:{id_persona:asistenteAux.id_persona, nombre:asistenteAux.nombre},
                                        text:asistenteAux.nombre,
                                    });
                                }*/
                            }else{
                                this.$refs.form.resetValidation();
                                this.manejarAlerta(1,1,"Error al asignar el Asistente de mejora contínua , pero se editó la especialidad");
                                return;
                            }
                        }
                        this.$refs.form.resetValidation();
                        this.manejarAlerta(0,1);
                    }else{
                        this.$refs.form.resetValidation();
                        this.manejarAlerta(1,1);
                    }
                }else{
                    let data=await updateEspecialidades(this.idFacultad,idEspecialidad,codigo,nombre,descripcion,usuario);
                    console.log(data);
                    console.log(this.editedItem.asistente.id_persona);
                    console.log("paoxkspo");
                    if(data.data.status!="error"){
                        console.log(this.editedItem.asistente.id_persona);
                        console.log(asistente.id_persona);
                        if(this.editedItem.asistente.id_persona!=asistente.id_persona){
                            console.log("entra");
                            let data=await setAsistenteEspecialidad(asistente.id_persona,idEspecialidad);
                            console.log(data);
                            if(data.data.status!="error"){
                                console.log(this.editedIndex);
                                /*let asistenteAux={
                                    id_persona:this.editedItem.asistente.id_persona,
                                    nombre:this.editedItem.asistente.nombre,
                                }*/
                                this.editedItem.asistente.id_persona=asistente.id_persona;
                                this.editedItem.asistente.nombre=asistente.nombre;
                                /*for(let j=0;this.asistentes.length;j++){
                                    if(this.asistentes[j].value.id_persona==asistente.id_persona){
                                        this.asistentes.splice(j,1);
                                        break;
                                    }
                                }
                                if(asistenteAux.id_persona!=-1){//tenía asistente asignado
                                    this.asistentes.push({
                                        value:{id_persona:asistenteAux.id_persona, nombre:asistenteAux.nombre},
                                        text:asistenteAux.nombre,
                                    });
                                }*/
                            }else{
                                this.$refs.form.resetValidation();
                                this.manejarAlerta(1,1,"Error al asignar el Asistente de mejora contínua , pero se editó la especialidad");
                                return;
                            }
                        }
                        this.$refs.form.resetValidation();
                        this.manejarAlerta(0,1);
                    }else{
                        this.$refs.form.resetValidation();
                        this.manejarAlerta(1,1);
                    }
                }
            }catch(err){
                console.log(err);
                this.manejarAlerta(1,1);
            }
        },
        async eliminarEspecialidad(idEspecialidad){
            try{
                let data=await deleteEspecialidades(idEspecialidad);
                console.log(data);
                if(data.data.status!="error"){
                    console.log(this.editedItem);
                    /*if(this.editedItem.asistente.id_persona!=-1){
                        this.asistentes.push({
                            value:{id_persona:this.editedItem.asistente.id_persona, nombre:this.editedItem.asistente.nombre},
                            text:this.editedItem.asistente.nombre,
                        });
                    }*/
                    this.manejarAlerta(0,2);
                    this.especialidades.splice(this.editedIndex, 1);
                }else{
                    this.manejarAlerta(1,2);    
                }
                this.closeDelete();
            }catch(err){
                this.manejarAlerta(1,2);
                this.closeDelete();
            }
        },
        manejarAlerta(tipo,accion,mensaje=""){
            this.$emit("alerta",tipo,accion,mensaje);
        },
    },
    created(){
        console.log(this.noEsAdmin);
        console.log(this.esCordEsp);
        if(this.noEsAdmin){
            this.noEsAdmin=true;
            if(this.esCordEsp){
                this.headers= [
		  		    { text: 'Codigo', value: 'codigo' },
                    { text: 'Nombre', value: 'nombre' },
                    { text: 'Descripcion', value: 'descripcion' },
                    { text: 'Director de Carrera', value: 'usuario.nombre' },
                    { text: 'Asistente', value: 'asistente.nombre' },
                    { text: 'Actions', value: 'actions', sortable: false , filterable: false },
			    ];
            }else{
                this.headers= [
		  		    { text: 'Codigo', value: 'codigo' },
                    { text: 'Nombre', value: 'nombre' },
                    { text: 'Descripcion', value: 'descripcion' },
                    { text: 'Director de Carrera', value: 'usuario.nombre' },
                    { text: 'Asistente', value: 'asistente.nombre' },
			    ];
            }
		}
        let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
        this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
        console.log(this.asistentes);
        this.asistentes.unshift({
            text:"Sin asistente",
            value:{
                id_persona:null,
                nombre:"Sin asistente",
            }
        })
    }
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
