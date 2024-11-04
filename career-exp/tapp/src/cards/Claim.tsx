/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import Loader from '../components/loader/loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Award, CheckCircle, ChevronsUpDown } from 'lucide-react';
import { ITransactionStatus } from '@tokenscript/card-sdk/dist/types';
import { cn } from '@/lib/utils';

const whitelistedEmployers = [
  { value: 'Smart Token Labs', label: 'Smart Token Labs' },
];

// @ts-ignore
export const Claim: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employerName, setEmployerName] = useState('');
  const [proof, setProof] = useState('');
  const [txHash, setTxHash] = useState('');
  const [mintedTokenId, setMintedTokenId] = useState<string>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isFormValid = employerName.trim() !== '' && proof.trim() !== '';

  useEffect(() => {
    tokenscript.action.setActionButton({ show: false });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!txHash) return;

    async function fetchTokenId() {
      tokenscript.action.showLoader();

      const tx = await tokenscript.eth
        .getRpcProvider(Number(chainID))
        .getTransactionReceipt(txHash);

      const events =
        tx?.logs?.map((log) => {
          return tokenscript.eth
            .getContractInstance('Token')
            .interface.parseLog(log);
        }) ?? [];

      const tokenId = events.find((event) => {
        return event && event.name === 'Transfer';
      })?.args?.[2] as bigint;

      tokenscript.action.hideLoader();

      setMintedTokenId(String(tokenId));
    }

    fetchTokenId();
  }, [txHash]);

  async function claim() {
    if (!isFormValid) return;

    tokenscript.action.setProps({
      employerName,
      proof,
    });

    const listener = (result: ITransactionStatus) => {
      if (result.status === 'confirmed') {
        setTxHash(result.txNumber!);
      }
    };

    try {
      await tokenscript.action.executeTransaction(undefined, listener);
    } catch (e: any) {
      tokenscript.action.showMessageToast(
        'error',
        'Cannot claim',
        'Please make sure the employer name is valid and certificate is not used before'
      );
    }
  }

  const shareToTwitter = () => {
    if (mintedTokenId) {
      const url = `https://viewer-staging.tokenscript.org/?chain=84532&contract=0xf43DA4D5B258669a1d1c375687Fc96A32742a300&tokenId=${String(
        mintedTokenId
      )}`;
      const text = `I just claimed my career experience token! Check it out:`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    }
  };

  const filteredEmployers = whitelistedEmployers.filter((employer) =>
    employer.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='w-full'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-2xl mx-auto'
      >
        <Card className='flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg h-[94dvh]'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 -translate-x-16' />
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12' />

          <CardHeader className='relative z-10'>
            <CardTitle className='text-3xl font-bold text-center'>
              {mintedTokenId
                ? 'Claimed Successfully!'
                : 'Claim Your Career Experience Token'}
            </CardTitle>
          </CardHeader>

          <CardContent className='relative z-10 space-y-6'>
            <AnimatePresence mode='wait'>
              {mintedTokenId ? (
                <motion.div
                  key='success'
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className='text-center py-8'
                >
                  <CheckCircle className='w-24 h-24 mx-auto mb-6 text-white' />
                  <h3 className='text-2xl font-bold mb-4'>Congratulations!</h3>
                  <p className='text-xl mb-6'>
                    Your career experience token has been claimed.
                  </p>
                  <p className='text-lg mb-2'>Token ID:</p>
                  <p className='text-2xl font-mono bg-white/20 rounded-lg py-2 px-4 inline-block'>
                    #{mintedTokenId}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key='form'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='flex flex-col gap-4 relative'>
                    <div ref={dropdownRef}>
                      <Label
                        htmlFor='employerName'
                        className='text-lg font-semibold mb-2 block'
                      >
                        Employer
                      </Label>
                      <Button
                        type='button'
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className='w-full justify-between bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white'
                      >
                        {employerName
                          ? whitelistedEmployers.find(
                              (employer) => employer.value === employerName
                            )?.label
                          : 'Select employer...'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                      {isDropdownOpen && (
                        <div className='absolute z-10 w-full mt-1 bg-white/20 backdrop-blur-lg rounded-md shadow-lg'>
                          <input
                            type='text'
                            placeholder='Search employers...'
                            className='w-full p-2 text-white bg-transparent border-b border-white/30 placeholder-white/50'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <ul className='max-h-60 overflow-auto'>
                            {filteredEmployers.map((employer) => (
                              <li
                                key={employer.value}
                                className={cn(
                                  'px-2 py-1 cursor-pointer hover:bg-white/30 text-white',
                                  employerName === employer.value &&
                                    'bg-white/40'
                                )}
                                onClick={() => {
                                  setEmployerName(employer.value);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                {employer.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor='proof'
                        className='text-lg font-semibold mb-2 block'
                      >
                        Certificate
                      </Label>
                      <Textarea
                        id='proof'
                        value={proof}
                        onChange={(e) => setProof(e.target.value)}
                        className='bg-white/20 border-white/30 text-white placeholder-white/50 h-48'
                        placeholder='Enter certificate'
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className='relative z-10 p-6 bg-white/10'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full'
            >
              {mintedTokenId ? (
                <Button
                  onClick={shareToTwitter}
                  className='w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold py-3 text-lg'
                >
                  <svg
                    role='img'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-5 h-5'
                    fill="#FFFFFF"
                  >
                    <title>X</title>
                    <path d='M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' />
                  </svg>
                  Share on Twitter
                </Button>
              ) : (
                <Button
                  onClick={claim}
                  disabled={!isFormValid}
                  className='w-full bg-white text-teal-600 hover:bg-teal-100 font-bold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Award className='w-5 h-5 mr-2' />
                  Claim
                </Button>
              )}
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <Loader show={loading} />
    </div>
  );
};
