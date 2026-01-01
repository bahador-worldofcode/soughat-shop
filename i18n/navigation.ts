import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

// ساختن نسخه هوشمند Link, useRouter, usePathname که زبان را می‌فهمند
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);