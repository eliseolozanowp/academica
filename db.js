var db;
const funcdb = ()=>{
    db = new Dexie("db_sistema");
    db.version(1).stores({
        materias:'idMateria,codigo,nombre',
        alumnos:'idAlumno,codigo,nombre,municipio,departameno,sexo',
        inscripciones:'idInscripcion,codigo,alumno,materia',
        matriculas:'idMatricula,codigo,ciclo'
      });
};
funcdb();