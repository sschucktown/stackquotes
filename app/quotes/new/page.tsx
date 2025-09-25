"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";

type LineItem = {
  description: string;
  amount: string;
};

type QuoteStatus = "draft" | "pending" | "sent" | "accepted" | "declined";

type QuoteFormData = {
  client_name: string;
  client_email: string;
  client_phone: string;
  project_title: string;
  project_description: string;
  good_total: number;
  good_items: LineItem[];
  better_total: number;
  better_items: LineItem[];
  best_total: number;
  best_items: LineItem[];
  deposit_percentage: number;
  valid_until: string;
  notes: string;
  status: QuoteStatus;
};

const tierConfigs = [
  {
    key: "good",
    label: "Good Option",
    description: "Baseline scope and pricing.",
    itemsKey: "good_items" as const,
    totalKey: "good_total" as const,
  },
  {
    key: "better",
    label: "Better Option",
    description: "Extended scope or upgraded materials.",
    itemsKey: "better_items" as const,
    totalKey: "better_total" as const,
  },
  {
    key: "best",
    label: "Best Option",
    description: "Premium delivery with all inclusions.",
    itemsKey: "best_items" as const,
    totalKey: "best_total" as const,
  },
] as const;

type TierConfig = (typeof tierConfigs)[number];

const defaultLineItem = (): LineItem => ({
  description: "",
  amount: "",
});

const sumLineItems = (items: LineItem[]) =>
  items.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);

const normalizeLineItems = (items: unknown): LineItem[] => {
  if (!Array.isArray(items) || items.length === 0) {
    return [defaultLineItem()];
  }

  return items.map((item) => {
    if (item && typeof item === "object") {
      const { description, amount } = item as {
        description?: string;
        amount?: number | string;
      };

      return {
        description: description ?? "",
        amount:
          amount !== undefined && amount !== null ? String(amount) : "",
      };
    }

    if (typeof item === "string") {
      return { description: item, amount: "" };
    }

    return defaultLineItem();
  });
};

const createDefaultFormData = (): QuoteFormData => ({
  client_name: "",
  client_email: "",
  client_phone: "",
  project_title: "",
  project_description: "",
  good_total: 0,
  good_items: [defaultLineItem()],
  better_total: 0,
  better_items: [defaultLineItem()],
  best_total: 0,
  best_items: [defaultLineItem()],
  deposit_percentage: 25,
  valid_until: "",
  notes: "",
  status: "draft",
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const quoteId = searchParams.get("id");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<QuoteFormData>(
    createDefaultFormData()
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setUser(user);

      if (quoteId) {
        const { data, error: fetchError } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", quoteId)
          .single();

        if (!fetchError && data) {
          const normalized: QuoteFormData = {
            client_name: data.client_name ?? "",
            client_email: data.client_email ?? "",
            client_phone: data.client_phone ?? "",
            project_title: data.project_title ?? "",
            project_description: data.project_description ?? "",
            good_items: normalizeLineItems(data.good_items),
            good_total:
              Number(data.good_total ?? 0) ||
              sumLineItems(normalizeLineItems(data.good_items)),
            better_items: normalizeLineItems(data.better_items),
            better_total:
              Number(data.better_total ?? 0) ||
              sumLineItems(normalizeLineItems(data.better_items)),
            best_items: normalizeLineItems(data.best_items),
            best_total:
              Number(data.best_total ?? 0) ||
              sumLineItems(normalizeLineItems(data.best_items)),
            deposit_percentage: Number(data.deposit_percentage ?? 25) || 0,
            valid_until: data.valid_until
              ? String(data.valid_until).slice(0, 10)
              : "",
            notes: data.notes ?? "",
            status: (data.status as QuoteStatus) ?? "draft",
          };

          setFormData(normalized);
        }
      }

      setLoading(false);
    };

    init();
  }, [quoteId, router, supabase]);

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    if (id === "deposit_percentage") {
      const numericValue = Number(value);
      setFormData((prev) => ({
        ...prev,
        deposit_percentage: Number.isNaN(numericValue)
          ? 0
          : Math.max(0, Math.min(100, numericValue)),
      }));
      return;
    }

    if (id === "valid_until") {
      setFormData((prev) => ({
        ...prev,
        valid_until: value,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const updateTierItems = (
    config: TierConfig,
    updater: (items: LineItem[]) => LineItem[]
  ) => {
    setFormData((prev) => {
      const currentItems = prev[config.itemsKey];
      const nextItemsRaw = updater(currentItems);
      const nextItems =
        nextItemsRaw.length > 0 ? nextItemsRaw : [defaultLineItem()];
      const nextTotal = sumLineItems(nextItems);

      return {
        ...prev,
        [config.itemsKey]: nextItems,
        [config.totalKey]: nextTotal,
      };
    });
  };

  const handleLineItemChange = (
    config: TierConfig,
    index: number,
    field: keyof LineItem,
    value: string
  ) => {
    updateTierItems(config, (items) =>
      items.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleRemoveLineItem = (config: TierConfig, index: number) => {
    updateTierItems(config, (items) => items.filter((_, idx) => idx !== index));
  };

  const handleAddLineItem = (config: TierConfig) => {
    updateTierItems(config, (items) => [...items, defaultLineItem()]);
  };

  const buildPayload = (statusOverride: QuoteStatus) => {
    const sanitized: Record<string, unknown> = {};

    tierConfigs.forEach((config) => {
      sanitized[config.itemsKey] = formData[config.itemsKey].map((item) => ({
        description: item.description.trim(),
        amount: parseFloat(item.amount) || 0,
      }));

      sanitized[config.totalKey] = sumLineItems(formData[config.itemsKey]);
    });

    return {
      ...formData,
      ...sanitized,
      status: statusOverride,
      deposit_percentage: Number(formData.deposit_percentage) || 0,
      valid_until: formData.valid_until || null,
    };
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    try {
      const payload = buildPayload("draft");

      if (quoteId) {
        const { error } = await supabase
          .from("quotes")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", quoteId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("quotes").insert([
          {
            ...payload,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving draft:", err);
      alert("Failed to save draft: " + (err as Error).message);
    }
  };

  const handleSend = async () => {
    if (!user) return;

    try {
      if (!quoteId) {
        alert("Please save this quote as a draft first, then send it.");
        return;
      }

      const payload = buildPayload("sent");

      const { error } = await supabase
        .from("quotes")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quoteId);

      if (error) throw error;

      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: formData.client_email,
          quote: payload,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error"
        );
      }

      alert("Quote sent successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Error sending quote:", err);
      alert("Failed to send quote: " + (err as Error).message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{quoteId ? "Edit Quote" : "New Quote"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={handleFieldChange}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Client Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={handleFieldChange}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone">Client Phone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={handleFieldChange}
                  placeholder="(555) 555-5555"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until ?? ""}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_title">Project Title</Label>
              <Input
                id="project_title"
                value={formData.project_title}
                onChange={handleFieldChange}
                placeholder="Kitchen Renovation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_description">Project Description</Label>
              <Textarea
                id="project_description"
                value={formData.project_description}
                onChange={handleFieldChange}
                placeholder="Outline the project scope, goals, and key deliverables."
                rows={4}
              />
            </div>

            <div className="grid gap-4">
              {tierConfigs.map((config) => {
                const items = formData[config.itemsKey];
                const total = formData[config.totalKey];

                return (
                  <div
                    key={config.key}
                    className="space-y-4 rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{config.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        Total: {formatCurrency(total)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div
                          key={`${config.key}-item-${index}`}
                          className="grid gap-2 sm:grid-cols-[1fr_140px_40px]"
                        >
                          <Input
                            placeholder="Line item description"
                            value={item.description}
                            onChange={(event) =>
                              handleLineItemChange(
                                config,
                                index,
                                "description",
                                event.target.value
                              )
                            }
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount}
                            onChange={(event) =>
                              handleLineItemChange(
                                config,
                                index,
                                "amount",
                                event.target.value
                              )
                            }
                            placeholder="0.00"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="justify-self-start sm:justify-self-end"
                            onClick={() => handleRemoveLineItem(config, index)}
                            disabled={items.length === 1}
                            aria-label="Remove line item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleAddLineItem(config)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add line item
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deposit_percentage">Deposit Percentage</Label>
                <Input
                  id="deposit_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.deposit_percentage.toString()}
                  onChange={handleFieldChange}
                />
                <p className="text-xs text-muted-foreground">
                  We use this percentage to calculate the upfront deposit.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Estimated Deposit</Label>
                <div className="rounded-md border border-dashed border-border/60 p-3 text-sm">
                  {formatCurrency(
                    (sumLineItems(formData.best_items) *
                      formData.deposit_percentage) /
                      100
                  )}
                  {" "}due on acceptance
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleFieldChange}
                placeholder="Add any context or reminders for this quote."
                rows={4}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button type="button" onClick={handleSend}>
                Send Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

