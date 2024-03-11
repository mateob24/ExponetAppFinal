// En el componente PrincipalShop
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import ProductSamplerBuyCar from "../Components/ProductSamplerBuyCar/ProductSamplerBuyCar";

function BuyCar() {
  return (
    <>
      <Header />
      <div className="box-title-cart">
        <h1 className="product-title-cart">Carrito De Compras </h1>
      </div>
      <ProductSamplerBuyCar />
      <Footer />
    </>
  );
}

export default BuyCar;
