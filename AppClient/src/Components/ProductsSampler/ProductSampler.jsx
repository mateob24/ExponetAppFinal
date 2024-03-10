import React, { useState, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import { ShopContextValues } from "../Context/ShopContext";
import "../ProductsSampler/ProductSampler.css";

function ProductSampler({ products, stock, quantityCards, Route }) {
  const [selectedProducts, setSelectedProducts] = useState({});
  const { globalShopId, setGlobalShopId } = useContext(ShopContextValues);
  const {
    globalShopName,
    setGlobalShopName,
    buyCarProducts,
    setBuyCarProducts,
  } = useContext(ShopContextValues);
  const valor = globalShopId;
  const [productState, setProductSate] = useState("pendiente ")

  const calculateTotalPrice = (productId) => {
    const product = products.find((p) => p.productId === productId);
    const quantity = selectedProducts[productId] || 0;
    return product ? product.productPrize * quantity : 0;
  };

  const handleIncrement = (productId) => {
    if (stock[productId] > 0) {
      setSelectedProducts((prevSelectedProducts) => {
        const updatedProducts = { ...prevSelectedProducts };
        updatedProducts[productId] = (updatedProducts[productId] || 0) + 1;

        localStorage.setItem(
          "selectedProducts",
          JSON.stringify(updatedProducts)
        );
        return updatedProducts;
      });

      setStock((prevStock) => {
        const updatedStock = { ...prevStock };
        updatedStock[productId] = (updatedStock[productId] || 0) - 1;
        return updatedStock;
      });
    }
  };

  const handleDecrement = (productId) => {
    if (selectedProducts[productId] > 0) {
      setSelectedProducts((prevSelectedProducts) => {
        const updatedProducts = { ...prevSelectedProducts };
        updatedProducts[productId] -= 1;

        localStorage.setItem(
          "selectedProducts",
          JSON.stringify(updatedProducts)
        );
        return updatedProducts;
      });

      setStock((prevStock) => {
        const updatedStock = { ...prevStock };
        updatedStock[productId] = (updatedStock[productId] || 0) + 1;
        return updatedStock;
      });
    }
  };

  function addToBuyCar(
    productId,
    productName,
    productDescription,
    productPrize,
    productStock,
    productCategory,
    productimgurl
  ) {
    const selectedQuantity = selectedProducts[productId] || 0;
    
  
    setBuyCarProducts((prevBuyCarProducts) => [
      ...prevBuyCarProducts,
      {
        productId,
        productName,
        productDescription,
        productPrize,
        productStock,
        productCategory,
        productimgurl,
        quantity: selectedQuantity, // Añadir la cantidad seleccionada
        productState
      },
    ]);
  
    alert("Producto Añadido Al Carrito");
  }
  

  function borrarCarrito() {
    setBuyCarProducts([]);
    alert("carrito borrado");
  }

  // Filtrar productos según globalShopId
  const filteredProducts = globalShopId
    ? products.filter((product) => product.productShopOwner === valor)
    : products;

  return (
    <>
      <div className="product-container">
        {filteredProducts.slice(0, quantityCards).map((product) => (
          <div key={product.productId} className="product-card">
            <h3 className="prod-title">{product.productName}</h3>
            <div className="box-img">
              <img
                src={product.productimgurl}
                alt="imgProduct"
                className="prod-img"
              />
            </div>
            <p className="subtitle-descrip w-8">Descripción</p>
            <p className="value-descrip">{product.productDescription}</p>
            <section className="card-dates">
              <div className="card-left">
                <p className="subtitle">Precio</p>
                <p className="value">${product.productPrize}</p>
                <p className="subtitle">Cantidad</p>
                <div className="quantity-controls">
                  <button
                    className="btn-minor shadow-sm"
                    onClick={() => handleDecrement(product.productId)}
                  >
                    <span className="span-btn">
                      <FaMinus />
                    </span>
                  </button>
                  <span>{selectedProducts[product.productId] || 0}</span>
                  <button
                    className="btn-plus shadow-sm"
                    onClick={() => handleIncrement(product.productId)}
                  >
                    <span className="span-btn">
                      <FaPlus />
                    </span>
                  </button>
                </div>
              </div>
              <div className="card-right">
                <p className="subtitle">Total</p>
                <p className="value">
                  ${calculateTotalPrice(product.productId)}
                </p>
                <p className="subtitle">Stock</p>
                <p className="value">{stock[product.productId]}</p>
              </div>
            </section>
            <button
              className="card-btn shadow-md"
              onClick={() =>
                addToBuyCar(
                  product.productId,
                  product.productName,
                  product.productDescription,
                  product.productPrize,
                  product.productStock,
                  product.productCategory,
                  product.productimgurl,
                  productState
                )
              }
            >
              Comprar
            </button>
            <button
              className="card-btn shadow-md"
              onClick={() => {
                borrarCarrito();
              }}
            >
              borrar
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default ProductSampler;
