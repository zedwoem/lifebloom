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
      <Text style={styles.header}>Mobility Safety Checklist (Panduan CDC STEADI)</Text>
      
      {rooms.map((room, idx) => (
        <View key={idx} style={styles.section}>
          <Text style={styles.label}>{idx + 1}. Area {room}</Text>
          <Text style={styles.item}>- Pastikan jalur berjalan bebas dari kabel atau perabotan.</Text>
          <Text style={styles.item}>- Gunakan pencahayaan yang terang.</Text>
          {room === "Kamar Mandi" && (
            <Text style={styles.item}>- Pasang pegangan (Grab Bars) di dekat toilet dan shower.</Text>
          )}
          {room === "Tangga" && (
            <Text style={styles.item}>- Pastikan pegangan tangan kokoh di kedua sisi.</Text>
          )}
        </View>
      ))}

      <View style={styles.sponsorBox}>
        <Text style={styles.sponsorTitle}>Sponsor: Solusi Mobilitas Aman</Text>
        <Text style={styles.sponsorText}>Dapatkan diskon 15% untuk instalasi Grab Bar anti-slip dari mitra B2B kami. Tunjukkan dokumen ini kepada agen terdekat.</Text>
      </View>
    </Page>
  </Document>
);

export function MobilitySafetyChecklist() {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const rooms = ["Ruang Tamu", "Kamar Tidur", "Kamar Mandi", "Dapur", "Tangga"];

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
          Buat daftar periksa keselamatan ruang untuk meminimalisasi risiko jatuh pada lansia di rumah, mengacu pada inisiatif STEADI dari CDC.
        </p>

        <div className="space-y-4 mb-8">
          <label className="block text-lg font-bold text-slate-700">Pilih Area yang Ingin Dievaluasi:</label>
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
          {isGenerating ? "Membuat PDF..." : "Cetak Checklist Lengkap (PDF)"}
        </Button>
      </div>
    </ClientOnly>
  );
}
