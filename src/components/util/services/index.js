import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import * as base from '../../../../base-config.json';

var direccion = "https://" + base.url + ':' + base.port;
//const URL = "http://100.25.226.224:80";
//const URL = "http://54.174.91.225:80";
const URL = "http://54.145.192.162:8080";
//const URL = direccion;
var idPersonaLoggeada;
export function getAcceso(correo, constrasena) {
    setIdPersonaLoggeada(correo, constrasena);
    return axios.post(URL + "/acceso", {
                "email": correo, 
                "password": constrasena,
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
export function getBloqueosActuales(){
    return axios.get(URL+"/bloqueos/actuales");
}
export function setBloqueosMasivo(bloqueos){
    return axios.post(URL+"/bloqueos/registro-masivo",bloqueos);
}
export function setPedidosMasivo(pedidos){
    return axios.post(URL+"/pedidos/registro-masivo",pedidos);
}
export function getCamionesUbicacionesActuales(){
    return axios.get(URL+"/camiones/ubicaciones-actuales");
}
export function setConfiguracionDiaADia(){
    return axios.put(URL+"/configuracion/dia-a-dia");
}
export function setConfiguracionSimulacionTresDias(){
    return axios.put(URL+"/configuracion/simulacion-tres-dias");
}
export function setConfiguracionSimulacionColapsoLogistico(){
    return axios.put(URL+"/configuracion/simulacion-colapso-logisico");
}
//#endregion
