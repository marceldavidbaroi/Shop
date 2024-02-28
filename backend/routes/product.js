const express = require('express');
const route  = express.Router();

const {
    getProducts,
    newProduct, 
    getSingleProduct,
    updateProduct,
    deleteProduct
} = require('../controller/productController')
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

route.route('/products').get(authorizeRoles('admin'),getProducts);
route.route('/product/:id').get(getSingleProduct);
 

route.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles('admin'), newProduct);
route.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'),updateProduct)
.delete(isAuthenticatedUser, authorizeRoles('admin'),deleteProduct);


module.exports = route;