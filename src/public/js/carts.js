const socket = io();

const productsList = document.getElementById("products-list");
const btnRefresh = document.getElementById("btn-refresh-products");

if (productsList) {
    const loadProductsList = async () => {
        const response = await fetch("/api/carts/:id", { method: "GET" });
        const data = await response.json();
        const products = data.payload.docs ?? [];

        productsList.innerHTML = "";

        products.forEach((product) => {
            productsList.innerHTML += `
                <li>
                    Id: ${product.id}
                    - Nombre: ${product.title}
                    - Precio: $${product.price}
                    <a class="a-redirect" data-id="${product.id}">Ver detalles</a>
                    <a class="p-add-to-cart">Agregar a carrito</a>
                    <a class="p-delete-product">Eliminar producto</a>
                </li>
            `;
        });

        // Agregar evento a los botones "Ver detalles"
        const buttons = document.querySelectorAll(".a-redirect");
        buttons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const productId = e.target.getAttribute("data-id");

                // Emitir evento para obtener los detalles del producto
                socket.emit("view-product-details", { id: productId });

                // Cuando el servidor responde con los detalles del producto
                socket.on("product-details", (data) => {
                    console.log("Detalles del producto:", data);
                    // Guardamos los detalles del producto en localStorage
                    localStorage.setItem("productDetails", JSON.stringify(data));

                    // Redirigir a la página de detalles del producto
                    window.location.href = `/api/products/view/${productId}`;
                });
            });
        });
    };

    loadProductsList();
}