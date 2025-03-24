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
  Calendar,
  CalendarPlus2,
  ClipboardList,
  Mail,
  MoreHorizontal,
  Trash2,
  User,
} from "lucide-react";
import type { Meeting, Task } from "@/types/db";

export type TableClient = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  dateAdded: string;
  companyName: string | null;
  companyId: string | null;
  tasks: Task[];
  meetings: Meeting[];
};

type onAction = (client: TableClient) => void;

export function getColumns({
  onEdit,
  onDelete,
  onOpenTasks,
  onAddMeeting,
  onViewMeetings,
  onWriteEmail,
}: {
  onEdit: onAction;
  onDelete: onAction;
  onOpenTasks: onAction;
  onAddMeeting: onAction;
  onViewMeetings: onAction;
  onWriteEmail: onAction;
}): ColumnDef<TableClient>[] {
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
      accessorKey: "companyName",
      header: "Company",
    },
    {
      accessorKey: "dateAdded",
      header: "Date Added",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <User className="h-4 w-4 text-gray-600" />
                View client info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onOpenTasks(client)}>
                <ClipboardList className="h-4 w-4 text-gray-600" />
                View Tasks
              </DropdownMenuItem>
              {row.original.companyId && (
                <DropdownMenuItem>
                  <Building2 className="h-4 w-4 text-gray-600" />
                  View Company
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(client)}>
                <Trash2 className="h-4 w-4 text-gray-600" />
                Delete Client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewMeetings(client)}>
                <Calendar className="h-4 w-4 text-gray-600" />
                View Meetings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddMeeting(client)}>
                <CalendarPlus2 className="h-4 w-4 text-gray-600" />
                Set meeting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWriteEmail(client)}>
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
