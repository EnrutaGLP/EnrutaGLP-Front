<template>
    <div class="modalCard">
        <v-dialog
            v-model="dialog"
            max-width="600px"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color='teal accent-4'
                    v-bind="attrs"
                    v-on="on"
                >
                    Agregar Oportunidad
                </v-btn>
            </template>
            <v-card>
                <v-card-title color='teal accent-4'>
                    <span>Registrar Oportunidad de Mejora</span>
                </v-card-title>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6" md="4">
                            Codigo de oportunidad: 
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field required></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="4">
                            Descripcion: 
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-textarea solo></v-textarea>
                        </v-col>
                    </v-row>
                    Propuestas de mejora:
                    <DataTable/>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="blue darken-1"
                            text
                            @click="dialog = false"
                        >
                            Close
                        </v-btn>
                        <v-btn
                            color="blue darken-1"
                            text
                            @click="dialog = false"
                        >
                            Save
                        </v-btn>
                    </v-card-actions>
                </v-container>
            </v-card>
        </v-dialog>  
    </div>  
</template>

<script>
import DataTable from './DataTable';
export default {
    name: 'RegistrarPlanMejora',
    components: {
        DataTable,
    },
    data: () => ({
      dialog: false,
    }),
}
</script>

<style scoped>
</style>