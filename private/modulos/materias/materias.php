<?php
include('../../Config/Config.php');
extract($_REQUEST);

$materias = isset($materias) ? $materias : '[]';
$accion = $accion ?? '';
$class_materias = new materias($conexion);
print_r(json_encode($class_materias->recibir_datos($materias)));

class materias{
    private $datos=[], $db, $respuesta = ['msg'=>'ok'];
    public function __construct($db){
        $this->db = $db;
    }
    public function recibir_datos($materias){
        global $accion;
        if($accion === 'consultar'){
            return $this->administrar_materias();
        }else{
            $this->datos = json_decode($materias, true);
            return $this->validar_datos();
        }
    }
    private function validar_datos(){
        if(empty($this->datos['idMateria'])){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la ID';
        }
        if(empty($this->datos['codigo'])){
            $this->respuesta['msg'] = 'Por favor ingrese el código de la materia';
        }
        if(empty($this->datos['nombre'])){
            $this->respuesta['msg'] = 'Por favor ingrese el nombre de la materia';
        }
        return $this->administrar_materias();
    }
    private function administrar_materias(){
        global $accion;
        if($this->respuesta['msg'] === 'ok'){
            if($accion === 'nuevo'){
                return $this->db->consultas('INSERT INTO materias VALUES(?,?,?)',
                    $this->datos['idMateria'], $this->datos['codigo'], $this->datos['nombre']);
            }else if($accion === 'modificar'){
                return $this->db->consultas('UPDATE materias SET codigo=?, nombre=? WHERE idMateria=?',
                    $this->datos['codigo'], $this->datos['nombre'], $this->datos['idMateria']);
            }else if($accion === 'eliminar'){
                return $this->db->consultas('DELETE FROM materias WHERE idMateria=?', $this->datos['idMateria']);
            }else if($accion === 'consultar'){
                $this->db->consultas('SELECT * FROM materias');
                return $this->db->obtener_datos();
            }
        }else{
            return $this->respuesta;
        }
    }
}
?>
