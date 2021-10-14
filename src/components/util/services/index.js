import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import * as base from '../../../../base-config.json';

var direccion = "https://" + base.url + ':' + base.port;
//const URL = "http://100.25.226.224:80";
//const URL = "http://54.174.91.225:80";
const URL = "http://localhost:8080";
//const URL = direccion;
var idPersonaLoggeada;
export function getAcceso(correo, constrasena) {
    setIdPersonaLoggeada(correo, constrasena);
    return axios.post(URL + "/acceso", {
                "email": correo, 
                "password": constrasena,
            });
}
async function setIdPersonaLoggeada(correo, constrasena) {
    var data = await axios.post(URL + "/acceso", {
                "email": correo, 
                "password": constrasena,
                });
    if(data.data.access != 0){
        idPersonaLoggeada = data.data.datos[0].personas.id_persona;
    }
    
}

function getIdPersonaLoggeada(){
    if(idPersonaLoggeada==undefined){
        idPersonaLoggeada = parseInt(CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona')
                                .toString(CryptoJS.enc.Utf8));
    }
    return idPersonaLoggeada;
}

export function validarUsuario(correo) {
    return axios.post(URL + "/validarUsuario", {
                "email": correo
            });
}

//#region Especialidades

export function getEspecialidadesFacultad(idFacultad){
    return axios.post(URL+"/listarEspecialidades",{
        "idFacultad":idFacultad,
    })
}
export function getEspecialidadesPorFacultad(idFacultad){
    return axios.post(URL+"/listarEspecialidadesPorFacultad",{
        "id_facultad":idFacultad,
    });
}
export function setEspecialidades(idFacultad, codigo, nombre, descripcion, usuario){
    return axios.post(URL+"/agregarEspecialidad",{
        "id_facultad":idFacultad,
        "nombre":nombre,
        "id_coordinador":usuario.id_persona,
        "descripcion":descripcion,
        "codigo":codigo,
        "idAutor": getIdPersonaLoggeada(),
    });
}
export function updateEspecialidades(idFacultad, idEspecialidad, codigo, nombre, descripcion, usuario){
    return axios.put(URL+"/modificarEspecialidad",{
        "id_facultad":idFacultad,
        "id_especialidad":idEspecialidad,
        "nombre":nombre,
        "id_coordinador":usuario.id_persona,
        "descripcion":descripcion,
        "codigo":codigo,
        "idAutor": getIdPersonaLoggeada(),
    });
}
export function deleteEspecialidades(idEspecialidad){
    return axios.post(URL+"/eliminarEspecialidad",{
        "id_especialidad":idEspecialidad,
        "idAutor": getIdPersonaLoggeada(),
    });
}
export function getEspecialidadesUsuarioGenerico(idUsuario){
    return axios.get(URL + "/api/listarEspecialidadesUsuario",{
        "idUsuario": idUsuario,
    });
}
//#endregion

//#region Asistente de Coordinador de Especialidad
export function setAsistenteEspecialidad(idPersona,idEspecialidad){
    return axios.post(URL+"/agregarAsistente",{
        "id_persona":idPersona,
        "id_especialidad":idEspecialidad,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function listarAsistentes(){
       return axios.get(URL+"/listarAsistente");
}

//#region Facultades

export function getFacultades(id_persona){
    return axios.post(URL+"/listarFacultades",{
        "id_persona":id_persona,
    });
}
export function getFacultadUsuario(){
    console.log("entre");
    return axios.get(URL+"/listarFacultadUsuario");
}
export function setFacultades(codigo,nombre,descripcion,usuario){
    return axios.post(URL+"/agregarFacultad",{
        "nombre":nombre,
        "descripcion":descripcion,
        "codigo":codigo,
        "id_coordinador":usuario.id_persona,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function updateFacultades(idFacultad,codigo,nombre,descripcion,usuario){
    return axios.put(URL+"/modificarFacultad",{
        "id_facultad":idFacultad,
        "nombre":nombre,
        "descripcion":descripcion,
        "codigo":codigo,
        "id_coordinador":usuario.id_persona,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function deleteFacultades(idFacultad){
    return axios.post(URL+"/eliminarFacultad",{
        "id_facultad":idFacultad,
        "idAutor": getIdPersonaLoggeada(),
    });
}

////#endregion

export function getUsuarios(){
    return axios.get(URL+"/listarUsuarios");
}

//#region ResultadosEstudiante
export function getResultadosEstudiante(idEspecialidad){
    return axios.post(URL+"/resultadoEstudiante",{
        "id_especialidad":idEspecialidad,
    });
}

export function setResultadosEstudiante(codigo, descripcion, idEspecialidad){
    return axios.post(URL+"/insertarResultadoEstudiante",{
        "codigo":codigo,
        "descripcion":descripcion,
        "id_especialidad":idEspecialidad,
        "idAutor": getIdPersonaLoggeada(),
    })
}
export function updateResultadosEstudiante(idResultado,codigo,descripcion){
    return axios.put(URL+"/resultadoEstudiante/modificarResultadoEstudiante",{
        "id_resultado_estudiante":idResultado,
        "codigo":codigo,
        "descripcion":descripcion,
        "idAutor": getIdPersonaLoggeada(),
    })
}
export function deleteResultadosEstudiante(idResultado){
    console.log("idresultado:"+idResultado);
    return axios.post(URL+"/resultadoEstudiante/eliminarResultadoEstudiante",{
        "id_resultado_estudiante": idResultado,
        "idAutor": getIdPersonaLoggeada(),
    });
}
//#endregion

//#region IndicadoresDesempeño

export function getIndicadoresDesempeno(idResultado){
    return axios.post(URL+"/indicadorDesempeno",{
        "id_resultado_estudiante" : idResultado,
    })
}

export function setIndicadoresDesempeno(idResultado, nombre){
    return axios.post(URL + "/agregarIndicador" ,{
        "id_resultado_estudiante" : idResultado,
        "nombre"                  : nombre,
        "idAutor": getIdPersonaLoggeada(),
    })
}

export function updateIndicadoresDesempeno(idIndicador, nombre){
    return axios.put(URL + "/modificarIndicador" ,{
        "id_indicador"  : idIndicador,
        "nombre"        : nombre,
        "idAutor": getIdPersonaLoggeada(),
    })
}

export function deleteIndicadoresDesempeno(idIndicador){
    console.log("idresultado:"+idIndicador);
    return axios.post(URL + "/eliminarIndicadorDesempeno" ,{
        "id_indicador" : idIndicador,
        "idAutor": getIdPersonaLoggeada(),
    })
}
//#endregion

//#region Niveles Desempeno
export function getNivelesDesempeno(idEspecialidad){
    return axios.get(URL+"/nivelDesempeno?id_especialidad="+idEspecialidad);
}

export function setNivelesDesempeno(idEspecialidad,nombre,puntaje){
    return axios.post(URL+"/nivelDesempeno",{
        "id_especialidad":idEspecialidad,
        "nombre":nombre,
        "puntaje":puntaje,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function updateNivelesDesempeno(idNivelDesempeno,nombre,puntaje){
    return axios.put(URL+"/modificarNivelDesempeno",{
        "id_nivel_desempeno":idNivelDesempeno,
        "nombre":nombre,
        "puntaje":puntaje,
        "idAutor": getIdPersonaLoggeada(),
    })
}

export function deleteNivelesDesempeno(idNivelDesempeno){
    console.log("idNivelDesempeno: "+idNivelDesempeno);
    return axios.post(URL+"/eliminarNivelDesempeno",{
        "id_nivel_desempeno":idNivelDesempeno,
        "idAutor": getIdPersonaLoggeada(),
    })
}
//#endregion

//#region ItemRubrica

export function getListaItemRubricas(idEspecialidad,idIndicador){
    let strURLRubricas=URL+"/itemRubrica?id_especialidad="+idEspecialidad+"&id_indicador="+idIndicador;
    return axios.get(strURLRubricas);
    /*return axios.post(URL+"/itemRubrica?idEspecialidad",{
        "id_especialidad":idEspecialidad,
        "id_indicador":idIndicador,
    })*/
}

export function setItemRubrica(idEspecialidad,idIndicador,idNivelDesempeno,descripcion){
    return axios.post(URL+"/itemRubrica",{
        "id_especialidad":idEspecialidad,
        "id_indicador":idIndicador,
        "id_nivel_desempeno":idNivelDesempeno,
        "descripcion":descripcion,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function updateItemRubrica(idItemRubrica,idIndicador,idEspecialidad,idNivelDesempeno,descripcion){
    return axios.put(URL+"/modificarItemRubrica",{
        "id_item_rubrica":idItemRubrica,
        "id_indicador":idIndicador,
        "id_especialidad":idEspecialidad,
        "id_nivel_desempeno":idNivelDesempeno,
        "descripcion":descripcion,
        "idAutor": getIdPersonaLoggeada(),
    });
}
//#endregion

//#region Plan Medición

export const setPlanmedicion = async (planMedicion) => {
    planMedicion["coordinadorespecialidad"]=getIdPersonaLoggeada();
    planMedicion["idAutor"]=getIdPersonaLoggeada();
    return await axios.post(`${URL}/planMedicion`, planMedicion);
}

export const getPlanmedicion = async (id_semestre, id_especialidad) => {
    return await axios.post(`${URL}/planMedicion/consultarPlanMedicion`, {
        "id_semestre": id_semestre,
        "id_especialidad": id_especialidad,
    });
}

export const updatePlanmedicion = async (planMedicion) => {
    planMedicion["idAutor"]=getIdPersonaLoggeada();
    return await axios.put(`${URL}/planMedicion/modificarPlanMedicion`, planMedicion);
}

export const verMedicion = async (id) => {
    return await axios.get(`${URL}/VerMedicion/${id}`);
}

//#endregion


//#region Plan de Medicion

export const agregarMedicion = async (idPlanMedicion, idResultado, idCurso) => {
    return await axios.post(`${URL}/agregarMedicion`, {
        "idPlanMedicion": idPlanMedicion,
        "idResultado": idResultado,
        "idCurso": idCurso,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const getMediciones = async (idPlanMedicion, idResultado) => {
    return await axios.post(`${URL}/listarMediciones`, {
        "idPlanMedicion": idPlanMedicion,
        "idResultado": idResultado,
    });
}

export const deleteMedicion = async (idMedicion) => {
    return await axios.post(`${URL}/eliminarMedicion`, {
        "id_medicion": idMedicion,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const updateMedicion = async (medicion) => {
    medicion["idAutor"] = getIdPersonaLoggeada();
    return await axios.put(`${URL}/actualizarMedicion`, medicion);
}

//#endregion


//#region Plan de Mejora

export const setPlanMejora = (id_especialidad,id_facultad,id_semestre,codigo,anho) => { 
    return axios.post(URL+"/insertarPlanMejora",{
        "id_especialidad": id_especialidad,
        "id_facultad" : id_facultad,
	    "id_semestre" : id_semestre,
        "codigo":codigo,
        "anho":anho,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const getPlanMejora = (id_persona,rol,anho) => {
    return axios.post(URL+"/listarPlanMejora",{
        "id_persona": id_persona, 
        "rol": rol,
        "anho": anho
    });
}

export const setOportunidadMejora = (codigo,descripcion,id_especialidad,id_facultad,anho) => { 
    return axios.post(URL+"/insertarOportunidad",{
        "codigo" : codigo,
	    "descripcion" : descripcion,
        "id_especialidad": id_especialidad,
        "id_facultad" : id_facultad,
        "anho" : anho,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const getOportunidadMejora = (id_especialidad,id_facultad,anho) => {
    return axios.post(URL+"/listarOportunidades",{
        "id_especialidad": id_especialidad,
        "id_facultad":id_facultad,
        "anho":anho,
    });
}

export const editOportunidadMejora = (id_oportunidad,codigo,descripcion,id_especialidad,anho) => {
    return axios.put(URL+"/modificarOportunidad",{
        "id_oportunidad": id_oportunidad,
        "codigo" : codigo,
	    "descripcion" : descripcion,
        "id_especialidad" : id_especialidad,
        "anho" : anho,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const delOportunidadMejora = (id_oportunidad) => {
    return axios.post(URL+"/eliminarOportunidad",{
        "id_oportunidad" : id_oportunidad,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const setPropuestaMejora = (codigo,descripcion,id_oportunidad) => { 
    return axios.post(URL+"/insertarMejora",{
        "codigo" :  codigo,
        "descripcion" : descripcion ,
        "id_oportunidad" : id_oportunidad,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const getPropuestaMejora = (id_oportunidad) => {
    return axios.post(URL+"/listarMejora",{
	    "id_oportunidad" : id_oportunidad
    });
}

export const editPropuestaMejora = (id_mejora,codigo,descripcion,id_oportunidad) => {
    return axios.put(URL+"/modificarMejora",{
        "id_mejora": id_mejora,
        "codigo" : codigo,
	    "descripcion" : descripcion,
        "id_oportunidad": id_oportunidad,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const delPropuestaMejora = (id_mejora) => {
    return axios.post(URL+"/eliminarMejora",{
        "id_mejora" : id_mejora,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const setActividadMejora = (codigo,descripcion,responsable,id_mejora,id_semestre_inicial,id_semestre_final,estado_actividad) => { 
    return axios.post(URL+"/insertarActividad",{
        "codigo" : codigo,
        "descripcion" : descripcion,
        "responsable" : responsable,
        "id_mejora" : id_mejora,
        "id_semestre_inicial" : id_semestre_inicial,
        "id_semestre_final" : id_semestre_final,
        "estado_actividad" : estado_actividad,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const getActividadMejora = (id_mejora) => {
    return axios.post(URL+"/listarActividades",{
	    "id_mejora" : id_mejora,
    });
}

export const editActividadMejora = (id_actividad,codigo,descripcion,id_ciclo_inicio,id_ciclo_fin,responsable,estado_actividad,id_mejora) => {
    return axios.put(URL+"/modificarActividad",{
        "id_actividad": id_actividad,
        "codigo" : codigo,
	    "descripcion" : descripcion,
        "id_ciclo_inicio" : id_ciclo_inicio,
        "id_ciclo_fin":id_ciclo_fin,
        "responsable": responsable,
        "estado_actividad": estado_actividad,
        "id_mejora" : id_mejora,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const delActividadMejora = (id_actividad) => {
    return axios.post(URL+"/eliminarActividad",{
        "id_actividad" : id_actividad,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const getSeguimientoActividad = (id_actividad) => {
    return axios.post(URL+"/listarSeguimiento",{
	    "id_actividad": id_actividad,
    });
}

export const addSeguimientoActividad = (id_actividad,descripcion,fecha) => {
    return axios.post(URL+"/agregarSeguimiento",{
	    "id_actividad": id_actividad,
        "descripcion": descripcion,
        "fecha": fecha,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const editSeguimientoActividad = (id_seguimiento,descripcion,fecha) => {
    return axios.post(URL+"/modificarSeguimiento",{
	    "id_seguimiento": id_seguimiento,
        "descripcion": descripcion,
        "fecha": fecha,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const delSeguimientoActividad = (id_seguimiento) => {
    return axios.post(URL+"/eliminarSeguimiento",{
        "id_seguimiento" : id_seguimiento,
        "idAutor": getIdPersonaLoggeada(),
    });
}

//#endregion

//#region Cursos
export const getCursos = async (idEspecialidad) => {
    return await axios.get(`${URL}/cursos?id_especialidad=${idEspecialidad}`);
}

export const getEspecialidades = async (id_facultad) =>{
    return await axios.post(`${URL}/listarEspecialidades`, {
        "idFacultad": id_facultad,
    });
}

export const consultarNivelDesempeno = async (id_nivel_desempeno) =>{
    return await axios.post(`${URL}/consultarNivelDesempeno`, {
        "id_nivel_desempeno": id_nivel_desempeno,
    });
}

export const consultarResultadoEstudiante = async (id_resultado_estudiante) =>{
    return await axios.post(`${URL}/consultarResultadoEstudiante`, {
        "id_resultado_estudiante": id_resultado_estudiante,
    });
}
//#endregion

//region Personas 

export const getPersonas = async () => {
    return await axios.get(`${URL}/listarPersonas`);
}

export const getProfesores = async () => {
    return await axios.get(`${URL}/listarProfesores`);
}

export async function setNuevoUsuario1Rol(email,password,codigo_pucp,nombre,funcion,rol,id_especialidades){ 
    console.log(codigo_pucp);
    console.log(email);
    console.log(password);
    console.log(rol);
    console.log(nombre);
    console.log(funcion);
    return await axios.post(URL+"/usuarioConAcceso",{
        /*"email":"a20141636@pucp.edu.pe",
        "password":"abcd",
        "codigo_pucp":"20141636",
        "nombre":"Rafael Burgos",
        "funcion":"Coordinador de Facultad de Derecho",*/
        "codigo_pucp":codigo_pucp,
        "email":email,
        "password":password,
        "rol":rol,
        "nombre":nombre,
        "id_especialidades":[],
        "funcion":funcion,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export async function updateUsuarioRol(id_persona,email,password,codigo_pucp,nombre,funcion,rol){
    console.log(id_persona);
    console.log(codigo_pucp);
    console.log(email);
    console.log(password);
    console.log(rol);
    console.log(nombre);
    console.log(funcion);
    return await axios.put(URL+"/modificarPersona",{
        "id_persona":id_persona,
        "codigo_pucp":codigo_pucp,
        "email":email,
        "password":null,
        "rol":rol,
        "nombre":nombre,
        "id_especialidades":[],
        "funcion":funcion,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function deleteUsuarioRol(id_persona){
    console.log("Datos pasados a back");
    console.log(id_persona);
    return axios.post(URL+"/eliminarPersona",{
        "id_persona":id_persona,
        "idAutor": getIdPersonaLoggeada(),
    });
}
//#endregion

//#region Semestres
export function getSemestres(){
    return axios.get(URL + "/semestres", {});
}

export function setSemestre(nombre, fechaInicio, fechaFin){
    let auxIni = new Date (fechaInicio),
        auxFin = new Date (fechaFin);

    return axios.post(URL + "/semestres", {
        "fecha_inicio"  : auxIni,
        "fecha_fin"     : auxFin,
        "nombre"        : nombre,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function updateSemestre(idSemestre, fechaInicio, fechaFin, nombre){
    console.log(idSemestre, nombre,fechaInicio,fechaFin);
    return axios.put(URL + "/modificarSemestre", {
        "id_semestre"   : idSemestre,
        "fecha_inicio"  : fechaInicio,
        "fecha_fin"     : fechaFin,
        "nombre"        : nombre,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function deleteSemestre(idSemestre){
    console.log(idSemestre);
    return axios.post( URL + "/eliminarSemestre", {
        "id_semestre" : idSemestre,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export function searchSemestre(nombre){
    return axios.get( URL + "/buscaSemestre", {
        "nombre" : nombre,
    });
}

export const getSemestreActual = async () =>{
    var fecha_actual = new Date();
    fecha_actual.toISOString();
    console.log(fecha_actual);
    return await axios.post( URL + "/semestreActual", {
        "fecha_actual" : fecha_actual,
    });
}
//#endregion



//#region Mediciones
export function getEspecialidadesUsuario(id_persona){
    return axios.post(URL+"/listarEspecialidadesPorProfesor",{
        "id_persona": id_persona,
    });
}

export function getMedicionesPorEspecialidadPorUsuario(id_persona, idEspecialidad, fecha_actual){
    return axios.post(URL+"/cursosMuestra", {
        "id_persona": id_persona,
        "id_especialidad": idEspecialidad,
        "fecha_actual" : fecha_actual,
    });
}

export function getIndicadoresDesempenoPorMuestra(idMuestra){
    return axios.get(URL+"/verMuestra/"+idMuestra,{});
}

export function actualizarAlumnos(listaAlumnos){
    listaAlumnos["idAutor"]= getIdPersonaLoggeada();
    return axios.post(URL+"/actualizarAlumnosPorMuestra", listaAlumnos);
}

export function registrarAlumnos(idMuestra, listaAlumnos){
    return axios.post(`${URL}/registrarAlumnosPorMuestra`,{
        "idMuestra": idMuestra,
        "alumnos": listaAlumnos,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export async function getMuestrasXEspecialidad(idEspecialidad){
    return await axios.post(`${URL}/listarMuestraXEspecialidad`, {
        "idEspecialidad": idEspecialidad,
        "fecha_actual" : (new Date()).toISOString(),
    });
} 

export async function cambiarEstadoMuestra(idMuestra, terminado){
    return await axios.post(`${URL}/cambiarEstadoMuestra`, {
        "idMuestra": idMuestra, 
        "terminado": terminado,
        "idAutor": getIdPersonaLoggeada(),
    });
} 
//#endregion

//#activiades evaluacion
export const getActividadesEvaluacionPorMuestra = async (idMuestra) => {
    return await axios.get(`${URL}/listarActividadesPorMuestra/${idMuestra}`);
}
//#endregion actividades evaluacion

//#evidencias 
export const subirEvidencia = async (evidencias, idMuestra, idActividad) => {
    const url = `${URL}/guardar-evidencias`;
    const formData = new FormData();
    
    for(var i=0; i<evidencias.length; i++){
        formData.append('evidencias', evidencias[i]);
    }

    //formData.append('evidencias', evidencias);
    formData.append('idMuestra', idMuestra);
    formData.append('idActividad', idActividad);
    formData.append('idAutor', getIdPersonaLoggeada());
    console.log('idAutor::',formData.get('idAutor'));
    console.log('idmuestra::',formData.get('idMuestra'));
    console.log('idActividad::',formData.get('idActividad'));
    console.log('evidencias::',formData.getAll('evidencias'));
    console.log('just before whe send the files');
    return await axios.post(url, formData, {headers: {'Content-Type': 'multipart/form-data'}});
}

export const getEvidencias = async (idMuestra, idActividad) => {
    return await axios.get(`${URL}/listar-evidencias?idMuestra=${idMuestra}&idActividad=${idActividad}`);
}

export const eliminarEvidencia = async (idEvidencia) => {
    return await axios.post(`${URL}/eliminar-evidencia`,
        {
            "idEvidencia": idEvidencia,
            "idAutor": getIdPersonaLoggeada(),
        }
    );
}

export const descargarEvidencia = async (idEvidencia) => {
    return await axios.get(`${URL}/descargar-evidencia?idEvidencia=${idEvidencia}`,
                        {responseType: 'blob'}
    );
}

//#end evidencias

//#archivos de seguimiento 
export const subirArchSeguimiento = async (archivosSeguimiento, idSeguimiento) => {
    const url = `${URL}/guardar-archivoSeguimiento`;
    const formData = new FormData();
    
    for(var i=0; i<archivosSeguimiento.length; i++){
        formData.append('archivosSeguimiento', archivosSeguimiento[i]);
    }

    //formData.append('evidencias', evidencias);
    formData.append('idSeguimiento', idSeguimiento);
    formData.append('idAutor', getIdPersonaLoggeada());
    //console.log('idmuestra::',formData.get('idMuestra'));
    //console.log('idActividad::',formData.get('idActividad'));
    //console.log('evidencias::',formData.getAll('evidencias'));
    console.log('just before whe send the files');
    return await axios.post(url, formData, {headers: {'Content-Type': 'multipart/form-data'}});
}

export const getArchSeguimientos = async (idSeguimiento) => {
    return await axios.get(`${URL}/listar-archivoSeguimiento?idSeguimiento=${idSeguimiento}`);
}

export const eliminarArchSeguimiento = async (idArchivoSeguimiento) => {
    return await axios.post(`${URL}/eliminar-archivoSeguimiento`,
        {
            "idArchivoSeguimiento": idArchivoSeguimiento,
            "idAutor": getIdPersonaLoggeada(),
        }
    );
}

export const descargarArchSeguimiento = async (idArchivoSeguimiento) => {
    return await axios.get(`${URL}/descargar-archivoSeguimiento?idArchivoSeguimiento=${idArchivoSeguimiento}`,
                        {responseType: 'blob'}
    );
}

//#archivos de Seguimiento


//#reportes
export const reporteResultadosEstudianteConsolidado = async (idEspecialidad) => {
    return await axios.post(`${URL}/reporteResultadoEstudiante`, {idEspecialidad: idEspecialidad});
}

export const reporteResultadosEstudianteHistorico = async (idEspecialidad, idCicloIinicial, idCicloFinal, descomponerPorIndicador) => {
    return await axios.post(`${URL}/reporteHistorico`, {
        "idEspecialidad":  idEspecialidad,
        "idCicloIinicial": idCicloIinicial,
        "idCicloFinal": idCicloFinal,
		"descomponerPorIndicador": descomponerPorIndicador,
    });
}
export function reporteResultadoEstudiante(idEspecialidad, idSemestre, descomposicion){
    return axios.post(URL+"/reporteResultado",{
        "idEspecialidad":idEspecialidad,
        "idSemestre":idSemestre,
        "descomposicion":descomposicion,
    });
}

export function listarMuestraXCursoXSemestre(idCurso, idSemestre){
    return axios.post(`${URL}/listarMuestraXCursoXSemestre`, {
        "idCurso":  idCurso,
        "idSemestre": idSemestre,
    });
}

export function listarMuestraXEvaluacionXSemestre(idSemestre, idEspecialidad, idEvaluacion){
    return axios.post(`${URL}/listarMuestrasEvaluacionReporte`, {
        "idEspecialidad":  idEspecialidad,
        "idSemestre": idSemestre,
        "idEvaluacion": idEvaluacion
    });
}

export function getEvaluaciones(idSemestre, idEspecialidad){
    return axios.post(`${URL}/listarEvaluacionesReporte`, {
        "idEspecialidad":  idEspecialidad,
        "idSemestre": idSemestre,
    });
}
//#endregion 


//reportes

export const descargarReporteHorario = async (idMuestra, idEspecialidad, idCurso, isCurso) => {
    return await axios.post(`${URL}/reporteRExHORARIO`,
                        {
                          "idMuestra":   idMuestra,
                          "idEspecialidad": idEspecialidad,
                          "idCurso": idCurso,
                          "isCurso" : isCurso
                        },
                        {responseType: 'blob'}
    );
}

export const descargarReporteHistorico = async (idEspecialidad,descomponerPorIndicador,idCicloInicial=-1,idCicloFinal=-1) => {

    if(idCicloInicial==-1 || idCicloFinal==-1){
        return await axios.post(`${URL}/reporteHistorico`,
        {
          "idEspecialidad":   idEspecialidad,
          "descomponerPorIndicador":descomponerPorIndicador
        },
        {responseType: 'blob'}
        );
    }
    else{
        return await axios.post(`${URL}/reporteHistorico`,
        {
          "idEspecialidad":   idEspecialidad,
          "descomponerPorIndicador":descomponerPorIndicador,
          "idCicloInicial":idCicloInicial,
          "idCicloFinal":idCicloFinal
        },
        {responseType: 'blob'}
        );
    }
}

export const descargarReporteActividadesMejora = (id_facultad, id_especialidad, anho_in, anho_fin, estado_act) => {
    return axios.post(URL+"/reportePlanMejoraSeg",
    {
        "id_facultad": id_facultad,
	    "id_especialidad": id_especialidad,
        "anho_in": anho_in,
        "anho_fin": anho_fin,
        "estado_act": estado_act,
    },
    );
}


//end reportes

//#region Cursos

export function setCurso(codigo,nombre,descripcion,idEspecialidad){
    return axios.post(URL+"/insertarCursos",{
        "codigo":codigo,
        "nombre":nombre,
        "descripcion":descripcion,
        "id_especialidad":idEspecialidad,
    });
}
export function updateCurso(idCurso,codigo,nombre,descripcion){
    return axios.put(URL+"/cursosModificar",{
        "id_curso":idCurso,
        "codigo":codigo,
        "nombre":nombre,
        "descripcion":descripcion,
        "idAutor": getIdPersonaLoggeada(),
    });
}
export function deleteCurso(idCurso){
    return axios.put(URL+"/cursosEliminar",{
        "id_curso":idCurso,
        "idAutor": getIdPersonaLoggeada(),
    });
}
//#endregion


//#region evaluacionCurso

export const verEvaluacionCurso = async (id) => {
    return await axios.get(`${URL}/VerEvaluacionCurso/${id}`);
}

export const getEvaluacionesCurso = async (idPlanMedicion) => {
    return await axios.post(`${URL}/listarEvaluacionesCurso`, {
        "idPlanMedicion": idPlanMedicion,
    });
}


export const agregarEvaluacionCurso = async (idPlanMedicion, resultados, idCurso, nombre) => {
    return await axios.post(`${URL}/agregarEvaluacionCurso`, {
        "idPlanMedicion": idPlanMedicion,
        "resultados": resultados,
        "idCurso": idCurso,
        "nombre" : nombre,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const deleteEvaluacionCurso = async (idEvaluacionCurso) => {
    return await axios.post(`${URL}/eliminarEvaluacionCurso`, {
        "idEvaluacionCurso": idEvaluacionCurso,
        "idAutor": getIdPersonaLoggeada(),
    });
}

export const updateEvaluacionCurso = async (evaluacionCurso) => {
    evaluacionCurso["idAutor"] = getIdPersonaLoggeada();
    return await axios.put(`${URL}/actualizarEvaluacionCurso`, evaluacionCurso);
}
//#endregion
//#region contraseña
export function updateContrasena(email,contrasena){
    return axios.post(URL+"/cambiarPassword",{
        "email":email,
        "password":contrasena,
        "idAutor": getIdPersonaLoggeada(),
    });
}
//#endregion
export function registrarUsuarios(listaUsuarios) {
    return axios.post(URL + "/usuarioConAccesoMasivo", {
        "idAutor": getIdPersonaLoggeada(),
        "profesores": listaUsuarios,
    });
}

export function enviarCorreo(email){
    console.log(email);
    return axios.post(URL+"/sendEmail",{
        "email":email,
    })
}
export function enviarCorreoProfesor(email,mensaje){
    console.log(email);
    console.log(mensaje);
    return axios.post(URL+"/sendEmailProfesor",{
        "email":email,
        "mensaje":mensaje,
    });
}
export function porcentajesLogrosResultadoEstudiante(idEspecialidad,idCiclo){
    console.log(idEspecialidad);
    console.log(idCiclo);
    return axios.post(URL+"/porcentajeLogro",{
        "id_especialidad":idEspecialidad,
        "id_ciclo":idCiclo,
    });
}
export function porcentajesLogrosIndicadorDesempeno(idResultadoEstudiante){
    console.log(idResultadoEstudiante);
    return axios.post(URL+"/porcentajeLogro",{
        "id_resultado":idResultadoEstudiante,
    });
}
export function porcentajesLogrosResultadosEstudianteHistoricos(idEspecialidad,idCicloIni,idCicloFin,idResultadoEstudiante){
    console.log(idEspecialidad);
    console.log(idCicloIni);
    console.log(idCicloFin);
    console.log(idResultadoEstudiante);
    return axios.post(URL+"/porcentajeLogroHistoricoRE",{
        "id_especialidad":idEspecialidad,
        "id_ciclo_ini":idCicloIni,
        "id_ciclo_fin":idCicloFin,
        "id_resultado":idResultadoEstudiante,
    });
}

//#region pedidos
export function getPedidos(){
    return axios.get(URL+"/pedidos/listar");
}
export function setPedido(codigo,cliente,cantidadGLP,posX,posY,fechaPedido,fechaLimite){
    console.log(fechaPedido);
    console.log(fechaLimite);
    return axios.post(URL+"/pedidos/registrar",{
        "codigo":codigo,
        "cliente":cliente,
        "cantidadGlp":cantidadGLP,
        "ubicacionX":posX,
        "ubicacionY":posY,
        "fechaPedido":fechaPedido,
        "fechaLimite":fechaLimite,
    });
}
export function setAveria(codigo){
    return axios.post(URL+"/averias/registrar",{
        "codigo":codigo,
    });
}
export function setBloqueosMasivo(bloqueos){
    return axios.post(URL+"/bloqueos/registro-masivo",{
        "bloqueos":bloqueos,
    });
}
export function getCamionesUbicacionesActuales(){
    return axios.get(URL+"/camiones/ubicaciones-actuales");
}
//#endregion
