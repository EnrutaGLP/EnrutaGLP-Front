import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import * as base from '../../../../base-config.json';

var direccion = "https://" + base.url + ':' + base.port;
//const URL = "http://100.25.226.224:80";
//const URL = "http://54.174.91.225:80";
//const URL = "http://54.145.192.162:8080";
const URL = "http://localhost:8080";
//const URL = direccion;
export function getAcceso(correo, constrasena) {
    setIdPersonaLoggeada(correo, constrasena);
    return axios.post(URL + "/acceso", {
                "email": correo, 
                "password": constrasena,
            });
}
//#region camiones
export function getCamiones(){
    return axios.get(URL+"/camiones/listar");
}
//#endregion
//#region pedidos
export function getPedidos(){
    return axios.get(URL+"/pedidos/listar");
}
export function getPedidosActuales(){
    return axios.get(URL+"/pedidos/actuales");
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
export function setPedidosMasivo(pedidos){
    return axios.post(URL+"/pedidos/registro-masivo",pedidos);
}
//#endregion
//#region averia
export function setAveria(codigo,fecha){
    return axios.post(URL+"/averias/registrar",{
        "codigo":codigo,
        "fecha":fecha,
    });
}
//#endregion
//#region bloqueos
export function getBloqueosActuales(){
    return axios.get(URL+"/bloqueos/actuales");
}
export function getBloqueosProximos(fechaInicio){
    console.log(fechaInicio);
    return axios.get(URL+"/bloqueos/listar-proximos",{
        "fechaInicio":fechaInicio,
    });
}
export function setBloqueosMasivo(bloqueos){
    return axios.post(URL+"/bloqueos/registro-masivo",bloqueos);
}
//#endregion

//#region ubicacion camiones
export function getCamionesUbicacionesActuales(){
    return axios.get(URL+"/camiones/ubicaciones-actuales");
}
//#endregion

//#region rutas
export function getRutasActuales(){
    return axios.get(URL+"/rutas/actuales");
}
//#endregion

//#region configuraciones
export function setConfiguracionDiaADia(){
    return axios.put(URL+"/configuracion/dia-a-dia");
}
export function setConfiguracionSimulacionTresDias(fechaInicio){
    console.log(fechaInicio);
    return axios.put(URL+"/configuracion/simulacion-tres-dias",{
        "fechaInicio":fechaInicio,
    });
}
export function setConfiguracionSimulacionColapsoLogistico(){
    return axios.put(URL+"/configuracion/simulacion-colapso-logisico");
}
export function setFechaInicioSimulacion(fechaInicio){
    console.log(fechaInicio);
    return axios.post(URL+"/",{
        "fechaInicio":fechaInicio,
    });
}
//#endregion
//#region simulacion
export function getRutasSimulacion(){
    return axios.get(URL+"/rutas/listar-rutas-simulacion");
}
//#endregion