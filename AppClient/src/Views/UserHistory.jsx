import axios from "axios";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./UserHistory.css";

function UserHistory() {
  const [buyCars, setBuyCars] = useState([]);
  const [buyCarUser, setBuyCarUser] = useState(0);

  useEffect(() => {
    setBuyCarUser(Cookies.get("userId"));
    const fetchShops = async () => {
      try {
        const response = await axios.get(
          "https://exponet-app-final.vercel.app/buyCarsList"
        );
        setBuyCars(response.data);
      } catch (error) {
        console.error("Error al obtener la lista de tiendas:", error);
      }
    };

    fetchShops();
  }, []);

  return (
    <>
      <Header />
      <div className="box-title-historial">
        <h2 className="product-title-historial">Historial De Compra</h2>
      </div>
      <div className="shops-container-historial">
        {buyCars
          .filter((buyCar) => buyCar.buyCarUser === parseInt(buyCarUser))
          .map((filteredBuyCar) => (
            <div key={filteredBuyCar.buyCarId} className="shop-card-historial">
              <div className="shops-info">
                <h4 className="shops-title m-0">Detalle de Compra</h4>
                {Array.isArray(
                  JSON.parse(filteredBuyCar.buyCarContent).products
                ) &&
                  JSON.parse(filteredBuyCar.buyCarContent).products.map(
                    (product, index) => (
                      <div key={product.productId}>
                        <p className="invoice-item">nombre del producto</p>
                        <h5>{product.productName}</h5>
                        <p className="invoice-item">Descripcion</p>
                        <p>{product.productDescription}</p>
                        <p className="invoice-item">precio: </p>
                        <p>{product.productPrize}</p>
                        <p className="invoice-item">Estado</p>
                        <p>{product.productState}</p>
                        <p className="invoice-item">Cantidad</p>
                        <p>
                          {Array.isArray(
                            JSON.parse(filteredBuyCar.buyCarContent).quantities
                          ) &&
                            JSON.parse(filteredBuyCar.buyCarContent).quantities[
                              index
                            ].quantity}
                        </p>
                      </div>
                    )
                  )}
              </div>
            </div>
          ))}
      </div>
      <Footer />
    </>
  );
}

export default UserHistory;
