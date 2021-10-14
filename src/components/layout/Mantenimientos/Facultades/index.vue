<template>
    <div class="contenedorPrincipal">
        <div class="resultadosEstudiante">
            <Title texto="Mantenimientos > Facultades" :usarBotonAyuda=true urlKey="facultades"/>
            <br>
            <div class="DataTableFacultades">
                <DataTableFacultades
                    v-bind:facultades="facultades"
                    v-bind:usuarios1="usuarios"
                    v-bind:noEsAdmin="noEsAdmin"
                    v-bind:cargando="cargando"
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
import { getFacultadUsuario, getPersonas } from '../../../util/services/index';
import BackButton from '../../../shared/BackButton.vue';
import DataTableFacultades from '../Facultades/DataTableFacultades.vue'
import Title from '../../../shared/Title.vue';
import Search from '../../../shared/Search.vue';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'Facultades',
    components: {
        BackButton,
        DataTableFacultades,
        Search,
        Title,
    },
    data() {
        return {
            facultades: [],
            usuarios:[],
            cargando:true,
            datosUsuario:{

            },
            noEsAdmin:false,
            id_persona:-1,
            acceso: -1,
        };
    },
    methods: {
        async listarFacultades() {
            let listaFacultades = [];
            try {
                const data = await getFacultadUsuario();
                listaFacultades = data.data.facultades;
                console.log(data);
                if(this.noEsAdmin){
                    listaFacultades.forEach(element => {
                        if(this.id_persona==element.id_coordinador){
                            this.facultades.push({
                                idFacultad: element.id_facultad,
                                codigo: element.codigo,
                                nombre: element.nombre,
                                descripcion: element.descripcion,
                                usuario: {
                                    id_persona:element.id_coordinador,
                                    nombre:''
                                },
                            })
                        }
                    });
                }else{
                    this.facultades = listaFacultades.map((datas) => ({
                        idFacultad: datas.id_facultad,
                        codigo: datas.codigo,
                        nombre: datas.nombre,
                        descripcion: datas.descripcion,
                        usuario: {
                            id_persona:datas.id_coordinador,
                            nombre:''
                        },
                    }));
                }
                for (let i=0;i<this.facultades.length;i++) {
                    for (let j=0;j<this.usuarios.length;j++) {
                        if (this.usuarios[j].value.id_persona==this.facultades[i].usuario.id_persona) {
                            this.facultades[i].usuario.nombre=this.usuarios[j].text;
                        }
                    }
                }                
            } catch (err) {
                alert('Error al obtener las facultades: '+err);
            }
        },
        async listarUsuarios() {
            let listaUsuarios = [];
            try {
                const data = await getPersonas();
                console.log(data);
                listaUsuarios = data.data.personas;
                listaUsuarios.forEach(datas => {
                    if((datas.rol === 4) || (datas.rol === 5) || (datas.rol === 6)){
                        this.usuarios.push({
                            value: {id_persona:datas.id_persona, nombre: datas.nombre},
                            text: datas.nombre,
                        })
                    }
                });
                console.log(this.usuarios);
            } catch (err) {
                console.log('Error al obtener los usuarios, se muestra una lista por defecto '+err);
            }
        }
    },
    async created() {
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
        if(this.acceso<7){
            this.noEsAdmin=true;
        }
        await this.listarUsuarios();
        await this.listarFacultades();
        this.cargando=false;
    },
    mounted() {

    },
};
</script>
<style scoped>
    
</style>
