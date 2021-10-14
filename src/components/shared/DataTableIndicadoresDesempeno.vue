<template>
    <v-data-table
        :headers="headers"
        :items="indicadoresDesempeno"

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
                        Nuevo Indicador
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="headline">{{ formTitle }}</span>
                    </v-card-title>
                    <v-form ref="form">
                        <v-card-text>
                            <v-textarea
                                v-model   = "editedItem.nombre"
                                label     = "Nombre"
                                :rules    = "[rules.rulesDescripcion, rules.required]"
                                counter
                                no-resize
                                rows="5"
                                maxlength = "500"
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
            <v-card-title class="textoModalDelete">¿Está seguro que desea eliminar este Indicador de Desempeño?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="var(--coral)" outlined @click="closeDelete"><v-icon left>mdi-close</v-icon>Cancelar</v-btn>
              <v-btn color="var(--turquoise)" outlined @click="deleteItemConfirm(item)"><v-icon left>mdi-check</v-icon>OK</v-btn>
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
</template>

<script>
import { setIndicadoresDesempeno, updateIndicadoresDesempeno, deleteIndicadoresDesempeno } from '../util/services/index.js';
export default {
    props: [
        'indicadoresDesempeno',
        'idResultado',
    ],
    data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
            { text: 'Nombre'  , value: 'nombre' },
            { text: 'Actions' , value: 'actions', sortable: false },
        ],
        editedIndex: -1,
        editedItem: {
            id_indicador: -1,
            nombre: '',
        },
        defaultItem: {
            id_indicador: -1,
            nombre: '',
        },
        rules : {
          rulesDescripcion: v=>v.length<=500 || 'Máximo 500 caracteres',
          required: value => !!value || 'No puede dejar campos vacíos',
        },
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Agregar Indicador' : 'Editar Indicador';
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
            this.editedIndex = this.indicadoresDesempeno.indexOf(item);
            this.editedItem = { ...item };
            this.dialog = true;
        },

        deleteItem(item) {
            this.editedIndex = this.indicadoresDesempeno.indexOf(item);
            this.editedItem = { ...item };
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            console.log(this.editedItem);
            this.eliminarIndicador(this.editedItem.id_indicador);
            this.indicadoresDesempeno.splice(this.editedIndex, 1);
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

        save() {
            if(this.editedItem.nombre==""){

            }else{
                if (this.editedIndex > -1) { // editar
                    this.editarIndicador(this.editedItem.id_indicador, this.editedItem.nombre);
                    Object.assign(this.indicadoresDesempeno[this.editedIndex], this.editedItem);
                } else { // añadir
                    console.log(this.editedItem.nombre);
                    if (this.editedItem.nombre == "") {
                    } else {
                        this.anadirIndicador(this.idResultado, this.editedItem.nombre);
                        setTimeout(()=>{
                            this.indicadoresDesempeno.push(this.editedItem);
                        },0);
                    }
            }
            this.close();
            }
        },
        async eliminarIndicador (id){
            console.log(id);
            try {
                let data = await deleteIndicadoresDesempeno(id);
                console.log(data);
                this.manejarAlerta(0,2);
            } catch (err) {
                console.log(id);
                this.manejarAlerta(1,2);
            }
        },
        async anadirIndicador(id, descripcion){
            console.log(id + descripcion);
              try {
                  let data = await setIndicadoresDesempeno (id, descripcion);
                  console.log(data);
                  
                  this.editedItem.id_indicador  = data.data.idIndicador;
                  this.editedItem.nombre        = descripcion;
                  let aux=this.editedItem;
                    setTimeout(()=>{
                        this.resultadosEstudianteConId.push(aux);
                    },0);
                    this.editedItem={...this.defaultItem};
                    this.editedIndex=-1;
                  console.log(data);
                  this.$refs.form.resetValidation();
                  this.manejarAlerta(0,0);
              } catch (err) {
                  this.manejarAlerta(1,0);
              }
        },
        async editarIndicador(idIndicador, nombre){
            try {
                let data = await updateIndicadoresDesempeno(idIndicador, nombre);
                console.log(data);
                this.$refs.form.resetValidation();
                this.manejarAlerta(0,1);
            } catch (err) {
                this.manejarAlerta(1,1);
            }
        },
        manejarAlerta(tipo,accion){
            this.$emit("alerta",tipo,accion);
        },
    },
};
</script>

<style scoped>
    .textoModalDelete{
        white-space: normal;
    }
</style>
