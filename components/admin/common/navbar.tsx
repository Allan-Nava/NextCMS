/*
 * File: navbar.tsx
 * Project: next-cms
 * File Created: Wednesday, 20th April 2022 7:36:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 20th April 2022 7:37:53 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import React from 'react';
//
const Navbar: React.FC<{ item?: any}> = ({item}) => {
    console.log("item", item);
    return (<>
         <nav className="navbar hm-navbar">
            <div className="d-flex justify-content-between w-100 hm-navbar-content aling-items-center">
                <a className="btn hm-hamb align-self-center d-lg-block d-none" >
                    <i className="far fa-bars"></i>
                </a>
            </div>
        </nav>
    </>);
};
//
export default Navbar
//