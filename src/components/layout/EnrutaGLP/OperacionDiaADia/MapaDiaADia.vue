<template>
    <div class = "mapaEntero">
        <div id="canvas" class="mapa"></div>
        <div class="rutasCamiones">
            <p class="tituloRutas">Rutas:</p>
            <div class="rutas" :key="camionUbicacionActual.id" v-for="(camionUbicacionActual,k) in camionesUbicacionActual">
                <span>Camión: {{camionUbicacionActual.codigo}}<div :style="{'background-color':listaColoresCamiones[k]}"><div class="circulo"></div></div></span>
                <div>Placa: {{camionUbicacionActual.placa}}</div>
                <span>Cantidad GLP: {{camionUbicacionActual.cargaActualGLP}}</span>
                <div>Estado: {{camionUbicacionActual.estado.nombre}}</div>
                <span>Ubicación Actual: {{camionUbicacionActual.ubicacionActualX}}, {{camionUbicacionActual.ubicacionActualY}}</span>
            </div>
        </div>
    </div>
</template>
<script>
import P5 from 'p5';
import SockJS from 'sockjs-client';
import {getCamionesUbicacionesActuales} from '../../../util/services/index';

export default {
    props:[
        'averia',
        'esSimulacion',
        'reanudoSimulacion',
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

            escalaPixeles:11.5,
            tamXMapa:70,
            tamYMapa:50,
            almacenCentralPosX:12,
            almacenCentralPosY:8,
            almacenIntermedio1PosX:42,
            almacenIntermedio1PosY:42,
            almacenIntermedio2PosX:63,
            almacenIntermedio2PosY:3,
            estadoCamiones:["","En reposo","En ruta","Averiado","En mantenimiento preventivo","En mantenimiento correctivo"],

            camionesUbicacionActual:[],
            rutasActuales:[],
            auxRutasActuales:[],
            longitudRutasActuales:[],
            posicionRutasActuales:[],
            bloqueosActuales:[],
            //averiasActuales:[],

            seRegistroAveria:false,
            averiaPosX:-1,
            averiaPosY:-1,
        };
    },
    methods:{
        async obtenerPosicionesYBloqueosActuales(){
            try{
                /*const data=await getCamionesUbicacionesActuales();
                console.log(data);
                this.camionesUbicacionActual=data.data.data.otros;
                this.bloqueosActuales=data.data.data.bloqueos.puntos;
                this.averiasActuales=data.data.data.averiados;
                this.rutasActuales=data.data.data.rutas;*/
                this.camionesUbicacionActual=[
                    {
                        id:1,
                        codigo:"TA01",
                        placa:"ABC-123",
                        ubicacionActualX:1,
                        ubicacionActualY:2,
                        cargaActualGLP:20,
                        cargaActualPetroleo:10,
                        estado:{
                            id:1,
                            nombre:"En ruta",
                        }
                    },
                    {
                        id:2,
                        codigo:"TA02",
                        placa:"ABC-122",
                        ubicacionActualX:4,
                        ubicacionActualY:5,
                        cargaActualGLP:20,
                        cargaActualPetroleo:10,
                        estado:{
                            id:1,
                            nombre:"En ruta",
                        }
                    },
                    {
                        id:3,
                        codigo:"TA03",
                        placa:"ABC-123",
                        ubicacionActualX:14,
                        ubicacionActualY:15,
                        cargaActualGLP:20,
                        cargaActualPetroleo:10,
                        estado:{
                            id:1,
                            nombre:"En ruta",
                        }
                    },
                    {
                        id:4,
                        codigo:"TA04",
                        placa:"ABC-127",
                        ubicacionActualX:24,
                        ubicacionActualY:25,
                        cargaActualGLP:20,
                        cargaActualPetroleo:10,
                        estado:{
                            id:1,
                            nombre:"En ruta",
                        }
                    },
                ];
                this.bloqueosActuales=[
                    {
                        ubicacionX:10,
                        ubicacionY:24,
                    },
                    {
                        ubicacionX:34,
                        ubicacionY:24,
                    },
                    {
                        ubicacionX:34,
                        ubicacionY:13,
                    },
                    {
                        ubicacionX:54,
                        ubicacionY:13,
                    },
                    {
                        ubicacionX:54,
                        ubicacionY:45,
                    },
                    {
                        ubicacionX:35,
                        ubicacionY:45,
                    },
                ];
                this.rutasActuales=[
                    {
                        codigo:"TA01",
                        ruta:[
                            {
                                ubicacionX: 1,
                                ubicacionY: 2,
                            },
                            {
                                ubicacionX: 2,
                                ubicacionY: 2,
                            },
                            {
                                ubicacionX: 3,
                                ubicacionY: 2,
                            },
                        ],
                    },
                    {
                        codigo:"TA02",
                        ruta:[
                            {
                                ubicacionX: 4,
                                ubicacionY: 5,
                            },
                            {
                                ubicacionX: 5,
                                ubicacionY: 5,
                            },
                            {
                                ubicacionX: 5,
                                ubicacionY: 6,
                            },
                        ],
                    },
                    {
                        codigo:"TA03",
                        ruta:[
                            {
                                ubicacionX: 14,
                                ubicacionY: 15,
                            },
                            {
                                ubicacionX: 15,
                                ubicacionY: 15,
                            },
                            {
                                ubicacionX: 15,
                                ubicacionY: 16,
                            },
                            {
                                ubicacionX: 15,
                                ubicacionY: 17,
                            },
                            {
                                ubicacionX: 15,
                                ubicacionY: 18,
                            },
                            {
                                ubicacionX: 15,
                                ubicacionY: 19,
                            },
                            {
                                ubicacionX: 16,
                                ubicacionY: 19,
                            },
                            {
                                ubicacionX: 17,
                                ubicacionY: 19,
                            },
                            {
                                ubicacionX: 18,
                                ubicacionY: 19,
                            },
                            {
                                ubicacionX: 18,
                                ubicacionY: 17,
                            },
                            {
                                ubicacionX: 17,
                                ubicacionY: 17,
                            },
                            {
                                ubicacionX: 16,
                                ubicacionY: 17,
                            },
                            {
                                ubicacionX: 15,
                                ubicacionY: 17,
                            },
                            {
                                ubicacionX: 14,
                                ubicacionY: 17,
                            },
                            {
                                ubicacionX: 13,
                                ubicacionY: 17,
                            },
                        ],
                    },
                    {
                        codigo:"TA04",
                        ruta:[
                            {
                                ubicacionX: 24,
                                ubicacionY: 25,
                            },
                            {
                                ubicacionX: 25,
                                ubicacionY: 25,
                            },
                            {
                                ubicacionX: 25,
                                ubicacionY: 26,
                            },
                            {
                                ubicacionX: 25,
                                ubicacionY: 27,
                            },
                            {
                                ubicacionX: 25,
                                ubicacionY: 28,
                            },
                            {
                                ubicacionX: 25,
                                ubicacionY: 29,
                            },
                            {
                                ubicacionX: 25,
                                ubicacionY: 30,
                            },
                        ],
                    },
                ];
                //this.auxRutasActuales=JSON.parse(JSON.stringify(this.rutasActuales));
                for(let i=0;i<this.rutasActuales.length;i++){
                    this.longitudRutasActuales.push(this.rutasActuales[i].ruta.length);
                    this.posicionRutasActuales.push(0);
                }
            }catch(err){
                
            }
        },
        actualizarCamionesMapa(){
            let i=0;
            let indicesAEliminar=[];
            while(i<this.camionesUbicacionActual.length){
                this.camionesUbicacionActual[i].ubicacionActualX=this.rutasActuales[i].ruta[this.posicionRutasActuales[i]].ubicacionX;
                this.camionesUbicacionActual[i].ubicacionActualY=this.rutasActuales[i].ruta[this.posicionRutasActuales[i]].ubicacionY;
                this.posicionRutasActuales[i]++;
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
                p5.dibujarAlmacenes();
                p5.dibujarLeyenda();
                p5.actualizarCamiones();
                //p5.actualizarRutas();
                p5.registrarAveria();
                //p5.actualizarAverias();
                p5.actualizarBloqueos();
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
                
                c=p5.color("#00FF00");
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
                    this.escalaPixeles*this.averiaPosY,this.escalaPixeles,this.escalaPixeles);
                }
            };
            p5.actualizarAverias = () => {
                let c=p5.color("#FF0000");
                p5.fill(c);
                p5.textSize(this.escalaPixeles);
                for(let i=0;i<this.averiasActuales.length;i++){
                    p5.fill(c);
                    p5.ellipse(this.escalaPixeles*this.averiasActuales[i].ubicacionActualX,
                    this.escalaPixeles*this.averiasActuales[i].ubicacionActualY,this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.averiasActuales[i].codigo,
                    this.escalaPixeles*this.averiasActuales[i].ubicacionActualX-this.escalaPixeles,
                    this.escalaPixeles*this.averiasActuales[i].ubicacionActualY+this.escalaPixeles);
                }
            };
            p5.actualizarBloqueos = () => {
                p5.stroke("#FF0000");
                p5.strokeWeight(5);
                for(let i=0;i<this.bloqueosActuales.length-1;i++){
                    p5.line(this.escalaPixeles*this.bloqueosActuales[i].ubicacionX,
                    this.escalaPixeles*this.bloqueosActuales[i].ubicacionY,
                    this.escalaPixeles*this.bloqueosActuales[i+1].ubicacionX,
                    this.escalaPixeles*this.bloqueosActuales[i+1].ubicacionY);
                }
                let c=p5.color("#FF0000");
                p5.fill(c);
                /*p5.ellipse(this.escalaPixeles*this.bloqueosActuales[0].ubicacionX,
                this.escalaPixeles*this.bloqueosActuales[0].ubicacionY,this.escalaPixeles,this.escalaPixeles);
                p5.ellipse(this.escalaPixeles*this.bloqueosActuales[this.bloqueosActuales.length-1].ubicacionX,
                this.escalaPixeles*this.bloqueosActuales[this.bloqueosActuales.length-1].ubicacionY,
                this.escalaPixeles,this.escalaPixeles);*/
                p5.strokeWeight(1);
            };
            p5.actualizarCamiones = () => {
                let c;
                p5.textSize(this.escalaPixeles);
                p5.strokeWeight(2);
                for(let i=0;i<this.camionesUbicacionActual.length;i++){
                    c=p5.color(this.listaColoresCamiones[i]);
                    p5.fill(c);
                    p5.stroke("#EEEEEE");
                    p5.ellipse(this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualX,
                    this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualY,this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.camionesUbicacionActual[i].codigo,
                    this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualX-this.escalaPixeles,
                    this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualY+this.escalaPixeles);
                    p5.stroke(this.listaColoresCamiones[i]);
                    for(let j=0;j<this.rutasActuales[i].ruta.length-1;j++){
                        p5.line(this.escalaPixeles*this.rutasActuales[i].ruta[j].ubicacionX,
                        this.escalaPixeles*this.rutasActuales[i].ruta[j].ubicacionY,
                        this.escalaPixeles*this.rutasActuales[i].ruta[j+1].ubicacionX,
                        this.escalaPixeles*this.rutasActuales[i].ruta[j+1].ubicacionY);
                    }
                }
                p5.strokeWeight(1);
            };
            p5.actualizarRutas = () => {
                
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
                p5.fill(c);
                p5.rect(this.escalaPixeles*this.almacenCentralPosX-this.escalaPixeles/2,
                this.escalaPixeles*this.almacenCentralPosY-this.escalaPixeles/2,this.escalaPixeles,this.escalaPixeles);
                c=p5.color("#db6eeb");
                p5.fill(c);
                p5.rect(this.escalaPixeles*this.almacenIntermedio1PosX-this.escalaPixeles/2,
                this.escalaPixeles*this.almacenIntermedio1PosY-this.escalaPixeles/2,this.escalaPixeles,this.escalaPixeles);
                p5.rect(this.escalaPixeles*this.almacenIntermedio2PosX-this.escalaPixeles/2,
                this.escalaPixeles*this.almacenIntermedio2PosY-this.escalaPixeles/2,this.escalaPixeles,this.escalaPixeles);
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
                },3000);
            }
        },
    },
    async created(){
        /*this.socket=new SockJS('http://44.198.125.137:8080');
        this.stompClient=Stomp.over(socket);
        this.stompClient.connect({},function(frame){
            this.stompClient.subscribe('camiones/ubicaciones',function(datos){
                console.log(datos);
                this.actualizarDatos(datos.data.data);
            });
        })*/
        if(!this.esSimulacion){
            await this.obtenerPosicionesYBloqueosActuales();
            
            setInterval(this.actualizarCamionesMapa,2000);
        }else{

        }
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