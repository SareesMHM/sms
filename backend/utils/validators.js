const { body } = require('express-validator');

exports.registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be 3-100 characters'),
  body('email').trim().isEmail().withMessage('Please provide valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('dateOfBirth').isISO8601().withMessage('Valid date required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('schoolName').trim().notEmpty().withMessage('School name required'),
  body('grade').trim().notEmpty().withMessage('Grade required'),
  body('parentName').trim().notEmpty().withMessage('Parent name required'),
  body('parentPhone').matches(/^[0-9]{10}$/).withMessage('Parent phone must be 10 digits'),
  body('parentNIC')
    .matches(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/)
    .withMessage('Invalid NIC format'),
  body('address.number').trim().notEmpty().withMessage('Address number required'),
  body('address.street').trim().notEmpty().withMessage('Street required'),
  body('address.city').trim().notEmpty().withMessage('City required'),
  body('address.district').trim().notEmpty().withMessage('District required'),
  body('address.postalCode').trim().notEmpty().withMessage('Postal code required'),
];

exports.loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];