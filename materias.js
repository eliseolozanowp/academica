Vue.component('componente-materias', {
    data() {
        return {
            valor:'',
            materias:[],
            accion:'nuevo',
            materia:{
                idMateria: new Date().getTime(),
                codigo:'',
                nombre:'',
            }
        }
    },
    methods:{
        buscarMateria(e){
            this.listar();
        },
        async eliminarMateria(idMateria){
            if( confirm(`¿Estás seguro de eliminar la materia?`) ){
                this.accion='eliminar';
                await db.materias.where("idMateria").equals(idMateria).delete();
                let respuesta = await fetch(`private/modulos/materias/materias.php?accion=eliminar&materias=${JSON.stringify(this.materia)}`),
                    data = await respuesta.json();
                this.nuevaMateria();
                this.listar();
            }
        },
        modificarMateria(materia){
            this.accion = 'modificar';
            this.materia = materia;
        },
        async guardarMateria(){
            // Almacenamiento del objeto materia en indexedDB
            await db.materias.bulkPut([{...this.materia}]);
            let respuesta = await fetch(`private/modulos/materias/materias.php?accion=${this.accion}&materias=${JSON.stringify(this.materia)}`),
                data = await respuesta.json();
            this.nuevaMateria();
            this.listar();
        },
        nuevaMateria(){
            this.accion = 'nuevo';
            this.materia = {
                idMateria: new Date().getTime(),
                codigo:'',
                nombre:'',
            }
        },
        async listar(){
            let collections = db.materias.orderBy('codigo')
            .filter(materia=>materia.codigo.includes(this.valor) ||
                materia.nombre.toLowerCase().includes(this.valor.toLowerCase()));
            this.materias = await collections.toArray();
            if( this.materias.length<=0 ){
                let respuesta = await fetch('private/modulos/materias/materias.php?accion=consultar'),
                    data = await respuesta.json();
                this.materias = data;
                db.materias.bulkPut(data);
            }
        }
    },
    template: `
        <div class="row">
            <div class="col col-md-6">
                <div class="card text-bg-dark">
                    <div class="card-header">REGISTRO DE MATERIAS</div>
                    <div class="catd-body">
                        <div class="row p-1">
                            <div class="col col-md-2">CODIGO</div>
                            <div class="col col-md-3">
                                <input v-model="materia.codigo" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">NOMBRE</div>
                            <div class="col col-md-5">
                                <input v-model="materia.nombre" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col">
                                <button @click.prevent.default="guardarMateria" class="btn btn-success">GUARDAR</button>
                                <button @click.prevent.default="nuevaMateria" class="btn btn-warning">NUEVO</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col col-md-6">
                <div class="card text-bg-dark">
                    <div class="card-header">LISTADO DE MATERIAS</div>
                    <div class="card-body">
                        <form id="frmMateria">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>BUSCAR</th>
                                        <th colspan="5">
                                            <input placeholder="codigo, nombre" type="search" v-model="valor" @keyup="buscarMateria" class="form-control">
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>CODIGO</th>
                                        <th>NOMBRE</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr @click="modificarMateria(materia)" v-for="materia in materias" :key="materia.idMateria">
                                        <td>{{materia.codigo}}</td>
                                        <td>{{materia.nombre}}</td>
                                        <td><button @click.prevent.default="eliminarMateria(materia.idMateria)" class="btn btn-danger">del</button></td>
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
