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
  'Bus Driver':       { emoji:'🚌',   accent:'#38bdf8', accentBg:'#e0f2fe', dept:'Shuttle & Transport',     grad:'#38bdf8' },
  'Bus Driver':       { emoji:'🚌',   accent:'#38bdf8', accentBg:'#e0f2fe', dept:'Shuttle & Transport',     grad:'#38bdf8' },
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

const INIT_VENDORS = [
  { id: 1, name: 'Sunil Kumar', shop: 'The Local Market', category: 'Groceries', upi: 'sunilkumar@upi', balance: 90, totalSpent: 100 },
  { id: 2, name: 'Raju Verma', shop: 'Fresh Picks', category: 'Groceries', upi: 'rajuverma@upi', balance: 5000, totalSpent: 85000 },
  { id: 3, name: 'Lakhan DryCleaners', shop: 'Express Laundry', category: 'Laundry', upi: 'lakhan@upi', balance: 12000, totalSpent: 45000 },
  { id: 4, name: 'Sanjay Veggies', shop: 'Sabzi Mandi Shop', category: 'Vegetables', upi: 'sanjay@upi', balance: 3500, totalSpent: 30000 },
  { id: 5, name: 'Krishna Dairy', shop: 'Shree Krishna Milk', category: 'Dairy', upi: 'krishna@upi', balance: 8000, totalSpent: 65000 },
  { id: 6, name: 'Bisleri Water Supplier', shop: 'Pure Water Agency', category: 'Water', upi: 'bisleri@upi', balance: 4000, totalSpent: 24000 }
];

const INIT_ITEMS_BY_CATEGORY = {
  'Groceries': [
    { name: 'Besan', unit: 'kg', rate: 10 },
    { name: 'Biscuits', unit: 'packet', rate: 20 },
    { name: 'Coffee Powder', unit: 'gm', rate: 120 },
    { name: 'Cooking Oil (Mustard)', unit: 'L', rate: 170 },
    { name: 'Cooking Oil (Sunflower)', unit: 'L', rate: 140 },
    { name: 'Coriander Powder', unit: 'gm', rate: 45 },
    { name: 'Cumin Seeds', unit: 'gm', rate: 90 },
    { name: 'Sugar', unit: 'kg', rate: 40 },
    { name: 'Tea Leaves', unit: 'gm', rate: 60 }
  ],
  'Laundry': [
    { name: 'Bedsheet Washing', unit: 'pc', rate: 15 },
    { name: 'Pillow Cover washing', unit: 'pc', rate: 5 },
    { name: 'Dry Cleaning Uniform', unit: 'set', rate: 80 }
  ],
  'Vegetables': [
    { name: 'Potatoes', unit: 'kg', rate: 25 },
    { name: 'Onions', unit: 'kg', rate: 35 },
    { name: 'Tomatoes', unit: 'kg', rate: 40 },
    { name: 'Green Chillies', unit: 'kg', rate: 80 }
  ],
  'Dairy': [
    { name: 'Toned Milk', unit: 'L', rate: 54 },
    { name: 'Full Cream Milk', unit: 'L', rate: 66 },
    { name: 'Paneer', unit: 'kg', rate: 360 },
    { name: 'Curd', unit: 'kg', rate: 80 }
  ],
  'Water': [
    { name: '20L Water Can', unit: 'bottle', rate: 30 },
    { name: 'Water Tanker (1000L)', unit: 'tanker', rate: 800 }
  ]
};

// ─── Role-Based Personalized Item Lists ─────────────────────────────────────
const ROLE_ITEM_LISTS = {
  'Cook': [
    { name: 'Rice (Regular)', unit: 'kg', cat: 'Groceries' },
    { name: 'Basmati Rice', unit: 'kg', cat: 'Groceries' },
    { name: 'Dal (Chana)', unit: 'kg', cat: 'Groceries' },
    { name: 'Dal (Moong)', unit: 'kg', cat: 'Groceries' },
    { name: 'Dal (Masoor)', unit: 'kg', cat: 'Groceries' },
    { name: 'Besan', unit: 'kg', cat: 'Groceries' },
    { name: 'Wheat Flour (Aata)', unit: 'kg', cat: 'Groceries' },
    { name: 'Sooji', unit: 'kg', cat: 'Groceries' },
    { name: 'Sugar', unit: 'kg', cat: 'Groceries' },
    { name: 'Salt', unit: 'kg', cat: 'Groceries' },
    { name: 'Cooking Oil (Sunflower)', unit: 'L', cat: 'Groceries' },
    { name: 'Cooking Oil (Mustard)', unit: 'L', cat: 'Groceries' },
    { name: 'Tea Leaves', unit: 'gm', cat: 'Groceries' },
    { name: 'Coffee Powder', unit: 'gm', cat: 'Groceries' },
    { name: 'Turmeric Powder', unit: 'gm', cat: 'Groceries' },
    { name: 'Coriander Powder', unit: 'gm', cat: 'Groceries' },
    { name: 'Red Chilli Powder', unit: 'gm', cat: 'Groceries' },
    { name: 'Cumin Seeds', unit: 'gm', cat: 'Groceries' },
    { name: 'Garam Masala', unit: 'gm', cat: 'Groceries' },
    { name: 'Vermicelli', unit: 'packet', cat: 'Groceries' },
    { name: 'Biscuits', unit: 'packet', cat: 'Groceries' },
    { name: 'Potatoes', unit: 'kg', cat: 'Vegetables' },
    { name: 'Onions', unit: 'kg', cat: 'Vegetables' },
    { name: 'Tomatoes', unit: 'kg', cat: 'Vegetables' },
    { name: 'Green Chillies', unit: 'kg', cat: 'Vegetables' },
    { name: 'Ginger', unit: 'gm', cat: 'Vegetables' },
    { name: 'Garlic', unit: 'gm', cat: 'Vegetables' },
    { name: 'Toned Milk', unit: 'L', cat: 'Dairy' },
    { name: 'Full Cream Milk', unit: 'L', cat: 'Dairy' },
    { name: 'Paneer', unit: 'kg', cat: 'Dairy' },
    { name: 'Curd', unit: 'kg', cat: 'Dairy' },
    { name: 'LPG Gas Cylinder', unit: 'cylinder', cat: 'Utilities' },
  ],
  'Plumber': [
    { name: 'CPVC Pipe (1/2 inch)', unit: 'm', cat: 'Plumbing' },
    { name: 'CPVC Pipe (3/4 inch)', unit: 'm', cat: 'Plumbing' },
    { name: 'PVC Pipe (4 inch)', unit: 'm', cat: 'Plumbing' },
    { name: 'Ball Valve (1/2 inch)', unit: 'pc', cat: 'Plumbing' },
    { name: 'Stop Cock', unit: 'pc', cat: 'Plumbing' },
    { name: 'Angle Valve', unit: 'pc', cat: 'Plumbing' },
    { name: 'Pipe Elbow (1/2 inch)', unit: 'pc', cat: 'Plumbing' },
    { name: 'Pipe Tee (1/2 inch)', unit: 'pc', cat: 'Plumbing' },
    { name: 'Teflon Tape', unit: 'roll', cat: 'Plumbing' },
    { name: 'PVC Solvent Cement', unit: 'tin', cat: 'Plumbing' },
    { name: 'Geyser Element', unit: 'pc', cat: 'Fittings' },
    { name: 'Float Valve', unit: 'pc', cat: 'Fittings' },
    { name: 'Tap Washer Set', unit: 'set', cat: 'Fittings' },
    { name: 'Drain Cleaner Chemical', unit: 'bottle', cat: 'Cleaning' },
    { name: 'Flexible Hose Pipe', unit: 'm', cat: 'Plumbing' },
    { name: 'Plumber Putty', unit: 'tin', cat: 'Plumbing' },
  ],
  'Electrician': [
    { name: 'MCB (Single Pole 6A)', unit: 'pc', cat: 'Electrical' },
    { name: 'MCB (Double Pole 32A)', unit: 'pc', cat: 'Electrical' },
    { name: 'Wire (1.5 sq mm)', unit: 'm', cat: 'Electrical' },
    { name: 'Wire (2.5 sq mm)', unit: 'm', cat: 'Electrical' },
    { name: 'Modular Switch (10A)', unit: 'pc', cat: 'Electrical' },
    { name: 'Modular Socket (16A)', unit: 'pc', cat: 'Electrical' },
    { name: 'AC Socket (5 pin)', unit: 'pc', cat: 'Electrical' },
    { name: 'LED Bulb (9W)', unit: 'pc', cat: 'Electrical' },
    { name: 'LED Bulb (12W)', unit: 'pc', cat: 'Electrical' },
    { name: 'Tube Light (18W)', unit: 'pc', cat: 'Electrical' },
    { name: 'Fan Capacitor', unit: 'pc', cat: 'Electrical' },
    { name: 'Geyser Switch (25A)', unit: 'pc', cat: 'Electrical' },
    { name: 'Extension Board (4 socket)', unit: 'pc', cat: 'Electrical' },
    { name: 'PVC Conduit Pipe', unit: 'm', cat: 'Electrical' },
    { name: 'Electrical Tape', unit: 'roll', cat: 'Supplies' },
  ],
  'Carpenter': [
    { name: 'Plywood (18mm)', unit: 'sheet', cat: 'Wood' },
    { name: 'MDF Board (12mm)', unit: 'sheet', cat: 'Wood' },
    { name: 'Nail Set (Mixed)', unit: 'box', cat: 'Hardware' },
    { name: 'Wood Screw Set', unit: 'box', cat: 'Hardware' },
    { name: 'Hinge (3 inch)', unit: 'pair', cat: 'Hardware' },
    { name: 'Door Handle', unit: 'pc', cat: 'Hardware' },
    { name: 'Door Latch (5 inch)', unit: 'pc', cat: 'Hardware' },
    { name: 'Door Lock Set', unit: 'set', cat: 'Hardware' },
    { name: 'Wood Polish', unit: 'L', cat: 'Finishing' },
    { name: 'Wood Filler Putty', unit: 'tin', cat: 'Finishing' },
    { name: 'Sandpaper (80 grit)', unit: 'sheet', cat: 'Finishing' },
    { name: 'Wood Glue', unit: 'bottle', cat: 'Finishing' },
    { name: 'Drawer Slider Set', unit: 'pair', cat: 'Hardware' },
  ],
  'Housekeeper': [
    { name: 'Floor Cleaning Liquid', unit: 'L', cat: 'Cleaning' },
    { name: 'Toilet Cleaning Liquid', unit: 'bottle', cat: 'Cleaning' },
    { name: 'Glass Cleaner', unit: 'bottle', cat: 'Cleaning' },
    { name: 'Disinfectant Spray', unit: 'bottle', cat: 'Cleaning' },
    { name: 'Scrub Pad (Pack of 6)', unit: 'pack', cat: 'Cleaning' },
    { name: 'Broom (Floor)', unit: 'pc', cat: 'Supplies' },
    { name: 'Mop Set', unit: 'set', cat: 'Supplies' },
    { name: 'Garbage Bags (Pack of 30)', unit: 'pack', cat: 'Supplies' },
    { name: 'Toilet Paper (12 Roll Pack)', unit: 'pack', cat: 'Consumables' },
    { name: 'Hand Wash Liquid', unit: 'bottle', cat: 'Consumables' },
    { name: 'Room Freshener Spray', unit: 'bottle', cat: 'Consumables' },
    { name: 'Laundry Detergent Powder', unit: 'kg', cat: 'Cleaning' },
    { name: 'Cloth Wiper / Duster', unit: 'pc', cat: 'Supplies' },
  ],
  'Security': [
    { name: 'Log Book (A4)', unit: 'pc', cat: 'Stationery' },
    { name: 'Pen (Blue, Pack of 10)', unit: 'pack', cat: 'Stationery' },
    { name: 'Torch / Flashlight', unit: 'pc', cat: 'Equipment' },
    { name: 'Batteries (AA)', unit: 'pack', cat: 'Equipment' },
    { name: 'Visitor Badge (Pack of 50)', unit: 'pack', cat: 'Stationery' },
    { name: 'Rubber Stamp Ink', unit: 'bottle', cat: 'Stationery' },
    { name: 'Umbrella', unit: 'pc', cat: 'Supplies' },
    { name: 'Safety Whistle', unit: 'pc', cat: 'Equipment' },
  ],
  'Sales Manager': [
    { name: 'Brochure Paper (A4 Glossy)', unit: 'ream', cat: 'Stationery' },
    { name: 'Visiting Cards (Pack of 100)', unit: 'pack', cat: 'Stationery' },
    { name: 'Pen (Blue, Pack of 10)', unit: 'pack', cat: 'Stationery' },
    { name: 'File Folder A4', unit: 'pc', cat: 'Stationery' },
    { name: 'Notepad A4', unit: 'pc', cat: 'Stationery' },
    { name: 'Marker Pen (Pack of 5)', unit: 'pack', cat: 'Stationery' },
    { name: 'Printer Ink Cartridge', unit: 'pc', cat: 'Equipment' },
    { name: 'A4 Printing Paper (500 sheet)', unit: 'ream', cat: 'Stationery' },
  ],
  'Purchase Manager': [
    { name: 'Invoice File Folder', unit: 'pc', cat: 'Stationery' },
    { name: 'Payment Receipt Book', unit: 'pc', cat: 'Stationery' },
    { name: 'Pen (Blue, Pack of 10)', unit: 'pack', cat: 'Stationery' },
    { name: 'Calculator', unit: 'pc', cat: 'Equipment' },
    { name: 'Printer Ink Cartridge', unit: 'pc', cat: 'Equipment' },
    { name: 'A4 Printing Paper (500 sheet)', unit: 'ream', cat: 'Stationery' },
    { name: 'Stapler + Refill', unit: 'set', cat: 'Stationery' },
  ],
};

const DEFAULT_ITEMS = [
  { name: 'Pen (Blue)', unit: 'pc', cat: 'Stationery' },
  { name: 'Notepad', unit: 'pc', cat: 'Stationery' },
  { name: 'Torch', unit: 'pc', cat: 'Equipment' },
  { name: 'Umbrella', unit: 'pc', cat: 'Supplies' },
];

const INIT_VENDOR_LEDGER = [
  { id: 1, vendorId: 1, date: '24 July 2026', type: 'Purchase', amount: 100, desc: 'Purchase: Besan (10 kg)', status: 'Pending', pm: 'UPI -> sunilkumar@upi' }
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
  
  // Cook History Filters
  const [cookHistStatus, setCookHistStatus] = useState('All');
  const [cookHistMeal, setCookHistMeal] = useState('All Meals');
  const [cookHistFood, setCookHistFood] = useState('All Food Items');
  const [expandedCookHistId, setExpandedCookHistId] = useState(null);
  
  // Weekly Food Menu
  const [weeklyFoodMenu, setWeeklyFoodMenu] = useState({
    Monday: { Breakfast: 'Poha, Jalebi, Tea', Lunch: 'Rajma Chawal, Roti, Salad', Snacks: 'Samosa, Coffee', Dinner: 'Paneer Butter Masala, Roti, Dal' },
    Tuesday: { Breakfast: 'Aloo Paratha, Curd', Lunch: 'Kadi Pakoda, Rice', Snacks: 'Puff, Tea', Dinner: 'Mix Veg, Dal, Roti' },
    Wednesday: { Breakfast: 'Idli, Sambhar', Lunch: 'Chole Bhature, Lassi', Snacks: 'Namkeen, Coffee', Dinner: 'Dal Makhani, Roti, Rice' },
    Thursday: { Breakfast: 'Bread Omelette, Tea', Lunch: 'Dal Fry, Rice, Papad', Snacks: 'Biscuits, Tea', Dinner: 'Egg Curry, Roti, Rice' },
    Friday: { Breakfast: 'Upma, Tea', Lunch: 'Veg Biryani, Raita', Snacks: 'Bhel Puri', Dinner: 'Matar Paneer, Roti' },
    Saturday: { Breakfast: 'Puri Sabji, Jalebi', Lunch: 'Dal Tadka, Rice', Snacks: 'Pakoda, Tea', Dinner: 'Aloo Gobi, Roti' },
    Sunday: { Breakfast: 'Masala Dosa, Chutney', Lunch: 'Special Thali', Snacks: 'Cake, Coffee', Dinner: 'Chicken Curry/Paneer, Roti' }
  });
  const [showWeeklyMenuEdit, setShowWeeklyMenuEdit] = useState(false);
  const [editWeeklyMenuDay, setEditWeeklyMenuDay] = useState('');
  const [editWeeklyMenuMeal, setEditWeeklyMenuMeal] = useState('');
  const [editWeeklyMenuVal, setEditWeeklyMenuVal] = useState('');
  const [selectedFoodMenuDate, setSelectedFoodMenuDate] = useState(new Date().toISOString().split('T')[0]);
  
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
  const [selectedAttMonth, setSelectedAttMonth] = useState(null);
  const [tasks, setTasks]               = useState(INIT_TASKS);
  
  // Transaction History Filters
  const [txnMonthFilter, setTxnMonthFilter] = useState('All Months');
  const [txnYearFilter, setTxnYearFilter] = useState('All Years');
  const [txnTypeFilter, setTxnTypeFilter] = useState('All Types');
  const [txnFlowFilter, setTxnFlowFilter] = useState('All');
  const [isAvailable, setIsAvailable]   = useState(true);
  const [plumbingJobs, setPlumbingJobs] = useState(INIT_PLUMBING);
  const [electricalJobs, setElectricalJobs] = useState(INIT_ELECTRICAL);
  const [carpenterJobs, setCarpenterJobs]   = useState(INIT_CARPENTER);
  const [rooms]                             = useState(INIT_ROOMS);
  const [salesTab, setSalesTab]             = useState('leads'); // leads | rooms

  // Purchase
  const [demands,setDemands]    = useState(INIT_DEMANDS);

  // Work History states
  const [historyYear, setHistoryYear] = useState(2026);
  const [historyMonth, setHistoryMonth] = useState(6); // July (0-indexed)
  const [selectedHistoryDate, setSelectedHistoryDate] = useState('2026-07-25');

  const HISTORY_DAYS = {
    '2026-07-01': { status: 'work', tasks: ['Cleaned Room 102 bathroom', 'Fixed water pressure in Room 103'] },
    '2026-07-02': { status: 'work', tasks: ['Kitchen cleanup', 'Repaired table lock in Room 204'] },
    '2026-07-03': { status: 'present', tasks: [] },
    '2026-07-04': { status: 'absent', tasks: [] },
    '2026-07-05': { status: 'work', tasks: ['Repaired door hinges in Room 301', 'Changed light bulb in corridor'] },
    '2026-07-06': { status: 'work', tasks: ['Kitchen assistant shift', 'Disposed waste bins'] },
    '2026-07-07': { status: 'work', tasks: ['Unclogged kitchen sink drain', 'Washed main entry staircase'] },
    '2026-07-08': { status: 'work', tasks: ['Replaced AC remote battery in Room 207'] },
    '2026-07-09': { status: 'work', tasks: ['Mopped lobby', 'Polished dining tables'] },
    '2026-07-10': { status: 'present', tasks: [] },
    '2026-07-11': { status: 'absent', tasks: [] },
    '2026-07-12': { status: 'work', tasks: ['Repaired ceiling fan switch in Room 105'] },
    '2026-07-13': { status: 'work', tasks: ['Washed terrace floor', 'Refilled water tank filters'] },
    '2026-07-14': { status: 'work', tasks: ['Fixed sparking socket in Room 302', 'Checked geyser heating'] },
    '2026-07-15': { status: 'work', tasks: ['Assisted vendor delivery', 'Restocked cleaning chemicals'] },
    '2026-07-16': { status: 'work', tasks: ['Mopped floor in Room 206', 'Polished door knobs'] },
    '2026-07-17': { status: 'present', tasks: [] },
    '2026-07-18': { status: 'absent', tasks: [] },
    '2026-07-19': { status: 'work', tasks: ['Unclogged bathroom pipe in Room 101'] },
    '2026-07-20': { status: 'work', tasks: ['Washed dining hall', 'Sorted garbage bags'] },
    '2026-07-21': { status: 'work', tasks: ['Fixed loose wiring in corridor', 'Fitted wall hooks in Room 304'] },
    '2026-07-22': { status: 'absent', tasks: [] },
    '2026-07-23': { status: 'work', tasks: ['Assisted in LPG cylinder placement', 'Washed courtyard'] },
    '2026-07-24': { status: 'present', tasks: [] },
    '2026-07-25': { status: 'work', tasks: ['Room 305: Geyser switch sparking / MCB tripping', 'Room 103: AC remote not pairing'] },
  };

  // My Profile page states
  const [profilePic, setProfilePic] = useState(localStorage.getItem('febebo_profile_pic') || null);
  const [editPersonal, setEditPersonal] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.mobile || '+91 98000 12345');
  const [emailInput, setEmailInput] = useState(user?.name ? `${user.name.split(' ')[0].toLowerCase()}@febebo.com` : 'staff@febebo.com');
  const [addressInput, setAddressInput] = useState('H-42, Block C, Sector 62, Noida, UP - 201301');
  const [emergencyInput, setEmergencyInput] = useState('Pooja Devi (Wife) · +91 98111 22233');

  const [editProfessional, setEditProfessional] = useState(false);
  const [salaryInput, setSalaryInput] = useState('₹18,500');
  const [dojInput, setDojInput] = useState('15th Jan 2025');
  const [shiftInput, setShiftInput] = useState('09:00 AM - 06:00 PM');
  const [statusInput, setStatusInput] = useState('On Duty ✅');

  const [documentsList, setDocumentsList] = useState(() => {
    const saved = localStorage.getItem('febebo_docs');
    return saved ? JSON.parse(saved) : [
      { name: 'Aadhar Card', desc: 'Verification Complete', icon: 'badge', no: 'XXXX XXXX 8892', status: 'Verified', fileUrl: 'Aadhar_Card_Verified.pdf' },
      { name: 'PAN Card', desc: 'Verification Complete', icon: 'credit_card', no: 'ABCDE1234F', status: 'Verified', fileUrl: 'PAN_Card_Verified.pdf' },
      { name: 'Employment Agreement', desc: 'Agreement document unsigned', icon: 'description', no: 'Signed PDF', status: 'Unverified', fileUrl: '' }
    ];
  });

  const [previewDoc, setPreviewDoc] = useState(null); // { name, fileUrl, status }

  // Vendor system states for Purchase Manager
  const [vendors, setVendors] = useState(INIT_VENDORS);
  const [activeVendorCategory, setActiveVendorCategory] = useState('Groceries');
  const [searchVendorQuery, setSearchVendorQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null); 
  const [vendorLedger, setVendorLedger] = useState(INIT_VENDOR_LEDGER);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showPayVendorModal, setShowPayVendorModal] = useState(false);
  const [purchaseItemsState, setPurchaseItemsState] = useState([]); 
  const [purchaseDate, setPurchaseDate] = useState('24-07-2026');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI'); 
  const [paySenderUpi, setPaySenderUpi] = useState('');
  const [pmTab, setPmTab] = useState('requisitions'); // requisitions | vendors

  // Security
  const [visitors,setVisitors]  = useState(INIT_VISITORS);
  const [parcels,setParcels]    = useState(INIT_PARCELS);
  const [showVisitor,setShowVisitor]=useState(false);
  const [showParcel,setShowParcel]  =useState(false);
  const [vName,setVName]=useState(''); const [vPhone,setVPhone]=useState(''); const [vPurp,setVPurp]=useState('');
  const [pStu,setPStu]=useState('');   const [pRoom,setPRoom]=useState('');   const [pCarr,setPCarr]=useState('Amazon'); const [pTrk,setPTrk]=useState('');

  // Demand/Requisition (shared)
  const [showDemandList, setShowDemandList] = useState(false);
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [dItem,setDItem]=useState(''); const [dQty,setDQty]=useState(''); const [dNote,setDNote]=useState('');
  const [myDemands,setMyDemands]=useState([{id:1,item:'Basmati Rice 25kg',qty:'2 Bags',date:'22 Jul',status:'Approved'}]);

  // Send Item Request system
  const todayStr = new Date().toISOString().split('T')[0];
  const [showItemRequestModal, setShowItemRequestModal] = useState(false);
  const [itemReqSentList, setItemReqSentList] = useState([
    { id: 1, items: ['Rice (Regular) \u2014 5 kg', 'Dal (Chana) \u2014 2 kg', 'Turmeric Powder'], sendTo: 'Purchase Manager', date: '23 Jul 2026', status: 'Received', note: 'Monthly kitchen restock' },
    { id: 2, items: ['Cooking Oil (Sunflower) \u2014 3 L', 'Onions \u2014 4 kg', 'Tomatoes \u2014 2 kg'], sendTo: 'Admin', date: '21 Jul 2026', status: 'Pending', note: '' },
  ]);
  const [itemReqDate, setItemReqDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemReqSendTo, setItemReqSendTo] = useState('Purchase Manager');
  const [itemReqNote, setItemReqNote] = useState('');
  const [itemReqItems, setItemReqItems] = useState([]);
  const [itemReqCustomInput, setItemReqCustomInput] = useState('');
  const [itemReqCustomUnit, setItemReqCustomUnit] = useState('');
  const [itemReqAddingCustom, setItemReqAddingCustom] = useState(false);
  const [itemReqSearchQ, setItemReqSearchQ] = useState('');
  const [itemReqSentTab, setItemReqSentTab] = useState('new');

  // --- New Global States for 7-Feature Integration ---
  
  // 1. Leave Requests
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('Sick Leave');
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, date: '2026-07-28', reason: 'Sick Leave', status: 'Approved' },
    { id: 2, date: '2026-08-05', reason: 'Family Emergency', status: 'Pending' }
  ]);

  // 2. Gatekeeper / Visitor Log
  const [showGatekeeperModal, setShowGatekeeperModal] = useState(false);
  const [gkName, setGkName] = useState('');
  const [gkPhone, setGkPhone] = useState('');
  const [gkRoom, setGkRoom] = useState('');
  const [gkPurpose, setGkPurpose] = useState('');
  const [visitorLogs, setVisitorLogs] = useState([
    { id: 1, name: 'Ramesh Singh', phone: '9876543210', room: '102', purpose: 'Parent', timeIn: '10:30 AM', timeOut: null },
    { id: 2, name: 'Swiggy Delivery', phone: '', room: '304', purpose: 'Food', timeIn: '11:15 AM', timeOut: '11:20 AM' }
  ]);

  // 3. Meter Reading
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [meterRoom, setMeterRoom] = useState('101');
  const [meterElec, setMeterElec] = useState('');
  const [meterWater, setMeterWater] = useState('');
  const [meterReadings, setMeterReadings] = useState([
    { id: 1, room: '101', elec: '4502', water: '120', date: '25 Jul 2026' }
  ]);


  const RECIPIENTS = ['Purchase Manager', 'Admin', 'Manager', 'Store Incharge', 'Supervisor'];

  const openItemRequest = () => {
    const baseItems = ROLE_ITEM_LISTS[staffRole] || DEFAULT_ITEMS;
    setItemReqItems(baseItems.map(i => ({ ...i, checked: false, qty: '' })));
    setItemReqDate(new Date().toISOString().split('T')[0]);
    setItemReqSendTo('Purchase Manager');
    setItemReqNote('');
    setItemReqSearchQ('');
    setItemReqAddingCustom(false);
    setItemReqCustomInput('');
    setItemReqCustomUnit('');
    setShowItemRequestModal(true);
  };

  const addCustomItemToReq = () => {
    if (!itemReqCustomInput.trim()) return;
    const newCustom = {
      name: itemReqCustomInput.trim(),
      unit: itemReqCustomUnit.trim() || 'unit',
      cat: 'Custom',
      checked: true,
      qty: '',
      custom: true
    };
    setItemReqItems(prev => [...prev, newCustom]);
    setItemReqCustomInput('');
    setItemReqCustomUnit('');
    setItemReqAddingCustom(false);
  };

  const sendItemRequest = () => {
    const selected = itemReqItems.filter(i => i.checked);
    if (selected.length === 0) { alert('Please select at least one item.'); return; }
    const itemStrings = selected.map(i => i.qty ? (i.name + ' \u2014 ' + i.qty + ' ' + i.unit) : i.name);
    const req = {
      id: Date.now(),
      items: itemStrings,
      sendTo: itemReqSendTo,
      date: new Date(itemReqDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Pending',
      note: itemReqNote.trim()
    };
    setItemReqSentList(prev => [req, ...prev]);
    setShowItemRequestModal(false);
    alert('Item request sent to ' + itemReqSendTo + '!');
  };

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
    const newD = {
      id: Date.now(),
      item: dItem.trim(),
      qty: dQty || '1 unit',
      reqBy: `${staffName} (${staffRole})`,
      vendor: 'Pending Admin Assignment',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      status: 'Pending'
    };
    setMyDemands(p=>[newD, ...p]);
    setDemands(p=>[newD, ...p]);
    setDItem(''); setDQty(''); setDNote('');
    setShowDemandForm(false);
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
    {id:'performance', label:'Performance',  sub:'Feedback & Ratings', icon:'star',             grad:'#eef2ff'},
    {id:'requests',  label:'Requests',       sub:'Leave / Advance',  icon:'approval',               grad:'#eef2ff'},
  ];

  // ─── Role quick stats ─────────────────────────────────────────────────────
  const roleStats = {
  'Bus Driver':       [{l:'Passengers',v:6,icon:'groups'},{l:'Trips Today',v:2,icon:'directions_bus'},{l:'On Time',v:'100%',icon:'schedule'},{l:'Fuel Spent',v:'₹1,500',icon:'local_gas_station'}],
  'Bus Driver':       [{l:'Passengers',v:6,icon:'groups'},{l:'Trips Today',v:2,icon:'directions_bus'},{l:'On Time',v:'100%',icon:'schedule'},{l:'Fuel Spent',v:'₹1,500',icon:'local_gas_station'}],
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
            {id:'history',   icon:'history',                label:'Work History'},
            {id:'itemreq',   icon:'inventory',              label:'Request Items'},
            {id:'inventory', icon:'account_balance_wallet', label:'Inventory & Petty Cash'},
            {id:'inout',     icon:'schedule',               label:'Attendance'},
            {id:'salary',    icon:'payments',               label:'Salary & Pay'},
            {id:'items',     icon:'inventory_2',            label:'Item List'},
            {id:'chat',      icon:'forum',                  label:'Chat'},
            {id:'performance', icon:'star',                   label:'Performance & Feedback'},
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
        <div style={{background: 'linear-gradient(to bottom, #fffef2, #fffdf0)', padding:'0 16px 20px', color: '#1a1500', borderBottom: '1.5px solid #e8df9a'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:60, position:'relative'}}>
            <button onClick={()=>setSidebar(true)} style={{background: '#fefce8', border: '1.5px solid #e8df9a', borderRadius:12, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', zIndex:10}}>
              <span className="material-symbols-outlined" style={{fontSize:20, color: '#ca8a04'}}>menu</span>
            </button>
            <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5, pointerEvents:'none'}}>
              <p style={{fontFamily:"'Hanken Grotesk',sans-serif", fontSize:24, fontWeight:900, color: '#1a1500', margin:0, letterSpacing:-.5, pointerEvents:'auto'}}>febebo</p>
            </div>
            <button onClick={()=>setView('profile_view')} style={{background: '#fefce8', border: '1.5px solid #e8df9a', borderRadius:50, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', zIndex:10, overflow:'hidden', padding:0}}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                <span className="material-symbols-outlined" style={{fontSize:24, color: '#ca8a04'}}>person</span>
              )}
            </button>
          </div>

          {/* Greeting card */}
          <div style={{marginTop:14}}>
            <p style={{margin:0, fontSize:13, fontWeight:800, color:'#ca8a04', textTransform:'uppercase', letterSpacing:'0.04em'}}>{greet}, {firstName} 👋</p>
            <div style={{display:'flex', alignItems:'center', gap:10, marginTop:4}}>
              <div style={{width:40, height:40, borderRadius:12, background: meta.accentBg, border: '1.5px solid #e8df9a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}}>
                {meta.emoji}
              </div>
              <div>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                  <h2 style={{margin:0, fontSize:22, fontWeight:900, color: '#1a1500', letterSpacing:-.5}}>{meta.dept}</h2>
                  <span style={{fontSize:10, fontWeight:800, background: '#fefce8', color: '#ca8a04', padding:'3px 8px', borderRadius:8, border: '1.5px solid #e8df9a'}}>{staffRole}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Punch card */}
          <div style={{marginTop:18, background: '#ffffff', border: '1.5px solid #e8df9a', borderRadius:18, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow: '0 4px 16px rgba(120, 104, 10, 0.04)'}}>
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{position:'relative', display:'flex', height:10, width:10}}>
                  {clocked && (
                    <span style={{animation:'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', position:'absolute', display:'inline-flex', height:'100%', width:'100%', borderRadius:'50%', background:'#10b981', opacity:0.75}}></span>
                  )}
                  <span style={{position:'relative', display:'inline-flex', borderRadius:'50%', height:10, width:10, background: clocked ? '#10b981' : '#ef4444'}}></span>
                </span>
                <span style={{fontSize:14, fontWeight:800, color: '#1a1500'}}>{clocked ? 'On Duty' : 'Off Shift'}</span>
              </div>
              {clocked && (
                <span style={{fontSize:11, fontWeight:700, color: C.muted, marginLeft:18}}>Logged in at {clockIn}</span>
              )}
            </div>
            
            <button 
              onClick={punch} 
              style={{
                padding:'8px 16px', 
                borderRadius:12, 
                border: 'none', 
                background: clocked ? '#fee2e2' : '#dcfce7', 
                color: clocked ? '#991b1b' : '#166534', 
                fontSize:12, 
                fontWeight:900, 
                cursor:'pointer', 
                fontFamily:'inherit', 
                display:'flex', 
                alignItems:'center', 
                gap:6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <span className="material-symbols-outlined" style={{fontSize:16}}>
                {clocked ? 'logout' : 'login'}
              </span>
              {clocked ? 'Punch Out' : 'Punch In'}
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
            {view==='work'?'My Work':view==='history'?'Work History':view==='itemreq'?'Request Items':view==='inventory'?'Inventory & Petty Cash':view==='inout'?'Attendance':view==='salary'?'Salary & Pay':view==='items'?'Item List':view==='chat'?'Chat':view==='performance'?'Performance':view==='meter_reading'?'Meter Reading':view==='requests'?'Requests':'My Profile'}
          </p>
          {view==='items' && (
            <button onClick={()=>setShowDemandForm(true)} style={{background:C.primary,border: `1.5px solid ${C.border}`,borderRadius:10,padding:'6px 10px',color:'#000',fontSize:11,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',gap:4,boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
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
              {id:'performance',label:'Performance',    icon:'star',                   bg:'#fff1f2', c:'#f43f5e'},
              ...(['Electrician', 'Manager'].includes(staffRole) ? [{id:'meter_reading', label:'Meter', icon:'electric_meter', bg:'#ecfeff', c:'#06b6d4'}] : []),
              {id:'requests',  label:'Requests',       icon:'approval',               bg:'#f5f3ff', c:'#8b5cf6'},
              ...(staffRole === 'Cook' ? [{id:'foodMenu', label:'Food Menu', icon:'restaurant_menu', bg:'#ede9fe', c:'#a78bfa'}] : []),
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
          <div onClick={openItemRequest} style={{
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
      
      {/* ══════════════════════════════════════════════════════════════════════
          COOK HISTORY VIEW (GPAY STYLE)
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'cookHistory' && (() => {
        // Generate robust mock history from the 40 students
        const mockCookHistory = [];
        const mealsList = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
        const statList = ['Requested', 'To Pack', 'Extra Plate', 'Eaten', 'Not Eaten'];
        const uniqueFoodsSet = new Set(['Poha', 'Jalebi', 'Tea', 'Rajma Chawal', 'Roti, Salad', 'Samosa', 'Paneer Butter Masala', 'Aloo Paratha', 'Dal Makhani']);
        let _id = 1;
        
        // Generate a random history for all 40 students
        students.forEach((s, idx) => {
           // assign a few random meals to each student
           const mealCount = (idx % 3) + 1; // 1 to 3 meals
           for(let i=0; i<mealCount; i++) {
              const meal = mealsList[(idx + i) % mealsList.length];
              const status = statList[(idx * 2 + i) % statList.length];
              const food = Array.from(uniqueFoodsSet)[(idx + i) % uniqueFoodsSet.size];
              mockCookHistory.push({
                 id: _id++,
                 student: s.name,
                 meal: meal,
                 food: food,
                 status: status,
                 date: '26 Jul',
                 amount: 1
              });
           }
        });
        
        // Extract all unique foods for filter
        const uniqueFoods = ['All Food Items', ...Array.from(uniqueFoodsSet)];
        
        const filteredHist = mockCookHistory.filter(item => {
           if(cookHistStatus !== 'All' && item.status !== cookHistStatus) return false;
           if(cookHistMeal !== 'All Meals' && item.meal !== cookHistMeal) return false;
           if(cookHistFood !== 'All Food Items' && item.food !== cookHistFood) return false;
           return true;
        });

        return (
          <div style={{padding:'0 0 32px', display:'flex', flexDirection:'column', height:'100%'}}>
            {/* Header */}
            <div style={{background:C.primary, padding:'20px 14px 14px', position:'sticky', top:0, zIndex:10, display:'flex', alignItems:'center', gap:10}}>
              <button onClick={() => setView('work')} style={{background:'transparent', border:'none', padding:0, margin:0, cursor:'pointer', display:'flex', alignItems:'center'}}>
                <span className="material-symbols-outlined" style={{fontSize:24, color:'#000'}}>arrow_back</span>
              </button>
              <h2 style={{margin:0, fontSize:18, fontWeight:900, color:'#000'}}>Food Transaction History</h2>
            </div>
            
            {/* Filters */}
            <div style={{padding:'14px', display:'flex', gap:8, overflowX:'auto', borderBottom:'1px solid #f1f5f9', background:'#fff', whiteSpace:'nowrap'}}>
              {['All', 'Requested', 'To Pack', 'Extra Plate', 'Eaten', 'Not Eaten'].map(f => (
                <button key={f} onClick={() => setCookHistStatus(f)} style={{padding:'6px 14px', borderRadius:20, border:'1px solid #e2e8f0', background: cookHistStatus===f?'#1a1500':'#fff', color:cookHistStatus===f?'#fde047':'#1e293b', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
                  {f}
                </button>
              ))}
              <div style={{width:1, background:'#e2e8f0', margin:'0 4px'}} />
              <select value={cookHistMeal} onChange={e => setCookHistMeal(e.target.value)} style={{padding:'6px 12px', borderRadius:20, border:'1px solid #e2e8f0', background:'#fff', color:'#1e293b', fontSize:12, fontWeight:700, outline:'none', cursor:'pointer', fontFamily:'inherit'}}>
                <option>All Meals</option>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Snacks</option>
                <option>Dinner</option>
              </select>
              <select value={cookHistFood} onChange={e => setCookHistFood(e.target.value)} style={{padding:'6px 12px', borderRadius:20, border:'1px solid #e2e8f0', background:'#fff', color:'#1e293b', fontSize:12, fontWeight:700, outline:'none', cursor:'pointer', fontFamily:'inherit'}}>
                {uniqueFoods.map(food => <option key={food}>{food}</option>)}
              </select>
            </div>

            {/* List */}
            <div style={{padding:'14px', display:'flex', flexDirection:'column', gap:20}}>
              {filteredHist.length === 0 && (
                <div style={{textAlign:'center', padding:'30px 0'}}>
                  <p style={{margin:0, fontSize:14, color:'#64748b', fontWeight:700}}>No history found.</p>
                </div>
              )}
              {(() => {
                 const groupedHist = filteredHist.reduce((acc, item) => {
                    if (!acc[item.status]) acc[item.status] = [];
                    acc[item.status].push(item);
                    return acc;
                 }, {});

                 return Object.keys(groupedHist).map(statusKey => {
                    const groupItems = groupedHist[statusKey];
                    return (
                       <div key={statusKey} style={{display:'flex', flexDirection:'column', gap:12}}>
                          <h3 style={{margin:0, fontSize:16, fontWeight:900, color:'#000', paddingLeft:8}}>{statusKey} {groupItems.length}</h3>
                          {groupItems.map(item => {
                             const getColors = (status) => {
                               switch(status) {
                                 case 'Eaten': return { bg:'#dcfce7', c:'#15803d', icon:'restaurant' };
                                 case 'Not Eaten': return { bg:'#fee2e2', c:'#b91c1c', icon:'no_meals' };
                                 case 'To Pack': return { bg:'#fef08a', c:'#a16207', icon:'takeout_dining' };
                                 case 'Extra Plate': return { bg:'#e0e7ff', c:'#4338ca', icon:'local_dining' };
                                 default: return { bg:'#f1f5f9', c:'#475569', icon:'notifications' };
                               }
                             };
                             const clr = getColors(item.status);
                             const isExpanded = expandedCookHistId === item.id;
                             const isClickable = item.status === 'To Pack' || item.status === 'Extra Plate';
                             
                             return (
                               <div key={item.id} onClick={() => isClickable && setExpandedCookHistId(isExpanded ? null : item.id)} style={{display:'flex', flexDirection:'column', background:'#fff', borderRadius:16, border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.02)', cursor: isClickable ? 'pointer' : 'default', overflow:'hidden', transition:'all 0.2s'}}>
                                 <div style={{display:'flex', alignItems:'center', gap:14, padding:'14px 16px'}}>
                                   <div style={{width:42, height:42, borderRadius:21, background: clr.bg, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                     <span className="material-symbols-outlined" style={{fontSize:20, color: clr.c}}>{clr.icon}</span>
                                   </div>
                                   <div style={{flex:1}}>
                                     <p style={{margin:0, fontSize:15, fontWeight:800, color:'#1a1500'}}>{item.student}</p>
                                     <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#64748b'}}>{item.date} · {item.meal} {cookHistFood !== 'All Food Items' ? '· ' + item.food : ''}</p>
                                   </div>
                                   <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                                     <p style={{margin:0, fontSize:13, fontWeight:800, color: clr.c}}>{item.status}</p>
                                     {isClickable && <span className="material-symbols-outlined" style={{fontSize:16, color:C.muted, marginTop:4}}>{isExpanded ? 'expand_less' : 'expand_more'}</span>}
                                   </div>
                                 </div>
                                 
                                 {isExpanded && item.status === 'To Pack' && (
                                    <div style={{padding:'12px 16px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', fontSize:13, color:'#475569', fontWeight:600}}>
                                       <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}><span>Date Requested:</span> <span style={{fontWeight:800, color:'#000'}}>{item.date}</span></div>
                                       <div style={{display:'flex', justifyContent:'space-between'}}><span>Food Items:</span> <span style={{fontWeight:800, color:'#000'}}>{item.food} (x1)</span></div>
                                    </div>
                                 )}
                                 
                                 {isExpanded && item.status === 'Extra Plate' && (
                                    <div style={{padding:'12px 16px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', fontSize:13, color:'#475569', fontWeight:600}}>
                                       <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}><span>Visitor Name:</span> <span style={{fontWeight:800, color:'#000'}}>Guest of {item.student}</span></div>
                                       <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}><span>Food Items:</span> <span style={{fontWeight:800, color:'#000'}}>{item.food} (x1)</span></div>
                                       <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px dashed #cbd5e1', paddingTop:6, marginTop:2}}><span>Total Charge:</span> <span style={{fontWeight:900, color:'#10b981'}}>₹80</span></div>
                                    </div>
                                 )}
                               </div>
                             );
                          })}
                       </div>
                    );
                 });
              })()}
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          WEEKLY FOOD MENU
         ══════════════════════════════════════════════════════════════════════ */}
            {view === 'foodMenu' && (() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDateObj = new Date(selectedFoodMenuDate);
        const dayOfWeek = days[selectedDateObj.getDay()];
        const mealsForDay = weeklyFoodMenu[dayOfWeek];

        return (
          <div style={{padding:'0 0 32px', display:'flex', flexDirection:'column', height:'100%'}}>
            <div style={{background:C.primary, padding:'20px 14px 14px', position:'sticky', top:0, zIndex:10, display:'flex', alignItems:'center', gap:10}}>
              <button onClick={() => setView('home')} style={{background:'transparent', border:'none', padding:0, margin:0, cursor:'pointer', display:'flex', alignItems:'center'}}>
                <span className="material-symbols-outlined" style={{fontSize:24, color:'#000'}}>arrow_back</span>
              </button>
              <h2 style={{margin:0, fontSize:18, fontWeight:900, color:'#000'}}>Food Menu Timetable</h2>
            </div>
            
            <div style={{padding:'14px', display:'flex', flexDirection:'column', gap:16}}>
              
              {/* Date Picker */}
              <div style={{background:'#fff', borderRadius:16, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)', display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:44, height:44, borderRadius:22, background:'#fefce8', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span className="material-symbols-outlined" style={{fontSize:24, color:'#a16207'}}>calendar_month</span>
                </div>
                <div style={{flex:1}}>
                  <p style={{margin:0, fontSize:13, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Select Date</p>
                  <input 
                    type="date" 
                    value={selectedFoodMenuDate} 
                    onChange={e => setSelectedFoodMenuDate(e.target.value)} 
                    style={{border:'none', background:'transparent', fontSize:16, fontWeight:900, color:'#1e293b', outline:'none', width:'100%', fontFamily:'inherit', cursor:'pointer', marginTop:2}} 
                  />
                </div>
              </div>

              {/* Day's Menu */}
              <div style={{background:'#fff', borderRadius:16, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
                <h3 style={{margin:'0 0 12px', fontSize:16, fontWeight:900, color:'#000', borderBottom:'1px solid #f1f5f9', paddingBottom:8}}>{dayOfWeek}'s Menu</h3>
                
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                  <div key={meal} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0'}}>
                    <div style={{flex:1}}>
                      <span style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>{meal}</span>
                      <p style={{margin:'2px 0 0', fontSize:14, fontWeight:700, color:'#1e293b'}}>{mealsForDay[meal]}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditWeeklyMenuDay(dayOfWeek);
                        setEditWeeklyMenuMeal(meal);
                        setEditWeeklyMenuVal(mealsForDay[meal]);
                        setShowWeeklyMenuEdit(true);
                      }}
                      style={{background:C.bg, border: '1px solid #e2e8f0', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:800, color:C.sub, cursor:'pointer', display:'flex', alignItems:'center', gap:4}}>
                      <span className="material-symbols-outlined" style={{fontSize:14}}>edit</span> Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Modal */}
            {showWeeklyMenuEdit && (
              <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
                <div style={{background:'#fff', borderRadius:'24px 24px 0 0', padding:24, animation:'slideUp 0.3s ease'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                    <h3 style={{margin:0, fontSize:18, fontWeight:900, color:'#000'}}>Edit {editWeeklyMenuDay} {editWeeklyMenuMeal}</h3>
                    <span className="material-symbols-outlined" onClick={() => setShowWeeklyMenuEdit(false)} style={{cursor:'pointer', color:'#64748b'}}>close</span>
                  </div>
                  <input 
                    autoFocus 
                    type="text" 
                    value={editWeeklyMenuVal} 
                    onChange={e => setEditWeeklyMenuVal(e.target.value)} 
                    style={{width:'100%', padding:14, borderRadius:12, border:'2px solid #e2e8f0', fontSize:15, fontWeight:700, outline:'none', fontFamily:'inherit', marginBottom:16}} 
                  />
                  <button 
                    onClick={() => {
                       setWeeklyFoodMenu(prev => ({
                          ...prev,
                          [editWeeklyMenuDay]: {
                             ...prev[editWeeklyMenuDay],
                             [editWeeklyMenuMeal]: editWeeklyMenuVal
                          }
                       }));
                       setShowWeeklyMenuEdit(false);
                    }}
                    style={{width:'100%', padding:16, borderRadius:14, background:'#000', color:C.primary, fontSize:15, fontWeight:800, border:'none', cursor:'pointer', fontFamily:'inherit'}}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {view === 'work' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:14}}>

          {/* COOK */}
          {staffRole === 'Cook' && (<>
            {/* LIVE MESS HEADCOUNT CARD */}
            <div style={{background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius:20, padding:'24px', color:'#fff', boxShadow:'0 10px 25px rgba(15,23,42,0.15)', display:'flex', flexDirection:'column', gap:16, position:'relative', overflow:'hidden', marginBottom:14}}>
               <div style={{position:'absolute', right:-10, bottom:-10, opacity:0.1, pointerEvents:'none'}}>
                  <span className="material-symbols-outlined" style={{fontSize:120}}>group</span>
               </div>
               <div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                     <span style={{position:'relative', display:'flex', height:10, width:10}}>
                       <span style={{animation:'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', position:'absolute', display:'inline-flex', height:'100%', width:'100%', borderRadius:'50%', background:'#ef4444', opacity:0.75}}></span>
                       <span style={{position:'relative', display:'inline-flex', borderRadius:'50%', height:10, width:10, background:'#dc2626'}}></span>
                     </span>
                     <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:1, color:'#f8fafc'}}>Live Headcount</span>
                  </div>
                  <h3 style={{margin:'6px 0 0', fontSize:18, fontWeight:900, color:'#f8fafc'}}>Students in Mess Hall</h3>
               </div>
               <div style={{display:'flex', alignItems:'flex-end', gap:12}}>
                  <h1 style={{margin:0, fontSize:56, fontWeight:900, lineHeight:1, color:'#fde047'}}>{students.filter(s=>s.statusB==='eaten').length}</h1>
                  <p style={{margin:'0 0 8px', fontSize:14, fontWeight:700, color:'#94a3b8'}}>/ 40 Eaten Today</p>
               </div>
            </div>

            {/* 🌾 SMART KITCHEN INGREDIENT ESTIMATOR */}
            <div style={{background:'#fff', borderRadius:18, border:'1.5px solid #e2e8f0', padding:'16px', boxShadow:'0 4px 14px rgba(15,23,42,0.04)', marginBottom:14}}>
               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                  <div>
                     <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', color:'#0284c7', letterSpacing:0.5}}>🌾 Smart Kitchen Estimator</span>
                     <h3 style={{margin:'2px 0 0', fontSize:16, fontWeight:900, color:'#0f172a'}}>Required Raw Ingredients</h3>
                  </div>
                  <button onClick={()=>setShowRefillModal(true)} style={{padding:'6px 12px', background:'#0284c7', color:'#fff', border:'none', borderRadius:10, fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(2,132,199,0.2)'}}>
                     + Request Refill
                  </button>
               </div>

               <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8}}>
                  {(() => {
                     const count = students.filter(s=>s.statusB==='eaten').length || 32;
                     return [
                        { label: 'Rice', qty: (count * 0.125).toFixed(1) + ' kg', icon: 'rice_bowl' },
                        { label: 'Atta/Roti', qty: (count * 0.10).toFixed(1) + ' kg', icon: 'bakery_dining' },
                        { label: 'Dal', qty: (count * 0.08).toFixed(1) + ' kg', icon: 'soup_kitchen' },
                        { label: 'Veggies', qty: (count * 0.15).toFixed(1) + ' kg', icon: 'nutrition' },
                     ].map(i => (
                        <div key={i.label} style={{background:'#f8fafc', borderRadius:12, padding:'10px 8px', textAlign:'center', border:'1px solid #f1f5f9'}}>
                           <span className="material-symbols-outlined" style={{fontSize:18, color:'#0284c7'}}>{i.icon}</span>
                           <p style={{margin:'2px 0 0', fontSize:14, fontWeight:900, color:'#0f172a'}}>{i.qty}</p>
                           <p style={{margin:'1px 0 0', fontSize:10, fontWeight:700, color:'#64748b'}}>{i.label}</p>
                        </div>
                     ));
                  })()}
               </div>
            </div>

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
                  <button key={f} onClick={()=>{ if(f==='Weekly' || f==='Monthly') { setView('cookHistory'); } else { setTimeFilter(f); } }} style={{flex:1, padding:'6px 0', borderRadius:8, border:timeFilter===f?'2px solid #000':'2px solid transparent', background:timeFilter===f?C.primary:'transparent', color:'#000', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
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

          {/* CLEANER ROLE - REDESIGNED */}
          {staffRole === 'Cleaner' && (() => {
            const mult = cleanerTimeFilter === 'Monthly' ? 30 : cleanerTimeFilter === 'Weekly' ? 7 : 1;
            const activeSlots = cleaning.filter(c => c.slotStatus === 'active');
            const upcomingSlots = cleaning.filter(c => c.slotStatus === 'upcoming');
            const completedSlots = cleaning.filter(c => c.done);
            const pendingSlots = cleaning.filter(c => !c.done);

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
                {/* Today Header */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div>
                    <p style={{margin:0, fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1}}>Today's Schedule</p>
                    <h2 style={{margin:'2px 0 0', fontSize:22, fontWeight:900, color:'#0f172a'}}>Cleaning Jobs</h2>
                  </div>
                  <input type="date" value={cleanerDate} onChange={e=>setCleanerDate(e.target.value)}
                    style={{border:'1.5px solid #e2e8f0', borderRadius:10, padding:'8px 12px', fontSize:13, fontWeight:700, color:'#0f172a', fontFamily:'inherit', background:'#fff', outline:'none', cursor:'pointer'}} />
                </div>

                {/* Stats Row */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10}}>
                  {[
                    {label:'Done', value: completedSlots.length, onClick: ()=>setCleanerSlotFilter('completed'), active: cleanerSlotFilter==='completed', bg:'#f0fdf4', activeBg:'#dcfce7', c:'#15803d'},
                    {label:'Active', value: activeSlots.length,  onClick: ()=>setCleanerSlotFilter('active'),    active: cleanerSlotFilter==='active',    bg:'#fefce8', activeBg:'#fde047', c:'#92400e'},
                    {label:'Pending', value: pendingSlots.length, onClick: ()=>setCleanerSlotFilter('all'),     active: cleanerSlotFilter==='all',       bg:'#f8fafc', activeBg:'#f1f5f9', c:'#475569'},
                  ].map(s => (
                    <div key={s.label} onClick={s.onClick} style={{
                      background: s.active ? s.activeBg : s.bg,
                      borderRadius:16, padding:'16px 12px', textAlign:'center', cursor:'pointer',
                      border: s.active ? `2px solid ${s.c}33` : '1.5px solid #e2e8f0',
                      transition:'all 0.15s'
                    }}>
                      <p style={{margin:0, fontSize:28, fontWeight:900, color: s.active ? s.c : '#0f172a'}}>{s.value}</p>
                      <p style={{margin:'4px 0 0', fontSize:11, fontWeight:800, color: s.active ? s.c : '#94a3b8', textTransform:'uppercase', letterSpacing:0.5}}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Move-Out Inspection Banner */}
                <div onClick={()=>setShowMoveOutModal(true)} style={{background:'#0f172a', borderRadius:16, padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}>
                  <div>
                    <p style={{margin:0, fontSize:11, fontWeight:800, color:'#fde047', textTransform:'uppercase', letterSpacing:1}}>Move-Out</p>
                    <p style={{margin:'2px 0 0', fontSize:15, fontWeight:900, color:'#f8fafc'}}>Start Room Inspection</p>
                  </div>
                  <div style={{width:40, height:40, borderRadius:20, background:'rgba(253,224,71,0.15)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <span className="material-symbols-outlined" style={{fontSize:20, color:'#fde047'}}>checklist</span>
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{display:'flex', gap:6, overflowX:'auto'}}>
                  {[
                    {id:'all', label:'All'},
                    {id:'active', label:'Active Now'},
                    {id:'upcoming', label:'Upcoming'},
                    {id:'completed', label:'Cleaned'},
                  ].map(tab => (
                    <button key={tab.id} onClick={()=>setCleanerSlotFilter(tab.id)} style={{
                      padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', border:'none',
                      background: cleanerSlotFilter === tab.id ? '#0f172a' : '#f1f5f9',
                      color: cleanerSlotFilter === tab.id ? '#fde047' : '#64748b',
                      transition:'all 0.15s'
                    }}>
                      {tab.label}
                    </button>
                  ))}
                  <div style={{width:'1px', background:'#e2e8f0', flexShrink:0, margin:'4px 0'}}/>
                  {['All', 'Full Room', 'Dusting', 'Mopping', 'Bathroom'].map(t => (
                    <button key={t} onClick={()=>setCleanerTypeFilter(t)} style={{
                      padding:'7px 14px', borderRadius:20, fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                      background: cleanerTypeFilter === t ? '#fde047' : 'transparent',
                      color: cleanerTypeFilter === t ? '#78350f' : '#94a3b8',
                      border: cleanerTypeFilter === t ? 'none' : '1px solid #e2e8f0',
                      transition:'all 0.15s'
                    }}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Job Cards */}
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {filteredList.length === 0 && (
                    <div style={{background:'#f8fafc', borderRadius:16, padding:'32px 16px', textAlign:'center'}}>
                      <span className="material-symbols-outlined" style={{fontSize:36, color:'#cbd5e1'}}>mop</span>
                      <p style={{margin:'8px 0 0', fontSize:14, color:'#94a3b8', fontWeight:700}}>All clear! No rooms in this filter.</p>
                    </div>
                  )}
                  {filteredList.map(slot => (
                    <div key={slot.id} style={{background:'#fff', borderRadius:18, border: slot.done ? '1.5px solid #86efac' : slot.slotStatus==='active' ? '1.5px solid #fde047' : '1.5px solid #e2e8f0', padding:'16px 16px 14px', boxShadow:'0 2px 12px rgba(15,23,42,0.04)'}}>
                      
                      {/* Top row */}
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <div>
                          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                            <span style={{fontSize:17, fontWeight:900, color:'#0f172a'}}>Room {slot.room}</span>
                            <span style={{fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:20, background: slot.done ? '#dcfce7' : slot.slotStatus==='active' ? '#fef08a' : '#f1f5f9', color: slot.done ? '#15803d' : slot.slotStatus==='active' ? '#92400e' : '#64748b'}}>
                              {slot.done ? '✓ Cleaned' : slot.slotStatus === 'active' ? '● Active' : '○ Upcoming'}
                            </span>
                          </div>
                          <p style={{margin:0, fontSize:12, fontWeight:700, color:'#64748b'}}>{slot.type}</p>
                        </div>
                        <span style={{fontSize:11, fontWeight:700, color:'#94a3b8', textAlign:'right', marginTop:2}}>
                          {slot.slot}
                        </span>
                      </div>

                      {/* Divider */}
                      <div style={{height:'1px', background:'#f1f5f9', margin:'12px 0'}}/>

                      {/* Bottom row */}
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <div style={{width:28, height:28, borderRadius:14, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <span className="material-symbols-outlined" style={{fontSize:15, color:'#64748b'}}>person</span>
                          </div>
                          <div>
                            <p style={{margin:0, fontSize:13, fontWeight:800, color:'#0f172a'}}>{slot.student}</p>
                            {slot.note && <p style={{margin:'1px 0 0', fontSize:11, color:'#94a3b8', fontWeight:600}}>"{slot.note}"</p>}
                          </div>
                        </div>
                        <div style={{display:'flex', gap:8, alignItems:'center'}}>
                          <a href={`tel:${slot.phone.replace(/\s+/g, '')}`}
                            style={{width:36, height:36, borderRadius:18, background:'#f0fdf4', border:'1px solid #dcfce7', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}}>
                            <span className="material-symbols-outlined" style={{fontSize:18, color:'#16a34a'}}>phone</span>
                          </a>
                          {!slot.done && (
                            <button onClick={() => setCleaning(prev => prev.map(c => c.id === slot.id ? {...c, done:true, slotStatus:'completed'} : c))}
                              style={{padding:'8px 16px', borderRadius:12, border:'none', background:'#0f172a', color:'#fde047', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                              Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weekly/Monthly Summary at the bottom */}
                {cleanerTimeFilter !== 'Daily' && (
                  <div style={{background:'#f8fafc', borderRadius:18, padding:'18px', border:'1.5px solid #e2e8f0'}}>
                    <p style={{margin:'0 0 14px', fontSize:13, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5}}>{cleanerTimeFilter} Summary</p>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                      <div style={{background:'#dcfce7', borderRadius:14, padding:'14px', textAlign:'center'}}>
                        <p style={{fontSize:30, fontWeight:900, color:'#15803d', margin:0}}>{completedSlots.length * mult}</p>
                        <p style={{fontSize:11, fontWeight:800, color:'#15803d', margin:'4px 0 0', textTransform:'uppercase'}}>Cleaned</p>
                      </div>
                      <div style={{background:'#fee2e2', borderRadius:14, padding:'14px', textAlign:'center'}}>
                        <p style={{fontSize:30, fontWeight:900, color:'#b91c1c', margin:0}}>{(cleaning.length - completedSlots.length) * mult}</p>
                        <p style={{fontSize:11, fontWeight:800, color:'#b91c1c', margin:'4px 0 0', textTransform:'uppercase'}}>Pending</p>
                      </div>
                    </div>
                  </div>
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
            {/* Tab Navigation */}
            <div style={{display:'flex', background:'#fff', borderRadius:12, padding:4, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(15,23,42,0.04)', marginBottom:14}}>
              <button onClick={()=>setPmTab('requisitions')} style={{flex:1, padding:'10px 0', borderRadius:10, border:'none', background: pmTab==='requisitions' ? '#fde047' : 'transparent', color: pmTab==='requisitions' ? '#78680a' : C.muted, fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                🛒 Requisitions ({demands.filter(d=>d.status==='Pending').length})
              </button>
              <button onClick={()=>setPmTab('vendors')} style={{flex:1, padding:'10px 0', borderRadius:10, border:'none', background: pmTab==='vendors' ? '#fde047' : 'transparent', color: pmTab==='vendors' ? '#78680a' : C.muted, fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                🏢 Vendors ({vendors.length})
              </button>
            </div>

            {/* TAB 1: REQUISITIONS */}
            {pmTab === 'requisitions' && (
              <div style={{background:'#fff',borderRadius:18,border: `1px solid ${C.border}`,padding:16, boxShadow:'0 4px 12px rgba(120, 104, 10, 0.04)'}}>
                <p style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:C.text}}>📋 Staff Item Requisitions</p>
                {demands.map(d=>(
                  <div key={d.id} style={{background:C.bg,border: `1px solid ${C.border}`,borderRadius:14,padding:12,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontSize:14,fontWeight:800,color:C.text}}>{d.item}</p>
                      <p style={{margin:'3px 0 0',fontSize:11,color:C.muted}}>Qty: {d.qty} · {d.reqBy} · {d.date}</p>
                      <p style={{margin:'2px 0 0',fontSize:11,color:C.muted}}>Vendor: {d.vendor}</p>
                    </div>
                    {d.status==='Pending' ? (
                      <button onClick={()=>setDemands(p=>p.map(x=>x.id===d.id?{...x,status:'PO Sent'}:x))} style={{padding:'8px 12px',background:meta.accentBg,border:`1.5px solid ${meta.accent}`,borderRadius:10,color:meta.accent,fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Create PO 📦</button>
                    ) : (
                      <Chip label="PO Sent ✓" color={C.success} bg={C.successBg}/>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: VENDOR ACCOUNT & LEDGER GRID */}
            {pmTab === 'vendors' && !selectedVendor && (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                {/* Total amount card */}
                <div style={{background:'#ffffff', border:`1px solid ${C.border}`, borderRadius:18, padding:'16px 20px', boxShadow:'0 4px 12px rgba(120,104,10,0.03)'}}>
                  <p style={{margin:0, fontSize:12, fontWeight:800, color:C.muted, textTransform:'uppercase', letterSpacing:0.5}}>Total Outstanding Payable</p>
                  <h2 style={{margin:'4px 0 0', fontSize:32, fontWeight:900, color:'#b91c1c'}}>₹{vendors.reduce((s, v)=>s+v.balance, 0).toLocaleString()}</h2>
                </div>

                {/* Search Bar */}
                <div style={{position:'relative', display:'flex', alignItems:'center'}}>
                  <span className="material-symbols-outlined" style={{position:'absolute', left:14, color:C.muted, fontSize:20}}>search</span>
                  <input 
                    type="text"
                    placeholder="Search Vendor"
                    value={searchVendorQuery}
                    onChange={e=>setSearchVendorQuery(e.target.value)}
                    style={{width:'100%', padding:'12px 14px 12px 42px', border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:14, background:'#fff', color:C.text, outline:'none'}}
                  />
                </div>

                {/* Category Selector pills */}
                <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4, margin:'0 -2px'}}>
                  {['Groceries', 'Laundry', 'Vegetables', 'Dairy', 'Water'].map(cat => (
                    <button 
                      key={cat}
                      onClick={()=>setActiveVendorCategory(cat)}
                      style={{
                        padding:'8px 16px', borderRadius:20, border: activeVendorCategory===cat ? 'none' : `1px solid ${C.border}`,
                        background: activeVendorCategory===cat ? '#0891b2' : '#fff',
                        color: activeVendorCategory===cat ? '#fff' : C.text,
                        fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Vendor List */}
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {vendors
                    .filter(v => v.category === activeVendorCategory && v.name.toLowerCase().includes(searchVendorQuery.toLowerCase()))
                    .map(v => (
                      <div 
                        key={v.id}
                        onClick={() => setSelectedVendor(v)}
                        style={{background:'#fff', border:`1px solid ${C.border}`, borderRadius:18, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 12px rgba(120,104,10,0.03)', cursor:'pointer'}}
                      >
                        <div>
                          <p style={{margin:0, fontSize:11, fontWeight:800, color:'#0891b2', textTransform:'uppercase'}}>{v.category} · {v.shop}</p>
                          <h4 style={{margin:'4px 0 2px', fontSize:16, fontWeight:900, color:C.text}}>{v.name}</h4>
                          <p style={{margin:0, fontSize:12, color:C.muted}}>Outstanding Balance: ₹{v.balance.toLocaleString()}</p>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:4}}>
                          <span style={{fontSize:16, fontWeight:900, color:C.text}}>₹{v.balance.toLocaleString()}</span>
                          <span className="material-symbols-outlined" style={{fontSize:20, color:C.muted}}>chevron_right</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* VENDOR DETAIL PAGE (Screenshot 5 / Ledger layout) */}
            {pmTab === 'vendors' && selectedVendor && (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                {/* Back Navigation header */}
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <button onClick={() => setSelectedVendor(null)} style={{background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyCenter:'center', cursor:'pointer'}}>
                    <span className="material-symbols-outlined" style={{fontSize:20}}>arrow_back</span>
                  </button>
                  <div>
                    <h3 style={{margin:0, fontSize:18, fontWeight:900}}>{selectedVendor.name} Account</h3>
                    <p style={{margin:0, fontSize:11.5, color:C.muted}}>{selectedVendor.shop} · {selectedVendor.category}</p>
                  </div>
                </div>

                {/* Warning message card */}
                {selectedVendor.balance > 0 && (
                  <div onClick={() => {
                    setPayAmount(String(selectedVendor.balance));
                    setShowPayVendorModal(true);
                  }} style={{background:'#ffe4e6', border:'1px solid #fecaca', borderRadius:14, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <span className="material-symbols-outlined" style={{fontSize:18, color:'#dc2626'}}>warning</span>
                      <span style={{fontSize:12.5, fontWeight:800, color:'#b91c1c'}}>Pending Amount — Tap to Clear</span>
                    </div>
                    <span style={{fontSize:13, fontWeight:900, color:'#b91c1c'}}>₹{selectedVendor.balance.toLocaleString()}</span>
                  </div>
                )}

                {/* Total amount card */}
                <div style={{background:'#ffffff', border:`1px solid ${C.border}`, borderRadius:18, padding:'16px 20px', boxShadow:'0 4px 12px rgba(120,104,10,0.03)'}}>
                  <p style={{margin:0, fontSize:12, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Total Account Balance</p>
                  <h2 style={{margin:'4px 0 0', fontSize:32, fontWeight:900, color:C.text}}>₹{selectedVendor.balance.toLocaleString()}</h2>
                </div>

                {/* Transactions Ledger header */}
                <p style={{margin:'4px 0 0', fontSize:14, fontWeight:900, color:C.text}}>📄 Statement & Ledger History</p>

                {/* Transaction history list */}
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {vendorLedger
                    .filter(l => l.vendorId === selectedVendor.id)
                    .map(l => (
                      <div key={l.id} style={{background:'#fff', border:`1px solid ${C.border}`, borderRadius:16, padding:14, boxShadow:'0 2px 8px rgba(120,104,10,0.03)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}}>
                          <div>
                            <span style={{fontSize:11, fontWeight:800, background: l.type==='Purchase'?'#fee2e2':'#dcfce7', color: l.type==='Purchase'?'#b91c1c':'#166534', padding:'2px 8px', borderRadius:6}}>{l.type}</span>
                            <h5 style={{margin:'6px 0 2px', fontSize:14, fontWeight:900, color:C.text}}>{l.desc}</h5>
                            <p style={{margin:0, fontSize:11, color:C.muted}}>{l.date} · Method: {l.pm}</p>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <p style={{margin:0, fontSize:15, fontWeight:900, color: l.type==='Purchase'?'#b91c1c':'#166534'}}>{l.type==='Purchase'?'+':'-'} ₹{l.amount.toLocaleString()}</p>
                            <span style={{fontSize:9.5, fontWeight:800, color: l.status==='Approved'?'#166534':'#d97706'}}>{l.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Bottom Action buttons */}
                <div style={{display:'flex', gap:10, marginTop:10}}>
                  <button 
                    onClick={() => {
                      const items = INIT_ITEMS_BY_CATEGORY[selectedVendor.category] || [];
                      setPurchaseItemsState(items.map(i => ({...i, qty: 10, checked: false})));
                      setShowAddPurchaseModal(true);
                    }} 
                    style={{flex:1, padding:13, background:'#0891b2', border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}
                  >
                    🛒 Add Purchase
                  </button>
                  <button 
                    onClick={() => {
                      setPayAmount(String(selectedVendor.balance));
                      setShowPayVendorModal(true);
                    }} 
                    style={{flex:1, padding:13, background:'#fde047', border:`1px solid ${C.border}`, borderRadius:12, color:'#78680a', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}
                  >
                    💵 Pay Vendor
                  </button>
                </div>
              </div>
            )}
          </>)}

          {/* SECURITY */}
          {staffRole === 'Security Guard' && (<>
            
            {/* Gatekeeper Hero */}
            <div style={{background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius:20, padding:'24px', color:'#fff', boxShadow:'0 10px 25px rgba(15,23,42,0.15)', display:'flex', flexDirection:'column', gap:16, position:'relative', overflow:'hidden'}}>
               <div style={{position:'absolute', right:-10, bottom:-10, opacity:0.1, pointerEvents:'none'}}>
                  <span className="material-symbols-outlined" style={{fontSize:120}}>shield_person</span>
               </div>
               <div>
                  <h2 style={{margin:0, fontSize:22, fontWeight:900, color:'#f8fafc'}}>Gatekeeper</h2>
                  <p style={{margin:'2px 0 0', fontSize:13, fontWeight:600, color:'#94a3b8'}}>Manage entries & exits securely.</p>
               </div>
               <button onClick={()=>setShowGatekeeperModal(true)} style={{padding:'14px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:14, fontWeight:900, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', zIndex:5, boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>
                  <span className="material-symbols-outlined" style={{fontSize:20}}>person_add</span> Log New Visitor
               </button>
            </div>

            {/* Current Visitors Inside */}
            <div style={{marginTop:16}}>
               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                  <h3 style={{margin:0, fontSize:16, fontWeight:900, color:'#1e293b'}}>Current Visitors Inside</h3>
                  <span style={{background:'#dbeafe', color:'#1d4ed8', padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:800}}>{visitorLogs.filter(v=>!v.timeOut).length} Inside</span>
               </div>
               <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {visitorLogs.map(v => (
                     <div key={v.id} style={{background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.02)', display:'flex', justifyContent:'space-between', alignItems:'center', opacity: v.timeOut ? 0.6 : 1}}>
                        <div>
                           <div style={{display:'flex', alignItems:'center', gap:6}}>
                              <span style={{fontSize:15, fontWeight:900, color:'#0f172a'}}>{v.name}</span>
                              {!v.timeOut && <span style={{width:8, height:8, borderRadius:4, background:'#22c55e'}}></span>}
                           </div>
                           <p style={{margin:'4px 0 0', fontSize:13, fontWeight:700, color:'#64748b'}}>Visiting Room {v.room} · {v.purpose}</p>
                           <p style={{margin:'4px 0 0', fontSize:11, fontWeight:600, color:'#94a3b8'}}>In: {v.timeIn} {v.timeOut && `| Out: ${v.timeOut}`}</p>
                        </div>
                        {!v.timeOut && (
                           <button onClick={()=>{
                              setVisitorLogs(prev => prev.map(log => log.id === v.id ? {...log, timeOut: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} : log));
                           }} style={{padding:'8px 16px', background:'#fee2e2', color:'#b91c1c', border:'none', borderRadius:10, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                              Mark Exited
                           </button>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Modal for New Visitor */}
            {showGatekeeperModal && (
               <div style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end', animation:'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'}}>
                 <div style={{background:'#fff', padding:'24px 20px 32px', borderTopLeftRadius:24, borderTopRightRadius:24, display:'flex', flexDirection:'column', gap:16}}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                     <p style={{margin:0, fontSize:18, fontWeight:900, color:'#1a1500'}}>New Visitor Entry</p>
                     <button onClick={() => setShowGatekeeperModal(false)} style={{background:'#f8fafc', border:'none', borderRadius:10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
                       <span className="material-symbols-outlined" style={{fontSize:18, color:'#64748b'}}>close</span>
                     </button>
                   </div>
                   
                   <div style={{display:'flex', flexDirection:'column', gap:12}}>
                     <input type="text" placeholder="Visitor Name" value={gkName} onChange={e=>setGkName(e.target.value)} style={{padding:'14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:15, fontWeight:600}} />
                     <input type="tel" placeholder="Phone Number" value={gkPhone} onChange={e=>setGkPhone(e.target.value)} style={{padding:'14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:15, fontWeight:600}} />
                     <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                        <input type="text" placeholder="Room No." value={gkRoom} onChange={e=>setGkRoom(e.target.value)} style={{padding:'14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:15, fontWeight:600}} />
                        <select value={gkPurpose} onChange={e=>setGkPurpose(e.target.value)} style={{padding:'14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:15, fontWeight:600}}>
                           <option value="" disabled>Purpose</option>
                           <option value="Parent/Family">Parent/Family</option>
                           <option value="Delivery">Delivery</option>
                           <option value="Guest">Guest</option>
                        </select>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => {
                       if(!gkName || !gkRoom) return alert('Name and Room are required');
                       setVisitorLogs([{ id: Date.now(), name: gkName, phone: gkPhone, room: gkRoom, purpose: gkPurpose, timeIn: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}), timeOut: null }, ...visitorLogs]);
                       setShowGatekeeperModal(false);
                       setGkName(''); setGkPhone(''); setGkRoom(''); setGkPurpose('');
                       alert("Alert sent to Student and Admin!");
                     }}
                     style={{marginTop:10, padding:'14px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}
                   >
                     Allow Entry & Notify
                   </button>
                 </div>
               </div>
            )}
          </>)}

          {/* 🚌 BUS DRIVER ROLE VIEW */}
          {(staffRole === 'Bus Driver' || staffRole === 'Driver' || staffRole === 'Shuttle Driver') && (() => {
             return (
                <div style={{display:'flex', flexDirection:'column', gap:14}}>
                   {/* Driver Route Card */}
                   <div style={{background:'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius:20, padding:'20px', color:'#fff', boxShadow:'0 8px 20px rgba(15,23,42,0.15)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                         <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', color:'#fde047', letterSpacing:1}}>🚌 Route #1 · Campus Express</span>
                         <span style={{fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:6, background:'#22c55e', color:'#fff'}}>ON TRIP</span>
                      </div>
                      <h2 style={{margin:0, fontSize:22, fontWeight:900, color:'#fff'}}>PG Hostel ➔ Sector 62 Metro</h2>
                      <p style={{margin:'4px 0 0', fontSize:12, fontWeight:600, color:'#94a3b8'}}>Morning Shift: 08:00 AM – 09:30 AM | Bus: UP 16 AB 4021</p>
                      
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16}}>
                         <button onClick={()=>setShowFuelModal(true)} style={{padding:'10px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, color:'#fff', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                            <span className="material-symbols-outlined" style={{fontSize:16}}>local_gas_station</span> Log Fuel Expense
                         </button>
                         <button onClick={()=>alert('📢 Broadcast notification sent to all 6 shuttle passengers!')} style={{padding:'10px', background:'#fde047', border:'none', borderRadius:12, color:'#0f172a', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                            <span className="material-symbols-outlined" style={{fontSize:16}}>campaign</span> Alert Passengers
                         </button>
                      </div>
                   </div>

                   {/* Student Passenger Roster */}
                   <div style={{background:'#fff', borderRadius:18, border:'1.5px solid #e2e8f0', padding:'16px', boxShadow:'0 4px 14px rgba(15,23,42,0.04)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                         <div>
                            <h3 style={{margin:0, fontSize:16, fontWeight:900, color:'#0f172a'}}>Passenger Checklist</h3>
                            <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#64748b'}}>{passengers.filter(p=>p.status==='Boarded').length} / {passengers.length} Boarded</p>
                         </div>
                         <span style={{fontSize:12, fontWeight:800, padding:'4px 10px', borderRadius:20, background:'#f1f5f9', color:'#475569'}}>{passengers.length} Total</span>
                      </div>

                      <div style={{display:'flex', flexDirection:'column', gap:10}}>
                         {passengers.map(p => (
                            <div key={p.id} style={{background:'#f8fafc', borderRadius:14, padding:'12px 14px', border:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                               <div>
                                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                                     <span style={{fontSize:14, fontWeight:900, color:'#0f172a'}}>{p.name}</span>
                                     <span style={{fontSize:11, fontWeight:700, color:'#64748b'}}>Rm {p.room}</span>
                                  </div>
                                  <p style={{margin:'2px 0 0', fontSize:11, fontWeight:600, color:'#94a3b8'}}>Pickup: {p.time}</p>
                               </div>
                               <div style={{display:'flex', gap:6, alignItems:'center'}}>
                                  <a href={`tel:${p.phone}`} style={{width:32, height:32, borderRadius:10, background:'#e0f2fe', color:'#0369a1', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}}>
                                     <span className="material-symbols-outlined" style={{fontSize:16}}>phone</span>
                                  </a>
                                  <button onClick={()=>{
                                     setPassengers(prev => prev.map(x => x.id === p.id ? {...x, status: x.status==='Boarded' ? 'Waiting' : x.status==='Waiting' ? 'Absent' : 'Boarded'} : x));
                                  }} style={{padding:'6px 12px', borderRadius:8, border:'none', background: p.status==='Boarded' ? '#dcfce7' : p.status==='Waiting' ? '#fef08a' : '#fee2e2', color: p.status==='Boarded' ? '#15803d' : p.status==='Waiting' ? '#92400e' : '#b91c1c', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                                     {p.status}
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             );
          })()}

          {/* 🚌 BUS DRIVER ROLE VIEW */}
          {(staffRole === 'Bus Driver' || staffRole === 'Driver' || staffRole === 'Shuttle Driver') && (() => {
             return (
                <div style={{display:'flex', flexDirection:'column', gap:14}}>
                   {/* Driver Route Card */}
                   <div style={{background:'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius:20, padding:'20px', color:'#fff', boxShadow:'0 8px 20px rgba(15,23,42,0.15)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                         <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', color:'#fde047', letterSpacing:1}}>🚌 Route #1 · Campus Express</span>
                         <span style={{fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:6, background:'#22c55e', color:'#fff'}}>ON TRIP</span>
                      </div>
                      <h2 style={{margin:0, fontSize:22, fontWeight:900, color:'#fff'}}>PG Hostel ➔ Sector 62 Metro</h2>
                      <p style={{margin:'4px 0 0', fontSize:12, fontWeight:600, color:'#94a3b8'}}>Morning Shift: 08:00 AM – 09:30 AM | Bus: UP 16 AB 4021</p>
                      
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16}}>
                         <button onClick={()=>setShowFuelModal(true)} style={{padding:'10px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, color:'#fff', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                            <span className="material-symbols-outlined" style={{fontSize:16}}>local_gas_station</span> Log Fuel Expense
                         </button>
                         <button onClick={()=>alert('📢 Broadcast notification sent to all 6 shuttle passengers!')} style={{padding:'10px', background:'#fde047', border:'none', borderRadius:12, color:'#0f172a', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                            <span className="material-symbols-outlined" style={{fontSize:16}}>campaign</span> Alert Passengers
                         </button>
                      </div>
                   </div>

                   {/* Student Passenger Roster */}
                   <div style={{background:'#fff', borderRadius:18, border:'1.5px solid #e2e8f0', padding:'16px', boxShadow:'0 4px 14px rgba(15,23,42,0.04)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                         <div>
                            <h3 style={{margin:0, fontSize:16, fontWeight:900, color:'#0f172a'}}>Passenger Checklist</h3>
                            <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#64748b'}}>{passengers.filter(p=>p.status==='Boarded').length} / {passengers.length} Boarded</p>
                         </div>
                         <span style={{fontSize:12, fontWeight:800, padding:'4px 10px', borderRadius:20, background:'#f1f5f9', color:'#475569'}}>{passengers.length} Total</span>
                      </div>

                      <div style={{display:'flex', flexDirection:'column', gap:10}}>
                         {passengers.map(p => (
                            <div key={p.id} style={{background:'#f8fafc', borderRadius:14, padding:'12px 14px', border:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                               <div>
                                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                                     <span style={{fontSize:14, fontWeight:900, color:'#0f172a'}}>{p.name}</span>
                                     <span style={{fontSize:11, fontWeight:700, color:'#64748b'}}>Rm {p.room}</span>
                                  </div>
                                  <p style={{margin:'2px 0 0', fontSize:11, fontWeight:600, color:'#94a3b8'}}>Pickup: {p.time}</p>
                               </div>
                               <div style={{display:'flex', gap:6, alignItems:'center'}}>
                                  <a href={`tel:${p.phone}`} style={{width:32, height:32, borderRadius:10, background:'#e0f2fe', color:'#0369a1', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}}>
                                     <span className="material-symbols-outlined" style={{fontSize:16}}>phone</span>
                                  </a>
                                  <button onClick={()=>{
                                     setPassengers(prev => prev.map(x => x.id === p.id ? {...x, status: x.status==='Boarded' ? 'Waiting' : x.status==='Waiting' ? 'Absent' : 'Boarded'} : x));
                                  }} style={{padding:'6px 12px', borderRadius:8, border:'none', background: p.status==='Boarded' ? '#dcfce7' : p.status==='Waiting' ? '#fef08a' : '#fee2e2', color: p.status==='Boarded' ? '#15803d' : p.status==='Waiting' ? '#92400e' : '#b91c1c', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                                     {p.status}
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             );
          })()}

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
            <div style={{background: 'linear-gradient(to bottom, #fffef2, #fffdf0)', borderRadius:18, border:'1.5px solid #e8df9a', padding:'20px 18px', color:'#1a1500'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span className="material-symbols-outlined" style={{fontSize:20, color:'#ca8a04'}}>water_drop</span>
                <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#ca8a04'}}>Plumbing & Water Systems</span>
              </div>
              <h3 style={{margin:0, fontSize:22, fontWeight:900, color:'#1a1500'}}>Job Work Queue</h3>
              <p style={{margin:'4px 0 0', fontSize:12.5, color:C.muted, fontWeight:700}}>{plumbingJobs.filter(j=>j.status==='Open').length} open · {plumbingJobs.filter(j=>j.status==='In Progress').length} in progress · {plumbingJobs.filter(j=>j.priority==='High').length} urgent</p>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              {plumbingJobs.map(j => (
                <div key={j.id} style={{background:'#fff', border:'1px solid #f6f3df', borderRadius:18, padding:'20px', boxShadow:'0 4px 16px rgba(120, 104, 10, 0.03)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                        <span style={{fontSize:15, fontWeight:900, color:'#1a1500'}}>Room {j.room}</span>
                        <span style={{fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6, background: j.priority==='High'?'#fef2f2':'#f8fafc', color: j.priority==='High'?'#b91c1c':'#475569'}}>{j.priority}</span>
                        <span style={{fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6, background: '#fce7f3', color:'#be185d', display:'flex', alignItems:'center', gap:4, boxShadow:'0 2px 4px rgba(190,24,93,0.1)'}}><span className="material-symbols-outlined" style={{fontSize:12}}>record_voice_over</span>Student Complaint</span>
                      </div>
                      <p style={{margin:0, fontSize:15, fontWeight:800, color:'#1a1500'}}>{j.issue}</p>
                      <p style={{margin:'6px 0 0', fontSize:11.5, fontWeight:600, color:C.muted}}>by {j.student} · {j.date}</p>
                      
                      {j.note && (
                        <div style={{marginTop:10, borderLeft:'2.5px solid #ca8a04', paddingLeft:10, fontSize:12, fontWeight:700, color:'#ca8a04', fontStyle:'italic'}}>
                          Note: {j.note}
                        </div>
                      )}
                    </div>
                    <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:8, background: j.status==='Resolved'?'#dcfce7':j.status==='In Progress'?'#fff7ed':'#eff6ff', color: j.status==='Resolved'?'#15803d':j.status==='In Progress'?'#c2410c':'#1d4ed8'}}>{j.status}</span>
                  </div>

                  <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:14}}>
                    {j.status !== 'Resolved' && (
                      <button 
                        onClick={()=>setPlumbingJobs(prev=>prev.map(x=>x.id===j.id?{...x,status:x.status==='Open'?'In Progress':'Resolved'}:x))} 
                        style={{
                          padding:'8px 16px', 
                          borderRadius:12, 
                          border:'none', 
                          background: j.status==='Open'?'#eff6ff':'#dcfce7', 
                          color: j.status==='Open'?'#1d4ed8':'#15803d', 
                          fontSize:12, 
                          fontWeight:900, 
                          cursor:'pointer', 
                          fontFamily:'inherit',
                          display:'flex',
                          alignItems:'center',
                          gap:6
                        }}
                      >
                        <span className="material-symbols-outlined" style={{fontSize:14}}>
                          {j.status==='Open' ? 'play_arrow' : 'check'}
                        </span>
                        {j.status==='Open' ? 'Start Job' : 'Mark Resolved'}
                      </button>
                    )}
                    <a 
                      href={'tel:' + (INIT_VISITORS[0]?.phone || '+91 9800000000')} 
                      style={{
                        padding:'8px 16px', 
                        borderRadius:12, 
                        background:'#f0fdf4', 
                        border:'1px solid #dcfce7', 
                        color:'#15803d', 
                        fontSize:12, 
                        fontWeight:900, 
                        textDecoration:'none',
                        display:'flex',
                        alignItems:'center',
                        gap:6
                      }}
                    >
                      <span className="material-symbols-outlined" style={{fontSize:14}}>phone</span>
                      Call Student
                    </a>
                    <button 
                      onClick={()=>alert('Opening Camera to upload job completion proof...')}
                      style={{
                        padding:'8px 16px', 
                        borderRadius:12, 
                        background:'#f1f5f9', 
                        border:'1px solid #e2e8f0', 
                        color:'#475569', 
                        fontSize:12, 
                        fontWeight:900, 
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap:6,
                        fontFamily:'inherit'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{fontSize:14}}>add_a_photo</span>
                      Upload Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* ELECTRICIAN WORK QUEUE */}
          {staffRole === 'Electrician' && (<>
            <div style={{background: 'linear-gradient(to bottom, #fffef2, #fffdf0)', borderRadius:18, border:'1.5px solid #e8df9a', padding:'20px 18px', color:'#1a1500'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span className="material-symbols-outlined" style={{fontSize:20, color:'#ca8a04'}}>bolt</span>
                <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#ca8a04'}}>Electrical & Wiring</span>
              </div>
              <h3 style={{margin:0, fontSize:22, fontWeight:900, color:'#1a1500'}}>Job Work Queue</h3>
              <p style={{margin:'4px 0 0', fontSize:12.5, color:C.muted, fontWeight:700}}>{electricalJobs.filter(j=>j.status==='Open').length} open · {electricalJobs.filter(j=>j.priority==='High').length} high voltage danger</p>
            </div>

            {/* Safety Banner for High Priority */}
            {electricalJobs.some(j=>j.priority==='High' && j.status!=='Resolved') && (
              <div style={{background:'#fffbfe', border:'1.5px solid #fde047', borderRadius:18, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 4px 12px rgba(253, 224, 71, 0.05)'}}>
                <span className="material-symbols-outlined" style={{fontSize:20, color:'#ca8a04'}}>warning</span>
                <p style={{margin:0, fontSize:12.5, fontWeight:800, color:'#854d0e'}}>High voltage / sparking issue reported — use PPE before starting work!</p>
              </div>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              {electricalJobs.map(j => (
                <div key={j.id} style={{background:'#fff', border:'1px solid #f6f3df', borderRadius:18, padding:'20px', boxShadow:'0 4px 16px rgba(120, 104, 10, 0.03)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                        <span style={{fontSize:15, fontWeight:900, color:'#1a1500'}}>Room {j.room}</span>
                        <span style={{fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6, background: j.priority==='High'?'#fef2f2':'#f8fafc', color: j.priority==='High'?'#b91c1c':'#475569'}}>{j.priority}</span>
                        <span style={{fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6, background: '#fce7f3', color:'#be185d', display:'flex', alignItems:'center', gap:4, boxShadow:'0 2px 4px rgba(190,24,93,0.1)'}}><span className="material-symbols-outlined" style={{fontSize:12}}>record_voice_over</span>Student Complaint</span>
                      </div>
                      <p style={{margin:0, fontSize:15, fontWeight:800, color:'#1a1500'}}>{j.issue}</p>
                      <p style={{margin:'6px 0 0', fontSize:11.5, fontWeight:600, color:C.muted}}>by {j.student} · {j.date}</p>
                      
                      {j.note && (
                        <div style={{marginTop:10, borderLeft:'2.5px solid #ca8a04', paddingLeft:10, fontSize:12, fontWeight:700, color:'#ca8a04', fontStyle:'italic'}}>
                          Note: {j.note}
                        </div>
                      )}
                    </div>
                    <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:8, background: j.status==='Resolved'?'#dcfce7':j.status==='In Progress'?'#fff7ed':'#fefce8', color: j.status==='Resolved'?'#15803d':j.status==='In Progress'?'#c2410c':'#ca8a04'}}>{j.status}</span>
                  </div>

                  {j.status !== 'Resolved' && (
                    <div style={{display:'flex', justifyContent:'flex-end', marginTop:14}}>
                      <button 
                        onClick={()=>setElectricalJobs(prev=>prev.map(x=>x.id===j.id?{...x,status:x.status==='Open'?'In Progress':'Resolved'}:x))} 
                        style={{
                          padding:'8px 16px', 
                          borderRadius:12, 
                          border:'none', 
                          background: j.status==='Open'?'#fefce8':'#dcfce7', 
                          color: j.status==='Open'?'#ca8a04':'#15803d', 
                          fontSize:12, 
                          fontWeight:900, 
                          cursor:'pointer', 
                          fontFamily:'inherit',
                          display:'flex',
                          alignItems:'center',
                          gap:6
                        }}
                      >
                        <span className="material-symbols-outlined" style={{fontSize:14}}>
                          {j.status==='Open' ? 'play_arrow' : 'check'}
                        </span>
                        {j.status==='Open' ? 'Start Job' : 'Mark Resolved'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>)}

          {/* CARPENTER WORK QUEUE */}
          {staffRole === 'Carpenter' && (<>
            <div style={{background: 'linear-gradient(to bottom, #fffef2, #fffdf0)', borderRadius:18, border:'1.5px solid #e8df9a', padding:'20px 18px', color:'#1a1500'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span className="material-symbols-outlined" style={{fontSize:20, color:'#ca8a04'}}>handyman</span>
                <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#ca8a04'}}>Carpentry & Fixtures</span>
              </div>
              <h3 style={{margin:0, fontSize:22, fontWeight:900, color:'#1a1500'}}>Job Work Queue</h3>
              <p style={{margin:'4px 0 0', fontSize:12.5, color:C.muted, fontWeight:700}}>{carpenterJobs.filter(j=>j.status==='Open').length} open jobs · {carpenterJobs.filter(j=>j.priority==='High').length} urgent</p>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              {carpenterJobs.map(j => (
                <div key={j.id} style={{background:'#fff', border:'1px solid #f6f3df', borderRadius:18, padding:'20px', boxShadow:'0 4px 16px rgba(120, 104, 10, 0.03)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                        <span style={{fontSize:15, fontWeight:900, color:'#1a1500'}}>Room {j.room}</span>
                        <span style={{fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6, background: j.priority==='High'?'#fef3c7':'#f8fafc', color: j.priority==='High'?'#92400e':'#475569'}}>{j.priority}</span>
                      </div>
                      <p style={{margin:0, fontSize:15, fontWeight:800, color:'#1a1500'}}>{j.issue}</p>
                      <p style={{margin:'6px 0 0', fontSize:11.5, fontWeight:600, color:C.muted}}>by {j.student} · {j.date}</p>
                      
                      {j.note && (
                        <div style={{marginTop:10, borderLeft:'2.5px solid #ca8a04', paddingLeft:10, fontSize:12, fontWeight:700, color:'#ca8a04', fontStyle:'italic'}}>
                          Note: {j.note}
                        </div>
                      )}
                    </div>
                    <span style={{fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:8, background: j.status==='Resolved'?'#dcfce7':j.status==='In Progress'?'#fff7ed':'#fefce8', color: j.status==='Resolved'?'#15803d':j.status==='In Progress'?'#c2410c':'#78350f'}}>{j.status}</span>
                  </div>

                  {j.status !== 'Resolved' && (
                    <div style={{display:'flex', justifyContent:'flex-end', marginTop:14}}>
                      <button 
                        onClick={()=>setCarpenterJobs(prev=>prev.map(x=>x.id===j.id?{...x,status:x.status==='Open'?'In Progress':'Resolved'}:x))} 
                        style={{
                          padding:'8px 16px', 
                          borderRadius:12, 
                          border:'none', 
                          background: j.status==='Open'?'#fef3c7':'#dcfce7', 
                          color: j.status==='Open'?'#78350f':'#15803d', 
                          fontSize:12, 
                          fontWeight:900, 
                          cursor:'pointer', 
                          fontFamily:'inherit',
                          display:'flex',
                          alignItems:'center',
                          gap:6
                        }}
                      >
                        <span className="material-symbols-outlined" style={{fontSize:14}}>
                          {j.status==='Open' ? 'play_arrow' : 'check'}
                        </span>
                        {j.status==='Open' ? 'Start Job' : 'Mark Resolved'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Material Request */}
            <button onClick={() => setShowDemandForm(true)} style={{width:'100%', padding:14, background:'#fef3c7', border:'1px solid #fde68a', borderRadius:14, fontSize:13, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#78350f', fontFamily:'inherit', boxShadow:'0 3px 10px rgba(120,53,15,0.1)'}}>
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
      {view === 'inout' && (() => {
        // Attendance Data
        const attMonths = [
          {
            m: 'July 2026', present: 20, absent: 2, leave: 1,
            daysInMonth: 31,
            data: {
              1:'present',2:'present',3:'present',4:'present',5:'absent',6:'present',7:'present',
              8:'present',9:'present',10:'present',11:'present',12:'present',13:'leave',14:'present',
              15:'present',16:'present',17:'present',18:'present',19:'present',20:'absent',21:'present',
              22:'present',23:'present'
            }
          },
          {
            m: 'June 2026', present: 24, absent: 4, leave: 2,
            daysInMonth: 30,
            data: {
              1:'present',2:'present',3:'absent',4:'present',5:'present',6:'present',7:'present',
              8:'leave',9:'leave',10:'absent',11:'present',12:'present',13:'present',14:'present',
              15:'present',16:'present',17:'present',18:'absent',19:'present',20:'present',21:'present',
              22:'present',23:'present',24:'present',25:'present',26:'present',27:'absent',28:'present',
              29:'present',30:'present'
            }
          }
        ];
        
        // Use an inline state hook equivalent for month selection if we can't use top-level hooks easily. 
        // We'll just define selectedMonth manually and re-render. Since we can't do that perfectly here without adding a real state,
        // we will just use the first month statically, or we can use the same pattern as salary: just show the latest month.
        // Wait, for simplicity let's just show July 2026 calendar.
        const cur = selectedAttMonth || attMonths[0];

        return (
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
              {l:'Present', v:cur.present, bg:'#dcfce7', c:'#15803d'},
              {l:'Absent', v:cur.absent, bg:'#fee2e2', c:'#b91c1c'},
              {l:'Leave', v:cur.leave, bg:'#fefce8', c:'#ca8a04'}
            ].map(s=>(
              <div key={s.l} style={{background:s.bg, borderRadius:14, border: '1px solid #e2e8f0', padding:'14px 10px', textAlign:'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
                <p style={{fontSize:26, fontWeight:900, color:s.c, margin:0}}>{s.v}</p>
                <p style={{fontSize:11, fontWeight:800, color:s.c, margin:'4px 0 0', textTransform:'uppercase'}}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Calendar View */}
          <div style={{background:'#fff', borderRadius:18, border:'1.5px solid #f1f5f9', padding:18, boxShadow:'0 4px 16px rgba(0,0,0,0.03)'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:32, height:32, borderRadius:10, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span className="material-symbols-outlined" style={{fontSize:18, color:'#1e293b'}}>calendar_month</span>
                </div>
                <div>
                  <p style={{margin:0, fontSize:14, fontWeight:900, color:'#1a1500'}}>Attendance Calendar</p>
                  <p style={{margin:'1px 0 0', fontSize:11, color:'#64748b', fontWeight:600}}>{cur.m}</p>
                </div>
              </div>
            </div>

            {/* Month selector */}
            <div style={{display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:4, marginTop:12}}>
              {attMonths.map((sm, idx) => (
                <button key={sm.m} onClick={() => setSelectedAttMonth(sm)}
                  style={{
                    padding:'7px 14px', borderRadius:20, border:'none', whiteSpace:'nowrap',
                    background: cur.m === sm.m ? '#1a1500' : '#f8fafc',
                    color: cur.m === sm.m ? '#fde047' : '#64748b',
                    fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit'
                  }}>
                  {sm.m.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Day headers */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:6}}>
              {['S','M','T','W','T','F','S'].map((d,i)=>(
                <div key={i} style={{textAlign:'center', fontSize:10, fontWeight:800, color:'#94a3b8', padding:'4px 0'}}>{d}</div>
              ))}
            </div>
            
            {/* Day cells */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3}}>
              {Array.from({length: cur.daysInMonth}, (_, i) => i+1).map(day => {
                let status = cur.data[day]; // 'present', 'absent', 'leave' or undefined
                
                // Dynamic Leave Request Integration
                // Check if this day matches an approved leave request
                // We construct the date string, assuming cur.m like 'July 2026' (month index 6)
                const monthStr = cur.m.split(' ')[0];
                const yearStr = cur.m.split(' ')[1];
                const monthIdx = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(monthStr);
                const checkDateStr = `${yearStr}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                if (leaveRequests.some(lr => lr.date === checkDateStr && lr.status === 'Approved')) {
                  status = 'leave';
                }
                let bg = '#f8fafc';
                let border = '1px solid #f1f5f9';
                let color = '#94a3b8';
                if (status === 'present') { bg = '#dcfce7'; border = '1.5px solid #86efac'; color = '#15803d'; }
                if (status === 'absent') { bg = '#fee2e2'; border = '1.5px solid #fca5a5'; color = '#b91c1c'; }
                if (status === 'leave') { bg = '#fefce8'; border = '1.5px solid #fde047'; color = '#ca8a04'; }

                return (
                  <div key={day}
                    onClick={() => status && alert(`${cur.m.split(' ')[0]} ${day}: ${status.toUpperCase()}`)}
                    style={{
                      aspect:'1/1', minHeight:36, borderRadius:8, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', cursor: status ? 'pointer' : 'default',
                      background: bg, border: border, position:'relative'
                    }}>
                    <span style={{fontSize:11, fontWeight: status ? 900 : 600, color: color}}>{day}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{display:'flex', gap:12, marginTop:16, justifyContent:'center', flexWrap:'wrap'}}>
              <div style={{display:'flex', alignItems:'center', gap:4}}>
                <div style={{width:10, height:10, borderRadius:3, background:'#dcfce7', border:'1px solid #86efac'}}/>
                <span style={{fontSize:10, color:'#64748b', fontWeight:700}}>Present</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:4}}>
                <div style={{width:10, height:10, borderRadius:3, background:'#fee2e2', border:'1px solid #fca5a5'}}/>
                <span style={{fontSize:10, color:'#64748b', fontWeight:700}}>Absent</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:4}}>
                <div style={{width:10, height:10, borderRadius:3, background:'#fefce8', border:'1px solid #fde047'}}/>
                <span style={{fontSize:10, color:'#64748b', fontWeight:700}}>Leave</span>
              </div>
            </div>
          </div>

          {/* Leave Requests Module */}
          <div style={{marginTop:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <p style={{margin:0, fontSize:15, fontWeight:900, color:'#1a1500'}}>My Leave Requests</p>
              <button onClick={() => setShowLeaveModal(true)} style={{padding:'6px 12px', background:'#ca8a04', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:4}}>
                <span className="material-symbols-outlined" style={{fontSize:16}}>add</span> Apply
              </button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {leaveRequests.length === 0 ? (
                <p style={{textAlign:'center', fontSize:13, color:'#94a3b8', margin:'20px 0'}}>No leave requests found.</p>
              ) : (
                leaveRequests.map(lr => (
                  <div key={lr.id} style={{background:'#fff', borderRadius:12, padding:'14px', border:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
                    <div>
                      <p style={{margin:0, fontSize:14, fontWeight:800, color:'#1a1500'}}>{new Date(lr.date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}</p>
                      <p style={{margin:'2px 0 0', fontSize:12, color:'#64748b', fontWeight:600}}>{lr.reason}</p>
                    </div>
                    <div>
                      <span style={{
                        padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:800,
                        background: lr.status === 'Approved' ? '#dcfce7' : lr.status === 'Pending' ? '#fefce8' : '#fee2e2',
                        color: lr.status === 'Approved' ? '#15803d' : lr.status === 'Pending' ? '#ca8a04' : '#b91c1c',
                        border: `1px solid ${lr.status === 'Approved' ? '#86efac' : lr.status === 'Pending' ? '#fde047' : '#fca5a5'}`
                      }}>
                        {lr.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Apply Leave Modal */}
          {showLeaveModal && (
            <div style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end', animation:'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'}}>
              <div style={{background:'#fff', padding:'24px 20px 32px', borderTopLeftRadius:24, borderTopRightRadius:24, display:'flex', flexDirection:'column', gap:16}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <p style={{margin:0, fontSize:18, fontWeight:900, color:'#1a1500'}}>Apply for Leave</p>
                  <button onClick={() => setShowLeaveModal(false)} style={{background:'#f8fafc', border:'none', borderRadius:10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
                    <span className="material-symbols-outlined" style={{fontSize:18, color:'#64748b'}}>close</span>
                  </button>
                </div>
                
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    <label style={{fontSize:12, fontWeight:800, color:'#64748b'}}>Select Date</label>
                    <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} style={{padding:'12px', borderRadius:10, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600}} />
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    <label style={{fontSize:12, fontWeight:800, color:'#64748b'}}>Reason for Leave</label>
                    <select value={leaveReason} onChange={e => setLeaveReason(e.target.value)} style={{padding:'12px', borderRadius:10, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600}}>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Family Emergency">Family Emergency</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    if(!leaveDate) return alert('Please select a date');
                    setLeaveRequests([{ id: Date.now(), date: leaveDate, reason: leaveReason, status: 'Pending' }, ...leaveRequests]);
                    setShowLeaveModal(false);
                    setLeaveDate('');
                  }}
                  style={{marginTop:10, padding:'14px', background:'#ca8a04', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}
                >
                  Submit Request
                </button>
              </div>
            </div>
          )}

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
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          SALARY
         ══════════════════════════════════════════════════════════════════════ */}
      
      {/* ══════════════════════════════════════════════════════════════════════
          SALARY BREAKDOWN HISTORY (GPAY STYLE)
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'salaryBreakdown' && (() => {
        const salaryTransactions = [
          { id: 'txn1', date: '2026-07-25', month: 'July', year: '2026', type: 'Bonus', subtype: 'Performance Bonus', amount: 1000, flow: 'paid' },
          { id: 'txn2', date: '2026-07-20', month: 'July', year: '2026', type: 'Deduction', subtype: 'Advance Deduction', amount: 1000, flow: 'deducted' },
          { id: 'txn3', date: '2026-07-15', month: 'July', year: '2026', type: 'Overtime', subtype: 'Overtime (15 hrs)', amount: 2500, flow: 'paid' },
          { id: 'txn4', date: '2026-07-01', month: 'July', year: '2026', type: 'Salary', subtype: 'Base Monthly', amount: 16000, flow: 'paid' },
          { id: 'txn5', date: '2026-06-25', month: 'June', year: '2026', type: 'Bonus', subtype: 'Festival Bonus', amount: 500, flow: 'paid' },
          { id: 'txn6', date: '2026-06-15', month: 'June', year: '2026', type: 'Overtime', subtype: 'Overtime (5 hrs)', amount: 500, flow: 'paid' },
          { id: 'txn7', date: '2026-06-05', month: 'June', year: '2026', type: 'Deduction', subtype: 'Late Arrival Penalty', amount: 200, flow: 'deducted' },
          { id: 'txn8', date: '2026-06-01', month: 'June', year: '2026', type: 'Salary', subtype: 'Base Monthly', amount: 16000, flow: 'paid' },
        ];

        const filteredTransactions = salaryTransactions.filter(txn => {
          if (txnMonthFilter !== 'All Months' && txn.month !== txnMonthFilter) return false;
          if (txnYearFilter !== 'All Years' && txn.year !== txnYearFilter) return false;
          if (txnTypeFilter !== 'All Types' && txn.type !== txnTypeFilter) return false;
          if (txnFlowFilter !== 'All' && txn.flow !== txnFlowFilter.toLowerCase()) return false;
          return true;
        });

        return (
          <div style={{padding:'0 0 32px', display:'flex', flexDirection:'column', height:'100%'}}>
            {/* Header */}
            <div style={{background:C.primary, padding:'20px 14px 14px', position:'sticky', top:0, zIndex:10, display:'flex', alignItems:'center', gap:10}}>
              <button onClick={() => setView('salary')} style={{background:'transparent', border:'none', padding:0, margin:0, cursor:'pointer', display:'flex', alignItems:'center'}}>
                <span className="material-symbols-outlined" style={{fontSize:24, color:'#000'}}>arrow_back</span>
              </button>
              <h2 style={{margin:0, fontSize:18, fontWeight:900, color:'#000'}}>Transaction History</h2>
            </div>
            
            {/* Filters */}
            <div style={{padding:'14px', display:'flex', gap:8, overflowX:'auto', borderBottom:'1px solid #f1f5f9', background:'#fff', whiteSpace:'nowrap'}}>
              {['All', 'Paid', 'Deducted'].map(f => (
                <button key={f} onClick={() => setTxnFlowFilter(f)} style={{padding:'6px 14px', borderRadius:20, border:'1px solid #e2e8f0', background: txnFlowFilter===f?'#1a1500':'#fff', color:txnFlowFilter===f?'#fde047':'#1e293b', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
                  {f}
                </button>
              ))}
              <div style={{width:1, background:'#e2e8f0', margin:'0 4px'}} />
              <select value={txnTypeFilter} onChange={e => setTxnTypeFilter(e.target.value)} style={{padding:'6px 12px', borderRadius:20, border:'1px solid #e2e8f0', background:'#fff', color:'#1e293b', fontSize:12, fontWeight:700, outline:'none', cursor:'pointer', fontFamily:'inherit'}}>
                <option>All Types</option>
                <option>Salary</option>
                <option>Bonus</option>
                <option>Overtime</option>
                <option>Deduction</option>
              </select>
              <select value={txnMonthFilter} onChange={e => setTxnMonthFilter(e.target.value)} style={{padding:'6px 12px', borderRadius:20, border:'1px solid #e2e8f0', background:'#fff', color:'#1e293b', fontSize:12, fontWeight:700, outline:'none', cursor:'pointer', fontFamily:'inherit'}}>
                <option>All Months</option>
                <option>July</option>
                <option>June</option>
              </select>
              <select value={txnYearFilter} onChange={e => setTxnYearFilter(e.target.value)} style={{padding:'6px 12px', borderRadius:20, border:'1px solid #e2e8f0', background:'#fff', color:'#1e293b', fontSize:12, fontWeight:700, outline:'none', cursor:'pointer', fontFamily:'inherit'}}>
                <option>All Years</option>
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>

            {/* Transaction List */}
            <div style={{padding:'14px', display:'flex', flexDirection:'column', gap:12}}>
              {filteredTransactions.length === 0 && (
                <div style={{textAlign:'center', padding:'30px 0'}}>
                  <p style={{margin:0, fontSize:14, color:'#64748b', fontWeight:700}}>No transactions found.</p>
                </div>
              )}
              {filteredTransactions.map(txn => (
                <div key={txn.id} style={{display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'#fff', borderRadius:16, border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
                  <div style={{width:42, height:42, borderRadius:21, background: txn.flow === 'paid' ? '#dcfce7' : '#fee2e2', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <span className="material-symbols-outlined" style={{fontSize:20, color: txn.flow === 'paid' ? '#15803d' : '#b91c1c'}}>
                      {txn.flow === 'paid' ? 'south_west' : 'north_east'}
                    </span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{margin:0, fontSize:15, fontWeight:800, color:'#1a1500'}}>{txn.subtype}</p>
                    <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#64748b'}}>{txn.date} · {txn.type}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{margin:0, fontSize:16, fontWeight:900, color: txn.flow === 'paid' ? '#15803d' : '#1a1500'}}>
                      {txn.flow === 'paid' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </p>
                    <p style={{margin:'2px 0 0', fontSize:11, fontWeight:700, color:'#94a3b8'}}>{txn.flow === 'paid' ? 'Credited' : 'Debited'}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{padding:'20px', textAlign:'center'}}>
              <p style={{margin:0, fontSize:12, color:'#94a3b8', fontWeight:600}}>End of transactions</p>
            </div>
          </div>
        );
      })()}

      {view === 'salary' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:14}}>
          {/* Main Card */}
          <div style={{background: C.primary, borderRadius:18, border: '1px solid #e2e8f0', padding:'20px 18px', color:'#000', boxShadow: '0 4px 16px rgba(15,23,42,0.05)'}}>
            <p style={{margin:0, fontSize:11, color:'#000', fontWeight:800, textTransform:'uppercase', letterSpacing:.5}}>July 2026 · Net Estimated</p>
            <h2 style={{margin:'6px 0 2px', fontSize:36, fontWeight:900, letterSpacing:-1}}>₹18,500</h2>
            <p style={{margin:'4px 0 0', fontSize:12, fontWeight:700, color:'#000'}}>↑ Pay date: 1 Aug 2026 · On Track</p>
          </div>

                    {/* Breakdown Card */}
          <div onClick={() => setView('salaryBreakdown')} style={{background:'#fff', borderRadius:18, border: '1px solid #e2e8f0', padding:16, boxShadow: '0 4px 16px rgba(15,23,42,0.05)', cursor:'pointer'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <p style={{margin:0, fontSize:15, fontWeight:800, color:'#000'}}>💰 Salary Breakdown</p>
              <span style={{fontSize:12, fontWeight:700, color:'#15803d', display:'flex', alignItems:'center'}}>View All <span className="material-symbols-outlined" style={{fontSize:16}}>chevron_right</span></span>
            </div>
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
      {/* ══════════════════════════════════════════════════════════════════════
          PERFORMANCE & FEEDBACK
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'performance' && (() => {
        // Mock feedback based on role
        let feedbackData = [];
        if (staffRole === 'Cook') {
           feedbackData = [
             { id: 1, text: "Dinner was amazing today, especially the Paneer!", rating: 5, author: "Rahul (Rm 102)", date: "Today, 08:30 PM" },
             { id: 2, text: "Lunch was a bit too spicy.", rating: 3, author: "Aryan (Rm 205)", date: "Yesterday, 02:15 PM" },
             { id: 3, text: "Great breakfast as always.", rating: 5, author: "Rohan (Rm 301)", date: "24 Jul 2026" }
           ];
        } else if (staffRole === 'Cleaner') {
           feedbackData = [
             { id: 1, text: "Room 102 bathroom wasn't cleaned properly.", rating: 2, author: "Rahul (Rm 102)", date: "Today, 10:30 AM" },
             { id: 2, text: "Corridor looks spotless, great job!", rating: 5, author: "Admin", date: "Yesterday, 04:00 PM" }
           ];
        } else if (['Plumber', 'Electrician', 'Carpenter'].includes(staffRole)) {
           feedbackData = [
             { id: 1, text: "Issue fixed very quickly, thanks!", rating: 5, author: "Aryan (Rm 205)", date: "Today, 11:45 AM" },
             { id: 2, text: "The repair took a bit long, but it works now.", rating: 4, author: "Rohan (Rm 301)", date: "22 Jul 2026" }
           ];
        } else {
           feedbackData = [
             { id: 1, text: "Excellent support and quick response.", rating: 5, author: "Student Council", date: "25 Jul 2026" }
           ];
        }

        return (
          <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:16}}>
            
            {/* Weekly Rating Card */}
            <div style={{background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius:20, padding:'24px', color:'#fff', boxShadow:'0 10px 25px rgba(15,23,42,0.15)', position:'relative', overflow:'hidden'}}>
               <div style={{position:'absolute', top:-20, right:-20, opacity:0.1, transform:'rotate(15deg)'}}>
                  <span className="material-symbols-outlined" style={{fontSize:120}}>star</span>
               </div>
               <p style={{margin:0, fontSize:13, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1}}>Weekly Average</p>
               <div style={{display:'flex', alignItems:'flex-end', gap:12, marginTop:8}}>
                  <h1 style={{margin:0, fontSize:56, fontWeight:900, lineHeight:1, color:'#fde047'}}>4.6</h1>
                  <div style={{paddingBottom:8}}>
                     <div style={{display:'flex', gap:2, color:'#fde047'}}>
                        <span className="material-symbols-outlined" style={{fontSize:20}}>star</span>
                        <span className="material-symbols-outlined" style={{fontSize:20}}>star</span>
                        <span className="material-symbols-outlined" style={{fontSize:20}}>star</span>
                        <span className="material-symbols-outlined" style={{fontSize:20}}>star</span>
                        <span className="material-symbols-outlined" style={{fontSize:20}}>star_half</span>
                     </div>
                     <p style={{margin:'4px 0 0', fontSize:12, fontWeight:700, color:'#34d399'}}>↑ 12% from last week</p>
                  </div>
               </div>
            </div>

            {/* Recent Feedback Feed */}
            <h3 style={{margin:'8px 0 0 4px', fontSize:18, fontWeight:900, color:'#1a1500'}}>Recent Feedback</h3>
            
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
               {feedbackData.map(fb => (
                  <div key={fb.id} style={{background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #f1f5f9', boxShadow:'0 2px 10px rgba(0,0,0,0.02)'}}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                        <div style={{display:'flex', gap:2, color:'#facc15'}}>
                           {[...Array(5)].map((_, i) => (
                              <span key={i} className="material-symbols-outlined" style={{fontSize:16, color: i < fb.rating ? '#facc15' : '#e2e8f0'}}>star</span>
                           ))}
                        </div>
                        <span style={{fontSize:11, fontWeight:700, color:'#94a3b8'}}>{fb.date}</span>
                     </div>
                     <p style={{margin:'0 0 12px', fontSize:15, fontWeight:600, color:'#1e293b', lineHeight:1.4}}>"{fb.text}"</p>
                     <div style={{display:'flex', alignItems:'center', gap:6}}>
                        <div style={{width:24, height:24, borderRadius:12, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                           <span className="material-symbols-outlined" style={{fontSize:14, color:'#64748b'}}>person</span>
                        </div>
                        <span style={{fontSize:12, fontWeight:800, color:'#64748b'}}>{fb.author}</span>
                     </div>
                  </div>
               ))}
            </div>
            
          </div>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════════════
          METER READING (Electrician / Manager)
         ══════════════════════════════════════════════════════════════════════ */}
      {view === 'meter_reading' && (
        <div style={{padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:16}}>
          
          <div style={{background: 'linear-gradient(to right, #ecfeff, #cffafe)', borderRadius:16, padding:'16px', border:'1px solid #a5f3fc', display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:48, height:48, borderRadius:24, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#0891b2'}}>
               <span className="material-symbols-outlined" style={{fontSize:24}}>electric_meter</span>
            </div>
            <div>
               <h3 style={{margin:0, fontSize:16, fontWeight:900, color:'#164e63'}}>Utility Meters</h3>
               <p style={{margin:'2px 0 0', fontSize:12, fontWeight:700, color:'#0891b2'}}>Log reading for accurate billing</p>
            </div>
          </div>

          <div style={{background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #f1f5f9', boxShadow:'0 2px 10px rgba(0,0,0,0.02)', display:'flex', flexDirection:'column', gap:12}}>
             <div style={{display:'flex', flexDirection:'column', gap:6}}>
                <label style={{fontSize:12, fontWeight:800, color:'#64748b'}}>Room / Area</label>
                <select value={meterRoom} onChange={e=>setMeterRoom(e.target.value)} style={{padding:'14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:15, fontWeight:700}}>
                   <option value="101">Room 101</option>
                   <option value="102">Room 102</option>
                   <option value="103">Room 103</option>
                   <option value="Ground Floor Lobby">Ground Floor Lobby</option>
                </select>
             </div>
             <div style={{display:'flex', flexDirection:'column', gap:6}}>
                <label style={{fontSize:12, fontWeight:800, color:'#64748b'}}>Electricity Reading (kWh)</label>
                <input type="number" value={meterElec} onChange={e=>setMeterElec(e.target.value)} placeholder="e.g. 4502" style={{padding:'14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:15, fontWeight:700}} />
             </div>
             <div style={{display:'flex', flexDirection:'column', gap:6}}>
                <label style={{fontSize:12, fontWeight:800, color:'#64748b'}}>Water Reading (Liters/Units)</label>
                <input type="number" value={meterWater} onChange={e=>setMeterWater(e.target.value)} placeholder="e.g. 120" style={{padding:'14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:15, fontWeight:700}} />
             </div>
             <button 
                onClick={()=>{
                   if(!meterElec && !meterWater) return alert("Please enter at least one reading.");
                   setMeterReadings([{id:Date.now(), room:meterRoom, elec:meterElec, water:meterWater, date:'Today'}, ...meterReadings]);
                   setMeterElec(''); setMeterWater('');
                   alert("Reading synced to Admin successfully!");
                }}
                style={{marginTop:8, padding:'14px', background:'#0891b2', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                Sync to Admin ☁️
             </button>
          </div>

          <h3 style={{margin:'8px 0 0 4px', fontSize:16, fontWeight:900, color:'#1a1500'}}>Recent Logs</h3>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
             {meterReadings.map(mr => (
                <div key={mr.id} style={{background:'#f8fafc', borderRadius:12, padding:'12px', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div>
                      <p style={{margin:0, fontSize:14, fontWeight:900, color:'#0f172a'}}>{mr.room.startsWith('Room') ? mr.room : 'Area: ' + mr.room}</p>
                      <p style={{margin:'4px 0 0', fontSize:12, fontWeight:700, color:'#64748b'}}>⚡ {mr.elec||'N/A'} &nbsp; 💧 {mr.water||'N/A'}</p>
                   </div>
                   <span style={{fontSize:11, fontWeight:700, color:'#94a3b8'}}>{mr.date}</span>
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
      {view === 'itemreq' && (
        <div style={{padding:'14px 14px 32px', display:'flex', flexDirection:'column', gap:14}}>

          {/* Tab switcher */}
          <div style={{display:'flex', background:'#fff', borderRadius:12, padding:4, border:'1px solid #e8df9a', gap:4}}>
            {[['new','add_shopping_cart','New Request'],['sent','history','Sent']].map(([tab, icon, label]) => (
              <button key={tab} onClick={() => setItemReqSentTab(tab)} style={{
                flex:1, padding:'9px 0', borderRadius:10, border:'none',
                background: itemReqSentTab === tab ? C.primary : 'transparent',
                color: itemReqSentTab === tab ? '#1a1500' : C.muted,
                fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6
              }}>
                <span className="material-symbols-outlined" style={{fontSize:15}}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {itemReqSentTab === 'new' ? (
            <>
              {/* CTA Hero */}
              <div style={{background:'linear-gradient(to bottom, #fffef2, #fffadc)', border:'1.5px solid #e8df9a', borderRadius:18, padding:'20px 18px'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span className="material-symbols-outlined" style={{fontSize:22, color:'#ca8a04'}}>inventory</span>
                  <span style={{fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, color:'#ca8a04'}}>Item Request</span>
                </div>
                <h3 style={{margin:'0 0 4px', fontSize:20, fontWeight:900, color:'#1a1500'}}>Need Supplies?</h3>
                <p style={{margin:'0 0 14px', fontSize:12.5, color:C.muted, fontWeight:600, lineHeight:1.6}}>
                  Select from your personalised list, add quantity (optional), and send to manager or purchase team.
                </p>
                <button
                  onClick={openItemRequest}
                  style={{
                    width:'100%', padding:'13px 0', borderRadius:14, border:'none',
                    background:'#1a1500', color:'#fde047', fontSize:14, fontWeight:900,
                    cursor:'pointer', fontFamily:'inherit',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8
                  }}
                >
                  <span className="material-symbols-outlined" style={{fontSize:18}}>add_shopping_cart</span>
                  Create New Item Request
                </button>
              </div>

              {/* Quick stats */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                {[
                  { label:'Total Sent', val: itemReqSentList.length, icon:'send', bg:'#eff6ff', color:'#1d4ed8' },
                  { label:'Pending', val: itemReqSentList.filter(r=>r.status==='Pending').length, icon:'schedule', bg:'#fef3c7', color:'#b45309' }
                ].map(s => (
                  <div key={s.label} style={{background:'#fff', border:'1px solid #e8df9a', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 2px 8px rgba(120,104,10,0.03)'}}>
                    <div style={{width:36, height:36, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <span className="material-symbols-outlined" style={{fontSize:20, color:s.color}}>{s.icon}</span>
                    </div>
                    <div>
                      <p style={{margin:0, fontSize:22, fontWeight:900, color:'#1a1500'}}>{s.val}</p>
                      <p style={{margin:0, fontSize:11, fontWeight:700, color:C.muted}}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent sent list */}
              {itemReqSentList.length > 0 && (
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  <p style={{margin:0, fontSize:11, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Recent Requests</p>
                  {itemReqSentList.slice(0, 3).map(r => (
                    <div key={r.id} style={{background:'#fff', border:'1px solid #f1f5f9', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                        <div>
                          <p style={{margin:0, fontSize:13, fontWeight:900, color:'#1a1500'}}>To: {r.sendTo}</p>
                          <p style={{margin:'2px 0 0', fontSize:11, fontWeight:600, color:C.muted}}>{r.date} · {r.items.length} items</p>
                        </div>
                        <span style={{
                          fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:6,
                          background: r.status === 'Received' ? '#dcfce7' : '#fef3c7',
                          color: r.status === 'Received' ? '#15803d' : '#b45309'
                        }}>{r.status}</span>
                      </div>
                      <p style={{margin:0, fontSize:12, color:C.muted, lineHeight:1.5}}>
                        {r.items.slice(0,2).join(', ')}{r.items.length > 2 ? ' +' + (r.items.length - 2) + ' more' : ''}
                      </p>
                    </div>
                  ))}
                  <button onClick={() => setItemReqSentTab('sent')} style={{background:'none', border:'none', fontSize:12, fontWeight:800, color:'#ca8a04', cursor:'pointer', fontFamily:'inherit', padding:0, textAlign:'left'}}>
                    View all sent requests
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {itemReqSentList.length === 0 ? (
                <p style={{textAlign:'center', padding:'30px 0', fontSize:13.5, color:C.muted, fontStyle:'italic'}}>No requests sent yet.</p>
              ) : (
                itemReqSentList.map(r => (
                  <div key={r.id} style={{background:'#fff', border:'1px solid #f1f5f9', borderRadius:18, padding:'18px 16px', boxShadow:'0 4px 12px rgba(0,0,0,0.02)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10}}>
                      <div>
                        <p style={{margin:0, fontSize:14, fontWeight:900, color:'#1a1500'}}>To: {r.sendTo}</p>
                        <p style={{margin:'2px 0 0', fontSize:11.5, color:C.muted}}>{r.date} · {r.items.length} items</p>
                      </div>
                      <span style={{
                        fontSize:10.5, fontWeight:800, padding:'4px 10px', borderRadius:8,
                        background: r.status === 'Received' ? '#dcfce7' : '#fef3c7',
                        color: r.status === 'Received' ? '#15803d' : '#b45309'
                      }}>{r.status}</span>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:5}}>
                      {r.items.map((itm, idx) => (
                        <div key={idx} style={{display:'flex', alignItems:'center', gap:8, background:'#f8fafc', padding:'7px 10px', borderRadius:8}}>
                          <span className="material-symbols-outlined" style={{fontSize:14, color:'#ca8a04'}}>check_box</span>
                          <span style={{fontSize:12.5, fontWeight:700, color:'#1a1500'}}>{itm}</span>
                        </div>
                      ))}
                      {r.note && (
                        <div style={{marginTop:6, fontSize:11.5, color:'#78350f', fontStyle:'italic', borderLeft:'2px solid #ca8a04', paddingLeft:8}}>
                          Note: {r.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div style={{padding:'14px 14px 32px', display:'flex', flexDirection:'column', gap:14}}>
          {/* Calendar Header with Navigation */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:'16px', display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 16px rgba(120, 104, 10, 0.04)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <button 
                onClick={() => {
                  if (historyMonth === 0) {
                    setHistoryMonth(11);
                    setHistoryYear(historyYear - 1);
                  } else {
                    setHistoryMonth(historyMonth - 1);
                  }
                }}
                style={{background:'none', border:'none', color:'#ca8a04', cursor:'pointer', display:'flex', alignItems:'center'}}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span style={{fontSize:16, fontWeight:900, color:'#1a1500'}}>
                {new Date(historyYear, historyMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => {
                  if (historyMonth === 11) {
                    setHistoryMonth(0);
                    setHistoryYear(historyYear + 1);
                  } else {
                    setHistoryMonth(historyMonth + 1);
                  }
                }}
                style={{background:'none', border:'none', color:'#ca8a04', cursor:'pointer', display:'flex', alignItems:'center'}}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Week Days Headers */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', textAlign:'center', gap:6}}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <span key={d} style={{fontSize:11, fontWeight:800, color:C.muted}}>{d}</span>
              ))}
            </div>

            {/* Month Days Grid */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6}}>
              {(() => {
                const daysInMonth = new Date(historyYear, historyMonth + 1, 0).getDate();
                const firstDayIndex = new Date(historyYear, historyMonth, 1).getDay();
                const cells = [];

                // Empty leading cells
                for (let i = 0; i < firstDayIndex; i++) {
                  cells.push(<div key={`empty-${i}`} />);
                }

                // Calendar day cells
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateString = `${historyYear}-${String(historyMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayData = HISTORY_DAYS[dateString] || { status: 'present', tasks: [] };
                  const isSelected = selectedHistoryDate === dateString;

                  let bg = '#f8fafc';
                  let color = '#64748b';
                  let border = '1px solid #e2e8f0';

                  if (dayData.status === 'work') {
                    bg = '#dcfce7';
                    color = '#15803d';
                    border = '1px solid #bbf7d0';
                  } else if (dayData.status === 'absent') {
                    bg = '#fee2e2';
                    color = '#b91c1c';
                    border = '1px solid #fca5a5';
                  }

                  cells.push(
                    <button
                      key={`day-${day}`}
                      onClick={() => setSelectedHistoryDate(dateString)}
                      style={{
                        height:36,
                        borderRadius:10,
                        border: isSelected ? '2px solid #ca8a04' : border,
                        background: bg,
                        color: color,
                        fontSize:12,
                        fontWeight:800,
                        cursor:'pointer',
                        fontFamily:'inherit',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        boxShadow: isSelected ? '0 0 6px rgba(202,138,4,0.3)' : 'none'
                      }}
                    >
                      {day}
                    </button>
                  );
                }

                return cells;
              })()}
            </div>
          </div>

          {/* Selected Date Details Card */}
          {(() => {
            const dayData = HISTORY_DAYS[selectedHistoryDate] || { status: 'present', tasks: [] };
            const formattedDate = new Date(selectedHistoryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

            return (
              <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:'18px 16px', display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 16px rgba(120, 104, 10, 0.04)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid #f1f5f9', paddingBottom:10}}>
                  <div>
                    <h4 style={{margin:0, fontSize:15, fontWeight:900, color:'#1a1500'}}>{formattedDate}</h4>
                    <p style={{margin:'2px 0 0', fontSize:11.5, color:C.muted}}>Work history details</p>
                  </div>
                  <span style={{
                    fontSize:10.5, 
                    fontWeight:800, 
                    padding:'4px 8px', 
                    borderRadius:8, 
                    background: dayData.status === 'work' ? '#dcfce7' : dayData.status === 'absent' ? '#fee2e2' : '#f8fafc',
                    color: dayData.status === 'work' ? '#15803d' : dayData.status === 'absent' ? '#b91c1c' : '#64748b',
                    border: dayData.status === 'work' ? '1px solid #bbf7d0' : dayData.status === 'absent' ? '1px solid #fca5a5' : '1px solid #e2e8f0'
                  }}>
                    {dayData.status === 'work' ? 'Present (Jobs Done)' : dayData.status === 'absent' ? 'Absent (Off Duty)' : 'Present (No Jobs)'}
                  </span>
                </div>

                <div>
                  <p style={{margin:'0 0 8px', fontSize:11, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Tasks Performed</p>
                  {dayData.status === 'absent' ? (
                    <div style={{display:'flex', alignItems:'center', gap:8, color:'#b91c1c', background:'#fee2e2', padding:'10px 12px', borderRadius:10, fontSize:12.5, fontWeight:700}}>
                      <span className="material-symbols-outlined" style={{fontSize:18}}>cancel</span>
                      Staff member was marked absent on this date.
                    </div>
                  ) : dayData.tasks.length === 0 ? (
                    <p style={{margin:0, fontSize:13, fontWeight:700, color:C.muted, fontStyle:'italic'}}>No work or jobs completed on this date.</p>
                  ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      {dayData.tasks.map((t, idx) => (
                        <div key={idx} style={{display:'flex', alignItems:'center', gap:10, background:'#f8fafc', padding:'10px 12px', borderRadius:10, border:'1px solid #e2e8f0'}}>
                          <span className="material-symbols-outlined" style={{fontSize:18, color:'#15803d'}}>check_circle</span>
                          <span style={{fontSize:13, fontWeight:700, color:'#1a1500'}}>{t}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {view === 'profile_view' && (
        <div style={{padding:'14px 14px 32px', display:'flex', flexDirection:'column', gap:14}}>
          {/* Main Card: Avatar & Status */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:'24px 16px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', boxShadow:'0 4px 16px rgba(120, 104, 10, 0.05)', position:'relative'}}>
            
            {/* Clickable Profile Avatar with Hidden File Input */}
            <div style={{position:'relative', cursor:'pointer'}} onClick={() => document.getElementById('avatar-input').click()}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{width:84, height:84, borderRadius:50, objectFit:'cover', border:'2.5px solid #ca8a04', boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}} />
              ) : (
                <div style={{width:84, height:84, borderRadius:50, background:meta.accentBg, border:'2.5px solid #e8df9a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, boxShadow:'0 4px 12px rgba(0,0,0,0.06)'}}>
                  {meta.emoji}
                </div>
              )}
              {/* Photo edit badge overlay */}
              <div style={{position:'absolute', bottom:-4, right:-4, background:'#ca8a04', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff', boxShadow:'0 2px 6px rgba(0,0,0,0.2)'}}>
                <span className="material-symbols-outlined" style={{fontSize:14, color:'#fff'}}>photo_camera</span>
              </div>
            </div>

            <input 
              id="avatar-input" 
              type="file" 
              accept="image/*" 
              style={{display:'none'}} 
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setProfilePic(reader.result);
                    localStorage.setItem('febebo_profile_pic', reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            <h3 style={{margin:'10px 0 4px', fontSize:22, fontWeight:900, color:'#000'}}>{staffName}</h3>
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
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f1f5f9', paddingBottom:8}}>
              <p style={{margin:0, fontSize:14, fontWeight:900, color:'#000', display:'flex', alignItems:'center', gap:6}}>
                <span className="material-symbols-outlined" style={{fontSize:18, color:'#ca8a04'}}>person</span>
                Personal Details
              </p>
              <button 
                onClick={() => setEditPersonal(!editPersonal)} 
                style={{background:'none', border:'none', color:'#ca8a04', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4}}
              >
                <span className="material-symbols-outlined" style={{fontSize:14}}>{editPersonal ? 'save' : 'edit'}</span>
                {editPersonal ? 'Done' : 'Edit'}
              </button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {/* Phone */}
              <div style={{display:'flex', flexDirection:'column', gap:3}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Phone Number</span>
                {editPersonal ? (
                  <input type="text" value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} style={{padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{phoneInput}</span>
                )}
              </div>

              {/* Email */}
              <div style={{display:'flex', flexDirection:'column', gap:3}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Email Address</span>
                {editPersonal ? (
                  <input type="email" value={emailInput} onChange={e=>setEmailInput(e.target.value)} style={{padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{emailInput}</span>
                )}
              </div>

              {/* Permanent Address */}
              <div style={{display:'flex', flexDirection:'column', gap:3}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Permanent Address</span>
                {editPersonal ? (
                  <textarea value={addressInput} rows={2} onChange={e=>setAddressInput(e.target.value)} style={{padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', resize:'none', fontFamily:'inherit'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{addressInput}</span>
                )}
              </div>

              {/* Emergency Contact */}
              <div style={{display:'flex', flexDirection:'column', gap:3}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Emergency Contact</span>
                {editPersonal ? (
                  <input type="text" value={emergencyInput} onChange={e=>setEmergencyInput(e.target.value)} style={{padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{emergencyInput}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Professional Detailing */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:16, display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 16px rgba(120, 104, 10, 0.05)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f1f5f9', paddingBottom:8}}>
              <p style={{margin:0, fontSize:14, fontWeight:900, color:'#000', display:'flex', alignItems:'center', gap:6}}>
                <span className="material-symbols-outlined" style={{fontSize:18, color:'#ca8a04'}}>badge</span>
                Professional Details
              </p>
              <button 
                onClick={() => setEditProfessional(!editProfessional)} 
                style={{background:'none', border:'none', color:'#ca8a04', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4}}
              >
                <span className="material-symbols-outlined" style={{fontSize:14}}>{editProfessional ? 'save' : 'edit'}</span>
                {editProfessional ? 'Done' : 'Edit'}
              </button>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Staff ID</span>
                <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{'FEB-2026-ST0' + ((user?.id || 1042) % 1000)}</span>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Designated Role</span>
                <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{staffRole}</span>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Monthly Salary</span>
                {editProfessional ? (
                  <input type="text" value={salaryInput} onChange={e=>setSalaryInput(e.target.value)} style={{padding:'6px 8px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{salaryInput}</span>
                )}
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Date of Joining</span>
                {editProfessional ? (
                  <input type="text" value={dojInput} onChange={e=>setDojInput(e.target.value)} style={{padding:'6px 8px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{dojInput}</span>
                )}
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Shift Timing</span>
                {editProfessional ? (
                  <input type="text" value={shiftInput} onChange={e=>setShiftInput(e.target.value)} style={{padding:'6px 8px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{shiftInput}</span>
                )}
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Duty Status</span>
                {editProfessional ? (
                  <input type="text" value={statusInput} onChange={e=>setStatusInput(e.target.value)} style={{padding:'6px 8px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none'}} />
                ) : (
                  <span style={{fontSize:13, fontWeight:700, color:'#000'}}>{statusInput}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Documents */}
          <div style={{background:'#fff', borderRadius:18, border:'1px solid #e8df9a', padding:16, display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 16px rgba(120, 104, 10, 0.05)'}}>
            <p style={{margin:0, fontSize:14, fontWeight:900, color:'#000', borderBottom:'1px solid #f1f5f9', paddingBottom:8, display:'flex', alignItems:'center', gap:6}}>
              <span className="material-symbols-outlined" style={{fontSize:18, color:'#ca8a04'}}>folder_shared</span>
              Documents & Verification
            </p>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {documentsList.map((doc, idx) => (
                <div key={doc.name} style={{background:C.bg, borderRadius:12, padding:'12px', border:'1px solid #e8df9a', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10, flex:1}}>
                    <span className="material-symbols-outlined" style={{fontSize:22, color:'#ca8a04'}}>{doc.icon}</span>
                    <div style={{flex:1}}>
                      <p style={{margin:0, fontSize:12, fontWeight:800, color:'#000'}}>{doc.name}</p>
                      <p style={{margin:0, fontSize:10, color:C.muted}}>{doc.no} · {doc.status === 'Verified' ? 'Verified' : doc.status}</p>
                    </div>
                  </div>
                  
                  {/* File interaction depending on Verification status */}
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    {doc.status === 'Verified' ? (
                      <>
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          style={{background:'#fefce8', border:'1px solid #e8df9a', borderRadius:6, padding:'4px 8px', fontSize:10, fontWeight:800, color:'#ca8a04', cursor:'pointer', fontFamily:'inherit'}}
                        >
                          👁️ View
                        </button>
                        <div style={{display:'flex', alignItems:'center', gap:2, background:'#dcfce7', padding:'4px 8px', borderRadius:8}}>
                          <span className="material-symbols-outlined" style={{fontSize:10, color:'#166534'}}>check_circle</span>
                          <span style={{fontSize:9, fontWeight:800, color:'#166534'}}>Verified</span>
                        </div>
                      </>
                    ) : doc.status === 'Under Verification' || doc.status === 'Uploaded' ? (
                      <>
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          style={{background:'#fefce8', border:'1px solid #e8df9a', borderRadius:6, padding:'4px 8px', fontSize:10, fontWeight:800, color:'#ca8a04', cursor:'pointer', fontFamily:'inherit'}}
                        >
                          👁️ Preview
                        </button>
                        <div style={{display:'flex', alignItems:'center', gap:2, background:'#fef3c7', padding:'4px 8px', borderRadius:8}}>
                          <span className="material-symbols-outlined" style={{fontSize:10, color:'#b45309'}}>schedule</span>
                          <span style={{fontSize:9, fontWeight:800, color:'#b45309'}}>Pending Verify</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => document.getElementById(`doc-upload-${idx}`).click()}
                          style={{background:'#ca8a04', border:'none', borderRadius:8, padding:'6px 12px', fontSize:10, fontWeight:800, color:'#fff', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4}}
                        >
                          <span className="material-symbols-outlined" style={{fontSize:12}}>upload</span>
                          Upload
                        </button>
                        <input 
                          id={`doc-upload-${idx}`}
                          type="file"
                          accept=".pdf,image/*"
                          style={{display:'none'}}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const updatedDocs = documentsList.map((d, i) => i === idx ? {
                                ...d,
                                status: 'Under Verification',
                                desc: 'Verification Pending',
                                fileUrl: file.name,
                                no: file.name.substring(0, 15) + '...'
                              } : d);
                              setDocumentsList(updatedDocs);
                              localStorage.setItem('febebo_docs', JSON.stringify(updatedDocs));
                              alert(`${file.name} uploaded successfully! Subject to admin verification.`);
                            }
                          }}
                        />
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      {/* Sheet 1: Demands List (Asked by other staff members) */}
      <Sheet show={showDemandList} onClose={()=>setShowDemandList(false)} title="Staff Requisitions Queue" sub="Item demands raised by staff members">
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <button onClick={()=>{ setShowDemandForm(true); setShowDemandList(false); }} style={{width:'100%', padding:12, background:C.primaryBg, border:`1.5px solid ${C.border}`, borderRadius:12, color:C.primaryDk, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
            ➕ Create New Demand / Requisition
          </button>

          <div style={{display:'flex', flexDirection:'column', gap:10, maxHeight:360, overflowY:'auto', paddingRight:4}}>
            {demands.length === 0 ? (
              <p style={{textAlign:'center', padding:'20px 0', fontSize:13, color:C.muted}}>No demands in queue</p>
            ) : (
              demands.map(d => (
                <div key={d.id} style={{background:'#fff', border:`1px solid ${C.border}`, borderRadius:14, padding:14, boxShadow:'0 2px 8px rgba(120,104,10,0.03)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                    <div>
                      <h4 style={{margin:0, fontSize:14, fontWeight:800, color:C.text}}>{d.item}</h4>
                      <p style={{margin:'2px 0 0', fontSize:11.5, color:C.muted}}>Qty: {d.qty} · By: {d.reqBy}</p>
                      <p style={{margin:'2px 0 0', fontSize:10.5, color:C.muted}}>📅 {d.date} · Vendor: {d.vendor}</p>
                    </div>
                    <Chip label={d.status} color={d.status==='Approved'?C.success:d.status==='Pending'?'#d97706':C.danger} bg={d.status==='Approved'?C.successBg:d.status==='Pending'?'#fef3c7':C.dangerBg}/>
                  </div>
                  
                  {/* Approvals for Managers / Purchase Managers / Admin */}
                  {d.status === 'Pending' && (['Manager', 'Purchase Manager', 'HR'].includes(staffRole)) && (
                    <div style={{display:'flex', gap:8, marginTop:10}}>
                      <button onClick={() => setDemands(prev => prev.map(x => x.id === d.id ? {...x, status:'Approved'} : x))} style={{flex:1, padding:'6px 0', background:C.successBg, border:'none', borderRadius:8, color:C.success, fontSize:11.5, fontWeight:800, cursor:'pointer'}}>
                        ✓ Approve
                      </button>
                      <button onClick={() => setDemands(prev => prev.map(x => x.id === d.id ? {...x, status:'Rejected'} : x))} style={{flex:1, padding:'6px 0', background:C.dangerBg, border:'none', borderRadius:8, color:C.danger, fontSize:11.5, fontWeight:800, cursor:'pointer'}}>
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Sheet>

      {/* Sheet 2: Demand Creation Form */}
      {/* Item Request Full Modal */}
      {showItemRequestModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:500,
          display:'flex', flexDirection:'column', alignItems:'flex-end'
        }} onClick={e => { if (e.target === e.currentTarget) setShowItemRequestModal(false); }}>
          <div style={{
            width:'100%', maxWidth:480, height:'95vh', marginTop:'5vh',
            background:'#f8f9fa', borderRadius:'24px 24px 0 0',
            display:'flex', flexDirection:'column', overflowY:'auto'
          }}>
            {/* Header */}
            <div style={{
              background:'#fff', padding:'16px 18px',
              borderBottom:'1px solid #f1f5f9', display:'flex',
              alignItems:'center', justifyContent:'space-between',
              position:'sticky', top:0, zIndex:10, borderRadius:'24px 24px 0 0'
            }}>
              <div>
                <p style={{margin:0, fontSize:16, fontWeight:900, color:'#1a1500'}}>Request Items</p>
                <p style={{margin:'2px 0 0', fontSize:11, color:C.muted, fontWeight:700}}>{staffRole} list · {staffName}</p>
              </div>
              <button onClick={() => setShowItemRequestModal(false)} style={{background:'#f8f9fa', border:'none', borderRadius:10, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#666'}}>
                <span className="material-symbols-outlined" style={{fontSize:20}}>close</span>
              </button>
            </div>

            {/* Body */}
            <div style={{padding:'16px', display:'flex', flexDirection:'column', gap:14, flex:1}}>

              {/* Date & Send To */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div>
                  <p style={{margin:'0 0 5px', fontSize:10.5, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Date</p>
                  <input type="date" value={itemReqDate} onChange={e => setItemReqDate(e.target.value)}
                    style={{width:'100%', padding:'9px 12px', border:'1.5px solid #e8df9a', borderRadius:10, fontSize:13, fontFamily:'inherit', boxSizing:'border-box'}} />
                </div>
                <div>
                  <p style={{margin:'0 0 5px', fontSize:10.5, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Send To</p>
                  <select value={itemReqSendTo} onChange={e => setItemReqSendTo(e.target.value)}
                    style={{width:'100%', padding:'9px 12px', border:'1.5px solid #e8df9a', borderRadius:10, fontSize:13, fontFamily:'inherit', background:'#fff', boxSizing:'border-box'}}>
                    {RECIPIENTS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Search */}
              <div style={{position:'relative'}}>
                <span className="material-symbols-outlined" style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:17, color:C.muted}}>search</span>
                <input type="text" placeholder="Search items..." value={itemReqSearchQ} onChange={e => setItemReqSearchQ(e.target.value)}
                  style={{width:'100%', padding:'10px 12px 10px 38px', border:'1.5px solid #e8df9a', borderRadius:12, fontSize:13, fontFamily:'inherit', boxSizing:'border-box'}} />
              </div>

              {/* Summary row */}
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <p style={{margin:0, fontSize:11, fontWeight:700, color:C.muted}}>
                  {itemReqItems.filter(i => i.checked).length} items selected
                </p>
                <button onClick={() => setItemReqItems(prev => prev.map(i => ({ ...i, checked: false })))}
                  style={{background:'none', border:'none', fontSize:11, fontWeight:800, color:'#b91c1c', cursor:'pointer', fontFamily:'inherit', padding:0}}>
                  Clear All
                </button>
              </div>

              {/* Grouped item list */}
              {(() => {
                const filtered = itemReqItems.filter(i =>
                  i.name.toLowerCase().includes(itemReqSearchQ.toLowerCase()) ||
                  (i.cat || '').toLowerCase().includes(itemReqSearchQ.toLowerCase())
                );
                const categories = [...new Set(filtered.map(i => i.cat || 'General'))];
                return (
                  <div style={{display:'flex', flexDirection:'column', gap:12}}>
                    {categories.map(cat => {
                      const catItems = filtered.filter(i => (i.cat || 'General') === cat);
                      return (
                        <div key={cat}>
                          <p style={{margin:'0 0 8px', fontSize:10.5, fontWeight:800, color:C.muted, textTransform:'uppercase', letterSpacing:0.4}}>{cat}</p>
                          <div style={{display:'flex', flexDirection:'column', gap:6}}>
                            {catItems.map((item) => {
                              const globalIdx = itemReqItems.findIndex(i => i.name === item.name && i.cat === item.cat);
                              return (
                                <div key={item.name + item.cat} style={{
                                  background:'#fff',
                                  border: item.checked ? '1.5px solid #ca8a04' : '1px solid #f1f5f9',
                                  borderRadius:14, padding:'12px 14px',
                                  display:'flex', alignItems:'center', justifyContent:'space-between',
                                  boxShadow: item.checked ? '0 2px 8px rgba(202,138,4,0.08)' : 'none'
                                }}>
                                  <div style={{display:'flex', alignItems:'center', gap:10, flex:1}}>
                                    <div
                                      onClick={() => setItemReqItems(prev => prev.map((x, i) => i === globalIdx ? {...x, checked: !x.checked} : x))}
                                      style={{
                                        width:20, height:20, borderRadius:6,
                                        border: item.checked ? '2px solid #ca8a04' : '2px solid #d1d5db',
                                        background: item.checked ? '#ca8a04' : '#fff',
                                        cursor:'pointer', flexShrink:0,
                                        display:'flex', alignItems:'center', justifyContent:'center'
                                      }}
                                    >
                                      {item.checked && <span className="material-symbols-outlined" style={{fontSize:13, color:'#fff'}}>check</span>}
                                    </div>
                                    <div style={{flex:1}}>
                                      <p style={{margin:0, fontSize:13.5, fontWeight: item.checked ? 800 : 700, color: item.checked ? '#1a1500' : '#374151'}}>{item.name}</p>
                                      <p style={{margin:0, fontSize:10.5, color:C.muted}}>per {item.unit}{item.custom ? ' · Custom' : ''}</p>
                                    </div>
                                  </div>
                                  {item.checked && (
                                    <div style={{display:'flex', alignItems:'center', gap:6}}>
                                      <input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.qty}
                                        onChange={e => setItemReqItems(prev => prev.map((x, i) => i === globalIdx ? {...x, qty: e.target.value} : x))}
                                        style={{width:54, padding:'6px 8px', border:'1.5px solid #e8df9a', borderRadius:8, fontSize:12.5, textAlign:'center', fontFamily:'inherit'}}
                                      />
                                      <span style={{fontSize:11, color:C.muted, whiteSpace:'nowrap'}}>{item.unit}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Add Custom Item */}
              {!itemReqAddingCustom ? (
                <button onClick={() => setItemReqAddingCustom(true)} style={{
                  display:'flex', alignItems:'center', gap:8, background:'none',
                  border:'1.5px dashed #ca8a04', borderRadius:12, padding:'11px 14px',
                  fontSize:13, fontWeight:800, color:'#ca8a04', cursor:'pointer', fontFamily:'inherit', width:'100%'
                }}>
                  <span className="material-symbols-outlined" style={{fontSize:18}}>add</span>
                  Add Item Not In List
                </button>
              ) : (
                <div style={{background:'#fffef2', border:'1.5px solid #e8df9a', borderRadius:14, padding:'14px'}}>
                  <p style={{margin:'0 0 10px', fontSize:11.5, fontWeight:800, color:'#ca8a04'}}>ADD CUSTOM ITEM</p>
                  <div style={{display:'flex', gap:8, marginBottom:10}}>
                    <input type="text" placeholder="Item name..." value={itemReqCustomInput} onChange={e => setItemReqCustomInput(e.target.value)}
                      style={{flex:2, padding:'9px 12px', border:'1.5px solid #e8df9a', borderRadius:10, fontSize:13, fontFamily:'inherit'}} />
                    <input type="text" placeholder="Unit (kg/pc)" value={itemReqCustomUnit} onChange={e => setItemReqCustomUnit(e.target.value)}
                      style={{flex:1, padding:'9px 10px', border:'1.5px solid #e8df9a', borderRadius:10, fontSize:12, fontFamily:'inherit'}} />
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button onClick={addCustomItemToReq} style={{flex:1, padding:'9px 0', borderRadius:10, border:'none', background:'#ca8a04', color:'#fff', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
                      Add to List
                    </button>
                    <button onClick={() => { setItemReqAddingCustom(false); setItemReqCustomInput(''); setItemReqCustomUnit(''); }}
                      style={{flex:1, padding:'9px 0', borderRadius:10, border:'1px solid #e8df9a', background:'#fff', color:C.muted, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <p style={{margin:'0 0 5px', fontSize:10.5, fontWeight:800, color:C.muted, textTransform:'uppercase'}}>Note (Optional)</p>
                <textarea
                  value={itemReqNote}
                  onChange={e => setItemReqNote(e.target.value)}
                  placeholder="Any special instructions or remarks..."
                  rows={2}
                  style={{width:'100%', padding:'10px 12px', border:'1.5px solid #e8df9a', borderRadius:12, fontSize:13, fontFamily:'inherit', resize:'none', boxSizing:'border-box'}}
                />
              </div>
            </div>

            {/* Sticky Send button */}
            <div style={{padding:'14px 16px', background:'#fff', borderTop:'1px solid #f1f5f9', position:'sticky', bottom:0}}>
              <button onClick={sendItemRequest} style={{
                width:'100%', padding:15, borderRadius:14, border:'none',
                background: itemReqItems.filter(i => i.checked).length === 0 ? '#e5e7eb' : '#1a1500',
                color: itemReqItems.filter(i => i.checked).length === 0 ? '#9ca3af' : '#fde047',
                fontSize:14, fontWeight:900,
                cursor: itemReqItems.filter(i => i.checked).length === 0 ? 'not-allowed' : 'pointer',
                fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8
              }}>
                <span className="material-symbols-outlined" style={{fontSize:18}}>send</span>
                {itemReqItems.filter(i => i.checked).length === 0
                  ? 'Select items to send'
                  : ('Send to ' + itemReqSendTo + ' (' + itemReqItems.filter(i => i.checked).length + ' items)')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet 3: Add Items Modal (Screenshot 3) */}
      <Sheet show={showAddPurchaseModal} onClose={()=>setShowAddPurchaseModal(false)} title="Add Items" sub={selectedVendor ? `${selectedVendor.category} · ${selectedVendor.shop}` : ''}>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {/* Date Selector */}
          <div style={{marginBottom:10}}>
            <label style={{display:'block', fontSize:11, fontWeight:800, color:C.muted, textTransform:'uppercase', marginBottom:6}}>Date</label>
            <input 
              type="date" 
              value={purchaseDate} 
              onChange={e=>setPurchaseDate(e.target.value)} 
              style={{width:'100%', padding:12, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, fontFamily:'inherit'}}
            />
          </div>

          {/* Items checklist */}
          <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:260, overflowY:'auto', paddingRight:4}}>
            {purchaseItemsState.map((item, idx) => (
              <div key={item.name} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'#fff', border:`1px solid ${C.border}`, borderRadius:12}}>
                <div style={{display:'flex', alignItems:'center', gap:8, flex:1.5}}>
                  <input 
                    type="checkbox" 
                    checked={item.checked} 
                    onChange={e => setPurchaseItemsState(prev => prev.map((x, i) => i === idx ? {...x, checked: e.target.checked} : x))}
                    style={{width:16, height:16, cursor:'pointer'}}
                  />
                  <div>
                    <p style={{margin:0, fontSize:13, fontWeight:800, color:C.text}}>{item.name}</p>
                    <span style={{fontSize:10.5, color:C.muted}}>{item.rate} / {item.unit}</span>
                  </div>
                </div>
                
                {item.checked ? (
                  <div style={{display:'flex', alignItems:'center', gap:6, flex:2, justifyContent:'flex-end'}}>
                    <input 
                      type="number" 
                      value={item.qty} 
                      onChange={e => setPurchaseItemsState(prev => prev.map((x, i) => i === idx ? {...x, qty: Number(e.target.value)} : x))}
                      style={{width:60, padding:'6px 8px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, textAlign:'center'}}
                    />
                    <span style={{fontSize:11.5, color:C.muted}}>{item.unit}</span>
                    <input 
                      type="number" 
                      value={item.rate} 
                      onChange={e => setPurchaseItemsState(prev => prev.map((x, i) => i === idx ? {...x, rate: Number(e.target.value)} : x))}
                      style={{width:60, padding:'6px 8px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, textAlign:'center'}}
                    />
                  </div>
                ) : (
                  <span style={{fontSize:13, color:C.muted}}>-</span>
                )}

                <div style={{flex:0.8, textAlign:'right', fontSize:13, fontWeight:900, color:C.text}}>
                  {item.checked ? `₹${item.qty * item.rate}` : '-'}
                </div>
              </div>
            ))}
          </div>

          {/* Selection summary */}
          <div style={{background:'#ecfeff', border:'1px solid #cffafe', borderRadius:12, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:12.5, fontWeight:800, color:'#0891b2'}}>{purchaseItemsState.filter(i=>i.checked).length} items selected</span>
            <span style={{fontSize:14, fontWeight:900, color:'#0891b2'}}>₹{purchaseItemsState.filter(i=>i.checked).reduce((s, i) => s + (i.qty * i.rate), 0)}</span>
          </div>

          {/* Make Purchase Button */}
          <button 
            onClick={() => {
              const selectedItems = purchaseItemsState.filter(i => i.checked);
              if (selectedItems.length === 0) {
                alert('Please select at least one item.');
                return;
              }
              const totalCost = selectedItems.reduce((s, i) => s + (i.qty * i.rate), 0);
              const descStr = `Purchase: ` + selectedItems.map(i => `${i.name} (${i.qty} ${i.unit})`).join(', ');
              
              // Add ledger entry
              const newLedger = {
                id: Date.now(),
                vendorId: selectedVendor.id,
                date: purchaseDate.split('-').reverse().join('-'), // format date nicely
                type: 'Purchase',
                amount: totalCost,
                desc: descStr,
                status: 'Pending',
                pm: `UPI -> ${selectedVendor.upi}`
              };
              
              setVendorLedger(prev => [newLedger, ...prev]);
              
              // Update Vendor Balance
              setVendors(prev => prev.map(v => v.id === selectedVendor.id ? {...v, balance: v.balance + totalCost} : v));
              setSelectedVendor(prev => ({...prev, balance: prev.balance + totalCost}));
              
              setShowAddPurchaseModal(false);
              
              // Open Pay modal automatically
              setPayAmount(String(totalCost));
              setShowPayVendorModal(true);
            }} 
            style={{width:'100%', padding:14, background:'#0891b2', border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}
          >
            Make Purchase
          </button>
        </div>
      </Sheet>

      {/* Sheet 4: Purchase Payment Modal (Screenshot 4) */}
      {/* Sheet 5: Document Preview Modal */}
      <Sheet show={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc?.name || 'Document View'} sub="Uploaded Document Details">
        <div style={{display:'flex', flexDirection:'column', gap:14, alignItems:'center', textAlign:'center'}}>
          <div style={{width:68, height:68, borderRadius:50, background: '#fefce8', border: '1px solid #e8df9a', display:'flex', alignItems:'center', justifyContent:'center', margin:'10px 0'}}>
            <span className="material-symbols-outlined" style={{fontSize:32, color:'#ca8a04'}}>
              {previewDoc?.icon === 'badge' ? 'badge' : previewDoc?.icon === 'credit_card' ? 'credit_card' : 'description'}
            </span>
          </div>
          
          <div>
            <h4 style={{margin:0, fontSize:16, fontWeight:800, color:C.text}}>{previewDoc?.name}</h4>
            <p style={{margin:'4px 0 0', fontSize:12, color:C.muted}}>Reference/No: {previewDoc?.no}</p>
          </div>

          {/* Document Preview Box (Simulating a modern PDF/Image review card) */}
          <div style={{width:'100%', padding:'30px 10px', background:'#fafafa', border:`1.5px dashed ${C.border}`, borderRadius:14, display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
            <span className="material-symbols-outlined" style={{fontSize:40, color: previewDoc?.status === 'Verified' ? '#166534' : '#b45309'}}>
              {previewDoc?.status === 'Verified' ? 'task_alt' : 'quick_reference_all'}
            </span>
            <div>
              <p style={{margin:0, fontSize:13, fontWeight:800, color:C.text}}>{previewDoc?.fileUrl}</p>
              <p style={{margin:'2px 0 0', fontSize:10.5, color:C.muted}}>File Size: ~245 KB · PDF Format</p>
            </div>
            
            <div style={{marginTop:10, display:'inline-flex', alignItems:'center', gap:6, background: previewDoc?.status === 'Verified' ? '#dcfce7' : '#fef3c7', padding:'4px 12px', borderRadius:8}}>
              <span className="material-symbols-outlined" style={{fontSize:12, color: previewDoc?.status === 'Verified' ? '#166534' : '#b45309'}}>
                {previewDoc?.status === 'Verified' ? 'verified' : 'pending'}
              </span>
              <span style={{fontSize:10.5, fontWeight:800, color: previewDoc?.status === 'Verified' ? '#166534' : '#b45309'}}>
                {previewDoc?.status === 'Verified' ? 'VERIFIED DOCUMENT' : 'PENDING APPROVAL'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setPreviewDoc(null)} 
            style={{width:'100%', padding:12, background:'#ca8a04', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}
          >
            Close View
          </button>
        </div>
      </Sheet>
      <Sheet show={showPayVendorModal} onClose={()=>setShowPayVendorModal(false)} title="Purchase Payment">
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {/* Summary values card */}
          <div style={{background:'#fafafa', border:`1px solid ${C.border}`, borderRadius:14, padding:14, display:'flex', flexDirection:'column', gap:6}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:13}}>
              <span style={{color:C.muted}}>Total Pending</span>
              <span style={{fontWeight:800, color:C.text}}>₹{selectedVendor?.balance.toLocaleString()}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:13}}>
              <span style={{color:C.muted}}>Remaining after payment</span>
              <span style={{fontWeight:900, color:'#b91c1c'}}>₹{(Number(selectedVendor?.balance || 0) - Number(payAmount || 0)).toLocaleString()}</span>
            </div>
          </div>

          {/* Amount field */}
          <InputField 
            label="Amount Paying Now (₹)" 
            type="number" 
            required 
            value={payAmount} 
            onChange={e=>setPayAmount(e.target.value)} 
            placeholder="e.g. 5000"
          />

          {/* Toggle payment method */}
          <div>
            <label style={{display:'block', fontSize:11, fontWeight:800, color:C.muted, textTransform:'uppercase', marginBottom:6}}>Payment Method</label>
            <div style={{display:'flex', gap:10}}>
              <button 
                type="button"
                onClick={()=>setPayMethod('Cash')}
                style={{
                  flex:1, padding:12, borderRadius:10, border: payMethod==='Cash' ? 'none' : `1px solid ${C.border}`,
                  background: payMethod==='Cash' ? '#0891b2' : '#fff',
                  color: payMethod==='Cash' ? '#fff' : C.text,
                  fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit'
                }}
              >
                💵 Cash
              </button>
              <button 
                type="button"
                onClick={()=>setPayMethod('UPI')}
                style={{
                  flex:1, padding:12, borderRadius:10, border: payMethod==='UPI' ? 'none' : `1px solid ${C.border}`,
                  background: payMethod==='UPI' ? '#0891b2' : '#fff',
                  color: payMethod==='UPI' ? '#fff' : C.text,
                  fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit'
                }}
              >
                📲 UPI
              </button>
            </div>
          </div>

          {/* UPI specific detail fields */}
          {payMethod === 'UPI' && selectedVendor && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <InputField 
                label="Sender Phone / UPI ID" 
                value={paySenderUpi} 
                onChange={e=>setPaySenderUpi(e.target.value)} 
                placeholder="your.name@upi"
              />
              <InputField 
                label="Receiver Phone / UPI ID" 
                disabled 
                value={selectedVendor.upi} 
                placeholder="vendor@upi"
              />
            </div>
          )}

          {/* Confirm Button */}
          <button 
            onClick={() => {
              const amt = Number(payAmount);
              if (!amt || amt <= 0) {
                alert('Please enter a valid payment amount.');
                return;
              }
              
              // Add ledger entry
              const newLedger = {
                id: Date.now(),
                vendorId: selectedVendor.id,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                type: 'Payment',
                amount: amt,
                desc: payMethod==='UPI' ? `Paid via UPI to ${selectedVendor.upi}` : 'Paid via Cash',
                status: 'Approved',
                pm: payMethod
              };
              
              setVendorLedger(prev => [newLedger, ...prev]);
              
              // Update Vendor Balance
              setVendors(prev => prev.map(v => v.id === selectedVendor.id ? {...v, balance: v.balance - amt} : v));
              setSelectedVendor(prev => ({...prev, balance: prev.balance - amt}));
              
              setShowPayVendorModal(false);
              alert(`Payment of ₹${amt.toLocaleString()} recorded successfully!`);
            }} 
            style={{width:'100%', padding:14, background:'#0891b2', border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}
          >
            Confirm Payment
          </button>
        </div>
      </Sheet>
      <Sheet show={showDemandForm} onClose={()=>setShowDemandForm(false)} title="Demand Item / Supplies" sub="Submit requisition to admin">
        <form onSubmit={submitDemand} style={{display:'flex',flexDirection:'column',gap:12}}>
          <InputField label="Item Description *" required value={dItem} onChange={e=>setDItem(e.target.value)} placeholder="e.g. Basmati Rice 25kg"/>
          <InputField label="Quantity" value={dQty} onChange={e=>setDQty(e.target.value)} placeholder="e.g. 2 bags"/>
          <InputField label="Note / Urgency" value={dNote} onChange={e=>setDNote(e.target.value)} placeholder="e.g. Needed for tonight"/>
          <button type="submit" style={{padding:14,background:C.primary,color:C.text,border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px rgba(15,23,42,0.05)'}}>Submit Demand 🚀</button>
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


      {/* 🌾 STOCK REFILL MODAL */}
      {showRefillModal && (
         <div style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
           <div style={{background:'#fff', padding:'20px 20px 32px', borderTopLeftRadius:24, borderTopRightRadius:24, display:'flex', flexDirection:'column', gap:14, maxHeight:'90vh', overflowY:'auto'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <div>
                 <p style={{margin:0, fontSize:18, fontWeight:900, color:'#0f172a'}}>Stock &amp; Refill Request</p>
                 <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#64748b'}}>Kitchen Inventory vs Live Headcount</p>
               </div>
               <button onClick={() => setShowRefillModal(false)} style={{background:'#f1f5f9', border:'none', borderRadius:10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
                 <span className="material-symbols-outlined" style={{fontSize:18, color:'#64748b'}}>close</span>
               </button>
             </div>

             <div style={{display:'flex', flexDirection:'column', gap:10}}>
               {[
                 { name: 'Rice (Basmati)', stock: '14.5 kg', required: '5.0 kg', status: 'Sufficient', color: '#16a34a', bg: '#dcfce7' },
                 { name: 'Atta (Wheat Flour)', stock: '8.2 kg', required: '4.0 kg', status: 'Sufficient', color: '#16a34a', bg: '#dcfce7' },
                 { name: 'Arhar Dal', stock: '3.5 kg', required: '3.2 kg', status: '⚠️ LOW STOCK', color: '#d97706', bg: '#fef3c7' },
                 { name: 'Fresh Vegetables', stock: '12.0 kg', required: '6.0 kg', status: 'Sufficient', color: '#16a34a', bg: '#dcfce7' },
                 { name: 'Cooking Oil (Mustard)', stock: '4.0 L', required: '2.0 L', status: 'Sufficient', color: '#16a34a', bg: '#dcfce7' },
                 { name: 'Spices & Salt', stock: '1.2 kg', required: '0.8 kg', status: 'Sufficient', color: '#16a34a', bg: '#dcfce7' },
               ].map(item => (
                 <div key={item.name} style={{background:'#f8fafc', borderRadius:14, padding:'12px 14px', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div>
                     <p style={{margin:0, fontSize:14, fontWeight:900, color:'#0f172a'}}>{item.name}</p>
                     <p style={{margin:'2px 0 0', fontSize:11, fontWeight:700, color:'#64748b'}}>In Stock: <b>{item.stock}</b> · Needed Today: {item.required}</p>
                   </div>
                   <span style={{fontSize:10, fontWeight:800, padding:'4px 8px', borderRadius:6, background: item.bg, color: item.color}}>
                     {item.status}
                   </span>
                 </div>
               ))}
             </div>

             <button onClick={() => {
               setShowRefillModal(false);
               alert('✅ Refill order submitted to Purchase Manager! Vendor ledger & store inventory updated.');
             }} style={{marginTop:10, padding:'15px', background:'#0284c7', color:'#fff', border:'none', borderRadius:14, fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(2,132,199,0.3)'}}>
               Submit Refill Order to Purchase Manager
             </button>
           </div>
         </div>
      )}

      {/* 🚪 MOVE-OUT INSPECTION MODAL */}
      {showMoveOutModal && (
         <div style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
           <div style={{background:'#fff', padding:'20px 20px 32px', borderTopLeftRadius:24, borderTopRightRadius:24, display:'flex', flexDirection:'column', gap:14, maxHeight:'92vh', overflowY:'auto'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <div>
                 <p style={{margin:0, fontSize:18, fontWeight:900, color:'#0f172a'}}>Move-Out Room Inspection</p>
                 <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#64748b'}}>Audit room condition &amp; calculate damage fines</p>
               </div>
               <button onClick={() => setShowMoveOutModal(false)} style={{background:'#f1f5f9', border:'none', borderRadius:10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
                 <span className="material-symbols-outlined" style={{fontSize:18, color:'#64748b'}}>close</span>
               </button>
             </div>

             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
               <input type="text" placeholder="Room No. *" value={moRoom} onChange={e=>setMoRoom(e.target.value)} style={{padding:'12px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:700}} />
               <input type="text" placeholder="Tenant Name" value={moTenant} onChange={e=>setMoTenant(e.target.value)} style={{padding:'12px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:700}} />
             </div>

             <div style={{display:'flex', flexDirection:'column', gap:8}}>
               <label style={{fontSize:11, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5}}>Room Inventory Audit Checklist</label>
               {moItems.map(item => (
                 <div key={item.id} style={{background:'#f8fafc', borderRadius:12, padding:'10px 12px', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <span style={{fontSize:13, fontWeight:800, color:'#0f172a'}}>{item.name}</span>
                   <div style={{display:'flex', gap:6}}>
                     {['Intact', 'Damaged', 'Missing'].map(st => (
                       <button key={st} onClick={() => {
                         const fineAmount = st === 'Damaged' ? 800 : st === 'Missing' ? 1500 : 0;
                         setMoItems(prev => prev.map(x => x.id === item.id ? {...x, status: st, fine: fineAmount} : x));
                       }} style={{padding:'4px 8px', borderRadius:6, border:'none', fontSize:10, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
                         background: item.status === st ? (st === 'Intact' ? '#dcfce7' : st === 'Damaged' ? '#fef08a' : '#fee2e2') : '#e2e8f0',
                         color: item.status === st ? (st === 'Intact' ? '#15803d' : st === 'Damaged' ? '#92400e' : '#b91c1c') : '#64748b'
                       }}>
                         {st}
                       </button>
                     ))}
                   </div>
                 </div>
               ))}
             </div>

             {/* Total Fine Summary */}
             <div style={{background:'#fef2f2', borderRadius:14, padding:'12px 16px', border:'1px solid #fecaca', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <div>
                 <p style={{margin:0, fontSize:11, fontWeight:800, color:'#b91c1c', textTransform:'uppercase'}}>Estimated Damage Fine</p>
                 <p style={{margin:'2px 0 0', fontSize:18, fontWeight:900, color:'#991b1b'}}>
                   ₹{moItems.reduce((acc, curr) => acc + curr.fine, 0)}
                 </p>
               </div>
               <button onClick={() => alert('Camera opened for photo proof upload!')} style={{padding:'8px 12px', background:'#fff', border:'1px solid #fca5a5', borderRadius:10, color:'#b91c1c', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4}}>
                 <span className="material-symbols-outlined" style={{fontSize:16}}>add_a_photo</span> Photo Proof
               </button>
             </div>

             <button onClick={() => {
               if (!moRoom) return alert('Please enter room number');
               const totalFine = moItems.reduce((acc, curr) => acc + curr.fine, 0);
               setShowMoveOutModal(false);
               alert(`✅ Move-Out Inspection submitted for Room ${moRoom}! Total fine ₹${totalFine} synced to Admin Security Deposit Refund Settlement.`);
               setMoRoom(''); setMoTenant('');
             }} style={{padding:'15px', background:'#0f172a', color:'#fde047', border:'none', borderRadius:14, fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
               Submit Inspection &amp; Sync to Admin Deposit Settlement
             </button>
           </div>
         </div>
      )}

      {/* ⛽ LOG FUEL EXPENSE MODAL */}
      {showFuelModal && (
         <div style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
           <div style={{background:'#fff', padding:'20px 20px 32px', borderTopLeftRadius:24, borderTopRightRadius:24, display:'flex', flexDirection:'column', gap:14}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <div>
                 <p style={{margin:0, fontSize:18, fontWeight:900, color:'#0f172a'}}>Log Bus Fuel Expense</p>
                 <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#64748b'}}>Syncs directly to Admin Petty Cash &amp; Vendor Ledger</p>
               </div>
               <button onClick={() => setShowFuelModal(false)} style={{background:'#f1f5f9', border:'none', borderRadius:10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
                 <span className="material-symbols-outlined" style={{fontSize:18, color:'#64748b'}}>close</span>
               </button>
             </div>

             <div style={{display:'flex', flexDirection:'column', gap:10}}>
               <input type="number" placeholder="Fuel Liters (e.g. 15.5 L)" value={fuelLiters} onChange={e=>setFuelLiters(e.target.value)} style={{padding:'12px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600}} />
               <input type="number" placeholder="Total Amount (₹) *" value={fuelAmount} onChange={e=>setFuelAmount(e.target.value)} style={{padding:'12px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600}} />
               <input type="text" placeholder="Fuel Station / Pump Name" value={fuelPump} onChange={e=>setFuelPump(e.target.value)} style={{padding:'12px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600}} />
             </div>

             <button onClick={() => {
               if (!fuelAmount) return alert('Please enter total amount');
               setShowFuelModal(false);
               alert(`✅ Fuel expense of ₹${fuelAmount} logged & synced to Admin Petty Cash Ledger!`);
               setFuelLiters(''); setFuelAmount(''); setFuelPump('');
             }} style={{padding:'14px', background:'#0f172a', color:'#fde047', border:'none', borderRadius:14, fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}>
               Save Expense to Admin Ledger
             </button>
           </div>
         </div>
      )}

      {/* 🛡️ GATEKEEPER VISITOR MODAL */}
      {showGatekeeperModal && (
         <div style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
           <div style={{background:'#fff', padding:'20px 20px 32px', borderTopLeftRadius:24, borderTopRightRadius:24, display:'flex', flexDirection:'column', gap:14, maxHeight:'92vh', overflowY:'auto'}}>
             
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <div>
                 <p style={{margin:0, fontSize:18, fontWeight:900, color:'#0f172a'}}>New Visitor Entry</p>
                 <p style={{margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#94a3b8'}}>Fill all details for gate record</p>
               </div>
               <button onClick={() => { setShowGatekeeperModal(false); setGkPhoto(null); }} style={{background:'#f1f5f9', border:'none', borderRadius:10, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
                 <span className="material-symbols-outlined" style={{fontSize:18, color:'#64748b'}}>close</span>
               </button>
             </div>

             <div style={{display:'flex', flexDirection:'column', gap:8}}>
               <label style={{fontSize:11, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5}}>Visitor Photo</label>
               <div style={{display:'flex', gap:10, alignItems:'center'}}>
                 <div style={{width:72, height:72, borderRadius:16, background:'#f1f5f9', border:'2px dashed #cbd5e1', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0}}>
                   {gkPhoto ? (
                     <img src={gkPhoto} alt="Visitor" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                   ) : (
                     <span className="material-symbols-outlined" style={{fontSize:30, color:'#94a3b8'}}>person</span>
                   )}
                 </div>
                 <div style={{display:'flex', flexDirection:'column', gap:8, flex:1}}>
                   <label style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#0f172a', borderRadius:12, cursor:'pointer', color:'#fde047', fontSize:13, fontWeight:800}}>
                     <span className="material-symbols-outlined" style={{fontSize:18}}>photo_camera</span>
                     Click Photo
                     <input type="file" accept="image/*" capture="environment" onChange={e => {
                       const file = e.target.files[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onload = ev => setGkPhoto(ev.target.result);
                         reader.readAsDataURL(file);
                       }
                     }} style={{display:'none'}} />
                   </label>
                   <label style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#f1f5f9', borderRadius:12, cursor:'pointer', color:'#475569', fontSize:13, fontWeight:800}}>
                     <span className="material-symbols-outlined" style={{fontSize:18}}>upload</span>
                     Upload from Gallery
                     <input type="file" accept="image/*" onChange={e => {
                       const file = e.target.files[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onload = ev => setGkPhoto(ev.target.result);
                         reader.readAsDataURL(file);
                       }
                     }} style={{display:'none'}} />
                   </label>
                 </div>
               </div>
             </div>

             <div style={{height:'1px', background:'#f1f5f9'}} />

             <div style={{display:'flex', flexDirection:'column', gap:10}}>
               <label style={{fontSize:11, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5}}>Visitor Info</label>
               <input type="text" placeholder="Full Name *" value={gkName} onChange={e=>setGkName(e.target.value)}
                 style={{padding:'13px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600, outline:'none'}} />
               <input type="tel" placeholder="Phone Number" value={gkPhone} onChange={e=>setGkPhone(e.target.value)}
                 style={{padding:'13px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600, outline:'none'}} />
               <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                 <input type="text" placeholder="Room No. *" value={gkRoom} onChange={e=>setGkRoom(e.target.value)}
                   style={{padding:'13px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600, outline:'none'}} />
                 <select value={gkRelation} onChange={e=>setGkRelation(e.target.value)}
                   style={{padding:'13px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600, color: gkRelation ? '#0f172a' : '#94a3b8'}}>
                   <option value="" disabled>Relation *</option>
                   <option>Father</option>
                   <option>Mother</option>
                   <option>Brother</option>
                   <option>Sister</option>
                   <option>Uncle (Chacha)</option>
                   <option>Uncle (Mama)</option>
                   <option>Aunt</option>
                   <option>Grandfather</option>
                   <option>Grandmother</option>
                   <option>Friend</option>
                   <option>Colleague</option>
                   <option>Delivery Agent</option>
                   <option>Other</option>
                 </select>
               </div>
               <select value={gkPurpose} onChange={e=>setGkPurpose(e.target.value)}
                 style={{padding:'13px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600, color: gkPurpose ? '#0f172a' : '#94a3b8'}}>
                 <option value="" disabled>Purpose of Visit</option>
                 <option>Monthly visit &amp; fee payment</option>
                 <option>Dropping food &amp; groceries</option>
                 <option>Collecting documents</option>
                 <option>Medical emergency</option>
                 <option>Parcel / Delivery</option>
                 <option>Festival / Special occasion</option>
                 <option>Casual visit</option>
                 <option>Moving in / Moving out</option>
                 <option>Other</option>
               </select>
             </div>

             <div style={{display:'flex', flexDirection:'column', gap:10}}>
               <label style={{fontSize:11, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5}}>Government ID Proof *</label>
               <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                 <select value={gkIdType} onChange={e=>setGkIdType(e.target.value)}
                   style={{padding:'13px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:700}}>
                   <option>Aadhaar Card</option>
                   <option>Voter ID</option>
                   <option>Driving Licence</option>
                   <option>Passport</option>
                   <option>PAN Card</option>
                   <option>Employee ID</option>
                   <option>Student ID</option>
                 </select>
                 <input type="text" placeholder="ID Number *" value={gkIdNumber} onChange={e=>setGkIdNumber(e.target.value)}
                   style={{padding:'13px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontFamily:'inherit', fontSize:14, fontWeight:600, outline:'none'}} />
               </div>
             </div>

             <button
               onClick={() => {
                 if (!gkName.trim()) return alert('Visitor name is required');
                 if (!gkRoom.trim()) return alert('Room number is required');
                 if (!gkRelation) return alert('Please select relation with student');
                 if (!gkIdNumber.trim()) return alert('ID Proof number is required');
                 setVisitorLogs([{
                   id: Date.now(),
                   name: gkName,
                   phone: gkPhone,
                   room: gkRoom,
                   relation: gkRelation,
                   purpose: gkPurpose || 'Casual visit',
                   idProof: `${gkIdType}: ${gkIdNumber}`,
                   photo: gkPhoto,
                   timeIn: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                   timeOut: null
                 }, ...visitorLogs]);
                 setShowGatekeeperModal(false);
                 setGkName(''); setGkPhone(''); setGkRoom(''); setGkRelation('');
                 setGkPurpose(''); setGkIdNumber(''); setGkPhoto(null);
                 alert('✅ Entry logged! Alert sent to Student and Admin.');
               }}
               style={{marginTop:6, padding:'15px', background:'#0f172a', color:'#fde047', border:'none', borderRadius:14, fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:'inherit'}}
             >
               Allow Entry &amp; Log Record
             </button>
           </div>
         </div>
      )}

    </div>
  );
}