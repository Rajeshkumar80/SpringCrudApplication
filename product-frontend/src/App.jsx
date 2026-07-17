import { useEffect, useState } from "react";
import "./App.css";

import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import ProductService from "./services/ProductService";

function App() {
  const emptyProduct = {
    pid: null,
    pname: "",
    price: "",
    description: "",
  };

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async () => {
    try {
      if (editing) {
        await ProductService.updateProduct(product.pid, {
          pname: product.pname,
          price: product.price,
          description: product.description,
        });

        alert("Product Updated Successfully");
      } else {
        await ProductService.addProduct({
          pname: product.pname,
          price: product.price,
          description: product.description,
        });

        alert("Product Added Successfully");
      }

      clearForm();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error Saving Product");
    }
  };

  const editProduct = (selectedProduct) => {
    setProduct({
      pid: selectedProduct.pid,
      pname: selectedProduct.pname,
      price: selectedProduct.price,
      description: selectedProduct.description,
    });

    setEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteProduct = async (pid) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await ProductService.deleteProduct(pid);
      alert("Product Deleted Successfully");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Delete Failed");
    }
  };

  const clearForm = () => {
    setProduct(emptyProduct);
    setEditing(false);
  };

  const filteredProducts = products.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.pname.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.price.toString().includes(search) ||
      item.pid.toString().includes(search)
    );
  });

  return (
    <div className="app">
      <div className="container">

        {/* Header */}
        <header className="page-header">
          <h1>📦 Product Management System</h1>
          <p>Spring Boot + React + MySQL CRUD Application</p>
        </header>

        {/* Product Form */}
        <ProductForm
          product={product}
          setProduct={setProduct}
          saveProduct={saveProduct}
          clearForm={clearForm}
          editing={editing}
        />

        {/* Product List with Search */}
        <ProductList
          products={filteredProducts}
          editProduct={editProduct}
          deleteProduct={deleteProduct}
          loading={loading}
          search={search}
          setSearch={setSearch}
        />

      </div>
    </div>
  );
}

export default App;