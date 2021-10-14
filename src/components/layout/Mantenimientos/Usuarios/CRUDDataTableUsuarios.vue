<template>
  	<div>
	  	<div class="row">
			<div class="col-sm">
				<v-text-field
					class="filterCadena"
					label="Ingrese el nombre o correo a buscar"
					v-model="busqueda"
					append-icon="mdi-magnify"
					outlined
				>
				</v-text-field>
			</div>
			<div class="inputFile">
				<ModalInputFileUsuarios
					:disabled="false"
					v-on:importarDatos="subirUsuarios"	
					:cargando="cargaUsuarios"
				/>
			</div>
	  	</div>
    	<Alert
      		v-bind:senalAlerta="senalAlerta"
      		v-bind:textoAlerta="textoAlerta"
      		v-bind:hayAlert="hayAlert"
    	/>
    	<v-data-table
      		:headers="headers"
	      	:items="items"
    	  	:class="{ ocultar: selected === true, noOcultar: selected === false }"
      		:search="busqueda"
      		sort-by="codigo"
	      	class="elevation-1"
    	    :loading="cargando3"
        	loading-text="Cargando usuarios"
    	>
    	  	<template v-slot:top>
	        	<v-toolbar flat>
          			<v-spacer></v-spacer>
          			<v-dialog v-model="dialog" max-width="700px">
            			<template v-slot:activator="{ on, attrs }">
          					<v-btn
            					color="var(--turquoise)"
            					dark
				                class="mb-2"
    	        			    v-bind="attrs"
					            v-on="on"
                				v-if="acceso != 1"
            				><v-icon left>mdi-account-plus-outline</v-icon>
            					Nuevo Usuario
          					</v-btn>
        	    		</template>
    	        		<v-card>
	            			<v-card-title>
            					<span class="headline">{{ formTitle }}</span>
								<v-progress-circular class="loading" :value="40" indeterminate v-if="cargando2"></v-progress-circular>
          					</v-card-title>
              				<v-stepper v-model="e1">
            	    			<v-stepper-header>
        	        				<v-divider></v-divider>
		              				<v-stepper-step :complete="e1 > 1" step="1">
	    	            				Datos Básicos
    	          					</v-stepper-step>
        	      					<v-divider></v-divider>
                	  				<v-stepper-step :complete="e1 > 2" step="2">
                    					Asignación de Funciones
                  					</v-stepper-step>
                					<v-divider></v-divider>
	        	    			</v-stepper-header>
    		        			<v-stepper-items>
    		          				<v-stepper-content step="1">
	        	        				<v-card>
                	      					<v-card-text>
                    	    					<v-text-field
													class="nombreInput"
													v-model="editedItem.nombres"
													label="Nombres y Apellidos"
													pattern="[a-zA-Z]+"
													type="text"
            	    					    		maxlength="50"
													counter
													onkeypress="return ((event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122) || (event.charCode == 32))"
												></v-text-field>
					        	            	<v-text-field
            	        	      					class="correoInput"
								                    v-model="editedItem.correo"
                    		    					label="Correo"
            	            					></v-text-field>
						    	                <v-text-field
	                		    	  				class="codigoInput"
    	                  							v-model="editedItem.codigo"
				                    	      		label="Código PUCP"
					  								maxlength="8"
					  								counter
							  						type="number"
							  						oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
        	                					></v-text-field>
            	        	    				<!--<v-text-field
                		          					class="passwordInput"
                	    	    					v-model="editedItem.password"
            	              						v-show="flagVisible"
        	              							label="Contraseña"
    	                  							type="password"
	                    						></v-text-field>-->
                  							</v-card-text>
	                      					<v-card-actions>
    	                    					<v-spacer></v-spacer>
        	                						<v-btn outlined color="primary" @click="e1 = 2">
            	        	    						Siguiente<v-icon right>mdi-arrow-right</v-icon>
                		    						</v-btn>
                	      					</v-card-actions>
            	    					</v-card>
        	      					</v-stepper-content>
    	          					<v-stepper-content step="2">
	                					<v-card>
                      						<v-card-text>
                        						<v-select
                          							class="funcionInput"
	                    	    					v-model="editedItem.funcion"
    	            	      						:items="funciones"
        	    	          						label="Funcion(es)"
            		          						outlined
						                          	multiple
                	      							chips
                    	  							hint="Elija una o más funciones"
                      								persistent-hint
                    	    					></v-select>
                	        					<p v-if="combinacionInvalidad" class="colorError">La combinación de roles no es válida</p>
            	          					</v-card-text>
	    	                  				<v-card-actions class="botones2">
    		                					<v-spacer></v-spacer>
	        	            					<v-btn outlined color="primary" @click="e1 = 1">
            	          							<v-icon left>mdi-arrow-left</v-icon>Atrás
                        						</v-btn>
                	    						<v-btn color="var(--coral)" outlined @click="close"
                    	  							><v-icon left>mdi-close</v-icon>
                      								Cancelar
                        						</v-btn>
                    	    					<v-btn color="var(--turquoise)" outlined @click="save" :disabled="cargando2"
                	          						><v-icon left>mdi-check</v-icon>
            	              						Guardar
	    	                    				</v-btn>
    		                				</v-card-actions>
	        	        				</v-card>
            	  					</v-stepper-content>
            					</v-stepper-items>
            	  			</v-stepper>
        	    		</v-card>
    	      		</v-dialog>
	          		<v-dialog v-model="dialogDelete" max-width="500px">
        				<v-card>
              				<v-card-title class="textoModalDelete"
            	    			>{{textoElimina}}</v-card-title
        	      			>
    	        			<v-card-actions>
	            				<v-spacer></v-spacer>
            					<v-btn
									color="var(--coral)"
									outlined
									@click="closeDelete"
									v-if="!esUsuarioAdmin"
        	      				><v-icon left>mdi-close</v-icon>
    	        					Cancelar
	                			</v-btn>
                				<v-btn
                	  				color="var(--turquoise)"
            	    				outlined
        	      					@click="deleteItemConfirm"
									v-if="!esUsuarioAdmin"
	                  				><v-icon left>mdi-check</v-icon>
	                					Ok
                				</v-btn>
                				<v-spacer></v-spacer>
              				</v-card-actions>
            			</v-card>
        			</v-dialog>
    			</v-toolbar>
    	  	</template>
	      	<template v-slot:[`item.actions`]="{ item }">
        		<v-icon class="mr-2" @click="editItem(item)" v-if="!noEsAdmin"> mdi-pencil </v-icon>
        		<v-icon @click="deleteItem(item)" v-if="!noEsAdmin"> mdi-delete </v-icon>
    	  	</template>
	    </v-data-table>
  	</div>
</template>

<script>
import { getPersonas, setNuevoUsuario1Rol, updateUsuarioRol, deleteUsuarioRol, enviarCorreo} from "../../../util/services/index";
import Alert from '../../../shared/Alert.vue';
import * as CryptoJS from 'crypto-js';
import ModalInputFileUsuarios from "../../../shared/ModalInputFileUsuarios.vue";
import { registrarUsuarios } from "../../../util/services/index";

export default {
	props: ['selected', 'cargando']
  	,
	components: {
        Alert,
		ModalInputFileUsuarios,
    },
  	data: () => ({
	    acceso: -1,
    	dialog: false,
	    e1: 1,
    	dialogDelete: false,    
    	headers: [
		  	{ text: "Nombre(s)", value: "nombres" },
      		{ text: "Correo", value: "correo" },
      		{ text: "Funcion(es)", value: "funcionStr", filterable: false },
			{ text: "Código", value: "codigo"},
      		{ text: "Actions", value: "actions", sortable: false, filterable: false },
    	],
    	items: [],
    	busqueda: "",
    	funciones: [
      		"Responsable de Medición",
      		"Director de Carrera",
      		"Asistente de Mejora Continua",
      		"Coord. de Facultad",
      		//"Asistente de Coord. de Facultad",
      		"Administrador",
    	],
    	flagVisible: false,
    	editedIndex: -1,
    	editedItem: {
      		id_persona: -1,
      		nombres: "",
      		correo: "",
      		codigo: "",
      		funcion: [],
			funcionStr:'',
      		password: "",
      		idUsuario: -1,
      		rol:-1,
    	},
    	defaultItem: {
      		id_persona: -1,
      		nombres: "",
      		correo: "",
      		codigo: "",
      		funcion: [],
			funcionStr:'',
      		password: "",
      		idUsuario: -1,
      		rol:-1,
    	},
    	combinacionInvalidad:false,
		noEsAdmin:false,
    	textoAlerta:"",
    	senalAlerta:'',
    	hayAlert:false,
		rules:{
			required: value => !!value || 'No puede dejar campos vacíos',
			max: v=>v.length<=8 || 'Máximo 8 caracteres',
		},
        cargaUsuarios: false,
		textoElimina:'¿Está seguro que desea eliminar este Usuario del sistema?',
		esUsuarioAdmin:false,
		cargando2:false,
		cargando3:false,
  	}),

  	computed: {
	    formTitle() {
      		if (this.editedIndex === -1) {
        		this.flagVisible = true;
        		return "Nuevo Usuario";
      		} else {
        		this.flagVisible = false;
        		return "Editar Usuario";
      		}
    	},
  	},
  	watch: {
	    dialog(val) {
    		val || this.close();
    	},
    	dialogDelete(val) {
      		val || this.closeDelete();
    	},
  	},
  	methods: {
		async subirUsuarios(listaUsuarios){
            this.cargaUsuarios = true;
			this.cargando3=true;
            console.log("axiosCall",listaUsuarios);
            for(let l of listaUsuarios) l.codigo = l.codigo.toString();
            let data = registrarUsuarios(listaUsuarios.map((item) => {
				return {
					"email" : item.correo,
				 	"codigo_pucp" : item.codigo,
				 	"nombre": item.nombres + ' ' + item.apellidos,
				 	"funcion": "Responsable de Medición",
				 	"rol": 1, 
				 	"password": item.codigo + item.apellidos,
					 "id_especialidades": [],
				}
			})).then((result) => {
				this.items = [];
				this.showUsuarios();
				this.manejarAlerta(0,3);
            }).catch((e) => {
                console.log(e);
            }).finally(() => {
				this.cargaUsuarios = false
				this.cargando3=false;
			});

			console.log("varIngresada",data);
        },
    	editItem(item) {
      		this.editedIndex = this.items.indexOf(item);
      		this.editedItem = { ...item };
			if(this.editedItem.correo=="admin@pucp.pe"){
				this.close();
			}else{
				this.dialog = true;
			}
    	},

    	deleteItem(item) {
      		this.editedIndex = this.items.indexOf(item);
      		this.editedItem = { ...item };
			console.log(this.editedItem);
			if(this.editedItem.correo=="admin@pucp.pe"){
				this.esUsuarioAdmin=true;
				this.textoElimina="No puede eliminar al Administrador Jefe";
				setTimeout(()=>{
					this.closeDelete();
					this.esUsuarioAdmin=false;
					this.textoElimina="¿Está seguro que desea eliminar este Usuario del sistema?";
				},1500);
			}
      		this.dialogDelete = true;
    	},
    	deleteItemConfirm() {      
      		this.eliminarUsuario(this.editedItem.id_persona);
    	},
    	close() {
      		this.e1 = 1;
      		this.dialog = false;
			//this.$refs.form.resetValidation();
      		this.$nextTick(() => {
        		this.editedItem = { ...this.defaultItem };
        		this.editedIndex = -1;
      		});
    	},
    	closeDelete() {
      		this.dialogDelete = false;
			//this.$refs.form.resetValidation();
      		this.$nextTick(() => {
        		this.editedItem = { ...this.defaultItem };
        		this.editedIndex = -1;
      		});
    	},
    	async eliminarUsuario(idPersona){
            try{
                let data=await deleteUsuarioRol(idPersona);
                console.log(data);
				console.log(data.data.status);
				console.log(this.editedIndex);
				if (data.data.status != 'error') {
      				this.items.splice(this.editedIndex, 1);
					this.closeDelete();
					this.manejarAlerta(0, 2);
				}
				else{
					this.closeDelete();
					this.manejarAlerta(1, 2);
				}
            }catch(err){
				this.closeDelete();
                this.manejarAlerta(1,2);
            }
        },
    	async save() {
      		if (this.editedIndex > -1) {
				this.cargando2=true;
        		let sum = 0;
        		let combinacionProhibida=0;
				let combinacionProhibida2=0;
				let combinacionProhibida3=0;
        		if(this.editedItem.funcion.includes("Responsable de Medición")){
          			sum += 1;
          			combinacionProhibida++;
        		}
        		if(this.editedItem.funcion.includes("Director de Carrera")){
	          		sum += 2;
    			    combinacionProhibida++;
					combinacionProhibida2++;
        		}
        		if(this.editedItem.funcion.includes("Asistente de Mejora Continua")){
          			sum += 2;
					combinacionProhibida2++;
					combinacionProhibida3++;
        		}
        		if(this.editedItem.funcion.includes("Coord. de Facultad")){
          			sum += 4;
          			combinacionProhibida++;
					combinacionProhibida3++;
        		}
        		if(this.editedItem.funcion.includes("Administrador")){
          			sum += 7;
        		}
        		if(sum>7 || combinacionProhibida>2 || combinacionProhibida2>1 || combinacionProhibida3>1){
          			this.combinacionInvalidad=true;
          			setTimeout(()=>{
            			this.combinacionInvalidad=false;
          			},2000);
					return;
		        }
        		console.log(this.editedItem);
				console.log("Suma de roles: "+sum);
				if(this.editedItem.funcion.length>1){
					this.editedItem.funcionStr=this.editedItem.funcion[0]+","+this.editedItem.funcion[1];
				}else{
					this.editedItem.funcionStr=this.editedItem.funcion[0];
				}
        		try{
            		const dato = await updateUsuarioRol(
            			this.editedItem.id_persona,
	            		this.editedItem.correo.trim(),
    	        		"1234",
        	    		this.editedItem.codigo,
            			this.editedItem.nombres,
            			this.editedItem.funcionStr,
            			sum
          			);

	          		console.log(dato);
          			if (dato.data.status !== "success") {
						this.cargando2=false;
            			this.manejarAlerta(1,1,dato.data.message);
          			}else{//funciono
            			this.editedItem.rol=sum;
            			Object.assign(this.items[this.editedIndex], this.editedItem);
						this.cargando2=false;
            			this.manejarAlerta(0,1);
          			}
        		}catch(err){
					console.log(err);
					this.cargando2=false;
          			this.manejarAlerta(1,1);
        		}
        
      		} else {//agregar
			  	this.cargando2=true;
        		let sum = 0;
        		let combinacionProhibida=0;
				let combinacionProhibida2=0;
				let combinacionProhibida3=0;
        		if(this.editedItem.funcion.includes("Responsable de Medición")){
          			sum += 1;
          			combinacionProhibida++;
        		}
        		if(this.editedItem.funcion.includes("Director de Carrera")){
          			sum += 2;
          			combinacionProhibida++;
					combinacionProhibida2++;
        		}
        		if(this.editedItem.funcion.includes("Asistente de Mejora Continua")){
          			sum += 2;
					combinacionProhibida2++;
					combinacionProhibida3++;
        		}
        		if(this.editedItem.funcion.includes("Coord. de Facultad")){
          			sum += 4;
          			combinacionProhibida++;
					combinacionProhibida3++;
        		}
        		if(this.editedItem.funcion.includes("Administrador")){
          			sum += 7;
        		}
        		if(sum>7 || combinacionProhibida>2 || combinacionProhibida2>1 || combinacionProhibida3>1){
          			this.combinacionInvalidad=true;
          			setTimeout(()=>{
            			this.combinacionInvalidad=false;
          			},2000);
          			return;
        		}
        		this.editedItem.rol=sum;
				if(this.editedItem.funcion.length>1){
					this.editedItem.funcionStr=this.editedItem.funcion[0]+","+this.editedItem.funcion[1];
				}else{
					this.editedItem.funcionStr=this.editedItem.funcion[0];
				}
        		console.log(this.editedItem);
				let correoAux=this.editedItem.correo.trim();
        		try{
					console.log(this.editedItem);
            		const dato = await setNuevoUsuario1Rol(
            			correoAux,
            			"abcd1234",
            			this.editedItem.codigo,
            			this.editedItem.nombres,
            			this.editedItem.funcionStr,
            			sum
          			);
          			console.log(dato);
          			if (dato.data.status !== "success") {
						this.cargando2=false;
            			this.manejarAlerta(1,0,dato.data.message);
          			}else{//funciono
					  	console.log("entra");
            			this.editedItem.id_persona=dato.data.id_persona;
            			this.editedItem.idUsuario=dato.data.id_usuario;
			            this.editedIndex = -1;
            			let aux=this.editedItem;
            			setTimeout(()=>{
              				this.items.push(aux);
            			},0);
						console.log(correoAux);
						const dataa=await enviarCorreo(correoAux);
						console.log(dataa);
						this.cargando2=false;
            			this.manejarAlerta(0,0);
          			}
        		}catch(err){
					this.cargando2=false;
          			this.manejarAlerta(1,0);
        		}
      		}
      		this.close();
    	},
		generarContrasenaAleatoria(tamano){
			let caracteres="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			let contrasena="";
			for(let i=0;i<tamano;i++){
				contrasena+=caracteres.charAt(Math.floor(Math.random()*caracteres.length));
			}
			return contrasena;
		},
    	async showUsuarios() {
      		try {
        		let res = await getPersonas();
        		console.log(res);
        		let datos = res.data.personas,
        			p,acces=this.acceso;
        		if(acces==5 || acces==6){
          			acces=4;
        		}else if(acces==7){
          			acces=8;
        		}else if(acces==2 || acces==3){
					if(!this.datosUsuario.datos[0].personas.funcion.includes("Asistente")){
						acces=4;
					}
				}
        		for (p of datos) {
          			var objPer = {};
          			if(p.rol<acces){
            			objPer.id_persona=p.id_persona;
            			objPer.nombres = p.nombre;
            			objPer.correo = p.email;
						let funciones=p.funcion.split(',');
						//console.log(funciones);
						objPer.funcion=funciones;
						if(funciones.length>1){
							objPer.funcionStr=funciones[0]+", "+funciones[1];
						}else{
							objPer.funcionStr=funciones[0];
						}
            			objPer.codigo = p.codigo_pucp;
            			objPer.idUsuario = -1;
            			objPer.rol=p.rol;
						this.items.push(objPer);
          			}
        		}
				this.cargando3=false;
      		} catch (err) {
				console.log(err);
				this.cargando3=false;
			}
    	},
    	manejarAlerta(tipo, accion, mensaje="") {
            if (tipo == 0) {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if(accion==0) {//registro
                    this.textoAlerta="Se registró exitosamente el usuario";
                } else if (accion==1) {//editar
                    this.textoAlerta="Se editó exitosamente el usuario";
                } else if (accion==3){
					this.textoAlerta="Se registró masivamente los usuarios"
				}else {//delete
                    this.textoAlerta="Se eliminó exitosamente el usuario";
                }
            } else {
                this.hayAlert=!this.hayAlert;
                this.senalAlerta=tipo;
                if (accion==0) {//registro
					if(mensaje===""){
						this.textoAlerta="Hubo un error al registrar el usuario";	
					}else{
						this.textoAlerta=mensaje;
					}
                } else if(accion==1) {//editar
                    if(mensaje===""){
						this.textoAlerta="Hubo un error al editar el usuario";	
					}else{
						this.textoAlerta=mensaje;
					}
                } else {//delete
                    this.textoAlerta="Hubo un error al eliminar el usuario";
                }
            }
        },
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
		this.cargando3=true;
    	let jsonStrDesencriptado=CryptoJS.AES.decrypt(localStorage.getItem('json'),'json');
    	this.datosUsuario=JSON.parse(jsonStrDesencriptado.toString(CryptoJS.enc.Utf8));
    	console.log(this.acceso);
		if(this.acceso<7){
			this.noEsAdmin=true;
			this.headers= [
		  		{ text: "Nombre(s)", value: "nombres" },
      			{ text: "Correo", value: "correo" },
    	  		{ text: "Funcion(es)", value: "funcionStr", filterable: false },
				{ text: "Código", value: "codigo"},
			];
		}
    	if(this.acceso > 1){
			if(this.datosUsuario.datos[0].personas.funcion.includes("Asistente")){
				this.funciones = [
	        		"Responsable de Medición",
      			];
			}else{
				this.funciones = [
        			"Responsable de Medición",
					"Asistente de Mejora Continua",
      			];
			}
    	}
    	if(this.acceso > 3){
      		this.funciones = [
        		"Responsable de Medición",
        		"Director de Carrera",
				"Asistente de Mejora Continua",
      		];
    	}
    	if(this.acceso > 6){
      		this.funciones = [
        		"Responsable de Medición",
        		"Director de Carrera",
				"Asistente de Mejora Continua",
        		"Coord. de Facultad",
        		"Administrador",
      		];
    	}
    	this.showUsuarios();
  	},
};
</script>

<style scoped>
	.botones2 {
  		display: flex;
  		justify-content: space-between;
	}

	.ocultar {
  		visibility: hidden;
	}
	.noOcultar {
  		visibility: inherit;
	}
	.filterCadena {
  		display: flex;
  		margin-left: 20px;
  		width: 500px;
	}
	.nombreInput {
  		display: flex;
  		margin-left: 10px;
  		margin-right: 20px;
  		width: 500px;
	}
	.correoInput {
  		display: flex;
  		margin-left: 10px;
  		margin-right: 20px;
  		width: 500px;
	}
	.codigoInput {
  		display: flex;
  		margin-left: 10px;
  		margin-right: 20px;
  		width: 300px;
	}
	.funcionInput {
  		display: flex;
  		margin-left: 10px;
  		margin-right: 20px;
  		width: 600px;
	}
	.passwordInput {
  		display: flex;
  		margin-left: 10px;
  		margin-right: 20px;
  		width: 400px;
	}
	.colorError{
  		color: red;
	}
	.textoModalDelete{
  		white-space: normal;
	}
	.inputFile{
		padding-top: 1rem;
		padding-right: 1rem;
		display: flex;
		justify-content: space-between;
	}
	.loading {
		float: right;
    	margin: 7.5px;
	}
</style>
