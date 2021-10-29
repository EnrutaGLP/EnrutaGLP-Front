<template>
    <div class="contenedorPrincipal">
        <div class="rubrica">
            <Title texto="Operaciones del día a día"/>
            <br>
            <div class="botones">
                <v-row>
                    <v-col>
                        <AveriasDialog
                            v-on:cambio="registroAveria"            
                        />
                    </v-col>
                    <v-col>
                        <ModalInputFileUsuarios
                            :disabled="false"
                            v-on:importarDatos="subirBloqueos"
                            :cargando="cargaBloqueos"
                        />
                    </v-col>
                </v-row>
            </div>
            <br>
            <br>
            <v-alert
                :value="hayAlerta"
                v-bind:type="tipoAlerta"
                transition="scale-transition"
            >
                {{textoAlerta}}
            </v-alert>
            <div class="mapa">
                <MapaDiaADia
                    v-bind:averia="nuevaAveria"
                />
                
            </div>
            <div class="row">
                <div class="col sm-5">
                    <BackButton></BackButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MapaDiaADia from '../OperacionDiaADia/MapaDiaADia.vue'
import {
    setAveria, setBloqueosMasivo, setConfiguracionDiaADia
} from '../../../util/services/index';
import Title from '../../../shared/Title.vue';
import BackButton from '../../../shared/BackButton.vue';
import AveriasDialog from './AveriasDialog/index.vue';
import ModalInputFileUsuarios from "../../../shared/ModalInputFileUsuarios.vue";


export default {
    name: 'Rubrica',
    components: {
        BackButton,
        Title,
        AveriasDialog,
        ModalInputFileUsuarios,
        MapaDiaADia,
    },
    data() {
        return {
            tipoAlerta:"success",
            textoAlerta:"",
            hayAlerta: false,

            cargaBloqueos:false,

            nuevaAveria:"",
        };
    },
    methods: {
        async subirBloqueos(listaBloqueos){
            this.cargaBloqueos=true;
            console.log(listaBloqueos);
            try{
                let data=await setBloqueosMasivo(listaBloqueos);
                console.log(data);
                this.cargaBloqueos=false;
                this.manejarAlerta(0,1);
            }catch(err){
                this.cargaBloqueos=false;
                this.manejarAlerta(1,1);
            }
        },
        async registroAveria(dato){
            try {
                //let data=await setAveria(dato);
                //console.log(data);
                //data.data.status!="error"
                if(true){
                    this.nuevaAveria=dato;
                    this.manejarAlerta(0,0);
                }else{
                    this.manejarAlerta(1,0);
                }
            } catch (err) {
                this.manejarAlerta(1,0);
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.tipoAlerta="success";
                if(accion==0) {
                    this.textoAlerta="Se registró exitosamente la avería";
                }else if(accion==1){
                    this.textoAlerta="Se registraron los bloqueos";
                }
            }else {
                this.tipoAlerta="error";
                if(accion==0) {
                    this.textoAlerta="Hubo un error al registrar la avería";
                }else if(accion==1){
                    this.textoAlerta="Hubo un error al registrar los bloqueos";
                }
            }
            this.hayAlerta=true;
            setTimeout(() => {
                this.hayAlerta = false;
            }, 2000);
        },
    },

    async created() {
        try {
            let data=await setConfiguracionDiaADia();
            console.log(data);
        } catch (err) {
            console.log(err);
        }
    },
};
</script>
<style scoped>
    .botones{
        float:right;
    }
</style>