import { Server } from "socket.io";
import ProductManager from "../managers/ProductManager.js";

const productManager = new ProductManager();

export const config = (httpServer) => {

    const socketServer = new Server(httpServer);

    socketServer.on("connection", async (socket) => {
        console.log("Conexión establecida", socket.id);

        socketServer.emit("products-list", { products: await productManager.getAll() });

        socket.on("insert-product", async (data) => {
            try {
                await productManager.insertOne(data);
                socketServer.emit("products-list", { products: await productManager.getAll() });

            } catch (error) {
                socketServer.emit("error-message", { message: error.message });

            }
        });

        // Servidor - manejo del evento 'view-product-details'
        socket.on("view-product-details", async (data) => {
            console.log("Recibiendo solicitud de detalles para el producto con ID:", data.id);

            // Obtener el producto del servidor
            const product = await productManager.getOneById(data.id);

            if (product) {
                console.log("Producto encontrado:", product);

                socket.emit("product-details", product);
                console.log("Detalles del producto emitidos al cliente.");
            } else {
                console.log("Producto no encontrado.");
                socket.emit("error-message", { message: "Producto no encontrado" });
            }
        });

        socket.on("get-cart-products", async (data) => {
            try {
                // Obtener el carrito por ID
                const cart = await cartManager.getOneById(data.cartId);
                
                if (!cart) {
                    socket.emit("error-message", { message: "Carrito no encontrado" });
                    return;
                }
        
                // Emitir los productos del carrito
                socket.emit("cart-products-list", { products: cart.products });
                console.log("Productos enviados:", cart.products);
                
            } catch (error) {
                // Enviar un mensaje de error si algo sale mal
                socket.emit("error-message", { message: error.message });
            }
        });        

        socket.on("delete-product", async (data) => {
            try {
                await productManager.deleteOneById(Number(data.id));
                socketServer.emit("products-list", { products: await productManager.getAll() });

            } catch (error) {
                socketServer.emit("error-message", { message: error.message });

            }
        });

        socket.on("disconnect", () => {
            console.log("Se desconecto un cliente");
        });
    });
};