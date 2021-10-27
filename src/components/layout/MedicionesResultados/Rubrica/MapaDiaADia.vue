<template>
    <div>
        <div id="canvas" class="mapa"></div>
        
    </div>
</template>
<script>
import P5 from 'p5';
import SockJS from 'sockjs-client';
import {getCamionesUbicacionesActuales} from '../../../util/services/index';
import LeyendaMapa from '../../../shared/LeyendaMapa.vue'

export default {
    props:[
        'averia'
    ],
    components:{
        LeyendaMapa,
    },  
    name:"MapaDiaADia",
    data(){
        return{
            script:null,
            p5canvas:null,

            stompClient:null,
            socket:null,

            escalaPixeles:14,
            tamXMapa:70,
            tamYMapa:50,
            almacenCentralPosX:12,
            almacenCentralPosY:8,
            almacenIntermedio1PosX:42,
            almacenIntermedio1PosY:42,
            almacenIntermedio2PosX:63,
            almacenIntermedio2PosY:3,

            camionesUbicacionActual:[],
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
                this.camionesUbicacionActual=data.data.data.camiones;
                this.bloqueosActuales=data.data.data.bloqueos;
                this.averiasActuales=data.data.data.averias;*/
                this.camionesUbicacionActual=[
                    {
                        id:1,
                        codigo:"TA01",
                        placa:"ABC-123",
                        ubicacionActualX:10,
                        ubicacionActualY:2,
                        cargaActualGLP:20,
                        cargaActualPetroleo:10,
                        estado:{
                            id:1,
                            nombre:"En ruta",
                        }
                    },
                    {
                        id:1,
                        codigo:"TA02",
                        placa:"ABC-122",
                        ubicacionActualX:40,
                        ubicacionActualY:40,
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
                        ubicacionActualX:50,
                        ubicacionActualY:48,
                        cargaActualGLP:20,
                        cargaActualPetroleo:10,
                        estado:{
                            id:4,
                            nombre:"Averiado",
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
                /*
                this.averiasActuales=[
                    {
                        ubicacionX:40,
                        ubicacionY:49,
                    },
                    {
                        ubicacionX:42,
                        ubicacionY:49,
                    },
                ];
                */
            }catch(err){
                
            }
        },
        actualizarCamionesMapa(){
            //this.obtenerPosicionActualCamion();
            let a=Math.random();
            let b=Math.random();
            if(a<0.5){//mover vertical
                if(b<0.5){//mover abajo
                    if(this.camionesUbicacionActual[0].ubicacionActualY+1>50){
                        this.camionesUbicacionActual[0].ubicacionActualY--;
                    }else{
                        this.camionesUbicacionActual[0].ubicacionActualY++;
                    }
                    if(this.camionesUbicacionActual[1].ubicacionActualY+1>50){
                        this.camionesUbicacionActual[1].ubicacionActualY--;
                    }else{
                        this.camionesUbicacionActual[1].ubicacionActualY++;
                    }
                }else{//mover arriba
                    if(this.camionesUbicacionActual[0].ubicacionActualY-1<0){
                        this.camionesUbicacionActual[0].ubicacionActualY++;
                    }else{
                        this.camionesUbicacionActual[0].ubicacionActualY--;
                    }
                    if(this.camionesUbicacionActual[1].ubicacionActualY-1<0){
                        this.camionesUbicacionActual[1].ubicacionActualY++;
                    }else{
                        this.camionesUbicacionActual[1].ubicacionActualY--;
                    }
                }
            }else{//mover horizontal
                if(b<0.5){//mover izquierda
                    if(this.camionesUbicacionActual[0].ubicacionActualX-1<0){
                        this.camionesUbicacionActual[0].ubicacionActualX++;
                    }else{
                        this.camionesUbicacionActual[0].ubicacionActualX--;
                    }
                    if(this.camionesUbicacionActual[1].ubicacionActualX-1<0){
                        this.camionesUbicacionActual[1].ubicacionActualX++;
                    }else{
                        this.camionesUbicacionActual[1].ubicacionActualX--;
                    }
                }else{//mover derecha
                    if(this.camionesUbicacionActual[0].ubicacionActualX+1>70){
                        this.camionesUbicacionActual[0].ubicacionActualX--;
                    }else{
                        this.camionesUbicacionActual[0].ubicacionActualX++;
                    }
                    if(this.camionesUbicacionActual[1].ubicacionActualX+1>70){
                        this.camionesUbicacionActual[1].ubicacionActualX--;
                    }else{
                        this.camionesUbicacionActual[1].ubicacionActualX++;
                    }
                }
            }
        },
        /*actualizarDatos(datos){
            this.camionesUbicacionActual=datos.camiones;
            this.bloqueosActuales=datos.bloqueos;
            this.averiasActuales=datos.averias;
        },*/
    },
    mounted(){
        this.script = p5 => {
            p5.setup = () => {
                //escala de 70 * 14
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
                //p5.actualizarAverias();
                p5.registrarAveria();
                p5.actualizarBloqueos();
            };
            p5.dibujarLeyenda = () => {
                let margenMapaYLeyenda=this.escalaPixeles*(this.tamXMapa+3);
                p5.stroke("#EEEEEE");
                let c=p5.color("#000000");
                

                p5.fill(c);
                p5.textSize(15);
                p5.text("Leyenda:",margenMapaYLeyenda,20);

                c=p5.color("#0000FF");
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
            };
            /*p5.actualizarAverias = () => {
                let c=p5.color("#815C97");
                p5.fill(c);
                for(let i=0;i<this.averiasActuales.length;i++){
                    p5.ellipse(this.escalaPixeles*this.averiasActuales[i].ubicacionX,
                    this.escalaPixeles*this.averiasActuales[i].ubicacionY,this.escalaPixeles,this.escalaPixeles);
                }
            };*/
            p5.registrarAveria = () => {
                if(this.seRegistroAveria){
                    let c=p5.color("#FF0000");
                    p5.fill(c);
                    p5.ellipse(this.escalaPixeles*this.averiaPosX,
                    this.escalaPixeles*this.averiaPosY,this.escalaPixeles,this.escalaPixeles);
                }
            };
            p5.actualizarBloqueos = () => {
                p5.stroke("#FF0000");
                for(let i=0;i<this.bloqueosActuales.length-1;i++){
                    p5.line(this.escalaPixeles*this.bloqueosActuales[i].ubicacionX,
                    this.escalaPixeles*this.bloqueosActuales[i].ubicacionY,
                    this.escalaPixeles*this.bloqueosActuales[i+1].ubicacionX,
                    this.escalaPixeles*this.bloqueosActuales[i+1].ubicacionY);
                }
                let c=p5.color("#FF0000");
                p5.fill(c);
                p5.ellipse(this.escalaPixeles*this.bloqueosActuales[0].ubicacionX,
                this.escalaPixeles*this.bloqueosActuales[0].ubicacionY,this.escalaPixeles,this.escalaPixeles);
                p5.ellipse(this.escalaPixeles*this.bloqueosActuales[this.bloqueosActuales.length-1].ubicacionX,
                this.escalaPixeles*this.bloqueosActuales[this.bloqueosActuales.length-1].ubicacionY,
                this.escalaPixeles,this.escalaPixeles);
            };
            p5.actualizarCamiones = () => {
                let c=p5.color("#0000FF");
                p5.fill(c);
                p5.textSize(11);
                for(let i=0;i<this.camionesUbicacionActual.length;i++){
                    if(this.camionesUbicacionActual[i].estado.nombre=="Averiado"){
                        c=p5.color("#FF0000");
                    }else{
                        c=p5.color("#0000FF");
                    }
                    p5.fill(c);
                    p5.ellipse(this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualX,
                    this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualY,this.escalaPixeles,this.escalaPixeles);
                    p5.text(this.camionesUbicacionActual[i].codigo,
                    this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualX-this.escalaPixeles,
                    this.escalaPixeles*this.camionesUbicacionActual[i].ubicacionActualY+this.escalaPixeles);
                }
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
        }
    },
    async created(){
        await this.obtenerPosicionesYBloqueosActuales();
        /*this.socket=new SockJS('http://localhost:8080');
        this.stompClient=Stomp.over(socket);
        this.stompClient.connect({},function(frame){
            this.stompClient.subscribe('camiones/ubicaciones',function(datos){
                console.log(datos);
                this.actualizarDatos(datos.data.data);
            })
        })*/
        setInterval(this.actualizarCamionesMapa,10000);
    }
}
</script>
<style>
    
</style>