<template>
    <div class="contenedorPrincipal">
        <div class="medicionesDetalle">
        <Title texto="Mediciones y Resultados > Mediciones > Detalle de la Medición" />
        <div class="panel">
            <div class="contenidoPanel">
                <table>
                    <tr>
                        <td>Ciclo:</td>
                        <td>{{ data.nombreSemestre }}</td>
                    </tr>
                    <tr>
                        <td>Curso:</td>
                        <td>{{ data.curso }}</td>
                    </tr>
                    <tr>
                        <td>Horario:</td>
                        <td>{{ data.horario }}</td>
                    </tr>
                    <tr>
                        <td>Indicador de Desempeño:</td>
                        <td class="infor">
                            <Select class="select"
                                texto="Seleccione un indicador"
                                v-on:cambio-seleccion="cambioIndicador"
                                v-bind:items="indicadores"
                                :value="value"
                                v-model="value"
                            />
                        </td>
                    </tr>
                    <tr
                        v-for="i in rubricas"
                        :key="i.idNivelDesempeno"
                    >
                        <!-- <td @dblclick="seleccionMultiple(i)"> -->
                        <td>
                            <v-btn 
                                class="nombreIndicador" 
                                outlined
                                :disabled="terminado"
                                @click="openDialog(i)"
                            >
                                {{i.nombre}} ({{i.valor}}):
                            </v-btn>
                        </td>
                        <td class="infor">
                            {{i.descripcion}}
                        </td>
                    </tr>
                    <tr
                        v-if="indexIndicadorSeleccionado != 0 && rubricas.length == 0"
                    >
                        <td></td>
                        <td class="infor">
                            No hay rubricas disponibles en este indicador
                        </td>
                    </tr>
                </table>
                <v-dialog v-model="dialog" max-width="500px">
                    <v-card>
                        <v-spacer></v-spacer>
                        <v-card-title>Esta acción puede echar a perder cualquier <span class="dialog-body"> trabajo realizado ¿Está seguro de esto?</span></v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color=#F95F62 outlined @click="closeChange">Cancelar</v-btn>
                            <v-btn color=#00D9B8 outlined @click="changeConfirm">OK</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </div>
        </div>
        <br />
        
        <div class="botones">
            <v-btn 
                class="verEvidenciasBtn" 
                :disabled="disableGuardarbutton || terminado"
                @click="goTo"
            >
                <v-icon dark left>mdi-monitor-eye</v-icon>
                Evidencias 
            </v-btn>
            <ModalInputFileAlumnos 
                :disabled="terminado"
                v-on:importarDatos="subirAlumnos" 
                :cargando="cargaAlumnos"
            />
        </div>
        <div class="notas">
            <NotasDataTable
                :headers="header"
                :dataList="alumnos"
                :editedItem="edited"
                :defaultItem="edited"
                :niveles="rubricas"
                :disableGrades="terminado"
                :disableDelete="disableGuardarbutton || terminado"
                @eliminar="deleteItem"
            />
        </div>
        <br />
        <Alert
            v-bind:senalAlerta="senalAlerta"
            v-bind:textoAlerta="textoAlerta"
            v-bind:hayAlert="hayAlert"
        />
        <DialogReporte 
            v-if="notasGuardadas"
            :headers="reporteHeader"
            :rows="reporteRows"
        />
        <br />
        <br />
        <Alert
            v-bind:senalAlerta="senalAlertaTerminado"
            v-bind:textoAlerta="textoAlertaTerminado"
            v-bind:hayAlert="hayAlertTerminado"
        />
        <br />
        <div class="botones-2">
            <BackButton />
            <div>
                <v-btn 
                    class="btnCancelar" 
                    color=#F95F62 
                    outlined
                    :disabled="disableGuardarbutton || terminado"
                    @click="cancelarNotas"
                ><v-icon left>mdi-undo</v-icon>
                    Deshacer cambios
                </v-btn>
                <v-btn 
                    class="btnGuardar" 
                    outlined
                    :disabled="disableGuardarbutton || terminado"
                    @click="guardarAlumnos"
                    color=#3DBEAB 
                >
                    <v-icon dark left>mdi-content-save</v-icon>
                    Guardar
                </v-btn>
                <v-btn 
                    class="btnGuardar" 
                    outlined
                    :disabled="disableGuardarbutton || terminado"
                    @click="terminarAlumnos"
                    color=#3DBEAB 
                >
                    <v-icon dark left>mdi-check-circle-outline</v-icon>
                    Terminar 
                </v-btn>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import Title from "../../../../shared/Title.vue";
import Select from "../../../../shared/Select.vue";
import BackButton from "../../../../shared/BackButton.vue";
import NotasDataTable from "./NotasDataTable/index.vue";
import ModalInputFileAlumnos from "../../../../shared/ModalInputFileAlumnos.vue";
import DialogReporte from "./DialogReporte/index.vue";
import { 
    getIndicadoresDesempenoPorMuestra,
    actualizarAlumnos,
    registrarAlumnos
} from "../../../../util/services/index";
import Alert from '../../../../shared/Alert.vue';
import * as CryptoJS from 'crypto-js';

export default {
    name: "MedicionesDetalle",
    components: {
        Title,
        Select,
        BackButton,
        NotasDataTable,
        ModalInputFileAlumnos,
        Alert,
        DialogReporte,
    },
    data() {
        return {
            header: [
                {
                    text: "Código",
                    align: "start",
                    sortable: true,
                    value: "codigo",
                },
                { text: "Nombre", value: "nombre" },
                { text: "Calificación", value: "calificacion", sortable: false },
            ],
            indicadores: [],
            datos: {},
            alumnos: [],
            alumnosAux: [],
            rubricas: [],
            edited: { codigo: 0, idAlumno: "", nombre: "", nota: 0 },
            data: {},
            value: {},
            indexIndicadorSeleccionado: 0,
            disableGuardarbutton: true,
            listaEnviar: {"alumnos": []},
            textoAlerta: "",
            senalAlerta: '',
            hayAlert: false,
            cargaAlumnos: false,
            notasGuardadas: false,
            reporteHeader: [
                /*{
                    text: "Resultado del Estudiante",
                    align: "start",
                    sortable: true,
                    value: "re",
                },*/
                { text: "Indicador", value: "indicador" },
                { text: "Rúbrica", value: "rubrica" },
                { text: "Porcentaje Calificado con la rúbrica", value: "porcentaje" },
            ],
            porcentajeCalificados: 0,
            textoAlertaTerminado: "",
            senalAlertaTerminado: '',
            hayAlertTerminado: false,
            terminado: false,
            dialog: false,
            itemAux: null,
        };
    },
    watch: {
        dialog(val) {
            val || this.closeChange();
        },
    },
    computed:{
        reporteRows() {
            var rep = [];
            if(this.indicadores.length == 0)
                return rep;
            var aCalificados = this.alumnosAux.filter(item => item.estado);
            const IR = this.datos.indicadores;
            for(var i of IR){
                var porcentaje = 0;
                for(let r of i.rubricas){
                    var row = {
                        indicador: i.nombreIndicador,
                        rubrica: "",
                        puntaje: 0,
                        porcentaje: "",
                    }
                    let cantidad = aCalificados.filter(item => 
                            item.notas.find(item => 
                                        item.idIndicador == i.idIndicador
                                    )?.idNivelDesempeno == r.idNivelDesempeno
                        ).length;
                    porcentaje += cantidad;
                    row.rubrica = r.nombre;
                    row.puntaje = cantidad;
                    rep.push(row);
                }
                if(porcentaje != 0)
                    for(let r of rep)
                        r.porcentaje = `${((r.puntaje / porcentaje)*100).toFixed(2)}%`;
                // this.porcentajeCalificados = (porcentaje/aCalificados.length)*100;
            }
            return rep;
        }
    },
    watch: {
        indexIndicadorSeleccionado(){
            if(this.indexIndicadorSeleccionado == 0 || this.data.terminar)
                this.disableGuardarbutton = true;
            else
                this.disableGuardarbutton = false;
        },
    },
    methods: {
        openDialog(item){
            this.dialog = true;
            this.itemAux = item;
        },
        changeConfirm(item) {
            this.seleccionMultiple(this.itemAux);
            this.closeChange();
        },
        closeChange() {
            this.dialog = false;
        },
        terminarAlumnos(){
            if(this.indexIndicadorSeleccionado==0){
                return;    
            }
            this.data.terminar = this.terminado = this.disableGuardarbutton  = true;
            let listaAlumnos = this.listaEnviar;
            listaAlumnos.idMuestra = this.$route.params.idMuestra;            
            this.enviarAlumnos(this.listaEnviar, this.terminado).catch((e) => {
                this.manejarAlertaTerminado(1,0);
                this.terminado = this.disableGuardarbutton = false;
            }).then(()=>{
                this.manejarAlertaTerminado(0,0);
                this.listaEnviar.alumnos = this.alumnosAux.filter(item => item.estado == true);
                this.cargarDatos(this.listaEnviar.alumnos);
                this.notasGuardadas = true;
            });
        },
        subirAlumnos(listaAlumnos){
            this.cargaAlumnos = true;
            for(let l of listaAlumnos)
                l.codigo = l.codigo.toString();
            registrarAlumnos(this.data.idMuestra, listaAlumnos).then((result) => {
                getIndicadoresDesempenoPorMuestra(this.data.idMuestra).then((response) => {
                    this.datos = response.data;
                    this.cargarDatos(this.datos.alumnos);
                }).catch((e) => console.error("Error al obtener alumnos", e));
            }).catch((e) => {
                console.log(e);
            }).finally(() => {this.cargaAlumnos = false});
        },
        seleccionMultiple(item){
            for(let a of this.alumnos)
                a.calificacion = item.idNivelDesempeno;
        },
        cancelarNotas(){
            this.datos.alumnos = this.datos.alumnos.map(item => {item.estado = true; return item});
            this.cargarDatos(this.datos.alumnos);
        },
        deleteItem(index){
            let aux = this.alumnosAux.find(item => item.idAlumno == this.alumnos[index].idAlumno);
            aux.estado = false;
            this.alumnos.splice(index, 1);
        },
        guardarAlumnos(){
            if(this.indexIndicadorSeleccionado==0){
                return;    
            }
            this.disableGuardarbutton = true;
            let listaAlumnos = this.listaEnviar;
            listaAlumnos.idMuestra = this.$route.params.idMuestra;
            this.enviarAlumnos(listaAlumnos, false).catch((e) => {
                this.manejarAlerta(1,0);
                console.log(e);
            }).then(()=>{
                this.manejarAlerta(0,0);
                this.listaEnviar.alumnos = this.alumnosAux.filter(item => item.estado == true);
                this.cargarDatos(this.listaEnviar.alumnos);
                this.notasGuardadas = true;
            })
            .finally(() => {
                this.disableGuardarbutton = false;
            });
        },
        async enviarAlumnos(listaAlumnos, terminado){
            this.guardarNotas();
            listaAlumnos.terminado = terminado;
            actualizarAlumnos(listaAlumnos);//.then((response) => console.log("Response:",response));
        },
        guardarNotas(){
            if(this.indexIndicadorSeleccionado == 0) 
                return;
            let alumnos = this.listaEnviar.alumnos;
            let listaAlumnosUsuario = this.alumnosAux;
            for(let a of listaAlumnosUsuario){
                // Encuentra al alumno en la lista a enviar
                let alumnoLista = alumnos.find(item => item.idAlumno == a.idAlumno);
                // si no existe se crea
                if(alumnoLista == undefined){
                    let nuevoAlumno = {
                        "estado": a.estado,
                        "idAlumno": a.idAlumno,
                        "notas": [],
                    };
                    alumnos.push(nuevoAlumno);
                    alumnoLista = alumnos[alumnos.length - 1];
                }
                else {
                    alumnoLista.estado = a.estado;
                }
                // se busca el indicador a calificar en las notas
                let nota = alumnoLista.notas.find(item => item.idIndicador == this.indexIndicadorSeleccionado);
                let notaListaAux = a.notas.find(item => item.idIndicador == this.indexIndicadorSeleccionado);
                
                // se busca el alumno en la lista que se muestra al usuario
                let notaAux = this.alumnos.find(item => item.idAlumno == a.idAlumno);
                if(notaAux == undefined)
                    notaAux = {calificacion: -1};

                if(notaListaAux)
                    if(a.estado)
                        notaListaAux.idNivelDesempeno = notaAux.calificacion;
                
                if(nota){
                    if(alumnoLista.estado){
                        // en caso de que se encuentre la nota solo se actualiza el indicador
                        nota.idNivelDesempeno = notaAux.calificacion;
                    }
                }
                else{
                    if(alumnoLista.estado){
                        // si no se encuentra la nota y el alumno no fue eliminado se agrega la nota
                        alumnoLista.notas.push({
                            "idIndicador": this.indexIndicadorSeleccionado,
                            "idNivelDesempeno": notaAux.calificacion,
                        });
                    }
                    else{
                        // en caso no se encuentre la nota y el alumno fuera eliminaso se agrega una nota vacía
                        alumnoLista.notas.push({
                            "idIndicador": this.indexIndicadorSeleccionado,
                            "idNivelDesempeno": -1,
                        });
                    }
                }
            }
        },
        cargarDatos(alumnos) {
            this.alumnosAux = [...alumnos];
            this.alumnos = [];
            for(let a of alumnos){
                if(!a.estado)
                    continue;
                let objeto = {
                    codigo: a.codigo,
                    idAlumno: a.idAlumno,
                    nombre: a.nombre,
                    calificacion: -1,
                };
                if(this.indexIndicadorSeleccionado != 0){
                    let nota = a.notas.find(item => item.idIndicador == this.indexIndicadorSeleccionado);
                    if(nota != undefined){
                        objeto.calificacion = nota.idNivelDesempeno;
                    }
                }
                this.alumnos.push(objeto);
            }
        },
        goTo() {
            if(this.indexIndicadorSeleccionado != 0){
                let listaAlumnos = this.listaEnviar;
                listaAlumnos.idMuestra = this.$route.params.idMuestra;
                this.enviarAlumnos(listaAlumnos, false).catch((e) => {
                    console.log(e);
                });
            }
            let data =  {
                    curso: this.data.curso,
                    horario: this.data.horario,
                    idMuestra: this.data.idMuestra,
                    idSemestre: this.data.idSemestre,
                    nombreSemestre: this.data.nombreSemestre,
                    selectedIdem: this.value,
                    terminar: this.data.terminar,
                };
            sessionStorage.setItem("medicionDetalle", JSON.stringify(data));
            this.$router.push({
                name: "Evidencias",
                params: data,
            });
        },
        async listarIndicadoresDesempeno(idMuestra) {
            try {
                let response = await getIndicadoresDesempenoPorMuestra(idMuestra);
                this.datos = response.data;
                this.indicadores = this.datos.indicadores.map((data) => ({
                    value: data.idIndicador,
                    text: data.nombreIndicador,
                }));
                this.cargarDatos(this.datos.alumnos);
            } catch (error) {
                console.log("Error al obtener los indicadores de desempeño.", error);
            }
        },
        cambioIndicador(value) {
            let indicador;
            for (let i = 0; i < this.datos.indicadores.length; i++) {
                indicador = this.datos.indicadores[i];
                if(indicador.idIndicador === value) break;
            }
            this.guardarNotas();
            this.indexIndicadorSeleccionado = indicador.idIndicador;
            this.rubricas = indicador.rubricas;
            this.cargarDatos(this.alumnosAux);
            this.terminado = this.disableGuardarbutton = this.data.terminar;
        },
        manejarAlerta(tipo, accion) {
            if(this.terminado)
                return;
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Las notas se registraron exitosamente";
                } else if (accion==1) {//editar
                    this.textoAlerta="Las notas se editaron exitosamente";
                } else {//delete
                    this.textoAlerta="Las notas se eliminaron exitosamente";
                }
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta='Ocurrió un error al registrar las notas';
                } else if(accion==1) {//editar
                    this.textoAlerta="Ocurrió un error al editar las notas";
                } else {//delete
                    this.textoAlerta="Ocurrió un error al eliminar las notas";
                }
            }
        },
        manejarAlertaTerminado(tipo, accion) {
            if (tipo == 0) {
                this.hayAlertTerminado=!this.hayAlertTerminado;
                this.senalAlertaTerminado=tipo;
                if(accion==0) {//registro
                    this.textoAlertaTerminado="Las notas se terminaron de registrar exitosamente";
                } else if (accion==1) {//editar
                    this.textoAlertaTerminado="Las notas se terminaron de registrar exitosamente";
                } else {//delete
                    this.textoAlertaTerminado="Las notas se terminaron de registrar exitosamente";
                }
            } else {
                this.hayAlertTerminado=!this.hayAlertTerminado;
                this.senalAlertaTerminado=tipo;
                if (accion==0) {//registro
                    this.textoAlertaTerminado='Ocurrió un error al terminar de registrar las notas';
                } else if(accion==1) {//editar
                    this.textoAlertaTerminado="Ocurrió un error al terminar de registrar las notas";
                } else {//delete
                    this.textoAlertaTerminado="Ocurrió un error al terminar de registrar las notas";
                }
            }
        },
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
        }
        this.data = sessionStorage.getItem("medicionDetalle") ? JSON.parse(sessionStorage.getItem("medicionDetalle")) : this.$route.params;
        this.terminado = this.data.terminar;
        this.listarIndicadoresDesempeno(this.data.idMuestra)
            .then(() => {
                this.value = this.indicadores[0];
                this.cambioIndicador(this.indicadores[0]);
            });
    },
};
</script>

<style scoped>
@import "../../../../assets/styles.css";

.botones {
  display: flex;
  justify-content: space-between;
}

.botones-2 {
  display: flex;
  justify-content: space-between;
}

.panel {
  background-color: var(--wb1);
  padding: 0.5rem;
  margin: 1rem 0 0 0;
  border-radius: 0.5rem;
  /*border-style: solid;
        border-width: 2px;
        border-color: var(--turquoise);*/
}

.select {
    padding-top: 1.5rem !important;
}

.contenidoPanel {
  margin: 1rem 2rem 0rem 2rem;
}

.btnCancelar {
  /*background-color: var(--coral) !important;*/
  margin: 0.5rem;
}

.btnGuardar {
  /*background-color: var(--turquoise) !important;*/
  margin: 0.5rem;
}

td {
  width: 300px;
  text-align: start;
}

.notas {
    padding-top: 25px;
}

.infor {
    width: 85% !important;
    padding-bottom: 5px;
}

.rubricas-no-disponibles {
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    align-content: center;
}

.nombreIndicador {
    width: 80%;
}

.dialog-body {
    white-space: nowrap;
}

</style>
