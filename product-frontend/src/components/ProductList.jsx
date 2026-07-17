import SearchBar from "./SearchBar";

function ProductList({
  products,
  editProduct,
  deleteProduct,
  loading,
  search,
  setSearch,
}) {
  if (loading) {
    return <p className="message">Loading products...</p>;
  }

  return (
    <div className="table-card">

      <div className="table-header">
        <h2>Product List</h2>

        <SearchBar
          search={search}
          setSearch={setSearch}
        />
      </div>

      {products.length === 0 ? (
        <p className="message">No products available.</p>
      ) : (
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Operations</th>
              </tr>
            </thead>

            <tbody>

              {products.map((product) => (

                <tr key={product.pid}>

                  <td>{product.pid}</td>

                  <td>{product.pname}</td>

                  <td>₹{product.price}</td>

                  <td>{product.description}</td>

                  <td className="action-buttons">

                    <button
                      className="edit-button"
                      onClick={() => editProduct(product)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deleteProduct(product.pid)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default ProductList;