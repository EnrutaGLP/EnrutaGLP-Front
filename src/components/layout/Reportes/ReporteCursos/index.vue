<template>
    <div class="contenedorPrincipal">
        <div class="reporte-cursos">
            <Title texto = "Reportes > Reporte de Cursos"/>
            <br/>
            <div class = "filtros">
                <p class="texto-filtro">Filtrar por:</p>
                <Select class = "class-select"
                    texto = "Resultado del Estudiante"
                    :items="getRE()"
                    :value="getRE()[0] != null ? getRE()[0] : 0"
                    @cambio-seleccion="filtrarRE"
                />
                <Select class = "class-select"
                    texto = "Curso"
                >
                </Select>
                <Select class = "class-select"
                    texto = "Horario"
                >
                </Select>
            </div>
            <div class = "botones">
                <EditableButton @onClick="descargarExcel" text="Descargar" icon="mdi-download"/>
            </div>
            <div class="information">
                <ReporteDataTableCursos
                    :columnas = "columns"
                    :filas = "rows"
                />
            </div>
            <div class="buttons">
                <BackButton/>
            </div>
        </div>
    </div>
</template>

<script>
    import Title from '../../../shared/Title';
    import Select from '../../../shared/Select';
    import BackButton from '../../../shared/BackButton';
    import EditableButton from '../../../shared/EditableButton';
    import ReporteDataTableCursos from '../../../shared/ReporteDataTableCursos';

    export default {
        name: 'ReporteCursos',
        components: {
            Title,
            Select,
            BackButton,
            EditableButton,
            ReporteDataTableCursos,
        },
        data: function(){
            return {
                columns: [
                    { text: 'Resultado del Estudiante', value:'', class:'grey lighten-3' },
                    { text: 'Indicador de Desempeño', value:'', class:'grey lighten-3' },
                    { text: 'Curso', value:'', class:'grey lighten-3' },
                    { text: 'Horario', value:'', class:'grey lighten-3' },
                    { text: 'Alumno', value:'', class:'grey lighten-3' },
                    { text: 'Código', value:'', class:'grey lighten-3' },
                    { text: 'Nota', value:'', class:'grey lighten-3' },
                ],
                auxrows: [
                    { RE: "RE1", ID:'QUI118', curso:'Quimica1', horario: "H123", nota: "4" },
                    { RE: "RE2", ID:'INF238', curso:'Sistemas Operativos', horario: "H123", nota: "4" },
                    { RE: "RE3", ID:'INF245', curso:'Ingenieria de Software', horario: "H123", nota: "4" },
                ],
                rows: [],
                success: false,
                acceso: -1,
            };
        },
        methods: {
            getRE() {
                let RE = [];
                RE.push({text:"Mostrar todos", value: null });
                this.auxrows.forEach((i) => { RE.push({text: i.RE, value: i}); });
                return RE;
            },
            filtrarRE(data) {
                if(data === null){
                    this.rows = this.auxrows;
                    return;
                }
                this.rows = this.auxrows.filter((item) => item.RE == data.RE);
            },
        },
        created: function () {
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
                this.rows = this.auxrows;
            }catch(err){

            }
        }
    }
</script>

<style scoped>
    .reporte-cursos {
        display: flex;
        flex-direction: column;
    }

    .buttons {
        padding-top: 15px;
    }

    .filtros {
        display: flex;
        align-items: left;
        justify-content: left;
    }

    .texto-filtro {
        margin-right: 15px;
    }

    .class-select{
        width: 5rem !important;
        padding-left: 15px !important;
        padding-right: 15px !important;
    }

    .botones {
        display: flex;
        justify-content: flex-end;
        padding-right: 15px;
        margin-bottom: 15px;
    }
</style>
