<template>
    <div class="contenedorPrincipal">
        <div class="reporte-re">
            <Title texto="Reportes > Reporte de Resultados por Horario" />
            <br />
            <div class="filtros">
                <p class="texto-filtro" v-if="!tieneMasDeUnaEsp">Especialidad: {{nombreUnicaEsp}}</p>
                <br/>
                <p class="texto-filtro">Filtrar por:</p>
                <Select class = "class-select"
                    texto="Ciclo"
                    :items="semestres"
                    v-on:cambio-seleccion="cambioSemestre"
                />
                <Select class = "class-select"
                    texto  = "Especialidad"
                    :items = "especialidades"
                    v-on:cambio-seleccion="cambioEspecialidad"
                    v-if="tieneMasDeUnaEsp"
                ></Select>
                <Select class = "class-select"
                    texto="Curso/Evaluación"
                    :items="cursos"
                    v-on:cambio-seleccion="cambioCurso"
                    :r_object="r_object"
                />
                <Select class = "class-select"
                    texto="Horario/Muestra"
                    :items="muestras"
                    v-on:cambio-seleccion="cambioMuestra"
                />
                
            </div>
            <Alert
                v-bind:senalAlerta="senalAlerta"
                v-bind:textoAlerta="textoAlerta"
                v-bind:hayAlert="hayAlert"
            />
            <div class="botones">
                <v-progress-circular :value="40" indeterminate v-if="cargando"></v-progress-circular>
                <a
                    :download="nombreDF"
                >
                <EditableButton 
                    :disabled="!id_muestra" 
                    @onClick="descargarExcel" 
                    text="Descargar" 
                    icon="mdi-download"/>
                </a>
            </div>
            <div class="buttons">
                <BackButton />
            </div>
            <transition name="slide-fade">
                <div class="alert" v-if="success">
                    <v-alert type="success">
                        Reporte descargado
                    </v-alert>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import Title from '../../../shared/Title';
import BackButton from '../../../shared/BackButton';
import EditableButton from '../../../shared/EditableButton';
import Select from '../../../shared/Select';
import ReporteDataTable from '../../../shared/ReporteDataTable';
import { DExcel } from '../../../util/reports/exportExcel';
import {getSemestres,
        getCursos, 
        getEspecialidadesPorFacultad,
        listarMuestraXCursoXSemestre,
        descargarReporteHorario,
        getEvaluaciones,
        listarMuestraXEvaluacionXSemestre} from '../../../util/services/index';
import * as CryptoJS from 'crypto-js';
import Alert from "@/components/shared/Alert.vue";

export default {
    name: 'ReporteHorario',
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
            columns: [
                    { text:'Resultado del estudiante', value:'RE',class:'grey lighten-3' }, 
                    { text:'Indicador del desempeño', value:'ID',class:'grey lighten-3' },
                    { text:'Curso', value:'curso',class:'grey lighten-3' },
                    { text:'Horario', value:'horario',class:'grey lighten-3' },
                    { text:'Nota', value:'nota',class:'grey lighten-3' }
                ],
            auxrows: [
                    { RE: "RE1", ID:'QUI118', curso:'Quimica1', horario: "H123", nota: "4" },
                    { RE: "RE2", ID:'INF238', curso:'Sistemas Operativos', horario: "H123", nota: "4" },
                    { RE: "RE3", ID:'INF245', curso:'Ingenieria de Software', horario: "H123", nota: "4" },
                ],
            rows: [],
            success: false,
            acceso: -1,
            especialidades: [],
            semestres: [],
            cursos: [],
            muestras :[],
            id_semestre: 0,
            id_curso: 0,
            id_muestra: 0,
            id_especialidad: 0,
            urlDF: "",
            nombreDF: "reporteHorario.xlsx",
            textoAlerta:"",
            senalAlerta:'',
            hayAlert:false,
            tieneMasDeUnaEsp:true,
            nombreUnicaEsp:'',
            cargando: false,
            disabledBtn: true,
            r_object: true,
            isCurso: null,
        };
    },
    watch:{
        id_especialidad(){
            this.id_curso = 0;
            this.cursos = [];
            this.id_muestra = 0;
            this.muestras = [];
        },
        id_curso(){
            this.id_muestra = 0;
            this.muestras = [];
        },
        id_semestre(){
            this.id_muestra = 0;
            this.muestras = [];
            this.id_curso = 0;
            this.cursos = [];
        }
    },
    methods: {

        listoParaDescargar(){
            return this.id_muestra != 0;
        },

        datosValidos(){
            if(this.id_muestra == 0){
               this.manejarAlerta(1,0);
               return false;
            }    
            return true;
        },
        descargarExcel(){
            if(!this.datosValidos())
                return;  
            this.downloadReporte(this.id_muestra, this.id_especialidad, this.id_curso, this.isCurso);
        },
        async downloadReporte(idMuestra, idEspecialidad, idCurso, isCurso) {
            this.cargando = true;
            try{
                console.log("idmuestra::", idMuestra);
                const file = await descargarReporteHorario(idMuestra, idEspecialidad, idCurso, isCurso);

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
        cambioEspecialidad(dato){
            console.log("cambia esp::", dato);
            this.id_especialidad = dato;
            this.listarCursos(dato, this.id_semestre);
            if(this.listoParaDescargar()){
                this.disabledBtn = false;
            }
        },
        cambioCurso(dato){
            console.log("cambia curso::", dato);
            this.id_curso = dato.value;
            this.isCurso = dato.isCurso;
            this.listarMuestras(dato, this.id_semestre, this.id_especialidad);
            if(this.listoParaDescargar()){
                this.disabledBtn = false;
            }        
        },
        cambioSemestre(dato){
            this.id_semestre = dato;
            this.listarCursos(this.id_especialidad ,dato);
            if(this.listoParaDescargar()){
                this.disabledBtn = false;
            }
        },
        cambioMuestra(dato){
            this.id_muestra = dato;
            if(this.listoParaDescargar()){
                this.disabledBtn = false;
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
                console.log("Especialidades::",listaEspecialidades);
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
        async listarCursos(idEspecialidad, idSemestre) {
            let listaCursos = [];
            let listaEva = [];
            try {
                const resCurs = await getCursos(idEspecialidad);
                listaCursos = resCurs.data.cursos;
                this.cursos = []
                listaCursos.forEach(element => {
                    this.cursos.push({text:element.nombre, value:element.id_curso, isCurso:true});
                });
                const resEva = await getEvaluaciones(idSemestre ,idEspecialidad);
                listaEva = resEva.data.evaluaciones;
                listaEva.forEach(element => {
                    this.cursos.push({text:element.nombre, value:element.idEvaluacion, isCurso:false});
                });
            } catch (e) {
                console.log(e);
            }
        },
        async listarMuestras(curso, idSemestre, idEspecialidad) {
            let listaMuestras = [];
            try {
                if(curso.isCurso){
                    const data = await listarMuestraXCursoXSemestre(curso.value, idSemestre);
                    listaMuestras = data.data.muestrasEvaluacion;
                    this.muestras = [];
                    listaMuestras.forEach(element => {
                        this.muestras.push({text:element.nombre, value:element.id_muestra_evaluacion});
                    });
                }else{
                    const data = await listarMuestraXEvaluacionXSemestre(idSemestre, idEspecialidad, curso.value);
                    listaMuestras = data.data.muestras;
                    this.muestras = [];
                    listaMuestras.forEach(element => {
                        this.muestras.push({text:element.nombre, value:element.id_muestra_evaluacion});
                    });
                }
            } catch (e) {
                console.log(e);
            }
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
            console.log("Datos usuario::",this.datosUsuario)


            
            //this.datosUsuario.facultades.map(fac => this.listarEspecialidades(fac.id_facultad))
            for(let element of this.datosUsuario.facultades){
                await this.listarEspecialidades(element.id_facultad);
            }
            //this.listarEspecialidades(this.datosUsuario.facultades[0].id_facultad); 
            this.datosUsuario.especialidaes.forEach(element=>{
                        this.especialidades.push({text:element.nombre, 
                        value:element.id_especialidad});
                    });

            this.listarSemestres();
            
            if(this.especialidades.length===1){
                    this.tieneMasDeUnaEsp=false;
                    this.nombreUnicaEsp=this.especialidades[0].text;
                    this.cambioEspecialidad(this.especialidades[0].value);
                    this.id_especialidad=this.especialidades[0].value;
                }
        
            console.log("Facultades:", this.datosUsuario.facultades)
            console.log(this.especialidades)
        }catch(err){
            
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
        justify-content: center;
        margin-top: 25px;
    }

    .texto-filtro {
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
        width: 5rem !important;
        padding-left: 15px !important;
        padding-right: 15px !important;
    }
    
</style>