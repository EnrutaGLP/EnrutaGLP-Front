<template>
    <v-file-input
        chips
        show-size
        truncate-length="50"
        :disabled="disabled"
        @change="fileChanged"
    ></v-file-input>
</template>

<script>
    import { readXlsxBloqueos, readUsuarios } from "../util/import/readFile";
    export default{
        name: 'InputFileUsuarios',
        props: {
            disabled:Boolean,
        },
        data: () => ({
            success: false,
            datos: [],
            contenido: {},
        }),
        methods: {
            async fileChanged(arch) {
                console.log(arch);
                this.datos = readXlsxBloqueos(arch);
                console.log("datos",this.datos);
                this.success = true;
                this.$emit("entregarDatos",this.datos);
            },
        }
    }
</script>

<styles scoped>

</styles>
