import { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BsPlusSquare, BsDashSquare } from 'react-icons/bs';
import { ThreeDots } from 'react-loader-spinner';
import CartContext from '../../context/CartContext';

import Header from '../Header';
import SimilarProductItem from '../SimilarProductItem';

import './index.css';

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
};

const ProductItemDetails = () => {
  const [productData, setProductData] = useState({});
  const [similarProductsData, setSimilarProductsData] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const [quantity, setQuantity] = useState(1);

  const { id } = useParams();  // Get the product ID from the URL

  useEffect(() => {
    getProductData();
  }, [id]);  // Re-run the effect when the id changes

  const getFormattedData = (data) => ({
    availability: data.availability,
    brand: data.brand,
    description: data.description,
    id: data.id,
    imageUrl: data.image_url,
    price: data.price,
    rating: data.rating,
    title: data.title,
    totalReviews: data.total_reviews,
  });

  const getProductData = async () => {
    setApiStatus(apiStatusConstants.inProgress);

    const jwtToken = Cookies.get('jwt_token');
    const apiUrl = `https://apis.ccbp.in/products/${id}`;
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    };

    try {
      const response = await fetch(apiUrl, options);
      if (response.ok) {
        const fetchedData = await response.json();
        const updatedData = getFormattedData(fetchedData);
        const updatedSimilarProductsData = fetchedData.similar_products.map(
          (eachSimilarProduct) => getFormattedData(eachSimilarProduct)
        );
        setProductData(updatedData);
        setSimilarProductsData(updatedSimilarProductsData);
        setApiStatus(apiStatusConstants.success);
      } else if (response.status === 404) {
        setApiStatus(apiStatusConstants.failure);
      }
    } catch (error) {
      setApiStatus(apiStatusConstants.failure);
    }
  };

  const renderLoadingView = () => (
    <div className="products-details-loader-container" data-testid="loader">
      <ThreeDots color="#0b69ff" height="50" width="50" />
    </div>
  );

  const renderFailureView = () => (
    <div className="product-details-error-view-container">
      <img
        alt="error view"
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        className="error-view-image"
      />
      <h1 className="product-not-found-heading">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="button">
          Continue Shopping
        </button>
      </Link>
    </div>
  );

  const onDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const onIncrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const renderProductDetailsView = () => {
    return (
      <CartContext.Consumer>
        {(value) => {
          const { addCartItem } = value;
          const onClickAddToCart = () => {
            addCartItem({ ...productData, quantity });
          };

          return (
            <div className="product-details-success-view">
              <div className="product-details-container">
                <img src={productData.imageUrl} alt="product" className="product-image" />
                <div className="product">
                  <h1 className="product-name">{productData.title}</h1>
                  <p className="price-details">Rs {productData.price}/-</p>
                  <div className="rating-and-reviews-count">
                    <div className="rating-container">
                      <p className="rating">{productData.rating}</p>
                      <img
                        src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                        alt="star"
                        className="star"
                      />
                    </div>
                    <p className="reviews-count">{productData.totalReviews} Reviews</p>
                  </div>
                  <p className="product-description">{productData.description}</p>
                  <div className="label-value-container">
                    <p className="label">Available:</p>
                    <p className="value">{productData.availability}</p>
                  </div>
                  <div className="label-value-container">
                    <p className="label">Brand:</p>
                    <p className="value">{productData.brand}</p>
                  </div>
                  <hr className="horizontal-line" />
                  <div className="quantity-container">
                    <button
                      type="button"
                      className="quantity-controller-button"
                      onClick={onDecrementQuantity}
                      data-testid="minus"
                    >
                      <BsDashSquare className="quantity-controller-icon" />{' '}
                    </button>
                    <p className="quantity">{quantity}</p>
                    <button
                      type="button"
                      className="quantity-controller-button"
                      onClick={onIncrementQuantity}
                      data-testid="plus"
                    >
                      <BsPlusSquare className="quantity-controller-icon" />{' '}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="button add-to-cart-btn"
                    onClick={onClickAddToCart}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
              <h1 className="similar-products-heading">Similar Products</h1>
              <ul className="similar-products-list">
                {similarProductsData.map((eachSimilarProduct) => (
                  <SimilarProductItem
                    productDetails={eachSimilarProduct}
                    key={eachSimilarProduct.id}
                  />
                ))}
              </ul>
            </div>
          );
        }}
      </CartContext.Consumer>
    );
  };

  const renderProductDetails = () => {
    switch (apiStatus) {
      case apiStatusConstants.success:
        return renderProductDetailsView();
      case apiStatusConstants.failure:
        return renderFailureView();
      case apiStatusConstants.inProgress:
        return renderLoadingView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="product-item-details-container">{renderProductDetails()}</div>
    </>
  );
};

export default ProductItemDetails;
