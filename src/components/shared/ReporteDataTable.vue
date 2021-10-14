<template>
    <div> 
        <v-data-table
            :headers="columnas"
            :items="filas"
            class="elevation-7"
            no-data-text="No hay datos"
        >
        </v-data-table>
    </div>
</template>

<script>

export default {
    name: 'ReporteDataTableRE',
    props: {
        columnas: Array,
        filas: Array,
    },
}
</script>>
