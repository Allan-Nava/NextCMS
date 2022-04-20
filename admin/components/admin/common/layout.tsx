/*
 * File: layout.tsx
 * Project: next-cms
 * File Created: Wednesday, 20th April 2022 7:29:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 20th April 2022 7:30:03 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';

const Layout: React.FC<{ children? :React.FC, navbarItem? : any, className?: string }> = ({ children, navbarItem, className }) => {
    // 
    return (<>
            <Navbar item={navbarItem} />
            <main className={className}>
                <Sidebar />
                {children}
            </main>
    </>);
    //
}
  //
export default Layout;


/*export default function Layout({children, navbarItem, className}) {

    return (
        <>
            <Navbar item={navbarItem} />
            <main className={className}>
                <Sidebar />
                {children}
            </main>
        </>
    )
}*/
