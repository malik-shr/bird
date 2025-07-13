import { NavLink } from 'react-router';

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
    path: '/collections',
    label: 'Collections',
    fillIcon: 'solar:widget-bold-duotone',
    outlineIcon: 'solar:widget-line-duotone',
  },
];

const Sidebar = () => {
  return (
    <>
      <div className="bg-green-800 min-h-screen w-[250px] p-5 flex flex-col -gap-5 text-lg">
        {menuComponents.map((menuComponent) => (
          <NavLink key={menuComponent.path} to={menuComponent.path}>
            {menuComponent.label}
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
