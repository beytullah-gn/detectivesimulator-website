"use client";

import dynamic from "next/dynamic";

const DetectiveSimulatorApp = dynamic(() => import("@/App"), {
  ssr: false,
  loading: () => <div style={{ padding: "2rem" }}>Yukleniyor...</div>,
});

export default function PlayClient() {
  return <DetectiveSimulatorApp />;
}
