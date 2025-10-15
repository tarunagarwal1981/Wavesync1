import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import styles from './VesselManagement.module.css';

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  flag?: string;
  company_id?: string;
  status: string;
  capacity?: number;
  built_year?: number;
  gross_tonnage?: number;
  created_at: string;
  updated_at: string;
  company?: {
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
}

interface VesselFormData {
  name: string;
  imo_number: string;
  vessel_type: string;
  flag: string;
  company_id: string;
  status: string;
  capacity: number;
  built_year: number;
  gross_tonnage: number;
}

const VesselManagement: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>({
    name: '',
    imo_number: '',
    vessel_type: 'container',
    flag: '',
    company_id: '',
    status: 'active',
    capacity: 0,
    built_year: new Date().getFullYear(),
    gross_tonnage: 0
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchVessels();
    fetchCompanies();
  }, []);

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vessels')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVessels(data || []);
    } catch (error) {
      console.error('Error fetching vessels:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch vessels',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'built_year' || name === 'gross_tonnage' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVessel) {
        // Update existing vessel
        const { error } = await supabase
          .from('vessels')
          .update({
            name: formData.name,
            imo_number: formData.imo_number || null,
            vessel_type: formData.vessel_type,
            flag: formData.flag || null,
            company_id: formData.company_id || null,
            status: formData.status,
            capacity: formData.capacity || null,
            built_year: formData.built_year || null,
            gross_tonnage: formData.gross_tonnage || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVessel.id);

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Vessel updated successfully',
          duration: 5000
        });
      } else {
        // Create new vessel
        const { error } = await supabase
          .from('vessels')
          .insert({
            name: formData.name,
            imo_number: formData.imo_number || null,
            vessel_type: formData.vessel_type,
            flag: formData.flag || null,
            company_id: formData.company_id || null,
            status: formData.status,
            capacity: formData.capacity || null,
            built_year: formData.built_year || null,
            gross_tonnage: formData.gross_tonnage || null
          });

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Vessel created successfully',
          duration: 5000
        });
      }

      // Reset form and refresh data
      resetForm();
      fetchVessels();
    } catch (error) {
      console.error('Error saving vessel:', error);
      addToast({
        type: 'error',
        title: editingVessel ? 'Failed to update vessel' : 'Failed to create vessel',
        duration: 5000
      });
    }
  };

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      imo_number: vessel.imo_number || '',
      vessel_type: vessel.vessel_type,
      flag: vessel.flag || '',
      company_id: vessel.company_id || '',
      status: vessel.status,
      capacity: vessel.capacity || 0,
      built_year: vessel.built_year || new Date().getFullYear(),
      gross_tonnage: vessel.gross_tonnage || 0
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (vesselId: string) => {
    if (!confirm('Are you sure you want to delete this vessel? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vessels')
        .delete()
        .eq('id', vesselId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Vessel deleted successfully',
        duration: 5000
      });

      fetchVessels();
    } catch (error) {
      console.error('Error deleting vessel:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete vessel',
        duration: 5000
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      imo_number: '',
      vessel_type: 'container',
      flag: '',
      company_id: '',
      status: 'active',
      capacity: 0,
      built_year: new Date().getFullYear(),
      gross_tonnage: 0
    });
    setEditingVessel(null);
    setShowCreateForm(false);
  };

  const getVesselTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'container': 'Container Ship',
      'bulk_carrier': 'Bulk Carrier',
      'tanker': 'Tanker',
      'cargo': 'Cargo Ship',
      'passenger': 'Passenger Ship',
      'offshore': 'Offshore Vessel',
      'tug': 'Tug Boat',
      'fishing': 'Fishing Vessel',
      'yacht': 'Yacht',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'var(--color-success)',
      'maintenance': 'var(--color-warning)',
      'dry_dock': 'var(--color-warning)',
      'retired': 'var(--text-secondary)',
      'sold': 'var(--text-secondary)'
    };
    return colors[status] || 'var(--text-secondary)';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading vessels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Vessel Management</h1>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create Vessel
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.formContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>{editingVessel ? 'Edit Vessel' : 'Create New Vessel'}</h2>
              <button className={styles.closeButton} onClick={resetForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Vessel Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter vessel name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="imo_number">IMO Number</label>
                  <input
                    type="text"
                    id="imo_number"
                    name="imo_number"
                    value={formData.imo_number}
                    onChange={handleInputChange}
                    placeholder="Enter IMO number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="vessel_type">Vessel Type *</label>
                  <select
                    id="vessel_type"
                    name="vessel_type"
                    value={formData.vessel_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="container">Container Ship</option>
                    <option value="bulk_carrier">Bulk Carrier</option>
                    <option value="tanker">Tanker</option>
                    <option value="cargo">Cargo Ship</option>
                    <option value="passenger">Passenger Ship</option>
                    <option value="offshore">Offshore Vessel</option>
                    <option value="tug">Tug Boat</option>
                    <option value="fishing">Fishing Vessel</option>
                    <option value="yacht">Yacht</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="flag">Flag</label>
                  <input
                    type="text"
                    id="flag"
                    name="flag"
                    value={formData.flag}
                    onChange={handleInputChange}
                    placeholder="Enter flag state"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="company_id">Company</label>
                  <select
                    id="company_id"
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="dry_dock">Dry Dock</option>
                    <option value="retired">Retired</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="capacity">Capacity (TEU/DWT)</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Enter capacity"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="built_year">Built Year</label>
                  <input
                    type="number"
                    id="built_year"
                    name="built_year"
                    value={formData.built_year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    placeholder="Enter built year"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="gross_tonnage">Gross Tonnage</label>
                  <input
                    type="number"
                    id="gross_tonnage"
                    name="gross_tonnage"
                    value={formData.gross_tonnage}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter gross tonnage"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingVessel ? 'Update Vessel' : 'Create Vessel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.vesselsGrid}>
        {vessels.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Vessels Found</h3>
            <p>Get started by creating your first vessel.</p>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create Vessel
            </button>
          </div>
        ) : (
          vessels.map((vessel) => (
            <div key={vessel.id} className={styles.vesselCard}>
              <div className={styles.vesselHeader}>
                <div className={styles.vesselInfo}>
                  <h3 className={styles.vesselName}>{vessel.name}</h3>
                  <p className={styles.vesselType}>{getVesselTypeLabel(vessel.vessel_type)}</p>
                  <div className={styles.vesselStatus} style={{ color: getStatusColor(vessel.status) }}>
                    {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)}
                  </div>
                </div>
                <div className={styles.vesselActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(vessel)}
                    title="Edit vessel"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(vessel.id)}
                    title="Delete vessel"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.vesselDetails}>
                {vessel.imo_number && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>IMO: {vessel.imo_number}</span>
                  </div>
                )}

                {vessel.flag && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 15S1 9 1 9S4 3 4 3S7 9 7 9S4 15 4 15Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 3V21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Flag: {vessel.flag}</span>
                  </div>
                )}

                {vessel.company && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{vessel.company.name}</span>
                  </div>
                )}

                {vessel.capacity && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Capacity: {vessel.capacity.toLocaleString()}</span>
                  </div>
                )}

                {vessel.built_year && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Built: {vessel.built_year}</span>
                  </div>
                )}

                {vessel.gross_tonnage && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>GT: {vessel.gross_tonnage.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className={styles.vesselFooter}>
                <span className={styles.createdDate}>
                  Created: {new Date(vessel.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VesselManagement;
