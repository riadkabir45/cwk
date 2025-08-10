import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../../context/SidebarContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const MainLayout: React.FC = () => {

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1 relative overflow-clip">
          <Sidebar/>
          <div className="flex flex-col justify-between w-full">
            <main className="flex-1 bg-gray-100">
              <div className="py-6 px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;