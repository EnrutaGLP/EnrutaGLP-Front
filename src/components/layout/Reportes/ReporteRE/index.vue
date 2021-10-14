<template>
    <div class="contenedorPrincipal">
        <div class="reporte-re">
            <Title texto="Reportes > Reporte de Resultados del Estudiante" />
            <br />
            <div>
                <table allign="left">
                    <tr>
                        <div>
                            <p class="texto-filtro" v-if="!tieneMasDeUnaEsp">Especialidad: {{nombreUnicaEsp}}</p>
                        </div>
                        <div>
                            <p class="texto-filtro">Filtrar por:</p>
                        </div>
                    </tr>
                    <tr>
                        <td v-if="tieneMasDeUnaEsp">
                            <Select class = "class-select"
                                texto  = "Especialidades"
                                :items = "especialidades"
                                v-on:cambio-seleccion="cambioEspecialidad"
                                v-if="tieneMasDeUnaEsp"
                            ></Select>
                        </td>
                        <Select class = "class-select-ciclo"
                            texto  = "Ciclo"
                            :items = "ciclos"
                            :value = "ciclos[0] != null ? ciclos[0] : 0"
                            v-on:cambio-seleccion="cambioCiclo"
                        ></Select>
                        <td>    
                            <Select class = "class-select-muestra"
                                texto="Descomposición"
                                :items="descomposicion"
                                :value="descomposicion[0]"
                                @cambio-seleccion="cambioDescomposicion"
                            />
                        </td>
                    </tr>
                    
                </table>
                <div>
                        
                    <Select class = "class-select-RE"
                        texto="Resultados del Estudiante"
                        :items="resultadosEstudiante"
                        :value="resultadosEstudiante[0] != null ? resultadosEstudiante[0] : 0"            
                        @cambio-seleccion="cambioResultadoEstudiante"
                    />
                </div>
                <div>
                    <p v-if="noData" style="color:red">No hay datos para esta combinación de filtros</p>
                </div>
            </div>
            <Alert
                v-bind:senalAlerta="senalAlerta"
                v-bind:textoAlerta="textoAlerta"
                v-bind:hayAlert="hayAlert"
            />
            <div class="botones">
                <v-progress-circular class="loading" :value="40" indeterminate v-if="cargando"></v-progress-circular>
                <v-btn class="generarGrafico"
                    color="var(--turquoise)"
                    outlined
                    @click="mostrarGraficoRE"
                    :disabled="disabledBtn"
                    :class="{btnNoHabilitado:disabledBtn || disabledBtn2, btnHabilitado:!(disabledBtn || disabledBtn2)}"
                >
                    <v-icon dark left>mdi-chart-tree</v-icon>
                    Generar Gráfico
                </v-btn>
                <EditableButton
                    @onClick="descargarExcel"
                    text="Descargar" icon="mdi-download"
                    :disabled="disabledBtn2"
                    :class="{btnNoHabilitado:disabledBtn2, btnHabilitado:!disabledBtn2}"
                />
            </div>
            <div class="graph">
                <apexchart v-if="mostrarGrafRE" width="500" type="bar" :options="optionsRE" :series="seriesRE"></apexchart>
                <apexchart v-if="seSeleccionoRE" width="650" type="bar" :options="optionsID" :series="seriesID"></apexchart>
            </div>
            <!--<p style="color: whitesmoke"> Preguntar al profe si quiere que el reporte salga filtrado </p>-->
            <!--<div class="information">
                <ReporteDataTable
                    :columnas="columns"
                    :filas="rows" 
                />
            </div>-->
            <div class="buttons">
                <BackButton />
            </div>
            <!--<transition name="slide-fade">
                <div class="alert" v-if="success">
                    <v-alert type="success">
                        Reporte descargado
                    </v-alert>
                </div>
            </transition>-->
        </div>
    </div>
</template>

<script>
import Title from '../../../shared/Title';
import BackButton from '../../../shared/BackButton';
import Alert from '../../../shared/Alert';
import EditableButton from '../../../shared/EditableButton';
import Select from '../../../shared/Select';
import ReporteDataTable from '../../../shared/ReporteDataTable';
import { DExcel } from '../../../util/reports/exportExcel';
import { reporteResultadosEstudianteConsolidado } from '../../../util/services';
import { getEspecialidadesPorFacultad, getSemestres, getResultadosEstudiante,
        reporteResultadoEstudiante, porcentajesLogrosResultadoEstudiante,
        porcentajesLogrosIndicadorDesempeno } from '../../../util/services';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'ReporteRE',
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
            descomposicion:[
                {text: "Muestra", value:1},
                {text: "Curso", value:2},
                {text:"Indicador", value:3},
                {text:"Resultado", value:4},
            ],
            cargando:false,
            disabledBtn:true,
            disabledBtn2:true,
            noData:false,
            idDescomposicion: 1,
            idEspecialidad: {},
            idCiclo:-1,
            idResultado:0,
            rows: [],
            success: false,
            acceso: -1,
            especialidades : [],
            ciclos : [],
            resultadosEstudiante:[],
            textoAlerta:"",
            senalAlerta:'',
            hayAlert:false,
            tieneMasDeUnaEsp:true,
            nombreUnicaEsp:'',
            optionsRE:{
                chart:{
                    id:'vuechart-example',
                    events:{
                        dataPointSelection: (event, chartContext, config) => {
                            //console.log(chartContext, config);
                            //this.mostrarGraficoID(this.idRE[config.dataPointIndex],this.optionsRE.xaxis.categories[config.dataPointIndex]);
                            this.seSeleccionoRE=false;
                            setTimeout(()=>{
                                this.mostrarGraficoID(this.optionsRE.xaxis.categories[config.dataPointIndex],config.dataPointIndex);
                            },500)
                        }
                    }
                },
                colors: ['#A5978B'],
                xaxis:{
                    categories: [],
                }
            },
            seriesRE:[{
                name:"Porcentaje logro(%)",
                data: [],
            }],
            idRE:[],

            optionsID:{
                chart:{
                    id:'vuechart-exampleID',
                },
                title:{
                    text:"",
                    align:'left',
                },
                colors: ['#A5978B'],
                xaxis:{
                    categories: [],
                }
            },
            seriesID:[{
                name:"Porcentaje logro(%)",
                data: [],
            }],
            idID:[],
            seSeleccionoRE:false,
            mostrarGrafRE:false,

            datosPorcentajeLogro:{},
        };
    },
    methods: {
        cambioDescomposicion(dato){
            this.idDescomposicion=dato;
        },
        cambioCiclo(dato){
            this.idCiclo=dato;
            this.disabledBtn2=false;
        },
        cambioEspecialidad(dato){
            this.idEspecialidad=dato;
            this.resultadosEstudiante=[];
            this.idResultado=0;
            this.disabledBtn=false;
            this.disabledBtn2=true;
            this.listarResultadosEstudiante(this.idEspecialidad);
        },
        cambioResultadoEstudiante(dato){
            this.disabledBtn2=false;
            this.idResultado=dato;
        },
        async mostrarGraficoRE(){
            this.cargando=true;
            this.seSeleccionoRE=false;
            this.mostrarGrafRE=false;
            try{
                this.datosPorcentajeLogro = await reporteResultadoEstudiante(this.idEspecialidad.id,this.idCiclo,"indicador");
                console.log(this.datosPorcentajeLogro);
                if(this.datosPorcentajeLogro.data.status=="success"){
                    this.mostrarGrafRE=true;
                    let codigoRE=[];
                    let porcentajeLogroRE=[];
                    //let idRE=[];
                    let minRE=101;
                    this.datosPorcentajeLogro.data.data.forEach(element=>{
                        minRE=101;
                        element.indicadores.forEach(elem=>{
                            if(elem.porcentajeLogro!="-"){
                                if(minRE>elem.porcentajeLogro){
                                    minRE=elem.porcentajeLogro;
                                }
                            }
                        });
                        if(minRE<101){
                            porcentajeLogroRE.push(minRE);
                            codigoRE.push(element.RE);
                        }
                    });
                    this.optionsRE.xaxis.categories=codigoRE;
                    this.seriesRE[0].data=porcentajeLogroRE;
                    //this.idRE=idRE;
                    this.cargando=false;
                }else{
                    this.cargando=false;
                    this.manejarAlerta(1,1);
                }
            }catch(err){
                console.log(err);
            }
        },
        async mostrarGraficoID(codigoRE,indice){
            this.cargando=true;
            try{
                this.seSeleccionoRE=true;
                let nombreID=[];
                let porcentajeLogroID=[];
                let idID=[];
                let idObjeto=[];
                console.log(this.datosPorcentajeLogro.data.data);
                for(let i=0;i<this.datosPorcentajeLogro.data.data.length;i++){
                    if(codigoRE==this.datosPorcentajeLogro.data.data[i].RE){
                        idObjeto=this.datosPorcentajeLogro.data.data[i].indicadores;
                        break;
                    }
                }
                console.log(idObjeto);
                idObjeto.forEach(element=>{
                    if(element.porcentajeLogro!="-"){
                        nombreID.push(element.ID);
                        porcentajeLogroID.push(element.porcentajeLogro);
                    }
                });
                this.optionsID.title.text=codigoRE;
                console.log(this.optionsID.title.text);
                this.optionsID.xaxis.categories=nombreID;
                this.seriesID[0].data=porcentajeLogroID;
                this.cargando=false;
            }catch(err){
                this.cargando=false;
                console.log(err);
            }
        },
        async listarResultadosEstudiante(idEsp){
            try{
                const data=await getResultadosEstudiante(idEsp.id);
                this.resultadosEstudiante=data.data.resultadosEstudiante.map((datas)=>({
                    text: "("+datas.codigo+") "+datas.descripcion,
                    value: {
                        id:datas.id_resultado_estudiante,
                        codigo:datas.codigo,
                    }
                }));
                this.resultadosEstudiante.unshift({
                    text:"Mostrar todos los resultados que tengan datos",
                    value:{
                        id:0,
                        codigo:"",
                    }
                });
                this.disabledBtn2=false;
            }catch(err){
                console.log("Error listar resultados"+ err);
            }
        },
        descargarExcel(){
            this.listarReporteBack(this.idEspecialidad, this.idCiclo, this.idDescomposicion);
        },
        async listarReporteBack(idEsp, idCiclo, idDes){
            this.cargando=true;
            let descomposicionStr="";
            switch(idDes){
                case 1: descomposicionStr="muestra";
                break;
                case 2: descomposicionStr="curso";
                break;
                case 3: descomposicionStr="indicador";
                break;
                case 4: descomposicionStr="resultado";
                break;
            }
            try{
                console.log("Id especialidad " + idEsp.id);
                console.log("Id ciclo "+ idCiclo);
                console.log(descomposicionStr);
                const data=await reporteResultadoEstudiante(idEsp.id,idCiclo,descomposicionStr);
                let dataImp={};
                let encontrado=false;
                if(this.idResultado.id){
                    
                    data.data.data.forEach(element=>{
                        if(element.RE==this.idResultado.codigo){
                            dataImp={data:{data:[element]}};
                            encontrado=true;
                        }
                    });
                    if(encontrado){
                        DExcel("Reporte de RE", "Resultados del Estudiante",{
                            idDes:idDes,
                            nombreEspecialidad:idEsp.nombre,
                        }, dataImp, "RE");
                    }else{
                        this.noData=true;
                        setTimeout(()=>{
                            this.noData=false;
                        },2000);
                        return;
                    }
                }else{
                    DExcel("Reporte de RE", "Resultados del Estudiante",{
                        idDes:idDes,
                        nombreEspecialidad:idEsp.nombre,
                    }, data, "RE");
                }
                
                //this.success = true;
                //setTimeout(() => {  this.success = false; }, 2000);
                this.manejarAlerta(0,0);
                this.cargando=false;
            }catch(err){
                console.log(err);
                this.manejarAlerta(1,0);
                this.cargando=false;
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                console.log("entra cambio senal bien");
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se descargó exitosamente el reporte de resultado de estudiante";
                } else if (accion==1) {//editar
                    this.textoAlerta="Se editó exitosamente el resultado de estudiante";
                } else {//delete
                    this.textoAlerta="Se eliminó exitosamente el resultado de estudiante";
                }
            } else {
                console.log("entra cambio senal");
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta='Hubo un error al descargar el reporte de resultado de estudiante';
                } else if(accion==1) {//editar
                    this.textoAlerta="Hubo un error al crear el gráfico de Resultado de estudiante";
                } else {//delete
                    this.textoAlerta="Hubo un error al crear el gráfico de Indicadores de Desempeño";
                }
            }
        },
        async listarCiclos(){
            let listaCiclos=[];
            //this.resultadosEstudiante=[];
            try{
                const data=await getSemestres();
                listaCiclos=data.data.semestres;
                this.ciclos=listaCiclos.map((datas)=>({
                    text:datas.nombre,
                    value:datas.id_semestre,
                }));
                this.idCiclo=this.ciclos[0].value;
            }catch(err){
                this.disabledBtn=true;
                this.disabledBtn2=true;
                console.log(err);   
            }
        },
        async listarEspecialidades(idFacultad) {
            let listaEspecialidades = [];
            try {
                const data = await getEspecialidadesPorFacultad(idFacultad);
                listaEspecialidades = data.data.especialidades;
                listaEspecialidades.forEach(element => {
                    this.especialidades.push({text:element.nombre, 
                    value:{id:element.id_especialidad,nombre:element.nombre}});
                });
            } catch (err) {
                listaEspecialidades = [
                    { idEspecialidad: 1, codEspecialidad: 'INF', nombreEspecialidad: 'Ciencias e Ingeniería 1' },
                    { idEspecialidad: 2, codEspecialidad: 'ING', nombreEspecialidad: 'Ciencias e Ingeniería 2' },
                    { idEspecialidad: 3, codEspecialidad: 'INH', nombreEspecialidad: 'Ciencias e Ingeniería 3' },
                    { idEspecialidad: 4, codEspecialidad: 'INJ', nombreEspecialidad: 'Ciencias e Ingeniería 4' },
                    { idEspecialidad: 5, codEspecialidad: 'INK', nombreEspecialidad: 'Ciencias e Ingeniería 5' },
                    { idEspecialidad: 6, codEspecialidad: 'INL', nombreEspecialidad: 'Ciencias e Ingeniería 6' },
                ];
                this.especialidades = listaEspecialidades.map((data) => ({
                    text: data.nombreEspecialidad,
                    value: data.idEspecialidad,
                }));
            }
        },


        async manejarPromesa(idEspecialidad)
        {
            try {
                const data = await reporteResultadosEstudianteConsolidado(idEspecialidad);
                console.log(data);
            } catch(err) {

            }
        },
    },
    computed:{
        resultados(){
            return this.getRE();
        },
    },
    async created() {
        var usuario = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('json'), 'json').toString(CryptoJS.enc.Utf8))

        console.log(usuario)
        try{
            let acces = localStorage.getItem('acceso');
            if (!acces) {
                this.$router.push('/login');
            }
            let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
            usuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));

            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            if (this.acceso == 0) {
                this.$router.push('/login');
            }
            this.rows = this.auxrows;

            if(this.acceso<7){//no admin
                console.log(usuario);
                //this.especialidades.push({text:"Mostrar todas las especialidades", value: null });
                for(let element of usuario.facultades){
                    await this.listarEspecialidades(element.id_facultad);
                }
                usuario.especialidaes.forEach(element=>{
                    this.especialidades.push({text:element.nombre, 
                    value:{id:element.id_especialidad,nombre:element.nombre}});
                });
                //this.idEspecialidad=this.especialidades[0].value;
                this.listarCiclos();
                if(this.especialidades.length===1){
                    this.tieneMasDeUnaEsp=false;
                    this.nombreUnicaEsp=this.especialidades[0].text;
                    this.cambioEspecialidad(this.especialidades[0].value);
                    this.disabledBtn=false;
                    this.disabledBtn2=false;
                }
                this.idEspecialidad=this.especialidades[0].value;
                //this.cambioEspecialidad(this.especialidades[0].value);
            }else{
            }
            // se tiene q buscar el idEspecialidad en un combo 
            // console.log(reporteResultadosEstudianteConsolidado(idEspecialidad))
            // y usar ese servicio para listar el reporte 
        }catch(err){

        }
    }
}
</script>

<style scoped>

    .reporte-re {
        display: flex;
        flex-direction: column;
    }

    .buttons {
        padding-top: 15px;
    }
    .class-select{
        margin-left: 1rem;
        margin-right: 1rem;
    }
    .filtros {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 25px;
    }

    .texto-filtro {
        margin-right: 15px;
        margin-top: 50px;
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
    .class-select-ciclo{
        margin-left: 1rem;
        margin-right: 1rem;
        width: 8rem!important;
    }
    .class-select-muestra{
        margin-left: 1rem;
        margin-right: 1rem;
        width: 10rem!important;
    }
    .class-select-RE{
        margin-left: 1rem;
        margin-right: 1rem;
        width: 47.4rem !important;
    }
    .loading {
        margin: 7.5px;
    }
    .graph{
        display: flex;
        justify-content: center;
    }
    .generarGrafico{
        display: flex;
        margin-top: 4px;
        margin-right: 10px;
        border-radius: 8px;
    }
</style>
