export interface Country {
  code: string;
  name: string;
  states: {
    code: string;
    name: string;
    cities: string[];
  }[];
}






export const COUNTRIES_DATA: Country[] = [
  // 🇮🇳 INDIA
 {
  code: "IN",
  name: "India",
  states: [
    { code: "AP", name: "Andhra Pradesh", cities: ["Vijayawada", "Visakhapatnam", "Guntur", "Nellore"] },
    { code: "AR", name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang"] },
    { code: "AS", name: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"] },
    { code: "BR", name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"] },
    { code: "CG", name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur", "Korba"] },
    { code: "GA", name: "Goa", cities: ["Panaji", "Margao", "Mapusa", "Vasco da Gama"] },
    { code: "GJ", name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
    { code: "HR", name: "Haryana", cities: ["Gurugram", "Faridabad", "Panipat", "Ambala"] },
    { code: "HP", name: "Himachal Pradesh", cities: ["Shimla", "Manali", "Dharamshala", "Solan"] },
    { code: "JH", name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"] },
    { code: "KA", name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Mangalore", "Hubballi"] },
    { code: "KL", name: "Kerala", cities: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"] },
    { code: "MP", name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur"] },
    { code: "MH", name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik"] },
    { code: "MN", name: "Manipur", cities: ["Imphal", "Thoubal", "Churachandpur", "Bishnupur"] },
    { code: "ML", name: "Meghalaya", cities: ["Shillong", "Tura", "Jowai", "Nongpoh"] },
    { code: "MZ", name: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip"] },
    { code: "NL", name: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang"] },
    { code: "OD", name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur"] },
    { code: "PB", name: "Punjab", cities: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"] },
    { code: "RJ", name: "Rajasthan", cities: ["Jaipur", "Udaipur", "Jodhpur", "Kota"] },
    { code: "SK", name: "Sikkim", cities: ["Gangtok", "Namchi", "Gyalshing", "Mangan"] },
    { code: "TN", name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"] },
    { code: "TS", name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"] },
    { code: "TR", name: "Tripura", cities: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"] },
    { code: "UP", name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Varanasi", "Agra"] },
    { code: "UK", name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Rishikesh", "Nainital"] },
    { code: "WB", name: "West Bengal", cities: ["Kolkata", "Asansol", "Siliguri", "Durgapur"] },

    // Union Territories
    { code: "AN", name: "Andaman and Nicobar Islands", cities: ["Port Blair", "Car Nicobar", "Havelock Island"] },
    { code: "CH", name: "Chandigarh", cities: ["Chandigarh"] },
    { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", cities: ["Daman", "Diu", "Silvassa"] },
    { code: "DL", name: "Delhi", cities: ["New Delhi", "Dwarka", "Rohini", "Saket"] },
    { code: "JK", name: "Jammu and Kashmir", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla"] },
    { code: "LA", name: "Ladakh", cities: ["Leh", "Kargil"] },
    { code: "LD", name: "Lakshadweep", cities: ["Kavaratti", "Agatti", "Minicoy"] },
    { code: "PY", name: "Puducherry", cities: ["Puducherry", "Karaikal", "Mahe", "Yanam"] },
  ],
},


  // 🇺🇸 UNITED STATES
  {
    code: "US",
    name: "United States",
    states: [
      { code: "CA", name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"] },
      { code: "NY", name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Albany"] },
      { code: "TX", name: "Texas", cities: ["Houston", "Dallas", "Austin", "San Antonio"] },
      { code: "FL", name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville"] },
      { code: "IL", name: "Illinois", cities: ["Chicago", "Springfield", "Peoria", "Naperville"] },
    ],
  },

  // 🇨🇦 CANADA
  {
    code: "CA",
    name: "Canada",
    states: [
      { code: "ON", name: "Ontario", cities: ["Toronto", "Ottawa", "Hamilton", "London"] },
      { code: "BC", name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey", "Burnaby"] },
      { code: "QC", name: "Quebec", cities: ["Montreal", "Quebec City", "Laval", "Gatineau"] },
      { code: "AB", name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge"] },
      { code: "MB", name: "Manitoba", cities: ["Winnipeg", "Brandon", "Steinbach", "Thompson"] },
    ],
  },

  // 🇬🇧 UNITED KINGDOM
  {
    code: "UK",
    name: "United Kingdom",
    states: [
      { code: "ENG", name: "England", cities: ["London", "Manchester", "Birmingham", "Liverpool"] },
      { code: "SCT", name: "Scotland", cities: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"] },
      { code: "WLS", name: "Wales", cities: ["Cardiff", "Swansea", "Newport", "Bangor"] },
      { code: "NIR", name: "Northern Ireland", cities: ["Belfast", "Londonderry", "Lisburn", "Newry"] },
    ],
  },

  // 🇦🇺 AUSTRALIA
  {
    code: "AU",
    name: "Australia",
    states: [
      { code: "NSW", name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong", "Parramatta"] },
      { code: "VIC", name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo"] },
      { code: "QLD", name: "Queensland", cities: ["Brisbane", "Gold Coast", "Cairns", "Townsville"] },
      { code: "WA", name: "Western Australia", cities: ["Perth", "Fremantle", "Bunbury", "Geraldton"] },
      { code: "SA", name: "South Australia", cities: ["Adelaide", "Mount Gambier", "Whyalla", "Port Augusta"] },
    ],
  },

  // 🇳🇿 NEW ZEALAND
  {
    code: "NZ",
    name: "New Zealand",
    states: [
      { code: "AUK", name: "Auckland Region", cities: ["Auckland", "Manukau", "North Shore", "Waitakere"] },
      { code: "WGN", name: "Wellington Region", cities: ["Wellington", "Lower Hutt", "Porirua", "Upper Hutt"] },
      { code: "CAN", name: "Canterbury", cities: ["Christchurch", "Timaru", "Ashburton", "Kaiapoi"] },
      { code: "OTA", name: "Otago", cities: ["Dunedin", "Queenstown", "Oamaru", "Wanaka"] },
      { code: "WKO", name: "Waikato", cities: ["Hamilton", "Cambridge", "Taupo", "Te Awamutu"] },
    ],
  },

  // 🇿🇦 SOUTH AFRICA
  {
    code: "ZA",
    name: "South Africa",
    states: [
      { code: "GP", name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Soweto", "Midrand"] },
      { code: "WC", name: "Western Cape", cities: ["Cape Town", "Stellenbosch", "Paarl", "George"] },
      { code: "KZN", name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle"] },
      { code: "EC", name: "Eastern Cape", cities: ["Port Elizabeth", "East London", "Mthatha", "Grahamstown"] },
      { code: "FS", name: "Free State", cities: ["Bloemfontein", "Welkom", "Bethlehem", "Sasolburg"] },
    ],
  },
];
