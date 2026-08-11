const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const imageFileFilter = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes.'));
  }
};

/**
 * Crea una instancia de multer con almacenamiento en disco dentro de
 * `uploads/<subfolder>`. Permite reusar el mismo filtro/límite de tamaño
 * para distintos recursos (perfiles, lugares, hoteles) sin repetir código.
 */
const createUploader = (subfolder) => {
  const uploadDir = path.resolve(__dirname, '../../uploads', subfolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname) || '.jpg';
      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter,
  });
};

// Instancias ya listas para los recursos existentes.
const upload = createUploader('profiles'); // foto de perfil / avatar
const placesUpload = createUploader('places');
const hotelsUpload = createUploader('hotels');

const toPublicUrl = (filePath) => {
  const projectRoot = path.resolve(__dirname, '../..');
  const relativePath = path.relative(projectRoot, filePath).split(path.sep).join('/');
  return `/${relativePath}`;
};

module.exports = { upload, placesUpload, hotelsUpload, createUploader, toPublicUrl };
