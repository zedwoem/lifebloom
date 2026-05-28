"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  section: { marginBottom: 15 },
  label: { fontSize: 16, color: '#333', marginBottom: 5 },
  item: { fontSize: 14, marginBottom: 5, marginLeft: 15 },
  sponsorBox: { marginTop: 40, padding: 20, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' },
  sponsorTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 10 },
  sponsorText: { fontSize: 12, color: '#475569' }
});

const ChecklistPDF = ({ rooms }: { rooms: string[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Home Safety & Fall Prevention Guide</Text>
      
      {rooms.map((room, idx) => (
        <View key={idx} style={styles.section}>
          <Text style={styles.label}>{idx + 1}. {room}</Text>
          <Text style={styles.item}>- Ensure walkways are clear of rugs, cords, or clutter.</Text>
          <Text style={styles.item}>- Improve lighting with nightlights or brighter bulbs.</Text>
          {room === "Bathroom" && (
            <Text style={styles.item}>- Install sturdy grab bars near the toilet and inside the shower/tub.</Text>
          )}
          {room === "Stairs" && (
            <Text style={styles.item}>- Ensure sturdy handrails are installed securely on both sides.</Text>
          )}
        </View>
      ))}

      <View style={styles.sponsorBox}>
        <Text style={styles.sponsorTitle}>Expert Recommendation</Text>
        <Text style={styles.sponsorText}>Keep this guide handy or share it with your family to ensure a safe, comfortable living environment. Proper installations can prevent 80% of household falls.</Text>
      </View>
    </Page>
  </Document>
);

export function MobilitySafetyChecklist() {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const rooms = ["Living Room", "Bedroom", "Bathroom", "Kitchen", "Stairs"];

  const toggleRoom = (room: string) => {
    setSelectedRooms(prev => 
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
    );
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<ChecklistPDF rooms={selectedRooms} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Mobility_Safety_Checklist.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ClientOnly fallbackHeight="h-[500px]">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto mt-8">
        <div className="mb-8 border-b border-slate-100 pb-6 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-emerald-800 tracking-tight" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            Home Safety & Fall Prevention
          </h2>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            Select the areas of your home to generate a personalized, printable guide that helps keep you and your loved ones safe.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Select Areas to Evaluate:</label>
          <div className="flex flex-wrap gap-3">
            {rooms.map(room => (
              <button
                key={room}
                onClick={() => toggleRoom(room)}
                className={`px-5 py-3 rounded-xl text-base font-bold transition-all shadow-sm ${
                  selectedRooms.includes(room) 
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleDownloadPDF} 
          disabled={isGenerating || selectedRooms.length === 0}
          className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {isGenerating ? "Generating Guide..." : "Print Your Safety Guide (PDF)"}
        </Button>
      </div>
    </ClientOnly>
  );
}
