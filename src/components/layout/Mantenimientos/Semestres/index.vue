<template>
    <div class="contenedorPrincipal">
        <div class = "semestres">
            <Title texto = "Mantenimientos > Semestres" :usarBotonAyuda=true urlKey="semestres"/>
            <br>
            <div class="row">
                <div>
                    <table allign="left">
                        <tr>
                            <div class = "col sm-12">
                                <td><b>Ciclo Actual: </b></td>
                            </div>
                            <td v-if="cicloActual!=-1">{{cicloActual.data.semestre.nombre}}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class = "row">
                <div>
                    <table allign = "left">
                        <tr>
                            <div class = "col sm-12">
                                <search
                                    v-on:change = "cambioSemestre"
                                    texto       = "Escriba el semestre que desea buscar"
                                />
                            </div>
                        </tr>
                    </table>
                </div>
            </div>
            <Alert
                v-bind:senalAlerta="senalAlerta"
                v-bind:textoAlerta="textoAlerta"
                v-bind:hayAlert="hayAlert"
            />
            <div class = "DataTableIndicadoresDesempeno">
                 <DataTableSemestres
                    v-bind:semestres      = "semestres"
                    v-bind:seSelecciono   = "seSelecciono"
                    v-bind:busqueda       = "semestreBuscado"
                    v-bind:noEsAdmin      = "noEsAdmin"
                    v-on:alerta="manejarAlerta"
                 />
            </div>
            <br>
            <div class = "row">
                <div class = "col sm-5">
                    <BackButton></BackButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import BackButton from '../../../shared/BackButton.vue';
    import Search from '../../../shared/Search.vue';
    import Alert from '../../../shared/Alert.vue';
    import Title from '../../../shared/Title.vue';
    import { getSemestres, searchSemestre, getSemestreActual } from '../../../util/services/index';
    import DataTableSemestres from '../Semestres/DataTableSemestres.vue';
    import * as CryptoJS from 'crypto-js';

    export default{
        name: 'Semestres',
        components: {
            DataTableSemestres,
            BackButton,
            Search,
            Title,
            Alert,
        },
        data() {
            return{
                fechasInicio:       [],
                semestres:          [],
                fechasFin:          [],
                semestreBuscado:    "",
                senalAlerta:        "",
                hayAlert:           false,
                textoAlerta:        "",
                tipoAlerta:         "success",
                seSelecciono:       true,
                hayAlerta:          false,
                cicloActual:        -1,
                acceso:             -1,
                noEsAdmin:          false,
            };
        },
        methods: {
            cambioSemestre(dato) {
                this.semestreBuscado = dato;
                if (this.seSelecciono) {
                    this.seSelecciono = false;
                }
                this.buscarSemestre(this.semestreBuscado);
            },
            buscarSemestre(dato) {
                this.buscarSemestre=dato;
            },
            async listarSemestres() {
                try {
                    const data = await getSemestres();
                    let listaSemestres = data.data.semestres;
                    var sem;
                    for(sem of listaSemestres){
                        var iniDate = Date.parse(sem.fecha_inicio);
                        var finDate = Date.parse(sem.fecha_fin);
                        var utcIni = new Date(iniDate).toUTCString();
                        var utcFin = new Date(finDate).toUTCString();
                        var cadIni = utcIni.slice(5,16);
                        var cadFin = utcFin.slice(5,16);
                        
                        var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                        var dateIni = cadIni.split(' ');
                        var dateFin = cadFin.split(' ');
                        var day1 = dateIni[0];
                        var day2 = dateFin[0];
                        var month1 = dateIni[1];
                        var month2 = dateFin[1];
                        var year1 = dateIni[2];
                        var year2 = dateFin[2];

                        var monthIni = months.indexOf(month1.toLowerCase()) + 1;
                        var monthFin = months.indexOf(month2.toLowerCase()) + 1;
                        
                        if (monthIni<10) {
                            var month_i = '0' + monthIni;
                            var cadIni = year1 + '-' + month_i + '-' + day1;
                        }
                        else { var cadIni = year1 + '-' + monthIni + '-' + day1; }
                        
                        if (monthFin<10) {
                            var month_f = '0' + monthFin;
                            var cadFin = year2 + '-' + month_f + '-' + day2;
                        }
                        else { cadFin = year2 + '-' + monthFin + '-' + day2; }
                        
                        var objSem={};
                        objSem.idSemestre = sem.id_semestre;
                        objSem.nombre = sem.nombre;
                        objSem.fechaInicio = cadIni;
                        objSem.fechaFin = cadFin;

                        this.semestres.push(objSem);
                    }
                } catch (err) {
                    this.semestres=[];
                }
            },
            async getSemestre(){
                try{
                    this.cicloActual = await getSemestreActual();
                    if(this.cicloActual===undefined){
                        this.cicloActual=-1;
                    }
                    console.log(this.cicloActual);
                    console.log(this.cicloActual.data.semestre.nombre);
                }catch(err){
                    this.cicloActual=-1;
                    console.log(err);
                }
            },
            manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se registró exitosamente el semestre.";
                } else if (accion==1) {//editar 
                    this.textoAlerta="Se editó exitosamente el semestre.";
                } else {//delete
                    this.textoAlerta="Se eliminó exitosamente el semestre.";
                }
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta='Hubo un error al registrar el semestre.';
                } else if(accion==1) {//editar
                    this.textoAlerta="Hubo un error al editar el semestre.";
                } else {//delete
                    this.textoAlerta="Hubo un error al eliminar el semestre.";
                }
            }
        }
        },
        created() {
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
            if(this.acceso<7){//no admin
                this.noEsAdmin=true;
            }
            this.listarSemestres();
            this.getSemestre();
        },
    };
</script>

<style>

</style>
