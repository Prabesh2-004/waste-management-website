"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CAMPAIGNS, COMPLAINTS, VEHICLE_REQUESTS, type Campaign, type Complaint, type VehicleRequest } from "@/data/kmc";

interface KmcState {
  /** Ward highlighted on the city map (shared by Dashboard and Collection). */
  selectedWard: number;
  selectWard: (ward: number) => void;
  vehicleRequests: VehicleRequest[];
  setRequestStatus: (id: string, status: string) => void;
  complaints: Complaint[];
  resolveComplaint: (ref: string) => void;
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
}

const KmcContext = createContext<KmcState | null>(null);

export function useKmc(): KmcState {
  const ctx = useContext(KmcContext);
  if (!ctx) throw new Error("useKmc must be used inside KmcProvider");
  return ctx;
}

/** Holds the KMC demo data that pages can change. Resets on reload, like the prototype. */
export function KmcProvider({ children }: { children: React.ReactNode }) {
  const [selectedWard, selectWard] = useState(17);
  const [vehicleRequests, setVehicleRequests] = useState(VEHICLE_REQUESTS);
  const [complaints, setComplaints] = useState(COMPLAINTS);
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);

  const setRequestStatus = useCallback(
    (id: string, status: string) => setVehicleRequests((list) => list.map((r) => (r.id === id ? { ...r, status } : r))),
    []
  );
  const resolveComplaint = useCallback(
    (ref: string) => setComplaints((list) => list.map((c) => (c.ref === ref ? { ...c, status: "Resolved" } : c))),
    []
  );
  const addCampaign = useCallback((campaign: Campaign) => setCampaigns((list) => [...list, campaign]), []);

  const value = useMemo(
    () => ({ selectedWard, selectWard, vehicleRequests, setRequestStatus, complaints, resolveComplaint, campaigns, addCampaign }),
    [selectedWard, vehicleRequests, setRequestStatus, complaints, resolveComplaint, campaigns, addCampaign]
  );

  return <KmcContext.Provider value={value}>{children}</KmcContext.Provider>;
}
