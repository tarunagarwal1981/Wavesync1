import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import styles from './CompanyManagement.module.css';

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
}

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch companies',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            website: formData.website || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCompany.id);

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Company updated successfully',
          duration: 5000
        });
      } else {
        // Create new company
        const { error } = await supabase
          .from('companies')
          .insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            website: formData.website || null
          }]);

        if (error) throw error;

        addToast({
          type: 'success',
          title: 'Company created successfully',
          duration: 5000
        });
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        website: ''
      });
      setShowCreateForm(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      addToast({
        type: 'error',
        title: editingCompany ? 'Failed to update company' : 'Failed to create company',
        duration: 5000
      });
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      website: company.website || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Company deleted successfully',
        duration: 5000
      });

      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete company',
        duration: 5000
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      website: ''
    });
    setEditingCompany(null);
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Company Management</h1>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create Company
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.formContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>{editingCompany ? 'Edit Company' : 'Create New Company'}</h2>
              <button className={styles.closeButton} onClick={resetForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Company Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company email"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter company address"
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingCompany ? 'Update Company' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.companiesGrid}>
        {companies.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Companies Found</h3>
            <p>Get started by creating your first company.</p>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create Company
            </button>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className={styles.companyCard}>
              <div className={styles.companyHeader}>
                <div className={styles.companyInfo}>
                  <h3 className={styles.companyName}>{company.name}</h3>
                  <p className={styles.companyEmail}>{company.email}</p>
                </div>
                <div className={styles.companyActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(company)}
                    title="Edit company"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(company.id)}
                    title="Delete company"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.companyDetails}>
                {company.phone && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08C5.16 1.08 5.35 2.05 5.72 2.95C5.85 3.28 5.8 3.65 5.6 3.95L4.31 5.24C5.77 8.1 7.9 10.23 10.76 11.69L12.05 10.4C12.35 10.2 12.72 10.15 13.05 10.28C13.95 10.65 14.92 10.84 15.92 10.84C16.52 10.84 17 11.32 17 11.92V14.92C17 15.52 16.52 16 15.92 16Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{company.phone}</span>
                  </div>
                )}

                {company.website && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website}
                    </a>
                  </div>
                )}

                {company.address && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{company.address}</span>
                  </div>
                )}
              </div>

              <div className={styles.companyFooter}>
                <span className={styles.createdDate}>
                  Created: {new Date(company.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
