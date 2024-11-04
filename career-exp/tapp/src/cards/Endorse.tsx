/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../components/loader/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarIcon, Award, Briefcase, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

// @ts-ignore
export const Endorse: React.FC = ({ token }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokenscript.action.setActionButton({ show: false });
    console.log('test logging', tokenscript, window.ethereum)
    setLoading(false);
  }, []);

  async function endorse() {
    try {
      await tokenscript.action.executeTransaction();
    } catch (e: any) {
      tokenscript.action.showMessageToast(
        'error',
        'Cannot endorse',
        'Please make sure you hold a career exp token, which overlaps with this token, also you cannot endorse yourself'
      );
    }
  }

  const experience = useMemo(() => {
    if (!token) return {};

    const formatOptions = { year: 'numeric', month: 'long' };

    const result: any = { companyLogo: token.tokenInfo.image };
    token.tokenInfo.attributes.forEach(
      ({
        trait_type,
        value,
      }: {
        trait_type: string;
        value: string | number;
      }) => {
        if (trait_type === 'Title') {
          result.title = value;
        } else if (trait_type === 'Employer') {
          result.companyName = value;
        } else if (trait_type === 'Start') {
          result.startDate = new Date(
            (value as number) * 1000
          ).toLocaleDateString('en-US', formatOptions as any);
        } else if (trait_type === 'End') {
          result.endDate = new Date(
            (value as number) * 1000
          ).toLocaleDateString('en-US', formatOptions as any);
        } else if (trait_type === 'Endorsements') {
          result.endorsements = value;
        }
      }
    );
    return result;
  }, [token]);

  return (
    <div className='w-full'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-2xl mx-auto'
      >
        <Card className='flex flex-col justify-between overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg h-[94dvh]'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 -translate-x-16' />
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12' />

          <CardContent className='flex flex-col gap-4 relative z-10 p-6'>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className='flex items-center justify-center my-8'
            >
              <img
                src={experience.companyLogo}
                alt={`${experience.companyName} logo`}
                className='w-48 h-48 rounded-full border-4 border-white shadow-lg'
              />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='text-3xl font-bold text-center'
            >
              {experience.companyName}
            </motion.h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className='flex items-center justify-center space-x-2 text-xl'
            >
              <Briefcase className='w-6 h-6 mr-2' />
              <span>{experience.title}</span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='flex items-center justify-center space-x-2 text-lg text-indigo-200'
            >
              <CalendarIcon className='w-5 h-5 mr-2' />
              <span>
                {experience.startDate} - {experience.endDate}
              </span>
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.5,
                type: 'spring',
                stiffness: 200,
                damping: 10,
              }}
              className='flex items-center justify-center'
            >
              <div className='bg-white text-indigo-600 rounded-full px-6 py-3 flex items-center space-x-2 shadow-lg'>
                <ThumbsUp className='w-6 h-6 mr-2' />
                <span className='text-2xl font-bold'>
                  {experience.endorsements}
                </span>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className='relative z-10 p-6 bg-white/10'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full'
            >
              <Button
                onClick={endorse}
                className='w-full bg-white text-indigo-600 hover:bg-indigo-100 font-bold py-3 text-lg'
              >
                <Award className='w-5 h-5 mr-2' />
                Endorse
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <Loader show={loading} />
    </div>
  );
};
