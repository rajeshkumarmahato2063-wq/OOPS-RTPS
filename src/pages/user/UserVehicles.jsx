import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  INITIAL_VEHICLES, 
  fetchVehiclesDB, 
  insertVehicleDB, 
  updateVehicleDB, 
  deleteVehicleDB 
} from '../../lib/supabase';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';
import { CardSkeleton, Spinner } from '../../components/common/Skeleton';
import { Car, Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, Zap, Tag, Palette } from 'lucide-react';

const UserVehicles = () => {
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('fast_parking_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'Sedan',
    brand: '',
    model: '',
    color: 'Midnight Black',
    isDefault: false
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch from Supabase DB on mount
  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      const remoteVehicles = await fetchVehiclesDB();
      if (remoteVehicles && remoteVehicles.length > 0) {
        setVehicles(remoteVehicles);
      }
      setIsLoading(false);
    };
    loadVehicles();
  }, []);

  // Save persistent localStorage fallback
  useEffect(() => {
    localStorage.setItem('fast_parking_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const resetForm = () => {
    setFormData({
      licensePlate: '',
      vehicleType: 'Sedan',
      brand: '',
      model: '',
      color: 'Midnight Black',
      isDefault: false
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.licensePlate.trim()) {
      errors.licensePlate = 'Vehicle Number (License Plate) is required.';
    } else if (formData.licensePlate.trim().length < 3) {
      errors.licensePlate = 'License plate must be at least 3 characters.';
    }
    if (!formData.brand.trim()) {
      errors.brand = 'Brand is required (e.g. Tesla, Toyota).';
    }
    if (!formData.model.trim()) {
      errors.model = 'Model is required (e.g. Model Y, Camry).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create Vehicle
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const newVehicleObj = {
      id: 'v-' + Date.now(),
      licensePlate: formData.licensePlate.toUpperCase().trim(),
      vehicleType: formData.vehicleType,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      color: formData.color.trim(),
      isDefault: formData.isDefault || vehicles.length === 0
    };

    // Sync Supabase DB
    await insertVehicleDB(newVehicleObj);

    // If marked default, unset others
    if (newVehicleObj.isDefault) {
      setVehicles(prev => prev.map(v => ({ ...v, isDefault: false })));
    }

    setVehicles(prev => [newVehicleObj, ...prev]);
    setIsSubmitting(false);
    setShowAddModal(false);
    resetForm();
    setFeedback({ type: 'success', message: `Vehicle ${newVehicleObj.licensePlate} added successfully!` });
  };

  // Open Edit Modal
  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      licensePlate: v.licensePlate,
      vehicleType: v.vehicleType || 'Sedan',
      brand: v.brand || '',
      model: v.model || '',
      color: v.color || 'Midnight Black',
      isDefault: !!v.isDefault
    });
    setFormErrors({});
  };

  // Update Vehicle
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const updatedObj = {
      ...editingVehicle,
      licensePlate: formData.licensePlate.toUpperCase().trim(),
      vehicleType: formData.vehicleType,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      color: formData.color.trim(),
      isDefault: formData.isDefault
    };

    // Sync Supabase DB
    await updateVehicleDB(editingVehicle.id, updatedObj);

    setVehicles(prev => prev.map(v => {
      if (updatedObj.isDefault) {
        return v.id === editingVehicle.id ? updatedObj : { ...v, isDefault: false };
      }
      return v.id === editingVehicle.id ? updatedObj : v;
    }));

    setIsSubmitting(false);
    setEditingVehicle(null);
    resetForm();
    setFeedback({ type: 'success', message: `Vehicle ${updatedObj.licensePlate} updated successfully!` });
  };

  // Delete Vehicle
  const handleDeleteConfirm = async () => {
    if (!deletingVehicleId) return;

    setIsSubmitting(true);
    setFeedback(null);

    const targetVehicle = vehicles.find(v => v.id === deletingVehicleId);

    // Sync Supabase DB
    await deleteVehicleDB(deletingVehicleId);

    setVehicles(prev => prev.filter(v => v.id !== deletingVehicleId));
    setIsSubmitting(false);
    setDeletingVehicleId(null);
    setFeedback({ type: 'success', message: `Vehicle ${targetVehicle?.licensePlate || ''} deleted successfully.` });
  };

  // Toggle Default
  const handleSetDefault = (id) => {
    setVehicles(prev => prev.map(v => ({ ...v, isDefault: v.id === id })));
    setFeedback({ type: 'success', message: 'Default vehicle updated.' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-indigo-400" />
            My Registered Vehicles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage saved vehicle plates, brand, model, and colors for automated barrier gate entry.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Vehicles List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon="car"
          title="No Vehicles Registered"
          description="You haven't saved any vehicle license plates yet. Add your vehicle to enable automatic gate opening."
          actionText="Add Vehicle Now"
          onAction={() => {
            resetForm();
            setShowAddModal(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all">
              
              {/* Card Header: Plate & Default Pill */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-black text-sm">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">License Plate</span>
                    <div className="text-lg font-black text-white font-mono tracking-wider">{v.licensePlate}</div>
                  </div>
                </div>

                {v.isDefault ? (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(v.id)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 underline"
                  >
                    Set Default
                  </button>
                )}
              </div>

              {/* Vehicle Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 flex items-center gap-1"><Tag className="w-3 h-3" /> Type:</span>
                  <span className="font-bold text-slate-200">{v.vehicleType || 'Sedan'}</span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center gap-1"><Car className="w-3 h-3" /> Brand:</span>
                  <span className="font-bold text-indigo-300">{v.brand || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Model:</span>
                  <span className="font-bold text-slate-200">{v.model || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center gap-1"><Palette className="w-3 h-3" /> Color:</span>
                  <span className="font-bold text-amber-300">{v.color || 'N/A'}</span>
                </div>
              </div>

              {/* Card Actions: Edit & Delete */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingVehicleId(v.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Vehicle" maxWidth="max-w-lg">
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Number (License Plate) *</label>
              <input
                type="text"
                required
                placeholder="e.g. NY-FAST-88"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase font-bold text-sm tracking-wider focus:outline-hidden focus:border-indigo-500"
              />
              {formErrors.licensePlate && <p className="text-rose-400 text-[11px] mt-1">{formErrors.licensePlate}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle Category *</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Sedan">Sedan / Compact</option>
                  <option value="SUV">SUV / Crossover</option>
                  <option value="EV SUV">⚡ Electric Vehicle (EV)</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Truck">Van / Light Truck</option>
                  <option value="Motorcycle">Motorcycle / Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tesla, BMW, Toyota"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
                {formErrors.brand && <p className="text-rose-400 text-[11px] mt-1">{formErrors.brand}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Model Y, Camry, M3"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
                {formErrors.model && <p className="text-rose-400 text-[11px] mt-1">{formErrors.model}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Color *</label>
                <input
                  type="text"
                  placeholder="e.g. Pearl White, Midnight Black"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="addDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 accent-indigo-500"
              />
              <label htmlFor="addDefault" className="text-slate-300 cursor-pointer">Set as primary default vehicle</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />}
              <span>{isSubmitting ? 'Saving Vehicle...' : 'Save Vehicle'}</span>
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <Modal isOpen={!!editingVehicle} onClose={() => setEditingVehicle(null)} title="Edit Registered Vehicle" maxWidth="max-w-lg">
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Number (License Plate) *</label>
              <input
                type="text"
                required
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase font-bold text-sm tracking-wider focus:outline-hidden focus:border-indigo-500"
              />
              {formErrors.licensePlate && <p className="text-rose-400 text-[11px] mt-1">{formErrors.licensePlate}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle Category *</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Sedan">Sedan / Compact</option>
                  <option value="SUV">SUV / Crossover</option>
                  <option value="EV SUV">⚡ Electric Vehicle (EV)</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Truck">Van / Light Truck</option>
                  <option value="Motorcycle">Motorcycle / Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Color *</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 accent-indigo-500"
              />
              <label htmlFor="editDefault" className="text-slate-300 cursor-pointer">Set as primary default vehicle</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Spinner size="sm" /> : null}
              <span>{isSubmitting ? 'Updating...' : 'Update Vehicle Details'}</span>
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVehicleId && (
        <Modal isOpen={!!deletingVehicleId} onClose={() => setDeletingVehicleId(null)} title="Confirm Vehicle Removal">
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Are you sure you want to remove this vehicle from your account? Saved ticket passes will retain historic plate records.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVehicleId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                {isSubmitting ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default UserVehicles;
