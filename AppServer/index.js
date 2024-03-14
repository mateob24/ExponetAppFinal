const express = require("express");
const app = express();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'tu_cloud_name',
  api_key: 'tu_api_key',
  api_secret: 'tu_api_secret',
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});




const multerUpload = multer({ storage: cloudinaryStorage });

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
  try {
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
  } catch (err) {
    console.log(err);
    res.status(500).send("Error interno del servidor");
  }
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

app.post("/createShop", multerUpload.single("file"), async (req, res) => {
  try {
    const { shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments } = req.body;
    console.log(shopName, shopAdress, shopComments, shopId, shopMail, shopTell)
    console.log(JSON.stringify(req.body));
    console.log("shopName:", req.body.shopName);
    console.log("shopAdress:", req.body.shopAdress);
    console.log("shopComments:", req.body.shopComments);
    console.log("shop tell", req.body.shopTell);
    console.log("shopId", req.body.shopId );
    console.log("shopMail", req.body.shopMail);
    // Obtener la URL de la imagen subida desde Cloudinary
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await cloudinary.url(req.file.filename, {
          width: 100,
          height: 150,
          crop: 'fill'
        });
        console.log("URL de la imagen en Cloudinary:", imageUrl);
      } catch (urlErr) {
        console.error("Error al obtener la URL de la imagen desde Cloudinary:", urlErr);
      }
    }

    console.log(imageUrl)

    db.query(
      "INSERT INTO appShops (shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments, shopImgUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments, imageUrl],
      (err, result) => {
        if (err) {
          console.error("Error al ejecutar la consulta en la base de datos:", err);
          res.status(500).send("Error al crear la tienda");
        } else {
          res.status(200).send(result);
        }
      }
    );
  } catch (error) {
    console.error("Error general en la función de creación de tienda:", error);
    res.status(500).send("Error al crear la tienda");
  }
});


app.put("/updateShop", multerUpload.single("file"), async (req, res) => {
  try {
    const { shopName, shopAdress, shopTell, shopMail, shopComments, shopId } = req.body;
    console.log(JSON.stringify(req.body));
    console.log("shopName:", req.body.shopName);
    console.log("shopAdress:", req.body.shopAdress);
    console.log("shopComments:", req.body.shopComments);
    console.log("shop tell", req.body.shopTell);
    console.log("shopId", req.body.shopId );
    console.log("shopMail", req.body.shopMail);
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await cloudinary.url(req.file.filename, {
          width: 100,
          height: 150,
          crop: 'fill'
        });
        console.log("URL de la imagen en Cloudinary:", imageUrl);
      } catch (urlErr) {
        console.error("Error al obtener la URL de la imagen desde Cloudinary:", urlErr);
      }
    }

    console.log(imageUrl)

    db.query(
      "UPDATE appShops SET shopName=?, shopAdress=?, shopTell=?, shopMail=?, shopComments=?, shopImgUrl=? WHERE shopId=?",
      [shopName, shopAdress, shopTell, shopMail, shopComments, imageUrl, shopId],
      (err, result) => {
        if (err) {
          console.error("Error al ejecutar la consulta en la base de datos:", err);
          res.status(500).send("Error al actualizar la tienda");
        } else {
          res.status(200).send(result);
        }
      }
    );
  } catch (error) {
    console.error("Error general en la función de actualización de tienda:", error);
    res.status(500).send("Error al actualizar la tienda");
  }
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

  app.post("/createProduct", multerUpload.single("file"), (req, res) => {
    const {
      productName,
      productStock,
      productCategory,
      productDescription,
      productPrize,
      productShopOwner,
    } = req.body;
  
    // Obtener la URL de la imagen subida desde Cloudinary
    const imageUrl = req.file ? cloudinary.url(req.file.filename, {
      width: 100,
      height: 150,
      crop: 'fill'
    }) : null;
  
    db.query(
      "INSERT INTO appProducts(productName, productDescription, productPrize, productStock, productCategory, productImgUrl, productShopOwner) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        productName,
        productDescription,
        productPrize,
        productStock,
        productCategory,
        imageUrl,
        productShopOwner,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error al registrar el producto");
        } else {
          console.log("URL de la imagen en Cloudinary:", imageUrl);
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

app.put("/updateProduct", multerUpload.single("file"), (req, res) => {
  const {
    productId,
    productName,
    productStock,
    productCategory,
    productDescription,
    productPrize,
  } = req.body;

  // Obtener la URL de la imagen subida desde Cloudinary
  const imageUrl = req.file ? cloudinary.url(req.file.filename, {
    width: 100,
    height: 150,
    crop: 'fill'
  }) : null;

  db.query(
    "UPDATE appProducts SET productName=?, productDescription=?, productPrize=?, productStock=?, productCategory=?, productImgUrl=? WHERE productId=?",
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
        res.status(500).send("Error al actualizar el producto");
      } else {
        console.log("URL de la imagen en Cloudinary:", imageUrl);
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

app.get("/buyCarsList", async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM appBuyCars ", (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.status(200).send(result);
    console.log(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la lista de carritos de compras");
  }
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
