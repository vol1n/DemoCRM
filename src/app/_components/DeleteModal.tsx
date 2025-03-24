import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


function DeleteModal ({ deleteFn } : { deleteFn: () => Promise<void> }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
      </DialogHeader>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
        <Button type="button" variant="destructive" onClick={deleteFn}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default DeleteModal;
