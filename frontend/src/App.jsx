import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = "'Outfit', sans-serif";

const API_BASE = 'http://localhost:8000';

const NORMAL_RANGES = {
  hemoglobin: { category: 'Complete Blood Count (CBC)', min: 12.0, max: 17.5, unit: 'g/dL', name: 'Hemoglobin' },
  rbc_count: { category: 'Complete Blood Count (CBC)', min: 4.0, max: 6.2, unit: 'million/μL', name: 'RBC Count' },
  wbc_count: { category: 'Complete Blood Count (CBC)', min: 4.0, max: 11.0, unit: 'thousand/μL', name: 'WBC Count' },
  platelets: { category: 'Complete Blood Count (CBC)', min: 150, max: 450, unit: 'thousand/μL', name: 'Platelets' },
  hematocrit: { category: 'Complete Blood Count (CBC)', min: 38.0, max: 50.0, unit: '%', name: 'Hematocrit' },
  mcv: { category: 'Complete Blood Count (CBC)', min: 80.0, max: 100.0, unit: 'fL', name: 'MCV' },
  mch: { category: 'Complete Blood Count (CBC)', min: 27.0, max: 33.0, unit: 'pg', name: 'MCH' },
  mchc: { category: 'Complete Blood Count (CBC)', min: 32.0, max: 36.0, unit: 'g/dL', name: 'MCHC' },
  rdw: { category: 'Complete Blood Count (CBC)', min: 11.5, max: 14.5, unit: '%', name: 'RDW' },
  neutrophils: { category: 'Complete Blood Count (CBC)', min: 40.0, max: 80.0, unit: '%', name: 'Neutrophils' },
  lymphocytes: { category: 'Complete Blood Count (CBC)', min: 20.0, max: 40.0, unit: '%', name: 'Lymphocytes' },
  monocytes: { category: 'Complete Blood Count (CBC)', min: 2.0, max: 10.0, unit: '%', name: 'Monocytes' },
  eosinophils: { category: 'Complete Blood Count (CBC)', min: 1.0, max: 6.0, unit: '%', name: 'Eosinophils' },
  basophils: { category: 'Complete Blood Count (CBC)', min: 0.0, max: 2.0, unit: '%', name: 'Basophils' },
  fasting_sugar: { category: 'Diabetes Profile', min: 70, max: 100, unit: 'mg/dL', name: 'Fasting Glucose' },
  post_prandial_sugar: { category: 'Diabetes Profile', min: 70, max: 140, unit: 'mg/dL', name: 'PP Glucose' },
  hba1c: { category: 'Diabetes Profile', min: 4.0, max: 5.6, unit: '%', name: 'HbA1c' },
  random_sugar: { category: 'Diabetes Profile', min: 70, max: 200, unit: 'mg/dL', name: 'Random Glucose' },
  alt: { category: 'Liver Function Test', min: 7, max: 56, unit: 'U/L', name: 'ALT' },
  ast: { category: 'Liver Function Test', min: 10, max: 40, unit: 'U/L', name: 'AST' },
  alp: { category: 'Liver Function Test', min: 44, max: 147, unit: 'U/L', name: 'ALP' },
  bilirubin: { category: 'Liver Function Test', min: 0.1, max: 1.2, unit: 'mg/dL', name: 'Total Bilirubin' },
  direct_bilirubin: { category: 'Liver Function Test', min: 0.0, max: 0.3, unit: 'mg/dL', name: 'Direct Bilirubin' },
  total_protein: { category: 'Liver Function Test', min: 6.0, max: 8.3, unit: 'g/dL', name: 'Total Protein' },
  albumin: { category: 'Liver Function Test', min: 3.4, max: 5.4, unit: 'g/dL', name: 'Albumin' },
  globulin: { category: 'Liver Function Test', min: 2.0, max: 3.5, unit: 'g/dL', name: 'Globulin' },
  ag_ratio: { category: 'Liver Function Test', min: 1.1, max: 2.5, unit: '', name: 'A/G Ratio' },
  creatinine: { category: 'Kidney Function', min: 0.6, max: 1.2, unit: 'mg/dL', name: 'Creatinine' },
  bun: { category: 'Kidney Function', min: 7, max: 20, unit: 'mg/dL', name: 'BUN' },
  bun_creatinine_ratio: { category: 'Kidney Function', min: 10, max: 20, unit: '', name: 'BUN/Cr Ratio' },
  uric_acid: { category: 'Kidney Function', min: 3.5, max: 7.2, unit: 'mg/dL', name: 'Uric Acid' },
  egfr: { category: 'Kidney Function', min: 90, max: 120, unit: 'mL/min', name: 'eGFR' },
  iron: { category: 'Iron Studies', min: 60, max: 170, unit: 'μg/dL', name: 'Serum Iron' },
  tibc: { category: 'Iron Studies', min: 240, max: 450, unit: 'μg/dL', name: 'TIBC' },
  ferritin: { category: 'Iron Studies', min: 24, max: 336, unit: 'ng/mL', name: 'Ferritin' },
  transferrin_sat: { category: 'Iron Studies', min: 20, max: 50, unit: '%', name: 'Transferrin Sat.' },
  tsh: { category: 'Thyroid Profile', min: 0.4, max: 4.0, unit: 'mIU/L', name: 'TSH' },
  t3: { category: 'Thyroid Profile', min: 80, max: 200, unit: 'ng/dL', name: 'T3' },
  t4: { category: 'Thyroid Profile', min: 5.0, max: 12.0, unit: 'μg/dL', name: 'T4' },
  free_t3: { category: 'Thyroid Profile', min: 2.3, max: 4.1, unit: 'pg/mL', name: 'Free T3' },
  free_t4: { category: 'Thyroid Profile', min: 0.9, max: 1.7, unit: 'ng/dL', name: 'Free T4' }
};

const CATEGORIES = [
  'Complete Blood Count (CBC)',
  'Liver Function Test',
  'Kidney Function',
  'Diabetes Profile',
  'Iron Studies',
  'Thyroid Profile'
];

const Expander = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`expander ${isOpen ? 'open' : ''}`}>
      <button type="button" className="expander-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span className="expander-icon">+</span>
      </button>
      <div className="expander-content">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('med_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('input');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('med_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [patientId, setPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Patient Form
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState('');
  const [pGender, setPGender] = useState('');
  const [pBlood, setPBlood] = useState('');
  const [pStatus, setPStatus] = useState('');

  // Report Form
  const [reportForm, setReportForm] = useState({
    hemoglobin: '', rbc_count: '', wbc_count: '', platelets: '', hematocrit: '', mcv: '', mch: '', mchc: '', rdw: '', neutrophils: '', lymphocytes: '', monocytes: '', eosinophils: '', basophils: '',
    alt: '', ast: '', alp: '', bilirubin: '', direct_bilirubin: '', total_protein: '', albumin: '', globulin: '', ag_ratio: '',
    urea: '', creatinine: '', bun: '', bun_creatinine_ratio: '', uric_acid: '', egfr: '',
    fasting_sugar: '', post_prandial_sugar: '', hba1c: '', random_sugar: '',
    iron: '', tibc: '', ferritin: '', transferrin_sat: '',
    tsh: '', t3: '', t4: '', free_t3: '', free_t4: ''
  });
  const [rStatus, setRStatus] = useState('Analyze & Save Report');

  // Chat
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hello! I am MediBot, your AI healthcare assistant. Once you've entered patient data, I can provide personalized insights based on the inputs.", isAi: true }
  ]);
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const savedId = localStorage.getItem('med_patient_id');
    if (savedId) {
      axios.get(`${API_BASE}/patients/${savedId}`)
        .then(res => {
          setPatientId(savedId);
          setPatientDetails(res.data);
          return axios.get(`${API_BASE}/patients/${savedId}/reports/`);
        })
        .then(res => {
          if (res && res.data && res.data.length > 0) {
            setReportData(res.data[res.data.length - 1]);
          }
        })
        .catch(err => {
          console.error("Failed to restore session", err);
          localStorage.removeItem('med_patient_id');
        });
    }
  }, []);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (patientDetails && patientDetails.name === pName && patientDetails.age === Number(pAge) && patientDetails.gender === pGender && patientDetails.blood_group === pBlood) {
      setPStatus('This patient data has already been saved.');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/patients/`, {
        name: pName, age: Number(pAge), gender: pGender, blood_group: pBlood
      });
      setPatientId(res.data.id || res.data._id);
      setPatientDetails(res.data);
      localStorage.setItem('med_patient_id', res.data.id || res.data._id);
      setPStatus('Patient created successfully!');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setPStatus('This patient data has already been saved.');
      } else {
        setPStatus('Error saving patient.');
      }
    }
  };

  const handleReportChange = (e) => {
    setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    try {
      setRStatus('Analyzing...');

      const payload = {};
      Object.keys(reportForm).forEach(k => {
        if (reportForm[k] !== '') payload[k] = parseFloat(reportForm[k]);
      });

      const res = await axios.post(`${API_BASE}/patients/${patientId}/reports/`, payload);
      setReportData(res.data);
      setRStatus('Report Saved & Analyzed');
      setActiveTab('analysis');
      setTimeout(() => setRStatus('Update Report'), 2000);
    } catch (err) {
      console.error(err);
      setRStatus('Error saving!');
    }
  };

  const handleDeletePatient = async () => {
    if (!patientId || !window.confirm("Are you sure you want to delete all patient data and reports permanently?")) return;
    try {
      await axios.delete(`${API_BASE}/patients/${patientId}`);
      setPatientId(null);
      setPatientDetails(null);
      setReportData(null);
      setReportForm({
        hemoglobin: '', rbc_count: '', wbc_count: '', platelets: '', hematocrit: '', mcv: '', mch: '', mchc: '', rdw: '', neutrophils: '', lymphocytes: '', monocytes: '', eosinophils: '', basophils: '',
        alt: '', ast: '', alp: '', bilirubin: '', direct_bilirubin: '', total_protein: '', albumin: '', globulin: '', ag_ratio: '',
        urea: '', creatinine: '', bun: '', bun_creatinine_ratio: '', uric_acid: '', egfr: '',
        fasting_sugar: '', post_prandial_sugar: '', hba1c: '', random_sugar: '',
        iron: '', tibc: '', ferritin: '', transferrin_sat: '',
        tsh: '', t3: '', t4: '', free_t3: '', free_t4: ''
      });
      localStorage.removeItem('med_patient_id');
      setPName(''); setPAge(''); setPGender('Male'); setPBlood('O+'); setPStatus('');
      alert("Patient data deleted successfully.");
      setActiveTab('input');
    } catch (err) {
      console.error(err);
      alert("Failed to delete patient data.");
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setMessages(prev => [...prev, { text: msg, isAi: false }]);
    setChatInput('');
    try {
      const res = await axios.post(`${API_BASE}/chat`, { message: msg, patient_id: patientId || null });
      setMessages(prev => [...prev, { text: res.data.reply, isAi: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Network error querying AI.", isAi: true }]);
    }
  };

  const getChartData = (category) => {
    if (!reportData) return null;
    const labels = [];
    const data = [];
    const colors = [];
    Object.keys(NORMAL_RANGES).forEach(key => {
      const range = NORMAL_RANGES[key];
      if (range.category === category && reportData[key] !== undefined && reportData[key] !== null) {
        labels.push(range.name);
        data.push(reportData[key]);
        const val = reportData[key];
        if (val < range.min) colors.push('#f59e0b');
        else if (val > range.max) colors.push('#ef4444');
        else colors.push('#00f2fe');
      }
    });

    if (labels.length === 0) return null;

    return {
      labels,
      datasets: [{ label: 'Patient Values', data, backgroundColor: colors, borderRadius: 4 }]
    };
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo-circle">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <h2>MediCore AI</h2>
        </div>

        <div className="demographics-section">
          <h3>Patient Information</h3>
          <form onSubmit={handleCreatePatient}>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" required value={pName} onChange={(e) => setPName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Age</label>
              <input type="number" min="0" max="100" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} required value={pAge} onChange={(e) => { const val = e.target.value; if (val === '' || (Number(val) <= 100)) setPAge(val); }} />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select required value={pGender} onChange={(e) => setPGender(e.target.value)}>
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label>Blood Group</label>
              <select required value={pBlood} onChange={(e) => setPBlood(e.target.value)}>
                <option value="" disabled>Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full mt-4">Save Patient Detail</button>
            {pStatus && <p className="status-msg" style={{ color: pStatus.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>{pStatus}</p>}
          </form>
        </div>

        {!patientDetails ? (
          <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--accent-secondary)' }}>About</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
              This AI-powered system analyzes lab reports and provides personalized medical recommendations. Always consult with a healthcare professional for proper diagnosis.
            </div>
          </div>
        ) : (
          <div className="active-patient-card">
            <div className="patient-avatar"></div>
            <div>
              <div className="fw-bold">{patientDetails.name}</div>
              <div className="text-sm text-dim">{patientDetails.age} Yrs | {patientDetails.gender} | {patientDetails.blood_group}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Area */}
      <main className="main-content">
        <nav className="tabs-nav glass-panel" style={{ display: 'flex', alignItems: 'center' }}>
          {['input', 'analysis', 'visualizations', 'chatbot'].map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'input' ? 'Input Report' : t === 'analysis' ? 'Analysis Results' : t === 'visualizations' ? 'Visualizations' : 'AI Chatbot'}
            </button>
          ))}
          <button onClick={toggleTheme} style={{ marginLeft: 'auto', marginRight: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '1.4rem' }} title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>

        <div className="tab-container">
          {activeTab === 'input' && (
            <section className="tab-content glass-panel scrollable-content">
              <div className="header-with-status">
                <h2>Lab Report Entry</h2>
                <span className={`badge ${patientId ? 'ok' : ''}`}>{patientId ? 'Ready for Input' : 'Awaiting Patient Setup'}</span>
              </div>
              <p className="subtitle">Enter the patient's pathological data below.</p>

              <form onSubmit={handleSubmitReport}>
                <Expander title="Complete Blood Count (CBC)">
                  <div className="grid-3">
                    <div className="input-group"><label>Hemoglobin (g/dL)</label><input type="number" step="0.1" name="hemoglobin" value={reportForm.hemoglobin} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>RBC Count (million/μL)</label><input type="number" step="0.01" name="rbc_count" value={reportForm.rbc_count} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>WBC Count (thousand/μL)</label><input type="number" step="0.1" name="wbc_count" value={reportForm.wbc_count} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Platelets (thousand/μL)</label><input type="number" step="1" name="platelets" value={reportForm.platelets} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Hematocrit (%)</label><input type="number" step="0.1" name="hematocrit" value={reportForm.hematocrit} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>MCV (fL)</label><input type="number" step="0.1" name="mcv" value={reportForm.mcv} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>MCH (pg)</label><input type="number" step="0.1" name="mch" value={reportForm.mch} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>MCHC (g/dL)</label><input type="number" step="0.1" name="mchc" value={reportForm.mchc} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>RDW (%)</label><input type="number" step="0.1" name="rdw" value={reportForm.rdw} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Neutrophils (%)</label><input type="number" step="0.1" name="neutrophils" value={reportForm.neutrophils} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Lymphocytes (%)</label><input type="number" step="0.1" name="lymphocytes" value={reportForm.lymphocytes} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Monocytes (%)</label><input type="number" step="0.1" name="monocytes" value={reportForm.monocytes} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Eosinophils (%)</label><input type="number" step="0.1" name="eosinophils" value={reportForm.eosinophils} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Basophils (%)</label><input type="number" step="0.1" name="basophils" value={reportForm.basophils} onChange={handleReportChange} /></div>
                  </div>
                </Expander>

                <Expander title="Liver Function Test">
                  <div className="grid-3">
                    <div className="input-group"><label>ALT (SGPT) (U/L)</label><input type="number" step="1" name="alt" value={reportForm.alt} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>AST (SGOT) (U/L)</label><input type="number" step="1" name="ast" value={reportForm.ast} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>ALP (U/L)</label><input type="number" step="1" name="alp" value={reportForm.alp} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Total Bilirubin (mg/dL)</label><input type="number" step="0.1" name="bilirubin" value={reportForm.bilirubin} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Direct Bilirubin (mg/dL)</label><input type="number" step="0.1" name="direct_bilirubin" value={reportForm.direct_bilirubin} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Total Protein (g/dL)</label><input type="number" step="0.1" name="total_protein" value={reportForm.total_protein} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Albumin (g/dL)</label><input type="number" step="0.1" name="albumin" value={reportForm.albumin} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Globulin (g/dL)</label><input type="number" step="0.1" name="globulin" value={reportForm.globulin} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>A/G Ratio</label><input type="number" step="0.01" name="ag_ratio" value={reportForm.ag_ratio} onChange={handleReportChange} /></div>
                  </div>
                </Expander>

                <Expander title="Kidney Function">
                  <div className="grid-3">
                    <div className="input-group"><label>Creatinine (mg/dL)</label><input type="number" step="0.1" name="creatinine" value={reportForm.creatinine} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>BUN (mg/dL)</label><input type="number" step="0.1" name="bun" value={reportForm.bun} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>BUN/Cr Ratio</label><input type="number" step="0.1" name="bun_creatinine_ratio" value={reportForm.bun_creatinine_ratio} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Uric Acid (mg/dL)</label><input type="number" step="0.1" name="uric_acid" value={reportForm.uric_acid} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>eGFR (mL/min)</label><input type="number" step="1" name="egfr" value={reportForm.egfr} onChange={handleReportChange} /></div>
                  </div>
                </Expander>

                <Expander title="Diabetes Profile">
                  <div className="grid-2">
                    <div className="input-group"><label>Fasting Glucose (mg/dL)</label><input type="number" step="1" name="fasting_sugar" value={reportForm.fasting_sugar} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Post Prandial Glucose (mg/dL)</label><input type="number" step="1" name="post_prandial_sugar" value={reportForm.post_prandial_sugar} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>HbA1c (%)</label><input type="number" step="0.1" name="hba1c" value={reportForm.hba1c} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Random Glucose (mg/dL)</label><input type="number" step="1" name="random_sugar" value={reportForm.random_sugar} onChange={handleReportChange} /></div>
                  </div>
                </Expander>

                <Expander title="Iron Studies">
                  <div className="grid-2">
                    <div className="input-group"><label>Serum Iron (μg/dL)</label><input type="number" step="1" name="iron" value={reportForm.iron} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>TIBC (μg/dL)</label><input type="number" step="1" name="tibc" value={reportForm.tibc} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Ferritin (ng/mL)</label><input type="number" step="1" name="ferritin" value={reportForm.ferritin} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Transferrin Saturation (%)</label><input type="number" step="0.1" name="transferrin_sat" value={reportForm.transferrin_sat} onChange={handleReportChange} /></div>
                  </div>
                </Expander>

                <Expander title="Thyroid Profile">
                  <div className="grid-3">
                    <div className="input-group"><label>TSH (mIU/L)</label><input type="number" step="0.01" name="tsh" value={reportForm.tsh} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>T3 (ng/dL)</label><input type="number" step="1" name="t3" value={reportForm.t3} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>T4 (μg/dL)</label><input type="number" step="0.1" name="t4" value={reportForm.t4} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Free T3 (pg/mL)</label><input type="number" step="0.1" name="free_t3" value={reportForm.free_t3} onChange={handleReportChange} /></div>
                    <div className="input-group"><label>Free T4 (ng/dL)</label><input type="number" step="0.1" name="free_t4" value={reportForm.free_t4} onChange={handleReportChange} /></div>
                  </div>
                </Expander>

                <button type="submit" className="btn-primary w-full mt-4" disabled={!patientId}>{rStatus}</button>
                {patientId && (
                  <button type="button" className="btn-primary w-full mt-4" style={{ background: 'var(--danger)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} onClick={handleDeletePatient}>
                    Delete Patient Data
                  </button>
                )}
              </form>
            </section>
          )}

          {activeTab === 'analysis' && (
            <section className="tab-content glass-panel scrollable-content">
              <h2>AI Diagnostics & Analysis</h2><p className="subtitle">Automated insight generation.</p>
              {!(reportData && Object.keys(NORMAL_RANGES).some(k => reportData[k] !== undefined && reportData[k] !== null)) ? (
                <div className="empty-state">
                  No parameters detected. Please enter pathological data in the Input Report tab to view the diagnostic analysis!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {CATEGORIES.map(category => {
                    const categoryKeys = Object.keys(NORMAL_RANGES).filter(k => NORMAL_RANGES[k].category === category && reportData[k] !== undefined && reportData[k] !== null);
                    if (categoryKeys.length === 0) return null;
                    return (
                      <div key={category}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--accent-secondary)' }}>{category}</h3>
                        <div className="results-grid">
                          {categoryKeys.map(key => {
                            const val = reportData[key];
                            const range = NORMAL_RANGES[key];
                            let sClass = 'success', sText = 'Normal';
                            if (val < range.min) { sClass = 'warning'; sText = 'Low'; }
                            else if (val > range.max) { sClass = 'danger'; sText = 'High'; }
                            return (
                              <div key={key} className={`result-card ${sClass}`}>
                                <div className="metric-title">{range.name}</div>
                                <div className="metric-value">{val} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{range.unit}</span></div>
                                <div className={`metric-status text-${sClass}`}>{sText} (Normal: {range.min} - {range.max})</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'visualizations' && (
            <section className="tab-content glass-panel scrollable-content">
              <h2 style={{ marginBottom: '32px' }}>Biomarker Visualizations</h2>
              <div style={{ width: '100%' }}>
                {!(reportData && Object.keys(NORMAL_RANGES).some(k => reportData[k] !== undefined && reportData[k] !== null)) ? (
                  <div className="empty-state">No visualizable data based on current input.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
                    {CATEGORIES.map(category => {
                      const chartData = getChartData(category);
                      if (!chartData) return null;
                      return (
                        <div key={category} style={{ width: '100%' }}>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-main)', fontWeight: '600' }}>{category}</h3>
                          <div className="chart-wrapper" style={{ height: '260px', width: '100%' }}>
                            <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'chatbot' && (
            <section className="tab-content glass-panel">
              <div className="chat-wrapper">
                <div className="chat-header"><h2>MediBot AI</h2><span className="status-dot"></span></div>
                <div className="chat-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`message ${m.isAi ? 'ai-msg' : 'user-msg'}`}>
                      <div className="msg-bubble">{m.text}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form className="chat-input-area" onSubmit={handleChat}>
                  <input type="text" placeholder="Ask about CBC, Liver, Diabetes..." value={chatInput} onChange={e => setChatInput(e.target.value)} required />
                  <button type="submit" className="btn-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
