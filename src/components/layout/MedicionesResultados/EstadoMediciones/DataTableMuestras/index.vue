<template>
    <v-data-table
      :headers="cabeceras"
      :items="dataList"
      sort-by=""
      class="elevation-1"
    >
        <template v-slot:[`item.estado`]="{ item }">
            <v-switch
                v-model="item.estado"
                :label="`${getEstado(item.estado)}`"
                @change="cambioEstado(item)"
            />
        </template>
        <template v-slot:[`item.actions`]="{ item }">
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
    name: 'DataTableMuestras',
    props: {
        headers: Array,
        dataList: Array,
    },
    data() {
        return ({
            cabeceras: this.headers ? this.headers : [],
            hayData: this.dataList.length == 0,
        });
    },
    methods: {
        getEstado(estado){
            return estado ? 'Activo' : 'Terminado';
        },
        cambioEstado(item){
            this.$emit("cambioEstado", item);
        },
        goTo(item){
            this.$emit("linkTo", item);
        },
    },
    created(){
        this.cabeceras.push(
            { text: 'Acciones', value: 'actions', sortable: false },
        );
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