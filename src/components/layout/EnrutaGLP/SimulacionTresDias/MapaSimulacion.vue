<template>
    <div class = "mapaEntero">
        <div id="canvas" class="mapa"></div>
        <div class="rutasCamiones">
            <p class="tituloRutas">Rutas:</p>
            <div class="rutas" :key="camionUbicacionActual.id" v-for="(camionUbicacionActual,k) in camionesUbicacionActual">
                <span>Camión: {{camionUbicacionActual.codigo}}<div :style="{'background-color':listaColoresCamiones[k]}"><div class="circulo"></div></div></span>
                
                <div>Cantidad GLP: {{camionUbicacionActual.cargaActualGLP}}</div>
                <div>Estado: {{camionUbicacionActual.estado.nombre}}</div>
                <span>Ubicación Actual: {{camionUbicacionActual.ubicacionActualX}}, {{camionUbicacionActual.ubicacionActualY}}</span>
            </div>
        </div>
    </div>
</template>
<script>
import P5 from 'p5';
import SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';
import {getBloqueosActuales, getRutasActuales, getPedidosActuales, getRutasSimulacion, getCamiones} from '../../../util/services/index';

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

            listaColoresCamiones:[
                '#0071BC',
                '#008F4C',
                '#EAC102',
                '#AA0000',
                '#AF6E37',
                '#FF6600',
                '#51D1F6',
                '#808080',
                '#81D8D0',
                '#96C8A2',
                '#CE4676',
                '#8A9A5B',
                '#93C592',
                '#BFFF00',
                '#4A5D23',
                '#F9BDA1',
                '#2E7294',
                '#C20009',
                '#910765',
                '#FFFB00',
            ],

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
            fechaSimulacionStr:null,//fecha actual de la simulacion en string
            fechaInicioSimulacion:null,//fecha que definio el usuario en Date
            fechaFinSimulacion:null,//fecha limite que definiio el usuario en Date
            fechaFinEjecucion:null,

            indicesCamionesMostrar:[],//indice del arreglo de camiones a mostrar
            //indicesCamionesEliminar:[],//indices(los datos del arreglo indicesCamionesMostrar) que se deberán eliminar
            indiceBloqueosMostrar:[],//los dos funcionan igual que el de camiones
            indiceBloqueosEliminar:[],

            interval:null,
        };
    },
    methods:{
        async obtenerInformacionCamiones(){
            /*try{
                const data=await getCamiones();
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
            }*/

            this.camiones.push({
                codigo:"TA01",
                placa:"xdx-dxd",
                rutas:[],
            });
            this.camiones.push({codigo:"TA02",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TB01",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TB02",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TB03",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TB04",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TC01",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TC02",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TC03",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TC04",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD01",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD02",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD03",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD04",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD05",placa:"xdx-dxd",rutas:[],});            
            this.camiones.push({codigo:"TD06",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD07",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD08",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD09",placa:"xdx-dxd",rutas:[],});
            this.camiones.push({codigo:"TD10",placa:"xdx-dxd",rutas:[],});            
        },
        async obtenerPosicionesYBloqueosActualesPrimeraVez(){
            try{
                const data1=await getRutasActuales();
                console.log(data1);
                const data2=await getPedidosActuales();
                console.log(data2);
                this.pedidosActuales=data2.data.data;
                console.log(this.pedidosActuales);
                this.averiasActuales=data1.data.data.averiados;
                data1.data.data.otros.forEach(element => {
                    this.camionesUbicacionActual.push({
                        codigo:element.codigo,
                        ubicacionActualX:element.ubicacionActualX,
                        ubicacionActualY:element.ubicacionActualY,
                        estado:{
                            id:element.estadoId,
                            nombre:element.nombre,
                        }
                    });
                    this.rutasActuales.push({
                        codigo:element.codigo,
                        ruta:element.ruta,
                    })
                });
                console.log(this.rutasActuales);
                const data=await getBloqueosActuales();
                console.log(data);
                console.log(data.data.data);
                for(let m=0;m<data.data.data.length;m++){
                    this.bloqueosActuales.push({
                        bloqueo:[],
                    });
                    for(let n=0;n<data.data.data[m].puntos.length;n++){
                        this.bloqueosActuales[m].bloqueo.push({
                            ubicacionX:data.data.data[m].puntos[n].ubicacionX,
                            ubicacionY:data.data.data[m].puntos[n].ubicacionY,
                        })
                    }
                }
                console.log(this.bloqueosActuales);
                
            }catch(err){
                
            }
        },
        actualizarMapa(){
            if(this.fechaSimulacion>=this.fechaFinSimulacion){
                this.$emit("finSimulacion");
                clearInterval(this.interval);
            }
            if(this.fechaSimulacion>=this.fechaFinEjecucion){
                this.$emit("faltaDeDataDeBack");
                return;
            }
            this.actualizarRutasEnMapa();
            this.actualizarBloqueos();
            //this.actualizarAveriasEnMapa();  
        },
        actualizarBloqueos(){
            let indiceAux;
            for(let i=0;i<this.bloqueosActuales.length;i++){
                indiceAux=this.indiceBloqueosMostrar.indexOf(i);
                if(indiceAux!=-1){
                    if(this.verificarInterseccionEntreDosRangoDeFechas(this.bloqueosActuales[i].fechaInicio,this.bloqueosActuales[i].fechaFin
                        ,this.fechaSimulacion,this.fechaSimulacion)){
                        this.indiceBloqueosMostrar.push(i);
                    }
                }else{
                    if(!this.verificarInterseccionEntreDosRangoDeFechas(this.bloqueosActuales[i].fechaInicio,this.bloqueosActuales[i].fechaFin
                        ,this.fechaSimulacion,this.fechaSimulacion)){
                        this.indiceBloqueosMostrar.splice(indiceAux,1);
                    }
                }
            }
        },
        actualizarRutasEnMapa(){
            this.fechaSimulacionStr=`${fechaSimulacion.getDate()}`.padStart(2,'0')+"-"+`${fechaSimulacion.getMonth()+1}`.padStart(2,'0')
            + "-"+fechaSimulacion.getFullYear()+" "+`${fechaSimulacion.getHours()}`.padStart(2,'0')+":"
            + `${fechaSimulacion.getMinutes()}`.padStart(2,'0')+":"+fechaSimulacion.getSeconds();
            this.fechaSimulacion.setSeconds(this.fechaSimulacion.getSeconds()+72);
            /*
            hacer lo de eliminar con el arreglo de indicesCamionesEliminar
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
                                    this.indicesCamionesMostrar.splice(this.indicesCamionesMostrar.indexOf(i),1);


                                    //no olvidar hacer lo del arreglo indicaesCamionesEliminar


                                }
                            }else{//avanzar en eje X
                                if(this.camiones[i].rutas[0].puntos[0].ubicacionX<this.camiones[i].rutas[0].puntos[1].ubicacionX){
                                    this.camiones[i].rutas[0].puntos[0].ubicacionX++;
                                }else{
                                    this.camiones[i].rutas[0].puntos[0].ubicacionX--;
                                }
                            }
                        }else{//avanzar en eje Y
                            if(this.camiones[i].rutas[0].puntos[0].ubicacionY<this.camiones[i].rutas[0].puntos[1].ubicacionY){
                                this.camiones[i].rutas[0].puntos[0].ubicacionY++;
                            }else{
                                this.camiones[i].rutas[0].puntos[0].ubicacionY--;
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
            this.fechaFinEjecucion=this.transformarFechaStrADate(jsonGreeting.data.fechaFin);
            let i=0, j=0, k=0;//hashearlos para después
            for(i=0;i<jsonGreeting.data.otros.length;i++){
                for(j=0;j<this.camiones.length;j++){
                    if(this.camiones[j].codigo==jsonGreeting.data.otros[i].codigo){
                        for(k=0;k<jsonGreeting.data.otros[i].rutas.length;k++){
                            this.camiones[j].rutas.push(jsonGreeting.data.otros[i].rutas[k]);
                            this.camiones[j].rutas[this.camiones[j].rutas.length-1].horaSalida=this.transformarFechaStrADate(this.camiones[j].rutas[this.camiones[j].rutas.length-1].horaSalida);
                        }
                    }
                }
            }
            this.$emit("cargandoSimulacion");
            //suponiendo que las rutas que ya se mostraron en pantalla, se elim inaran del arreglo
            //Pensar luego como adaptarlo para retroceder la simulacion
            
            //Posible cambio, a que recién se agreguen rutas cuando se acabe la ruta de un camión
            //Cuando se acabe la ruta de un camión se podría verificar en un arreglo auxiliar y ver si tiene más rutas
            //Para recién allí añadirlo, este nuevo arreglo ver si sería bueno que para cada camión se tenga arreglos
            //de rutas para representar en caso de que llegue bastante data y el camión se le asignen varias rutas
            //cuando no acabo ni la primera

            //Otra forma es que aparte de añadir la ruta, añadir la fecha de salida y el codigo del pedido
            //Añadir todo el objeto ruta, simplemente cambiando el formato de horaSalida a Date




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
            //analizar los camiones, así entra la siguiente ruta sin mantener desaparecido el camión durante un interval).|Falta esto|
            //
            //Esto dependerá de los tiempos de ejecución del algoritmo, pero se tendrá una fecha inicial y una fecha final de la toma
            //de datos para la ejecución del algoritmo, si por alguna razón la fechaSimulación pasa la fecha final, se deberia detener
            //la simulación y mostrar en pantalla un mensaje de esperando data de back. La fecha final se actualizará cada vez que
            //llegue nueva data del back. Se debe detener todo cuando fechaSimulación sea igual o mayor a fechaFinSimulacion|Listo|
            
        },
        async obtenerDatosSimulacion(){
            try{
                const data=await getRutasSimulacion();
                console.log(data);
                this.fechaSimulacionStr=data.data.data.otros[0].rutas[0].horaSalida;
                this.fechaSimulacion=this.transformarFechaStrADate(fechaSimulacionStr);
                this.fechaFinEjecucion=this.transformarFechaStrADate(data.data.data.fechaFin);
                
                /*for(let i=0;i<data.data.data.otros.length;i++){
                    let indiceHasheado=Integer.parseInt(data.data.data.otros[i].codigo.substring(2))-1;
                }*/

                let i=0, j=0, k=0;//hashearlos para después
                for(i=0;i<data.data.data.otros.length;i++){
                    for(j=0;j<this.camiones.length;j++){
                        if(this.camiones[j].codigo==data.data.data.otros[i].codigo){
                            for(k=0;k<data.data.data.otros[i].rutas.length;k++){
                                this.camiones[j].rutas.push(data.data.data.otros[i].rutas[k]);
                                this.camiones[j].rutas[this.camiones[j].rutas.length-1].horaSalida=this.transformarFechaStrADate(this.camiones[j].rutas[this.camiones[j].rutas.length-1].horaSalida);
                            }
                        }
                    }
                }

                await this.obtenerBloqueosSimulacion();
            
                this.interval=setInterval(this.actualizarMapa,this.tiempoDeSimulacion);

                this.socket=new SockJS('http://54.145.192.162:8080/stomp-endpoint');
                this.stompClient=Stomp.over(this.socket);
                this.stompClient.connect({}, (frame) => {
                    this.stompClient.subscribe('/topic/estado-general',(greeting)=>{
                        console.log(greeting);
                        let jsonGreeting=JSON.parse(greeting.body);
                        console.log(jsonGreeting);
                        this.obtenerNuevasRutas(jsonGreeting);
                    });
                });
                this.$emit("cargandoSimulacion");
            }catch(err){
                console.log(err);
                this.$emit("cargandoSimulacion");
            }
        },
        async obtenerBloqueosSimulacion(){
            try{
                const data=await getBloqueosActuales();
                console.log(data);
                data.data.data.forEach(element => {              
                    if(verificarInterseccionEntreDosRangoDeFechas(this.fechaInicioSimulacion,this.fechaFinSimulacion,this.transformarFechaStrADate(element.fechaInicio),this.transformarFechaStrADate(element.fechaFin))){
                        this.bloqueosActuales.push(element);
                        this.bloqueosActuales[this.bloqueosActuales.length-1].fechaInicio=this.transformarFechaStrADate(this.bloqueosActuales[this.bloqueosActuales.length-1].fechaInicio);
                        this.bloqueosActuales[this.bloqueosActuales.length-1].fechaFin=this.transformarFechaStrADate(this.bloqueosActuales[this.bloqueosActuales.length-1].fechaFin);
                    }
                });
            }catch(err){
                console.log(err);
            }
        },
        verificarInterseccionEntreDosRangoDeFechas(fechaIni1,fechaFin1,fechaIni2,fechaFin2){
            if((fechaIni1<=fechaFin2)&&(fechaFin1>=fechaIni2)){
                return true;
            }
            return false;
        },
        transformarFechaStrADate(fechaStr){
            
        }
    },
    watch:{
        reanudoSimulacion: function(nuevaReanudoSimulacion){
            this.obtenerDatosSimulacion();
        },
        velocidadSimulacion: function(nuevaVelocidad){
            clearInterval(this.interval);
            interval=setInterval(this.actualizarMapa,this.tiempoDeSimulacion/nuevaVelocidad);  
        },
        fechaInicioSim: function(nuevaFechaInicioSim){
            this.fechaInicioSimulacion=this.transformarFechaStrADate(nuevaFechaInicioSim);
            this.fechaFinSimulacion=this.fechaInicioSimulacion.setDate(this.fechaInicioSimulacion.getDate()+3);
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
                p5.dibujarAlmacenes();
                p5.mostrarFechaSimulacion();
            };
            p5.mostrarFechaSimulacion = () => {
                p5.stroke("#EEEEEE");
                let c=p5.color("#000000");
                p5.fill(c);
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
                    for(let j=0;this.bloqueosActuales[indiceBloqueosMostrar[i]].puntos.length-1;j++){
                        p5.line(this.escalaPixeles*this.bloqueosActuales[indiceBloqueosMostrar[i]].puntos[j].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.bloqueosActuales[indiceBloqueosMostrar[i]].puntos[j].ubicacionY),
                        this.escalaPixeles*this.bloqueosActuales[indiceBloqueosMostrar[i]].puntos[j+1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.bloqueosActuales[indiceBloqueosMostrar[i]].puntos[j+1].ubicacionY));
                    }
                }
                p5.strokeWeight(1);
            };
            p5.actualizarCamiones = () => {
                let c;
                p5.textSize(this.escalaPixeles);
                p5.strokeWeight(2);
                for(let i=0;i<this.indicesCamionesMostrar.length;i++){
                    //c=p5.color(this.camiones[indicesCamionesMostrar[i]].color);
                    c=p5.color(this.listaColoresCamiones[i]);
                    p5.fill(c);
                    p5.stroke("#EEEEEE");
                    p5.ellipse(this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionX,
                    this.escalaPixeles*(this.tamYMapa-this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionY),
                    this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.camiones[indicesCamionesMostrar[i]].codigo,
                    this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionX-this.escalaPixeles,
                    this.escalaPixeles*(this.tamYMapa-this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[0].ubicacionY)
                    +this.escalaPixeles);
                    if(this.camiones[indicesCamionesMostrar[i]].rutas[0].codigoPedido!=""){
                        p5.ellipse(this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[indicesCamiones[i]].rutas[0].puntos.length-1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[indicesCamiones[i]].rutas[0].puntos.length-1].ubicacionY),
                        this.escalaPixeles,this.escalaPixeles);
                        p5.text(this.camiones[indicesCamionesMostrar[i]].rutas[0].codigoPedido,
                        this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[indicesCamiones[i]].rutas[0].puntos.length-1].ubicacionX-this.escalaPixeles,
                        this.escalaPixeles*(this.tamYMapa-this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[this.camiones[indicesCamiones[i]].rutas[0].puntos.length-1].ubicacionY)
                        +this.escalaPixeles);
                    }
                    p5.stroke(this.listaColoresCamiones[i]);
                    for(let j=0;j<this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos.length-1;j++){
                        p5.line(this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[j].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[j].ubicacionY),
                        this.escalaPixeles*this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[j+1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.camiones[indicesCamionesMostrar[i]].rutas[0].puntos[j+1].ubicacionY));
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