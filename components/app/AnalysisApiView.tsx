"use client";

import React from "react";
import { Upload, Play, Terminal, Copy, RefreshCw, AlertCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { FOOD_PRESETS } from "@/lib/constants";
import { ALLERGENS_MAP } from "@/lib/types";

interface AnalysisApiViewProps {
  selectedPreset: string | null;
  setSelectedPreset: (val: string | null) => void;
  scannedImage: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  runAnalysisAPI: () => void;
  imageEndpointStatus: number | null;
  imageEndpointLoading: boolean;
  payloadImageResponse: string;
  copyToClipboard: (text: string, label: string) => void;
  copiedText: string | null;
}

export default function AnalysisApiView({
  selectedPreset,
  setSelectedPreset,
  scannedImage,
  handleFileUpload,
  customPrompt,
  setCustomPrompt,
  runAnalysisAPI,
  imageEndpointStatus,
  imageEndpointLoading,
  payloadImageResponse,
  copyToClipboard,
  copiedText
}: AnalysisApiViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Sandbox Settings panel */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="font-bold text-[#111827] text-base mb-1.5 flex items-center gap-1.5">
            Request Parameters
          </h3>
          <p className="text-xs text-[#6B7280] mb-5">
            Select a high-resolution food preset or upload your custom image to package inside the base64 JSON payload.
          </p>

          {/* Preset Choose */}
          <div className="mb-4">
            <span className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-2">
              Template Image presets
            </span>
            <div className="space-y-1.5">
              {FOOD_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all outline-none ${
                    selectedPreset === p.id
                      ? "border-[#3B82F6] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-gray-200 bg-white hover:bg-gray-50 text-[#374151]"
                  }`}
                >
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-[#6B7280] truncate mt-0.5">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual file select */}
          <div className="mb-4">
            <label className="w-full py-2.5 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-[#374151] text-xs font-bold cursor-pointer">
              <Upload size={14} className="text-[#3B82F6]" />
              Custom Image Upload
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Prompt Payload */}
          <div className="space-y-1.5">
            <span className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF]">
              AI Prompt Payload
            </span>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full h-24 p-2 bg-stone-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#3B82F6] text-gray-700"
            />
          </div>

          {/* Send request */}
          <button
            onClick={runAnalysisAPI}
            disabled={imageEndpointLoading}
            className="w-full mt-4 py-3 bg-[#3B82F6] disabled:bg-gray-100 hover:bg-blue-600 font-bold text-white text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play size={13} fill="currentColor" />
            {imageEndpointLoading ? "Executing analysis..." : "Run POST Request"}
          </button>
        </div>

      </div>

      {/* Right Output logs & specs */}
      <div className="lg:col-span-7 space-y-6">
        
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 mb-4">
            <h3 className="font-bold text-[#111827] text-sm">Interactive Sandbox Display</h3>
            {imageEndpointStatus && (
              <span
                className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${
                  imageEndpointStatus === 200 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                HTTP {imageEndpointStatus}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Image */}
            <div className="p-3 bg-[#FAFAFA] border border-gray-200 rounded-xl relative flex flex-col items-center justify-center aspect-square">
              <span className="absolute top-2 left-2 bg-[#111827] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                Payload Img Source
              </span>
              {scannedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={scannedImage} alt="Analysis Source" className="max-h-56 object-contain rounded-lg" />
              ) : (
                <div className="text-gray-400 text-xs">No preset or uploaded photo target</div>
              )}
            </div>

            {/* Developer terminal */}
            <div className="flex flex-col h-full min-h-[295px] bg-stone-900 rounded-xl border border-stone-800 text-white overflow-hidden p-4">
              <div className="flex justify-between items-center pb-2 border-b border-stone-800 mb-3 shrink-0">
                <span className="font-mono text-[10px] text-[#9CA3AF] flex items-center gap-1.5">
                  <Terminal size={12} className="text-green-400" />
                  RESPONSE JSON
                </span>
                {payloadImageResponse && (
                  <button
                    onClick={() => copyToClipboard(payloadImageResponse, "analysis")}
                    className="text-stone-400 hover:text-white transition outline-none cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                )}
              </div>

              {copiedText === "analysis" && (
                <div className="text-[10px] text-green-400 bg-stone-800/60 p-1.5 rounded text-center mb-2 animate-bounce">
                  Copied terminal payload!
                </div>
              )}

              <div className="flex-1 font-mono text-xs overflow-y-auto whitespace-pre-wrap text-green-400">
                {imageEndpointLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-stone-400 select-none">
                    <RefreshCw size={18} className="animate-spin text-stone-400 mb-2" />
                    <span>Requesting gemini-2.5-flash...</span>
                  </div>
                ) : payloadImageResponse ? (
                  payloadImageResponse
                ) : (
                  <span className="text-stone-500 select-none">Trigger the sandbox request on the left to analyze food proteins...</span>
                )}
              </div>
            </div>
          </div>

          {/* Result view parsing */}
          {payloadImageResponse && !imageEndpointLoading && (
            <div className="mt-5 pt-4 border-t border-[#F3F4F6] space-y-3">
              <h4 className="text-xs uppercase font-extrabold text-[#9CA3AF] tracking-wider">
                Component-Side Parser Simulation
              </h4>
              
              {(() => {
                try {
                  const parsed = JSON.parse(payloadImageResponse);
                  const isSuccess = parsed.code === 200 && parsed.data;
                  if (!isSuccess) {
                    return (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle size={15} />
                        Database / Model Connection Error: {parsed.error || "Malformed API payload"}
                      </div>
                    );
                  }

                  const codes: number[] = parsed.data.allergens || [];
                  if (codes.length === 0) {
                    return (
                      <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl flex items-start gap-2">
                        <ShieldCheck size={18} className="text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">All Clear (식약처 검사인증 완료)</div>
                          <p className="text-[11px] mt-1 leading-relaxed"> No mandatory allergens identified in match logs.</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5">
                      <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-start gap-2.5">
                        <ShieldAlert size={18} className="text-red-600 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">Allergen Warning (감지된 항원성 식별)</div>
                          <p className="text-[11px] mt-0.5 leading-relaxed">
                            The active model mapped {codes.length} high-allergy ingredients safely.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {codes.map((code) => {
                          const details = ALLERGENS_MAP[code] || {
                            nameKr: `알레르기 (Code ${code})`,
                            nameEn: "Unknown Protein",
                            emoji: "🧪"
                          };
                          return (
                            <div key={code} className="p-3 border border-gray-200 rounded-xl bg-white flex items-center space-x-2.5 shadow-3xs">
                              <span className="text-xl bg-stone-50 w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center">{details.emoji}</span>
                              <div>
                                <div className="text-xs font-bold text-[#111827]">{details.nameKr}</div>
                                <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">{details.nameEn}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
