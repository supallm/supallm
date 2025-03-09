"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Flow } from "@/core/entities/flow";
import { deleteFlowUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { Cog, MoreHorizontalIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDangerDialog } from "../confirm-danger-dialog";
import { Copiable } from "../copiable";
import { Spinner } from "../spinner";
import { TruncatedTableCell } from "../truncated-table-cell";
import { Button } from "../ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export const FlowTableColumns: ColumnDef<Flow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <Copiable value={row.original.id} width="sm" />;
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
    accessorKey: "projectId",
    header: "Project ID",
    cell: ({ row }) => {
      return <TruncatedTableCell value={row.original.projectId} />;
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const [openEdit, setOpenEdit] = useState(false);

      const { execute: deleteFlow, isLoading: isDeleting } = hookifyFunction(
        deleteFlowUsecase.execute.bind(deleteFlowUsecase),
      );

      const handleDelete = () => {
        deleteFlow(row.original.id);
      };

      return (
        <>
          <ConfirmDangerDialog
            title="Delete Flow"
            description="Are you sure you want to delete this flow? If it is being used by your web app, it could break your app."
            confirmationText="DELETE"
            onConfirm={() => {
              handleDelete();
            }}
            isOpen={open}
            onOpenChange={setOpen}
          ></ConfirmDangerDialog>
          {isDeleting && <Spinner />}
          {!isDeleting && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="icon" size="sm">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                  <Cog className="w-4 h-4" /> Configure
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      );
    },
  },
];

export function FlowTable<TData, TValue>({
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
