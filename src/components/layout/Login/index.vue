<template>
    <v-img class="contenedor"
        aspect-ratio="2"
        gradient="to top right, rgba(50,115,30,.33), rgba(25,32,72,1)"
        src="../../assets/shared_images/fondoLogin.jpg">
        <div class="login-page">
            <img class="Logo" v-bind:src="LoginLogo">
            <div class="form">
                <v-form class="login-form">
                    <label class="title"><strong>Iniciar Sesión</strong></label>
                    <v-divider/>
                    <div class="inputs">
                        <!-- <v-text-field class="inputCorreo"
                            label="Correo Electrónico"
                            prepend-icon="mdi-email"
                            v-model="correo"
                            @blur="checkRegex"
                            clearable
                            :rules="[rules.required, rules.email]"
                        ></v-text-field> -->
                        <v-text-field class="inputCorreo"
                            label="Correo Electrónico"
                            prepend-icon="mdi-email"
                            v-model="correo"
                            clearable
                            :rules="[rules.required, rules.email]"
                        ></v-text-field>
                        <!--<transition name="slide-fade">
                            <label class="denied correo" v-if="errorCorreo">Ingrese su correo<br /></label>
                        </transition>
                        <transition name="slide-fade">
                            <label class="denied errorCorreo" v-if="errorRegexCorreo">Ingrese un correo válido</label>
                        </transition>-->
                        <v-text-field class="inputPassword"
                            v-model="contrasena"
                            prepend-icon="mdi-lock"
                            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="show1 ? 'text' : 'password'"
                            name="input-10-1"
                            label="Contraseña"
                            counter
                            @click:append="show1 = !show1"
                            :rules="[rules.required]"
                        ></v-text-field>
                        <!--<transition name="slide-fade">
                            <label class="denied constrasena" v-if="errorContrasena">Ingrese su contraseña</label>
                        </transition>-->
                    </div>
                    <v-btn
                        class="submit"
                        @click.prevent="onSubmit"
                        large 
                        :loading="loading"
                    >
                        Ingresar<v-icon right dark>mdi-login</v-icon>
                    </v-btn>
                    <div class="separadorBotones">
                        <v-divider/> o <v-divider/>
                    </div>
                    
                    
                </v-form>
                <div class="footer">
                    <!--<div class="important-text" >
                        <router-link to="/reestablecerContrasena">
                            <a>¿Olvidaste tu contraseña?</a>
                        </router-link>
                        <br />
                        <br>
                        <div class="denied" v-if="incorrect">Datos incorrectos</div>
                        <div class="denied" v-if="noPermission">No tiene permiso para ingresar al sistema</div>
                    </div>-->
                    <Alert
                        v-bind:senalAlerta="senalAlerta"
                        v-bind:textoAlerta="textoAlertaError"
                        v-bind:hayAlert="incorrect"
                    />
                    <Alert
                        v-bind:senalAlerta="senalAlerta"
                        v-bind:textoAlerta="textoAlertaPermisos"
                        v-bind:hayAlert="noPermission"
                    />
                </div>
            </div>
        </div>
    </v-img>
    
</template>
<script>
import LoginLogo from '../../assets/shared_images/logo_full_horizontal.png';
import regeneratorRuntime from 'regenerator-runtime';
import { getAcceso, validarUsuario} from '../../util/services';
import * as CryptoJS from 'crypto-js';
import Alert from '../../shared/Alert.vue';

export default {
    name: 'Login',
    components: {
        Alert,
    },
    data: () => ({
        LoginLogo,
        correo: '',
        contrasena: '',
        errorCorreo: false,
        errorContrasena: false,
        errorRegexCorreo: false,
        loading: false,
        isSignIn: false,
        show1: false,
        rules: {
            required: value => !!value || 'Requerido.',
            email: value => {
                var regex = new RegExp("[a-zA-Z0-9\.]+\@pucp\.(edu\.)?pe");
                return true //regex.test(value) || 'Correo no válido.'; // validacion de correo que hay que cambiar 
            },
        },
        noPermission: false,
        incorrect: false,
        senalAlerta: 1,
        textoAlertaError:"Datos incorrectos",
        textoAlertaPermisos:"No tiene permiso para ingresar al sistema",
        hayAlert: false,
    }),
    methods: {
        fracaso(error){
            console.log("error auth", error);
            this.noPermission=true;
            setTimeout(() => {
                this.noPermission=false;
            }, 2000);
            this.loading = false;
        },
        getData() {
            getAcceso(this.correo, this.contrasena).then((result) => {
                this.loading = true;
                console.log(result);
                if (result.data.access == 1) {
                    if(result.data.datos[0].personas.rol == 2 || result.data.datos[0].personas.rol == 4 || result.data.datos[0].personas.rol == 6){
                        if(result.data.especialidaes.length===0 && result.data.facultades.length===0){//no esta asigado a ninguna esp o fac
                            console.log("asistente");
                            console.log("esto es: "+result.data.especialidades_asistente);
                            if(result.data.especialidades_asistente!==undefined){//es asistent
                                for(let i=0;i<result.data.especialidades_asistente.length;i++){
                                    result.data.especialidaes.push(result.data.especialidades_asistente[i]);
                                }
                                console.log(result);
                                let jsonEncriptado=CryptoJS.AES.encrypt(JSON.stringify(result.data),'json').toString();
                                let accesoEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.rol.toString(),'acceso').toString();
                                let idPersonaEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.id_persona.toString(),'id_persona').toString();
                                localStorage.setItem('acceso', accesoEncriptado);
                                localStorage.setItem('id_persona', idPersonaEncriptado);
                                localStorage.setItem('json',jsonEncriptado);
                                this.$router.push('/home');
                            }else{
                                this.loading=false;
                                this.incorrect=true;
                                setTimeout(() => this.incorrect = false, 2000);
                            }
                        }else{
                            let jsonEncriptado=CryptoJS.AES.encrypt(JSON.stringify(result.data),'json').toString();
                            let accesoEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.rol.toString(),'acceso').toString();
                            let idPersonaEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.id_persona.toString(),'id_persona').toString();
                            localStorage.setItem('acceso', accesoEncriptado);
                            localStorage.setItem('id_persona', idPersonaEncriptado);
                            localStorage.setItem('json',jsonEncriptado);
                            this.$router.push('/home');
                        }
                    }else if(result.data.datos[0].personas.rol == 3){
                        if(result.data.datos[0].personas.funcion.includes("Asistente")){
                            if(result.data.especialidades_asistente!==undefined){
                                for(let i=0;i<result.data.especialidades_asistente.length;i++){
                                    result.data.especialidaes.push(result.data.especialidades_asistente[i]);
                                }
                                
                                console.log(result);
                                let jsonEncriptado=CryptoJS.AES.encrypt(JSON.stringify(result.data),'json').toString();
                                let accesoEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.rol.toString(),'acceso').toString();
                                let idPersonaEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.id_persona.toString(),'id_persona').toString();
                                localStorage.setItem('acceso', accesoEncriptado);
                                localStorage.setItem('id_persona', idPersonaEncriptado);
                                localStorage.setItem('json',jsonEncriptado);
                                this.$router.push('/home');
                            }else{
                                let jsonEncriptado=CryptoJS.AES.encrypt(JSON.stringify(result.data),'json').toString();
                                let accesoEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.rol.toString(),'acceso').toString();
                                let idPersonaEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.id_persona.toString(),'id_persona').toString();
                                localStorage.setItem('acceso', accesoEncriptado);
                                localStorage.setItem('id_persona', idPersonaEncriptado);
                                localStorage.setItem('json',jsonEncriptado);
                                this.$router.push('/home');
                            }
                        }else{
                            let jsonEncriptado=CryptoJS.AES.encrypt(JSON.stringify(result.data),'json').toString();
                            let accesoEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.rol.toString(),'acceso').toString();
                            let idPersonaEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.id_persona.toString(),'id_persona').toString();
                            localStorage.setItem('acceso', accesoEncriptado);
                            localStorage.setItem('id_persona', idPersonaEncriptado);
                            localStorage.setItem('json',jsonEncriptado);
                            this.$router.push('/home');
                        }
                    }else{
                        let jsonEncriptado=CryptoJS.AES.encrypt(JSON.stringify(result.data),'json').toString();
                        let accesoEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.rol.toString(),'acceso').toString();
                        let idPersonaEncriptado=CryptoJS.AES.encrypt(result.data.datos[0].personas.id_persona.toString(),'id_persona').toString();
                        localStorage.setItem('acceso', accesoEncriptado);
                        localStorage.setItem('id_persona', idPersonaEncriptado);
                        localStorage.setItem('json',jsonEncriptado);
                        this.$router.push('/home');
                    }
                }
                else {
                    this.loading = false;
                    this.incorrect = true;
                    setTimeout(() => this.incorrect = false, 2000);
                }
            }).catch((e) => {
                console.log(e);
                this.loading = false;
            });
        },
        checkRegex() {
            var regex = new RegExp("[a-zA-Z0-9\.]+\@pucp\.(edu\.)?pe");
            let error = regex.test(this.correo);
            if(!error) {
                this.errorRegexCorreo = true;
                setTimeout(() => { this.errorRegexCorreo = false; }, 2000);
            }
            // return error;
            return true;
        },
        alertErrorCorreo() {
            if(this.errorRegexCorreo != true)
                this.errorCorreo = false;
        },
        verificaCorreo() {
            let error = this.checkRegex();
            this.alertErrorCorreo()
            return this.correo == '' || !error;
        },
        verificaContrasena() {
            this.errorContrasena = false;
            return this.contrasena == '';
        },
        onSubmit() {
            this.correo = this.correo.trim();
            if(this.verificaCorreo() || this.verificaContrasena()) {
                this.verificaCorreo() ? this.alertErrorCorreo() : null;
                this.verificaContrasena() ? this.errorContrasena = true : null;
            }
            else {
                this.loading = true;
                this.getData();
            }
        },
        
    },
    computed: {
        color: function() {
            return getComputedStyle(document.documentElement).getPropertyValue('--dark-blue');
        }
    },
    created(){
        let accesoEncriptado=CryptoJS.AES.encrypt("6",'acceso').toString();
        localStorage.setItem('acceso', accesoEncriptado);
        this.$router.push('/enruta-glp');
    }
};
</script>

<style scoped>
    @import '../../assets/styles.css';

    .login-page {
        width: 420px;
        padding: 5% 0 0;
        margin: auto;
    }

    .form {
        position: relative;
        z-index: 1;
        background: var(--wb1);
        max-width: 420px;
        margin: 0 auto 100px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
    }

    .login-form {
        padding: 35px;
    }

    .Logo{
        position: relative;
        width: 420px;
        height: 80px;
    }

    .form input {
        font-family: "Roboto", sans-serif;
        outline: 0;
        background: var(--wb1pto5);
        width: 100%;
        border: 0;
        margin: 15px 0 15px;
        padding: 15px;
        box-sizing: border-box;
        font-size: 14px;
    }

    .inputPassword{
        margin-top: 2rem;
    }

    .submit{
        font-family: "Roboto", sans-serif !important;
        text-transform: uppercase !important;
        outline: 0 !important;
        background-color: var(--turquoise) !important;
        width: 100% !important;
        border: 0 !important;
        padding: 15px !important;
        margin-top: 15px !important;
        margin-bottom: 15px !important;
        color: var(--wb1) !important;
        font-size: 14px !important;
        border-radius: 0rem;
        -webkit-transition: all 0.3 ease !important;
        transition: all 0.3 ease !important;
        cursor: pointer !important;
        
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1), 0 5px 5px 0 rgba(0, 0, 0, 0.20);
    }

    .form .message {
        margin: 15px 0 0;
        color: var(--wb2);
        font-size: 12px;
    }

    .form .message a {
        color: var(--wb1);
        text-decoration: none;
    }

    .footer {
        padding-block: 1rem;
        display: block;
        justify-content: space-between;
    }

    .denied {
        /*color: #EF3B3A;*/
        text-decoration: none;
        padding: 5px 15px;
        border-radius: 50px;

        font-family: "Roboto", sans-serif !important;
        text-transform: uppercase !important;
        outline: 0 !important;
        background-color: var(--turquoise) !important;
        width: 100% !important;
        border: 0 !important;
        margin-top: 15px !important;
        margin-bottom: 15px !important;
        color: var(--wb1) !important;
        font-size: 14px !important;
        -webkit-transition: all 0.3 ease !important;
        transition: all 0.3 ease !important;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1), 0 5px 5px 0 rgba(0, 0, 0, 0.20);
    }

    .slide-fade-enter-active {
        transition: all .3s ease;
    }

    .slide-fade-leave-active {
        transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }

    .slide-fade-enter, .slide-fade-leave-to {
        transform: translateX(10px);
        opacity: 0;
    }

    .inputs {
        padding-block: 1.5rem;
    }

    .separadorBotones {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-block: 1rem;
    }

    .contenedor {
        background-color: var(--wb3) !important;
        height: 100%;
        background-image: linear-gradient(to top right, rgba(50,115,30,.33), rgba(25,32,72,1));
    }

</style>
