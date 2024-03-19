var app = new Vue({
    el: '#app',
    data:{
        forms:{
            // producto:{mostrar:false},
            // categoria:{mostrar:false},
            materia:{mostrar:false}, // Agregar materia al objeto forms
            alumno:{mostrar:false}, // Agregar materia al objeto forms
            inscripcion:{mostrar:false}, // Agregar materia al objeto forms
            matricula:{mostrar:false}, // Agregar materia al objeto forms
        }
    },
    methods:{
        abrirFormulario(form){
            this.forms[form].mostrar = !this.forms[form].mostrar;
            this.$refs[form].listar();
        }
    }
});