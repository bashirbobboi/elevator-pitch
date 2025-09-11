import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  // Prevent flash on initial load
  React.useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, isInitialized }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate, isInitialized } = useSidebar();
  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 h-screen px-4 py-4 hidden md:flex md:flex-col flex-shrink-0 z-10",
        className
      )}
      style={{ backgroundColor: '#453431' }}
      initial={{ width: "60px" }}
      animate={{
        width: isInitialized && animate ? (open ? "300px" : "60px") : "60px",
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between w-full z-20"
        )}
        style={{ backgroundColor: '#453431' }}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-white cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  isActive = false,
  ...props
}) => {
  const { open, animate, isInitialized } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 rounded-lg transition-colors duration-200",
        isActive ? "bg-[#f7f6f3]" : "hover:bg-white/10",
        className
      )}
      {...props}
    >
      <div className={cn(
        "transition-colors duration-200",
        isActive ? "text-[#453431]" : "text-white"
      )}>
        {link.icon}
      </div>
      <motion.span
        initial={{ opacity: 0, width: "0px" }}
        animate={{
          opacity: isInitialized && animate ? (open ? 1 : 0) : 0,
          width: isInitialized && animate ? (open ? "auto" : "0px") : "0px",
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut"
        }}
        className={cn(
          "text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre overflow-hidden !p-0 !m-0",
          isActive ? "text-[#453431]" : "text-white"
        )}
      >
        {link.label}
      </motion.span>
    </a>
  );
};
