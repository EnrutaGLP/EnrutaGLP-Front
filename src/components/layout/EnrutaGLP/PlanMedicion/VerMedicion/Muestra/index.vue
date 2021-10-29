<template>
    
    <div
      class='muestra'
    >
          <v-icon @click="$emit('delete-muestra', muestra.idPrivado)" size="30" class="fas">mdi-close</v-icon> 
          <div class='inline'>
            <v-col cols="12" sm="9" md="2">
              <v-text-field 
              v-model="muestra.nombre"
              :rules="[rules.required, rules.nombre]"
              label="Nombre"
              @input="cambioNombre"
              counter
              maxlength="10"
              > 
              </v-text-field>
            </v-col>  
            <!-- <h3>Profesores:</h3> -->
            <EmailSelect @cambiar-profesores="cambiarProfesores" :key="emailSelectKey" :optionsList="optionsList" :includedList="includedList"/>
          </div>
    </div>
</template>

<script>
import EmailSelect from '.././EmailSelect';
import {getProfesores} from '@/components/util/services/index';
export default {
    name: 'Muestra', 
    props :{
        muestra: Object,
    },
    components:{
      EmailSelect,
    },
    emits: ["cambiarnombre-muestra","cambiar-profesores"],
    data(){
        const srcs = {
          1: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
          2: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
          3: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
          4: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
          5: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
        }
        return{
          // optionsList: [
          //   { nombre: 'Rony Cueva'},
          //   { nombre: 'Miguel Guanira'},
          //   { nombre: 'Luis Flores' },
          //   { nombre: 'Layla Hirsh' },
          //   { nombre: 'Britta Holt'},
          //   { nombre: 'Jane Smith '},
          //   { nombre: 'John Smith'},
          //   { nombre: 'Sandra Williams'},
          //   { nombre: 'Rony A'},
          //   { nombre: 'Miguel B'},
          //   { nombre: 'Luis C'},
          //   { nombre: 'Layla D'},
          //   { nombre: 'Britta E'},
          //   { nombre: 'Jane F '},
          //   { nombre: 'John G'},
          //   { nombre: 'Sandra H'},
          // ],
          // includedList: ['Rony Cueva', 'Miguel Guanira'],
          optionsList : [], 
          includedList : [],
          includedList2 : [],
          listaProfesores: [], 
          emailSelectKey : 0,
          rules:{
                required: value => !!value || 'No puede dejar campos vacíos',
                nombre:[v=>v.length<=10 || 'Máximo 10 caracteres']
          },
        };
    },
    methods:{
      async obtenerProfesores(){
        const resListarPer = await getProfesores(); 
        this.optionsList = resListarPer.data.personas; 
        this.includedList = this.muestra.profesores; 
        console.log("included list al ser creado:",this.includedList);
        this.emailSelectKey += 1; 
      },
      cambioNombre(nuevoNombre){
        this.muestra.nombre = nuevoNombre;
        this.$emit("cambiarnombre-muestra",this.muestra.idPrivado, this.muestra.nombre);
      },
      cambiarProfesores(nuevaListaProfesores){
        console.log(nuevaListaProfesores);
        this.muestra.profesores = nuevaListaProfesores;
        console.log("desde muestra profesores:",this.muestra.profesores);
        console.log("desde muestra id privado:",this.muestra.idPrivado);
        this.$emit("cambiar-profesores",this.muestra.idPrivado,this.muestra.profesores); 
      }
    },    
    created(){
      this.obtenerProfesores();
    }, 
}
</script>

<style scoped>
.muestra .fas {
  color: black;
  float: right;
}
.muestra {
  background: #ffffff;
  margin: 5px;
  padding: 1px 10px;
  border: 1px solid #cfcdca;
  border-radius: 25px;
}

.muestra h3{
  padding-right: 1vw;
}
.inline{
  display: flex; 
  align-items:  baseline;
}
</style>
