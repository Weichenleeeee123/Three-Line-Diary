import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Calendar from "@/pages/Calendar";
import Summary from "@/pages/Summary";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#FFF3C4',
            border: '1px solid #FFA726',
            color: '#424242'
          }
        }}
      />
    </Router>
  );
}
