export interface Resource {
  id: number;
  fullName: string;
  specialty: Specialty;
  specialtyLabel: string;
  facility: string;
  office: string;
}

export enum Specialty {
  Therapist = 'Therapist',
  Ophthalmologist = 'Ophthalmologist',
}

export const SPECIALTY_LABELS = {
  [Specialty.Therapist]: 'Терапевты',
  [Specialty.Ophthalmologist]: 'Офтальмологи',
};
