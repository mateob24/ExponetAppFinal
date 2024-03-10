import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import "./OrdersManagment.css";
import { ShopContextValues } from "../Components/Context/ShopContext";

function OrdersManagment() {
  const [orders, setOrders] = useState([]);
  const [productsId, setProductsId] = useState([]);
  const [productsQuantity, setProductQuantity] = useState([]);
  const { globalShopId, setGlobalShopId } = useContext(ShopContextValues);

  useEffect(() => {
    const fetchBuyCars = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/buyCarOrdersManagment"
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error al obtener la lista de Ordenes:", error);
      }
    };
    fetchBuyCars();
  }, []);

  function orderDelivered(buyCarContent) {
    console.log("soy funcion");
    console.dir(buyCarContent);

    const parsedContent = JSON.parse(buyCarContent);
    console.dir(parsedContent);

    const productsIds = parsedContent.products.map(
      (product) => product.productId
    );
    console.dir(productsIds);

    const productsQuantities = parsedContent.products.map(
      (product) => product.quantity
    );

    console.dir(productsQuantities);

    const productsShopOwners = parsedContent.products.map(
      (product) => product.productShopOwner
    );

    console.dir(productsShopOwners);

    const buyCarState = "Despachado";

    axios
      .post("http://localhost:3000/ProductStockUpdate", {
        productsIds,
        productsQuantities,
        productsShopOwners,
        buyCarState,
      })
      .then((response) => {
        // Maneja la respuesta si es necesario
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error al actualizar el stock del producto:", error);
      });
  }

  const DeleteBuyCar = (buyCarId) => {
    const confirmation = window.confirm(
      "¿Seguro que desea eliminar el Carrito?"
    );

    if (!confirmation) {
      // El usuario hizo clic en "Cancelar"
      return;
    }

    axios.put(`http://localhost:3000/deleteBuyCar/${buyCarId}`).then(() => {
      alert("Carrito eliminado");
    });
  };
  return (
    <>
      <Header />

      <div>
        <h2>Lista de Órdenes de Compra</h2>
        <ul className="orders-container">
          {orders.map((order, index) => (
            <li key={index}>
              <h3 className="subtitles">Usuario: {order.userName}</h3>
              <p className="subtitles">Correo Electrónico: {order.userMail}</p>
              <p className="subtitles">Dirección: {order.userAdress}</p>

              <h4 className="subtitles">Productos:</h4>
              <ul className="product-container">
                {JSON.parse(order.buyCarContent).products.map(
                  (product, productIndex) => (
                    <li key={productIndex}>
                      <p className="invoice-item">Producto:</p>
                      <p>{product.productName}</p>

                      <p className="invoice-item">Cantidad: </p>
                      <p>{product.quantity}</p>

                      <p className="invoice-item">Descripción:</p>
                      <p>{product.productDescription}</p>

                      <p className="invoice-item">Precio:</p>
                      <p>{product.productPrize}</p>

                      <p className="invoice-item">Categoría:</p>
                      <p>{product.productCategory}</p>

                      <p className="invoice-item">Estado: {}</p>
                    </li>
                  )
                )}
              </ul>
              <button
                className="form-control"
                onClick={() => {
                  console.log("soy botton");
                  console.dir(order.buyCarContent);
                  orderDelivered(order.buyCarContent);
                }}
              >
                despachar Entrega
              </button>
              <button
                className="form-control"
                onClick={() => {
                  DeleteBuyCar(order.buyCarId);
                }}
              >
                Borrar Carrito
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Footer />
    </>
  );
}

export default OrdersManagment;
