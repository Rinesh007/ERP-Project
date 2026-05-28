// src/pages/Customers.jsx — Customer management page
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CustomerForm from '../components/customers/CustomerForm';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { customerService } from '../services/customer.service';
import { formatDate } from '../utils/formatters';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll(search);
      setCustomers(res.data.data);
    } catch (err) {
      toast.error('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, data);
        toast.success('Customer updated successfully.');
      } else {
        await customerService.create(data);
        toast.success('Customer added successfully.');
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    setDeleteLoading(true);
    try {
      await customerService.delete(selectedCustomer.id);
      toast.success('Customer deleted.');
      setIsDeleteOpen(false);
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed.';
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} records</p>
        </div>
        <button id="add-customer-btn" onClick={handleAddClick} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Search + Toolbar */}
      <div className="card px-4 py-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            id="customer-search"
            placeholder="Search by name, phone, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
        <button onClick={fetchCustomers} className="btn-ghost btn-sm" title="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description={search ? 'Try a different search term.' : 'Add your first customer to get started.'}
            action={
              !search && (
                <button onClick={handleAddClick} className="btn-primary btn-sm">
                  <Plus className="h-4 w-4" /> Add Customer
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>PAN Number</th>
                  <th>Address</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge badge-blue font-mono">{c.customer_code}</span>
                    </td>
                    <td className="font-medium text-gray-900">{c.name}</td>
                    <td className="text-gray-500">{c.phone || '—'}</td>
                    <td className="text-gray-500 font-mono text-xs">{c.pan_number || '—'}</td>
                    <td className="text-gray-500 max-w-[160px] truncate">{c.address || '—'}</td>
                    <td className="text-gray-400 text-xs">{formatDate(c.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <CustomerForm
          onSubmit={handleFormSubmit}
          loading={formLoading}
          initialData={selectedCustomer}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${selectedCustomer?.name}"? This action cannot be undone.`}
        confirmText="Delete Customer"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Customers;
