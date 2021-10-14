<template>
    <v-btn @click="onClick" 
    color="var(--light-blue)"
    :disabled="disabled"
    outlined> 
        <v-icon dark left v-if="icon">{{ icon }}</v-icon>
        {{ text }} 
    </v-btn>
</template>

<script>

export default {
    name: "EditableButton",
    props: {
        text: String,
        icon: String,
        loading: Boolean,
        disabled: Boolean,
    },
    methods:{
        onClick(){
            this.$emit('onClick');
        }
    },
}
</script>

<style scoped>
@import '../assets/styles.css';
    button {
    color: var(--wb1);
    padding: 8px 16px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    transition-duration: 0.4s;
    cursor: pointer;
    border-radius: 8px;
    }
</style>