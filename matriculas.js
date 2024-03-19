Vue.component('v-select-alumno', VueSelect.VueSelect);
Vue.component('componente-matriculas', {
    data() {
        return {
            valor:'',
            matriculas:[],
            alumnos:[],
            accion:'nuevo',
            matricula:{
                alumno:{
                    id:'',
                    label:''
                },
                idMatricula: new Date().getTime(),
                codigo:'',
                ciclo:'',
                fechaMatricula:''
            }
        }
    },
    methods:{
        buscarMatricula(e){
            this.listar();
        },
        async eliminarMatricula(idMatricula){
            if( confirm(`Esta seguro de elimina la matricula?`) ){
                await db.matriculas.where("idMatricula").equals(idMatricula).delete();
                let respuesta = await fetch(`private/modulos/matriculas/matriculas.php?accion=eliminar&matriculas=${JSON.stringify(this.matricula)}`),
                    data = await respuesta.json();
                this.nuevoMatricula();
                this.listar();
            }
        },
        modificarMatricula(matricula){
            this.accion = 'modificar';
            this.matricula = matricula;
        },
        async guardarMatricula(){
            //almacenamiento del objeto matriculas en indexedDB
            if( this.matricula.alumno.id=='' ||
                this.matricula.alumno.label=='' ){
                console.error("Por favor seleccione una alumno");
                return;
            }
            await db.matriculas.bulkPut([{...this.matricula}]);
            let respuesta = await fetch(`private/modulos/matriculas/matriculas.php?accion=${this.accion}&matriculas=${JSON.stringify(this.matricula)}`),
                data = await respuesta.json();
            this.nuevoMatricula();
            this.listar();
            
            /*query.onerror = e=>{
                console.error('Error al guardar en matriculas', e);
                if( e.target.error.message.includes('uniqueness') ){
                    alertify.error(`Error al guardar en matriculas, codigo ${this.matricula.codigo} ya existe`);
                    return;
                }
                alertify.error(`Error al guardar en matriculas, ${e.target.error.message}`);
            };*/
        },
        nuevoMatricula(){
            this.accion = 'nuevo';
            this.matricula = {
                alumno:{
                    id:'',
                    label:''
                },
                idMatricula: new Date().getTime(),
                codigo:'',
                alumno:''
            }
        },
        async listar(){
            let collections = db.alumnos.orderBy('nombre');
            this.alumnos = await collections.toArray();
            this.alumnos = this.alumnos.map(alumno=>{
                return {
                    id: alumno.idAlumno,
                    label:alumno.nombre
                }
            });
            let collection = db.matriculas.orderBy('codigo').filter(
                matricula=>matricula.codigo.includes(this.valor) || 
                    matricula.alumno.toLowerCase().includes(this.valor.toLowerCase())
            );
            this.matriculas = await collection.toArray();
            if( this.matriculas.length<=0 ){
                let respuesta = await fetch('private/modulos/matriculas/matriculas.php?accion=consultar'),
                    data = await respuesta.json();
                this.matriculas = data.map(matricula=>{
                    return {
                        alumno:{
                            id:matricula.idAlumno,
                            label:matricula.nomcat
                        }, 
                        idMatricula : matricula.idMatricula,
                        codigo: matricula.codigo,
                        alumno: matricula.alumno,
                    }
                });
                db.matriculas.bulkPut(this.matriculas);
            }
        }
    },
    template: `
        <div class="row">
            <div class="col col-md-5">
                <div class="card">
                    <div class="card-header text-bg-dark">REGISTRO DE MATRICULAS</div>
                    <div class="catd-body">
                        <form id="frmMatricula" @reset.prevent.default="nuevoMatricula" @submit.prevent.default="guardarMatricula">
                            <div class="row p-1">
                                <div class="col col-md-2">ALUMNO</div>
                                <div class="col col-md-8">
                                    <v-select-alumno required v-model="matricula.alumno" 
                                        :options="alumnos">Por favor seleccione un alumno</v-select-alumno>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">CODIGO</div>
                                <div class="col col-md-5">
                                    <input v-model="matricula.codigo" required pattern="[0-9]{2,25}" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">CICLO</div>
                                <div class="col col-md-10">
                                    <input v-model="matricula.ciclo" required type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">FECHA DE MATRICULA</div>
                                <div class="col col-md-5">
                                    <input v-model="matricula.fechaMatricula" type="date" class="form-control">
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
                    <div class="card-header">LISTADO DE MATRICULAS</div>
                    <div class="card-body">
                        <form id="frmMatricula">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>BUSCAR</th>
                                        <th colspan="7">
                                            <input placeholder="" type="search" v-model="valor" @keyup="buscarMatricula" class="form-control">
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>ALUMNO</th>
                                        <th>CODIGO</th>
                                        <th>CICLO</th>
                                        <th>FECHA</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr @click="modificarMatricula(matricula)" v-for="matricula in matriculas" :key="matricula.idMatricula">
                                        <td>{{matricula.alumno.label}}</td>
                                        <td>{{matricula.codigo}}</td>
                                        <td>{{matricula.ciclo}}</td>
                                        <td>{{matricula.fechaMatricula}}</td>
                                        <td><button @click.prevent.default="eliminarMatricula(matricula.idMatricula)" class="btn btn-danger">del</button></td>
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