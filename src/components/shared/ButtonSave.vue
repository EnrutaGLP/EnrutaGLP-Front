<template>
    <v-btn
        color="var(--turquoise)"
        class="botonSave"
        outlined
        v-bind:to="link"
        v-on:click="click"
        >
        <v-icon dark left>mdi-content-save</v-icon>
        {{texto}}
    </v-btn>
</template>
<script>

export default {
    props:[
        'texto',
        'link',
    ],
    methods:{
        click(){
            this.$emit('click');
        }
    }
}
</script>

<style scoped>
@import '../assets/styles.css';
</style>
