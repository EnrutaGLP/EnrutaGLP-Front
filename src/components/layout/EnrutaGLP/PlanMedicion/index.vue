<template>
	<div class="contenedorPrincipal">
		<div>
			<Title texto="Mediciones y Resultados > Planes de Medición"/>
			<br />
			<v-row class="containerFiltrosIniciales">
				<v-col cols="4" class="containerEspecialidad">
					<div>Especialidad:</div>
					<div class="filtroEspecialidad">
						<Select
							v-on:cambio-seleccion="cambioEspecialidad"
							v-bind:items="especialidades"
							item-text="nombre"
							item-value="id_especialidad"
							mensajeNoData="No hay especialidades asignadas"
						/>
					</div>
				</v-col>
				<v-col cols="2" class="containerCiclo">
					<div>Ciclo:</div>
					<div class="filtroSemestre">
						<Select
							:key="limpiar"
							v-on:cambio-seleccion="cambioSemestre"
							v-bind:items="semestres"
							v-bind:disabled="!especialidadSelected"
							item-text="nombre"
							item-value="id_semestre"
							mensajeNoData="No hay semestres registrados"
						/>
					</div>
				</v-col>
			</v-row>
			<v-divider/>
			<Alert
				v-bind:senalAlerta="senalAlerta"
				v-bind:textoAlerta="textoAlerta"
				v-bind:hayAlert="hayAlertPM"
			/>
			<div class="panel">
				<div class="containerResultadoEsperado">
					<div>Resultado Esperado:</div>

					<div class="containerTextoResultadoEsperado">
						Se desea que para cada Resultado del Estudiante, por lo menos el
						<span class="inputWithinText">
							<v-text-field
								:rules="[rules.required, rules.porcentaje]"
								v-model="porcentaje"
								v-bind:disabled="disabledInputs"
								@input="cambioPorcentaje"
								outlined
							>
							</v-text-field>
						</span>
						% de alumnos evaluados obtenga un nivel

						<div class="filtroResultadoEsperado">
							<Select
								v-bind:disabled="disabledInputs"
								v-bind:placeholder="nivelDesempenoSelec"
								v-bind:items="nivelesDesempeno"
								item-text="nombre"
								item-value="id_nivel_desempeno"
								v-on:cambio-seleccion="cambioNivelDesempeno"
								:key="llave"
							>
							</Select>
						</div>
						o mayor.<p class="paragraph"></p>
						<v-icon
							:disabled="!cicloSelected"
							medium
							class="mr-2"
							@click="cambioDisable"
							>
							{{ disabledInputs ? "mdi-square-edit-outline" : "mdi-content-save" }}
						</v-icon>
					</div>
					
				</div>
				<br />
				<v-form ref="form">
					<div class="containerFecha">
						<div>Fecha de Inicio:</div>
						<div class="datePicker">
							<DatePicker
								fin="0"
								:comparator="fFin"
								v-bind:date="fInicio"
								v-bind:disabled="disabledInputs"
								v-on:cambio-fecha="cambioFechaIni"
							/>
						</div>
					</div>
					<div class="containerFecha">
						<div>Fecha de Fin:</div>
						<div class="datePicker">
							<DatePicker
								fin="1"
								:comparator="fInicio"
								v-bind:date="fFin"
								v-bind:disabled="disabledInputs"
								v-on:cambio-fecha="cambioFechaFin"
							/>
						</div>
					</div>
				</v-form>	
			</div>
			<br />
			<div v-if="existePlanMedicion">
				<div class="containerResultado">
				</div>
				<Alert
					v-bind:senalAlerta="senalAlerta"
					v-bind:textoAlerta="textoAlerta"
					v-bind:hayAlert="hayAlertDT"
				/>
				<div>
					<DataTable
						:idEspecialidad="idEspecialidad"
						:disabled="!agregarMedicionEnabled"
						v-bind:resultados="this.resultados"
						v-bind:columnas="columns"
						v-bind:filas="rows"
						v-bind:resultadoEstudiante="resultadoEstudiante"
						v-bind:idPlanMedicion="idPlanMedicion"
						v-bind:idResultado="resultadoEstudiante"
						v-bind:cursos="cursos"
						v-bind:cargando="cargando"
						v-on:listar-evaluaciones-curso="listarEvaluacionesCurso"
                    	v-on:alerta="manejarAlerta"
						
					/>
					<!--
										<CRUDDataTable 
												v-bind:headers="columns"
												v-bind:dataList="rows"
										/>
										-->
				</div>
				<br />
			</div>
			<div>
				<BackButton />
			</div>
		</div>
	</div>
</template>

<script>
import BackButton from "../../../shared/BackButton";
import DataTable from "./DataTable";
import Select from "../../../shared/Select";
import Title from "../../../shared/Title";
import DatePicker from "../../../shared/DatePicker";
import * as CryptoJS from 'crypto-js';
import {
	getResultadosEstudiante,
	getNivelesDesempeno,
	getSemestres,
	setPlanmedicion,
	getMediciones,
	getPlanmedicion,
	updatePlanmedicion,
	getEspecialidadesPorFacultad,
	consultarNivelDesempeno,
	consultarResultadoEstudiante,
	getEvaluacionesCurso,
	getCursos,
} from "@/components/util/services/index";
import Alert from "@/components/shared/Alert.vue";

//import CRUDDataTable from '../../../shared/CRUDDataTable';

export default {
	name: "PlanMedicion",
	components: {
		BackButton,
		DataTable,
		Select,
		Title,
		DatePicker,
		Alert,
		//CRUDDataTable,
	},
	data() {
		return {
			disabledInputs: true,
			columns: [
				{ text: "Curso", value: "nombre", class: "grey lighten-3" },
				{ text: "Acciones", value: "actions", class: "grey lighten-3" },
			],
			rows: [],
			especialidades: [],
			semestres: [],
			resultados: [],
			nivelesDesempeno: [],
			planMedicion: {
				id_plan_medicion: null,
				fechaInicio: "",
				fechaFin: "",
				porcentajeLogro: "",
				semestre: "",
				especialidad: "",
				coordinadorespecialidad: 1,
				id_nivel_desempeno: "",
			},
			existePlanMedicion: false,
			cargando: true,
			porcentaje: "",
			nivelDesempenoSelec: "",
			resultadoEstudiante: 0,
			idPlanMedicion: 0,
			fInicio: new Date().toISOString().substr(0, 10),
			fFin: new Date().toISOString().substr(0, 10),
			especialidadSelected: false,
			cicloSelected: false,
			resultadoSelected: false,
			agregarMedicionEnabled: false,
			idEspecialidad: 0,
			idSemestre: 0,
			llave: 1,
			limpiar: 1,
			editandoPlanMedicion: false,
			rules: {
				required: (value) => !!value || "Obligatorio.",
				porcentaje: (value) => {
					const pattern = /^[1-9][0-9]?$|^100$/;
					return pattern.test(value) || "Porcentaje no válido.";
				},
			},
			id_persona:-1,
			datosUsuario:{

			},
			acceso: -1,
            textoAlerta: "",
            senalAlerta: '',
            hayAlertDT: false,
            hayAlertPM: false,
			cursos : [],
			especialidadPreSeleccionada : 0,
			semestrePreSeleccionado : 0,
		};
	},
	watch: {
		especialidadSelected() {
			this.agregarMedicionEnabled =
				this.especialidadSelected && this.resultadoSelected;
		},
		resultadoSelected() {
			this.agregarMedicionEnabled =
				this.especialidadSelected && this.resultadoSelected;
		},
		porcentaje() {
			if (
				(!this.disabledInputs && this.existePlanMedicion) ||
				this.editandoPlanMedicion
			) {
				if (this.validarPorcentaje() && this.validarFechas() && this.nivelDesempenoSelec!=="") {
					this.cicloSelected = true;
				} else {
					this.cicloSelected = false;
				}
			}
		},
		fInicio() {
			this.$nextTick(() => {
				this.$refs.form.validate();
			});
			if (
				(!this.disabledInputs && this.existePlanMedicion) ||
				this.editandoPlanMedicion
			) {
				if (this.validarPorcentaje() && this.validarFechas() && this.nivelDesempenoSelec!=="") {
					this.cicloSelected = true;
				} else {
					this.cicloSelected = false;
				}
			}
		},
		fFin() {
			this.$nextTick(() => {
				this.$refs.form.validate();
			});
			if (
				(!this.disabledInputs && this.existePlanMedicion) ||
				this.editandoPlanMedicion
			) {
				if (this.validarPorcentaje() && this.validarFechas() && this.nivelDesempenoSelec!=="") {
					this.cicloSelected = true;
				} else {
					this.cicloSelected = false;
				}
			}
		},
		nivelDesempenoSelec(){
			if (
				(!this.disabledInputs && this.existePlanMedicion) ||
				this.editandoPlanMedicion
			) {
				if (this.validarPorcentaje() && this.validarFechas() && this.nivelDesempenoSelec!=="") {
					this.cicloSelected = true;
				} else {
					this.cicloSelected = false;
				}
			}
		},
		existePlanMedicion(){
			this.agregarMedicionEnabled =
				this.especialidadSelected;
			this.listarEvaluacionesCurso();
		},
		async $route (to, from){
			console.log("to: ",to);
			console.log("from: ", from);

			const resCurs = await getCursos(this.idEspecialidad);
    		this.cursos = resCurs.data.cursos;
		},
		async idEspecialidad(){
			const resCurs = await getCursos(this.idEspecialidad);
    		this.cursos = resCurs.data.cursos;
		},
	},
	methods: {
		validarPorcentaje() {
			const pattern = /^[1-9][0-9]?$|^100$/;
			return this.porcentaje != "" && pattern.test(this.porcentaje);
		},
		validarFechas() {
			return (
				this.fFin.localeCompare(this.fInicio) == 1 &&
				this.fFin != "" &&
				this.fInicio != ""
			);
		},
		cambioSemestre(dato) {
			this.disabledInputs = true;
			this.cicloSelected = true;
			this.planMedicion.semestre = dato;
			this.idSemestre = dato;
			this.editandoPlanMedicion = false;
			this.rows = [];
			this.agregarMedicionEnabled = false;
			this.fillPlanMedicion(dato, this.idEspecialidad);
		},
		async fillPlanMedicion(idSemestre, idEsp) {
			var req = await getPlanmedicion(idSemestre, idEsp);
			//alert(JSON.stringify(req.data));
			if (req.data.dataFound) {
				if (req.data.status == "success") {
					this.planMedicion.semestre = idSemestre;
					this.setFechaIni(req.data.fecha_inicio);
					this.setFechaFin(req.data.fecha_fin);
					this.planMedicion.coordinadorespecialidad =
						req.data.id_coordinador_especialidad;
					this.planMedicion.especialidad = req.data.id_especialidad;
					this.planMedicion.id_nivel_desempeno = req.data.id_nivel_desempeno;
					this.setNivelDesempeno(req.data.id_nivel_desempeno);
					this.planMedicion.id_plan_medicion = req.data.id_plan_medicion;
					this.idPlanMedicion = req.data.id_plan_medicion;
					this.setPorcentaje(req.data.porcentaje_logro);
					this.existePlanMedicion = true;
				}
			} else {
				this.reiniciarDatos();
				this.existePlanMedicion = false;
				this.planMedicion.especialidad = this.idEspecialidad;
				this.planMedicion.semestre = this.idSemestre;
			}
			this.listarEvaluacionesCurso();
		},
		reiniciarDatos() {
			this.existePlanMedicion = false;
			this.nivelDesempenoSelec = "";
			this.llave += 1;
			//alert(this.nivelDesempenoSelec);
			this.porcentaje = "";
			this.planMedicion = {
				id_plan_medicion: null,
				fechaInicio: "",
				fechaFin: "",
				porcentajeLogro: "",
				semestre: "",
				especialidad: "",
				coordinadorespecialidad: 1,
				id_nivel_desempeno: "",
			};
			this.planMedicion.fechaInicio = new Date().toISOString().substr(0, 10);
			this.planMedicion.fechaFin = new Date().toISOString().substr(0, 10);
			this.fInicio = new Date().toISOString().substr(0, 10);
			this.fFin = new Date().toISOString().substr(0, 10);
			this.rows = [];
		},
		setPorcentaje(dato) {
			this.porcentaje = String(dato);
			this.planMedicion.porcentajeLogro = dato;
		},
		async setNivelDesempeno(dato) {
			const resND = await consultarNivelDesempeno(dato);
			this.nivelDesempenoSelec = resND.data.nivelDesempeno.nombre;
			this.llave += 1;
		},
		cambioEspecialidad(dato) {
			//limpiar ciclo
			this.limpiar += 1;
			this.reiniciarDatos();
			this.cicloSelected = false;
			//limpiar resultado
			this.resultadoSelected = false;
			this.resultadoSelected = false;
			this.idEspecialidad = dato;
			this.disabledInputs = true;
			this.especialidadSelected = true;
			this.planMedicion.especialidad = dato;
			this.editandoPlanMedicion = false;
			//this.fillPlanMedicion(this.idSemestre,dato);
			this.getREyND(dato);
		},

		async cambioNivelDesempeno(dato) {
			this.planMedicion.id_nivel_desempeno = dato;
			const resND = await consultarNivelDesempeno(dato);
			this.nivelDesempenoSelec = resND.data.nivelDesempeno.nombre;
			this.llave += 1;

			//console.log("No entra::", this.nivelesDesempeno.length);
			// for (let index = 0; index < this.nivelesDesempeno.length; index++) {
			//     console.log("No entra");
			//     if (parseInt(this.nivelesDesempeno[index].id_nivel_desempeno) ===  parseInt(dato)){
			//         this.nivelDesempenoSelec = this.nivelesDesempeno[index];
			//         console.log("nivel desmp seleccionado::", this.nivelDesempenoSelec)
			//         break;
			//     }
			//}

			//const resND = await consultarNivelDesempeno(dato);  //recien comentado
			//this.nivelDesempenoSelec = resND.data.nivelDesempeno; //recien comentado
		},
		cambioDisable() {
			console.log("cambio medicion::", this.planMedicion);
			if (this.disabledInputs == false) {
				//actualizar la base de datos
				this.editandoPlanMedicion = false;
				this.grabarPlanMedicion();
			} else {
				this.editandoPlanMedicion = true;
			}
			this.disabledInputs = !this.disabledInputs;
		},
		cambioResultado(dato) {
			this.agregarMedicionEnabled = true;
			this.resultadoSelected = true;
			this.resultadoEstudiante = dato;
			console.log("re ::", this.resultadoEstudiante);
			this.listarMediciones();
		},
		async grabarPlanMedicion() {
			
			try {
				if (!this.existePlanMedicion) {
					//alert(JSON.stringify(this.planMedicion));
					console.log("grabar medicion::", this.planMedicion);
					const resPM = await setPlanmedicion(this.planMedicion);
					
					if(resPM.data.status=="success"){
						this.planMedicion.id_plan_medicion = resPM.data.id_plan_medicion;
						this.idPlanMedicion = resPM.data.id_plan_medicion;
						this.existePlanMedicion = true;
						this.fillPlanMedicion(this.idSemestre,this.idEspecialidad);
						this.manejarAlerta(0,3);
					}
					else{
						this.manejarAlerta(1,3);
					}

				} else {
					//alert("grabando");
					//alert(JSON.stringify(this.planMedicion));
					this.planMedicion.semestre = this.idSemestre;
					this.planMedicion.especialidad = this.idEspecialidad;
					const resUPM = await updatePlanmedicion(this.planMedicion);
					//status success
					if(resUPM.data.status=="success"){
						this.manejarAlerta(0,2);
					}
					else{
						this.manejarAlerta(1,2);
					}
				}
			} catch (error) {
				if(!this.existePlanMedicion){
					this.manejarAlerta(1,3);
				}
				else{
					this.manejarAlerta(1,2);
				}
				console.error(error);
			}
		},
		cambioFechaIni(dato) {
			this.planMedicion.fechaInicio = dato; //.toISOString();
			this.fInicio = dato;
		},
		cambioFechaFin(dato) {
			this.planMedicion.fechaFin = dato; //.toISOString();
			this.fFin = dato;
		},
		setFechaIni(fecha) {
			this.fInicio = new Date(fecha).toISOString().substr(0, 10);
			this.planMedicion.fechaInicio = this.fInicio;
		},
		setFechaFin(fecha) {
			this.fFin = new Date(fecha).toISOString().substr(0, 10);
			this.planMedicion.fechaFin = this.fFin;
		},
		cambioPorcentaje(dato) {
			this.planMedicion.porcentajeLogro = dato;
			this.porcentaje = dato;
		},
		async listarEvaluacionesCurso() {
			this.cargando = true; 
			console.log("id pm ::", this.idPlanMedicion);
			const resEC = await getEvaluacionesCurso(
				this.idPlanMedicion
			);
			this.rows = resEC.data.evaluacionesCurso;
			console.log("rows ::", this.rows);
			this.cargando = false;
		},
		async getREyND(idEspecialidad) {
			const resRes = await getResultadosEstudiante(idEspecialidad);
			this.resultados = resRes.data.resultadosEstudiante;

			const resDes = await getNivelesDesempeno(idEspecialidad);
			this.nivelesDesempeno = resDes.data.nivelesDesempeno;
		},
		async listarEspecialidades(idFacultad) {
            console.log("Entra a listar especialidades");
            let listaEspecialidades = [];
            try {
                const data = await getEspecialidadesPorFacultad(idFacultad);
                console.log(data);
                listaEspecialidades = data.data.especialidades;
                listaEspecialidades.forEach(element => {
                    this.especialidades.push({nombre:element.nombre, id_especialidad:element.id_especialidad});
                });
            } catch (err) {
                console.log("Error al listar especialidades "+err);
            }
        },
        manejarAlerta(tipo, accion) {
			if ((accion==0)||(accion==1)){
				if (tipo == 0) {
					this.hayAlertDT=!this.hayAlertDT;
					this.senalAlerta=tipo;
					if(accion==0) {//subir
						this.textoAlerta="Se agregó exitosamente el curso";
					} else if (accion==1) {//eliminar
						this.textoAlerta="Se eliminó exitosamente el curso";
					} 
				} else if(tipo == 1) {
					this.hayAlertDT=!this.hayAlertDT;
					this.senalAlerta=tipo;
					if (accion==0) {//subir
						this.textoAlerta='No existen indicadores asociados a este resultado del estudiante';
					} else if(accion==1) {//eliminar
						this.textoAlerta="Hubo un error al eliminar el curso";
					} 
				} 
			}
			else{
				this.hayAlertPM=!this.hayAlertPM;
				this.senalAlerta=tipo;
                if (accion==2) { //actualizar
					if (tipo==0){//correcto
 						this.textoAlerta="Se actualizó exitosamente el plan de medicion";
					}
					else if(tipo==1){//incorrecto
 						this.textoAlerta="Hubo un error al actualizar el plan de medicion";
					}
                } else if(accion==3) {//agregar
					if (tipo==0){//correcto
 						this.textoAlerta="Se registró exitosamente el plan de medicion";
					}
					else if(tipo==1){//incorrecto
 						this.textoAlerta="Hubo un error al agregar el plan de medicion";
					}
                } 
			}
        },
	},
	async created() {
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
		this.fFin = new Date().toISOString().substr(0, 10);
		this.fInicio = new Date().toISOString().substr(0, 10);

		this.id_persona = CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona');
        this.id_persona = this.id_persona.toString(CryptoJS.enc.Utf8);
        let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
        this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));

		if(this.acceso<7){
			this.datosUsuario.facultades.forEach(element => {
                this.listarEspecialidades(element.id_facultad); 
            });
            this.datosUsuario.especialidaes.forEach(element=>{
                this.especialidades.push({
					nombre:element.nombre, id_especialidad:element.id_especialidad
				});
            });
			// this.especialidadPreSeleccionada = this.especialidades[0]; 
			// this.cambioEspecialidad(this.especialidadPreSeleccionada.id_especialidad);
			// this.idEspecialidad = this.especialidadPreSeleccionada.id_especialidad;
		}else{
			this.$router.push('/home');
		}

		const resSem = await getSemestres();
		this.semestres = resSem.data.semestres;
		// this.semestrePreSeleccionado = this.semestres[0]; 
		// this.cambioSemestre(this.semestrePreSeleccionado.id_semestre);
		// this.idSemestre = this.semestrePreSeleccionado.id_semestre;
		this.cargando = false;
	},
	mounted() {
		this.$refs.form.validate();
	},
};
</script>

<style scoped>
.filtroResultadoEsperado {
	width: 150px !important;
	margin: 3.2px !important;
}
.filtroSemestre {
	width: 120px !important;
}
.filtroResultado {
	width: 900px !important;
}
.containerCiclo {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	width: 330px !important;
}
.containerResultadoEsperado {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	width: 1160px !important;
}
.containerFecha {
	display: inline-flex;
	align-items: baseline;
	justify-content: space-around;
	width: 460px !important;
}
.containerResultado {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	width: 1110px !important;
}
.datePicker {
	width: 250px !important;
}
.inputWithinText {
	width: 5.5rem !important;
	padding: 0.5rem 0.5rem 0rem 0.5rem !important;
}
.containerTextoResultadoEsperado {
	display: flex;
	align-items: baseline;
	flex-wrap: wrap;
	width: 950px !important;
}
.containerEspecialidad {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	width: 28.2em !important;
}
.filtroEspecialidad {
	width: 15em !important;
}
.paragraph{
    width: 3rem !important;
}
.panel {
  background-color: white;
  padding: 1.5rem;
  margin: 1rem 0 0 0;
  border-radius: 0.5rem;
}

</style>
