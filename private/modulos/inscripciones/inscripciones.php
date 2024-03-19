<?php
include('../../Config/Config.php');
extract($_REQUEST);

$inscripciones = isset($inscripciones) ? $inscripciones : '[]';
$accion=$accion ?? '';
$class_inscripciones = new inscripciones($conexion);
print_r( json_encode($class_inscripciones->recibir_datos($inscripciones)) );

class inscripciones{
    private $datos=[], $db, $respuesta = ['msg'=>'ok'];
    public function __construct($db){
        $this->db = $db;
    }
    public function recibir_datos($inscripciones){
        global $accion;
        if($accion==='consultar'){
            return $this->administrar_inscripciones();
        }else{
            $this->datos = json_decode($inscripciones, true);
            return $this->validar_datos();
        }
    }
    private function validar_datos(){
        if( empty($this->datos['idInscripcion']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la ID';
        }
        if( empty($this->datos['materia']['id']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la Categoria';
        }
        if( empty($this->datos['codigo']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el codigo del producto';
        }
        if( empty($this->datos['alumno']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el nombre del producto';
        }
        return $this->administrar_inscripciones();
    }
    private function administrar_inscripciones(){
        global $accion;
        if( $this->respuesta['msg'] === 'ok' ){
            if( $accion==='nuevo' ){
                return $this->db->consultas('INSERT INTO inscripciones VALUES(?,?,?,?)',
                $this->datos['idInscripcion'],$this->datos['materia']['id'],$this->datos['codigo'],
                    $this->datos['alumno']);
            }else if($accion==='modificar' ){
                return $this->db->consultas('UPDATE inscripciones SET idMateria=?, codigo=?, alumno=? WHERE idInscripcion=?',
                $this->datos['materia']['id'], $this->datos['codigo'],$this->datos['alumno'], $this->datos['idInscripcion']);
            }else if($accion==='eliminar'){
                return $this->db->consultas('DELETE inscripciones FROM inscripciones WHERE idInscripcion=?',
                $this->datos['idInscripcion']);
            }else if($accion==='consultar'){
                $this->db->consultas('
                    SELECT inscripciones.idInscripcion, inscripciones.idMateria, inscripciones.codigo, inscripciones.alumno, materias.nombre AS nomcat FROM inscripciones INNER JOIN materias ON (inscripciones.idMateria = materias.idMateria)
                ');
                return $this->db->obtener_datos();
            }
        }else{
            return $this->respuesta;
        }
    }
}
?>