<template>
    <div>
        <div class="titulo">
            <div class="titulo2">
                <p class="titulo" >{{texto}}</p>
            </div>
            <hr class="linea">

        </div>

    </div>
</template>
<script>
export default {
    props:{
        texto: String, 
        urlKey: String,
        usarBotonAyuda: Boolean,
    },
    components: {
            
    },
}
</script>
<style scoped>
@import '../assets/styles.css';
    .titulo{
        color: var(--wb9);
        white-space: pre !important;
    }
    p{
        color: var(--wb8);
        text-decoration: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 140%;
    }
    a:link{
        color: var(--wb9);;
    }
    .titulo2{
        margin-bottom: 0.6em;
        display: flex; 
        flex-direction: row;
        justify-content: space-between;
    }
    .botonAyuda{
        float: right;
        transform: scale(0.7,0.7);
    }
</style>
