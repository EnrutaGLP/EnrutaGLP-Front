import excel from 'exceljs';

export function readAlumnos(obj) {
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

export function readXlsxUsuarios(obj) {
    console.log(obj);
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
    };
    let i;
    reader.onloadend=(e)=>{
        lineas=e.target.result.split(/\n/);
        lineas.forEach(element => {
            if(element!=''){
                bloqueo=element.split(',');
                fechas=bloqueo[0].split('-');
                bloqueoObj.fechaInicio=fechas[0];
                bloqueoObj.fechaFin=fechas[1];
                for(i=1;i<bloqueo.length;i+=2){
                    punto.ubicacionX=bloqueo[i];
                    punto.ubicacionY=bloqueo[i+1];
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
        console.log(bloqueos);
    }
    reader.readAsText(obj);

    console.log(lineas);

    return bloqueos;
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
