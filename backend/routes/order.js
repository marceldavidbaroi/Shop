const express = require('express')
const router = express.Router()

const { 
    newOrder,
    getSingleorder,
    myOrder,
    allOrder,
    updateOrder,
    deleteOrder
} = require('../controller/orderController')
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/order/new').post(isAuthenticatedUser, newOrder)

router.route('/order/:id').get(isAuthenticatedUser, getSingleorder)
router.route('/orders/me').get(isAuthenticatedUser, myOrder)
router.route('/admin/orders').get(isAuthenticatedUser,authorizeRoles('admin'), allOrder)
router.route('/admin/order/:id')
.get(isAuthenticatedUser,authorizeRoles('admin'), updateOrder)
.delete(isAuthenticatedUser,authorizeRoles('admin'), deleteOrder)

module.exports = router
