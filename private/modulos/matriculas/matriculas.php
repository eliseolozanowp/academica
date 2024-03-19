<?php
include('../../Config/Config.php');
extract($_REQUEST);

$matriculas = isset($matriculas) ? $matriculas : '[]';
$accion=$accion ?? '';
$class_matriculas = new matriculas($conexion);
print_r( json_encode($class_matriculas->recibir_datos($matriculas)) );

class matriculas{
    private $datos=[], $db, $respuesta = ['msg'=>'ok'];
    public function __construct($db){
        $this->db = $db;
    }
    public function recibir_datos($matriculas){
        global $accion;
        if($accion==='consultar'){
            return $this->administrar_matriculas();
        }else{
            $this->datos = json_decode($matriculas, true);
            return $this->validar_datos();
        }
    }
    private function validar_datos(){
        if( empty($this->datos['idMatricula']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la ID';
        }
        if( empty($this->datos['alumno']['id']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la Categoria';
        }
        if( empty($this->datos['codigo']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el codigo del producto';
        }
        if( empty($this->datos['ciclo']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el nombre del producto';
        }
        if( empty($this->datos['fechaMatricula']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el nombre del producto';
        }
        return $this->administrar_matriculas();
    }
    private function administrar_matriculas(){
        global $accion;
        if( $this->respuesta['msg'] === 'ok' ){
            if( $accion==='nuevo' ){
                return $this->db->consultas('INSERT INTO matricula VALUES(?,?,?,?,?)',
                $this->datos['idMatricula'],$this->datos['alumno']['id'],$this->datos['codigo'],
                    $this->datos['ciclo'],$this->datos['fechaMatricula']);
            }else if($accion==='modificar' ){
                return $this->db->consultas('UPDATE matricula SET idAlumno=?, codigo=?, ciclo=?, fechaMatricula=? WHERE idMatricula=?',
                $this->datos['alumno']['id'], $this->datos['codigo'],$this->datos['ciclo'],$this->datos['fechaMatricula'], $this->datos['idMatricula']);
            }else if($accion==='eliminar'){
                return $this->db->consultas('DELETE matricula FROM matricula WHERE idMatricula=?',
                $this->datos['idMatricula']);
            }else if($accion==='consultar'){
                $this->db->consultas('
                    SELECT matricula.idMatricula, matricula.idAlumno, matricula.codigo, matricula.ciclo, matricula.fechaMatricula, alumnos.nombre AS nomcat FROM matricula INNER JOIN alumnos ON (matricula.idAlumno = alumnos.idAlumno)
                ');
                return $this->db->obtener_datos();
            }
        }else{
            return $this->respuesta;
        }
    }
}
?>