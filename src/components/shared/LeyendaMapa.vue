<template>
    <div id="canvas"></div>
</template>
<script>
import P5 from 'p5';
//sin utilizar
export default {
    //245,500
    data(){
        return{
            script:null,
            p5canvas:null,
        }
    },
    mounted(){
        this.script = p5 => {
            p5.setup = () => {
                p5.createCanvas(300,200);
            };
            p5.draw = () => {
                p5.clear();
                p5.background('#F8F8F8');
                p5.stroke('#F8F8F8');
                let c=p5.color("#000000")
                p5.fill(c);
                p5.textSize(15);
                p5.text("Leyenda:",10,15);

                c=p5.color("#0000FF");
                p5.fill(c);
                p5.ellipse(15,35,10,10);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Camión",25,40);

                c=p5.color("#FF0000")
                p5.fill(c);
                p5.rect(10,50,10,5);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Bloqueo",25,57);

                c=p5.color("#FF0000");
                p5.fill(c);
                p5.circle(15,70,10,10);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Avería",25,75);

                c=p5.color("#db6eeb")
                p5.fill(c);
                p5.triangle(10,92,15,82,20,92);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Planta Intermedia",25,92);

                c=p5.color("#8f2b9d")
                p5.fill(c);
                p5.triangle(10,92,15,82,20,92);
                c=p5.color("#000000")
                p5.fill(c);
                p5.text("Planta Intermedia",25,92);

            };
        }
        this.p5canvas=new P5(this.script,'canvas');
    }
}
</script>
<style scoped>
    
</style>
