<template>
  <div>
    <v-menu
      ref="menu"
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="auto"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          :rules="[rules.comparar]"
          :disabled="disabled"
          v-model="computedDateFormatted"
          :label="texto"
          hint="formato DD/MM/AAAA"
          persistent-hint
          prepend-icon="mdi-calendar"
          :readonly="readOnly"
          v-bind="attrs"
          @blur="date = parseDate(dateFormatted)"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="date"
        v-on:change="cambioSeleccion"
        no-title
        @input="menu = false"
      ></v-date-picker>
    </v-menu>
  </div>
</template>
<script>
    export default {
        data(){
            return{            
                dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
                menu: false,
                readOnly: true,
                rules: {
                    comparar: (value) => {
                        let formattedValue = this.parseDate(value);
                        if(this.fin == "0"){
                            return this.comparator.localeCompare(formattedValue) == 1 || "Fecha no válida.";
                        }else if(this.fin == "1"){
                            return formattedValue.localeCompare(this.comparator) == 1 || "Fecha no válida.";
                        }
                    },
                },
            }
        },
        props:{
            date: {default: new Date().toISOString().substr(0, 10)} ,
            disabled: Boolean,
            fin: String, 
            comparator: String,
            texto:String,
        },
        computed: {
            computedDateFormatted () {
                return this.formatDate(this.$props.date)
        },
        },
        watch: {
            date () {
                this.dateFormatted = this.formatDate(this.$props.date)
            },
        },
        methods: {
            formatDate (date) {
                if (!date) return null;
                const [year, month, day] = date.split('-');
                return `${day}/${month}/${year}`;
            },
            parseDate (date) {
                if (!date) return null;
                const [day, month, year] = date.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            },
            cambioSeleccion(){
                this.$emit('cambio-fecha',this.date);  
            },
        },
    }
</script>