'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const categories = [
  { label: 'Mental Demand', color: 'text-indigo-400', icon: '🧠' },
  { label: 'Physical Demand', color: 'text-red-400', icon: '💪' },
  { label: 'Temporal Demand', color: 'text-yellow-400', icon: '⏰' },
  { label: 'Performance', color: 'text-green-400', icon: '🎯' },
  { label: 'Effort', color: 'text-blue-400', icon: '⚙️' },
  { label: 'Frustration', color: 'text-pink-400', icon: '😤' },
];

const categoryDescriptions = {
  'Mental Demand': 'How mentally challenging the task felt.',
  'Physical Demand': 'How much physical activity was required.',
  'Temporal Demand': 'Time pressure and urgency felt during the task.',
  'Performance': 'How successful you felt at completing the task.',
  'Effort': 'How hard you worked to complete the task.',
  'Frustration': 'Feelings of annoyance, stress, or irritation.',
};

export default function NasaTLXForm() {
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();

  const handleChange = (category, value) => {
    setScores(prev => ({ ...prev, [category]: Number(value) }));
  };

  const calculateWeightedAverage = () => {
    const weights = {
      'Mental Demand': 0.2,
      'Physical Demand': 0.15,
      'Temporal Demand': 0.15,
      'Performance': 0.2,
      'Effort': 0.15,
      'Frustration': 0.15,
    };

    const raw = Object.values(scores).reduce((a, b) => a + b, 0);
    const weighted = Object.entries(scores).reduce((total, [key, value]) => {
      return total + value * weights[key];
    }, 0);

    return { raw, weighted: weighted.toFixed(2) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(scores).length !== categories.length) {
      alert('Please complete all fields.');
      return;
    }

    const { raw, weighted } = calculateWeightedAverage();

    try {
      await addDoc(collection(db, 'nasaTLXResults'), {
        scores,
        rawScore: raw,
        weightedScore: weighted,
        timestamp: new Date(),
        user: localStorage.getItem('currentUser') || 'anonymous',
      });
      setSubmitted(true);
      alert('✅ NASA-TLX results saved! Scroll down to see your results.');
    } catch (error) {
      console.error('❌ Error saving TLX:', error);
      alert('Failed to save your NASA-TLX results.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      {/* Intro */}
      <div className="bg-white/10 p-6 rounded mb-6 shadow-md">
        <h1 className="text-3xl font-bold mb-2">🧪 NASA-TLX: Workload Assessment</h1>
        <p className="text-gray-300">
          This test evaluates how demanding the cognitive game was for you. Your responses will be
          combined with data from EEG and emotion tracking to understand your overall cognitive load.
        </p>
        <p className="text-sm mt-2 italic text-gray-400">
          These 6 dimensions were developed by NASA to evaluate perceived workload.
        </p>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="mt-2 text-sm underline text-blue-300 hover:text-blue-400"
        >
          {showInfo ? 'Hide Dimension Info' : 'What does each category mean?'}
        </button>
      </div>

      {/* Info Card */}
      {showInfo && (
        <div className="bg-white/10 p-4 mb-6 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-2">🔍 Dimension Descriptions</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
            {categories.map(({ label }) => (
              <li key={label}>
                <strong>{label}:</strong> {categoryDescriptions[label]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 p-6 rounded shadow-md">
        {categories.map(({ label, color, icon }) => (
          <div key={label} className="space-y-1">
            <label className={`block font-semibold ${color}`}>{icon} {label}</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={scores[label] || 0}
              onChange={(e) => handleChange(label, e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-blue-300">Your rating: {scores[label] ?? 0}</div>
          </div>
        ))}
        <div className="sm:col-span-2 text-right mt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold"
          >
            Submit NASA-TLX Evaluation
          </button>
        </div>
      </form>

      {/* Confirmation */}
      {submitted && (
        <div className="mt-8 bg-green-700 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold text-white">✅ Results Saved Successfully!</h3>
          <p className="mt-2 text-lg">🧮 <strong>Raw Score:</strong> {calculateWeightedAverage().raw}</p>
          <p className="text-lg">📊 <strong>Weighted Average:</strong> {calculateWeightedAverage().weighted}</p>
          <p className="text-sm text-gray-200 mt-1 italic">
            The weighted average reflects how important each category is based on NASA’s research.
          </p>
          <button
            onClick={() => router.push('/report')}
            className="mt-4 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            See Overall Results →
          </button>
        </div>
      )}
    </div>
  );
}