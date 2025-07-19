import { NavLink, useLocation } from 'react-router';

interface IMenuComponents {
  path: string;
  label: string;
  fillIcon: string;
  outlineIcon: string;
}

export const menuComponents: IMenuComponents[] = [
  {
    path: '/',
    label: 'Home',
    fillIcon: 'solar:widget-bold-duotone',
    outlineIcon: 'solar:widget-line-duotone',
  },
  {
    path: '/settings',
    label: 'Settings',
    fillIcon: 'solar:widget-bold-duotone',
    outlineIcon: 'solar:widget-line-duotone',
  },
];

const MenuBar = () => {
  const location = useLocation();
  return (
    <>
      <div className="flex flex-col gap-2 p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
        {menuComponents.map((menuComponent) => (
          <NavLink
            key={menuComponent.path}
            to={menuComponent.path}
            className={`py-2 px-6 rounded-lg  cursxor-pointer text-left ${
              menuComponent.path === location.pathname
                ? 'bg-gray-300'
                : 'bg-transparent hover:bg-gray-200'
            } `}
          >
            {menuComponent.label}
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default MenuBar;
