import { User, Vessel, Assignment, Document, Task, Course, Notification, UserRole, VesselType, AssignmentStatus, DocumentType, TaskStatus, TrainingStatus, NotificationType } from '../types';

// ============================================================================
// MOCK USERS - Seafarers and Company Users
// ============================================================================

export const mockUsers: User[] = [
  {
    id: "user1",
    email: "alistair.thomson@maritime.com",
    firstName: "Alistair",
    lastName: "Thomson",
    phone: "+44-20-7946-0958",
    role: UserRole.SEAFARER,
    status: "active" as any,
    avatar: undefined,
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    lastLoginAt: "2024-12-10T08:30:00Z",
    seafarerId: "SF001",
    dateOfBirth: "1985-03-15",
    nationality: "British",
    passportNumber: "GB123456789",
    passportExpiry: "2030-03-15",
    seamanBookNumber: "SB987654321",
    seamanBookExpiry: "2029-03-15",
    rank: "chief_officer" as any,
    department: "deck" as any,
    experience: 12,
    certifications: ["STCW", "GMDSS", "ARPA", "ECDIS"],
    languages: ["English", "Spanish"],
    emergencyContact: {
      name: "Sarah Thomson",
      relationship: "Spouse",
      phone: "+44-20-7946-0959",
      email: "sarah.thomson@email.com"
    },
    address: {
      street: "123 Maritime Street",
      city: "Southampton",
      state: "Hampshire",
      country: "United Kingdom",
      postalCode: "SO14 2AR"
    },
    bankDetails: {
      bankName: "Lloyds Bank",
      accountNumber: "12345678",
      routingNumber: "30-00-00",
      swiftCode: "LOYDGB2L"
    },
    nextOfKin: {
      name: "Robert Thomson",
      relationship: "Father",
      phone: "+44-20-7946-0960",
      address: {
        street: "456 Ocean View",
        city: "Portsmouth",
        state: "Hampshire",
        country: "United Kingdom",
        postalCode: "PO1 3AX"
      }
    },
    medicalHistory: {
      bloodType: "O+",
      allergies: ["Shellfish"],
      medications: [],
      conditions: [],
      lastMedicalCheck: "2024-01-15"
    },
    employmentHistory: [
      {
        vesselName: "MV Atlantic Star",
        vesselType: "container" as any,
        rank: "second_officer" as any,
        startDate: "2022-01-01",
        endDate: "2023-12-31",
        duration: 24,
        company: "Atlantic Shipping Ltd",
        reasonForLeaving: "Contract completion"
      }
    ]
  },
  {
    id: "user2",
    email: "maria.rodriguez@maritime.com",
    firstName: "Maria",
    lastName: "Rodriguez",
    phone: "+34-91-123-4567",
    role: UserRole.SEAFARER,
    status: "active" as any,
    avatar: undefined,
    createdAt: "2023-02-20T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    lastLoginAt: "2024-12-09T14:20:00Z",
    seafarerId: "SF002",
    dateOfBirth: "1988-07-22",
    nationality: "Spanish",
    passportNumber: "ES987654321",
    passportExpiry: "2029-07-22",
    seamanBookNumber: "SB123456789",
    seamanBookExpiry: "2028-07-22",
    rank: "chief_engineer" as any,
    department: "engine" as any,
    experience: 8,
    certifications: ["STCW", "ENG1", "GMDSS", "ARPA"],
    languages: ["Spanish", "English", "Portuguese"],
    emergencyContact: {
      name: "Carlos Rodriguez",
      relationship: "Brother",
      phone: "+34-91-123-4568",
      email: "carlos.rodriguez@email.com"
    },
    address: {
      street: "Calle del Mar 45",
      city: "Barcelona",
      state: "Catalonia",
      country: "Spain",
      postalCode: "08001"
    },
    bankDetails: {
      bankName: "Banco Santander",
      accountNumber: "87654321",
      swiftCode: "BSCHESMM"
    },
    nextOfKin: {
      name: "Isabella Rodriguez",
      relationship: "Mother",
      phone: "+34-91-123-4569",
      address: {
        street: "Avenida del Puerto 12",
        city: "Valencia",
        state: "Valencia",
        country: "Spain",
        postalCode: "46001"
      }
    },
    medicalHistory: {
      bloodType: "A+",
      allergies: [],
      medications: [],
      conditions: [],
      lastMedicalCheck: "2024-02-20"
    },
    employmentHistory: [
      {
        vesselName: "MT Mediterranean Star",
        vesselType: "tanker" as any,
        rank: "second_engineer" as any,
        startDate: "2023-01-01",
        endDate: "2024-06-30",
        duration: 18,
        company: "Mediterranean Shipping",
        reasonForLeaving: "Career advancement"
      }
    ]
  },
  {
    id: "user3",
    email: "company@maritime.com",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1-555-0126",
    role: UserRole.COMPANY_USER,
    status: "active" as any,
    avatar: undefined,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    lastLoginAt: "2024-12-10T09:15:00Z",
    companyId: "COMP001",
    companyName: "Ocean Logistics Ltd",
    position: "Crew Manager",
    department: "Operations",
    permissions: ["view_assignments", "create_assignments", "manage_crew"]
  }
];

// ============================================================================
// MOCK VESSELS - Different Types and Specifications
// ============================================================================

export const mockVessels: Vessel[] = [
  {
    id: "vessel1",
    name: "MV OCEAN PIONEER",
    imo: "IMO1234567",
    mmsi: "636019825",
    callSign: "9VXP7",
    type: VesselType.CONTAINER,
    flag: "Liberia",
    portOfRegistry: "Monrovia",
    grossTonnage: 75000,
    netTonnage: 45000,
    length: 300,
    beam: 40,
    draft: 15,
    yearBuilt: 2018,
    builder: "Hyundai Heavy Industries",
    engineDetails: {
      type: "MAN B&W 6S80ME-C",
      manufacturer: "MAN Diesel & Turbo",
      power: 25000,
      fuelType: "HFO",
      consumption: 120
    },
    classificationSociety: "Lloyd's Register",
    companyId: "COMP001",
    companyName: "Ocean Logistics Ltd",
    currentLocation: {
      latitude: 1.3521,
      longitude: 103.8198,
      port: "Singapore",
      country: "Singapore",
      lastUpdated: "2024-12-10T10:00:00Z"
    },
    nextPort: {
      name: "Port of Los Angeles",
      country: "United States",
      eta: "2024-12-25T08:00:00Z",
      etd: "2024-12-27T18:00:00Z",
      berth: "Berth 94"
    },
    status: "active" as any,
    crewCapacity: 25,
    passengerCapacity: 0,
    cargoCapacity: 7500,
    specifications: {
      hullMaterial: "Steel",
      propulsion: "Single Screw",
      navigationEquipment: ["GPS", "Radar", "ECDIS", "AIS"],
      communicationEquipment: ["VHF", "HF", "Satellite"],
      safetyEquipment: ["Lifeboats", "Life Rafts", "EPIRB", "SART"],
      cargoEquipment: ["Container Cranes", "Reefer Plugs"],
      specialFeatures: ["Ice Class", "Green Ship Technology"]
    },
    createdAt: "2018-01-01T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z"
  },
  {
    id: "vessel2",
    name: "MT MEDITERRANEAN STAR",
    imo: "IMO2345678",
    mmsi: "636019826",
    callSign: "9VXP8",
    type: VesselType.TANKER,
    flag: "Marshall Islands",
    portOfRegistry: "Majuro",
    grossTonnage: 85000,
    netTonnage: 50000,
    length: 280,
    beam: 45,
    draft: 16,
    yearBuilt: 2019,
    builder: "Daewoo Shipbuilding",
    engineDetails: {
      type: "Wärtsilä RT-flex96C",
      manufacturer: "Wärtsilä",
      power: 28000,
      fuelType: "HFO",
      consumption: 140
    },
    classificationSociety: "DNV GL",
    companyId: "COMP002",
    companyName: "Mediterranean Shipping",
    currentLocation: {
      latitude: 35.6762,
      longitude: 139.6503,
      port: "Tokyo",
      country: "Japan",
      lastUpdated: "2024-12-10T12:00:00Z"
    },
    nextPort: {
      name: "Port of Rotterdam",
      country: "Netherlands",
      eta: "2024-12-28T14:00:00Z",
      etd: "2024-12-30T20:00:00Z",
      berth: "Berth 101"
    },
    status: "active" as any,
    crewCapacity: 22,
    passengerCapacity: 0,
    cargoCapacity: 85000,
    specifications: {
      hullMaterial: "Steel",
      propulsion: "Single Screw",
      navigationEquipment: ["GPS", "Radar", "ECDIS", "AIS"],
      communicationEquipment: ["VHF", "HF", "Satellite"],
      safetyEquipment: ["Lifeboats", "Life Rafts", "EPIRB", "SART"],
      cargoEquipment: ["Cargo Pumps", "Heating Coils"],
      specialFeatures: ["Double Hull", "Inert Gas System"]
    },
    createdAt: "2019-01-01T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z"
  },
  {
    id: "vessel3",
    name: "MV ATLANTIC HORIZON",
    imo: "IMO3456789",
    mmsi: "636019827",
    callSign: "9VXP9",
    type: VesselType.BULK_CARRIER,
    flag: "Panama",
    portOfRegistry: "Panama City",
    grossTonnage: 95000,
    netTonnage: 55000,
    length: 320,
    beam: 50,
    draft: 18,
    yearBuilt: 2020,
    builder: "China State Shipbuilding",
    engineDetails: {
      type: "MAN B&W 7S80ME-C",
      manufacturer: "MAN Diesel & Turbo",
      power: 30000,
      fuelType: "HFO",
      consumption: 160
    },
    classificationSociety: "ABS",
    companyId: "COMP003",
    companyName: "Atlantic Shipping Ltd",
    currentLocation: {
      latitude: -33.9249,
      longitude: 18.4241,
      port: "Cape Town",
      country: "South Africa",
      lastUpdated: "2024-12-10T08:00:00Z"
    },
    nextPort: {
      name: "Port of Santos",
      country: "Brazil",
      eta: "2024-12-22T10:00:00Z",
      etd: "2024-12-24T16:00:00Z",
      berth: "Berth 12"
    },
    status: "active" as any,
    crewCapacity: 28,
    passengerCapacity: 0,
    cargoCapacity: 95000,
    specifications: {
      hullMaterial: "Steel",
      propulsion: "Single Screw",
      navigationEquipment: ["GPS", "Radar", "ECDIS", "AIS"],
      communicationEquipment: ["VHF", "HF", "Satellite"],
      safetyEquipment: ["Lifeboats", "Life Rafts", "EPIRB", "SART"],
      cargoEquipment: ["Grab Cranes", "Conveyor Belts"],
      specialFeatures: ["Self-Unloading", "Grain Fittings"]
    },
    createdAt: "2020-01-01T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z"
  }
];

// ============================================================================
// MOCK ASSIGNMENTS - Various Statuses and Positions
// ============================================================================

export const mockAssignments: Assignment[] = [
  {
    id: "assign1",
    seafarerId: "user1",
    vesselId: "vessel1",
    vessel: mockVessels[0],
    position: "chief_officer" as any,
    department: "deck" as any,
    joiningDate: "2024-12-20T00:00:00Z",
    signingOffDate: "2025-03-15T00:00:00Z",
    contractDuration: 3,
    salary: 8500,
    currency: "USD",
    overtimeRate: 45,
    leaveDays: 7,
    status: AssignmentStatus.PENDING,
    companyId: "COMP001",
    companyName: "Ocean Logistics Ltd",
    companyLogo: undefined,
    requiredDocuments: [
      {
        documentType: DocumentType.MEDICAL_CERTIFICATE,
        title: "Medical Certificate",
        description: "Valid medical certificate",
        mandatory: true,
        expiryRequired: true,
        minValidityDays: 30
      },
      {
        documentType: DocumentType.STCW_CERTIFICATE,
        title: "STCW Certificate",
        description: "Standards of Training, Certification and Watchkeeping",
        mandatory: true,
        expiryRequired: true,
        minValidityDays: 60
      }
    ],
    mobilizationChecklist: [
      {
        id: "step1",
        title: "Medical Examination",
        description: "Complete medical examination",
        order: 1,
        requiredDocuments: [DocumentType.MEDICAL_CERTIFICATE],
        dueDate: "2024-12-15T00:00:00Z",
        completed: true,
        completedAt: "2024-12-10T00:00:00Z",
        notes: "Completed successfully",
        assignee: "user1"
      },
      {
        id: "step2",
        title: "Document Verification",
        description: "Verify all required documents",
        order: 2,
        requiredDocuments: [DocumentType.STCW_CERTIFICATE, DocumentType.PASSPORT],
        dueDate: "2024-12-18T00:00:00Z",
        completed: false,
        notes: "Pending passport renewal",
        assignee: "user1"
      }
    ],
    contractTerms: {
      probationPeriod: 30,
      noticePeriod: 30,
      terminationClause: "Standard maritime contract terms",
      disputeResolution: "Arbitration in London",
      governingLaw: "English Law",
      specialConditions: ["Ice navigation bonus", "Performance bonus"]
    },
    benefits: {
      accommodation: true,
      meals: true,
      uniform: true,
      transportation: true,
      medicalInsurance: true,
      lifeInsurance: true,
      pensionContribution: true,
      bonus: 2000,
      otherBenefits: ["Internet allowance", "Gym access"]
    },
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    expiresAt: "2024-12-25T00:00:00Z",
    respondedAt: undefined,
    responseMessage: undefined
  },
  {
    id: "assign2",
    seafarerId: "user2",
    vesselId: "vessel2",
    vessel: mockVessels[1],
    position: "chief_engineer" as any,
    department: "engine" as any,
    joiningDate: "2024-12-25T00:00:00Z",
    signingOffDate: "2025-06-25T00:00:00Z",
    contractDuration: 6,
    salary: 9200,
    currency: "USD",
    overtimeRate: 50,
    leaveDays: 14,
    status: AssignmentStatus.ACCEPTED,
    companyId: "COMP002",
    companyName: "Mediterranean Shipping",
    companyLogo: undefined,
    requiredDocuments: [
      {
        documentType: DocumentType.ENG1_MEDICAL,
        title: "ENG1 Medical Certificate",
        description: "Engine room medical certificate",
        mandatory: true,
        expiryRequired: true,
        minValidityDays: 30
      }
    ],
    mobilizationChecklist: [
      {
        id: "step3",
        title: "ENG1 Medical",
        description: "Complete ENG1 medical examination",
        order: 1,
        requiredDocuments: [DocumentType.ENG1_MEDICAL],
        dueDate: "2024-12-20T00:00:00Z",
        completed: true,
        completedAt: "2024-12-15T00:00:00Z",
        notes: "Medical completed",
        assignee: "user2"
      }
    ],
    contractTerms: {
      probationPeriod: 30,
      noticePeriod: 30,
      terminationClause: "Standard maritime contract terms",
      disputeResolution: "Arbitration in Madrid",
      governingLaw: "Spanish Law",
      specialConditions: ["Technical bonus", "Fuel efficiency bonus"]
    },
    benefits: {
      accommodation: true,
      meals: true,
      uniform: true,
      transportation: true,
      medicalInsurance: true,
      lifeInsurance: true,
      pensionContribution: true,
      bonus: 2500,
      otherBenefits: ["Technical training", "Equipment allowance"]
    },
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    expiresAt: "2024-12-30T00:00:00Z",
    respondedAt: "2024-12-05T00:00:00Z",
    responseMessage: "Accepted assignment with conditions"
  }
];

// ============================================================================
// MOCK DOCUMENTS - Various Types and Statuses
// ============================================================================

export const mockDocuments: Document[] = [
  {
    id: "doc1",
    userId: "user1",
    type: DocumentType.MEDICAL_CERTIFICATE,
    title: "Medical Certificate",
    description: "Valid medical certificate for maritime service",
    fileName: "medical_certificate_2024.pdf",
    fileUrl: "/documents/medical_certificate_2024.pdf",
    fileSize: 2048576,
    mimeType: "application/pdf",
    category: "Medical",
    expiryDate: "2025-01-15T00:00:00Z",
    issueDate: "2024-01-15T00:00:00Z",
    issuingAuthority: "Maritime Medical Center",
    documentNumber: "MED-2024-001",
    status: "valid" as any,
    uploadedAt: "2024-01-15T10:00:00Z",
    verifiedAt: "2024-01-16T09:00:00Z",
    verifiedBy: "admin1",
    rejectionReason: undefined,
    metadata: {
      countryOfIssue: "United Kingdom",
      placeOfIssue: "Southampton",
      language: "English",
      translationRequired: false,
      notarized: true,
      apostilled: false,
      digitalSignature: true
    }
  },
  {
    id: "doc2",
    userId: "user1",
    type: DocumentType.STCW_CERTIFICATE,
    title: "STCW Certificate",
    description: "Standards of Training, Certification and Watchkeeping",
    fileName: "stcw_certificate_2023.pdf",
    fileUrl: "/documents/stcw_certificate_2023.pdf",
    fileSize: 1536000,
    mimeType: "application/pdf",
    category: "Certification",
    expiryDate: "2028-06-15T00:00:00Z",
    issueDate: "2023-06-15T00:00:00Z",
    issuingAuthority: "Maritime and Coastguard Agency",
    documentNumber: "STCW-2023-001",
    status: "valid" as any,
    uploadedAt: "2023-06-15T14:00:00Z",
    verifiedAt: "2023-06-16T08:00:00Z",
    verifiedBy: "admin1",
    rejectionReason: undefined,
    metadata: {
      countryOfIssue: "United Kingdom",
      placeOfIssue: "London",
      language: "English",
      translationRequired: false,
      notarized: true,
      apostilled: true,
      digitalSignature: true
    }
  },
  {
    id: "doc3",
    userId: "user1",
    type: DocumentType.PASSPORT,
    title: "British Passport",
    description: "Valid British passport",
    fileName: "passport_2024.jpg",
    fileUrl: "/documents/passport_2024.jpg",
    fileSize: 1024000,
    mimeType: "image/jpeg",
    category: "Identity",
    expiryDate: "2030-03-15T00:00:00Z",
    issueDate: "2020-03-15T00:00:00Z",
    issuingAuthority: "HM Passport Office",
    documentNumber: "GB123456789",
    status: "valid" as any,
    uploadedAt: "2024-01-10T11:00:00Z",
    verifiedAt: "2024-01-11T09:00:00Z",
    verifiedBy: "admin1",
    rejectionReason: undefined,
    metadata: {
      countryOfIssue: "United Kingdom",
      placeOfIssue: "London",
      language: "English",
      translationRequired: false,
      notarized: false,
      apostilled: false,
      digitalSignature: false
    }
  },
  {
    id: "doc4",
    userId: "user2",
    type: DocumentType.ENG1_MEDICAL,
    title: "ENG1 Medical Certificate",
    description: "Engine room medical certificate",
    fileName: "eng1_medical_2024.pdf",
    fileUrl: "/documents/eng1_medical_2024.pdf",
    fileSize: 1800000,
    mimeType: "application/pdf",
    category: "Medical",
    expiryDate: "2025-02-20T00:00:00Z",
    issueDate: "2024-02-20T00:00:00Z",
    issuingAuthority: "Maritime Medical Center Barcelona",
    documentNumber: "ENG1-2024-002",
    status: "valid" as any,
    uploadedAt: "2024-02-20T15:00:00Z",
    verifiedAt: "2024-02-21T10:00:00Z",
    verifiedBy: "admin2",
    rejectionReason: undefined,
    metadata: {
      countryOfIssue: "Spain",
      placeOfIssue: "Barcelona",
      language: "Spanish",
      translationRequired: false,
      notarized: true,
      apostilled: false,
      digitalSignature: true
    }
  }
];

// ============================================================================
// MOCK TASKS - Mobilization and General Tasks
// ============================================================================

export const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Upload Medical Certificate",
    description: "Upload valid medical certificate for assignment",
    status: TaskStatus.COMPLETED,
    priority: "high" as any,
    dueDate: "2024-12-15T00:00:00Z",
    assignmentId: "assign1",
    vesselId: "vessel1",
    assignedTo: "user1",
    createdBy: "system",
    tags: ["medical", "assignment", "urgent"],
    attachments: ["medical_certificate_2024.pdf"],
    progress: 100,
    estimatedHours: 2,
    actualHours: 1.5,
    dependencies: [],
    subtasks: [
      {
        id: "subtask1",
        title: "Download medical form",
        completed: true,
        completedAt: "2024-12-10T10:00:00Z"
      },
      {
        id: "subtask2",
        title: "Complete medical examination",
        completed: true,
        completedAt: "2024-12-12T14:00:00Z"
      },
      {
        id: "subtask3",
        title: "Upload certificate",
        completed: true,
        completedAt: "2024-12-15T09:00:00Z"
      }
    ],
    comments: [
      {
        id: "comment1",
        userId: "user1",
        userName: "Alistair Thomson",
        message: "Medical examination completed successfully",
        createdAt: "2024-12-12T14:30:00Z"
      }
    ],
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-15T09:00:00Z",
    completedAt: "2024-12-15T09:00:00Z"
  },
  {
    id: "task2",
    title: "Complete STCW Training",
    description: "Complete required STCW training modules",
    status: TaskStatus.IN_PROGRESS,
    priority: "medium" as any,
    dueDate: "2024-12-20T00:00:00Z",
    assignmentId: "assign1",
    vesselId: "vessel1",
    assignedTo: "user1",
    createdBy: "system",
    tags: ["training", "stcw", "certification"],
    attachments: [],
    progress: 65,
    estimatedHours: 8,
    actualHours: 5.2,
    dependencies: ["task1"],
    subtasks: [
      {
        id: "subtask4",
        title: "Personal Survival Techniques",
        completed: true,
        completedAt: "2024-12-08T16:00:00Z"
      },
      {
        id: "subtask5",
        title: "Fire Prevention and Fire Fighting",
        completed: true,
        completedAt: "2024-12-10T15:00:00Z"
      },
      {
        id: "subtask6",
        title: "Elementary First Aid",
        completed: false
      },
      {
        id: "subtask7",
        title: "Personal Safety and Social Responsibilities",
        completed: false
      }
    ],
    comments: [
      {
        id: "comment2",
        userId: "user1",
        userName: "Alistair Thomson",
        message: "Making good progress on STCW modules",
        createdAt: "2024-12-10T15:30:00Z"
      }
    ],
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-10T15:30:00Z",
    completedAt: undefined
  },
  {
    id: "task3",
    title: "Visa Application",
    description: "Apply for work visa for Singapore",
    status: TaskStatus.TODO,
    priority: "urgent" as any,
    dueDate: "2024-12-18T00:00:00Z",
    assignmentId: "assign1",
    vesselId: "vessel1",
    assignedTo: "user1",
    createdBy: "system",
    tags: ["visa", "travel", "urgent"],
    attachments: [],
    progress: 0,
    estimatedHours: 4,
    actualHours: 0,
    dependencies: ["task1"],
    subtasks: [
      {
        id: "subtask8",
        title: "Gather required documents",
        completed: false
      },
      {
        id: "subtask9",
        title: "Complete visa application form",
        completed: false
      },
      {
        id: "subtask10",
        title: "Submit application",
        completed: false
      }
    ],
    comments: [],
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    completedAt: undefined
  }
];

// ============================================================================
// MOCK TRAINING COURSES - Maritime Training Programs
// ============================================================================

export const mockTraining: Course[] = [
  {
    id: "train1",
    title: "Basic Safety Training (BST)",
    description: "Comprehensive basic safety training covering personal survival, fire fighting, first aid, and personal safety",
    provider: "Maritime Training Institute",
    category: "Safety",
    subcategory: "Basic Safety",
    duration: 40,
    format: "classroom" as any,
    difficulty: "beginner" as any,
    prerequisites: ["Medical Certificate"],
    learningObjectives: [
      "Understand personal survival techniques",
      "Learn fire prevention and fire fighting",
      "Master elementary first aid",
      "Understand personal safety responsibilities"
    ],
    curriculum: [
      {
        id: "module1",
        title: "Personal Survival Techniques",
        description: "Survival techniques in emergency situations",
        duration: 10,
        order: 1,
        completed: true,
        completedAt: "2024-06-10T00:00:00Z"
      },
      {
        id: "module2",
        title: "Fire Prevention and Fire Fighting",
        description: "Fire safety and fire fighting techniques",
        duration: 12,
        order: 2,
        completed: true,
        completedAt: "2024-06-12T00:00:00Z"
      },
      {
        id: "module3",
        title: "Elementary First Aid",
        description: "Basic first aid techniques",
        duration: 8,
        order: 3,
        completed: true,
        completedAt: "2024-06-14T00:00:00Z"
      },
      {
        id: "module4",
        title: "Personal Safety and Social Responsibilities",
        description: "Safety responsibilities and social duties",
        duration: 10,
        order: 4,
        completed: true,
        completedAt: "2024-06-15T00:00:00Z"
      }
    ],
    certificateValidity: 60,
    cost: 1200,
    currency: "USD",
    status: TrainingStatus.COMPLETED,
    enrolledAt: "2024-06-01T00:00:00Z",
    completedAt: "2024-06-15T00:00:00Z",
    certificateUrl: "/certificates/bst_certificate_2024.pdf",
    progress: 100,
    instructor: {
      id: "instructor1",
      name: "Captain James Wilson",
      qualifications: ["Master Mariner", "STCW Instructor"],
      experience: 25,
      avatar: undefined
    },
    location: "Maritime Training Center, Southampton",
    maxParticipants: 20,
    currentParticipants: 18,
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-06-15T00:00:00Z"
  },
  {
    id: "train2",
    title: "ECDIS Training",
    description: "Electronic Chart Display and Information System training",
    provider: "Maritime Technology Institute",
    category: "Navigation",
    subcategory: "Electronic Navigation",
    duration: 24,
    format: "blended" as any,
    difficulty: "intermediate" as any,
    prerequisites: ["STCW Certificate", "Basic Navigation"],
    learningObjectives: [
      "Understand ECDIS functionality",
      "Learn chart management",
      "Master route planning",
      "Understand safety settings"
    ],
    curriculum: [
      {
        id: "module5",
        title: "ECDIS Fundamentals",
        description: "Basic ECDIS concepts and functionality",
        duration: 8,
        order: 1,
        completed: true,
        completedAt: "2024-08-05T00:00:00Z"
      },
      {
        id: "module6",
        title: "Chart Management",
        description: "Managing electronic charts",
        duration: 6,
        order: 2,
        completed: true,
        completedAt: "2024-08-07T00:00:00Z"
      },
      {
        id: "module7",
        title: "Route Planning",
        description: "Planning and monitoring routes",
        duration: 6,
        order: 3,
        completed: true,
        completedAt: "2024-08-09T00:00:00Z"
      },
      {
        id: "module8",
        title: "Safety Settings",
        description: "Configuring safety parameters",
        duration: 4,
        order: 4,
        completed: true,
        completedAt: "2024-08-10T00:00:00Z"
      }
    ],
    certificateValidity: 36,
    cost: 800,
    currency: "USD",
    status: TrainingStatus.COMPLETED,
    enrolledAt: "2024-08-01T00:00:00Z",
    completedAt: "2024-08-10T00:00:00Z",
    certificateUrl: "/certificates/ecdis_certificate_2024.pdf",
    progress: 100,
    instructor: {
      id: "instructor2",
      name: "Chief Officer Sarah Mitchell",
      qualifications: ["Chief Officer", "ECDIS Instructor"],
      experience: 15,
      avatar: undefined
    },
    location: "Maritime Technology Institute, London",
    maxParticipants: 15,
    currentParticipants: 12,
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2024-08-10T00:00:00Z"
  }
];

// ============================================================================
// MOCK NOTIFICATIONS - Various Types and Priorities
// ============================================================================

export const mockNotifications: Notification[] = [
  {
    id: "notif1",
    userId: "user1",
    type: NotificationType.ASSIGNMENT,
    priority: "urgent" as any,
    title: "Assignment Response Required",
    message: "MV OCEAN PIONEER - Chief Officer position requires response by Dec 25, 2024",
    read: false,
    actionUrl: "/assignments/assign1",
    metadata: {
      assignmentId: "assign1",
      vesselId: "vessel1",
      entityType: "assignment",
      entityId: "assign1",
      customData: {
        vesselName: "MV OCEAN PIONEER",
        position: "Chief Officer",
        expiryDate: "2024-12-25T00:00:00Z"
      }
    },
    expiresAt: "2024-12-25T00:00:00Z",
    createdAt: "2024-12-10T10:30:00Z",
    readAt: undefined
  },
  {
    id: "notif2",
    userId: "user1",
    type: NotificationType.DOCUMENT,
    priority: "high" as any,
    title: "Document Expiring Soon",
    message: "Your Medical Certificate expires on Jan 15, 2025. Please renew soon.",
    read: false,
    actionUrl: "/documents/doc1",
    metadata: {
      documentId: "doc1",
      entityType: "document",
      entityId: "doc1",
      customData: {
        documentType: "Medical Certificate",
        expiryDate: "2025-01-15T00:00:00Z",
        daysUntilExpiry: 36
      }
    },
    expiresAt: "2025-01-15T00:00:00Z",
    createdAt: "2024-12-09T14:20:00Z",
    readAt: undefined
  },
  {
    id: "notif3",
    userId: "user1",
    type: NotificationType.TASK,
    priority: "medium" as any,
    title: "Task Due Soon",
    message: "Visa Application task is due on Dec 18, 2024",
    read: true,
    actionUrl: "/tasks/task3",
    metadata: {
      taskId: "task3",
      assignmentId: "assign1",
      entityType: "task",
      entityId: "task3",
      customData: {
        taskTitle: "Visa Application",
        dueDate: "2024-12-18T00:00:00Z",
        daysUntilDue: 8
      }
    },
    expiresAt: "2024-12-18T00:00:00Z",
    createdAt: "2024-12-08T09:15:00Z",
    readAt: "2024-12-08T10:00:00Z"
  },
  {
    id: "notif4",
    userId: "user1",
    type: NotificationType.TRAINING,
    priority: "low" as any,
    title: "Training Certificate Available",
    message: "Your BST Certificate is ready for download",
    read: true,
    actionUrl: "/training/train1",
    metadata: {
      courseId: "train1",
      entityType: "course",
      entityId: "train1",
      customData: {
        courseTitle: "Basic Safety Training (BST)",
        certificateUrl: "/certificates/bst_certificate_2024.pdf"
      }
    },
    expiresAt: undefined,
    createdAt: "2024-06-16T11:00:00Z",
    readAt: "2024-06-16T12:00:00Z"
  },
  {
    id: "notif5",
    userId: "user1",
    type: NotificationType.SYSTEM,
    priority: "medium" as any,
    title: "System Maintenance",
    message: "Scheduled maintenance on Dec 15, 2024 from 02:00 to 04:00 UTC",
    read: false,
    actionUrl: undefined,
    metadata: {
      entityType: "system",
      customData: {
        maintenanceDate: "2024-12-15T02:00:00Z",
        duration: "2 hours",
        impact: "minimal"
      }
    },
    expiresAt: "2024-12-15T04:00:00Z",
    createdAt: "2024-12-05T16:00:00Z",
    readAt: undefined
  }
];

// ============================================================================
// EXPORT ALL MOCK DATA
// ============================================================================

export default {
  mockUsers,
  mockVessels,
  mockAssignments,
  mockDocuments,
  mockTasks,
  mockTraining,
  mockNotifications
};
