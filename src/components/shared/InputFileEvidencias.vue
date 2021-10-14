<template>
    <v-file-input
    chips
    counter
    multiple
    show-size
    small-chips
    truncate-length="50"
    @change="filesChanged"
    >
    </v-file-input>
</template>


<script>
//import { RExcelAlumnos } from '../util/import/readExcel';

    export default{
        name: 'InputFileEvidencias',
        data: () => ({
            success: false,
            datos: [],
        }),
        methods: {
            filesChanged(file) {
                this.datos = file;
                this.success = true;
                this.$emit("entregarDatos", this.datos);
            },
        }
    }
</script>


<style scoped>
</style>