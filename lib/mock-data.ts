import type { IngestPayload } from '@/types'

const mockData: IngestPayload[] = [
  // ===== GOOGLE =====
  { company: 'Google India', role: 'Software Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 3200000, bonus: 400000, stock: 800000, source: 'CONTRIBUTOR', confidence_score: 0.95 },
  { company: 'Google India', role: 'Software Engineer', level: 'L4', location: 'Bengaluru', currency: 'INR', experience_years: 5, base_salary: 5000000, bonus: 800000, stock: 2000000, source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { company: 'Google India', role: 'Software Engineer', level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 4, base_salary: 4200000, bonus: 600000, stock: 1500000, source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { company: 'Google India', role: 'Software Engineer', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 8, base_salary: 7000000, bonus: 1200000, stock: 4000000, source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { company: 'Google India', role: 'Software Engineer', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: 6500000, bonus: 1000000, stock: 3500000, source: 'SCRAPED', confidence_score: 0.75 },
  { company: 'Google India', role: 'Senior Staff Engineer', level: 'L6', location: 'Bengaluru', currency: 'INR', experience_years: 12, base_salary: 12000000, bonus: 2000000, stock: 8000000, source: 'CONTRIBUTOR', confidence_score: 0.93 },
  { company: 'GOOGLE', role: 'Product Manager', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 6, base_salary: 5500000, bonus: 900000, stock: 2500000, source: 'SCRAPED', confidence_score: 0.72 },
  { company: 'google ', role: 'Data Scientist', level: 'L4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 3800000, bonus: 500000, stock: 1200000, source: 'CONTRIBUTOR', confidence_score: 0.85 },

  // ===== AMAZON =====
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 1, base_salary: 2500000, bonus: 300000, stock: 500000, source: 'CONTRIBUTOR', confidence_score: 0.94 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 3, base_salary: 3500000, bonus: 500000, stock: 1500000, source: 'CONTRIBUTOR', confidence_score: 0.90 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_II', location: 'Hyderabad', currency: 'INR', experience_years: 4, base_salary: 3800000, bonus: 600000, stock: 1200000, source: 'CONTRIBUTOR', confidence_score: 0.87 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: 6000000, bonus: 1000000, stock: 3000000, source: 'CONTRIBUTOR', confidence_score: 0.89 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 8, base_salary: 6500000, bonus: 1200000, stock: 3500000, source: 'SCRAPED', confidence_score: 0.76 },
  { company: 'Amazon', role: 'Product Manager', level: 'L6', location: 'Bengaluru', currency: 'INR', experience_years: 10, base_salary: 8000000, bonus: 1500000, stock: 5000000, source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { company: 'Amazon', role: 'Data Engineer', level: 'SDE_II', location: 'Hyderabad', currency: 'INR', experience_years: 3, base_salary: 3000000, bonus: 400000, stock: 800000, source: 'AI_INFERRED', confidence_score: 0.65 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 0, base_salary: 1800000, bonus: 0, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.96 },

  // ===== META =====
  { company: 'Meta', role: 'Software Engineer', level: 'IC4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 4500000, bonus: 700000, stock: 3000000, source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { company: 'Meta', role: 'Software Engineer', level: 'IC5', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: 7500000, bonus: 1500000, stock: 6000000, source: 'CONTRIBUTOR', confidence_score: 0.90 },
  { company: 'Meta', role: 'Software Engineer', level: 'IC4', location: 'Mumbai', currency: 'INR', experience_years: 3, base_salary: 4000000, bonus: 500000, stock: 2000000, source: 'SCRAPED', confidence_score: 0.74 },
  { company: 'Meta', role: 'Engineering Manager', level: 'IC5', location: 'Bengaluru', currency: 'INR', experience_years: 10, base_salary: 10000000, bonus: 2000000, stock: 8000000, source: 'CONTRIBUTOR', confidence_score: 0.93 },

  // ===== MICROSOFT =====
  { company: 'Microsoft', role: 'Software Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 2800000, bonus: 350000, stock: 600000, source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 5, base_salary: 4500000, bonus: 700000, stock: 1500000, source: 'CONTRIBUTOR', confidence_score: 0.89 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'L5', location: 'Hyderabad', currency: 'INR', experience_years: 8, base_salary: 6500000, bonus: 1000000, stock: 3000000, source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'L4', location: 'Pune', currency: 'INR', experience_years: 4, base_salary: 3800000, bonus: 500000, stock: 1000000, source: 'CONTRIBUTOR', confidence_score: 0.85 },
  { company: 'Microsoft', role: 'Principal Software Engineer', level: 'PRINCIPAL', location: 'Hyderabad', currency: 'INR', experience_years: 15, base_salary: 15000000, bonus: 3000000, stock: 15000000, source: 'CONTRIBUTOR', confidence_score: 0.94 },

  // ===== FLIPKART =====
  { company: 'Flipkart', role: 'Software Development Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 1, base_salary: 2200000, bonus: 250000, stock: 300000, source: 'CONTRIBUTOR', confidence_score: 0.93 },
  { company: 'Flipkart', role: 'Software Development Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 3800000, bonus: 600000, stock: 1500000, source: 'CONTRIBUTOR', confidence_score: 0.90 },
  { company: 'Flipkart', role: 'Software Development Engineer', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: 6200000, bonus: 1000000, stock: 3000000, source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { company: 'Flipkart', role: 'Product Manager', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 5, base_salary: 4800000, bonus: 800000, stock: 2000000, source: 'CONTRIBUTOR', confidence_score: 0.86 },
  { company: 'Flipkart', role: 'Engineering Manager', level: 'L6', location: 'Bengaluru', currency: 'INR', experience_years: 10, base_salary: 9000000, bonus: 1500000, stock: 5000000, source: 'CONTRIBUTOR', confidence_score: 0.92 },

  // ===== MEESHO =====
  { company: 'Meesho', role: 'Software Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 1, base_salary: 1800000, bonus: 200000, stock: 200000, source: 'CONTRIBUTOR', confidence_score: 0.87 },
  { company: 'Meesho', role: 'Software Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 3, base_salary: 3200000, bonus: 500000, stock: 800000, source: 'CONTRIBUTOR', confidence_score: 0.85 },
  { company: 'Meesho', role: 'Software Engineer', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 6, base_salary: 5500000, bonus: 800000, stock: 2000000, source: 'CONTRIBUTOR', confidence_score: 0.83 },
  { company: 'Meesho', role: 'Data Scientist', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 3, base_salary: 2800000, bonus: 400000, stock: 500000, source: 'SCRAPED', confidence_score: 0.71 },

  // ===== NVIDIA =====
  { company: 'NVIDIA', role: 'Deep Learning Engineer', level: 'IC4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 5000000, bonus: 800000, stock: 3000000, source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { company: 'NVIDIA', role: 'Deep Learning Engineer', level: 'IC5', location: 'Bengaluru', currency: 'INR', experience_years: 8, base_salary: 8500000, bonus: 1500000, stock: 6000000, source: 'CONTRIBUTOR', confidence_score: 0.90 },
  { company: 'NVIDIA', role: 'Hardware Engineer', level: 'IC4', location: 'Bengaluru', currency: 'INR', experience_years: 5, base_salary: 4800000, bonus: 700000, stock: 2000000, source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { company: 'NVIDIA', role: 'Software Engineer', level: 'IC4', location: 'Pune', currency: 'INR', experience_years: 3, base_salary: 4000000, bonus: 500000, stock: 1500000, source: 'CONTRIBUTOR', confidence_score: 0.86 },

  // ===== TCS =====
  { company: 'TCS', role: 'Software Engineer', level: 'L3', location: 'Mumbai', currency: 'INR', experience_years: 1, base_salary: 380000, bonus: 20000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.95 },
  { company: 'TCS', role: 'Software Engineer', level: 'L4', location: 'Mumbai', currency: 'INR', experience_years: 4, base_salary: 700000, bonus: 80000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.93 },
  { company: 'TCS', role: 'Software Engineer', level: 'L5', location: 'Pune', currency: 'INR', experience_years: 8, base_salary: 1400000, bonus: 150000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { company: 'TCS', role: 'Senior Consultant', level: 'L6', location: 'Mumbai', currency: 'INR', experience_years: 12, base_salary: 2500000, bonus: 300000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.85 },
  { company: 'TCS', role: 'Data Analyst', level: 'L3', location: 'Mumbai', currency: 'INR', experience_years: 2, base_salary: 500000, bonus: 40000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.90 },
  { company: 'TCS', role: 'DevOps Engineer with Cloud Infrastructure and Automation Expertise', level: 'L4', location: 'Pune', currency: 'INR', experience_years: 5, base_salary: 900000, bonus: 100000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.82 },

  // ===== INFOSYS =====
  { company: 'Infosys', role: 'Software Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 1, base_salary: 360000, bonus: 25000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.95 },
  { company: 'Infosys', role: 'Software Engineer', level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 3, base_salary: 650000, bonus: 60000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { company: 'Infosys', role: 'Technology Lead', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: 1500000, bonus: 200000, stock: 100000, source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { company: 'Infosys', role: 'Senior Project Manager', level: 'L6', location: 'Pune', currency: 'INR', experience_years: 14, base_salary: 3000000, bonus: 400000, stock: 200000, source: 'CONTRIBUTOR', confidence_score: 0.84 },

  // ===== WIPRO =====
  { company: 'Wipro', role: 'Software Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 1, base_salary: 320000, bonus: 20000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.95 },
  { company: 'Wipro', role: 'Software Engineer', level: 'L4', location: 'Pune', currency: 'INR', experience_years: 4, base_salary: 700000, bonus: 50000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { company: 'Wipro', role: 'Project Manager', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 8, base_salary: 1800000, bonus: 250000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.87 },

  // ===== RAZORPAY =====
  { company: 'Razorpay', role: 'Software Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 2400000, bonus: 300000, stock: 400000, source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { company: 'Razorpay', role: 'Software Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 4000000, bonus: 600000, stock: 1500000, source: 'CONTRIBUTOR', confidence_score: 0.89 },
  { company: 'Razorpay', role: 'Software Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 3, base_salary: 3500000, bonus: 500000, stock: 1000000, source: 'CONTRIBUTOR', confidence_score: 0.86 },
  { company: 'Razorpay', role: 'Product Manager', level: 'IC4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 3500000, bonus: 500000, stock: 800000, source: 'CONTRIBUTOR', confidence_score: 0.84 },

  // ===== ZEPTO =====
  { company: 'Zepto', role: 'Software Engineer', level: 'SDE_I', location: 'Mumbai', currency: 'INR', experience_years: 1, base_salary: 2000000, bonus: 250000, stock: 300000, source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { company: 'Zepto', role: 'Software Engineer', level: 'SDE_II', location: 'Mumbai', currency: 'INR', experience_years: 3, base_salary: 3500000, bonus: 500000, stock: 1000000, source: 'CONTRIBUTOR', confidence_score: 0.85 },
  { company: 'Zepto', role: 'Software Engineer', level: 'SDE_III', location: 'Mumbai', currency: 'INR', experience_years: 6, base_salary: 5800000, bonus: 800000, stock: 2500000, source: 'CONTRIBUTOR', confidence_score: 0.82 },
  { company: 'Zepto', role: 'Data Analyst', level: 'SDE_I', location: 'Mumbai', currency: 'INR', experience_years: 1, base_salary: 1600000, bonus: 150000, stock: 100000, source: 'CONTRIBUTOR', confidence_score: 0.80 },

  // ===== USD RECORDS (San Francisco, London) =====
  { company: 'Google India', role: 'Software Engineer', level: 'L5', location: 'San Francisco', currency: 'USD', experience_years: 6, base_salary: 180000, bonus: 30000, stock: 100000, source: 'SCRAPED', confidence_score: 0.78 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_III', location: 'San Francisco', currency: 'USD', experience_years: 8, base_salary: 220000, bonus: 40000, stock: 150000, source: 'CONTRIBUTOR', confidence_score: 0.90 },
  { company: 'Meta', role: 'Software Engineer', level: 'IC5', location: 'San Francisco', currency: 'USD', experience_years: 7, base_salary: 250000, bonus: 50000, stock: 200000, source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { company: 'Meta', role: 'Software Engineer', level: 'IC4', location: 'London', currency: 'GBP', experience_years: 4, base_salary: 120000, bonus: 20000, stock: 60000, source: 'CONTRIBUTOR', confidence_score: 0.87 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'L5', location: 'San Francisco', currency: 'USD', experience_years: 7, base_salary: 190000, bonus: 30000, stock: 80000, source: 'CONTRIBUTOR', confidence_score: 0.89 },

  // ===== HIGH STOCK / HIGH BASE EDGE CASES =====
  { company: 'Google India', role: 'Distinguished Engineer', level: 'PRINCIPAL', location: 'Bengaluru', currency: 'INR', experience_years: 18, base_salary: 15000000, bonus: 10000000, stock: 15000000, source: 'CONTRIBUTOR', confidence_score: 0.90 },
  { company: 'Flipkart', role: 'Senior Vice President Engineering', level: 'PRINCIPAL', location: 'Bengaluru', currency: 'INR', experience_years: 20, base_salary: 40000000, bonus: 8000000, stock: 25000000, source: 'CONTRIBUTOR', confidence_score: 0.88 },

  // ===== VERY HIGH STOCK (₹1,50,00,000 annual vesting) =====
  { company: 'Meta', role: 'Staff Software Engineer', level: 'IC5', location: 'Bengaluru', currency: 'INR', experience_years: 9, base_salary: 9000000, bonus: 2000000, stock: 15000000, source: 'CONTRIBUTOR', confidence_score: 0.91 },

  // ===== BONUS + STOCK = 0 EDGE CASE =====
  { company: 'TCS', role: 'Software Engineer Trainee', level: 'L3', location: 'Mumbai', currency: 'INR', experience_years: 0, base_salary: 340000, bonus: 0, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.97 },

  // ===== ADDITIONAL COVERAGE =====
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE_II', location: 'Delhi', currency: 'INR', experience_years: 3, base_salary: 3200000, bonus: 400000, stock: 1000000, source: 'CONTRIBUTOR', confidence_score: 0.84 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'L4', location: 'Delhi', currency: 'INR', experience_years: 3, base_salary: 3600000, bonus: 500000, stock: 1000000, source: 'CONTRIBUTOR', confidence_score: 0.83 },
  { company: 'NVIDIA', role: 'Deep Learning Engineer', level: 'IC5', location: 'San Francisco', currency: 'USD', experience_years: 9, base_salary: 300000, bonus: 60000, stock: 250000, source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { company: 'Infosys', role: 'Software Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 450000, bonus: 35000, stock: 0, source: 'CONTRIBUTOR', confidence_score: 0.93 },
]

export default mockData
