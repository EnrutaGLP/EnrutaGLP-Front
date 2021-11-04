<template>
    <v-dialog
        v-model="dialog"
        max-width="500px"
        max-heigth="500px"
    >
        <template v-slot:activator="{ on, attrs }">
            <div class="contenedorAveriasDialog">
                <span class="separacion"></span>
            <v-btn
                color="#7434EB"
                dark
                class="mb-4"
                v-bind="attrs"
                v-on="on"
            >
                Reportar avería
            </v-btn>
            </div>
        </template>
        <v-card>
            <v-card-title>
                <span class="headline">Ingrese el camión con la avería</span>
            </v-card-title>
            <v-form  ref="form">
                <v-card-text>
                    <v-text-field
                        v-model="codigo"
                        label="Código del camión"
                        :rules="[rules.required]"
                        counter
                        maxlength="50"
                    ></v-text-field>
                </v-card-text>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="var(--coral)"
                    outlined
                    @click="close"
                ><v-icon left>mdi-close</v-icon>
                    Cancelar
                </v-btn>
                <v-btn
                    color="var(--turquoise)"
                    outlined
                    @click="save"
                ><v-icon left>mdi-check</v-icon>
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

export default {
    name: 'AveriasDialog',
    props: {
        
    },
    components: {
        
    },
    data() {
        return ({
            dialog: false,
            codigo:"",
            rules:{
                required: value => !!value || 'No puede dejar campos vacíos',
            },
        });
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
    },

    methods: {
        close() {
            this.codigo="";
            this.$refs.form.resetValidation();
            this.dialog = false;
        },

        save() {
            if(this.codigo!=""){
                this.$emit("cambio",this.codigo); 
                this.close();   
            }
        },
    },
};
</script>
<style>
    .separacion{
        margin: 4rem;
    }
</style>