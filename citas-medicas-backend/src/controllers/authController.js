const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/sequelize');

const authController = {
  async register(req, res) {
    let transaction;
    
    try {
      const {
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        tipoDocumento,
        numeroDocumento,
        caracterVerificador,
        fechaNacimiento,
        email,
        celular,
        password,
        rol = 'paciente'
      } = req.body;

      console.log('📝 Registro recibido:', { 
        nombres, 
        apellidoPaterno,
        email, 
        numeroDocumento 
      });

      // Validar campos obligatorios
      if (!nombres || !apellidoPaterno || !email || !password || !numeroDocumento) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: nombres, apellido paterno, email, password, número documento'
        });
      }

      transaction = await sequelize.transaction();

      // Verificar si el usuario ya existe
      const [existingUsers] = await sequelize.query(
        `SELECT id FROM usuarios WHERE email = ? OR numero_documento = ?`,
        {
          replacements: [email, numeroDocumento],
          transaction
        }
      );

      if (existingUsers.length > 0) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con este email o número de documento'
        });
      }

      // Crear nuevo usuario
      const [result] = await sequelize.query(
        `INSERT INTO usuarios (
          nombres, apellidoPaterno, apellidoMaterno, tipoDocumento, 
          numero_documento, caracterVerificador, fechaNacimiento, 
          email, celular, password, rol, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        {
          replacements: [
            nombres,
            apellidoPaterno,
            apellidoMaterno || '',
            tipoDocumento || 'dni',
            numeroDocumento,
            caracterVerificador || null,
            fechaNacimiento || null,
            email,
            celular || '',
            password,
            rol
          ],
          transaction
        }
      );

      // Obtener usuario creado
      const [newUsers] = await sequelize.query(
        `SELECT id, nombres, apellidoPaterno, apellidoMaterno, email, rol, 
                tipoDocumento, numero_documento, celular, fechaRegistro 
         FROM usuarios WHERE id = LAST_INSERT_ID()`,
        { transaction }
      );

      const newUser = newUsers[0];

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          rol: newUser.rol 
        },
        process.env.JWT_SECRET || 'fallback-secret-key-2024',
        { expiresIn: '24h' }
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          nombres: newUser.nombres,
          apellidoPaterno: newUser.apellidoPaterno,
          apellidoMaterno: newUser.apellidoMaterno,
          email: newUser.email,
          rol: newUser.rol,
          tipoDocumento: newUser.tipoDocumento,
          numeroDocumento: newUser.numero_documento,
          celular: newUser.celular,
          fechaRegistro: newUser.fechaRegistro
        },
        token
      });

      console.log('✅ Usuario registrado exitosamente:', newUser.email);

    } catch (error) {
      if (transaction) await transaction.rollback();
      
      console.error('💥 Error en registro:', error);
      
      // Manejo específico de errores de base de datos
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({
          success: false,
          message: `Error de base de datos: Columna no encontrada - ${error.sqlMessage}`
        });
      }

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'El email o número de documento ya existe'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al registrar usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('🔐 Intentando login para:', email);

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario en la base de datos
      const [users] = await sequelize.query(
        `SELECT * FROM usuarios WHERE email = ? AND is_active = TRUE`,
        { replacements: [email] }
      );

      const user = users[0];
      
      if (!user) {
        console.log('❌ Usuario no encontrado:', email);
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      // Comparar contraseñas (en texto plano por ahora - mejorar con bcrypt después)
      const isPasswordValid = (password === user.password);
      
      if (!isPasswordValid) {
        console.log('❌ Contraseña incorrecta para:', email);
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          rol: user.rol 
        },
        process.env.JWT_SECRET || 'fallback-secret-key-2024',
        { expiresIn: '24h' }
      );

      console.log('✅ Login exitoso para:', email);

      res.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          nombres: user.nombres,
          apellidoPaterno: user.apellidoPaterno,
          apellidoMaterno: user.apellidoMaterno,
          email: user.email,
          rol: user.rol,
          tipoDocumento: user.tipoDocumento,
          numeroDocumento: user.numero_documento,
          celular: user.celular
        },
        token
      });

    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante el login'
      });
    }
  },

  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-2024');
      
      // Buscar usuario en base de datos
      const [users] = await sequelize.query(
        `SELECT id, nombres, apellidoPaterno, apellidoMaterno, email, rol, 
                tipoDocumento, numero_documento, celular 
         FROM usuarios WHERE id = ? AND is_active = TRUE`,
        { replacements: [decoded.userId] }
      );

      const user = users[0];

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          nombres: user.nombres,
          apellidoPaterno: user.apellidoPaterno,
          apellidoMaterno: user.apellidoMaterno,
          email: user.email,
          rol: user.rol,
          tipoDocumento: user.tipoDocumento,
          numeroDocumento: user.numero_documento,
          celular: user.celular
        }
      });

    } catch (error) {
      console.error('❌ Error verificando token:', error);
      res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  }
};

module.exports = authController;