const Order = require('../models/order');
const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

//create a new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async(req, res, next) => {
    const {orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

//get single order => /api/v1/order/:id
exports.getSingleorder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate('use', 'name email');
    if(!order){
        return next(new ErrorHandler('Order not found', 404));
    }
    res.status(200).json({
        success: true,
        order
    })
});


//get logged in user order => /api/v1/order/me
exports.myOrder = catchAsyncErrors(async(req, res, next) => {
    const orders = await Order.find({user: req.user.id});
   
    res.status(200).json({
        success: true,
        orders
    })
});


//get all order ADMIN => /api/v1/admin/orders
exports.allOrder = catchAsyncErrors(async(req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0
    orders.forEach(order =>{
        totalAmount += order.totalPrice
    })
   
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
});



//update/process order ADMIN => /api/v1/admin/orders/:id 
exports.updateOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler('You have already delivered this order',400));
    }
    order.orderItems.forEach(async item =>{
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status
    order.deliveredAt = Date.now()

    await order.save();

    res.status(200).json({
        success: true
    });
});

async function updateStock(id, quantity){
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({validateBeforeSave: fales})
}


//delete order => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandler('Order not found', 404));
    }
    await order.remove();

    res.status(200).json({
        success: true
    })
});