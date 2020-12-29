const Proyecto = require('../models/Proyecto');
const { validationResult} = require('express-validator');


exports.crearProyecto = async(req, res) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()})
    }

    try {
        // Crear un nuevo Proyecto
        const proyecto = new Proyecto(req.body);

        // Guardar el creador via JWT
        proyecto.creador = req.usuario.id;

        // Guardamos el Proyecto

        proyecto.save();
        res.json(proyecto);
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un Error en el Servidor');
    }
}

// Obtinene todos los proyectos del usuario actual

exports.obtenerProyectos = async(req, res) => {
    try {
        const proyectos = await Proyecto.find({ creador: req.usuario.id }).sort({creado: -1});
        res.json({ proyectos });    
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

// Actualiza un Proyecto

exports.actualizarProyecto = async (req, res) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()})
    }

    // Extraer la información del Proyecto
    const { nombre } = req.body;
    const nuevoProyecto = {};
    if (nombre){
        nuevoProyecto.nombre = nombre;
    } 

    try {

        // Revisar el Id
        let proyecto = await Proyecto.findById(req.params.id);

        // Si el Proyecto existe o no
        if(!proyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }

        // Verificar el creador del Proyecto
        if  (proyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No autorizado'});
        }

        // Actualizar el proyecto
        proyecto = await Proyecto.findByIdAndUpdate({ _id: req.params.id }, { $set: nuevoProyecto}, {new: true});

        res.json({proyecto});

        
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el Servidor');
    }
}


// Elimina un proyecto por su id

exports.eliminarProyecto = async (req, res) => {

    try {
        // Revisar el Id
        let proyecto = await Proyecto.findById(req.params.id);

        // Si el Proyecto existe o no
        if(!proyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }

        // Verificar el creador del Proyecto
        if  (proyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No autorizado'});
        }

        // Eliminar el Proyecto
        await Proyecto.findOneAndRemove({ _id : req.params.id });
        res.json({msg: 'Proyecto Eliminado'});


    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el Servidor');
            
    }
   

}