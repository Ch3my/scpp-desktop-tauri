import React from 'react';
import { SidebarTrigger } from './ui/sidebar';
import { Separator } from "@/components/ui/separator"
interface ScreenTitleProps {
    title: string;
}

const ScreenTitle: React.FC<ScreenTitleProps> = ({ title }) => {
    return (
        <div className='flex items-center gap-2 justify-center h-8'>
            <SidebarTrigger />
            <Separator orientation='vertical' />
            <h1 className='scroll-m-20 text-2xl font-bold tracking-tight'>{title}</h1>
        </div>
    );
};

export default ScreenTitle;