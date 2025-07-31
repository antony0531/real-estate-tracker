import { ChevronDown, Home, Bell, Search, Menu, LayoutGrid, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, type Project } from '../services/api';

export function Header() {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (id && projects.length > 0) {
      const project = projects.find(p => p.id === id);
      setCurrentProject(project || null);
    }
  }, [id, projects]);

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };
  
  const isProjectsPage = location.pathname === '/projects';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <Menu className="h-5 w-5 text-text-secondary mr-4 lg:hidden" />
            
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="ml-2 text-xl font-semibold text-text-primary hidden sm:block">
                BudgetFlip
              </span>
            </Link>
            
            {/* Navigation */}
            {isProjectsPage ? (
              <div className="ml-8">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-tertiary">
                  <LayoutGrid className="h-4 w-4 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">All Projects</span>
                </button>
              </div>
            ) : (
              <div className="ml-8 relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    if (location.pathname.includes('/project/')) {
                      navigate('/projects');
                    } else {
                      setIsProjectDropdownOpen(!isProjectDropdownOpen);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-tertiary transition-colors"
                >
                  <Home className="h-4 w-4 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">
                    {currentProject?.name || 'Select Project'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              
              {isProjectDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-monday-hover border border-gray-200 py-2 z-50">
                  {projects.length === 0 ? (
                    <div className="px-4 py-3 text-center">
                      <p className="text-sm text-gray-500 mb-2">No projects yet</p>
                      <Link
                        to="/projects"
                        className="text-sm text-primary-600 hover:text-primary-700"
                        onClick={() => setIsProjectDropdownOpen(false)}
                      >
                        Create your first project
                      </Link>
                    </div>
                  ) : (
                    <>
                  {projects.map(project => (
                    <button
                      key={project.id}
                      className="w-full text-left px-4 py-2 hover:bg-background-tertiary transition-colors flex items-center justify-between"
                      onClick={() => {
                        navigate(`/project/${project.id}/overview`);
                        setIsProjectDropdownOpen(false);
                      }}
                    >
                      <span className="text-sm text-text-primary">{project.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'in_progress' 
                          ? 'bg-blue-500 text-white' 
                          : project.status === 'planning'
                          ? 'bg-yellow-500 text-white'
                          : project.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                  <div className="border-t mt-2 pt-2">
                    <Link
                      to="/projects"
                      className="w-full text-left px-4 py-2 hover:bg-background-tertiary transition-colors flex items-center gap-2 text-sm text-primary-600"
                      onClick={() => setIsProjectDropdownOpen(false)}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      View All Projects
                    </Link>
                  </div>
                  </>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-background-tertiary rounded-lg transition-colors">
              <Search className="h-5 w-5 text-text-secondary" />
            </button>
            <button className="p-2 hover:bg-background-tertiary rounded-lg transition-colors relative">
              <Bell className="h-5 w-5 text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>
            
            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium hover:ring-2 hover:ring-purple-500 hover:ring-offset-2 transition-all"
              >
                {user?.initials || 'U'}
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-monday-hover border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-secondary">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-tertiary transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}