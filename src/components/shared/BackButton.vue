<template>
    <v-btn class="backButton" dark @click="retroceder" depressed>
        <v-icon dark left>mdi-keyboard-backspace</v-icon>
        Volver
    </v-btn>
</template>

<script>
export default {
    name: 'BackButton',
    methods: {
        retroceder() {
            this.$router.go(-1);
        },
    },
};
</script>

<style scoped>
    @import '../assets/styles.css';
    .backButton {
        background-color: var(--wb5) !important;
        padding: 8px 16px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 12px;
        font-family: 'Roboto';
        margin: 0.5rem;
        transition-duration: 0.4s;
        cursor: pointer;
        border-radius: 8px;
    }
</style>
