import { useState, useEffect } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import { ShopContextValues } from "../Components/Context/ShopContext";
import { useContext } from "react";
import "./UpdateShop.css";
import Swal from 'sweetalert2';

function UpdateProduct() {
  const [productName, setProductName] = useState("");
  const [productStock, setProductStock] = useState(0);
  const [productCategory, setProductCategory] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [productPrize, setProductPrize] = useState(0);
  const [editar, setEditar] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [productShopOwner, setProductShopOwner] = useState("");
  const [file, setFile] = useState(null);
  const { globalShopId } = useContext(ShopContextValues);
  const [selectedFile, setSelectedFile] = useState(null);

  const add = () => {
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("productStock", productStock);
    formData.append("productCategory", productCategory);
    formData.append("productDescription", productDescription);
    formData.append("productPrize", productPrize);
    formData.append("productShopOwner", productShopOwner);
    formData.append("file", selectedFile);

    Axios.post("https://exponetapp-8fxj.onrender.com/createProduct", formData)
      .then(() => {
        getProductsList();
        limpiarCampos();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Producto registrado",
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch((error) => {
        console.error("Error al registrar el producto:", error);
      });
  };

  const update = () => {
    const confirmation = window.confirm(
      `¿Seguro que desea actualizar el producto?\n\nCambios propuestos:\n` +
        `Nombre: ${productName}\n` +
        `Stock: ${productStock}\n` +
        `Categoría: ${productCategory}\n` +
        `Descripción: ${productDescription}\n` +
        `Precio: ${productPrize}`
    );

    if (!confirmation) {
      // El usuario hizo clic en "Cancelar"
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("productName", productName);
    formData.append("productStock", productStock);
    formData.append("productCategory", productCategory);
    formData.append("productDescription", productDescription);
    formData.append("productPrize", productPrize);
    formData.append("file", selectedFile);

    Axios.put("https://exponetapp-8fxj.onrender.com/updateProduct", formData)
      .then(() => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Producto actualizado",
          showConfirmButton: false,
          timer: 1500,
        });
        getProductsList();
        limpiarCampos();
      })
      .catch((error) => {
        console.error("Error al actualizar el producto:", error);
      });
  };

  const deleteProducto = (productId) => {
    const confirmation = window.confirm(
      "¿Seguro que desea eliminar el producto?"
    );

    if (!confirmation) {
      // El usuario hizo clic en "Cancelar"
      return;
    }

    Axios.put(`https://exponetapp-8fxj.onrender.com/deleteProduct/${productId}`).then(() => {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Producto eliminado",
        showConfirmButton: false,
        timer: 1500,
      });
      limpiarCampos();
      getProductsList();
    });
  };

  const limpiarCampos = () => {
    setProductName("");
    setProductStock(0);
    setProductCategory("");
    setProductDescription("");
    setProductPrize(0);
    setEditar(false);
  };

  const CancelarUpdate = () => {
    limpiarCampos();
    setEditar(false);
  };

  const editarProducto = (val) => {
    setEditar(true);
    setProductId(val.productId);

    setProductName(val.productName);
    console.log(val.productName);
    setProductStock(val.productStock);
    console.log(val.productStock);
    setProductCategory(val.productCategory);
    console.log(val.productCategory);
    setProductDescription(val.productDescription);
    console.log(val.productDescription);
    setProductPrize(val.productPrize);
    console.log(val.productPrize);
  };

  const getProductsList = () => {
    Axios.get(
      `https://exponetapp-8fxj.onrender.com/productsListUpdateProducts/${productShopOwner}`
    ).then((response) => {
      setProductsList(response.data);
      console.dir(response.data);
    });
  };

  // const handleFileChange = (event) => {
  //   setFile(event.target.files[0]);
  // };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  useEffect(() => {
    setProductShopOwner(globalShopId);
    console.log("soy global shop id", globalShopId);

    console.log("soy product shop owner", productShopOwner);
    getProductsList();
  }, [productShopOwner]);

  return (
    <>
      <Header />
      <div className="container pt-36 pb-8">
        <div className="card text-center">
          <div className="card-header">
            <h2 className="title-create-prod">Gestión De Productos</h2>
          </div>
          <div className="card-body">
            <div className="input-group mb-3">
              <span className="input-group-text fw-semibold" id="basic-addon1">
                Producto:
              </span>
              <input
                type="text"
                value={productName}
                onChange={(Event) => {
                  setProductName(Event.target.value);
                }}
                className="form-control m-0"
                placeholder="Ingrese un producto"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text fw-semibold" id="basic-addon1">
                Cantidad:
              </span>
              <input
                type="number"
                value={productStock}
                onChange={(Event) => {
                  setProductStock(Event.target.value);
                }}
                className="form-control m-0"
                placeholder="Ingrese la cantidad"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text fw-semibold" id="basic-addon1">
                Categoría:
              </span>
              <input
                type="text"
                value={productCategory}
                onChange={(Event) => {
                  setProductCategory(Event.target.value);
                }}
                className="form-control m-0"
                placeholder="Ingrese la categoría"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text fw-semibold" id="basic-addon1">
                Descripción:
              </span>
              <textarea
                type="text"
                value={productDescription}
                onChange={(Event) => {
                  setProductDescription(Event.target.value);
                }}
                className="form-control m-0 resize-none"
                placeholder="Ingrese la descripción"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text fw-semibold" id="basic-addon1">
                Precio:
              </span>
              <input
                type="number"
                value={productPrize}
                onChange={(Event) => {
                  setProductPrize(Event.target.value);
                }}
                className="form-control m-0"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </div>
            <div className="input-group mt-3">
              <label className="select-img-prod" htmlFor="file">
                Seleccionar imagen del producto
              </label>
              <input
                className="h-10 pl-2 self-center"
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                style={{ display: "none" }} // Oculta el input de tipo archivo
              />
              {selectedFile && (
                <div className="file-info">
                  <p className="result-select-img">{selectedFile.name}</p>
                  {/* Puedes agregar más información sobre el archivo si lo deseas */}
                </div>
              )}
            </div>
          </div>
          <div className="card-footer text-body-secondary d-flex justify-content-center">
            {editar ? (
              <div className="w-52 d-flex justify-content-between">
                <button
                  onClick={() => {
                    update();
                  }}
                  className="btn-update-prod"
                >
                  Actualizar
                </button>
                <button
                  onClick={CancelarUpdate}
                  className="btn-cancel-prod"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={add}
                className="btn-new-prod"
              >
                Registrar
              </button>
            )}
          </div>
        </div>

        <table className="table table-hover mt-12">
          <thead className="table-titles-prod">
            <tr>
              <th scope="col">Productos</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Categoria</th>
              <th scope="col">Descripcion</th>
              <th scope="col">Precio</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody className="table-body-prod">
            {productsList.map((val, key) => {
              return (
                <tr key={val.productId}>
                  <td>{val.productName}</td>
                  <td>{val.productStock}</td>
                  <td>{val.productCategory}</td>
                  <td>{val.productDescription}</td>
                  <td>{val.productPrize}</td>
                  <td>
                    <div
                      className="flex items-center justify-center gap-1"
                      role="group"
                      aria-label="Basic example"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          editarProducto(val);
                          console.log("soy val en el boton", val);
                        }}
                        className="btn-edit-prod"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteProducto(val.productId);
                        }}
                        className="btn-delete-prod"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}

export default UpdateProduct;
