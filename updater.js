const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server', 'seed', 'seed.js');
let content = fs.readFileSync(file, 'utf8');

// 1. replace all cities in the user array
content = content.replace(/city: '(Delhi|Mumbai|Bangalore|Noida|Hyderabad|Chennai|Pune)'/g, "city: 'Lucknow'");

// 2. replace hospital names
content = content.replace(/Apollo Hospital Delhi/g, 'Apollo Hospital Lucknow');
content = content.replace(/Max Healthcare Mumbai/g, 'Max Healthcare Lucknow');

// 3. Labs replacements:
// Define lucknow areas with approximate coords
const lucknowAreas = [
  { area: 'Hazratganj', lat: 26.8500, lng: 80.9499 },
  { area: 'Gomti Nagar', lat: 26.8467, lng: 80.9462 },
  { area: 'Alambagh', lat: 26.8043, lng: 80.8996 },
  { area: 'Indira Nagar', lat: 26.8756, lng: 80.9966 },
  { area: 'Aminabad', lat: 26.8436, lng: 80.9252 },
  { area: 'Aliganj', lat: 26.8856, lng: 80.9425 },
  { area: 'Mahanagar', lat: 26.8705, lng: 80.9482 },
  { area: 'Chowk', lat: 26.8660, lng: 80.9038 },
  { area: 'Ashiyana', lat: 26.7876, lng: 80.9168 },
  { area: 'Vikas Nagar', lat: 26.9015, lng: 80.9634 },
  { area: 'Janakipuram', lat: 26.9150, lng: 80.9416 },
  { area: 'Rajajipuram', lat: 26.8373, lng: 80.8875 },
  { area: 'Kapoorthala', lat: 26.8767, lng: 80.9442 },
  { area: 'Aashiana', lat: 26.7865, lng: 80.9153 },
  { area: 'Gomti Nagar Extension', lat: 26.8202, lng: 80.9892 }
];

// Regex to capture the location object inside the labs array
const labRegex = /location:\s*{([^}]+)}/g;

let matchIndex = 0;
content = content.replace(labRegex, (match, interior) => {
    const areaInfo = lucknowAreas[matchIndex % lucknowAreas.length];
    matchIndex++;
    return `location: { city: 'Lucknow', area: '${areaInfo.area}', address: 'Main Road, ${areaInfo.area}, Lucknow', coordinates: { lat: ${areaInfo.lat}, lng: ${areaInfo.lng} } }`;
});

// Update the booking addresses to Lucknow too
content = content.replace(/123, Sector 15, Rohini, Delhi/g, '123, Sector 15, Gomti Nagar, Lucknow');
content = content.replace(/45, HSR Layout, Bangalore/g, '45, HSR Layout, Hazratganj, Lucknow');

// Update hospital addresses
content = content.replace(/Sarita Vihar, Delhi Mathura Road, New Delhi/g, 'Gomti Nagar, Lucknow');
content = content.replace(/Nanavati Max, Vile Parle West, Mumbai/g, 'Hazratganj, Lucknow');

// Description replacements
content = content.replace(/Mumbai's/g, "Lucknow's");
content = content.replace(/Pune/g, "Lucknow");
content = content.replace(/Chennai/g, "Lucknow");
content = content.replace(/South India's/g, "North India's");

fs.writeFileSync(file, content, 'utf8');
console.log('Seed file updated successfully to Lucknow mock data.');
