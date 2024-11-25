'use client';

import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface DetailsDialogProps {
  isOpen: boolean;
  onDialogClose: () => void;
  attributes: { trait_type: string; value: string | number }[];
}

export default function DetailsDialog({
  isOpen,
  onDialogClose,
  attributes,
}: DetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onDialogClose}>
      <DialogContent className='flex flex-col justify-start w-full h-dvh bg-transparent backdrop-blur-xl border-none'>
        <DialogTitle className='text-3xl'>Details</DialogTitle>
        <div className='text-lg font-semibold'>Properties</div>
        <div className='grid grid-cols-3 gap-4'>
          {attributes.map((attr) => (
            <div
              key={attr.trait_type}
              className='flex flex-col items-center rounded-lg bg-gray-700 p-2'
            >
              <div className='text-xs text-gray-400 uppercase'>
                {attr.trait_type}
              </div>
              <div className='text-base text-gray-200 text-center'>
                {attr.value}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
