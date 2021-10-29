<template>
  <v-data-table
    :headers="headers"
    :items="filtrarActividades"
    class="elevation-1"
  >
    <template v-slot:top>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          scrollable
          max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="btnNuevaActividad"
              color="var(--turquoise)"
              dark
              v-bind="attrs"
              v-on="on"
              style="margin: 25px !important;"
            ><v-icon left>mdi-pencil-plus-outline</v-icon>
              Nueva actividad
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-form ref="form">
              <v-card-text>
                      <v-text-field
                        v-model="editedItem.nombre"
                        label="Actividad"
                        :rules="[rules.required, rules.nombre]"
                        counter
                        maxlength="100"
                      ></v-text-field>
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
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">¿Está seguro de que quiere eliminar esta actividad?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="var(--coral)" outlined @click="closeDelete"><v-icon left>mdi-close</v-icon>Cancelar</v-btn>
              <v-btn color="var(--turquoise)" outlined @click="deleteItemConfirm"><v-icon left>mdi-check</v-icon>OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
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
  export default {
    data: () => ({
      dialog: false,
      dialogDelete: false,
      headers: [
        {
          text: 'Actividad',
          align: 'start',
          sortable: false,
          value: 'nombre',
        },
        { text: 'Acciones', value: 'actions', sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        nombre: '',
        estado: true,
      },
      defaultItem: {
        nombre: '',
        estado: true,
      },
      rules:{
            required: value => !!value || 'No puede dejar campos vacíos',
            nombre:[v=>v.length<=100 || 'Máximo 100 caracteres']
      },
    }),
    props:[
        'actividades',
        'id_medicion',
    ],
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Agregar actividad' : 'Editar actividad'
      },
      filtrarActividades() {
        return this.actividades.filter((obj)=>{return obj.estado==true});
      }
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
    created () {
      this.initialize()
    },
    methods: {
      initialize () {

      },
      editItem (item) {
        this.editedIndex = this.actividades.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      deleteItem (item) {
        this.editedIndex = this.actividades.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },
      deleteItemConfirm () {
        if(this.actividades[this.editedIndex].hasOwnProperty("id_actividad_evaluacion")){
          this.actividades[this.editedIndex].estado = false
        }else{
          this.actividades.splice(this.editedIndex, 1)
        }
        console.log("Actividades::",this.actividades)
        this.closeDelete()
      },
      close () {
        this.dialog = false
        this.$refs.form.resetValidation();
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      save () {
        if(this.editedItem.nombre == ""){

        }
        else{
          if (this.editedIndex > -1) {
            Object.assign(this.actividades[this.editedIndex], this.editedItem)
          } else {
            this.actividades.push(this.editedItem)
          }
          this.close()
        }
      },
    },
  
  }
</script>
