<template>
    <div class = "mapaEntero">
        <div id="canvas" class="mapa"></div>
        <div class="rutasCamiones">
            <p class="tituloRutas">Rutas:</p>
            <div class="rutas" :key="camionUbicacionActual.id" v-for="(camionUbicacionActual,k) in camionesUbicacionActual" v-on:click="mostrarHojaDeRuta(camionUbicacionActual.hojaDeRuta)">
                <div @click="mostrarHojaDeRuta(camionesUbicacionActual[0].hojaDeRuta)">
                    <span>Camión: {{camionUbicacionActual.codigo}}<div :style="{'background-color':camionUbicacionActual.color}"><div class="circulo"></div></div></span>
                    <div>Cantidad GLP: {{camionUbicacionActual.cargaActualGLP}}</div>
                    <div>Estado: {{camionUbicacionActual.estado.nombre}}</div>
                    <span>Ubicación Actual: {{camionUbicacionActual.ubicacionActualX}}, {{camionUbicacionActual.ubicacionActualY}}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import P5 from 'p5';
import SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';
import {getBloqueosActuales, getRutasActuales, getPedidosActuales, URL} from '../../../util/services/index';

export default {
    props:[
        'averia',
        'esSimulacion',
        'reanudoSimulacion',
        'velocidadSimulacion',
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

            tiempoDeSimulacion:2000,

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

            camionesUbicacionActual:[],
            rutasActuales:[],
            auxRutasActuales:[],
            longitudRutasActuales:[],
            posicionRutasActuales:[],
            bloqueosActuales:[],
            averiasActuales:[],
            pedidosActuales:[],

            seRegistroAveria:false,
            averiaPosX:-1,
            averiaPosY:-1,
        };
    },
    methods:{
        async obtenerPosicionesYBloqueosActualesPrimeraVez(){
            try{
                const data1=await getRutasActuales();
                console.log("servicio de rutas actuales");
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
                        color:element.color,
                        estado:{
                            id:element.estadoId,
                            nombre:element.estadoNombre,
                        },
                        hojaDeRuta:[],
                    });
                    this.rutasActuales.push({
                        codigo:element.codigo,
                        ruta:element.ruta,
                    });
                });
                for(let i=0;i<data1.data.data.hojaRuta.length;i++){
                    for(let j=0;j<this.camionesUbicacionActual.length;j++){
                        this.camionesUbicacionActual[j].hojaDeRuta.push(data1.data.data.hojaRuta[0]);
                        if(data1.data.data.hojaRuta[i].codigoCamion==this.camionesUbicacionActual[j].codigo){
                            console.log("entro al if de añadir ruta");
                            this.camionesUbicacionActual[j].hojaDeRuta.push(data1.data.data.hojaRuta[i]);
                            //break;
                        }
                    }
                }
                console.log("al llegar la data con el get");
                console.log(this.camionesUbicacionActual);
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
                
                //this.auxRutasActuales=JSON.parse(JSON.stringify(this.rutasActuales));
                /*for(let i=0;i<this.rutasActuales.length;i++){
                    this.longitudRutasActuales.push(this.rutasActuales[i].ruta.length);
                    this.posicionRutasActuales.push(0);
                }*/
            }catch(err){
                
            }
        },
        obtenerPosicionesYBloqueosActuales(jsonGreeting){
            try{
                
                this.camionesUbicacionActual=[];
                this.rutasActuales=[];
                this.bloqueosActuales=[];
                this.longitudRutasActuales=[];
                this.posicionRutasActuales=[];
                this.pedidosActuales=jsonGreeting.pedidos;
                console.log(this.pedidosActuales);

                this.averiasActuales=jsonGreeting.rutas.averiados;

                jsonGreeting.rutas.otros.forEach(element => {
                    this.camionesUbicacionActual.push({
                        codigo:element.codigo,
                        ubicacionActualX:element.ubicacionActualX,
                        ubicacionActualY:element.ubicacionActualY,
                        color:element.color,
                        estado:{
                            id:element.estadoId,
                            nombre:element.estadoNombre,
                        },
                        hojaDeRuta:[],
                    });
                    this.rutasActuales.push({
                        codigo:element.codigo,
                        ruta:element.ruta,
                    });
                });
                for(let i=0;i<jsonGreeting.hojaRuta.length;i++){
                    for(let j=0;j<this.camionesUbicacionActual.length;j++){
                        this.camionesUbicacionActual.hojaDeRuta.push(jsonGreeting.hojaRuta[0]);
                        if(jsonGreeting.hojaRuta[i].codigoCamion==this.camionesUbicacionActual[j].codigo){
                            console.log("entro al if de añadir ruta");
                            this.camionesUbicacionActual[j].hojaDeRuta.push(jsonGreeting.hojaRuta[i]);
                            //break;
                        }
                    }
                }
                console.log("al llegar la data con el get");
                console.log(this.camionesUbicacionActual);
                for(let m=0;m<jsonGreeting.bloqueos.length;m++){
                    this.bloqueosActuales.push({
                        bloqueo:[],
                    });
                    for(let n=0;n<jsonGreeting.bloqueos[m].puntos.length;n++){
                        this.bloqueosActuales[m].bloqueo.push({
                            ubicacionX:jsonGreeting.bloqueos[m].puntos[n].ubicacionX,
                            ubicacionY:jsonGreeting.bloqueos[m].puntos[n].ubicacionY,
                        })
                    }
                }
                console.log(this.bloqueosActuales);
                
                //this.auxRutasActuales=JSON.parse(JSON.stringify(this.rutasActuales));
                /*for(let i=0;i<this.rutasActuales.length;i++){
                    this.longitudRutasActuales.push(this.rutasActuales[i].ruta.length);
                    this.posicionRutasActuales.push(0);
                }*/
            }catch(err){
                
            }
        },
        actualizarCamionesMapa(){
            let i=0;
            let indicesAEliminar=[];
            while(i<this.camionesUbicacionActual.length){
                this.rutasActuales[i].ruta.splice(0,1);
                if(this.rutasActuales[i].ruta.length>0){
                    this.camionesUbicacionActual[i].ubicacionActualX=this.rutasActuales[i].ruta[this.posicionRutasActuales[i]].ubicacionX;
                    this.camionesUbicacionActual[i].ubicacionActualY=this.rutasActuales[i].ruta[this.posicionRutasActuales[i]].ubicacionY;
                }
                //this.posicionRutasActuales[i]++; 
                this.longitudRutasActuales[i]--;
                if(this.posicionRutasActuales[i]>=this.longitudRutasActuales[i]){
                    indicesAEliminar.push(i);
                }
                i++;
            }
            for(let j=indicesAEliminar.length-1;j>=0;j--){
                this.camionesUbicacionActual.splice(indicesAEliminar[j],1);
                this.rutasActuales.splice(indicesAEliminar[j],1);
                this.posicionRutasActuales.splice(indicesAEliminar[j],1);
                this.longitudRutasActuales.splice(indicesAEliminar[j],1);
            }
            indicesAEliminar=[];
        },
        actualizarDatos(datos){
            if(this.esSimulacion){
                if(this.reanudoSimulacion){
                    this.camionesUbicacionActual=datos.camiones;
                    this.bloqueosActuales=datos.bloqueos;
                    this.averiasActuales=datos.averias;
                    this.rutasActuales=datos.rutas;
                    for(let i=0;i<this.rutasActuales.length;i++){
                        this.longitudRutasActuales.push(this.rutasActuales[i].ruta.length);
                        this.posicionRutasActuales.push(0);
                    }
                }
            }else{
                this.camionesUbicacionActual=datos.camiones;
                this.bloqueosActuales=datos.bloqueos;
                this.averiasActuales=datos.averias;
                this.rutasActuales=datos.rutas;
                for(let i=0;i<this.rutasActuales.length;i++){
                    this.longitudRutasActuales.push(this.rutasActuales[i].ruta.length);
                    this.posicionRutasActuales.push(0);
                }
            }
        },
        mostrarHojaDeRuta(hojaDeRuta){
            if(this.camionesUbicacionActual==[]){
                console.log("javascript de mierda");
            }else{
                console.log(this.camionesUbicacionActual);
            }

            this.$emit("mostrarHojaRuta",hojaDeRuta);
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
                p5.registrarAveria();
                p5.actualizarAverias();
                p5.actualizarClientes();
                p5.actualizarBloqueos();
                p5.dibujarAlmacenes();
            };
            p5.actualizarClientes = () => {
                let c=p5.color("#000000");
                p5.fill(c);
                p5.stroke("#EEEEEE");
                p5.textSize(this.escalaPixeles);
                for(let i=0;i<this.pedidosActuales.length;i++){
                    p5.fill(c);
                    p5.ellipse(this.escalaPixeles*this.pedidosActuales[i].ubicacionX,
                    this.escalaPixeles*(this.tamYMapa-this.pedidosActuales[i].ubicacionY),
                    this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.pedidosActuales[i].codigo,
                    this.escalaPixeles*this.pedidosActuales[i].ubicacionX-this.escalaPixeles*2.5,
                    this.escalaPixeles*(this.tamYMapa-this.pedidosActuales[i].ubicacionY)+this.escalaPixeles);
                }
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
            p5.registrarAveria = () => {
                if(this.seRegistroAveria){
                    let c=p5.color("#FF0000");
                    p5.fill(c);
                    p5.ellipse(this.escalaPixeles*this.averiaPosX,
                    this.escalaPixeles*(this.tamYMapa-this.averiaPosY),this.escalaPixeles,this.escalaPixeles);
                }
            };
            p5.actualizarAverias = () => {
                let c=p5.color("#FF0000");
                p5.fill(c);
                p5.textSize(this.escalaPixeles);
                for(let i=0;i<this.averiasActuales.length;i++){
                    p5.fill(c);
                    p5.ellipse(this.escalaPixeles*this.averiasActuales[i].ubicacionActualX,
                    this.escalaPixeles*(this.tamYMapa-this.averiasActuales[i].ubicacionActualY),this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.averiasActuales[i].codigo,
                    this.escalaPixeles*this.averiasActuales[i].ubicacionActualX-this.escalaPixeles,
                    this.escalaPixeles*(this.tamYMapa-this.averiasActuales[i].ubicacionActualY)+this.escalaPixeles);
                }
            };
            p5.actualizarBloqueos = () => {
                p5.stroke("#FF0000");
                p5.strokeWeight(5);
                for(let i=0;i<this.bloqueosActuales.length;i++){
                    for(let j=0;j<this.bloqueosActuales[i].bloqueo.length-1;j++){
                        p5.line(this.escalaPixeles*this.bloqueosActuales[i].bloqueo[j].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.bloqueosActuales[i].bloqueo[j].ubicacionY),
                        this.escalaPixeles*this.bloqueosActuales[i].bloqueo[j+1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.bloqueosActuales[i].bloqueo[j+1].ubicacionY));
                    }
                }
                p5.strokeWeight(1);
            };
            p5.actualizarCamiones = () => {
                let c;
                p5.textSize(this.escalaPixeles);
                p5.strokeWeight(2);
                for(let i=0;i<this.camionesUbicacionActual.length;i++){
                    c=p5.color(this.camionesUbicacionActual[i].color);
                    p5.fill(c);
                    p5.stroke("#EEEEEE");
                    p5.ellipse(this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualX,
                    this.escalaPixeles*(this.tamYMapa-this.camionesUbicacionActual[i].ubicacionActualY),this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.camionesUbicacionActual[i].codigo,
                    this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualX-this.escalaPixeles,
                    this.escalaPixeles*(this.tamYMapa-this.camionesUbicacionActual[i].ubicacionActualY)+this.escalaPixeles);
                    p5.stroke(this.camionesUbicacionActual[i].color);
                    for(let j=0;j<this.rutasActuales[i].ruta.length-1;j++){
                        p5.line(this.escalaPixeles*this.rutasActuales[i].ruta[j].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.rutasActuales[i].ruta[j].ubicacionY),
                        this.escalaPixeles*this.rutasActuales[i].ruta[j+1].ubicacionX,
                        this.escalaPixeles*(this.tamYMapa-this.rutasActuales[i].ruta[j+1].ubicacionY));
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
    watch:{
        averia: function(nuevaAveria){
            if(nuevaAveria!=""){
                console.log(nuevaAveria);
                let i=0;
                while(i<this.camionesUbicacionActual.length){
                    if(this.camionesUbicacionActual[i].codigo==nuevaAveria){
                        this.averiaPosX=this.camionesUbicacionActual[i].ubicacionActualX;
                        this.averiaPosY=this.camionesUbicacionActual[i].ubicacionActualY;
                        break;
                    }
                    i++;
                }
                this.camionesUbicacionActual.splice(i,1);
                this.seRegistroAveria=true;
                setTimeout(()=>{
                    this.seRegistroAveria=false;
                    this.averiaPosX=-1;
                    this.averiaPosY=-1;
                },600000);
            }
        },
        velocidadSimulacion: function(nuevaVelocidad){

        }
    },
    async created(){
        
        await this.obtenerPosicionesYBloqueosActualesPrimeraVez();
            
        //setInterval(this.actualizarCamionesMapa,5000);

        this.socket=new SockJS(URL+'/stomp-endpoint');
        this.stompClient=Stomp.over(this.socket);
        this.stompClient.connect({}, (frame) => {
            this.stompClient.subscribe('/topic/estado-general',(greeting)=>{
                console.log(greeting);
                let jsonGreeting=JSON.parse(greeting.body);
                console.log(jsonGreeting);
                
                //console.log(this.pedidosActuales);
                this.obtenerPosicionesYBloqueosActuales(jsonGreeting);
            });
        });
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
        -moz-border-radius: 50%;
        -webkit-border-radius: 50%;
    }
</style>