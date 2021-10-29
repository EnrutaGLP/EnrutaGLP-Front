<template>
    <div class="contenedorPrincipal">
        <div class="mediciones">
            <Title texto="Mediciones y Resultados > Mediciones" :usarBotonAyuda=true urlKey="mediciones"/>
            <br />
            <Select
                texto="Seleccione una especialidad"
                :items="especialidades"
                :value2="especialidadSeleccionada"
                @cambio-seleccion="cambioSeleccion"
            />
            <br />
            <LinkDataTable 
                :headers="headers"
                :dataList="cursos"
                :idSemestre="idSemestre"
                :nombreSemestre="nombreSemestre"
            />
            <div class="botones-bottom">
                <BackButton/>
            </div>
        </div>
    </div>
</template>

<script>
import { getMedicionesPorEspecialidadPorUsuario, getEspecialidadesUsuario} from '../../../util/services/index';

import Title from '../../../shared/Title';
import Select from '../../../shared/Select';
import LinkDataTable from './LinkDataTable';
import BackButton from '../../../shared/BackButton';
import * as CryptoJS from 'crypto-js';
import * as momentjs from 'moment';

export default {
    name: 'Mediciones',
    components: {
        Title,
        Select,
        LinkDataTable,
        BackButton,
    },
    data: function() {
        return {
            headers: [
                {
                    text:'Medición',
                    align:'start',
                    sortable:true,
                    value:'nombreCurso'
                },
                {text:'Código', value:'codigoCurso'},
                {text:'Muestra', value:'Horario'},
                {text: 'Estado', value:'terminado'},
            ],
            especialidades: [],
            especialidadSeleccionada: {},
            mediciones: [], 
            cursos: [],
            idSemestre: 0,
            nombreSemestre: "",
            acceso: -1,
        };
    },

    methods: { //idPersona, idPlanMedicion, idResultado
        async listarEspecialidadesUsuario(){
            let listaEspecialidades = [];
            try {
                const response = await getEspecialidadesUsuario(CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona').toString(CryptoJS.enc.Utf8));
                listaEspecialidades = response.data.especialidades;
                this.especialidades = listaEspecialidades.map((data) => ({
                    text: data.nombre,
                    value: data.id_especialidad,
                }));
            } catch (err) {
                console.log('Error al obtener las especialidades del usuario.', err);
            }
        },
        async listarMedicionesPorEspecialidadPorUsuario(id_persona, idEspecialidad, fecha_actual){
            let listaMediciones = [];
            try {
                const response = await getMedicionesPorEspecialidadPorUsuario(id_persona, idEspecialidad, fecha_actual);
                listaMediciones = response.data.mediciones;
                // console.log("response", response);
                this.cursos = listaMediciones;
                this.idSemestre = response.data.idSemestre;
                this.nombreSemestre = response.data.nombreSemestre;
            } catch (err) {
            }
        },
        cambioSeleccion(value){
            this.listarMedicionesPorEspecialidadPorUsuario(
                CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona').toString(CryptoJS.enc.Utf8),
                value,
                momentjs().format("YYYY-MM-D HH:mm:ss").toString()
            );
        }
    },
    created() {
        let acces = localStorage.getItem('acceso');
        if (!acces) {
            this.$router.push('/login');
        }
        this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
        this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
        if (this.acceso == 0) {
            this.$router.push('/login');
        }
        this.listarEspecialidadesUsuario().then(() => {
            this.listarMedicionesPorEspecialidadPorUsuario(
                CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona').toString(CryptoJS.enc.Utf8),
                this.especialidades[0].value,
                momentjs().format("YYYY-MM-D HH:mm:ss").toString()
            );
            this.especialidadSeleccionada = this.especialidades[0];
        });
        if(localStorage.getItem("data") != null)
            localStorage.removeItem("data");
    },
}
</script>

<style scoped>

</style>
