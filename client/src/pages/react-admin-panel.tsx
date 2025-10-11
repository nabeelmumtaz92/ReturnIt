import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import { dataProvider } from '@/lib/reactAdminDataProvider';
import { 
  Users, 
  Package, 
  DollarSign, 
  Bell,
  Star,
  Truck,
  Building2
} from 'lucide-react';

// Custom theme to match ReturnIt branding
const theme = {
  palette: {
    primary: {
      main: '#d97706', // Amber-600
    },
    secondary: {
      main: '#f59e0b', // Amber-500
    },
    background: {
      default: '#fffbeb', // Amber-50
    },
  },
  typography: {
    fontFamily: 'Work Sans, system-ui, sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#d97706',
        },
      },
    },
  },
};

export default function ReactAdminPanel() {
  return (
    <Admin 
      dataProvider={dataProvider}
      title="ReturnIt Admin"
      theme={theme}
    >
      <Resource 
        name="users" 
        list={ListGuesser} 
        edit={EditGuesser} 
        show={ShowGuesser}
        icon={Users}
      />
      <Resource 
        name="admin/orders" 
        list={ListGuesser} 
        edit={EditGuesser} 
        show={ShowGuesser}
        icon={Package}
      />
      <Resource 
        name="admin/driver-payouts" 
        list={ListGuesser} 
        show={ShowGuesser}
        icon={DollarSign}
      />
      <Resource 
        name="notifications" 
        list={ListGuesser} 
        show={ShowGuesser}
        icon={Bell}
      />
      <Resource 
        name="reviews" 
        list={ListGuesser} 
        show={ShowGuesser}
        icon={Star}
      />
    </Admin>
  );
}
