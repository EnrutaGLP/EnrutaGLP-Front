<template>
    <v-file-input
        chips
        show-size
        truncate-length="50"
        :disabled="disabled"
        @change="fileChanged"
    >
    </v-file-input>
</template>


<script>
import { readAlumnos, readXlsxAlumnos, readXlsAlumnos } from '../util/import/readFile';
export default{
    name: 'InputFileAlumnos',
    props: {
        disabled: Boolean,
    },
    data: () => ({
        success: false,
        datos: [],
        contenido: {},
    }),
    methods: {
        async fileChanged(arch) {
            this.datos = readAlumnos(arch);
            console.log("saliendo de readFile.js: ", this.datos);
            this.success = true;
            this.$emit("entregarDatos", this.datos);
        },
    },
}
</script>


<style scoped>
</style>