<template>
    <div class = "mapaEntero">
        <div id="canvas" class="mapa"></div>
        <div class="rutasCamiones">
            <p class="tituloRutas">Rutas:</p>
            <div class="rutas" v-for="indiceMostrar in indicesCamionesMostrar">
                <span>Camión: {{camiones[indiceMostrar].codigo}}<div :style="{'background-color':camiones[indiceMostrar].color}"><div class="circulo"></div></div></span>                
                <div>Placa: {{camiones[indiceMostrar].placa}}</div>
                <span>Ubicación Actual: ({{camiones[indiceMostrar].rutas[0].puntos[0].ubicacionX}}, {{camiones[indiceMostrar].rutas[0].puntos[0].ubicacionY}})</span>
            </div>
        </div>
    </div>
</template>
<script>
import P5 from 'p5';
import SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';
import {getBloqueosProximos, getRutasSimulacion, getCamiones, URL} from '../../../util/services/index';

export default {
    props:[
        'reanudoSimulacion',
        'velocidadSimulacion',
        'fechaInicioSim',
    ],
    components:{

    },  
    name:"MapaDiaADia",
    data(){
        return{
            script:null,
            p5canvas:null,

            stompClient:null,
            socket:null,

            tiempoDeSimulacion:72000,

            escalaPixeles:11.5,
            tamXMapa:70,
            tamYMapa:50,
            almacenCentralPosX:12,
            almacenCentralPosY:8,
            almacenIntermedio1PosX:42,
            almacenIntermedio1PosY:42,
            almacenIntermedio2PosX:63,
            almacenIntermedio2PosY:3,
            velocidadCamion:50,//50km/h
            distanciaPunto:1,//1km
            estadoCamiones:["","En reposo","En ruta","Averiado","En mantenimiento preventivo","En mantenimiento correctivo"],

            camiones:[],
            rutasActuales:[],
            bloqueosActuales:[],
            averiasActuales:[],
            pedidosActuales:[],
            fechaSimulacion:null,//fecha actual de la simulacion en Date
            fechaSimulacionStr:'',//fecha actual de la simulacion en string
            fechaInicioSimulacion:null,//fecha que definio el usuario en Date
            fechaFinSimulacion:null,//fecha limite que definiio el usuario en Date
            fechaFinEjecucion:null,
            porcentajePlazoOcupadoPromedio:0,

            indicesCamionesMostrar:[],//indice del arreglo de camiones a mostrar
            indiceBloqueosMostrar:[],//los dos funcionan igual que el de camiones
            
            averiasMostrar:[],
            averiaActiva:false,
            contadorAveria:0,

            interval:null,

            esFinalSimulacion:false,
            primerEsFinal:false,
            primerWebSocket:false,
            yaInicioSimulacion:false,
            velocidadActual:1,
        };
    },
    methods:{
        async obtenerInformacionCamiones(){
            try{
                const data=await getCamiones();
                console.log(data);
                data.data.data.forEach(element => {
                    this.camiones.push({
                        codigo:element.codigo,
                        placa:element.placa,
                        color:element.color,
                        rutas:[],
                    });
                });
            }catch(err){
                console.log(err);
            }
        },
        verificarFinSimulacion(){
            let noHayCamionesConRutas=false;
            if(this.esFinalSimulacion){
                if(!this.primerEsFinal){
                    this.fechaFinEjecucion.setMinutes(this.fechaFinEjecucion.getMinutes()+2);
                    this.bloqueosActuales=[];
                    this.indiceBloqueosMostrar=[];
                    this.primerEsFinal=true;
                }
                noHayCamionesConRutas=true;
                for(let i=0;i<this.camiones.length;i++){
                    if(this.camiones[i].rutas.length>0){
                        noHayCamionesConRutas=false;
                        break;
                    }
                }
            }
            return noHayCamionesConRutas;
        },
        actualizarMapa(){
            if(this.verificarFinSimulacion()){
                this.esFinalSimulacion=false;
                this.$emit("finSimulacion");
                clearInterval(this.interval);
            }
            if(this.fechaSimulacion>=this.fechaFinEjecucion){
                this.$emit("faltaDeDataDeBack");
                return;
            }
            this.actualizarRutasEnMapa();
            this.actualizarBloqueos();
            this.actualizarAverias();
            //this.actualizarAveriasEnMapa();  
        },
        actualizarAverias(){
            if(this.averiaActiva){
                if(this.contadorAveria<9){
                    this.contadorAveria++;
                }else{
                    this.averiaActiva=false;
                    this.averiasMostrar.shift();
                }
            }else{
                for(let i=0;i<this.averiasActuales.length;i++){
                    if(this.averiasActuales[i].fechaInicio>=this.fechaSimulacion){
                        for(let j=0;j<this.camiones.length;j++){
                            if(this.camiones[j].codigo==this.averiasActuales[i].codigoCamion){//eliminar rutas camion
                                this.averiasMostrar.push({
                                    codigo:camiones[j].codigo,
                                    ubicacionX:camiones[j].rutas[0].puntos[0].ubicacionX,
                                    ubicacionY:camiones[j].rutas[0].puntos[0].ubicacionY,
                                });
                                this.camiones[j].rutas=[];
                                this.averiaActiva=true;
                                break;
                            }
                        }              
                        this.averiasActuales.splice(i,1);
                        break;
                    }
                }
            }
        },
        actualizarBloqueos(){
            let indiceAux;
            for(let i=0;i<this.bloqueosActuales.length;i++){
                indiceAux=this.indiceBloqueosMostrar.indexOf(i);
                if(indiceAux!=-1){//esta el bloqueo
                    if(!this.verificarInterseccionRangoFechaYFecha(this.bloqueosActuales[i].fechaInicio,this.bloqueosActuales[i].fechaFin
                        ,this.fechaSimulacion)){
                        this.indiceBloqueosMostrar.splice(indiceAux,1);
                    }
                }else{//no esta el bloqueo
                    if(this.verificarInterseccionRangoFechaYFecha(this.bloqueosActuales[i].fechaInicio,this.bloqueosActuales[i].fechaFin
                        ,this.fechaSimulacion)){
                        this.indiceBloqueosMostrar.push(i);
                    }
                }
            }
        },
        actualizarRutasEnMapa(){
            this.fechaSimulacionStr=`${this.fechaSimulacion.getDate()}`.padStart(2,'0')+"-"+`${this.fechaSimulacion.getMonth()+1}`.padStart(2,'0')
            + "-"+this.fechaSimulacion.getFullYear()+" "+`${this.fechaSimulacion.getHours()}`.padStart(2,'0')+":"
            + `${this.fechaSimulacion.getMinutes()}`.padStart(2,'0')+":"+`${this.fechaSimulacion.getSeconds()}`.padStart(2,'0');
            this.fechaSimulacion.setSeconds(this.fechaSimulacion.getSeconds()+72);
            /*
            hacer lo de eliminar con el arreglo de indicesCamionesEliminar(creo que ya no es necesario)
            */
            let i=0,j=0,k=0;
            for(i=0;i<this.camiones.length;i++){
                if(this.camiones[i].rutas.length>0){
                    if(this.fechaSimulacion>=this.camiones[i].rutas[0].horaSalida){//se evalua si se añade al arreglo de indices
                        if(!this.verificarIndiceEnArregloDeIndices(i)){
                            this.indicesCamionesMostrar.push(i);
                        }
                        //mover una posición
                        if(this.camiones[i].rutas[0].puntos[0].ubicacionX==this.camiones[i].rutas[0].puntos[1].ubicacionX){
                            if(this.camiones[i].rutas[0].puntos[0].ubicacionY==this.camiones[i].rutas[0].puntos[1].ubicacionY){//eliminar vertice
                                this.camiones[i].rutas[0].puntos.shift();
                                //eliminar ruta y indice en caso se haya acabado la ruta
                                if(this.camiones[i].rutas[0].puntos.length<=1){
                                    this.camiones[i].rutas.shift();
                                    if(this.camiones[i].rutas.length==0 || this.camiones[i].rutas[0].horaSalida>this.fechaSimulacion){
                                        //en caso el camion tenga su siguiente ruta automaticamente despues no se dejará de mostrar
                                        //console.log(this.indicesCamionesMostrar);
                                        this.indicesCamionesMostrar.splice(this.indicesCamionesMostrar.indexOf(i),1);
                                    }else{//se mueve un punto en caso exista una ruta siguiente inmediatamente
                                        if(this.camiones[i].rutas[0].puntos[0].ubicacionX==this.camiones[i].rutas[0].puntos[1].ubicacionX){
                                            if(this.camiones[i].rutas[0].puntos[0].ubicacionY<this.camiones[i].rutas[0].puntos[1].ubicacionY){
                                                this.camiones[i].rutas[0].puntos[0].ubicacionY++;
                                            }else{
                                                this.camiones[i].rutas[0].puntos[0].ubicacionY--;
                                            }        
                                        }else{
                                            if(this.camiones[i].rutas[0].puntos[0].ubicacionX<this.camiones[i].rutas[0].puntos[1].ubicacionX){
                                                this.camiones[i].rutas[0].puntos[0].ubicacionX++;
                                            }else{
                                                this.camiones[i].rutas[0].puntos[0].ubicacionX--;
                                            }
                                        }
                                    }
                                    //se pierde un interval en el cambio de ruta, ya que se toma uno para eliminarlo, cuando vuelve a aparecer
                                     //el camión ya aparece avanzado una posición, pero para esto se tomo 2 interval, pérdida de 72s
                                    //a largo plazo puede descuadrar bastante, esto solo pasa en el caso que la ctual ruta vaya a una
                                    //planta y su siguiente empiece automaticamente yendo a un cliente.
                                    //verificar si la siguiente ruta (rutas[1]) su horaSalida es igual a la nueva fechaSimulacion

                                    //no olvidar hacer lo del arreglo indicaesCamionesEliminar(creo que ya no es necesario)
                                }else{//si no se acabo la ruta aún debe avanzar un espacio
                                    if(this.camiones[i].rutas[0].puntos[0].ubicacionX==this.camiones[i].rutas[0].puntos[1].ubicacionX){
                                        if(this.camiones[i].rutas[0].puntos[0].ubicacionY<this.camiones[i].rutas[0].puntos[1].ubicacionY){
                                            this.camiones[i].rutas[0].puntos[0].ubicacionY++;
                                        }else{
                                            this.camiones[i].rutas[0].puntos[0].ubicacionY--;
                                        }        
                                    }else{
                                        if(this.camiones[i].rutas[0].puntos[0].ubicacionX<this.camiones[i].rutas[0].puntos[1].ubicacionX){
                                            this.camiones[i].rutas[0].puntos[0].ubicacionX++;
                                        }else{
                                            this.camiones[i].rutas[0].puntos[0].ubicacionX--;
                                        }
                                    }
                                }
                            }else{//avanzar en eje Y
                                if(this.camiones[i].rutas[0].puntos[0].ubicacionY<this.camiones[i].rutas[0].puntos[1].ubicacionY){
                                    this.camiones[i].rutas[0].puntos[0].ubicacionY++;
                                }else{
                                    this.camiones[i].rutas[0].puntos[0].ubicacionY--;
                                }
                            }
                        }else{//avanzar en eje X
                            if(this.camiones[i].rutas[0].puntos[0].ubicacionX<this.camiones[i].rutas[0].puntos[1].ubicacionX){
                                this.camiones[i].rutas[0].puntos[0].ubicacionX++;
                            }else{
                                this.camiones[i].rutas[0].puntos[0].ubicacionX--;
                            }
                        }
                    }
                }
            }

        },
        verificarIndiceEnArregloDeIndices(indice){
            for(let j=0;j<this.indicesCamionesMostrar.length;j++){
                if(this.indicesCamionesMostrar[j]==indice){
                    return true;
                }
            }
            return false;
        },
        obtenerNuevasRutas(jsonGreeting){
            if(!this.primerWebSocket){
                if(jsonGreeting.otros.length>0){
                    this.fechaSimulacionStr=jsonGreeting.otros[0].rutas[0].horaSalida;
                }else{
                    this.fechaSimulacionStr=jsonGreeting.fechaInicio;
                }
                this.fechaSimulacion=this.transformarFechaStrADate(this.fechaSimulacionStr);
                console.log(this.fechaSimulacion);
                console.log(this.fechaFinSimulacion);
                jsonGreeting.bloqueos.forEach(element => {              
                    this.bloqueosActuales.push(element);
                    this.bloqueosActuales[this.bloqueosActuales.length-1].fechaInicio=this.transformarFechaStrADate(this.bloqueosActuales[this.bloqueosActuales.length-1].fechaInicio);
                    this.bloqueosActuales[this.bloqueosActuales.length-1].fechaFin=this.transformarFechaStrADate(this.bloqueosActuales[this.bloqueosActuales.length-1].fechaFin);                    
                });
                console.log("bloqueos actuales",this.bloqueosActuales);
                this.primerWebSocket=true;
                console.log("bloqueos actuales:" + this.bloqueosActuales);
            }
            this.esFinalSimulacion=jsonGreeting.esFinal;
            this.porcentajePlazoOcupadoPromedio=jsonGreeting.porcentajePlazoOcupadoPromedio;
            this.fechaFinEjecucion=this.transformarFechaStrADate(jsonGreeting.fechaFin);
            console.log(this.fechaFinEjecucion);
            let i=0, j=0, k=0;//hashearlos para después
            for(i=0;i<jsonGreeting.otros.length;i++){
                for(j=0;j<this.camiones.length;j++){
                    if(this.camiones[j].codigo==jsonGreeting.otros[i].codigo){
                        for(k=0;k<jsonGreeting.otros[i].rutas.length;k++){
                            this.camiones[j].rutas.push(jsonGreeting.otros[i].rutas[k]);
                            this.camiones[j].rutas[this.camiones[j].rutas.length-1].horaSalida=this.transformarFechaStrADate(this.camiones[j].rutas[this.camiones[j].rutas.length-1].horaSalida);
                        }
                    }
                }
            }
            for(let m=0;m<jsonGreeting.averias.length;m++){
                this.averiasActuales.push(jsonGreeting.averias[m]);
                this.averiasActuales[this.averiasActuales.length-1].fechaInicio=this.transformarFechaStrADate(this.averiasActuales[this.averiasActuales.length-1].fechaInicio);                
            }
            this.$emit("cargandoSimulacion");
            //Se anda haciendo esta opción:
            //Otra opción, tener un arreglo ya definido de objetos camion con el codigo del camion, su placa y infobasica
            //lo importante es que tendrá un atributo que sean las rutas como tal.|Listo|
            //Este será un arreglo que se llenará con los objeto ruta que brinda el servicio de back. Las horaSalida de las ruta
            //deben guardarse como objeto Date. Cuando llegue nueva data del back solo se añadirán las rutas a sus respectivos
            //camiones, aparte de actualizar la fecha final de ejecución del algoritmo.(Para después, hashear los camiones por codigo)
            //|Listo, pero ver lo de hashear|
            //
            //Cada vez que se ejecute el interval se actualizan los bloqueos|Listo|
            //
            //Primero se añaden 72s a fechaSimulacion(el objeto Date y el string).|Listo|
            //Luego se recorre el arreglo ya definido de objetos camión. Primero se verifica que tengan rutas, sino no se toma en
            //cuenta, si tiene rutas se verifica que la primera de estas(siempre estarán ordenadas por tiempo) tenga su horaSalida
            //antes de la fechaSimulacion. Los camiones que pasen el filtro son los que se mostrarán en pantalla y se moverán. Antes
            //que nada se verificará si su primer objeto rutas tiene un codigoPedido diferente de '', en caso lo tenga se deberá
            //mostrar en el mapa un círculo con el código del pedido debajo. Esto se puede manejar con un if(por ahora)en las funciones
            //del p5js como tal.|Listo|
            //Ahora para manejar el movimiento de los camiones, se manejará un arreglo de
            //índices, estos índices serán los camiones actuales a mostrar. Cuando un camión es seleccionado primero se
            //verifica si tiene su índice en el arreglo de índices. En caso no tenga se agrega y en caso ya tenga no se agrega
            //nada|Listo|. Ya con su índice se procede a mover como tal el camión. Se toma el primer vértice del primer objeto rutas del
            //camión, este se desplaza un punto en dirección al siguiente vértice. Luego de desplazar se verifica si este vértice es
            //el mismo que el último vértice, en caso lo sean se eliminar el objeto ruta del arreglo de camiones, se quita su índice
            //del arreglo de índices para que ya no se muestre más en el mapa|Listo, falta ver los indicesCamionesEliminar|.
            //Para evitar una desaparición abrupta, se debería quitar
            //al inicio del siguiente interval, osea antes de añadir los 72s(ver para después, se podría usar un arreglo auxiliar de
            //indices para quitar, el cual se recorrería luego de añadir luego de los 72s de la fecha, para quitar el índice antes de
            //analizar los camiones, así entra la siguiente ruta sin mantener desaparecido el camión durante un interval).|Creo que ya|
            //
            //Esto dependerá de los tiempos de ejecución del algoritmo, pero se tendrá una fecha inicial y una fecha final de la toma
            //de datos para la ejecución del algoritmo, si por alguna razón la fechaSimulación pasa la fecha final, se deberia detener
            //la simulación y mostrar en pantalla un mensaje de esperando data de back. La fecha final se actualizará cada vez que
            //llegue nueva data del back. Se debe detener todo cuando fechaSimulación sea igual o mayor a fechaFinSimulacion|Listo|
            
        },
        obtenerDatosSimulacion(){
            try{
                this.interval=setInterval(this.actualizarMapa,this.tiempoDeSimulacion);

                this.socket=new SockJS(URL+'/stomp-endpoint');
                this.stompClient=Stomp.over(this.socket);
                this.stompClient.connect({}, (frame) => {
                    this.stompClient.subscribe('/topic/actualizacion-simulacion',(greeting)=>{
                        let jsonGreeting=JSON.parse(greeting.body);
                        console.log(greeting);
                        console.log(jsonGreeting);
                        //console.log(jsonGreeting.otros[0].rutas[0].horaSalida);
                        this.obtenerNuevasRutas(jsonGreeting);
                    });
                });
                //this.$emit("cargandoSimulacion");
            }catch(err){
                console.log(err);
                this.$emit("cargandoSimulacion");
            }
        },
        verificarInterseccionEntreDosRangoDeFechas(fechaIni1,fechaFin1,fechaIni2,fechaFin2){
            if((fechaIni1<=fechaFin2)&&(fechaFin1>=fechaIni2)){
                return true;
            }
            return false;
        },
        verificarInterseccionRangoFechaYFecha(fechaIni1,fechaFin1,fechaIni2){
            if((fechaIni2>=fechaIni1)&&(fechaIni2<=fechaFin1)){
                return true;
            }
            return false;
        },
        transformarFechaStrADate(fechaStr){
            let fechaStrAux=fechaStr.split(' ');
            let fechaAux=fechaStrAux[0].split('-');
            let horaAux=fechaStrAux[1].split(':');
            return new Date(parseInt(fechaAux[2]),parseInt(fechaAux[1])-1,parseInt(fechaAux[0]),parseInt(horaAux[0]),parseInt(horaAux[1]),parseInt(horaAux[2]));
        },
        transformarFechaStrDateYYYYmmDD(fechaStr){
            let fechaStrAux=fechaStr.split(' ');
            let fechaAux=fechaStrAux[0].split('-');
            let horaAux=fechaStrAux[1].split(':');
            return new Date(parseInt(fechaAux[0]),parseInt(fechaAux[1])-1,parseInt(fechaAux[2]),parseInt(horaAux[0]),parseInt(horaAux[1]),parseInt(horaAux[2]));
        }
    },
    watch:{
        reanudoSimulacion: function(nuevaReanudoSimulacion){
            if(!this.yaInicioSimulacion){
                this.obtenerDatosSimulacion();
                this.yaInicioSimulacion=true;
            }
            if(nuevaReanudoSimulacion){//play
                clearInterval(this.interval);
                this.interval=setInterval(this.actualizarMapa,this.tiempoDeSimulacion/this.velocidadSimulacion);
            }else{//pausa
                clearInterval(this.interval);
            }
        },
        velocidadSimulacion: function(nuevaVelocidad){
            if(nuevaVelocidad>=1 && nuevaVelocidad<=4096){
                clearInterval(this.interval);
                this.interval=setInterval(this.actualizarMapa,this.tiempoDeSimulacion/nuevaVelocidad);  
            }
        },
        fechaInicioSim: function(nuevaFechaInicioSim){
            this.fechaInicioSimulacion=this.transformarFechaStrDateYYYYmmDD(nuevaFechaInicioSim);
            console.log(this.fechaInicioSimulacion);
            this.fechaFinSimulacion=new Date(this.fechaInicioSimulacion.setDate(this.fechaInicioSimulacion.getDate()+3));
        }
    },
    computed:{
        tiempoPorPunto: function(){//en segundos
            return (this.distanciaPunto/this.velocidadCamion*3600);
        }
    },
    mounted(){
        this.script = p5 => {
            p5.setup = () => {
                //escala de 70 * 10
                //20*this.escalaPixeles, espacio para la leyenda
                p5.createCanvas(70*this.escalaPixeles+20*this.escalaPixeles,50*this.escalaPixeles);
            };
            p5.draw = () => {
                p5.clear();
                p5.background('#EEEEEE');
                p5.dibujarCuadricula();
                p5.dibujarLeyenda();
                p5.actualizarCamiones();
                p5.actualizarBloqueos();
                p5.actualizarAverias();
                p5.dibujarAlmacenes();
                p5.mostrarFechaSimulacionYPorcentajeOcupado();
            };
            p5.actualizarAverias = () => {
                let c=p5.color("#FF0000");
                p5.fill(c);
                p5.textSize(this.escalaPixeles);
                p5.stroke("#EEEEEE");
                for(let i=0;i<this.averiasMostrar.length;i++){
                    p5.ellipse(this.escalaPixeles*this.averiasMostrar[i].ubicacionX,
                    this.escalaPixeles*(this.tamYMapa-this.averiasMostrar[i].ubicacionY),
                    this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.averiasMostrar[i].codigo,
                    this.escalaPixeles*this.averiasMostrar[i].ubicacionX-this.escalaPixeles,
                    this.escalaPixeles*(this.tamYMapa-this.averiasMostrar[i].ubicacionY)
                    +this.escalaPixeles);
                }
            };
            p5.mostrarFechaSimulacionYPorcentajeOcupado = () => {
                p5.stroke("#EEEEEE");
                let c=p5.color("#000000");
                p5.fill(c);
                p5.textSize(13);
                p5.text("Porcentaje plazo ocupado promedio:",this.escalaPixeles*(this.tamXMapa+1),this.tamYMapa*this.escalaPixeles-60);
                p5.text(this.porcentajePlazoOcupadoPromedio+"%",this.escalaPixeles*(this.tamXMapa+8),this.tamYMapa*this.escalaPixeles-40);
                p5.textSize(18);
                p5.text(this.fechaSimulacionStr,this.escalaPixeles*(this.tamXMapa+3),this.tamYMapa*this.escalaPixeles-20);
            };
            p5.dibujarLeyenda = () => {
                let margenMapaYLeyenda=this.escalaPixeles*(this.tamXMapa+3);
                p5.stroke("#EEEEEE");
                let c=p5.color("#000000");

                p5.fill(c);
                p5.textSize(15);
                p5.text("Leyenda:",margenMapaYLeyenda,20);

                c=p5.color("#0071BC");
                p5.fill(c);
                p5.ellipse(margenMapaYLeyenda,35,10,10);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Camión",margenMapaYLeyenda+10,40);

                c=p5.color("#FF0000");
                p5.fill(c);
                p5.rect(margenMapaYLeyenda-5,50,10,5);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Bloqueo",margenMapaYLeyenda+10,57);

                c=p5.color("#FF0000");
                p5.fill(c);
                p5.circle(margenMapaYLeyenda,70,10,10);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Avería",margenMapaYLeyenda+10,75);

                c=p5.color("#db6eeb")
                p5.fill(c);
                p5.rect(margenMapaYLeyenda-5,82,10,10);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Planta Intermedia",margenMapaYLeyenda+10,92);

                c=p5.color("#8f2b9d")
                p5.fill(c);
                p5.rect(margenMapaYLeyenda-5,100,10,10);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Planta Principal",margenMapaYLeyenda+10,110);
                
                c=p5.color("#000000");
                p5.fill(c);
                p5.circle(margenMapaYLeyenda,122,10,10);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Cliente",margenMapaYLeyenda+10,127);

                c=p5.color("#0071BC");
                p5.fill(c);
                p5.rect(margenMapaYLeyenda-5,134,10,5);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Ruta",margenMapaYLeyenda+10,142);
            };
            p5.actualizarBloqueos = () => {
                p5.stroke("#FF0000");
                p5.strokeWeight(5);
                for(let i=0;i<this.indiceBloqueosMostrar.length;i++){
                    for(let j=0;j<this.bloqueosActuales[this.indiceBloqueosMostrar[i]].puntos.length-1;j++){
                        p5.line(this.escalaPixeles*this.bloqueosActuales[this.indiceBloqueosMostrar[i]].puntos[j].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.bloqueosActuales[this.indiceBloqueosMostrar[i]].puntos[j].ubicacionY),
                        this.escalaPixeles*this.bloqueosActuales[this.indiceBloqueosMostrar[i]].puntos[j+1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.bloqueosActuales[this.indiceBloqueosMostrar[i]].puntos[j+1].ubicacionY));
                    }
                }
                p5.strokeWeight(1);
            };
            p5.actualizarCamiones = () => {
                let c;
                p5.textSize(this.escalaPixeles);
                p5.strokeWeight(2);
                for(let i=0;i<this.indicesCamionesMostrar.length;i++){
                    c=p5.color(this.camiones[this.indicesCamionesMostrar[i]].color);
                    //c=p5.color(this.listaColoresCamiones[i]);
                    p5.fill(c);
                    p5.stroke("#EEEEEE");
                    p5.ellipse(this.escalaPixeles*this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionX,
                    this.escalaPixeles*(this.tamYMapa-this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionY),
                    this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.camiones[this.indicesCamionesMostrar[i]].codigo,
                    this.escalaPixeles*this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionX-this.escalaPixeles,
                    this.escalaPixeles*(this.tamYMapa-this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionY)
                    +this.escalaPixeles);

                    if(this.camiones[this.indicesCamionesMostrar[i]].rutas[0].codigoPedido!=""){
                        c=p5.color("#000000");
                        p5.fill(c);
                        p5.ellipse(this.escalaPixeles*this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos.length-1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos.length-1].ubicacionY),
                        this.escalaPixeles,this.escalaPixeles);
                        p5.text(this.camiones[this.indicesCamionesMostrar[i]].rutas[0].codigoPedido,
                        this.escalaPixeles*this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos.length-1].ubicacionX-this.escalaPixeles,
                        this.escalaPixeles*(this.tamYMapa-this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos.length-1].ubicacionY)
                        +this.escalaPixeles);
                        //c=p5.color(this.listaColoresCamiones[i]);
                        //p5.fill(c);
                        c=p5.color(this.camiones[this.indicesCamionesMostrar[i]].color);
                        p5.fill(c);
                    }
                    p5.stroke(this.camiones[this.indicesCamionesMostrar[i]].color);
                    for(let j=0;j<this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos.length-1;j++){
                        p5.line(this.escalaPixeles*this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[j].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[j].ubicacionY),
                        this.escalaPixeles*this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[j+1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.camiones[this.indicesCamionesMostrar[i]].rutas[0].puntos[j+1].ubicacionY));
                    }
                }
                p5.strokeWeight(1);
            };
            p5.dibujarCuadricula = () => {
                p5.stroke("#C3C3C3");
                let i;
                for(i=0;i<this.tamXMapa;i++){
                    p5.line(this.escalaPixeles*i,0,this.escalaPixeles*i,this.escalaPixeles*this.tamYMapa);    
                }
                for(i=0;i<this.tamYMapa;i++){
                    p5.line(0,this.escalaPixeles*i,this.escalaPixeles*this.tamXMapa,this.escalaPixeles*i);
                }
                p5.line(this.escalaPixeles*this.tamXMapa,0,this.escalaPixeles*this.tamXMapa,this.escalaPixeles*this.tamYMapa);
                p5.line(0,this.escalaPixeles*this.tamYMapa,this.escalaPixeles*this.tamXMapa,this.escalaPixeles*this.tamYMapa);
            };
            p5.dibujarAlmacenes = () => {
                let c=p5.color("#8f2b9d");
                p5.stroke("#EEEEEE9");
                p5.fill(c);
                p5.rect(this.escalaPixeles*this.almacenCentralPosX-this.escalaPixeles/2,
                this.escalaPixeles*(this.tamYMapa-this.almacenCentralPosY)-this.escalaPixeles/2,this.escalaPixeles,this.escalaPixeles);
                c=p5.color("#db6eeb");
                p5.fill(c);
                p5.rect(this.escalaPixeles*this.almacenIntermedio1PosX-this.escalaPixeles/2,
                this.escalaPixeles*(this.tamYMapa-this.almacenIntermedio1PosY)-this.escalaPixeles/2,this.escalaPixeles,
                this.escalaPixeles);
                p5.rect(this.escalaPixeles*this.almacenIntermedio2PosX-this.escalaPixeles/2,
                this.escalaPixeles*(this.tamYMapa-this.almacenIntermedio2PosY)-this.escalaPixeles/2,this.escalaPixeles,
                this.escalaPixeles);
            };
        }
        this.p5canvas=new P5(this.script,'canvas');
        
    },
    async created(){
        await this.obtenerInformacionCamiones();  
    },
    destroyed(){
        clearInterval(this.interval);
        this.socket.close();
    }
}
</script>
<style>
    .rutasCamiones{
        width:300px;
        height: 570px;
        background: #FFFFFF;
        overflow-y:scroll;
        float:right;
        margin-left: 4rem;
    }
    .mapa{
        float:left;
    }
    .tituloRutas{
        text-decoration: underline;
        text-align: center;
    }
    .rutas{
        font-size: 13px;
        margin-left: 25px;
        margin-bottom: 10px;
        padding: 0.5rem;
        width: 250px;
        height: 150px;
        overflow-y:scroll;
        border-style: ridge;
        background: #B6B6E3;
    }
    .circulo{
        width: 10px;
        height: 10px;
    }
</style>