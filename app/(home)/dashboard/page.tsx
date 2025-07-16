import React from 'react';

import UserProgress from '@/components/dashboard/UserProgress';
import CourseProgress from '@/components/dashboard/CourseProgress';
import MonthlyStreak from '@/components/dashboard/MonthlyStreak';
import ReferralCard from '@/components/dashboard/Referral';
import PathList from '@/components/dashboard/JoinedCTF';
import CompletedCourse from '@/components/dashboard/CompletedCourse';

const Page = () => {
  return (
    <div className="flex flex-col px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col gap-6 w-full lg:w-2/3">
          <UserProgress />
          <CourseProgress />
        </div>

        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <MonthlyStreak />
          <ReferralCard />
          <PathList />
          <CompletedCourse />
        </div>
      </div>
    </div>
  );
};

export default Page;
