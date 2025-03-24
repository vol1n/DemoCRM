"use client";

import { DataTable } from "@/components/ui/DataTable";
import { getColumns } from "./columns";
import type { TableCompany } from "./columns";
import { api } from "@/trpc/react";
import { useEffect, useMemo, useState } from "react";
import EditCompanyModal from "./EditCompanyModal";
import { Dialog } from "@/components/ui/dialog";
import DeleteModal from "./DeleteModal";
import TaskView from "@/app/_components/tasks";
import NewCompanyModal from "./NewCompanyModal";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientView } from "./ClientView";
import { EditEmailModal } from "@/app/_components/email";

const CompanyTable = ({
  initialOpen,
}: {
  initialOpen: string | string[] | null;
}) => {
  const utils = api.useUtils();
  const { data: companies, isLoading, isError } = api.company.getAll.useQuery();
  const [deleteTarget, setDeleteTarget] = useState<TableCompany | null>(null);
  const [editTarget, setEditTarget] = useState<TableCompany | null>(null);
  const [tasksTarget, setTasksTarget] = useState<TableCompany | null>(null);
  const [emailTarget, setEmailTarget] = useState<TableCompany | null>(null);
  const [newCompany, setNewCompany] = useState<boolean>(false);
  const [viewClientsTarget, setViewClientsTarget] =
    useState<TableCompany | null>(null);

  const deleteCompany = api.company.delete.useMutation({
    onSuccess: async () => {
      await utils.company.getAll.invalidate();
    },
  });
  const updateCompany = api.company.update.useMutation({
    onSuccess: async () => {
      await utils.company.getAll.invalidate();
    },
  });
  const submitTasks = api.task.updateCompletions.useMutation({
    onSuccess: async () => {
      await utils.task.getCompanyTasks.invalidate();
    },
  });
  const createCompany = api.company.create.useMutation({
    onSuccess: async () => {
      await utils.company.getAll.invalidate();
    },
  });
  const addTask = api.task.create.useMutation({
    onSuccess: async () => {
      await utils.company.getAll.invalidate();
    },
  });
  const updateTask = api.task.update.useMutation({
    onSuccess: async () => {
      await utils.company.getAll.invalidate();
    },
  });
  const deleteTask = api.task.delete.useMutation({
    onSuccess: async () => {
      await utils.company.getAll.invalidate();
    },
  });
  const addClient = api.company.addClientTo.useMutation({
    onSuccess: async () => {
      await utils.company.getAll.invalidate();
    },
  });
  const sendEmail = api.clients.sendEmail.useMutation();

  const onDelete = (company: TableCompany) => {
    setDeleteTarget(company);
  };
  const onEdit = (company: TableCompany) => {
    setEditTarget(company);
  };
  const onOpenTasks = (company: TableCompany) => {
    setTasksTarget(company);
  };
  const onViewClients = (company: TableCompany) => {
    setViewClientsTarget(company);
  };
  const onWriteEmail = (company: TableCompany) => {
    setEmailTarget(company);
  };

  const updateFn = async ({
    formData,
    id,
  }: {
    formData: {
      name: string;
      email: string;
    };
    id: string;
  }): Promise<void> => {
    await updateCompany.mutateAsync({ ...formData, ...{ id } });
  };
  const deleteFn = async (id: string) => {
    await deleteCompany.mutateAsync({ id });
  };
  const submitTasksFn = async (
    changes: {
      id: string;
      complete: boolean;
    }[],
  ) => {
    await submitTasks.mutateAsync(changes);
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

  const newCompanyFn = async (formData: { name: string; email: string }) => {
    await createCompany.mutateAsync(formData);
  };

  const addClientFn = async (id: string, clientId: string) => {
    await addClient.mutateAsync({ id, clientId });
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
    onViewClients,
    onWriteEmail,
  });
  const tableCompanies: TableCompany[] = useMemo(() => {
    if (!companies) {
      return [];
    }
    return companies.map((c) => {
      return {
        ...c,
        dateAdded: c.dateAdded.toLocaleString(),
      };
    });
  }, [companies]);
  useEffect(() => {
    if (initialOpen) {
      setTasksTarget(tableCompanies.find((c) => c.id == initialOpen) ?? null);
    }
  }, [initialOpen, tableCompanies]);
  useEffect(() => {
    if (!tasksTarget || !companies) return;

    // get the updated row from memoized tableCompanies
    const updated = tableCompanies.find((c) => c.id === tasksTarget.id);

    if (updated && updated !== tasksTarget) {
      setTasksTarget(updated);
    }
  }, [companies, tableCompanies, tasksTarget]);
  useEffect(() => {
    if (!viewClientsTarget || !companies) return;

    // get the updated row from memoized tableClients
    const updated = tableCompanies.find((c) => c.id === viewClientsTarget.id);

    if (updated && updated !== viewClientsTarget) {
      setViewClientsTarget(updated);
    }
  }, [companies, tableCompanies, tasksTarget, viewClientsTarget]);
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Companies</h1>
        <Button onClick={() => setNewCompany(true)}>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-white" />
            New Company
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
                Error fetching companies
              </span>
            );
          return <DataTable columns={columns} data={tableCompanies} />;
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
          <EditCompanyModal
            company={editTarget}
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
        open={Boolean(newCompany)}
        onOpenChange={(newState) => {
          if (!newState) {
            setNewCompany(false);
          }
        }}
      >
        {newCompany && (
          <NewCompanyModal
            createCompany={async (formData) => {
              await newCompanyFn(formData);
              setNewCompany(false);
            }}
          />
        )}
      </Dialog>
      <Dialog
        open={!!viewClientsTarget}
        onOpenChange={(newState) => {
          if (!newState) {
            setViewClientsTarget(null);
          }
        }}
      >
        {viewClientsTarget && (
          <ClientView
            data={viewClientsTarget.clients}
            addClient={async (client) => {
              await addClientFn(viewClientsTarget.id, client.id);
            }}
          />
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

export default CompanyTable;
