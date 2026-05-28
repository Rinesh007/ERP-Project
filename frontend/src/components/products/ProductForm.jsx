// src/components/products/ProductForm.jsx — Add/Edit product form
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Spinner from '../ui/Spinner';

const CATEGORIES = [
  'Gold Jewelry',
  'Silver Jewelry',
  'Diamond Jewelry',
  'Gemstone Jewelry',
  'Platinum Jewelry',
  'Bridal Jewelry',
  'Costume Jewelry',
  'Other',
];

const ProductForm = ({ onSubmit, loading, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price || '',
        stock: initialData.stock || 0,
      });
    } else {
      reset({ name: '', category: '', price: '', stock: 0 });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Name */}
      <div>
        <label className="form-label">Product Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          placeholder="e.g. Gold Necklace 22K"
          {...register('name', { required: 'Product name is required' })}
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="form-label">Category</label>
        <select className="form-input" {...register('category')}>
          <option value="">— Select Category —</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Price (NPR) <span className="text-red-500">*</span></label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-input ${errors.price ? 'form-input-error' : ''}`}
            placeholder="0.00"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be ≥ 0' },
            })}
          />
          {errors.price && <p className="form-error">{errors.price.message}</p>}
        </div>
        <div>
          <label className="form-label">Stock (Units)</label>
          <input
            type="number"
            min="0"
            className="form-input"
            placeholder="0"
            {...register('stock', {
              min: { value: 0, message: 'Stock must be ≥ 0' },
            })}
          />
          {errors.stock && <p className="form-error">{errors.stock.message}</p>}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="submit" id="product-form-submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
