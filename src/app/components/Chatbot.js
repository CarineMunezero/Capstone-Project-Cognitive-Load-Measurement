'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const suggestedQuestions = [
  "What does my NASA-TLX score mean?",
  "How do I improve my game performance?",
  "Was my cognitive load high or low today?",
  "Why is emotion tracking important?",
  "What’s the difference between EEG and emotion analysis?"
];

const responses = {
  "What does my NASA-TLX score mean?": "The NASA-TLX score reflects your perceived mental workload based on six dimensions: Mental, Physical, Temporal Demand, Performance, Effort, and Frustration. Higher scores indicate greater perceived workload.",
  "How do I improve my game performance?": "Try to stay focused and minimize distractions. Practicing tasks that challenge your memory and reaction time can improve your performance over time.",
  "Was my cognitive load high or low today?": "Based on the EEG median and NASA-TLX score, a cognitive load above average indicates higher mental demand. Check the summary above for exact values.",
  "Why is emotion tracking important?": "Emotions influence how we process information and perform tasks. Tracking them helps contextualize cognitive load and identify stress patterns.",
  "What’s the difference between EEG and emotion analysis?": "EEG measures electrical brain activity to assess cognitive load, while emotion analysis relies on facial expressions to estimate emotional states. Together, they give a fuller picture."
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleQuestion = (question) => {
    const answer = responses[question] || "I'm still learning how to answer that!";
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: question },
      { sender: 'bot', text: answer }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleQuestion(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-colors duration-200"
        >
          <MessageCircle size={20} />
          FocusAI
        </button>
      ) : (
        <div className="bg-white text-black w-[380px] h-[500px] rounded-lg shadow-xl flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-gray-100">
            <h4 className="font-bold text-lg">🤖 FocusAI</h4>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black text-lg">✖</button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-blue-100 ml-auto text-right'
                    : 'bg-gray-100 text-left'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Suggested Questions */}
          <div className="border-t p-3 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 mb-1">Suggestions:</p>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestion(q)}
                  className="w-full text-left text-blue-600 hover:underline text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input for custom questions */}
          <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 bg-white">
            <input
              type="text"
              placeholder="Ask FocusAI something..."
              className="flex-1 p-2 rounded border text-sm focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 rounded"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
