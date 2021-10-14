<template>
    <div class="contenedorPrincipal">
        <div class="reporte-re">
            <Title texto="Reportes > Reporte de Resultados Históricos" />
            <br />
            <div class="filtros">
                <p class="texto-filtro" v-if="!tieneMasDeUnaEsp">Especialidad: {{nombreUnicaEsp}}</p>
            </div>
            <p class="texto-filtro">Filtrar por:</p>
            <div class="filtros" >
                <v-form ref="form">
                            <Select class = "class-select"
                                texto="Especialidad"
                                :items="especialidades"
                                @cambio-seleccion="selectEspecialidad"
                                v-if="tieneMasDeUnaEsp"
                            />
                            <Select class = "class-select"
                                    texto="Ciclo Inicio"
                                    :items="semestres"
                                    v-on:cambio-seleccion="cambioSemestreIni"
                                    :r_object="r_object"
                                    :rules="[rules.ini]"
                            />
                            <Select class = "class-select"
                                    texto="Ciclo Fin"
                                    :items="semestres"
                                    v-on:cambio-seleccion="cambioSemestreFin"
                                    :r_object="r_object"
                                    :rules="[rules.fin]"
                            />
                </v-form>
            </div>

            <Alert
                v-bind:senalAlerta="senalAlerta"
                v-bind:textoAlerta="textoAlerta"
                v-bind:hayAlert="hayAlert"
            />
            <div class="botones">
                <v-progress-circular class="loading" :value="40" indeterminate v-if="cargando"></v-progress-circular>
                <a
                    :download="nombreDF"
                >
                    <EditableButton 
                    @onClick="descargarExcel" 
                    text="Descargar" icon="mdi-download"
                    :disabled="disabledBtn"
                    :class="{btnNoHabilitado:disabledBtn, btnHabilitado:!disabledBtn}"
                    />
                </a>
            </div>
            <div class="buttons">
                <BackButton />
            </div>
            <transition name="slide-fade">
                <div class="alert" v-if="success">
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { getEspecialidadesPorFacultad, 
        getSemestres,
        descargarReporteHistorico } from '../../../util/services/index';
import Title from '../../../shared/Title';
import BackButton from '../../../shared/BackButton';
import EditableButton from '../../../shared/EditableButton';
import Select from '../../../shared/Select';
import ReporteDataTable from '../../../shared/ReporteDataTable';
import * as CryptoJS from 'crypto-js';
import { DExcel } from '../../../util/reports/exportExcel';
import Alert from "@/components/shared/Alert.vue";

export default {
    name: 'ReporteHistorico',
    components: {
        BackButton,
        ReporteDataTable,
        Select,
        EditableButton,
        Title,
        Alert,
    },
    data: function() {
        return {
            auxrows: [
                    { RE: "RE1", ID:'QUI118', ciclo:'2012-1', curso:'Quimica1', horario: "H123", alumno:'Bruno Laurente', nota: "4" },
                    { RE: "RE2", ID:'INF238', ciclo:'2012-1', curso:'Sistemas Operativos', alumno:'Bruno Laurente', horario: "H123", nota: "4" },
                    { RE: "RE3", ID:'INF245', ciclo:'2012-1', curso:'Ingenieria de Software', alumno:'Bruno Laurente', horario: "H123", nota: "4" },
                ],
            rows: [],
            success: false,
            acceso: -1,
            datosUsuario: {},
            especialidades: [],
            indexEspecialidadSeleccionada: -1,
            switchIndicador: true,
            loading: false,
            nombreDF: "reporteHistorico.xlsx",
            textoAlerta:"",
            senalAlerta:'',
            hayAlert:false,
            tieneMasDeUnaEsp:true,
            nombreUnicaEsp:'',
            cargando: false,
            semestres: [],
            id_semestreFin: 0,
            id_semestreIni: 0,
            semestreIni: null,
            semestreFin: null,
            r_object:true,
            disabledBtn:true,
            rules:{
                ini: (value) => {
                    if(this.semestreFin!==null){
                        return value.text.localeCompare(this.semestreFin.text)<0 || "Semestre no válido";
                    }else{
                        return true;
                    }
                },
                fin:(value) => {
                    if(this.semestreFin!==null){
                        return value.text.localeCompare(this.semestreIni.text)>0 || "Semestre no válido";
                    }else{
                        return true;
                    }
                },
            }
        };
    },
    watch:{
        semestreIni(){
            this.$nextTick(() => {
				this.$refs.form.validate();
			});
        },
        semestreFin(){
            this.$nextTick(() => {
				this.$refs.form.validate();
			});
        }
    },
    methods: {
        getRE() {
            let RE = [];
            RE.push({text:"Mostrar todos", value: null });
            this.auxrows.forEach((i) => { RE.push({text: i.RE, value: i}); });
            return RE;
        },
        filtrarRE(data) {
            if(data === null){
                this.rows = this.auxrows;
                return;
            }
            this.rows = this.auxrows.filter((item) => item.RE == data.RE);
        },
        selectEspecialidad(item){
            this.indexEspecialidadSeleccionada = item;

            if((this.semestreFin!==null)&&(this.indexEspecialidadSeleccionada!==-1)&&(this.semestreIni!==null)){
                if((this.semestreIni.text.localeCompare(this.semestreFin.text)<0)&&(this.indexEspecialidadSeleccionada!==-1)){
                    this.disabledBtn=false;
                    console.log("button::this.disabledBtn");
                }
                else{
                    this.disabledBtn=true;
                }         
            }
            else{
                this.disabledBtn=true;
            }

        },
        datosValidos(){
            if(this.indexEspecialidadSeleccionada == -1){
               this.manejarAlerta(1,0);
               return false;
            }    
            return true;
        },
        descargarExcel(){
            if(!this.datosValidos())
                return;          
            // reporteResultadosEstudianteHistorico(this.indexEspecialidadSeleccionada, null, null, this.switchIndicador).then((result) => {
            //     this.auxrows = result.data;
            //     DExcel("Reporte Historico", "Resultados Históricos", {
            //         facultad: this.datosUsuario.facultades[0].nombre,
            //         especialidad: this.especialidades.find((item) => item.value == this.indexEspecialidadSeleccionada).text,
            //         indicadores: this.switchIndicador,
            //     }, this.auxrows, "H");
            //     this.loading = false;
            //     this.success = true;
            //     setTimeout(() => {  this.success = false; }, 2000);
            // });
            this.downloadReporte(this.indexEspecialidadSeleccionada);
        },
        async downloadReporte(idEspecialidad){
            this.cargando = true;
            try{
                console.log("idEspecialidad::", idEspecialidad);
                console.log("id_semestreIni::", this.id_semestreIni);
                console.log("id_semestreFin::", this.id_semestreFin);
                const file = await descargarReporteHistorico(idEspecialidad, true, this.id_semestreIni, this.id_semestreFin);

                const blob = new Blob([file.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', this.nombreDF);
                
                link.click();
                URL.revokeObjectURL(link.href)
                //alert("descargo");
                this.cargando=false;
                this.manejarAlerta(0,0);
            } catch (e){
                this.cargando=false;
                this.manejarAlerta(1,0);
                console.log(e);
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//descargar
                    this.textoAlerta="Se descargó exitosamente el reporte";
                } 
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//descargar
                    this.textoAlerta='Hubo un error al descargar el reporte';
                } 
            }
        },
        async listarEspecialidades(idFacultad) {
            let listaEspecialidades = [];
            try {
                const data = await getEspecialidadesPorFacultad(idFacultad);
                listaEspecialidades = data.data.especialidades;
                listaEspecialidades.forEach(element => {
                    this.especialidades.push({text:element.nombre, value:element.id_especialidad});
                });
            } catch (e) {
                console.log(e);
            }
        },
        async listarSemestres() {
            let listaSemestres = [];
            try {
                const data = await getSemestres()
                listaSemestres = data.data.semestres;
                this.semestres = []
                listaSemestres.forEach(element => {
                    this.semestres.push({text:element.nombre, value:element.id_semestre});
                });
            } catch (e) {
                console.log(e);
            }
        },
        cambioSemestreIni(dato){
            this.semestreIni = dato;
            this.id_semestreIni = this.semestreIni.value;
            console.log("semestrin::", this.id_semestreIni);
            if((this.semestreFin!==null)&&(this.indexEspecialidadSeleccionada!==-1)){
                if((dato.text.localeCompare(this.semestreFin.text)<0)&&(this.indexEspecialidadSeleccionada!==-1)){
                    this.disabledBtn=false;
                    console.log("button::this.disabledBtn");
                }
                else{
                    this.disabledBtn=true;
                }         
            }
            else{
                this.disabledBtn=true;
            }
        },
        cambioSemestreFin(dato){
            this.semestreFin = dato;
            this.id_semestreFin = this.semestreFin.value;
            if((this.semestreIni!==null)&&(this.indexEspecialidadSeleccionada!==-1)){
                if((dato.text.localeCompare(this.semestreIni.text)>0)&&(this.indexEspecialidadSeleccionada!==-1)){
                    this.disabledBtn=false;
                    console.log("button::this.disabledBtn");
                }
                else{
                    this.disabledBtn=true;
                }
            }
            else{
                this.disabledBtn=true;
            }
        },
    },
    computed: {
        color: function() {
            return getComputedStyle(document.documentElement).getPropertyValue('--dark-blue');
        },
    },
    async created(){
        try{
            let acces = localStorage.getItem('acceso');
            if (!acces) {
                this.$router.push('/login');
            }
            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            if (this.acceso == 0) {
                this.$router.push('/login');
            }
            this.id_persona = CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona');
            this.id_persona = this.id_persona.toString(CryptoJS.enc.Utf8);
            let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
            this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
            console.log()

            //this.datosUsuario.facultades.map(fac => this.listarEspecialidades(fac.id_facultad))
            for(let element of this.datosUsuario.facultades){
                await this.listarEspecialidades(element.id_facultad);
            }
            this.datosUsuario.especialidaes.forEach(element=>{
                        this.especialidades.push({text:element.nombre, 
                        value:element.id_especialidad});
                    });
            
            if(this.especialidades.length===1){
                    this.tieneMasDeUnaEsp=false;
                    this.nombreUnicaEsp=this.especialidades[0].text;
                    this.selectEspecialidad(this.especialidades[0].value);
                }

            //this.listarEspecialidades(this.datosUsuario.facultades[0].id_facultad); 
            console.log("Facultades:", this.datosUsuario.facultades)
            console.log(this.especialidades)
            this.rows = this.auxrows;
            this.listarSemestres();
        }catch(e){
            console.log(e);
        }
    }
}
</script>

<style scoped>
    .buttons {
        padding-top: 15px;
    }

    .filtros {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-top: 25px;
    }

    .texto-filtro {
        margin-top: 10px;
        margin-right: 15px;
    }

    .botones {
        display: flex;
        justify-content: flex-end;
        padding-right: 15px;
        margin-bottom: 15px;
    }

    .alert {
        max-width: 15vw;
        position: sticky;
        padding: 15px 15px 0 15px;
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

    .class-select{
        max-width: 20rem !important;
        padding-left: 15px !important;
        padding-right: 15px !important;
    }

    .loading {
        margin: 7.5px;
    }

</style>
