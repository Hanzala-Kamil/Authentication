const Product = require('../models/productModel');
const ErrorHander = require('../utils/errorHander');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures')

// create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
});

// get all Products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage)
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
        productCount,
    })
})

// get product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHander('Product not found', 404));
    }
    res.status(200).json({
        success: true,
        product
    })
})


// update Product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(500).json({
            success: false,
            message: "Product Not Found"
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        product
    })
})


// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product Not Found"
        });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})


// Create new review and update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString())
    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment)
        })
    }
    else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.ratings = product.reviews.forEach(rev => {
        avg += rev.rating
    });
    product.ratings = avg / product.reviews.length;
    await product.save({ validateModifiedOnly: false });
    res.status(200).json({
        success: true,
        message: "Review Added Successfully"
    });
})

// get All reviews of product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        return next(new ErrorHander('not found', 404));
    }
    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// delete review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return next(new ErrorHander(' not found', 404));
    }
    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());
    let avg = 0;
    reviews.forEach(rev => {
        avg += rev.rating
    });
    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length;
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    }
    );

    res.status(200).json({
        success: true,
        message: "Review Deleted Successfully"
    })
})