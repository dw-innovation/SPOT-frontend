import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "react-toastify/dist/ReactToastify.css";
import "react-resizable/css/styles.css";

import { Metadata, type Viewport } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { ToastContainer } from "react-toastify";

import SessionProvider from "@/components/SessionsProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "black",
};

export const metadata: Metadata = {
  title: "SPOT - the easy way to verify locations",
  description:
    "Spot is a tool for finding combinations of objects in the public space world-wide.",
  icons: [
    {
      url: "/icon?<generated>",
      sizes: "32x32",
      type: "image/png",
    },
  ],
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider session={session}>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
