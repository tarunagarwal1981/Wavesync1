import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plane, 
  Download, 
  Eye, 
  Upload, 
  Edit, 
  Plus,
  Calendar,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Building
} from 'lucide-react';
import styles from './Travel.module.css';

interface TravelPlan {
  id: string;
  seafarerId: string;
  seafarerName: string;
  vesselName: string;
  departureDate: string;
  arrivalDate: string;
  departurePort: string;
  arrivalPort: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  documents: TravelDocument[];
  createdBy: string;
  createdAt: string;
}

interface TravelDocument {
  id: string;
  type: 'ticket' | 'visa' | 'passport' | 'medical' | 'other';
  title: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

const mockTravelPlans: TravelPlan[] = [
  {
    id: 'tp-001',
    seafarerId: 'sf-001',
    seafarerName: 'Alistair Thomson',
    vesselName: 'MV Ocean Pioneer',
    departureDate: '2024-02-15',
    arrivalDate: '2024-02-20',
    departurePort: 'Southampton, UK',
    arrivalPort: 'Hamburg, Germany',
    status: 'confirmed',
    documents: [
      {
        id: 'td-001',
        type: 'ticket',
        title: 'Flight Ticket - BA1234',
        fileUrl: '/documents/flight-ticket.pdf',
        uploadedAt: '2024-01-20',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'td-002',
        type: 'visa',
        title: 'Schengen Visa',
        fileUrl: '/documents/visa.pdf',
        uploadedAt: '2024-01-18',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'td-003',
        type: 'medical',
        title: 'COVID-19 Vaccination Certificate',
        fileUrl: '/documents/vaccination.pdf',
        uploadedAt: '2024-01-22',
        uploadedBy: 'Sarah Johnson'
      }
    ],
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-15'
  },
  {
    id: 'tp-002',
    seafarerId: 'sf-002',
    seafarerName: 'Marcus Rodriguez',
    vesselName: 'MV Atlantic Star',
    departureDate: '2024-02-28',
    arrivalDate: '2024-03-05',
    departurePort: 'Rotterdam, Netherlands',
    arrivalPort: 'New York, USA',
    status: 'pending',
    documents: [
      {
        id: 'td-004',
        type: 'ticket',
        title: 'Flight Ticket - KLM 6447',
        fileUrl: '/documents/flight-klm.pdf',
        uploadedAt: '2024-02-10',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'td-005',
        type: 'visa',
        title: 'US B1/B2 Visa',
        fileUrl: '/documents/us-visa.pdf',
        uploadedAt: '2024-02-08',
        uploadedBy: 'Sarah Johnson'
      }
    ],
    createdBy: 'Sarah Johnson',
    createdAt: '2024-02-05'
  },
  {
    id: 'tp-003',
    seafarerId: 'sf-003',
    seafarerName: 'Elena Kowalski',
    vesselName: 'MV Pacific Explorer',
    departureDate: '2024-03-10',
    arrivalDate: '2024-03-15',
    departurePort: 'Singapore',
    arrivalPort: 'Tokyo, Japan',
    status: 'completed',
    documents: [
      {
        id: 'td-006',
        type: 'ticket',
        title: 'Flight Ticket - SQ 12',
        fileUrl: '/documents/flight-sq.pdf',
        uploadedAt: '2024-02-25',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'td-007',
        type: 'visa',
        title: 'Japan Tourist Visa',
        fileUrl: '/documents/japan-visa.pdf',
        uploadedAt: '2024-02-20',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'td-008',
        type: 'medical',
        title: 'Yellow Fever Certificate',
        fileUrl: '/documents/yellow-fever.pdf',
        uploadedAt: '2024-02-22',
        uploadedBy: 'Sarah Johnson'
      }
    ],
    createdBy: 'Sarah Johnson',
    createdAt: '2024-02-15'
  },
  {
    id: 'tp-004',
    seafarerId: 'sf-004',
    seafarerName: 'James Mitchell',
    vesselName: 'MV Mediterranean Queen',
    departureDate: '2024-03-20',
    arrivalDate: '2024-03-25',
    departurePort: 'Barcelona, Spain',
    arrivalPort: 'Istanbul, Turkey',
    status: 'confirmed',
    documents: [
      {
        id: 'td-009',
        type: 'ticket',
        title: 'Flight Ticket - TK 1856',
        fileUrl: '/documents/flight-tk.pdf',
        uploadedAt: '2024-03-05',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'td-010',
        type: 'visa',
        title: 'Turkey eVisa',
        fileUrl: '/documents/turkey-visa.pdf',
        uploadedAt: '2024-03-03',
        uploadedBy: 'Sarah Johnson'
      }
    ],
    createdBy: 'Sarah Johnson',
    createdAt: '2024-02-28'
  }
];

export const TravelModule: React.FC = () => {
  const { user } = useAuth();
  const [travelPlans] = useState<TravelPlan[]>(mockTravelPlans);

  const isSeafarer = user?.role === 'seafarer';
  const isCompanyUser = user?.role === 'company_user';
  const isAdmin = user?.role === 'admin';

  const renderSeafarerView = () => (
    <div className={styles.travelContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Travel Plans</h1>
        <p className={styles.subtitle}>View your travel arrangements and download documents</p>
      </div>

      <div className={styles.plansGrid}>
        {travelPlans.map(plan => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planInfo}>
                <h3 className={styles.vesselName}>{plan.vesselName}</h3>
                <p className={styles.route}>
                  <MapPin size={16} />
                  {plan.departurePort} → {plan.arrivalPort}
                </p>
              </div>
              <span className={`${styles.status} ${styles[plan.status]}`}>
                {plan.status}
              </span>
            </div>

            <div className={styles.planDetails}>
              <div className={styles.detailItem}>
                <Calendar size={16} />
                <span>Departure: {new Date(plan.departureDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <Calendar size={16} />
                <span>Arrival: {new Date(plan.arrivalDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.documents}>
              <h4 className={styles.documentsTitle}>Travel Documents</h4>
              <div className={styles.documentsList}>
                {plan.documents.map(doc => (
                  <div key={doc.id} className={styles.documentItem}>
                    <FileText size={16} />
                    <span className={styles.documentTitle}>{doc.title}</span>
                    <button className={styles.downloadBtn}>
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.planActions}>
              <button className={styles.viewBtn}>
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompanyView = () => (
    <div className={styles.travelContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Travel Management</h1>
        <p className={styles.subtitle}>Create and manage crew travel plans</p>
        <button className={styles.createBtn}>
          <Plus size={16} />
          Create Travel Plan
        </button>
      </div>

      <div className={styles.plansGrid}>
        {travelPlans.map(plan => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planInfo}>
                <h3 className={styles.vesselName}>{plan.vesselName}</h3>
                <p className={styles.seafarerName}>
                  <User size={16} />
                  {plan.seafarerName}
                </p>
              </div>
              <span className={`${styles.status} ${styles[plan.status]}`}>
                {plan.status}
              </span>
            </div>

            <div className={styles.planDetails}>
              <div className={styles.detailItem}>
                <MapPin size={16} />
                <span>{plan.departurePort} → {plan.arrivalPort}</span>
              </div>
              <div className={styles.detailItem}>
                <Calendar size={16} />
                <span>{new Date(plan.departureDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.documents}>
              <h4 className={styles.documentsTitle}>Documents ({plan.documents.length})</h4>
              <div className={styles.documentsList}>
                {plan.documents.map(doc => (
                  <div key={doc.id} className={styles.documentItem}>
                    <FileText size={16} />
                    <span className={styles.documentTitle}>{doc.title}</span>
                    <div className={styles.documentActions}>
                      <button className={styles.editBtn}>
                        <Edit size={14} />
                      </button>
                      <button className={styles.downloadBtn}>
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.planActions}>
              <button className={styles.editBtn}>
                <Edit size={16} />
                Edit Plan
              </button>
              <button className={styles.uploadBtn}>
                <Upload size={16} />
                Upload Document
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className={styles.travelContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Travel Oversight</h1>
        <p className={styles.subtitle}>Monitor all travel plans across the platform</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Plane size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{travelPlans.length}</h3>
            <p className={styles.statLabel}>Active Travel Plans</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{travelPlans.filter(p => p.status === 'completed').length}</h3>
            <p className={styles.statLabel}>Completed This Month</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{travelPlans.filter(p => p.status === 'pending').length}</h3>
            <p className={styles.statLabel}>Pending Approval</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Building size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>3</h3>
            <p className={styles.statLabel}>Companies Using Travel</p>
          </div>
        </div>
      </div>

      <div className={styles.plansGrid}>
        {travelPlans.map(plan => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planInfo}>
                <h3 className={styles.vesselName}>{plan.vesselName}</h3>
                <p className={styles.seafarerName}>
                  <User size={16} />
                  {plan.seafarerName}
                </p>
                <p className={styles.companyName}>
                  <Building size={16} />
                  Ocean Logistics Ltd
                </p>
              </div>
              <span className={`${styles.status} ${styles[plan.status]}`}>
                {plan.status}
              </span>
            </div>

            <div className={styles.planDetails}>
              <div className={styles.detailItem}>
                <MapPin size={16} />
                <span>{plan.departurePort} → {plan.arrivalPort}</span>
              </div>
              <div className={styles.detailItem}>
                <Calendar size={16} />
                <span>{new Date(plan.departureDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <Clock size={16} />
                <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.planActions}>
              <button className={styles.viewBtn}>
                <Eye size={16} />
                View Details
              </button>
              <button className={styles.editBtn}>
                <Edit size={16} />
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isSeafarer) {
    return renderSeafarerView();
  } else if (isCompanyUser) {
    return renderCompanyView();
  } else if (isAdmin) {
    return renderAdminView();
  }

  return null;
};

export default TravelModule;
