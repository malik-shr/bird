import type { ReactNode } from 'react';

type SidebarProps = {
  id: string;
  children: ReactNode;
  isOpen: boolean;
  toggleOpen: () => void;
};

const Sidebar = ({ id, isOpen, toggleOpen, children }: SidebarProps) => {
  return (
    <aside className="drawer drawer-end">
      <input
        id={id}
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={toggleOpen}
      />
      <div className="drawer-side">
        <label
          htmlFor={id}
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        {children}
      </div>
    </aside>
  );
};

export default Sidebar;
