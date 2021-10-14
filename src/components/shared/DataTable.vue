<template>
    <div> 
        <v-data-table
            :headers="columnas"
            :items="filas"
            class="elevation-7"
        >
            <template v-slot:no-data>
                No hay datos
            </template>
        </v-data-table>
    </div>
</template>

<script>
export default {
    name: 'DataTable',
    props: {
        columnas: Array,
        filas: Array,
    },
}
</script>>
