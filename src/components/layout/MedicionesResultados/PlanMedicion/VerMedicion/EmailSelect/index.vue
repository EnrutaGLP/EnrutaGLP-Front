<template>
    <div>
        <v-autocomplete
              v-model="includedListLocal"
              :items="optionsListLocal"
              :loading="isLoading"
              :search-input.sync="search"
              hide-no-data
              hide-selected
              @change="agregar()"
              chips
              color="blue-grey lighten-2"
              label="Profesores"
              item-text="nombre"
              item-value="nombre"
              multiple
              return-object
            > 
              <template v-slot:selection="data">
                <v-chip
                  v-bind="data.attrs"
                  :input-value="data.selected"
                  close
                  @click:close="remove(data.item)"
                  @click="data.select"
                >
                  {{ data.item.nombre }}
                </v-chip>
              </template>
              <template v-slot:item="data">
                <template v-if="typeof data.item !== 'object' ">
                  <v-list-item-content v-text="data.item"></v-list-item-content>
                </template>
                <template v-else>
                  <v-list-item-content>
                    <v-list-item-title v-html="data.item.nombre"></v-list-item-title>
                  </v-list-item-content>
                </template>
              </template>
            </v-autocomplete>
    </div>
</template>

<script>
import {getProfesores} from '@/components/util/services/index';  
export default {
    name: 'EmailSelect',
    props:{
        includedList: Array,
        optionsList: Array,
    },
    components:{

    },
    emits: ["cambiar-profesores"], 
    data(){
        return{
          includedListLocal : [],
          optionsListLocal : [],  
          profListLocal : [],
          allItems : [],
          first : true,
          isLoading : false,
          search: null,
          firstSearch : true,
        };
    },
    watch: {
      async search (val) {


        // Items have already been requested
        /*if (this.isLoading) return

        if(this.firstSearch){
          this.isLoading = true
          
          this.firstSearch = false;
          this.isLoading = false;
        }*/
        this.optionsListLocal = [...this.includedListLocal, ...this.allItems.filter(p => p.nombre.toLowerCase().startsWith(val.toLowerCase())).slice(0,5)];
        
      },
    },
    methods:{
        remove (item) {
          console.log("---------------------------------------------------------------------------------");
          this.includedListLocal = this.includedListLocal.filter(i => i.id_persona!=item.id_persona); 
          console.log("included list desde emailSelect al eliminar:",this.includedListLocal);
          this.$emit("cambiar-profesores",this.includedListLocal);
        },
        agregar(){
            console.log("---------------------------------------------------------------------------------");
            console.log("included list desde emailSelect:",this.includedListLocal);
            console.log("options list desde emailSelect:",this.optionsListLocal);
            this.$emit("cambiar-profesores",this.includedListLocal);
        }
    },
    async created(){
        
        this.includedListLocal =  JSON.parse(JSON.stringify(this.includedList));
        this.optionsListLocal = JSON.parse(JSON.stringify(this.includedList));
        const resListarPer = await getProfesores();   
        this.allItems = resListarPer.data.personas; 
        this.optionsListLocal = [...this.includedListLocal, ...this.allItems.slice(0,5)];

        console.log("included list local email select:",this.includedListLocal);
        
        //this.includedListLocal = this.profListLocal.map(i=>i.nombre);
        //this.optionsListLocal =  JSON.parse(JSON.stringify(this.optionsList));
    }
}
</script>


<style scoped>


</style>