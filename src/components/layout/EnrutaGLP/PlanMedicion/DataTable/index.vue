<template>
  <v-data-table 
      :headers="columnas" 
      :items="filas" 
      class="elevation-1"
      :loading="cargando"
  >
    <template v-slot:top>
      <v-toolbar flat>
      <h3>Mediciones</h3>
        <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="700px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="var(--turquoise)"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
                ><v-icon left>mdi-account-plus-outline</v-icon>
                Nueva Medicion
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-stepper v-model="e1">
                <v-stepper-header>
                  <v-divider></v-divider>
                  <v-stepper-step :complete="e1 > 1" step="1">
                    Eleccion
                  </v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step :complete="e1 > 2" step="2">
                    Resultados de estudiante
                  </v-stepper-step>
                  <v-divider></v-divider>
                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-card>
                      <v-card-text>
                        <v-btn
                          class="btnCurso"
                          @click.prevent="onSubmit"
                          @click="seleccion=1;e1=2;"
                          large :loading="loading"
                        >
                            LA MEDICION SE REALIZARA DENTRO DE UN CURSO
                        </v-btn>
                        <div class="separadorBotones">
                            <v-divider/>o<v-divider/>
                        </div>
                        <v-btn
                          class="btnCurso"
                          @click="seleccion=2;e1=2;"
                          @click.prevent="onSubmit"
                          large :loading="loading"
                        >
                            LA MEDICION NO SE REALIZARA DENTRO DE UN CURSO
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-card>
                      <v-card-text>
                        <v-form ref="form">
                          <Select
                            v-if="seleccion==1"
                            v-model="editedItem.curso"
                            v-on:cambio-seleccion="cambioCurso"
                            v-bind:items="cursos"
                            item-text="nombre"
                            item-value="id_curso"
                          />
                          <v-text-field
                            v-if="seleccion==2"
                            class="nombreInput"
                            v-model="editedItem.nombre"
                            label="Nombre de medicion"
                            :rules="[rules.required, rules.nombre]"
                            type="text"
                            maxlength="50"
                            counter
                          ></v-text-field>
                          <v-select
                            class="resultadosInput"
                            v-model="editedItem.resultados"
                            :items="resultados"
                            item-text="codigo"
                            item-value="id_resultado_estudiante"
                            label="Resultados de estudiante"
                            outlined
                            multiple
                            chips
                            hint="Elija uno o más resultados de estudiante"
                            persistent-hint
                          >
                          </v-select>
                        </v-form>
                      </v-card-text>
                      <v-card-actions class="botones2">
                        <v-spacer></v-spacer>
                        <v-btn outlined color="primary" @click="e1 = 1">
                          <v-icon left>mdi-arrow-left</v-icon>Atrás
                        </v-btn>
                        <v-btn color="var(--coral)" outlined @click="close"
                          ><v-icon left>mdi-close</v-icon>
                          Cancelar
                        </v-btn>
                        <v-btn color="var(--turquoise)" outlined @click="save"
                          v-bind:disabled="btnSaveDisabled"  ><v-icon left>mdi-check</v-icon>
                          Guardar
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-stepper-content>

                </v-stepper-items>
              </v-stepper>

            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
              <v-card-title class="headline">¿Está seguro de que quiere eliminar esta medición?</v-card-title>
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
    <!-- <v-icon class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon> -->
      <router-link :to="{ name: 'VerMedicion', params: { id: item.idEvaluacionCurso } }">
        <v-icon @click="mostrarIndicadores(item)"> mdi-magnify </v-icon>
      </router-link>
      <v-icon @click="deleteItem(item.idEvaluacionCurso)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      No hay datos
    </template>
  </v-data-table>
</template>



<script>
import {getCursos, agregarEvaluacionCurso, deleteEvaluacionCurso} from "@/components/util/services/index";
//import { deleteResultadosEstudiante } from '../../../util/services/index'
import Select from "../../../../shared/Select";

export default {
  props: {
    columnas: Array,
    filas: Array,
    resultadoEstudiante: Object,
    idPlanMedicion: Number,
    idResultado: Number,
    resultados: Array,
    idEspecialidad: Number,
    cursos: Array,
    cargando: Boolean,
  },
  components: {
    Select,
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    idMedAEliminar: -1,
    headers: [
      { text: "Código", value: "codigo" },
      { text: "Nombre", value: "Nombre" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    editedItem: {
      resultados:[],
      nombre: "",
      curso : {}
    },
    e1 : 1,
    editedIndex: -1,
    defaultItem: {
      resultados:[],
      nombre: "",
      curso : {}
    },
    rules:{
      required: value => !!value || 'No puede dejar campos vacíos',
      nombre:[v=>v.length<=50 || 'Máximo 50 caracteres']
    },
    cursoSeleccionado: {},
    seleccion : -1,
    btnSaveDisabled: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Medicion" : "Editar Curso";
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

  async created() {
    this.initialize();  

    //const resCurs = await getCursos(this.idEspecialidad);
    //this.cursos = resCurs.data.cursos;
  },

  methods: {
    initialize() {},

    editItem(item) {
      this.editedIndex = this.resultadosEstudianteConId.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item){
      this.idMedAEliminar = item;
      this.dialogDelete = true;
    },
    async deleteMedicion(idEvaluacionCurso) {
      //this.editedIndex = this.resultadosEstudianteConId.indexOf(item);
      //this.editedItem = Object.assign({}, item);
      console.log("id_evaluacion_curso ::", idEvaluacionCurso);
      const resDM = await deleteEvaluacionCurso(parseInt(idEvaluacionCurso));

      if (resDM.data.status != "success"){
          this.manejarAlerta(1, 1);
      }
      else{
          this.manejarAlerta(0, 1);  
      }

      this.$emit('listar-evaluaciones-curso');
    },

    deleteItemConfirm() {
      //await(link,this.editedIem.id)
      this.deleteMedicion(this.idMedAEliminar);
      this.closeDelete();
    },

    close() {
      this.e1 = 1;
      this.dialog = false;
      this.$refs.form.resetValidation();
      this.$nextTick(() => {
        this.editedItem = {...this.defaultItem};
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.idMedAEliminar = -1;
      this.dialogDelete = false;
    },

    cambioCurso(dato){
      this.editedItem.curso = dato;
    },

    async save() {
      this.btnSaveDisabled = true;
      if (this.editedIndex > -1) {
        
      } else {
        //añadir
        console.log(this.editedItem);
        let resMed;
        if(this.seleccion==2){
          resMed = await agregarEvaluacionCurso(this.$props.idPlanMedicion, this.editedItem.resultados, 
                                                    -1,this.editedItem.nombre);
        }
        else{
          resMed = await agregarEvaluacionCurso(this.$props.idPlanMedicion, this.editedItem.resultados, 
                                                    this.editedItem.curso,this.editedItem.nombre);
        }
        console.log(resMed);
        if (resMed.data.status != "success") {
          this.manejarAlerta(1, 0);
          //this.resultadosEstudianteConId.push(this.editedItem);
        } else {
          this.manejarAlerta(0, 0);
          this.$emit('listar-evaluaciones-curso');
          //this.resultadosEstudianteConId.push(this.editedItem);
        }
      }
      this.btnSaveDisabled = false;
      this.close();
      
    },
    mostrarIndicadores(item) {
      this.editedIndex = this.resultadosEstudianteConId.indexOf(item);
      this.editedItem = Object.assign({}, item);

      this.$router.push({
        name: "IndicadoresDesempeno",
        params: {
          id: this.editedItem.idResultado,
          codigo: this.editedItem.codigo,
          descripcion: this.editedItem.descripcion,
        },
      });
      //let indicadores=await(link,this.editedIndex.id)
    },
    manejarAlerta(tipo,accion){
        console.log("emit alerta", tipo, accion);
        this.$emit("alerta",tipo,accion);
    },
  },
};
</script>


<style scoped>
.ocultar {
  visibility: hidden;
}
.noOcultar {
  visibility: inherit;
}
.btnCurso{
  font-family: "Roboto", sans-serif !important;
  text-transform: uppercase !important;
  outline: 0 !important;
  background-color: var(--turquoise) !important;
  width: 100% !important;
  border: 0 !important;
  padding: 15px !important;
  margin-top: 15px !important;
  margin-bottom: 15px !important;
  color: var(--wb1) !important;
  font-size: 14px !important;
  border-radius: 0rem;
  -webkit-transition: all 0.3 ease !important;
  transition: all 0.3 ease !important;
  cursor: pointer !important;
  
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1), 0 5px 5px 0 rgba(0, 0, 0, 0.20);
}
.separadorBotones {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-block: 1rem;
}

</style>
