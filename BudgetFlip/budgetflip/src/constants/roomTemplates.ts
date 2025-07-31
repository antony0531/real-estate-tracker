export interface RoomTemplate {
  id: string;
  category: string;
  name: string;
  typicalDimensions: string;
  icon: string;
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  // Living Spaces
  {
    id: 'living-room',
    category: 'Living Spaces',
    name: 'Living Room',
    typicalDimensions: '16x20',
    icon: '🛋️'
  },
  {
    id: 'family-room',
    category: 'Living Spaces',
    name: 'Family Room',
    typicalDimensions: '14x18',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 'dining-room',
    category: 'Living Spaces',
    name: 'Dining Room',
    typicalDimensions: '12x14',
    icon: '🍽️'
  },
  {
    id: 'home-office',
    category: 'Living Spaces',
    name: 'Home Office',
    typicalDimensions: '10x12',
    icon: '💼'
  },
  {
    id: 'den-study',
    category: 'Living Spaces',
    name: 'Den/Study',
    typicalDimensions: '10x10',
    icon: '📚'
  },
  
  // Bedrooms
  {
    id: 'master-bedroom',
    category: 'Bedrooms',
    name: 'Master Bedroom',
    typicalDimensions: '14x16',
    icon: '🛏️'
  },
  {
    id: 'bedroom-2',
    category: 'Bedrooms',
    name: 'Bedroom 2',
    typicalDimensions: '11x12',
    icon: '🛏️'
  },
  {
    id: 'bedroom-3',
    category: 'Bedrooms',
    name: 'Bedroom 3',
    typicalDimensions: '10x12',
    icon: '🛏️'
  },
  {
    id: 'bedroom-4',
    category: 'Bedrooms',
    name: 'Bedroom 4',
    typicalDimensions: '10x11',
    icon: '🛏️'
  },
  {
    id: 'guest-room',
    category: 'Bedrooms',
    name: 'Guest Room',
    typicalDimensions: '10x12',
    icon: '🛏️'
  },
  
  // Bathrooms
  {
    id: 'master-bathroom',
    category: 'Bathrooms',
    name: 'Master Bathroom',
    typicalDimensions: '8x10',
    icon: '🚿'
  },
  {
    id: 'full-bathroom',
    category: 'Bathrooms',
    name: 'Full Bathroom',
    typicalDimensions: '5x8',
    icon: '🚿'
  },
  {
    id: 'half-bathroom',
    category: 'Bathrooms',
    name: 'Half Bath/Powder Room',
    typicalDimensions: '4x5',
    icon: '🚽'
  },
  
  // Kitchen & Utility
  {
    id: 'kitchen',
    category: 'Kitchen & Utility',
    name: 'Kitchen',
    typicalDimensions: '12x16',
    icon: '👨‍🍳'
  },
  {
    id: 'pantry',
    category: 'Kitchen & Utility',
    name: 'Pantry',
    typicalDimensions: '4x6',
    icon: '🥫'
  },
  {
    id: 'laundry-room',
    category: 'Kitchen & Utility',
    name: 'Laundry Room',
    typicalDimensions: '6x8',
    icon: '🧺'
  },
  {
    id: 'mudroom',
    category: 'Kitchen & Utility',
    name: 'Mudroom',
    typicalDimensions: '6x8',
    icon: '🧥'
  },
  
  // Outdoor & Other
  {
    id: 'garage',
    category: 'Outdoor & Other',
    name: 'Garage',
    typicalDimensions: '20x20',
    icon: '🚗'
  },
  {
    id: 'deck-patio',
    category: 'Outdoor & Other',
    name: 'Deck/Patio',
    typicalDimensions: '12x16',
    icon: '🪴'
  },
  {
    id: 'basement',
    category: 'Outdoor & Other',
    name: 'Basement',
    typicalDimensions: 'Varies',
    icon: '🏚️'
  },
  {
    id: 'attic',
    category: 'Outdoor & Other',
    name: 'Attic',
    typicalDimensions: 'Varies',
    icon: '🏠'
  },
  
  // Special Rooms
  {
    id: 'home-theater',
    category: 'Special',
    name: 'Home Theater',
    typicalDimensions: '14x20',
    icon: '🎬'
  },
  {
    id: 'gym',
    category: 'Special',
    name: 'Home Gym',
    typicalDimensions: '12x14',
    icon: '🏋️'
  },
  {
    id: 'wine-cellar',
    category: 'Special',
    name: 'Wine Cellar',
    typicalDimensions: '8x10',
    icon: '🍷'
  },
  {
    id: 'workshop',
    category: 'Special',
    name: 'Workshop',
    typicalDimensions: '12x16',
    icon: '🔧'
  },
  {
    id: 'sunroom',
    category: 'Special',
    name: 'Sunroom',
    typicalDimensions: '10x14',
    icon: '☀️'
  }
];

export const ROOM_CONDITIONS = [
  { value: 'excellent', label: 'Excellent', color: 'text-green-600', description: 'Like new, no repairs needed' },
  { value: 'good', label: 'Good', color: 'text-blue-600', description: 'Minor cosmetic updates needed' },
  { value: 'fair', label: 'Fair', color: 'text-yellow-600', description: 'Moderate repairs and updates needed' },
  { value: 'poor', label: 'Poor', color: 'text-red-600', description: 'Major renovation required' }
];

export const RENOVATION_SCOPES = [
  { id: 'paint', label: 'Paint', icon: '🎨' },
  { id: 'flooring', label: 'Flooring', icon: '🪵' },
  { id: 'electrical', label: 'Electrical', icon: '⚡' },
  { id: 'plumbing', label: 'Plumbing', icon: '🚿' },
  { id: 'hvac', label: 'HVAC', icon: '❄️' },
  { id: 'windows', label: 'Windows', icon: '🪟' },
  { id: 'doors', label: 'Doors', icon: '🚪' },
  { id: 'fixtures', label: 'Fixtures', icon: '💡' },
  { id: 'cabinets', label: 'Cabinets', icon: '🗄️' },
  { id: 'countertops', label: 'Countertops', icon: '🪨' },
  { id: 'appliances', label: 'Appliances', icon: '🔌' },
  { id: 'demo', label: 'Demolition', icon: '🔨' }
];