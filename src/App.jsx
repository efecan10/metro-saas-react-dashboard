import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Layers,
  Plus,
  Trash2,
  Percent,
  Calendar,
  X,
  Edit2,
  Download,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Clock,
  AlertTriangle,
  Award,
  DollarSign,
  ShieldAlert
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Filler, Legend);

// VARSAYILAN BAŞLANGIÇ VERİLERİ (Hafıza boşsa devreye girer)
const DEFAULT_USERS = [
  { id: 1, name: 'John Doe', email: 'john@saasify.com', plan: 'Pro SaaS', status: 'Active', amount: 49, duration: '12 Months', discount: 0 },
  { id: 2, name: 'Sarah Connor', email: 'sarah@skynet.io', plan: 'Enterprise', status: 'Active', amount: 199, duration: '6 Months', discount: 10 },
  { id: 3, name: 'Michael Scott', email: 'michael@dundermifflin.com', plan: 'Basic', status: 'Pending', amount: 19, duration: '1 Month', discount: 0 },
  { id: 4, name: 'Bruce Wayne', email: 'bruce@waynecorp.co', plan: 'Enterprise', status: 'Inactive', amount: 199, duration: '12 Months', discount: 0 },
];

const DEFAULT_LOGS = [
  { id: 1, text: 'System infrastructure initialized successfully.', time: '10 mins ago', type: 'info' },
  { id: 2, text: 'Gateway cloud node status verified: Stable.', time: '5 mins ago', type: 'success' },
];

export default function App() {
  // --- 1. LOCALSTORAGE İLE AKILLI STATE YÖNETİMİ ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('metro_darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('metro_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('metro_logs');
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('metro_profile');
    return saved ? JSON.parse(saved) : { name: 'Ahmet Emre', email: 'ahmetemre@firat.edu.tr' };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', plan: 'Pro SaaS', status: 'Active', amount: 49, duration: '12 Months'
  });

  // --- LOCALSTORAGE'A VERİLERİ ANLIK YAZMA TETİKLEYİCİLERİ ---
  useEffect(() => { localStorage.setItem('metro_darkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('metro_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('metro_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('metro_profile', JSON.stringify(profile)); }, [profile]);

  // --- 2. SİSTEM GÜNLÜĞÜ (LOG) MOTORU ---
  const addLog = (text, type = 'info') => {
    const newLog = { id: Date.now(), text, time: 'Just now', type };
    setLogs([newLog, ...logs]);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- 3. EXCEL / CSV VERİ AKTARIMI ---
  const exportToCSV = () => {
    const headers = ['ID;Name;Email;Plan;Status;Monthly Fee ($);Duration;Discount (%)\n'];
    const rows = users.map(u => `${u.id};${u.name};${u.email};${u.plan};${u.status};${u.amount};${u.duration};${u.discount}%`);
    const blob = new Blob(['\uFEFF' + headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saas_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers data exported to Excel successfully! 📊');
    addLog('Subscriber database state exported to Excel/CSV structure.', 'info');
  };

  // --- 4. CRUD OPERASYONLARI ---
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', plan: 'Pro SaaS', status: 'Active', amount: 49, duration: '12 Months' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user.id);
    setFormData({ name: user.name, email: user.email, plan: user.plan, status: user.status, amount: user.amount, duration: user.duration });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser ? { ...u, ...formData, amount: Number(formData.amount) } : u));
      showToast('Subscriber metrics updated safely.');
      addLog(`Metrics for subscriber identity [${formData.name}] reshaped.`, 'info');
    } else {
      const newUser = { id: Date.now(), ...formData, amount: Number(formData.amount), discount: 0 };
      setUsers([...users, newUser]);
      showToast(`Welcome package initiated for ${formData.name}! 🎉`);
      addLog(`New node deployed: ${formData.name} linked to ${formData.plan} plan.`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleApplyDiscount = (id, name) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const hasDiscount = u.discount > 0;
        showToast(hasDiscount ? `Campaign removed for ${name}.` : `15% dynamic discount injected to ${name}!`);
        addLog(hasDiscount ? `Campaign revoking sequence triggered for ${name}.` : `15% structural promotion code loaded to ${name}.`, 'info');
        return { ...u, discount: hasDiscount ? 0 : 15 };
      }
      return u;
    }));
  };

  const toggleStatus = (id, name) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : u.status === 'Inactive' ? 'Pending' : 'Active';
        showToast(`${name} status shifted to ${nextStatus}`);
        addLog(`Gateway lifecycle status for ${name} shifted to [${nextStatus}].`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = (id, name) => {
    setUsers(users.filter(u => u.id !== id));
    showToast(`${name} record wiped out from infrastructure.`, 'error');
    addLog(`Subscriber instance [${name}] terminated from active nodes.`, 'error');
  };

  // --- ARAMA FİLTRE MOTORU ---
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = users.reduce((acc, u) => acc + (u.amount * (1 - u.discount / 100)), 0);

  return (
    <BrowserRouter>
      <div className={`font-sans h-screen flex overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'}`}>
        
        <Sidebar profileName={profile.name} darkMode={darkMode} />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Topbar darkMode={darkMode} setDarkMode={setDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          <Routes>
            <Route path="/" element={<DashboardHome totalRevenue={totalRevenue} activeCount={users.length} logs={logs} darkMode={darkMode} />} />
            <Route path="/analytics" element={<Analytics users={users} darkMode={darkMode} />} />
            <Route path="/users" element={
              <UsersTable 
                users={filteredUsers} 
                totalCount={users.length}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenAddModal={openAddModal}
                onOpenEditModal={openEditModal} 
                onDiscount={handleApplyDiscount}
                onToggleStatus={toggleStatus}
                onDelete={handleDeleteUser}
                onExport={exportToCSV}
                darkMode={darkMode}
              />
            } />
            <Route path="/settings" element={<SettingsPage profile={profile} setProfile={setProfile} showToast={showToast} addLog={addLog} darkMode={darkMode} />} />
          </Routes>
        </div>
      </div>

      {/* TOAST PANEL */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-4 rounded-xl shadow-2xl border flex items-center gap-3 z-50 transition-all ${
          toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-semibold tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* CRUD MODAL WINDOW */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`border rounded-2xl w-full max-w-md p-6 relative shadow-2xl transition-colors ${darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'}`}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-500 transition"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold mb-4 text-indigo-500">{editingUser ? 'Edit System Identity' : 'Deploy New Subscription'}</h3>
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-neutral-400">Full Corporate Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'}`} placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-neutral-400">System Link Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'}`} placeholder="ops@acme.co" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-neutral-400">Licensing Tier</label>
                  <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300'}`}>
                    <option>Basic</option><option>Pro SaaS</option><option>Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-neutral-400">Contract Lifecycle</label>
                  <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300'}`}>
                    <option>1 Month</option><option>6 Months</option><option>12 Months</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-neutral-400">Price Rate ($)</label>
                  <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300'}`} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-neutral-400">Gateway Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300'}`}>
                    <option>Active</option><option>Pending</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-semibold text-sm transition mt-2 shadow-lg text-white">Save Technical Adjustments</button>
            </form>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

// BİLEŞEN: SIDEBAR
function Sidebar({ profileName, darkMode }) {
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/analytics', name: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/users', name: 'Subscribers', icon: <Users className="w-5 h-5" /> },
    { path: '/settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];
  return (
    <aside className={`w-64 border-r flex flex-col justify-between p-6 h-screen shrink-0 transition-colors ${darkMode ? 'bg-neutral-900 border-neutral-800/80' : 'bg-white border-neutral-200'}`}>
      <div>
        <div className="text-xl font-black tracking-wider text-indigo-500 mb-10 flex items-center gap-2">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20"><Layers className="w-5 h-5" /></div>METRO.SaaS
        </div>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = useLocation().pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition border ${isActive ? 'bg-indigo-600/10 text-indigo-500 border-indigo-500/20' : 'text-neutral-400 border-transparent hover:bg-indigo-500/5 hover:text-indigo-500'}`}>{item.icon} {item.name}</Link>
            );
          })}
        </nav>
      </div>
      <div className={`flex items-center gap-3 border-t pt-4 ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white">{profileName.split(' ').map(n => n[0]).join('')}</div>
        <div><h4 className="text-sm font-semibold">{profileName}</h4><p className="text-xs text-neutral-400">Cluster Root</p></div>
      </div>
    </aside>
  );
}

// BİLEŞEN: TOPBAR
function Topbar({ darkMode, setDarkMode, searchQuery, setSearchQuery }) {
  const location = useLocation();
  let title = "Dashboard Overview";
  if (location.pathname === '/users') title = "Subscribers Management";
  else if (location.pathname === '/analytics') title = "Analytics Index";
  else if (location.pathname === '/settings') title = "System Configuration";

  return (
    <header className={`h-20 border-b flex justify-between items-center px-8 shrink-0 transition-colors ${darkMode ? 'border-neutral-800/80 bg-neutral-950/20' : 'border-neutral-200 bg-white'}`}>
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter database metrics..." className={`border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition w-64 ${darkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-300'}`} />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>}
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-xl border transition active:scale-95 ${darkMode ? 'bg-neutral-900 border-neutral-800 text-amber-400' : 'bg-neutral-100 border-neutral-300 text-indigo-600'}`}>{darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
      </div>
    </header>
  );
}

// SAYFA: DASHBOARD HOME
function DashboardHome({ totalRevenue, activeCount, logs, darkMode }) {
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ fill: true, label: 'ARR Index', data: [32000, 41000, 39000, 54000, totalRevenue * 35, totalRevenue * 42], borderColor: 'rgb(99, 102, 241)', backgroundColor: 'rgba(99, 102, 241, 0.01)', tension: 0.4 }],
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`border p-6 rounded-2xl ${darkMode ? 'bg-neutral-900/40 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <span className="text-neutral-400 text-sm font-medium">ARR Recurrent Revenue</span>
          <h2 className="text-3xl font-bold mt-4 tracking-tight text-indigo-500">${totalRevenue.toFixed(2)}</h2>
        </div>
        <div className={`border p-6 rounded-2xl ${darkMode ? 'bg-neutral-900/40 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <span className="text-neutral-400 text-sm font-medium">Total Subscribers</span>
          <h2 className="text-3xl font-bold mt-4 tracking-tight">{activeCount} instances</h2>
        </div>
        <div className={`border p-6 rounded-2xl ${darkMode ? 'bg-neutral-900/40 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <span className="text-neutral-400 text-sm font-medium">Pipeline Gateway</span>
          <h2 className="text-3xl font-bold mt-4 tracking-tight text-emerald-500">Online 100%</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`border p-6 rounded-2xl lg:col-span-2 ${darkMode ? 'bg-neutral-900/30 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <h3 className="font-bold text-lg mb-4">Core Structural Financial Index</h3>
          <div className="h-64"><Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
        </div>

        <div className={`border p-6 rounded-2xl flex flex-col h-[330px] ${darkMode ? 'bg-neutral-900/30 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <h3 className="font-bold text-base mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /> Infrastructure Logs</h3>
          <p className="text-xs text-neutral-400 mb-4">Live cluster tracking logs stream</p>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {logs.map(log => (
              <div key={log.id} className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 ${
                log.type === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-neutral-500/5 border-neutral-800 text-neutral-400'
              }`}>
                <p className="font-medium tracking-tight">{log.text}</p>
                <span className="text-[10px] opacity-60 self-end font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// SAYFA: ANALYTICS (GELİŞMİŞ MATEMATİKSEL İSTATİSTİK KARTLARI ENTEGRELİ)
function Analytics({ users, darkMode }) {
  // Grafik veri hesaplamaları
  const planCounts = users.reduce((acc, u) => {
    acc[u.plan] = (acc[u.plan] || 0) + 1;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(planCounts),
    datasets: [{ 
      data: Object.values(planCounts), 
      backgroundColor: ['rgba(168, 85, 247, 0.85)', 'rgba(99, 102, 241, 0.85)', 'rgba(236, 72, 153, 0.85)'], 
      borderColor: darkMode ? '#0a0a0a' : '#ffffff', 
      borderWidth: 2 
    }],
  };

  const barData = {
    labels: ['Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      { label: 'Basic Licensing', data: [120, 150, 180, planCounts['Basic'] * 60 || 0], backgroundColor: 'rgba(168, 85, 247, 0.7)' },
      { label: 'Pro SaaS Licensing', data: [310, 420, 490, planCounts['Pro SaaS'] * 120 || 0], backgroundColor: 'rgba(99, 102, 241, 0.7)' }
    ]
  };

  // RECOGNIZABLE FEATURE 3: CANLI GELİŞMİŞ ANALİZ MATEMATİKSEL HESAPLAMALARI
  const totalRevenue = users.reduce((acc, u) => acc + (u.amount * (1 - u.discount / 100)), 0);
  const avgContractValue = users.length > 0 ? totalRevenue / users.length : 0;
  
  const inactiveCount = users.filter(u => u.status === 'Inactive').length;
  const churnRate = users.length > 0 ? (inactiveCount / users.length) * 100 : 0;

  // En çok kazandıran paketi bulma mantığı
  const revenuePerPlan = users.reduce((acc, u) => {
    const rev = u.amount * (1 - u.discount / 100);
    acc[u.plan] = (acc[u.plan] || 0) + rev;
    return acc;
  }, {});
  const bestPlan = Object.keys(revenuePerPlan).reduce((a, b) => revenuePerPlan[a] > revenuePerPlan[b] ? a : b, 'None');

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border p-6 rounded-2xl ${darkMode ? 'bg-neutral-900/30 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <h3 className="font-bold text-lg mb-6">Cluster Segmentation</h3>
          <div className="h-64 flex justify-center"><Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>

        <div className={`border p-6 rounded-2xl ${darkMode ? 'bg-neutral-900/30 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <h3 className="font-bold text-lg mb-6">License Growth Multi-Metrics (Monthly)</h3>
          <div className="h-64"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </div>

      {/* RECOGNIZABLE FEATURE 3: ANALYTICS MINI-WIDGETS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`border p-5 rounded-2xl flex items-center gap-4 ${darkMode ? 'bg-neutral-900/20 border-neutral-800/60' : 'bg-white border-neutral-200'}`}>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20"><Award className="w-5 h-5" /></div>
          <div>
            <span className="text-neutral-400 text-xs font-medium block">Best Performing Plan</span>
            <h4 className="text-base font-bold mt-0.5 text-amber-500">{bestPlan}</h4>
          </div>
        </div>
        <div className={`border p-5 rounded-2xl flex items-center gap-4 ${darkMode ? 'bg-neutral-900/20 border-neutral-800/60' : 'bg-white border-neutral-200'}`}>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"><DollarSign className="w-5 h-5" /></div>
          <div>
            <span className="text-neutral-400 text-xs font-medium block">Avg Contract Value (ARPU)</span>
            <h4 className="text-base font-bold mt-0.5">${avgContractValue.toFixed(2)}</h4>
          </div>
        </div>
        <div className={`border p-5 rounded-2xl flex items-center gap-4 ${darkMode ? 'bg-neutral-900/20 border-neutral-800/60' : 'bg-white border-neutral-200'}`}>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20"><ShieldAlert className="w-5 h-5" /></div>
          <div>
            <span className="text-neutral-400 text-xs font-medium block">Infrastructure Churn Rate</span>
            <h4 className="text-base font-bold mt-0.5 text-rose-400">{churnRate.toFixed(1)}%</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

// SAYFA: SUBSCRIBERS TABLE (ARAMA SAYACI VE SIFIRLAMA ENTEGRELİ)
function UsersTable({ users, totalCount, searchQuery, setSearchQuery, onOpenAddModal, onOpenEditModal, onDiscount, onToggleStatus, onDelete, onExport, darkMode }) {
  const isSearching = searchQuery.length > 0;

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Database Nodes ({totalCount})</h2>
          {/* RECOGNIZABLE FEATURE 2: CANLI ARAMA SAYACI VE METRİKLERİ */}
          {isSearching && (
            <p className="text-xs text-indigo-400 mt-1 font-medium flex items-center gap-1.5">
              Found {users.length} system components matching "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="underline text-neutral-400 hover:text-white text-[11px] ml-1">Clear</button>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onExport} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 border transition active:scale-95 ${darkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-white border-neutral-300 text-neutral-700 shadow-sm'}`}><Download className="w-4 h-4" /> Export Excel/CSV</button>
          <button onClick={onOpenAddModal} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-lg"><Plus className="w-4 h-4" /> Deploy Instance</button>
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${darkMode ? 'bg-neutral-900/10 border-neutral-800/80' : 'bg-white border-neutral-200 shadow-sm'}`}>
        {users.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 font-medium">
            <p className="mb-3">No matching infrastructure footprint found for "{searchQuery}".</p>
            <button onClick={() => setSearchQuery('')} className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-indigo-600/20 transition">Reset Search Footprint</button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-neutral-400 text-xs font-bold uppercase tracking-wider ${darkMode ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-200 bg-neutral-50'}`}>
                <th className="p-4">Subscriber Node</th>
                <th className="p-4">Structural Tier</th>
                <th className="p-4">Timeline Lifecycle</th>
                <th className="p-4">Gateway Status</th>
                <th className="p-4">Financial Flow</th>
                <th className="p-4 text-right">Runtime Config</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${darkMode ? 'divide-neutral-800/50 text-neutral-300' : 'divide-neutral-200 text-neutral-700'}`}>
              {users.map((u) => {
                const discountedPrice = u.amount * (1 - u.discount / 100);
                const isExpiringSoon = u.duration === '1 Month';
                const isCriticalRisk = u.status === 'Inactive';

                return (
                  <tr key={u.id} className={`transition group cursor-pointer ${darkMode ? 'hover:bg-neutral-900/40' : 'hover:bg-neutral-50'}`}>
                    <td onClick={() => onOpenEditModal(u)} className="p-4">
                      <div className="font-semibold text-indigo-500 group-hover:underline flex items-center gap-1.5">
                        {u.name} <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400" />
                      </div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">{u.email}</div>
                    </td>
                    <td onClick={() => onOpenEditModal(u)} className="p-4 font-medium">{u.plan}</td>
                    <td onClick={() => onOpenEditModal(u)} className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {u.duration}</span>
                        {isExpiringSoon && u.status === 'Active' && (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1 max-w-max"><AlertTriangle className="w-3 h-3" /> Expires Soon</span>
                        )}
                        {isCriticalRisk && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1 max-w-max"><AlertCircle className="w-3 h-3" /> Risk Contract</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button onClick={() => onToggleStatus(u.id, u.name)} className={`px-2 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                        u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        u.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>{u.status}</button>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">
                        {u.discount > 0 ? (
                          <><span className="line-through text-neutral-400 text-xs mr-1">${u.amount}</span><span className="text-emerald-500">${discountedPrice.toFixed(0)}</span></>
                        ) : `$${u.amount}`}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => onDiscount(u.id, u.name)} className={`p-2 rounded-xl border transition ${u.discount > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-transparent text-neutral-400 hover:text-indigo-500'}`}><Percent className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(u.id, u.name)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// SAYFA: SETTINGS
function SettingsPage({ profile, setProfile, showToast, addLog, darkMode }) {
  const [tempName, setTempName] = useState(profile.name);
  const [tempEmail, setTempEmail] = useState(profile.email);

  const handleSave = () => {
    setProfile({ name: tempName, email: tempEmail });
    showToast('Technical architecture profiles synchronized!');
    addLog(`Root authorization profile renamed to [${tempName}].`, 'success');
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
      <div className={`border p-6 rounded-2xl max-w-2xl ${darkMode ? 'bg-neutral-900/30 border-neutral-800/60' : 'bg-white border-neutral-200 shadow-sm'}`}>
        <h3 className={`font-bold text-lg border-b pb-3 ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>Security Configuration Profile</h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Master Root Identity</label>
            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition ${darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300'}`} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Master System Email</label>
            <input type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition ${darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300'}`} />
          </div>
        </div>
        <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg">Commit Changes</button></div>
      </div>
    </div>
  );
}