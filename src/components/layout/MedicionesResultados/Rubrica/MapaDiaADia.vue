<template>
    <div id="canvas"></div>
</template>
<script>
import P5 from 'p5';
import {getCamionesUbicacionesActuales} from '../../../util/services/index';

export default {
    name:"MapaDiaADia",
    data(){
        return{
            script:null,
            p5canvas:null,

            stompClient:null,
            socket:null,

            tamXMapa:70,
            tamYMapa:50,
            almacenCentralPosX:12,
            almacenCentralPosY:8,
            almacenIntermedio1PosX:42,
            almacenIntermedio1PosY:42,
            almacenIntermedio2PosX:63,
            almacenIntermedio2PosY:3,

            camionesUbicacionActual:[],

            yaActualizoCamiones:true,
        };
    },
    methods:{
        async obtenerPosicionActualCamion(){
            try{
                /*const data=await getCamionesUbicacionesActuales();
                console.log(data);
                this.camionesUbicacionActual=data.data;
                this.yaActualizoCamiones=false;*/
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
                ];
            }catch(err){
                
            }
        },
        actualizarCamionesMapa(){
            //this.obtenerPosicionActualCamion();
            this.yaActualizoCamiones=false;
        },
    },
    mounted(){
        this.script = p5 => {
            p5.setup = () => {
                //escala de 70 * 14
                p5.createCanvas(980,700);
            };
            p5.draw = () => {
                p5.clear();
                p5.background('#EEEEEE');
                p5.dibujarCuadricula();
                p5.dibujarAlmacenes();
                p5.actualizarCamiones();
            };
            p5.actualizarCamiones = () => {
                if(!this.yaActualizoCamiones){
                    //this.camionesEnPantalla.splice(0,this.camionesEnPantalla.length);
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
                    this.yaActualizoCamiones=true;
                }
                let c=p5.color("#0000FF");
                p5.fill(c);
                p5.textSize(11);
                for(let i=0;i<this.camionesUbicacionActual.length;i++){
                    p5.ellipse(14*this.camionesUbicacionActual[i].ubicacionActualX,14*this.camionesUbicacionActual[i].ubicacionActualY,14,14);
                    p5.text(this.camionesUbicacionActual[i].codigo,14*this.camionesUbicacionActual[i].ubicacionActualX-14,14*this.camionesUbicacionActual[i].ubicacionActualX+14);
                }
            };
            p5.dibujarCuadricula = () => {
                p5.stroke("#C3C3C3");
                let i;
                for(i=0;i<this.tamXMapa;i++){
                    p5.line(14*i,0,14*i,700);    
                }
                for(i=0;i<this.tamYMapa;i++){
                    p5.line(0,14*i,980,14*i);
                }
            };
            p5.dibujarAlmacenes = () => {
                let c=p5.color("#FF0000");
                p5.fill(c);
                p5.ellipse(14*this.almacenCentralPosX,14*this.almacenCentralPosY,14,14);
                c=p5.color("#00FF00");
                p5.fill(c);
                p5.ellipse(14*this.almacenIntermedio1PosX,14*this.almacenIntermedio1PosY,14,14);
                p5.ellipse(14*this.almacenIntermedio2PosX,14*this.almacenIntermedio2PosY,14,14);
            };
        }
        this.p5canvas=new P5(this.script,'canvas');
        
    },
    created(){
        this.obtenerPosicionActualCamion();
        //this.socket=new SockJS('ws://localhost:8080');
        setInterval(this.actualizarCamionesMapa,2000);
    }
}
</script>
