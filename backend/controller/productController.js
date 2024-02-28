const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFratures = require('../utils/apiFeatures');



//create new product => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors (async(req, res, next) => {
    // try {

    req.body.user = req.user.id;

        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        });
//     } catch (err) {
//         res.status(400).json({
//             success: false,
//             message: err.message
//         });
//     }
 })





//get all products => /api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors (async(req, res, next) => {

    const resPerPage = 4;
    const productCount = await Product.countDocuments();

    const apiFratures = new APIFratures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resPerPage);  

    const products = await apiFratures.query;
    
    res.status(200).json({
        success: true,
        count: products.length,
        productCount,
        products
    });
});


// get single product details => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors (async (req, res, next) =>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }
    res.status(200).json({
        success: true,
        product

    })
})


//update product => /api/v1/admin/product/:id

exports.updateProduct = catchAsyncErrors (async(req, res, next) =>{
    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    }); 

    res.status(200).json({
        success: true,
        product

    })
})


//delete product => /api/v1/admit/product/:id

exports.deleteProduct = catchAsyncErrors (async(req, res, next) => {
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true,
        message: 'product is deleted'
    })
})

