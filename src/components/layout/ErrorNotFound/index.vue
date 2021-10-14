<template>
    <div>
        <v-card class="container">
            <router-view />
            <h1 class="tituloError">
                Error 404: ¡Página no encontrada!
            </h1>
            <BackButton class="backButton"/>
        </v-card>
    </div>
</template>

<script>
import BackButton from '../../shared/BackButton';

export default ({
    name: 'ErrorNotFound',
    components: {
        BackButton,
    },
});
</script>

<style scoped>
    @import '../../assets/styles.css';

    .tituloError{
        text-align: center;
        top:  50%;
        left: 50%;
        font-size: 4.5rem;
    }

    .container{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .backButton{
        background-color: var(--turquoise) !important;
        font-size: 18px !important;
        margin: 8px 4px;
    }

</style>
