"use client";

import React from "react";
import { Copy } from "lucide-react";

interface SettingsViewProps {
  sqlSchemaText: string;
  copyToClipboard: (text: string, label: string) => void;
  copiedText: string | null;
}

export default function SettingsView({
  sqlSchemaText,
  copyToClipboard,
  copiedText
}: SettingsViewProps) {
  return (
    <div className="space-y-6">
      
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <h3 className="font-bold text-[#111827] text-base mb-2">Relational Table Specifications (Supabase DDL)</h3>
        <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
          Run the following PostgreSQL commands in your Supabase SQL Editor workspace to instantiate secure schemas for caching and post records.
        </p>

        <div className="relative bg-stone-900 border border-stone-850 rounded-xl overflow-hidden p-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-800 mb-3 text-white">
            <span className="font-mono text-xs text-green-400">schema-blueprints.sql</span>
            <button
              onClick={() => copyToClipboard(sqlSchemaText, "sql")}
              className="text-stone-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer outline-none"
            >
              {copiedText === "sql" ? "copied!" : "Copy SQL Code"}
              <Copy size={12} />
            </button>
          </div>
          <pre className="font-mono text-xs text-gray-100 overflow-x-auto whitespace-pre leading-relaxed">
            {sqlSchemaText}
          </pre>
        </div>
      </div>

      {/* Developer guide summary integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <h4 className="font-bold text-[#111827] text-sm mb-2.5">API Integration Specs</h4>
          <ul className="text-xs text-gray-600 gap-2 flex flex-col list-disc pl-4 leading-relaxed">
            <li>
              <strong>Automatic Base64 payload detection:</strong> Base64 images are sent directly to the client endpoint as inline string literals structure.
            </li>
            <li>
              <strong>Performance Caching:</strong> Image hashes prevent duplicate execution charges on Gemini 2.5 Flash to conserve credits dynamically within your active deployment plan.
            </li>
            <li>
              <strong>JSON Safe Formatting:</strong> Built-in server modules safely parse code ticks and output standard serialization outputs dynamically.
            </li>
          </ul>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <h4 className="font-bold text-[#111827] text-sm mb-2.5">Endpoint Health Checklist</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-xs font-mono font-semibold">GET /api/db-status</span>
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200">200 OK</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-xs font-mono font-semibold">POST /api/gemini-api</span>
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200">200 OK</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
