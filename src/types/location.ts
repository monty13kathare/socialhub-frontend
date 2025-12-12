// types/location.ts
export interface Country {
  code: string;
  name: string;
  states: State[];
}

export interface State {
  code: string;
  name: string;
  cities: string[];
}

export interface LocationData {
  country: string;
  state: string;
  city: string;
}