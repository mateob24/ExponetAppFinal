import axios from "axios";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./UserHistory.css";

function UserHistory() {
  const [buyCars, setBuyCars] = useState([]);
  const [buyCarUser, setBuyCarUser] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBuyCarUser(Cookies.get("userId"));
    const fetchShops = async () => {
      try {
        const response = await axios.get(
          "https://exponet-app-final.vercel.app/buyCarsList"
        );
        console.dir(response.data);
        setBuyCars(response.data);
        setBuyCarUser(Cookies.get("userId"))
        setLoading(false); // Cambia el estado de carga a falso cuando se completa la solicitud
      } catch (error) {
        if (error.response) {
          console.error("Error de respuesta del servidor:", error.response.data);
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor");
        } else {
          console.error("Error de configuración de la solicitud:", error.message);
        }
        setLoading(false); // Cambia el estado de carga a falso si hay un error
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
      {loading ? (
        <p>Cargando historial de compras...</p>
      ) : (
        <div className="shops-container-historial">
          <table className="shop-table">
            <thead>
              <tr>
                <th>Nombre del Producto</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {buyCars
                .filter((buyCar) => buyCar.buyCarUser === parseInt(buyCarUser))
                .map((filteredBuyCar) => (
                  <tr key={filteredBuyCar.buyCarId}>
                    {Array.isArray(
                      JSON.parse(filteredBuyCar.buyCarContent).products
                    ) &&
                      JSON.parse(filteredBuyCar.buyCarContent).products.map(
                        (product, index) => (
                          <React.Fragment key={product.productId}>
                            <td>{product.productName}</td>
                            <td>{product.productDescription}</td>
                            <td>{product.productPrize}</td>
                            <td>{product.productState}</td>
                            <td>
                              {Array.isArray(
                                JSON.parse(filteredBuyCar.buyCarContent).quantities
                              ) &&
                                JSON.parse(filteredBuyCar.buyCarContent).quantities[
                                  index
                                ].quantity}
                            </td>
                          </React.Fragment>
                        )
                      )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <Footer />
    </>
  );
}

export default UserHistory;
