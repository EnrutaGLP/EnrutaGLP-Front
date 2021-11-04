<template>
    <v-dialog
        v-model="dialog"
        max-width="700px"
        max-height="800px"
    >
        <template v-slot:activator="{ on, attrs }">
            <div class="contenedorBloqueosDialog">
                <span class="separacion"></span>
            <v-btn
                color="#7434EB"
                dark
                class="mb-4"
                v-bind="attrs"
                v-on="on"
            >
                Registrar bloqueo
            </v-btn>
            </div>
        </template>
        <v-card>
            <v-card-title>
                <span class="headline">Agregar Bloqueo</span>
            </v-card-title>
            <v-form  ref="form">
                <v-card-text>
                    <v-row>
                        <v-col cols="12" sm="6" md="8">
                            <DatePicker
                                v-bind:date="fechaIniBloqueo"
                                v-on:cambio-fecha="cambioFechaIniBloqueo"
                                texto="Fecha de inicio del bloqueo"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="8">
                            <TimePicker
                                
                                v-on:cambio-hora="cambioHoraIniBloqueo"
                                texto="Hora de inicio del bloqueo"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="8">
                            <DatePicker
                                v-bind:date="fechaFinBloqueo"
                                v-on:cambio-fecha="cambioFechaFinBloqueo"
                                texto="Fecha de fin del bloqueo"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="8">
                            <TimePicker
                                
                                v-on:cambio-hora="cambioHoraFinBloqueo"
                                texto="Hora de fin del bloqueo"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="8">
                            <v-text-field
                                v-model="bloqueo"
                                label="Coordenadas del bloqueo"
                                :rules="[rules.required]"
                                counter
                                maxlength="60"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="var(--coral)"
                    outlined
                    @click="close"
                ><v-icon left>mdi-close</v-icon>
                    Cancelar
                </v-btn>
                <v-btn
                    color="var(--turquoise)"
                    outlined
                    @click="save"
                ><v-icon left>mdi-check</v-icon>
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>    
</template>
<script>

import DatePicker from "../../../shared/DatePicker.vue"
import TimePicker from "../../../shared/TimePicker.vue"

export default{
    name: 'BloqueosDialog',
    props: {
        
    },
    components: {
        DatePicker,
        TimePicker,
    },
    data() {
        return {
            dialog: false,
            bloqueo:"",
            fechaIniBloqueo:"",
            horaIniBloqueo:"",
            fechaFinBloqueo:"",
            horaFinBloqueo:"",
            rules:{
                required: value => !!value || 'No puede dejar campos vacíos',
            },
        }
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
    },

    methods: {
        close() {
            this.bloqueo="";
            this.$refs.form.resetValidation();
            this.dialog = false;
        },
        save() {
            if(this.bloqueo!=""){
                this.$emit("cambio",this.bloqueo,this.fechaIniBloqueo,this.horaIniBloqueo,this.fechaFinBloqueo,this.horaFinBloqueo);
                this.close();
            }
        },
        cambioFechaIniBloqueo(dato){
            this.fechaIniBloqueo=dato;
        },
        cambioHoraIniBloqueo(dato){
            this.horaIniBloqueo=dato;
        },
        cambioFechaFinBloqueo(dato){
            this.fechaFinBloqueo=dato;
        },
        cambioHoraFinBloqueo(dato){
            this.horaFinBloqueo=dato;
        },
    },
}
</script>
<style>
    .separacion{
        margin: 4rem;
    }
</style>