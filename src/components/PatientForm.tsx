import React from 'react';
import { Patient, Sex } from '../types';

interface Props {
  patient: Patient;
  setPatient: (p: Patient) => void;
}

export const PatientForm: React.FC<Props> = ({ patient, setPatient }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient({
      ...patient,
      [name]: name === 'age' || name === 'birthYear' || name === 'diagnosisYear' ? Number(value) : value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-semibold text-medical-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        Patient Demographics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Current Age</label>
          <input type="number" name="age" value={patient.age} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Sex</label>
          <select name="sex" value={patient.sex} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border">
            <option value={Sex.Male}>Male</option>
            <option value={Sex.Female}>Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Diagnosis Year</label>
          <input type="number" name="diagnosisYear" value={patient.diagnosisYear} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border" />
        </div>
        <div className="md:col-span-3">
           <label className="block text-sm font-medium text-slate-700">Tumor Type</label>
           <input type="text" name="tumorType" value={patient.tumorType} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border" placeholder="e.g. Hodgkin Lymphoma, ALL..." />
        </div>
      </div>
    </div>
  );
};