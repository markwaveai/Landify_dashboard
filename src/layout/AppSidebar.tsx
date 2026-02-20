import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../src/store/store";
import {
  ChevronDownIcon,
  // GridIcon,
  HorizontaLDots,
  GroupIcon,
  UserCircleIcon,
  ListIcon,
  CheckCircleIcon,
  // BoltIcon,
  BoxCubeIcon,
  CalendarIcon,
  DocsIcon,
  ChatIcon,
  AlertIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  disabled?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  // {
  //   icon: <GridIcon />,
  //   name: "Dashboard",
  //   path: "/",
  // },
  {
    icon: <GroupIcon />,
    name: "Field Officers",
    path: "/aos",
    roles: ["ADMIN"],
  },
  {
    icon: <UserCircleIcon />,
    name: "Agents",
    path: "/agents",
    roles: ["ADMIN", "AGRICULTURE_OFFICER"],
  },
  {
    icon: <ListIcon />,
    name: "Farmers",
    path: "/farmers",
    roles: ["ADMIN", "AGRICULTURE_OFFICER", "AGENT"],
    disabled: true,
  },
  {
    icon: <CheckCircleIcon />,
    name: "Approvals",
    path: "/approvals",
    roles: ["ADMIN", "AGRICULTURE_OFFICER"],
  },
  // {
  //   icon: <span className="flex items-center justify-center text-lg font-bold w-6 h-6">₹</span>,
  //   name: "Payments",
  //   path: "/payments",
  //   roles: ["ADMIN"],
  //   disabled: true,
  // },
  // {
  //   icon: <BoltIcon />,
  //   name: "Cultivation",
  //   path: "/cultivation",
  //   disabled: true,
  // },
  {
    icon: <BoxCubeIcon />,
    name: "Fodder Ops",
    path: "/fodder-procurement",
    roles: ["ADMIN"],
  },
  {
    icon: <CalendarIcon />,
    name: "Profile",
    path: "/profile",
  },
  {
    icon: <DocsIcon />,
    name: "Legal",
    path: "/legal",
  },
  {
    icon: <ChatIcon />,
    name: "Support",
    path: "/support",
  },
  {
    icon: <AlertIcon />,
    name: "Delete Account",
    path: "/delete-account",
  },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const filteredNavItems = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`group flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-theme-sm transition-colors ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
                } cursor-pointer ${!isExpanded
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "text-white"
                  : "text-white/70 group-hover:text-white"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 text-white/70 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-white"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              nav.disabled ? (
                <div
                  className="group flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-theme-sm transition-colors text-white/50 cursor-not-allowed"
                >
                  <span className="menu-item-icon-size text-white/50 group-hover:text-white/70">
                    {nav.icon}
                  </span>
                  {(isExpanded || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </div>
              ) : (
                <NavLink
                  to={nav.path}
                  className={`group flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-theme-sm transition-colors ${isActive(nav.path) ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <span
                    className={`menu-item-icon-size ${isActive(nav.path)
                      ? "text-white"
                      : "text-white/70 group-hover:text-white"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </NavLink>
              )
            )
          )}
          {nav.subItems && (isExpanded || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <NavLink
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-[#154732] dark:bg-gray-900 dark:border-gray-800 text-white h-screen transition-all duration-300 ease-in-out z-[999999] border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-8 flex ${!isExpanded ? "lg:justify-center" : "justify-start"
          }`}
      >
        <NavLink to="/">
          {isExpanded || isMobileOpen ? (
            <div className="flex items-center gap-3">
              <img
                src="/landify_logo.jpeg"
                alt="Landify"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="text-2xl font-bold text-white font-satoshi">
                Landify
              </span>
            </div>
          ) : (
            <img
              src="/landify_logo.jpeg"
              alt="Landify"
              className="w-8 h-8 rounded-lg object-cover"
            />
          )}
        </NavLink>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar overscroll-contain">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-white/50 ${!isExpanded
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
