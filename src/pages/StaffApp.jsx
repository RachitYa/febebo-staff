import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:'#fffdf0', card:'#ffffff', text:'#1a1500', sub:'#78680a', muted:'#78680a',
  border:'#e8df9a', primary:'#fde047', primaryDk:'#ca8a04', primaryBg:'#fefce8',
  success:'#10b981', successBg:'#dcfce7', warn:'#f59e0b', warnBg:'#fef3c7',
  danger:'#dc2626', dangerBg:'#fee2e2', indigo:'#fde047', indigoBg:'#fefce8',
};

const ROLE_META = {
  'Cook':             { emoji:'👨‍🍳', accent:'#a78bfa', accentBg:'#ede9fe', dept:'Kitchen & Mess',      grad:'#a78bfa' },
  'Cleaner':          { emoji:'🧹',   accent:'#67e8f9', accentBg:'#cffafe', dept:'Housekeeping',        grad:'#67e8f9' },
  'Maintenance':      { emoji:'🛠️',   accent:'#fda4af', accentBg:'#ffe4e6', dept:'Repairs & Technical', grad:'#fda4af' },
  'Purchase Manager': { emoji:'🛒',   accent:'#94a3b8', accentBg:'#f1f5f9', dept:'Store & Inventory',   grad:'#94a3b8' },
  'Security Guard':   { emoji:'🛡️',   accent:'#6ee7b7', accentBg:'#d1fae5', dept:'Gate Security',       grad:'#6ee7b7' },
  'HR':               { emoji:'👔',   accent:'#f472b6', accentBg:'#fce7f3', dept:'Human Resources & Hiring', grad:'#f472b6' },
  'Helper':           { emoji:'🙋',   accent:'#fb923c', accentBg:'#fff7ed', dept:'General Helper',          grad:'#fb923c' },
  'Plumber':          { emoji:'🔧',   accent:'#60a5fa', accentBg:'#eff6ff', dept:'Plumbing & Water',        grad:'#60a5fa' },
  'Electrician':      { emoji:'⚡',   accent:'#facc15', accentBg:'#fefce8', dept:'Electrical & Wiring',     grad:'#facc15' },
  'Carpenter':        { emoji:'🪚',   accent:'#a3a3a3', accentBg:'#fafafa', dept:'Carpentry & Fixtures',    grad:'#d4a574' },
  'Sales Manager':    { emoji:'📈',   accent:'#34d399', accentBg:'#ecfdf5', dept:'Sales & Admissions',      grad:'#34d399' },
  'Manager':          { emoji:'🏢',   accent:'#818cf8', accentBg:'#eef2ff', dept:'Operations Management',   grad:'#818cf8' },
  'Others':           { emoji:'⚙️',   accent:'#9ca3af', accentBg:'#f9fafb', dept:'General Staff',           grad:'#9ca3af' },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAMES = ['Arjun Mehta','Priya Sharma','Ravi Kumar','Sneha Kapoor','Karan Singh','Mohan Lal','Ananya Gupta','Rohit Verma','Pooja Rani','Deepak Rathi','Vikram Das','Neha Singh','Amit Kumar','Suresh Patel','Divya Joshi','Rahul Sharma','Swati Roy','Aman Verma','Kavya Nair','Manoj Kumar','Ritu Singh','Alok Verma','Megha Roy','Varun Sharma','Sangeeta Kumari','Gaurav Malhotra','Preeti Mishra','Sunil Kumar','Nisha Agarwal','Vikas Y.'];

const STUDENTS = Array.from({length:30},(_,i) => {
  const statuses = ['notEaten', 'eaten', 'requested', 'pack', 'extra'];
  return {
    id: i+1,
    name: NAMES[i%30],
    phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    room: `${101 + Math.floor(i/3)}`,
    bed: `Bed ${(i%3)+1}`,
    statusB: statuses[i % 5],
    statusL: statuses[(i + 1) % 5],
    statusS: statuses[(i + 2) % 5],
    statusD: statuses[(i + 3) % 5],
    detailsB: '',
    detailsL: '',
    detailsS: '',
    detailsD: '',
  };
});

const STORE_ITEMS = [
  {id:1,name:'Basmati Rice 25kg',cat:'Kitchen',stock:'4 bags',status:'In Stock',min:'2 bags'},
  {id:2,name:'Sunflower Oil 15L',cat:'Kitchen',stock:'1 can',status:'Low Stock',min:'3 cans'},
  {id:3,name:'Floor Sanitizer 5L',cat:'Housekeeping',stock:'2 cans',status:'In Stock',min:'2 cans'},
  {id:4,name:'PVC Tap Washers ½"',cat:'Plumbing',stock:'5 pcs',status:'Low Stock',min:'15 pcs'},
  {id:5,name:'LED Bulbs 12W',cat:'Electrical',stock:'8 pcs',status:'In Stock',min:'5 pcs'},
  {id:6,name:'Heavy Duty Mop Set',cat:'Housekeeping',stock:'0 pcs',status:'Out of Stock',min:'2 pcs'},
];

const INIT_CONTACTS = [
  {id:'c1', name:'Admin Office', role:'Admin', avatar:'🏢', phone:'+91 99999 00000', isPinned:true, reminder:null, lastMsg:'Update daily logs by 6 PM today.', time:'09:00 AM'},
  {id:'c2', name:'Priya Sharma', role:'Student - Rm 102', avatar:'👩', phone:'+91 98888 77777', isPinned:false, reminder:'Check AC remote today 5:00 PM', lastMsg:'Can room 102 bathroom be cleaned at 11 AM?', time:'09:15 AM'},
  {id:'c3', name:'Dinesh (Maint.)', role:'Staff', avatar:'🛠️', phone:'+91 97777 66666', isPinned:false, reminder:null, lastMsg:'Room 201 AC issue has been resolved.', time:'11:30 AM'},
];

const INIT_MESSAGES = {
  'c1': [
    {id:1, text:'Good morning team! Update daily logs by 6 PM today.', time:'09:00 AM', me:false},
    {id:2, text:'Monthly salary will be credited on 1st Aug.', time:'10:00 AM', me:false}
  ],
  'c2': [
    {id:3, text:'Can room 102 bathroom be cleaned at 11 AM?', time:'09:15 AM', me:false}
  ],
  'c3': [
    {id:4, text:'Room 201 AC issue has been resolved.', time:'11:30 AM', me:false}
  ]
};

const INIT_VISITORS = [
  {id:1,name:'Rajesh Malhotra',phone:'+91 98111 22233',purpose:'Parent Visit – Rm 104',inTime:'10:15 AM',outTime:null,status:'Inside'},
  {id:2,name:'Zomato Delivery',phone:'+91 98222 33344',purpose:'Food Delivery – Rm 202',inTime:'11:00 AM',outTime:'11:12 AM',status:'Exited'},
  {id:3,name:'Sunil Plumbing',phone:'+91 98333 44455',purpose:'Main Tank Repair',inTime:'08:45 AM',outTime:null,status:'Inside'},
];
const INIT_PARCELS = [
  {id:1,student:'Arjun Mehta',room:'101',carrier:'Amazon',tracking:'AMZ-88910',date:'Today 10:30 AM',status:'Pending'},
  {id:2,student:'Sneha Kapoor',room:'202',carrier:'Flipkart',tracking:'FK-44102',date:'Yesterday',status:'Claimed'},
  {id:3,student:'Karan Singh',room:'201',carrier:'Courier Express',tracking:'CX-9921',date:'Today 09:15 AM',status:'Pending'},
];
const INIT_TICKETS = [
  {id:1,room:'108',issue:'Water leakage — bathroom sink tap',priority:'High',status:'Open',student:'Sneha Kapoor',date:'Today 09:30 AM'},
  {id:2,room:'201',issue:'AC remote & filter cleaning needed',priority:'Normal',status:'In Progress',student:'Karan Singh',date:'Today 10:15 AM'},
  {id:3,room:'305',issue:'Geyser switch sparking / tripping',priority:'High',status:'Open',student:'Ravi Kumar',date:'Yesterday 4 PM'},
];
const INIT_CLEANING = [
  {id:1, room:'101', student:'Arjun Mehta', phone:'+91 9895921139', slot:'09:00 AM – 11:00 AM', slotStatus:'completed', type:'Full Room Clean', done:true, note:'Please mop balcony too', date:'2026-07-24'},
  {id:2, room:'102', student:'Priya Sharma', phone:'+91 9861927774', slot:'11:00 AM – 01:00 PM', slotStatus:'active', type:'Dusting & Mop', done:false, note:'Key with room partner', date:'2026-07-24'},
  {id:3, room:'105', student:'Ankit Kumar', phone:'+91 9848300363', slot:'11:00 AM – 01:00 PM', slotStatus:'active', type:'Bathroom Sanitise', done:false, note:'Spilled juice near desk', date:'2026-07-24'},
  {id:4, room:'201', student:'Karan Singh', phone:'+91 9811122233', slot:'01:00 PM – 03:00 PM', slotStatus:'upcoming', type:'Bedsheet & Towel Change', done:false, note:'Leave fresh towel on chair', date:'2026-07-24'},
  {id:5, room:'202', student:'Sneha Kapoor', phone:'+91 9822233344', slot:'03:00 PM – 05:00 PM', slotStatus:'upcoming', type:'Full Room Clean', done:false, note:'Call before entering', date:'2026-07-24'},
  {id:6, room:'305', student:'Ravi Kumar', phone:'+91 9833344455', slot:'03:00 PM – 05:00 PM', slotStatus:'upcoming', type:'Bathroom Sanitise', done:false, note:'', date:'2026-07-24'}
];
const INIT_DEMANDS = [
  {id:1,item:'Basmati Rice 25kg',qty:'2 Bags',reqBy:'Ramesh (Cook)',vendor:'Local Market',date:'22 Jul',status:'Pending'},
  {id:2,item:'Floor Cleaner 5L',qty:'3 cans',reqBy:'Lakshmi (Cleaner)',vendor:'Sunil Traders',date:'21 Jul',status:'Approved'},
  {id:3,item:'PVC Washers (20pc)',qty:'1 pack',reqBy:'Dinesh (Maint.)',vendor:'Hardware Depot',date:'22 Jul',status:'Pending'},
];

const INIT_CANDIDATES = [
  {id:1, name:'Suresh Kumar', position:'Helper / Maintenance', experience:'3 Yrs', phone:'+91 9876543210', status:'Interview Scheduled', date:'Today 2:00 PM', note:'Experienced in plumbing & painting'},
  {id:2, name:'Rekha Devi', position:'Cook', experience:'5 Yrs', phone:'+91 9812345678', status:'Applied', date:'Yesterday', note:'Specializes in North Indian dishes'},
  {id:3, name:'Vikram Rathi', position:'Security Guard', experience:'2 Yrs', phone:'+91 9899988877', status:'Hired ✅', date:'22 Jul', note:'Joined night shift'}
];

const INIT_ENQUIRIES = [
  {id:1, name:'Rohit Sharma', phone:'+91 9876543210', requirement:'Single Room AC', budget:'₹10,000', status:'New 🔴', source:'WhatsApp', text:'Looking for a single room with AC. Budget around ₹10,000.'},
  {id:2, name:'Priya Mehta', phone:'+91 9123456789', requirement:'Double Sharing', budget:'₹7,500', status:'Contacted 🟡', source:'NoBroker', text:'Do you have double sharing available near metro station?'},
  {id:3, name:'Arun Verma', phone:'+91 9012345678', requirement:'Triple Sharing', budget:'₹6,000', status:'Closed 🟢', source:'MagicBricks', text:'What is the security deposit for triple sharing?'},
  {id:4, name:'Kavya Singh', phone:'+91 9811122233', requirement:'Double Sharing AC', budget:'₹8,500', status:'New 🔴', source:'Direct Call', text:'Need immediate move-in from 1st August.'}
];

const INIT_TASKS = [
  {id:1, title:'Clean common area corridor – Ground Floor', assignedBy:'Admin', priority:'High', status:'Pending', room:'Common', time:'09:00 AM'},
  {id:2, title:'Carry vegetable delivery to kitchen', assignedBy:'Cook Ramesh', priority:'Normal', status:'Done', room:'Kitchen', time:'10:30 AM'},
  {id:3, title:'Help guest luggage – Room 204 checkout', assignedBy:'Admin', priority:'Normal', status:'Pending', room:'204', time:'12:00 PM'},
  {id:4, title:'Replace welcome mat at main entrance', assignedBy:'Admin', priority:'Low', status:'Pending', room:'Entrance', time:'02:00 PM'},
];

const INIT_PLUMBING = [
  {id:1, room:'108', issue:'Bathroom sink tap leaking continuously', student:'Sneha Kapoor', priority:'High', status:'Open', date:'Today 09:30 AM', note:'Water pooling on floor'},
  {id:2, room:'302', issue:'Flush not working – Tank valve stuck', student:'Gaurav Malhotra', priority:'Normal', status:'In Progress', date:'Today 10:00 AM', note:'Need new valve'},
  {id:3, room:'201', issue:'Hot water geyser not heating', student:'Karan Singh', priority:'Normal', status:'Open', date:'Yesterday 4 PM', note:'Check element'},
  {id:4, room:'401', issue:'Main inlet pipe making noise', student:'Ravi Kumar', priority:'Low', status:'Open', date:'22 Jul', note:'Loose fitting'},
];

const INIT_ELECTRICAL = [
  {id:1, room:'305', issue:'Geyser switch sparking / MCB tripping', student:'Ravi Kumar', priority:'High', status:'Open', date:'Today 08:00 AM', note:'Do not use till fixed'},
  {id:2, room:'102', issue:'Fan running slow – capacitor issue', student:'Priya Sharma', priority:'Normal', status:'Open', date:'Today 11:00 AM', note:''},
  {id:3, room:'207', issue:'2 power sockets not working', student:'Mohan Lal', priority:'Normal', status:'In Progress', date:'Yesterday', note:'Extension used as workaround'},
  {id:4, room:'103', issue:'AC remote not pairing', student:'Arjun Mehta', priority:'Low', status:'Resolved', date:'22 Jul', note:'Remote replaced'},
];

const INIT_CARPENTER = [
  {id:1, room:'104', issue:'Wardrobe door hinge broken', student:'Divya Joshi', priority:'Normal', status:'Open', date:'Today 10:00 AM', note:'Needs 2 hinges'},
  {id:2, room:'202', issue:'Study table drawer stuck / jammed', student:'Sneha Kapoor', priority:'Low', status:'Open', date:'Today 11:30 AM', note:''},
  {id:3, room:'301', issue:'Bed slat cracked – squeaking', student:'Rahul Sharma', priority:'High', status:'In Progress', date:'Yesterday', note:'Replacement slat ordered'},
  {id:4, room:'106', issue:'Window latch / lock not closing', student:'Aman Verma', priority:'Normal', status:'Open', date:'22 Jul', note:'Security risk'},
];

const INIT_ROOMS = [
  {id:1, number:'101', type:'Single AC', status:'Occupied', student:'Arjun Mehta', rent:'₹12,000', due:'2026-08-01'},
  {id:2, number:'102', type:'Double Sharing', status:'Occupied', student:'Priya Sharma / Kavya', rent:'₹8,500', due:'2026-08-01'},
  {id:3, number:'201', type:'Triple Sharing', status:'Occupied', student:'Karan / Rohit / Aman', rent:'₹7,000', due:'2026-08-01'},
  {id:4, number:'203', type:'Single Non-AC', status:'Vacant', student:'—', rent:'₹9,000', due:'—'},
  {id:5, number:'301', type:'Double Sharing AC', status:'Vacant', student:'—', rent:'₹10,500', due:'—'},
  {id:6, number:'305', type:'Single AC', status:'Occupied', student:'Ravi Kumar', rent:'₹12,000', due:'2026-08-01'},
];

// ─── Small Reusable UI ────────────────────────────────────────────────────────
const Chip = ({label,color=C.primary,bg=C.primaryBg})=>(
  <span style={{fontSize:10,fontWeight:800,color,background:bg,padding:'3px 8px',borderRadius:20,whiteSpace:'nowrap'}}>{label}</span>
);

const Row = ({children,style={}})=>(
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',...style}}>{children}</div>
);

const Divider = ()=><div style={{height:1,background:C.border,margin:'6px 0'}}/>;

const InputField = ({label,textarea=false,...props})=>{
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label&&<label style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:.4}}>{label}</label>}
      <Tag {...props} style={{padding:'11px 14px',border: '1px solid #e2e8f0',borderRadius: 8,fontSize:14,fontFamily:'inherit',background:'#fff',color:C.text,outline:'none',boxSizing:'border-box',width:'100%',resize:textarea?'vertical':'none',...props.style}}/>
      {/* Fixed Bottom Navigation Bar (Android/iOS Mock layout matching screenshots) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        height: 68,
        background: '#ffffff',
        borderTop: `1.5px solid ${C.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -4px 16px rgba(120, 104, 10, 0.05)'
      }}>
        {[
          { id: 'home', label: 'Dashboard', icon: 'home' },
          { id: 'work', label: 'My Work', icon: 'home_work' },
          { id: 'chat', label: 'Chat', icon: 'forum' },
          { id: 'profile_view', label: 'Profile', icon: 'person' }
        ].map(item => {
          const active = view === item.id;
          return (
            <div key={item.id} onClick={() => { setView(item.id); setActiveContact(null); }} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '6px 12px',
              color: active ? '#ca8a04' : '#78680a',
              transition: 'color 0.2s',
              flex: 1
            }}>
              <span className={`material-symbols-outlined ${active ? 'filled' : ''}`} style={{ fontSize: 24, marginBottom: 2 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 600 }}>{item.label}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

const SelectField = ({label,children,...props})=>(
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:.4}}>{label}</label>}
    <select {...props} style={{padding:'11px 14px',border: '1px solid #e2e8f0',borderRadius: 8,fontSize:14,fontFamily:'inherit',background:'#fff',color:C.text,outline:'none',boxSizing:'border-box',width:'100%',...props.style}}>{children}</select>
  </div>
);

// ─── Bottom Sheet Modal ───────────────────────────────────────────────────────
const Sheet = ({show,onClose,title,sub,children})=>{
  if(!show)return null;
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.6)',zIndex:400,display:'flex',alignItems:'flex-end',backdropFilter:'blur(4px)'}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:'100%',maxWidth:480,margin:'0 auto',background:'#fff',borderRadius:'24px 24px 0 0',padding:'0 0 36px',boxShadow: '0 4px 16px rgba(15,23,42,0.05)',animation:'sheetUp .25s ease'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'14px 0 0'}}><div style={{width:36,height:4,background:C.border,borderRadius:4}}/></div>
        <Row style={{padding:'12px 20px 16px',borderBottom: '1px solid #e2e8f0'}}>
          <div><p style={{margin:0,fontSize:16,fontWeight:800,color:C.text}}>{title}</p>{sub&&<p style={{margin:'2px 0 0',fontSize:12,color:C.muted}}>{sub}</p>}</div>
          <button onClick={onClose} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius:10,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,color:C.muted}}>✕</button>
        </Row>
        <div style={{padding:'16px 20px'}}>{children}</div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StaffApp(){
  const {user,logout} = useAuth();

  const staffRole = user?.staffRole || 'Cook';
  const staffName = user?.name     || 'Staff Member';
  const meta      = ROLE_META[staffRole] || ROLE_META['Cook'];
  const firstName = staffName.split(' ')[0];

  // Sidebar & view
  const [sidebar,  setSidebar]  = useState(false);
  const [view,     setView]     = useState('home');   // home | work | inout | salary | items | chat | reports | requests

  // Clock
  const [clocked, setClocked]   = useState(true);
  const [clockIn]               = useState('08:30 AM');
  const [punchLog,setPunchLog]  = useState([
    {id:1,date:'Today, 23 Jul 2026',inT:'08:30 AM',outT:null,hrs:null},
    {id:2,date:'Yesterday, 22 Jul',  inT:'08:15 AM',outT:'06:30 PM',hrs:'10 h 15 m'},
    {id:3,date:'21 Jul 2026',        inT:'08:30 AM',outT:'06:00 PM',hrs:'9 h 30 m'},
  ]);

  // Cook
  const [students,setStudents]  = useState(STUDENTS);
  const [timeFilter, setTimeFilter] = useState('Daily'); // Daily | Weekly | Monthly
  const [mealTab, setMealTab]   = useState('Breakfast'); // Breakfast | Lunch | Snacks | Dinner
  const [selectedStat, setSelectedStat] = useState('notEaten'); // requested | pack | extra | eaten | notEaten
  
  const [menus, setMenus] = useState({
    Breakfast: 'Poha, Jalebi, Tea',
    Lunch: 'Rajma Chawal, Roti, Salad',
    Snacks: 'Samosa, Coffee',
    Dinner: 'Paneer Butter Masala, Roti, Dal'
  });
  const [showMenuEdit, setShowMenuEdit] = useState(false);
  const [menuEditVal, setMenuEditVal] = useState('');

  const [showPackEdit, setShowPackEdit] = useState(false);
  const [packStudentId, setPackStudentId] = useState(null);
  const [packVal, setPackVal] = useState('');
  const [packPriceVal, setPackPriceVal] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [showBcast,setShowBcast]= useState(false);
  const [bTarget, setBTarget]   = useState('All');
  const [bStudentId, setBStudentId] = useState('');
  const [bMsg,setBMsg]          = useState('Fresh hot meal is ready! Please head to the mess hall. 🍽️');
  const [bMeal,setBMeal]        = useState('Breakfast');

  // Cleaner state
  const [cleaning, setCleaning] = useState(INIT_CLEANING);
  const [cleanerTimeFilter, setCleanerTimeFilter] = useState('Daily'); // Daily | Weekly | Monthly
  const [cleanerDate, setCleanerDate] = useState(new Date().toISOString().split('T')[0]);
  const [cleanerSlotFilter, setCleanerSlotFilter] = useState('all'); // all | active | upcoming | completed
  const [cleanerTypeFilter, setCleanerTypeFilter] = useState('All'); // All | Full Room Clean | Dusting & Mop | Bathroom Sanitise | Mopping | Basic Cleaning

  // Maintenance
  const [tickets,setTickets]    = useState(INIT_TICKETS);

  // HR state
  const [candidates, setCandidates] = useState(INIT_CANDIDATES);
  const [enquiries, setEnquiries]   = useState(INIT_ENQUIRIES);
  const [hrTab, setHrTab]           = useState('hiring'); // hiring | enquiries

  // Helper / Plumber / Electrician / Carpenter / Sales / Manager state
  const [tasks, setTasks]               = useState(INIT_TASKS);
  const [isAvailable, setIsAvailable]   = useState(true);
  const [plumbingJobs, setPlumbingJobs] = useState(INIT_PLUMBING);
  const [electricalJobs, setElectricalJobs] = useState(INIT_ELECTRICAL);
  const [carpenterJobs, setCarpenterJobs]   = useState(INIT_CARPENTER);
  const [rooms]                             = useState(INIT_ROOMS);
  const [salesTab, setSalesTab]             = useState('leads'); // leads | rooms

  // Purchase
  const [demands,setDemands]    = useState(INIT_DEMANDS);

  // Security
  const [visitors,setVisitors]  = useState(INIT_VISITORS);
  const [parcels,setParcels]    = useState(INIT_PARCELS);
  const [showVisitor,setShowVisitor]=useState(false);
  const [showParcel,setShowParcel]  =useState(false);
  const [vName,setVName]=useState(''); const [vPhone,setVPhone]=useState(''); const [vPurp,setVPurp]=useState('');
  const [pStu,setPStu]=useState('');   const [pRoom,setPRoom]=useState('');   const [pCarr,setPCarr]=useState('Amazon'); const [pTrk,setPTrk]=useState('');

  // Demand/Requisition (shared)
  const [showDemand,setShowDemand]=useState(false);
  const [dItem,setDItem]=useState(''); const [dQty,setDQty]=useState(''); const [dNote,setDNote]=useState('');
  const [myDemands,setMyDemands]=useState([{id:1,item:'Basmati Rice 25kg',qty:'2 Bags',date:'22 Jul',status:'Approved'}]);

  // Salary Pay Slip Details
  const [selectedPaySlip, setSelectedPaySlip] = useState(null);
  const [showPaySlipModal, setShowPaySlipModal] = useState(false);

  // Inventory & Petty Cash Funds
  const [pettyCashLogs, setPettyCashLogs] = useState([
    {id:1, type:'expense', title:'Fresh Vegetables & Tomatoes', amount:750, mode:'Cash', date:'Today, 10:15 AM', by:'Admin Fund'},
    {id:2, type:'credit', title:'Cash Advance from Admin', amount:5000, mode:'Bank Transfer', date:'Yesterday, 02:00 PM', by:'Admin'},
    {id:3, type:'credit', title:'Extra Plate Payment (Rm 104)', amount:120, mode:'UPI', date:'22 Jul, 11:30 AM', by:'Parent Visit'},
    {id:4, type:'expense', title:'LPG Gas Cylinder Refill', amount:1120, mode:'Cash', date:'21 Jul, 09:00 AM', by:'Admin Fund'}
  ]);
  const [assignedAssets, setAssignedAssets] = useState([
    {id:1, name:'Commercial Gas Cylinders', qty:'2 Units', cond:'Good', serial:'LPG-8891'},
    {id:2, name:'Mess Kitchen Key Set', qty:'1 Set', cond:'In Use', serial:'KEY-MESS-01'},
    {id:3, name:'Stainless Steel Food Warmer', qty:'1 Unit', cond:'Good', serial:'WRM-2024'}
  ]);
  const staffUpiId = `${firstName.toLowerCase()}.staff@febebo.upi`;

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddFundModal, setShowAddFundModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expMode, setExpMode] = useState('Cash');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expSenderUpi, setExpSenderUpi] = useState(staffUpiId);
  const [expReceiverUpi, setExpReceiverUpi] = useState('');

  const [fundSrc, setFundSrc] = useState('Admin');
  const [fundTitle, setFundTitle] = useState('');
  const [fundAmt, setFundAmt] = useState('');
  const [fundMode, setFundMode] = useState('UPI');
  const [fundPayerName, setFundPayerName] = useState('Admin Office');
  const [fundSenderUpi, setFundSenderUpi] = useState('admin.office@febebo.upi');
  const [fundReceiverUpi, setFundReceiverUpi] = useState(staffUpiId);

  // Chat - Individual WhatsApp style
  const [contacts, setContacts] = useState(INIT_CONTACTS);
  const [activeContact, setActiveContact] = useState(null); // null = list view, object = chat view
  const [chatHist, setChatHist] = useState(INIT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  useEffect(() => { 
    if (view === 'chat' && activeContact) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHist, view, activeContact]);

  // Chat Reminder Modal
  const [showReminder, setShowReminder] = useState(false);
  const [remDate, setRemDate] = useState(new Date().toISOString().split('T')[0]);
  const [remTime, setRemTime] = useState('17:00');
  const [remReason, setRemReason] = useState('');

  // Reports
  const [rptText,setRptText]  = useState('');
  const [rptHist,setRptHist]  = useState([{id:1,date:'22 Jul 2026',summary:'Completed mess clean-up & kitchen prep for dinner.',status:'Reviewed ✓'}]);

  // Requests
  const [reqType,setReqType]    = useState('Leave');
  const [reqReason,setReqReason]= useState('');
  const [reqAmt,setReqAmt]      = useState('');
  const [myReqs,setMyReqs]      = useState([
    {id:1,type:'Casual Leave',  date:'25 Jul',status:'Approved',amt:'-'},
    {id:2,type:'Salary Advance',date:'20 Jul',status:'Approved',amt:'₹3,000'},
  ]);

  // Greeting
  const hr   = new Date().getHours();
  const greet= hr<12?'Good Morning':hr<17?'Good Afternoon':'Good Evening';
  const today= new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});

  // Handlers
  const punch = ()=>{
    const now = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    if(clocked){
      setClocked(false);
      setPunchLog(p=>p.map(x=>x.id===1?{...x,outT:now,hrs:'8 h 0 m'}:x));
    } else {
      setClocked(true);
      setPunchLog(p=>[{id:Date.now(),date:'Today, '+new Date().toLocaleDateString('en-GB'),inT:now,outT:null,hrs:null},...p]);
    }
  };

  const sendMsg = e => {
    e.preventDefault();
    if (!chatInput.trim() || !activeContact) return;
    const newMsg = { id: Date.now(), text: chatInput.trim(), time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}), me: true };
    setChatHist(prev => ({...prev, [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]}));
    setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, lastMsg: chatInput.trim(), time: newMsg.time } : c));
    setChatInput('');
  };

  const openReminder = () => {
    if (activeContact.reminder) {
      const parts = activeContact.reminder.split(' — ');
      if (parts.length > 1) {
        setRemReason(parts[0]);
      } else {
        setRemReason(activeContact.reminder);
      }
    } else {
      setRemReason('');
    }
    setShowReminder(true);
  };

  const saveReminder = e => {
    e.preventDefault();
    const reminderStr = `${remReason ? `${remReason} — ` : ''}${remDate} ${remTime}`;
    setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, isPinned: true, reminder: reminderStr } : c));
    setActiveContact(prev => ({ ...prev, isPinned: true, reminder: reminderStr }));
    setShowReminder(false);
    setRemReason('');
  };

  const clearReminder = () => {
    setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, isPinned: false, reminder: null } : c));
    setActiveContact(prev => ({ ...prev, isPinned: false, reminder: null }));
  };

  const submitReport = e=>{
    e.preventDefault();
    if(!rptText.trim()) return;
    setRptHist(p=>[{id:Date.now(),date:new Date().toLocaleDateString('en-GB'),summary:rptText.trim(),status:'Submitted'},...p]);
    setRptText('');
    alert('Report submitted to Admin!');
  };

  const submitRequest = e=>{
    e.preventDefault();
    if(!reqReason.trim()) return;
    setMyReqs(p=>[{id:Date.now(),type:reqType,date:new Date().toLocaleDateString('en-GB'),status:'Pending',amt:reqAmt?`₹${reqAmt}`:'-'},...p]);
    setReqReason(''); setReqAmt('');
    alert('Request submitted!');
  };

  const submitDemand = e=>{
    e.preventDefault();
    if(!dItem.trim()) return;
    setMyDemands(p=>[{id:Date.now(),item:dItem.trim(),qty:dQty||'1 unit',date:new Date().toLocaleDateString('en-GB'),status:'Pending'},...p]);
    setDItem(''); setDQty(''); setDNote('');
    setShowDemand(false);
    alert('Requisition submitted to Admin!');
  };

  const addVisitor = e=>{
    e.preventDefault();
    if(!vName.trim()) return;
    setVisitors(p=>[{id:Date.now(),name:vName,phone:vPhone||'—',purpose:vPurp||'Visitor',inTime:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),outTime:null,status:'Inside'},...p]);
    setVName(''); setVPhone(''); setVPurp(''); setShowVisitor(false);
  };

  const addParcel = e=>{
    e.preventDefault();
    if(!pStu.trim()) return;
    setParcels(p=>[{id:Date.now(),student:pStu,room:pRoom||'—',carrier:pCarr,tracking:pTrk||'TRK-'+Math.floor(1000+Math.random()*9000),date:'Today '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),status:'Pending'},...p]);
    setPStu(''); setPRoom(''); setPTrk(''); setShowParcel(false);
  };

  const eaten = students.filter(s=>s.statusB==='eaten').length; // Home view demo data

  // ─── Module tiles on Home ──────────────────────────────────────────────────
  const MODULES = [
    {id:'work',      label:'My Work',        sub:staffRole,          icon:'home_work',              grad:'#eef2ff'},
    {id:'inventory', label:'Inventory',      sub:'Petty Funds & Assets', icon:'account_balance_wallet', grad:'#eef2ff'},
    {id:'inout',     label:'Attendance',     sub:'Punch In / Out',   icon:'schedule',               grad:'#eef2ff'},
    {id:'salary',    label:'Salary',         sub:'₹18,500 Jul',      icon:'payments',               grad:'#eef2ff'},
    {id:'items',     label:'Item List',      sub:'Store Inventory',  icon:'inventory_2',            grad:'#eef2ff'},
    {id:'chat',      label:'Chat',           sub:'5 Messages',       icon:'forum',                  grad:'#eef2ff'},
    {id:'reports',   label:'Reports',        sub:'Work Logs',        icon:'assessment',             grad:'#eef2ff'},
    {id:'requests',  label:'Requests',       sub:'Leave / Advance',  icon:'approval',               grad:'#eef2ff'},
  ];

  // ─── Role quick stats ─────────────────────────────────────────────────────
  const roleStats = {
    'HR':               [{l:'Applicants',v:INIT_CANDIDATES.filter(c=>c.status!=='Hired ✅').length,icon:'group_add'},{l:'Enquiries',v:INIT_ENQUIRIES.length,icon:'contact_phone'},{l:'Staff Hired',v:INIT_CANDIDATES.filter(c=>c.status==='Hired ✅').length,icon:'badge'},{l:'Open Jobs',v:3,icon:'work_outline'}],
    'Cook':             [{l:'Breakfast',v:30,icon:'coffee'},{l:'Lunch',v:28,icon:'lunch_dining'},{l:'Dinner',v:30,icon:'dinner_dining'},{l:'Snacks',v:30,icon:'bakery_dining'}],
    'Cleaner':          [{l:'Pending',v:INIT_CLEANING.filter(c=>!c.done).length,icon:'mop'},{l:'Cleaned',v:INIT_CLEANING.filter(c=>c.done).length,icon:'check_circle'},{l:'Rooms Today',v:4,icon:'room_service'},{l:'Floors',v:3,icon:'stairs'}],
    'Maintenance':      [{l:'Open',v:INIT_TICKETS.filter(t=>t.status==='Open').length,icon:'build'},{l:'In Progress',v:INIT_TICKETS.filter(t=>t.status==='In Progress').length,icon:'construction'},{l:'Resolved',v:8,icon:'check_circle'},{l:'High Priority',v:2,icon:'priority_high'}],
    'Purchase Manager': [{l:'Pending POs',v:INIT_DEMANDS.filter(d=>d.status==='Pending').length,icon:'pending'},{l:'Approved',v:INIT_DEMANDS.filter(d=>d.status==='Approved').length,icon:'verified'},{l:'Items Low',v:2,icon:'inventory_2'},{l:'Out of Stock',v:1,icon:'remove_shopping_cart'}],
    'Security Guard':   [{l:'Visitors In',v:INIT_VISITORS.filter(v=>v.status==='Inside').length,icon:'person'},{l:'Today Total',v:INIT_VISITORS.length,icon:'groups'},{l:'Parcels',v:INIT_PARCELS.filter(p=>p.status==='Pending').length,icon:'package_2'},{l:'Incidents',v:0,icon:'warning'}],
    'Helper':           [{l:'Tasks Today',v:INIT_TASKS.length,icon:'task_alt'},{l:'Pending',v:INIT_TASKS.filter(t=>t.status==='Pending').length,icon:'pending'},{l:'Done',v:INIT_TASKS.filter(t=>t.status==='Done').length,icon:'check_circle'},{l:'High Priority',v:INIT_TASKS.filter(t=>t.priority==='High').length,icon:'priority_high'}],
    'Plumber':          [{l:'Open Jobs',v:INIT_PLUMBING.filter(t=>t.status==='Open').length,icon:'plumbing'},{l:'In Progress',v:INIT_PLUMBING.filter(t=>t.status==='In Progress').length,icon:'construction'},{l:'Resolved',v:1,icon:'check_circle'},{l:'High Priority',v:INIT_PLUMBING.filter(t=>t.priority==='High').length,icon:'priority_high'}],
    'Electrician':      [{l:'Open',v:INIT_ELECTRICAL.filter(t=>t.status==='Open').length,icon:'electrical_services'},{l:'In Progress',v:INIT_ELECTRICAL.filter(t=>t.status==='In Progress').length,icon:'construction'},{l:'Resolved',v:INIT_ELECTRICAL.filter(t=>t.status==='Resolved').length,icon:'check_circle'},{l:'High Priority',v:INIT_ELECTRICAL.filter(t=>t.priority==='High').length,icon:'priority_high'}],
    'Carpenter':        [{l:'Open Jobs',v:INIT_CARPENTER.filter(t=>t.status==='Open').length,icon:'carpenter'},{l:'In Progress',v:INIT_CARPENTER.filter(t=>t.status==='In Progress').length,icon:'construction'},{l:'Resolved',v:0,icon:'check_circle'},{l:'High Priority',v:INIT_CARPENTER.filter(t=>t.priority==='High').length,icon:'priority_high'}],
    'Sales Manager':    [{l:'New Leads',v:INIT_ENQUIRIES.filter(e=>e.status.includes('New')).length,icon:'contact_phone'},{l:'Contacted',v:INIT_ENQUIRIES.filter(e=>e.status.includes('Contacted')).length,icon:'call_made'},{l:'Vacant Rooms',v:INIT_ROOMS.filter(r=>r.status==='Vacant').length,icon:'meeting_room'},{l:'Closed Deals',v:INIT_ENQUIRIES.filter(e=>e.status.includes('Closed')).length,icon:'handshake'}],
    'Manager':          [{l:'Staff On Duty',v:12,icon:'groups'},{l:'Open Tickets',v:INIT_TICKETS.filter(t=>t.status!=='Resolved').length+INIT_PLUMBING.filter(t=>t.status==='Open').length,icon:'confirmation_number'},{l:'Vacant Rooms',v:INIT_ROOMS.filter(r=>r.status==='Vacant').length,icon:'meeting_room'},{l:'Pending POs',v:INIT_DEMANDS.filter(d=>d.status==='Pending').length,icon:'pending'}],
    'Others':           [{l:'Tasks Today',v:INIT_TASKS.length,icon:'task_alt'},{l:'Pending',v:INIT_TASKS.filter(t=>t.status==='Pending').length,icon:'pending'},{l:'Done',v:INIT_TASKS.filter(t=>t.status==='Done').length,icon:'check_circle'},{l:'Available',v:1,icon:'person_check'}],
  };
  const stats = roleStats[staffRole] || roleStats['HR'];

  // Sorting contacts
  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.reminder && !b.reminder) return -1;
    if (!a.reminder && b.reminder) return 1;
    return 0;
  });

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={{maxWidth:480,margin:'0 auto',minHeight:'100vh',background:C.bg,fontFamily:"'Hanken Grotesk',sans-serif",position:'relative',overflowX:'hidden'}}>
      <style>{`
        @keyframes sheetUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes sideIn{from{left:-300px}to{left:0}}
        ::-webkit-scrollbar{display:none} *{-webkit-tap-highlight-color:transparent}
      `}</style>

      {/* ── Sidebar Overlay ─────────────────────────────────────────────── */}
      {sidebar && <div onClick={()=>setSidebar(false)} style={{position:'fixed',inset:0,background:'rgba(15,23,42,.55)',zIndex:60,backdropFilter:'blur(3px)'}}/>}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{position:'fixed', top:0, left:sidebar ? 0 : '-300px', width:280, height:'100vh', background:'#fff', borderRight: '1px solid #e2e8f0', zIndex:70, transition:'left .3s cubic-bezier(.4,0,.2,1)', display:'flex', flexDirection:'column', boxShadow: '4px 0 16px rgba(15,23,42,0.06)'}}>
        {/* Sidebar top profile */}
        <div onClick={()=>{setView('profile_view');setSidebar(false);}} style={{padding:'28px 20px 20px', borderBottom: '1px solid #e2e8f0', cursor:'pointer'}}>
          <div style={{width:52, height:52, borderRadius:12, background: meta.accentBg, border: '1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:12, boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
            {meta.emoji}
          </div>
          <p style={{fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:20, fontWeight:800, color:'#000', margin:0}}>{staffName}</p>
          <div style={{display:'flex', alignItems:'center', gap:6, marginTop:4}}>
            <span style={{fontSize:11, fontWeight:800, background:meta.accent, color:'#000', padding:'2px 8px', borderRadius:8, border: '1px solid #e2e8f0'}}>{staffRole}</span>
            <span style={{fontSize:12, fontWeight:700, color:C.muted}}>· {meta.dept}</span>
          </div>
        </div>

        {/* Nav items */}
        <div style={{flex:1, overflowY:'auto', padding:'16px 12px'}}>
          {[
            {id:'home',      icon:'home',                   label:'Home Dashboard'},
            {id:'work',      icon:'home_work',              label:'My Work'},
            {id:'inventory', icon:'account_balance_wallet', label:'Inventory & Petty Cash'},
            {id:'inout',     icon:'schedule',               label:'Attendance'},
            {id:'salary',    icon:'payments',               label:'Salary & Pay'},
            {id:'items',     icon:'inventory_2',            label:'Item List'},
            {id:'chat',      icon:'forum',                  label:'Chat'},
            {id:'reports',   icon:'assessment',             label:'Work Reports'},
            {id:'requests',  icon:'approval',               label:'Requests'},
            {id:'profile_view', icon:'person',              label:'My Profile'},
          ].map(item => {
            const active = view === item.id;
            return (
              <div key={item.id} onClick={()=>{setView(item.id);setSidebar(false);setActiveContact(null);}}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 16px', marginBottom:8, cursor:'pointer',
                  color: '#000',
                  background: active ? C.primary : 'transparent',
                  border: active ? '2px solid #000' : '2px solid transparent',
                  borderRadius: 12,
                  boxShadow: active ? '2px 2px 0px #000' : 'none',
                  fontWeight: active ? 800 : 600,
                  transition: 'all .15s'
                }}>
                <span className="material-symbols-outlined" style={{fontSize:20}}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div style={{borderTop: '1px solid #e2e8f0', padding:'16px 20px', background:'#fafafa'}}>
          <div onClick={logout} style={{display:'flex', alignItems:'center', gap:14, color:C.danger, cursor:'pointer', padding:'8px 0', fontWeight:800}}>
            <span className="material-symbols-outlined" style={{fontSize:20}}>logout</span>
            <span style={{fontSize:14}}>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* ── HEADER (always visible) ──────────────────────────────────────── */}
      {view === 'home' ? (
        // Home Hero Header
        <div style={{background: '#ffffff', padding:'0 16px 20px', color: '#1a1500', borderBottom: '1px solid #e8df9a'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:60}}>
            <button onClick={()=>setSidebar(true)} style={{background: 'rgba(255,255,255,0.45)', backdropFilter:'blur(4px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius:10, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
              <span className="material-symbols-outlined" style={{fontSize:20, color: '#78350f'}}>menu</span>
            </button>
            <p style={{fontFamily:"'Hanken Grotesk',sans-serif", fontSize:24, fontWeight:900, color: '#1a1200', margin:0, letterSpacing:-.5}}>febebo</p>
            <button onClick={()=>setShowDemand(true)} style={{background: '#ffffff', border: 'none', borderRadius:10, padding:'7px 14px', color: '#0f172a', fontSize:12, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
              <span className="material-symbols-outlined" style={{fontSize:16, color: '#92400e'}}>post_add</span>
              Demand
            </button>
          </div>

          {/* Greeting card */}
          <div style={{marginTop:14}}>
            <p style={{margin:'0 0 4px', fontSize:14, color: '#78350f', fontWeight:800}}>{greet}, {firstName} 👋</p>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <h2 style={{margin:0, fontSize:24, fontWeight:900, color: '#1a1200', letterSpacing:-.5}}>{meta.dept}</h2>
              <span style={{fontSize:11, fontWeight:900, background: 'rgba(255,255,255,0.55)', color: '#78350f', padding:'4px 10px', borderRadius:20, border: '1px solid #f472b6', boxShadow:'0 2px 6px rgba(0,0,0,0.15)'}}>{staffRole}</span>
            </div>
            <p style={{margin:'6px 0 0', fontSize:12, color: '#92400e', fontWeight: 800}}>📅 {today} · Febebo PG</p>
          </div>

          {/* Punch card */}
          <div style={{marginTop:18, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius:16, padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.12)'}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span style={{width:10, height:10, borderRadius:'50%', background: clocked ? '#10b981' : '#ef4444', display:'inline-block'}}/>
                <span style={{fontSize:14, fontWeight:900, color: '#0f172a'}}>{clocked ? `On Duty · In at ${clockIn}` : 'Off Shift'}</span>
              </div>
              
            </div>
            <button onClick={punch} style={{padding:'10px 16px', borderRadius:10, border: 'none', background: clocked ? '#fee2e2' : '#dcfce7', color: clocked ? '#991b1b' : '#166534', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.06)'}}>
              {clocked ? '⏹ Punch Out' : '▶ Punch In'}
            </button>
          </div>
        </div>
      ) : view === 'chat' && activeContact ? (
        // Individual Chat Header
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 16px',height:64,background:'#fff',borderBottom: '1px solid #e2e8f0',position:'sticky',top:0,zIndex:50,boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
          <button onClick={() => setActiveContact(null)} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius:10,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <span className="material-symbols-outlined" style={{fontSize:20,color:C.sub}}>arrow_back_ios_new</span>
          </button>
          <div style={{width:40,height:40,borderRadius: 8,background:meta.accentBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{activeContact.avatar}</div>
          <div style={{flex:1, overflow:'hidden'}}>
            <p style={{margin:0,fontSize:15,fontWeight:800,color:C.text,whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden'}}>{activeContact.name}</p>
            <p style={{margin:0,fontSize:11,color:C.muted}}>{activeContact.role}</p>
          </div>
          <button onClick={openReminder} style={{background: activeContact.reminder ? '#fef3c7' : meta.accentBg, border: `1px solid ${activeContact.reminder ? '#fde68a' : meta.accent}`, borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: activeContact.reminder ? '#b45309' : meta.accent, fontSize: 12, fontWeight: 700, fontFamily: 'inherit'}}>
            <span className="material-symbols-outlined" style={{fontSize:16}}>{activeContact.reminder ? 'notifications_active' : 'notifications'}</span>
          </button>
        </div>
      ) : (
        // Inner page header
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 16px',height:58,background:'#fff',borderBottom: '1px solid #e2e8f0',position:'sticky',top:0,zIndex:50,boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
          <button onClick={()=>setSidebar(true)} style={{background:'#fff',border: '1px solid #e2e8f0',borderRadius:10,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
            <span className="material-symbols-outlined" style={{fontSize:20,color:'#000'}}>menu</span>
          </button>
          <button onClick={()=>setView('home')} style={{background:'#fff',border: '1px solid #e2e8f0',borderRadius:10,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
            <span className="material-symbols-outlined" style={{fontSize:20,color:'#000'}}>arrow_back_ios_new</span>
          </button>
          <p style={{flex:1,margin:0,fontSize:18,fontWeight:900,color:'#000'}}>
            {view==='work'?'My Work':view==='inventory'?'Inventory & Petty Cash':view==='inout'?'Attendance':view==='salary'?'Salary & Pay':view==='items'?'Item List':view==='chat'?'Chat':view==='reports'?'Work Reports':view==='requests'?'Requests':'My Profile'}
          </p>
          {view==='items' && (
            <button onClick={()=>setShowDemand(true)} style={{background:C.primary,border: '1px solid #e2e8f0',borderRadius:10,padding:'6px 10px',color:'#000',fontSize:11,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',gap:4,boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
              <span className="material-symbols-outlined" style={{fontSize:15}}>add</span>
              Demand
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HOME VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'home' && (
        <div style={{padding:'16px 14px', paddingBottom:96}}>

          {/* Modules Grid */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <p style={{margin:0, fontSize:15, fontWeight:900, color:C.text}}>Modules</p>
            <span style={{fontSize:12, fontWeight:800, color:C.primaryDk, cursor:'pointer'}}>See all ▾</span>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:20}}>
            {[
              {id:'work',      label:'My Work',        icon:'home_work',              bg:'#eef2ff', c:'#6366f1'},
              {id:'inventory', label:'Inventory',      icon:'account_balance_wallet', bg:'#fdf2f8', c:'#ec4899'},
              {id:'inout',     label:'Attendance',     icon:'schedule',               bg:'#f0fdf4', c:'#10b981'},
              {id:'salary',    label:'Salary',         icon:'payments',               bg:'#fefce8', c:'#eab308'},
              {id:'items',     label:'Item List',      icon:'inventory_2',            bg:'#fff7ed', c:'#f97316'},
              {id:'chat',      label:'Chat',           icon:'forum',                  bg:'#f0f9ff', c:'#0ea5e9'},
              {id:'reports',   label:'Reports',        icon:'assessment',             bg:'#fff1f2', c:'#f43f5e'},
              {id:'requests',  label:'Requests',       icon:'approval',               bg:'#f5f3ff', c:'#8b5cf6'},
            ].map(m => (
              <button key={m.id} onClick={() => setView(m.id)}
                style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, background:'#fff', border:`1px solid ${C.border}`, borderRadius:20, padding:'12px 4px 10px', cursor:'pointer', boxShadow:'0 4px 12px rgba(120, 104, 10, 0.04)', minHeight:88, outline:'none', transition:'all 0.15s'}}>
                <div style={{width:44, height:44, borderRadius:14, background:m.bg, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span className="material-symbols-outlined" style={{fontSize:22, color:m.c}}>{m.icon}</span>
                </div>
                <span style={{fontSize:11.5, fontWeight:800, color:C.text, textAlign:'center', lineHeight:1.1}}>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Need Supplies Card */}
          <div onClick={() => setShowDemand(true)} style={{
            background: '#ffffff',
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(120, 104, 10, 0.03)',
            marginBottom: 20
          }}>
            <div style={{width:32, height:32, borderRadius:50, background: '#fefce8', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <span className="material-symbols-outlined" style={{fontSize:18, color: '#ca8a04'}}>shopping_cart</span>
            </div>
            <div>
              <p style={{margin:0, fontSize:13, fontWeight:800, color: C.text}}>Need Supplies</p>
              <p style={{margin:0, fontSize:10.5, fontWeight:700, color: C.muted}}>Request Materials</p>
            </div>
          </div>

          {/* Outstanding Work section */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <p style={{margin:0, fontSize:15, fontWeight:900, color:C.text}}>Today's Tasks</p>
            <span onClick={() => setView('work')} style={{fontSize:12, fontWeight:800, color:C.primaryDk, cursor:'pointer'}}>See all ▾</span>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {/* Cleaner Outstanding list */}
            {staffRole === 'Cleaner' && cleaning.filter(c => !c.done).slice(0, 3).map(c => (
              <div key={c.id} onClick={() => setView('work')} style={{background:'#fff', border:`1px solid ${C.border}`, borderRadius:18, padding:14, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 12px rgba(120, 104, 10, 0.03)', cursor:'pointer'}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:40, height:40, borderRadius:12, background:'#fefce8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>🧹</div>
                  <div>
                    <h4 style={{margin:0, fontSize:14, fontWeight:800, color:C.text}}>Room {c.room}</h4>
                    <p style={{margin:0, fontSize:11, color:C.muted}}>Housekeeping slot · {c.type}</p>
                  </div>
                </div>
                <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:10, background:'#fee2e2', color:'#dc2626'}}>Pending</span>
              </div>
            ))}

            {/* Cook Outstanding list */}
            {staffRole === 'Cook' && (
              <div onClick={() => setView('work')} style={{background:'#fff', border:`1px solid ${C.border}`, borderRadius:18, padding:14, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 12px rgba(120, 104, 10, 0.03)', cursor:'pointer'}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:40, height:40, borderRadius:12, background:'#fefce8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>👨‍🍳</div>
                  <div>
                    <h4 style={{margin:0, fontSize:14, fontWeight:800, color:C.text}}>Meals Log & Requests</h4>
                    <p style={{margin:0, fontSize:11, color:C.muted}}>Breakfast: 30 · Lunch: 28 · Dinner: 30</p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{fontSize:18, color:C.muted}}>chevron_right</span>
              </div>
            )}

            {/* General Tasks List (Helper, Maintenance, Plumber, etc.) */}
            {staffRole !== 'Cleaner' && staffRole !== 'Cook' && tasks.filter(t => t.status === 'Pending').slice(0, 3).map(t => (
              <div key={t.id} onClick={() => setView('work')} style={{background:'#fff', border:`1px solid ${C.border}`, borderRadius:18, padding:14, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 12px rgba(120, 104, 10, 0.03)', cursor:'pointer'}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:40, height:40, borderRadius:12, background:'#fefce8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>{meta.emoji}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <h4 style={{margin:0, fontSize:14, fontWeight:800, color:C.text, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden', maxWidth:220}}>{t.title}</h4>
                    <p style={{margin:0, fontSize:11, color:C.muted}}>Room {t.room} · Priority: {t.priority}</p>
                  </div>
                </div>
                <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:10, background: t.priority==='High'?'#fee2e2':'#fef3c7', color: t.priority==='High'?'#dc2626':'#ca8a04'}}>{t.priority}</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MY WORK (Role-Specific)
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'work' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:14}}>

          {/* COOK */}
          {staffRole === 'Cook' && (<>
            <button onClick={()=>setShowBcast(true)} style={{width:'100%',padding:14,background: C.primary,color:'#000',border: '1px solid #e2e8f0',borderRadius:16,fontSize:14,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow: '0 4px 16px rgba(15,23,42,0.05)',fontFamily:'inherit'}}>
              <span className="material-symbols-outlined" style={{fontSize:20}}>campaign</span>
              Broadcast "Food is Ready!" 📢
            </button>

            {/* Calendar & Time Filter Bar */}
            <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
              <div style={{flex:1, display:'flex', alignItems:'center', gap:8, background:'#fff', padding:'6px 12px', border: '1px solid #e2e8f0', borderRadius:10, boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                <span className="material-symbols-outlined" style={{fontSize:20, color:'#000'}}>calendar_month</span>
                <input 
                  type="date" 
                  value={workDate} 
                  onChange={e=>setWorkDate(e.target.value)} 
                  style={{border:'none', background:'transparent', fontSize:13, fontWeight:800, color:'#000', outline:'none', width:'100%', fontFamily:'inherit', cursor:'pointer'}} 
                />
              </div>

              {/* Time Filter Tabs */}
              <div style={{display:'flex', flex:1, background:'#fff', borderRadius: 10, padding:3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                {['Daily', 'Weekly', 'Monthly'].map(f => (
                  <button key={f} onClick={()=>setTimeFilter(f)} style={{flex:1, padding:'6px 0', borderRadius:8, border:timeFilter===f?'2px solid #000':'2px solid transparent', background:timeFilter===f?C.primary:'transparent', color:'#000', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Tabs */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8}}>
              {[{m:'Breakfast',icon:'coffee'},{m:'Lunch',icon:'lunch_dining'},{m:'Snacks',icon:'bakery_dining'},{m:'Dinner',icon:'dinner_dining'}].map(x=>(
                <div key={x.m} onClick={()=>setMealTab(x.m)} style={{background:mealTab===x.m?meta.accentBg:'#fff',border:`1.5px solid ${mealTab===x.m?meta.accent:C.border}`,borderRadius: 8,padding:'10px 4px',textAlign:'center',cursor:'pointer'}}>
                  <span className="material-symbols-outlined" style={{fontSize:20,color:mealTab===x.m?meta.accent:C.muted}}>{x.icon}</span>
                  <p style={{fontSize:10,fontWeight:800,color:mealTab===x.m?meta.accent:C.muted,margin:'4px 0 0',textTransform:'uppercase'}}>{x.m}</p>
                </div>
              ))}
            </div>

            {/* Menu Display */}
            <div style={{background:'#fff', borderRadius:16, border: '1px solid #e2e8f0', padding:14, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <p style={{margin:0, fontSize:12, fontWeight:800, color:meta.accent, textTransform:'uppercase'}}>Today's {mealTab}</p>
                <p style={{margin:'4px 0 0', fontSize:14, fontWeight:700, color:C.text}}>{menus[mealTab] || 'No menu set'}</p>
              </div>
              <button onClick={()=>{setMenuEditVal(menus[mealTab]||''); setShowMenuEdit(true);}} style={{background:C.bg, border: '1px solid #e2e8f0', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:800, color:C.sub, cursor:'pointer'}}>Edit</button>
            </div>

            {/* Stat Cards & Filtered List */}
            {(() => {
               const mealKey = mealTab==='Breakfast'?'statusB':mealTab==='Lunch'?'statusL':mealTab==='Snacks'?'statusS':'statusD';
               const detailsKey = mealTab==='Breakfast'?'detailsB':mealTab==='Lunch'?'detailsL':mealTab==='Snacks'?'detailsS':'detailsD';
               const statsObj = {
                 requested: students.filter(s=>s[mealKey]==='requested').length,
                 pack: students.filter(s=>s[mealKey]==='pack').length,
                 extra: students.filter(s=>s[mealKey]==='extra').length,
                 eaten: students.filter(s=>s[mealKey]==='eaten').length,
                 notEaten: students.filter(s=>s[mealKey]==='notEaten').length,
               };
               
               const mult = timeFilter==='Monthly'?30:timeFilter==='Weekly'?7:1;

               const statCards = [
                 {id:'requested', l:'Requested', v:statsObj.requested*mult, c:'#000', bg:'#fef08a'},
                 {id:'pack', l:'To Pack', v:statsObj.pack*mult, c:'#000', bg:'#fef08a'},
                 {id:'extra', l:'Extra Plate', v:statsObj.extra*mult, c:'#000', bg:'#cffafe'},
                 {id:'eaten', l:'Eaten', v:statsObj.eaten*mult, c:'#000', bg:'#bbf7d0'},
                 {id:'notEaten', l:'Not Eaten', v:statsObj.notEaten*mult, c:'#000', bg:'#fecaca'}
               ];

               return (
                 <>
                   {/* Scrollable Stat Cards Container */}
                   <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4, margin:'0 -4px', paddingLeft:4, paddingRight:4, scrollbarWidth:'none'}}>
                     {statCards.map(s => (
                       <div key={s.id} onClick={()=>setSelectedStat(s.id)} style={{flexShrink:0, width:92, background:selectedStat===s.id?s.bg:'#fff', border:`2px solid #000`, borderRadius:14, padding:'12px 10px', textAlign:'center', cursor:'pointer', boxShadow: selectedStat === s.id ? '0 4px 12px rgba(120, 104, 10, 0.06)' : 'none', transition:'all .15s'}}>
                         <p style={{fontSize:22,fontWeight:900,color:'#000',margin:0}}>{s.v}</p>
                         <p style={{fontSize:10,fontWeight:800,color:'#000',margin:'4px 0 0',textTransform:'uppercase'}}>{s.l}</p>
                       </div>
                     ))}
                   </div>
                   
                   {/* Filtered Student List */}
                   <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                     <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:'#000'}}>
                       {statCards.find(c=>c.id===selectedStat)?.l} · {mealTab} <span style={{fontSize:12, fontWeight:600, color:C.muted}}>({workDate})</span>
                     </p>
                     
                     <div style={{maxHeight:360,overflowY:'auto',display:'flex',flexDirection:'column',gap:10,paddingRight:4}}>
                       {students.filter(s=>s[mealKey]===selectedStat).map(s=>(
                         <div key={s.id} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius: 12,padding:'12px',display:'flex',justifyContent:'space-between',alignItems:'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                           <div>
                             <span style={{fontSize:14,fontWeight:800,color:'#000'}}>{s.name} </span>
                             <p style={{margin:'2px 0 6px',fontSize:12,color:C.muted,fontWeight:600}}>Rm {s.room} · {s.bed}</p>
                             <div style={{display:'flex', gap:6, flexWrap:'wrap', alignItems:'center'}}>
                               <Chip label={s.phone} color="#78680a" bg="#fefce8"/>
                               {(selectedStat === 'pack' || selectedStat === 'extra') && s[detailsKey] && (
                                 <span style={{fontSize:11, fontWeight:800, color:'#78680a', background:'#fefce8', padding:'4px 8px', borderRadius:8, border: '1px solid #e8df9a'}}>
                                   {s[detailsKey]}
                                 </span>
                               )}
                             </div>
                           </div>
                           
                           <div style={{display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end'}}>
                             {(selectedStat === 'pack' || selectedStat === 'extra') && (
                               <button onClick={()=>{
                                 setPackStudentId(s.id); 
                                 const currentVal = s[detailsKey] || '';
                                 const priceMatch = currentVal.match(/₹(\d+)/);
                                 setPackPriceVal(priceMatch ? priceMatch[1] : '');
                                 setPackVal(currentVal.replace(/\s*\(₹\d+\)/, '')); 
                                 setShowPackEdit(true);
                               }}
                                 style={{padding:'7px 12px',borderRadius:8,border: '1px solid #e2e8f0',background:'#fef08a',color:'#000',fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                                 {s[detailsKey] ? 'Edit Details' : 'Fill Details'}
                               </button>
                             )}
                             
                             {/* Call Option for Students (especially Not Eaten) */}
                             <a href={`tel:${s.phone.replace(/\s+/g, '')}`} 
                               style={{padding:'6px 10px', borderRadius:8, border: '1px solid #e2e8f0', background:'#bbf7d0', color:'#000', textDecoration:'none', fontSize:11, fontWeight:800, display:'inline-flex', alignItems:'center', gap:4, boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                               📞 Call
                             </a>

                             {/* Quick Action button for 'eaten' */}
                             {(selectedStat === 'requested' || selectedStat === 'notEaten') && timeFilter === 'Daily' && (
                               <button onClick={()=>setStudents(p=>p.map(st=>st.id===s.id?{...st,[mealKey]:'eaten'}:st))}
                                 style={{padding:'6px 12px',borderRadius:8,border: '1px solid #e2e8f0',background:'#fff',color:'#000',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                                 Mark Eaten
                               </button>
                             )}
                             {selectedStat === 'eaten' && timeFilter === 'Daily' && (
                                <Chip label="Eaten ✅" color="#166534" bg="#dcfce7"/>
                             )}
                           </div>
                         </div>
                       ))}
                       {students.filter(s=>s[mealKey]===selectedStat).length === 0 && (
                         <div style={{textAlign:'center', padding:'30px 10px'}}>
                           <span className="material-symbols-outlined" style={{fontSize:32,color:C.border}}>sentiment_dissatisfied</span>
                           <p style={{fontSize:13, color:C.muted, margin:'8px 0 0'}}>No students found.</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </>
               )
            })()}
          </>)}

          {/* CLEANER ROLE - 2 HOUR WINDOW SLOT SYSTEM */}
          {staffRole === 'Cleaner' && (() => {
            const mult = cleanerTimeFilter === 'Monthly' ? 30 : cleanerTimeFilter === 'Weekly' ? 7 : 1;
            
            const activeSlots = cleaning.filter(c => c.slotStatus === 'active');
            const upcomingSlots = cleaning.filter(c => c.slotStatus === 'upcoming');
            const completedSlots = cleaning.filter(c => c.done);

            // Filter by type
            const matchesType = (item) => {
              if (cleanerTypeFilter === 'All') return true;
              return item.type.toLowerCase().includes(cleanerTypeFilter.toLowerCase());
            };

            const filteredList = cleaning.filter(c => {
              if (!matchesType(c)) return false;
              if (cleanerSlotFilter === 'active') return c.slotStatus === 'active' && !c.done;
              if (cleanerSlotFilter === 'upcoming') return c.slotStatus === 'upcoming' && !c.done;
              if (cleanerSlotFilter === 'completed') return c.done;
              return true;
            });

            return (
              <>
                {/* Header Controls: Calendar & Time Filters */}
                <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
                  {/* Date Selector */}
                  <div style={{flex:1, display:'flex', alignItems:'center', gap:8, background:'#fff', padding:'6px 12px', border: '1px solid #e2e8f0', borderRadius:10, boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                    <span className="material-symbols-outlined" style={{fontSize:20, color:'#000'}}>calendar_month</span>
                    <input 
                      type="date" 
                      value={cleanerDate} 
                      onChange={e=>setCleanerDate(e.target.value)} 
                      style={{border:'none', background:'transparent', fontSize:13, fontWeight:800, color:'#000', outline:'none', width:'100%', fontFamily:'inherit', cursor:'pointer'}} 
                    />
                  </div>

                  {/* Time Filter Tabs */}
                  <div style={{display:'flex', flex:1, background:'#fff', borderRadius: 10, padding:3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                    {['Daily', 'Weekly', 'Monthly'].map(f => (
                      <button key={f} onClick={()=>setCleanerTimeFilter(f)} style={{flex:1, padding:'6px 0', borderRadius:8, border:cleanerTimeFilter===f?'2px solid #000':'2px solid transparent', background:cleanerTimeFilter===f?C.primary:'transparent', color:'#000', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cleaning Type Filter Dropdown / Pills */}
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', color:C.muted}}>Filter By Cleaning Type</span>
                  <div style={{display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none'}}>
                    {['All', 'Full Room', 'Dusting', 'Mopping', 'Bathroom', 'Basic Cleaning'].map(t => (
                      <button
                        key={t}
                        onClick={() => setCleanerTypeFilter(t)}
                        style={{
                          padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                          background: cleanerTypeFilter === t ? '#fde047' : '#fff',
                          color: '#000',
                          border: '1px solid #e2e8f0',
                          boxShadow: cleanerTypeFilter === t ? '0 3px 8px rgba(120, 104, 10, 0.05)' : 'none'
                        }}
                      >
                        {t === 'All' ? '🧹 All Types' : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* WEEKLY / MONTHLY DETAILED BREAKDOWN REPORT */}
                {cleanerTimeFilter !== 'Daily' ? (
                  <div style={{display:'flex', flexDirection:'column', gap:14}}>
                    <div style={{background:C.primary, borderRadius:16, border: '1px solid #e2e8f0', padding:'16px', boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                      <p style={{margin:0, fontSize:12, fontWeight:800, textTransform:'uppercase'}}>📊 {cleanerTimeFilter} Cleaning Report ({cleanerTypeFilter} Filter)</p>
                      <h3 style={{margin:'4px 0 0', fontSize:22, fontWeight:900}}>Overall Cleaned vs Uncleaned Summary</h3>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                      <div style={{background:'#bbf7d0', borderRadius:14, border: '1px solid #e2e8f0', padding:14, textAlign:'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                        <p style={{fontSize:28, fontWeight:900, color:'#000', margin:0}}>{completedSlots.length * mult}</p>
                        <p style={{fontSize:12, fontWeight:800, color:'#000', margin:'2px 0 0', textTransform:'uppercase'}}>Total Cleaned</p>
                      </div>

                      <div style={{background:'#fecaca', borderRadius:14, border: '1px solid #e2e8f0', padding:14, textAlign:'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                        <p style={{fontSize:28, fontWeight:900, color:'#000', margin:0}}>{(cleaning.length - completedSlots.length) * mult}</p>
                        <p style={{fontSize:12, fontWeight:800, color:'#000', margin:'2px 0 0', textTransform:'uppercase'}}>Total Uncleaned</p>
                      </div>
                    </div>

                    {/* Cleaned Rooms Section */}
                    <div style={{background:'#fff', borderRadius:16, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                      <p style={{margin:'0 0 6px', fontSize:15, fontWeight:800, color:'#000'}}>✅ Cleaned Rooms Details ({cleanerTimeFilter})</p>
                      
                      {/* Cleaning Type Breakdown Pills */}
                      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
                        {['Full Room Clean', 'Dusting & Mop', 'Bathroom Sanitise', 'Bedsheet & Towel Change'].map(type => {
                          const count = cleaning.filter(c => c.done && c.type.toLowerCase().includes(type.toLowerCase().split(' ')[0])).length * mult;
                          return (
                            <span key={type} style={{fontSize:10.5, fontWeight:800, background:'#fef08a', color:'#000', padding:'3px 8px', borderRadius:8, border: '1px solid #e8df9a'}}>
                              {type}: {count}
                            </span>
                          );
                        })}
                      </div>

                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        {cleaning.filter(c => c.done && matchesType(c)).map(c => (
                          <div key={c.id} style={{background:'#f0fdf4', border: '1px solid #e2e8f0', borderRadius:12, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                              <div style={{display:'flex', alignItems:'center', gap:6}}>
                                <span style={{fontSize:14, fontWeight:900, color:'#000'}}>Room {c.room}</span>
                                <Chip label={c.type} color="#78680a" bg="#fefce8"/>
                              </div>
                              <p style={{margin:'2px 0 0', fontSize:11, color:C.muted, fontWeight:700}}>Student: {c.student} · Slot: {c.slot}</p>
                            </div>
                            <Chip label="Cleaned ✓" color="#166534" bg="#dcfce7"/>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Uncleaned Rooms Section */}
                    <div style={{background:'#fff', borderRadius:16, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                      <p style={{margin:'0 0 6px', fontSize:15, fontWeight:800, color:'#000'}}>⏳ Uncleaned / Pending Rooms ({cleanerTimeFilter})</p>
                      
                      {/* Uncleaned Type Breakdown Pills */}
                      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
                        {['Full Room Clean', 'Dusting & Mop', 'Bathroom Sanitise', 'Bedsheet & Towel Change'].map(type => {
                          const count = cleaning.filter(c => !c.done && c.type.toLowerCase().includes(type.toLowerCase().split(' ')[0])).length * mult;
                          return (
                            <span key={type} style={{fontSize:10.5, fontWeight:800, background:'#fecaca', color:'#000', padding:'3px 8px', borderRadius:8, border: '1px solid #e8df9a'}}>
                              {type}: {count}
                            </span>
                          );
                        })}
                      </div>

                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        {cleaning.filter(c => !c.done && matchesType(c)).map(c => (
                          <div key={c.id} style={{background:'#fff1f2', border: '1px solid #e2e8f0', borderRadius:12, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                              <div style={{display:'flex', alignItems:'center', gap:6}}>
                                <span style={{fontSize:14, fontWeight:900, color:'#000'}}>Room {c.room}</span>
                                <Chip label={c.type} color="#78680a" bg="#fefce8"/>
                              </div>
                              <p style={{margin:'2px 0 0', fontSize:11, color:C.muted, fontWeight:700}}>Student: {c.student} · Slot: {c.slot}</p>
                            </div>
                            <Chip label="Pending ⏳" color="#b91c1c" bg="#fee2e2"/>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* DAILY VIEW */
                  <>
                    {/* Current Active Window Banner */}
                    <div style={{background:'#fef08a', borderRadius:14, border: '1px solid #e2e8f0', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow: '0 3px 12px rgba(15,23,42,0.05)'}}>
                      <div>
                        <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', color:'#000'}}>⚡ Current 2-Hour Cleaning Slot</span>
                        <h3 style={{margin:'2px 0 0', fontSize:18, fontWeight:900, color:'#000'}}>11:00 AM – 01:00 PM</h3>
                      </div>
                      <Chip label={`${activeSlots.length} Rooms Active`} color="#000" bg="#fff"/>
                    </div>

                    {/* Stat summary grid */}
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                      <div onClick={()=>setCleanerSlotFilter('active')} style={{background:cleanerSlotFilter==='active'?'#fef08a':'#fff', borderRadius:14, border: '1px solid #e2e8f0', padding:12, textAlign:'center', cursor:'pointer', boxShadow:cleanerSlotFilter==='active'?'3px 3px 0px #000':'none'}}>
                        <p style={{fontSize:24, fontWeight:900, color:'#000', margin:0}}>{activeSlots.length}</p>
                        <p style={{fontSize:11, fontWeight:800, color:'#000', margin:'2px 0 0', textTransform:'uppercase'}}>Active Now</p>
                      </div>

                      <div onClick={()=>setCleanerSlotFilter('upcoming')} style={{background:cleanerSlotFilter==='upcoming'?'#cffafe':'#fff', borderRadius:14, border: '1px solid #e2e8f0', padding:12, textAlign:'center', cursor:'pointer', boxShadow:cleanerSlotFilter==='upcoming'?'3px 3px 0px #000':'none'}}>
                        <p style={{fontSize:24, fontWeight:900, color:'#000', margin:0}}>{upcomingSlots.length}</p>
                        <p style={{fontSize:11, fontWeight:800, color:'#000', margin:'2px 0 0', textTransform:'uppercase'}}>Upcoming</p>
                      </div>

                      <div onClick={()=>setCleanerSlotFilter('completed')} style={{background:cleanerSlotFilter==='completed'?'#bbf7d0':'#fff', borderRadius:14, border: '1px solid #e2e8f0', padding:12, textAlign:'center', cursor:'pointer', boxShadow:cleanerSlotFilter==='completed'?'3px 3px 0px #000':'none'}}>
                        <p style={{fontSize:24, fontWeight:900, color:'#000', margin:0}}>{completedSlots.length}</p>
                        <p style={{fontSize:11, fontWeight:800, color:'#000', margin:'2px 0 0', textTransform:'uppercase'}}>Cleaned</p>
                      </div>
                    </div>

                    {/* Filter Tabs for Slots */}
                    <div style={{display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none'}}>
                      {[
                        {id:'all', label:'All Rooms'},
                        {id:'active', label:'Active Slot (11-1 PM)'},
                        {id:'upcoming', label:'Upcoming Today'},
                        {id:'completed', label:'Cleaned ✓'}
                      ].map(tab => (
                        <button 
                          key={tab.id} 
                          onClick={()=>setCleanerSlotFilter(tab.id)}
                          style={{
                            padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                            background: cleanerSlotFilter === tab.id ? '#000' : '#fff',
                            color: cleanerSlotFilter === tab.id ? '#fff' : '#000',
                            border: '1px solid #e2e8f0',
                            boxShadow: cleanerSlotFilter === tab.id ? '2px 2px 0px #fde047' : 'none'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Room List */}
                    <div style={{background:'#fff', borderRadius:18, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                      <p style={{margin:'0 0 12px', fontSize:15, fontWeight:800, color:'#000'}}>
                        🧹 Cleaning Schedule <span style={{fontSize:12, fontWeight:600, color:C.muted}}>({cleanerDate})</span>
                      </p>

                      <div style={{display:'flex', flexDirection:'column', gap:10}}>
                        {filteredList.map(slot => (
                          <div key={slot.id} style={{background: slot.done ? '#f0fdf4' : slot.slotStatus==='active' ? '#fefce8' : '#fafafa', border: '1px solid #e2e8f0', borderRadius:14, padding:14, boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}}>
                              <div>
                                <div style={{display:'flex', alignItems:'center', gap:6}}>
                                  <span style={{fontSize:16, fontWeight:900, color:'#000'}}>Room {slot.room}</span>
                                  <Chip label={slot.type} color="#78680a" bg="#fefce8"/>
                                </div>
                                <p style={{margin:'4px 0 0', fontSize:12, fontWeight:700, color:C.muted}}>
                                  👤 Student: <b>{slot.student}</b>
                                </p>
                              </div>

                              <span style={{
                                fontSize:11, fontWeight:800, padding:'4px 8px', borderRadius:8, border: '1px solid #e8df9a',
                                background: slot.done ? '#bbf7d0' : slot.slotStatus==='active' ? '#fde047' : '#cffafe',
                                color: '#000'
                              }}>
                                ⏰ {slot.slot}
                              </span>
                            </div>

                            {slot.note && (
                              <div style={{background:'#fff', padding:'6px 10px', borderRadius:8, border: '1px solid #e8df9a', fontSize:11, fontWeight:700, color:'#333', marginBottom:10}}>
                                💬 Note: "{slot.note}"
                              </div>
                            )}

                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:8, borderTop:'1px dashed #000'}}>
                              <a href={`tel:${slot.phone.replace(/\s+/g, '')}`} 
                                style={{padding:'6px 10px', borderRadius:8, border: '1px solid #e2e8f0', background:'#bbf7d0', color:'#000', textDecoration:'none', fontSize:11, fontWeight:800, display:'inline-flex', alignItems:'center', gap:4, boxShadow: '0 2px 6px rgba(120, 104, 10, 0.04)'}}>
                                📞 Call Student
                              </a>

                              {slot.done ? (
                                <Chip label="Cleaned ✅" color="#166534" bg="#dcfce7"/>
                              ) : (
                                <button 
                                  onClick={() => setCleaning(prev => prev.map(c => c.id === slot.id ? {...c, done:true, slotStatus:'completed'} : c))}
                                  style={{padding:'8px 14px', borderRadius:10, border: '1px solid #e2e8f0', background:'#fef08a', color:'#000', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}
                                >
                                  Mark Cleaned ✅
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {filteredList.length === 0 && (
                          <div style={{textAlign:'center', padding:'30px 10px'}}>
                            <span className="material-symbols-outlined" style={{fontSize:32, color:C.muted}}>mop</span>
                            <p style={{fontSize:13, color:C.muted, margin:'8px 0 0', fontWeight:700}}>No rooms scheduled for this filter.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            );
          })()}

          {/* MAINTENANCE */}
          {staffRole === 'Maintenance' && (<>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div style={{background:'#fff',borderRadius:14,border: '1px solid #e2e8f0',padding:14,textAlign:'center'}}>
                <p style={{fontSize:28,fontWeight:900,color:C.danger,margin:0}}>{tickets.filter(t=>t.status==='Open').length}</p>
                <p style={{fontSize:12,color:C.muted,margin:'2px 0 0'}}>Open</p>
              </div>
              <div style={{background:'#fff',borderRadius:14,border: '1px solid #e2e8f0',padding:14,textAlign:'center'}}>
                <p style={{fontSize:28,fontWeight:900,color:C.warn,margin:0}}>{tickets.filter(t=>t.status==='In Progress').length}</p>
                <p style={{fontSize:12,color:C.muted,margin:'2px 0 0'}}>In Progress</p>
              </div>
            </div>
            <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
              <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:C.text}}>🛠️ Repair Tickets</p>
              {tickets.map(t=>(
                <div key={t.id} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius:14,padding:14,marginBottom:10}}>
                  <Row style={{marginBottom:8,alignItems:'flex-start'}}>
                    <div>
                      <div style={{display:'flex',gap:6,marginBottom:4}}>
                        <Chip label={`Room ${t.room}`}/>
                        <Chip label={t.priority} color={t.priority==='High'?C.danger:C.warn} bg={t.priority==='High'?C.dangerBg:C.warnBg}/>
                      </div>
                      <p style={{margin:0,fontSize:14,fontWeight:800,color:C.text}}>{t.issue}</p>
                      <p style={{margin:'3px 0 0',fontSize:11,color:C.muted}}>By {t.student} · {t.date}</p>
                    </div>
                  </Row>
                  {t.status !== 'Resolved' && (
                    <div style={{display:'flex',gap:8}}>
                      {t.status==='Open' && <button onClick={()=>setTickets(p=>p.map(x=>x.id===t.id?{...x,status:'In Progress'}:x))} style={{flex:1,padding:9,background:C.indigoBg,border:`1px solid ${C.indigo}`,borderRadius:10,color:C.indigo,fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>Start Work 🔧</button>}
                      <button onClick={()=>setTickets(p=>p.map(x=>x.id===t.id?{...x,status:'Resolved'}:x))} style={{flex:1,padding:9,background: C.primary,border: '1px solid #e2e8f0',borderRadius:10,color:'#000',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>Mark Resolved ✅</button>
                    </div>
                  )}
                  {t.status==='Resolved' && <Chip label="Resolved ✅" color={C.success} bg={C.successBg}/>}
                </div>
              ))}
            </div>
          </>)}

          {/* PURCHASE MANAGER */}
          {staffRole === 'Purchase Manager' && (<>
            <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
              <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:C.text}}>🛒 Staff Item Requisitions</p>
              {demands.map(d=>(
                <div key={d.id} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius:14,padding:12,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
                  <div style={{flex:1}}>
                    <p style={{margin:0,fontSize:14,fontWeight:800,color:C.text}}>{d.item}</p>
                    <p style={{margin:'3px 0 0',fontSize:11,color:C.muted}}>Qty: {d.qty} · {d.reqBy} · {d.date}</p>
                    <p style={{margin:'2px 0 0',fontSize:11,color:C.muted}}>Vendor: {d.vendor}</p>
                  </div>
                  {d.status==='Pending'
                    ? <button onClick={()=>setDemands(p=>p.map(x=>x.id===d.id?{...x,status:'PO Sent'}:x))} style={{padding:'8px 12px',background:meta.accentBg,border:`1.5px solid ${meta.accent}`,borderRadius:10,color:meta.accent,fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Create PO 📦</button>
                    : <Chip label="PO Sent ✓" color={C.success} bg={C.successBg}/>
                  }
                </div>
              ))}
            </div>
          </>)}

          {/* SECURITY */}
          {staffRole === 'Security Guard' && (<>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <button onClick={()=>setShowVisitor(true)} style={{padding:14,background:meta.grad,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontWeight:800,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                <span className="material-symbols-outlined" style={{fontSize:18}}>person_add</span>Log Visitor
              </button>
              <button onClick={()=>setShowParcel(true)} style={{padding:14,background: C.primary,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontWeight:800,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                <span className="material-symbols-outlined" style={{fontSize:18}}>package_2</span>Log Parcel
              </button>
            </div>
            <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
              <Row style={{marginBottom:12}}><p style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>🛡️ Gate Entry Log</p><Chip label={`${visitors.filter(v=>v.status==='Inside').length} Inside`} color={C.success} bg={C.successBg}/></Row>
              {visitors.map(v=>(
                <div key={v.id} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius:14,padding:12,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:14,fontWeight:800,color:C.text}}>{v.name}</span><span style={{width:6,height:6,borderRadius:'50%',background:v.status==='Inside'?C.success:'#94a3b8',display:'inline-block'}}/></div>
                    <p style={{margin:'3px 0 0',fontSize:11,color:C.muted}}>{v.purpose} · In: {v.inTime}{v.outTime?` | Out: ${v.outTime}`:''}</p>
                  </div>
                  {v.status==='Inside' && <button onClick={()=>setVisitors(p=>p.map(x=>x.id===v.id?{...x,outTime:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),status:'Exited'}:x))} style={{padding:'7px 10px',background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:10,color:C.danger,fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Exit 🚪</button>}
                </div>
              ))}
            </div>
            <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
              <Row style={{marginBottom:12}}><p style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>📦 Courier Parcels</p><Chip label={`${parcels.filter(p=>p.status==='Pending').length} unclaimed`} color={C.warn} bg={C.warnBg}/></Row>
              {parcels.map(p=>(
                <div key={p.id} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius:14,padding:12,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
                  <div style={{flex:1}}>
                    <p style={{margin:0,fontSize:13,fontWeight:800,color:C.text}}>{p.student} · <span style={{color:C.primary}}>Rm {p.room}</span></p>
                    <p style={{margin:'3px 0 0',fontSize:11,color:C.muted}}>{p.carrier} · {p.tracking} · {p.date}</p>
                  </div>
                  <button onClick={()=>setParcels(prev=>prev.map(x=>x.id===p.id?{...x,status:x.status==='Pending'?'Claimed':'Pending'}:x))} style={{padding:'7px 10px',background:p.status==='Claimed'?C.successBg:meta.accentBg,border:`1px solid ${p.status==='Claimed'?C.success:meta.accent}`,borderRadius:10,color:p.status==='Claimed'?C.success:meta.accent,fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                    {p.status==='Claimed'?'Claimed ✅':'Hand Over'}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={()=>alert('🚨 EMERGENCY ALERT sent to Admin & Security!')} style={{width:'100%',padding:16,background: C.primary,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:15,fontWeight:900,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow: '0 4px 16px rgba(15,23,42,0.05)',fontFamily:'inherit'}}>
              <span className="material-symbols-outlined" style={{fontSize:22}}>warning</span>EMERGENCY SOS ALERT 🚨
            </button>
          </>)}

          {/* HELPER / OTHERS TASK DASHBOARD */}
          {(staffRole === 'Helper' || staffRole === 'Others') && (<>
            {/* Availability Toggle */}
            <div style={{background: isAvailable ? '#dcfce7' : '#fee2e2', borderRadius:16, border: `1px solid ${isAvailable ? '#86efac' : '#fca5a5'}`, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 12px rgba(15,23,42,0.05)'}}>
              <div>
                <p style={{margin:0, fontSize:13, fontWeight:900, color: isAvailable ? '#166534' : '#991b1b'}}>
                  {isAvailable ? '✅ You are Available' : '🔴 Marked Unavailable'}
                </p>
                <p style={{margin:'2px 0 0', fontSize:11, fontWeight:700, color: isAvailable ? '#15803d' : '#b91c1c'}}>
                  {isAvailable ? 'Admin can assign you tasks' : 'Toggle to go back on duty'}
                </p>
              </div>
              <button onClick={()=>setIsAvailable(p=>!p)} style={{padding:'8px 16px', borderRadius:10, border:'none', background: isAvailable ? '#16a34a' : '#dc2626', color:'#fff', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                {isAvailable ? 'Go Off Duty' : 'Go On Duty'}
              </button>
            </div>

            {/* Task List */}
            <div style={{background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:16, boxShadow:'0 4px 16px rgba(15,23,42,0.05)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
                <div>
                  <p style={{margin:0, fontSize:15, fontWeight:900, color:C.text}}>📋 My Tasks Today</p>
                  <p style={{margin:'2px 0 0', fontSize:11, color:C.muted}}>{tasks.filter(t=>t.status==='Pending').length} pending · {tasks.filter(t=>t.status==='Done').length} done</p>
                </div>
                <div style={{display:'flex', gap:4}}>
                  <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:20, background:'#fef3c7', color:'#92400e'}}>{tasks.filter(t=>t.priority==='High').length} High</span>
                </div>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {tasks.map(t => (
                  <div key={t.id} style={{background: t.status==='Done' ? '#f0fdf4' : '#fafafa', border: `1px solid ${t.status==='Done' ? '#bbf7d0' : '#e2e8f0'}`, borderRadius:12, padding:14, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                        <span style={{fontSize:13, fontWeight:900, color: t.status==='Done' ? '#15803d' : C.text, textDecoration: t.status==='Done' ? 'line-through' : 'none'}}>{t.title}</span>
                      </div>
                      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                        <Chip label={t.priority} color={t.priority==='High'?'#991b1b':'#475569'} bg={t.priority==='High'?'#fee2e2':'#f1f5f9'}/>
                        <Chip label={`⏰ ${t.time}`} color="#475569" bg="#f1f5f9"/>
                        <Chip label={`📍 ${t.room}`} color="#475569" bg="#f1f5f9"/>
                      </div>
                      <p style={{margin:'4px 0 0', fontSize:11, color:C.muted}}>Assigned by: {t.assignedBy}</p>
                    </div>
                    <button onClick={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,status:x.status==='Done'?'Pending':'Done'}:x))} style={{padding:'8px 12px', borderRadius:10, border:'none', background: t.status==='Done' ? '#dcfce7' : meta.accentBg, color: t.status==='Done' ? '#166534' : meta.accent, fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', minWidth:60}}>
                      {t.status==='Done' ? '↩ Undo' : '✓ Done'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {/* PLUMBER WORK QUEUE */}
          {staffRole === 'Plumber' && (<>
            <div style={{background:'linear-gradient(135deg,#d97706,#fbbf24)', borderRadius:16, padding:'14px 16px', color:'#fff', boxShadow:'0 8px 20px rgba(217,119,6,0.2)'}}>
              <p style={{margin:0, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#bfdbfe'}}>🔧 Plumbing & Water Systems</p>
              <h3 style={{margin:'4px 0 2px', fontSize:20, fontWeight:900}}>Job Work Queue</h3>
              <p style={{margin:0, fontSize:12, color:'#bfdbfe', fontWeight:700}}>{plumbingJobs.filter(j=>j.status==='Open').length} open · {plumbingJobs.filter(j=>j.status==='In Progress').length} in progress · {plumbingJobs.filter(j=>j.priority==='High').length} urgent</p>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {plumbingJobs.map(j => (
                <div key={j.id} style={{background:'#fff', border:`1px solid ${j.priority==='High' ? '#fca5a5' : '#e2e8f0'}`, borderRadius:14, padding:16, boxShadow:'0 4px 14px rgba(15,23,42,0.04)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                        <span style={{fontSize:14, fontWeight:900, color:C.primary}}>Room {j.room}</span>
                        <span style={{fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:20, background: j.priority==='High'?'#fee2e2':'#f1f5f9', color: j.priority==='High'?'#b91c1c':'#475569'}}>{j.priority}</span>
                      </div>
                      <p style={{margin:0, fontSize:13, fontWeight:800, color:C.text}}>{j.issue}</p>
                      <p style={{margin:'3px 0 0', fontSize:11, color:C.muted}}>👤 {j.student} · 🕐 {j.date}</p>
                      {j.note && <p style={{margin:'4px 0 0', fontSize:11, color:'#7c3aed', fontWeight:700, background:'#f5f3ff', padding:'4px 8px', borderRadius:6}}>📝 {j.note}</p>}
                    </div>
                    <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:20, background: j.status==='Resolved'?'#dcfce7':j.status==='In Progress'?'#fef3c7':'#eff6ff', color: j.status==='Resolved'?'#166534':j.status==='In Progress'?'#92400e':'#1d4ed8'}}>{j.status}</span>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    {j.status !== 'Resolved' && (
                      <button onClick={()=>setPlumbingJobs(prev=>prev.map(x=>x.id===j.id?{...x,status:x.status==='Open'?'In Progress':'Resolved'}:x))} style={{flex:1, padding:'8px 0', borderRadius:10, border:'none', background: j.status==='Open'?'#eff6ff':'#dcfce7', color: j.status==='Open'?'#1d4ed8':'#166534', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                        {j.status==='Open' ? '▶ Start Job' : '✓ Mark Resolved'}
                      </button>
                    )}
                    <a href={`tel:${INIT_VISITORS[0]?.phone || '+91 9800000000'}`} style={{padding:'8px 14px', borderRadius:10, background:'#f0fdf4', border:'1px solid #86efac', color:'#166534', fontSize:12, fontWeight:800, textDecoration:'none'}}>
                      📞 Call Student
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* ELECTRICIAN WORK QUEUE */}
          {staffRole === 'Electrician' && (<>
            <div style={{background:'linear-gradient(135deg,#ca8a04,#facc15)', borderRadius:16, padding:'14px 16px', color:'#000', boxShadow:'0 8px 20px rgba(202,138,4,0.2)'}}>
              <p style={{margin:0, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#713f12'}}>⚡ Electrical & Wiring</p>
              <h3 style={{margin:'4px 0 2px', fontSize:20, fontWeight:900, color:'#000'}}>Job Work Queue</h3>
              <p style={{margin:0, fontSize:12, color:'#713f12', fontWeight:700}}>{electricalJobs.filter(j=>j.status==='Open').length} open · {electricalJobs.filter(j=>j.priority==='High').length} high voltage danger</p>
            </div>

            {/* Safety Banner for High Priority */}
            {electricalJobs.some(j=>j.priority==='High' && j.status!=='Resolved') && (
              <div style={{background:'#fff1f2', border:'1px solid #fca5a5', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10}}>
                <span className="material-symbols-outlined" style={{fontSize:20, color:'#dc2626'}}>warning</span>
                <p style={{margin:0, fontSize:12, fontWeight:800, color:'#991b1b'}}>⚠️ High voltage / sparking issue reported — use PPE before starting work!</p>
              </div>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {electricalJobs.map(j => (
                <div key={j.id} style={{background:'#fff', border:`1px solid ${j.priority==='High' ? '#fde047' : '#e2e8f0'}`, borderRadius:14, padding:16, boxShadow:'0 4px 14px rgba(15,23,42,0.04)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                        <span style={{fontSize:14, fontWeight:900, color:C.primary}}>Room {j.room}</span>
                        <span style={{fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:20, background: j.priority==='High'?'#fef9c3':'#f1f5f9', color: j.priority==='High'?'#713f12':'#475569'}}>{j.priority}</span>
                      </div>
                      <p style={{margin:0, fontSize:13, fontWeight:800, color:C.text}}>{j.issue}</p>
                      <p style={{margin:'3px 0 0', fontSize:11, color:C.muted}}>👤 {j.student} · 🕐 {j.date}</p>
                      {j.note && <p style={{margin:'4px 0 0', fontSize:11, color:'#92400e', fontWeight:700, background:'#fef3c7', padding:'4px 8px', borderRadius:6}}>📝 {j.note}</p>}
                    </div>
                    <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:20, background: j.status==='Resolved'?'#dcfce7':j.status==='In Progress'?'#fef3c7':'#fefce8', color: j.status==='Resolved'?'#166534':j.status==='In Progress'?'#92400e':'#713f12'}}>{j.status}</span>
                  </div>
                  {j.status !== 'Resolved' && (
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={()=>setElectricalJobs(prev=>prev.map(x=>x.id===j.id?{...x,status:x.status==='Open'?'In Progress':'Resolved'}:x))} style={{flex:1, padding:'8px 0', borderRadius:10, border:'none', background: j.status==='Open'?'#fefce8':'#dcfce7', color: j.status==='Open'?'#713f12':'#166534', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                        {j.status==='Open' ? '▶ Start Job' : '✓ Mark Resolved'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>)}

          {/* CARPENTER WORK QUEUE */}
          {staffRole === 'Carpenter' && (<>
            <div style={{background:'linear-gradient(135deg,#78350f,#d97706)', borderRadius:16, padding:'14px 16px', color:'#fff', boxShadow:'0 8px 20px rgba(120,53,15,0.2)'}}>
              <p style={{margin:0, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#fde68a'}}>🪚 Carpentry & Fixtures</p>
              <h3 style={{margin:'4px 0 2px', fontSize:20, fontWeight:900}}>Job Work Queue</h3>
              <p style={{margin:0, fontSize:12, color:'#fef3c7', fontWeight:700}}>{carpenterJobs.filter(j=>j.status==='Open').length} open jobs · {carpenterJobs.filter(j=>j.priority==='High').length} urgent</p>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {carpenterJobs.map(j => (
                <div key={j.id} style={{background:'#fff', border:`1px solid ${j.priority==='High' ? '#fde68a' : '#e2e8f0'}`, borderRadius:14, padding:16, boxShadow:'0 4px 14px rgba(15,23,42,0.04)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                        <span style={{fontSize:14, fontWeight:900, color:C.primary}}>Room {j.room}</span>
                        <span style={{fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:20, background: j.priority==='High'?'#fef3c7':'#f1f5f9', color: j.priority==='High'?'#92400e':'#475569'}}>{j.priority}</span>
                      </div>
                      <p style={{margin:0, fontSize:13, fontWeight:800, color:C.text}}>{j.issue}</p>
                      <p style={{margin:'3px 0 0', fontSize:11, color:C.muted}}>👤 {j.student} · 🕐 {j.date}</p>
                      {j.note && <p style={{margin:'4px 0 0', fontSize:11, color:'#78350f', fontWeight:700, background:'#fef3c7', padding:'4px 8px', borderRadius:6}}>📝 {j.note}</p>}
                    </div>
                    <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:20, background: j.status==='Resolved'?'#dcfce7':j.status==='In Progress'?'#fef3c7':'#fefce8', color: j.status==='Resolved'?'#166534':j.status==='In Progress'?'#92400e':'#78350f'}}>{j.status}</span>
                  </div>
                  {j.status !== 'Resolved' && (
                    <button onClick={()=>setCarpenterJobs(prev=>prev.map(x=>x.id===j.id?{...x,status:x.status==='Open'?'In Progress':'Resolved'}:x))} style={{width:'100%', padding:'9px 0', borderRadius:10, border:'none', background: j.status==='Open'?'#fef3c7':'#dcfce7', color: j.status==='Open'?'#78350f':'#166534', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                      {j.status==='Open' ? '▶ Start Job' : '✓ Mark Resolved'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Material Request */}
            <button onClick={()=>setShowDemand(true)} style={{width:'100%', padding:14, background:'#fef3c7', border:'1px solid #fde68a', borderRadius:14, fontSize:13, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#78350f', fontFamily:'inherit', boxShadow:'0 3px 10px rgba(120,53,15,0.1)'}}>
              <span className="material-symbols-outlined" style={{fontSize:18}}>add_shopping_cart</span>
              Request Materials / Tools
            </button>
          </>)}

          {/* SALES MANAGER DASHBOARD */}
          {staffRole === 'Sales Manager' && (<>
            {/* Tab nav */}
            <div style={{display:'flex', background:'#fff', borderRadius:12, padding:4, border:'1px solid #e2e8f0', boxShadow:'0 2px 8px rgba(15,23,42,0.04)'}}>
              <button onClick={()=>setSalesTab('leads')} style={{flex:1, padding:'10px 0', borderRadius:10, border:'none', background: salesTab==='leads' ? '#fde047' : 'transparent', color: salesTab==='leads' ? '#78350f' : C.muted, fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                📞 Leads ({enquiries.length})
              </button>
              <button onClick={()=>setSalesTab('rooms')} style={{flex:1, padding:'10px 0', borderRadius:10, border:'none', background: salesTab==='rooms' ? '#fef3c7' : 'transparent', color: salesTab==='rooms' ? '#92400e' : C.muted, fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                🛏 Rooms ({rooms.length})
              </button>
            </div>

            {/* LEADS TAB */}
            {salesTab === 'leads' && (<>
              {/* Pipeline summary */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                {[
                  {l:'New', v:enquiries.filter(e=>e.status.includes('New')).length, bg:'#fee2e2', c:'#b91c1c'},
                  {l:'Contacted', v:enquiries.filter(e=>e.status.includes('Contacted')).length, bg:'#fef3c7', c:'#92400e'},
                  {l:'Converted', v:enquiries.filter(e=>e.status.includes('Closed')).length, bg:'#dcfce7', c:'#166534'},
                ].map(s => (
                  <div key={s.l} style={{background:s.bg, borderRadius:14, border:'1px solid #e2e8f0', padding:12, textAlign:'center', boxShadow:'0 2px 8px rgba(15,23,42,0.04)'}}>
                    <p style={{fontSize:26, fontWeight:900, margin:0, color:s.c}}>{s.v}</p>
                    <p style={{fontSize:11, fontWeight:800, margin:'2px 0 0', color:s.c, textTransform:'uppercase'}}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Lead cards */}
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {enquiries.map(e => (
                  <div key={e.id} style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:14, boxShadow:'0 4px 14px rgba(15,23,42,0.04)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                      <div>
                        <h4 style={{margin:0, fontSize:15, fontWeight:900, color:C.text}}>{e.name}</h4>
                        <p style={{margin:'2px 0 0', fontSize:12, color:C.muted}}>{e.phone}</p>
                      </div>
                      <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:20, background: e.status.includes('Closed')?'#dcfce7':e.status.includes('Contacted')?'#fef3c7':'#fee2e2', color: e.status.includes('Closed')?'#166534':e.status.includes('Contacted')?'#92400e':'#b91c1c'}}>{e.status}</span>
                    </div>
                    <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:8}}>
                      <Chip label={e.requirement} color="#4338ca" bg="#fefce8"/>
                      <Chip label={e.budget} color="#166534" bg="#dcfce7"/>
                      <Chip label={e.source} color="#475569" bg="#f1f5f9"/>
                    </div>
                    <p style={{margin:'0 0 10px', fontSize:12, color:'#334155', background:'#f8fafc', padding:'8px 10px', borderRadius:8, border:'1px solid #e2e8f0'}}>"{e.text}"</p>
                    <div style={{display:'flex', gap:8}}>
                      <a href={`tel:${e.phone}`} style={{flex:1, textAlign:'center', padding:'9px 0', background:'#dcfce7', border:'1px solid #86efac', borderRadius:10, color:'#166534', fontSize:12, fontWeight:800, textDecoration:'none'}}>
                        📞 Call
                      </a>
                      <button onClick={()=>setEnquiries(prev=>prev.map(x=>x.id===e.id?{...x,status:x.status.includes('Contacted')?'Closed 🟢':'Contacted 🟡'}:x))} style={{flex:2, padding:'9px 0', background:'#fefce8', border:'1px solid #fcd34d', borderRadius:10, color:'#78350f', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                        {e.status.includes('Contacted') ? '✓ Mark Converted' : '📲 Mark Contacted'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>)}

            {/* ROOMS TAB */}
            {salesTab === 'rooms' && (<>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:4}}>
                <div style={{background:'#dcfce7', borderRadius:14, border:'1px solid #86efac', padding:14, textAlign:'center'}}>
                  <p style={{fontSize:26, fontWeight:900, margin:0, color:'#166534'}}>{rooms.filter(r=>r.status==='Occupied').length}</p>
                  <p style={{fontSize:11, fontWeight:800, margin:'2px 0 0', color:'#166534', textTransform:'uppercase'}}>Occupied</p>
                </div>
                <div style={{background:'#fef3c7', borderRadius:14, border:'1px solid #fde68a', padding:14, textAlign:'center'}}>
                  <p style={{fontSize:26, fontWeight:900, margin:0, color:'#92400e'}}>{rooms.filter(r=>r.status==='Vacant').length}</p>
                  <p style={{fontSize:11, fontWeight:800, margin:'2px 0 0', color:'#92400e', textTransform:'uppercase'}}>Vacant — Available</p>
                </div>
              </div>

              {rooms.map(r => (
                <div key={r.id} style={{background:'#fff', border:`1px solid ${r.status==='Vacant'?'#fde68a':'#e2e8f0'}`, borderRadius:14, padding:14, display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 3px 10px rgba(15,23,42,0.04)'}}>
                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                      <span style={{fontSize:15, fontWeight:900, color:C.text}}>Room {r.number}</span>
                      <Chip label={r.type} color="#4338ca" bg="#fefce8"/>
                      <span style={{fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:20, background: r.status==='Vacant'?'#fef3c7':'#dcfce7', color: r.status==='Vacant'?'#92400e':'#166534'}}>{r.status}</span>
                    </div>
                    <p style={{margin:0, fontSize:11, color:C.muted}}>{r.status==='Occupied'?r.student:'Available now'} · Rent: {r.rent}</p>
                  </div>
                  {r.status === 'Vacant' && (
                    <button style={{padding:'8px 12px', borderRadius:10, border:'none', background:'#fef3c7', color:'#92400e', fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                      Share
                    </button>
                  )}
                </div>
              ))}
            </>)}
          </>)}

          {/* MANAGER OPERATIONS OVERVIEW */}
          {staffRole === 'Manager' && (<>
            {/* Command Center Header */}
            <div style={{background:'linear-gradient(135deg,#92400e,#d97706)', borderRadius:16, padding:'14px 16px', color:'#fff', boxShadow:'0 8px 20px rgba(146,64,14,0.18)'}}>
              <p style={{margin:0, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#fef3c7'}}>🏢 Command Center</p>
              <h3 style={{margin:'4px 0 2px', fontSize:20, fontWeight:900}}>Operations Overview</h3>
              <p style={{margin:0, fontSize:12, color:'#fde68a', fontWeight:700}}>Febebo PG — All departments</p>
            </div>

            {/* Department KPI Grid */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              {[
                {label:'Staff On Duty', value:'12 / 15', icon:'groups', bg:'#eef2ff', color:'#78350f', sub:'3 on leave'},
                {label:'Open Tickets', value: String(tickets.filter(t=>t.status!=='Resolved').length + plumbingJobs.filter(j=>j.status==='Open').length + electricalJobs.filter(j=>j.status==='Open').length + carpenterJobs.filter(j=>j.status==='Open').length), icon:'confirmation_number', bg:'#fee2e2', color:'#b91c1c', sub:'Across all depts'},
                {label:'Vacant Rooms', value: String(rooms.filter(r=>r.status==='Vacant').length), icon:'meeting_room', bg:'#fef3c7', color:'#92400e', sub:'Fill immediately'},
                {label:'Pending POs', value: String(demands.filter(d=>d.status==='Pending').length), icon:'pending_actions', bg:'#f0fdf4', color:'#166534', sub:'Supplier action needed'},
                {label:'New Leads', value: String(enquiries.filter(e=>e.status.includes('New')).length), icon:'contact_phone', bg:'#ecfdf5', color:'#065f46', sub:'Room enquiries'},
                {label:'Mess Covers', value:'28 / 30', icon:'restaurant', bg:'#ede9fe', color:'#7c3aed', sub:'Today lunch'},
              ].map(k => (
                <div key={k.label} style={{background:k.bg, borderRadius:14, border:'1px solid #e2e8f0', padding:14, boxShadow:'0 3px 10px rgba(15,23,42,0.04)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <p style={{fontSize:11, fontWeight:800, color:k.color, margin:0, textTransform:'uppercase', letterSpacing:0.3}}>{k.label}</p>
                      <p style={{fontSize:24, fontWeight:900, color:k.color, margin:'4px 0 2px'}}>{k.value}</p>
                      <p style={{fontSize:10, fontWeight:700, color:k.color, margin:0, opacity:0.7}}>{k.sub}</p>
                    </div>
                    <span className="material-symbols-outlined" style={{fontSize:22, color:k.color, opacity:0.5}}>{k.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Open Issues Summary by Department */}
            <div style={{background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:16, boxShadow:'0 4px 16px rgba(15,23,42,0.05)'}}>
              <p style={{margin:'0 0 12px', fontSize:14, fontWeight:900, color:C.text}}>🔎 Open Issues by Department</p>
              {[
                {dept:'Maintenance', count: tickets.filter(t=>t.status!=='Resolved').length, icon:'build', high: tickets.filter(t=>t.priority==='High'&&t.status!=='Resolved').length, color:'#fda4af', bg:'#fff1f2'},
                {dept:'Plumbing', count: plumbingJobs.filter(j=>j.status==='Open').length, icon:'plumbing', high: plumbingJobs.filter(j=>j.priority==='High'&&j.status==='Open').length, color:'#60a5fa', bg:'#eff6ff'},
                {dept:'Electrical', count: electricalJobs.filter(j=>j.status==='Open').length, icon:'bolt', high: electricalJobs.filter(j=>j.priority==='High'&&j.status==='Open').length, color:'#facc15', bg:'#fefce8'},
                {dept:'Carpentry', count: carpenterJobs.filter(j=>j.status==='Open').length, icon:'carpenter', high: carpenterJobs.filter(j=>j.priority==='High'&&j.status==='Open').length, color:'#d97706', bg:'#fef3c7'},
              ].map(d => (
                <div key={d.dept} style={{background:d.bg, border:`1px solid ${d.color}40`, borderRadius:12, padding:'10px 14px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span className="material-symbols-outlined" style={{fontSize:18, color:d.color}}>{d.icon}</span>
                    <div>
                      <p style={{margin:0, fontSize:13, fontWeight:800, color:C.text}}>{d.dept}</p>
                      {d.high > 0 && <p style={{margin:0, fontSize:11, color:'#b91c1c', fontWeight:700}}>{d.high} High Priority ⚠️</p>}
                    </div>
                  </div>
                  <span style={{fontSize:20, fontWeight:900, color:d.count>0?'#b91c1c':'#166534'}}>{d.count}</span>
                </div>
              ))}
            </div>

            {/* Attendance Quick View */}
            <div style={{background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:16, boxShadow:'0 4px 16px rgba(15,23,42,0.05)'}}>
              <p style={{margin:'0 0 12px', fontSize:14, fontWeight:900, color:C.text}}>👥 Staff On Duty Today</p>
              {['Cook (2)', 'Cleaner (3)', 'Maintenance (2)', 'Security (2)', 'Helper (3)'].map(s => (
                <div key={s} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f1f5f9'}}>
                  <span style={{fontSize:13, fontWeight:700, color:C.text}}>{s}</span>
                  <Chip label="On Duty ✅" color="#166534" bg="#dcfce7"/>
                </div>
              ))}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0'}}>
                <span style={{fontSize:13, fontWeight:700, color:C.text}}>HR (1)</span>
                <Chip label="On Leave" color="#b91c1c" bg="#fee2e2"/>
              </div>
            </div>
          </>)}

          {/* HR DASHBOARD - HIRING & ENQUIRIES */}
          {staffRole === 'HR' && (<>
            {/* HR Navigation Tabs */}
            <div style={{display:'flex', background:'#fff', borderRadius:12, padding:4, border: '1px solid #e2e8f0', boxShadow: '0 3px 12px rgba(15,23,42,0.05)'}}>
              <button 
                onClick={()=>setHrTab('hiring')} 
                style={{
                  flex:1, padding:'10px 0', borderRadius:10, border: hrTab==='hiring'?'2px solid #000':'2px solid transparent',
                  background: hrTab==='hiring' ? '#fde047' : 'transparent', color: '#000', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'
                }}
              >
                👥 Hiring & Candidates ({candidates.length})
              </button>
              <button 
                onClick={()=>setHrTab('enquiries')} 
                style={{
                  flex:1, padding:'10px 0', borderRadius:10, border: hrTab==='enquiries'?'2px solid #000':'2px solid transparent',
                  background: hrTab==='enquiries' ? '#fde047' : 'transparent', color: '#000', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'
                }}
              >
                📋 Room Enquiries ({enquiries.length})
              </button>
            </div>

            {/* HIRING TAB */}
            {hrTab === 'hiring' && (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                {/* Hiring Stat Header */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                  <div style={{background:'#fef08a', borderRadius:14, border: '1px solid #e2e8f0', padding:14, textAlign:'center', boxShadow: '0 3px 12px rgba(15,23,42,0.05)'}}>
                    <p style={{fontSize:24, fontWeight:900, margin:0, color:'#000'}}>{candidates.filter(c=>c.status!=='Hired ✅').length}</p>
                    <p style={{fontSize:11, fontWeight:800, margin:'2px 0 0', textTransform:'uppercase', color:'#000'}}>Active Candidates</p>
                  </div>
                  <div style={{background:'#bbf7d0', borderRadius:14, border: '1px solid #e2e8f0', padding:14, textAlign:'center', boxShadow: '0 3px 12px rgba(15,23,42,0.05)'}}>
                    <p style={{fontSize:24, fontWeight:900, margin:0, color:'#000'}}>{candidates.filter(c=>c.status==='Hired ✅').length}</p>
                    <p style={{fontSize:11, fontWeight:800, margin:'2px 0 0', textTransform:'uppercase', color:'#000'}}>Staff Hired</p>
                  </div>
                </div>

                {/* Candidate Action Card List */}
                <div style={{background:'#fff', borderRadius:16, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                    <p style={{margin:0, fontSize:15, fontWeight:900, color:'#000'}}>👔 Candidate Recruitment Pipeline</p>
                    <button 
                      onClick={()=>{
                        const name = prompt('Candidate Name:');
                        const pos = prompt('Applied Position (e.g. Cook, Cleaner, Security):');
                        if (name && pos) {
                          setCandidates(prev => [{id:Date.now(), name, position:pos, experience:'1 Yr', phone:'+91 9800000000', status:'Applied', date:'Just Now', note:'New Applicant'}, ...prev]);
                        }
                      }}
                      style={{padding:'6px 10px', background:'#fef08a', border: '1px solid #e2e8f0', borderRadius:8, fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}
                    >
                      + Add Candidate
                    </button>
                  </div>

                  <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    {candidates.map(c => (
                      <div key={c.id} style={{background:'#fafafa', border: '1px solid #e2e8f0', borderRadius:12, padding:14, boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                          <div>
                            <span style={{fontSize:15, fontWeight:900, color:'#000'}}>{c.name}</span>
                            <div style={{display:'flex', gap:6, marginTop:4}}>
                              <Chip label={c.position} color="#78680a" bg="#fefce8"/>
                              <Chip label={c.experience} color="#0891b2" bg="#ecfeff"/>
                            </div>
                          </div>
                          <span style={{fontSize:11, fontWeight:800, padding:'3px 8px', borderRadius:8, border: '1px solid #e8df9a', background: c.status==='Hired ✅'?'#bbf7d0':'#fef08a', color:'#000'}}>
                            {c.status}
                          </span>
                        </div>

                        {c.note && (
                          <p style={{margin:'8px 0 0', fontSize:11, fontWeight:700, color:'#444'}}>💬 {c.note}</p>
                        )}

                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12, paddingTop:8, borderTop:'1px dashed #000'}}>
                          <a href={`tel:${c.phone}`} style={{padding:'6px 10px', borderRadius:8, border: '1px solid #e2e8f0', background:'#bbf7d0', color:'#000', textDecoration:'none', fontSize:11, fontWeight:800, boxShadow: '0 2px 6px rgba(120, 104, 10, 0.04)'}}>
                            📞 Call Applicant
                          </a>

                          {c.status !== 'Hired ✅' && (
                            <button 
                              onClick={() => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, status:'Hired ✅'} : x))}
                              style={{padding:'7px 12px', background:'#fef08a', border: '1px solid #e2e8f0', borderRadius:8, color:'#000', fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}
                            >
                              Hire Staff ✅
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ROOM ENQUIRIES TAB */}
            {hrTab === 'enquiries' && (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                {/* Enquiries Header Stats - Minimalist Blended Header */}
                <div style={{background:'#fefce8', borderRadius:16, border: '1px solid #fcd34d', padding:'16px', color:'#0f172a', boxShadow: '0 4px 16px rgba(202,138,4,0.1)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <p style={{margin:0, fontSize:11, fontWeight:800, textTransform:'uppercase', color:'#92400e', letterSpacing:0.5}}>🏠 Room Enquiries & Leads</p>
                      <h3 style={{margin:'2px 0 0', fontSize:19, fontWeight:900, color:'#0f172a'}}>Tenant Leads Management</h3>
                    </div>
                    <Chip label={`${enquiries.length} Active Leads`} color="#92400e" bg="#fffde7"/>
                  </div>
                </div>

                {/* Enquiries List */}
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                  {enquiries.map(e => (
                    <div key={e.id} style={{background:'#fff', border: '1px solid #e2e8f0', borderRadius:16, padding:16, boxShadow: '0 4px 14px rgba(15,23,42,0.04)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                        <div>
                          <h4 style={{margin:0, fontSize:15, fontWeight:900, color:'#0f172a'}}>{e.name}</h4>
                          <p style={{margin:'2px 0 0', fontSize:12, fontWeight:700, color:C.muted}}>{e.phone}</p>
                        </div>
                        <span style={{
                          fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:20,
                          background: e.status.includes('Closed')?'#dcfce7':e.status.includes('Contacted')?'#fef3c7':'#fee2e2',
                          color: e.status.includes('Closed')?'#15803d':e.status.includes('Contacted')?'#b45309':'#b91c1c',
                          border: `1px solid ${e.status.includes('Closed')?'#86efac':e.status.includes('Contacted')?'#fde68a':'#fca5a5'}`
                        }}>
                          {e.status}
                        </span>
                      </div>

                      <div style={{display:'flex', gap:6, margin:'6px 0'}}>
                        <Chip label={e.requirement} color="#0891b2" bg="#ecfeff"/>
                        <Chip label={`Budget: ${e.budget}`} color="#78680a" bg="#fefce8"/>
                        <Chip label={e.source} color="#78680a" bg="#fefce8"/>
                      </div>

                      <p style={{margin:'6px 0 10px', fontSize:12, fontWeight:700, color:'#333', background:'#f8fafc', padding:'8px 10px', borderRadius:8, border: '1px solid #e8df9a'}}>
                        "{e.text}"
                      </p>

                      <div style={{display:'flex', gap:8, marginTop:8}}>
                        <a href={`tel:${e.phone}`} style={{flex:1, textAlign:'center', padding:'8px 0', background:'#bbf7d0', border: '1px solid #e2e8f0', borderRadius:8, color:'#000', fontSize:11, fontWeight:800, textDecoration:'none', boxShadow: '0 2px 6px rgba(120, 104, 10, 0.04)'}}>
                          📞 Call Lead
                        </a>
                        <button 
                          onClick={()=>setEnquiries(prev=>prev.map(x=>x.id===e.id?{...x, status: x.status.includes('Contacted')?'Closed 🟢':'Contacted 🟡'}:x))}
                          style={{flex:1, padding:'8px 0', background:'#fef08a', border: '1px solid #e2e8f0', borderRadius:8, color:'#000', fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 6px rgba(120, 104, 10, 0.04)'}}
                        >
                          {e.status.includes('Contacted') ? 'Mark Closed 🟢' : 'Mark Contacted 🟡'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>)}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ATTENDANCE
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'inout' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:14}}>
          {/* Shift Timer */}
          <div style={{background: C.primary, borderRadius:18, border: '1px solid #e2e8f0', padding:'20px 18px', color:'#000', boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            <p style={{margin:0, fontSize:11, fontWeight:800, textTransform:'uppercase', color:'#000', letterSpacing:.5}}>Today's Shift Timer</p>
            <h2 style={{margin:'6px 0 2px', fontSize:36, fontWeight:900, letterSpacing:-1, color:'#000'}}>{clocked?'07 : 45 : 12':'00 : 00 : 00'}</h2>
            <p style={{margin:'0 0 14px', fontSize:12, fontWeight:700, color:'#333'}}>{clocked?`Punched IN at ${clockIn}`:'Not currently punched in'}</p>
            <button onClick={punch} style={{padding:'10px 20px', background:'#fff', border: '1px solid #e2e8f0', borderRadius: 10, color:'#000', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
              {clocked?'⏹ Punch Out Now':'▶ Punch In'}
            </button>
          </div>

          {/* Stats Row */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
            {[
              {l:'Present', v:20, bg:'#bbf7d0'},
              {l:'Absent', v:2, bg:'#fecaca'},
              {l:'Leave', v:1, bg:'#fef08a'}
            ].map(s=>(
              <div key={s.l} style={{background:s.bg, borderRadius:14, border: '1px solid #e2e8f0', padding:14, textAlign:'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                <p style={{fontSize:26, fontWeight:900, color:'#000', margin:0}}>{s.v}</p>
                <p style={{fontSize:11, fontWeight:800, color:'#000', margin:'4px 0 0', textTransform:'uppercase'}}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Punch Log */}
          <div style={{background:'#fff', borderRadius:18, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            <p style={{margin:'0 0 12px', fontSize:15, fontWeight:800, color:'#000'}}>📋 Punch Log</p>
            {punchLog.map(p=>(
              <div key={p.id} style={{background:'#fafafa', border: '1px solid #e2e8f0', borderRadius: 12, padding:12, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                <div>
                  <p style={{margin:0, fontSize:14, fontWeight:800, color:'#000'}}>{p.date}</p>
                  <p style={{margin:'3px 0 0', fontSize:12, color:C.muted, fontWeight:600}}>In: <b style={{color:'#000'}}>{p.inT}</b> · Out: <b style={{color:'#000'}}>{p.outT||'—'}</b></p>
                </div>
                {p.hrs ? (
                  <span style={{fontSize:11, fontWeight:800, color:'#78680a', background:'#fefce8', padding:'4px 10px', borderRadius:8, border: '1px solid #e8df9a'}}>
                    {p.hrs}
                  </span>
                ) : (
                  <span style={{fontSize:11, fontWeight:800, color:'#000', background:'#bbf7d0', padding:'4px 10px', borderRadius:8, border: '1px solid #e8df9a'}}>
                    Active ●
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SALARY
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'salary' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:14}}>
          {/* Main Card */}
          <div style={{background: C.primary, borderRadius:18, border: '1px solid #e2e8f0', padding:'20px 18px', color:'#000', boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            <p style={{margin:0, fontSize:11, color:'#000', fontWeight:800, textTransform:'uppercase', letterSpacing:.5}}>July 2026 · Net Estimated</p>
            <h2 style={{margin:'6px 0 2px', fontSize:36, fontWeight:900, letterSpacing:-1}}>₹18,500</h2>
            <p style={{margin:'4px 0 0', fontSize:12, fontWeight:700, color:'#000'}}>↑ Pay date: 1 Aug 2026 · On Track</p>
          </div>

          {/* Breakdown Card */}
          <div style={{background:'#fff', borderRadius:18, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            <p style={{margin:'0 0 12px', fontSize:15, fontWeight:800, color:'#000'}}>💰 Salary Breakdown</p>
            {[
              {l:'Base Monthly', v:'₹16,000', c:'#000'},
              {l:'Overtime (15 hrs)', v:'+₹2,500', c:'#15803d'},
              {l:'Performance Bonus', v:'+₹1,000', c:'#15803d'},
              {l:'Advance Deduction', v:'−₹1,000', c:'#b91c1c'}
            ].map(row=>(
              <div key={row.l} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: '1px solid #e2e8f0'}}>
                <span style={{fontSize:13, fontWeight:600, color:'#333'}}>{row.l}</span>
                <span style={{fontSize:14, fontWeight:900, color:row.c}}>{row.v}</span>
              </div>
            ))}
            <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0 0', alignItems:'center'}}>
              <span style={{fontSize:16, fontWeight:900, color:'#000'}}>Net Payable</span>
              <span style={{fontSize:22, fontWeight:900, color:'#78680a', background:'#fefce8', padding:'2px 8px', borderRadius:8, border: '1px solid #e8df9a'}}>₹18,500</span>
            </div>
          </div>

          {/* History Card */}
          <div style={{background:'#fff', borderRadius:18, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            <p style={{margin:'0 0 4px', fontSize:15, fontWeight:800, color:'#000'}}>📄 Pay Slip History</p>
            <p style={{margin:'0 0 14px', fontSize:12, fontWeight:600, color:C.muted}}>Click any month to view full details or share</p>

            {[
              {m:'June 2026', v:'₹17,800', d:'Paid 1 Jul', txn:'TXN-998231405', base:'₹16,000', overtime:'+₹1,800', bonus:'₹0', ded:'₹0', bank:'HDFC Bank (****4821)'},
              {m:'May 2026', v:'₹16,500', d:'Paid 1 Jun', txn:'TXN-881290312', base:'₹16,000', overtime:'+₹1,000', bonus:'₹500', ded:'-₹1,000', bank:'HDFC Bank (****4821)'}
            ].map(s=>(
              <div 
                key={s.m} 
                onClick={()=>{ setSelectedPaySlip(s); setShowPaySlipModal(true); }}
                style={{background:'#fafafa', border: '1px solid #e2e8f0', borderRadius:12, padding:14, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, cursor:'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', transition:'all 0.15s'}}
              >
                <div>
                  <p style={{margin:0, fontSize:14, fontWeight:800, color:'#000'}}>{s.m}</p>
                  <p style={{margin:'2px 0 0', fontSize:11, fontWeight:700, color:'#15803d'}}>✓ {s.d}</p>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <span style={{fontSize:16, fontWeight:900, color:'#000'}}>{s.v}</span>
                  <button type="button" style={{padding:'6px 10px', background:'#fef08a', border: '1px solid #e2e8f0', borderRadius:8, color:'#000', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 6px rgba(120, 104, 10, 0.04)', display:'flex', alignItems:'center', gap:4}}>
                    View 👁️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          INVENTORY & PETTY CASH FUNDS
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'inventory' && (() => {
        const totalCredits = pettyCashLogs.filter(l=>l.type==='credit').reduce((a,b)=>a+b.amount,0);
        const totalExpenses = pettyCashLogs.filter(l=>l.type==='expense').reduce((a,b)=>a+b.amount,0);
        const currentBalance = totalCredits - totalExpenses;

        return (
          <div style={{padding:'14px 14px 32px', display:'flex', flexDirection:'column', gap:14}}>
            {/* Balance Card */}
            <div style={{background: C.primary, borderRadius:18, border: '1px solid #e2e8f0', padding:'20px 18px', color:'#000', boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
              <p style={{margin:0, fontSize:11, color:'#000', fontWeight:800, textTransform:'uppercase', letterSpacing:.5}}>Available Petty Cash / Advance Fund</p>
              <h2 style={{margin:'6px 0 2px', fontSize:36, fontWeight:900, letterSpacing:-1}}>₹{currentBalance.toLocaleString()}</h2>
              <p style={{margin:'4px 0 14px', fontSize:12, fontWeight:700, color:'#333'}}>Separate from personal salary · Received from Admin & Students</p>
              
              <div style={{display:'flex', gap:10}}>
                <button 
                  onClick={()=>setShowExpenseModal(true)} 
                  style={{flex:1, padding:'10px 12px', background:'#fff', color:'#000', border: '1px solid #e2e8f0', borderRadius:10, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display:'flex', alignItems:'center', justifyContent:'center', gap:4}}
                >
                  🛒 Log Expense
                </button>
                <button 
                  onClick={()=>setShowAddFundModal(true)} 
                  style={{flex:1, padding:'10px 12px', background:'#bbf7d0', color:'#000', border: '1px solid #e2e8f0', borderRadius:10, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display:'flex', alignItems:'center', justifyContent:'center', gap:4}}
                >
                  💵 Receive Funds
                </button>
              </div>
            </div>

            {/* Assigned Assets & Items */}
            <div style={{background:'#fff', borderRadius:18, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
              <p style={{margin:'0 0 4px', fontSize:15, fontWeight:800, color:'#000'}}>🔑 Assigned Assets & Handheld Items</p>
              <p style={{margin:'0 0 12px', fontSize:12, color:C.muted, fontWeight:600}}>Equipment & keys assigned to you</p>
              
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {assignedAssets.map(ast => (
                  <div key={ast.id} style={{background:'#fafafa', border: '1px solid #e2e8f0', borderRadius:10, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <p style={{margin:0, fontSize:13, fontWeight:800, color:'#000'}}>{ast.name}</p>
                      <p style={{margin:'2px 0 0', fontSize:11, color:C.muted, fontWeight:600}}>{ast.qty} · Serial: {ast.serial}</p>
                    </div>
                    <Chip label={ast.cond} color="#78680a" bg="#fefce8"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Fund Transactions Log */}
            <div style={{background:'#fff', borderRadius:18, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
              <p style={{margin:'0 0 12px', fontSize:15, fontWeight:800, color:'#000'}}>📜 Cash Transactions Log</p>
              
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {pettyCashLogs.map(log => (
                  <div key={log.id} style={{background:'#fafafa', border: '1px solid #e2e8f0', borderRadius:10, padding:12, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <span style={{fontSize:13, fontWeight:800, color:'#000'}}>{log.title}</span>
                      <p style={{margin:'2px 0 0', fontSize:11, color:C.muted, fontWeight:700}}>
                        {log.type==='expense' ? `To: ${log.party || 'Vendor'}` : `From: ${log.party || 'Payer'}`} · {log.mode} · {log.date}
                      </p>
                      {log.senderUpi && log.receiverUpi && (
                        <div style={{marginTop:4, padding:'4px 8px', background:'#fef08a', borderRadius:6, border: '1px solid #e8df9a', fontSize:10, fontWeight:700, color:'#000'}}>
                          💸 UPI: {log.senderUpi} ➔ {log.receiverUpi}
                        </div>
                      )}
                    </div>
                    <span style={{fontSize:15, fontWeight:900, color: log.type==='credit' ? '#15803d' : '#b91c1c'}}>
                      {log.type==='credit' ? `+₹${log.amount}` : `−₹${log.amount}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          ITEM LIST
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'items' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:12}}>
          {STORE_ITEMS.map(item=>(
            <div key={item.id} style={{background:'#fff',borderRadius:16,border: '1px solid #e2e8f0',padding:14,display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
              <div>
                <p style={{margin:0,fontSize:14,fontWeight:800,color:C.text}}>{item.name}</p>
                <p style={{margin:'3px 0 0',fontSize:11,color:C.muted}}>{item.cat} · Min: {item.min}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{margin:0,fontSize:15,fontWeight:900,color:C.text}}>{item.stock}</p>
                <Chip label={item.status} color={item.status==='In Stock'?C.success:item.status==='Low Stock'?C.warn:C.danger} bg={item.status==='In Stock'?C.successBg:item.status==='Low Stock'?C.warnBg:C.dangerBg}/>
              </div>
            </div>
          ))}
          {myDemands.length>0 && (<>
            <p style={{margin:'8px 0 6px',fontSize:13,fontWeight:800,color:C.text}}>📋 My Demands</p>
            {myDemands.map(d=>(
              <div key={d.id} style={{background:'#fff',borderRadius:14,border: '1px solid #e2e8f0',padding:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><p style={{margin:0,fontSize:13,fontWeight:800,color:C.text}}>{d.item}</p><p style={{margin:'2px 0 0',fontSize:11,color:C.muted}}>Qty: {d.qty} · {d.date}</p></div>
                <Chip label={d.status} color={d.status==='Approved'?C.success:C.warn} bg={d.status==='Approved'?C.successBg:C.warnBg}/>
              </div>
            ))}
          </>)}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CHAT — WHATSAPP STYLE WITH REMINDERS
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'chat' && (
        <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 58px)'}}>
          
          {!activeContact ? (
            // Contacts List View
            <div style={{flex:1, overflowY:'auto', background:'#fff'}}>
              {sortedContacts.map(c => (
                <div key={c.id} onClick={() => setActiveContact(c)} style={{display:'flex',alignItems:'center',padding:'14px 16px',borderBottom: '1px solid #e2e8f0',cursor:'pointer',transition:'background .15s',gap:14}} onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{position:'relative'}}>
                    <div style={{width:48,height:48,borderRadius:'50%',background:meta.accentBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>
                      {c.avatar}
                    </div>
                    {c.isPinned && <div style={{position:'absolute',bottom:0,right:-2,background:'#eab308',color:'#000',width:18,height:18,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid white'}}><span className="material-symbols-outlined" style={{fontSize:10}}>push_pin</span></div>}
                  </div>
                  <div style={{flex:1, overflow:'hidden'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
                      <span style={{fontSize:15,fontWeight:800,color:C.text}}>{c.name}</span>
                      <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{c.time}</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:13,color:C.sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.lastMsg}</span>
                      {c.reminder && <span className="material-symbols-outlined" style={{fontSize:16,color:'#d97706'}}>notifications_active</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Individual Chat View
            <div style={{flex:1, display:'flex', flexDirection:'column', background:'#f8fafc', height:'100%'}}>
              {/* Reminder Bar */}
              {activeContact.reminder && (
                <div style={{background:'#fef3c7',padding:'8px 16px',borderBottom:'1px solid #fde68a',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}} onClick={openReminder}>
                    <span className="material-symbols-outlined" style={{fontSize:16,color:'#b45309'}}>notifications_active</span>
                    <span style={{fontSize:12,fontWeight:700,color:'#92400e'}}>Reminder: {activeContact.reminder}</span>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={openReminder} style={{background:'#fffbeb',border:'1px solid #fde68a',color:'#b45309',borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:800,cursor:'pointer'}}>Edit</button>
                    <button onClick={clearReminder} style={{background:'none',border: '1px solid #e2e8f0',color:'#d97706',fontSize:12,fontWeight:800,cursor:'pointer'}}>Clear</button>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div style={{flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:12}}>
                {(!chatHist[activeContact.id] || chatHist[activeContact.id].length === 0) && (
                  <div style={{textAlign:'center',padding:'40px 20px',color:C.muted}}>
                    <span className="material-symbols-outlined" style={{fontSize:48,display:'block',marginBottom:12,opacity:.4}}>chat_bubble</span>
                    <p style={{margin:0,fontSize:14}}>No messages yet. Send a message to start!</p>
                  </div>
                )}
                {(chatHist[activeContact.id] || []).map(m => (
                  <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems:m.me?'flex-end':'flex-start',gap:4}}>
                    <div style={{maxWidth:'78%',background:m.me?meta.grad:'#fff',color:m.me?'white':C.text,borderRadius:m.me?'18px 18px 4px 18px':'18px 18px 18px 4px',padding:'11px 14px',boxShadow:m.me?`0 4px 12px ${meta.accent}33`:'0 2px 8px rgba(0,0,0,.06)'}}>
                      <p style={{margin:0,fontSize:14,lineHeight:1.5}}>{m.text}</p>
                    </div>
                    <span style={{fontSize:10,color:C.muted}}>{m.time}</span>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>

              {/* Input Bar */}
              <form onSubmit={sendMsg} style={{display:'flex',gap:8,padding:'12px 14px',background:'#fff',borderTop: '1px solid #e2e8f0',flexShrink:0}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type a message…"
                  style={{flex:1,padding:'12px 16px',border: '1px solid #e2e8f0',borderRadius: 16,fontSize:14,outline:'none',fontFamily:'inherit',background:C.bg,color:C.text}}/>
                <button type="submit" style={{width:46,height:46,background:meta.grad,border: '1px solid #e2e8f0',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow: '0 4px 16px rgba(15,23,42,0.05)',flexShrink:0}}>
                  <span className="material-symbols-outlined" style={{fontSize:20,color:'#000'}}>send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          WORK REPORTS
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'reports' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
            <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:C.text}}>📝 Submit Today's Report</p>
            <form onSubmit={submitReport} style={{display:'flex',flexDirection:'column',gap:12}}>
              <InputField label="Work Summary *" textarea required rows={4} value={rptText} onChange={e=>setRptText(e.target.value)} placeholder="Tasks completed, issues found, items needed…"/>
              <button type="submit" style={{padding:13,background:meta.grad,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Submit Report 🚀</button>
            </form>
          </div>
          <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
            <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:C.text}}>📋 Past Reports</p>
            {rptHist.map(r=>(
              <div key={r.id} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius: 8,padding:12,marginBottom:8}}>
                <Row style={{marginBottom:6}}><span style={{fontSize:12,fontWeight:800,color:C.text}}>{r.date}</span><Chip label={r.status} color={r.status.includes('Reviewed')?C.success:C.warn} bg={r.status.includes('Reviewed')?C.successBg:C.warnBg}/></Row>
                <p style={{margin:0,fontSize:13,color:C.sub,lineHeight:1.5}}>{r.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          REQUESTS
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'requests' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
            <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:C.text}}>📬 New Request</p>
            <form onSubmit={submitRequest} style={{display:'flex',flexDirection:'column',gap:12}}>
              <SelectField label="Request Type" value={reqType} onChange={e=>setReqType(e.target.value)}>
                <option value="Leave">Casual / Sick Leave</option>
                <option value="Advance">Salary Advance</option>
                <option value="Tool">Equipment / Uniform</option>
              </SelectField>
              {reqType==='Advance' && <InputField label="Amount Needed (₹)" type="number" value={reqAmt} onChange={e=>setReqAmt(e.target.value)} placeholder="e.g. 2000"/>}
              <InputField label="Reason / Details *" required value={reqReason} onChange={e=>setReqReason(e.target.value)} placeholder="Briefly explain your request…"/>
              <button type="submit" style={{padding:13,background:meta.grad,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Submit Request 🚀</button>
            </form>
          </div>
          <div style={{background:'#fff',borderRadius:18,border: '1px solid #e2e8f0',padding:16}}>
            <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:C.text}}>📋 My Requests</p>
            {myReqs.map(r=>(
              <div key={r.id} style={{background:C.bg,border: '1px solid #e2e8f0',borderRadius: 8,padding:12,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div><p style={{margin:0,fontSize:13,fontWeight:800,color:C.text}}>{r.type}</p><p style={{margin:'3px 0 0',fontSize:11,color:C.muted}}>{r.date}{r.amt!=='-'?` · ${r.amt}`:''}</p></div>
                <Chip label={r.status} color={r.status==='Approved'?C.success:r.status==='Pending'?C.warn:C.danger} bg={r.status==='Approved'?C.successBg:r.status==='Pending'?C.warnBg:C.dangerBg}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MY PROFILE VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'profile_view' && (
        <div style={{padding:'14px 14px 32px', display:'flex', flexDirection:'column', gap:14}}>
          {/* Main Card: Avatar & Status */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', boxShadow:'0 4px 16px rgba(120, 104, 10, 0.05)'}}>
            <div style={{width:80, height:80, borderRadius:50, background:meta.accentBg, border:'2px solid #e8df9a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:12, boxShadow:'0 4px 12px rgba(0,0,0,0.06)'}}>
              {meta.emoji}
            </div>
            <h3 style={{margin:'0 0 4px', fontSize:22, fontWeight:900, color:'#000'}}>{staffName}</h3>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:12}}>
              <span style={{fontSize:11, fontWeight:800, background:meta.accent, color:'#000', padding:'2px 8px', borderRadius:8, border:'1.5px solid #e8df9a'}}>{staffRole}</span>
              <span style={{fontSize:12, fontWeight:700, color:C.muted}}>· {meta.dept}</span>
            </div>
            <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'6px 12px', display:'flex', alignItems:'center', gap:6}}>
              <span className="material-symbols-outlined" style={{fontSize:16, color:'#166534'}}>verified</span>
              <span style={{fontSize:12, fontWeight:800, color:'#166534'}}>Verified Staff Member</span>
            </div>
          </div>

          {/* Section: Personal Detailing */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:16, display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 16px rgba(120, 104, 10, 0.05)'}}>
            <p style={{margin:0, fontSize:14, fontWeight:900, color:'#000', borderBottom:'1px solid #f1f5f9', paddingBottom:8, display:'flex', alignItems:'center', gap:6}}>
              <span className="material-symbols-outlined" style={{fontSize:18, color:'#78680a'}}>person</span>
              Personal Details
            </p>
            <div style={{display:'grid', gridTemplateColumns:'1fr', gap:10}}>
              {[
                {label:'Phone Number', val: user?.mobile || '+91 98000 12345'},
                {label:'Email Address', val: `${staffName.toLowerCase().replace(/\s+/g, '.')}@febebo.com`},
                {label:'Permanent Address', val: 'H-42, Block C, Sector 62, Noida, UP - 201301'},
                {label:'Emergency Contact', val: 'Pooja Devi (Wife) · +91 98111 22233'},
              ].map(item => (
                <div key={item.label} style={{display:'flex', flexDirection:'column', gap:2}}>
                  <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>{item.label}</span>
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Professional Detailing */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:16, display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 16px rgba(120, 104, 10, 0.05)'}}>
            <p style={{margin:0, fontSize:14, fontWeight:900, color:'#000', borderBottom:'1px solid #f1f5f9', paddingBottom:8, display:'flex', alignItems:'center', gap:6}}>
              <span className="material-symbols-outlined" style={{fontSize:18, color:'#78680a'}}>badge</span>
              Professional Details
            </p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {[
                {label:'Staff ID', val:`FEB-2026-ST0${(user?.id || 1042) % 1000}`},
                {label:'Designated Role', val:staffRole},
                {label:'Monthly Salary', val:'₹18,500'},
                {label:'Date of Joining', val:'15th Jan 2025'},
                {label:'Shift Timing', val:'09:00 AM - 06:00 PM'},
                {label:'Duty Status', val:'On Duty ✅'},
              ].map(item => (
                <div key={item.label} style={{display:'flex', flexDirection:'column', gap:2}}>
                  <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>{item.label}</span>
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Documents */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:16, display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 16px rgba(120, 104, 10, 0.05)'}}>
            <p style={{margin:0, fontSize:14, fontWeight:900, color:'#000', borderBottom:'1px solid #f1f5f9', paddingBottom:8, display:'flex', alignItems:'center', gap:6}}>
              <span className="material-symbols-outlined" style={{fontSize:18, color:'#78680a'}}>folder_shared</span>
              Documents & Verification
            </p>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {[
                {name:'Aadhar Card', desc:'Verification Complete', icon:'badge', no:'XXXX XXXX 8892'},
                {name:'PAN Card', desc:'Verification Complete', icon:'credit_card', no:'ABCDE1234F'},
                {name:'Employment Agreement', desc:'Signed on 15 Jan 2025', icon:'description', no:'Signed PDF'},
              ].map(doc => (
                <div key={doc.name} style={{background:C.bg, borderRadius:12, padding:'10px 12px', border:'1px solid #e8df9a', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span className="material-symbols-outlined" style={{fontSize:22, color:'#78680a'}}>{doc.icon}</span>
                    <div>
                      <p style={{margin:0, fontSize:12, fontWeight:800, color:'#000'}}>{doc.name}</p>
                      <p style={{margin:0, fontSize:10, color:C.muted}}>{doc.no} · {doc.desc}</p>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:4, background:'#dcfce7', padding:'4px 8px', borderRadius:8}}>
                    <span className="material-symbols-outlined" style={{fontSize:12, color:'#166534'}}>check_circle</span>
                    <span style={{fontSize:9, fontWeight:800, color:'#166534'}}>Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      <Sheet show={showDemand} onClose={()=>setShowDemand(false)} title="Demand Item / Supplies" sub="Submit requisition to admin">
        <form onSubmit={submitDemand} style={{display:'flex',flexDirection:'column',gap:12}}>
          <InputField label="Item Description *" required value={dItem} onChange={e=>setDItem(e.target.value)} placeholder="e.g. Basmati Rice 25kg"/>
          <InputField label="Quantity" value={dQty} onChange={e=>setDQty(e.target.value)} placeholder="e.g. 2 bags"/>
          <InputField label="Note / Urgency" value={dNote} onChange={e=>setDNote(e.target.value)} placeholder="e.g. Needed for tonight"/>
          <button type="submit" style={{padding:14,background:meta.grad,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Submit Demand 🚀</button>
        </form>
      </Sheet>

      <Sheet show={showBcast} onClose={()=>setShowBcast(false)} title="Broadcast — Food is Ready!" sub="Send meal notification">
        <form onSubmit={e=>{
          e.preventDefault();
          setShowBcast(false);
          const targetName = bTarget === 'All' ? 'All Students' : students.find(s=>s.id===Number(bStudentId))?.name;
          alert(`📢 ${bMeal} broadcast sent to ${targetName}!`);
        }} style={{display:'flex',flexDirection:'column',gap:12}}>
          <SelectField label="Send To" value={bTarget} onChange={e=>setBTarget(e.target.value)}>
            <option value="All">All Students</option>
            <option value="Individual">Individual Student</option>
          </SelectField>
          {bTarget === 'Individual' && (
            <SelectField label="Select Student" required value={bStudentId} onChange={e=>setBStudentId(e.target.value)}>
              <option value="">-- Choose --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} (Rm {s.room})</option>)}
            </SelectField>
          )}
          <SelectField label="Meal" value={bMeal} onChange={e=>setBMeal(e.target.value)}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Snacks</option>
            <option>Dinner</option>
          </SelectField>
          <InputField label="Message" textarea rows={3} value={bMsg} onChange={e=>setBMsg(e.target.value)}/>
          <button type="submit" style={{padding:14,background: C.primary,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Send Notification 📢</button>
        </form>
      </Sheet>

      <Sheet show={showMenuEdit} onClose={()=>setShowMenuEdit(false)} title={`Edit ${mealTab} Menu`} sub="Update the food items for today">
        <form onSubmit={e=>{
          e.preventDefault();
          setMenus(p=>({...p, [mealTab]: menuEditVal}));
          setShowMenuEdit(false);
        }} style={{display:'flex',flexDirection:'column',gap:12}}>
          <InputField label="Food Items" textarea rows={3} required value={menuEditVal} onChange={e=>setMenuEditVal(e.target.value)} placeholder="e.g. 4 Roti, Dal, Rice, Salad"/>
          <button type="submit" style={{padding:14,background:meta.grad,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Save Menu</button>
        </form>
      </Sheet>

      <Sheet show={showPackEdit} onClose={()=>setShowPackEdit(false)} title={selectedStat === 'extra' ? "Extra Plate Details" : "Pack Details"} sub={`For ${students.find(s=>s.id===packStudentId)?.name || 'Student'}`}>
        <form onSubmit={e=>{
          e.preventDefault();
          const detailsKey = mealTab==='Breakfast'?'detailsB':mealTab==='Lunch'?'detailsL':mealTab==='Snacks'?'detailsS':'detailsD';
          const formattedVal = (selectedStat === 'extra' && packPriceVal) ? `${packVal} (₹${packPriceVal})` : packVal;
          setStudents(p=>p.map(st=>st.id===packStudentId?{...st,[detailsKey]:formattedVal}:st));
          setShowPackEdit(false);
        }} style={{display:'flex',flexDirection:'column',gap:12}}>
          <InputField label="Food Items & Quantity" textarea rows={2} required value={packVal} onChange={e=>setPackVal(e.target.value)} placeholder="e.g. 4 Roti, 1 bowl Sabzi"/>
          {selectedStat === 'extra' && (
            <InputField label="Extra Plate Charge / Money (₹)" type="number" value={packPriceVal} onChange={e=>setPackPriceVal(e.target.value)} placeholder="e.g. 60"/>
          )}
          <button type="submit" style={{padding:14,background:C.primary,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Save Details</button>
        </form>
      </Sheet>


      <Sheet show={showVisitor} onClose={()=>setShowVisitor(false)} title="Gate Visitor Entry" sub="Log a visitor at the gate">
        <form onSubmit={addVisitor} style={{display:'flex',flexDirection:'column',gap:12}}>
          <InputField label="Visitor Full Name *" required value={vName} onChange={e=>setVName(e.target.value)} placeholder="e.g. Rajesh Malhotra"/>
          <InputField label="Mobile Number" value={vPhone} onChange={e=>setVPhone(e.target.value)} placeholder="+91 98000 11122"/>
          <InputField label="Purpose & Room #" value={vPurp} onChange={e=>setVPurp(e.target.value)} placeholder="e.g. Parent visit – Rm 104"/>
          <button type="submit" style={{padding:14,background:meta.grad,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Check-In Visitor ✅</button>
        </form>
      </Sheet>

      <Sheet show={showParcel} onClose={()=>setShowParcel(false)} title="Log Courier Parcel" sub="Record parcel received at gate">
        <form onSubmit={addParcel} style={{display:'flex',flexDirection:'column',gap:12}}>
          <InputField label="Student Name *" required value={pStu} onChange={e=>setPStu(e.target.value)} placeholder="e.g. Arjun Mehta"/>
          <InputField label="Room Number" value={pRoom} onChange={e=>setPRoom(e.target.value)} placeholder="e.g. 101"/>
          <SelectField label="Carrier" value={pCarr} onChange={e=>setPCarr(e.target.value)}><option>Amazon</option><option>Flipkart</option><option>BlueDart</option><option>Courier Express</option><option>India Post</option></SelectField>
          <InputField label="Tracking / AWB #" value={pTrk} onChange={e=>setPTrk(e.target.value)} placeholder="e.g. AMZ-88910"/>
          <button type="submit" style={{padding:14,background: C.primary,color:'#000',border: '1px solid #e2e8f0',borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>Log Parcel 📦</button>
        </form>
      </Sheet>

      {/* Pay Slip Detailed View & Share Sheet */}
      <Sheet show={showPaySlipModal} onClose={() => setShowPaySlipModal(false)} title={`${selectedPaySlip?.m || ''} Pay Slip`} sub="Detailed Salary Statement">
        {selectedPaySlip && (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div style={{background:'#fef08a', padding:'14px 16px', borderRadius:12, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
              <p style={{margin:0, fontSize:12, fontWeight:800, color:'#000', textTransform:'uppercase'}}>Net Disbursed Amount</p>
              <h3 style={{margin:'4px 0 0', fontSize:30, fontWeight:900, color:'#000'}}>{selectedPaySlip.v}</h3>
              <p style={{margin:'4px 0 0', fontSize:12, fontWeight:700, color:'#15803d'}}>✓ {selectedPaySlip.d} · {selectedPaySlip.bank}</p>
            </div>

            <div style={{background:'#fff', border: '1px solid #e2e8f0', borderRadius:12, padding:'14px'}}>
              <p style={{margin:'0 0 10px', fontSize:13, fontWeight:800, color:'#000', textTransform:'uppercase'}}>Earnings & Deductions</p>
              <div style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee', fontSize:13}}>
                <span style={{color:C.muted}}>Base Salary</span>
                <span style={{fontWeight:800, color:'#000'}}>{selectedPaySlip.base}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee', fontSize:13}}>
                <span style={{color:C.muted}}>Overtime</span>
                <span style={{fontWeight:800, color:'#15803d'}}>{selectedPaySlip.overtime}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee', fontSize:13}}>
                <span style={{color:C.muted}}>Bonus</span>
                <span style={{fontWeight:800, color:'#15803d'}}>{selectedPaySlip.bonus}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee', fontSize:13}}>
                <span style={{color:C.muted}}>Deductions</span>
                <span style={{fontWeight:800, color:'#b91c1c'}}>{selectedPaySlip.ded}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0 0', fontSize:14, fontWeight:900}}>
                <span>Total Net Pay</span>
                <span>{selectedPaySlip.v}</span>
              </div>
            </div>

            <div style={{background:'#f5f5f5', border: '1px solid #e2e8f0', borderRadius:12, padding:'12px', fontSize:11, fontWeight:700, color:'#333'}}>
              <p style={{margin:0}}>Reference TXN: {selectedPaySlip.txn}</p>
              <p style={{margin:'4px 0 0'}}>Employee: {staffName} ({staffRole})</p>
            </div>

            {/* Actions: Download & Share */}
            <div style={{display:'flex', gap:10, marginTop:4}}>
              <button 
                type="button" 
                onClick={() => alert(`Downloading PDF for ${selectedPaySlip.m}...`)} 
                style={{flex:1, padding:13, background:'#fff', color:'#000', border: '1px solid #e2e8f0', borderRadius:12, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}
              >
                <span>📥</span> PDF
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const shareText = `📄 Febebo Staff Pay Slip\nMonth: ${selectedPaySlip.m}\nNet Paid: ${selectedPaySlip.v}\nStatus: ${selectedPaySlip.d}\nTxn: ${selectedPaySlip.txn}`;
                  if (navigator.share) {
                    navigator.share({ title: `${selectedPaySlip.m} Pay Slip`, text: shareText }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Pay Slip summary copied to clipboard! You can share it to any platform.');
                  }
                }} 
                style={{flex:2, padding:13, background:'#fef08a', color:'#000', border: '1px solid #e2e8f0', borderRadius:12, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}
              >
                <span>📤</span> Share Pay Slip
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Log Expense Modal */}
      <Sheet show={showExpenseModal} onClose={()=>setShowExpenseModal(false)} title="Log Expense / Item Purchase" sub="Deduct from available Petty Cash fund">
        <form onSubmit={e=>{
          e.preventDefault();
          if(!expTitle || !expAmt) return;
          const newLog = {
            id: Date.now(),
            type: 'expense',
            title: expTitle,
            amount: Number(expAmt),
            mode: expMode,
            party: expPaidTo || 'Local Vendor',
            senderUpi: expMode==='UPI / GPay' ? expSenderUpi : null,
            receiverUpi: expMode==='UPI / GPay' ? (expReceiverUpi || 'vendor@upi') : null,
            date: 'Just now',
            by: 'Staff Purchase'
          };
          setPettyCashLogs(prev=>[newLog, ...prev]);
          setExpTitle(''); setExpAmt(''); setExpPaidTo(''); setExpReceiverUpi(''); setShowExpenseModal(false);
        }} style={{display:'flex', flexDirection:'column', gap:12}}>
          <InputField label="Item Description / Purpose *" required value={expTitle} onChange={e=>setExpTitle(e.target.value)} placeholder="e.g. Fresh Vegetables, Hardware, Mop"/>
          <InputField label="Paid To / Vendor Name *" required value={expPaidTo} onChange={e=>setExpPaidTo(e.target.value)} placeholder="e.g. Ramesh Veg Market"/>
          <InputField label="Amount Spent (₹) *" type="number" required value={expAmt} onChange={e=>setExpAmt(e.target.value)} placeholder="e.g. 500"/>
          
          <SelectField label="Payment Mode" value={expMode} onChange={e=>setExpMode(e.target.value)}>
            <option>Cash</option>
            <option>UPI / GPay</option>
            <option>Card</option>
          </SelectField>

          {expMode === 'UPI / GPay' && (
            <div style={{background:'#fafafa', border: '1px solid #e2e8f0', borderRadius:10, padding:12, display:'flex', flexDirection:'column', gap:10}}>
              <p style={{margin:0, fontSize:12, fontWeight:800, color:'#000'}}>📲 UPI Transaction IDs</p>
              <InputField label="Sender UPI ID (Staff - Prefilled)" value={expSenderUpi} onChange={e=>setExpSenderUpi(e.target.value)} placeholder="your.name@upi"/>
              <InputField label="Receiver UPI ID (Vendor)" value={expReceiverUpi} onChange={e=>setExpReceiverUpi(e.target.value)} placeholder="e.g. rameshveg@okaxis"/>
            </div>
          )}

          <button type="submit" style={{padding:14, background:C.primary, color:'#000', border: '1px solid #e2e8f0', borderRadius:14, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            Save Expense 🛒
          </button>
        </form>
      </Sheet>

      {/* Receive Funds Modal */}
      <Sheet show={showAddFundModal} onClose={()=>setShowAddFundModal(false)} title="Receive Advance Funds" sub="Add cash/UPI received from Admin or Students">
        <form onSubmit={e=>{
          e.preventDefault();
          if(!fundTitle || !fundAmt) return;
          const newLog = {
            id: Date.now(),
            type: 'credit',
            title: fundTitle,
            amount: Number(fundAmt),
            mode: fundMode,
            party: fundPayerName || 'Admin Office',
            senderUpi: fundMode==='UPI' ? (fundSenderUpi || 'payer@upi') : null,
            receiverUpi: fundMode==='UPI' ? fundReceiverUpi : null,
            date: 'Just now',
            by: fundSrc
          };
          setPettyCashLogs(prev=>[newLog, ...prev]);
          setFundTitle(''); setFundAmt(''); setFundPayerName(''); setShowAddFundModal(false);
        }} style={{display:'flex', flexDirection:'column', gap:12}}>
          <SelectField label="Source" value={fundSrc} onChange={e=>{
            setFundSrc(e.target.value);
            if(e.target.value === 'Admin') {
              setFundPayerName('Admin Office');
              setFundSenderUpi('admin.office@febebo.upi');
            } else {
              setFundPayerName('Arjun Mehta (Rm 101)');
              setFundSenderUpi('arjun.student@okicici');
            }
          }}>
            <option value="Admin">Admin Cash Advance</option>
            <option value="Student">Student Payment / Extra Charge</option>
          </SelectField>

          <InputField label="Received From (Payer Name) *" required value={fundPayerName} onChange={e=>setFundPayerName(e.target.value)} placeholder="e.g. Admin Office or Student Name"/>
          <InputField label="Fund Source Note / Description *" required value={fundTitle} onChange={e=>setFundTitle(e.target.value)} placeholder="e.g. Weekly Kitchen Fund from Admin"/>
          <InputField label="Amount Received (₹) *" type="number" required value={fundAmt} onChange={e=>setFundAmt(e.target.value)} placeholder="e.g. 2000"/>
          
          <SelectField label="Payment Mode" value={fundMode} onChange={e=>setFundMode(e.target.value)}>
            <option>UPI</option>
            <option>Cash</option>
          </SelectField>

          {fundMode === 'UPI' && (
            <div style={{background:'#fafafa', border: '1px solid #e2e8f0', borderRadius:10, padding:12, display:'flex', flexDirection:'column', gap:10}}>
              <p style={{margin:0, fontSize:12, fontWeight:800, color:'#000'}}>📲 UPI Transaction IDs</p>
              <InputField label="Sender UPI ID (Payer)" value={fundSenderUpi} onChange={e=>setFundSenderUpi(e.target.value)} placeholder="payer@upi"/>
              <InputField label="Receiver UPI ID (Staff - Prefilled)" value={fundReceiverUpi} onChange={e=>setFundReceiverUpi(e.target.value)} placeholder="your.name@upi"/>
            </div>
          )}

          <button type="submit" style={{padding:14, background:'#bbf7d0', color:'#000', border: '1px solid #e2e8f0', borderRadius:14, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            Record Received Funds 💵
          </button>
        </form>
      </Sheet>

    </div>
  );
}
