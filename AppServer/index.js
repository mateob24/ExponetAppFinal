const express = require("express");
const app = express();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer")

storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../AppClient/public");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const db = mysql.createPool({
  host: "be2akte2ntisg7onaynu-mysql.services.clever-cloud.com",
  user: "umitr9ccarbghg5i",
  password: "i1JW2NSotnKXIjkAkHTR",
  database: "be2akte2ntisg7onaynu",
  insecureAuth: true,
});

let transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "darom3t48@gmail.com",
    pass: "evskhrsbrxeejwys"
  },
})

transporter.verify().then(()=> {
  console.log("Ready to send mails")
})

db.getConnection(function (err) {
  if (err) throw err;
  console.log("esta conectado a mysql");
});

app.post("/createUser", async (req, res) => {
  const { userName, userMail, userPassword, userAdress, userRole } = req.body;

  const hashedPassword = await bcrypt.hash(userPassword, 10);

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error de conexión a la base de datos");
      return;
    }

    connection.query(
      "INSERT INTO appUsers (userName, userMail, userPassword, userAdress, userRoll) VALUES (?, ?, ?, ?, ?)",
      [userName, userMail, hashedPassword, userAdress, userRole],
      async (error, result) => {
        connection.release();

        if (error) {
          console.log(error);
          res.status(500).send("Error al registrar el usuario");
        } else {
          // Envío de correo electrónico al usuario registrado
          try {
            await transporter.sendMail({
              from: `forgot password <Exponet.Com>`,
              to: userMail,
              subject: "Bienvenido a Exponet.com",
              html: `<h1>Bienvenido a Exponet.com</h1>
                     <p>Gracias por registrarte en Exponet.com</p>`
            });
            console.log("Correo electrónico de bienvenida enviado correctamente a:", userMail);
            res.status(200).send("Registro de usuario exitoso");
          } catch (emailError) {
            console.log("Error al enviar el correo electrónico de bienvenida:", emailError);
            res.status(500).send("Error al enviar el correo electrónico de bienvenida");
          }
        }
      }
    );
  });
});


app.post("/userRead", (req, res) => {
  const { userMail, userPassword } = req.body;

  console.log(userMail);
  console.log(userPassword);

  db.query(
    "SELECT * FROM appUsers WHERE userMail = ?",
    [userMail],
    async (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error interno del servidor");
      } else {
        if (result.length > 0) {
          const match = await bcrypt.compare(
            userPassword,
            result[0].userPassword
          );
          if (match) {
            res.status(200).json(result[0]);
          } else {
            res.status(401).send("Contraseña incorrecta");
          }
        } else {
          res.status(404).send("Usuario no encontrado");
        }
      }
    }
  );
});

app.post("/createShop", upload.single("file"), (req, res) => {
  const { shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments } =
    req.body;

  const imageUrl = req.file ? req.file.path : null;

  const start = "../../" + imageUrl.slice(12);

  db.query(
    "INSERT INTO appShops (shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments, shopImgUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments, start],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al crear la tienda");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.put("/updateShop", upload.single("file"), (req, res) => {
  const { shopName, shopAdress, shopTell, shopMail, shopComments, shopId } =
    req.body;

  const imageUrl = req.file ? req.file.path : null;

  const start = "../../" + imageUrl.slice(12);

  db.query(
    "UPDATE appShops SET shopName=?, shopAdress=?, shopTell=?, shopMail=?, shopComments=?, shopImgUrl=? WHERE shopId=?",
    [shopName, shopAdress, shopTell, shopMail, shopComments, start, shopId],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al actualizar la tienda");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.get("/shopsList", (req, res) => {
  db.query("SELECT * FROM appShops", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error al obtener la lista de tiendas");
    } else {
      res.status(200).send(result);
      console.log(result);
    }
  });
});

app.get("/shopsListCreateShops/:shopOwner", (req, res) => {
  const shopOwner = req.params.shopOwner;

  db.query(
    "SELECT * FROM appShops WHERE shopOwner = ?",
    shopOwner,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al obtener la lista de tiendas");
      } else {
        res.status(200).send(result);
        console.log(result);
      }
    }
  );
});

app.put("/deleteShop/:shopId", (req, res) => {
  const ShopId = req.params.shopId;

  db.query("DELETE FROM appShops WHERE shopId=?", ShopId, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error al eliminar la tienda ");
    } else {
      res.status(200).send(result);
    }
  });
});

app.put("/deleteProducts/:shopId"),
  (req, res) => {
    const ShopId = req.params.shopId;

    db.query(
      "DELETE FROM appProducts Where productShopOwner = ?",
      ShopId,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error al eliminar los productos de la tienda");
        } else {
          res.status(200).send(result);
        }
      }
    );
  };

app.post("/createProduct", upload.single("file"), (req, res) => {
  const {
    productName,
    productStock,
    productCategory,
    productDescription,
    productPrize,
    productShopOwner,
  } = req.body;

  const imageUrl = req.file ? req.file.path : null;

  const start = "../../" + imageUrl.slice(12);

  db.query(
    "INSERT INTO appProducts(productName, productDescription, productPrize, productStock, productCategory, productImgUrl, productShopOwner ) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      productName,
      productDescription,
      productPrize,
      productStock,
      productCategory,
      start,
      productShopOwner,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al registrar el producto");
      } else {
        res.status(200).send("Registro de producto exitoso");
      }
    }
  );
});

app.get("/productsList", (req, res) => {
  db.query("SELECT * FROM appProducts", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error al obtener la lista de productos");
    } else {
      res.status(200).send(result);
    }
  });
});

app.get("/productsListUpdateProducts/:productShopOwner", (req, res) => {
  const productShopOwner = req.params.productShopOwner;

  db.query(
    "SELECT * FROM appProducts WHERE productShopOwner = ?",
    productShopOwner,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al obtener la lista de productos");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.put("/deleteProduct/:productId", (req, res) => {
  const productId = req.params.productId;

  db.query(
    "DELETE FROM appProducts WHERE productId=?",
    productId,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al eliminar el producto ");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.put("/updateProduct", upload.single("file"), (req, res) => {
  const {
    productId,
    productName,
    productStock,
    productCategory,
    productDescription,
    productPrize,
  } = req.body;

  const imageUrl = req.file ? "../../" + req.file.path.slice(12) : null;

  db.query(
    "UPDATE appProducts SET productName=?, productDescription=?, productPrize=?, productStock=?, productCategory=?, productimgurl=? WHERE productId=?",
    [
      productName,
      productDescription,
      productPrize,
      productStock,
      productCategory,
      imageUrl,
      productId,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al actualizar la tienda");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.get("/commentsList", (req, res) => {
  db.query("CALL GetCommentsWithUser()", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error al obtener la lista de comentarios");
    } else {
      res.status(200).send(result[0]);
    }
  });
});

// carrito compras

app.post("/createBuyCar", (req, res) => {
  const { buyCarContent, buyCarUser, buyCarState } = req.body;

  console.log(buyCarContent);
  console.log(buyCarUser);
  console.log(buyCarState);

  db.query(
    "INSERT INTO appBuyCars (buyCarContent, buyCarUser, buyCarState) VALUES (?, ?, ?)",
    [buyCarContent, buyCarUser, buyCarState],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al crear el carrito de compras ");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.get("/buyCarsList", (req, res) => {
  db.query("SELECT * FROM appBuyCars", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error al obtener la lista de carritos de compras");
    } else {
      res.status(200).send(result);
      console.log(result);
    }
  });
});

app.get("/buyCarOrdersManagment", (req, res) => {
  db.query("CALL GetBuyCarsAndUsers()", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los pedidos");
    } else {
      res.status(200).json(result[0]); // Cambiado a status 200 y result[0]
      console.log(result);
    }
  });
});

app.post("/ProductStockUpdate", (req, res) => {
  const productIds = req.body.productsIds;
  const productQuantities = req.body.productsQuantities;
  const productsShopOwners = req.body.productsShopOwners;
  const newBuyCarContent = req.body.newBuyCarContent;

  // Variable para llevar el registro de cuántas actualizaciones se han completado
  let updatedProductsCount = 0;

  // Itera sobre los IDs y cantidades para actualizar el stock de cada producto
  for (let i = 0; i < productIds.length; i++) {
    const currentProductId = productIds[i];
    const currentProductQuantity = productQuantities[i];
    const currentProductShopOwner = productsShopOwners[i];
    let originalProductShopOwner;

    // Utiliza una función que espera la respuesta antes de continuar con la lógica
    const getProductShopOwner = () => {
      return new Promise((resolve, reject) => {
        db.query(
          "SELECT productShopOwner FROM appProducts WHERE productId = ?",
          [currentProductId],
          (err, result) => {
            if (err) {
              console.log(err);
              reject("Error al obtener el ProductShopOwner Original");
            } else {
              console.log(result);
              resolve(result[0].productShopOwner);
            }
          }
        );
      });
    };

    // Realiza la actualización del stock y buyCarState solo si productShopOwner coincide
    getProductShopOwner()
      .then((result) => {
        originalProductShopOwner = result;

        if (currentProductShopOwner === originalProductShopOwner) {
          db.query(
            "UPDATE appProducts SET productStock = GREATEST(productStock - ?, 0), buyCarState = ? WHERE productId = ? AND productShopOwner = ?, buyCarContent = ?",
            [
              currentProductQuantity,
              currentProductId,
              currentProductShopOwner,
              newBuyCarContent
            ],
            (err, result) => {
              if (err) {
                console.log(err);
                // Si hay un error, puedes enviar una respuesta de error
                res
                  .status(500)
                  .send("Error al actualizar el stock del producto");
              } else {
                console.log(result);
                // Actualización exitosa para el producto actual
                updatedProductsCount++;

                // Verifica si todas las actualizaciones han sido completadas
                if (updatedProductsCount === productIds.length) {
                  // Todas las actualizaciones han sido completadas, envía una respuesta de éxito
                  res.status(200).send("Actualización de stock exitosa");
                }
              }
            }
          );



          db.query("UPDATE buyCarContent FROM appBuyCar WHERE buyCarId = ?",[currentProductId]),
          (err, result) => {
            if(err){
              console.log(err);
              // Si hay un error, puedes enviar una respuesta de error
              res
                .status(500)
                .send("Error al actualizar el estado del producto");
            } else {
              console.log(result);
              res.status(500).send("actualisacion de estado del producto exitosa")
            }
          }
        } else {
          // Si productShopOwner no coincide, continúa con la siguiente iteración sin hacer cambios
          updatedProductsCount++;
          if (updatedProductsCount === productIds.length) {
            res.status(200).send("Actualización de stock exitosa");
          }
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(error);
      });
  }
});

app.put("/deleteBuyCar/:buyCarId", (req, res) => {
  const buyCarId = req.params.buyCarId;
  db.query(
    "DELETE FROM appBuyCars WHERE buyCarId=?",
    buyCarId,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al eliminar el carrito ");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.listen(3001, () => {
  console.log(`Servidor escuchando en el puerto 3001`);
});
