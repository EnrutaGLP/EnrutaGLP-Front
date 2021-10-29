<template>
    <v-data-table
      :headers="cabeceras"
      :items="dataList"
      sort-by=""
      class="elevation-3"
    >
        <template v-slot:top>
            <v-toolbar
            flat
            >
            <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                <v-card-title class="headline">¿Está seguro de que quiere eliminar esta evidencia?</v-card-title>
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
        <template v-slot:[`item.archivo`]="{  }">
            <!-- Componente de archivo single line, single file -->
        </template>
      <template v-slot:[`item.actions`]="{ item }">
      <!--  <a
        :href="item.url"
        v-text="item.nombre"
        @click.prevent="downloadItem(item)" />-->
        <a
          :href="item.url"
          :download="item.nombre"
        >
          <v-icon
            medium
            @click="downloadItem(item)"
            >
            mdi-download
          </v-icon> 
        </a>   
        <v-icon
          medium
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
        <v-progress-circular :value="40" indeterminate v-if="cargando[item.id_evidencia + item.nombre]"></v-progress-circular>
      </template>
      <template v-slot:no-data>
          No hay archivos
      </template>
    </v-data-table>
</template>

<script>

import {
    eliminarEvidencia,
    descargarEvidencia
} from "@/components/util/services/index";

export default {
  name: 'EvidenciasDataTable',
  props: {
    headers: Array,
    dataList: Array,
    editedItem: Object,
    defaultItem: Object,
    cargando: Object,
  },
  data() {
    return ({
      dialogDelete: false,
      cabeceras: this.headers ? this.headers : [],
      editedIndex: -1,
      hayData: this.dataList.length === 0,
      edited: this.editedItem ? this.editedItem : {},
      default: this.defaultItem ? this.defaultItem : {},
      row: 1,
      //cargando: Object.assign({}, ...this.dataList.map((x) => ({[x.id_evidencia + x.nombre]: false}))),
    });
  },
  watch: {
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.cabeceras.push(
      { text: 'Acciones', value: 'actions', sortable: false },
    );
  },

  methods: {
    editItem (item, i) {
        /* this.editedIndex = this.dataList.indexOf(item);
        this.edited = Object.assign({}, item);
        this.edited["archivo"] = i;
        this.dataList[this.editedIndex] = this.edited;
        console.log(this.dataList[this.editedIndex]["archivo"]); */
    },

    deleteItem(item) {
      /* this.editedIndex = this.dataList.indexOf(item);
      this.edited = { ...item };
      this.dialogDelete = true; */
      this.editedIndex = this.dataList.indexOf(item);
      this.edited = { ...item };
      console.log(this.edited);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      /* this.dataList.splice(this.editedIndex, 1);
      this.closeDelete();
      this.$emit('eliminar', this.edited);// pasa el id */
      console.log("edited element::", this.edited);
      this.deleteEvidencia(this.edited.id_evidencia, this.edited.nombre);
      this.dataList.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    closeDelete() {
      /* this.dialogDelete = false;
      this.$nextTick(() => {
        this.edited = { ...this.default };
        this.editedIndex = -1;
      }); */

      this.dialogDelete = false;
      this.$nextTick(() => {
          this.edited = { ...this.default };
          this.editedIndex = -1;
      });
    },
    async deleteEvidencia(idEvidencia, filename){
        let keyvalue = idEvidencia + filename;
        this.cargando[keyvalue] = true;
        try {
            console.log("idEvidencia", idEvidencia);
            let data = await eliminarEvidencia(idEvidencia);
            console.log(data);
            this.cargando[keyvalue] = false;
            this.manejarAlerta(0,2);
        } catch (err) {
            console.log(err);
            this.cargando[keyvalue] = false;
            this.manejarAlerta(1,2);
        }
    },
    downloadItem(item){
      console.log("di entra", item);
      this.downloadEvidencia(item.id_evidencia, item.nombre, item.formato_archivo);
    },
    async downloadEvidencia(idEvidencia, filename, formatoArchivo){
      //this.cargando = true;
      let keyvalue = idEvidencia + filename;
      this.cargando[keyvalue] = true;
        try {
            console.log("idEvidencia", idEvidencia);
            console.log("formatoArchivo", formatoArchivo);
            const file = await descargarEvidencia(idEvidencia);

            const blob = new Blob([file.data], { type: formatoArchivo });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            link.click();
            URL.revokeObjectURL(link.href)
            //this.cargando = false;
            this.cargando[keyvalue] = false;
            this.manejarAlerta(0,0);
        } catch (err) {
            console.log(err);
            //this.cargando = false;
            this.cargando[keyvalue] = false;
            this.manejarAlerta(1,0);
        }
    },
    manejarAlerta(tipo,accion){
        console.log("emit alerta", tipo, accion);
        this.$emit("alerta",tipo,accion);
    },
  },
};
</script>

<style scoped>

</style>
