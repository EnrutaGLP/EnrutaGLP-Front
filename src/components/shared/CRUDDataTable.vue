<template>
    <v-data-table
      :headers="cabeceras"
      :items="dataList"
      sort-by=""
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color=#00D9B8
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
                v-show="hayBotonAnadir!='no'"
              >
                {{ newItemString }}
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                  <v-row>
                    <v-col v-for="(o,i) in Object.keys(edited)"
                        :key="i"
                        cols="12"
                        sm="6"
                        md="4"
                    >
                      <v-text-field
                        v-if="cabeceras[i].value!='actions'"
                        v-model="edited[o]"
                        :label="cabeceras[i].text"
                      ></v-text-field>
                    </v-col>
                  </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color=#F95F62
                  @click="close"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  color=#00D9B8
                  @click="save"
                >
                  Guardar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">¿Está seguro que desea eliminar este elemento?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color=#F95F62 text @click="closeDelete">Cancelar</v-btn>
                <v-btn color=#00D9B8 text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
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
          v-show="hayBotonAnadir!='no'"
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
    name: 'CRUDDataTable',
    props: {
        headers: Array,
        dataList: Array,
        editedItem: Object,
        defaultItem: Object,
        newItemString: String,
        editItemString: String,
        //hasta acá son propiedades obligatorias
        hayBotonAnadir: String,
        hayBotonDelete: String,
    },
    data() {
        return {
            dialog: false,
            dialogDelete: false,
            cabeceras: this.headers ? this.headers : [],
            editedIndex: -1,
            hayData: this.dataList.length === 0,
            edited: this.editedItem ? this.editedItem : {},
            default: this.defaultItem ? this.defaultItem : {},
        };
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? this.newItemString : this.editItemString;
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
        console.log(this.editedItem);
        if(this.cabeceras[this.cabeceras.length-1].value!="actions"){
            this.cabeceras.push(
                { text: 'Acciones', value: 'actions', sortable: false },
            );
        }
    },

    methods: {
        editItem(item) {
            this.editedIndex = this.dataList.indexOf(item);
            this.edited = { ...item };
            this.dialog = true;
        },

        deleteItem(item) {
            this.editedIndex = this.dataList.indexOf(item);
            this.edited = { ...item };
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            this.dataList.splice(this.editedIndex, 1);
            this.closeDelete();
            this.$emit('eliminar', this.edited); // pasa el id
        },

        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.edited = { ...this.default };
                this.editedIndex = -1;
            });
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.edited = { ...this.default };
                this.editedIndex = -1;
            });
        },

        save() {
            if (this.editedIndex > -1) { // editar
                Object.assign(this.dataList[this.editedIndex], this.edited);
                this.$emit('editar', this.edited); // pasa el objeto
            } else { // anadir
                this.dataList.push(this.edited);
                this.$emit('anadir', this.edited); // pasa el id
            }
            this.close();
        },
    },
};
</script>

<style scoped>

</style>
