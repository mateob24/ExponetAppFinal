import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { IoStorefrontSharp } from "react-icons/io5";
import "./Register.css";
import Swal from 'sweetalert2';

function RegisterForm() {
  const [formData, setFormData] = useState({
    userName: "",
    userMail: "",
    userPassword: "",
    confirmPassword: "",
    userAdress: "",
    userRole: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.userPassword !== formData.confirmPassword) {
      console.error("Las contraseñas no coinciden");
      Swal.fire({
        icon: "error",
        text: "Contraseñas no coinciden!",
      });
      return;
    }

    if (
      !formData.userName ||
      !formData.userMail ||
      !formData.userPassword ||
      !formData.confirmPassword ||
      !formData.userRole
    ) {
      console.error("Por favor, complete todos los campos");
      Swal.fire({
        icon: "error",
        text: "Complete todos los campos requeridos en el formulario!",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userMail)) {
      console.error("Formato de correo electrónico inválido");
      Swal.fire({
        icon: "warning",
        title: "Formato de correo electronico invalido",
      });
      return;
    }

    try {
      const response = await axios.post("https://exponetapp-8fxj.onrender.com/createUser", {
        userName: formData.userName,
        userMail: formData.userMail,
        userPassword: formData.userPassword,
        userAdress: formData.userAdress,
        userRole: formData.userRole,
      });

      console.log(response.data);
      Swal.fire({
        title: "¡Registro exitoso!",
        icon: "success",
      });
      navigate("/Login");
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  return (
    <>
      <section className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 bg-white lg:px-8">
        <div className="w-2/6 py-8 px-4 flex flex-col items-center justify-center rounded-md shadow-sm bg-gray-50 general-register">
          <img className="mx-auto h-20 w-auto image-register" src="/exponet-logo.webp" alt="" />
          <h1 className="mt-1 mb-0 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 title-register">Crea una cuenta</h1>
          <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm general2-register">
            <form onSubmit={handleSubmit} className="space-y-3 form-register">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium leading-6 text-gray-900 label-register">
                  Nombre de usuario
                </label>
                <div className="mt-1 input-box">
                  <input
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-register"
                    type="text"
                    id="userName"
                    name="userName"
                    placeholder="Nombre completo"
                    required
                    value={formData.userName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="userMail" className="block text-sm font-medium leading-6 text-gray-900 label-register">
                  Correo electrónico
                </label>
                <div className="mt-1 input-box">
                  <input
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-register"
                    type="email"
                    placeholder="example@mail.com"
                    id="userMail"
                    name="userMail"
                    required
                    value={formData.userMail}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="userAdress" className="block text-sm font-medium leading-6 text-gray-900 label-register">
                  Direccion de residencia
                </label>
                <div className="mt-1 input-box">
                  <input
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-register"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-register"
                    type="text"
                    id="userAdress"
                    name="userAdress"
                    placeholder="Dirección"
                    required
                    value={formData.userAdress}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="userPassword" className="block text-sm font-medium leading-6 text-gray-900 label-register">
                  Contraseña
                </label>
                <div className="mt-1 input-box">
                  <input
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-register"
                    type="password"
                    id="userPassword"
                    name="userPassword"
                    required
                    value={formData.userPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 label-register">
                  Confirmar contraseña
                </label>
                <div className="mt-1 input-box">
                  <input
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-register"
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="userRole" className="block text-sm font-medium leading-6 text-gray-900 label-register">
                  Rol
                </label>
                <select
                  className="block w-32 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input-register input-rol"
                  id="userRole"
                  name="userRole"
                  required
                  value={formData.userRole}
                  onChange={handleChange}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="comprador">Comprador</option>
                </select>
              </div>
              <div className="flex">
                <button type="submit" className="flex mr-2 w-full justify-center rounded-md px-3 py-1 text-sm font-semibold leading-6 text-white shadow-sm btn-register">
                  Registrarse
                </button>
                <div className="flex items-center justify-center">
                  <Link className="flex w-20 justify-center rounded-md px-3 py-1 text-sm font-semibold no-underline leading-6 text-white shadow-sm btn-home-register" to={"/"}>
                    <IoStorefrontSharp className="mx-auto w-auto self-center"/> Inicio
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default RegisterForm;
