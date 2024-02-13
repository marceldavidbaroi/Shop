const express = require('express');
const route  = express.Router();

const {
    getProducts,
    newProduct, 
    getSingleProduct,
    updateProduct,
    deleteProduct
} = require('../controller/productController')

route.route('/products').get(getProducts);
route.route('/product/:id').get(getSingleProduct);
 

route.route('/admin/product/new').post(newProduct);
route.route('/admin/product/:id').put(updateProduct).delete(deleteProduct);


module.exports = route;