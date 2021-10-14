<template>
    <div class="modalCard">
        <v-dialog
            v-model="dialog"
            max-width="600px"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color=#3DBEAB
                    outlined
                    v-bind="attrs"
                    v-on="on"
                >
                    Reporte
                </v-btn>
            </template>
            <v-card>
                <div class="container">
                    <v-card-title color='teal accent-4'>
                        <span>Resumen de medición</span>
                    </v-card-title>
                    <DataTable 
                        :columnas="headers"
                        :filas="rows"
                    />
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color=#3DBEAB
                            outlined
                            @click="dialog = false"
                        >
                            Aceptar
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>  
    </div>  
</template>

<script>
import DataTable from '../../../../../shared/DataTable.vue';

export default {
    name: 'DialogReporte',
    components: {
        DataTable,
    },
    props: {
        headers: Array,
        rows: Array,
    },
    data: () => ({
      dialog: false,
    }),
}
</script>

<style scoped>
.container {
    padding: 15px;
    max-height: 450px;
    overflow-x: scroll;
}
</style>