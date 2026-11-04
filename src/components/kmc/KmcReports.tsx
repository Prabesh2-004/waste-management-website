"use client";

import { useState } from "react";
import { CircleCheck, ClipboardList, Search, Triangle, TriangleAlert } from "lucide-react";
import { KmcStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Field, inputClass } from "@/components/ui/Field";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { KeyValue } from "@/components/ui/ListItem";
import { useKmc } from "@/context/KmcContext";
import { useToast } from "@/context/ToastContext";
import type { Complaint } from "@/data/kmc";

export function KmcReports() {
  const { complaints, resolveComplaint } = useKmc();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [selectedRef, setSelectedRef] = useState(complaints[0].ref);
  const [note, setNote] = useState("");

  const complaint = complaints.find((c) => c.ref === selectedRef) ?? complaints[0];
  const q = query.trim().toLowerCase();
  const rows = q
    ? complaints.filter((c) => [c.ref, c.location, c.category].some((field) => field.toLowerCase().includes(q)))
    : complaints;

  const resolve = () => {
    resolveComplaint(complaint.ref);
    setNote("");
    toast(`${complaint.ref} marked as resolved`);
  };

  return (
    <>
      <KpiGrid>
        <Kpi icon={<ClipboardList />} label="Total Complaints" value="48" note="↑ 12% vs. last month" />
        <Kpi icon={<TriangleAlert />} label="Overdue" value="7" note="↓ 3% vs. last month" trend="down" />
        <Kpi icon={<Triangle />} label="Escalated (KMC level)" value="12" note="↑ 33% vs. last month" />
        <Kpi icon={<CircleCheck />} label="Resolved" value="28" note="↑ 16% vs. last month" />
      </KpiGrid>

      <div className="grid flex-1 gap-3 xl:grid-cols-[2.5fr_1fr]">
        <Card>
          <div className="relative mb-2.5">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by reference no., ward, category or location…"
              aria-label="Search complaints"
              className={`${inputClass} w-full pl-8`}
            />
          </div>
          <DataTable<Complaint>
            rows={rows}
            rowKey={(c) => c.ref}
            selectedKey={complaint.ref}
            onRowClick={(c) => setSelectedRef(c.ref)}
            empty="No complaints match your search"
            columns={[
              { header: "Ref. No.", cell: (c) => c.ref, className: "whitespace-nowrap" },
              { header: "Ward / Location", cell: (c) => c.location },
              { header: "Category", cell: (c) => c.category },
              { header: "Priority", cell: (c) => <KmcStatus status={c.priority} /> },
              { header: "Assigned To", cell: (c) => c.assignedTo },
              { header: "Status", cell: (c) => <KmcStatus status={c.status} /> },
              { header: "Deadline", cell: (c) => c.deadline, className: "whitespace-nowrap" },
            ]}
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold">{complaint.ref}</h3>
            <KmcStatus status={complaint.priority} />
          </div>
          <b className="mt-1">{complaint.category}</b>
          <p className="mb-2 text-xs text-muted">
            {complaint.location} · Deadline {complaint.deadline}, 2026
          </p>
          <KeyValue label="Reported by" value="Citizen (Mobile App)" />
          <KeyValue label="Assigned to" value={complaint.assignedTo} />
          <KeyValue label="Status" value={<KmcStatus status={complaint.status} />} />
          <p className="my-2 text-xs text-muted">
            Large amount of waste dumped. This has been happening for several weeks and is affecting the nearby community.
          </p>
          <Field label="Add a note…">
            <textarea rows={3} className={`${inputClass} resize-none`} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="mt-auto flex flex-col gap-2">
            <Button variant="outline" onClick={() => toast("Information requested")}>
              Request More Information
            </Button>
            <Button variant="outline" onClick={() => toast("Reassign dialog – coming soon")}>
              Assign to Another Officer
            </Button>
            <Button onClick={resolve} disabled={complaint.status === "Resolved"}>
              Mark as Resolved
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
