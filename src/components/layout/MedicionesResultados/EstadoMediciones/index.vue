<template>
    <div class="contenedorPrincipal">
        <div class="resultadosEstudiante">
            <Title texto="Mediciones y Resultados > Estado de las mediciones" :usarBotonAyuda=true urlKey="estadoMediciones"/>
            <br>
            <div class="row">
                <div>
                    <table allign="left" cellpadding="5">
                        <tr>
                            <div class="col sm-12">
                                <td>Especialidad: </td>
                            </div>
                            <td class="col sm-12">
                                <Select
                                    class="selectResultadosEstudiante"
                                    texto="Seleccione una especialidad"
                                    v-on:cambio-seleccion="cambioEspecialidad"
                                    v-bind:items="especialidades"
                                    v-model="especialidadSeleccionada"
                                    :value="especialidadSeleccionada"
                                    v-if="tieneMasDeUnaEsp" 
                                />
                                <p v-if="!tieneMasDeUnaEsp">{{nombreUnicaEsp}}</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <Alert
                :senalAlerta="senalAlerta"
                :textoAlerta="textoAlerta"
                :hayAlert="hayAlert"
            />
            <div class="DataTableEstadoMediciones">
                <DataTableMuestras 
                    :headers="cabeceras"
                    :dataList="muestras"
                    @cambioEstado="enviarEstado"
                    @linkTo="goTo"
                />
            </div>
            <br>
            <div class="row">
                <div class="col sm-5">
                    <BackButton />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { 
    getEspecialidadesPorFacultad, 
    getMuestrasXEspecialidad, 
    cambiarEstadoMuestra 
} from '../../../util/services/index';
import BackButton from '../../../shared/BackButton.vue';
import Select from '../../../shared/Select.vue';
import Title from '../../../shared/Title.vue';
import Alert from '../../../shared/Alert.vue';
import DataTableMuestras from './DataTableMuestras';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'EstadoMediciones',
    components: {
        BackButton,
        Select,
        Title,
        Alert,
        DataTableMuestras,
    },
    data() {
        return {
            especialidades: [], // lista de las especialidades
            id_persona: -1,
            filtros: {
                idEspecialidad: 0,
                idCiclo: -1,
            },
            tieneMasDeUnaEsp: true,
            nombreUnicaEsp: '',
            textoAlerta: "",
            senalAlerta: '',
            hayAlert: false,
            datosUsuario: {},
            acceso: -1,
            cabeceras: [
                    {
                        text: "Espacio de Medición",
                        align: "start",
                        sortable: true,
                        value: "medicion",
                    },
                    { text: "Muestra", value: "muestra" },
                    { text: "Profesores", value: "profesores" },
                    { text: "Estado", value: "estado", sortable: true },
                ],
            muestras: [],
            data: {},
            especialidadSeleccionada: 0,
        };
    },
    methods: {
        goTo(item) {
            this.$router.push({
                name: 'MedicionesDetalle',
                params: {
                    curso: item.medicion,
                    horario: item.muestra,
                    idMuestra: item.idMuestra,
                    idSemestre: this.data.semestre.id_semestre,
                    nombreSemestre: this.data.semestre.nombre,
                    terminar: !item.estado,
                },
            });
        },
        enviarEstado(item){
            cambiarEstadoMuestra(item.idMuestra, !item.estado)
                .catch((e) => {
                    console.error("Error al cambiar los estados:", e);
                    this.manejarAlerta(2, 1);
                }).then(() => {
                    this.manejarAlerta(0,0)
                })
        },
        getProfesores(profesores){
            let profesoresCad = "";
            profesores.forEach((item, index) => {
                if(index)
                    profesoresCad += `, ${item.nombre}`;
                else
                    profesoresCad = item.nombre;
            });
            return profesoresCad;
        },
        cambioEspecialidad(dato=1) {
            this.filtros.idEspecialidad = dato;
            this.manejarPromesa(this.filtros.idEspecialidad);
        },
        cambioSemestre(dato){
            this.filtros.idCiclo=dato;
            this.manejarPromesa(this.filtros.idEspecialidad);
        },
        async manejarPromesa(idEsp) {
            try {
                // obtener las muestras
                getMuestrasXEspecialidad(idEsp).catch((e) => {
                    console.error("Error al obtener las muestras:", e);
                }).then(result => {
                    this.data = result.data;
                    if(this.data.status == "error" && this.data.message == "plan_medicion"){
                        this.manejarAlerta(3, 0);
                        this.muestras = [];
                        return;
                    }
                    // llenar arreglo de muestras
                    this.muestras = this.data.muestrasEvaluacion.map( item => {
                        return {
                            idMuestra: item.idMuestra, 
                            medicion: item.nombreMedicion, 
                            muestra: item.nombreMuestra, 
                            profesores: this.getProfesores(item.profesores), 
                            estado: !item.terminado,
                        }
                    });
                })
            } catch (err) {
                console.error("Error listar mediciones: ", err);
            }
        },
        async listarEspecialidades(idFacultad) {
            let listaEspecialidades = [];
            this.resultadosEstudianteConId=[];
            try {
                const data = await getEspecialidadesPorFacultad(idFacultad);
                //console.log(data);
                listaEspecialidades = data.data.especialidades;
                listaEspecialidades.forEach(element => {
                    this.especialidades.push({text: element.nombre, value: element.id_especialidad});
                });
                this.especialidades.sort((a,b) => a.text.charCodeAt(0) - b.text.charCodeAt(0));
            } catch (err) {
                console.error("Error en el listado de especialidades: ", err);
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se cambió el estado de la medición";
                } else if (accion==1) {//editar
                    this.textoAlerta="Se cambió el estado de la medición";
                } else {//delete
                    this.textoAlerta="Se cambió el estado de la medición";
                }
            } else if (tipo == 2){
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta="No existen mediciones para esta especialidad";
                } else if(accion==1) {//editar
                    this.textoAlerta="Hubo un error al cambiar el estado de la medición";
                } else {//delete
                    this.textoAlerta="Hubo un error al cambiar el estado de la medición";
                }
            } else {
                    this.hayAlert=!this.hayAlert;
                    this.senalAlerta=tipo;
                    if (accion==0) {//registro
                        this.textoAlerta="No existen mediciones para esta especialidad";
                    } else if(accion==1) {//editar
                        this.textoAlerta="Hubo un error al cambiar el estado de la medición";
                    } else {//delete
                        this.textoAlerta="Hubo un error al cambiar el estado de la medición";
                    }
            }
        }
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
            if(this.acceso<7){//no admin
                for(let i of this.datosUsuario.facultades)
                    await this.listarEspecialidades(i.id_facultad);
                this.datosUsuario.especialidaes.forEach(element=>{
                    this.especialidades.push({text:element.nombre, value:element.id_especialidad});
                });
                this.especialidades.sort((a,b) => a.text.charCodeAt(0) - b.text.charCodeAt(0));
                if(this.especialidades.length===1){
                    this.tieneMasDeUnaEsp=false;
                    this.nombreUnicaEsp=this.especialidades[0].text;
                    this.cambioEspecialidad(this.especialidades[0].value);
                }
                // debug
                this.especialidadSeleccionada = this.especialidades[0];
                this.cambioEspecialidad(this.especialidades[0].value);
                this.filtros.idEspecialidad=this.especialidades[0].value;
            }else{//admin
                this.$router.push('/home');
            }
        }catch(err){
            
        }
    },
    mounted() {

    },
};
</script>
<style scoped>
    .selectSemestre{
        width: 8rem !important;
    }
    .filtroEspecialidad{
        width : 100px !important;
    }
</style>
