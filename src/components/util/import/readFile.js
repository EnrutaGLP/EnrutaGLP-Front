import excel from 'exceljs';

export function readXlsAlumnos(e) {
    var archivo = e.target.files[0];
    if (!archivo) {
        return;
    }

    var lector = new FileReader();
    var listaAlumnos;
    lector.onload = function(e) {
        var contenido = e.target.result;
        listaAlumnos = formatearXlsAlumnos(contenido);
        //mostrarContenido(listaAlumnos);
    };
    lector.readAsText(archivo, 'ISO-8859-3');
    console.log("readXlsAlumnos successful!");
    //return listaAlumnos;
}

async function formatearXlsAlumnos(contenido) {
    var alumnos = [];
    contenido = contenido.split('\n');
    for(let i in contenido){
        let linea = contenido[i];
        linea = linea.split("\t");
        //se pasa una lista de objetos, hay que revisar eso
        if(!isNaN(parseInt(linea[0], 10))&& linea[1])
                alumnos.push({codigo: parseInt(linea[0]), nombre: linea[1].replace("\"", "")});
    }
    console.log("formatearXlsAlumnos successful!");
    return alumnos;
}

export function readXlsxAlumnos(obj) {
    console.log(obj);
    
    const f = obj;
    const wb = new excel.Workbook();
    var lector = new FileReader();

    let alumnos = [];

    lector.onload = (e) => {
        const buffer = e.target.result;


        wb.xlsx.load(buffer).then(() => {
            let ws = wb.getWorksheet(1);
            for (let i = 1; i <= ws.rowCount; i++) {
                alumnos.push({ 
                    nombre: ws.getRow(i).getCell(1).value, 
                    codigo: ws.getRow(i).getCell(2).value,
                });
            }
            console.log("readExcel successful!");
        }).catch((error)=> {
            console.log("readExcel failed...", error);
            });
    };
    lector.readAsArrayBuffer(f);

    return alumnos;
}
export function readUsuarios(obj) {
    console.log(obj);

    if(!obj) return [];

    const f = obj;
    var lector = new FileReader();
    let alumnos = [];
    
    try{
        lector.onload = e =>{
            var contenido = e.target.result;
            contenido = contenido.split('\n');
            for(let i in contenido){
                let linea = contenido[i];
                linea = linea.split("\t");
                //se pasa una lista de objetos, hay que revisar eso
                if(!isNaN(parseInt(linea[0], 10))&& linea[1])
                        alumnos.push({codigo: parseInt(linea[0]), nombre: linea[1].replace("\"", "")});
            }
            console.log("formatearXlsAlumnos successful!");
        }
        lector.readAsText(f, 'ISO-8859-3');
        
        console.log("readAlumnos successful!");
        
        console.log(alumnos);
    }
    catch(e){
        console.log(e);
    }
	
    return alumnos;
}

export function readXlsxBloqueos(obj) {
    console.log(obj);
    let ano=obj.name.substr(0,4);
    console.log("año",ano);
    let mes=obj.name.substr(4,2);
    console.log("mes",mes);
    let bloqueos=[];
    
    let reader=new FileReader();
    let lineas=[];
    let bloqueo=[];
    let bloqueoObj={
        fechaInicio:"",
        fechaFin:"",
        puntos:[],
    };
    let fechas=[];
    let puntos=[];
    let punto={
        ubicacionX:0,
        ubicacionY:0,
        orden:0,
    };
    let i;
    let datosFecha;
    reader.onloadend=(e)=>{
        lineas=e.target.result.split(/\n/);
        lineas.forEach(element => {
            if(element!=''){
                bloqueo=element.split(',');
                fechas=bloqueo[0].split('-');
                datosFecha=fechas[0].split(':');
                bloqueoObj.fechaInicio=datosFecha[0]+"-"+mes+"-"+ano+" "+datosFecha[1]+":"+datosFecha[2]+":11";
                datosFecha=fechas[1].split(':');
                bloqueoObj.fechaFin=datosFecha[0]+"-"+mes+"-"+ano+" "+datosFecha[1]+":"+datosFecha[2]+":11";
                for(i=1;i<bloqueo.length;i+=2){
                    punto.ubicacionX=bloqueo[i];
                    punto.ubicacionY=bloqueo[i+1];
                    punto.orden=Math.round(i/2);
                    puntos.push(Object.assign({},punto));
                }
                puntos[puntos.length-1].ubicacionY=puntos[puntos.length-1].ubicacionY.substring(0,puntos[puntos.length-1].ubicacionY.length-1);
                punto.ubicacionX=0;
                punto.ubicacionY=0;
                bloqueoObj.puntos=puntos;
                bloqueos.push(Object.assign({},bloqueoObj));
                puntos=[];
            }
        });
    }
    reader.readAsText(obj);

    return bloqueos;
}
export function readPedidos(obj) {
    console.log(obj);
    let ano=obj.name.substr(6,4);
    console.log("año",ano);
    let mes=obj.name.substr(10,2);
    console.log("mes",mes);
    let pedidos=[];

    let reader=new FileReader();
    let lineas=[];
    let pedido;
    let pedidoObj={
        cantidadGlp:0,
        ubicacionX:0,
        ubicacionY:0,
        fechaPedido:"",
        fechaLimite:"",
    };
    let datosFecha;
    let fechaLimite;

    reader.onloadend=(e)=>{
        lineas=e.target.result.split(/\n/);
        lineas.forEach(element=>{
            if(element!=""){
                pedido=element.split(",");
                datosFecha=pedido[0].split(":");
                fechaLimite=new Date(ano,mes,datosFecha[0],datosFecha[1],datosFecha[2],11);
                fechaLimite.setHours(fechaLimite.getHours()+pedido[4]);
                pedidoObj.cantidadGlp=pedido[1];
                pedidoObj.ubicacionX=pedido[2];
                pedidoObj.ubicacionY=pedido[3];
                pedidoObj.fechaPedido=datosFecha[0]+"-"+mes+"-"+ano+" "+datosFecha[1]+":"+datosFecha[2]+":11";
                pedidoObj.fechaLimite=`${fechaLimite.getDay()}`.padStart(2,'0')+"-"+`${fechaLimite.getMonth()}`.padStart(2,'0')+"-"+
                fechaLimite.getFullYear()+" "+`${fechaLimite.getHours()}`.padStart(2,'0')+":"+ 
                `${fechaLimite.getMinutes()}`.padStart(2,'0')+":"+fechaLimite.getSeconds();
                pedidos.push(Object.assign({},pedidoObj));
            }
        });
    }
    reader.readAsText(obj);
    return pedidos;
}