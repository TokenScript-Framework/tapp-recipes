'use client';

import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface ExtraDialogProps {
  isOpen: boolean;
  onDialogClose: () => void;
  authToken: string;
}

export default function ExtraDialog({
  isOpen,
  onDialogClose,
  authToken,
}: ExtraDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onDialogClose}>
      <DialogContent className='flex flex-col gap-0 justify-start text-white py-0 px-2 w-full h-dvh bg-center bg-cover bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/background.png")] border-none'>
        <DialogTitle className='h-0'></DialogTitle>
        <div className='flex flex-col gap-3 w-full z-50'>
          <div className='flex justify-around items-center w-full h-20 bg-center bg-[length:100%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/dialog-title-bg.png")]'>
            <img
              className='max-w-[72px] max-h-12 mt-2 cursor-pointer'
              onClick={onDialogClose}
              src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/back-btn.png'
              alt='back-btn'
            />
            <div className='font-bold text-2xl tracking-[1rem]'>EXTRA</div>
          </div>
          <div className='flex flex-col items-center w-full pt-8 h-[560px] bg-center bg-[length:90%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/dialog-bg.png")]'>
            <img
              className='max-w-32'
              src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon.png'
              alt='spin-icon'
            />
            <div>Mission to get more spins</div>
            <div className='flex flex-col gap-4 mt-4 text-xl font-bold'>
              <div className='flex justify-between items-center cursor-pointer p-5 h-[70px] w-80 bg-center bg-[length:100%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg.png")]'>
                <div>Follow X</div>
                <div className='flex items-center'>
                  <div>+1</div>
                  <img
                    className='max-w-12'
                    src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon.png'
                    alt='spin-icon'
                  />
                </div>
              </div>
              <div className='flex justify-between items-center cursor-pointer p-5 h-[70px] w-80 bg-center bg-[length:100%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg.png")]'>
                <div>Join Discord</div>
                <div className='flex items-center'>
                  <div>+1</div>
                  <img
                    className='max-w-12'
                    src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon.png'
                    alt='spin-icon'
                  />
                </div>
              </div>
              <div className='flex justify-between items-center cursor-pointer p-5 h-[70px] w-80 bg-center bg-[length:100%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg.png")]'>
                <div>Join Panda Game</div>
                <div className='flex items-center'>
                  <div>+1</div>
                  <img
                    className='max-w-12'
                    src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon.png'
                    alt='spin-icon'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
