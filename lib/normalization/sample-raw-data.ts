/**
 * Sample raw scraped records for testing and demonstrating the data pipeline.
 *
 * Contains 65+ records across 12 companies with intentionally included edge cases:
 *   - Company name variants (TCS/Tata, Google/Google India, etc.)
 *   - Salary range formats (LPA, Cr, USD k, etc.)
 *   - Experience formats (years, ranges, "fresher")
 *   - Titles that need level mapping
 *   - Some invalid records that should be rejected at validation
 */

import type { RawScrapedRecord } from './types'

export const SAMPLE_RAW_RECORDS: RawScrapedRecord[] = [
  // ── Google (8 records) ──
  { raw_company: 'Google India Pvt. Ltd.', raw_role: 'Software Engineer L3', raw_salary_text: '₹18–25 LPA', raw_location: 'Bengaluru', raw_experience: '1-3 years' },
  { raw_company: 'GOOGLE', raw_role: 'Software Engineer L4', raw_salary_text: '₹30–45 LPA', raw_location: 'Bengaluru', raw_experience: '3-5 years' },
  { raw_company: 'google', raw_role: 'Senior Software Engineer', raw_salary_text: '₹50–70 LPA', raw_location: 'Hyderabad', raw_experience: '5-8 years' },
  { raw_company: 'Google Inc', raw_role: 'Staff Software Engineer', raw_salary_text: '₹80 L–1 Cr', raw_location: 'Bengaluru', raw_experience: '10+ years' },
  { raw_company: 'Google India', raw_role: 'Software Engineer II', raw_salary_text: '₹22–35 LPA', raw_location: 'Mumbai', raw_experience: '2-4 years' },
  { raw_company: 'Google LLC', raw_role: 'Product Manager L5', raw_salary_text: '₹60–85 LPA', raw_location: 'Bengaluru', raw_experience: '6-9 years' },
  { raw_company: 'Google', raw_role: 'SDE-III', raw_salary_text: '₹70 L–1.2 Cr', raw_location: 'Bengaluru', raw_experience: '8-12 years' },
  { raw_company: 'Google.com', raw_role: 'Data Scientist L4', raw_salary_text: '₹35–50 LPA', raw_location: 'Bengaluru', raw_experience: '4-6 years' },

  // ── Amazon (7 records) ──
  { raw_company: 'Amazon India', raw_role: 'SDE-I', raw_salary_text: '₹16–25 LPA', raw_location: 'Bengaluru', raw_experience: '0-2 years' },
  { raw_company: 'Amazon', raw_role: 'SDE-II', raw_salary_text: '₹35–55 LPA', raw_location: 'Hyderabad', raw_experience: '3-6 years' },
  { raw_company: 'Amazon Dev Center India', raw_role: 'SDE-III', raw_salary_text: '₹60–90 LPA', raw_location: 'Bengaluru', raw_experience: '6-10 years' },
  { raw_company: 'Amazon Web Services', raw_role: 'Senior SDE', raw_salary_text: '₹70 L–1 Cr', raw_location: 'Bengaluru', raw_experience: '8-12 years' },
  { raw_company: 'amazon.com', raw_role: 'Product Manager L6', raw_salary_text: '₹80 L–1.2 Cr', raw_location: 'Bengaluru', raw_experience: '10+ years' },
  { raw_company: 'AWS', raw_role: 'Cloud Engineer L4', raw_salary_text: '₹30–42 LPA', raw_location: 'Mumbai', raw_experience: '3-5 years' },
  { raw_company: 'Amazon India Pvt Ltd', raw_role: 'Data Engineer L5', raw_salary_text: '₹45–65 LPA', raw_location: 'Bengaluru', raw_experience: '5-8 years' },

  // ── Meta (5 records) ──
  { raw_company: 'Meta India', raw_role: 'Software Engineer L4', raw_salary_text: '₹35–50 LPA', raw_location: 'Bengaluru', raw_experience: '3-5 years' },
  { raw_company: 'Facebook India', raw_role: 'Software Engineer L5', raw_salary_text: '₹55–80 LPA', raw_location: 'Bengaluru', raw_experience: '5-8 years' },
  { raw_company: 'Meta', raw_role: 'Data Scientist L4', raw_salary_text: '₹40–55 LPA', raw_location: 'Bengaluru', raw_experience: '4-6 years' },
  { raw_company: 'Facebook', raw_role: 'Product Manager L5', raw_salary_text: '₹60–85 LPA', raw_location: 'Hyderabad', raw_experience: '6-9 years' },
  { raw_company: 'Meta', raw_role: 'Software Engineer L6', raw_salary_text: '₹90 L–1.5 Cr', raw_location: 'Bengaluru', raw_experience: '10-14 years' },

  // ── Microsoft (5 records) ──
  { raw_company: 'Microsoft India', raw_role: 'Software Engineer II', raw_salary_text: '₹22–35 LPA', raw_location: 'Hyderabad', raw_experience: '2-4 years' },
  { raw_company: 'Microsoft', raw_role: 'Senior Software Engineer', raw_salary_text: '₹45–65 LPA', raw_location: 'Bengaluru', raw_experience: '5-8 years' },
  { raw_company: 'Microsoft Corporation', raw_role: 'Principal Software Engineer', raw_salary_text: '₹1–1.5 Cr', raw_location: 'Hyderabad', raw_experience: '12-18 years' },
  { raw_company: 'Microsoft India Pvt Ltd', raw_role: 'Software Engineer III', raw_salary_text: '₹30–42 LPA', raw_location: 'Bengaluru', raw_experience: '4-6 years' },
  { raw_company: 'Microsoft', raw_role: 'Data Scientist L5', raw_salary_text: '₹50–70 LPA', raw_location: 'Hyderabad', raw_experience: '6-9 years' },

  // ── Flipkart (6 records) ──
  { raw_company: 'Flipkart Internet Pvt Ltd', raw_role: 'SDE-II', raw_salary_text: '₹30–45 LPA', raw_location: 'Bengaluru', raw_experience: '3-6 years' },
  { raw_company: 'Flipkart', raw_role: 'Senior SDE', raw_salary_text: '₹50–70 LPA', raw_location: 'Bengaluru', raw_experience: '6-10 years' },
  { raw_company: 'Flipkart India', raw_role: 'Product Manager L4', raw_salary_text: '₹25–38 LPA', raw_location: 'Bengaluru', raw_experience: '3-5 years' },
  { raw_company: 'Flipkart', raw_role: 'SDE-I', raw_salary_text: '₹14–22 LPA', raw_location: 'Bengaluru', raw_experience: '0-2 years' },
  { raw_company: 'Flipkart Internet Private Limited', raw_role: 'Data Analyst L3', raw_salary_text: '₹10–16 LPA', raw_location: 'Bengaluru', raw_experience: '1-3 years' },
  { raw_company: 'Flipkart', raw_role: 'Engineering Manager', raw_salary_text: '₹80 L–1.2 Cr', raw_location: 'Bengaluru', raw_experience: '10-15 years' },

  // ── Meesho (4 records) ──
  { raw_company: 'Meesho India', raw_role: 'SDE-II', raw_salary_text: '₹28–40 LPA', raw_location: 'Bengaluru', raw_experience: '3-5 years' },
  { raw_company: 'Meesho', raw_role: 'Senior SDE', raw_salary_text: '₹45–60 LPA', raw_location: 'Bengaluru', raw_experience: '5-8 years' },
  { raw_company: 'Meesho', raw_role: 'Product Manager L4', raw_salary_text: '₹22–35 LPA', raw_location: 'Bengaluru', raw_experience: '3-5 years' },
  { raw_company: 'Meesho', raw_role: 'Data Scientist L3', raw_salary_text: '₹15–22 LPA', raw_location: 'Bengaluru', raw_experience: '1-3 years' },

  // ── NVIDIA (4 records) ──
  { raw_company: 'NVIDIA India', raw_role: 'Software Engineer L4', raw_salary_text: '₹35–50 LPA', raw_location: 'Bengaluru', raw_experience: '3-5 years' },
  { raw_company: 'NVIDIA', raw_role: 'Senior Software Engineer', raw_salary_text: '₹55–80 LPA', raw_location: 'Pune', raw_experience: '5-8 years' },
  { raw_company: 'NVIDIA Corporation', raw_role: 'CUDA Engineer L5', raw_salary_text: '₹60–85 LPA', raw_location: 'Bengaluru', raw_experience: '5-9 years' },
  { raw_company: 'NVIDIA', raw_role: 'Staff Engineer', raw_salary_text: '₹90 L–1.5 Cr', raw_location: 'Bengaluru', raw_experience: '10+ years' },

  // ── TCS (8 records — critical edge case for alias matching) ──
  { raw_company: 'Tata Consultancy Services', raw_role: 'Software Engineer L3', raw_salary_text: '₹3.5–6 LPA', raw_location: 'Mumbai', raw_experience: '0-2 years' },
  { raw_company: 'TCS Ltd.', raw_role: 'Senior Software Engineer', raw_salary_text: '₹8–12 LPA', raw_location: 'Pune', raw_experience: '4-7 years' },
  { raw_company: 'Tata Consultancy', raw_role: 'System Engineer', raw_salary_text: '₹3.5–5 LPA', raw_location: 'Chennai', raw_experience: '0-2 years' },
  { raw_company: 'Tata Consultancy Services Ltd', raw_role: 'IT Analyst', raw_salary_text: '₹7–10 LPA', raw_location: 'Hyderabad', raw_experience: '3-6 years' },
  { raw_company: 'tcs', raw_role: 'Associate Software Engineer', raw_salary_text: '₹3–4.5 LPA', raw_location: 'Noida', raw_experience: '0-1 years' },
  { raw_company: 'TCS', raw_role: 'Tech Lead', raw_salary_text: '₹14–20 LPA', raw_location: 'Bengaluru', raw_experience: '8-12 years' },
  { raw_company: 'Tata Consultancy Services', raw_role: 'Business Analyst', raw_salary_text: '₹5–8 LPA', raw_location: 'Mumbai', raw_experience: '2-4 years' },
  { raw_company: 'Tata Consultancy Services Limited', raw_role: 'DevOps Engineer L4', raw_salary_text: '₹9–14 LPA', raw_location: 'Pune', raw_experience: '4-7 years' },

  // ── Infosys (6 records) ──
  { raw_company: 'Infosys Technologies', raw_role: 'Software Engineer L3', raw_salary_text: '₹3.5–5.5 LPA', raw_location: 'Mysore', raw_experience: '0-2 years' },
  { raw_company: 'Infosys BPO', raw_role: 'Process Executive', raw_salary_text: '₹2.5–4 LPA', raw_location: 'Pune', raw_experience: '0-2 years' },
  { raw_company: 'Infosys', raw_role: 'Senior Software Engineer', raw_salary_text: '₹8–13 LPA', raw_location: 'Bengaluru', raw_experience: '4-7 years' },
  { raw_company: 'Infosys Limited', raw_role: 'Technology Lead', raw_salary_text: '₹12–18 LPA', raw_location: 'Hyderabad', raw_experience: '6-10 years' },
  { raw_company: 'Infosys', raw_role: 'Principal Consultant', raw_salary_text: '₹20–30 LPA', raw_location: 'Bengaluru', raw_experience: '12-16 years' },
  { raw_company: 'Infosys', raw_role: 'Data Engineer L4', raw_salary_text: '₹10–15 LPA', raw_location: 'Pune', raw_experience: '3-6 years' },

  // ── Wipro (5 records) ──
  { raw_company: 'Wipro Technologies', raw_role: 'Project Engineer', raw_salary_text: '₹3–4.5 LPA', raw_location: 'Bengaluru', raw_experience: '0-2 years' },
  { raw_company: 'Wipro', raw_role: 'Senior Project Engineer', raw_salary_text: '₹5.5–8 LPA', raw_location: 'Pune', raw_experience: '3-5 years' },
  { raw_company: 'Wipro Limited', raw_role: 'Technology Analyst', raw_salary_text: '₹8–12 LPA', raw_location: 'Hyderabad', raw_experience: '4-7 years' },
  { raw_company: 'Wipro', raw_role: 'Lead Consultant', raw_salary_text: '₹14–20 LPA', raw_location: 'Bengaluru', raw_experience: '8-12 years' },
  { raw_company: 'Wipro', raw_role: 'Software Engineer L3', raw_salary_text: '₹3–5 LPA', raw_location: 'Gurgaon', raw_experience: '0-1 years' },

  // ── Razorpay (4 records) ──
  { raw_company: 'Razorpay', raw_role: 'Software Engineer L4', raw_salary_text: '₹22–35 LPA', raw_location: 'Bengaluru', raw_experience: '2-5 years' },
  { raw_company: 'Razorpay Software Pvt Ltd', raw_role: 'Senior Software Engineer', raw_salary_text: '₹40–55 LPA', raw_location: 'Bengaluru', raw_experience: '5-8 years' },
  { raw_company: 'Razorpay India', raw_role: 'Product Manager L3', raw_salary_text: '₹18–28 LPA', raw_location: 'Bengaluru', raw_experience: '2-4 years' },
  { raw_company: 'Razorpay', raw_role: 'Staff Engineer', raw_salary_text: '₹60–85 LPA', raw_location: 'Bengaluru', raw_experience: '10+ years' },

  // ── Zepto (4 records) ──
  { raw_company: 'Zepto India', raw_role: 'SDE-II', raw_salary_text: '₹25–38 LPA', raw_location: 'Mumbai', raw_experience: '2-5 years' },
  { raw_company: 'Zepto', raw_role: 'Senior Software Engineer', raw_salary_text: '₹40–55 LPA', raw_location: 'Bengaluru', raw_experience: '5-8 years' },
  { raw_company: 'Zepto', raw_role: 'Data Scientist L4', raw_salary_text: '₹28–40 LPA', raw_location: 'Mumbai', raw_experience: '3-6 years' },
  { raw_company: 'Zepto', raw_role: 'Product Manager L5', raw_salary_text: '₹45–60 LPA', raw_location: 'Bengaluru', raw_experience: '6-9 years' },

  // ── Edge case: Intentional problematic records ──
  // Empty company name (should be rejected)
  { raw_company: '', raw_role: 'Software Engineer L3', raw_salary_text: '₹10 LPA', raw_location: 'Bengaluru', raw_experience: '2 years' },
  // Negative salary (should be rejected)
  { raw_company: 'Google', raw_role: 'SDE-I', raw_salary_text: '-₹5 LPA', raw_location: 'Bengaluru', raw_experience: '1 year' },
  // Invalid level title (should still map via heuristic)
  { raw_company: 'Amazon', raw_role: 'Entry Level Developer', raw_salary_text: '₹12–18 LPA', raw_location: 'Hyderabad', raw_experience: 'fresher' },
  // Company with no alias match (should use programmatic fallback)
  { raw_company: 'Swiggy', raw_role: 'Software Engineer L4', raw_salary_text: '₹24–36 LPA', raw_location: 'Bengaluru', raw_experience: '3-5 years' },
  // US salary in USD
  { raw_company: 'Google', raw_role: 'Software Engineer L4', raw_salary_text: '$150k–200k', raw_location: 'San Francisco', raw_experience: '3-6 years' },
  // Zero experience (fresher)
  { raw_company: 'TCS', raw_role: 'Graduate Engineer Trainee', raw_salary_text: '₹3.5 LPA', raw_location: 'Mumbai', raw_experience: 'fresher' },
]

/** Total count of sample records. */
export const SAMPLE_COUNT = SAMPLE_RAW_RECORDS.length
