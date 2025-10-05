"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WalletProvider } from "@/contexts/wallet-context";
import { Card } from "@/components/ui/card";
import { REGISTRAR_ADDRESS } from "@/lib/utils/constants";
import { registrarAbi } from "@/lib/contracts/registrar-abi";
import { getConnex } from "@/lib/connex/setup";

const STANDARD_NAMES = ["Verra", "Gold Standard", "CDM", "ACR", "CAR", "Other"];

function InnerCreditDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const connex = await getConnex();
      setLoading(true);
      setError(null);
      try {
        const method = registrarAbi.find((f) => f.name === "getMetadata")!;
        const out = await connex.thor
          .account(REGISTRAR_ADDRESS)
          .method(method as any)
          .call(id);

        console.log("Decoded output:", out.decoded);

        let decoded = out?.decoded;
        // Normalize various possible output shapes
        if (Array.isArray(decoded)) decoded = decoded[0];
        if (decoded?.[0] && typeof decoded[0] === "object")
          decoded = decoded[0];
        if (decoded && typeof decoded === "object" && decoded.certification) {
          setMeta(decoded);
        } else {
          console.warn("Unexpected metadata structure:", decoded);
          setMeta(null);
        }
      } catch (e: any) {
        console.error("Metadata fetch error:", e);
        setError(e?.message ?? "Failed to load credit metadata.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const formatDate = (timestamp?: string) => {
    if (!timestamp || timestamp === "0") return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (addr?: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000")
      return "N/A";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isRetired = meta?.retiredAt && meta.retiredAt !== "0";

  return (
    <main className="min-h-dvh bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Credit Details
            </h1>
            <p className="text-muted-foreground mt-1">ID: {id}</p>
          </div>
          {meta && (
            <div
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                isRetired
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isRetired ? "Retired" : "Active"}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="animate-pulse text-muted-foreground">
              Loading credit information...
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <p className="text-destructive font-medium">{error}</p>
          </Card>
        )}

        {/* Content */}
        {!loading && !error && meta && (
          <div className="space-y-6">
            {/* Certification Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                Certification Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Info
                  label="Project Name"
                  value={meta.certification?.project_name}
                />
                <Info label="Issuer" value={meta.certification?.issuer_name} />
                <Info label="Location" value={meta.certification?.location} />
                <Info
                  label="Standard"
                  value={
                    meta.certification?.standard !== undefined
                      ? STANDARD_NAMES[parseInt(meta.certification.standard)] ||
                        "Unknown"
                      : "N/A"
                  }
                />
                <Info
                  label="Methodology"
                  value={meta.certification?.methodology}
                />
                <Info
                  label="Amount (tCO₂e)"
                  value={
                    meta.certification?.amount
                      ? parseInt(meta.certification.amount).toLocaleString()
                      : "0"
                  }
                />
                <Info
                  label="Vintage Year"
                  value={meta.certification?.vintage_year}
                />
                <Info
                  label="Expiry Date"
                  value={formatDate(meta.certification?.expiry)}
                />
              </div>
            </Card>

            {/* Timeline Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                Timeline
              </h2>
              <div className="space-y-4">
                <TimelineItem
                  title="Created"
                  date={formatDate(meta.createdAt)}
                  by={formatAddress(meta.mintedBy)}
                  color="bg-primary"
                />
                {isRetired && (
                  <TimelineItem
                    title="Retired"
                    date={formatDate(meta.retiredAt)}
                    by={formatAddress(meta.retiredBy)}
                    color="bg-muted-foreground"
                  />
                )}
              </div>
            </Card>

            {/* Validation Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Validation
              </h2>
              <div className="space-y-4">
                <InfoMono label="Validated By" value={meta.validatedBy} />
                <InfoMono label="Proof Hash" value={meta.validationProof} />
                <InfoMono label="Salt" value={meta.salt} />
              </div>
            </Card>
          </div>
        )}

        {/* No Data */}
        {!loading && !error && !meta && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No credit data found for this ID.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}

/* Reusable Subcomponents */
function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <p className="text-lg font-medium mt-1">{value || "N/A"}</p>
    </div>
  );
}

function InfoMono({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <p className="text-sm font-mono mt-1 break-all bg-muted p-3 rounded">
        {value && value !== "0x" ? value : "N/A"}
      </p>
    </div>
  );
}

function TimelineItem({
  title,
  date,
  by,
  color,
}: {
  title: string;
  date: string;
  by: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-2 h-2 rounded-full ${color} mt-2`} />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
          <p className="text-sm text-muted-foreground">By {by}</p>
        </div>
      </div>
    </div>
  );
}

export default function CreditDetailPage() {
  return (
    <WalletProvider>
      <InnerCreditDetail />
    </WalletProvider>
  );
}
