<?php
include('../../Config/Config.php');
extract($_REQUEST);

$alumnos = isset($alumnos) ? $alumnos : '[]';
$accion = $accion ?? '';
$class_alumnos = new Alumnos($conexion);
print_r(json_encode($class_alumnos->recibir_datos($alumnos)));

class Alumnos {
    private $datos = [], $db, $respuesta = ['msg' => 'ok'];

    public function __construct($db) {
        $this->db = $db;
    }

    public function recibir_datos($alumnos) {
        global $accion;
        if ($accion === 'consultar') {
            return $this->administrar_alumnos();
        } else {
            $this->datos = json_decode($alumnos, true);
            return $this->validar_datos();
        }
    }

    private function validar_datos() {
        if (empty($this->datos['idAlumno'])) {
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la ID';
        }
        if (empty($this->datos['codigo'])) {
            $this->respuesta['msg'] = 'Por favor ingrese el código del alumno';
        }
        if (empty($this->datos['nombre'])) {
            $this->respuesta['msg'] = 'Por favor ingrese el nombre del alumno';
        }
        // Agrega aquí la validación para otros campos de alumno si es necesario
        return $this->administrar_alumnos();
    }

    private function administrar_alumnos() {
        global $accion;
        if ($this->respuesta['msg'] === 'ok') {
            if ($accion === 'nuevo') {
                return $this->db->consultas('INSERT INTO alumnos VALUES(?,?,?,?,?,?,?,?)',
                    $this->datos['idAlumno'], $this->datos['codigo'], $this->datos['nombre'],
                    $this->datos['municipio'], $this->datos['departamento'], $this->datos['telefono'],
                    $this->datos['fechaN'], $this->datos['sexo']);
            } else if ($accion === 'modificar') {
                return $this->db->consultas('UPDATE alumnos SET codigo=?, nombre=?, municipio=?, departamento=?, telefono=?, fechaN=?, sexo=? WHERE idAlumno=?',
                    $this->datos['codigo'], $this->datos['nombre'], $this->datos['municipio'],
                    $this->datos['departamento'], $this->datos['telefono'], $this->datos['fechaN'],
                    $this->datos['sexo'], $this->datos['idAlumno']);
            } else if ($accion === 'eliminar') {
                return $this->db->consultas('DELETE FROM alumnos WHERE idAlumno=?', $this->datos['idAlumno']);
            } else if ($accion === 'consultar') {
                $this->db->consultas('SELECT * FROM alumnos');
                return $this->db->obtener_datos();
            }
        } else {
            return $this->respuesta;
        }
    }
}
?>
