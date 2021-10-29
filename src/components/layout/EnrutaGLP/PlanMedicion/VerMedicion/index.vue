<template>
    <div class="contenedorPrincipal">
        <div class="verMedicion">
            <Title texto="Mediciones y Resultados > Planes de Medición > Ver Medición" :usarBotonAyuda=true urlKey="verMedicion"/>
            <div class="informacionGeneral">
                <h2>Información General</h2>
                <v-divider>
                </v-divider>
                <br>
                <div v-if="tieneCurso"><b>Nombre de la Medición:</b> {{curso.nombre}}</div>
                <div v-if="!tieneCurso"><b>Nombre de la Medición:</b> {{nombre}}</div>
                <!-- <br>
                <div><b>Resultado:</b> {{resultado.descripcion}}</div>
                <br> -->
                <br>
                <div>
                    <v-autocomplete
                        v-model="indicadoresAevaluar"
                        v-bind:items="indicadores"
                        item-text="nombre"
                        item-value="id_indicador"
                        outlined
                        dense
                        chips
                        small-chips
                        label="Indicadores a evaluar"
                        multiple
                        return-object
                        @change="updateIndicadores"
                    ></v-autocomplete>
                </div>
                <div class="actividades">
                    <div><b>Actividades de Evaluación:</b></div>
                    <br>
                    <DataTableActividades
                        :actividades="actividadesEvaluacion"
                    />
                    <!--
                    <CRUDDataTable 
                    :headers="columns" 
                    :dataList="actividadesEvaluacion" 
                    :editedItem="editedItem" 
                    :defaultItem="defaultItem"
                    newItemString="Agregar Actividad de Evaluacion"
                    slot="actions"
                    />
                    -->
                </div>
                <br>
            </div>
            <h2>Muestras y Encargados de Medición</h2>
            <v-divider>
            </v-divider>
            <br>
            <div class="muestras">
                <EditableButton @onClick="addMuestra" text="Agregar Nueva Muestra" icon="mdi-plus"/>
            </div>
            <br>
            <div>
                <div :key="muestra.idPrivado" v-for="muestra in muestras">
                    <Muestra
                    v-if="muestra.estado"  
                    @delete-muestra="deleteMuestra"
                    @cambiarnombre-muestra="cambiarNombreMuestra"
                    @cambiar-profesores="cambiarProfesores"
                    :muestra="muestra"
                    />
                </div>
            </div>
            <div>
                <Alert
					v-bind:senalAlerta="senalAlerta"
					v-bind:textoAlerta="textoAlerta"
					v-bind:hayAlert="hayAlert"
				/>
            </div>
            <BackButton />
            <ButtonSave id="btnSave" v-bind:disabled="btnSaveDisabled" texto="Guardar" v-on:click="actualizarEvaluacionCurso "/>
        </div>
    </div>
</template>


<script>
import Title from '../../../../shared/Title';
import CRUDDataTable from '../../../../shared/CRUDDataTable';
import EditableButton from '../../../../shared/EditableButton';
import BackButton from '../../../../shared/BackButton';
import ButtonSave from '../../../../shared/ButtonSave.vue';
import Muestra from './Muestra';
import { verMedicion,verEvaluacionCurso, updateEvaluacionCurso,updateMedicion, enviarCorreoProfesor } from '@/components/util/services/index';
import DataTableActividades from './DataTableActividades.vue'
import * as CryptoJS from 'crypto-js';
import Alert from "@/components/shared/Alert.vue";
export default {
  name: 'VerMedicion',
  props: {
  },
  components:{
      Title,
      EditableButton,
      Muestra,
      CRUDDataTable,
      BackButton,
      Alert,
      ButtonSave,
      DataTableActividades,
  },
  data(){
      return{
        columns: [
                { text:'Actividad', value:"nombre"},

                //{ text:'Acciones', value:'actions',class:'grey lighten-3' },
            ],
        actividadesEvaluacion: [
        ],  
        editedItem : {nombre: "Nueva Actividad"},
        defaultItem: {nombre:"Nueva Actividad"},
        muestras :[], 
        indicadores: [],
        ciclo : {},
        resultado: {},
        curso:{},
        nombre : "",
        indicadoresAevaluar: [],
        acceso: -1,
        dialogDelete : false, 
        senalAlerta: '',
        hayAlert: false,
        textoAlerta: "",
        tieneCurso: false,
        btnSaveDisabled: false,
      };
  },
  methods:{
      deleteMuestra(idPrivado){
        const indiceMuestraAeliminar = this.muestras.findIndex(m => m.idPrivado==idPrivado); 
        if(this.muestras[indiceMuestraAeliminar].hasOwnProperty("idMuestra")){
            //Si es que ya ha sido registrado en la bd 
            this.muestras = this.muestras.map( m => (m.idPrivado == idPrivado)? {...m,"estado":false}:m );
        }
        else{
            //Si es que no ha sido agregado a la bd aun
            this.muestras = this.muestras.filter((muestra) => muestra.idPrivado !== idPrivado);
        }
         
      },
      
      addMuestra(){
          const max = Math.max(...this.muestras.map(muestra => muestra.idPrivado)); 
          console.log(max); 
          const newMuestra  = {
              "idPrivado": (this.muestras.length==0)? 1 : max + 1,
              "nombre": "",
              "estado":true,
              "profesores":[],
          };    
          this.muestras = [...this.muestras, newMuestra];
      },
      async getDataEvaluacionCurso(){
          const idEC = this.$route.params.id;
          const resMedicion = await verEvaluacionCurso(idEC);
          this.curso = resMedicion.data.curso;
          this.resultados = resMedicion.data.resultados;
          this.muestras = resMedicion.data.muestrasEvaluacion.map(obj => ({...obj, "estado":true,"idPrivado":obj.idMuestra})); 
          this.muestras.map(muestra=> muestra.profesores = muestra.profesores.map(obj => ({...obj, "estado":true})));
          this.actividadesEvaluacion = resMedicion.data.actividadesEvaluacion.map(obj => ({...obj, "estado":true})); 
          this.indicadores = resMedicion.data.indicadores; 
          this.indicadoresAevaluar = this.indicadores.filter(i=> i.estado); 
          this.tieneCurso = resMedicion.data.tieneCurso; 
          this.nombre = resMedicion.data.nombre;
      },
      async actualizarEvaluacionCurso(){
            this.btnSaveDisabled = true;
            let ec = {};
            ec["idEvaluacionCurso"] = this.$route.params.id;
            ec["actividadesEvaluacion"] = this.actividadesEvaluacion;
            ec["indicadores"] = this.indicadores;
            ec["muestrasEvaluacion"] = this.muestras;
            if(this.tieneCurso){
                ec["curso"] = this.curso
            }
            ec["tieneCurso"] = this.tieneCurso;
            console.log("ec:",ec);
            try{
                
                const resUM = await updateEvaluacionCurso(ec);
                console.log(resUM);
                var status = resUM.data.status;
                this.$router.go(-1);
                
                // if (status === "success"){
                //     this.manejarAlerta(0,0);
                // } 
                // else{
                //     this.manejarAlerta(1,0);
                // }
            }catch(error){
                this.manejarAlerta(1,0);
            }
      },
      updateIndicadores(indSeleccionados){
          this.indicadores = this.indicadores.map( obj => ({...obj, "estado":false}));
          if(indSeleccionados.length>0){
            indSeleccionados.forEach(element => {
                this.indicadores = this.indicadores.map( m => (m.id_indicador == element.id_indicador)? {...m,"estado":true}:m );
            });
          }
      },
      cambiarNombreMuestra(idMuestra, nombreMuestra){
          this.muestras = this.muestras.map( m => (m.idPrivado === idMuestra)? {...m,"nombre":nombreMuestra}:m );
      },
      cambiarProfesores(idMuestra, nuevaListaProfesores){
          console.log("desde ver medicion id:",idMuestra);
          console.log("desde ver medicion profesores:",nuevaListaProfesores);
          this.muestras = this.muestras.map( m => (m.idPrivado === idMuestra)? 
                {...m,profesores: nuevaListaProfesores } :m );
          console.log(this.muestras);
          console.log("---------------------------------------------------------------------------------");
      },
      manejarAlerta(tipo, accion) {
        if (tipo == 0) {
            this.hayAlert=!this.hayAlert;
            this.senalAlerta=tipo;
            if(accion==0) {
                this.textoAlerta="Se guardo exitosamente";
            } 
        } else {
            this.hayAlert=!this.hayAlert;
            this.senalAlerta=tipo;
            if (accion==0) {
                this.textoAlerta='Hubo un error al guardar';
            } 
        }
      },
  },
  watch:{
    //   actividadesEvaluacion(){
    //       console.log("Actividades::",this.actividadesEvaluacion)
    //   }
  },
  created(){
      let acces = localStorage.getItem('acceso');
        if (!acces) {
            this.$router.push('/login');
        }
        this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
        this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
        if (this.acceso == 0) {
            this.$router.push('/login');
        } else if (this.acceso < 2) {
            this.$router.push('/home');
        }
    this.getDataEvaluacionCurso();
  }
};
</script>


<style scoped>

@import '../../../../assets/styles.css';
.muestras{
    display:flex;
    align-items: center;
    justify-content: center;
}

#btnSave{
    float: right;
}

h2 {
    padding: 1rem 0rem 0rem 0rem;
}

.informacionGeneral{
    padding: 1rem 0rem 0rem 0rem;
}
</style>