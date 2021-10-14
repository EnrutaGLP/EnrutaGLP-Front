<template>
    <div class="contenedorPrincipal">
        <div class="especialidades">
            <Title :texto="informacionFacultad" :usarBotonAyuda=true urlKey="facultades"/>
            <br>
            <div class="row">
                <div>
                    <table align="left">
                        <tr>
                            <div class="col sm-12">
                                <Search
                                    v-on:change="cambioEspecialidad"
                                    texto="Escriba la especialidad que desea buscar"
                                />
                            </div>
                        </tr>
                    </table>
                </div>
            </div>
            <v-alert
                :value="hayAlerta"
                v-bind:type="tipoAlerta"
                transition="scale-transition"
            >
                {{textoAlerta}}
            </v-alert>
            <div class="DataTableEspecialidades">
                <DataTableEspecialidades
                    v-bind:especialidades="especialidades"
                    v-bind:usuarios1="usuarios"
                    v-bind:asistentes="asistentesPosibles"
                    v-bind:seSelecciono="seSelecciono"
                    v-bind:idFacultad="idFacultad"
                    v-bind:noEsAdmin="noEsAdmin"
                    v-on:alerta="manejarAlerta"
                    v-bind:busqueda="especialidadBuscada"
                    v-bind:cargando="cargando"
                    v-bind:esCordEsp="esCordEsp"
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
import { getEspecialidadesPorFacultad, getPersonas, listarAsistentes } from '../../../../util/services/index';
import BackButton from '../../../../shared/BackButton.vue';
import DataTableEspecialidades from '../Especialidades/DataTableEspecialidades.vue'
import Title from '../../../../shared/Title.vue';
import Search from '../../../../shared/Search.vue';
import * as CryptoJS from 'crypto-js';

export default {
    name: 'Especialidades',
    components: {
        BackButton,
        DataTableEspecialidades,
        Search,
        Title,
    },
    data() {
        return {
            especialidades: [],
            usuarios: [],
            asistentes:[],
            asistentesPosibles:[],
            asistentesUsados:[],
            seSelecciono: true,
            tipoAlerta: 'success',
            textoAlerta: '',
            especialidadBuscada: '',
            hayAlerta: false,
            cargando:true,
            idFacultad: -1,
            codigoFacultad: '',
            nombreFacultad: '',
            descripcionFacultad: '',
            informacionFacultad:'',
            usuarioFacultad: {

            },
            datosUsuario:{

            },
            noEsAdmin:false,
            noEsCordFac:false,
            esCordEsp:false,
            id_persona: -1,
            acceso: -1,
        };
    },
    methods: {
        cambioEspecialidad(dato) {
            this.especialidadBuscada=dato;
            console.log(this.especialidadBuscada);
            if (this.seSelecciono) {
                this.seSelecciono = false;
            }
            this.buscarEspecialidad(this.especialidadBuscada);
        },
        buscarEspecialidad(dato) {
            this.especialidadBuscada=dato;
        },
        async listarEspecialidades(idFacultad) {
            console.log(idFacultad);
            let listaEspecialidades = [];
            try {
                if(this.noEsAdmin && this.noEsCordFac){
                    console.log("es cord esp");
                    this.datosUsuario.especialidaes.forEach(element => {
                        this.especialidades.push({
                            idFacultad:element.id_facultad,
                            idEspecialidad:element.id_especialidad,
                            codigo:element.codigo,
                            nombre:element.nombre,
                            descripcion:element.descripcion,
                            usuario:{
                                id_persona:element.id_coordinador,
                                nombre:this.datosUsuario.datos[0].personas.nombre,
                            },
                            asistente:{
                                id_persona:element.id_asistente,
                                nombre:'',
                            }
                        })
                    });
                    this.especialidades.forEach(element=>{
                        for(let i=0;i<this.asistentes.length;i++){
                            if(element.asistente.id_persona==this.asistentes[i].value.id_persona){
                                element.asistente.nombre=this.asistentes[i].text;
                                break;
                            }
                        }
                    });
                }else{//es admin
                    const data = await getEspecialidadesPorFacultad(idFacultad);
                    listaEspecialidades = data.data.especialidades;
                    console.log(data);
                    this.especialidades = listaEspecialidades.map((datas) => ({
                        idEspecialidad: datas.id_especialidad,
                        codigo: datas.codigo,
                        nombre: datas.nombre,
                        descripcion: datas.descripcion,
                        usuario: {
                            id_persona:datas.id_coordinador,
                            nombre:'',
                        },
                        asistente:{
                            id_persona:datas.id_asistente,
                            nombre:'',
                        }
                    }));
                    for (let i=0;i<this.especialidades.length;i++) {
                        for (let j=0;j<this.usuarios.length;j++) {
                            if (this.usuarios[j].value.id_persona==this.especialidades[i].usuario.id_persona) {
                                this.especialidades[i].usuario.nombre=this.usuarios[j].text;
                                break;
                            }
                        }
                        for(let k=0;k<this.asistentes.length;k++){
                            if(this.especialidades[i].asistente.id_persona==this.asistentes[k].value.id_persona){
                                this.especialidades[i].asistente.nombre=this.asistentes[k].text;
                                break;
                            }
                        }
                    }
                    console.log(this.especialidades);
                }
            } catch (err) {
                console.log('Error al obtener las especialidades: '+err);
            }
        },
        manejarAlerta(tipo, accion, mensaje="") {
            if (tipo==0) {
                this.tipoAlerta="success";
                if (accion==0) {//registro
                    if(mensaje!=""){
                        this.textoAlerta=mensaje;
                    }else{
                        this.textoAlerta="Se registró exitosamente la especialidad";
                    }
                } else if (accion==1) {//editar
                    if(mensaje!=""){
                        this.textoAlerta=mensaje;
                    }else{
                        this.textoAlerta="Se editó exitosamente la especialidad";
                    }
                } else {//delete
                    this.textoAlerta="Se eliminó exitosamente la especialidad";
                }
            }else{
                this.tipoAlerta="error";
                if(accion==0) {//registro
                    if(mensaje!=""){
                        this.textoAlerta=mensaje;
                    }else{
                        this.textoAlerta="Hubo un error al registrar la especialidad";
                    }
                }else if(accion==1) {//editar
                    if(mensaje!=""){
                        this.textoAlerta=mensaje;
                    }else{
                        this.textoAlerta="Hubo un error al editar la especialidad";
                    }
                }else {//delete
                    this.textoAlerta="Hubo un error al eliminar la especialidad";
                }
            }
            this.hayAlerta=true;
            setTimeout(()=>{
                this.hayAlerta=false;
            },2000)
        },
        async listarUsuarios() {
            let listaUsuarios = [];
            try {
                const data = await getPersonas();
                console.log(data);
                listaUsuarios = data.data.personas;
                listaUsuarios.forEach(datas => {
                    if((datas.rol === 2) || (datas.rol === 3) || (datas.rol === 6)){
                        if(datas.rol!=6 && datas.funcion.includes("Asistente")){
                            this.asistentes.push({
                                value: {id_persona:datas.id_persona, nombre: datas.nombre},
                                text: datas.nombre,
                            })  
                        }else{
                            this.usuarios.push({
                                value: {id_persona:datas.id_persona, nombre: datas.nombre},
                                text: datas.nombre,
                            })
                        }
                    }
                });
                console.log(this.usuarios);
                console.log(this.asistentes);
                this.asistentes.forEach(element=>{
                    this.asistentesPosibles.push(element);
                });
                /*this.asistentesUsados.forEach(element=>{
                    for(let i=0;i<this.asistentesPosibles.length;i++){
                        if(element==this.asistentesPosibles[i].value.id_persona){
                            this.asistentesPosibles.splice(i,1);
                            break;
                        }
                    }
                });
                console.log(this.asistentes);
                console.log(this.asistentesPosibles);*/
            } catch (err) {
                console.log(err);
            }
        },
        async listarAsistent(){
            try{
                let data=await listarAsistentes();
                console.log(data);
                this.asistentesUsados=data.data.id_asistentes;
            }catch(err){
                console.log(err);
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

        if(this.$route.params.id===undefined){
            if(this.acceso<7){//cord de esp
                this.noEsAdmin=true;
                if(this.acceso<4){
                    this.noEsCordFac=true;
                }
                //this.idFacultad=1;
                this.codigoFacultad="Especialidades";
                this.nombreFacultad="";
                this.informacionFacultad=`${this.codigoFacultad} ${this.nombreFacultad}`;
            }else{//admin
                this.idFacultad=sessionStorage.idFac;
                this.codigoFacultad=sessionStorage.codigoFac;
                this.nombreFacultad=sessionStorage.nombreFac;
                this.descripcionFacultad=sessionStorage.descripcionFac;
                this.usuarioFacultad=sessionStorage.usuarioFac;
                this.informacionFacultad=`Mantenimientos > Facultades > (${this.codigoFacultad}) ${this.nombreFacultad}`;
            }
        }
        if(this.$route.params.id!==undefined){//admin
            if(this.acceso<4){
                this.noEsAdmin=false;
            }
            sessionStorage.idFac=this.$route.params.id;
            sessionStorage.codigoFac=this.$route.params.codigo;
            sessionStorage.nombreFac=this.$route.params.nombre;
            sessionStorage.descripcionFac=this.$route.params.descripcion;
            sessionStorage.usuarioFac=this.$route.params.usuario;
            this.idFacultad=this.$route.params.id;
            this.codigoFacultad=this.$route.params.codigo;
            this.nombreFacultad=this.$route.params.nombre;
            this.descripcionFacultad=this.$route.params.descripcion;
            this.usuarioFacultad=this.$route.params.usuario;
            this.informacionFacultad=`Mantenimientos > Facultades > (${this.codigoFacultad}) ${this.nombreFacultad}`;
        }
        this.id_persona=CryptoJS.AES.decrypt(localStorage.getItem('id_persona'), 'id_persona');
        this.id_persona=this.id_persona.toString(CryptoJS.enc.Utf8);
        let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
        this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
        if(this.acceso==2 || this.acceso==3){
            if(!this.datosUsuario.datos[0].personas.funcion.includes("Asistente")){
                this.esCordEsp=true;
            }
        }
        console.log(this.esCordEsp);
        //await this.listarAsistent();
        await this.listarUsuarios();
        await this.listarEspecialidades(this.idFacultad);
        this.cargando=false;
    },
    mounted() {

    },
};
</script>
<style scoped>
    
</style>
