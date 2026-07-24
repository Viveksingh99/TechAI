"use client";

import * as React from "react";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";

const TAX_PRESETS: Record<string, { label: string; rate: number }> = {
  GST_18: { label: "GST 18% (India, standard)", rate: 18 },
  GST_12: { label: "GST 12% (India, reduced)", rate: 12 },
  GST_5: { label: "GST 5% (India, essential)", rate: 5 },
  VAT_20: { label: "VAT 20% (UK/EU standard)", rate: 20 },
  VAT_5: { label: "VAT 5% (UAE)", rate: 5 },
  SALES_TAX_8: { label: "Sales tax 8.5% (US avg)", rate: 8.5 },
  CUSTOM: { label: "Custom rate", rate: 0 },
};

export default function FinanceTaxesPage() {
  const [amount, setAmount] = React.useState("1000");
  const [preset, setPreset] = React.useState("GST_18");
  const [customRate, setCustomRate] = React.useState("18");
  const [inclusive, setInclusive] = React.useState(false);

  const rate = preset === "CUSTOM" ? Number(customRate) || 0 : TAX_PRESETS[preset].rate;
  const base = Number(amount) || 0;

  const { taxable, taxAmount, total } = React.useMemo(() => {
    if (inclusive) {
      const taxableAmount = base / (1 + rate / 100);
      const tax = base - taxableAmount;
      return { taxable: taxableAmount, taxAmount: tax, total: base };
    }
    const tax = (base * rate) / 100;
    return { taxable: base, taxAmount: tax, total: base + tax };
  }, [base, rate, inclusive]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Tax calculator"
        description="Quickly compute GST, VAT or sales tax for quotations and invoices."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Inputs
            </CardTitle>
            <CardDescription>Enter an amount and choose a tax regime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Tax type</Label>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TAX_PRESETS).map(([key, p]) => (
                    <SelectItem key={key} value={key}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {preset === "CUSTOM" && (
              <div className="space-y-1.5">
                <Label htmlFor="customRate">Custom rate (%)</Label>
                <Input id="customRate" type="number" min={0} step="0.01" value={customRate} onChange={(e) => setCustomRate(e.target.value)} />
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
              <input
                id="inclusive"
                type="checkbox"
                checked={inclusive}
                onChange={(e) => setInclusive(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <Label htmlFor="inclusive" className="cursor-pointer text-sm font-normal">
                Amount entered is tax-inclusive
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Result</CardTitle>
            <CardDescription>Breakdown at {rate}% tax rate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <span className="text-sm text-muted-foreground">Taxable amount</span>
              <span className="text-base font-semibold text-foreground">{formatCurrency(taxable)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <span className="text-sm text-muted-foreground">Tax ({rate}%)</span>
              <span className="text-base font-semibold text-foreground">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
              <span className="text-sm font-medium text-foreground">Total payable</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
