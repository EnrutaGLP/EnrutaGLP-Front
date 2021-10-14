<template>
    <div class="contenedorPrincipal">
        <div class="resultadosEstudiante">
            <Title texto="Pedidos"/>
            <br>
            <div class="row">
                <div>
                    <table allign="left" cellpadding="1">
                        <tr>
                            <td class="col sm-12">
                                <v-text-field
                                    class="filterCadena"
                                    label="Buscar por código de pedido, por RUC de cliente o por su razón social"
                                    v-model="busqueda"
                                    append-icon="mdi-magnify"
                                    outlined
                                >
                                </v-text-field>
                            </td>
                            
                        </tr>
                    </table>
                </div>
            </div>
            <Alert
                v-bind:senalAlerta="senalAlerta"
                v-bind:textoAlerta="textoAlerta"
                v-bind:hayAlert="hayAlert"
            />
            <div>
                <DataTablePedido
                    v-bind:pedidos="pedidos"
                    v-on:alerta="manejarAlerta"
                    v-bind:busqueda="busqueda"
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
import { getPedidos } from '../../../util/services/index';
import BackButton from '../../../shared/BackButton.vue';
import DataTablePedido from '../../../shared/DataTablePedido.vue';
import Title from '../../../shared/Title.vue';
import Alert from '../../../shared/Alert.vue';


export default {
    name: 'ResultadosEstudiante',
    components: {
        BackButton,
        DataTablePedido,
        Title,
        Alert,
    },
    data() {
        return {
            pedidos:[],
            
            textoAlerta:"",
            senalAlerta:'',
            hayAlert:false,
            cargando:true,

            busqueda:"",
            acceso:-1,
        };
    },
    methods: {
        async listarPedidos() {
            try {
                const data = await getPedidos();
                console.log(data);
                this.pedidos = data.data.data.map((datas) => ({
                    idPedido: datas.id,
                    codigo: datas.codigo,
                    razonSocial:datas.cliente,
                    glp:datas.cantidadGLP,
                    posX:datas.ubicacionX,
                    posY:datas.ubicacionY,
                    fechaHora:datas.fechaLimite,
                    estado:datas.estado.nombre,
                    posiciones: "(" + datas.pos_x + "," + datas.pos_y + ")",
                }));
                this.cargando=false;
            } catch (err) {
                this.pedidos=[
                    {idPedido: 1, codigo:"G-12231",razonSocial:"Cliente 1",glp:150,posX:10,posY:10,fechaHora:"10/08/2021-09:00",estado:"Entregado", posiciones:"(10,10)"},
                    {idPedido: 2, codigo:"G-12232",razonSocial:"Cliente 2",glp:13,posX:70,posY:30,fechaHora:"11/08/2021-09:00",estado:"Pendiente", posiciones:"(70,30)"},
                    {idPedido: 3, codigo:"G-12233",razonSocial:"Cliente 3",glp:140,posX:60,posY:40,fechaHora:"11/08/2021-19:00",estado:"Entregado", posiciones:"(60,40)"},
                    {idPedido: 4, codigo:"G-12234",razonSocial:"Cliente 4",glp:150,posX:50,posY:50,fechaHora:"12/08/2021-09:00",estado:"Entregado", posiciones:"(50,50)"},
                    {idPedido: 5, codigo:"G-12235",razonSocial:"Cliente 5",glp:110,posX:40,posY:60,fechaHora:"13/08/2021-09:00",estado:"Pendiente", posiciones:"(40,60)"},
                    {idPedido: 6, codigo:"G-12236",razonSocial:"Cliente 6",glp:160,posX:30,posY:70,fechaHora:"10/08/2021-01:00",estado:"En camino", posiciones:"(30,70)"},
                    {idPedido: 7, codigo:"G-12237",razonSocial:"Cliente 7",glp:10,posX:20,posY:80,fechaHora:"10/08/2021-02:00",estado:"Pendiente", posiciones:"(20,80)"},
                ];
                this.cargando=false;
            }
        },
        manejarAlerta(tipo, accion) {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se registró exitosamente el pedido";
                } else if (accion==1) {//editar
                    this.textoAlerta="Se editó exitosamente el pedido";
                } else {//delete
                    this.textoAlerta="Se eliminó exitosamente el pedido";
                }
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
                    this.textoAlerta='Hubo un error al registrar el pedido';
                } else if(accion==1) {//editar
                    this.textoAlerta="Hubo un error al editar el pedido";
                } else {//delete
                    this.textoAlerta="Hubo un error al eliminar el pedido";
                }
            }
        }
    },
    async created() {
        this.cargando=true;
        this.listarPedidos();
    },
};
</script>
<style scoped>
    .filterCadena {
  		display: flex;
  		width: 700px !important;
	}
</style>
