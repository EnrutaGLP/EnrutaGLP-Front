<template>
    <v-select
        v-model="cambio"
        v-bind:label="texto"
        v-on:change="cambioSeleccion"
        v-bind:return-object="r_object"
        v-bind:items="items"
        v-bind:value="value"
        v-bind:item-text="itemText"
        v-bind:item-value="itemValue"
        v-bind:disabled="disabled"
        v-bind:placeholder="placeholder"
        v-bind:rules="rules"
        v-bind:no-data-text="msjNoData"
        dense
        outlined
        class="comboBox" transition="scroll-y-transition"
    >
    </v-select>
</template>

<script>
export default {
    props:[
        'texto', // laber por defecto
        'items', // {text, value}
        'itemText',
        'itemValue',
        'value',
        'value2',
        'disabled',
        'placeholder',
        'r_object',
        'rules',
        'mensajeNoData',
    ],
    data(){
        return{
            searchInput: "",
            cambio: this.value,
            msjNoData: this.mensajeNoData ? this.mensajeNoData : "No hay datos",
        }
    },
    methods:{
        cambioSeleccion(){
            this.$emit('cambio-seleccion',this.cambio);
            this.$emit('cambio-auxiliar',this.cambio,this.items[this.cambio-1]);
        },
    },
    watch:{
        items: function(){
            //if(this.items.length != 0)
              //  this.cambio = this.items[0];
            //else
            this.cambio=0;
        },
        value: function(){
            this.cambio=this.value;
        },
    }
}
</script>

<style>
    .comboBox{
        width: 25rem !important;
    }
</style>
