"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Model } from "@/core/entities/model";
import { MoreHorizontalIcon } from "lucide-react";
import { Copiable } from "../copiable";
import { ProviderLogo } from "../logos/provider-logo";
import { TruncatedTableCell } from "../truncated-table-cell";
import { Button } from "../ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export const ModelTableColumns: ColumnDef<Model>[] = [
  {
    accessorKey: "slug",
    header: "ID",
    cell: ({ row }) => {
      return <Copiable value={row.original.slug} width="sm" />;
    },
  },
  {
    accessorKey: "provider",
    header: "Model",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <ProviderLogo name={row.original.providerType} />
          <div className="ml-2">{row.original.model}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <TruncatedTableCell value={row.original.name} />;
    },
  },
  {
    accessorKey: "temperature",
    header: "Temperature",
  },
  {
    accessorKey: "systemPrompt",
    header: "System Prompt",
    cell: ({ row }) => {
      return <TruncatedTableCell value={row.original.systemPrompt} />;
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: () => {
      return (
        <Button variant="icon" size="sm">
          <MoreHorizontalIcon />
        </Button>
      );
    },
  },
];

export function ModelTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
