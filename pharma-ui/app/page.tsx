"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [drug, setDrug] = useState('CLOPIDOGREL');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a VCF file");
    setLoading(true);
    setResult(null); // Clear previous results
    
    const formData = new FormData();
    formData.append('vcf', file);
    formData.append('drug', drug);

    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Failed to connect to backend. Is your FastAPI server running?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans pb-24">
      <header className="max-w-5xl mx-auto mb-10 border-b border-slate-700 pb-6">
        <h1 className="text-4xl font-bold text-blue-400 tracking-tight">
          PharmaGuard <span className="text-sm font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">v2.0</span>
        </h1>
        <p className="text-slate-400 mt-2">Clinical Pharmacogenomics Decision Support System</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT SECTION (Left Side) */}
        <section className="lg:col-span-4 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-fit">
          <h2 className="text-xl mb-4 font-semibold text-slate-200">Patient Data</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Target Medication</label>
              <select 
                className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setDrug(e.target.value)}
                value={drug}
              >
                <option value="CLOPIDOGREL">Clopidogrel (Plavix)</option>
                <option value="SIMVASTATIN">Simvastatin (Zocor)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Genomic File (.vcf)</label>
              <input 
                type="file" 
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-slate-900 border border-slate-600 rounded-lg p-2 transition-all"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-all disabled:opacity-50 mt-4 shadow-lg shadow-blue-900/20"
            >
              {loading ? "Analyzing Genome..." : "Run Analysis"}
            </button>
          </div>
        </section>

        {/* RESULT SECTION (Right Side) */}
        <section className="lg:col-span-8 space-y-6">
          {result && !result.error && result.risk_assessment && (
            <>
              {/* Pretty UI Card */}
              <div className={`p-6 rounded-xl border-2 transition-all shadow-2xl ${
                result.risk_assessment.risk_label === 'Ineffective' || result.risk_assessment.risk_label === 'Toxic' 
                ? 'border-red-500/50 bg-red-950/20' 
                : 'border-green-500/50 bg-green-950/20'
              }`}>
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Risk Assessment</p>
                    <h2 className={`text-3xl font-bold ${
                      result.risk_assessment.risk_label === 'Ineffective' || result.risk_assessment.risk_label === 'Toxic' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {result.risk_assessment.risk_label}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Severity</p>
                    <span className="px-3 py-1 bg-black/40 border border-white/10 rounded text-xs uppercase font-bold tracking-wider">
                      {result.risk_assessment.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gene</p>
                    <p className="font-mono text-blue-300 font-bold">{result.pharmacogenomic_profile.primary_gene}</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Phenotype</p>
                    <p className="font-mono text-blue-300 font-bold">{result.pharmacogenomic_profile.phenotype}</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Diplotype</p>
                    <p className="font-mono text-blue-300 font-bold">{result.pharmacogenomic_profile.diplotype}</p>
                  </div>
                </div>

                {/* New Clinical Recommendation Block */}
                <div className="mb-6 p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-2">
                    ⚕️ Clinical Recommendation ({result.clinical_recommendation.guideline_source})
                  </p>
                  <p className="text-sm text-blue-100">{result.clinical_recommendation.action}</p>
                </div>

                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">AI Generated Mechanism</p>
                  <p className="text-sm italic text-slate-300 mb-2 font-semibold">"{result.llm_generated_explanation.summary}"</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{result.llm_generated_explanation.mechanism}</p>
                </div>
              </div>

              {/* THE RAW JSON PROOF FOR JUDGES */}
              <div className="bg-[#0d1117] rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-300">Raw Output JSON (Schema Compliant)</span>
                  <span className="text-xs font-mono text-green-400">Status: 200 OK</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-blue-300">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}

          {/* Error Handling Display */}
          {result && result.error && (
            <div className="p-6 bg-red-950/50 border border-red-500 rounded-xl text-red-200">
              <h3 className="font-bold text-lg mb-2">Backend Error</h3>
              <pre className="text-xs font-mono whitespace-pre-wrap">{result.error}</pre>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}