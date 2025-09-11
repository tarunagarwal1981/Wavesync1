import { SeafarerProfile } from '../utils/aiMatching';

// Enhanced Mock Data for AI Matching System
export const seafarerProfiles: SeafarerProfile[] = [
  {
    id: "SF001",
    name: "Alistair Thomson",
    rank: "Chief Officer",
    certifications: ["STCW II/2", "GMDSS GOC", "Advanced Fire Fighting", "Medical Care", "ECDIS", "ARPA"],
    experience_years: 12,
    performance_rating: 4.8,
    availability_date: new Date('2024-12-15'),
    last_assignment_end: new Date('2024-11-30'),
    vessel_types_experience: ["Container Ship", "Bulk Carrier", "Tanker"],
    route_preferences: ["Asia-Europe", "Transpacific"],
    languages: ["English", "Spanish"],
    response_history: {
      average_response_time: 3.2,
      acceptance_rate: 89,
      reliability_score: 4.7
    },
    nationality: "British",
    phone: "+44 7700 900123",
    email: "alistair.thomson@maritime.com",
    emergency_contact: "+44 7700 900124",
    medical_expiry: new Date('2025-06-15'),
    passport_expiry: new Date('2027-03-20'),
    visa_expiry: new Date('2025-12-31'),
    notes: "Excellent leadership skills, multilingual"
  },
  {
    id: "SF002",
    name: "Maria Santos",
    rank: "Second Officer",
    certifications: ["STCW II/1", "GMDSS GOC", "Advanced Fire Fighting", "ECDIS"],
    experience_years: 8,
    performance_rating: 4.6,
    availability_date: new Date('2024-12-20'),
    last_assignment_end: new Date('2024-12-05'),
    vessel_types_experience: ["Container Ship", "RoRo"],
    route_preferences: ["Mediterranean", "North Sea"],
    languages: ["English", "Spanish", "Portuguese"],
    response_history: {
      average_response_time: 2.8,
      acceptance_rate: 92,
      reliability_score: 4.8
    },
    nationality: "Spanish",
    phone: "+34 600 123456",
    email: "maria.santos@maritime.com",
    emergency_contact: "+34 600 123457",
    medical_expiry: new Date('2025-08-10'),
    passport_expiry: new Date('2026-11-15'),
    visa_expiry: new Date('2025-09-30'),
    notes: "Strong technical skills, excellent communication"
  },
  {
    id: "SF003",
    name: "Ahmed Hassan",
    rank: "Chief Engineer",
    certifications: ["STCW III/2", "Advanced Fire Fighting", "Medical Care", "High Voltage"],
    experience_years: 15,
    performance_rating: 4.9,
    availability_date: new Date('2024-12-10'),
    last_assignment_end: new Date('2024-11-25'),
    vessel_types_experience: ["Tanker", "Bulk Carrier", "Container Ship"],
    route_preferences: ["Middle East", "Asia"],
    languages: ["English", "Arabic", "Hindi"],
    response_history: {
      average_response_time: 4.1,
      acceptance_rate: 85,
      reliability_score: 4.9
    },
    nationality: "Egyptian",
    phone: "+20 100 1234567",
    email: "ahmed.hassan@maritime.com",
    emergency_contact: "+20 100 1234568",
    medical_expiry: new Date('2025-05-20'),
    passport_expiry: new Date('2027-01-10'),
    visa_expiry: new Date('2025-08-15'),
    notes: "Expert in engine maintenance, problem-solving skills"
  },
  {
    id: "SF004",
    name: "Li Wei",
    rank: "Third Officer",
    certifications: ["STCW II/1", "GMDSS GOC", "Advanced Fire Fighting"],
    experience_years: 5,
    performance_rating: 4.2,
    availability_date: new Date('2024-12-25'),
    last_assignment_end: new Date('2024-12-10'),
    vessel_types_experience: ["Container Ship"],
    route_preferences: ["Asia-Pacific", "Transpacific"],
    languages: ["English", "Mandarin", "Cantonese"],
    response_history: {
      average_response_time: 5.2,
      acceptance_rate: 78,
      reliability_score: 4.3
    },
    nationality: "Chinese",
    phone: "+86 138 0013 8000",
    email: "li.wei@maritime.com",
    emergency_contact: "+86 138 0013 8001",
    medical_expiry: new Date('2025-07-30'),
    passport_expiry: new Date('2026-09-25'),
    visa_expiry: new Date('2025-10-20'),
    notes: "Eager to learn, good technical knowledge"
  },
  {
    id: "SF005",
    name: "Elena Petrov",
    rank: "Bosun",
    certifications: ["STCW II/4", "Advanced Fire Fighting", "Medical First Aid"],
    experience_years: 10,
    performance_rating: 4.5,
    availability_date: new Date('2024-12-18'),
    last_assignment_end: new Date('2024-12-03'),
    vessel_types_experience: ["Bulk Carrier", "Container Ship"],
    route_preferences: ["Baltic Sea", "North Sea"],
    languages: ["English", "Russian", "Ukrainian"],
    response_history: {
      average_response_time: 3.8,
      acceptance_rate: 88,
      reliability_score: 4.6
    },
    nationality: "Ukrainian",
    phone: "+380 50 123 4567",
    email: "elena.petrov@maritime.com",
    emergency_contact: "+380 50 123 4568",
    medical_expiry: new Date('2025-04-15'),
    passport_expiry: new Date('2026-12-20'),
    visa_expiry: new Date('2025-06-30'),
    notes: "Strong deck operations, team leadership"
  },
  {
    id: "SF006",
    name: "James Mitchell",
    rank: "Captain",
    certifications: ["STCW II/2", "GMDSS GOC", "Advanced Fire Fighting", "Medical Care", "ECDIS", "ARPA", "Bridge Resource Management"],
    experience_years: 18,
    performance_rating: 4.9,
    availability_date: new Date('2024-12-12'),
    last_assignment_end: new Date('2024-11-28'),
    vessel_types_experience: ["Container Ship", "Tanker", "Bulk Carrier"],
    route_preferences: ["Transatlantic", "Asia-Europe"],
    languages: ["English", "French"],
    response_history: {
      average_response_time: 2.5,
      acceptance_rate: 94,
      reliability_score: 4.9
    },
    nationality: "American",
    phone: "+1 555 123 4567",
    email: "james.mitchell@maritime.com",
    emergency_contact: "+1 555 123 4568",
    medical_expiry: new Date('2025-09-10'),
    passport_expiry: new Date('2027-05-15'),
    visa_expiry: new Date('2025-11-30'),
    notes: "Exceptional leadership, crisis management expert"
  },
  {
    id: "SF007",
    name: "Anna Kowalski",
    rank: "Second Engineer",
    certifications: ["STCW III/1", "Advanced Fire Fighting", "Medical First Aid", "High Voltage"],
    experience_years: 9,
    performance_rating: 4.4,
    availability_date: new Date('2024-12-22'),
    last_assignment_end: new Date('2024-12-07'),
    vessel_types_experience: ["Container Ship", "RoRo"],
    route_preferences: ["Baltic Sea", "North Sea"],
    languages: ["English", "Polish", "German"],
    response_history: {
      average_response_time: 4.5,
      acceptance_rate: 82,
      reliability_score: 4.4
    },
    nationality: "Polish",
    phone: "+48 600 123 456",
    email: "anna.kowalski@maritime.com",
    emergency_contact: "+48 600 123 457",
    medical_expiry: new Date('2025-06-25'),
    passport_expiry: new Date('2026-10-30'),
    visa_expiry: new Date('2025-07-15'),
    notes: "Strong mechanical skills, attention to detail"
  },
  {
    id: "SF008",
    name: "Carlos Rodriguez",
    rank: "Able Seaman",
    certifications: ["STCW II/4", "Advanced Fire Fighting", "Medical First Aid"],
    experience_years: 6,
    performance_rating: 4.1,
    availability_date: new Date('2024-12-28'),
    last_assignment_end: new Date('2024-12-13'),
    vessel_types_experience: ["Container Ship", "Bulk Carrier"],
    route_preferences: ["Caribbean", "South America"],
    languages: ["English", "Spanish"],
    response_history: {
      average_response_time: 6.2,
      acceptance_rate: 75,
      reliability_score: 4.2
    },
    nationality: "Mexican",
    phone: "+52 55 1234 5678",
    email: "carlos.rodriguez@maritime.com",
    emergency_contact: "+52 55 1234 5679",
    medical_expiry: new Date('2025-08-20'),
    passport_expiry: new Date('2026-11-25'),
    visa_expiry: new Date('2025-09-10'),
    notes: "Hardworking, good team player"
  },
  {
    id: "SF009",
    name: "Yuki Tanaka",
    rank: "Third Engineer",
    certifications: ["STCW III/1", "Advanced Fire Fighting", "Medical First Aid"],
    experience_years: 7,
    performance_rating: 4.3,
    availability_date: new Date('2024-12-30'),
    last_assignment_end: new Date('2024-12-15'),
    vessel_types_experience: ["Container Ship"],
    route_preferences: ["Asia-Pacific", "Transpacific"],
    languages: ["English", "Japanese"],
    response_history: {
      average_response_time: 4.8,
      acceptance_rate: 80,
      reliability_score: 4.3
    },
    nationality: "Japanese",
    phone: "+81 90 1234 5678",
    email: "yuki.tanaka@maritime.com",
    emergency_contact: "+81 90 1234 5679",
    medical_expiry: new Date('2025-07-15'),
    passport_expiry: new Date('2026-12-10'),
    visa_expiry: new Date('2025-08-25'),
    notes: "Precise work, excellent technical knowledge"
  },
  {
    id: "SF010",
    name: "Olga Volkov",
    rank: "Cook",
    certifications: ["STCW VI/1", "Advanced Fire Fighting", "Medical First Aid", "Food Safety"],
    experience_years: 8,
    performance_rating: 4.6,
    availability_date: new Date('2024-12-16'),
    last_assignment_end: new Date('2024-12-01'),
    vessel_types_experience: ["Container Ship", "Bulk Carrier", "Tanker"],
    route_preferences: ["Baltic Sea", "North Sea", "Mediterranean"],
    languages: ["English", "Russian", "Ukrainian"],
    response_history: {
      average_response_time: 3.5,
      acceptance_rate: 90,
      reliability_score: 4.7
    },
    nationality: "Russian",
    phone: "+7 900 123 4567",
    email: "olga.volkov@maritime.com",
    emergency_contact: "+7 900 123 4568",
    medical_expiry: new Date('2025-05-30'),
    passport_expiry: new Date('2026-11-20'),
    visa_expiry: new Date('2025-07-05'),
    notes: "Excellent culinary skills, crew morale booster"
  },
  {
    id: "SF011",
    name: "Rajesh Kumar",
    rank: "Electrician",
    certifications: ["STCW III/6", "Advanced Fire Fighting", "Medical First Aid", "High Voltage", "Electronics"],
    experience_years: 11,
    performance_rating: 4.7,
    availability_date: new Date('2024-12-14'),
    last_assignment_end: new Date('2024-11-29'),
    vessel_types_experience: ["Container Ship", "Tanker", "Bulk Carrier"],
    route_preferences: ["Asia-Europe", "Middle East"],
    languages: ["English", "Hindi", "Tamil"],
    response_history: {
      average_response_time: 3.9,
      acceptance_rate: 87,
      reliability_score: 4.7
    },
    nationality: "Indian",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@maritime.com",
    emergency_contact: "+91 98765 43211",
    medical_expiry: new Date('2025-06-20'),
    passport_expiry: new Date('2027-02-15'),
    visa_expiry: new Date('2025-10-30'),
    notes: "Expert electrical systems, troubleshooting specialist"
  },
  {
    id: "SF012",
    name: "François Dubois",
    rank: "Chief Officer",
    certifications: ["STCW II/2", "GMDSS GOC", "Advanced Fire Fighting", "Medical Care", "ECDIS"],
    experience_years: 13,
    performance_rating: 4.8,
    availability_date: new Date('2024-12-19'),
    last_assignment_end: new Date('2024-12-04'),
    vessel_types_experience: ["Container Ship", "RoRo"],
    route_preferences: ["Mediterranean", "North Sea", "Transatlantic"],
    languages: ["English", "French", "Spanish"],
    response_history: {
      average_response_time: 2.9,
      acceptance_rate: 91,
      reliability_score: 4.8
    },
    nationality: "French",
    phone: "+33 6 12 34 56 78",
    email: "francois.dubois@maritime.com",
    emergency_contact: "+33 6 12 34 56 79",
    medical_expiry: new Date('2025-08-05'),
    passport_expiry: new Date('2026-12-30'),
    visa_expiry: new Date('2025-09-20'),
    notes: "Multilingual, excellent navigation skills"
  },
  {
    id: "SF013",
    name: "Sofia Andersson",
    rank: "Second Officer",
    certifications: ["STCW II/1", "GMDSS GOC", "Advanced Fire Fighting", "ECDIS"],
    experience_years: 6,
    performance_rating: 4.4,
    availability_date: new Date('2024-12-26'),
    last_assignment_end: new Date('2024-12-11'),
    vessel_types_experience: ["Container Ship"],
    route_preferences: ["Baltic Sea", "North Sea"],
    languages: ["English", "Swedish", "Norwegian"],
    response_history: {
      average_response_time: 4.2,
      acceptance_rate: 83,
      reliability_score: 4.4
    },
    nationality: "Swedish",
    phone: "+46 70 123 45 67",
    email: "sofia.andersson@maritime.com",
    emergency_contact: "+46 70 123 45 68",
    medical_expiry: new Date('2025-07-10'),
    passport_expiry: new Date('2026-10-15'),
    visa_expiry: new Date('2025-08-30'),
    notes: "Strong technical skills, environmental awareness"
  },
  {
    id: "SF014",
    name: "Mohammed Al-Rashid",
    rank: "Third Officer",
    certifications: ["STCW II/1", "GMDSS GOC", "Advanced Fire Fighting"],
    experience_years: 4,
    performance_rating: 4.0,
    availability_date: new Date('2024-12-31'),
    last_assignment_end: new Date('2024-12-16'),
    vessel_types_experience: ["Container Ship"],
    route_preferences: ["Middle East", "Asia"],
    languages: ["English", "Arabic", "Urdu"],
    response_history: {
      average_response_time: 6.5,
      acceptance_rate: 72,
      reliability_score: 4.1
    },
    nationality: "Pakistani",
    phone: "+92 300 123 4567",
    email: "mohammed.alrashid@maritime.com",
    emergency_contact: "+92 300 123 4568",
    medical_expiry: new Date('2025-09-25'),
    passport_expiry: new Date('2026-11-30'),
    visa_expiry: new Date('2025-10-15'),
    notes: "Eager to learn, good potential"
  },
  {
    id: "SF015",
    name: "Isabella Costa",
    rank: "Steward",
    certifications: ["STCW VI/1", "Advanced Fire Fighting", "Medical First Aid", "Food Safety"],
    experience_years: 7,
    performance_rating: 4.5,
    availability_date: new Date('2024-12-17'),
    last_assignment_end: new Date('2024-12-02'),
    vessel_types_experience: ["Container Ship", "Bulk Carrier"],
    route_preferences: ["South America", "Caribbean"],
    languages: ["English", "Portuguese", "Spanish"],
    response_history: {
      average_response_time: 3.7,
      acceptance_rate: 89,
      reliability_score: 4.5
    },
    nationality: "Brazilian",
    phone: "+55 11 99999 8888",
    email: "isabella.costa@maritime.com",
    emergency_contact: "+55 11 99999 8889",
    medical_expiry: new Date('2025-06-10'),
    passport_expiry: new Date('2026-12-05'),
    visa_expiry: new Date('2025-07-25'),
    notes: "Excellent hospitality skills, crew welfare focus"
  }
];

// AI Learning Data Storage
export const aiLearningData = {
  assignment_patterns: {
    successful_matches: [
      { assignment_type: "Chief Officer", success_rate: 0.89, avg_response_time: 3.2 },
      { assignment_type: "Second Officer", success_rate: 0.85, avg_response_time: 4.1 },
      { assignment_type: "Chief Engineer", success_rate: 0.92, avg_response_time: 2.8 },
      { assignment_type: "Third Officer", success_rate: 0.78, avg_response_time: 5.2 },
      { assignment_type: "Bosun", success_rate: 0.88, avg_response_time: 3.8 }
    ],
    response_times: {
      "Excellent": 2.5,
      "Good": 4.2,
      "Fair": 6.1,
      "Poor": 8.3
    },
    acceptance_rates: {
      "Excellent": 0.94,
      "Good": 0.87,
      "Fair": 0.75,
      "Poor": 0.62
    },
    performance_correlations: {
      experience_vs_performance: 0.78,
      certifications_vs_success: 0.82,
      availability_vs_acceptance: 0.71
    }
  },
  user_preferences: {
    company_preferences: {
      "Ocean Shipping Ltd": ["Chief Officer", "Second Officer"],
      "Pacific Lines": ["Chief Engineer", "Third Engineer"],
      "Atlantic Maritime": ["Captain", "Chief Officer"],
      "Global Shipping Co": ["Second Officer", "Third Officer"],
      "Baltic Sea Lines": ["Bosun", "Able Seaman"]
    },
    seafarer_preferences: {
      route_preferences: {
        "Asia-Europe": 0.85,
        "Transpacific": 0.78,
        "Mediterranean": 0.72,
        "North Sea": 0.68,
        "Baltic Sea": 0.65
      },
      vessel_type_preferences: {
        "Container Ship": 0.82,
        "Bulk Carrier": 0.75,
        "Tanker": 0.71,
        "RoRo": 0.68
      }
    }
  }
};

// Assignment Requirements Templates
export const assignmentTemplates = [
  {
    id: "TEMP001",
    name: "Chief Officer - Container Ship",
    vessel_name: "MV Ocean Pioneer",
    position: "Chief Officer",
    required_certifications: ["STCW II/2", "GMDSS GOC", "Advanced Fire Fighting", "Medical Care", "ECDIS"],
    min_experience: 8,
    vessel_type: "Container Ship",
    route: "Asia-Europe",
    joining_date: new Date('2024-12-20'),
    contract_duration: 6,
    required_languages: ["English"],
    priority_level: "high" as const,
    salary_range: { min: 8000, max: 10000 },
    special_requirements: ["Leadership experience", "ECDIS certification"]
  },
  {
    id: "TEMP002",
    name: "Second Engineer - Bulk Carrier",
    vessel_name: "MV Pacific Star",
    position: "Second Engineer",
    required_certifications: ["STCW III/1", "Advanced Fire Fighting", "Medical First Aid", "High Voltage"],
    min_experience: 6,
    vessel_type: "Bulk Carrier",
    route: "Transpacific",
    joining_date: new Date('2024-12-25'),
    contract_duration: 4,
    required_languages: ["English"],
    priority_level: "medium" as const,
    salary_range: { min: 6000, max: 7500 },
    special_requirements: ["High voltage experience"]
  },
  {
    id: "TEMP003",
    name: "Third Officer - Tanker",
    vessel_name: "MV Atlantic Voyager",
    position: "Third Officer",
    required_certifications: ["STCW II/1", "GMDSS GOC", "Advanced Fire Fighting"],
    min_experience: 3,
    vessel_type: "Tanker",
    route: "Middle East",
    joining_date: new Date('2024-12-30'),
    contract_duration: 5,
    required_languages: ["English"],
    priority_level: "low" as const,
    salary_range: { min: 4500, max: 5500 },
    special_requirements: []
  }
];
