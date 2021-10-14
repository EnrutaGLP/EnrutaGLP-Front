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
                :disabled="disabled"
                v-model="computedDateFormatted"
                label="Fecha"
                hint="formato DD/MM/AAAA"
                persistent-hint
                prepend-icon="mdi-calendar"
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
            menu: false,
            dateFormatted: this.formatDate(),
        }
    },
    props:{
      date: {default: new Date().toISOString().substr(0, 10)} ,
      disabled: Boolean,
      fin: Number, comparator: String,
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
        if (!date) return null
        const [year, month, day] = date.split('-')
        return `${day}/${month}/${year}`
      },
      parseDate (date) {
        if (!date) return null
        const [day, month, year] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      },
      cambioSeleccion(){
        this.$emit('cambio-fecha',this.date);  
      },
    },
  }
</script>
