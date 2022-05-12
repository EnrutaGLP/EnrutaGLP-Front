<template>
    <button type="button">
        <router-link :to="route" class="linkDecoration">
            <v-card
                class="mx-auto card"
                width="400"
                height="370px"
                hover transition="fade-transition"
            >
                <div class="flex-container">
                    <div class="img-container">
                        <img
                            class="white--text align-end image"
                            :src="imgSrc"
                        />
                    </div>
                </div>
                <v-card-title class="title"> {{title}} </v-card-title>
                <v-card-text class="text--primary">
                    {{description}}
                </v-card-text>
            </v-card>
        </router-link>
    </button>
</template>

<script>
export default {
    name: 'Card',
    props: ['imgSrc', 'title', 'description', 'route'],
};
</script>

<style scoped>
@import '../assets/styles.css';
    .title {
        align-items: center;
        justify-content: center;
        font-size: 25px;
    }

    .image {
        max-width: 100%;
        height: 100px;
        width: 100px;
    }

    .img-container {
        height: 200px;
        width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .flex-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 15px;
        background-color: var(--wb1pto5);
    }

    .card {
        padding-top: 0.1px;
        background-color: var(--wb1) !important;
    }

    .linkDecoration {
        text-decoration: none;
    }

    .text--primary {
        font-size: 16px;
    }

</style>
