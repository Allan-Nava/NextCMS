/*
 * File: button.tsx
 * Project: next-cms
 * File Created: Wednesday, 20th April 2022 7:53:17 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 20th April 2022 7:53:19 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React from 'react';
//
interface PropsInterface {
    className?: string
    text?: string
    disabled?: boolean
    icon?: string
    loading?: boolean
    onClick?: () => void
}
//
const Button: React.FC<{props?: PropsInterface}> = ({props}) => {
    console.log("props", props);
    var className = `${props?.className == null || props?.className == "" ? "" : " " + props?.className }`;
    var text = props?.text;
    var disabled = props?.disabled;
    //
    return (
        <button className={"hm-button" + className} onClick={props?.onClick} disabled={ disabled } >
            {props?.icon ? <i className={props?.icon}></i> : "" }
            {props?.loading ? "Attendi..." : text }
        </button>
    );
    //
};
export default Button;
//