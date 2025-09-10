import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginForm } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user data for demo purposes
const mockUsers: Record<string, User> = {
  'seafarer@wavesync.com': {
    id: '1',
    email: 'seafarer@wavesync.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1-555-0123',
    role: 'seafarer' as any,
    status: 'active' as any,
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    seafarerId: 'SF001',
    dateOfBirth: '1985-06-15',
    nationality: 'British',
    passportNumber: 'GB123456789',
    passportExpiry: '2030-06-15',
    seamanBookNumber: 'SB987654321',
    seamanBookExpiry: '2029-06-15',
    rank: 'chief_officer' as any,
    department: 'deck' as any,
    experience: 12,
    certifications: ['STCW', 'GMDSS', 'ARPA'],
    languages: ['English', 'Spanish'],
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '+1-555-0124',
      email: 'jane.smith@email.com'
    },
    address: {
      street: '123 Maritime Street',
      city: 'Southampton',
      state: 'Hampshire',
      country: 'United Kingdom',
      postalCode: 'SO14 2AR'
    },
    bankDetails: {
      bankName: 'Lloyds Bank',
      accountNumber: '12345678',
      routingNumber: '30-00-00',
      swiftCode: 'LOYDGB2L'
    },
    nextOfKin: {
      name: 'Robert Smith',
      relationship: 'Father',
      phone: '+1-555-0125',
      address: {
        street: '456 Ocean View',
        city: 'Portsmouth',
        state: 'Hampshire',
        country: 'United Kingdom',
        postalCode: 'PO1 3AX'
      }
    },
    medicalHistory: {
      bloodType: 'O+',
      allergies: ['Shellfish'],
      medications: [],
      conditions: [],
      lastMedicalCheck: '2024-01-15'
    },
    employmentHistory: [
      {
        vesselName: 'MV Atlantic Star',
        vesselType: 'container' as any,
        rank: 'second_officer' as any,
        startDate: '2022-01-01',
        endDate: '2023-12-31',
        duration: 24,
        company: 'Atlantic Shipping Ltd',
        reasonForLeaving: 'Contract completion'
      }
    ]
  },
  'company@wavesync.com': {
    id: '2',
    email: 'company@wavesync.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1-555-0126',
    role: 'company_user' as any,
    status: 'active' as any,
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    companyId: 'COMP001',
    companyName: 'Ocean Logistics Ltd',
    position: 'Crew Manager',
    department: 'Operations',
    permissions: ['view_assignments', 'create_assignments', 'manage_crew']
  },
  'admin@wavesync.com': {
    id: '3',
    email: 'admin@wavesync.com',
    firstName: 'Michael',
    lastName: 'Brown',
    phone: '+1-555-0127',
    role: 'admin' as any,
    status: 'active' as any,
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    permissions: ['all'],
    accessLevel: 'admin' as any
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - in real app, this would be an API call
      const user = mockUsers[email.toLowerCase()];
      
      if (!user || password !== 'password123') {
        throw new Error('Invalid credentials');
      }
      
      // Generate mock token
      const token = `mock_token_${Date.now()}`;
      
      // Store authentication data
      if (rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userData', JSON.stringify(user));
      }
      
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      
      // Update stored user data
      const storage = localStorage.getItem('userData') ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
