<template>
    <div> 
        <v-data-table
            :headers="columnas"
            :items="filas"
            class="elevation-7"
        >
        </v-data-table>
    </div>
</template>

<script>

export default {
    name: 'ReporteDataTableCursos',
    props: {
        columnas: Array,
        filas: Array,
    },
}
</script>>
