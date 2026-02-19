import Create from './pages/Create';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Landing from './pages/Landing';
import Library from './pages/Library';
import Reader from './pages/Reader';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Create": Create,
    "Dashboard": Dashboard,
    "Editor": Editor,
    "Landing": Landing,
    "Library": Library,
    "Reader": Reader,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};