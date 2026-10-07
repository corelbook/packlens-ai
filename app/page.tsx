'use client';

import { useState } from 'react';
import { dictionaries } from '@/lib/dictionary';
import { Sparkles, Upload, FileDown, ShieldCheck, PlayCircle, Globe } from 'lucide-react';

export default function PackLensApp() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [credits, setCredits] = useState(50);
  const [mode, setMode] = useState<'free' | 'pro' | 'expert'>('free');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const t = dictionaries[lang];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    const cost = mode === 'free' ? 20 : mode === 'pro' ? 40 : 60;
    if (credits < cost) return alert('Yetersiz kredi!');

    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalImage, referenceImage: refImage, mode, lang })
      });
      const data = await res.json();
      setResult(data);
      setCredits(prev => prev - cost);
    } catch (err) {
      alert('Analiz yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!result) return;
    const res = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, originalImage, referenceImage: refImage, score: result.score, pros: result.pros, cons: result.cons, recommendations: result.recommendations, mode })
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PackLens_Report.pdf';
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PackLens AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-sm text-amber-400">⚡ {credits} Kredi</span>
          <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-sm flex items-center space-x-1">
            <Globe className="w-4 h-4" /> <span className="uppercase">{lang}</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold">{t.title}</h1>
          <p className="text-slate-400 text-sm">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-center bg-slate-900/40 flex flex-col items-center justify-center min-h-[200px]">
            {originalImage ? <img src={originalImage} className="max-h-48 rounded" /> : (
              <label className="cursor-pointer space-y-2">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-sm">{t.uploadOriginal}</p>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setOriginalImage)} className="hidden" />
              </label>
            )}
          </div>

          <div className="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-center bg-slate-900/40 flex flex-col items-center justify-center min-h-[200px]">
            {refImage ? <img src={refImage} className="max-h-48 rounded" /> : (
              <label className="cursor-pointer space-y-2">
                <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-sm">{t.uploadReference}</p>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setRefImage)} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <button onClick={runAnalysis} disabled={!originalImage || !refImage || loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition disabled:opacity-50">
          {loading ? 'Analiz Ediliyor...' : t.analyzeBtn}
        </button>

        {result && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold">Analiz Sonucu</h2>
              <span className="text-2xl font-bold text-indigo-400">{result.score}/100</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/40">
                <h3 className="font-bold text-emerald-400 mb-2">{t.pros}</h3>
                <ul className="list-disc list-inside space-y-1">{result.pros?.map((p:string,i:number)=><li key={i}>{p}</li>)}</ul>
              </div>
              <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/40">
                <h3 className="font-bold text-rose-400 mb-2">{t.cons}</h3>
                <ul className="list-disc list-inside space-y-1">{result.cons?.map((c:string,i:number)=><li key={i}>{c}</li>)}</ul>
              </div>
            </div>
            <button onClick={downloadPdf} className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2">
              <FileDown className="w-4 h-4 text-indigo-400" /> <span>{t.downloadPdf}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
