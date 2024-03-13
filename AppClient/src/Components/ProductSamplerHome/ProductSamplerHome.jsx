import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContextValues } from "../Context/ShopContext";
import "./ProductSamplerHome.css";

function ProductSamplerHome({ products, stock, quantityCards, Route }) {
  const [selectedProducts, setSelectedProducts] = useState({});
  const { globalShopId, setGlobalShopId, setGlobalShopName } =
    useContext(ShopContextValues);
  const valor = globalShopId;
  setGlobalShopName("FreeChocolate");
  const Ruta = "/Shops";

  // Filtrar productos según globalShopId
  const filteredProducts = globalShopId
    ? products.filter((product) => product.productShopOwner === valor)
    : products;

  return (
    <>
      <div className="product-container-home">
        {filteredProducts.slice(0, quantityCards).map((product) => (
          <div key={product.productId} className="product-card-home">
            <Link to={Ruta} className="card-btn-home">
              Ir a tiendas
            </Link>
            <div className="box-img-home">
              <img
                src={product.productimgurl}
                alt="imgProduct"
                className="prod-img-home"
              />
            </div>
            <h3 className="prod-title-home">{product.productName}</h3>
            <div className="dates-box-descrip">
              <p className="subtitle-home">Descripción</p>
              <p className="value-descrip-home">{product.productDescription}</p>
            </div>
            <div className="dates-box-one">
              <p className="subtitle-home">Existencias</p>
              <p className="value-home">{stock[product.productId]}</p>
            </div>
            <div className="dates-box-two">
              {/* <p className="subtitle-home">Precio</p> */}
              <p className="value-home-price">${product.productPrize}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ProductSamplerHome;
