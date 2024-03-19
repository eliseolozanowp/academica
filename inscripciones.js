Vue.component('v-select-materia', VueSelect.VueSelect);
Vue.component('componente-inscripciones', {
    data() {
        return {
            valor:'',
            inscripciones:[],
            materias:[],
            accion:'nuevo',
            inscripcion:{
                materia:{
                    id:'',
                    label:''
                },
                idInscripcion: new Date().getTime(),
                codigo:'',
                nombre:'',
                marca:'',
                presentacion:'',
                precio:0.0,
            }
        }
    },
    methods:{
        buscarInscripcion(e){
            this.listar();
        },
        async eliminarInscripcion(idInscripcion){
            if( confirm(`Esta seguro de elimina el inscripcion?`) ){
                await db.inscripciones.where("idInscripcion").equals(idInscripcion).delete();
                let respuesta = await fetch(`private/modulos/inscripciones/inscripciones.php?accion=eliminar&inscripciones=${JSON.stringify(this.inscripcion)}`),
                    data = await respuesta.json();
                this.nuevoInscripcion();
                this.listar();
            }
        },
        modificarInscripcion(inscripcion){
            this.accion = 'modificar';
            this.inscripcion = inscripcion;
        },
        async guardarInscripcion(){
            //almacenamiento del objeto inscripciones en indexedDB
            if( this.inscripcion.materia.id=='' ||
                this.inscripcion.materia.label=='' ){
                console.error("Por favor seleccione una materia");
                return;
            }
            await db.inscripciones.bulkPut([{...this.inscripcion}]);
            let respuesta = await fetch(`private/modulos/inscripciones/inscripciones.php?accion=${this.accion}&inscripciones=${JSON.stringify(this.inscripcion)}`),
                data = await respuesta.json();
            this.nuevoInscripcion();
            this.listar();
            
            /*query.onerror = e=>{
                console.error('Error al guardar en inscripciones', e);
                if( e.target.error.message.includes('uniqueness') ){
                    alertify.error(`Error al guardar en inscripciones, codigo ${this.inscripcion.codigo} ya existe`);
                    return;
                }
                alertify.error(`Error al guardar en inscripciones, ${e.target.error.message}`);
            };*/
        },
        nuevoInscripcion(){
            this.accion = 'nuevo';
            this.inscripcion = {
                materia:{
                    id:'',
                    label:''
                },
                idInscripcion: new Date().getTime(),
                codigo:'',
                alumno:''
            }
        },
        async listar(){
            let collections = db.materias.orderBy('nombre');
            this.materias = await collections.toArray();
            this.materias = this.materias.map(materia=>{
                return {
                    id: materia.idMateria,
                    label:materia.nombre
                }
            });
            let collection = db.inscripciones.orderBy('codigo').filter(
                inscripcion=>inscripcion.codigo.includes(this.valor) || 
                    inscripcion.alumno.toLowerCase().includes(this.valor.toLowerCase())
            );
            this.inscripciones = await collection.toArray();
            if( this.inscripciones.length<=0 ){
                let respuesta = await fetch('private/modulos/inscripciones/inscripciones.php?accion=consultar'),
                    data = await respuesta.json();
                this.inscripciones = data.map(inscripcion=>{
                    return {
                        materia:{
                            id:inscripcion.idMateria,
                            label:inscripcion.nomcat
                        }, 
                        idInscripcion : inscripcion.idInscripcion,
                        codigo: inscripcion.codigo,
                        alumno: inscripcion.alumno,
                    }
                });
                db.inscripciones.bulkPut(this.inscripciones);
            }
        }
    },
    template: `
        <div class="row">
            <div class="col col-md-5">
                <div class="card">
                    <div class="card-header text-bg-dark">REGISTRO DE INSCRIPCIONES</div>
                    <div class="catd-body">
                        <form id="frmInscripcion" @reset.prevent.default="nuevoProduto" @submit.prevent.default="guardarInscripcion">
                            <div class="row p-1">
                                <div class="col col-md-2">MATERIA</div>
                                <div class="col col-md-8">
                                    <v-select-materia required v-model="inscripcion.materia" 
                                        :options="materias">Por favor seleccione una materia</v-select-materia>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">CODIGO</div>
                                <div class="col col-md-5">
                                    <input v-model="inscripcion.codigo" required pattern="[0-9]{2,25}" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">ALUMNO</div>
                                <div class="col col-md-10">
                                    <input v-model="inscripcion.alumno" required pattern="^[a-zA-ZáíéóúñÑ]{3,50}([a-zA-ZáíéóúñÑ ]{1,50})$" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col">
                                    <input type="submit" class="btn btn-success" value="GUARDAR"/>
                                    <input type="reset" class="btn btn-warning" value="NUEVO" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col col-md-7">
                <div class="card text-bg-dark">
                    <div class="card-header">LISTADO DE INSCRIPCIONES</div>
                    <div class="card-body">
                        <form id="frmInscripcion">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>BUSCAR</th>
                                        <th colspan="7">
                                            <input placeholder="" type="search" v-model="valor" @keyup="buscarInscripcion" class="form-control">
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>MATERIA</th>
                                        <th>CODIGO</th>
                                        <th>ALUMNO</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr @click="modificarInscripcion(inscripcion)" v-for="inscripcion in inscripciones" :key="inscripcion.idInscripcion">
                                        <td>{{inscripcion.materia.label}}</td>
                                        <td>{{inscripcion.codigo}}</td>
                                        <td>{{inscripcion.alumno}}</td>
                                        <td><button @click.prevent.default="eliminarInscripcion(inscripcion.idInscripcion)" class="btn btn-danger">del</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
});