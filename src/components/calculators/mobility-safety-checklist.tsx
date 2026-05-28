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
      <Text style={styles.header}>Mobility Safety Checklist (CDC STEADI Guide)</Text>
      
      {rooms.map((room, idx) => (
        <View key={idx} style={styles.section}>
          <Text style={styles.label}>{idx + 1}. Area {room}</Text>
          <Text style={styles.item}>- Ensure walkways are free of cords or furniture.</Text>
          <Text style={styles.item}>- Use bright lighting.</Text>
          {room === "Bathroom" && (
            <Text style={styles.item}>- Install Grab Bars near toilet and shower.</Text>
          )}
          {room === "Stairs" && (
            <Text style={styles.item}>- Ensure sturdy handrails on both sides.</Text>
          )}
        </View>
      ))}

      <View style={styles.sponsorBox}>
        <Text style={styles.sponsorTitle}>Sponsor: Safe Mobility Solutions</Text>
        <Text style={styles.sponsorText}>Get a 15% discount on anti-slip Grab Bar installation from our B2B partners. Show this document to your local agent.</Text>
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Mobility Safety Checklist</h2>
        <p className="text-lg text-slate-600 mb-6">
          Create a room safety checklist to minimize the risk of falls for seniors at home, referencing the CDC's STEADI initiative.
        </p>

        <div className="space-y-4 mb-8">
          <label className="block text-lg font-bold text-slate-700">Select Areas to Evaluate:</label>
          <div className="flex flex-wrap gap-3">
            {rooms.map(room => (
              <Button
                key={room}
                variant={selectedRooms.includes(room) ? "primary" : "outline"}
                className={`min-h-[48px] px-6 text-lg ${selectedRooms.includes(room) ? "bg-brand-blue text-white" : ""}`}
                onClick={() => toggleRoom(room)}
              >
                {room}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleDownloadPDF} 
          disabled={isGenerating || selectedRooms.length === 0}
          className="w-full min-h-[48px] text-lg bg-brand-green text-white font-bold"
        >
          {isGenerating ? "Generating PDF..." : "Print Full Checklist (PDF)"}
        </Button>
      </div>
    </ClientOnly>
  );
}
