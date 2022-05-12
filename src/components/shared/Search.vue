<template>
    <v-text-field
        class="filterCadena"
        v-bind:label="texto"
        v-model="dato"
        v-on:change="change"
        v-bind:value="value"
        outlined
        append-icon="mdi-magnify"
    >
    </v-text-field>    
</template>
<script>
export default {
    props:{
        texto: String,
        value: String,       
    },
    data(){
        return{
            dato:this.value,
        }
    },
    methods:{
        change(){
            this.$emit('change',this.dato);
        }
    }
}
</script>
<style>
    .filterCadena{
        display:flex;
        width:25rem !important;
    }
</style>
