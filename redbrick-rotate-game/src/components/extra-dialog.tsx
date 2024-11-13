/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { createMission, getMissionStatus } from '@/lib/redbrickApi';
import { cn } from '@/lib/utils';
// import { Info } from 'lucide-react';

// const DISCORD_OAUTH_URL =
//   'https://discord.com/oauth2/authorize?client_id=1113401590188085351&redirect_uri=https%3A%2F%2Fhtml5-game.redbrick.land%2F0xRotate-platform-dev%2F%3Ftype%3DDISCORD&type=DISCORD&response_type=code&scope=email+identify&prompt=consent';

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
  const [missionStatus, setMissionStatus] = useState<any>();
  // const [isDiscordClicked, setIsDiscordClicked] = useState(false);

  const loadMissionStatus = useCallback(async () => {
    const result = await getMissionStatus(authToken);
    setMissionStatus(result);
  }, [authToken]);

  useEffect(() => {
    loadMissionStatus();
  }, [loadMissionStatus]);

  function createMissionHandler(type: string) {
    return async () => {
      await createMission(authToken, type);
      loadMissionStatus();
    };
  }

  // function onDiscordJoin() {
  //   setIsDiscordClicked(true);
  //   window.open(DISCORD_OAUTH_URL, '_blank');
  // }

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
          <div className='flex flex-col items-center w-full pt-8 h-[520px] bg-center bg-[length:90%_100%] bg-no-repeat bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/dialog-bg.png")]'>
            <img
              className='max-w-32'
              src='https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon.png'
              alt='spin-icon'
            />
            <div>Mission to get more spins</div>
            <div className='flex flex-col gap-4 mt-4 text-xl font-bold'>
              <div
                className={cn(
                  'flex justify-between relative items-center p-5 h-[70px] w-80 bg-center bg-[length:100%_100%] bg-no-repeat',
                  missionStatus?.data?.flowTwitter
                    ? 'cursor-not-allowed text-gray-500 bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg-completed.png")]'
                    : 'cursor-pointer bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg.png")]'
                )}
                onClick={createMissionHandler('flowTwitter')}
              >
                <div>Follow X</div>
                <div className='flex items-center'>
                  <div>+1</div>
                  <img
                    className='max-w-12'
                    src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon${
                      missionStatus?.data?.flowTwitter ? '-completed' : ''
                    }.png`}
                    alt='spin-icon'
                  />
                </div>
              </div>
              {/* <div
                className={cn(
                  'flex justify-between relative items-center p-5 h-[70px] w-80 bg-center bg-[length:100%_100%] bg-no-repeat',
                  missionStatus?.data?.joinDiscord
                    ? 'cursor-not-allowed text-gray-500 bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg-completed.png")]'
                    : 'cursor-pointer bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg.png")]'
                )}
                onClick={onDiscordJoin}
              >
                <div>Join Discord</div>
                <div className='flex items-center'>
                  <div>+1</div>
                  <img
                    className='max-w-12'
                    src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon${
                      missionStatus?.data?.joinDiscord ? '-completed' : ''
                    }.png`}
                    alt='spin-icon'
                  />
                </div>
              </div>
              {isDiscordClicked && (
                <div className='flex gap-1 items-center max-w-80 text-sm font-normal'>
                  <div>
                    <Info width={12} />
                  </div>
                  <div>Please reload once you joined on discord.</div>
                </div>
              )} */}
              <div
                className={cn(
                  'flex justify-between relative items-center p-5 h-[70px] w-80 bg-center bg-[length:100%_100%] bg-no-repeat',
                  missionStatus?.data?.joinPanda
                    ? 'cursor-not-allowed text-gray-500 bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg-completed.png")]'
                    : 'cursor-pointer bg-[url("https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/mission-bg.png")]'
                )}
                onClick={createMissionHandler('joinPanda')}
              >
                <div>Join Panda Game</div>
                <div className='flex items-center'>
                  <div>+1</div>
                  <img
                    className='max-w-12'
                    src={`https://resources.smartlayer.network/smart-token-store/images/redbrick-spin/spin-icon${
                      missionStatus?.data?.joinPanda ? '-completed' : ''
                    }.png`}
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
