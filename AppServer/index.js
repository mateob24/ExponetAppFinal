const express = require("express");
const app = express();
const mysql = require("mysql2/promise");
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

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "tu_host",
  user: "tu_usuario",
  password: "tu_contraseña",
  database: "tu_base_de_datos"
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

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        "INSERT INTO appUsers (userName, userMail, userPassword, userAdress, userRoll) VALUES (?, ?, ?, ?, ?)",
        [userName, userMail, hashedPassword, userAdress, userRole]
      );

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
    } finally {
      // Siempre liberar la conexión, incluso si ocurrió un error
      connection.release();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/userRead", async (req, res) => {
  try {
    const { userMail, userPassword } = req.body;

    console.log(userMail);
    console.log(userPassword);

    const [rows] = await pool.query("SELECT * FROM appUsers WHERE userMail = ?", [userMail]);

    if (rows.length > 0) {
      const match = await bcrypt.compare(userPassword, rows[0].userPassword);
      if (match) {
        res.status(200).json(rows[0]);
      } else {
        res.status(401).send("Contraseña incorrecta");
      }
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/createShop", multerUpload.single("file"), async (req, res) => {
  try {
    const { shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments } = req.body;
    console.log(shopName, shopAdress, shopComments, shopId, shopMail, shopTell);
    console.log(JSON.stringify(req.body));
    console.log("shopName:", req.body.shopName);
    console.log("shopAdress:", req.body.shopAdress);
    console.log("shopComments:", req.body.shopComments);
    console.log("shop tell", req.body.shopTell);
    console.log("shopId", req.body.shopId);
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

    console.log(imageUrl);

    const [rows] = await pool.query(
      "INSERT INTO appShops (shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments, shopImgUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [shopName, shopTell, shopMail, shopAdress, shopOwner, shopComments, imageUrl]
    );

    res.status(200).send(rows);
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
    console.log("shopId", req.body.shopId);
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

    console.log(imageUrl);

    const [rows] = await pool.query(
      "UPDATE appShops SET shopName=?, shopAdress=?, shopTell=?, shopMail=?, shopComments=?, shopImgUrl=? WHERE shopId=?",
      [shopName, shopAdress, shopTell, shopMail, shopComments, imageUrl, shopId]
    );

    res.status(200).send(rows);
  } catch (error) {
    console.error("Error general en la función de actualización de tienda:", error);
    res.status(500).send("Error al actualizar la tienda");
  }
});




app.get("/shopsList", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM appShops");
    console.log(rows);
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error al obtener la lista de tiendas:", error);
    res.status(500).send("Error al obtener la lista de tiendas");
  }
});

app.get("/shopsListCreateShops/:shopOwner", async (req, res) => {
  const shopOwner = req.params.shopOwner;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM appShops WHERE shopOwner = ?",
      [shopOwner]
    );
    console.log(rows);
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error al obtener la lista de tiendas:", error);
    res.status(500).send("Error al obtener la lista de tiendas");
  }
});


app.put("/deleteShop/:shopId", async (req, res) => {
  const shopId = req.params.shopId;

  try {
    const [result] = await pool.query(
      "DELETE FROM appShops WHERE shopId = ?",
      [shopId]
    );
    res.status(200).send(result);
  } catch (error) {
    console.error("Error al eliminar la tienda:", error);
    res.status(500).send("Error al eliminar la tienda");
  }
});
;

app.put("/deleteProducts/:shopId", async (req, res) => {
  const shopId = req.params.shopId;

  try {
    const [result] = await pool.query(
      "DELETE FROM appProducts WHERE productShopOwner = ?",
      [shopId]
    );
    res.status(200).send(result);
  } catch (error) {
    console.error("Error al eliminar los productos de la tienda:", error);
    res.status(500).send("Error al eliminar los productos de la tienda");
  }
});


app.post("/createProduct", multerUpload.single("file"), async (req, res) => {
  const {
    productName,
    productStock,
    productCategory,
    productDescription,
    productPrize,
    productShopOwner,
  } = req.body;

  try {
    // Obtener la URL de la imagen subida desde Cloudinary
    const imageUrl = req.file ? await cloudinary.url(req.file.filename, {
      width: 100,
      height: 150,
      crop: 'fill'
    }) : null;

    const [result] = await pool.query(
      "INSERT INTO appProducts(productName, productDescription, productPrize, productStock, productCategory, productImgUrl, productShopOwner) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        productName,
        productDescription,
        productPrize,
        productStock,
        productCategory,
        imageUrl,
        productShopOwner,
      ]
    );

    console.log("URL de la imagen en Cloudinary:", imageUrl);
    res.status(200).send("Registro de producto exitoso");
  } catch (error) {
    console.error("Error al registrar el producto:", error);
    res.status(500).send("Error al registrar el producto");
  }
});

  

app.get("/productsList", async (req, res) => {
  try {
    const [rows, fields] = await pool.query("SELECT * FROM appProducts");
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error al obtener la lista de productos:", error);
    res.status(500).send("Error al obtener la lista de productos");
  }
});


app.get("/productsListUpdateProducts/:productShopOwner", async (req, res) => {
  const productShopOwner = req.params.productShopOwner;
  
  try {
    const [rows, fields] = await pool.query("SELECT * FROM appProducts WHERE productShopOwner = ?", [productShopOwner]);
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error al obtener la lista de productos:", error);
    res.status(500).send("Error al obtener la lista de productos");
  }
});


app.put("/deleteProduct/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    await pool.query("DELETE FROM appProducts WHERE productId=?", [productId]);
    res.status(200).send("Producto eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).send("Error al eliminar el producto");
  }
});


app.put("/updateProduct", multerUpload.single("file"), async (req, res) => {
  const {
    productId,
    productName,
    productStock,
    productCategory,
    productDescription,
    productPrize,
  } = req.body;

  try {
    // Obtener la URL de la imagen subida desde Cloudinary
    const imageUrl = req.file ? await cloudinary.url(req.file.filename, {
      width: 100,
      height: 150,
      crop: 'fill'
    }) : null;

    await pool.query(
      "UPDATE appProducts SET productName=?, productDescription=?, productPrize=?, productStock=?, productCategory=?, productImgUrl=? WHERE productId=?",
      [
        productName,
        productDescription,
        productPrize,
        productStock,
        productCategory,
        imageUrl,
        productId,
      ]
    );

    console.log("URL de la imagen en Cloudinary:", imageUrl);
    res.status(200).send("Producto actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).send("Error al actualizar el producto");
  }
});



app.get("/commentsList", async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetCommentsWithUser()");
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error al obtener la lista de comentarios:", error);
    res.status(500).send("Error al obtener la lista de comentarios");
  }
});


// carrito compras

app.post("/createBuyCar", async (req, res) => {
  try {
    const { buyCarContent, buyCarUser, buyCarState } = req.body;

    console.log(buyCarContent);
    console.log(buyCarUser);
    console.log(buyCarState);

    const [result] = await pool.query(
      "INSERT INTO appBuyCars (buyCarContent, buyCarUser, buyCarState) VALUES (?, ?, ?)",
      [buyCarContent, buyCarUser, buyCarState]
    );

    res.status(200).send(result);
  } catch (error) {
    console.error("Error al crear el carrito de compras:", error);
    res.status(500).send("Error al crear el carrito de compras");
  }
});


app.get("/buyCarsList", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM appBuyCars");
    res.status(200).send(result);
  } catch (error) {
    console.error("Error al obtener la lista de carritos:", error);
    res.status(500).send("Error al obtener la lista de carritos");
  }
});

app.get("/buyCarOrdersManagment", async (req, res) => {
  try {
    const [result] = await pool.query("CALL GetBuyCarsAndUsers()");
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
    res.status(500).send("Error al obtener los pedidos");
  }
});

app.post("/ProductStockUpdate", async (req, res) => {
  const productIds = req.body.productsIds;
  const productQuantities = req.body.productsQuantities;
  const productsShopOwners = req.body.productsShopOwners;
  const newBuyCarContent = req.body.newBuyCarContent;

  // Variable para llevar el registro de cuántas actualizaciones se han completado
  let updatedProductsCount = 0;

  try {
    for (let i = 0; i < productIds.length; i++) {
      const currentProductId = productIds[i];
      const currentProductQuantity = productQuantities[i];
      const currentProductShopOwner = productsShopOwners[i];

      // Función para obtener el productShopOwner original de manera asíncrona
      const originalProductShopOwner = await getProductShopOwner(currentProductId);

      if (currentProductShopOwner === originalProductShopOwner) {
        await updateProductStock(currentProductId, currentProductQuantity, currentProductShopOwner, newBuyCarContent);
        updatedProductsCount++;
      } else {
        updatedProductsCount++;
      }
    }

    if (updatedProductsCount === productIds.length) {
      res.status(200).send("Actualización de stock exitosa");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar el stock del producto");
  }
});

// Función para obtener el productShopOwner original de manera asíncrona
function getProductShopOwner(productId) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT productShopOwner FROM appProducts WHERE productId = ?",
      [productId],
      (err, result) => {
        if (err) {
          console.error(err);
          reject("Error al obtener el ProductShopOwner Original");
        } else {
          resolve(result[0].productShopOwner);
        }
      }
    );
  });
}

// Función para actualizar el stock del producto
function updateProductStock(productId, quantity, shopOwner, buyCarContent) {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE appProducts SET productStock = GREATEST(productStock - ?, 0), buyCarState = ? WHERE productId = ? AND productShopOwner = ?",
      [quantity, buyCarContent, productId, shopOwner],
      (err, result) => {
        if (err) {
          console.error(err);
          reject("Error al actualizar el stock del producto");
        } else {
          resolve();
        }
      }
    );
  });
}


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
