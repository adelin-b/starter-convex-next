"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@starter-saas/ui/table";
import { formatDistanceToNow } from "date-fns";
import { CreditCard, Download, Receipt, TrendingDown, TrendingUp } from "lucide-react";

const BILLING_YEAR = 2025;
const BILLING_MONTH_INDEX = 9; // October (0-indexed)
const BILLING_START_DAY = 1;
const BILLING_END_DAY = 31;

function getInvoiceBadgeVariant(status: string) {
  if (status === "paid") {
    return "secondary";
  }
  if (status === "pending") {
    return "outline";
  }
  return "destructive";
}

export default function BillingPage() {
  // Mock data - replace with actual Convex query
  const currentPeriod = {
    start: new Date(BILLING_YEAR, BILLING_MONTH_INDEX, BILLING_START_DAY),
    end: new Date(BILLING_YEAR, BILLING_MONTH_INDEX, BILLING_END_DAY),
    totalCost: 245.67,
  };

  const usageStats = [
    {
      name: "Call Minutes",
      value: "1,247",
      unit: "minutes",
      cost: 124.7,
      trend: "up",
      change: "+12%",
    },
    {
      name: "Storage",
      value: "8.3",
      unit: "GB",
      cost: 8.3,
      trend: "up",
      change: "+5%",
    },
    {
      name: "AI Processing",
      value: "45.2K",
      unit: "tokens",
      cost: 112.67,
      trend: "down",
      change: "-3%",
    },
  ];

  type Invoice = {
    id: string;
    number: string;
    period: string;
    amount: number;
    status: string;
    date: Date;
  };
  const invoices: Invoice[] = [];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Billing & Usage</h1>
          <p className="text-muted-foreground">
            Monitor usage, manage subscriptions, and view invoices
          </p>
        </div>
        <Button size="sm" variant="outline">
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Payment
        </Button>
      </div>

      {/* Current Billing Period */}
      <Card>
        <CardHeader>
          <CardTitle>Current Billing Period</CardTitle>
          <CardDescription>
            {currentPeriod.start.toLocaleDateString()} - {currentPeriod.end.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">${currentPeriod.totalCost.toFixed(2)}</div>
          <p className="mt-1 text-muted-foreground text-sm">Total usage this period</p>
        </CardContent>
      </Card>

      {/* Usage Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {usageStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="font-bold text-2xl">{stat.value}</div>
                  <div className="text-muted-foreground text-sm">{stat.unit}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">${stat.cost.toFixed(2)}</div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      stat.trend === "up" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download and view past invoices</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Receipt className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No invoices yet</h3>
              <p className="max-w-sm text-center text-muted-foreground text-sm">
                Your invoice history will appear here once your first billing period completes
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium font-mono">{invoice.number}</TableCell>
                      <TableCell>{invoice.period}</TableCell>
                      <TableCell className="font-medium">${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getInvoiceBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(invoice.date, { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button className="h-8 w-8" size="icon" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
