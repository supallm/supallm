"use client";

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
import { Credential } from "@/core/entities/credential";
import { deleteCredentialUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Cog, MoreHorizontalIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDangerDialog } from "../confirm-danger-dialog";
import { Copiable } from "../copiable";
import { EditCredentialDialog } from "../edit-credential-dialog";
import { ProviderLogo } from "../logos/provider-logo";
import { Spinner } from "../spinner";
import { Button } from "../ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export const CredentialTableColumns: ColumnDef<Credential>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <Copiable value={row.original.id} width="sm" size="xs" />;
    },
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <ProviderLogo name={row.original.providerType} />
          <div className="ml-2">{row.original.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "apiKeyPreview",
    header: "Preview",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openEdit, setOpenEdit] = useState(false);

      const { execute: deleteCredential, isLoading: isDeleting } =
        hookifyFunction(
          deleteCredentialUsecase.execute.bind(deleteCredentialUsecase),
        );

      const handleDelete = () => {
        deleteCredential(row.original.projectId, row.original.id);
      };

      return (
        <>
          <EditCredentialDialog
            provider={row.original}
            isOpen={openEdit}
            onOpenChange={setOpenEdit}
          />
          <ConfirmDangerDialog
            title="Delete Credential"
            description="Are you sure you want to delete this credential? This action cannot be undone."
            confirmationText="DELETE"
            onConfirm={handleDelete}
            isOpen={open}
            onOpenChange={setOpen}
          />
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
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                  <Cog className="w-4 h-4" /> Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      );
    },
  },
];

export function CredentialTable<TData, TValue>({
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
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
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
