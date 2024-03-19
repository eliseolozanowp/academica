Vue.component('componente-alumnos', {
    data() {
        return {
            valor:'',
            alumnos:[],
            accion:'nuevo',
            alumno:{
                idAlumno: new Date().getTime(),
                codigo:'',
                nombre:'',
                municipio:'',
                departamento:'',
                telefono:'',
                fechaN:'',
                sexo:''
            }
        }
    },
    methods:{
        buscarAlumno(e){
            this.listar();
        },
        async eliminarAlumno(idAlumno){
            if( confirm(`¿Está seguro de eliminar el alumno?`) ){
                this.accion='eliminar';
                await db.alumnos.where("idAlumno").equals(idAlumno).delete();
                let respuesta = await fetch(`private/modulos/alumnos/alumnos.php?accion=eliminar&alumnos=${JSON.stringify(this.alumno)}`),
                    data = await respuesta.json();
                this.nuevoAlumno();
                this.listar();
            }
        },
        modificarAlumno(alumno){
            this.accion = 'modificar';
            this.alumno = alumno;
        },
        async guardarAlumno(){
            // Almacenamiento del objeto alumno en indexedDB
            await db.alumnos.bulkPut([{...this.alumno}]);
            let respuesta = await fetch(`private/modulos/alumnos/alumnos.php?accion=${this.accion}&alumnos=${JSON.stringify(this.alumno)}`),
                data = await respuesta.json();
            this.nuevoAlumno();
            this.listar();
        },
        nuevoAlumno(){
            this.accion = 'nuevo';
            this.alumno = {
                idAlumno: new Date().getTime(),
                codigo:'',
                nombre:'',
                municipio:'',
                departamento:'',
                telefono:'',
                fechaN:'',
                sexo:''
            }
        },
        async listar(){
            let collections = db.alumnos.orderBy('codigo')
            .filter(alumno => alumno.codigo.includes(this.valor) ||
                alumno.nombre.toLowerCase().includes(this.valor.toLowerCase()));
            this.alumnos = await collections.toArray();
            if( this.alumnos.length <= 0 ){
                let respuesta = await fetch('private/modulos/alumnos/alumnos.php?accion=consultar'),
                    data = await respuesta.json();
                this.alumnos = data;
                db.alumnos.bulkPut(data);
            }
        }
    },
    template: `
        <div class="row">
            <div class="col col-md-12">
                <div class="card text-bg-dark">
                    <div class="card-header">REGISTRO DE ALUMNOS</div>
                    <div class="card-body">
                        <div class="row p-1">
                            <div class="col col-md-2">CÓDIGO</div>
                            <div class="col col-md-3">
                                <input v-model="alumno.codigo" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">NOMBRE</div>
                            <div class="col col-md-5">
                                <input v-model="alumno.nombre" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">MUNICIPIO</div>
                            <div class="col col-md-5">
                                <input v-model="alumno.municipio" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">DEPARTAMENTO</div>
                            <div class="col col-md-5">
                                <input v-model="alumno.departamento" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">TELEFONO</div>
                            <div class="col col-md-5">
                                <input v-model="alumno.telefono" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">FECHA DE NACIMIENTO</div>
                            <div class="col col-md-5">
                                <input v-model="alumno.fechaN" type="date" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">SEXO</div>
                            <div class="col col-md-3">
                                <select v-model="alumno.sexo" name="sexo" id="sexo" class="form-control">
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                            </div>
                        </div>
                        <!-- Agregar más campos de alumno según necesidad -->
                        <div class="row p-1">
                            <div class="col">
                                <button @click.prevent.default="guardarAlumno" class="btn btn-success">GUARDAR</button>
                                <button @click.prevent.default="nuevoAlumno" class="btn btn-warning">NUEVO</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col col-md-12 mt-3">
                <div class="card text-bg-dark">
                    <div class="card-header">LISTADO DE ALUMNOS</div>
                    <div class="card-body">
                        <form id="frmAlumno">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>BUSCAR</th>
                                        <th colspan="5">
                                            <input placeholder="" type="search" v-model="valor" @keyup="buscarAlumno" class="form-control">
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th>NOMBRE</th>
                                        <th>MUNICIPIO</th>
                                        <th>DEPARTAMENO</th>
                                        <th>TELEFONO</th>
                                        <th>FECHA DE NACIMIENTO</th>
                                        <th>SEXO</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr @click="modificarAlumno(alumno)" v-for="alumno in alumnos" :key="alumno.idAlumno">
                                        <td>{{alumno.codigo}}</td>
                                        <td>{{alumno.nombre}}</td>
                                        <td>{{alumno.municipio}}</td>
                                        <td>{{alumno.departamento}}</td>
                                        <td>{{alumno.telefono}}</td>
                                        <td>{{alumno.fechaN}}</td>
                                        <td>{{alumno.sexo}}</td>
                                        <!-- Agregar más columnas de datos de alumno según necesidad -->
                                        <td><button @click.prevent.default="eliminarAlumno(alumno.idAlumno)" class="btn btn-danger">Eliminar</button></td>
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
s