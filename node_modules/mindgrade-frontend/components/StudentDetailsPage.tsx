import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const classOptions = ['6', '7', '8', '9', '10'];

const validatePhone = (p: string) => {
  const cleaned = p.replace(/\D/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15;
};

const StudentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('8');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Please enter student name';
    if (!validatePhone(phone)) nextErrors.phone = 'Enter a valid phone number';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      const payload = { name: name.trim(), class: studentClass, phone: phone.replace(/\D/g, '') };
      localStorage.setItem('studentDetails', JSON.stringify(payload));
      navigate('/test-selection');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Student Details</h2>
        <p className="text-slate-500 mb-6">Fill in basic details so we can personalise your practice.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200"
              placeholder="Student name"
            />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter phone number"
              inputMode="tel"
            />
            {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentDetailsPage;
