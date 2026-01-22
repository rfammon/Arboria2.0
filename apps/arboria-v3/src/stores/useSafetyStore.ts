import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface MedicalInfo {
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
}

interface SafetyState {
  emergencyContacts: EmergencyContact[];
  medicalInfo: MedicalInfo;
  hasViewedTutorial: boolean;
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  updateMedicalInfo: (info: Partial<MedicalInfo>) => void;
  setHasViewedTutorial: (viewed: boolean) => void;
}

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set) => ({
      emergencyContacts: [
        {
          id: '1',
          name: 'Supervisor/Central',
          phone: '+55 11 99999-9999',
          relation: 'Work/Support',
        },
      ],
      medicalInfo: {
        bloodType: '',
        allergies: '',
        chronicConditions: '',
        medications: '',
      },
      hasViewedTutorial: false,

      addContact: (contact) =>
        set((state) => ({
          emergencyContacts: [
            ...state.emergencyContacts,
            { ...contact, id: crypto.randomUUID() },
          ],
        })),

      removeContact: (id) =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
        })),

      updateMedicalInfo: (info) =>
        set((state) => ({
          medicalInfo: { ...state.medicalInfo, ...info },
        })),

      setHasViewedTutorial: (viewed) =>
        set({ hasViewedTutorial: viewed }),
    }),
    {
      name: 'arboria-safety-storage',
    }
  )
);
