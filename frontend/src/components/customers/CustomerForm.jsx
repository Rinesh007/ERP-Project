// src/components/customers/CustomerForm.jsx — Add/Edit customer form
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Spinner from '../ui/Spinner';

const CustomerForm = ({ onSubmit, loading, initialData }) => {
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
        phone: initialData.phone || '',
        pan_number: initialData.pan_number || '',
        address: initialData.address || '',
      });
    } else {
      reset({ name: '', phone: '', pan_number: '', address: '' });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Name */}
      <div>
        <label className="form-label">Customer Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          placeholder="Enter customer name"
          {...register('name', { required: 'Customer name is required' })}
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="form-label">Phone Number</label>
        <input
          type="tel"
          className="form-input"
          placeholder="e.g. 98XXXXXXXX"
          {...register('phone', {
            pattern: { value: /^[0-9+\-\s()]{6,15}$/, message: 'Enter a valid phone number' },
          })}
        />
        {errors.phone && <p className="form-error">{errors.phone.message}</p>}
      </div>

      {/* PAN Number */}
      <div>
        <label className="form-label">PAN Number</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. 123456789"
          {...register('pan_number')}
        />
      </div>

      {/* Address */}
      <div>
        <label className="form-label">Address</label>
        <textarea
          rows={2}
          className="form-input resize-none"
          placeholder="Enter customer address"
          {...register('address')}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" id="customer-form-submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'Saving...' : initialData ? 'Update Customer' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
