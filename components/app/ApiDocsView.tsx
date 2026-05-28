"use client";

import React from "react";
import { Terminal, Copy, CheckCircle } from "lucide-react";

interface EndpointMetadata {
  id: string;
  method: string;
  path: string;
  category: "all" | "allergens" | "community" | "diagnostics";
  summary: string;
  description: string;
  headers: { name: string; value: string; required: boolean }[];
  parameters: { name: string; type: string; required: boolean; desc: string; default?: string }[];
  curlExample: string;
  responseExample: string;
  responseDesc: string;
}

interface ApiDocsViewProps {
  docSearchQuery: string;
  setDocSearchQuery: (val: string) => void;
  docActiveCategory: "all" | "allergens" | "community" | "diagnostics";
  setDocActiveCategory: (val: "all" | "allergens" | "community" | "diagnostics") => void;
  filteredEndpoints: EndpointMetadata[];
  copyToClipboard: (text: string, label: string) => void;
  copiedText: string | null;
}

export default function ApiDocsView({
  docSearchQuery,
  setDocSearchQuery,
  docActiveCategory,
  setDocActiveCategory,
  filteredEndpoints,
  copyToClipboard,
  copiedText
}: ApiDocsViewProps) {
  return (
    <div className="space-y-6">
      
      {/* Filter Row and search input */}
      <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search field */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Terminal size={15} />
          </div>
          <input
            type="text"
            placeholder="엔드포인트 경로 혹은 기능 키워드 실시간 필터링..."
            value={docSearchQuery}
            onChange={(e) => setDocSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-gray-200 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:border-[#3B82F6] text-gray-800 transition"
          />
          {docSearchQuery && (
            <button
              onClick={() => setDocSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold outline-none cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDocActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer outline-none ${
              docActiveCategory === "all"
                ? "bg-[#111827] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            전체보기
          </button>
          <button
            onClick={() => setDocActiveCategory("allergens")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer outline-none ${
              docActiveCategory === "allergens"
                ? "bg-[#10B981] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            알레르기 AI
          </button>
          <button
            onClick={() => setDocActiveCategory("community")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer outline-none ${
              docActiveCategory === "community"
                ? "bg-[#3B82F6] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            커뮤니티 토론
          </button>
          <button
            onClick={() => setDocActiveCategory("diagnostics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer outline-none ${
              docActiveCategory === "diagnostics"
                ? "bg-[#8B5CF6] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            헬스체크
          </button>
        </div>
      </div>

      {/* Endpoints List container */}
      <div className="space-y-6">
        {filteredEndpoints.map((ep) => (
          <div
            key={ep.id}
            className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Left: Metadata specifications */}
            <div className="lg:col-span-7 p-6 border-r border-[#F3F4F6] space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold border uppercase ${
                    ep.method === "POST"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  {ep.path}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase">
                  {ep.category}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#111827]">{ep.summary}</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed mt-1.5">{ep.description}</p>
              </div>

              {/* Request Headers parameters */}
              <div className="space-y-2">
                <span className="block text-[10px] uppercase font-extrabold text-[#9CA3AF] tracking-wider">
                  HTTP Request Headers
                </span>
                <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6] text-xs space-y-1.5">
                  {ep.headers.map((h, i) => (
                    <div key={i} className="flex items-center justify-between font-mono">
                      <span className="text-gray-600">{h.name}:</span>
                      <span className="font-semibold text-gray-800">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request parameters detail */}
              <div className="space-y-2.5">
                <span className="block text-[10px] uppercase font-extrabold text-[#9CA3AF] tracking-wider">
                  Request Body Parameters
                </span>
                {ep.parameters.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No request body parameters required.</p>
                ) : (
                  <div className="border border-gray-150 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {ep.parameters.map((p, i) => (
                      <div key={i} className="p-3.5 bg-white text-xs flex flex-col md:flex-row md:items-start justify-between gap-2 hover:bg-[#FAFAFA]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-gray-800">{p.name}</span>
                            <span className="font-mono text-[10px] text-gray-400">({p.type})</span>
                            {p.required ? (
                              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.2 rounded">Required</span>
                            ) : (
                              <span className="text-[9px] text-gray-400 bg-gray-50 px-1 py-0.2 rounded">Optional</span>
                            )}
                          </div>
                          <p className="text-[#6B7280] leading-relaxed mt-0.5">{p.desc}</p>
                        </div>
                        {p.default && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">
                            Default: {p.default}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Code Console Visualizers */}
            <div className="lg:col-span-5 bg-slate-900 p-6 flex flex-col justify-between text-white border-l border-slate-800 flex-1">
              {/* Interactive Curl container */}
              <div className="space-y-3 flex-1 pb-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                    <Terminal size={11} className="text-sky-400" /> Live CURL CLI COMMAND
                  </span>
                  <button
                    onClick={() => copyToClipboard(ep.curlExample, ep.id + "_curl")}
                    className="text-stone-400 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer outline-none"
                  >
                    {copiedText === ep.id + "_curl" ? "Copied!" : "Copy command"}
                    <Copy size={11} />
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-zinc-300 p-3 bg-slate-950 rounded-xl overflow-x-auto border border-slate-850/60 leading-relaxed whitespace-pre-wrap">
                  {ep.curlExample}
                </pre>
              </div>

              {/* Interactive Output Response JSON container */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                    <CheckCircle size={11} /> MOCK RESPONSE HTTP 200
                  </span>
                  <button
                    onClick={() => copyToClipboard(ep.responseExample, ep.id + "_res")}
                    className="text-stone-400 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer outline-none"
                  >
                    {copiedText === ep.id + "_res" ? "Copied!" : "Copy JSON"}
                    <Copy size={11} />
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-emerald-400/95 p-3 bg-slate-950 rounded-xl overflow-x-auto border border-slate-850/60 leading-relaxed whitespace-pre font-medium">
                  {ep.responseExample}
                </pre>
                <div className="p-3 bg-zinc-950/60 rounded-lg text-[10.5px] text-zinc-400 leading-normal border border-zinc-900 font-sans">
                  <strong className="text-zinc-200">데이터 규격:</strong> {ep.responseDesc}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredEndpoints.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400 text-xs shadow-3xs">
            인증검지 및 키워드와 매치되는 등록된 API 엔드포인트 사양이 없습니다.
          </div>
        )}
      </div>

    </div>
  );
}
