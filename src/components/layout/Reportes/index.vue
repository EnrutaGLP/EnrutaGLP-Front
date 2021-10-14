<template>
    <div class="contenedorPrincipal">
        <div class="reportes">
            <div>
                <Title texto="Reportes" />
                <br />
            </div>
            <div>
                <p v-if="!((acceso>=2) && (datosUsuario.especialidaes.length>0 || datosUsuario.facultades.length>0))">Aún no se encuentra asignado a ninguna especialidad o facultad</p>
                <Card  class="card"
                    title       = "Reporte de Resultados del Estudiante"
                    description = "En este reporte podrá encontrar los distintos puntajes asignados a cada RE en el presente ciclo"
                    route       = "/reportes/reporte-re"
                    :imgSrc     = "imgReporteRE"
                    v-if="(acceso>=2) && (datosUsuario.especialidaes.length>0 || datosUsuario.facultades.length>0)"
                />
                <!-- <Card class="card"
                    title       = "Reporte de Cursos"
                    description = "En este reporte se podra encontrar información de los cursos dictados asigandos al usuario."
                    route       = "/reportes/reporte-cursos"
                    :imgSrc     = "imgReporteCursos"
                /> -->
                <Card class="card"
                    title       = "Reporte por Horario"
                    description = "En este reporte se podra encontrar información de los horarios dictados asigandos al usuario."
                    route       = "/reportes/reporte-horario"
                    :imgSrc     = "imgReporteHorario"
                    v-if="(acceso>=2) && (datosUsuario.especialidaes.length>0 || datosUsuario.facultades.length>0)"
                />
                <Card class="card"
                    title       = "Reporte Histórico"
                    description = "En este reporte se podra encontrar información general a lo largo del tiempo."
                    route       = "/reportes/reporte-historico"
                    :imgSrc     = "imgReporteHist"
                    v-if="(acceso>=2) && (datosUsuario.especialidaes.length>0 || datosUsuario.facultades.length>0)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import Title from '../../shared/Title';
import Card from '../../shared/Card';
import imgReporteRE from '@/components/assets/shared_icons/reporteReEst.png';
import imgReporteHist from '@/components/assets/shared_icons/reporteHist.png';
import imgReporteCursos from '@/components/assets/shared_icons/reporteCursos.png';
import imgReporteHorario from '@/components/assets/shared_icons/reporteHorario.png';
import * as CryptoJS from 'crypto-js';

export default{
    name: 'Reportes',
    components: {
        Card,
        Title,
        acceso: -1,
    },
    data: function() {
        return {
            imgReporteRE,
            imgReporteCursos,
            imgReporteHist,
            imgReporteHorario,
            datosUsuario:{

            },
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
            console.log(err);
        }
    }
};
</script>

<style scoped>
    .grupoCards {
        display: flex;
    }
    .card {
        margin: 2rem 0 0 2rem;
    }
    .reportes{
        max-width: 100vw;
    }
</style>
