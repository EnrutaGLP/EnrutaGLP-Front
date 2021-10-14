<template>
    <div class="modalCard">
        <v-dialog
            v-model="dialog"
            max-width="35rem"
        >
            <template v-slot:activator="{ on, attrs }">
                <div>
                    <v-progress-circular :value="40" indeterminate v-if="cargando"></v-progress-circular>
                    <v-btn class="btnImportar"
                        v-bind="attrs"
                        v-on="on"
                    >
                    <v-icon dark left>mdi-file-import-outline</v-icon>
                        Importar Alumnos
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span>Subir Archivo</span>
                </v-card-title> 
                <hr>
                <v-card-text>
                    <span>Solo se admiten archivos con extensión .xls</span>
                    <br/>
                    <span>Este archivo lo puede descargar del Campus Virtual en la sección de Cursos y Actividades > Curso > Alumnos > Copiar a disco</span>
                    <br>
                    <div class="inputFile">
                        <InputFileAlumnos 
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
                    ><v-icon left>mdi-close</v-icon>
                        Cancelar
                    </v-btn>
                    <v-btn
                        color="var(--turquoise)"
                        outlined
                        class="btnGuardarModal"
                        @click="enviarAlumnosATabla"
                    ><v-icon left>mdi-check</v-icon>
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>  
    </div>  
</template>


<script>
import InputFileAlumnos from './InputFileAlumnos';

export default {
    name: 'ModalInputFile',
    components: {
        InputFileAlumnos,
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
        },

        enviarAlumnosATabla() {
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
        background-color: var(--wb2) !important;
        margin-left: 15px;
    }

</style>