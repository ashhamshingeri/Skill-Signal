// ================================================================
// SkillSignal Seed Data - Reference Data
// Deterministic, comprehensive labour market dataset for India
// ================================================================

export interface StateData {
  name: string;
  code: string;
  region: string;
  population: number;
}

export interface DistrictData {
  name: string;
  code: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  population: number;
  urbanPercentage: number;
}

export interface IndustryData {
  name: string;
  code: string;
  sector: string;
  description: string;
}

export interface SkillData {
  name: string;
  normalizedName: string;
  skillType: string;
  industryCode: string;
  description: string;
  isEmerging: boolean;
  isGreen: boolean;
  halfLifeMonths: number;
  demandMomentum: number;
}

export interface SkillRelationshipData {
  skillName: string;
  relatedSkillName: string;
  type: string;
  similarity: number;
  transitionWeeks: number;
  sharedCompetencies: string[];
  sharedTools: string[];
  industryOverlap: number;
  learningGap: string;
}

// ================================================================
// STATES
// ================================================================
export const STATES: StateData[] = [
  { name: 'Karnataka', code: 'KA', region: 'South', population: 67562686 },
  { name: 'Gujarat', code: 'GJ', region: 'West', population: 63872399 },
  { name: 'Maharashtra', code: 'MH', region: 'West', population: 123144223 },
  { name: 'Tamil Nadu', code: 'TN', region: 'South', population: 77841267 },
  { name: 'Delhi', code: 'DL', region: 'North', population: 19814000 },
  { name: 'Telangana', code: 'TS', region: 'South', population: 39362732 },
  { name: 'Kerala', code: 'KL', region: 'South', population: 35699443 },
  { name: 'Rajasthan', code: 'RJ', region: 'North', population: 79502477 },
  { name: 'Uttar Pradesh', code: 'UP', region: 'North', population: 231502578 },
  { name: 'West Bengal', code: 'WB', region: 'East', population: 99609303 },
];

// ================================================================
// DISTRICTS (5-6 per state = 50+ districts)
// ================================================================
export const DISTRICTS: DistrictData[] = [
  // Karnataka
  { name: 'Bengaluru Urban', code: 'KA-BLR', stateCode: 'KA', latitude: 12.9716, longitude: 77.5946, population: 12765000, urbanPercentage: 91.0 },
  { name: 'Mysuru', code: 'KA-MYS', stateCode: 'KA', latitude: 12.2958, longitude: 76.6394, population: 3145000, urbanPercentage: 41.0 },
  { name: 'Dharwad', code: 'KA-DHW', stateCode: 'KA', latitude: 15.4589, longitude: 75.0078, population: 1973000, urbanPercentage: 47.0 },
  { name: 'Mangaluru', code: 'KA-MNG', stateCode: 'KA', latitude: 12.8714, longitude: 74.8431, population: 2089000, urbanPercentage: 39.0 },
  { name: 'Hubballi-Dharwad', code: 'KA-HBL', stateCode: 'KA', latitude: 15.3647, longitude: 75.1240, population: 1810000, urbanPercentage: 52.0 },
  { name: 'Belagavi', code: 'KA-BGM', stateCode: 'KA', latitude: 15.8497, longitude: 74.4977, population: 4779000, urbanPercentage: 28.0 },

  // Gujarat
  { name: 'Ahmedabad', code: 'GJ-AMD', stateCode: 'GJ', latitude: 23.0225, longitude: 72.5714, population: 8253000, urbanPercentage: 72.0 },
  { name: 'Surat', code: 'GJ-SRT', stateCode: 'GJ', latitude: 21.1702, longitude: 72.8311, population: 6736000, urbanPercentage: 80.0 },
  { name: 'Vadodara', code: 'GJ-VAD', stateCode: 'GJ', latitude: 22.3072, longitude: 73.1812, population: 4157000, urbanPercentage: 49.0 },
  { name: 'Rajkot', code: 'GJ-RJK', stateCode: 'GJ', latitude: 22.3039, longitude: 70.8022, population: 3804000, urbanPercentage: 45.0 },
  { name: 'Gandhinagar', code: 'GJ-GNR', stateCode: 'GJ', latitude: 23.2156, longitude: 72.6369, population: 1391000, urbanPercentage: 57.0 },

  // Maharashtra
  { name: 'Mumbai', code: 'MH-MUM', stateCode: 'MH', latitude: 19.0760, longitude: 72.8777, population: 20961000, urbanPercentage: 100.0 },
  { name: 'Pune', code: 'MH-PUN', stateCode: 'MH', latitude: 18.5204, longitude: 73.8567, population: 9426000, urbanPercentage: 61.0 },
  { name: 'Nagpur', code: 'MH-NGP', stateCode: 'MH', latitude: 21.1458, longitude: 79.0882, population: 5032000, urbanPercentage: 68.0 },
  { name: 'Nashik', code: 'MH-NSK', stateCode: 'MH', latitude: 19.9975, longitude: 73.7898, population: 6109000, urbanPercentage: 36.0 },
  { name: 'Aurangabad', code: 'MH-AUR', stateCode: 'MH', latitude: 19.8762, longitude: 75.3433, population: 3701000, urbanPercentage: 38.0 },

  // Tamil Nadu
  { name: 'Chennai', code: 'TN-CHN', stateCode: 'TN', latitude: 13.0827, longitude: 80.2707, population: 10971000, urbanPercentage: 100.0 },
  { name: 'Coimbatore', code: 'TN-CBE', stateCode: 'TN', latitude: 11.0168, longitude: 76.9558, population: 3458000, urbanPercentage: 75.0 },
  { name: 'Madurai', code: 'TN-MDU', stateCode: 'TN', latitude: 9.9252, longitude: 78.1198, population: 3038000, urbanPercentage: 63.0 },
  { name: 'Tiruchirappalli', code: 'TN-TRC', stateCode: 'TN', latitude: 10.7905, longitude: 78.7047, population: 2722000, urbanPercentage: 50.0 },

  // Delhi
  { name: 'New Delhi', code: 'DL-NDL', stateCode: 'DL', latitude: 28.6139, longitude: 77.2090, population: 3420000, urbanPercentage: 97.0 },
  { name: 'South Delhi', code: 'DL-SDH', stateCode: 'DL', latitude: 28.5245, longitude: 77.2066, population: 2732000, urbanPercentage: 98.0 },
  { name: 'East Delhi', code: 'DL-EDH', stateCode: 'DL', latitude: 28.6280, longitude: 77.2950, population: 1709000, urbanPercentage: 96.0 },
  { name: 'North Delhi', code: 'DL-NDH', stateCode: 'DL', latitude: 28.7041, longitude: 77.1025, population: 887000, urbanPercentage: 95.0 },

  // Telangana
  { name: 'Hyderabad', code: 'TS-HYD', stateCode: 'TS', latitude: 17.3850, longitude: 78.4867, population: 9746000, urbanPercentage: 90.0 },
  { name: 'Warangal', code: 'TS-WGL', stateCode: 'TS', latitude: 17.9784, longitude: 79.5941, population: 3522000, urbanPercentage: 30.0 },
  { name: 'Karimnagar', code: 'TS-KRM', stateCode: 'TS', latitude: 18.4386, longitude: 79.1288, population: 2583000, urbanPercentage: 28.0 },

  // Kerala
  { name: 'Thiruvananthapuram', code: 'KL-TVM', stateCode: 'KL', latitude: 8.5241, longitude: 76.9366, population: 3301000, urbanPercentage: 54.0 },
  { name: 'Ernakulam', code: 'KL-EKM', stateCode: 'KL', latitude: 10.0000, longitude: 76.3000, population: 3282000, urbanPercentage: 68.0 },
  { name: 'Kozhikode', code: 'KL-KZH', stateCode: 'KL', latitude: 11.2588, longitude: 75.7804, population: 3086000, urbanPercentage: 44.0 },

  // Rajasthan
  { name: 'Jaipur', code: 'RJ-JPR', stateCode: 'RJ', latitude: 26.9124, longitude: 75.7873, population: 6626000, urbanPercentage: 52.0 },
  { name: 'Jodhpur', code: 'RJ-JDH', stateCode: 'RJ', latitude: 26.2389, longitude: 73.0243, population: 3687000, urbanPercentage: 35.0 },
  { name: 'Udaipur', code: 'RJ-UDP', stateCode: 'RJ', latitude: 24.5854, longitude: 73.7125, population: 3068000, urbanPercentage: 23.0 },

  // Uttar Pradesh
  { name: 'Lucknow', code: 'UP-LKN', stateCode: 'UP', latitude: 26.8467, longitude: 80.9462, population: 4589000, urbanPercentage: 67.0 },
  { name: 'Noida', code: 'UP-NOI', stateCode: 'UP', latitude: 28.5355, longitude: 77.3910, population: 2092000, urbanPercentage: 82.0 },
  { name: 'Varanasi', code: 'UP-VNS', stateCode: 'UP', latitude: 25.3176, longitude: 82.9739, population: 3676000, urbanPercentage: 43.0 },
  { name: 'Kanpur', code: 'UP-KNP', stateCode: 'UP', latitude: 26.4499, longitude: 80.3319, population: 4581000, urbanPercentage: 65.0 },

  // West Bengal
  { name: 'Kolkata', code: 'WB-KOL', stateCode: 'WB', latitude: 22.5726, longitude: 88.3639, population: 14850000, urbanPercentage: 100.0 },
  { name: 'Howrah', code: 'WB-HWH', stateCode: 'WB', latitude: 22.5958, longitude: 88.2636, population: 4841000, urbanPercentage: 51.0 },
  { name: 'Siliguri', code: 'WB-SLG', stateCode: 'WB', latitude: 26.7271, longitude: 88.3953, population: 1004000, urbanPercentage: 55.0 },
];

// ================================================================
// INDUSTRIES
// ================================================================
export const INDUSTRIES: IndustryData[] = [
  { name: 'Information Technology', code: 'IT', sector: 'Services', description: 'Software, IT services, BPO, and digital solutions' },
  { name: 'Manufacturing', code: 'MFG', sector: 'Industry', description: 'Industrial manufacturing, assembly, and production' },
  { name: 'Automotive', code: 'AUTO', sector: 'Industry', description: 'Automobile manufacturing, EV, and auto components' },
  { name: 'Construction', code: 'CONST', sector: 'Industry', description: 'Building, infrastructure, and civil construction' },
  { name: 'Healthcare', code: 'HC', sector: 'Services', description: 'Hospitals, clinics, pharmaceuticals, and medical devices' },
  { name: 'Renewable Energy', code: 'RE', sector: 'Energy', description: 'Solar, wind, and green energy solutions' },
  { name: 'Retail & E-Commerce', code: 'RET', sector: 'Services', description: 'Retail operations, e-commerce, and logistics' },
  { name: 'Agriculture & Food', code: 'AGRI', sector: 'Primary', description: 'Agriculture, food processing, and agritech' },
  { name: 'Financial Services', code: 'FIN', sector: 'Services', description: 'Banking, insurance, fintech, and financial services' },
  { name: 'Textiles & Apparel', code: 'TEX', sector: 'Industry', description: 'Textile manufacturing, garments, and fashion' },
  { name: 'Tourism & Hospitality', code: 'TOUR', sector: 'Services', description: 'Hotels, travel, tourism, and food services' },
  { name: 'Electronics', code: 'ELEC', sector: 'Industry', description: 'Electronics manufacturing, semiconductors, and components' },
  { name: 'Logistics & Supply Chain', code: 'LOG', sector: 'Services', description: 'Transportation, warehousing, and supply chain management' },
  { name: 'Education & Training', code: 'EDU', sector: 'Services', description: 'Educational services, edtech, and skill development' },
];

// ================================================================
// SKILLS (30+ skills across industries)
// ================================================================
export const SKILLS: SkillData[] = [
  // EV / Automotive
  { name: 'EV Technician', normalizedName: 'ev_technician', skillType: 'technical', industryCode: 'AUTO', description: 'Electric vehicle maintenance, diagnostics, and repair', isEmerging: true, isGreen: true, halfLifeMonths: 24.0, demandMomentum: 8.4 },
  { name: 'Battery Technician', normalizedName: 'battery_technician', skillType: 'technical', industryCode: 'AUTO', description: 'Battery pack assembly, testing, and management systems', isEmerging: true, isGreen: true, halfLifeMonths: 20.0, demandMomentum: 7.8 },
  { name: 'EV Charging Infrastructure', normalizedName: 'ev_charging_infra', skillType: 'technical', industryCode: 'RE', description: 'Installation and maintenance of EV charging stations', isEmerging: true, isGreen: true, halfLifeMonths: 18.0, demandMomentum: 7.2 },
  { name: 'Automobile Mechanic', normalizedName: 'automobile_mechanic', skillType: 'vocational', industryCode: 'AUTO', description: 'Traditional vehicle repair and servicing', isEmerging: false, isGreen: false, halfLifeMonths: 36.0, demandMomentum: 4.2 },

  // IT / Digital
  { name: 'Python Programming', normalizedName: 'python_programming', skillType: 'digital', industryCode: 'IT', description: 'Python language for software development, data science, and automation', isEmerging: false, isGreen: false, halfLifeMonths: 12.4, demandMomentum: 7.6 },
  { name: 'Data Analytics', normalizedName: 'data_analytics', skillType: 'digital', industryCode: 'IT', description: 'Data analysis, visualization, and business intelligence', isEmerging: false, isGreen: false, halfLifeMonths: 14.0, demandMomentum: 8.0 },
  { name: 'Cloud Computing', normalizedName: 'cloud_computing', skillType: 'digital', industryCode: 'IT', description: 'AWS, Azure, GCP cloud infrastructure and services', isEmerging: false, isGreen: false, halfLifeMonths: 10.0, demandMomentum: 8.2 },
  { name: 'AI/ML Engineering', normalizedName: 'ai_ml_engineering', skillType: 'digital', industryCode: 'IT', description: 'Machine learning model development and deployment', isEmerging: true, isGreen: false, halfLifeMonths: 8.5, demandMomentum: 9.1 },
  { name: 'Cybersecurity', normalizedName: 'cybersecurity', skillType: 'digital', industryCode: 'IT', description: 'Network security, threat detection, and security operations', isEmerging: false, isGreen: false, halfLifeMonths: 11.0, demandMomentum: 8.5 },
  { name: 'Full Stack Development', normalizedName: 'full_stack_dev', skillType: 'digital', industryCode: 'IT', description: 'End-to-end web application development', isEmerging: false, isGreen: false, halfLifeMonths: 10.0, demandMomentum: 7.0 },

  // Renewable Energy / Green
  { name: 'Solar Installation Technician', normalizedName: 'solar_installation', skillType: 'technical', industryCode: 'RE', description: 'Solar panel installation, wiring, and maintenance', isEmerging: true, isGreen: true, halfLifeMonths: 18.7, demandMomentum: 7.9 },
  { name: 'Wind Turbine Technician', normalizedName: 'wind_turbine_tech', skillType: 'technical', industryCode: 'RE', description: 'Wind turbine installation, maintenance, and repair', isEmerging: true, isGreen: true, halfLifeMonths: 22.0, demandMomentum: 6.8 },
  { name: 'Energy Auditor', normalizedName: 'energy_auditor', skillType: 'technical', industryCode: 'RE', description: 'Energy efficiency assessment and optimization', isEmerging: true, isGreen: true, halfLifeMonths: 20.0, demandMomentum: 6.5 },

  // Manufacturing / Vocational
  { name: 'Industrial Welder', normalizedName: 'industrial_welder', skillType: 'vocational', industryCode: 'MFG', description: 'MIG, TIG, arc welding for industrial applications', isEmerging: false, isGreen: false, halfLifeMonths: 48.0, demandMomentum: 5.5 },
  { name: 'CNC Machine Operator', normalizedName: 'cnc_operator', skillType: 'technical', industryCode: 'MFG', description: 'CNC lathe and milling machine programming and operation', isEmerging: false, isGreen: false, halfLifeMonths: 30.0, demandMomentum: 6.0 },
  { name: 'Industrial Electrician', normalizedName: 'industrial_electrician', skillType: 'vocational', industryCode: 'MFG', description: 'Industrial electrical systems installation and maintenance', isEmerging: false, isGreen: false, halfLifeMonths: 40.0, demandMomentum: 5.8 },
  { name: 'Fabrication Technician', normalizedName: 'fabrication_tech', skillType: 'vocational', industryCode: 'MFG', description: 'Metal fabrication, cutting, shaping, and assembly', isEmerging: false, isGreen: false, halfLifeMonths: 42.0, demandMomentum: 5.0 },
  { name: 'Machine Maintenance Technician', normalizedName: 'machine_maintenance', skillType: 'vocational', industryCode: 'MFG', description: 'Preventive and corrective maintenance of industrial machinery', isEmerging: false, isGreen: false, halfLifeMonths: 38.0, demandMomentum: 5.2 },
  { name: 'Quality Control Inspector', normalizedName: 'quality_control', skillType: 'technical', industryCode: 'MFG', description: 'Product quality inspection, testing, and assurance', isEmerging: false, isGreen: false, halfLifeMonths: 35.0, demandMomentum: 5.0 },

  // Construction
  { name: 'Construction Supervisor', normalizedName: 'construction_supervisor', skillType: 'vocational', industryCode: 'CONST', description: 'Site supervision, project coordination, and safety management', isEmerging: false, isGreen: false, halfLifeMonths: 50.0, demandMomentum: 5.3 },
  { name: 'Plumber', normalizedName: 'plumber', skillType: 'vocational', industryCode: 'CONST', description: 'Plumbing installation, repair, and water systems', isEmerging: false, isGreen: false, halfLifeMonths: 60.0, demandMomentum: 4.8 },
  { name: 'Mason', normalizedName: 'mason', skillType: 'vocational', industryCode: 'CONST', description: 'Bricklaying, concrete work, and structural construction', isEmerging: false, isGreen: false, halfLifeMonths: 72.0, demandMomentum: 4.5 },

  // Healthcare
  { name: 'Nursing Assistant', normalizedName: 'nursing_assistant', skillType: 'technical', industryCode: 'HC', description: 'Patient care, clinical support, and healthcare assistance', isEmerging: false, isGreen: false, halfLifeMonths: 36.0, demandMomentum: 6.2 },
  { name: 'Medical Lab Technician', normalizedName: 'medical_lab_tech', skillType: 'technical', industryCode: 'HC', description: 'Laboratory testing, diagnostics, and sample processing', isEmerging: false, isGreen: false, halfLifeMonths: 30.0, demandMomentum: 6.0 },
  { name: 'Pharmacy Technician', normalizedName: 'pharmacy_tech', skillType: 'technical', industryCode: 'HC', description: 'Pharmaceutical dispensing, inventory, and patient counseling', isEmerging: false, isGreen: false, halfLifeMonths: 32.0, demandMomentum: 5.5 },

  // Textiles
  { name: 'Textile Machine Operator', normalizedName: 'textile_machine_op', skillType: 'vocational', industryCode: 'TEX', description: 'Textile loom and spinning machine operation', isEmerging: false, isGreen: false, halfLifeMonths: 45.0, demandMomentum: 3.5 },
  { name: 'Fashion Design', normalizedName: 'fashion_design', skillType: 'technical', industryCode: 'TEX', description: 'Garment design, pattern making, and fashion technology', isEmerging: false, isGreen: false, halfLifeMonths: 28.0, demandMomentum: 5.0 },

  // Finance
  { name: 'Financial Analyst', normalizedName: 'financial_analyst', skillType: 'digital', industryCode: 'FIN', description: 'Financial modeling, analysis, and reporting', isEmerging: false, isGreen: false, halfLifeMonths: 18.0, demandMomentum: 6.5 },
  { name: 'Digital Payment Systems', normalizedName: 'digital_payments', skillType: 'digital', industryCode: 'FIN', description: 'UPI, mobile banking, and fintech payment solutions', isEmerging: true, isGreen: false, halfLifeMonths: 12.0, demandMomentum: 7.0 },

  // Logistics
  { name: 'Warehouse Management', normalizedName: 'warehouse_mgmt', skillType: 'technical', industryCode: 'LOG', description: 'Warehouse operations, inventory management, and logistics', isEmerging: false, isGreen: false, halfLifeMonths: 24.0, demandMomentum: 6.0 },
  { name: 'Drone Operator', normalizedName: 'drone_operator', skillType: 'emerging', industryCode: 'LOG', description: 'Commercial drone operation, surveying, and delivery', isEmerging: true, isGreen: false, halfLifeMonths: 15.0, demandMomentum: 7.5 },

  // Agriculture
  { name: 'Precision Agriculture', normalizedName: 'precision_agri', skillType: 'emerging', industryCode: 'AGRI', description: 'IoT-based farming, soil monitoring, and smart agriculture', isEmerging: true, isGreen: true, halfLifeMonths: 16.0, demandMomentum: 6.8 },

  // Electronics
  { name: 'IoT Technician', normalizedName: 'iot_technician', skillType: 'emerging', industryCode: 'ELEC', description: 'IoT device setup, sensor networks, and embedded systems', isEmerging: true, isGreen: false, halfLifeMonths: 14.0, demandMomentum: 7.2 },
  { name: 'PCB Assembly Technician', normalizedName: 'pcb_assembly', skillType: 'technical', industryCode: 'ELEC', description: 'Printed circuit board assembly, soldering, and testing', isEmerging: false, isGreen: false, halfLifeMonths: 28.0, demandMomentum: 5.5 },

  // Tourism
  { name: 'Hospitality Management', normalizedName: 'hospitality_mgmt', skillType: 'vocational', industryCode: 'TOUR', description: 'Hotel operations, guest services, and tourism management', isEmerging: false, isGreen: false, halfLifeMonths: 40.0, demandMomentum: 5.0 },

  // Traditional declining
  { name: 'Data Entry Operator', normalizedName: 'data_entry', skillType: 'digital', industryCode: 'IT', description: 'Manual data entry, form processing, and digitization', isEmerging: false, isGreen: false, halfLifeMonths: 3.8, demandMomentum: 2.0 },
];

// ================================================================
// SKILL RELATIONSHIPS (for substitution finder)
// ================================================================
export const SKILL_RELATIONSHIPS: SkillRelationshipData[] = [
  // Welding cluster
  { skillName: 'Industrial Welder', relatedSkillName: 'CNC Machine Operator', type: 'substitute', similarity: 0.81, transitionWeeks: 3, sharedCompetencies: ['Metal working', 'Blueprint reading', 'Safety protocols', 'Material properties'], sharedTools: ['Grinding tools', 'Measuring instruments', 'Safety equipment'], industryOverlap: 0.85, learningGap: 'CNC programming and G-code fundamentals' },
  { skillName: 'Industrial Welder', relatedSkillName: 'Fabrication Technician', type: 'substitute', similarity: 0.76, transitionWeeks: 3, sharedCompetencies: ['Metal working', 'Blueprint reading', 'Safety protocols', 'Cutting techniques'], sharedTools: ['Angle grinder', 'Measuring tools', 'PPE'], industryOverlap: 0.90, learningGap: 'Sheet metal forming and assembly techniques' },
  { skillName: 'Industrial Welder', relatedSkillName: 'Machine Maintenance Technician', type: 'substitute', similarity: 0.68, transitionWeeks: 4, sharedCompetencies: ['Mechanical aptitude', 'Safety protocols', 'Tool usage'], sharedTools: ['Hand tools', 'Measuring instruments'], industryOverlap: 0.75, learningGap: 'Preventive maintenance scheduling and diagnostic skills' },
  { skillName: 'Industrial Welder', relatedSkillName: 'Industrial Electrician', type: 'related', similarity: 0.55, transitionWeeks: 8, sharedCompetencies: ['Safety protocols', 'Blueprint reading'], sharedTools: ['PPE', 'Measuring instruments'], industryOverlap: 0.70, learningGap: 'Electrical theory, wiring, and circuit analysis' },

  // EV cluster
  { skillName: 'EV Technician', relatedSkillName: 'Battery Technician', type: 'related', similarity: 0.82, transitionWeeks: 2, sharedCompetencies: ['EV systems', 'High-voltage safety', 'Diagnostics', 'Battery management'], sharedTools: ['Multimeter', 'Diagnostic tools', 'HV safety gear'], industryOverlap: 0.95, learningGap: 'Specialized battery chemistry and BMS programming' },
  { skillName: 'EV Technician', relatedSkillName: 'Automobile Mechanic', type: 'upgrade', similarity: 0.72, transitionWeeks: 6, sharedCompetencies: ['Vehicle systems', 'Diagnostics', 'Repair procedures'], sharedTools: ['Diagnostic scanners', 'Hand tools', 'Lifts'], industryOverlap: 0.90, learningGap: 'EV powertrain, regenerative braking, and HV safety' },
  { skillName: 'EV Technician', relatedSkillName: 'EV Charging Infrastructure', type: 'related', similarity: 0.75, transitionWeeks: 3, sharedCompetencies: ['EV systems', 'Electrical fundamentals', 'Safety protocols'], sharedTools: ['Multimeter', 'Wiring tools'], industryOverlap: 0.85, learningGap: 'Charging station installation and grid connectivity' },
  { skillName: 'EV Technician', relatedSkillName: 'Industrial Electrician', type: 'substitute', similarity: 0.60, transitionWeeks: 8, sharedCompetencies: ['Electrical systems', 'Safety protocols', 'Troubleshooting'], sharedTools: ['Multimeter', 'Wiring tools'], industryOverlap: 0.55, learningGap: 'EV-specific systems, powertrain, and HV protocols' },

  // IT cluster
  { skillName: 'Python Programming', relatedSkillName: 'Data Analytics', type: 'related', similarity: 0.78, transitionWeeks: 4, sharedCompetencies: ['Programming', 'Data manipulation', 'Problem solving'], sharedTools: ['Python', 'Jupyter', 'Git'], industryOverlap: 0.80, learningGap: 'Statistical analysis and visualization techniques' },
  { skillName: 'Python Programming', relatedSkillName: 'AI/ML Engineering', type: 'prerequisite', similarity: 0.72, transitionWeeks: 12, sharedCompetencies: ['Programming', 'Mathematics', 'Data structures'], sharedTools: ['Python', 'Git', 'IDEs'], industryOverlap: 0.85, learningGap: 'ML algorithms, deep learning, model deployment' },
  { skillName: 'Data Analytics', relatedSkillName: 'AI/ML Engineering', type: 'upgrade', similarity: 0.70, transitionWeeks: 16, sharedCompetencies: ['Statistics', 'Data processing', 'Visualization'], sharedTools: ['Python', 'SQL', 'Jupyter'], industryOverlap: 0.80, learningGap: 'Advanced ML algorithms, deep learning frameworks' },
  { skillName: 'Full Stack Development', relatedSkillName: 'Cloud Computing', type: 'related', similarity: 0.68, transitionWeeks: 6, sharedCompetencies: ['Programming', 'System design', 'DevOps basics'], sharedTools: ['Git', 'Docker', 'CI/CD'], industryOverlap: 0.85, learningGap: 'Cloud architecture, scaling, and managed services' },
  { skillName: 'Cybersecurity', relatedSkillName: 'Cloud Computing', type: 'related', similarity: 0.62, transitionWeeks: 8, sharedCompetencies: ['Networking', 'System administration', 'Security fundamentals'], sharedTools: ['Linux', 'Monitoring tools'], industryOverlap: 0.80, learningGap: 'Cloud-specific security, IAM, and compliance' },

  // Solar / Green cluster
  { skillName: 'Solar Installation Technician', relatedSkillName: 'Industrial Electrician', type: 'substitute', similarity: 0.70, transitionWeeks: 4, sharedCompetencies: ['Electrical wiring', 'Safety protocols', 'Circuit fundamentals'], sharedTools: ['Multimeter', 'Wiring tools', 'PPE'], industryOverlap: 0.50, learningGap: 'Solar panel technology, inverter systems, and DC wiring' },
  { skillName: 'Solar Installation Technician', relatedSkillName: 'Energy Auditor', type: 'related', similarity: 0.65, transitionWeeks: 6, sharedCompetencies: ['Energy systems', 'Electrical fundamentals', 'Sustainability'], sharedTools: ['Energy meters', 'Testing equipment'], industryOverlap: 0.90, learningGap: 'Energy efficiency assessment methodologies' },
  { skillName: 'Solar Installation Technician', relatedSkillName: 'Wind Turbine Technician', type: 'related', similarity: 0.58, transitionWeeks: 8, sharedCompetencies: ['Renewable energy', 'Electrical systems', 'Height safety'], sharedTools: ['Multimeter', 'Safety harness'], industryOverlap: 0.85, learningGap: 'Turbine mechanics, height work, and wind systems' },

  // Healthcare cluster
  { skillName: 'Nursing Assistant', relatedSkillName: 'Medical Lab Technician', type: 'related', similarity: 0.55, transitionWeeks: 12, sharedCompetencies: ['Patient care', 'Medical terminology', 'Hygiene protocols'], sharedTools: ['Medical equipment', 'PPE'], industryOverlap: 0.95, learningGap: 'Lab techniques, sample processing, and diagnostic equipment' },
  { skillName: 'Nursing Assistant', relatedSkillName: 'Pharmacy Technician', type: 'related', similarity: 0.50, transitionWeeks: 10, sharedCompetencies: ['Patient interaction', 'Medical terminology', 'Healthcare protocols'], sharedTools: ['Medical records'], industryOverlap: 0.90, learningGap: 'Pharmacology, dispensing, and inventory management' },

  // Construction cluster
  { skillName: 'Construction Supervisor', relatedSkillName: 'Plumber', type: 'related', similarity: 0.48, transitionWeeks: 12, sharedCompetencies: ['Construction knowledge', 'Blueprint reading', 'Safety'], sharedTools: ['Measuring tools', 'PPE'], industryOverlap: 0.95, learningGap: 'Plumbing systems, pipe fitting, and water dynamics' },
  { skillName: 'Construction Supervisor', relatedSkillName: 'Mason', type: 'related', similarity: 0.52, transitionWeeks: 10, sharedCompetencies: ['Construction knowledge', 'Blueprint reading', 'Materials'], sharedTools: ['Measuring tools', 'PPE'], industryOverlap: 0.95, learningGap: 'Hands-on masonry techniques and concrete work' },

  // Logistics cluster
  { skillName: 'Warehouse Management', relatedSkillName: 'Drone Operator', type: 'related', similarity: 0.40, transitionWeeks: 8, sharedCompetencies: ['Logistics', 'Inventory awareness', 'Technology'], sharedTools: ['WMS software'], industryOverlap: 0.70, learningGap: 'Drone piloting, regulations, and aerial surveying' },

  // Declining skill upgrades
  { skillName: 'Data Entry Operator', relatedSkillName: 'Data Analytics', type: 'upgrade', similarity: 0.35, transitionWeeks: 20, sharedCompetencies: ['Data handling', 'Attention to detail', 'Computer literacy'], sharedTools: ['Spreadsheets', 'Databases'], industryOverlap: 0.60, learningGap: 'Statistical analysis, Python/R, visualization tools' },
  { skillName: 'Data Entry Operator', relatedSkillName: 'Digital Payment Systems', type: 'upgrade', similarity: 0.40, transitionWeeks: 12, sharedCompetencies: ['Data handling', 'Computer literacy', 'Process compliance'], sharedTools: ['Computers', 'Software tools'], industryOverlap: 0.50, learningGap: 'Payment systems, UPI architecture, and fintech tools' },
];

// ================================================================
// DATA SOURCES
// ================================================================
export interface DataSourceData {
  name: string;
  type: string;
  category: string;
  url: string;
  status: string;
  recordCount: number;
  coverageStates: number;
  coverageDistricts: number;
  dataQuality: number;
  description: string;
  apiAvailable: boolean;
}

export const DATA_SOURCES: DataSourceData[] = [
  { name: 'National Career Service (NCS)', type: 'demand', category: 'Government', url: 'https://www.ncs.gov.in', status: 'prototype', recordCount: 485210, coverageStates: 10, coverageDistricts: 38, dataQuality: 72.0, description: 'Job postings from the National Career Service portal', apiAvailable: false },
  { name: 'Skill India Portal', type: 'supply', category: 'Government', url: 'https://www.skillindia.gov.in', status: 'prototype', recordCount: 284102, coverageStates: 10, coverageDistricts: 38, dataQuality: 78.0, description: 'Training program data from Skill India initiatives', apiAvailable: false },
  { name: 'PMKVY Dashboard', type: 'supply', category: 'Government', url: 'https://pmkvyofficial.org', status: 'prototype', recordCount: 198400, coverageStates: 10, coverageDistricts: 35, dataQuality: 80.0, description: 'PMKVY training and certification data', apiAvailable: false },
  { name: 'ITI Management System', type: 'supply', category: 'Government', url: 'https://ncvtmis.gov.in', status: 'prototype', recordCount: 156800, coverageStates: 10, coverageDistricts: 30, dataQuality: 68.0, description: 'Industrial Training Institute enrollment and certification data', apiAvailable: false },
  { name: 'Job Portal Aggregator', type: 'demand', category: 'Private', url: '', status: 'prototype', recordCount: 798911, coverageStates: 10, coverageDistricts: 38, dataQuality: 65.0, description: 'Aggregated job postings from major private job portals', apiAvailable: false },
  { name: 'Gig Platform Data', type: 'demand', category: 'Private', url: '', status: 'prototype', recordCount: 124500, coverageStates: 7, coverageDistricts: 20, dataQuality: 55.0, description: 'Demand signals from gig economy platforms', apiAvailable: false },
  { name: 'PLFS Data', type: 'context', category: 'Government', url: 'https://mospi.gov.in', status: 'prototype', recordCount: 42000, coverageStates: 10, coverageDistricts: 38, dataQuality: 85.0, description: 'Periodic Labour Force Survey employment statistics', apiAvailable: false },
  { name: 'Census Employment Data', type: 'context', category: 'Government', url: 'https://censusindia.gov.in', status: 'prototype', recordCount: 38500, coverageStates: 10, coverageDistricts: 38, dataQuality: 82.0, description: 'Census-based employment and occupation data', apiAvailable: false },
  { name: 'Local Job Board Aggregator', type: 'demand', category: 'Mixed', url: '', status: 'prototype', recordCount: 67800, coverageStates: 5, coverageDistricts: 15, dataQuality: 50.0, description: 'Regional and local job board postings', apiAvailable: false },
  { name: 'Industry Association Reports', type: 'context', category: 'Industry', url: '', status: 'prototype', recordCount: 8200, coverageStates: 10, coverageDistricts: 25, dataQuality: 75.0, description: 'Skill demand reports from industry associations like NASSCOM, CII', apiAvailable: false },
];

// ================================================================
// SEASONALITY TEMPLATES (monthly indices for different skill types)
// ================================================================
export interface SeasonalityTemplate {
  skillNames: string[];
  monthlyIndices: number[]; // 12 values for Jan-Dec
  description: string;
}

export const SEASONALITY_TEMPLATES: SeasonalityTemplate[] = [
  {
    skillNames: ['Construction Supervisor', 'Plumber', 'Mason'],
    monthlyIndices: [0.85, 0.90, 1.05, 1.10, 0.80, 0.65, 0.55, 0.60, 0.75, 1.15, 1.30, 1.30],
    description: 'Construction: higher Oct-Mar (dry season), lower Jun-Aug (monsoon)',
  },
  {
    skillNames: ['Hospitality Management'],
    monthlyIndices: [0.90, 0.85, 0.95, 0.80, 0.75, 0.70, 0.80, 0.85, 1.00, 1.20, 1.35, 1.25],
    description: 'Tourism: peaks Oct-Dec (festival + winter tourism)',
  },
  {
    skillNames: ['Precision Agriculture'],
    monthlyIndices: [0.80, 0.85, 1.00, 1.15, 1.20, 1.30, 1.10, 0.90, 0.85, 1.00, 1.10, 0.75],
    description: 'Agriculture: higher during sowing and harvest seasons',
  },
  {
    skillNames: ['Textile Machine Operator', 'Fashion Design'],
    monthlyIndices: [0.90, 0.95, 1.00, 0.95, 0.90, 0.85, 1.05, 1.15, 1.20, 1.30, 1.15, 0.80],
    description: 'Textiles: higher Jul-Nov (pre-festival production)',
  },
  {
    skillNames: ['Warehouse Management'],
    monthlyIndices: [0.85, 0.80, 0.90, 0.95, 0.95, 0.90, 0.95, 1.05, 1.15, 1.25, 1.30, 1.15],
    description: 'Logistics: higher Sep-Dec (festival + e-commerce season)',
  },
];

// Default seasonality (relatively flat) for skills not in templates
export const DEFAULT_SEASONALITY: number[] = [0.95, 0.95, 1.00, 1.00, 1.00, 0.95, 0.95, 1.00, 1.05, 1.05, 1.05, 1.00];
