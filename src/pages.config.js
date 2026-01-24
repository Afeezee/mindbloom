import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import Library from './pages/Library';
import Editor from './pages/Editor';
import Reader from './pages/Reader';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Create": Create,
    "Library": Library,
    "Editor": Editor,
    "Reader": Reader,
    "Landing": Landing,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};