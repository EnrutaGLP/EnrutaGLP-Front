<template>
    <v-data-table
      :headers="cabeceras"
      :items="dataList"
      sort-by=""
      class="elevation-1"
    >
        <template v-slot:[`item.terminado`]="{ item }">
            
            <v-icon
                v-if="item.terminado"
                medium
                class="mr-2"
            >
                mdi-check
            </v-icon>
            

            <v-icon
                v-else
                medium
                class="mr-2"
            >
                mdi-clock-time-twelve-outline
            </v-icon>
            <span v-if="item.terminado">Terminado</span>
            <span v-else > En proceso </span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <!---<v-btn
                small
                class="link-button"
                @click="goTo(item)"
            >
                <v-icon left>
                    mdi-seal
                </v-icon>
                Notas
            </v-btn>--->
            <v-icon
                medium
                class="mr-2"
                @click="goTo(item)"
            >
                mdi-magnify
            </v-icon>
        </template>
        <template v-slot:no-data>
            No hay datos
        </template>
    </v-data-table>
</template>

<script>
export default {
    name: 'LinkDataTable',
    props: {
        headers: Array,
        dataList: Array,
        idSemestre: Number,
        nombreSemestre: String,
    },
    data() {
        return ({
            cabeceras: this.headers ? this.headers : [],
            hayData: this.dataList.length === 0,
        });
    },
    created() {
        this.cabeceras.push(
        { text: 'Acciones', value: 'actions', sortable: false },
        );
    },
    methods: {
        goTo(item) {
            this.$router.push({
                name: 'MedicionesDetalle',
                params: {
                    curso: item.nombreCurso,
                    horario: item.Horario,
                    idMuestra: item.idMuestra,
                    idSemestre: this.idSemestre,
                    nombreSemestre: this.nombreSemestre,
                    terminar: item.terminado,
                },
            });
        },
    },
};
</script>

<style scoped>
@import '../../../../assets/styles.css';
    .link-button {
        border: none;
        color: var(--wb1) !important;
        background-color: var(--dark-blue) !important;
        padding: 8px 16px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 12px;
        font-family: 'Roboto';
        margin: 4px 2px;
        transition-duration: 0.4s;
        cursor: pointer;
        border-radius: 8px;
    }
</style>
