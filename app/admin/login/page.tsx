import type {Metadata} from 'next';
import AdminLogin from '@/components/admin-login';
export const metadata:Metadata={title:'قَرم | دخول الإدارة'};
export default function LoginPage(){return <AdminLogin/>;}
