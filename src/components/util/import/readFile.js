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