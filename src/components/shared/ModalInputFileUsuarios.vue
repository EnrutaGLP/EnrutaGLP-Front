<template>
    <div class="modalCard">
        <v-dialog
            v-model="dialog"
            max-width="35rem"
        >
            <template v-slot:activator="{ on, attrs }">
                <div>
                    <v-btn class="btnImportar"
                        v-bind="attrs"
                        v-on="on"
                        :loading="cargando"
                        dark
                        color="#7434EB"
                    >
                        Importar Bloqueos
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span>Subir Archivo</span>
                </v-card-title>
                <hr>
                <v-card-text><br>
                    <div class="inputFile">
                        <InputFileUsuarios
                            v-bind:disabled="disabled"
                            v-model="datos"
                            v-on:entregarDatos="recibirDatos"
                        />
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="var(--coral)"
                        outlined
                        class="btnCancelarModal"
                        @click="cancelar"
                    >
                        <v-icon left>mdi-close</v-icon>
                        Cancelar
                    </v-btn>
                    <v-btn
                        color="var(--turquoise)"
                        outlined
                        class="btnGuardarModal"
                        @click="enviarUsuariosATabla"
                    >
                    <v-icon left>mdi-check</v-icon>
                        Subir
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import InputFileUsuarios from "./InputFileUsuarios";
    
    export default {
        name: 'ModalInputFile',
        components: {
            InputFileUsuarios,
        },
    props: {
        disabled: Boolean,
        cargando: {
            type: Boolean,
            default: true,
        }
        },
        data: () => ({
            dialog: false,
            archivo: null,
            success: false,
            datos: [],
            files: [],
        }),
        methods: {
            cancelar() {
                this.dialog = false;
            },

            recibirDatos(datos) {
                this.datos = datos;
                /*this.$emit("importarDatos", this.datos);
                this.dialog = false;*/
            },

            enviarUsuariosATabla() {
                this.$emit("importarDatos", this.datos);
                this.dialog = false;
                console.log("saliendo del modal: ", this.datos);
            },
        }
    }
</script>

<style scoped>
    @import '../assets/styles.css';
    .inputFile {
        margin: 2rem;
    }

    .btnImportar {
        margin-left: 15px;
    }
</style>
