"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import { DataTable } from "@starter-saas/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@starter-saas/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter-saas/ui/tabs";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Phone, Plus, Settings } from "lucide-react";
import { useMemo } from "react";

type PhoneNumber = {
  id: string;
  number: string;
  country: string;
  type: "local" | "toll-free" | "mobile";
  agent?: string;
  status: "active" | "inactive" | "pending";
};

type SipTrunk = {
  id: string;
  name: string;
  sipUri: string;
  authType: string;
  maxCalls: number;
  status: "active" | "inactive";
};

export default function PhoneNumbersPage() {
  // Mock data - replace with actual Convex query
  const phoneNumbers: PhoneNumber[] = [];
  const sipTrunks: SipTrunk[] = [];

  // Define columns for Phone Numbers DataTable
  const phoneColumns = useMemo<ColumnDef<PhoneNumber>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Number",
        cell: ({ row }) => <div className="font-medium font-mono">{row.original.number}</div>,
        enableSorting: true,
      },
      {
        accessorKey: "country",
        header: "Country",
        enableSorting: true,
        enableFiltering: true,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
        enableSorting: true,
        enableFiltering: true,
      },
      {
        accessorKey: "agent",
        header: "Agent",
        cell: ({ row }) => row.original.agent || "-",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "active" ? "secondary" : "outline"}>
            {row.original.status}
          </Badge>
        ),
        enableSorting: true,
        enableFiltering: true,
      },
      {
        id: "actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8" size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Configure</DropdownMenuItem>
              <DropdownMenuItem>Assign Agent</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Release Number</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Phone Numbers</h1>
          <p className="text-muted-foreground">
            Manage phone numbers and SIP trunk configurations for telephony
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure SIP
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Buy Number
          </Button>
        </div>
      </div>

      <Tabs className="w-full" defaultValue="numbers">
        <TabsList>
          <TabsTrigger value="numbers">Phone Numbers</TabsTrigger>
          <TabsTrigger value="sip">SIP Trunks</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="numbers">
          {phoneNumbers.length === 0 ? (
            <CardEmptyState
              action={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buy Your First Number
                </Button>
              }
              description="Purchase or port phone numbers to enable voice calling with your agents"
              icon={Phone}
              title="No phone numbers yet"
            />
          ) : (
            <DataTable
              columns={phoneColumns}
              data={phoneNumbers}
              defaultView="table"
              emptyStateMessage="No phone numbers found matching your search."
              enabledViews={["table", "list"]}
              enableFiltering
              enablePagination
              enableSearch
              enableSelection
              enableSorting
              enableViewSwitcher
              searchPlaceholder="Search by number, country, or agent..."
              showDefaultBatchActions={false}
            />
          )}
        </TabsContent>

        <TabsContent className="space-y-4" value="sip">
          {sipTrunks.length === 0 ? (
            <CardEmptyState
              action={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add SIP Trunk
                </Button>
              }
              description="Configure SIP trunks to connect your existing telephony infrastructure"
              icon={Settings}
              title="No SIP trunks configured"
            />
          ) : (
            <div className="grid gap-4">
              {sipTrunks.map((trunk) => (
                <Card key={trunk.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{trunk.name}</CardTitle>
                        <CardDescription className="font-mono">{trunk.sipUri}</CardDescription>
                      </div>
                      <Badge variant={trunk.status === "active" ? "secondary" : "outline"}>
                        {trunk.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Authentication</p>
                        <p className="font-medium">{trunk.authType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Concurrent Calls</p>
                        <p className="font-medium">{trunk.maxCalls}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
