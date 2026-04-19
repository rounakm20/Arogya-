export const BASE_PATIENT = {
  id: "ARG-2025-00842",
  dob: "14 Aug 1996", age: 28, gender: "Male",
  blood: "O+", phone: "+91 98765 43210", email: "arjun.sharma@email.com",
  city: "Lucknow, Uttar Pradesh", weight: "72 kg", height: "175 cm", bmi: "23.5",
  emergency_contact: "Sunita Sharma (Mother) · +91 98001 55555",
  conditions: ["Mild Hypertension"], allergies: ["Penicillin"],
  medications: ["Amlodipine 5mg – Daily", "Vitamin D3 1000IU – Daily"],
  vaccinations: ["COVID-19 (Booster – Jan 2023)", "Hepatitis B (Complete)", "Typhoid (2022)"],
  last_checkup: "12 March 2025", doctor: "Dr. Ravi Mehta, KGMU Lucknow",
  insurance: "PM-JAY · Policy: PMJAY-UP-2024-18832",
  issued: "12 Apr 2025", expiry: "12 Apr 2026",
};

export const DUMMY_DONORS = [
  { id: 1, name: "Priya Verma",   blood: "O+",  city: "Lucknow",  phone: "+91 98001 11111", last: "2 months ago", available: true },
  { id: 2, name: "Rahul Singh",   blood: "A+",  city: "Kanpur",   phone: "+91 97002 22222", last: "3 months ago", available: true },
  { id: 3, name: "Meena Gupta",   blood: "B+",  city: "Lucknow",  phone: "+91 96003 33333", last: "6 months ago", available: false },
  { id: 4, name: "Suresh Kumar",  blood: "AB+", city: "Agra",     phone: "+91 95004 44444", last: "1 month ago",  available: true },
  { id: 5, name: "Kavya Nair",    blood: "O-",  city: "Lucknow",  phone: "+91 94005 55555", last: "4 months ago", available: true },
  { id: 6, name: "Amit Patel",    blood: "A-",  city: "Varanasi", phone: "+91 93006 66666", last: "5 months ago", available: false },
  { id: 7, name: "Neha Joshi",    blood: "B-",  city: "Lucknow",  phone: "+91 92007 77777", last: "2 months ago", available: true },
];

export const DUMMY_MEDS = [
  { id: 1, name: "Amlodipine", dose: "5mg",     time: "08:00", freq: "Daily",        notes: "With breakfast", taken: false, color: "#dbeafe" },
  { id: 2, name: "Vitamin D3", dose: "1000 IU", time: "13:00", freq: "Daily",        notes: "After lunch",    taken: true,  color: "#fef3c7" },
  { id: 3, name: "Metformin",  dose: "500mg",   time: "20:00", freq: "Daily",        notes: "With dinner",    taken: false, color: "#d1fae5" },
  { id: 4, name: "Aspirin",    dose: "75mg",    time: "22:00", freq: "Daily",        notes: "Before bed",     taken: false, color: "#ede9fe" },
];

export const DUMMY_REPORTS = [
  { id: 1, name: "CBC Blood Test",  date: "12 Mar 2025", type: "Blood",      status: "Normal",     icon: "🩸" },
  { id: 2, name: "Chest X-Ray",     date: "2 Feb 2025",  type: "Radiology",  status: "Normal",     icon: "🫁" },
  { id: 3, name: "Lipid Profile",   date: "20 Jan 2025", type: "Blood",      status: "Borderline", icon: "🧪" },
  { id: 4, name: "ECG Report",      date: "5 Jan 2025",  type: "Cardiology", status: "Normal",     icon: "💓" },
];

export const MOOD_HISTORY = [
  { day: "Mon", score: 7, note: "Good after workout" },
  { day: "Tue", score: 5, note: "Stressful at work" },
  { day: "Wed", score: 8, note: "Relaxed evening" },
  { day: "Thu", score: 6, note: "Tired but okay" },
  { day: "Fri", score: 9, note: "Great family time" },
  { day: "Sat", score: 7, note: "Regular day" },
  { day: "Sun", score: 8, note: "Feeling positive" },
];

export const MOODS = [
  { s: 1, e: "😢", l: "Very Sad" }, { s: 2, e: "😔", l: "Sad" },
  { s: 3, e: "😕", l: "Low" },      { s: 4, e: "😐", l: "Okay" },
  { s: 5, e: "🙂", l: "Alright" },  { s: 6, e: "😊", l: "Good" },
  { s: 7, e: "😄", l: "Happy" },    { s: 8, e: "😁", l: "Great" },
  { s: 9, e: "🤩", l: "Excellent"}, { s: 10, e: "🥳", l: "Amazing" },
];

export const SYMPTOMS_LIST = [
  "Fever","Headache","Cough","Fatigue","Body pain","Sore throat",
  "Nausea","Dizziness","Chest pain","Shortness of breath",
  "Stomach ache","Vomiting","Runny nose","Joint pain","Back pain","Rash",
];
