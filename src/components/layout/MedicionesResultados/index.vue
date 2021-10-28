<template>
    <div class="contenedorPrincipal">
        <div class="medicionesResultado">
            <Title v-if="acceso==1" texto="Mediciones"/>
            <Title v-else texto="EnrutaGLP"/>
            <br />
            <div>
                <Card class="card"
                    title="Pedidos"
                    description="Visualiza los pedidos, permitiendo añadir nuevos pedidos y listando los ya registrados."
                    route="mediciones-resultados/ResultadosEstudiante/"
                    :imgSrc="REimg"
                />
                <Card class="card"
                    title="Operaciones día a día"
                    description="Permite ver las rutas que actualmente están listas para enviar el GLP al cliente."
                    route="mediciones-resultados/Rubrica/"
                    :imgSrc="Rubricaimg"
                />
                <Card class="card"
                    title="Simulaciones"
                    description="Permite simular como trabajaría el sistema con archivos de prueba."
                    route="mediciones-resultados/EstadoMediciones/"
                    :imgSrc="ListaVerificacionimg"
                />
            </div>
        </div>
    </div>
</template>

<script>
import REimg from '@/components/assets/shared_icons/resultados-estudiante.png';
import Rubricaimg from '@/components/assets/shared_icons/rubrica.png';
import PlanMedicionimg from '@/components/assets/shared_icons/plan-medicion.png';
import Medicionimg from '@/components/assets/shared_icons/mediciones.png';
import ListaVerificacionimg from '@/components/assets/shared_icons/listaVerificacion.png';
import Title from '../../shared/Title.vue';
import Card from '../../shared/Card.vue';
import * as CryptoJS from 'crypto-js';


export default {
    name: 'MedicionesResultado',
    components: {
        Card,
        Title,
    },
    data() {
        return {
            REimg,
            Rubricaimg,
            PlanMedicionimg,
            Medicionimg,
            ListaVerificacionimg,
            titulo: 'Mediciones y Resultados',
            datosUsuario:{

            },
            acceso: -1,
        };
    },
    created() {
        try{
            let acces = localStorage.getItem('acceso');
            if (!acces) {
                this.$router.push('/login');
            }
            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            if (this.acceso == 0) {
                this.$router.push('/login');
            }
            let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
            this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
        }catch(err){

        }
    },
};
</script>

<style scoped>
    .grupoCards {
        display: flex;
    }

    .card {
        margin: 2rem 0 0 2rem;
    }
    .medicionesResultado {
        max-width: 100vw;
    }

</style>
