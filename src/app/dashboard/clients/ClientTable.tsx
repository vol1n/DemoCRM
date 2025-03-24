"use client";

import { DataTable } from "@/components/ui/DataTable";
import { getColumns } from "./columns";
import type { TableClient } from "./columns";
import { api } from "@/trpc/react";
import { useEffect, useMemo, useState } from "react";
import EditClientModal from "./EditClientModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteModal from "./DeleteModal";
import TaskView from "@/app/_components/tasks";
import NewClientModal from "./NewClientModal";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddMeeting } from "./AddMeeting";
import { MeetingView } from "@/app/_components/meetings";
import { EditEmailModal } from "@/app/_components/email";

const ClientTable = ({
  initialOpen,
}: {
  initialOpen: string | string[] | null;
}) => {
  const utils = api.useUtils();
  const { data: clients, isLoading, isError } = api.clients.getAll.useQuery();
  const [deleteTarget, setDeleteTarget] = useState<TableClient | null>(null);
  const [editTarget, setEditTarget] = useState<TableClient | null>(null);
  const [tasksTarget, setTasksTarget] = useState<TableClient | null>(null);
  const [newClient, setNewClient] = useState<boolean>(false);
  const [newMeetingTarget, setNewMeetingTarget] = useState<TableClient | null>(
    null,
  );
  const [emailTarget, setEmailTarget] = useState<TableClient | null>(null);
  const [viewMeetingsTarget, setViewMeetingsTarget] =
    useState<TableClient | null>(null);

  const deleteClient = api.clients.delete.useMutation({
    onSuccess: async () => {
      await utils.clients.getAll.invalidate();
    },
  });
  const updateClient = api.clients.update.useMutation({
    onSuccess: async () => {
      await utils.clients.getAll.invalidate();
    },
  });
  const submitTasks = api.task.updateCompletions.useMutation({
    onSuccess: async () => {
      await utils.task.getClientTasks.invalidate();
    },
  });
  const createClient = api.clients.create.useMutation({
    onSuccess: async () => {
      await utils.clients.getAll.invalidate();
    },
  });
  const addTask = api.task.create.useMutation({
    onSuccess: async () => {
      await utils.clients.getAll.invalidate();
    },
  });
  const updateTask = api.task.update.useMutation({
    onSuccess: async () => {
      await utils.clients.getAll.invalidate();
    },
  });
  const deleteTask = api.task.delete.useMutation({
    onSuccess: async () => {
      await utils.clients.getAll.invalidate();
    },
  });
  const createMeeting = api.meeting.create.useMutation({
    onSuccess: async () => {
      await utils.clients.getAll.invalidate();
    },
  });
  const sendEmail = api.clients.sendEmail.useMutation();

  const onDelete = (client: TableClient) => {
    setDeleteTarget(client);
  };
  const onEdit = (client: TableClient) => {
    setEditTarget(client);
  };
  const onOpenTasks = (client: TableClient) => {
    setTasksTarget(client);
  };
  const onAddMeeting = (client: TableClient) => {
    setNewMeetingTarget(client);
  };
  const onViewMeetings = (client: TableClient) => {
    setViewMeetingsTarget(client);
  };
  const onWriteEmail = (client: TableClient) => {
    setEmailTarget(client);
  };

  const updateFn = async ({
    formData,
    id,
  }: {
    formData: {
      firstName: string;
      lastName: string;
      email: string;
      companyId: string | null;
    };
    id: string;
  }): Promise<void> => {
    await updateClient.mutateAsync({ ...formData, ...{ id } });
  };
  const deleteFn = async (id: string) => {
    await deleteClient.mutateAsync({ id });
  };
  const submitTasksFn = async (
    changes: {
      id: string;
      complete: boolean;
    }[],
  ) => {
    await submitTasks.mutateAsync(changes);
  };
  const createMeetingFn = async (
    id: string,
    meeting: {
      title: string;
      time: Date;
    },
  ) => {
    await createMeeting.mutateAsync({ ...meeting, ...{ clientId: id } });
  };
  const addTaskFn = async (
    newTask: {
      title: string;
      description: string;
      dueDate: Date | null;
    },
    clientId: string,
  ) => {
    await addTask.mutateAsync({ ...newTask, clientId });
  };

  const updateTaskFn = async (
    id: string,
    task: {
      title: string;
      description: string;
      dueDate: Date | null;
    },
  ) => {
    await updateTask.mutateAsync({ ...task, id });
  };

  const deleteTaskFn = async (id: string) => {
    await deleteTask.mutateAsync({ id });
  };

  const newClientFn = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    companyId: string | null;
  }) => {
    await createClient.mutateAsync(formData);
  };
  const sendEmailFn = async (payload: {
    subject: string;
    body: string;
    id: string;
  }) => {
    await sendEmail.mutateAsync(payload);
  };

  const columns = getColumns({
    onEdit,
    onDelete,
    onOpenTasks,
    onAddMeeting,
    onViewMeetings,
    onWriteEmail,
  });
  const tableClients: TableClient[] = useMemo(() => {
    if (!clients) {
      return [];
    }
    return clients.map((c) => {
      return {
        ...c,
        companyId: c.companyId ?? null,
        companyName: c.company?.name ?? null,
        name: c.firstName + " " + c.lastName,
        dateAdded: c.dateAdded.toLocaleString(),
      };
    });
  }, [clients]);
  useEffect(() => {
    if (initialOpen) {
      setTasksTarget(tableClients.find((c) => c.id == initialOpen) ?? null);
    }
  }, [initialOpen, tableClients]);
  useEffect(() => {
    if (!tasksTarget || !clients) return;

    // get the updated row from memoized tableClients
    const updated = tableClients.find((c) => c.id === tasksTarget.id);

    if (updated && updated !== tasksTarget) {
      setTasksTarget(updated);
    }
  }, [clients, tableClients, tasksTarget]);
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Clients</h1>
        <Button onClick={() => setNewClient(true)}>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-white" />
            New Client
          </div>
        </Button>
      </div>
      <div className="mt-4">
        {(() => {
          if (isLoading)
            return (
              <Loader2 className="h-16 w-16 animate-spin items-center text-center text-black" />
            );
          if (isError)
            return (
              <span className="text-md text-red-500">
                Error fetching clients
              </span>
            );
          return <DataTable columns={columns} data={tableClients} />;
        })()}
      </div>
      <Dialog
        open={editTarget != null}
        onOpenChange={(newState) => {
          if (!newState) {
            setEditTarget(null);
          }
        }}
      >
        {editTarget != null && (
          <EditClientModal
            client={editTarget}
            saveEdits={async (formData) => {
              await updateFn({ formData, id: editTarget.id });
              setEditTarget(null);
            }}
          />
        )}
      </Dialog>
      <Dialog
        open={deleteTarget != null}
        onOpenChange={(newState) => {
          if (!newState) {
            setDeleteTarget(null);
          }
        }}
      >
        {deleteTarget != null && (
          <DeleteModal
            deleteFn={async () => {
              await deleteFn(deleteTarget.id);
              setDeleteTarget(null);
            }}
          />
        )}
      </Dialog>
      <Dialog
        open={tasksTarget != null}
        onOpenChange={(newState) => {
          if (!newState) {
            setTasksTarget(null);
          }
        }}
      >
        {tasksTarget != null && (
          <TaskView
            data={tasksTarget.tasks}
            update={async (formData) => {
              await submitTasksFn(formData);
              setTasksTarget(null);
            }}
            addTask={(newTask) => addTaskFn(newTask, tasksTarget.id)}
            updateTask={updateTaskFn}
            deleteTask={deleteTaskFn}
          />
        )}
      </Dialog>
      <Dialog
        open={Boolean(newClient)}
        onOpenChange={(newState) => {
          if (!newState) {
            setNewClient(false);
          }
        }}
      >
        {newClient && (
          <NewClientModal
            createClient={async (formData) => {
              await newClientFn(formData);
              setNewClient(false);
            }}
          />
        )}
      </Dialog>
      <Dialog
        open={!!newMeetingTarget}
        onOpenChange={(newState) => {
          if (!newState) {
            setNewMeetingTarget(null);
          }
        }}
      >
        {newMeetingTarget && (
          <AddMeeting
            save={async (meeting) => {
              await createMeetingFn(newMeetingTarget.id, meeting);
              setNewMeetingTarget(null);
            }}
          />
        )}
      </Dialog>
      <Dialog
        open={!!viewMeetingsTarget}
        onOpenChange={(newState) => {
          if (!newState) {
            setViewMeetingsTarget(null);
          }
        }}
      >
        {viewMeetingsTarget && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Meetings for {viewMeetingsTarget.firstName}
              </DialogTitle>
            </DialogHeader>
            <MeetingView meetings={viewMeetingsTarget.meetings} />
          </DialogContent>
        )}
      </Dialog>
      <Dialog
        open={!!emailTarget}
        onOpenChange={(newState) => {
          if (!newState) {
            setEmailTarget(null);
          }
        }}
      >
        {emailTarget && (
          <EditEmailModal
            onSend={async (data) => {
              await sendEmailFn({ ...data, id: emailTarget.id });
              setEmailTarget(null);
            }}
            clientId={emailTarget.id}
            companyId={undefined}
          />
        )}
      </Dialog>
    </>
  );
};

export default ClientTable;
