// src/pages/Products.jsx — Product management page
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProductForm from '../components/products/ProductForm';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { productService } from '../services/product.service';
import { formatCurrency, formatDate } from '../utils/formatters';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll(search);
      setProducts(res.data.data);
    } catch {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.id, data);
        toast.success('Product updated successfully.');
      } else {
        await productService.create(data);
        toast.success('Product added successfully.');
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setDeleteLoading(true);
    try {
      await productService.delete(selectedProduct.id);
      toast.success('Product deleted.');
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">{products.length} records</p>
        </div>
        <button id="add-product-btn" onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card px-4 py-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="product-search"
            type="text"
            placeholder="Search by name, code, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
        <button onClick={fetchProducts} className="btn-ghost btn-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description={search ? 'Try a different search.' : 'Add your first product to get started.'}
            action={!search && (
              <button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }} className="btn-primary btn-sm">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            )}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price (NPR)</th>
                  <th>Stock</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><span className="badge badge-green font-mono">{p.product_code}</span></td>
                    <td className="font-medium text-gray-900">{p.name}</td>
                    <td>
                      {p.category ? (
                        <span className="badge badge-yellow">{p.category}</span>
                      ) : '—'}
                    </td>
                    <td className="font-medium">{formatCurrency(p.price)}</td>
                    <td>
                      <span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="text-gray-400 text-xs">{formatDate(p.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelectedProduct(p); setIsFormOpen(true); }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedProduct(p); setIsDeleteOpen(true); }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedProduct ? 'Edit Product' : 'Add New Product'}>
        <ProductForm onSubmit={handleFormSubmit} loading={formLoading} initialData={selectedProduct} />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"?`}
        confirmText="Delete Product"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Products;
