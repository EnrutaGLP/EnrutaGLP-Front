<template>
    <div class="contenedorPrincipal">
        <div class="reestablecerContrasena">
            <br>
            <div>
                <div class="cambiarContrasena">
                    <Alert
                        v-bind:senalAlerta="senalAlerta"
                        v-bind:textoAlerta="textoAlerta"
                        v-bind:hayAlert="hayAlert"
                    />
                    <Title texto="Reestablecer Contraseña"/>
                    <table allign="left" cellpadding="5">
                        <tr>
                            <td>Correo: </td>
                            <td class="col sm-12">
                                <v-text-field
                                    label="Ingrese su correo"
                                    v-model="correo"
                                    :disabled="disabledCorreo"
                                ></v-text-field>
                            </td>
                        </tr>
                        <tr>
                            <td>Nueva Contraseña: </td>
                            <td class="col sm-12">
                                <v-text-field
                                    label="Ingrese su nueva contraseña"
                                    v-model="contrasena"
                                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="show1 ? 'text' : 'password'"
                                    @click:append="show1 = !show1"
                                    :rules="[rules.minimo,rules.maximo]"
                                    countes
                                    maxlength="25"
                                ></v-text-field>
                            </td>
                        </tr>
                            <v-btn
                                class="boton"
                                @click="cambiarContrasena"
                            >
                                Cambiar
                            </v-btn>                                
                        <tr>
                            <td>
                                <div class="row">
                                    <div class="botonVolver">
                                        <BackButton></BackButton>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import * as CryptoJS from 'crypto-js';
import {updateContrasena} from '../../../util/services/index'
import Alert from '../../../shared/Alert.vue'
import Title from '../../../shared/Title.vue'
import BackButton from '../../../shared/BackButton.vue'


export default {
    name: 'ReestablecerContrasena',
    components: {
        Alert,
        Title,
        BackButton,
    },
    data: () => ({
        correo:'',
        contrasena:'',

        show1:false,
        disabledCorreo:false,

        acceso:-1,
        datosUsuario:{

        },

        textoAlerta:"",
        senalAlerta:'',
        hayAlert:false,

        rules:{
            minimo:v=>v.length<=500 || 'Minimo 5 caracteres',
            maximo:v=>v.length<=500 || 'Máximo 25 caracteres',
        },
    }),
    methods: {
        async cambiarContrasena(){
            if(this.contrasena.length<5 || this.contrasena.length>25){
                return;
            }else{
                try{
                    let data=await updateContrasena(this.correo,this.contrasena);
                    console.log(data);
                    if(data.data.status!="error"){
                        this.manejarAlerta(0,0);
                        setTimeout(()=>{
                            this.$router.go(-1);
                        },2000)
                    }else{
                        this.manejarAlerta(1,0);
                    }
                }catch(err){
                    console.log(err);
                    this.manejarAlerta(1,0);
                }
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se cambió exitosamente la contraseña";
                }
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta="Hubo un error al cambiar la contraseña";
                }
            }
        }
    },
    created() {
        let acces = localStorage.getItem('acceso');
        if (!acces) {//undefined
            
        }else{
            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            if (this.acceso != 0) {
                let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
                this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
                this.correo=this.datosUsuario.datos[0].personas.email;
                this.disabledCorreo=true;
            }
        }
    }
};
</script>

<style scoped>
    .cambiarContrasena {
        width: 420px;
        padding: 5% 0 0;
        margin: auto;
    }
    .botonVolver{
        position:absolute;
        bottom: 40px;
    }
    .boton{
        font-family: "Roboto", sans-serif !important;
        transition: all 0.3 ease !important;
        color: var(--wb1) !important;
        background-color: var(--turquoise) !important;
    }
</style>