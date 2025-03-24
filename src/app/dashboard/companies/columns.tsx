import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  ClipboardList,
  Mail,
  MoreHorizontal,
  Trash2,
  User2,
} from "lucide-react";
import type { Task } from "@/types/db";

export type TableCompany = {
  id: string;
  name: string;
  email: string;
  dateAdded: string;
  tasks: Task[];
  clients: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
};

type onAction = (company: TableCompany) => void;

export function getColumns({
  onEdit,
  onDelete,
  onOpenTasks,
  onViewClients,
  onWriteEmail,
}: {
  onEdit: onAction;
  onDelete: onAction;
  onOpenTasks: onAction;
  onViewClients: onAction;
  onWriteEmail: onAction;
}): ColumnDef<TableCompany>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "dateAdded",
      header: "Date Added",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const company = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(company)}>
                <Building2 className="h-4 w-4 text-gray-600" />
                View company info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewClients(company)}>
                <User2 className="h-4 w-4 text-gray-600" />
                View Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenTasks(company)}>
                <ClipboardList className="h-4 w-4 text-gray-600" />
                View Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(company)}>
                <Trash2 className="h-4 w-4 text-gray-600" />
                Delete Company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWriteEmail(company)}>
                <Mail className="h-4 w-4 text-gray-600" />
                Write Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
