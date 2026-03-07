export type Landmark = {
  id: string;
  name: string;
  category: string;
  barangay: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  aliases: string[];
};
