function ProductForm({
  product,
  setProduct,
  saveProduct,
  clearForm,
  editing,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;

    setProduct({
      ...product,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      product.pname.trim() === "" ||
      product.price <= 0 ||
      product.description.trim() === ""
    ) {
      alert("Please enter valid product details.");
      return;
    }

    saveProduct();
  };

  return (
    <div className="form-card">
      <h2>{editing ? "Update Product" : "Add Product"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>

          <input
            type="text"
            name="pname"
            value={product.pname}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label>Price</label>

          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="Enter product price"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>

          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="4"
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="save-button">
            {editing ? "Update Product" : "Add Product"}
          </button>

          <button
            type="button"
            className="clear-button"
            onClick={clearForm}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;