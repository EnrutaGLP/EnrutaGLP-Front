<template>
    <div>
        <v-btn
            class="mx-2"
            fab
            small
            color="var(--turquoise)"
            outlined
            v-on:click="click"
        >  
            <v-icon dark>
                mdi-help
            </v-icon>
        </v-btn>

    <v-dialog v-model="dialogActivate" max-width="40em">
            <v-card>
            <v-card-title class="headline">
                En el siguiente video puede visualizar un pequeño <br> tutorial con 
                respecto al
                uso de la presente pantalla:
            </v-card-title>
            <iframe class="video" :src="url" allowfullscreen frameborder="0">
            </iframe>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="var(--turquoise)" outlined @click="close"><v-icon left>mdi-check</v-icon>OK</v-btn>
            <v-spacer></v-spacer>
            </v-card-actions>
            </v-card>
    </v-dialog>
    </div>
    

    

</template>
<script>
import urls from "../util/VideoTutoriales/urlsVideos.js";

export default {
    name: 'HelpButton',
    props:{
        urlKey:String,
    },
    data(){
        return{
            dialogActivate : false,
            url : "",
        };
    },
    methods:{
        click(){
            this.dialogActivate = true;
        },
        close(){
            this.dialogActivate = false;
        }
    },
    created(){
        this.url = urls[this.urlKey];
    },
}
</script>

<style scoped>
@import '../assets/styles.css';

.video{
    display : block;
    width:92%;
    height: 20em;
    margin: 0 auto;
    text-align: center;
}
</style>
