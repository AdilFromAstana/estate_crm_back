export interface ParsedPropertyData {
  title: string;
  price: string;
  currency: string;
  address: string;
  city: string;
  district: string;
  street?: string;
  houseNumber?: string;
  area?: string;
  kitchenArea?: string;
  rooms?: string;
  floor?: string;
  totalFloors?: string;
  buildingType?: string;
  yearBuilt?: string;
  flatRenovation?: string;
  bathroom?: string;
  balcony?: string;
  parking?: string;
  furniture?: string;
  complex?: string;
  description?: string;
  photos: string[];
  sourceUrl: string;
}
