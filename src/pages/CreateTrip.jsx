import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

function CreateTrip({ onAddTrip }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    budget: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) return;
    
    // 呼叫 App.jsx 傳下來的新增函式
    onAddTrip(formData);
    navigate('/'); // 回到首頁
  };

  return (
    <div className="min-h-screen bg-white text-jp-black">
      {/* 頂部導航 */}
      <header className="px-6 py-4 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">建立新旅程</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
        
        {/* 目的地 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 tracking-wider">目的地 / 標題</label>
          <input 
            type="text" 
            name="title"
            placeholder="例如：東京五天四夜"
            className="w-full text-xl font-bold border-b border-gray-200 py-2 focus:outline-none focus:border-black placeholder:text-gray-300"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* 日期選擇 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 tracking-wider">開始日期</label>
            <input 
              type="date" 
              name="startDate"
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-black bg-transparent"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 tracking-wider">結束日期</label>
            <input 
              type="date" 
              name="endDate"
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-black bg-transparent"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* 預算設定 */}
        <div className="space-y-2 pt-4">
          <label className="text-xs font-bold text-gray-400 tracking-wider">總預算 (JPY)</label>
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">¥</span>
            <input 
              type="number" 
              name="budget"
              placeholder="100000"
              className="w-full text-3xl font-mono border-b border-gray-200 py-2 focus:outline-none focus:border-black placeholder:text-gray-200"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 儲存按鈕 */}
        <button 
          type="submit"
          className="w-full bg-black text-white py-4 rounded-full font-bold mt-12 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-gray-200"
        >
          <Save size={18} />
          <span>建立行程</span>
        </button>

      </form>
    </div>
  );
}

export default CreateTrip;
