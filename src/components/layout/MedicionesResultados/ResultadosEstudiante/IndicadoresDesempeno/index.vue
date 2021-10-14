<template>
    <div class="contenedorPrincipal">
        <div class="indicadoresDesempeno">
            <Title :texto="titulo" :usarBotonAyuda=true urlKey="indicadores"/>
            <br>
            <div class="row">
                <div>
                    <table allign="left">
                        <tr>
                            <div class="col sm-12">
                                <td><b>Resultado: </b></td>
                            </div>
                            <td>{{nombreResultado}}</td>
                        </tr>
                    </table>
                    <br>
                </div>
            </div>
            <Alert
                v-bind:senalAlerta="senalAlerta"
                v-bind:textoAlerta="textoAlerta"
                v-bind:hayAlert="hayAlert"
            />
            <div class="DataTableIndicadoresDesempeno">
                <DataTableIndicadoresDesempeno
                    v-bind:indicadoresDesempeno ="indicadoresDesempeno"
                    v-bind:idResultado          = "idResultado"
                    v-on:alerta="manejarAlerta"
                />
            </div>
            <br>
            <div class="row">
                <div class="col sm-5">
                    <BackButton></BackButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getIndicadoresDesempeno } from '../../../../util/services/index.js';
import BackButton from '../../../../shared/BackButton.vue';
import Title from '../../../../shared/Title.vue';
import DataTableIndicadoresDesempeno from '../../../../shared/DataTableIndicadoresDesempeno.vue';
import Alert from '../../../../shared/Alert.vue';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'IndicadoresDesempeno',
    components: {
        BackButton,
        Title,
        DataTableIndicadoresDesempeno,
        Alert,
    },
    data() {
        return {
            nombreResultado: '',
            titulo:'',
            indicadoresDesempeno: [],
            idResultado: -1,
            textoAlerta:"",
            senalAlerta:'',
            hayAlert:false,
            acceso: -1,
        };
    },
    methods: {
        async listarIndicadores(idResultado) {
            const data = await getIndicadoresDesempeno(idResultado);
            console.log(data);
            this.indicadoresDesempeno = data.data.indicadorDesempeno;
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se registró exitosamente el indicador de desempeño";
                } else if (accion==1) {//editar
                    this.textoAlerta="Se editó exitosamente el indicador de desempeño";
                } else {//delete
                    this.textoAlerta="Se eliminó exitosamente el indicador de desempeño";
                }
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta='Hubo un error al registrar el indicador de desempeño';
                } else if(accion==1) {//editar
                    this.textoAlerta="Hubo un error al editar el indicador de desempeño";
                } else {//delete
                    this.textoAlerta="Hubo un error al eliminar el indicador de desempeño";
                }
            }
        }
    },
    created() {
        try{
            let acces = localStorage.getItem('acceso');
            if (!acces) {
                this.$router.push('/login');
            }
            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            if (this.acceso == 0) {
                this.$router.push('/login');
            } else if (this.acceso < 2) {
                this.$router.push('/home');
            }
            if(this.$route.params.codigo===undefined){
                this.nombreResultado = `(${sessionStorage.codigoID}) ${sessionStorage.descripcionID}`;
                this.idResultado = sessionStorage.idRE;
                
            }
            if(this.$route.params.codigo!==undefined){
                sessionStorage.codigoID=this.$route.params.codigo;
                sessionStorage.descripcionID=this.$route.params.descripcion;
                sessionStorage.idRE = this.$route.params.id;
                sessionStorage.tituloID=this.$route.params.nombreParaTitulo;
                this.nombreResultado = `(${this.$route.params.codigo}) ${this.$route.params.descripcion}`;
                this.idResultado = this.$route.params.id;
                this.titulo=this.$route.params.nombreParaTitulo+this.$route.params.codigo;
            }
            
            console.log(this.idResultado);

            this.listarIndicadores(this.idResultado);
        }catch(err){
            
        }
    },
};
</script>
