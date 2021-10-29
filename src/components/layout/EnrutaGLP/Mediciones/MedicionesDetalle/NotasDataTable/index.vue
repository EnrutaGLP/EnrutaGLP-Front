<template>
    <v-card>
        <v-card-title>
            Alumnos
            <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar alumno por nombre o código"
            single-line
            hide-details
            clearable
        ></v-text-field>
        </v-card-title>
        <v-data-table
            :headers="cabeceras"
            :items="dataList"
            :search="search"
            sort-by=""
            class="elevation-1"
            dense
        >
            <template v-slot:top>
                <v-toolbar
                    class="toolbar"
                    flat
                >
                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                            <v-card-title class="headline">¿Está seguro que quieres eliminar este elemento?</v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="var(--coral)" outlined @click="closeDelete"><v-icon left>mdi-close</v-icon>Cancelar</v-btn>
                                <v-btn color="var(--turquoise)" outlined @click="deleteItemConfirm"><v-icon left>mdi-check</v-icon>OK</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:[`item.calificacion`]="{ item }">
                <v-radio-group
                    v-model="item.calificacion"
                    row
                    :disabled="disableGrades"
                >
                    <v-radio
                        v-for="i in niveles" 
                        :key="i.idNivelDesempeno"
                        :label="i.nombre"
                        :value="i.idNivelDesempeno"
                    >{{ i.valor }}</v-radio>
                </v-radio-group>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon
                    medium
                    :disabled="disableDelete"
                    @click="deleteItem(item)"
                >
                    mdi-delete
                </v-icon>
            </template>
            <template v-slot:no-data>
                No hay datos
            </template>
        </v-data-table>
    </v-card>
</template>


<script>
export default {
    name: 'NotasDataTable',
    props: {
        headers: Array,
        dataList: Array,
        editedItem: Object,
        defaultItem: Object,
        niveles: Array,
        disableGrades: Boolean,
        disableDelete: Boolean,
    },
    data() {
        return ({
            dialogDelete: false,
            cabeceras: this.headers ? this.headers : [],
            editedIndex: -1,
            hayData: this.dataList.length === 0,
            edited: this.editedItem ? this.editedItem : {},
            default: this.defaultItem ? this.defaultItem : {},
            row: 1,
            search: '',
        });
    },
    watch: {
        dialogDelete(val) {
            val || this.closeDelete();
        },
    },

    created() {
        this.cabeceras.push(
            { text: 'Acciones', value: 'actions', sortable: false },
        );
    },
    methods: {
        editItem (item) {
        },

        deleteItem(item) {
            this.editedIndex = this.dataList.indexOf(item);
            this.edited = { ...item };
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            this.$emit('eliminar', this.editedIndex);// pasa el id
            this.closeDelete();
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.edited = { ...this.default };
                this.editedIndex = -1;
            });
        },
    },
};
</script>

<style>
.toolbar {
    height: 0;
    display: none;
}
</style>
