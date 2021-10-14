<template>
    <div class="contenedorPrincipal">
        <div class="cursos">
            <Title texto="Mantenimientos > Cursos" :usarBotonAyuda=true urlKey="cursos"/>
            <br>
            <div class="row">
                <div>
                    <table allign="left" cellpadding="5">
                        <tr v-if="!noEsAdmin">
                            <div class="col sm-12">
                                <td v-if="!noEsAdmin">Facultades: </td>
                            </div>
                            <td>
                                <Select
                                    class="selectFacultades"
                                    texto="Seleccione una facultad"
                                    v-on:cambio-seleccion="cambioFacultad"
                                    v-bind:items="facultades"
                                    v-if="!noEsAdmin"
                                />
                            </td>
                            
                        </tr>
                            <div class="col sm-12">
                                <td>Especialidad: </td>
                            </div>
                            <td>
                                <Select
                                    class="selectEspecialidades"
                                    texto="Seleccione una especialidad"
                                    v-on:cambio-seleccion="cambioEspecialidad"
                                    v-bind:items="especialidades"
                                    v-if="tieneMasDeUnaEsp"
                                />
                                <p v-if="!tieneMasDeUnaEsp" class="col sm-12">{{nombreUnicaEsp}}</p>
                            </td>
                    </table>
                </div>
            </div>
            <div class="DataTableCursos">
                <DataTableCursos
                    class="dataTableCursos"
                    v-bind:cursos="cursos"
                    v-bind:idEspecialidad="idEspecialidad"
                    v-bind:especialidadSeleccionada="especialidadSeleccionada"
                />
            </div>
            <br>
            <div class="row">
                <div class="col sm-5">
                    <BackButton></BackButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getFacultades, getEspecialidadesPorFacultad, getCursos} from '../../../util/services/index';
import BackButton from '../../../shared/BackButton.vue';
import DataTableCursos from '../Cursos/DataTableCursos.vue';
import Select from '../../../shared/Select.vue';
import Title from '../../../shared/Title.vue';
import Alert from '../../../shared/Alert.vue';
import * as CryptoJS from 'crypto-js';


export default {
    name: 'Cursos',
    components: {
        BackButton,
        DataTableCursos,
        Select,
        Title,
        Alert,
    },
    data() {
        return {
            especialidades: [], // lista de las especialidades
            facultades: [],
            cursos: [],
            id_persona:-1,
            idEspecialidad: -1,
            idFacultad:-1,
            datosUsuario:{
                
            },

            tieneMasDeUnaEsp:true,
            nombreUnicaEsp:'',
            especialidadSeleccionada:false,

            noEsAdmin:false,
            acceso:-1,
        };
    },
    methods: {
        cambioFacultad(dato){
            this.idFacultad=dato;
            this.idEspecialidad=-1;
            this.especialidades=[];
            this.listarEspecialidades(this.idFacultad);
        },
        cambioEspecialidad(dato=1) {
            this.idEspecialidad = dato;
            this.cursos=[];
            this.especialidadSeleccionada=true;
            this.listarCursos(this.idEspecialidad);
        },
        async listarCursos(idEsp) {
            try {
                console.log(idEsp);
                const data = await getCursos(idEsp);
                console.log(data);
                this.cursos = data.data.cursos.map((datas) => ({
                    idCurso: datas.id_curso,
                    codigo: datas.codigo,
                    nombre: datas.nombre,
                    descripcion: datas.descripcion,
                    idEspecialidad:datas.id_especialidad,
                }));
            } catch (err) {
                console.log("Error listar cursos",err);
            }
        },
        async listarEspecialidades(idFacultad) {
            console.log("Entra a listar especialidades");
            let listaEspecialidades = [];
            try {
                const data = await getEspecialidadesPorFacultad(idFacultad);
                console.log(data);
                listaEspecialidades = data.data.especialidades;
                listaEspecialidades.forEach(element => {
                    this.especialidades.push({text:element.nombre, value:element.id_especialidad});
                });
            } catch (err) {
                console.log(err);
            }
        },
        async listarFacultades(){
            let listaFacultades=[];
            try{
                const data=await getFacultades();
                console.log(data);
                listaFacultades=data.data.facultades;
                this.facultades=listaFacultades.map((datas)=>({
                    text:datas.nombre,
                    value:datas.id_facultad,
                }));
            }catch(err){
                console.log(err);
            }
        },
    },
    async created() {
        try{
            let acces = localStorage.getItem('acceso');
            if (!acces) {
                this.$router.push('/login');
            }
            this.acceso = CryptoJS.AES.decrypt(localStorage.getItem('acceso'), 'acceso');
            this.acceso = this.acceso.toString(CryptoJS.enc.Utf8);
            if (this.acceso == 0) {
                this.$router.push('/login');
            } else if (this.acceso < 2) {
                this.$router.push('/home');
            }
            this.id_persona = CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona');
            this.id_persona = this.id_persona.toString(CryptoJS.enc.Utf8);
            let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
            this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
            if(this.acceso==7){
                this.noEsAdmin=false;
                this.$router.push('/home');
                //this.listarFacultades();
            }else{
                this.noEsAdmin=true;
                for(let element of this.datosUsuario.facultades){
                    await this.listarEspecialidades(element.id_facultad);
                }
                this.datosUsuario.especialidaes.forEach(element=>{
                    this.especialidades.push({text:element.nombre, value:element.id_especialidad});
                });
                if(this.especialidades.length===1){
                    this.tieneMasDeUnaEsp=false;
                    this.nombreUnicaEsp=this.especialidades[0].text;
                    this.especialidadSeleccionada=true;
                    this.cambioEspecialidad(this.especialidades[0].value);
                }
            }
        }catch(err){
            
        }
    },
    mounted() {

    },
};
</script>