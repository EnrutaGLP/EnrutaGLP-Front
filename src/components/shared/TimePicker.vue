<template>
    <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :nudge-right="40"
        :return-value.sync="time"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-text-field
                v-model="time"
                :label="texto"
                prepend-icon="mdi-clock-time-four-outline"
                readonly
                v-bind="attrs"
                v-on="on"
            ></v-text-field>
            </template>
            <v-time-picker
                v-if="menu"
                v-model="time"
                full-width
                v-on:change="cambioSeleccion"
                color="#7434EB"
                @click:minute="$refs.menu.save(time)"
            ></v-time-picker>
    </v-menu>
</template>
<script>
export default {
    props:[
        'texto',
        'time',
    ],
    data () {
        return {
            menu: false,
        }
    },
    methods:{
        cambioSeleccion(){
            this.$emit('cambio-hora',this.time);
        }
    }
}
</script>
