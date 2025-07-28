import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product, className = '', showQuickView = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const {
    _id,
    name,
    images,
    price,
    salePrice,
    averageRating,
    reviewCount,
    stockStatus,
    brand,
    currentPrice,
    isOnSale,
    discountPercentage
  } = product;

  const primaryImage = images?.find(img => img.isPrimary) || images?.[0];
  const secondaryImage = images?.[1];

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stockStatus === 'out-of-stock') {
      toast.error('Product is out of stock');
      return;
    }

    try {
      await addToCart(product, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      if (isInWishlist(_id)) {
        await removeFromWishlist(_id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const getStockStatusColor = () => {
    switch (stockStatus) {
      case 'in-stock':
        return 'text-green-600';
      case 'low-stock':
        return 'text-yellow-600';
      case 'out-of-stock':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStockStatusText = () => {
    switch (stockStatus) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${_id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {/* Discount Badge */}
          {isOnSale && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock Status Badge */}
          {stockStatus === 'out-of-stock' && (
            <div className="absolute top-2 right-2 z-10 bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Out of Stock
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
              stockStatus === 'out-of-stock' ? 'top-12' : ''
            } ${
              isInWishlist(_id)
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(_id) ? 'fill-current' : ''}`} />
          </button>

          {/* Product Image */}
          <div className="relative w-full h-full">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={isHovered && secondaryImage ? secondaryImage.url : primaryImage?.url}
              alt={primaryImage?.alt || name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
                setImageLoading(false);
              }}
            />
          </div>

          {/* Overlay Actions */}
          <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex gap-2">
              {showQuickView && (
                <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleAddToCart}
                disabled={stockStatus === 'out-of-stock' || cartLoading}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-sm text-gray-500 mb-1">{brand}</p>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">{renderStars()}</div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900">
              ${currentPrice.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-500 line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <p className={`text-sm font-medium ${getStockStatusColor()}`}>
            {getStockStatusText()}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;