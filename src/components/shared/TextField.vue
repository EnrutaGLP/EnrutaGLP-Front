<template>
    <v-text-field
        v-bind:label="texto"
        v-model="dato"
        v-on:change="change"
        v-bind:value="value"
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
